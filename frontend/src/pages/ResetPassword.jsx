import { useState,useEffect } from "react";
import axios from "axios";
import { useLocation,useNavigate } from "react-router-dom";
import api from "../api";


export default function ResetPassword(){
    const [password,setPassword]=useState("")
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const [message,setMessage]=useState("");

    const location=useLocation();
    const navigate=useNavigate();
    const searchParams=new URLSearchParams(location.search);
    const uid=searchParams.get("uid")
    const token=searchParams.get("token")

    useEffect(()=>{
        if (!uid || !token)
        setError("Invalid password reset link");
    },[uid,token]);

    const handleSubmit= async (e)=>{
        e.preventDefault();
        setLoading(true);


        setMessage("");
        setError("");

        try{
            const res=await api.post(`/api/reset-password/${uid}/${token}/`,{password});

            setMessage(res.data.message || "Password reset successfull");

            setTimeout(()=>navigate("/login"),2000);

        }catch(err){
            setError(err.response?.data?.error || "Something went wrong");
        }finally{
            setLoading(false);
        }
    
    }

    return (
        <div>
            <div>
                <h2>Reset Password</h2>
                {error && <p>{error}</p>}
                {!error && (
                    <form onSubmit={handleSubmit}>
                        <input type="password" 
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        placeholder="Enter your new Password"
                        required
                        />
                        <button>Submit</button>
                    </form>
                )}
                {message && (
                    <p>{message}</p>
                )}
            </div>
        </div>
    )

}