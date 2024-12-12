use crate::core::{Mailbox, Message, Task};

pub struct TschMacTask {
    id: u16,
    name: String,
    priority: u8,
    execution_cycles: u64,
    wake_tick: u64,
    micros_per_tick: u64,
    mailbox: Mailbox,
}

impl TschMacTask {
    pub fn new(id: u16, name: &str, priority: u8, micros_per_tick: u64) -> Self {
        TschMacTask {
            id,
            name: name.to_string(),
            priority,
            execution_cycles: 5,
            wake_tick: 0,
            micros_per_tick,
            mailbox: Mailbox::new(),
        }
    }
}

impl Task for TschMacTask {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_name(&self) -> String {
        self.name.clone()
    }

    fn get_priority(&self) -> u8 {
        self.priority
    }

    fn get_execution_cycles(&mut self) -> u64 {
        self.execution_cycles
    }

    fn get_mailbox_mut(&mut self) -> &mut Mailbox {
        &mut self.mailbox
    }

    fn get_micros_per_tick(&self) -> u64 {
        self.micros_per_tick
    }

    fn get_wake_tick(&self) -> u64 {
        self.wake_tick
    }

    fn set_wake_tick(&mut self, wake_tick: u64) {
        self.wake_tick = wake_tick;
    }

    fn execute(&mut self, local_time: f64) -> Vec<Box<dyn Message>> {
        self.execution_cycles -= 1;
        if self.execution_cycles == 0 {
            println!("TschMacTask {} done at clock {:.3}", self.id, local_time);
        }
        vec![]
    }
}
