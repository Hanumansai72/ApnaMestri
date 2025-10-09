import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import axios from "axios";
import { useParams } from "react-router-dom";
import NavaPro from "./navbarproduct";

const socket = io("https://backend-d6mx.vercel.app"); // ✅ fixed socket URL

export default function CustomerChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const id = localStorage.getItem("userid");
  const { vendorId } = useParams(); // ✅ Get vendorId from URL

  const scrollRef = useRef(null);
  const themeYellow = "#FFD700";
  const lightGray = "#F8F9FA";

  const customerId = id; // logged-in customer
  const customerModel = "Customer";

  // ✅ Join socket room
  useEffect(() => {
    if (!customerId) return;
    socket.emit("joinRoom", customerId);
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => {
        const convId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
        const updated = { ...prev };
        updated[convId] = [...(updated[convId] || []), msg];
        return updated;
      });
    });
    return () => socket.off("receiveMessage");
  }, [customerId]);

  // ✅ Auto scroll to bottom when new messages appear
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messages]);

  // ✅ Load all conversations
  useEffect(() => {
    const loadConversations = async () => {
      const res = await axios.get("https://backend-d6mx.vercel.app/api/messages/all");
      const unique = res.data.reduce((acc, msg) => {
        const otherId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
        if (!acc[otherId]) {
          acc[otherId] = {
            id: otherId,
            name: msg.receiverModel === "Vendor" ? "Vendor User" : "Customer User",
            avatar: "https://i.pravatar.cc/80?img=8",
            lastMessage: msg.text,
            lastTime: new Date(msg.time).toLocaleTimeString(),
            unread: 0,
          };
        }
        return acc;
      }, {});
      setConversations(Object.values(unique));

      // ✅ Automatically open correct vendor chat if vendorId is provided
      if (vendorId) {
        setActiveId(vendorId);
      } else if (Object.values(unique).length > 0) {
        setActiveId(Object.values(unique)[0].id);
      }
    };
    loadConversations();
  }, [vendorId, customerId]);

  const activeConv = conversations.find((c) => c.id === activeId);
  const activeMessages = messages[activeId] || [];

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !activeId) return;

    const msgData = {
      senderId: customerId,
      senderModel: customerModel,
      receiverId: activeId,
      receiverModel: "Vendor",
      text: trimmed,
    };

    socket.emit("sendMessage", msgData);

    setMessages((prev) => {
      const updated = { ...prev };
      updated[activeId] = [...(updated[activeId] || []), { ...msgData, time: "Now" }];
      return updated;
    });
    setInput("");
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavaPro />
      <div
        className="container-fluid"
        style={{ background: "#fff", minHeight: "100vh", padding: "1.25rem" }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary d-lg-none"
              onClick={() => setShowSidebar((s) => !s)}
            >
              <i className="bi bi-list"></i>
            </button>
            <button
              className="btn btn-outline-secondary d-lg-none"
              onClick={() => setShowProfile((s) => !s)}
            >
              <i className="bi bi-person-circle"></i>
            </button>
          </div>
        </div>

        <div className="row g-3">
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                className="col-lg-3"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 70 }}
              >
                <div
                  className="card"
                  style={{ borderRadius: 12, height: "calc(100vh - 120px)", overflow: "hidden" }}
                >
                  <div className="card-body p-3" style={{ background: lightGray }}>
                    <div className="d-flex align-items-center mb-3">
                      <motion.img
                        src="https://i.pravatar.cc/80?img=8"
                        alt="me"
                        className="rounded-circle"
                        style={{ width: 56, height: 56, border: `3px solid ${themeYellow}` }}
                        whileHover={{ scale: 1.05 }}
                      />
                      <div className="ms-2">
                        <div style={{ fontWeight: 700 }}>Ananya Singh</div>
                        <small className="text-success">● Available</small>
                      </div>
                    </div>

                    <input
                      className="form-control form-control-sm mb-3"
                      placeholder="Search vendors..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div style={{ overflowY: "auto", maxHeight: "62vh", paddingRight: 4 }}>
                      {filteredConversations.map((conv) => (
                        <motion.div
                          key={conv.id}
                          className={`d-flex align-items-center p-2 mb-2 rounded ${
                            conv.id === activeId ? "bg-white" : "bg-light"
                          }`}
                          style={{ cursor: "pointer" }}
                          onClick={() => setActiveId(conv.id)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <img
                            src={conv.avatar}
                            alt=""
                            className="rounded-circle"
                            style={{ width: 46, height: 46, border: `2px solid ${themeYellow}` }}
                          />
                          <div className="ms-2 flex-fill">
                            <div className="d-flex justify-content-between">
                              <div style={{ fontWeight: 600 }}>{conv.name}</div>
                              <small className="text-muted">{conv.lastTime}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted" style={{ fontSize: 13 }}>
                                {conv.lastMessage}
                              </small>
                              {conv.unread > 0 && (
                                <span
                                  className="badge rounded-pill"
                                  style={{ background: themeYellow, color: "#000" }}
                                >
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div
              className="card"
              style={{
                borderRadius: 12,
                height: "calc(100vh - 120px)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                className="card-header d-flex align-items-center justify-content-between"
                style={{ background: "#fff", borderBottom: "1px solid #eee" }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={activeConv?.avatar}
                    alt=""
                    className="rounded-circle"
                    style={{ width: 48, height: 48, border: `2px solid ${themeYellow}` }}
                  />
                  <div className="ms-2">
                    <div style={{ fontWeight: 700 }}>
                      {activeConv?.name || "Select Vendor"}
                    </div>
                    <small className="text-success">● Online</small>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                style={{ padding: "1rem", overflowY: "auto", flex: 1, background: "#F7F9FB" }}
              >
                <AnimatePresence>
                  {(activeMessages || []).map((m, i) => (
                    <motion.div
                      key={i}
                      className={`d-flex mb-3 ${
                        m.senderId === customerId
                          ? "justify-content-end"
                          : "justify-content-start"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ maxWidth: "78%" }}>
                        <div
                          style={{
                            background: m.senderId === customerId ? themeYellow : "#fff",
                            color: "#000",
                            padding: "10px 14px",
                            borderRadius: 16,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                          }}
                        >
                          <div>{m.text}</div>
                          <div className="d-flex justify-content-end mt-1">
                            <small className="text-muted" style={{ fontSize: 12 }}>
                              {m.time ? new Date(m.time).toLocaleTimeString() : "Now"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div
                className="card-footer"
                style={{ background: "#fff", borderTop: "1px solid #eee" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button
                    className="btn"
                    style={{ background: themeYellow, color: "#000" }}
                    onClick={handleSend}
                  >
                    <i className="bi bi-send-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
