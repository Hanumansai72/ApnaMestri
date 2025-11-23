import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const savedid = localStorage.getItem("Customerid"); // Vendor ID
  const pid = localStorage.getItem("userid"); // Customer ID

  const numericVendorPrice = Number(vendorPrice) || 0;
  const totalAmount = numericVendorPrice + serviceCharge;

  // Fetch vendor price
  useEffect(() => {
    if (savedid) {
      axios
        .get(`https://backend-d6mx.vercel.app/api/vendor/${savedid}/price`)
        .then(res => setVendorPrice(Number(res.data.vendorPrice) || 0))
        .catch(() => setVendorPrice(0));
    }
  }, [savedid]);

  // Fetch saved booking details
  useEffect(() => {
    if (pid) {
      axios
        .get(`https://backend-d6mx.vercel.app/fetch/location/booking/${pid}`)
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
      .get(`https://backend-d6mx.vercel.app/datedeatils/${savedid}`)
      .then((res) => {
        setBookedSlots(res.data);

        const dates = res.data.map(item => item.serviceDate);
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
      await axios.post("https://backend-d6mx.vercel.app/api/booking", finalData);
      toast.success("Booking Successful!");
      navigate("/myorder");
    } catch {
      toast.error("Booking failed");
    }
  };

  return (
    <Container style={{ padding: '20px', backgroundColor: '#fff9e6' }}>
      <ToastContainer />
      <h2 style={{ color: '#ffcc00' }}>Book Your Service</h2>
      <p style={{ color: '#666' }}>Select date, time and complete booking.</p>

      <Row>
        <Col md={4}>
          {/* DATE & TIME CARD */}
          <Card style={{ marginBottom: '20px', borderColor: '#ffcc00' }}>
            <Card.Body>
              <Card.Title style={{ color: '#ffcc00' }}>Select Date & Time</Card.Title>

              {/* ⭐ BLOCKED DATE LOGIC */}
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
                style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
              />

              {/* SHOW MESSAGE IF DATE BLOCKED */}
              {blockedDates.includes(serviceDate) && (
                <p style={{ color: "red", fontWeight: "bold" }}>
                  ❌ All slots booked for this date
                </p>
              )}

              {/* ⭐ TIME SLOT BLOCKING */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map(slot => {
                  const isSlotBooked = bookedSlots.some(
                    b => b.serviceDate === serviceDate && b.serviceTime === slot
                  );

                  return (
                    <Button
                      key={slot}
                      disabled={isSlotBooked}
                      style={{
                        backgroundColor: selectedTime === slot ? '#ffcc00' : 'white',
                        color: isSlotBooked ? 'gray' : selectedTime === slot ? 'black' : '#ffcc00',
                        borderColor: isSlotBooked ? 'gray' : '#ffcc00',
                        opacity: isSlotBooked ? 0.5 : 1
                      }}
                      size="sm"
                      onClick={() => {
                        if (!isSlotBooked) {
                          setSelectedTime(slot);
                          setServiceTime(slot);
                        }
                      }}
                    >
                      {slot} {isSlotBooked ? "(Booked)" : ""}
                    </Button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* PAYMENT SUMMARY */}
          <Card style={{ borderColor: '#ffcc00' }}>
            <Card.Body>
              <Card.Title style={{ color: '#ffcc00' }}>Payment Summary</Card.Title>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Base Price: ₹{numericVendorPrice.toFixed(2)}</li>
                <li>Service Charge: ₹{serviceCharge.toFixed(2)}</li>
                <hr />
                <li><strong>Total: ₹{totalAmount.toFixed(2)}</strong></li>
              </ul>
            </Card.Body>
          </Card>

          <Button
            onClick={handleLocateMe}
            disabled={locating}
            style={{ marginTop: '10px', backgroundColor: '#ffcc00', borderColor: '#ffcc00', color: 'black' }}
          >
            {locating ? 'Locating...' : 'Locate Me'}
          </Button>
        </Col>

        <Col md={8}>
          {/* CUSTOMER DETAILS */}
          <Card style={{ borderColor: '#ffcc00' }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <h5 style={{ color: '#ffcc00' }}>Customer Information</h5>

                <Row>
                  <Col md={6}>
                    <Form.Control value={formData.fullName} disabled style={{ marginBottom: '10px', borderColor: '#ffcc00' }} />
                  </Col>
                  <Col md={6}>
                    <Form.Control type="email" value={formData.email} disabled style={{ marginBottom: '10px', borderColor: '#ffcc00' }} />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Control type="tel" value={formData.phone} disabled style={{ marginBottom: '10px', borderColor: '#ffcc00' }} />
                  </Col>
                  <Col md={6}>
                    <Form.Control type="tel" value={formData.altPhone} disabled style={{ marginBottom: '10px', borderColor: '#ffcc00' }} />
                  </Col>
                </Row>

                <h5 style={{ color: '#ffcc00', marginTop: '20px' }}>Service Address</h5>

                <Form.Control
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                />

                <Row>
                  <Col md={4}>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      name="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      name="zip"
                      value={formData.zip}
                      onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                </Row>

                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Special Instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                />

                {/* PAYMENT METHODS */}
                <h5 style={{ color: '#ffcc00', marginTop: '20px' }}>Payment Method</h5>
                <Tabs
                  defaultActiveKey="card"
                  onSelect={(key) => setFormData(prev => ({ ...prev, paymentMethod: key }))}
                >
                  <Tab eventKey="card" title="Card">
                    <Form.Control placeholder="Card Number" style={{ marginBottom: '5px', borderColor: '#ffcc00' }} />
                    <Form.Control placeholder="Expiry Date (MM/YY)" style={{ marginBottom: '5px', borderColor: '#ffcc00' }} />
                    <Form.Control placeholder="CVV" style={{ marginBottom: '5px', borderColor: '#ffcc00' }} />
                    <Form.Control placeholder="Name on Card" style={{ marginBottom: '5px', borderColor: '#ffcc00' }} />
                  </Tab>

                  <Tab eventKey="upi" title="UPI">
                    <Form.Control placeholder="Enter UPI ID" style={{ borderColor: '#ffcc00' }} />
                  </Tab>

                  <Tab eventKey="netbanking" title="Net Banking">
                    <Form.Select style={{ borderColor: '#ffcc00' }}>
                      <option>Select Bank</option>
                      <option>SBI</option>
                      <option>ICICI</option>
                      <option>HDFC</option>
                    </Form.Select>
                  </Tab>

                  <Tab eventKey="cash" title="Cash">
                    <p style={{ marginTop: '10px' }}>Pay at the time of service.</p>
                  </Tab>
                </Tabs>

                <Button
                  type="submit"
                  style={{
                    backgroundColor: '#ffcc00',
                    borderColor: '#ffcc00',
                    color: 'black',
                    marginTop: '10px'
                  }}
                >
                  Book Now
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Services;
