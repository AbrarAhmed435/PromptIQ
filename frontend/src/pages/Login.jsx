import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../api";

import { ACCESS_TOKEN,REFRESH_TOKEN } from "../constants";

export default function Login(){
    const navigate=useNavigate();
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
    const [loading,setLoading]=useState(false)
    const handleSubmit= async (e)=>{
        e.preventDefault();
        setLoading(true);
        try{
            const res=await api.post('/api/token/',{email,password});
            if(res.status==200){
                localStorage.setItem(ACCESS_TOKEN,res.data.access);
                localStorage.setItem(REFRESH_TOKEN,res.data.refresh);
                navigate('/');
            }
        }catch(error){
            alert(error)
        }
    };
    return(
        <div className="login-outer">
            <h2 className="login_heading">Login</h2>
            <form onSubmit={handleSubmit} className="login">
                <input type="email" 
                placeholder="Enter your Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                />
                <input type="password" 
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                />
                <button>Login</button>
            </form>
            <p>New to promtify? <Link to ='/register' className="login-link">Register</Link></p>
        </div>
    )
}