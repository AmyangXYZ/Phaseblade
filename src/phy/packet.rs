use crate::mac::MacPacket;

pub struct PhyFrame {
    pub payload: MacPacket,
    pub signal_strength: i32,
    pub snr: f32,
    pub modulation: ModulationType,
}

pub enum ModulationType {
    BPSK,
    QPSK,
    QAM16,
    QAM64,
}

impl PhyFrame {
    pub fn new(mac_packet: MacPacket) -> Self {
        Self {
            payload: mac_packet,
            signal_strength: 0,
            snr: 0.0,
            modulation: ModulationType::BPSK,
        }
    }

    pub fn into_mac(self) -> MacPacket {
        self.payload
    }
}
