import TruckIcon from "./assets/icons/truck-fast.svg"
import DroneIcon from "./assets/icons/drone.svg"
import DatabaseIcon from "./assets/icons/database.svg"
import ChessRookIcon from "./assets/icons/chess-rook.svg"
import IndustryIcon from "./assets/icons/industry-windows.svg"
import StarIcon from "./assets/icons/star.svg"
import GasPumpIcon from "./assets/icons/gas-pump.svg"
import BoxesIcon from "./assets/icons/boxes-stacked.svg"

export interface Unit {
  type: string
  label: string
  icon: string
  isStatic: boolean
}

export const UnitTypes: Record<string, Unit> = {
  vehicle: { label: "Vehicle", icon: TruckIcon, type: "vehicle", isStatic: false },
  drone: { label: "Drone", icon: DroneIcon, type: "drone", isStatic: false },
  dataHub: { label: "Data Hub", icon: DatabaseIcon, type: "dataHub", isStatic: true },
  c2: { label: "Command & Control", icon: ChessRookIcon, type: "c2", isStatic: true },
  depot: { label: "Supply Depot", icon: IndustryIcon, type: "depot", isStatic: true },
  outpost: { label: "Outpost", icon: StarIcon, type: "outpost", isStatic: true },
  fuelStation: { label: "Fuel Station", icon: GasPumpIcon, type: "fuelStation", isStatic: true },
  cargo: { label: "Cargo", icon: BoxesIcon, type: "cargo", isStatic: true },
}
