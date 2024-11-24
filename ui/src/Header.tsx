import Card from "./components/Card"

function Header() {
  return (
    <div className="header">
      <a href="https://github.com/AmyangXYZ/Phaseblade" target="_blank">
        <span className="glow">PHASEBLADE</span>
      </a>

      <div style={{ display: "flex", gap: "10px" }}>
        <Card body={`Protocol: TSCH`} outlineColor="#858585" />
      </div>
    </div>
  )
}

export default Header
