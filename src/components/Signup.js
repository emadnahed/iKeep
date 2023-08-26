import React, {useState} from "react";
import {useNavigate} from "react-router-dom"

const Signup = (props) => {
  
  const [credentials, setCredentials] = useState({name: "", email: "", password: "", cpassword: ""});
  const host = "http://localhost:5000";
  let history = useNavigate();
  const {showAlert} = props
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/auth/createuser`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({name: credentials.name, email: credentials.email, password: credentials.password}), 
      });
      
      const json = await response.json()
      console.log(json)
      
      // Save the Auth token and redirect
      localStorage.setItem('token', json.authtoken)
      showAlert("Signed up successfully", "success")
      history('/login')           
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  return (
    <div className="container">
      <h2>Sign up for the iKeep App</h2>
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="name">Enter your name</label>
          <input
            type="name"
            className="form-control my-2"
            id="name"
            aria-describedby="emailHelp"
            placeholder="Enter your name"
            name="name"
            value={credentials.name}
            onChange={onChange}
          />          
        </div>
        
        
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control my-2"
            id="email"
            aria-describedby="emailHelp"
            placeholder="Enter email"
            name="email"
            value={credentials.email}
            onChange={onChange}
          />
          
        </div>
        <div className="form-group my-2">
          <label htmlFor="password">Password</label>
          <input
            value={credentials.password}
            type="password"
            onChange={onChange}
            name="password"
            className="form-control"
            id="password"
            placeholder="Password"
          />
        </div>


        <div className="form-group my-2">
          <label htmlFor="password">Confirm Password</label>
          <input
            value={credentials.cpassword}
            type="password"
            onChange={onChange}
            name="cpassword"
            className="form-control"
            id="cpassword"
            placeholder="Password"
          />
        </div>

        
        <button  disabled={credentials.password!==credentials.cpassword | credentials.password.length<4 | credentials.email.length==0} 
        type="submit"
        className="btn btn-primary my-2">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;