import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { useAuth } from "../Auth/AuthContext";

export default function UserInbox() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat/conversations/user/${userId}`);
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [userId]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-soft">
      <NavaPro />

      <style>{`
        .bg-soft { background-color: #f8f9fa; }
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
        }
        .chat-item {
          transition: all 0.3s ease;
          border-radius: 15px;
          border: 1px solid transparent;
        }
        .chat-item:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
          transform: translateY(-2px);
        }
        .avatar-container {
          position: relative;
          width: 55px;
          height: 55px;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 15px;
          border: 2px solid #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .online-status {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border: 2px solid #fff;
          border-radius: 50%;
        }
        .unread-dot {
          width: 10px;
          height: 10px;
          background: #f59e0b;
          border-radius: 50%;
        }
      `}</style>

      <div className="container py-5 flex-grow-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 d-flex align-items-center justify-content-between"
        >
          <div>
            <h1 className="fw-900 mb-1" style={{ letterSpacing: '-1px' }}>Messages</h1>
            <p className="text-muted">Connect with your service professionals</p>
          </div>
          <div className="d-none d-md-block">
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
              {conversations.length} Active Conversations
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-5 glass-card"
          >
            <div className="mb-4">
              <i className="bi bi-chat-heart text-warning" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3 className="fw-bold">No active chats</h3>
            <p className="text-muted mb-4 px-4">Start a conversation with a professional to discuss your needs.</p>
            <button
              onClick={() => navigate('/service')}
              className="btn btn-warning btn-lg rounded-pill px-5 fw-bold shadow-sm"
            >
              Find Experts
            </button>
          </motion.div>
        ) : (
          <div className="row g-4">
            <AnimatePresence>
              {conversations.map((conv, idx) => (
                <motion.div
                  key={conv._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="col-12 col-md-6 col-xl-4"
                >
                  <div
                    className="glass-card p-3 chat-item cursor-pointer h-100 d-flex align-items-center"
                    onClick={() => navigate(`/customer/chat/${conv.vendorId?._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="avatar-container me-3">
                      <img
                        src={conv.vendorId?.Profile_Image || `https://ui-avatars.com/api/?name=${conv.vendorId?.Owner_name || 'V'}&background=random`}
                        alt=""
                        className="avatar-img"
                      />
                      <div className="online-status"></div>
                    </div>

                    <div className="flex-grow-1 overflow-hidden">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 className="mb-0 fw-800 text-truncate pe-2">
                          {conv.vendorId?.Owner_name || "Professional"}
                        </h6>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </small>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: '85%' }}>
                          {conv.lastMessage || "Started a conversation..."}
                        </small>
                        <div className="unread-dot"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
