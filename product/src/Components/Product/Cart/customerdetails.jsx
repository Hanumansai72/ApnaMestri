import React, { useState, useEffect } from 'react';
import {
  Container, Form, Row, Col, Button, Card
} from 'react-bootstrap';
import axios from "axios";
import API_BASE_URL from "../../../config";
import { useNavigate, Link } from 'react-router-dom';
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { useAuth } from '../Auth/AuthContext';

function CheckoutForm() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [productsid, setprodicts] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const { user: authUser } = useAuth();
  const id = authUser?.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || authUser.user_name || '');
      setEmail(authUser.email || '');
    }
  }, [authUser]);

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_BASE_URL}/carts/${id}`, { withCredentials: true })
        .then(res => setprodicts(res.data))
        .catch(err => console.error('Failed to fetch cart:', err));
    }
  }, [id]);

  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLatitude(latitude);
      setLongitude(longitude);

      const apiKey = "c068b22bac464a629be19163f65ff6b6";
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

      try {
        const response = await axios.get(url);
        const result = response.data.results[0];
        if (result) {
          const components = result.components;
          setCity(components.city || components.town || components.village || '');
          setStateName(components.state || '');
          setPincode(components.postcode || '');
          setAddress(result.formatted || '');
        } else {
          alert("Unable to detect location.");
        }
      } catch (error) {
        console.error("Geolocation error:", error);
        alert("Failed to detect your location.");
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error("Geolocation failed:", error);
      alert("Failed to get your current location.");
      setIsLocating(false);
    });
  };

  const handlePlaceOrder = async () => {
    if (!productsid || productsid.length === 0) return alert("No products in cart");

    const orders = productsid.map(item => ({
      vendorid: item.Vendorid,
      productId: item.productid,
      productName: item.productname,
      productImage: item.producturl,
      quantity: item.productQuantity || 1,
      pricePerUnit: item.productprice,
      totalPrice: item.productprice * (item.productQuantity || 1),
      customerId: id,
      customerName: fullName,
      phone,
      email,
      shippingAddress: {
        fullAddress: address,
        city,
        pincode,
        state: stateName,
        coordinates: {
          latitude,
          longitude
        }
      },
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    }));

    try {
      const response = await axios.post(`${API_BASE_URL}/ordercart`, { orders });
      if (response.status === 200 || response.status === 201) {
        alert("Order placed successfully!");
        navigate("/myorder");
      } else {
        alert("Failed to place order.");
      }
    } catch (error) {
      console.error("Order placement error:", error);
      alert("Something went wrong.");
    }
  };

  const paymentOptions = [
    { id: 'cod', label: 'Cash on Delivery', icon: 'bi-cash-coin', description: 'Pay when you receive' },
    { id: 'online', label: 'Online Payment', icon: 'bi-credit-card', description: 'Debit/Credit Card' },
    { id: 'upi', label: 'UPI Payment', icon: 'bi-phone', description: 'Google Pay, PhonePe, etc.' }
  ];

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

    .checkout-page {
      background: linear-gradient(135deg, #fffef5 0%, #fff9e6 100%);
      font-family: 'Poppins', sans-serif;
      min-height: 100vh;
      padding: 3rem 0;
    }

    .checkout-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .checkout-card {
      background: #ffffff;
      border: none;
      border-radius: 25px;
      padding: 2.5rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
      animation: slideUp 0.6s ease-out;
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

    .checkout-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #FFD700 0%, #FFA500 50%, #FFD700 100%);
    }

    .checkout-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f5f5f5;
    }

    .checkout-header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #1a1a1a;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.35);
    }

    .checkout-header h4 {
      font-weight: 700;
      color: #1a1a1a;
      font-size: 1.6rem;
      margin: 0;
    }

    .checkout-header p {
      color: #888;
      margin: 0;
      font-size: 0.9rem;
    }

    .section-title {
      font-weight: 600;
      color: #1a1a1a;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-title i {
      color: #FFD700;
      font-size: 1.2rem;
    }

    .form-label {
      font-weight: 500;
      color: #555;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      background: #fff;
    }

    .form-control:focus {
      border-color: #FFD700;
      box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.15);
    }

    .form-control::placeholder {
      color: #bbb;
    }

    .locate-section {
      background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 2px dashed #FFD700;
      animation: fadeIn 0.5s ease-out 0.3s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .locate-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border: none;
      border-radius: 25px;
      padding: 12px 25px;
      font-weight: 600;
      color: #1a1a1a;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.35);
    }

    .locate-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(255, 215, 0, 0.45);
    }

    .locate-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .locate-btn i {
      font-size: 1.1rem;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .locate-btn.locating i {
      animation: spin 1s linear infinite;
    }

    .payment-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 2px solid #f5f5f5;
    }

    .payment-option {
      background: #ffffff;
      border: 2px solid #e9ecef;
      border-radius: 16px;
      padding: 1.2rem 1.5rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .payment-option:hover {
      border-color: #FFD700;
      background: linear-gradient(135deg, #fffef5 0%, #fff9e6 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.15);
    }

    .payment-option.selected {
      border-color: #FFD700;
      background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
    }

    .payment-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #1a1a1a;
      transition: all 0.3s ease;
    }

    .payment-option:hover .payment-icon,
    .payment-option.selected .payment-icon {
      transform: scale(1.1);
    }

    .payment-info {
      flex: 1;
    }

    .payment-info h6 {
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 0.2rem 0;
    }

    .payment-info p {
      font-size: 0.85rem;
      color: #888;
      margin: 0;
    }

    .payment-radio {
      width: 22px;
      height: 22px;
      border: 2px solid #ddd;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .payment-option.selected .payment-radio {
      border-color: #FFD700;
      background: #FFD700;
    }

    .payment-option.selected .payment-radio::after {
      content: '';
      width: 8px;
      height: 8px;
      background: #1a1a1a;
      border-radius: 50%;
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      gap: 15px;
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 2px solid #f5f5f5;
    }

    .continue-btn {
      background: transparent;
      border: 2px solid #FFD700;
      border-radius: 15px;
      padding: 14px 28px;
      font-weight: 600;
      color: #1a1a1a;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    }

    .continue-btn:hover {
      background: #FFD700;
      transform: translateX(-5px);
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.35);
    }

    .place-order-btn {
      background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
      border: none;
      border-radius: 15px;
      padding: 14px 35px;
      font-weight: 700;
      color: #1a1a1a;
      font-size: 1.05rem;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: all 0.4s ease;
      box-shadow: 0 10px 35px rgba(255, 215, 0, 0.4);
    }

    .place-order-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 45px rgba(255, 215, 0, 0.5);
    }

    .place-order-btn i {
      transition: transform 0.3s ease;
    }

    .place-order-btn:hover i {
      transform: translateX(5px);
    }

    .order-summary-mini {
      background: linear-gradient(135deg, #fff8e1 0%, #fffde7 100%);
      border-radius: 15px;
      padding: 1.5rem;
      margin-top: 2rem;
    }

    .order-summary-mini h6 {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .order-summary-mini h6 i {
      color: #FFD700;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
    }

    .summary-item .label {
      color: #666;
    }

    .summary-item .value {
      font-weight: 500;
      color: #1a1a1a;
    }

    .summary-item.total {
      border-top: 2px solid #FFD700;
      margin-top: 0.5rem;
      padding-top: 1rem;
    }

    .summary-item.total .label,
    .summary-item.total .value {
      font-weight: 700;
      font-size: 1.1rem;
    }

    .summary-item.total .value {
      background: linear-gradient(135deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .secure-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: #888;
      font-size: 0.85rem;
      margin-top: 1.5rem;
    }

    .secure-note i {
      color: #28a745;
    }
  `;

  // Calculate totals
  const subtotal = productsid.reduce((sum, item) => sum + (item.productprice * (item.productQuantity || 1)), 0);
  const shipping = 300;
  const total = subtotal + shipping;

  return (
    <div>
      <NavaPro />
      <style>{styles}</style>
      <div className="checkout-page">
        <Container className="checkout-container">
          <Card className="checkout-card">
            <div className="checkout-header">
              <div className="checkout-header-icon">
                <i className="bi bi-person-check"></i>
              </div>
              <div>
                <h4>Customer Information</h4>
                <p>Please fill in your details to complete the order</p>
              </div>
            </div>

            <Form>
              <h6 className="section-title">
                <i className="bi bi-person"></i>
                Personal Details
              </h6>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="fullName">
                    <Form.Label>Full Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="phone">
                    <Form.Label>Phone Number *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4" controlId="email">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <h6 className="section-title">
                <i className="bi bi-geo-alt"></i>
                Shipping Address
              </h6>

              <div className="locate-section">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <h6 style={{ fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                      <i className="bi bi-crosshair me-2" style={{ color: '#FFD700' }}></i>
                      Auto-detect your location
                    </h6>
                    <p style={{ fontSize: '0.85rem', color: '#888', margin: '0.3rem 0 0' }}>
                      We'll fill in your address automatically
                    </p>
                  </div>
                  <Button
                    className={`locate-btn ${isLocating ? 'locating' : ''}`}
                    onClick={handleLocateMe}
                    disabled={isLocating}
                  >
                    <i className={isLocating ? 'bi bi-arrow-repeat' : 'bi bi-geo-alt-fill'}></i>
                    {isLocating ? 'Locating...' : 'Locate Me'}
                  </Button>
                </div>
              </div>

              <Form.Group className="mb-3" controlId="address">
                <Form.Label>Full Address *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Enter your complete address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group controlId="city">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="state">
                    <Form.Label>State *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="State"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="pincode">
                    <Form.Label>Pincode *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="payment-section">
                <h6 className="section-title">
                  <i className="bi bi-credit-card"></i>
                  Payment Method
                </h6>

                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`payment-option ${paymentMethod === option.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(option.id)}
                  >
                    <div className="payment-icon">
                      <i className={`bi ${option.icon}`}></i>
                    </div>
                    <div className="payment-info">
                      <h6>{option.label}</h6>
                      <p>{option.description}</p>
                    </div>
                    <div className="payment-radio"></div>
                  </div>
                ))}
              </div>

              {productsid.length > 0 && (
                <div className="order-summary-mini">
                  <h6><i className="bi bi-receipt"></i> Order Summary</h6>
                  <div className="summary-item">
                    <span className="label">Items ({productsid.length})</span>
                    <span className="value">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Delivery</span>
                    <span className="value">₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-item total">
                    <span className="label">Total</span>
                    <span className="value">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                <Link to="/cart" style={{ textDecoration: 'none' }}>
                  <Button className="continue-btn">
                    <i className="bi bi-arrow-left"></i>
                    Back to Cart
                  </Button>
                </Link>
                <Button
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                  <i className="bi bi-arrow-right"></i>
                </Button>
              </div>

              <div className="secure-note">
                <i className="bi bi-shield-lock-fill"></i>
                Your information is secure and encrypted
              </div>
            </Form>
          </Card>
        </Container>
      </div>
      <Footer />
    </div>
  );
}

export default CheckoutForm;
