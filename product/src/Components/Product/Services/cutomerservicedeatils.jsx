import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, FloatingLabel } from 'react-bootstrap';
import axios from 'axios';
import API_BASE_URL from "../../../config";
import NavaPro from '../Layout/navbarproduct';
import Footer from '../Layout/footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard, FaUser, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../Auth/AuthContext';

function Services() {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    instructions: '',
    paymentMethod: 'card'
  });

  const [serviceDate, setServiceDate] = useState('');
  const [serviceTime, setServiceTime] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locating, setLocating] = useState(false);
  const [vendorPrice, setVendorPrice] = useState(0);

  const [bookedSlots, setBookedSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  const serviceCharge = (7 / 100) * vendorPrice;
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const savedid = localStorage.getItem("Customerid"); // Vendor ID - kept as localStorage for now as it's a selection
  const pid = authUser?.id; // Customer ID from session

  const numericVendorPrice = Number(vendorPrice) || 0;
  const totalAmount = numericVendorPrice + serviceCharge;

  // Fetch vendor price
  useEffect(() => {
    if (savedid) {
      axios
        .get(`${API_BASE_URL}/api/vendor/${savedid}/price`)
        .then(res => setVendorPrice(Number(res.data.vendorPrice) || 0))
        .catch(() => setVendorPrice(0));
    }
  }, [savedid]);

  // Fetch saved booking details
  useEffect(() => {
    if (pid) {
      axios
        .get(`${API_BASE_URL}/fetch/location/booking/${pid}`)
        .then(res => {
          const { address, customer } = res.data;
          if (address && customer) {
            setFormData(prev => ({
              ...prev,
              fullName: customer.fullName || '',
              email: customer.email || '',
              phone: customer.phone || '',
              altPhone: customer.alternatePhone || '',
              address: address.street || '',
              city: address.city || '',
              state: address.state || '',
              zip: address.zip || '',
              instructions: address.specialInstructions || ''
            }));
            setLocation({ latitude: address.latitude || '', longitude: address.longitude || '' });

            toast.info("Saved details auto-filled.");
          }
        })
        .catch(() => console.log("No saved booking details found."));
    }
  }, [pid]);

  // ⭐ FETCH BLOCKED DATES + TIME SLOTS
  useEffect(() => {
    if (!savedid) return;

    axios
      .get(`${API_BASE_URL}/datedeatils/${savedid}`)
      .then((res) => {
        setBookedSlots(res.data);
        const dates = res.data.map(item => {
          const d = new Date(item.serviceDate);
          return d.toISOString().split('T')[0];
        });
        setBlockedDates([...new Set(dates)]);
      })
      .catch(err => console.log("Error fetching booked slots:", err));
  }, [savedid]);

  // Locate Me function
  const handleLocateMe = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        const address = data.address || {};

        const fullStreet = `${address.house_number || ''} ${address.road || ''} ${address.neighbourhood || ''}`.trim();

        setFormData(prev => ({
          ...prev,
          address: fullStreet || prev.address,
          city: address.city || address.town || address.village || prev.city,
          state: address.state || prev.state,
          zip: address.postcode || prev.zip
        }));

        toast.success("Location fetched!");
      } catch {
        toast.error("Failed to fetch address");
      }
      setLocating(false);
    }, (error) => {
      toast.error("Unable to fetch location: " + error.message);
      setLocating(false);
    });
  };

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pid) {
      toast.error("Please login to continue");
      return;
    }

    const finalData = {
      Vendorid: savedid,
      customerid: pid,
      serviceDate,
      serviceTime,
      customer: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        alternatePhone: formData.altPhone
      },
      address: {
        street: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        latitude: location.latitude,
        longitude: location.longitude,
        specialInstructions: formData.instructions
      },
      saveAddress: true,
      payment: { method: formData.paymentMethod },
      totalAmount
    };

    try {
      await axios.post(`${API_BASE_URL}/api/booking`, finalData);
      toast.success("Booking Successful!");
      navigate("/myorder");
    } catch (err) {
      if (err.response && err.response.status === 400) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Booking failed");
      }
    }
  };

  // Styles - Keeping original colors as requested
  const primaryColor = '#FFD700'; // Gold
  const secondaryColor = '#1A202C'; // Dark slate
  const softBg = '#F8FAFC'; // Slightly cooler soft bg
  const accentGradient = `linear-gradient(135deg, ${primaryColor}, #FFC300)`;

  return (
    <>
      <NavaPro />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .booking-container {
          background: radial-gradient(circle at top right, rgba(255, 215, 0, 0.05), transparent),
                      radial-gradient(circle at bottom left, rgba(26, 32, 44, 0.02), transparent),
                      ${softBg};
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding-bottom: 5rem;
        }

        .booking-header {
          padding-top: 4rem;
          padding-bottom: 2rem;
        }

        .section-title {
          font-weight: 800;
          color: ${secondaryColor};
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1.25rem;
          letter-spacing: -0.02em;
        }

        .custom-card {
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .custom-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .time-slot-btn {
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 12px 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #E2E8F0;
          background: white;
          color: ${secondaryColor};
          flex: 1 1 calc(33.333% - 8px);
          min-width: 90px;
        }

        .time-slot-btn.active {
          background: ${accentGradient};
          border-color: transparent;
          color: black;
          box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
          transform: translateY(-2px) scale(1.02);
        }

        .time-slot-btn:hover:not(:disabled):not(.active) {
          border-color: ${primaryColor};
          background: rgba(255, 215, 0, 0.05);
          transform: translateY(-1px);
        }

        .time-slot-btn:disabled {
          background-color: #F1F5F9;
          color: #94A3B8;
          cursor: not-allowed;
          border-color: #E2E8F0;
          opacity: 0.6;
        }

        .price-summary-wrapper {
          background: rgba(248, 250, 252, 0.5);
          border-radius: 16px;
          padding: 20px;
          margin-top: 1rem;
        }

        .price-summary-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-weight: 500;
          color: #64748B;
          font-size: 0.95rem;
        }

        .price-summary-item.total {
          border-top: 2px dashed #E2E8F0;
          margin-top: 12px;
          padding-top: 18px;
          font-size: 1.4rem;
          font-weight: 800;
          color: ${secondaryColor};
        }

        .form-floating > .form-control {
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          padding-left: 1.25rem;
          font-size: 0.95rem;
          font-weight: 500;
          height: calc(3.5rem + 2px);
          line-height: 1.25;
        }

        .form-floating > textarea.form-control {
          height: 120px;
        }

        .form-floating > label {
          padding-left: 1.25rem;
          font-weight: 500;
          color: #94A3B8;
        }

        .form-control:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.1);
        }

        .tabs-custom {
          border: none;
          background: #F1F5F9;
          padding: 6px;
          border-radius: 14px;
          display: flex;
          gap: 4px;
        }

        .tabs-custom .nav-item {
          flex: 1;
        }

        .tabs-custom .nav-link {
          color: #64748B;
          font-weight: 700;
          border: none !important;
          border-radius: 10px;
          padding: 12px;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          width: 100%;
          text-align: center;
        }

        .tabs-custom .nav-link:hover:not(.active) {
          background: rgba(255, 255, 255, 0.5);
          color: ${secondaryColor};
        }

        .tabs-custom .nav-link.active {
          background: white;
          color: ${secondaryColor};
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .action-btn {
          background: ${accentGradient};
          border: none;
          color: black;
          font-weight: 800;
          padding: 18px;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(255, 195, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 1rem;
        }

        .action-btn:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 20px 35px rgba(255, 195, 0, 0.4);
          background: linear-gradient(135deg, #FFC300, #FFB000);
        }

        .locate-btn {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 8px 16px;
          font-weight: 700;
          font-size: 0.85rem;
          color: ${secondaryColor};
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .locate-btn:hover {
          border-color: ${primaryColor};
          background: rgba(255, 215, 0, 0.05);
          color: black;
        }

        .payment-option-card {
          padding: 20px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          margin-top: 1rem;
        }

        .payment-badge {
          background: rgba(34, 197, 94, 0.1);
          color: #16A34A;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .step-indicator {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: ${primaryColor};
          color: black;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.9rem;
        }

        .card-accent-line {
          height: 4px;
          width: 60px;
          background: ${accentGradient};
          border-radius: 10px;
          margin-bottom: 1.5rem;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #F1F5F9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        
        @media (max-width: 991px) {
          .sticky-top {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>

      <motion.div
        className="booking-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Container>
          <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

          {/* Header Section */}
          <div className="booking-header">
            <Row className="align-items-center">
              <Col lg={8}>
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <span className="badge bg-warning text-dark px-3 py-2 rounded-pill fw-bold mb-3">SECURE CHECKOUT</span>
                  <h1 className="display-5 fw-bold text-dark mb-2 tracking-tight">
                    Confirm Your <span style={{ color: secondaryColor, position: 'relative' }}>
                      Booking
                      <span style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '0',
                        width: '100%',
                        height: '12px',
                        background: primaryColor,
                        opacity: 0.3,
                        zIndex: -1
                      }}></span>
                    </span>
                  </h1>
                  <p className="text-muted fs-5">Almost there! Review your details and finalize your appointment.</p>
                </motion.div>
              </Col>
              <Col lg={4} className="text-lg-end d-none d-lg-block">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="d-inline-flex align-items-center gap-3 p-3 bg-white rounded-4 shadow-sm border">
                    <div className="bg-success bg-opacity-10 p-2 rounded-3">
                      <FaCheckCircle className="text-success fs-4" />
                    </div>
                    <div className="text-start">
                      <div className="fw-bold text-dark small">Verified Professionals</div>
                      <div className="text-muted smaller">100% Satisfaction Guarantee</div>
                    </div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </div>

          <Row className="g-4">
            {/* LEFT COLUMN: SCHEDULE & SUMMARY */}
            <Col lg={4} className="order-2 order-lg-1">
              <div className="sticky-top" style={{ top: '24px', zIndex: 10 }}>

                {/* 1. DATE & TIME */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="custom-card mb-4">
                    <Card.Body className="p-4">
                      <div className="card-accent-line"></div>
                      <h5 className="section-title">
                        <div className="step-indicator">1</div>
                        Schedule
                      </h5>

                      <Form.Group className="mb-4">
                        <FloatingLabel controlId="serviceDate" label="Appointment Date">
                          <Form.Control
                            type="date"
                            className="custom-input"
                            value={serviceDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => {
                              setServiceDate(e.target.value);
                              setServiceTime('');
                              setSelectedTime('');
                            }}
                            onKeyDown={(e) => e.preventDefault()}
                          />
                        </FloatingLabel>
                        {blockedDates.includes(serviceDate) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 p-3 bg-danger bg-opacity-10 rounded-3 text-danger fw-bold small d-flex align-items-center gap-2"
                          >
                            <FaInfoCircle /> This date is fully booked. Please select another.
                          </motion.div>
                        )}
                      </Form.Group>

                      <div className="mb-3 fw-bold text-dark d-flex align-items-center gap-2 small">
                        <FaClock className="text-warning" /> AVAILABLE TIME SLOTS
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map((slot, index) => {
                          const isSlotBooked = bookedSlots.some(b => {
                            const bDate = new Date(b.serviceDate).toISOString().split('T')[0];
                            return bDate === serviceDate && b.serviceTime === slot;
                          });

                          return (
                            <motion.button
                              key={slot}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 + (index * 0.05) }}
                              className={`time-slot-btn ${selectedTime === slot ? 'active' : ''}`}
                              disabled={isSlotBooked || !serviceDate}
                              onClick={() => {
                                if (!isSlotBooked) {
                                  setSelectedTime(slot);
                                  setServiceTime(slot);
                                }
                              }}
                            >
                              {slot}
                            </motion.button>
                          );
                        })}
                      </div>
                      {!serviceDate && (
                        <p className="text-muted smaller mt-2">Please select a date first to view slots.</p>
                      )}
                    </Card.Body>
                  </Card>
                </motion.div>

                {/* 2. PRICE SUMMARY */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="custom-card">
                    <Card.Body className="p-4">
                      <div className="card-accent-line"></div>
                      <h5 className="section-title">
                        <FaCreditCard className="text-warning" />
                        Summary
                      </h5>
                      <div className="price-summary-wrapper">
                        <div className="price-summary-item">
                          <span>Service Provider Price</span>
                          <span className="fw-bold text-dark">₹{numericVendorPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="price-summary-item">
                          <span>Platform Service Fee</span>
                          <span className="fw-bold text-dark">₹{serviceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="price-summary-item total">
                          <span>Estimated Total</span>
                          <span className="text-success">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-light rounded-4 border border-white">
                        <div className="d-flex align-items-start gap-3">
                          <div className="bg-white p-2 rounded-3 shadow-sm">
                            <FaInfoCircle className="text-warning" />
                          </div>
                          <div>
                            <div className="fw-bold text-dark smaller">Cancellation Policy</div>
                            <div className="text-muted smaller">Free cancellation up to 24 hours before service.</div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </div>
            </Col>

            {/* RIGHT COLUMN: DETAILS & PAYMENT */}
            <Col lg={8} className="order-1 order-lg-2">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="custom-card border-0 shadow-lg mb-4">
                  <Card.Body className="p-4 p-md-5">
                    <Form onSubmit={handleSubmit}>

                      {/* ADDRESS SECTION */}
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                        <h5 className="section-title mb-0">
                          <div className="step-indicator">2</div>
                          Service Location
                        </h5>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleLocateMe}
                          disabled={locating}
                          className="locate-btn shadow-sm"
                        >
                          {locating ? <span className="spinner-border spinner-border-sm" /> : <FaMapMarkerAlt className="text-danger" />}
                          {locating ? 'Detecting...' : 'Auto-Detect Address'}
                        </motion.button>
                      </div>

                      <Row className="g-4 mb-5">
                        <Col md={12}>
                          <FloatingLabel controlId="address" label="Street Address / Flat No. / Landmark">
                            <Form.Control
                              placeholder="Address"
                              className="bg-light bg-opacity-50 border-0"
                              value={formData.address}
                              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={4}>
                          <FloatingLabel controlId="city" label="City">
                            <Form.Control
                              placeholder="City"
                              className="bg-light bg-opacity-50 border-0"
                              value={formData.city}
                              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={4}>
                          <FloatingLabel controlId="state" label="State">
                            <Form.Control
                              placeholder="State"
                              className="bg-light bg-opacity-50 border-0"
                              value={formData.state}
                              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={4}>
                          <FloatingLabel controlId="zip" label="Zip Code">
                            <Form.Control
                              placeholder="Zip"
                              className="bg-light bg-opacity-50 border-0"
                              value={formData.zip}
                              onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={12}>
                          <FloatingLabel controlId="instructions" label="Any specific notes for the expert?">
                            <Form.Control
                              as="textarea"
                              placeholder="Instructions"
                              className="bg-light bg-opacity-50 border-0"
                              value={formData.instructions}
                              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>

                      {/* CONTACT INFO */}
                      <h5 className="section-title mb-4">
                        <div className="step-indicator">3</div>
                        Contact Information
                      </h5>
                      <Row className="g-4 mb-5">
                        <Col md={6}>
                          <FloatingLabel controlId="fullName" label="Client Name">
                            <Form.Control
                              placeholder="Name"
                              value={formData.fullName}
                              disabled
                              className="bg-white border-dashed"
                              style={{ borderStyle: 'dashed' }}
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="email" label="Email Address">
                            <Form.Control
                              placeholder="Email"
                              value={formData.email}
                              disabled
                              className="bg-white border-dashed"
                              style={{ borderStyle: 'dashed' }}
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="phone" label="Primary Phone">
                            <Form.Control
                              placeholder="Phone"
                              value={formData.phone}
                              disabled
                              className="bg-white border-dashed"
                              style={{ borderStyle: 'dashed' }}
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="altPhone" label="Emergency Contact (Optional)">
                            <Form.Control
                              placeholder="Alt Phone"
                              value={formData.altPhone}
                              disabled
                              className="bg-white border-dashed"
                              style={{ borderStyle: 'dashed' }}
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>

                      {/* PAYMENT METHOD */}
                      <h5 className="section-title mb-4">
                        <div className="step-indicator">4</div>
                        Payment Selection
                      </h5>
                      <Tabs
                        defaultActiveKey="card"
                        id="payment-tabs"
                        className="tabs-custom mb-3"
                        onSelect={(key) => setFormData(prev => ({ ...prev, paymentMethod: key }))}
                      >
                        <Tab eventKey="card" title="PAY VIA CARD">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="payment-option-card shadow-sm border-0"
                          >
                            <Row className="g-4">
                              <Col md={12}>
                                <Form.Control placeholder="16-Digit Card Number" className="py-3 px-4 rounded-4" />
                              </Col>
                              <Col md={6}>
                                <Form.Control placeholder="Expiry Date (MM/YY)" className="py-3 px-4 rounded-4" />
                              </Col>
                              <Col md={6}>
                                <Form.Control placeholder="CVV / CVC" className="py-3 px-4 rounded-4" />
                              </Col>
                              <Col md={12}>
                                <Form.Control placeholder="Cardholder's Full Name" className="py-3 px-4 rounded-4" />
                              </Col>
                            </Row>
                            <div className="mt-4 text-center">
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" height="20" className="opacity-50 me-4" alt="visa" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" height="30" className="opacity-50 me-4" alt="mastercard" />
                              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" height="25" className="opacity-50" alt="paypal" />
                            </div>
                          </motion.div>
                        </Tab>
                        <Tab eventKey="upi" title="UPI APPS">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="payment-option-card shadow-sm border-0"
                          >
                            <div className="d-flex align-items-center gap-4 mb-4 flex-wrap justify-content-center">
                              <div className="text-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" height="40" alt="upi" />
                              </div>
                            </div>
                            <Form.Control placeholder="Enter UPI ID (e.g. mobile@upi)" className="py-3 px-4 rounded-4 text-center fs-5" />
                            <p className="text-center text-muted smaller mt-3">A request will be sent to your UPI app.</p>
                          </motion.div>
                        </Tab>
                        <Tab eventKey="netbanking" title="NET BANKING">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="payment-option-card shadow-sm border-0"
                          >
                            <Form.Select className="py-3 px-4 rounded-4 fs-6">
                              <option>Choose your bank</option>
                              <option>State Bank of India</option>
                              <option>HDFC Bank</option>
                              <option>ICICI Bank</option>
                              <option>Axis Bank</option>
                              <option>Kotak Mahindra Bank</option>
                            </Form.Select>
                          </motion.div>
                        </Tab>
                        <Tab eventKey="cash" title="PAY LATER">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="payment-option-card shadow-sm border-0 text-center py-5"
                          >
                            <div className="payment-badge mb-3">
                              <FaCheckCircle /> NO PRE-PAYMENT REQUIRED
                            </div>
                            <h4 className="fw-bold mb-2">Pay after completion</h4>
                            <p className="text-muted mb-0">Pay directly to our expert via Cash or any UPI app once the job is finished.</p>
                          </motion.div>
                        </Tab>
                      </Tabs>

                      <div className="d-grid mt-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="action-btn"
                          type="submit"
                        >
                          Schedule My Appointment • ₹{totalAmount.toLocaleString('en-IN')}
                        </motion.button>
                        <div className="d-flex align-items-center justify-content-center gap-2 mt-4 text-muted small">
                          <FaCheckCircle className="text-success" />
                          <span>Encrypted & Secured Transaction</span>
                        </div>
                      </div>

                    </Form>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </motion.div>
      <Footer />
    </>
  );
}

export default Services;
