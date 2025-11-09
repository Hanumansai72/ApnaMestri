import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form, InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './footer';

// Helper function to render star ratings
const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  return (
    <>
      {[...Array(fullStars)].map((_, i) => <i key={`full-${i}`} className="bi bi-star-fill" style={{ color: '#FFD700' }}></i>)}
      {halfStar && <i key="half" className="bi bi-star-half" style={{ color: '#FFD700' }}></i>}
      {[...Array(emptyStars)].map((_, i) => <i key={`empty-${i}`} className="bi bi-star" style={{ color: '#FFD700' }}></i>)}
    </>
  );
};

function ProductPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // State for search and filters
  const [sortBy, setSortBy] = useState('price_low_to_high');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    maxPrice: '100000',
    category: ''
  });

  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || 'Cement';

  useEffect(() => {
    setLoading(true);
    axios
      .get(`https://backend-d6mx.vercel.app/fetch?category=${initialSearch}`)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch products.');
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const inLocation = filters.location ? product.ProductLocation?.toLowerCase().includes(filters.location.toLowerCase()) : true;
      const inMaxPrice = filters.maxPrice ? Number(product.ProductPrice) <= Number(filters.maxPrice) : true;
      const inCategory = filters.category ? product.ProductCategory?.toLowerCase() === filters.category.toLowerCase() : true;
      return inLocation && inMaxPrice && inCategory;
    });

    if (sortBy === 'price_low_to_high') {
      filtered.sort((a, b) => Number(a.ProductPrice) - Number(b.ProductPrice));
    } else if (sortBy === 'price_high_to_low') {
      filtered.sort((a, b) => Number(b.ProductPrice) - Number(a.ProductPrice));
    }
    return filtered;
  }, [products, sortBy, filters]);

  // Animation variants
  const filterVariants = {
    hidden: { opacity: 0, y: -20, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, height: 0, transition: { duration: 0.2 } }
  };

  return (
    <>
      <div className="product-page-container">
        
        <div className='sticky-top' style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '1rem 0', zIndex: 1020 }}>
          <Container>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0" style={{ color: '#FFD700', fontWeight: 'bold' }}>Apnai  Mestri</h4>
              <Form onSubmit={handleSearchSubmit} className="flex-grow-1 mx-4">
                <InputGroup className="search-input-group">
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search construction materials..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </InputGroup>
              </Form>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
              >
                <i className="bi bi-funnel-fill me-2"></i>
                Filters
              </Button>
            </div>

            {/* FILTERS */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  variants={filterVariants}
                  initial="hidden" animate="visible" exit="exit"
                  style={{ overflow: 'hidden' }}
                >
                  <Row className="mt-4 align-items-center">
                    <Col md={3} className="mb-2">
                      <Form.Label>Category</Form.Label>
                      <Form.Select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                        <option value="">All Categories</option>
                        <option value="Cement">Cement</option>
                        <option value="Steel">Steel</option>
                        <option value="Bricks">Bricks</option>
                      </Form.Select>
                    </Col>
                    <Col md={3} className="mb-2">
                      <Form.Label>Location</Form.Label>
                      <Form.Select value={filters.location} onChange={(e) => handleFilterChange('location', e.target.value)}>
                        <option value="">All Locations</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Delhi">Delhi</option>
                      </Form.Select>
                    </Col>
                    <Col md={3} className="mb-2">
                      <Form.Label>Price (Max ₹{Number(filters.maxPrice).toLocaleString('en-IN')})</Form.Label>
                      <Form.Range min={0} max={100000} step={1000} value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
                    </Col>
                  </Row>
                </motion.div>
              )}
            </AnimatePresence>
          </Container>
        </div>

        {/* PRODUCT GRID */}
        <Container className="py-4">
          <Row className="mb-4 align-items-center">
            <Col>
              <h2 className="mb-0 text-capitalize">{initialSearch}</h2>
              <p className="mb-0" style={{ color: '#666' }}>
                {loading ? '...' : `${filteredAndSortedProducts.length} products found`}
              </p>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center">
                <span className="me-2" style={{ color: '#666' }}>Sort by:</span>
                <Form.Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="price_low_to_high">Price: Low to High</option>
                  <option value="price_high_to_low">Price: High to Low</option>
                </Form.Select>
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="warning" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {filteredAndSortedProducts.map((product) => (
                <Col key={product._id}>
                  <Card className="custom-card h-100">
                    <Card.Img
                      variant="top"
                      src={Array.isArray(product.ProductUrl) && product.ProductUrl.length > 0 ? product.ProductUrl[0] : '/placeholder.png'}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <div className="product-category">{product.ProductCategory || initialSearch}</div>
                      <div className="product-name">{product.ProductName}</div>
                      <div className="d-flex align-items-center mb-2">
                        <span className="product-rating">{renderStars(product.ProductReview || 4.5)}</span>
                      </div>
                      <div className="product-location mb-2">{product.ProductLocation || 'Unknown'}</div>
                      <div className="mt-auto">
                        <Button className="view-details-btn" onClick={() => navigate(`/product/${product._id}`)}>
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
      <Footer />
    </>
  );
}

export default ProductPage;
