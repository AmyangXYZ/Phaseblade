use crate::core::{Mailbox, Message, Task};

pub struct SensorTask {
    id: u16,
    name: String,
    priority: u8,
    execution_time: u64,
    mailbox: Mailbox,
}

impl SensorTask {
    pub fn new(id: u16, name: String, priority: u8) -> Self {
        SensorTask {
            id,
            name,
            priority,
            execution_time: 5,
            mailbox: Mailbox::new(),
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

    fn get_execution_time(&mut self) -> u64 {
        self.execution_time
    }
    fn execute(&mut self) -> Vec<Box<dyn Message>> {
        self.execution_time -= 1;
        if self.execution_time == 0 {
            println!("SensorTask {} done", self.id);
        }
        vec![]
    }

    fn post_message(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }
}
