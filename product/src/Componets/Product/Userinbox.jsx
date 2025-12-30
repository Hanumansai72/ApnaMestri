import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import NavaPro from "./navbarproduct";
import Footer from "./footer";



export default function UserInbox() {
  const customerId = localStorage.getItem("userid");
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!customerId) return;

    axios
      .get(`${API_BASE_URL}/api/chat/inbox/user/${customerId}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("User inbox error:", err));
  }, [customerId]);

  return (
    <>
      <NavaPro></NavaPro>
      <div className="container py-3">
        <h5 className="mb-3">Chats</h5>

        {conversations.length === 0 && (
          <p className="text-muted">No conversations yet</p>
        )}

        {conversations.map((c) => (
          <div
            key={c._id}
            className="d-flex align-items-center p-2 mb-2 rounded bg-light"
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/customer/chat/${c.vendorId._id}`)
            }
          >
            <img
              src={c.vendorId.Profile_Image || "https://i.pravatar.cc/60"}
              alt=""
              className="rounded-circle me-2"
              width="46"
              height="46"
            />
            <div>
              <div style={{ fontWeight: 600 }}>
                {c.vendorId.Business_Name}
              </div>
              <small className="text-muted">{c.lastMessage}</small>
            </div>
          </div>
        ))}
      </div>
      <Footer></Footer>
    </>
  );
}
