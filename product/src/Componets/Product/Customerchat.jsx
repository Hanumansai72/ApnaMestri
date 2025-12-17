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
  const customerId = localStorage.getItem("userid");

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [vendorDetails, setVendorDetails] = useState(null);

  const scrollRef = useRef(null);

  /* ----------------------------------------
     CREATE / GET CONVERSATION
  ---------------------------------------- */
  useEffect(() => {
    if (!customerId || !vendorId) return;

    const initConversation = async () => {
      const res = await axios.post(`${API_BASE}/api/chat/conversation`, {
        userId: customerId,
        vendorId,
      });
      setConversation(res.data);
    };

    initConversation();
  }, [customerId, vendorId]);

  /* ----------------------------------------
     JOIN SOCKET ROOM
  ---------------------------------------- */
  useEffect(() => {
    if (!conversation?._id) return;

    socket.emit("joinConversation", conversation._id);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, [conversation]);

  /* ----------------------------------------
     FETCH MESSAGE HISTORY
  ---------------------------------------- */
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      const res = await axios.get(
        `${API_BASE}/api/chat/messages/${conversation._id}`
      );
      setMessages(res.data);
    };

    fetchMessages();
  }, [conversation]);

  /* ----------------------------------------
     FETCH VENDOR DETAILS
  ---------------------------------------- */
  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`${API_BASE}/api/vendor/${vendorId}`)
      .then((res) => setVendorDetails(res.data))
      .catch(() => setVendorDetails(null));
  }, [vendorId]);

  /* ----------------------------------------
     AUTO SCROLL
  ---------------------------------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* ----------------------------------------
     SEND MESSAGE
  ---------------------------------------- */
  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const payload = {
      conversationId: conversation._id,
      senderId: customerId,
      senderType: "user",
      message: input.trim(),
    };

    setInput("");

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      { ...payload, createdAt: new Date() },
    ]);

    socket.emit("sendMessage", payload);

    await axios.post(`${API_BASE}/api/chat/message`, payload);
  };

  /* ----------------------------------------
     UI (UNCHANGED)
  ---------------------------------------- */
  return (
    <>
      <NavaPro />

      <div className="container-fluid" style={{ padding: "1.25rem" }}>
        <div className="row g-3">
          <div className="col-lg-12">
            <div
              className="card"
              style={{
                borderRadius: 12,
                height: "90vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* HEADER */}
              <div
                className="card-header"
                style={{ background: "#fff", borderBottom: "1px solid #eee" }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={
                      vendorDetails?.Profile_Image ||
                      "https://i.pravatar.cc/80?img=8"
                    }
                    alt=""
                    className="rounded-circle me-2"
                    style={{ width: 48, height: 48 }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {vendorDetails?.Owner_name || "Vendor"}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {vendorDetails?.Business_Name || ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* MESSAGES */}
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
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      className={`d-flex mb-3 ${
                        m.senderId === customerId
                          ? "justify-content-end"
                          : "justify-content-start"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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
                          {m.message}
                          <div className="text-end mt-1">
                            <small className="text-muted">
                              {new Date(m.createdAt).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* FOOTER */}
              <div
                className="card-footer"
                style={{ borderTop: "1px solid #eee", background: "#fff" }}
              >
                <div className="d-flex gap-2">
                  <input
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
