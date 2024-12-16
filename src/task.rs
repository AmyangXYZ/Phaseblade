use crate::message::Message;
use crate::node::NodeContext;
use crate::packet::Packet;

/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn id(&self) -> u8;
    fn name(&self) -> String;
    fn priority(&self) -> u8;
    fn state(&self) -> TaskState;
    fn tick(&mut self, context: &NodeContext);
    fn execute(&mut self, context: &NodeContext) -> TaskExecResult;
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
