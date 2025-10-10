import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams } from "react-router-dom";
import NavaPro from "./navbarproduct";
import { socket } from "./socket";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://chatsystem-6r32.onrender.com"
    : "http://localhost:5000";

export default function CustomerChat() {
  const { vendorId } = useParams();
  const customerId = localStorage.getItem("userid") || "";
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(vendorId || null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);

  const scrollRef = useRef(null);

  // ------------------- Socket.IO -------------------
  useEffect(() => {
    if (!customerId) return;
    socket.emit("joinRoom", customerId);

    const handler = (msg) => {
      const otherId =
        msg.senderId === customerId ? msg.receiverId : msg.senderId;
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
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messages]);

  // ------------------- Load Conversations -------------------
  useEffect(() => {
    if (!customerId) return;

    const loadConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/messages/customer/${customerId}`);
        const convMap = {};

        res.data.forEach((msg) => {
          const otherId =
            msg.senderModel === "Customer"
              ? msg.receiverId._id
              : msg.senderId._id;
          if (!convMap[otherId]) convMap[otherId] = [];
          convMap[otherId].push(msg);
        });

        const convs = Object.entries(convMap).map(([otherId, msgs]) => {
          const last = msgs[msgs.length - 1];
          const vendor =
            last.senderModel === "Vendor"
              ? last.senderId
              : last.receiverId;
          return {
            id: otherId,
            name: vendor?.Business_Name || "Vendor",
            avatar: vendor?.Profile_Image || "https://i.pravatar.cc/80?img=8",
            lastMessage: last.text,
            lastTime: new Date(last.time || Date.now()).toLocaleTimeString(),
          };
        });

        setConversations(convs);
        setMessages(convMap);

        if (!activeId && convs.length > 0) setActiveId(convs[0].id);
      } catch (err) {
        console.error("Error loading conversations:", err);
      }
    };

    loadConversations();
  }, [customerId, activeId]);

  // ------------------- Fetch Active Vendor Details -------------------
  useEffect(() => {
    if (!activeId) return;
    const fetchVendor = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/vendor/${activeId}`);
        setVendorDetails(res.data);
      } catch (err) {
        console.error("Error fetching vendor details:", err);
        setVendorDetails(null);
      }
    };
    fetchVendor();
  }, [activeId]);

  // ------------------- Fetch Active Thread -------------------
  useEffect(() => {
    if (!activeId || messages[activeId]?.length > 0) return;

    const fetchThread = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/conversation/${customerId}/${activeId}`
        );
        setMessages((prev) => ({ ...prev, [activeId]: res.data || [] }));
      } catch (err) {
        console.error("Error fetching conversation:", err);
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
    };

    // Update UI instantly
    setMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] || []),
        { ...msgData, time: new Date().toISOString() },
      ],
    }));
    setInput("");
    socket.emit("sendMessage", msgData);

    try {
      await axios.post(`${API_BASE}/api/messages/send`, msgData);
    } catch (err) {
      console.error("Message failed to send", err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeMessages = messages[activeId] || [];
  const activeConv = conversations.find((c) => c.id === activeId);

  return (
    <>
      <NavaPro />
      <div className="container-fluid" style={{ padding: "1.25rem" }}>
        <div className="row g-3">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div
              className="card"
              style={{ borderRadius: 12, height: "90vh", overflow: "hidden" }}
            >
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
                  {filteredConversations.length === 0 && (
                    <p className="text-center text-muted mt-3">
                      No conversations yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="col-lg-9">
            <div
              className="card"
              style={{
                borderRadius: 12,
                height: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                className="card-header"
                style={{ background: "#fff", borderBottom: "1px solid #eee" }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={
                      vendorDetails?.Profile_Image ||
                      activeConv?.avatar ||
                      "https://i.pravatar.cc/80?img=8"
                    }
                    alt=""
                    className="rounded-circle me-2"
                    style={{ width: 48, height: 48 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {vendorDetails?.Owner_name ||
                        activeConv?.name ||
                        "Select Vendor"}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {vendorDetails?.Business_Name || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1rem",
                  background: "#F7F9FB",
                }}
              >
                <AnimatePresence>
                  {activeMessages.map((m, i) => (
                    <motion.div
                      key={m._id || i}
                      className={`d-flex mb-3 ${
                        m.senderId === customerId
                          ? "justify-content-end"
                          : "justify-content-start"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <div style={{ maxWidth: "70%" }}>
                        <div
                          style={{
                            background:
                              m.senderId === customerId ? "#FFD700" : "#fff",
                            padding: "10px 14px",
                            borderRadius: 16,
                          }}
                        >
                          {m.text}
                          <div className="text-end mt-1">
                            <small
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              {new Date(m.time).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {activeMessages.length === 0 && (
                    <p className="text-center text-muted mt-3">
                      No messages yet
                    </p>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div
                className="card-footer"
                style={{ borderTop: "1px solid #eee", background: "#fff" }}
              >
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
