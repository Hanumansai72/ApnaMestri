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

  // Styles
  const primaryColor = '#FFD700'; // Gold
  const secondaryColor = '#1A202C'; // Dark slate
  const softBg = '#F7FAFC';

  return (
    <>
      <NavaPro />
      <style>{`
        .booking-container {
          background-color: ${softBg};
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
        }
        .section-title {
          font-weight: 700;
          color: ${secondaryColor};
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .custom-card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          background: white;
          overflow: hidden;
          transition: transform 0.2s;
        }
        .custom-card:hover {
          transform: translateY(-2px);
        }
        .time-slot-btn {
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 16px;
          transition: all 0.3s ease;
          border: 1px solid #E2E8F0;
        }
        .time-slot-btn.active {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
          color: black;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }
        .time-slot-btn:disabled {
          background-color: #EDF2F7;
          color: #A0AEC0;
          cursor: not-allowed;
          border-color: #EDF2F7;
          opacity: 0.7;
        }
        .price-summary-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #EDF2F7;
          font-weight: 500;
          color: #4A5568;
        }
        .price-summary-item.total {
          border-bottom: none;
          font-size: 1.25rem;
          font-weight: 800;
          color: ${secondaryColor};
          margin-top: 10px;
        }
        .form-floating > label {
          color: #718096;
        }
        .form-control:focus {
          border-color: ${primaryColor};
          box-shadow: 0 0 0 4px rgba(255, 215, 0, 0.15);
        }
        .tabs-custom .nav-link {
          color: #718096;
          font-weight: 600;
          border: none;
          border-bottom: 2px solid transparent;
        }
        .tabs-custom .nav-link.active {
          color: ${secondaryColor};
          border-bottom: 2px solid ${primaryColor};
        }
        .action-btn {
          background: linear-gradient(135deg, ${primaryColor}, #FFC300);
          border: none;
          color: black;
          font-weight: 700;
          padding: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(255, 195, 0, 0.4);
          transition: all 0.3s;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 195, 0, 0.5);
          background: linear-gradient(135deg, #FFC300, ${primaryColor});
        }
      `}</style>

      <motion.div
        className="booking-container py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Container>
          <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} />

          <Row className="mb-4">
            <Col>
              <motion.h2
                className="display-6 fw-bold text-dark mb-1"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Book Your Service
              </motion.h2>
              <p className="text-muted lead">Complete the details below to schedule your expert.</p>
            </Col>
          </Row>

          <Row className="g-4">
            {/* LEFT COLUMN: SCHEDULE & SUMMARY */}
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '20px', zIndex: 1 }}>

                {/* 1. DATE & TIME */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="custom-card mb-4">
                    <Card.Body className="p-4">
                      <h5 className="section-title"><FaCalendarAlt className="text-warning" /> Date & Time</h5>

                      <Form.Group className="mb-4">
                        <FloatingLabel controlId="serviceDate" label="Select Date">
                          <Form.Control
                            type="date"
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
                          <div className="mt-2 text-danger fw-bold small d-flex align-items-center">
                            <FaInfoCircle className="me-1" /> Fully Booked
                          </div>
                        )}
                      </Form.Group>

                      <div className="mb-2 fw-semibold text-secondary d-flex align-items-center gap-2">
                        <FaClock className="text-warning" /> Available Slots
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map(slot => {
                          const isSlotBooked = bookedSlots.some(b => {
                            const bDate = new Date(b.serviceDate).toISOString().split('T')[0];
                            return bDate === serviceDate && b.serviceTime === slot;
                          });

                          return (
                            <motion.button
                              key={slot}
                              whileTap={{ scale: 0.95 }}
                              className={`time-slot-btn ${selectedTime === slot ? 'active' : ''}`}
                              disabled={isSlotBooked}
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
                    </Card.Body>
                  </Card>
                </motion.div>

                {/* 2. PRICE SUMMARY */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="custom-card">
                    <Card.Body className="p-4">
                      <h5 className="section-title"><FaCreditCard className="text-warning" /> Summary</h5>
                      <div className="price-summary-wrapper">
                        <div className="price-summary-item">
                          <span>Base Price</span>
                          <span>₹{numericVendorPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="price-summary-item">
                          <span>Service Charge (7%)</span>
                          <span>₹{serviceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="price-summary-item total">
                          <span>Total Amount</span>
                          <span className="text-success">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </div>
            </Col>

            {/* RIGHT COLUMN: DETAILS & PAYMENT */}
            <Col lg={8}>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="custom-card">
                  <Card.Body className="p-4 p-md-5">
                    <Form onSubmit={handleSubmit}>

                      {/* ADDRESS SECTION */}
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="section-title mb-0"><FaMapMarkerAlt className="text-warning" /> Service Location</h5>
                        <Button
                          variant="light"
                          size="sm"
                          onClick={handleLocateMe}
                          disabled={locating}
                          className="d-flex align-items-center gap-2 fw-semibold shadow-sm"
                          style={{ color: secondaryColor }}
                        >
                          {locating ? <span className="spinner-border spinner-border-sm" /> : <FaMapMarkerAlt className="text-danger" />}
                          {locating ? 'Locating...' : 'Auto-Locate'}
                        </Button>
                      </div>

                      <Row className="g-3 mb-4">
                        <Col md={12}>
                          <FloatingLabel controlId="address" label="Street Address / Flat No.">
                            <Form.Control
                              placeholder="Address"
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
                              value={formData.zip}
                              onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                              required
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={12}>
                          <FloatingLabel controlId="instructions" label="Special Instructions (Landmark, etc.)">
                            <Form.Control
                              as="textarea"
                              placeholder="Instructions"
                              style={{ height: '100px' }}
                              value={formData.instructions}
                              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>

                      <hr className="my-5 text-muted opacity-25" />

                      {/* CONTACT INFO */}
                      <h5 className="section-title"><FaUser className="text-warning" /> Contact Details</h5>
                      <Row className="g-3 mb-4">
                        <Col md={6}>
                          <FloatingLabel controlId="fullName" label="Full Name">
                            <Form.Control
                              placeholder="Name"
                              value={formData.fullName}
                              disabled
                              className="bg-light"
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="email" label="Email Address">
                            <Form.Control
                              placeholder="Email"
                              value={formData.email}
                              disabled
                              className="bg-light"
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="phone" label="Phone Number">
                            <Form.Control
                              placeholder="Phone"
                              value={formData.phone}
                              disabled
                              className="bg-light"
                            />
                          </FloatingLabel>
                        </Col>
                        <Col md={6}>
                          <FloatingLabel controlId="altPhone" label="Alternate Phone">
                            <Form.Control
                              placeholder="Alt Phone"
                              value={formData.altPhone}
                              disabled
                              className="bg-light"
                            />
                          </FloatingLabel>
                        </Col>
                      </Row>

                      <hr className="my-5 text-muted opacity-25" />

                      {/* PAYMENT METHOD */}
                      <h5 className="section-title"><FaCreditCard className="text-warning" /> Payment Method</h5>
                      <Tabs
                        defaultActiveKey="card"
                        id="payment-tabs"
                        className="tabs-custom mb-3"
                        onSelect={(key) => setFormData(prev => ({ ...prev, paymentMethod: key }))}
                      >
                        <Tab eventKey="card" title="Card Payment">
                          <div className="p-3 bg-light rounded-3">
                            <Row className="g-3">
                              <Col md={12}>
                                <Form.Control placeholder="Card Number" className="bg-white" />
                              </Col>
                              <Col md={6}>
                                <Form.Control placeholder="Expiry (MM/YY)" className="bg-white" />
                              </Col>
                              <Col md={6}>
                                <Form.Control placeholder="CVV" className="bg-white" />
                              </Col>
                              <Col md={12}>
                                <Form.Control placeholder="Cardholder Name" className="bg-white" />
                              </Col>
                            </Row>
                          </div>
                        </Tab>
                        <Tab eventKey="upi" title="UPI">
                          <div className="p-3 bg-light rounded-3">
                            <Form.Control placeholder="Enter UPI ID (e.g. user@okhdfcbank)" className="bg-white" />
                          </div>
                        </Tab>
                        <Tab eventKey="netbanking" title="Net Banking">
                          <div className="p-3 bg-light rounded-3">
                            <Form.Select className="bg-white">
                              <option>Select Bank</option>
                              <option>SBI</option>
                              <option>HDFC</option>
                              <option>ICICI</option>
                              <option>Axis Bank</option>
                            </Form.Select>
                          </div>
                        </Tab>
                        <Tab eventKey="cash" title="Pay on Service">
                          <div className="p-4 bg-light rounded-3 text-center">
                            <FaCheckCircle className="text-success fs-3 mb-2" />
                            <p className="mb-0 fw-semibold text-dark">You can pay via Cash or UPI after service completion.</p>
                          </div>
                        </Tab>
                      </Tabs>

                      <div className="d-grid mt-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="action-btn"
                          type="submit"
                        >
                          Confirm Booking (₹{totalAmount.toLocaleString('en-IN')})
                        </motion.button>
                        <p className="text-center text-muted small mt-3">
                          By booking, you agree to our Terms of Service.
                        </p>
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
