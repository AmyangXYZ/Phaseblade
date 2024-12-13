use crate::packet::Packet;
use std::cmp::Ordering;
use std::collections::BinaryHeap;

/// Represents a message that can be exchanged between tasks
pub trait Message {
    fn get_src_task(&self) -> u16;
    fn get_dst_task(&self) -> u16;
    fn get_priority(&self) -> u8;
    fn has_packet(&self) -> bool {
        false
    }
    fn get_packet(&self) -> Option<Box<dyn Packet>> {
        None
    }
}

impl PartialEq for Box<dyn Message> {
    fn eq(&self, other: &Self) -> bool {
        self.get_priority() == other.get_priority()
    }
}

impl Eq for Box<dyn Message> {}

impl PartialOrd for Box<dyn Message> {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Box<dyn Message> {
    fn cmp(&self, other: &Self) -> Ordering {
        other.get_priority().cmp(&self.get_priority()) // Higher priority first
    }
}

// Priority queue wrapper for messages
pub struct Mailbox {
    messages: BinaryHeap<Box<dyn Message>>,
}

impl Mailbox {
    pub fn new() -> Self {
        Self {
            messages: BinaryHeap::new(),
        }
    }

    pub fn get(&mut self) -> Option<Box<dyn Message>> {
        self.messages.pop()
    }

    pub fn post(&mut self, msg: Box<dyn Message>) {
        self.messages.push(msg);
    }

    pub fn is_empty(&self) -> bool {
        self.messages.is_empty()
    }

    pub fn len(&self) -> usize {
        self.messages.len()
    }
}
