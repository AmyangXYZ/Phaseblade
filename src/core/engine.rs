use crate::core::{Node, Packet};
use std::time::Instant;
/// Manages network simulation by executing nodes and propagating packets between them
pub struct Engine {
    nodes: Vec<Box<dyn Node>>,
    cycle: u64, // CPU cycle counter, e.g., a cycle represents 10ns @ 100MHz CPU frequency
    propagation_delay: u64,
    transmission_rate: u64,
    in_transit_packets: Vec<Box<dyn Packet>>,
}

impl Engine {
    pub fn new(propagation_delay: u64, transmission_rate: u64) -> Self {
        Self {
            nodes: Vec::new(),
            cycle: 0,
            in_transit_packets: Vec::new(),
            propagation_delay,
            transmission_rate,
        }
    }

    pub fn get_cycle(&self) -> u64 {
        self.cycle
    }

    pub fn add_node(&mut self, node: Box<dyn Node>) {
        self.nodes.push(node);
    }

    pub fn run(&mut self, total_cycles: u64) {
        let start = Instant::now();
        while self.cycle < total_cycles {
            println!("Cycle {}", self.cycle);
            // split the in_transit packets
            if !self.in_transit_packets.is_empty() {
                let (in_transit, delivering): (Vec<_>, Vec<_>) = self
                    .in_transit_packets
                    .drain(..)
                    .partition(|p| p.get_arrival_time() != self.cycle);

                // Keep the in_transit packets
                self.in_transit_packets = in_transit;

                // Deliver packets
                for packet in delivering {
                    if let Some(node) = self.nodes.get_mut(packet.get_dst() as usize) {
                        node.accept_packet(packet);
                    }
                }
            }

            // Execute nodes and collect new packets
            for node in self.nodes.iter_mut() {
                node.execute(self.cycle);
                let mut packets = node.collect_packets();
                if !packets.is_empty() {
                    for packet in packets.iter_mut() {
                        let transmission_time = packet.get_size() / self.transmission_rate;
                        packet.set_arrival_time(
                            self.cycle + self.propagation_delay + transmission_time,
                        );
                    }
                    self.in_transit_packets.extend(packets);
                }
            }
            self.cycle += 1;
        }

        println!("Simulated {} cycles in {:?}", self.cycle, start.elapsed());
    }
}
