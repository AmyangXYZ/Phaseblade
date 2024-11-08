use crate::net::NetPacket;
use rand::Rng;

pub struct MacPacket {
    pub uid: u64,
    pub src_eui64: u64,
    pub dst_eui64: u64,
    pub timestamp: u64,
    pub channel: u8,
    pub payload: NetPacket,
}

impl MacPacket {
    pub fn new(
        src_eui64: u64,
        dst_eui64: u64,
        timestamp: u64,
        channel: u8,
        payload: NetPacket,
    ) -> Self {
        Self {
            uid: rand::thread_rng().gen(),
            src_eui64,
            dst_eui64,
            timestamp,
            channel,
            payload,
        }
    }

    pub fn into_net(self) -> NetPacket {
        self.payload
    }
}
