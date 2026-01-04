import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import {
  Container, Row, Col, Card, Button
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { useAuth } from '../Auth/AuthContext';

const CartPage = () => {
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const id = authUser?.id;

  const ondlete = (itemId) => {
    axios.delete(`${API_BASE_URL} /delete/${itemId} `)
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
    axios.get(`${API_BASE_URL} /carts/${id} `, { withCredentials: true })
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

  const shipping = 300
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (products.length === 0) {
      setToast({ show: true, message: "Your cart is empty.", variant: "warning" });
      return;
    }
    localStorage.setItem("price", total.toFixed(2));
    navigate("/Cart/order");
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

    .cart-page-container {
      background: linear-gradient(135deg, #fffef5 0%, #fff9e6 100%);
      font-family: 'Poppins', sans-serif;
      min-height: 100vh;
      padding: 3rem 0;
    }

    .cart-header {
      animation: slideDown 0.6s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .cart-header h2 {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 2rem;
    }

    .cart-header .item-count {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      color: #1a1a1a;
      padding: 6px 16px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .continue-shopping-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #1a1a1a;
      text-decoration: none;
      font-weight: 500;
      padding: 10px 20px;
      border: 2px solid #FFD700;
      border-radius: 30px;
      transition: all 0.3s ease;
    }

    .continue-shopping-link:hover {
      background: #FFD700;
      color: #1a1a1a;
      transform: translateX(-5px);
      box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
    }

    .cart-item-card {
      background: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      animation: slideIn 0.5s ease-out;
      animation-fill-mode: both;
    }

    .cart-item-card:nth-child(1) { animation-delay: 0.1s; }
    .cart-item-card:nth-child(2) { animation-delay: 0.2s; }
    .cart-item-card:nth-child(3) { animation-delay: 0.3s; }
    .cart-item-card:nth-child(4) { animation-delay: 0.4s; }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .cart-item-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #FFD700 0%, #FFC107 100%);
    }

    .cart-item-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 60px rgba(255, 215, 0, 0.2);
    }

    .category-tag {
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      color: #1a1a1a;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .product-image-container {
      position: relative;
      border-radius: 15px;
      overflow: hidden;
      background: #f8f9fa;
    }

    .product-image-container img {
      transition: transform 0.4s ease;
    }

    .cart-item-card:hover .product-image-container img {
      transform: scale(1.1);
    }

    .product-info h6 {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
    }

    .product-info .vendor {
      color: #888;
      font-size: 0.85rem;
    }

    .product-price {
      font-size: 1.3rem;
      font-weight: 700;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 30px;
      padding: 5px;
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
    }

    .quantity-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      color: #1a1a1a;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .quantity-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
    }

    .quantity-display {
      min-width: 50px;
      text-align: center;
      font-weight: 700;
      font-size: 1.1rem;
      color: #1a1a1a;
    }

    .item-total {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 1.1rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #ccc;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 8px;
      border-radius: 50%;
    }

    .remove-btn:hover {
      color: #ff4757;
      background: rgba(255, 71, 87, 0.1);
      transform: rotate(90deg);
    }

    .coupon-card {
      background: #ffffff;
      border: 2px dashed #FFD700;
      border-radius: 20px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      animation: fadeIn 0.6s ease-out 0.5s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .coupon-card:hover {
      border-color: #FFA500;
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.15);
    }

    .coupon-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border: none;
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a1a1a;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 5px 20px rgba(255, 215, 0, 0.3);
    }

    .coupon-btn:hover {
      transform: rotate(180deg) scale(1.1);
    }

    .order-summary-card {
      background: #ffffff;
      border: none;
      border-radius: 25px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      animation: slideUp 0.6s ease-out 0.3s both;
      position: relative;
      overflow: hidden;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .order-summary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
    }

    .order-summary-card h5 {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 1.4rem;
    }

    .summary-divider {
      border: none;
      height: 2px;
      background: linear-gradient(90deg, transparent, #FFD700, transparent);
      margin: 1.5rem 0;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 1rem;
      font-size: 1rem;
    }

    .summary-row .label {
      color: #666;
    }

    .summary-row .value {
      font-weight: 500;
      color: #1a1a1a;
    }

    .grand-total-row {
      display: flex;
      justify-content: space-between;
      padding: 1.5rem 0;
      border-top: 2px solid #f0f0f0;
      border-bottom: 2px solid #f0f0f0;
      margin: 1rem 0;
    }

    .grand-total-row .label {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 1.2rem;
    }

    .grand-total-row .value {
      font-weight: 800;
      font-size: 1.5rem;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .free-shipping-note {
      background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .free-shipping-note i {
      color: #FFD700;
      margin-right: 8px;
    }

    .checkout-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border: none;
      font-weight: 700;
      width: 100%;
      padding: 16px;
      border-radius: 15px;
      color: #1a1a1a;
      font-size: 1.1rem;
      letter-spacing: 0.5px;
      transition: all 0.4s ease;
      box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .checkout-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 50px rgba(255, 215, 0, 0.5);
      background: linear-gradient(135deg, #FFC107 0%, #FFD700 100%);
    }

    .checkout-btn i {
      transition: transform 0.3s ease;
    }

    .checkout-btn:hover i {
      transform: translateX(5px);
    }

    .secure-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #888;
      font-size: 0.85rem;
      margin: 1.5rem 0;
    }

    .secure-badge i {
      color: #28a745;
    }

    .payment-section {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid #f0f0f0;
    }

    .payment-label {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 0.8rem;
    }

    .payment-icons {
      display: flex;
      justify-content: center;
      gap: 15px;
    }

    .payment-icons img {
      height: 32px;
      opacity: 0.8;
      transition: all 0.3s ease;
    }

    .payment-icons img:hover {
      opacity: 1;
      transform: scale(1.1);
    }

    .delivery-info {
      background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
      border-radius: 15px;
      padding: 1.5rem;
      text-align: center;
      margin-top: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .delivery-info::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #FFD700, #FFA500);
    }

    .delivery-info i {
      font-size: 2.5rem;
      color: #FFD700;
      margin-bottom: 0.5rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .delivery-info h6 {
      font-weight: 600;
      color: #1a1a1a;
      margin: 0.5rem 0 0.3rem;
    }

    .delivery-info p {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: #fff;
      border-radius: 25px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
      animation: fadeIn 0.6s ease-out;
    }

    .empty-cart-icon {
      font-size: 5rem;
      color: #FFD700;
      margin-bottom: 1.5rem;
      animation: swing 2s infinite;
    }

    @keyframes swing {
      0%, 100% { transform: rotate(0); }
      25% { transform: rotate(10deg); }
      75% { transform: rotate(-10deg); }
    }

    .empty-cart h4 {
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: #888;
      margin-bottom: 2rem;
    }

    .shop-now-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border: none;
      font-weight: 600;
      padding: 14px 35px;
      border-radius: 30px;
      color: #1a1a1a;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    }

    .shop-now-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
      color: #1a1a1a;
    }

    .custom-toast {
      border-radius: 15px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
    }
  `;

  return (
    <>
      <NavaPro />
      <style>{styles}</style>
      <div className="cart-page-container">
        <Container>
          <Row className="mb-4 cart-header">
            <Col>
              <h2>Shopping Cart</h2>
              <span className="item-count">
                <i className="bi bi-cart3"></i>
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </Col>
            <Col className="text-end align-self-center">
              <Link to="/products" className="continue-shopping-link">
                <i className="bi bi-arrow-left"></i>
                Continue Shopping
              </Link>
            </Col>
          </Row>

          <Row>
            <Col lg={8}>
              {products.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <i className="bi bi-cart-x"></i>
                  </div>
                  <h4>Your cart is empty</h4>
                  <p>Looks like you haven't added anything to your cart yet.</p>
                  <Link to="/products" className="shop-now-btn">
                    <i className="bi bi-bag"></i>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                products.map(item => (
                  <Card key={item._id} className="cart-item-card">
                    <div className="category-tag">{item.category}</div>
                    <Row className="align-items-center">
                      <Col xs={3} md={2}>
                        <div className="product-image-container">
                          <img src={item.imageUrl} alt={item.name} className="img-fluid rounded" />
                        </div>
                      </Col>
                      <Col xs={9} md={4}>
                        <div className="product-info">
                          <h6>{item.name}</h6>
                          <p className="vendor mb-2">{item.vendor}</p>
                          <span className="product-price">₹{Number(item.price).toLocaleString('en-IN')}</span>
                        </div>
                      </Col>
                      <Col xs={12} md={6} className="d-flex justify-content-between align-items-center mt-3 mt-md-0">
                        <div className="quantity-selector">
                          <Button variant="link" className="quantity-btn" onClick={() => updateQuantity(item._id, -1)}>−</Button>
                          <span className="quantity-display">{item.quantity}</span>
                          <Button variant="link" className="quantity-btn" onClick={() => updateQuantity(item._id, 1)}>+</Button>
                        </div>
                        <span className="item-total d-none d-md-block">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        <Button variant="link" className="remove-btn" onClick={() => ondlete(item._id)}>
                          <i className="bi bi-x-lg"></i>
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))
              )}

              {products.length > 0 && (
                <Card className="coupon-card mt-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1" style={{ fontWeight: 600, color: '#1a1a1a' }}>
                        <i className="bi bi-ticket-perforated me-2" style={{ color: '#FFD700' }}></i>
                        Apply Coupon
                      </h6>
                      <small style={{ color: '#888' }}>Have a promo code? Apply it here for exclusive discounts.</small>
                    </div>
                    <Button variant="link" className="coupon-btn">
                      <i className="bi bi-plus"></i>
                    </Button>
                  </div>
                </Card>
              )}
            </Col>

            <Col lg={4}>
              <Card className="order-summary-card sticky-top" style={{ top: '2rem' }}>
                <h5><i className="bi bi-receipt me-2" style={{ color: '#FFD700' }}></i>Order Summary</h5>
                <hr className="summary-divider" />

                <div className="summary-row">
                  <span className="label">Subtotal</span>
                  <span className="value">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="summary-row">
                  <span className="label">Delivery</span>
                  <span className="value" style={{ color: shipping === 0 ? '#28a745' : '#1a1a1a' }}>
                    {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="grand-total-row">
                  <span className="label">Total</span>
                  <span className="value">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <div className="free-shipping-note">
                  <i className="bi bi-truck"></i>
                  Free delivery on orders above ₹50,000
                </div>

                <Button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                  <i className="bi bi-arrow-right"></i>
                </Button>

                <div className="secure-badge">
                  <i className="bi bi-shield-lock-fill"></i>
                  Secure Checkout Protected by SSL
                </div>

                <div className="payment-section">
                  <p className="payment-label">We Accept</p>
                  <div className="payment-icons">
                    <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" />
                    <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" />
                    <img src="https://img.icons8.com/color/48/bhim-upi.png" alt="UPI" />
                    <img src="https://img.icons8.com/color/48/rupay.png" alt="RuPay" />
                  </div>
                </div>

                <div className="delivery-info">
                  <i className="bi bi-truck"></i>
                  <h6>Estimated Delivery</h6>
                  <p>1 Business Day</p>
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
          className="custom-toast"
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      <Footer />
    </>
  );
};

export default CartPage;
