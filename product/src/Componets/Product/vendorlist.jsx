import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Dropdown, Pagination, Form, InputGroup
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
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
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
        setVendorList(res.data.services || []);
        setDescription(res.data.description || 'Connect with skilled professionals for your needs.');
        setCurrentPage(1);
      })
      .catch(() => {
        setVendorList([]);
        setDescription('');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const totalPages = Math.ceil(vendorlist.length / ITEMS_PER_PAGE);
  const paginatedVendors = vendorlist.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <NavaPro />
      <div style={{ backgroundColor: '#fff', color: '#000', minHeight: '100vh', padding: '2rem 0' }}>
        <Container>
          <header className="text-center mb-5">
            <h1 className="fw-bold" style={{ color: '#FFD700' }}>Find Trusted Professionals</h1>
            <p style={{ color: '#555' }}>{description}</p>
            <div className="d-flex justify-content-center gap-4 mt-3" style={{ color: '#555' }}>
              <span><i className="bi bi-patch-check-fill me-2" style={{ color: '#FFD700' }}></i>Verified Professionals</span>
              <span><i className="bi bi-lightning-fill me-2" style={{ color: '#FFD700' }}></i>Quick Response</span>
              <span><i className="bi bi-star-fill me-2" style={{ color: '#FFD700' }}></i>Top Rated</span>
            </div>
          </header>

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
                  <Form.Control placeholder="Search professionals by name or skill..." style={{ border: 'none', background: 'transparent' }} />
                </InputGroup>
                <Form.Select style={{ border: '1px solid #FFD700', background: '#fff' }}>
                  <option>All Locations</option>
                </Form.Select>
                <Form.Select style={{ border: '1px solid #FFD700', background: '#fff' }}>
                  <option>All Ratings</option>
                </Form.Select>
                <Form.Select style={{ border: '1px solid #FFD700', background: '#fff' }}>
                  <option>All Prices</option>
                </Form.Select>
                <Button style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}>
                  <i className="bi bi-list-ul"></i>
                </Button>
              </div>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <p style={{ color: '#555' }}>Showing {paginatedVendors.length} of {vendorlist.length} professionals</p>
            <p style={{ color: '#555' }}>Page {currentPage} of {totalPages}</p>
          </div>

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status" style={{ color: '#FFD700' }} />
              <div className="mt-2">Loading Professionals...</div>
            </div>
          ) : (
            <Row>
              {paginatedVendors.length === 0 ? (
                <Col><p className="text-center">No vendors found for "{search}".</p></Col>
              ) : (
                paginatedVendors.map((vendor, index) => (
                  <Col md={4} lg={4} className="mb-4" key={vendor._id || index}>
                    <Card style={{
                      border: '1px solid #FFD700',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ position: 'relative', height: '220px' }}>
                        <Card.Img
                          variant="top"
                          src={`https://i.pravatar.cc/300?img=${(vendor._id.slice(-2).charCodeAt(0) % 70) + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                          <Badge style={{ backgroundColor: '#FFD700', color: '#000' }} pill>
                            <i className="bi bi-check-circle-fill me-1"></i>Verified
                          </Badge>
                          <Badge bg={index % 3 !== 1 ? 'success' : 'danger'} pill>
                            {index % 3 !== 1 ? 'Available' : 'Busy'}
                          </Badge>
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontWeight: 'bold'
                        }}>
                          ₹{Math.floor(Math.random() * (2500 - 500 + 1)) + 500}/day
                        </div>
                      </div>
                      <Card.Body className="text-center">
                        <Card.Title className="fw-bold">{vendor.Business_Name?.trim()}</Card.Title>
                        <Card.Text style={{ color: '#777' }}>{vendor.Category}</Card.Text>
                        <Button
                          style={{
                            width: '100%',
                            backgroundColor: '#FFD700',
                            border: 'none',
                            color: '#000',
                            fontWeight: 'bold'
                          }}
                          onClick={() => booknow(vendor._id)}
                        >
                          Book Now
                        </Button>
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
