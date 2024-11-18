use crate::core::{Mailbox, Message};

/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn get_id(&self) -> u16;
    fn get_name(&self) -> String;
    fn get_priority(&self) -> u8;
    fn get_micros_per_tick(&self) -> u64;
    fn get_wake_tick(&self) -> u64;
    fn set_wake_tick(&mut self, wake_tick: u64);
    fn get_execution_cycles(&mut self) -> u64;
    fn get_mailbox_mut(&mut self) -> &mut Mailbox;
    fn execute(&mut self, local_time: f64) -> Vec<Box<dyn Message>>;

    fn is_ready(&mut self, current_tick: u64) -> bool {
        self.get_wake_tick() <= current_tick
    }

    fn sleep(&mut self, duration_us: u64) {
        let us_per_tick = self.get_micros_per_tick();
        let additional_ticks = (duration_us + us_per_tick - 1) / us_per_tick;
        self.set_wake_tick(self.get_wake_tick() + additional_ticks);
    }

    fn post_message(&mut self, msg: Box<dyn Message>) {
        self.get_mailbox_mut().post(msg);
    }
}
