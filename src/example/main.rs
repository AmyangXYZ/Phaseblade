use phaseblade::engine::Engine;
use phaseblade::node::Node;
use phaseblade::tasks::{SensingTask, TSCHMacTask};

fn main() {
    let mut engine = Engine::new();
    let mut node = Node::new(0, vec![1.0, 2.0, 3.0], 100_000, 10, 0, 0.0);
    node.register_task(Box::new(SensingTask::new(0, "Sensing", 8)));
    node.register_task(Box::new(TSCHMacTask::new(1, "TSCHMac", 0)));

    engine.add_node(node);
    engine.run(20);
}
