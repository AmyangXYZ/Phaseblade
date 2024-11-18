use crate::core::{Packet, Task};

pub trait Node {
    // public interfaces, used by engine
    fn get_id(&self) -> u16;
    fn accept_packet(&mut self, incoming_packet: Box<dyn Packet>);
    fn collect_packets(&mut self) -> Vec<Box<dyn Packet>>;
    fn register_task(&mut self, task: Box<dyn Task>);
    fn execute(&mut self, cycle: u64) {
        let local_cycle = self.calculate_local_cycle(cycle);

        if self.is_new_tick(local_cycle) {
            self.construct_task_schedule();
        }
        if let Some(task_id) = self.get_scheduled_task(local_cycle) {
            self.execute_task(task_id);
        }
    }

    // internal methods
    fn get_cycle_offset(&self) -> u64;
    fn get_tick_interval(&self) -> u64;
    fn calculate_local_cycle(&self, cycle: u64) -> u64 {
        if cycle < self.get_cycle_offset() {
            0
        } else {
            cycle - self.get_cycle_offset()
        }
    }

    fn is_new_tick(&self, local_cycle: u64) -> bool {
        local_cycle % self.get_tick_interval() == 0
    }
    fn construct_task_schedule(&mut self);
    fn get_scheduled_task(&self, local_cycle: u64) -> Option<u16>;
    fn execute_task(&mut self, task_id: u16);
}
