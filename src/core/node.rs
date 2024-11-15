use crate::core::Task;
use std::collections::HashMap;
use std::sync::mpsc::{sync_channel, Receiver, SyncSender};
use std::sync::{Arc, Mutex};

#[derive(Clone, Copy)]
pub struct NodeState {
    pub id: u16,
    pub eui64: u64,
    pub position: [f32; 2],
    pub cycles_per_tick: u64,
    pub cycle_offset: u64,
}

pub struct NodeController {
    pub state: Arc<Mutex<NodeState>>,
    cycle_sender: SyncSender<u64>,
    cycle_completed_receiver: Receiver<()>,
}

impl NodeController {
    pub fn new(state: Arc<Mutex<NodeState>>) -> (Self, (Receiver<u64>, SyncSender<()>)) {
        let (cycle_sender, cycle_receiver) = sync_channel::<u64>(0);
        let (cycle_completed_sender, cycle_completed_receiver) = sync_channel::<()>(0);
        let controller = Self {
            state,
            cycle_sender,
            cycle_completed_receiver,
        };
        (controller, (cycle_receiver, cycle_completed_sender))
    }

    pub fn send_cycle(&self, cycle: u64) {
        let _ = self.cycle_sender.send(cycle);
    }

    pub fn wait_completion(&self) -> bool {
        self.cycle_completed_receiver.try_recv().is_ok()
    }
}

pub struct NodeRuntime {
    state: Arc<Mutex<NodeState>>,
    cycle_receiver: Receiver<u64>,
    cycle_completed_sender: SyncSender<()>,
    tasks: HashMap<u16, Box<dyn Task>>,
    task_schedule: Vec<u16>,
}

impl NodeRuntime {
    pub fn new(
        state: Arc<Mutex<NodeState>>,
        cycle_receiver: Receiver<u64>,
        cycle_completed_sender: SyncSender<()>,
    ) -> Self {
        Self {
            state,
            cycle_receiver,
            cycle_completed_sender,
            tasks: HashMap::new(),
            task_schedule: Vec::new(),
        }
    }

    pub fn register_task(&mut self, task: Box<dyn Task>) {
        self.tasks.insert(task.get_id(), task);
    }

    pub fn run(&mut self) {
        while let Ok(cycle) = self.cycle_receiver.recv() {
            if cycle >= self.state.lock().unwrap().cycle_offset {
                let local_cycle = cycle - self.state.lock().unwrap().cycle_offset;

                // new tick
                if local_cycle % self.state.lock().unwrap().cycles_per_tick == 0 {
                    println!("Scheduling tasks {}", local_cycle);
                    self.schedule_tasks();
                    println!("Scheduled tasks: {:?}", self.task_schedule);
                }

                if let Some(task_id) = self
                    .task_schedule
                    .get((local_cycle % self.state.lock().unwrap().cycles_per_tick) as usize)
                {
                    if let Some(task) = self.tasks.get_mut(task_id) {
                        let messages = task.execute();
                        for msg in messages {
                            println!("sending msg to task {}", msg.dst_task);
                        }
                    }
                }
            }

            let _ = self.cycle_completed_sender.send(());
        }
    }

    fn schedule_tasks(&mut self) {
        self.task_schedule.clear();
        // Collect tasks with their execution times and priorities
        let mut ready_tasks = Vec::new();

        for (task_id, task) in self.tasks.iter_mut() {
            let execution_time = task.get_execution_time();
            let priority = task.get_priority();
            if execution_time > 0 {
                ready_tasks.push((priority, execution_time, task_id));
            }
        }

        // Sort by priority (highest first)
        ready_tasks.sort_by(|a, b| b.0.cmp(&a.0));

        // Fill the schedule up to cycles_per_tick
        let mut current_cycle = 0;
        for (_priority, exec_time, task_id) in ready_tasks {
            for _ in 0..exec_time {
                if current_cycle >= self.state.lock().unwrap().cycles_per_tick {
                    break;
                }
                self.task_schedule.push(*task_id);
                current_cycle += 1;
            }
            if current_cycle >= self.state.lock().unwrap().cycles_per_tick {
                break;
            }
        }
    }
}
