// src/Componets/Product/Customerchat.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import NavaPro from './navbarproduct';
import { socket } from './socket'; // path assumes socket.js at src/socket.js

const API_BASE =
  process.env.NODE_ENV === 'production'
    ? 'https://backend-d6mx.vercel.app'
    : 'http://localhost:5000';

export default function CustomerChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(true);

  const { vendorId } = useParams();
  const customerId = useMemo(() => localStorage.getItem('userid') || '', []);
  const customerModel = 'Customer';

  const scrollRef = useRef(null);
  const themeYellow = '#FFD700';
  const lightGray = '#F8F9FA';

  // Join socket room and receive messages
  useEffect(() => {
    if (!customerId) return;
    socket.emit('joinRoom', customerId);
    const handler = (msg) => {
      const convId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
      setMessages((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), msg],
      }));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                lastMessage: msg.text,
                lastTime: new Date(msg.time || Date.now()).toLocaleTimeString(),
              }
            : c
        )
      );
    };
    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, [customerId]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messages]);

  // Load conversations list
  useEffect(() => {
    if (!customerId) return;
    const loadConversations = async () => {
      const res = await axios.get(`${API_BASE}/api/messages/all`);
      const mine = res.data.filter(
        (m) => m.senderId === customerId || m.receiverId === customerId
      );
      const byOther = mine.reduce((acc, msg) => {
        const otherId = msg.senderId === customerId ? msg.receiverId : msg.senderId;
        if (!acc[otherId]) acc[otherId] = [];
        acc[otherId].push(msg);
        return acc;
      }, {});
      const convs = Object.entries(byOther).map(([otherId, list]) => {
        const last = list[list.length - 1];
        return {
          id: otherId,
          name:
            last.senderModel === 'Vendor' || last.receiverModel === 'Vendor'
              ? 'Vendor User'
              : 'Customer User',
          avatar: 'https://i.pravatar.cc/80?img=8',
          lastMessage: last.text,
          lastTime: new Date(last.time || Date.now()).toLocaleTimeString(),
          unread: 0,
        };
      });
      setConversations(convs);
      // hydrate messages map
      const next = {};
      Object.entries(byOther).forEach(([otherId, list]) => {
        next[otherId] = list.sort((a, b) => new Date(a.time) - new Date(b.time));
      });
      setMessages(next);

      // choose active
      if (vendorId) {
        setActiveId(vendorId);
      } else if (convs.length > 0) {
        setActiveId(convs[0].id);
      }
    };
    loadConversations().catch(() => {});
  }, [customerId, vendorId]);

  // When active changes and no messages loaded, fetch the thread
  useEffect(() => {
    const fetchThread = async () => {
      if (!activeId || !customerId) return;
      if ((messages[activeId] || []).length > 0) return;
      const res = await axios.get(`${API_BASE}/api/messages/${customerId}/${activeId}`);
      setMessages((prev) => ({ ...prev, [activeId]: res.data || [] }));
    };
    fetchThread().catch(() => {});
  }, [activeId, customerId]); // messages omitted intentionally for initial hydration

  const activeConv = conversations.find((c) => c.id === activeId);
  const activeMessages = messages[activeId] || [];

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !activeId || !customerId) return;

    const msgData = {
      senderId: customerId,
      senderModel: customerModel,
      receiverId: activeId,
      receiverModel: 'Vendor',
      text: trimmed,
    };

    // optimistic update
    setMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] || []),
        { ...msgData, time: new Date().toISOString() },
      ],
    }));
    setInput('');
    socket.emit('sendMessage', msgData);
    try {
      await axios.post(`${API_BASE}/api/messages`, msgData);
    } catch {
      // optional: revert or show toast
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <NavaPro />
      <div
        className="container-fluid"
        style={{ background: '#fff', minHeight: '100vh', padding: '1.25rem' }}
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
                transition={{ type: 'spring', stiffness: 70 }}
              >
                <div
                  className="card"
                  style={{
                    borderRadius: 12,
                    height: 'calc(100vh - 120px)',
                    overflow: 'hidden',
                  }}
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

                    <div style={{ overflowY: 'auto', maxHeight: '62vh', paddingRight: 4 }}>
                      {filteredConversations.map((conv) => (
                        <motion.div
                          key={conv.id}
                          className={`d-flex align-items-center p-2 mb-2 rounded ${
                            conv.id === activeId ? 'bg-white' : 'bg-light'
                          }`}
                          style={{ cursor: 'pointer' }}
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
                                  style={{ background: themeYellow, color: '#000' }}
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
                height: 'calc(100vh - 120px)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                className="card-header d-flex align-items-center justify-content-between"
                style={{ background: '#fff', borderBottom: '1px solid #eee' }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={activeConv?.avatar}
                    alt=""
                    className="rounded-circle"
                    style={{ width: 48, height: 48, border: `2px solid ${themeYellow}` }}
                  />
                  <div className="ms-2">
                    <div style={{ fontWeight: 700 }}>{activeConv?.name || 'Select Vendor'}</div>
                    <small className="text-success">● Online</small>
                  </div>
                </div>
              </div>

              <div
                ref={scrollRef}
                style={{ padding: '1rem', overflowY: 'auto', flex: 1, background: '#F7F9FB' }}
              >
                <AnimatePresence>
                  {(activeMessages || []).map((m, i) => (
                    <motion.div
                      key={`${m._id || i}`}
                      className={`d-flex mb-3 ${
                        m.senderId === customerId ? 'justify-content-end' : 'justify-content-start'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ maxWidth: '78%' }}>
                        <div
                          style={{
                            background: m.senderId === customerId ? themeYellow : '#fff',
                            color: '#000',
                            padding: '10px 14px',
                            borderRadius: 16,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          }}
                        >
                          <div>{m.text}</div>
                          <div className="d-flex justify-content-end mt-1">
                            <small className="text-muted" style={{ fontSize: 12 }}>
                              {m.time ? new Date(m.time).toLocaleTimeString() : 'Now'}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="card-footer" style={{ background: '#fff', borderTop: '1px solid #eee' }}>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button
                    className="btn"
                    style={{ background: themeYellow, color: '#000' }}
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
