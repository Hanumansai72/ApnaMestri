import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Pagination, Form, InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import API_BASE_URL from "../../../config";
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../Layout/footer';
import NavaPro from '../Layout/navbarproduct';
import { useAuth } from '../Auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaFilter,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaClock,
  FaUserTie
} from 'react-icons/fa';

const ITEMS_PER_PAGE = 6;

const ProfessionalListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorlist, setVendorList] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [subcategoryFilter, setSubcategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search') || 'Plumber';

  const primaryColor = '#FFD700'; // Gold
  const secondaryColor = '#1A202C'; // Dark slate
  const softBg = '#F8FAFC';

  function booknow(vendorId) {
    localStorage.setItem("Customerid", vendorId);
    navigate("/myorder/service");
  }

  function viewDetails(vendorId) {
    navigate(`/service/details/${vendorId}`);
  }

  // Fetch vendors
  useEffect(() => {
    setLoading(true);
    fetchVendors(search);
  }, [search]);

  const fetchVendors = (category) => {
    let url = `${API_BASE_URL}/fetch/services?category=${encodeURIComponent(category)}`;

    axios
      .get(url)
      .then((res) => {
        const list = res.data.services || [];
        setVendorList(list);
        setFilteredVendors(list);
        setDescription(res.data.description || "Find skilled professionals across India.");
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error fetching vendors:", err);
        setVendorList([]);
        setFilteredVendors([]);
        setDescription("");
      })
      .finally(() => setLoading(false));
  };

  // Apply filters
  useEffect(() => {
    let results = [...vendorlist];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      results = results.filter(v =>
        v.Business_Name?.toLowerCase().includes(lower) ||
        v.Sub_Category?.some(sub => sub.toLowerCase().includes(lower)) ||
        v.Description?.toLowerCase().includes(lower)
      );
    }

    if (subcategoryFilter !== 'All') {
      results = results.filter(v => v.Sub_Category?.includes(subcategoryFilter));
    }

    if (priceFilter !== 'All') {
      results = results.filter(v => {
        const price = parseFloat(v.Charge_Per_Hour_or_Day);
        if (priceFilter === 'Low') return price < 500;
        if (priceFilter === 'Medium') return price >= 500 && price <= 1500;
        if (priceFilter === 'High') return price > 1500;
        return true;
      });
    }

    setFilteredVendors(results);
    setCurrentPage(1);
  }, [searchTerm, subcategoryFilter, priceFilter, vendorlist]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const subcategories = ["All", "Plumber", "Electrician", "Painter", "Carpenter", "Mechanic", "Welder", "Technician"];

  return (
    <>
      <NavaPro />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .vendor-page {
          background-color: ${softBg};
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-bottom: 5rem;
        }

        .hero-section {
          background: radial-gradient(circle at 0% 0%, ${secondaryColor} 0%, #2D3748 100%);
          color: white;
          padding: 6rem 0 8rem 0;
          margin-bottom: 0;
          position: relative;
          overflow: hidden;
        }

        .hero-section::after {
          content: '';
          position: absolute;
          top: -10%;
          right: -5%;
          width: 300px;
          height: 300px;
          background: ${primaryColor};
          filter: blur(150px);
          opacity: 0.15;
          border-radius: 50%;
        }

        .filter-bar {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          padding: 2rem;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.06);
          margin-top: -4rem;
          margin-bottom: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.5);
          position: relative;
          z-index: 10;
        }

        .filter-label {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94A3B8;
          margin-bottom: 0.5rem;
          display: block;
        }

        .custom-select, .custom-input {
          background: #F1F5F9 !important;
          border: none !important;
          border-radius: 12px !important;
          padding: 12px 16px !important;
          font-weight: 600 !important;
          font-size: 0.9rem !important;
          color: ${secondaryColor} !important;
        }

        .custom-input:focus {
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.2) !important;
          background: white !important;
        }

        .vendor-card {
           border: 1px solid rgba(226, 232, 240, 0.8);
           border-radius: 28px;
           overflow: hidden;
           background: rgba(255, 255, 255, 0.9);
           backdrop-filter: blur(10px);
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
           box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
           height: 100%;
           display: flex;
           flex-direction: column;
        }

        .vendor-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 25px 40px -10px rgba(0, 0, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .card-profile-header {
          position: relative;
          height: 100px;
          background: linear-gradient(to right, ${secondaryColor}, #2D3748);
          margin-bottom: 50px;
        }

        .profile-img-glow {
          position: absolute;
          bottom: -40px;
          left: 24px;
          width: 90px;
          height: 90px;
          border-radius: 24px;
          background: white;
          padding: 4px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          z-index: 2;
        }

        .profile-img-main {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          object-fit: cover;
          background: ${softBg};
        }

        .badge-verified-mini {
          position: absolute;
          top: 15px;
          right: 20px;
          background: ${primaryColor};
          color: black;
          font-weight: 800;
          font-size: 0.65rem;
          padding: 6px 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vendor-category-badge {
          background: ${softBg};
          color: #64748B;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.7rem;
          padding: 6px 12px;
          border: 1px solid #E2E8F0;
        }

        .price-badge {
          background: rgba(34, 197, 94, 0.1);
          color: #16A34A;
          padding: 8px 16px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1rem;
        }

        .btn-hire-now {
          background: linear-gradient(135deg, ${primaryColor}, #FFC300);
          border: none;
          color: black;
          font-weight: 800;
          padding: 12px 24px;
          border-radius: 16px;
          transition: all 0.3s;
          letter-spacing: 0.02em;
        }

        .btn-hire-now:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(255, 215, 0, 0.3);
        }

        .btn-details-round {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid #F1F5F9;
          border-radius: 16px;
          color: ${secondaryColor};
          transition: all 0.3s;
        }

        .btn-details-round:hover {
          background: ${secondaryColor};
          color: white;
          border-color: ${secondaryColor};
          transform: rotate(-15deg);
        }

        .pagination-container {
          margin-top: 4rem;
        }

        .page-link-custom {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px !important;
          margin: 0 4px;
          font-weight: 700;
          border: none;
          background: white;
          color: ${secondaryColor} !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          transition: all 0.3s;
          cursor: pointer;
        }

        .page-item.active .page-link-custom {
          background: ${primaryColor} !important;
          color: black !important;
          box-shadow: 0 8px 15px rgba(255, 215, 0, 0.3);
        }

        .page-item.disabled .page-link-custom {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          padding: 5rem 0;
          text-align: center;
        }
      `}</style>

      <div className="vendor-page">
        {/* HERO SECTION */}
        <div className="hero-section">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={8}>
                <motion.div
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold mb-3">EXPERTS ON CALL</Badge>
                  <h1 className="display-4 fw-800 mb-3 tracking-tight">
                    Hire the <span style={{ color: primaryColor }}>Best Skills</span> for Your Home
                  </h1>
                  <p className="lead opacity-75 mb-0" style={{ fontWeight: 500 }}>
                    {description || "Connecting you with verified professionals instantly."}
                  </p>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </div>

        <Container>
          {/* FANCY FILTER BAR */}
          <motion.div
            className="filter-bar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Row className="g-4 align-items-end">
              <Col lg={5}>
                <span className="filter-label">Quick Search</span>
                <InputGroup className="bg-light rounded-4 overflow-hidden shadow-none" style={{ background: '#F1F5F9' }}>
                  <InputGroup.Text className="bg-transparent border-0 pe-0">
                    <FaSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, skill, or service..."
                    className="custom-input bg-transparent border-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>

              <Col md={3} lg={3}>
                <span className="filter-label">Category Filter</span>
                <Form.Select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  className="custom-select"
                >
                  {subcategories.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3} lg={3}>
                <span className="filter-label">Price Range</span>
                <Form.Select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="custom-select"
                >
                  <option value="All">All Ranges</option>
                  <option value="Low">Economic (Below ₹500)</option>
                  <option value="Medium">Standard (₹500 - ₹1500)</option>
                  <option value="High">Premium (Above ₹1500)</option>
                </Form.Select>
              </Col>

              <Col md={1} lg={1} className="d-flex justify-content-center">
                <Button variant="light" className="rounded-4 p-3 border-0 bg-light" onClick={() => { setSearchTerm(''); setSubcategoryFilter('All'); setPriceFilter('All'); }}>
                  <FaFilter className="text-warning" />
                </Button>
              </Col>
            </Row>
          </motion.div>

          <div className="d-flex justify-content-between align-items-center mb-4 ps-2">
            <div>
              <h4 className="fw-800 text-dark mb-0">Professional Directory</h4>
              <p className="text-muted small mb-0">Discover top-rated experts in your area</p>
            </div>
            <span className="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-bold">
              {filteredVendors.length} PROS FOUND
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="d-inline-block p-4 bg-white rounded-5 shadow-sm">
                <Spinner animation="grow" style={{ color: primaryColor }} />
              </div>
              <p className="mt-4 fw-bold text-muted">Refreshing expert list...</p>
            </div>
          ) : (
            <Row className="g-4">
              <AnimatePresence>
                {paginatedVendors.length === 0 ? (
                  <Col xs={12}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="empty-state bg-white rounded-5 border-dashed p-5"
                    >
                      <div className="bg-light d-inline-block p-4 rounded-circle mb-4">
                        <FaUserTie className="text-muted display-4" />
                      </div>
                      <h3 className="fw-bold text-dark">No matches found</h3>
                      <p className="text-muted">Try adjusting your filters or search keywords.</p>
                      <Button className="btn-hire-now px-5" onClick={() => { setSearchTerm(''); setSubcategoryFilter('All'); setPriceFilter('All'); }}>
                        RESET ALL FILTERS
                      </Button>
                    </motion.div>
                  </Col>
                ) : (
                  paginatedVendors.map((vendor, index) => (
                    <Col key={vendor._id || index} xs={12} md={6} lg={4}>
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: (index % 3) * 0.1 }}
                        className="h-100"
                      >
                        <Card className="vendor-card">
                          <div className="card-profile-header">
                            <div className="badge-verified-mini">
                              <FaCheckCircle /> VERIFIED
                            </div>
                            <div className="profile-img-glow">
                              {vendor.Profile_Image ? (
                                <img src={vendor.Profile_Image} alt="profile" className="profile-img-main" />
                              ) : (
                                <div className="profile-img-main d-flex align-items-center justify-content-center bg-dark text-warning fs-4 fw-800">
                                  {vendor.Business_Name?.charAt(0)?.toUpperCase() || "V"}
                                </div>
                              )}
                            </div>
                          </div>

                          <Card.Body className="p-4 pt-4">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="fw-800 text-dark text-truncate mb-0" style={{ maxWidth: '70%' }}>
                                {vendor.Business_Name}
                              </h5>
                              <div className="d-flex align-items-center gap-1 text-warning smaller fw-bold">
                                <FaStar /> <span>4.8</span>
                              </div>
                            </div>

                            <p className="text-muted smaller d-flex align-items-center gap-2 mb-3">
                              <FaMapMarkerAlt className="text-danger" /> {vendor.Business_address || 'Serviceable India-wide'}
                            </p>

                            <div className="d-flex flex-wrap gap-2 mb-4" style={{ minHeight: '30px' }}>
                              {Array.isArray(vendor.Sub_Category) && vendor.Sub_Category.length > 0 ? (
                                vendor.Sub_Category.slice(0, 2).map((sub, i) => (
                                  <span key={i} className="vendor-category-badge">{sub}</span>
                                ))
                              ) : (
                                <span className="vendor-category-badge">Professional</span>
                              )}
                              {vendor.Sub_Category?.length > 2 && <span className="vendor-category-badge">+{vendor.Sub_Category.length - 2}</span>}
                            </div>

                            <div className="mb-4">
                              <p className="text-muted smaller mb-0" style={{ height: '42px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {vendor.Description || "Reliable expert dedicated to delivering top-notch service quality with years of industrial experience."}
                              </p>
                            </div>

                            <div className="d-flex align-items-center justify-content-between p-3 rounded-4 bg-light border border-white mb-4">
                              <div className="d-flex align-items-center gap-2">
                                <FaClock className="text-muted" />
                                <span className="smaller fw-bold text-secondary">Hourly Base</span>
                              </div>
                              <div className="price-badge">
                                ₹{vendor.Charge_Per_Hour_or_Day || '499'}
                              </div>
                            </div>

                            <div className="d-flex gap-3">
                              <button
                                className="btn-hire-now flex-grow-1"
                                onClick={() => booknow(vendor._id)}
                              >
                                BOOK EXPERT
                              </button>
                              <button
                                className="btn-details-round"
                                onClick={() => viewDetails(vendor._id)}
                                title="View Profile"
                              >
                                <FaArrowRight />
                              </button>
                            </div>
                          </Card.Body>
                        </Card>
                      </motion.div>
                    </Col>
                  ))
                )}
              </AnimatePresence>
            </Row>
          )}

          {/* FANCY PAGINATION */}
          {!loading && totalPages > 1 && (
            <div className="pagination-container d-flex justify-content-center">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="page-item"
                  linkClassName="page-link-custom"
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx}
                    active={idx + 1 === currentPage}
                    onClick={() => setCurrentPage(idx + 1)}
                    className="page-item"
                    linkClassName="page-link-custom"
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="page-item"
                  linkClassName="page-link-custom"
                />
              </Pagination>
            </div>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default ProfessionalListPage;
