use crate::message::Message;
use crate::node::NodeContext;
use crate::packet::Packet;
use serde::{Deserialize, Serialize};

/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn id(&self) -> u8;
    fn name(&self) -> String;
    fn priority(&self) -> u8;
    fn state(&self) -> TaskState;
    fn tick(&mut self, context: &mut NodeContext);
    fn execute(&mut self, context: &mut NodeContext) -> TaskExecResult;
    fn post(&mut self, msg: Box<dyn Message>);
}

pub struct TaskExecResult {
    pub messages: Vec<Box<dyn Message>>,
    pub packets: Vec<Box<dyn Packet>>,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum TaskStatus {
    Blocked,
    Ready,
    Running,
}

pub struct TaskState {
    pub status: TaskStatus,
    pub remaining_cycles: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TaskConfig {
    pub id: u8,
    pub name: String,
    pub priority: u8,
}

impl TaskConfig {
    pub fn new(id: u8, name: &str, priority: u8) -> Self {
        Self {
            id,
            name: name.to_string(),
            priority,
        }
    }
}
