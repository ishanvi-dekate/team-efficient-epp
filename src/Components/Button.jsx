// import './Button.css';
function Button({text, onClick, className = ''}) {
  return (
    <button className='button' onClick = {()=> {setPage(page)}}>
      {text}
    </button>
  );
}

export default Button;