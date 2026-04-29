import './Button.css';
function Button({text,page}) {
  return (
    <button className='button' onClick = {()=> {setPage(page)}}>
      {text}
    </button>
  );
}

export default Button;