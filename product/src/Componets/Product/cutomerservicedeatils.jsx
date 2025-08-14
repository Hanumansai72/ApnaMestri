import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Tabs, Tab
} from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  const savedid = localStorage.getItem("Customerid");
  const pid = localStorage.getItem("userid");

  const handleLocateMe = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const address = data.address || {};
          const road = address.road || '';
          const houseNumber = address.house_number || '';
          const neighbourhood = address.neighbourhood || '';
          const fullStreet = `${houseNumber} ${road} ${neighbourhood}`.trim();

          setFormData((prev) => ({
            ...prev,
            address: fullStreet,
            city: address.city || address.town || address.village || '',
            state: address.state || '',
            zip: address.postcode || ''
          }));
        } catch (err) {
          toast.error("Failed to get address from location");
        }
        setLocating(false);
      },
      () => {
        toast.error("Unable to fetch location");
        setLocating(false);
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      payment: {
        method: formData.paymentMethod
      },
      totalAmount: 112.20
    };

    try {
      if (!pid) {
        toast.error("Please Login to Continue");
        return;
      }
      await axios.post("https://backend-d6mx.vercel.app/api/booking", finalData);
      toast.success("Booking submitted successfully!");
    } catch {
      toast.error("Failed to submit booking.");
    }
  };

  return (
    <Container style={{ padding: '20px', backgroundColor: '#fff9e6' }}>
      <ToastContainer />
      <h2 style={{ color: '#ffcc00' }}>Book Your Service</h2>
      <p style={{ color: '#666' }}>Complete your booking by providing the details below</p>

      <Row>
        <Col md={4}>
          <Card style={{ marginBottom: '20px', borderColor: '#ffcc00' }}>
            <Card.Body>
              <Card.Title style={{ color: '#ffcc00' }}>Select Date & Time</Card.Title>
              <Form.Control
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
              />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map((slot) => (
                  <Button
                    key={slot}
                    style={{
                      backgroundColor: selectedTime === slot ? '#ffcc00' : 'white',
                      color: selectedTime === slot ? 'black' : '#ffcc00',
                      borderColor: '#ffcc00'
                    }}
                    size="sm"
                    onClick={() => {
                      setSelectedTime(slot);
                      setServiceTime(slot);
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card style={{ borderColor: '#ffcc00' }}>
            <Card.Body>
              <Card.Title style={{ color: '#ffcc00' }}>Payment Summary</Card.Title>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li>Base Price: $80.00</li>
                <li>Selected Add-ons: $22.00</li>
                <li>Taxes & Fees: $10.20</li>
                <hr />
                <li><strong>Total Amount: $112.20</strong></li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card style={{ borderColor: '#ffcc00' }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <h5 style={{ color: '#ffcc00' }}>Customer Information</h5>
                <Row>
                  <Col md={6}>
                    <Form.Control
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="tel"
                      name="altPhone"
                      value={formData.altPhone}
                      onChange={handleInputChange}
                      placeholder="Alternate Phone"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                </Row>

                <h5 style={{ color: '#ffcc00', marginTop: '20px' }}>Service Address</h5>
                <Form.Control
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street Address"
                  style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                />
                <Button
                  onClick={handleLocateMe}
                  style={{
                    backgroundColor: '#ffcc00',
                    borderColor: '#ffcc00',
                    color: 'black',
                    marginBottom: '10px'
                  }}
                  size="sm"
                >
                  {locating ? 'Locating...' : '📍 Auto-Fill My Location'}
                </Button>

                {location.latitude && (
                  <div style={{ marginBottom: '10px', color: 'green' }}>
                    <small>Lat: {location.latitude}, Lng: {location.longitude}</small>
                  </div>
                )}

                <Row>
                  <Col md={4}>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Control
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="ZIP Code"
                      style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                    />
                  </Col>
                </Row>

                <Form.Control
                  as="textarea"
                  rows={2}
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleInputChange}
                  placeholder="Special Instructions"
                  style={{ marginBottom: '10px', borderColor: '#ffcc00' }}
                />

                <h5 style={{ color: '#ffcc00', marginTop: '20px' }}>Payment Method</h5>
                <Tabs
                  defaultActiveKey="card"
                  style={{ marginBottom: '10px' }}
                  onSelect={(key) => setFormData((prev) => ({ ...prev, paymentMethod: key }))}
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
                      <option>Bank of America</option>
                      <option>Chase</option>
                      <option>Wells Fargo</option>
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
