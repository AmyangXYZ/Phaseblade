use crate::mac::MacPacket;
use crate::net::NetPacket;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;

pub struct MacProtocol {
    pub eui64: u64,
    to_net_sender: Sender<NetPacket>,
    from_net_receiver: Receiver<NetPacket>,
    to_phy_sender: Sender<MacPacket>,
    from_phy_receiver: Receiver<MacPacket>,
}

impl MacProtocol {
    pub fn new(
        eui64: u64,
        to_net_sender: Sender<NetPacket>,
        from_net_receiver: Receiver<NetPacket>,
        to_phy_sender: Sender<MacPacket>,
        from_phy_receiver: Receiver<MacPacket>,
    ) -> Self {
        Self {
            eui64,
            to_net_sender,
            from_net_receiver,
            to_phy_sender,
            from_phy_receiver,
        }
    }

    pub fn run(self) {
        let eui64 = self.eui64;
        let to_net_sender = self.to_net_sender;
        let from_net_receiver = self.from_net_receiver;
        let to_phy_sender = self.to_phy_sender;
        let from_phy_receiver = self.from_phy_receiver;

        let net_handler = thread::spawn(move || loop {
            let net_packet = from_net_receiver.recv().unwrap();

            let mac_packet = MacPacket::new(eui64, net_packet.dst_id as u64, 0, 0, net_packet);
            to_phy_sender.send(mac_packet).unwrap();
        });

        let phy_handler = thread::spawn(move || loop {
            let mac_packet = from_phy_receiver.recv().unwrap();

            to_net_sender.send(mac_packet.into_net()).unwrap();
        });

        net_handler.join().unwrap();
        phy_handler.join().unwrap();
    }
}
