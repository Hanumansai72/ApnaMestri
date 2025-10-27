import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Pagination, Form, InputGroup
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './footer';
import NavaPro from './navbarproduct';

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
    let url = `https://backend-d6mx.vercel.app/fetch/services?category=${encodeURIComponent(category)}`;

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
      <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', padding: '2rem 0' }}>
        <Container>
          <header className="text-center mb-5">
            <h1 className="fw-bold" style={{ color: '#FFD700', fontFamily: "'Poppins', sans-serif" }}>
              Find Trusted Professionals
            </h1>
            <p style={{ color: '#555' }}>{description}</p>
            <div className="d-flex justify-content-center gap-4 mt-3" style={{ color: '#555' }}>
              <span><i className="bi bi-patch-check-fill me-2" style={{ color: '#FFD700' }}></i>Verified Professionals</span>
              <span><i className="bi bi-lightning-fill me-2" style={{ color: '#FFD700' }}></i>Quick Response</span>
              <span><i className="bi bi-star-fill me-2" style={{ color: '#FFD700' }}></i>Top Rated</span>
            </div>
          </header>

          {/* Filters */}
          <Row className="mb-4 g-2">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text style={{ background: 'transparent', border: 'none', color: '#FFD700' }}>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search by name, skill or description..."
                  style={{ border: '1px solid #FFD700', background: 'transparent' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4}>
              <Form.Select value={subcategoryFilter} onChange={(e) => setSubcategoryFilter(e.target.value)}>
                {subcategories.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                <option value="All">All Prices</option>
                <option value="Low">Below ₹500</option>
                <option value="Medium">₹500 - ₹1500</option>
                <option value="High">Above ₹1500</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Info */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <p style={{ color: '#555' }}>Showing {paginatedVendors.length} of {filteredVendors.length} professionals</p>
            <p style={{ color: '#555' }}>Page {currentPage} of {totalPages}</p>
          </div>

          {/* Vendor Cards */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" style={{ color: '#FFD700' }} />
              <div className="mt-2">Loading Professionals...</div>
            </div>
          ) : (
            <Row className="g-4 justify-content-center">
              {paginatedVendors.length === 0 ? (
                <Col>
                  <p className="text-center">No vendors found for "{searchTerm || search}".</p>
                </Col>
              ) : (
                paginatedVendors.map((vendor, index) => (
                  <Col key={vendor._id || index} xs={12} md={6} lg={4}>
                    <Card
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        padding: '15px',
                        backgroundColor: "#fff",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                      }}
                      className="d-flex flex-row align-items-center h-100"
                    >
                      <div style={{ flexShrink: 0, marginRight: '15px' }}>
                        {vendor.Profile_Image ? (
                          <img
                            src={vendor.Profile_Image}
                            alt="profile"
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '3px solid #FFD700'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: '50%',
                              backgroundColor: '#FFD700',
                              color: '#000',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '2rem',
                              border: '3px solid #FFD700'
                            }}
                          >
                            {vendor.Business_Name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>

                      <Card.Body style={{ textAlign: 'left' }}>
                        <Card.Title style={{ fontFamily: "'Poppins', sans-serif", fontWeight: '600' }}>
                          {vendor.Business_Name?.trim()}
                        </Card.Title>
                        <Card.Text style={{ fontSize: '0.9rem', color: '#555' }}>{vendor.Description}</Card.Text>
                        <div>
                          {Array.isArray(vendor.Sub_Category) && vendor.Sub_Category.length > 0 ? (
                            vendor.Sub_Category.map((sub, i) => (
                              <Badge key={i} style={{ backgroundColor: '#FFD700', color: '#000', margin: '2px', padding: '5px 10px' }}>
                                {sub}
                              </Badge>
                            ))
                          ) : (
                            <Badge style={{ backgroundColor: '#FFD700', color: '#000' }}>General</Badge>
                          )}
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                          ₹{vendor.Charge_Per_Hour_or_Day}/{vendor.Charge_Type}
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            style={{ backgroundColor: '#FFD700', border: 'none', color: '#000', fontWeight: 'bold' }}
                            onClick={() => booknow(vendor._id)}
                          >
                            Book Now
                          </Button>
                          <Button
                            variant="outline-dark"
                            style={{ borderColor: '#FFD700', color: '#000', fontWeight: 'bold' }}
                            onClick={() => viewDetails(vendor._id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
          )}

          {!loading && totalPages > 1 && (
            <Row>
              <Col className="d-flex justify-content-center mt-4">
                <Pagination>
                  <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} />
                  {[...Array(totalPages)].map((_, idx) => (
                    <Pagination.Item
                      key={idx}
                      active={idx + 1 === currentPage}
                      onClick={() => setCurrentPage(idx + 1)}
                      style={idx + 1 === currentPage ? { backgroundColor: '#FFD700', border: 'none' } : {}}
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
