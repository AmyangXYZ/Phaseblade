import {
  Box,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Tooltip,
} from "@mui/material";
import { UnitTypes } from "./index.d.tsx";
import { NavigateNext } from "@mui/icons-material";
import { NodeConfig, TaskConfig } from "phaseblade";

function Header({
  step,
  addNode,
}: {
  step: () => void;
  addNode: (node: NodeConfig) => void;
}) {
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
                  addNode(
                    new NodeConfig(
                      Math.floor(Math.random() * 1000),
                      "c2",
                      new Float64Array([
                        Math.random() * 40 - 20,
                        0.5,
                        Math.random() * 40 - 20,
                      ]),
                      100000000n,
                      10n,
                      0n,
                      1,
                      [
                        new TaskConfig(0, "Sensing", 0),
                        new TaskConfig(1, "TSCH MAC", 0),
                      ]
                    )
                  )
                }
              />
            ))}
          </SpeedDial>
        </Box>
      </div>
    </div>
  );
}

export default Header;
