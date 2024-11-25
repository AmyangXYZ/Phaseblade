import { NotificationsNone } from "@mui/icons-material"
import { IconButton, Tooltip } from "@mui/material"

export default function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-bar-item">Cycle: 100</div>
        <Tooltip
          title={
            <div className="tooltip-content">
              <h3>Nodes</h3>
              {/* Add any other components or styling */}
            </div>
          }
          arrow
          enterDelay={0}
        >
          <div className="status-bar-item">Nodes: 20</div>
        </Tooltip>
      </div>
      <div className="status-bar-right">
        <IconButton>
          <NotificationsNone />
        </IconButton>
      </div>
    </div>
  )
}
