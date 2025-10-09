// VendorChat.jsx
// Usage: import VendorChat from './VendorChat'; <VendorChat />
// Required in index.html:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
// <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel="stylesheet" />

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NavaPro from './navbarproduct';

const initialConversations = [
  {
    id: 'c1',
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/80?img=47',
    lastMessage: 'Perfect! 2-4 PM works for me.',
    lastTime: '2 min',
    unread: 1,
    tags: ['Urgent', 'Plumbing']
  },
  {
    id: 'c2',
    name: 'Amit Patel',
    avatar: 'https://i.pravatar.cc/80?img=12',
    lastMessage: 'Thanks for the excellent electrical work!',
    lastTime: '1 hour',
    unread: 0,
    tags: ['Completed', 'Electrical']
  },
  {
    id: 'c3',
    name: 'Sunita Reddy',
    avatar: 'https://i.pravatar.cc/80?img=32',
    lastMessage: 'Can you come tomorrow for bathroom repair?',
    lastTime: '3 hours',
    unread: 0,
    tags: ['Pending', 'Plumbing']
  }
];

const initialMessages = {
  c1: [
    { id: 'm1', from: 'customer', text: 'Hi Rajesh! I need urgent help with my kitchen sink. Water is leaking underneath.', time: '10:30 AM', delivered: true },
    { id: 'm2', from: 'vendor', text: 'Hello Priya! I can come today between 2-4 PM. Is that ok?', time: '10:32 AM', delivered: true },
    { id: 'm3', from: 'customer', text: 'Perfect! 2-4 PM works for me. Here are some photos of the issue.', time: '10:35 AM', delivered: true, images: [
      'https://images.unsplash.com/photo-1616628181351-3f0f6b236a62?w=800&q=60',
      'https://images.unsplash.com/photo-1567016521677-8a6a5f1d30b9?w=800&q=60'
    ]},
    { id: 'm4', from: 'vendor', text: 'Thanks — I can see the issue. I will bring the materials. Estimated cost: ₹1,200-1,500.', time: '10:38 AM', delivered: true }
  ],
  c2: [
    { id: 'm1', from: 'customer', text: 'Great service! Will recommend to others.', time: '09:12 AM', delivered: true }
  ],
  c3: [
    { id: 'm1', from: 'customer', text: 'Can you come tomorrow for bathroom repair?', time: 'Yesterday', delivered: true }
  ]
};

