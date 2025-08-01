import { useState } from "react";
import { ACCESS_TOKEN,REFRESH_TOKEN } from "../constants";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const navigate=useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [loading,setLoading]=useState(false)

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try{
        const res=await api.post("/api/register/",{
            email,
            first_name:firstName,
            last_name:lastName,
            username:username,
            password,
            confirm_password,

        });
        if(res.status===201||res.status===200){
            alert("Registered Successfully!");
            navigate('/login');
        }
    }catch(error){
         alert(
        error?.response?.data?.detail ||
          JSON.stringify(error?.response?.data) ||
          "Registration failed"
      );
    }finally{
        setLoading(false)
    }
  };

  return (
    <div>
      <h2 className="register-heading">PromptIQ</h2>
      <form onSubmit={handleRegister} className="register">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Username(optional)"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm_password}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button>Register</button>
        <p>Already have an account? <Link to='/login' className="login-link">Login</Link></p>
      </form>
    </div>
  );
}
