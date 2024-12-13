use crate::message::{Mailbox, Message};
use crate::node::NodeContext;
use crate::task::{Task, TaskExecResult, TaskState, TaskStatus};
use std::any::Any;
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

    fn state(&mut self, context: &NodeContext) -> TaskState {
        if context.local_time % 100.0 < 1.0 {
            self.execution_cycles = 5;
            TaskState {
                status: TaskStatus::Ready,
                remaining_cycles: self.execution_cycles,
            }
        } else {
            TaskState {
                status: TaskStatus::Blocked,
                remaining_cycles: 0,
            }
        }
    }

    fn execute(&mut self, context: &NodeContext) -> TaskExecResult {
        self.execution_cycles -= 1;
        if self.execution_cycles == 0 {
            println!(
                "SensingTask {} done at clock {:?}",
                self.id, context.local_time
            );
            if self.id == 0 {
                return TaskExecResult {
                    messages: vec![Box::new(SensorReading {
                        src: self.id,
                        dst: 1,
                        priority: 0,
                        value: 10,
                    })],
                };
            }
        }
        if self.id == 1 {
            if let Some(msg) = self.mailbox.get() {
                let msg = msg.as_any().downcast_ref::<SensorReading>().unwrap();
                println!("SensingTask {} received reading {:?}", self.id, msg.value);
            }
        }
        TaskExecResult { messages: vec![] }
    }

    fn post(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }
}

#[derive(Debug)]
pub struct SensorReading {
    src: u8,
    dst: u8,
    priority: u8,
    pub value: u8,
}

impl Message for SensorReading {
    fn src(&self) -> u8 {
        self.src
    }

    fn dst(&self) -> u8 {
        self.dst
    }

    fn priority(&self) -> u8 {
        self.priority
    }

    fn as_any(&self) -> &dyn Any {
        self
    }
}
