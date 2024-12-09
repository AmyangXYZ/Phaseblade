import Card from "./components/Card"
import { Box, Button, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon, Tooltip } from "@mui/material"
import { UnitTypes } from "./units"
import { NavigateNext } from "@mui/icons-material"
function Header({
  step,
  addNode,
}: {
  step: () => void
  addNode: (
    id: number,
    unit_type: string,
    protocol: string,
    cycle_per_tick: bigint,
    cycle_offset: bigint,
    range: bigint
  ) => void
}) {
  return (
    <div className="header">
      <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
        <span className="glow">PHASEBLADE</span>
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <Card body={`Protocol: TSCH`} outlineColor="#858585" />
        <Tooltip title="Step">
          <Button
            onClick={step}
            variant="contained"
            size="small"
            sx={{
              width: 48,
              height: 36,
              margin: "auto",
              minWidth: "unset",
            }}
          >
            <NavigateNext />
          </Button>
        </Tooltip>

        <Box sx={{ height: 36, margin: "auto", flexGrow: 1 }}>
          <SpeedDial
            ariaLabel="SpeedDial"
            direction="down"
            sx={{
              "& .MuiFab-root": {
                margin: "auto",
                width: 36,
                height: 36,
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
                onClick={() => addNode(Math.floor(Math.random() * 1000), unit.type, "TSCH", 10n, 0n, 10n)}
              />
            ))}
          </SpeedDial>
        </Box>
      </div>
    </div>
  )
}

export default Header
