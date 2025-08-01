import { useState } from "react";
import { IoSend } from "react-icons/io5";
import api from "./api";

/* 
POST http://localhost:8000/api/prompt_gpt/ HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzOTcyMjA5LCJpYXQiOjE3NTM5NzA0MDksImp0aSI6ImMzOWJjMmVjZTYzYzRkOTY5MDY1ZWM1YzZhYzQ3NTk0IiwidXNlcl9pZCI6IjEzIn0._RrJmJqyAGKxjwQeUaeAKwyiS-N4xRO1tMAHKk5QDlY

{
    "chat_id":"550e8400-e29b-41d4-a716-446655440900",
    "content":"and of neptune?"
}
*/

export default function Home(){
    const [prompt,setPrompt]=useState("")
    const [reply,setReply]=useState("")
    const [loading,setLoading]=useState(false);
    const chat_id="550e8400-e29b-41d4-a715-449659440610";

    const fetchchat= async (e)=>{
        e.preventDefault(true);
        try{
            const res= await api.post('/api/prompt_gpt/',{chat_id,content:prompt});
            if(res.status===201){
                setReply(res.data.reply);
                console.log(res.data.title)
                // console.log(res.data.reply)
            }
        }catch(error){
            alert(error);
        }

    }

    return (
        <div>
            <form onSubmit={fetchchat} className="chat-box">
                <input type="text" 
                value={prompt}
                onChange={(e)=>setPrompt(e.target.value)}
                placeholder="Enter your prompt"
                />
                <button><IoSend /></button>
            </form>
            <textarea name="" id=""
            value={reply}
            readOnly
            ></textarea>
        </div>

    )
}