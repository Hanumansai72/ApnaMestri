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
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { useAuth } from "../Auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaMapMarkerAlt,
  FaComments,
  FaBriefcase,
  FaInfoCircle,
  FaCheckCircle,
  FaArrowRight,
  FaTrophy
} from 'react-icons/fa';

// ⭐ Helper to render stars
const renderStars = (rating, color = "#FFD700") => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <span className="d-flex gap-1" style={{ color }}>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} />
      ))}
      {halfStar && <i className="bi bi-star-half"></i>}
      {[...Array(emptyStars)].map((_, i) => (
        <i key={`empty-${i}`} className="bi bi-star"></i>
      ))}
    </span>
  );
};

const ProfessionalServicePage = () => {
  const { id } = useParams(); // vendorId
  const navigate = useNavigate();

  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const name = authUser?.fullName || authUser?.user_name;

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const primaryColor = '#FFD700'; // Gold
  const secondaryColor = '#1A202C'; // Dark slate
  const softBg = '#F8FAFC';

  const showToast = (message, variant = "success") =>
    setToast({ show: true, message, variant });

  const handleMessageClick = (vId) => {
    if (!userId) {
      showToast("Please login to chat with vendor", "danger");
      return;
    }
    navigate(`/customer/chat/${vId}`);
  };

  const booknow = (vId) => {
    localStorage.setItem("Customerid", vId);
    navigate("/myorder/service");
  };

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/profesionaldetails/${id}`);
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

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/projects/${id}`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error("Error fetching projects:", err));
  }, [id]);

  const fetchReviews = useCallback(() => {
    axios
      .get(`${API_BASE_URL}/fetch/review/service/${id}`)
      .then((res) => setReviews(res.data.getreview || []))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [id]);

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, fetchReviews]);

  const handleSubmitReview = () => {
    if (!userId) {
      showToast("Please log in to submit a review.", "danger");
      return;
    }
    if (!reviewText.trim() || reviewRating === 0) {
      showToast("Please provide a rating and comment.", "danger");
      return;
    }

    axios
      .post(`${API_BASE_URL}/review/${userId}`, {
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

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: '60px', height: '60px', border: `4px solid ${primaryColor}`, borderRadius: '50%', borderTopColor: 'transparent' }}
        />
        <p className="mt-4 fw-bold text-muted">Curating Professional Excellence...</p>
      </div>
    );

  if (!vendor)
    return (
      <div className="text-center mt-5">
        <h4>No vendor found.</h4>
      </div>
    );

  const averageRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <>
      <NavaPro />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .service-page-container {
          background-color: ${softBg};
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-top: 2rem;
          padding-bottom: 5rem;
        }

        .profile-header-card {
          background: white;
          border: none;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.03);
          overflow: hidden;
          position: relative;
        }

        .profile-banner {
          height: 160px;
          background: linear-gradient(135deg, ${secondaryColor} 0%, #2D3748 100%);
          position: relative;
        }

        .profile-image-container {
          position: relative;
          margin-top: -60px;
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .profile-img {
          width: 140px;
          height: 140px;
          border-radius: 35px;
          border: 6px solid white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          object-fit: cover;
          background: ${primaryColor};
        }

        .profile-init {
          width: 140px;
          height: 140px;
          border-radius: 35px;
          border: 6px solid white;
          background: ${primaryColor};
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 3rem;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .badge-verified {
          background: ${primaryColor};
          color: black;
          font-weight: 800;
          border-radius: 10px;
          font-size: 0.75rem;
          padding: 6px 14px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 1rem;
        }

        .section-card {
          background: white;
          border: none;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          transition: transform 0.3s ease;
        }

        .project-card {
          border-radius: 20px;
          overflow: hidden;
          border: none;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .project-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 30px rgba(0,0,0,0.1);
        }

        .project-img {
          height: 220px;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .project-card:hover .project-img {
          transform: scale(1.08);
        }

        .project-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 220px;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          opacity: 0;
          transition: opacity 0.4s;
          display: flex;
          align-items: flex-end;
          padding: 1.5rem;
          color: white;
        }

        .project-card:hover .project-overlay {
          opacity: 1;
        }

        .btn-hire {
          background: linear-gradient(135deg, ${primaryColor}, #FFC300);
          color: black;
          border: none;
          font-weight: 800;
          padding: 14px 28px;
          border-radius: 16px;
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
          transition: all 0.3s;
          letter-spacing: 0.05em;
        }

        .btn-hire:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(255, 215, 0, 0.4);
          background: linear-gradient(135deg, #FFC300, ${primaryColor});
        }

        .btn-message {
          background: white;
          color: ${secondaryColor};
          border: 2px solid #E2E8F0;
          font-weight: 800;
          padding: 12px 28px;
          border-radius: 16px;
          transition: all 0.3s;
        }

        .btn-message:hover {
          background: ${secondaryColor};
          color: white;
          border-color: ${secondaryColor};
          transform: translateY(-3px);
        }

        .review-card {
          background: #F8FAFC;
          border: none;
          border-radius: 20px;
          padding: 1.5rem;
          height: 100%;
          border: 1px solid #EDF2F7;
          transition: all 0.3s;
        }

        .review-card:hover {
          background: white;
          border-color: ${primaryColor};
          box-shadow: 0 10px 20px rgba(0,0,0,0.03);
        }

        .star-rating-pill {
          background: ${secondaryColor};
          color: white;
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .rating-input-star {
          font-size: 1.5rem;
          cursor: pointer;
          color: #E2E8F0;
          transition: color 0.2s;
        }

        .rating-input-star.active {
          color: ${primaryColor};
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .section-title-fancy {
          font-weight: 800;
          color: ${secondaryColor};
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .divider-line {
          height: 4px;
          width: 50px;
          background: ${primaryColor};
          border-radius: 10px;
          margin-bottom: 2rem;
        }
      `}</style>

      <motion.div
        className="service-page-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Container>
          {/* Main Profile Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="profile-header-card mb-5">
              <div className="profile-banner">
                <div style={{ position: 'absolute', top: '20px', right: '30px' }}>
                  <div className="star-rating-pill">
                    <FaStar style={{ color: primaryColor }} />
                    <span>{averageRating}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({reviews.length} Reviews)</span>
                  </div>
                </div>
              </div>
              <Row className="px-4 pb-4">
                <Col lg={8}>
                  <div className="profile-image-container">
                    {vendor.Profile_Image ? (
                      <img src={vendor.Profile_Image} alt="profile" className="profile-img" />
                    ) : (
                      <div className="profile-init">
                        {vendor.Business_Name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <div className="ps-md-4">
                    <div className="badge-verified">
                      <FaCheckCircle /> CERTIFIED PRO
                    </div>
                    <h1 className="fw-800 text-dark mb-1">{vendor.Owner_name}</h1>
                    <h5 className="text-muted mb-3 fw-600">{vendor.Business_Name}</h5>
                    <div className="d-flex flex-wrap gap-4 text-secondary mb-4">
                      <span className="d-flex align-items-center gap-2">
                        <FaMapMarkerAlt className="text-danger" /> {vendor.Business_address}
                      </span>
                      <span className="d-flex align-items-center gap-2">
                        <FaBriefcase className="text-warning" /> {vendor.Category}
                      </span>
                    </div>
                  </div>
                </Col>
                <Col lg={4} className="d-flex flex-column justify-content-center pt-lg-5">
                  <div className="d-grid gap-3">
                    <Button
                      className="btn-hire d-flex align-items-center justify-content-center gap-2"
                      onClick={() => booknow(vendor._id)}
                    >
                      HIRE FOR SERVICE <FaArrowRight />
                    </Button>
                    <Button
                      className="btn-message d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleMessageClick(vendor._id)}
                    >
                      <FaComments /> CHAT WITH PRO
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>

          <Row className="g-4">
            {/* About Section */}
            <Col lg={4}>
              <motion.div
                className="sticky-top"
                style={{ top: '24px' }}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="section-card p-4">
                  <h5 className="section-title-fancy"><FaInfoCircle className="text-warning" /> Bio</h5>
                  <div className="divider-line"></div>
                  <p className="text-secondary leading-relaxed" style={{ fontSize: '0.95rem' }}>
                    {vendor.description}
                  </p>
                  <div className="mt-4">
                    <h6 className="fw-bold text-dark mb-2">Expertise</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {vendor.Sub_Category?.map((sub, i) => (
                        <Badge key={i} bg="light" className="text-dark p-2 px-3 rounded-pill border fw-bold" style={{ fontSize: '0.75rem' }}>
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 p-4 bg-light rounded-4 border border-white text-center">
                    <FaTrophy className="text-warning fs-1 mb-3" />
                    <h6 className="fw-bold">Platform Guaranteed</h6>
                    <p className="smaller text-muted mb-0">Secure payments and expert satisfaction guaranteed.</p>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Projects & Reviews Column */}
            <Col lg={8}>
              {/* Projects Section */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="section-header">
                  <h3 className="section-title-fancy"><FaBriefcase className="text-warning" /> Project Portfolio</h3>
                </div>
                <div className="divider-line"></div>
                <Row className="g-4 mb-5">
                  {projects.length > 0 ? (
                    projects.map((project, index) => (
                      <Col md={6} key={project._id}>
                        <motion.div
                          whileHover={{ y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="project-card h-100">
                            <div className="position-relative overflow-hidden">
                              <Card.Img
                                variant="top"
                                src={project.image}
                                className="project-img"
                              />
                              <div className="project-overlay">
                                <div>
                                  <Badge bg="warning" text="dark" className="fw-bold mb-2">{project.category}</Badge>
                                  <h6 className="fw-bold mb-0">{new Date(project.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h6>
                                </div>
                              </div>
                            </div>
                            <Card.Body className="p-4">
                              <Card.Title className="fw-800 text-dark">{project.title}</Card.Title>
                              <Card.Text className="text-secondary smaller">
                                {project.description}
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        </motion.div>
                      </Col>
                    ))
                  ) : (
                    <div className="text-center py-5 w-100 bg-white rounded-5 border-dashed">
                      <p className="text-muted">No projects showcased yet.</p>
                    </div>
                  )}
                </Row>
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="section-card p-4 p-md-5">
                  <div className="section-header">
                    <h3 className="section-title-fancy"><FaComments className="text-warning" /> Client Feedback</h3>
                    <Button
                      className="btn-hire py-2 px-4 shadow-none"
                      onClick={() => setShowReviewForm(!showReviewForm)}
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write Review'}
                    </Button>
                  </div>
                  <div className="divider-line"></div>

                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-light p-4 rounded-4 mb-4 border">
                          <Form.Group className="mb-4 text-center">
                            <Form.Label className="d-block fw-bold text-dark mb-3">Rate your experience</Form.Label>
                            <div className="d-flex justify-content-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  className={`rating-input-star ${reviewRating >= star ? 'active' : ''}`}
                                  onClick={() => setReviewRating(star)}
                                />
                              ))}
                            </div>
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-dark">Your Testimonial</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={4}
                              className="border-0 shadow-sm rounded-4 p-3"
                              placeholder="Describe your service experience..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                            />
                          </Form.Group>
                          <div className="text-end">
                            <Button
                              className="btn-hire px-5 py-3"
                              onClick={handleSubmitReview}
                            >
                              POST REVIEW
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Row className="g-4">
                    {reviews.length === 0 ? (
                      <div className="text-center py-5 w-100">
                        <p className="text-muted">Be the first professional client to leave a review!</p>
                      </div>
                    ) : (
                      reviews.map((rev, i) => (
                        <Col md={12} key={i}>
                          <motion.div
                            className="review-card"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <h6 className="fw-800 text-dark mb-1">{rev.customerName}</h6>
                                <div className="smaller text-muted">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              </div>
                              {renderStars(rev.rating)}
                            </div>
                            <p className="text-secondary mb-0 fw-500 italic">
                              "{rev.comment}"
                            </p>
                          </motion.div>
                        </Col>
                      ))
                    )}
                  </Row>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.div>

      <ToastContainer className="p-4" position="bottom-end">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          bg={toast.variant}
          delay={3000}
          autohide
          className="border-0 shadow-lg rounded-4"
        >
          <Toast.Body className={toast.variant === 'success' ? 'text-white fw-bold' : 'text-danger fw-bold'}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Footer />
    </>
  );
};

export default ProfessionalServicePage;
