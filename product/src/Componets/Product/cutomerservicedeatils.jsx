import React, { useState } from 'react';
import {
  Container, Row, Col, Card, Form, Button, Tabs, Tab
} from 'react-bootstrap';
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

  // ✅ State to hold vendor price from backend
  const [vendorPrice, setVendorPrice] = useState(0);

  const navigate = useNavigate();
  const savedid = localStorage.getItem("Customerid");
  const pid = localStorage.getItem("userid");

  // ✅ Fixed service charge
  const serviceCharge = 250;
  const totalAmount = vendorPrice + serviceCharge;

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
      }
    };

    try {
      if (!pid) {
        toast.error("Please Login to Continue");
        return;
      }

      const res = await axios.post("https://backend-d6mx.vercel.app/api/booking", finalData);

      // ✅ Save vendor price in state
      setVendorPrice(res.data.vendorprice || 0);

      toast.success("Booking successful!");
      navigate("/myorder");

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
                min={new Date().toISOString().split("T")[0]} 
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
                <li>Base Price: ₹{vendorPrice.toFixed(2)}</li>
                <li>Service Charge: ₹{serviceCharge.toFixed(2)}</li>
                <hr />
                <li><strong>Total: ₹{totalAmount.toFixed(2)}</strong></li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Rest of your form (Customer Info, Address, Payment Tabs) stays unchanged */}
        <Col md={8}>
          <Card style={{ borderColor: '#ffcc00' }}>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* ... Customer Info + Address + Payment Tabs code here ... */}

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
