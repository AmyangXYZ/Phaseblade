use crate::core::{Message, NodeContext};
/// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn id(&self) -> u16;
    fn name(&self) -> String;
    fn priority(&self) -> u8;
    fn post_message(&mut self, msg: Box<dyn Message>);
    fn execute(&mut self, context: &NodeContext) -> Vec<Box<dyn Message>>;
}
