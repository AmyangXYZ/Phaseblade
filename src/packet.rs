mod mac_header;
mod net_header;

use crate::packet::mac_header::MacHeader;
use crate::packet::net_header::NetHeader;

pub struct Packet {
    pub mac_header: MacHeader,
    pub net_header: NetHeader,
    pub app_payload: [u8; 1024],
}
