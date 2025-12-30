import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { useAuth } from "../Auth/AuthContext";

export default function UserInbox() {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat/conversations/user/${userId}`);
        setConversations(res.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };

    fetchConversations();
  }, [userId]);

  return (
    <>
      <NavaPro />
      <div className="container py-5">
        <h2 className="mb-4">My Conversations</h2>
        {conversations.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3">
            <i className="bi bi-chat-dots fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted">No conversations yet.</p>
            <Link to="/service" className="btn btn-warning">Browse Services</Link>
          </div>
        ) : (
          <div className="row g-3">
            {conversations.map((conv) => (
              <div key={conv._id} className="col-12 col-md-6 col-lg-4">
                <div
                  className="card h-100 shadow-sm border-0 cursor-pointer"
                  onClick={() => navigate(`/customer/chat/${conv.vendorId?._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="card-body d-flex align-items-center">
                    <img
                      src={conv.vendorId?.Profile_Image || "https://i.pravatar.cc/80?img=1"}
                      alt=""
                      className="rounded-circle me-3"
                      style={{ width: 60, height: 60, objectFit: "cover", border: "2px solid #FFD700" }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-bold">{conv.vendorId?.Owner_name || "Vendor"}</h6>
                      <small className="text-muted">{conv.vendorId?.Business_Name}</small>
                      <div className="mt-1">
                        <small className="text-truncate d-block text-secondary" style={{ maxWidth: "180px" }}>
                          {conv.lastMessage || "Click to chat"}
                        </small>
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted ms-auto"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
