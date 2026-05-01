import {useState} from 'react'
import './Account.css'
function Account(){
    const [email, setEmail] = useState('')
    const[password,setPassword] = useState('')
    const handleSubmit = (event) => {
        event.preventDefault();
    
        if (!email.trim() || !password.trim()) {
          setError("Please enter both email and password.");
          return;
        }
    
        if (!email.includes("@")) {
          setError("Please enter a valid email address.");
          return;
        }
    
        setError("");
        // TODO: actually authenticate with Firebase here
        setPage("Info");
      };
    return (
      <>
        <div className = "account-sign-up">
            <h2>Sign Up</h2>
            <p>Sign up with your email and password</p>
            <form onSubmit={handleSubmit}>
            <label> Email: </label>
            <input className='email-input'
                type= "text"
                value = {email}
                onChange={(event) => setEmail(event.target.value)}
            />
            <label> Password: </label>
            <input className='password-input'
                type = "text"
                value = {password}
                onChange = {(event)=> setPassword(event.target.value)}
            />
            <button type = 'submit' className='set account'> Sign up </button>
            </form>
            

        </div>
        </>
    )
}
export default Account;