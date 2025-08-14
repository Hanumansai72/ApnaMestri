import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import {
  Container, Row, Col, Card, Button
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './footer';
import NavaPro from './navbarproduct';

const CartPage = () => {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const navigate = useNavigate();
  const id = localStorage.getItem("userid");

  const ondlete = (itemId) => {
    axios.delete(`https://backend-d6mx.vercel.app/delete/${itemId}`)
      .then(() => {
        setProducts(prev => prev.filter(item => item._id !== itemId));
        setToast({ show: true, message: "Item removed from cart.", variant: "success" });
      })
      .catch(() => {
        setToast({ show: true, message: "Failed to remove item.", variant: "danger" });
      });
  };

  useEffect(() => {
    if (!id) return;
    axios.get(`https://backend-d6mx.vercel.app/carts/${id}`)
      .then(res => {
        const dataWithQuantity = res.data.map(item => ({
          ...item,
          quantity: item.productQuantity || 1,
          name: item.productname,
          price: item.productprice,
          vendor: item.productvendor,
          imageUrl: Array.isArray(item.producturl) ? item.producturl[0] : item.producturl,
          category: item.productcategory || 'General'
        }));
        setProducts(dataWithQuantity);
      });
  }, [id]);

  const updateQuantity = (id, delta) => {
    setProducts(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.18;
  const tax = subtotal * taxRate;
  const shipping = subtotal > 50000 || subtotal === 0 ? 0 : 500;
  const total = subtotal + tax + shipping;

  const handleCheckout = () => {
    if (products.length === 0) {
      setToast({ show: true, message: "Your cart is empty.", variant: "warning" });
      return;
    }
    localStorage.setItem("price", total.toFixed(2));
    navigate("/Cart/order");
  };

  const styles = `
    .cart-page-container {
      background-color: #ffffff;
      color: #1a202c;
      min-height: 100vh;
      padding-top: 2rem;
      padding-bottom: 2rem;
    }
    .cart-item-card, .order-summary-card, .coupon-card {
      background-color: #f8f9fa;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      color: #1a202c;
    }
    .cart-item-card .category-tag {
      position: absolute;
      top: -10px;
      left: 20px;
      background: linear-gradient(90deg, #FFD700, #FFC107);
      color: #000;
      font-size: 0.7rem;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .quantity-selector {
      display: flex;
      align-items: center;
      background-color: #f1f1f1;
      border-radius: 20px;
      padding: 4px;
    }
    .quantity-btn {
      background-color: #FFD700;
      color: #000;
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      line-height: 1;
    }
    .quantity-btn:hover {
      background-color: #FFC107;
    }
    .quantity-display {
      min-width: 40px;
      text-align: center;
      font-weight: bold;
    }
    .remove-btn {
      background: none;
      border: none;
      color: #6c757d;
      font-size: 1.2rem;
    }
    .remove-btn:hover {
      color: #e53e3e;
    }
    .order-summary-card .list-group-item {
      background-color: transparent;
      border: none;
      color: #1a202c;
      padding: 0.75rem 0;
    }
    .grand-total {
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    .checkout-btn {
      background: linear-gradient(to right, #FFD700, #FFC107);
      border: none;
      font-weight: bold;
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      color: #000;
    }
    .checkout-btn:hover {
      background: linear-gradient(to right, #FFC107, #FFD700);
    }
    .payment-icons img {
      height: 24px;
      margin-right: 10px;
    }
    .delivery-info {
      background-color: #f1f1f1;
      border-radius: 8px;
    }
  `;

  return (
    <>
      <NavaPro />
      <style>{styles}</style>
      <div className="cart-page-container">
        <Container>
          <Row className="mb-3">
            <Col>
              <h2 className="fw-bold">Shopping Cart</h2>
              <p className="text-muted">{products.length} items in your cart</p>
            </Col>
            <Col className="text-end align-self-center">
              <Link to="/products" className="text-dark">
                <i className="bi bi-arrow-left me-2"></i>Continue Shopping
              </Link>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              {products.length === 0 && <p>Your cart is empty.</p>}
              {products.map(item => (
                <Card key={item._id} className="cart-item-card mb-3 p-3 position-relative">
                  <div className="category-tag">{item.category}</div>
                  <Row className="align-items-center">
                    <Col xs={3} md={2}>
                      <img src={item.imageUrl} alt={item.name} className="img-fluid rounded" />
                    </Col>
                    <Col xs={9} md={5}>
                      <h6 className="mb-1">{item.name}</h6>
                      <p className="text-muted small mb-2">{item.vendor}</p>
                      <strong className="d-block">₹{Number(item.price).toLocaleString('en-IN')}</strong>
                    </Col>
                    <Col xs={12} md={5} className="d-flex justify-content-between align-items-center mt-3 mt-md-0">
                      <div className="quantity-selector">
                        <Button variant="link" className="quantity-btn" onClick={() => updateQuantity(item._id, -1)}>-</Button>
                        <span className="quantity-display">{item.quantity}</span>
                        <Button variant="link" className="quantity-btn" onClick={() => updateQuantity(item._id, 1)}>+</Button>
                      </div>
                      <strong className="d-none d-md-block">₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                      <Button variant="link" className="remove-btn" onClick={() => ondlete(item._id)}>
                        <i className="bi bi-x"></i>
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}

              <Card className="coupon-card p-3 mt-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Apply Coupon</h6>
                    <small className="text-muted">Have a source code? Click the '+' button to apply.</small>
                  </div>
                  <Button variant='link' className='text-dark fs-4'>
                    <i className="bi bi-plus-circle"></i>
                  </Button>
                </div>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="order-summary-card p-3 sticky-top" style={{ top: '2rem' }}>
                <h5 className="fw-bold">Order Summary</h5>
                <hr style={{ borderColor: '#e2e8f0' }} />

                <div className="d-flex justify-content-between text-muted"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="d-flex justify-content-between text-muted">
                  <span>Tax (GST 18%) <i className="bi bi-info-circle"></i></span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between text-muted mb-2">
                  <span>Delivery</span>
                  <span className={shipping === 0 ? 'text-success' : 'text-muted'}>
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <small className="text-muted d-block mb-3">Free delivery on orders above ₹50,000</small>

                <hr style={{ borderColor: '#e2e8f0' }} />
                <div className="d-flex justify-content-between fw-bold fs-5 my-2">
                  <span>Grand Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <hr style={{ borderColor: '#e2e8f0' }} />

                <Button className="checkout-btn my-3" onClick={handleCheckout}>Proceed to Checkout <i className="bi bi-arrow-right"></i></Button>

                <div className="text-center text-muted small mb-3">
                  <i className="bi bi-lock-fill"></i> Secure Checkout Protected
                </div>

                <div className="mb-3">
                  <span className="text-muted d-block mb-2">We Accept</span>
                  <div className="payment-icons">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" />
                    <img src="https://img.icons8.com/color/48/bhim-upi.png" alt="UPI" />
                  </div>
                </div>

                <div className="delivery-info p-3 text-center">
                  <i className="bi bi-truck fs-4 mb-2"></i>
                  <h6 className="mb-0">Estimated Delivery:</h6>
                  <p className="text-muted mb-0">3-5 Business Days</p>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Footer />
    </>
  );
};

export default CartPage;
// test update
