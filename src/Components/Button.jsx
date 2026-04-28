import './Button.css';
import useState from 'react'
const [page,setPage] = useState(<></>)
function Button({text,setPage }) {
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