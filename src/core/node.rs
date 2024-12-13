use crate::core::{Packet, Task};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct NodeState {
    pub id: u16,
    #[wasm_bindgen(skip)]
    pub position: Vec<f64>,
    pub cycle_offset: u64,
    pub cycles_per_tick: u64,
    pub clock_drift_factor: f64,
}

pub struct NodeContext {
    pub id: u16,
    pub position: Vec<f64>,
    pub cycle_offset: u64,
    pub cycles_per_tick: u64,
    pub micros_per_tick: u64,
    pub local_cycle: u64,
    pub local_time: f64,
    pub clock_drift_factor: f64,
    pub tasks: HashMap<u16, Box<dyn Task>>,
    pub task_schedule: Vec<u16>,
    pub tx_queue: VecDeque<Box<dyn Packet>>,
    pub rx_queue: VecDeque<Box<dyn Packet>>,
    pub neighbors: Vec<u16>,
}

pub struct Node {
    context: NodeContext,
    tasks: HashMap<u16, Box<dyn Task>>,
}

impl Node {
    pub fn new(
        id: u16,
        position: Vec<f64>,
        cycle_offset: u64,
        cycles_per_tick: u64,
        micros_per_tick: u64,
        clock_drift_factor: f64,
    ) -> Self {
        Self {
            context: NodeContext {
                id,
                position,
                cycle_offset,
                cycles_per_tick,
                micros_per_tick,
                local_cycle: 0,
                local_time: 0.0,
                clock_drift_factor,
                tasks: HashMap::new(),
                task_schedule: Vec::new(),
                tx_queue: VecDeque::new(),
                rx_queue: VecDeque::new(),
                neighbors: Vec::new(),
            },
            tasks: HashMap::new(),
        }
    }

    pub fn register_task(&mut self, task: Box<dyn Task>) {
        self.tasks.insert(task.id(), task);
    }

    pub fn post(&mut self, packet: Box<dyn Packet>) {
        self.context.tx_queue.push_back(packet);
    }

    pub fn execute(&mut self, cycle: u64) -> Vec<Box<dyn Packet>> {
        self.context.local_cycle = cycle;
        self.context.local_time = cycle as f64 * self.context.micros_per_tick as f64;
        Vec::new()
    }

    // pub fn state(&self) -> &NodeState {}
}
