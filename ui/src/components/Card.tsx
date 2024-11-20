import "./Card.css"

function Card({ header, body, footer }: { header: string; body: string; footer: string }) {
  return (
    <div className="card-outline">
      <div className="card">
        <div className="card-header">{header}</div>
        <div className="card-header-divider"></div>
        <div className="card-body">{body}</div>
        <div className="card-footer-divider"></div>
        <div className="card-footer">{footer}</div>
      </div>
    </div>
  )
}

export default Card
