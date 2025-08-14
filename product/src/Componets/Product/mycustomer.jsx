import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, Button, Badge, Form, Tabs, Tab
} from 'react-bootstrap';
import axios from 'axios';
import NavaPro from './navbarproduct';
import Footer from './footer';

function MyOrders() {
  const [productList, setProductList] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const id = localStorage.getItem("userid");

  useEffect(() => {
    if (!id) return;

    axios.get(`https://backend-d6mx.vercel.app/orderdetails/${id}`)
      .then(res => setProductList(res.data))
      .catch(err => console.error('Failed to fetch orders:', err));

    axios.get(`https://backend-d6mx.vercel.app/cart/service/${id}`)
      .then(res => setServiceOrders(res.data))
      .catch(err => console.error('Failed to fetch service orders:', err));
  }, [id]);

  const groupedOrders = productList.reduce((acc, curr) => {
    const key = curr.orderedAt + '-' + curr.shippingAddress.fullAddress;
    if (!acc[key]) {
      acc[key] = {
        orderId: curr._id,
        orderedAt: curr.orderedAt,
        orderStatus: curr.orderStatus,
        paymentStatus: curr.paymentStatus,
        address: curr.shippingAddress,
        items: []
      };
    }
    acc[key].items.push(curr);
    return acc;
  }, {});

  const orderGroups = Object.values(groupedOrders);

  const filteredOrders = orderGroups.filter(order => {
    const orderDate = new Date(order.orderedAt);
    const isInDateRange =
      (!startDate || orderDate >= new Date(startDate)) &&
      (!endDate || orderDate <= new Date(endDate));

    const matchesStatus =
      statusFilter === 'All Orders' || order.orderStatus === statusFilter;

    return isInDateRange && matchesStatus;
  });

  const yellowBtn = {
    backgroundColor: '#FFD700',
    color: '#000',
    border: 'none',
    fontWeight: 'bold'
  };

  const whiteCard = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
    width: '100%'
  };

  return (
    <div>
      <NavaPro />
      <Container className="my-4">
        <h4 style={{ fontWeight: 'bold' }}>My Orders</h4>
        <Tabs defaultActiveKey="product" id="orders-tabs" className="mb-4">
          <Tab eventKey="product" title={`Product Orders (${filteredOrders.length})`}>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <Form.Label>Start date:</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Label>End date:</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Button style={yellowBtn}>Apply</Button>
              </Col>
              <Col md={{ span: 4 }} className="text-end">
                <Form.Label>Status:</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option>All Orders</option>
                  <option>Delivered</option>
                  <option>Shipped</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Col>
            </Row>

            {filteredOrders.length === 0 ? (
              <div className="text-muted">No orders match your filters.</div>
            ) : (
              filteredOrders.map((order, idx) => (
                <Card key={idx} style={whiteCard} className="mb-4">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6>
                        Order #{order.orderId}
                        <Badge bg="info" className="ms-2">{order.orderStatus}</Badge>
                      </h6>
                      <div className="text-muted">
                        Placed on {new Date(order.orderedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-end fw-bold">
                      ₹{order.items.reduce((sum, item) => sum + item.totalPrice, 0)}
                      <div className="fw-normal text-muted">{order.items.length} items</div>
                    </div>
                  </div>
                  <hr />
                  {order.items.map((item, i) => (
                    <Row key={i} className="mb-3 align-items-center">
                      <Col md={1}>
                        <img src={item.productImage} alt={item.productName} className="img-fluid" />
                      </Col>
                      <Col md={4}>
                        <div>{item.productName}</div>
                        <small className="text-muted">Qty: {item.quantity}</small>
                      </Col>
                      <Col md={2}>₹{item.totalPrice}</Col>
                      <Col md={5}>
                        <Badge bg="secondary">{item.orderStatus}</Badge>
                      </Col>
                    </Row>
                  ))}
                  <hr />
                  <div className="text-muted">
                    Delivery Address: {order.address.fullAddress}, {order.address.city}, {order.address.state} - {order.address.pincode}
                  </div>
                  <div className="mt-3 d-flex justify-content-end gap-2">
                    <Button style={yellowBtn} size="sm">Track Order</Button>
                    <Button style={yellowBtn} size="sm">Leave Review</Button>
                    <Button style={yellowBtn} size="sm">Reorder</Button>
                  </div>
                </Card>
              ))
            )}
          </Tab>

          <Tab eventKey="service" title={`Service Orders (${serviceOrders.length})`}>
            {serviceOrders.length === 0 ? (
              <p>No service orders found.</p>
            ) : (
              serviceOrders.map((order) => (
                <Card key={order._id} style={whiteCard} className="mb-3">
                  <Card.Body>
                    <h6 className="mb-2">Service Date: {new Date(order.serviceDate).toLocaleDateString()}</h6>
                    <p className="mb-1"><strong>Time:</strong> {order.serviceTime}</p>
                    <p className="mb-1"><strong>Status:</strong> <span className="text-success">{order.status}</span></p>
                    <p className="mb-1"><strong>Amount Paid:</strong> ₹{order.totalAmount.toFixed(2)}</p>
                    <p className="mb-0 text-muted"><strong>Address:</strong> {order.address.street}, {order.address.city}</p>
                  </Card.Body>
                </Card>
              ))
            )}
          </Tab>
        </Tabs>
      </Container>
      <Footer />
    </div>
  );
}

export default MyOrders;
