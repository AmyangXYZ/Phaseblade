use crate::core::{Mailbox, Message, Task};

pub struct SensorTask {
    id: u16,
    name: String,
    priority: u8,
    execution_cycles: u64,
    mailbox: Mailbox,
    wake_tick: u64,
    micros_per_tick: u64,
}

impl SensorTask {
    pub fn new(id: u16, name: &str, priority: u8, micros_per_tick: u64) -> Self {
        SensorTask {
            id,
            name: name.to_string(),
            priority,
            execution_cycles: 0,
            mailbox: Mailbox::new(),
            wake_tick: 0,
            micros_per_tick,
        }
    }
}

impl Task for SensorTask {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_name(&self) -> String {
        self.name.clone()
    }

    fn get_priority(&self) -> u8 {
        self.priority
    }

    fn get_micros_per_tick(&self) -> u64 {
        self.micros_per_tick
    }

    fn get_wake_tick(&self) -> u64 {
        self.wake_tick
    }

    fn set_wake_tick(&mut self, wake_tick: u64) {
        self.wake_tick = wake_tick;
        println!("Task {} sleeps until tick {}", self.id, wake_tick);
    }

    fn get_execution_cycles(&mut self) -> u64 {
        self.execution_cycles
    }

    fn get_mailbox_mut(&mut self) -> &mut Mailbox {
        &mut self.mailbox
    }

    fn is_ready(&mut self, current_tick: u64) -> bool {
        if current_tick >= self.wake_tick {
            println!("SensorTask {} is ready at tick {}", self.id, current_tick);
            self.execution_cycles = 2;
            true
        } else {
            false
        }
    }

    fn execute(&mut self, local_time: f64) -> Vec<Box<dyn Message>> {
        self.execution_cycles -= 1;
        if self.execution_cycles == 0 {
            println!("SensorTask {} done at clock {:.3}", self.id, local_time);
            self.sleep(self.micros_per_tick * 1);
        }
        vec![]
    }
}
