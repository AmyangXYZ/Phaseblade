use crate::packet::Packet;
use crate::task::Task;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use wasm_bindgen::prelude::*;

// Node state for frontend visualization
#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct NodeState {
    pub id: u16,
    #[wasm_bindgen(skip)]
    pub position: Vec<f64>,
    pub local_cycle: u64,
    pub local_time: f64,
}

// Node context needed for task execution
pub struct NodeContext {
    pub id: u16,
    pub position: Vec<f64>,
    pub local_cycle: u64,
    pub local_time: f64,
    pub tx_queue: VecDeque<Box<dyn Packet>>,
    pub rx_queue: VecDeque<Box<dyn Packet>>,
    pub neighbors: Vec<u16>,
}

// Node runtime, controled by engine
pub struct Node {
    cpu_freq_hz: u64,
    tick_interval: u64,
    cycle_offset: u64,
    clock_drift_factor: f64,
    context: NodeContext,
    task_schedule: Vec<u8>,
    tasks: HashMap<u8, Box<dyn Task>>,
}

impl Node {
    pub fn new(
        id: u16,
        position: Vec<f64>,
        cpu_freq_hz: u64,
        tick_interval: u64,
        cycle_offset: u64,
        clock_drift_factor: f64,
    ) -> Self {
        Self {
            context: NodeContext {
                id,
                position,
                local_cycle: 0,
                local_time: 0.0,
                tx_queue: VecDeque::new(),
                rx_queue: VecDeque::new(),
                neighbors: Vec::new(),
            },
            cpu_freq_hz,
            tick_interval,
            cycle_offset,
            clock_drift_factor,
            tasks: HashMap::new(),
            task_schedule: Vec::new(),
        }
    }

    pub fn register_task(&mut self, task: Box<dyn Task>) {
        self.tasks.insert(task.id(), task);
    }

    // fixed priority scheduling for ready tasks
    pub fn schedule(&mut self) {
        self.task_schedule.clear();
        let mut ready_tasks = Vec::new();

        for task in self.tasks.values_mut() {
            if task.is_ready(&self.context) {
                ready_tasks.push((task.id(), task.priority(), task.execution_cycles()));
            }
        }

        ready_tasks.sort_by(|a, b| a.1.cmp(&b.1));

        let mut current_cycle = 0;
        for (id, _, exec_cycles) in ready_tasks {
            for _ in 0..exec_cycles.min(self.tick_interval - current_cycle) {
                self.task_schedule.push(id);
                current_cycle += 1;
            }
            if current_cycle >= self.tick_interval {
                break;
            }
        }

        for _ in 0..(self.tick_interval - current_cycle) {
            self.task_schedule.push(u8::MAX);
        }

        println!("Task schedule: {:?}", self.task_schedule);
    }

    pub fn execute(&mut self, cycle: u64) -> Vec<Box<dyn Packet>> {
        self.context.local_cycle = if cycle > self.cycle_offset {
            cycle - self.cycle_offset
        } else {
            0
        };
        if self.context.local_cycle == 0 {
            return Vec::new();
        }
        self.context.local_time =
            100.0 + (cycle as f64 / self.cpu_freq_hz as f64) * (1.0 + self.clock_drift_factor);
        // new tick
        if (self.context.local_cycle - 1) % self.tick_interval == 0 {
            self.schedule();
        }

        // execute task
        if let Some(task_id) = self
            .task_schedule
            .get(((self.context.local_cycle - 1) % self.tick_interval) as usize)
        {
            if let Some(task) = self.tasks.get_mut(task_id) {
                task.execute(&self.context);
            }
        }

        Vec::new()
    }

    pub fn post(&mut self, packet: Box<dyn Packet>) {
        self.context.tx_queue.push_back(packet);
    }

    pub fn state(&self) -> NodeState {
        NodeState {
            id: self.context.id,
            position: self.context.position.clone(),
            local_cycle: self.context.local_cycle,
            local_time: self.context.local_time,
        }
    }
}
