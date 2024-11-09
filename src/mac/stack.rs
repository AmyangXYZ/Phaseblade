use crate::constants::*;
use crate::mac::MacPacket;
use crate::net::NetPacket;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{Receiver, Sender};
use std::sync::Arc;
use std::thread;

pub struct MacStack {
    id: u16,
    eui64: u64,
    to_net_sender: Sender<NetPacket>,
    from_net_receiver: Receiver<NetPacket>,
    to_phy_sender: Sender<MacPacket>,
    from_phy_receiver: Receiver<MacPacket>,
    is_running: Arc<AtomicBool>,
}

impl MacStack {
    pub fn new(
        id: u16,
        eui64: u64,
        to_net_sender: Sender<NetPacket>,
        from_net_receiver: Receiver<NetPacket>,
        to_phy_sender: Sender<MacPacket>,
        from_phy_receiver: Receiver<MacPacket>,
        is_running: Arc<AtomicBool>,
    ) -> Self {
        Self {
            id,
            eui64,
            to_net_sender,
            from_net_receiver,
            to_phy_sender,
            from_phy_receiver,
            is_running,
        }
    }

    pub fn run(self) {
        let id = self.id;
        let eui64 = self.eui64;

        let to_net_sender = self.to_net_sender;
        let from_net_receiver = self.from_net_receiver;
        let to_phy_sender = self.to_phy_sender;
        let from_phy_receiver = self.from_phy_receiver;
        let is_running_phy_handler = Arc::clone(&self.is_running);
        let is_running_net_handler = Arc::clone(&self.is_running);

        let net_handler = thread::spawn(move || {
            while is_running_net_handler.load(Ordering::Relaxed) {
                match from_net_receiver.recv_timeout(STACK_THREAD_CHECK_INTERVAL) {
                    Ok(net_packet) => {
                        let mac_packet =
                            MacPacket::new(eui64, net_packet.dst_addr as u64, 0, 0, net_packet);

                        if let Err(e) = to_phy_sender.send(mac_packet) {
                            println!("[{}-{:016X} MAC] failed to send to phy: {}", id, eui64, e);
                        }
                    }
                    _ => {}
                }
            }
        });

        let phy_handler = thread::spawn(move || {
            while is_running_phy_handler.load(Ordering::Relaxed) {
                match from_phy_receiver.recv_timeout(STACK_THREAD_CHECK_INTERVAL) {
                    Ok(mac_packet) => {
                        if let Err(e) = to_net_sender.send(mac_packet.into_net()) {
                            println!("[{}-{:016X} MAC] failed to send to net: {}", id, eui64, e);
                        }
                    }
                    _ => {}
                }
            }
        });

        net_handler.join().unwrap();
        phy_handler.join().unwrap();
    }
}
