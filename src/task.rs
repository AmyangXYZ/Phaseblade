use crate::message::Message;
use crate::node::NodeContext;

/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn id(&self) -> u8;
    fn name(&self) -> String;
    fn priority(&self) -> u8;
    fn execution_cycles(&self) -> u64;
    fn post(&mut self, msg: Box<dyn Message>);
    fn execute(&mut self, context: &NodeContext) -> Vec<Box<dyn Message>>;
}
