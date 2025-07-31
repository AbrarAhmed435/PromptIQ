import { useState } from "react"

export default function Register(){
    const [firstName,setFirstName]=useState("");
    const [lastName,setLastName]=useState("");
    const [email,setEmail]=useState("");
    const [username,setUserName]=useState("");
    const [password,setPassword]=useState("");
    const [confirm_password,setConfirmPassword]=useState("");

    const handleRegister=()=>{

    }

    return (
        <div>
            <h2 className="register-heading">Register Yourself</h2>
        <form onSubmit={handleRegister} className="register">
            <input type="text" 
            placeholder="First Name"
            value={firstName}
            onChange={(e)=>setFirstName(e.target.value)}
            />
            <input type="text" 
            placeholder="Last Name"
            value={lastName}
            onChange={(e)=>setLastName(e.target.value)}
            />
            <input type="text" 
            placeholder="Username(optional)"
            value={username}
            onChange={(e)=>setUserName(e.target.value)}
            />
            <input type="email" 
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
            <input type="password" 
            placeholder="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            />
            <input type="password" 
            placeholder="Confirm Password"
            value={confirm_password}
            onChange={(e)=>setConfirmPassword(e.target.value)}
            />
          <button>Register</button>
          <p>Already have an account? Login</p>
        </form>
        </div>
    )
}