use crate::app::{AppPacket, AppProtocol};
use crate::mac::{MacPacket, MacProtocol};
use crate::net::{NetPacket, NetProtocol};
use crate::phy::{PhyFrame, PhyProtocol};
use std::sync::mpsc::channel;
use std::thread;
pub struct Node {
    pub id: u16,
    pub eui64: u64,
}

impl Node {
    pub fn new(id: u16, eui64: u64) -> Self {
        Self { id, eui64 }
    }
    pub fn run(&self) {
        let (app_to_net_sender, app_to_net_receiver) = channel::<AppPacket>();
        let (net_to_app_sender, net_to_app_receiver) = channel::<AppPacket>();

        let (net_to_mac_sender, net_to_mac_receiver) = channel::<NetPacket>();
        let (mac_to_net_sender, mac_to_net_receiver) = channel::<NetPacket>();

        let (mac_to_phy_sender, mac_to_phy_receiver) = channel::<MacPacket>();
        let (phy_to_mac_sender, phy_to_mac_receiver) = channel::<MacPacket>();

        let (phy_to_orchestrator_sender, phy_to_orchestrator_receiver) = channel::<PhyFrame>();
        let (orchestrator_to_phy_sender, orchestrator_to_phy_receiver) = channel::<PhyFrame>();

        let app_protocol = AppProtocol::new(self.id, app_to_net_sender, net_to_app_receiver);
        let net_protocol = NetProtocol::new(
            net_to_app_sender,
            app_to_net_receiver,
            net_to_mac_sender,
            mac_to_net_receiver,
        );
        let mac_protocol = MacProtocol::new(
            self.eui64,
            mac_to_net_sender,
            net_to_mac_receiver,
            mac_to_phy_sender,
            phy_to_mac_receiver,
        );
        let phy_protocol = PhyProtocol::new(
            phy_to_mac_sender,
            mac_to_phy_receiver,
            phy_to_orchestrator_sender,
            orchestrator_to_phy_receiver,
        );

        thread::spawn(move || app_protocol.run());
        thread::spawn(move || net_protocol.run());
        thread::spawn(move || mac_protocol.run());
        thread::spawn(move || phy_protocol.run());
    }
}
