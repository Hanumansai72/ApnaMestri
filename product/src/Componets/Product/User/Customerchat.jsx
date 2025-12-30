import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "./socket";
import { useAuth } from "../Auth/AuthContext";
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';

export default function CustomerChat() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const customerId = authUser?.id;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef(null);

  /* ---------------- CREATE / GET CONVERSATION ---------------- */
  useEffect(() => {
    if (!customerId || !vendorId) return;

    const initConversation = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/chat/conversation`, {
          userId: customerId,
          vendorId,
        });
        setConversation(res.data);
      } catch (err) {
        console.error("Init conversation failed:", err);
      }
    };

    initConversation();
  }, [customerId, vendorId]);

  /* ---------------- JOIN SOCKET ROOM ---------------- */
  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit("joinConversation", conversation._id);

    const handler = (msg) => {
      if (msg.conversationId === conversation._id) {
        setMessages((prev) => {
          // Prevent duplicates if already added optimistically
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [conversation]);

  /* ---------------- FETCH MESSAGE HISTORY ---------------- */
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/chat/messages/${conversation._id}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Fetch messages failed:", err);
      }
    };

    fetchMessages();
  }, [conversation]);

  /* ---------------- FETCH VENDOR DETAILS ---------------- */
  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`${API_BASE_URL}/api/vendor/${vendorId}`)
      .then((res) => setVendorDetails(res.data))
      .catch(() => setVendorDetails(null));
  }, [vendorId]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const payload = {
      conversationId: conversation._id,
      senderId: customerId,
      senderType: "user",
      message: input.trim(),
    };

    setInput("");

    // Optimistic UI
    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { ...payload, _id: tempId, createdAt: new Date() },
    ]);

    try {
      socket.emit("sendMessage", payload);
      await axios.post(`${API_BASE_URL}/api/chat/message`, payload);
    } catch (err) {
      console.error("Send message failed:", err);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-soft">
      <NavaPro />

      <style>{`
        .bg-soft { background-color: #f0f2f5; }
        .chat-container {
          height: calc(100vh - 180px);
          max-width: 1000px;
          margin: 20px auto;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 15px 25px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .message-area {
          flex: 1;
          overflow-y: auto;
          padding: 25px;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          background-blend-mode: overlay;
          background-color: #f7f9fb;
        }
        .message-bubble {
          max-width: 75%;
          margin-bottom: 15px;
          padding: 12px 18px;
          position: relative;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .user-message {
          background: #ffd700;
          color: #000;
          border-radius: 20px 20px 4px 20px;
          align-self: flex-end;
          margin-left: auto;
        }
        .vendor-message {
          background: #fff;
          color: #333;
          border-radius: 20px 20px 20px 4px;
          align-self: flex-start;
          border: 1px solid #eee;
        }
        .input-area {
          padding: 20px 25px;
          background: #fff;
          border-top: 1px solid #f0f0f0;
        }
        .custom-input {
          border: none;
          background: #f0f2f5;
          border-radius: 25px;
          padding: 12px 20px;
          transition: all 0.3s;
        }
        .custom-input:focus {
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.5);
          background: #fff;
        }
        .send-btn {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .send-btn:active {
          transform: scale(0.9);
        }
        @media (max-width: 768px) {
          .chat-container {
            margin: 0;
            height: calc(100vh - 70px);
            border-radius: 0;
          }
        }
      `}</style>

      <div className="container-fluid flex-grow-1 p-0 p-md-3">
        <div className="chat-container">
          {/* HEADER */}
          <div className="chat-header">
            <div className="d-flex align-items-center">
              <button
                onClick={() => navigate('/chat')}
                className="btn btn-link link-dark p-0 me-3 d-md-none"
              >
                <i className="bi bi-arrow-left fs-4"></i>
              </button>
              <img
                src={vendorDetails?.Profile_Image || "https://i.pravatar.cc/80?img=8"}
                alt=""
                className="rounded-circle me-3"
                style={{ width: 45, height: 45, objectFit: 'cover' }}
              />
              <div>
                <h6 className="mb-0 fw-bold">{vendorDetails?.Owner_name || "Professional"}</h6>
                <small className="text-success" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i> Online
                </small>
              </div>
            </div>
            <div className="d-flex gap-3">
              <button className="btn btn-light rounded-circle shadow-sm">
                <i className="bi bi-telephone"></i>
              </button>
              <button className="btn btn-light rounded-circle shadow-sm">
                <i className="bi bi-three-dots-vertical"></i>
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div ref={scrollRef} className="message-area d-flex flex-column">
            <div className="text-center my-4">
              <span className="badge bg-white text-muted shadow-sm px-3 py-2 rounded-pill fw-normal">
                Secure end-to-end encrypted
              </span>
            </div>

            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div
                  key={m._id || i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`message-bubble ${m.senderType === "user" ? "user-message" : "vendor-message"}`}
                >
                  <div style={{ wordBreak: 'break-word' }}>{m.message}</div>
                  <div className="text-end" style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.7 }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {m.senderType === "user" && (
                      <i className="bi bi-check2-all ms-1 text-primary"></i>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* INPUT */}
          <div className="input-area">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle">
                <i className="bi bi-plus-lg"></i>
              </button>
              <div className="flex-grow-1">
                <input
                  className="form-control custom-input shadow-none"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
              </div>
              <button
                className={`btn btn-warning send-btn shadow-sm ${!input.trim() ? 'opacity-50' : ''}`}
                onClick={handleSend}
                disabled={!input.trim()}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto d-none d-md-block">
        <Footer />
      </div>
    </div>
  );
}
