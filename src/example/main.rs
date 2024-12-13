use phaseblade::node::Node;
use phaseblade::tasks::SensingTask;

fn main() {
    let mut node = Node::new(0, vec![1.0, 2.0, 3.0], 1_000_000, 20, 0, 0.0);
    node.register_task(Box::new(SensingTask::new(0, "SensingTask 1", 2)));
    node.register_task(Box::new(SensingTask::new(1, "SensingTask 2", 8)));

    for i in 1..20 {
        node.execute(i);
    }
    println!("{:?}", node.state());
}
