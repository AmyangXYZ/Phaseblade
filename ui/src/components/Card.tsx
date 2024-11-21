import "./Card.css"

function Card({
  title,
  subtitle,
  icon,
  body,
  footer,
  width,
  outlineColor,
}: {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  body: React.ReactNode
  footer?: string
  width?: string
  outlineColor?: string
}) {
  return (
    <div className="card-outline" style={{ width, borderColor: outlineColor }}>
      <div className="card">
        {title && (
          <>
            <div className="card-header">
              {icon && <div className="hex-container">{icon}</div>}
              <div className="card-titles">
                {title && <div className="card-title">{title}</div>}
                {subtitle && <div className="card-subtitle">{subtitle}</div>}
              </div>
            </div>
            <div className="card-header-divider" />
          </>
        )}
        <div className="card-body">{body}</div>
        {footer && (
          <>
            <div className="card-footer-divider" />
            <div className="card-footer">{footer}</div>
          </>
        )}
      </div>
    </div>
  )
}

export default Card
