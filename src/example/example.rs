use phaseblade::{AppStack, NodeController, NodeRuntime, NodeState, Orchestrator};
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let cycles_per_tick = 10;

    let mut orchestrator = Orchestrator::new();

    let node_state = Arc::new(Mutex::new(NodeState {
        id: 2,
        eui64: 1111,
        position: [0.0, 0.0],
        cycles_per_tick,
        cycle_offset: 3,
    }));
    let (node_controller, channels) = NodeController::new(Arc::clone(&node_state));
    orchestrator.add_node_controller(node_controller);
    thread::spawn(move || {
        let id: u16 = 2;
        let app_stack = AppStack::new(1, id);
        let mut node_runtime = NodeRuntime::new(Arc::clone(&node_state), channels.0, channels.1);

        node_runtime.register_task(Box::new(app_stack));
        node_runtime.run();
    });

    orchestrator.run();
}
