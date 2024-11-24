import Card from "./components/Card"

function Header() {
  return (
    <div className="header glow">
      <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
        <span className="glow">PHASEBLADE</span>
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <Card body={`Nodes: 20`} outlineColor="#858585" />
        <Card body={`Cycles: 100`} outlineColor="#858585" />
      </div>
    </div>
  )
}

export default Header
