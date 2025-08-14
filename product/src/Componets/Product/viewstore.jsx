import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import NavaPro from './navbarproduct';
import Footer from './footer';

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
        axios.post('https://backend-d6mx.vercel.app/api/viewstore', { id: vendorId })
            .then(res => {
                setProducts(res.data || []);
                // Optional: set vendor info from first product
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
            <Container className="py-5" style={{ backgroundColor: '#ffffff' }}>
                <h2 className="mb-4">{vendor.Business_Name}</h2>
                <Row>
                    {products.map(product => (
                        <Col md={3} key={product._id} className="mb-4">
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={product.ProductUrl?.[0] || '/placeholder.png'}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{product.ProductName}</Card.Title>
                                    <Card.Text className="fw-bold">₹{product.ProductPrice}</Card.Text>
                                    <Button
                                        style={{ backgroundColor: '#FFD700', color: '#000', border: 'none', marginTop: 'auto' }}
                                        onClick={() => navigate(`/product/${product._id}`)}
                                    >
                                        View Details
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
