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
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search') || 'Plumber';

  function calculateDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function booknow(vendorId) {
    localStorage.setItem("Customerid", vendorId);
    navigate("/myorder/service");
  }

  function viewDetails(vendorId) {
    navigate(`/service/details/${vendorId}`);
  }

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        fetchVendors(search, { latitude, longitude });
      },
      () => {
        setUserLocation(null);
        fetchVendors(search);
      }
    );
  }, [search]);

  const fetchVendors = (category, coords) => {
    let url = `https://backend-d6mx.vercel.app/fetch/services?category=${encodeURIComponent(category)}`;
    if (coords) {
      url += `&lat=${coords.latitude}&lng=${coords.longitude}`;
    }
    axios.get(url)
      .then((res) => {
        const list = res.data.services || [];
        setVendorList(list);
        setFilteredVendors(list);
        setDescription(res.data.description || 'Connect with skilled professionals for your needs.');
        setCurrentPage(1);
      })
      .catch(() => {
        setVendorList([]);
        setFilteredVendors([]);
        setDescription('');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // search filter effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVendors(vendorlist);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredVendors(
        vendorlist.filter(v =>
          v.Business_Name?.toLowerCase().includes(lower) ||
          v.Sub_Category?.some(sub => sub.toLowerCase().includes(lower)) ||
          v.Description?.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, vendorlist]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <NavaPro />
      <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', padding: '2rem 0' }}>
        <Container>
          <header className="text-center mb-5">
            <h1 className="fw-bold" style={{ color: '#FFD700', fontFamily: "'Poppins', sans-serif" }}>Find Trusted Professionals</h1>
            <p style={{ color: '#555' }}>{description}</p>
            <div className="d-flex justify-content-center gap-4 mt-3" style={{ color: '#555' }}>
              <span><i className="bi bi-patch-check-fill me-2" style={{ color: '#FFD700' }}></i>Verified Professionals</span>
              <span><i className="bi bi-lightning-fill me-2" style={{ color: '#FFD700' }}></i>Quick Response</span>
              <span><i className="bi bi-star-fill me-2" style={{ color: '#FFD700' }}></i>Top Rated</span>
            </div>
          </header>

          {/* Search Bar */}
          <Row className="mb-4">
            <Col>
              <div className="search-filter-bar" style={{
                backgroundColor: '#fff8dc',
                border: '1px solid #FFD700',
                borderRadius: '8px',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <InputGroup>
                  <InputGroup.Text style={{ background: 'transparent', border: 'none', color: '#FFD700' }}>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search professionals by name, skill or description..."
                    style={{ border: 'none', background: 'transparent' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </div>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <p style={{ color: '#555' }}>Showing {paginatedVendors.length} of {filteredVendors.length} professionals</p>
            <p style={{ color: '#555' }}>Page {currentPage} of {totalPages}</p>
          </div>

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
      <Col
        key={vendor._id || index}
        xs={12} md={6} lg={4}  // ✅ Responsive: full width on mobile, 2 per row on tablets, 3 per row on desktops
      >
        <Card
          style={{
            border: '1px solid #fff',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '15px',
            width: "100%",
            margin: "0 auto",
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // Shadow for visibility
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
          }}
          className="d-flex flex-row align-items-center h-100"
        >
          {/* Left Side - Image */}
          <div style={{ flexShrink: 0, marginRight: '15px' }}>
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
          </div>

          {/* Right Side - Content */}
          <Card.Body style={{ textAlign: 'left' }}>
            <Card.Title
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: '600',
                marginBottom: '8px'
              }}
            >
              {vendor.Business_Name?.trim()}
            </Card.Title>

            {/* Description */}
            {vendor.Description && (
              <Card.Text style={{ fontSize: '0.9rem', color: '#555', marginBottom: '8px' }}>
                {vendor.Description}
              </Card.Text>
            )}

            {/* Sub Categories */}
            <div style={{ marginBottom: '8px' }}>
              {Array.isArray(vendor.Sub_Category) && vendor.Sub_Category.length > 0 ? (
                vendor.Sub_Category.map((sub, i) => (
                  <Badge
                    key={i}
                    style={{
                      backgroundColor: '#FFD700',
                      color: '#000',
                      margin: '2px',
                      padding: '5px 10px'
                    }}
                  >
                    {sub}
                  </Badge>
                ))
              ) : (
                <Badge style={{ backgroundColor: '#FFD700', color: '#000' }}>General</Badge>
              )}
            </div>

            {/* Price */}
            <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
              ₹{vendor.Charge_Per_Hour_or_Day}/{vendor.Charge_Type}
            </div>

            {/* Buttons */}
            <div className="d-flex gap-2">
              <Button
                style={{
                  backgroundColor: '#FFD700',
                  border: 'none',
                  color: '#000',
                  fontWeight: 'bold'
                }}
                onClick={() => booknow(vendor._id)}
              >
                Book Now
              </Button>
              <Button
                variant="outline-dark"
                style={{
                  borderColor: '#FFD700',
                  color: '#000',
                  fontWeight: 'bold'
                }}
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
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  />
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
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  />
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
