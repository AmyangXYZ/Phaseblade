use crate::core::Message;

// RTOS-like preemptable task, to be scheduled and executed in the node
pub trait Task {
    fn get_id(&self) -> u16;
    fn get_name(&self) -> String;
    fn get_priority(&self) -> u8;
    fn get_execution_time(&mut self) -> u64;
    fn execute(&mut self) -> Vec<Box<dyn Message>>;
    fn post_message(&mut self, msg: Box<dyn Message>);
}
