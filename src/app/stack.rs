use crate::{Message, Task};

pub struct AppStack {
    pub priority: u8,
    execution_time: u64, // in cycles
    messages: Vec<Message>,
    id: u16,
}

impl Task for AppStack {
    fn get_id(&self) -> u16 {
        self.id
    }

    fn get_priority(&self) -> u8 {
        self.priority
    }

    fn get_execution_time(&mut self) -> u64 {
        self.execution_time = 5;
        self.execution_time
    }

    fn execute(&mut self) -> Vec<Message> {
        self.execution_time -= 1;

        if self.execution_time == 0 {
            println!("Executing app stack task ");
        }

        vec![]
    }

    fn enqueue_message(&mut self, message: Message) {
        self.messages.push(message);
    }
}

impl AppStack {
    pub fn new(priority: u8, id: u16) -> Self {
        Self {
            priority,
            execution_time: 0,
            messages: Vec::new(),
            id,
        }
    }
}
