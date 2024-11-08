use phaseblade::{Node, Orchestrator};

fn main() {
    let mut orchestrator = Orchestrator::new();
    for i in 1..=2 {
        let (node, node_handle) = Node::new(i, (i as u64) << 62);
        orchestrator.add_node(i as u64, node_handle);
        node.run();
    }
    orchestrator.run();
}
