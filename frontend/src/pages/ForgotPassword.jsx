import { useState } from "react";
import axios from "axios"
import api from "../api";

export default function ForgotPassword(){
    const [email,setEmail]=useState("")
    const [message,setMessage]=useState("")
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false)

    const handleSubmit=async (e)=>{
        e.preventDefault();
        setMessage("")
        setError("")
        setLoading(true);
        try{
            const res=await api.post("/api/forgot-password/",{email});
            setMessage(res.data.message || "Pasword reset link sent to your email");
        }catch(err){
            setError(err.response?.data?.error|| "Something went wrong");
        }finally{
            setLoading(false)
        }
    }
    

    return(
        <div>
        <div>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" 
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                placeholder="Enter your registerd Email"
                required
                />
                <button>send</button>
            </form>
        </div>
        </div>
    )

}