import TruckIcon from "./assets/icons/truck-fast.svg";
import DroneIcon from "./assets/icons/drone.svg";
import DatabaseIcon from "./assets/icons/database.svg";
import ChessRookIcon from "./assets/icons/chess-rook.svg";
import IndustryIcon from "./assets/icons/industry-windows.svg";
import StarIcon from "./assets/icons/star.svg";
import GasPumpIcon from "./assets/icons/gas-pump.svg";
import BoxesIcon from "./assets/icons/boxes-stacked.svg";

export interface Unit {
  type: string;
  label: string;
  icon: string;
  isStatic: boolean;
  speeddial_icon: React.ReactNode;
}

export const UnitTypes: Record<string, Unit> = {
  vehicle: {
    label: "Vehicle",
    icon: TruckIcon,
    type: "vehicle",
    isStatic: false,
    speeddial_icon: <img src={TruckIcon} className="speeddial-icon" />,
  },
  drone: {
    label: "Drone",
    icon: DroneIcon,
    type: "drone",
    isStatic: false,
    speeddial_icon: <img src={DroneIcon} className="speeddial-icon" />,
  },
  dataHub: {
    label: "Data Hub",
    icon: DatabaseIcon,
    type: "dataHub",
    isStatic: true,
    speeddial_icon: <img src={DatabaseIcon} className="speeddial-icon" />,
  },
  c2: {
    label: "Command & Control",
    icon: ChessRookIcon,
    type: "c2",
    isStatic: true,
    speeddial_icon: <img src={ChessRookIcon} className="speeddial-icon" />,
  },
  depot: {
    label: "Supply Depot",
    icon: IndustryIcon,
    type: "depot",
    isStatic: true,
    speeddial_icon: <img src={IndustryIcon} className="speeddial-icon" />,
  },
  outpost: {
    label: "Outpost",
    icon: StarIcon,
    type: "outpost",
    isStatic: true,
    speeddial_icon: <img src={StarIcon} className="speeddial-icon" />,
  },
  fuelStation: {
    label: "Fuel Station",
    icon: GasPumpIcon,
    type: "fuelStation",
    isStatic: true,
    speeddial_icon: <img src={GasPumpIcon} className="speeddial-icon" />,
  },
  cargo: {
    label: "Cargo",
    icon: BoxesIcon,
    type: "cargo",
    isStatic: true,
    speeddial_icon: <img src={BoxesIcon} className="speeddial-icon" />,
  },
};
