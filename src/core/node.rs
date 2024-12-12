use crate::core::{Packet, Task};
use std::collections::{HashMap, VecDeque};

pub struct NodeState {
    id: u16,
    position: Vec<f64>,
    cycle_offset: u64,
    cycles_per_tick: u64,
    local_cycle: u64,
    local_time: f64,
    clock_drift_factor: f64,
    task_names: HashMap<u16, String>,
    task_schedule: Vec<u16>,
    receive_queue: VecDeque<Box<dyn Packet>>,
    send_queue: Vec<Box<dyn Packet>>,
}

pub struct NodeRuntime {
    state: NodeState,
    tasks: HashMap<u16, Box<dyn Task>>,
}
