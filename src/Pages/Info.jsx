import useState from 'react'

function Info() {
  const[username, setUsername] = useState('');
  const[answer1, setAnswer1] = useState('');
  const[answer2, setAnswer2]= useState('');
  const[answer3, setAnswer3] = useState('');
  const[answer4, setAnswer4] = useState('');
  const[answer5, setAnswer5] = useState('');
  const [answer6,setAnswer6] = useState('');
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!answer1.trim() || !answer2.trim()||!answer3.trim()||!answer4.trim()||answer5.trim()) {
      setError("Please fill in all of the blanks.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    // TODO: actually authenticate with Firebase here
    setPage("Home");
  };
  return (
    <main className = "info-page">
      <section className = "info-card"> 
        <h2> Enter your information!</h2>
        <h2> Your information will help give you accurate data about yourself  </h2>
        <form className='set-username'>
          <label> Username: 
          <input
            type = "username"
            value = {username}
            onChange = {(event) => setUsername(event.target.value)}
            placeholder='Enter your username'
          />
          </label>
          <button 
            type = "button"
            className='set-username-btn'
            onClick={()=> setVisible(!isVisible)}
          >
            Set Username
          </button>
        </form> 
        <form> </form>
      </section> 
    </main>
  ); 
}
export default Info