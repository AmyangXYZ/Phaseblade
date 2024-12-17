use crate::node::{Node, NodeConfig, NodeState};
use crate::packet::Packet;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, time::Instant};

/// Manages network simulation by executing nodes and propagating packets between them

pub struct Engine {
    nodes: Vec<Node>,
    cycle: u64, // CPU cycle counter, e.g., a cycle represents 10ns @ 100MHz CPU frequency
    propagation_delay: u64,
    transmission_rate: u64,
    in_transit_packets: HashMap<u64, Vec<Box<dyn Packet>>>,
}

impl Engine {
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            cycle: 0,
            in_transit_packets: HashMap::new(),
            propagation_delay: 1,
            transmission_rate: 1,
        }
    }

    pub fn state(&self) -> EngineState {
        let nodes = self.nodes.iter().map(|node| node.state()).collect();
        EngineState::new(self.cycle, nodes)
    }

    pub fn add_node(&mut self, config: NodeConfig) {
        self.nodes.push(Node::new(config));
    }

    pub fn step(&mut self) {
        self.cycle += 1;
        // println!("Cycle {}", self.cycle);
        if let Some(packets) = self.in_transit_packets.remove(&self.cycle) {
            // Deliver packets
            for packet in packets {
                if let Some(node) = self.nodes.get_mut(packet.dst() as usize) {
                    node.post(packet);
                }
            }
        }

        // Execute nodes and collect new packets
        for node in self.nodes.iter_mut() {
            let result = node.execute(self.cycle);
            if !result.packets.is_empty() {
                for packet in result.packets {
                    let transmission_time = packet.size() / self.transmission_rate;
                    self.in_transit_packets
                        .entry(self.cycle + self.propagation_delay + transmission_time)
                        .or_insert(vec![])
                        .push(packet);
                }
            }
        }
    }

    pub fn run(&mut self, cycles: u64) {
        let start = Instant::now();
        let total_cycles = self.cycle + cycles;
        while self.cycle < total_cycles {
            self.step();
        }

        println!("Simulated {} cycles in {:?}", self.cycle, start.elapsed());
    }

    pub fn available_tasks(&self) -> Vec<String> {
        ["Sensing", "TSCH MAC"].map(String::from).to_vec()
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct EngineState {
    pub cycle: u64,
    pub nodes: Vec<NodeState>,
}

impl EngineState {
    pub fn new(cycle: u64, nodes: Vec<NodeState>) -> Self {
        Self { cycle, nodes }
    }
}
