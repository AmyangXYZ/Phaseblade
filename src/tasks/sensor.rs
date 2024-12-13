use crate::core::{Mailbox, Message, NodeContext, Task};

pub struct SensorTask {
    id: u16,
    name: String,
    priority: u8,
    execution_cycles: u64,
    mailbox: Mailbox,
}

impl SensorTask {
    pub fn new(id: u16, name: &str, priority: u8) -> Self {
        SensorTask {
            id,
            name: name.to_string(),
            priority,
            execution_cycles: 0,
            mailbox: Mailbox::new(),
        }
    }
}

impl Task for SensorTask {
    fn id(&self) -> u16 {
        self.id
    }

    fn name(&self) -> String {
        self.name.clone()
    }

    fn priority(&self) -> u8 {
        self.priority
    }

    fn post_message(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }

    fn execute(&mut self, context: &NodeContext) -> Vec<Box<dyn Message>> {
        self.execution_cycles -= 1;
        if self.execution_cycles == 0 {
            println!(
                "SensorTask {} done at clock {:.3}",
                self.id, context.local_time
            );
        }
        vec![]
    }
}
