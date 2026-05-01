import './Button.css';

function Button({ text, onClick, className = '' }) {
  return (
    <button
      className={`app-button ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;