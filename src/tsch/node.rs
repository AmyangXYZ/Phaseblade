use crate::core::{Node, Packet, Task};
use crate::tsch::{SensorTask, TschMacTask};
use std::collections::{HashMap, VecDeque};

pub struct TschNode {
    id: u16,
    cycles_per_tick: u64,
    cycle_offset: u64,
    local_cycle: u64,
    local_time: f64,
    clock_drift_factor: f64,
    tasks: HashMap<u16, Box<dyn Task>>,
    task_schedule: Vec<u16>,
    receive_queue: VecDeque<Box<dyn Packet>>,
    send_queue: Vec<Box<dyn Packet>>,
}

impl TschNode {
    pub fn new(id: u16, cycles_per_tick: u64, cycle_offset: u64, micros_per_tick: u64) -> Self {
        let mut node = TschNode {
            id,
            cycles_per_tick,
            cycle_offset,
            local_cycle: 0,
            local_time: 100.0,
            clock_drift_factor: 1.0,
            tasks: HashMap::new(),
            task_schedule: Vec::new(),
            receive_queue: VecDeque::new(),
            send_queue: Vec::new(),
        };
        node.register_task(Box::new(SensorTask::new(0, "sensor", 1, micros_per_tick)));
        node.register_task(Box::new(TschMacTask::new(1, "mac", 7, micros_per_tick)));
        node
    }
}

impl Node for TschNode {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_cycle_offset(&self) -> u64 {
        self.cycle_offset
    }

    fn get_cycles_per_tick(&self) -> u64 {
        self.cycles_per_tick
    }

    fn get_local_cycle(&self) -> u64 {
        self.local_cycle
    }

    fn set_local_cycle(&mut self, local_cycle: u64) {
        self.local_cycle = local_cycle;
    }

    fn get_local_time(&self) -> f64 {
        self.local_time
    }

    fn set_local_time(&mut self, local_time: f64) {
        self.local_time = local_time;
    }

    fn get_clock_drift_factor(&self) -> f64 {
        self.clock_drift_factor
    }

    fn get_task_names(&self) -> HashMap<u16, String> {
        self.tasks
            .iter()
            .map(|(id, task)| (*id, task.get_name()))
            .collect()
    }

    fn get_tasks_mut(&mut self) -> &mut HashMap<u16, Box<dyn Task>> {
        &mut self.tasks
    }

    fn get_task_schedule(&self) -> Vec<u16> {
        self.task_schedule.clone()
    }

    fn get_task_schedule_mut(&mut self) -> &mut Vec<u16> {
        &mut self.task_schedule
    }

    fn get_receive_queue_mut(&mut self) -> &mut VecDeque<Box<dyn Packet>> {
        &mut self.receive_queue
    }

    fn get_send_queue_mut(&mut self) -> &mut Vec<Box<dyn Packet>> {
        &mut self.send_queue
    }
}
