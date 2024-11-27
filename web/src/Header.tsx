import Button from "@mui/material/Button"
import Card from "./components/Card"

function Header({
  step,
  addNode,
}: {
  step: () => void
  addNode: (id: number, type: string, cycle_per_tick: bigint, cycle_offset: bigint, range: bigint) => void
}) {
  return (
    <div className="header">
      <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
        <span className="glow">PHASEBLADE</span>
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <Card body={`Protocol: TSCH`} outlineColor="#858585" />
        <Button variant="contained" onClick={step}>
          Step
        </Button>
        <Button variant="contained" onClick={() => addNode(0, "TSCH", 10n, 0n, 10n)}>
          Add TSCH Node
        </Button>
      </div>
    </div>
  )
}

export default Header
