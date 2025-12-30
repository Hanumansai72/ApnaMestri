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
import { FaSearch, FaFilter, FaStar, FaArrowRight } from 'react-icons/fa';

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

  function booknow(vendorId) {
    localStorage.setItem("Customerid", vendorId);
    navigate("/myorder/service");
  }

  function viewDetails(vendorId) {
    navigate(`/service/details/${vendorId}`);
  }

  // Fetch vendors (no location detection)
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
      .catch(() => {
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
        .vendor-page {
          background-color: #F7FAFC;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .hero-section {
          background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
          color: white;
          padding: 3rem 0;
          margin-bottom: 2rem;
          border-radius: 0 0 30px 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .filter-bar {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          margin-top: -3rem;
          margin-bottom: 2rem;
        }
        .vendor-card {
           border: none;
           border-radius: 16px;
           overflow: hidden;
           background: white;
           transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
           box-shadow: 0 4px 12px rgba(0,0,0,0.05);
           height: 100%;
        }
        .vendor-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }
        .profile-img-container {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .profile-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid #FFD700;
          object-fit: cover;
        }
        .pagination .page-item.active .page-link {
          background-color: #FFD700;
          border-color: #FFD700;
          color: black;
        }
        .pagination .page-link {
          color: #2D3748;
          border: none;
          margin: 0 2px;
          border-radius: 8px;
        }
        .btn-primary-custom {
          background-color: #FFD700;
          border: none;
          color: black;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 16px;
          transition: all 0.2s;
        }
        .btn-primary-custom:hover {
          background-color: #FFC300;
          transform: scale(1.05);
          color: black;
        }
        .btn-outline-custom {
          border: 2px solid #E2E8F0;
          background: transparent;
          color: #4A5568;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 16px;
          transition: all 0.2s;
        }
        .btn-outline-custom:hover {
           border-color: #FFD700;
           color: black;
           background: #FFF9E6;
        }
      `}</style>

      <div className="vendor-page">
        {/* HERO HEADER */}
        <div className="hero-section">
          <Container className="text-center">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fw-bold mb-3"
            >
              Find Trusted <span style={{ color: '#FFD700' }}>Professionals</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lead opacity-75 mb-5"
            >
              {description}
            </motion.p>
          </Container>
        </div>

        <Container>
          {/* SEARCH & FILTER BAR */}
          <motion.div
            className="filter-bar"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Row className="g-3 align-items-center">
              <Col md={5}>
                <InputGroup>
                  <InputGroup.Text className="bg-white border-end-0">
                    <FaSearch className="text-warning" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by name, skill..."
                    className="border-start-0 ps-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={subcategoryFilter}
                  onChange={(e) => setSubcategoryFilter(e.target.value)}
                  className="border-0 bg-light"
                >
                  {subcategories.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="border-0 bg-light"
                >
                  <option value="All">All Prices</option>
                  <option value="Low">Below ₹500</option>
                  <option value="Medium">₹500 - ₹1500</option>
                  <option value="High">Above ₹1500</option>
                </Form.Select>
              </Col>

              <Col md={1} className="text-center">
                <div className="text-muted small">
                  <FaFilter className="me-1" />
                </div>
              </Col>
            </Row>
          </motion.div>

          {/* RESULTS GRID */}
          <div className="d-flex justify-content-between align-items-center mb-4 px-2">
            <span className="text-muted fw-semibold">
              Showing {paginatedVendors.length} of {filteredVendors.length} professionals
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" style={{ width: '3rem', height: '3rem' }} />
              <p className="mt-3 text-muted">Finding best experts for you...</p>
            </div>
          ) : (
            <Row className="g-4">
              <AnimatePresence>
                {paginatedVendors.length === 0 ? (
                  <Col>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-5"
                    >
                      <h4 className="text-muted">No vendors found matching your criteria.</h4>
                      <Button variant="link" onClick={() => { setSearchTerm(''); setSubcategoryFilter('All'); }}>
                        Clear Filters
                      </Button>
                    </motion.div>
                  </Col>
                ) : (
                  paginatedVendors.map((vendor, index) => (
                    <Col key={vendor._id || index} xs={12} md={6} lg={4}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-100"
                      >
                        <Card className="vendor-card p-3">
                          <div className="d-flex align-items-start">
                            {/* PROFILE IMAGE */}
                            <div className="profile-img-container me-3">
                              {vendor.Profile_Image ? (
                                <img
                                  src={vendor.Profile_Image}
                                  alt="profile"
                                  className="profile-img"
                                />
                              ) : (
                                <div className="profile-img d-flex align-items-center justify-content-center bg-dark text-warning fs-3 fw-bold">
                                  {vendor.Business_Name?.charAt(0)?.toUpperCase() || "V"}
                                </div>
                              )}
                              <div className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white p-1" style={{ width: '15px', height: '15px' }}></div>
                            </div>

                            {/* CONTENT */}
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h5 className="fw-bold mb-1 text-dark text-truncate" style={{ maxWidth: '180px' }}>
                                    {vendor.Business_Name}
                                  </h5>
                                  <div className="d-flex align-items-center gap-1 text-warning small mb-2">
                                    <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar className="text-muted" />
                                    <span className="text-muted ms-1">(4.0)</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-2">
                                {Array.isArray(vendor.Sub_Category) && vendor.Sub_Category.length > 0 ? (
                                  vendor.Sub_Category.slice(0, 3).map((sub, i) => (
                                    <Badge key={i} bg="light" text="dark" className="me-1 border">
                                      {sub}
                                    </Badge>
                                  ))
                                ) : (
                                  <Badge bg="light" text="dark" className="border">General</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-muted small text-truncate-2-lines mb-3" style={{ minHeight: '40px' }}>
                              {vendor.Description || "No description provided."}
                            </p>

                            <div className="d-flex align-items-center justify-content-between mb-3 p-2 bg-light rounded-3">
                              <span className="text-secondary small fw-bold">Charge</span>
                              <span className="fw-bold text-dark">₹{vendor.Charge_Per_Hour_or_Day}<span className="text-muted small fw-normal">/{vendor.Charge_Type || 'day'}</span></span>
                            </div>

                            <div className="d-grid gap-2 d-md-flex">
                              <button
                                className="btn-primary-custom flex-grow-1"
                                onClick={() => booknow(vendor._id)}
                              >
                                Book Now
                              </button>
                              <button
                                className="btn-outline-custom"
                                onClick={() => viewDetails(vendor._id)}
                              >
                                <FaArrowRight />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    </Col>
                  ))
                )}
              </AnimatePresence>
            </Row>
          )}

          {/* PAGINATION */}
          {!loading && totalPages > 1 && (
            <Row>
              <Col className="d-flex justify-content-center mt-5">
                <Pagination size="lg">
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx}
                      active={idx + 1 === currentPage}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} />
                </Pagination>
              </Col>
            </Row>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default ProfessionalListPage;
