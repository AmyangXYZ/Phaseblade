use crate::message::Message;
use crate::node::NodeContext;

/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn id(&self) -> u8;
    fn name(&self) -> String;
    fn priority(&self) -> u8;
    fn state(&mut self, context: &NodeContext) -> TaskState;
    fn execute(&mut self, context: &NodeContext) -> TaskExecResult;
    fn post(&mut self, msg: Box<dyn Message>);
}

pub struct TaskExecResult {
    pub messages: Vec<Box<dyn Message>>,
}

#[derive(Debug, PartialEq, Eq)]
pub enum TaskStatus {
    Blocked,
    Ready,
    Running,
}

pub struct TaskState {
    pub status: TaskStatus,
    pub remaining_cycles: u64,
}
