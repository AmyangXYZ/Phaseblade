use crate::core::{Node, Packet};
use serde::{Deserialize, Serialize};
use std::time::Instant;
use wasm_bindgen::prelude::*;

/// Manages network simulation by executing nodes and propagating packets between them
#[wasm_bindgen]
pub struct Engine {
    nodes: Vec<Node>,
    cycle: u64, // CPU cycle counter, e.g., a cycle represents 10ns @ 100MHz CPU frequency
    propagation_delay: u64,
    transmission_rate: u64,
    in_transit_packets: Vec<Box<dyn Packet>>,
}

#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            nodes: Vec::new(),
            cycle: 0,
            in_transit_packets: Vec::new(),
            propagation_delay: 0,
            transmission_rate: 0,
        }
    }

    #[wasm_bindgen(js_name = getState)]
    pub fn state(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&EngineState::new(self.cycle)).unwrap()
    }

    #[wasm_bindgen(js_name = addNode)]
    pub fn add_node(
        &mut self,
        id: u16,
        cycles_per_tick: u64,
        cycle_offset: u64,
        micros_per_tick: u64,
        drift_factor: f64,
    ) {
        let node = Node::new(
            id,
            Vec::new(),
            cycles_per_tick,
            cycle_offset,
            micros_per_tick,
            drift_factor,
        );
        self.nodes.push(node);
    }

    #[wasm_bindgen]
    pub fn step(&mut self) {
        self.cycle += 1;
        // println!("Cycle {}", self.cycle);
        // split the in_transit packets
        if !self.in_transit_packets.is_empty() {
            let (in_transit, delivering): (Vec<_>, Vec<_>) = self
                .in_transit_packets
                .drain(..)
                .partition(|p| p.get_arrival_time() != self.cycle);

            // Keep the in_transit packets
            self.in_transit_packets = in_transit;

            // Deliver packets
            for packet in delivering {
                if let Some(node) = self.nodes.get_mut(packet.get_dst() as usize) {
                    node.post(packet);
                }
            }
        }

        // Execute nodes and collect new packets
        for node in self.nodes.iter_mut() {
            let mut packets = node.execute(self.cycle);
            if !packets.is_empty() {
                for packet in packets.iter_mut() {
                    let transmission_time = packet.get_size() / self.transmission_rate;
                    packet
                        .set_arrival_time(self.cycle + self.propagation_delay + transmission_time);
                }
                self.in_transit_packets.extend(packets);
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
