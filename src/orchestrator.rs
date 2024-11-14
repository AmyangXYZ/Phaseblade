use crate::node::NodeHandle;
use std::collections::HashMap;
use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct Orchestrator {
    pub nodes: Vec<NodeHandle>,
    ui_tunnel: Arc<Mutex<Option<TcpStream>>>,
}

impl Orchestrator {
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            ui_tunnel: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start_ui_tunnel(&mut self) {
        let ui_tunnel = Arc::clone(&self.ui_tunnel);

        thread::spawn(move || {
            let listener = TcpListener::bind("127.0.0.1:7373")
                .expect("[Orchestrator] failed to bind UI tunnel to port 7373");

            println!("[Orchestrator] UI tunnel listening on port 7373");

            match listener.accept() {
                Ok((stream, addr)) => {
                    println!("[Orchestrator] UI tunnel connected from {}", addr);
                    stream.set_nonblocking(true)?;
                    *ui_tunnel.lock().unwrap() = Some(stream);
                    Ok(())
                }
                Err(e) => {
                    println!("[Orchestrator] Failed to accept UI tunnel: {}", e);
                    Err(e)
                }
            }
        });
    }

    pub fn send_to_ui(&mut self, message: &str) {
        if let Some(tunnel) = &mut *self.ui_tunnel.lock().unwrap() {
            if let Err(e) = tunnel.write_all(format!("{}\n", message).as_bytes()) {
                println!("[Orchestrator] Failed to send through UI tunnel: {}", e);
                *self.ui_tunnel.lock().unwrap() = None;
            }
        }
    }

    pub fn add_node(&mut self, eui64: u64, node_handle: NodeHandle) {
        let id = node_handle.id;
        self.nodes.push(node_handle);
        println!("[Orchestrator] added node <{}-{:016X}>", id, eui64);
    }

    pub fn run(&mut self) {
        self.start_ui_tunnel();

        let senders = Arc::new(Mutex::new(
            self.nodes
                .iter()
                .map(|node| (node.eui64, node.to_node_sender.clone()))
                .collect::<HashMap<_, _>>(),
        ));

        let handles = self.nodes.into_iter().map(|node| {
            let senders = senders.clone();
            let receiver = node.from_node_receiver;

            let h = thread::spawn(move || loop {
                match receiver.recv() {
                    Ok(phy_frame) => {
                        let dst_eui64 = phy_frame.payload.dst_eui64;
                        if let Some(sender) = senders.lock().unwrap().get(&dst_eui64) {
                            if let Err(e) = sender.send(phy_frame) {
                                println!(
                                    "[Orchestrator] failed to send to node {}: {}",
                                    dst_eui64, e
                                );
                            }
                        } else {
                            println!("[Orchestrator] destination node {} not found", dst_eui64);
                        }
                    }
                    Err(_) => {
                        println!("[Orchestrator] node <{:016X}> stopped", node.eui64);
                        break;
                    }
                }
            });

            if node.id == 1 {
                thread::sleep(Duration::from_secs(3));
                node.is_running.store(false, Ordering::Relaxed);
            }

            h
        });

        for handle in handles {
            handle.join().expect("[Orchestrator] node panicked");
        }
    }
}
