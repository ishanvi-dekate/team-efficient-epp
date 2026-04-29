import Login from "../Components/Login.jsx";
import Button from "../Components/Button.jsx"
import "./LoginPage.css"
import useState from 'react'
function LoginPage() {
    return(
<>
 <div className= "LoginPage"> 
    <h2 className = "app-title"> efficient.epp </h2>
    <h2 className = "app-subtitle"> eXplore YoUr HaBiTs</h2>
    <h4 className = "app-message">Get in charge of your assignments, activities and sleep!</h4>
 </div>
 <button onClick = {() => {setPage("/Login")}} > Hop on through Google! </button>
</>);
}
export default LoginPage