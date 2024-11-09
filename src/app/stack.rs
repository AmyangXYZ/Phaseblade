use crate::app::AppPacket;
use crate::constants::*;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::{Receiver, Sender};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub struct AppStack {
    id: u16,
    eui64: u64,
    to_net_sender: Sender<AppPacket>,
    from_net_receiver: Receiver<AppPacket>,
    is_running: Arc<AtomicBool>,
}

impl AppStack {
    pub fn new(
        id: u16,
        eui64: u64,
        to_net_sender: Sender<AppPacket>,
        from_net_receiver: Receiver<AppPacket>,
        is_running: Arc<AtomicBool>,
    ) -> Self {
        Self {
            id,
            eui64,
            to_net_sender,
            from_net_receiver,
            is_running,
        }
    }

    pub fn run(self) {
        let id = self.id;
        let eui64 = self.eui64;

        let from_net_receiver = self.from_net_receiver;
        let to_net_sender = self.to_net_sender;
        let is_running_net_handler = Arc::clone(&self.is_running);
        let is_running_app_handler = Arc::clone(&self.is_running);

        let net_handler = thread::spawn(move || {
            while is_running_net_handler.load(Ordering::Relaxed) {
                match from_net_receiver.recv_timeout(STACK_THREAD_CHECK_INTERVAL) {
                    Ok(app_packet) => {
                        println!(
                            "[{}-{:016X} APP] received: {:?}",
                            id, eui64, app_packet.data
                        );
                    }
                    _ => {}
                }
            }
        });

        let app_handler = thread::spawn(move || {
            while is_running_app_handler.load(Ordering::Relaxed) {
                if id != 2 {
                    let app_packet = AppPacket::new(id, 2, "hello".as_bytes().try_into().unwrap());
                    println!("[{}-{:016X} APP] sending: {:?}", id, eui64, app_packet.data);
                    if let Err(e) = to_net_sender.send(app_packet) {
                        println!("[{}-{:016X} APP] failed to send to net: {}", id, eui64, e);
                    }
                    thread::sleep(Duration::from_secs(1));
                }
            }
        });

        net_handler.join().unwrap();
        app_handler.join().unwrap();
    }
}
