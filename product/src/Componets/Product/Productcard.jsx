import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Pagination, Form, InputGroup, Alert
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './footer';
import NavaPro from './navbarproduct';

const ITEMS_PER_PAGE = 6;

const ProductPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorlist, setVendorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    maxPrice: 10000,
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const search = queryParams.get('search') || 'Plumber';

  // Fetch vendors
  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://backend-d6mx.vercel.app/fetch/services?category=${encodeURIComponent(search)}`)
      .then((res) => {
        const list = res.data.services || [];
        setVendorList(list);
        setDescription(res.data.description || 'Connect with skilled professionals for your needs.');
      })
      .catch(() => {
        setVendorList([]);
        setDescription('');
      })
      .finally(() => setLoading(false));
  }, [search]);

  // Handle filters
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  // Filtering logic
  const filteredVendors = useMemo(() => {
    return vendorlist.filter((v) => {
      const matchesSearch = searchTerm
        ? v.Business_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          v.Description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesCategory = filters.category
        ? v.Category?.toLowerCase() === filters.category.toLowerCase()
        : true;
      const matchesSub = filters.subcategory
        ? v.Sub_Category?.some((sub) =>
            sub.toLowerCase().includes(filters.subcategory.toLowerCase())
          )
        : true;
      const matchesLocation = filters.location
        ? v.Address?.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const matchesPrice =
        filters.maxPrice > 0
          ? Number(v.Charge_Per_Hour_or_Day) <= Number(filters.maxPrice)
          : true;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSub &&
        matchesLocation &&
        matchesPrice
      );
    });
  }, [vendorlist, filters, searchTerm]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function booknow(vendorId) {
    localStorage.setItem('Customerid', vendorId);
    navigate('/myorder/service');
  }

  function viewDetails(vendorId) {
    navigate(`/service/details/${vendorId}`);
  }

  // Animation variants for filters
  const filterVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, height: 0, transition: { duration: 0.2 } }
  };

  return (
    <>
      <NavaPro />
      <div style={{ backgroundColor: '#fff', minHeight: '100vh', padding: '2rem 0' }}>
        <Container>
          {/* Header */}
          <header className="text-center mb-4">
            <h1 className="fw-bold" style={{ color: '#FFD700' }}>
              Find Trusted Professionals
            </h1>
            <p style={{ color: '#555' }}>{description}</p>
          </header>

          {/* Search and Filter Bar */}
          <Row className="align-items-center mb-3">
            <Col md={8}>
              <InputGroup className="border rounded-pill">
                <InputGroup.Text style={{ background: 'transparent', border: 'none' }}>
                  <i className="bi bi-search" style={{ color: '#FFD700' }}></i>
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search professionals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ border: 'none', background: 'transparent' }}
                />
              </InputGroup>
            </Col>
            <Col md="auto">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  backgroundColor: '#FFD700',
                  color: '#000',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                <i className="bi bi-funnel-fill me-2"></i>Filters
              </Button>
            </Col>
          </Row>

          {/* Filters Section */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  backgroundColor: '#fff8dc',
                  border: '1px solid #FFD700',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <Row className="g-3">
                  <Col md={3}>
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="Technical">Technical</option>
                      <option value="Non-Technical">Non-Technical</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label>Subcategory</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Electrician, Painter"
                      value={filters.subcategory}
                      onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>
                      Max Price: ₹{Number(filters.maxPrice).toLocaleString('en-IN')}
                    </Form.Label>
                    <Form.Range
                      min={100}
                      max={10000}
                      step={100}
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <option value="">All Locations</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                    </Form.Select>
                  </Col>
                </Row>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vendor List */}
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="warning" />
              <p>Loading Professionals...</p>
            </div>
          ) : paginatedVendors.length === 0 ? (
            <Alert variant="light" className="text-center">
              No professionals found matching your filters.
            </Alert>
          ) : (
            <Row className="g-4">
              {paginatedVendors.map((vendor) => (
                <Col key={vendor._id} xs={12} md={6} lg={4}>
                  <Card
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                    className="h-100"
                  >
                    <Card.Body className="d-flex align-items-center">
                      <img
                        src={vendor.Profile_Image}
                        alt="profile"
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '3px solid #FFD700',
                          marginRight: '15px'
                        }}
                      />
                      <div>
                        <Card.Title style={{ fontWeight: '600' }}>
                          {vendor.Business_Name}
                        </Card.Title>
                        <Card.Text style={{ fontSize: '0.9rem', color: '#555' }}>
                          {vendor.Description}
                        </Card.Text>
                        <div>
                          {Array.isArray(vendor.Sub_Category)
                            ? vendor.Sub_Category.map((sub, i) => (
                                <Badge
                                  key={i}
                                  style={{
                                    backgroundColor: '#FFD700',
                                    color: '#000',
                                    margin: '2px'
                                  }}
                                >
                                  {sub}
                                </Badge>
                              ))
                            : <Badge style={{ backgroundColor: '#FFD700', color: '#000' }}>General</Badge>}
                        </div>
                        <div className="mt-2 fw-bold text-dark">
                          ₹{vendor.Charge_Per_Hour_or_Day}/{vendor.Charge_Type}
                        </div>
                        <div className="mt-2 d-flex gap-2">
                          <Button
                            style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                            onClick={() => booknow(vendor._id)}
                          >
                            Book Now
                          </Button>
                          <Button
                            variant="outline-dark"
                            onClick={() => viewDetails(vendor._id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
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

export default ProductPage;
