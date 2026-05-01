import useState from 'react'
const[username, setUsername] = useState('');
const[answer1, setAnswer1] = useState('');
const[answer2, setAnswer2]= useState('');
const[answer3, setAnswer3] = useState('');
const[answer4, setAnswer4] = useState('');
const[answer5, setAnswer5] = useState('');
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
    setPage("Home");
  };
class Info {
    

}