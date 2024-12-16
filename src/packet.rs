use std::any::Any;
pub trait Packet: Any {
    fn uid(&self) -> u64;
    fn src(&self) -> u16;
    fn dst(&self) -> u16;
    fn size(&self) -> u64;
    fn as_any(&self) -> &dyn Any;
}
