import React, { useState, useEffect } from 'react';
import {
  Container, Form, Row, Col, Button, Card
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavaPro from './navbarproduct';
import Footer from './footer';

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

  const id = localStorage.getItem("userid");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    axios.get(`https://backend-d6mx.vercel.app/carts/${id}`)
      .then(res => setprodicts(res.data))
      .catch(err => console.error('Failed to fetch cart:', err));
  }, [id]);

  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

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
      }
    }, (error) => {
      console.error("Geolocation failed:", error);
      alert("Failed to get your current location.");
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
      const response = await axios.post("https://backend-d6mx.vercel.app/ordercart", { orders });
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

  return (
    <div>
      <NavaPro />
      <Container className="my-5">
        <Card className="p-4 shadow-sm w-100" style={{ backgroundColor: '#fff' }}>
          <h4 className="mb-4">Customer Information</h4>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="fullName">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Row className="mb-2">
              <Col>
                <Form.Label>📍 Auto-detect your address</Form.Label><br />
                <Button
                  size="sm"
                  style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                  onClick={handleLocateMe}
                >
                  Locate Me
                </Button>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="address">
              <Form.Label>Address *</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
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
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">Payment Method</h5>

            {['cod', 'online', 'upi'].map((method, idx) => (
              <Card
                key={idx}
                className="mb-2 p-3 w-100"
                onClick={() => setPaymentMethod(method)}
                style={{
                  borderColor: paymentMethod === method ? '#FFD700' : '#ccc',
                  cursor: 'pointer'
                }}
              >
                <Form.Check
                  type="radio"
                  name="payment"
                  label={
                    method === 'cod' ? 'Cash on Delivery' :
                    method === 'online' ? 'Online Payment' : 'UPI Payment'
                  }
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
              </Card>
            ))}

            <div className="d-flex justify-content-between">
              <Button
                style={{ backgroundColor: 'transparent', border: '2px solid #FFD700', color: '#000' }}
              >
                ← Continue Shopping
              </Button>
              <Button
                style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                onClick={handlePlaceOrder}
              >
                Place Order →
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
      <Footer />
    </div>
  );
}

export default CheckoutForm;
