use crate::phy::PhyFrame;
use std::collections::HashMap;
use std::sync::mpsc::{Receiver, Sender};
use std::sync::{Arc, Mutex};

pub struct NodeHandle {
    pub to_node_sender: Sender<PhyFrame>,
    pub from_node_receiver: Receiver<PhyFrame>,
}

pub struct Orchestrator {
    nodes: HashMap<u64, NodeHandle>,
}

impl Orchestrator {
    pub fn new() -> Self {
        Self {
            nodes: HashMap::new(),
        }
    }

    pub fn add_node(&mut self, eui64: u64, node_handle: NodeHandle) {
        self.nodes.insert(eui64, node_handle);
        println!("[Orchestrator] added node {}", eui64);
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
            .map(|(eui64, node)| {
                let senders = senders.clone();
                let receiver = node.from_node_receiver;

                std::thread::spawn(move || loop {
                    match receiver.recv() {
                        Ok(phy_frame) => {
                            let dst_eui64 = phy_frame.payload.dst_eui64;
                            if let Some(sender) = senders.lock().unwrap().get(&dst_eui64) {
                                sender.send(phy_frame).unwrap();
                            } else {
                                println!("[Orchestrator] destination node {} not found", dst_eui64);
                            }
                        }
                        Err(e) => {
                            eprintln!("[Orchestrator] node {} receiver error: {}", eui64, e);
                            break;
                        }
                    }
                })
            })
            .collect();

        // Wait for all threads to complete
        for handle in handles {
            handle.join().unwrap();
        }
    }
}
