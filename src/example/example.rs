use phaseblade::{
    AppStack, MacStack, NetStack, NodeController, NodeRuntime, NodeState, Orchestrator, PhyStack,
};
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let cycles_per_tick = 7;

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
        let mut node_runtime = NodeRuntime::new(Arc::clone(&node_state), channels.0, channels.1);
        let app_stack = AppStack::new("app", 1, 1);
        let net_stack = NetStack::new("net", 2, 2);
        let mac_stack = MacStack::new("mac", 3, 7);
        let phy_stack = PhyStack::new("phy", 4, 3);

        node_runtime.register_task(Box::new(app_stack));
        node_runtime.register_task(Box::new(net_stack));
        node_runtime.register_task(Box::new(mac_stack));
        node_runtime.register_task(Box::new(phy_stack));
        node_runtime.run();
    });

    orchestrator.run();
}
