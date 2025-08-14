import React from "react";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from './footer';
import NavaPro from './navbarproduct';

export default function ProfessionalServicePage() {
  return (
    <>
      <NavaPro></NavaPro>
    <Container className="my-4">
      {/* Profile Header */}
      <Card className="p-3 shadow-sm border-0 mb-4">
        <Row className="align-items-center">
          <Col md={2} className="text-center">
            <Image
              src="https://via.placeholder.com/120"
              roundedCircle
              alt="Profile"
              width={120}
              height={120}
            />
          </Col>
          <Col md={7}>
            <h4 className="mb-1">Rajesh Kumar</h4>
            <p className="text-muted mb-1">
              Electrical Installation & Repairs – Technical
            </p>
            <p className="mb-0">
              ⭐ 4.8 | 112 reviews | Hyderabad, India
            </p>
          </Col>
          <Col md={3} className="text-md-end mt-3 mt-md-0">
            <Button variant="warning" className="fw-bold">
              Contact Now
            </Button>
          </Col>
        </Row>
      </Card>

      {/* About the Service */}
      <Card className="p-4 shadow-sm border-0 mb-4">
        <h5 className="mb-3">About the Service</h5>
        <p>
          With 10+ years of experience in residential and commercial electrical
          work, I provide a wide range of services including wiring installation,
          repairs, and electrical maintenance. Safety and precision are my top priorities.
        </p>

        <Row>
          <Col md={6}>
            <ul>
              <li>✔ Wiring & rewiring</li>
              <li>✔ Electrical troubleshooting</li>
              <li>✔ Panel upgrades</li>
            </ul>
          </Col>
          <Col md={6}>
            <ul>
              <li>✔ Fan & Light installation</li>
              <li>✔ Appliance installation</li>
              <li>✔ Emergency electrical repairs</li>
            </ul>
          </Col>
        </Row>

        <p className="mt-3"><strong>Experience:</strong> 10 Years</p>
        <p><strong>Languages:</strong> English, Hindi, Telugu</p>
        <p><strong>Work Area:</strong> Hyderabad & 25km radius</p>
      </Card>

      {/* Customer Reviews */}
      <Card className="p-4 shadow-sm border-0 mb-4">
        <h5 className="mb-3">Customer Reviews</h5>

        <div className="mb-4 border-bottom pb-3">
          <strong>Riya Sharma</strong>
          <p className="mb-1 text-warning">⭐⭐⭐⭐⭐</p>
          <p>
            Rajesh was very professional and fixed our electrical issues quickly.
            Highly recommended!
          </p>
        </div>

        <div className="mb-4 border-bottom pb-3">
          <strong>Amit Patel</strong>
          <p className="mb-1 text-warning">⭐⭐⭐⭐⭐</p>
          <p>
            Excellent service, fixed our fan and light issues. Great workmanship.
          </p>
        </div>

        <div>
          <strong>Sunil Mehra</strong>
          <p className="mb-1 text-warning">⭐⭐⭐⭐</p>
          <p>
            Did a great job, completed the work on time and was very polite.
          </p>
        </div>
      </Card>

      {/* Similar Services */}
      <h5 className="mb-3">Similar Services You May Like</h5>
      <Row>
        {["John Doe", "Amit Singh", "Ravi Kumar", "Michael Lee"].map((name, idx) => (
          <Col key={idx} md={3} sm={6} className="mb-3">
            <Card className="shadow-sm border-0">
              <Image
                src={`https://i.pravatar.cc/300?img=${idx + 10}`}
                alt={name}
                className="card-img-top"
              />
              <Card.Body>
                <Card.Title>{name}</Card.Title>
                <Card.Text>Electrical Services</Card.Text>
                <Button variant="outline-primary" size="sm">
                  View Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
      <Footer></Footer>
      </>
  );
}


