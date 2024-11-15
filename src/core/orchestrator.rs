use crate::NodeController;
use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread;

pub struct Orchestrator {
    pub node_controllers: Vec<NodeController>,
    ui_tunnel: Arc<Mutex<Option<TcpStream>>>,
}

impl Orchestrator {
    pub fn new() -> Self {
        Self {
            node_controllers: Vec::new(),
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

    pub fn add_node_controller(&mut self, node_controller: NodeController) {
        {
            let state = node_controller.state.lock().unwrap();
            let id = state.id;
            let eui64 = state.eui64;
            println!("[Orchestrator] added node <{}-{:016X}>", id, eui64);
        }
        self.node_controllers.push(node_controller);
    }

    pub fn run(&mut self) {
        let total_cycles = 20;

        let mut cycle = 0;
        while cycle < total_cycles {
            for node_controller in self.node_controllers.iter_mut() {
                node_controller.send_cycle(cycle);
                println!(
                    "[Orchestrator] sent cycle {} to node {}",
                    cycle,
                    node_controller.state.lock().unwrap().id
                );
            }

            let mut completed = 0;
            while completed < self.node_controllers.len() {
                for node_controller in self.node_controllers.iter_mut() {
                    if node_controller.wait_completion() {
                        completed += 1;
                    }
                }
            }
            cycle += 1;
        }
    }
}
