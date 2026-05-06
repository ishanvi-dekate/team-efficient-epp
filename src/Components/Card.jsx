import './Card.css';

function Card({ children, title, className = '', accent = false }) {
  return (
    <div className={`card ${accent ? 'card-accent' : ''} ${className}`}>
      <div className="card-shimmer" aria-hidden="true" />
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}

export default Card;
