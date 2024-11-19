use crate::core::{Message, Packet, Task};
use std::collections::{HashMap, VecDeque};

pub trait Node {
    fn get_id(&self) -> u16;
    fn get_cycle_offset(&self) -> u64;
    fn get_cycles_per_tick(&self) -> u64;
    fn get_local_cycle(&self) -> u64;
    fn get_local_time(&self) -> f64;
    fn set_local_time(&mut self, local_time: f64);
    fn get_clock_drift_factor(&self) -> f64;
    fn get_task_names(&self) -> HashMap<u16, String>;
    fn get_tasks_mut(&mut self) -> &mut HashMap<u16, Box<dyn Task>>;
    fn get_task_schedule(&self) -> Vec<u16>;
    fn get_task_schedule_mut(&mut self) -> &mut Vec<u16>;
    fn get_receive_queue_mut(&mut self) -> &mut VecDeque<Box<dyn Packet>>;
    fn get_send_queue_mut(&mut self) -> &mut Vec<Box<dyn Packet>>;

    fn calculate_local_cycle(&self, cycle: u64) -> u64 {
        if cycle < self.get_cycle_offset() {
            0
        } else {
            cycle - self.get_cycle_offset()
        }
    }

    fn is_new_tick(&self, local_cycle: u64) -> bool {
        local_cycle % self.get_cycles_per_tick() == 0
    }

    fn update_local_time(&mut self, _local_cycle: u64) {
        let drift_factor = self.get_clock_drift_factor();
        let local_time = self.get_local_time();
        self.set_local_time(local_time + 1.0 * drift_factor);
    }

    fn register_task(&mut self, task: Box<dyn Task>) {
        self.get_tasks_mut().insert(task.get_id(), task);
    }

    // fixed priority scheduling
    fn construct_task_schedule(&mut self, current_tick: u64) {
        let tasks = self.get_tasks_mut();

        // Collect tasks with their execution times and priorities
        let mut ready_tasks = Vec::new();

        for task in tasks.values_mut() {
            if !task.is_ready(current_tick) {
                continue;
            }
            let cycles = task.get_execution_cycles();
            let priority = task.get_priority();
            if cycles > 0 {
                ready_tasks.push((priority, cycles, task.get_id()));
            }
        }

        let cycles_per_tick = self.get_cycles_per_tick();

        let schedule = self.get_task_schedule_mut();
        schedule.clear();

        // Sort by priority (highest first)
        ready_tasks.sort_by(|a, b| b.0.cmp(&a.0));

        let mut current_cycle = 0;

        for (_priority, cycles, task_id) in ready_tasks {
            for _ in 0..cycles {
                if current_cycle >= cycles_per_tick {
                    break;
                }
                schedule.push(task_id);
                current_cycle += 1;
            }
            if current_cycle >= cycles_per_tick {
                break;
            }
        }
        println!(
            "Constructed task schedule: {:?} at tick {}",
            schedule, current_tick
        );
    }

    fn route_message(&mut self, message: Box<dyn Message>) {
        let dst_task = message.get_dst_task();
        self.get_tasks_mut()
            .get_mut(&dst_task)
            .expect(&format!("Task {} not found", dst_task))
            .post_message(message);
    }

    fn accept_packet(&mut self, incoming_packet: Box<dyn Packet>) {
        self.get_receive_queue_mut().push_back(incoming_packet);
    }

    fn collect_packets(&mut self) -> Vec<Box<dyn Packet>> {
        self.get_send_queue_mut().drain(..).collect()
    }

    fn execute(&mut self, cycle: u64) {
        let local_cycle = self.calculate_local_cycle(cycle);

        self.update_local_time(local_cycle);
        let local_time = self.get_local_time();
        let cycles_per_tick = self.get_cycles_per_tick();
        let current_tick = local_cycle / cycles_per_tick;

        if self.is_new_tick(local_cycle) {
            self.construct_task_schedule(current_tick);
        }

        if let Some(task_id) = self
            .get_task_schedule()
            .get((local_cycle % cycles_per_tick) as usize)
            .cloned()
        {
            if let Some(task) = self.get_tasks_mut().get_mut(&task_id) {
                let messages = task.execute(local_time);
                for message in messages {
                    if message.has_packet() {
                        if let Some(packet) = message.get_packet() {
                            self.get_send_queue_mut().push(packet);
                        }
                    } else {
                        self.route_message(message);
                    }
                }
            }
        }
    }
}
