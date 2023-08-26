import React, {useState} from "react";
import {useNavigate} from "react-router-dom"


const Login = (props) => {
  

  const [credentials, setCredentials] = useState({email: "", password: ""});
  const host = "http://localhost:5000";  
  let history = useNavigate();
  const {showAlert} = props
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch(`${host}/api/auth/login`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email: credentials.email, password: credentials.password}), 
      });
      
      const json = await response.json()
      console.log(json)
      if(json.success){
        // Save the Auth token and redirect
        localStorage.setItem('token', json.authToken)
        showAlert("Logged in successfully", "success")
        history('/')
      }
      else{
        showAlert("Invalid credentials", "danger")
      }
  }

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };


  return (
    <div>
      <h2>Login to continue to iKeep</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control my-2"
            id="email "
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
        
        <button type="submit" className="btn btn-primary my-2" >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
