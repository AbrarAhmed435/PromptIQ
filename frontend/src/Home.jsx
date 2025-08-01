import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";
import api from "./api";
import { IoArrowUpCircleSharp } from "react-icons/io5";
import { FaArrowCircleUp } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

/* 
POST http://localhost:8000/api/prompt_gpt/ HTTP/1.1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUzOTcyMjA5LCJpYXQiOjE3NTM5NzA0MDksImp0aSI6ImMzOWJjMmVjZTYzYzRkOTY5MDY1ZWM1YzZhYzQ3NTk0IiwidXNlcl9pZCI6IjEzIn0._RrJmJqyAGKxjwQeUaeAKwyiS-N4xRO1tMAHKk5QDlY

{
    "chat_id":"550e8400-e29b-41d4-a716-446655440900",
    "content":"and of neptune?"
}
*/

export default function Home() {
  const [dummyp, setDummyP] = useState("");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const chat_id = "556e8402-e29b-41d4-a715-449657613810";
  const [history, setHistory] = useState([]);
  const [fullReply, setFullReply] = useState("");
  const [waiting,setWaiting]=useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
  if (!fullReply) return;

  setReply(""); // clear current reply before typing new one

  let i = 0;
  const interval = setInterval(() => {
    setReply((prev) => prev + fullReply.charAt(i));
    i++;

    if (i >= fullReply.length) {
      clearInterval(interval);
    }
  }, 1); // typing speed (ms per character)

  return () => clearInterval(interval); // clean up if interrupted
}, [fullReply]);

  /*  path("/user/chats/",views.user_chats,name="user chats"), */
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/user/chats/");
      if (res.status === 200) {
        setHistory(res.data);
        console.log(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    setWaiting("Thinking...")
    console.log("Sending:", { chat_id, content: prompt });
    const userPrompt = prompt;
    setPrompt("");

    try {
      const res = await api.post("/api/prompt_gpt/", {
        chat_id,
        content: userPrompt,
      });
      setPrompt("");
      if (res.status === 201) {
        setWaiting("");
        setFullReply(res.data.reply);
        // console.log(res.data.title);
        // console.log(res.data.reply);
        fetchHistory();
        // console.log(res.data.reply)
      }
    } catch (error) {
      alert(error);
    }
    setPrompt("");
  };
  const fetchChat = () => {
    console.log("clidked");
  };

  return (
    <div className="home-body">
      {/* <form onSubmit={fetchchat} className="chat-box">
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
            ></textarea> */}
      <div className="chat-history">
        <h2 className="histroy-head">HISTORY</h2>
        <div style={{ paddingTop: "0px" }} className="title">
          {history.map((his) => (
            <p key={his.id}>{his.title}</p>
          ))}
        </div>
      </div>
      <div className="page-area">
        <div className="logo">
          <p>PromptIQ</p>
        </div>
        {/* <textarea name="" id=""
                 value={reply}
            readOnly
                ></textarea> */}
       <div className="reply-box markdown-body">
        <p>{waiting}</p>
      <ReactMarkdown
        children={reply}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      />
    </div>

        <form onSubmit={sendQuery} className="prompt-area">
          <input
            type="text"
            placeholder="Ask Anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button>
            <IoSend size={32} style={{ verticalAlign: "middle" }} />
          </button>
        </form>
      </div>
    </div>
  );
}
