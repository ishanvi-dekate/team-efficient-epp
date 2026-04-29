import Login from "../Components/Login.jsx";
import Button from "../Components/Button.jsx"
import "./LoginPage.css"
function LoginPage() {
    return(
<>
 <div className= "LoginPage"> 
    <h2 className = "app-title"> efficient.epp </h2>
    <h2 className = "app-subtitle"> eXplore YoUr HaBiTs</h2>
    <h4 className = "app-message">Get in charge of your assignments, activities and sleep!</h4>
    <Button text = "Hop on through Google" page = {Login} />
 </div>
</>
    );
}
export default LoginPage