use crate::app::AppPacket;
use crate::{Message, MessageQueue, Task};

pub struct PhyStack {
    name: String,
    id: u16,
    priority: u8,
    execution_time: u64,
    messages: MessageQueue,
}

impl Task for PhyStack {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_name(&self) -> String {
        self.name.clone()
    }

    fn get_priority(&self) -> u8 {
        self.priority
    }

    fn get_execution_time(&mut self) -> u64 {
        self.execution_time
    }

    fn execute(&mut self) -> Vec<Message> {
        self.execution_time -= 1;

        if self.execution_time == 0 {
            return vec![Message::new(
                self.get_id(),
                1,
                self.priority,
                Box::new(AppPacket::new(0, 0, &[0x01])),
            )];
        }

        vec![]
    }

    fn enqueue_message(&mut self, message: Message) {
        self.messages.enqueue(message);
    }
}

impl PhyStack {
    pub fn new(name: &str, id: u16, priority: u8) -> Self {
        Self {
            name: name.to_string(),
            id,
            priority,
            execution_time: 5,
            messages: MessageQueue::new(),
        }
    }
}
