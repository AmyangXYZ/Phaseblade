import "./Card.css";

function Card({
  title,
  subtitle,
  icon,
  body,
  footer,
  width,
  outlineColor,
  style,
}: {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  body: React.ReactNode;
  footer?: string;
  width?: string;
  outlineColor?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="card-outline"
      style={{ width, borderColor: outlineColor, ...style }}
    >
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
        {title && body ? (
          <div className="card-body">{body}</div>
        ) : (
          <div className="card-body-compact">{body}</div>
        )}
        {title && footer && (
          <>
            <div className="card-footer-divider" />
            <div className="card-footer">{footer}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default Card;
