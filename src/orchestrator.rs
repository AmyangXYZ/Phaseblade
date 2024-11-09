use crate::node::NodeHandle;
use std::collections::HashMap;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct Orchestrator {
    pub nodes: HashMap<u64, NodeHandle>,
}

impl Orchestrator {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, eui64: u64, node_handle: NodeHandle) {
        let id = node_handle.id;
        self.nodes.insert(eui64, node_handle);
        println!("[Orchestrator] added node <{}-{:016X}>", id, eui64);
    }

    pub fn run(self) {
        let senders = Arc::new(Mutex::new(
            self.nodes
                .iter()
                .map(|(&eui64, node)| (eui64, node.to_node_sender.clone()))
                .collect::<HashMap<_, _>>(),
        ));

        let handles: Vec<_> = self
            .nodes
            .into_iter()
            .map(|(eui64, node_handle)| {
                let senders = senders.clone();
                let receiver = node_handle.from_node_receiver;

                let t = thread::spawn(move || loop {
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
                            println!("[Orchestrator] node <{:016X}> stopped", eui64);
                            break;
                        }
                    }
                });

                if eui64 == 1 {
                    thread::sleep(Duration::from_secs(3));
                    node_handle.is_running.store(false, Ordering::Relaxed);
                }

                t
            })
            .collect();

        // Wait for all threads to complete
        for t in handles {
            t.join().expect("thread panicked");
        }
    }
}
