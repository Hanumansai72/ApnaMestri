import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Toast,
  ToastContainer,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NavaPro from "./navbarproduct";
import Footer from "./footer";

// ⭐ Helper to render stars
const renderStars = (rating, color = "#ffc107") => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span style={{ color }}>
      {[...Array(fullStars)].map((_, i) => (
        <i key={`full-${i}`} className="bi bi-star-fill"></i>
      ))}
      {halfStar && <i key="half" className="bi bi-star-half"></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className="bi bi-star"></i>
      ))}
    </span>
  );
};

const ProfessionalServicePage = () => {
  const { id } = useParams(); // vendorId
  const navigate = useNavigate();

  const userId = localStorage.getItem("userid");
  const name = localStorage.getItem("user_name");

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ Now used properly
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [vendorId, setVendorId] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const showToast = (message, variant = "success") =>
    setToast({ show: true, message, variant });

  // 🚀 Navigate to chat
  const handleMessageClick = (vendorId) => {
    if (!userId || userId === "undefined") {
      showToast("Please login to chat with vendor", "danger");
      return;
    }
    navigate(`/customer/chat/${vendorId}`);
  };

  // ✅ Hire vendor
  const booknow = (vendorId) => {
    localStorage.setItem("Customerid", vendorId);
    navigate("/myorder/service");
  };

  // ✅ Fetch vendor details
  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://backend-d6mx.vercel.app/profesionaldetails/${id}`
        );
        const data = await res.json();
        setVendor(data);
        setVendorId(data._id);
      } catch (err) {
        console.error("Error fetching vendor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  // ✅ Fetch projects
  useEffect(() => {
    axios
      .get(`https://backend-d6mx.vercel.app/api/projects/${id}`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, [id]);

  // ✅ Wrap fetchReviews in useCallback (fixes missing dependency warning)
  const fetchReviews = useCallback(() => {
    axios
      .get(`https://backend-d6mx.vercel.app/fetch/review/service/${id}`)
      .then((res) => setReviews(res.data.getreview || []))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, fetchReviews]); // ✅ Dependency fixed

  // ✅ Submit review
  const handleSubmitReview = () => {
    if (!userId || userId === "undefined") {
      showToast("Please log in to submit a review.", "danger");
      return;
    }
    if (!reviewText.trim() || reviewRating === 0) {
      showToast("Please provide a rating and comment.", "danger");
      return;
    }

    axios
      .post(`https://backend-d6mx.vercel.app/review/${userId}`, {
        vendorids: vendorId,
        customerName: name,
        rating: reviewRating,
        comment: reviewText,
      })
      .then(() => {
        showToast("Review submitted successfully!", "success");
        setReviewText("");
        setReviewRating(0);
        setShowReviewForm(false);
        fetchReviews();
      })
      .catch((err) => {
        console.error(err);
        showToast("Failed to submit review.", "danger");
      });
  };

  // ✅ Loading and fallback states
  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" style={{ color: "#FFD700" }} />
        <p className="mt-2">Loading Service Details...</p>
      </div>
    );

  if (!vendor)
    return (
      <div className="text-center mt-5">
        <h4>No vendor found.</h4>
      </div>
    );

  return (
    <>
      <NavaPro />
      <Container className="py-4" style={{ background: "#fff" }}>
        {/* Header */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <Row>
            <Col md={2} className="text-center">
              {vendor.Profile_Image ? (
                <img
                  src={vendor.Profile_Image}
                  alt="profile"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid #FFD700",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    backgroundColor: "#FFD700",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "2rem",
                    border: "3px solid #FFD700",
                  }}
                >
                  {vendor.Business_Name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </Col>
            <Col md={7}>
              <h3>{vendor.Owner_name}</h3>
              <h6 className="text-muted">{vendor.Business_Name}</h6>
              <p className="text-secondary">{vendor.Business_address}</p>
            </Col>
            <Col md={3} className="text-md-end text-center">
              <Button
                style={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  border: "none",
                }}
                className="mb-2 w-100"
                onClick={() => booknow(vendor._id)}
              >
                Hire Now
              </Button>
              <Button
                variant="outline-dark"
                className="w-100"
                onClick={() => handleMessageClick(vendor._id)}
              >
                Message
              </Button>
            </Col>
          </Row>
        </Card>

        {/* About */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <h5>About {vendor.Owner_name}</h5>
          <p>
            {vendor.description} <br />
            <strong>Category:</strong> {vendor.Category} (
            {vendor.Sub_Category?.join(", ")})
          </p>
        </Card>

        {/* Projects */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Recent Projects</h5>
          </div>
          <Row>
            {projects.length > 0 ? (
              projects.map((project) => (
                <Col md={4} key={project._id} className="mb-3">
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Img
                      variant="top"
                      src={project.image}
                      alt={project.title}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{project.title}</Card.Title>
                      <p className="text-muted mb-1">{project.category}</p>
                      <p>{project.description}</p>
                      <small className="text-secondary">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No projects uploaded yet.</p>
            )}
          </Row>
        </Card>

        {/* Reviews */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Client Reviews</h5>
            <span className="fw-bold">
              ⭐{" "}
              {reviews.length
                ? (
                    reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
                  ).toFixed(1)
                : 0}{" "}
              ({reviews.length} reviews)
            </span>
          </div>
          <Row>
            {reviews.length === 0 && (
              <p>No reviews yet. Be the first to review!</p>
            )}
            {reviews.map((rev, i) => (
              <Col md={6} key={i} className="mb-3">
                <Card className="p-3 shadow-sm border-0">
                  <h6>{rev.customerName}</h6>
                  <div className="mb-2">{renderStars(rev.rating)}</div>
                  <p className="mb-0">{rev.comment}</p>
                  <small className="text-secondary">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </small>
                </Card>
              </Col>
            ))}
          </Row>

          {showReviewForm ? (
            <div className="review-form p-3 mt-3">
              <Form.Group className="mb-2">
                <Form.Label>Rating</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={5}
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </Form.Group>
              <Button
                style={{
                  backgroundColor: "#FFD700",
                  border: "none",
                  color: "#000",
                }}
                onClick={handleSubmitReview}
              >
                Submit Review
              </Button>
            </div>
          ) : (
            <Button
              className="mt-3"
              style={{
                backgroundColor: "#FFD700",
                border: "none",
                color: "#000",
              }}
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </Button>
          )}
        </Card>
      </Container>

      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          bg={toast.variant}
          delay={3000}
          autohide
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />
    </>
  );
};

export default ProfessionalServicePage;
