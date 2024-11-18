use crate::core::{Node, Packet, Task};
use std::collections::{HashMap, VecDeque};
pub struct TschNode {
    id: u16,
    tick_interval: u64,
    cycle_offset: u64,
    tasks: HashMap<u16, Box<dyn Task>>,
    task_schedule: Vec<u16>,
    receive_queue: VecDeque<Box<dyn Packet>>,
    send_queue: Vec<Box<dyn Packet>>,
}

impl TschNode {
    pub fn new(id: u16, tick_interval: u64, cycle_offset: u64) -> Self {
        TschNode {
            id,
            tick_interval,
            cycle_offset,
            tasks: HashMap::new(),
            task_schedule: Vec::new(),
            receive_queue: VecDeque::new(),
            send_queue: Vec::new(),
        }
    }
}

impl Node for TschNode {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_cycle_offset(&self) -> u64 {
        self.cycle_offset
    }

    fn get_tick_interval(&self) -> u64 {
        self.tick_interval
    }

    fn accept_packet(&mut self, incoming_packet: Box<dyn Packet>) {
        self.receive_queue.push_back(incoming_packet);
    }

    fn collect_packets(&mut self) -> Vec<Box<dyn Packet>> {
        self.send_queue.drain(..).collect()
    }

    fn register_task(&mut self, task: Box<dyn Task>) {
        self.tasks.insert(task.get_id(), task);
    }

    fn construct_task_schedule(&mut self) {
        self.task_schedule.clear();

        // Collect tasks with their execution times and priorities
        let mut ready_tasks = Vec::new();

        for (_, task) in self.tasks.iter_mut() {
            let execution_time = task.get_execution_time();
            let priority = task.get_priority();
            if execution_time > 0 {
                ready_tasks.push((priority, execution_time, task.get_id()));
            }
        }

        // Sort by priority (highest first)
        ready_tasks.sort_by(|a, b| b.0.cmp(&a.0));

        // Fill the schedule up to cycles_per_tick
        let mut current_cycle = 0;
        for (_priority, exec_time, task_id) in ready_tasks {
            for _ in 0..exec_time {
                if current_cycle >= self.get_tick_interval() {
                    break;
                }
                self.task_schedule.push(task_id);
                current_cycle += 1;
            }
            if current_cycle >= self.get_tick_interval() {
                break;
            }
        }
    }

    fn get_scheduled_task(&self, local_cycle: u64) -> Option<u16> {
        self.task_schedule.get(local_cycle as usize).cloned()
    }

    fn execute_task(&mut self, task_id: u16) {
        if let Some(task) = self.tasks.get_mut(&task_id) {
            task.execute();
        }
    }
}
