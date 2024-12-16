use std::any::Any;

use rand::Rng;

use crate::message::{Mailbox, Message};
use crate::node::NodeContext;
use crate::packet::Packet;
use crate::task::{Task, TaskExecResult, TaskState, TaskStatus};
use crate::tasks::sensing::SensorReadingMessage;

pub struct TSCHMacTask {
    id: u8,
    name: String,
    priority: u8,
    execution_cycles: u64,
    status: TaskStatus,
    mailbox: Mailbox,
}

impl TSCHMacTask {
    pub fn new(id: u8, name: &str, priority: u8) -> Self {
        TSCHMacTask {
            id,
            name: name.to_string(),
            priority,
            execution_cycles: 0,
            status: TaskStatus::Blocked,
            mailbox: Mailbox::new(),
        }
    }
}

impl Task for TSCHMacTask {
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

    fn tick(&mut self, context: &NodeContext) {
        if let Some(msg) = self.mailbox.get() {
            let msg = msg.as_any().downcast_ref::<SensorReadingMessage>().unwrap();
            println!("{} received reading {:?}", self.name, msg.value);
        }
        if context.local_time % 100.0 < 1.0 {
            self.status = TaskStatus::Ready;
            self.execution_cycles = 5;
        }
    }

    fn execute(&mut self, context: &NodeContext) -> TaskExecResult {
        self.execution_cycles -= 1;
        self.status = TaskStatus::Running;
        let mut packets: Vec<Box<dyn Packet>> = Vec::new();
        if self.execution_cycles == 0 {
            println!("{} done at clock {:?}", self.name, context.local_time);
            packets.push(Box::new(TSCHPacket {
                uid: rand::thread_rng().gen(),
                src: self.id,
                dst: 1,
                value: 10,
            }));
            self.status = TaskStatus::Blocked;
        }
        TaskExecResult {
            messages: vec![],
            packets: packets,
        }
    }

    fn post(&mut self, msg: Box<dyn Message>) {
        self.mailbox.post(msg);
    }
}
pub struct TSCHPacket {
    uid: u64,
    src: u8,
    dst: u8,
    value: u8,
}

impl Packet for TSCHPacket {
    fn uid(&self) -> u64 {
        self.uid
    }

    fn src(&self) -> u16 {
        self.src as u16
    }

    fn dst(&self) -> u16 {
        self.dst as u16
    }

    fn size(&self) -> u64 {
        self.value as u64
    }

    fn as_any(&self) -> &dyn Any {
        self
    }
}
