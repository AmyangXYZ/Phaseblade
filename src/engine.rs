use crate::node::Node;
use crate::packet::Packet;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, time::Instant};
use wasm_bindgen::prelude::*;

/// Manages network simulation by executing nodes and propagating packets between them
#[wasm_bindgen]
pub struct Engine {
    nodes: Vec<Node>,
    cycle: u64, // CPU cycle counter, e.g., a cycle represents 10ns @ 100MHz CPU frequency
    propagation_delay: u64,
    transmission_rate: u64,
    in_transit_packets: HashMap<u64, Vec<Box<dyn Packet>>>,
}

impl Engine {
    pub fn add_node(&mut self, node: Node) {
        self.nodes.push(node);
    }
}
#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            cycle: 0,
            in_transit_packets: HashMap::new(),
            propagation_delay: 1,
            transmission_rate: 1,
        }
    }

    #[wasm_bindgen(js_name = getState)]
    pub fn state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&EngineState::new(self.cycle)).unwrap()
    }

    // #[wasm_bindgen(js_name = addNode)]

    #[wasm_bindgen]
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

    #[wasm_bindgen]
    pub fn run(&mut self, cycles: u64) {
        let start = Instant::now();
        let total_cycles = self.cycle + cycles;
        while self.cycle < total_cycles {
            self.step();
        }

        println!("Simulated {} cycles in {:?}", self.cycle, start.elapsed());
    }

    #[wasm_bindgen(js_name = availableTasks)]
    pub fn available_tasks(&self) -> JsValue {
        let tasks = ["Sensing", "Broadcast", "Association", "TSCH"];
        serde_wasm_bindgen::to_value(&tasks).unwrap()
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize)]
pub struct EngineState {
    cycle: u64,
}

#[wasm_bindgen]
impl EngineState {
    pub fn new(cycle: u64) -> Self {
        Self { cycle }
    }

    #[wasm_bindgen(getter)]
    pub fn cycle(&self) -> u64 {
        self.cycle
    }
}
