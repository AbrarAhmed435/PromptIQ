import { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import api from "./api";
import { SiGoogleearth } from "react-icons/si";
import { FaBars } from "react-icons/fa";
import { IoIosLogOut, IoIosCloseCircleOutline } from "react-icons/io";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { IoAddOutline, IoCloseSharp } from "react-icons/io5";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNavigate } from "react-router-dom";

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
  const [chat_id, setChatId] = useState("556e8402-e29b-41d4-a715-048657618699");
  const [history, setHistory] = useState([]);
  const [fullReply, setFullReply] = useState("");
  const [welcome, setWelcome] = useState("");
  const [waiting, setWaiting] = useState("");
  const typingIndex = useRef(0);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
    handleNewChat();
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

  const handleDelete = async (id) => {
    // const confirmDelete = window.confirm("Delete this chat?");
    // if (!confirmDelete) return;
    try {
      const res = await api.delete(`api/chat/delete/${id}/`);
      if (res.status == 200) {
        fetchHistory();
        setReply("");
      } else {
        console.group(res.status);
        alert("failed to delete chat history");
      }
    } catch (error) {
      alert(error);
    }
     handleNewChat();
  };
  const handlefetchChat = async (chat_id) => {
    setWelcome("");
    try {
      const res = await api.get(`/api/chat/history/${chat_id}/`);
      if (res.status === 200) {
        const messages = res.data.messages;
        const lastReply = messages
          .filter((msg) => msg.role === "assistant")
          .map((msg) => msg.content)
          .join("\n");

        // setFullReply(lastReply); // for typewriter
        setReply(lastReply); // clear existing reply
        setChatId(res.data.chat_id);
      }
    } catch (err) {
      alert("Failed to load chat");
    }
  };
  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/user/chats/");
      if (res.status === 200) {
        setHistory(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    setReply("");
    setWelcome("");
    setWaiting(`${prompt} !!!Thinking...`);
    setFullReply("");
    console.log("Sending:", { chat_id, content: prompt });
    const userPrompt = prompt;
    setPrompt("");

    try {
      const res = await api.post("/api/prompt_gpt/", {
        chat_id,
        content: userPrompt,
      });
      setPrompt("");
      if (res.status === 201 || res.status === 200) {
        setWaiting("");
        setFullReply(res.data.reply);
        fetchHistory();
        // console.log(res.data.reply)
      } else {
        setWaiting("Wating finished");
      }
    } catch (error) {
      alert(error);
    }
    setPrompt("");
  };
  const handleLogout = () => {
    const confirmlogout = window.confirm("Are you sure to logout");
    if (!confirmlogout) return;
    navigate("/logout");
  };
  const handleNewChat = () => {
    setReply("");
    setWelcome("Hey There, What's in your Mind!!...Ask below ");
    let newId = "556e8402-e29b-41d4-a715-";
    for (let i = 0; i < 12; i++) {
      newId += Math.floor(Math.random() * 10);
    }
    setWaiting("");
    setReply("");
    setChatId(newId);
    // console.log("New Chat ID:", newId);
  };

  return (
    <div className="home-body">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        {!sidebarOpen ? <FaBars /> : <IoIosCloseCircleOutline />}
      </button>
      <h3 className="logout" onClick={handleLogout}>
        <IoIosLogOut style={{ verticalAlign: "middle" }} /> Logout
      </h3>
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

      <div className={`chat-history ${sidebarOpen ? "open" : ""}`}>
        <h2 className="histroy-head">HISTORY</h2>
        <button onClick={handleNewChat} className="new-chat">
          <IoAddOutline size={20} style={{ verticalAlign: "middle" }} />
          New Chat
        </button>
        {sidebarOpen && (
          <h3 className="sidebar-logout" onClick={handleLogout}>
            <IoIosLogOut style={{ verticalAlign: "middle" }} /> Logout
          </h3>
        )}

        <div style={{ paddingTop: "0px" }} className="title">
          {history.map((his) => (
            <div key={his.id} className="title-item">
              <p onClick={() => handlefetchChat(his.id)}>{his.title}</p>
              <button onClick={() => handleDelete(his.id)}>
                <MdDelete style={{ verticalAlign: "middle", color: "white" }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="page-area">
        <div className="logo">
          <p>
            <SiGoogleearth size={25} style={{ verticalAlign: "middle" }} />{" "}
            PromptIQ
          </p>
        </div>
        {/* <textarea name="" id=""
                 value={reply}
            readOnly
                ></textarea> */}
        <div className="reply-box markdown-body">
          <p>
            {waiting} {welcome}
          </p>
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
