import { NotificationsNone } from "@mui/icons-material"
import { IconButton } from "@mui/material"

export default function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <div className="status-bar-item">Cycle: 100</div>
        <div className="status-bar-item">Nodes: 20</div>
      </div>
      <div className="status-bar-right">
        <IconButton>
          <NotificationsNone />
        </IconButton>
      </div>
    </div>
  )
}
