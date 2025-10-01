import { useEffect, useState, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import api from "./api";
import "react-tooltip/dist/react-tooltip.css";
import { SiGoogleearth } from "react-icons/si";
import { FaBars } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { IoIosLogOut, IoIosCloseCircleOutline } from "react-icons/io";
import { IoAddSharp } from "react-icons/io5";
import { Tooltip } from "react-tooltip";
import { PiFilePdfDuotone } from "react-icons/pi";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { FaEyeDropper } from "react-icons/fa";
import { IoAddOutline, IoCloseSharp } from "react-icons/io5";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MdOutlineFileDownload } from "react-icons/md";
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
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat_id, setChatId] = useState("556e8402-e29b-41d4-a715-048657618699");
  const [history, setHistory] = useState([]);
  const [fullReply, setFullReply] = useState("");
  const [welcome, setWelcome] = useState("");
  const [modelChoice, setModelChoice] = useState("gpt");
  const [waiting, setWaiting] = useState("");
  const typingIndex = useRef(0);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBox, setShowBox] = useState(false);
  const isLargeScreen = useMediaQuery({ minWidth: 801 });

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
  const handleModelChange = (e) => {
    setModelChoice(e.target.value);
  };
  const handleSendModelChoice = async (e) => {
    console.log("Choice being sent:", modelChoice);
    e.preventDefault();
    try {
      const res = await api.post("/api/choose/model/", { choice: modelChoice });
      toast.success(res.data.message || "Model switched!");
    } catch (error) {
      toast.error("Failed to change model");
    }
  };

  const handlePDFUpload = async () => {
    if (!pdfFile) {
      toast.info("Please select a PDF file first");
      return;
    }

    if (!chat_id) {
      toast.error("Chat ID is missing");
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", pdfFile);
    formData.append("chat_id", chat_id); // ✅ Send chat_id

    try {
      const res = await api.post("/api/pdfs/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201 || res.status === 200) {
        setUploadStatus("PDF uploaded successfully");
      } else {
        setUploadStatus("Failed to upload PDF");
      }
    } catch (error) {
      console.log("PDF upload error:", error);
      setUploadStatus("Error uploading PDF");
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    // const confirmDelete = window.confirm("Delete this chat?");
    // if (!confirmDelete) return;
    try {
      const res = await api.delete(`api/chat/delete/${id}/`);
      if (res.status == 200) {
        fetchHistory();
        toast.warning(`Chat with id ${id} deleted`);
      } else {
        toast.error("failed to delete chat history");
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const handleDownload = async () => {
    try {
      const res = await api.get(`api/chat/${chat_id}/download-pdf/`, {
        responseType: "blob", // Important for binary files
      });

      if (res.status === 200) {
        // Create a Blob URL for the PDF
        const fileURL = window.URL.createObjectURL(new Blob([res.data]));

        // Create a temporary download link
        const link = document.createElement("a");
        link.href = fileURL;
        link.setAttribute("download", `chat_${chat_id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Failed to download PDF");
      }
    } catch (error) {
      toast.error("Error downloading PDF: " + error);
    }
  };
  const handleAddPdf = (e) => {
    e.preventDefault(e);
    setShowBox(!showBox);
  };

  const handlefetchChat = async (chat_id) => {
    setWelcome("");
    setChatId(chat_id);
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
      toast.error("Failed to load chat");
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
  const handleImprove = async (e) => {
    e.preventDefault();

    if (!prompt.length) {
      toast.error("Give prompt");
      return;
    }

    try {
      const res = await api.post("/api/improve/prompt/", {
        message: prompt,
      });

      if (res.status === 200) {
        console.log("response:", res.data);
        setPrompt(res.data.betterprompt); // ✅ correct key
        toast.success("Prompt improved!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error improving prompt");
    }
  };

  const sendQuery = async (e) => {
    e.preventDefault();
    if (!prompt.length) {
      toast.warning("Provide a prompt");
      return;
    }
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
      toast.error(error);
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
    toast.success("New Chat Created");
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
          <select value={modelChoice} onChange={handleModelChange}>
            <option value="gpt">gpt 40-mini</option>
            <option value="gemini">gemini 2.5</option>
          </select>
          <button onClick={handleSendModelChoice}>Save</button>
          {history.map((his) => (
            <div key={his.id} className="title-item">
              <p onClick={() => handlefetchChat(his.id)}>{his.title}</p>
              <button onClick={(e) => handleDelete(e, his.id)}>
                <MdDelete style={{ verticalAlign: "middle" }} />
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
        {showBox && (
          <div
            style={{
              marginBottom: "8px",
              position: "fixed",
              left: "20vw",
              bottom: "80px",
              background: "#2a2a2a",
              color: "white",
              padding: "10px",
              borderRadius: "8px",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.3)",
            }}
          >
            <div className="pdf-upload-section">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              <button type="button" onClick={handlePDFUpload}>
                Upload PDF
              </button>
              <p>{uploadStatus}</p>
            </div>
          </div>
        )}
        <ToastContainer />
        <div className="prompt-section">
          <form className="prompt-form">
            <button className="add-pdf" onClick={handleAddPdf}>
              <IoAddSharp style={{ verticalAlign: "center" }} />
            </button>

            <input
              type="text"
              placeholder="Ask Anything"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <a
              data-tooltip-id="my-tooltip"
              data-tooltip-content="Improve Your Prompt"
              data-tooltip-place="top"
            >
              <button className="improve-btn" onClick={handleImprove}>
                <FaEyeDropper style={{ verticalAlign: "middle" }} />
              </button>
            </a>
            <Tooltip id="my-tooltip" />
            <button className="send-btn" onClick={sendQuery}>
              <IoSend size={22} style={{ verticalAlign: "middle" }} />
            </button>
            <button onClick={handleDownload} className="download-btn">
              <MdOutlineFileDownload
                size={20}
                style={{ verticalAlign: "middle" }}
              />{" "}
              {isLargeScreen && (
                <PiFilePdfDuotone
                  size={20}
                  style={{ verticalAlign: "middle" }}
                />
              )}
            </button>
          </form>
          {/*  <div className="pdf-upload-section">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <button type="button" onClick={handlePDFUpload}>
              Upload PDF
            </button>
            <p>{uploadStatus}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
