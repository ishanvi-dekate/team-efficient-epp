import {useState} from 'react'
function Account(){
    const [email, setEmail] = useState('')
    const[password,setPassword] = useState('')
    return (
        <div>
            <h2>Sign Up</h2>
            <p>Sign up with your email and password</p>
            <label> Email: </label>
            <input 
                type= "text"
                value = {email}
            />
            <label> Password: </label>
            <input
                type = "text"
                value = {password}
            />

        </div>
    )
}
export default Account;