export default function VendorChat() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState('c1');
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showProfile, setShowProfile] = useState(true);
  const scrollRef = useRef(null);

  const themeYellow = '#FFD700';
  const lightGray = '#F8F9FA';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, messages]);

  const activeConv = conversations.find(c => c.id === activeId);
  const activeMessages = messages[activeId] || [];

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const newMsg = {
      id: `m${Date.now()}`,
      from: 'vendor',
      text: trimmed,
      time: 'Now',
      delivered: false
    };
    setMessages(prev => {
      const copy = { ...prev };
      copy[activeId] = [...(copy[activeId] || []), newMsg];
      return copy;
    });
    setInput('');
    setTimeout(() => {
      setMessages(prev => {
        const copy = { ...prev };
        copy[activeId] = copy[activeId].map(m => m.id === newMsg.id ? { ...m, delivered: true } : m);
        return copy;
      });
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, lastMessage: trimmed, lastTime: 'Now', unread: 0 } : c));
    }, 600);
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    if (window.innerWidth < 992) setShowSidebar(false);
  };

  const filteredConversations = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <NavaPro />
      <div className="container-fluid" style={{ background: '#fff', minHeight: '100vh', padding: '1.25rem' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary d-lg-none" onClick={() => setShowSidebar(s => !s)}>
              <i className="bi bi-list"></i>
            </button>
            <button className="btn btn-outline-secondary d-lg-none" onClick={() => setShowProfile(s => !s)}>
              <i className="bi bi-person-circle"></i>
            </button>
          </div>
        </div>

        <div className="row g-3">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                className="col-lg-3"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 70 }}
              >
                <div className="card" style={{ borderRadius: 12, height: 'calc(100vh - 120px)', overflow: 'hidden' }}>
                  <div className="card-body p-3" style={{ background: lightGray }}>
                    <div className="d-flex align-items-center mb-3">
                      <motion.img
                        src="https://i.pravatar.cc/80?img=5"
                        alt="me"
                        className="rounded-circle"
                        style={{ width: 56, height: 56, border: `3px solid ${themeYellow}` }}
                        whileHover={{ scale: 1.05 }}
                      />
                      <div className="ms-2">
                        <div style={{ fontWeight: 700 }}>Rajesh Kumar</div>
                        <small className="text-success">● Available</small>
                      </div>
                    </div>

                    <input
                      className="form-control form-control-sm mb-3"
                      placeholder="Search conversations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    <div style={{ overflowY: 'auto', maxHeight: '62vh', paddingRight: 4 }}>
                      {filteredConversations.map(conv => (
                        <motion.div
                          key={conv.id}
                          className={`d-flex align-items-center p-2 mb-2 rounded ${conv.id === activeId ? 'bg-white' : 'bg-light'}`}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSelectConversation(conv.id)}
                          whileHover={{ scale: 1.02 }}
                        >
                          <img src={conv.avatar} alt="" className="rounded-circle" style={{ width: 46, height: 46, border: `2px solid ${themeYellow}` }} />
                          <div className="ms-2 flex-fill">
                            <div className="d-flex justify-content-between">
                              <div style={{ fontWeight: 600 }}>{conv.name}</div>
                              <small className="text-muted">{conv.lastTime}</small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted" style={{ fontSize: 13 }}>{conv.lastMessage}</small>
                              {conv.unread > 0 && <span className="badge rounded-pill" style={{ background: themeYellow, color: '#000' }}>{conv.unread}</span>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <hr />
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-light w-50">+ New Chat</button>
                      <button className="btn btn-sm" style={{ background: themeYellow, color: '#000' }}>Schedule</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <motion.div
            className="col-lg-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card" style={{ borderRadius: 12, height: 'calc(100vh - 120px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="card-header d-flex align-items-center justify-content-between" style={{ background: '#fff', borderBottom: '1px solid #eee' }}>
                <div className="d-flex align-items-center">
                  <img src={activeConv?.avatar} alt="" className="rounded-circle" style={{ width: 48, height: 48, border: `2px solid ${themeYellow}` }} />
                  <div className="ms-2">
                    <div style={{ fontWeight: 700 }}>{activeConv?.name}</div>
                    <small className="text-success">● Online • Last seen: just now</small>
                  </div>
                </div>
                <div className="d-flex gap-2 align-items-center">
                  <span className="badge rounded-pill" style={{ background: '#fff3cd', color: '#856404', border: `1px solid ${themeYellow}` }}>Urgent</span>
                  <button className="btn btn-sm"><i className="bi bi-telephone"></i></button>
                  <button className="btn btn-sm"><i className="bi bi-camera-video"></i></button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} style={{ padding: '1rem', overflowY: 'auto', flex: 1, background: '#F7F9FB' }}>
                <AnimatePresence>
                  {activeMessages.map(m => (
                    <motion.div
                      key={m.id}
                      className={`d-flex mb-3 ${m.from === 'vendor' ? 'justify-content-end' : 'justify-content-start'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ maxWidth: '78%' }}>
                        <div
                          style={{
                            background: m.from === 'vendor' ? themeYellow : '#fff',
                            color: m.from === 'vendor' ? '#000' : '#333',
                            padding: '10px 14px',
                            borderRadius: 16,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          }}
                        >
                          {m.text && <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>}
                          {m.images && (
                            <div className="d-flex gap-2 mt-2">
                              {m.images.map((src, i) => (
                                <img key={i} src={src} alt="img" style={{ width: 120, height: 80, borderRadius: 8, objectFit: 'cover' }} />
                              ))}
                            </div>
                          )}
                          <div className="d-flex justify-content-end mt-1">
                            <small className="text-muted" style={{ fontSize: 12 }}>
                              {m.time} {m.from === 'vendor' && (m.delivered ? <i className="bi bi-check2-all ms-1" /> : <i className="bi bi-check2 ms-1" />)}
                            </small>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Input */}
              <div className="card-footer" style={{ background: '#fff', borderTop: '1px solid #eee' }}>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-light"><i className="bi bi-paperclip"></i></button>
                  <button className="btn btn-light"><i className="bi bi-emoji-smile"></i></button>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button className="btn" style={{ background: themeYellow, color: '#000' }} onClick={handleSend}>
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
