use crate::core::Packet;
use std::cmp::Ordering;
use std::collections::BinaryHeap;

// RTOS like preemptable task, to be scheduled by the node runtime
pub trait Task {
    fn get_id(&self) -> u16;
    fn get_name(&self) -> String;
    fn get_priority(&self) -> u8;
    fn get_execution_time(&mut self) -> u64;
    fn execute(&mut self) -> Vec<Message>;
    fn enqueue_message(&mut self, msg: Message);
}

pub struct Message {
    pub src_task: u16,
    pub dst_task: u16,
    pub priority: u8,
    pub data: Box<dyn Packet>,
}

impl Message {
    pub fn new(src_task: u16, dst_task: u16, priority: u8, data: Box<dyn Packet>) -> Self {
        Message {
            src_task,
            dst_task,
            priority,
            data,
        }
    }
}

impl PartialEq for Message {
    fn eq(&self, other: &Self) -> bool {
        self.priority == other.priority
    }
}

impl Eq for Message {}

impl PartialOrd for Message {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(other.priority.cmp(&self.priority))
    }
}

impl Ord for Message {
    fn cmp(&self, other: &Self) -> Ordering {
        other.priority.cmp(&self.priority)
    }
}

pub struct MessageQueue(BinaryHeap<Message>);

impl MessageQueue {
    pub fn new() -> Self {
        MessageQueue(BinaryHeap::new())
    }

    pub fn enqueue(&mut self, msg: Message) {
        self.0.push(msg);
    }

    pub fn pop(&mut self) -> Option<Message> {
        self.0.pop()
    }
}
