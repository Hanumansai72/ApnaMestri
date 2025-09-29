import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Footer from "./footer";

const AboutUs = () => {
  return (
    <>
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", padding: "60px 0" }}>
      <Container>
        {/* Header Section */}
        <Row className="mb-5 text-center">
          <Col>
            <h1 style={{ fontWeight: "bold", color: "#ffc107" }}>About Us</h1>
            <p className="lead text-dark mt-3">
              Welcome to <span style={{ fontWeight: "bold" }}>Apna Mestri</span> —
              your trusted partner for all things construction!
            </p>
          </Col>
        </Row>

        {/* Intro Section */}
        <Row className="justify-content-center mb-5">
          <Col md={10}>
            <Card className="p-4 shadow-sm border-0">
              <p className="fs-5 text-secondary">
                We know how stressful it can be to find the right plumber, carpenter,
                electrician, mason, or even an engineer for your project. Add to that
                the struggle of buying the right materials from reliable shops, and the
                whole process can feel overwhelming.
              </p>
              <p className="fs-5 text-secondary">
                That’s where we step in.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Features Section */}
        <Row className="mb-5">
          <Col md={12}>
            <h3 style={{ color: "#343a40", fontWeight: "bold" }}>At Apna Mestri, you can:</h3>
            <ul className="fs-5 text-secondary mt-3">
              <li>Hire skilled workers near you for repairs, renovations, or big projects</li>
              <li>Connect with engineers & experts for professional guidance</li>
              <li>Shop for quality materials like cement, steel, tiles, and paints from trusted vendors</li>
            </ul>
          </Col>
        </Row>

        {/* Goal Section */}
        <Row className="justify-content-center mb-5">
          <Col md={10}>
            <Card className="p-4 shadow-sm border-0 bg-light">
              <h3 style={{ color: "#ffc107", fontWeight: "bold" }}>Our Goal</h3>
              <p className="fs-5 text-secondary mt-2">
                To make construction and home improvement simple, reliable, and
                stress-free for every household and business in India.
              </p>
            </Card>
          </Col>
        </Row>

        {/* Why Choose Us Section */}
        <Row>
          <Col md={12}>
            <h3 style={{ color: "#343a40", fontWeight: "bold" }}>Why People Choose Us</h3>
            <ul className="fs-5 text-secondary mt-3">
              <li>✅ Verified workers you can trust</li>
              <li>✅ Fair pricing without hidden costs</li>
              <li>✅ Vendors who deliver quality materials</li>
              <li>✅ Simple booking process—just a few clicks</li>
              <li>✅ Support from small fixes to big builds</li>
            </ul>
            <p className="fs-5 text-dark mt-3">
              At the end of the day, <span style={{ fontWeight: "bold" }}>Apna Mistri</span> is
              here to build not just homes, but trust and happiness.
            </p>
          </Col>
        </Row>
      </Container>
    </div>
    <Footer></Footer>
    </>
  );
};

export default AboutUs;
