use crate::packet::Packet;
use crate::task::{Task, TaskConfig, TaskStatus};
use crate::tasks::{SensingTask, TSCHMacTask};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, VecDeque};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NodeConfig {
    pub id: u16,
    #[wasm_bindgen(skip)]
    pub position: Vec<f64>,
    pub cpu_freq_hz: u64,
    pub tick_interval: u64,
    pub cycle_offset: u64,
    pub clock_drift_factor: f64,
    #[wasm_bindgen(skip)]
    pub tasks: Vec<TaskConfig>,
}

#[wasm_bindgen]
impl NodeConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(
        id: u16,
        position: Vec<f64>,
        cpu_freq_hz: u64,
        tick_interval: u64,
        cycle_offset: u64,
        clock_drift_factor: f64,
        tasks: Vec<TaskConfig>,
    ) -> Self {
        Self {
            id,
            position,
            cpu_freq_hz,
            tick_interval,
            cycle_offset,
            clock_drift_factor,
            tasks,
        }
    }

    #[wasm_bindgen(js_name = toJs)]
    pub fn to_js(&self) -> JsValue {
        serde_wasm_bindgen::to_value(self).unwrap()
    }
}

// Node state for frontend visualization
#[wasm_bindgen]
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct NodeState {
    pub id: u16,
    #[wasm_bindgen(skip)]
    pub position: Vec<f64>,
    pub local_cycle: u64,
    pub local_time: f64,
    #[wasm_bindgen(skip)]
    pub task_schedule: Vec<String>,
}

#[wasm_bindgen]
impl NodeState {
    #[wasm_bindgen(getter)]
    pub fn position(&self) -> Vec<f64> {
        self.position.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn task_schedule(&self) -> Vec<String> {
        self.task_schedule.clone()
    }
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
    tasks: HashMap<u8, Box<dyn Task>>,
    task_schedule: Vec<u8>,
}

impl Node {
    pub fn new(config: NodeConfig) -> Self {
        let mut node = Self {
            context: NodeContext {
                id: config.id,
                position: config.position,
                local_cycle: 0,
                local_time: 0.0,
                tx_queue: VecDeque::new(),
                rx_queue: VecDeque::new(),
                neighbors: Vec::new(),
            },
            cpu_freq_hz: config.cpu_freq_hz,
            tick_interval: config.tick_interval,
            cycle_offset: config.cycle_offset,
            clock_drift_factor: config.clock_drift_factor,
            tasks: HashMap::new(),
            task_schedule: Vec::new(),
        };

        for task in config.tasks {
            match task.name().as_str() {
                "Sensing" => node.register_task(Box::new(SensingTask::new(
                    task.id,
                    task.name(),
                    task.priority,
                ))),
                "TSCH MAC" => node.register_task(Box::new(TSCHMacTask::new(
                    task.id,
                    task.name(),
                    task.priority,
                ))),
                _ => panic!("Unknown task name: {}", task.name()),
            }
        }
        node
    }

    pub fn register_task(&mut self, task: Box<dyn Task>) {
        self.tasks.insert(task.id(), task);
    }

    // fixed priority scheduling for ready tasks
    pub fn schedule(&mut self) {
        self.task_schedule.clear();
        let mut ready_tasks = Vec::new();

        for task in self.tasks.values_mut() {
            task.tick(&mut self.context);
            let state = task.state();
            if state.status != TaskStatus::Blocked {
                ready_tasks.push((task.id(), task.priority(), state.remaining_cycles));
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
    }

    pub fn execute(&mut self, cycle: u64) -> NodeExecResult {
        self.context.local_cycle = if cycle > self.cycle_offset {
            cycle - self.cycle_offset
        } else {
            0
        };
        if self.context.local_cycle == 0 {
            return NodeExecResult {
                packets: Vec::new(),
            };
        }
        self.context.local_time =
            100.0 + (cycle as f64 / self.cpu_freq_hz as f64) * (1.0 + self.clock_drift_factor);

        if (self.context.local_cycle - 1) % self.tick_interval == 0 {
            self.schedule();
        }

        let mut packets = Vec::new();
        if let Some(task_id) = self
            .task_schedule
            .get(((self.context.local_cycle - 1) % self.tick_interval) as usize)
        {
            if let Some(task) = self.tasks.get_mut(task_id) {
                let result = task.execute(&mut self.context);
                for msg in result.messages {
                    if let Some(dst_task) = self.tasks.get_mut(&msg.dst()) {
                        dst_task.post(msg);
                    }
                }
                packets.extend(result.packets);
            }
        }

        NodeExecResult { packets }
    }

    pub fn post(&mut self, packet: Box<dyn Packet>) {
        self.context.rx_queue.push_back(packet);
    }

    pub fn state(&self) -> NodeState {
        NodeState {
            id: self.context.id,
            position: self.context.position.clone(),
            local_cycle: self.context.local_cycle,
            local_time: self.context.local_time,
            task_schedule: self
                .task_schedule
                .iter()
                .map(|id| {
                    if *id == u8::MAX {
                        "Idle".to_string()
                    } else {
                        self.tasks.get(id).unwrap().name()
                    }
                })
                .collect(),
        }
    }
}

pub struct NodeExecResult {
    pub packets: Vec<Box<dyn Packet>>,
}
