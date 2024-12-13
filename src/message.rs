use std::any::Any;
use std::cmp::Ordering;
use std::collections::BinaryHeap;

/// Represents a message that can be exchanged between tasks within a node
pub trait Message: Any {
    fn src(&self) -> u8;
    fn dst(&self) -> u8;
    fn priority(&self) -> u8;
    fn as_any(&self) -> &dyn Any;
}

impl PartialEq for Box<dyn Message> {
    fn eq(&self, other: &Self) -> bool {
        self.priority() == other.priority()
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
        self.priority().cmp(&other.priority()) // Higher priority first
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
