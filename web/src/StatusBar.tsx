import { NotificationsNone } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import SwordIcon from "./assets/icons/sword.svg";

export default function StatusBar({
  cycle,
  numNodes,
}: {
  cycle: bigint;
  numNodes: number;
}) {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-bar-item">
          <img
            src={SwordIcon}
            alt="Sword"
            height={16}
            style={{ marginTop: 6 }}
          />
        </div>
        <div className="status-bar-item">Protocol: TSCH</div>

        <div className="status-bar-item">Cycle: {cycle?.toString()}</div>
        <Tooltip
          title={
            <div className="tooltip-content">
              <h3>Nodes</h3>
            </div>
          }
          arrow
          enterDelay={0}
        >
          <div className="status-bar-item">Nodes: {numNodes}</div>
        </Tooltip>
      </div>
      <div className="status-bar-right">
        <IconButton>
          <NotificationsNone />
        </IconButton>
      </div>
    </div>
  );
}
