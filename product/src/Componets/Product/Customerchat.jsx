// src/Components/Product/CustomerChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams } from "react-router-dom";
import NavaPro from "./navbarproduct";
import { socket } from "./socket";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app"
    : "http://localhost:5000";

export default function CustomerChat() {
  const { vendorId } = useParams();
  const customerId = localStorage.getItem("userid") || "";

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(vendorId || null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [vendorInfo, setVendorInfo] = useState({
    name: "Vendor",
    avatar: "https://i.pravatar.cc/80?img=8",
  });

  const scrollRef = useRef(null);

  // ------------------- Socket.IO -------------------
  useEffect(() => {
    if (!customerId) return;
    socket.emit("joinRoom", customerId);

    const handler = (msg) => {
      const otherId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
      setMessages((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg],
      }));
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [customerId]);

  // ------------------- Auto Scroll -------------------
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messages]);

  // ------------------- Load Conversations -------------------
  useEffect(() => {
    if (!customerId) return;

    const loadConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/messages/customer/${customerId}`);
        const convMap = {};

        res.data.forEach((msg) => {
          const otherId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
          if (!convMap[otherId]) convMap[otherId] = [];
          convMap[otherId].push(msg);
        });

        const convs = Object.entries(convMap).map(([otherId, msgs]) => {
          const last = msgs[msgs.length - 1];
          return {
            id: otherId,
            name:
              last.senderId === customerId
                ? last.receiverIdName || "Vendor"
                : last.senderIdName || "Vendor",
            avatar:
              last.senderId === customerId
                ? last.receiverAvatar || "https://i.pravatar.cc/80?img=8"
                : last.senderAvatar || "https://i.pravatar.cc/80?img=8",
            lastMessage: last.text,
            lastTime: new Date(last.time || Date.now()).toLocaleTimeString(),
          };
        });

        setConversations(convs);
      } catch (err) {
        console.error(err);
      }
    };

    loadConversations();
  }, [customerId]);

  // ------------------- Fetch Vendor Info -------------------
  useEffect(() => {
    if (!activeId) return;

    const fetchVendorInfo = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/vendor/${activeId}`);
        setVendorInfo({
          name: res.data.Owner_name || "Vendor",
          avatar: res.data.Profile_Image || "https://i.pravatar.cc/80?img=8",
        });
      } catch (err) {
        console.error("Vendor info error:", err);
      }
    };

    fetchVendorInfo();
  }, [activeId]);

  // ------------------- Fetch Active Thread -------------------
  useEffect(() => {
    if (!activeId) return;

    const fetchThread = async () => {
      if (messages[activeId]?.length > 0) return;

      try {
        const res = await axios.get(`${API_BASE}/api/messages/conversation/${customerId}/${activeId}`);
        setMessages((prev) => ({ ...prev, [activeId]: res.data || [] }));
      } catch (err) {
        console.error(err);
      }
    };

    fetchThread();
  }, [activeId, customerId, messages]);

  // ------------------- Send Message -------------------
  const handleSend = async () => {
    if (!input.trim() || !activeId) return;

    const msgData = {
      senderId: customerId,
      senderModel: "Customer",
      receiverId: activeId,
      receiverModel: "Vendor",
      text: input.trim(),
      time: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), msgData],
    }));
    setInput("");

    socket.emit("sendMessage", msgData);

    try {
      await axios.post(`${API_BASE}/api/messages/customer/send`, msgData);
    } catch (err) {
      console.error("Message failed to send", err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMessages = messages[activeId] || [];
  const activeConv = conversations.find((c) => c.id === activeId) || vendorInfo;

  return (
    <>
      <NavaPro />
      <div className="container-fluid" style={{ padding: "1.25rem" }}>
        <div className="row g-3">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="card" style={{ borderRadius: 12, height: "90vh", overflow: "hidden" }}>
              <div className="card-body p-3">
                <input
                  className="form-control mb-3"
                  placeholder="Search vendors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div style={{ overflowY: "auto", maxHeight: "75vh" }}>
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`d-flex align-items-center p-2 mb-2 rounded ${
                        conv.id === activeId ? "bg-white" : "bg-light"
                      }`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setActiveId(conv.id)}
                    >
                      <img
                        src={conv.avatar}
                        alt=""
                        className="rounded-circle me-2"
                        style={{ width: 46, height: 46 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{conv.name}</div>
                        <small className="text-muted">{conv.lastMessage}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="col-lg-9">
            <div
              className="card"
              style={{ borderRadius: 12, height: "90vh", display: "flex", flexDirection: "column" }}
            >
              <div className="card-header" style={{ background: "#fff", borderBottom: "1px solid #eee" }}>
                <div className="d-flex align-items-center">
                  <img
                    src={activeConv.avatar}
                    alt=""
                    className="rounded-circle me-2"
                    style={{ width: 48, height: 48 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{activeConv.name || "Select Vendor"}</div>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#F7F9FB" }}
              >
                <AnimatePresence>
                  {activeMessages.map((m, i) => (
                    <motion.div
                      key={m._id || i}
                      className={`d-flex mb-3 ${
                        m.senderId === customerId ? "justify-content-end" : "justify-content-start"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div style={{ maxWidth: "70%" }}>
                        <div
                          style={{
                            background: m.senderId === customerId ? "#FFD700" : "#fff",
                            padding: "10px 14px",
                            borderRadius: 16,
                          }}
                        >
                          {m.text}
                          <div className="text-end mt-1">
                            <small className="text-muted" style={{ fontSize: 12 }}>
                              {new Date(m.time).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="card-footer" style={{ borderTop: "1px solid #eee", background: "#fff" }}>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button className="btn btn-warning" onClick={handleSend}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
