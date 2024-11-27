use crate::core::{Node, Packet};
use crate::tsch::TschNode;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;
use wasm_bindgen::prelude::*;

/// Manages network simulation by executing nodes and propagating packets between them
#[wasm_bindgen]
pub struct Engine {
    nodes: Vec<Box<dyn Node>>,
    cycle: u64, // CPU cycle counter, e.g., a cycle represents 10ns @ 100MHz CPU frequency
    propagation_delay: u64,
    transmission_rate: u64,
    in_transit_packets: Vec<Box<dyn Packet>>,
}

impl Engine {
    // non-wasm api
    pub fn add_node(&mut self, node: Box<dyn Node>) {
        self.nodes.push(node);
    }
}

#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new(propagation_delay: u64, transmission_rate: u64) -> Self {
        Self {
            nodes: Vec::new(),
            cycle: 0,
            in_transit_packets: Vec::new(),
            propagation_delay,
            transmission_rate,
        }
    }

    #[wasm_bindgen(js_name = getState)]
    pub fn get_state(&self) -> JsValue {
        let node_states: Vec<NodeState> = self
            .nodes
            .iter()
            .map(|n| NodeState {
                id: n.get_id(),
                local_cycle: n.get_local_cycle(),
                local_time: n.get_local_time(),
                task_names: n.get_task_names(),
                task_schedule: n.get_task_schedule(),
            })
            .collect();

        serde_wasm_bindgen::to_value(&EngineState::new(self.cycle, node_states)).unwrap()
    }

    #[wasm_bindgen(js_name = addTschNode)]
    pub fn add_tsch_node(
        &mut self,
        id: u16,
        cycles_per_tick: u64,
        cycle_offset: u64,
        micros_per_tick: u64,
    ) {
        let node = TschNode::new(id, cycles_per_tick, cycle_offset, micros_per_tick);
        self.add_node(Box::new(node));
    }

    #[wasm_bindgen]
    pub fn step(&mut self) -> JsValue {
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
                    node.accept_packet(packet);
                }
            }
        }

        // Execute nodes and collect new packets
        for node in self.nodes.iter_mut() {
            node.execute(self.cycle);
            let mut packets = node.collect_packets();
            if !packets.is_empty() {
                for packet in packets.iter_mut() {
                    let transmission_time = packet.get_size() / self.transmission_rate;
                    packet
                        .set_arrival_time(self.cycle + self.propagation_delay + transmission_time);
                }
                self.in_transit_packets.extend(packets);
            }
        }
        self.cycle += 1;
        self.get_state()
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
    node_states: Vec<NodeState>,
}

#[wasm_bindgen]
impl EngineState {
    pub fn new(cycle: u64, node_states: Vec<NodeState>) -> Self {
        Self { cycle, node_states }
    }

    #[wasm_bindgen(getter)]
    pub fn cycle(&self) -> u64 {
        self.cycle
    }

    #[wasm_bindgen(getter)]
    pub fn node_states(&self) -> Vec<NodeState> {
        self.node_states.clone()
    }
}

#[wasm_bindgen]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NodeState {
    id: u16,
    local_cycle: u64,
    local_time: f64,
    task_names: HashMap<u16, String>,
    task_schedule: Vec<u16>,
}

#[wasm_bindgen]
impl NodeState {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> u16 {
        self.id
    }

    #[wasm_bindgen(getter)]
    pub fn local_cycle(&self) -> u64 {
        self.local_cycle
    }

    #[wasm_bindgen(getter)]
    pub fn local_time(&self) -> f64 {
        self.local_time
    }

    #[wasm_bindgen(getter)]
    pub fn task_names(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.task_names).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn task_schedule(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.task_schedule).unwrap()
    }
}
