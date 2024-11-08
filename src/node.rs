use crate::app::{AppPacket, AppStack};
use crate::mac::{MacPacket, MacStack};
use crate::net::{NetPacket, NetStack};
use crate::orchestrator::NodeHandle;
use crate::phy::{PhyFrame, PhyStack};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::thread;
pub struct Node {
    pub id: u16,
    pub eui64: u64,
    to_orchestrator_sender: Sender<PhyFrame>,
    from_orchestrator_receiver: Receiver<PhyFrame>,
}

impl Node {
    pub fn new(id: u16, eui64: u64) -> (Self, NodeHandle) {
        let (phy_to_orchestrator_sender, phy_to_orchestrator_receiver) = channel::<PhyFrame>();
        let (orchestrator_to_phy_sender, orchestrator_to_phy_receiver) = channel::<PhyFrame>();
        let node = Self {
            id,
            eui64,
            to_orchestrator_sender: phy_to_orchestrator_sender,
            from_orchestrator_receiver: orchestrator_to_phy_receiver,
        };

        (
            node,
            NodeHandle {
                to_node_sender: orchestrator_to_phy_sender,
                from_node_receiver: phy_to_orchestrator_receiver,
            },
        )
    }

    pub fn run(self) {
        let (app_to_net_sender, app_to_net_receiver) = channel::<AppPacket>();
        let (net_to_app_sender, net_to_app_receiver) = channel::<AppPacket>();

        let (net_to_mac_sender, net_to_mac_receiver) = channel::<NetPacket>();
        let (mac_to_net_sender, mac_to_net_receiver) = channel::<NetPacket>();

        let (mac_to_phy_sender, mac_to_phy_receiver) = channel::<MacPacket>();
        let (phy_to_mac_sender, phy_to_mac_receiver) = channel::<MacPacket>();

        let phy_to_orchestrator_sender = self.to_orchestrator_sender;
        let orchestrator_to_phy_receiver = self.from_orchestrator_receiver;

        let app_stack = AppStack::new(self.id, self.eui64, app_to_net_sender, net_to_app_receiver);
        let net_stack = NetStack::new(
            self.id,
            self.eui64,
            net_to_app_sender,
            app_to_net_receiver,
            net_to_mac_sender,
            mac_to_net_receiver,
        );
        let mac_stack = MacStack::new(
            self.id,
            self.eui64,
            mac_to_net_sender,
            net_to_mac_receiver,
            mac_to_phy_sender,
            phy_to_mac_receiver,
        );
        let phy_stack = PhyStack::new(
            self.id,
            self.eui64,
            phy_to_mac_sender,
            mac_to_phy_receiver,
            phy_to_orchestrator_sender,
            orchestrator_to_phy_receiver,
        );

        thread::spawn(move || app_stack.run());
        thread::spawn(move || net_stack.run());
        thread::spawn(move || mac_stack.run());
        thread::spawn(move || phy_stack.run());
    }
}
