import './Button.css';

function Button({className }) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;