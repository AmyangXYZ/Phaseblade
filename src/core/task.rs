use crate::core::Packet;

pub struct Message {
    pub src_task: u16,
    pub dst_task: u16,
    pub priority: u8,
    pub data: Box<dyn Packet>,
}

pub trait Task {
    fn get_id(&self) -> u16;
    fn get_priority(&self) -> u8;
    fn get_execution_time(&mut self) -> u64;
    fn execute(&mut self) -> Vec<Message>;
    fn enqueue_message(&mut self, msg: Message);
}
