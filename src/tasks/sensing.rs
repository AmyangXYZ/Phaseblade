use crate::message::{Mailbox, Message};
use crate::node::NodeContext;
use crate::task::Task;

pub struct SensingTask {
    id: u8,
    name: String,
    priority: u8,
    execution_cycles: u64,
    mailbox: Mailbox,
}

impl SensingTask {
    pub fn new(id: u8, name: &str, priority: u8) -> Self {
        SensingTask {
            id,
            name: name.to_string(),
            priority,
            execution_cycles: 5,
            mailbox: Mailbox::new(),
        }
    }
}

impl Task for SensingTask {
    fn id(&self) -> u8 {
        self.id
    }

    fn name(&self) -> String {
        self.name.clone()
    }

    fn priority(&self) -> u8 {
        self.priority
    }

    fn post(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }

    fn execution_cycles(&self) -> u64 {
        self.execution_cycles
    }

    fn execute(&mut self, context: &NodeContext) -> Vec<Box<dyn Message>> {
        self.execution_cycles -= 1;
        if self.execution_cycles == 0 {
            println!(
                "SensingTask {} done at clock {:.3}",
                self.id, context.local_time
            );
        }
        vec![]
    }
}
