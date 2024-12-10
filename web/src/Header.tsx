import { Box, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from "@mui/material"
import { NodeMeta, UnitTypes } from "./index.d.tsx"
import { NavigateNext } from "@mui/icons-material"

function Header({ step, addNode }: { step: () => void; addNode: (node: NodeMeta) => void }) {
  return (
    <div className="header">
      <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
        <span className="glow">PHASEBLADE</span>
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <Tooltip title="Step">
          <Fab
            color="secondary"
            aria-label="edit"
            onClick={step}
            size="small"
            sx={{ margin: "auto", width: 32, height: 32, minHeight: "unset" }}
          >
            <NavigateNext />
          </Fab>
        </Tooltip>

        <Box sx={{ height: 32, margin: "auto", flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="SpeedDial"
            direction="down"
            sx={{
              "& .MuiFab-root": {
                margin: "auto",
                width: 32,
                height: 32,

                minHeight: "unset",
              },
            }}
            icon={
              <SpeedDialIcon
                sx={{
                  width: 24,
                  height: 24,
                }}
              />
            }
          >
            {Object.values(UnitTypes).map((unit) => (
              <SpeedDialAction
                key={unit.label}
                icon={unit.speeddial_icon}
                tooltipTitle={unit.label}
                onClick={() =>
                  addNode({
                    id: Math.floor(Math.random() * 1000),
                    unit_type: unit.type,
                    protocol: "TSCH",
                    position: [Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20],
                    cycle_per_tick: 10n,
                    cycle_offset: 0n,
                    micros_per_tick: 10n,
                  } as NodeMeta)
                }
              />
            ))}
          </SpeedDial>
        </Box>
      </div>
    </div>
  )
}

export default Header
