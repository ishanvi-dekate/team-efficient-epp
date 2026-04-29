// import './Button.css';
function Button({text,page}) {
  return (
    <button onClick = {()=> {setPage(page)}}>
      {text}
    </button>
  );
}

export default Button;