use crate::message::{Mailbox, Message};
use crate::node::NodeContext;
use crate::task::{Task, TaskExecResult, TaskState, TaskStatus};
use std::any::Any;
pub struct SensingTask {
    id: u8,
    name: String,
    priority: u8,
    status: TaskStatus,
    execution_cycles: u64,
    mailbox: Mailbox,
}

impl SensingTask {
    pub fn new(id: u8, name: String, priority: u8) -> Self {
        SensingTask {
            id,
            name,
            priority,
            status: TaskStatus::Blocked,
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

    fn state(&self) -> TaskState {
        TaskState {
            status: self.status.clone(),
            remaining_cycles: self.execution_cycles,
        }
    }

    fn tick(&mut self, context: &mut NodeContext) {
        if context.local_time % 100.0 < 1e-4 {
            self.status = TaskStatus::Ready;
            self.execution_cycles = 3;
        }
    }

    fn execute(&mut self, context: &mut NodeContext) -> TaskExecResult {
        self.execution_cycles -= 1;
        self.status = TaskStatus::Running;
        let mut messages: Vec<Box<dyn Message>> = Vec::new();
        if self.execution_cycles == 0 {
            println!("{} done at clock {:?}", self.name, context.local_time);
            if self.id == 0 {
                messages.push(Box::new(SensorReadingMessage {
                    src: self.id,
                    dst: 1,
                    priority: 0,
                    value: 10,
                }));
            }
            self.status = TaskStatus::Blocked;
        }
        TaskExecResult {
            messages,
            packets: Vec::new(),
        }
    }

    fn post(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }
}

#[derive(Debug)]
pub struct SensorReadingMessage {
    src: u8,
    dst: u8,
    priority: u8,
    pub value: u8,
}

impl Message for SensorReadingMessage {
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
