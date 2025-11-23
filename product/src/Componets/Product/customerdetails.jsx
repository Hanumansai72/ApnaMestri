import React, { useState, useEffect } from 'react';
import {
  Container, Form, Row, Col, Button, Card
} from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import NavaPro from './navbarproduct';
import Footer from './footer';

function CheckoutForm() {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [products, setProducts] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const userId = localStorage.getItem("userid");
  const navigate = useNavigate();

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  // ----------------- Fetch Cart -----------------
  useEffect(() => {
    if (!userId) return;

    axios.get(`https://backend-d6mx.vercel.app/carts/${userId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error('Failed to fetch cart:', err));
  }, [userId]);


  // ------------- Fetch Booked Dates & Time Slots -------------
  useEffect(() => {
    if (!products || products.length === 0) return;

    const vendorId = products[0]?.Vendorid;
    if (!vendorId) return;

    axios
      .get(`https://backend-d6mx.vercel.app/datedeatils/${vendorId}`)
      .then((res) => {
        setBookedSlots(res.data);  // [{serviceDate, serviceTime}, ...]
      })
      .catch((err) => console.error(err));
  }, [products]);


  // ---------- Disable Booked Dates in Calendar ----------
  const bookedDates = bookedSlots.map(item => new Date(item.serviceDate));

  const isDateBooked = (date) =>
    bookedDates.some(
      (b) => b.toDateString() === date.toDateString()
    );


  // -------- Get Booked Time Slots for Selected Date -------
  const bookedTimesForDate = bookedSlots
    .filter(item =>
      selectedDate &&
      item.serviceDate === selectedDate.toISOString().split("T")[0]
    )
    .map(item => item.serviceTime);


  // --------------- Auto Detect Location -----------------
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
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
          const c = result.components;
          setCity(c.city || c.town || c.village || '');
          setStateName(c.state || '');
          setPincode(c.postcode || '');
          setAddress(result.formatted || '');
        }
      } catch (error) {
        console.error(error);
      }
    });
  };


  // ----------------- Place Order -----------------
  const handlePlaceOrder = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select Date & Time");
      return;
    }

    const orders = products.map((item) => ({
      vendorid: item.Vendorid,
      productId: item.productid,
      productName: item.productname,
      productImage: item.producturl,
      quantity: item.productQuantity || 1,
      pricePerUnit: item.productprice,
      totalPrice: item.productprice * (item.productQuantity || 1),

      appointment: {
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime
      },

      customerId: userId,
      customerName: fullName,
      phone,
      email,

      shippingAddress: {
        fullAddress: address,
        city,
        pincode,
        state: stateName,
        coordinates: { latitude, longitude }
      },

      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    }));

    try {
      const response = await axios.post("https://backend-d6mx.vercel.app/ordercart", { orders });
      if (response.status === 200 || response.status === 201) {
        alert("Order placed successfully!");
        navigate("/myorder");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };


  return (
    <div>
      <NavaPro />
      <Container className="my-5">
        <Card className="p-4 shadow-sm">

          <h4 className="mb-4">Customer Information</h4>
          <Form>

            {/* Full Name + Phone */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Full Name *</Form.Label>
                <Form.Control type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Col>

              <Col md={6}>
                <Form.Label>Phone *</Form.Label>
                <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Col>
            </Row>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            {/* Locate Me */}
            <div className="mb-2">
              <Form.Label>📍 Auto-detect Address</Form.Label><br />
              <Button size="sm" style={{ backgroundColor: '#FFD700', border: 'none', color: '#000' }}
                onClick={handleLocateMe}>
                Locate Me
              </Button>
            </div>

            {/* Address */}
            <Form.Group className="mb-3">
              <Form.Label>Address *</Form.Label>
              <Form.Control as="textarea" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </Form.Group>

            {/* City, State, Pincode */}
            <Row className="mb-3">
              <Col md={4}>
                <Form.Label>City *</Form.Label>
                <Form.Control value={city} onChange={(e) => setCity(e.target.value)} />
              </Col>

              <Col md={4}>
                <Form.Label>State *</Form.Label>
                <Form.Control value={stateName} onChange={(e) => setStateName(e.target.value)} />
              </Col>

              <Col md={4}>
                <Form.Label>Pincode *</Form.Label>
                <Form.Control value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </Col>
            </Row>


            {/* ------------------- Date Picker ------------------- */}
            <h5 className="mb-2">Select Appointment Date</h5>

            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
              minDate={new Date()}
              filterDate={(date) => !isDateBooked(date)}
              placeholderText="Choose a date"
              className="form-control mb-3"
              dateFormat="yyyy-MM-dd"
            />

            {/* ---------------- Time Slots ---------------- */}
            {selectedDate && (
              <>
                <h5>Select Time Slot</h5>
                <Row>
                  {timeSlots.map((slot, index) => {
                    const booked = bookedTimesForDate.includes(slot);

                    return (
                      <Col md={4} key={index} className="mb-2">
                        <Button
                          disabled={booked}
                          variant={booked ? "secondary" : "warning"}
                          className="w-100"
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}{" "}
                          {booked && <span className="badge bg-danger ms-2">Booked</span>}
                        </Button>
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}

            {/* ---------------- Payment Options ---------------- */}
            <h5 className="mt-4">Payment Method</h5>

            {['cod', 'online', 'upi'].map((method, idx) => (
              <Card
                key={idx}
                className="p-3 mb-2"
                onClick={() => setPaymentMethod(method)}
                style={{ borderColor: paymentMethod === method ? "#FFD700" : "#ccc" }}
              >
                <Form.Check
                  type="radio"
                  label={
                    method === 'cod' ? "Cash on Delivery" :
                      method === 'online' ? "Online Payment" : "UPI Payment"
                  }
                  checked={paymentMethod === method}
                />
              </Card>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-between mt-3">
              <Button variant="outline-warning">← Continue Shopping</Button>
              <Button style={{ backgroundColor: '#FFD700', border: 'none' }} onClick={handlePlaceOrder}>
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
