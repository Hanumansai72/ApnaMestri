import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../../config";
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import NavaPro from './navbarproduct';
import Footer from './footer';
import './ViewStore.css'; // We'll use this CSS for styling

const ViewStore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorId } = location.state || {};
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;

    setLoading(true);
    axios.post(`${API_BASE_URL}/api/viewstore`, { id: vendorId })
      .then(res => {
        setProducts(res.data || []);
        if (res.data.length > 0) setVendor(res.data[0].Vendor);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching vendor data:", err);
        setLoading(false);
      });
  }, [vendorId]);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
  if (!vendor) return <div className="text-center py-5">Vendor not found.</div>;

  return (
    <>
      <NavaPro />
      {/* Hero Section */}
      <div className="store-hero text-center py-5">
        <h1>{vendor.Business_Name}</h1>
        <p className="lead">{vendor.Business_Description || 'Discover our products and exclusive collections.'}</p>
      </div>

      {/* Products Section */}
      <Container className="py-5">
        <h3 className="mb-4">Our Products</h3>
        <Row>
          {products.map(product => (
            <Col md={4} lg={3} key={product._id} className="mb-4">
              <Card className="store-product-card h-100 shadow-sm">
                <div className="product-image-wrapper">
                  <Card.Img
                    variant="top"
                    src={product.ProductUrl?.[0] || '/placeholder.png'}
                    className="product-image"
                  />
                  {product.Tag && (
                    <Badge bg="warning" className="product-badge">{product.Tag}</Badge>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="product-title">{product.ProductName}</Card.Title>
                  <Card.Text className="product-price">₹{product.ProductPrice}</Card.Text>
                  <Button
                    className="view-product-btn mt-auto"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    View Product
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default ViewStore;
