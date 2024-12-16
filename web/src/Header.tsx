import { Box, Fab, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from "@mui/material"
import { NodeConfigJS, UnitTypes } from "./index.d.tsx"
import { NavigateNext } from "@mui/icons-material"

function Header({ step, addNode }: { step: () => void; addNode: (node: NodeConfigJS) => void }) {
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
                    position: new Float64Array([Math.random() * 40 - 20, 0.5, Math.random() * 40 - 20]),
                    cpu_freq_hz: 100000000n,
                    tick_interval: 10n,
                    cycle_offset: 0n,
                    clock_drift_factor: 1,
                    tasks: [
                      {
                        id: 0,
                        name: "Sensing",
                        priority: 0,
                      },
                      {
                        id: 1,
                        name: "TSCH MAC",
                        priority: 0,
                      },
                    ],
                  } as NodeConfigJS)
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
