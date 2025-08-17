// frontend/src/pages/ProfessionalServicePage.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import NavaPro from "./navbarproduct";
import Footer from "./footer";

const ProfessionalServicePage = () => {
  const { id } = useParams(); // get vendor id from URL
  const [vendor, setVendor] = useState(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await fetch(`https://backend-d6mx.vercel.app/profesionaldetails/${id}`);
        const data = await res.json();
        setVendor(data);
      } catch (err) {
        console.error("Error fetching vendor:", err);
      }
    };
    fetchVendor();
  }, [id]);

  if (!vendor) {
    return (
      <div className="text-center mt-5">
        <h4>Loading profile...</h4>
      </div>
    );
  }

  return (
    <>
      <NavaPro />
      <Container className="py-4" style={{ background: "#fff" }}>
        {/* Header Section */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <Row>
            <Col md={2} className="text-center">
              <img
                src={vendor.Profile_Image}
                alt="profile"
                className="rounded-circle"
                width="120"
                height="120"
              />
            </Col>
            <Col md={7}>
              <h3>{vendor.Owner_name}</h3>
              <h6 className="text-muted">{vendor.Business_Name}</h6>
              <p className="text-secondary">
                {vendor.Business_address}
              </p>
            </Col>
            <Col md={3} className="text-md-end text-center">
              <Button
                style={{ backgroundColor: "#FFD700", color: "#000", border: "none" }}
                className="mb-2 w-100"
              >
                Hire Now
              </Button>
              <Button variant="outline-dark" className="w-100">
                Message
              </Button>
            </Col>
          </Row>
        </Card>

        {/* About Section */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <h5>About {vendor.Owner_name}</h5>
          <p>
            With years of experience in {vendor.Category} ({vendor.Sub_Category?.join(", ")}),
            I specialize in delivering high-quality solutions tailored to client needs. 
            My focus is always on durability, functionality, and customer satisfaction.
          </p>
        </Card>

        {/* Recent Projects (Dummy for now) */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Recent Projects</h5>
            <Button
              size="sm"
              style={{ backgroundColor: "#FFD700", color: "#000", border: "none" }}
            >
              All Projects
            </Button>
          </div>
          <Row>
            {[
              {
                title: "Modern Living Room Makeover",
                img: "https://via.placeholder.com/300x200",
                location: "Bandra, Mumbai",
                date: "March 10, 2023",
              },
              {
                title: "Premium Kitchen Renovation",
                img: "https://via.placeholder.com/300x200",
                location: "Juhu, Mumbai",
                date: "Nov 12, 2022",
              },
              {
                title: "Home Office Setup",
                img: "https://via.placeholder.com/300x200",
                location: "Andheri, Mumbai",
                date: "Jan 20, 2023",
              },
            ].map((project, i) => (
              <Col md={4} key={i} className="mb-3">
                <Card className="h-100 shadow-sm border-0">
                  <Card.Img variant="top" src={project.img} />
                  <Card.Body>
                    <Card.Title>{project.title}</Card.Title>
                    <p className="text-muted mb-1">{project.location}</p>
                    <small>{project.date}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Client Reviews (Dummy for now) */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Client Reviews</h5>
            <span className="fw-bold">⭐ 4.8 (124 reviews)</span>
          </div>
          <Row>
            {[
              {
                name: "Priya Sharma",
                review:
                  "Rajesh transformed our living room with his incredible craftsmanship. Highly recommended!",
                date: "March 10, 2023",
              },
              {
                name: "Anil Kapoor",
                review:
                  "We hired Rajesh for our kitchen renovation and couldn’t be happier with the results.",
                date: "Nov 12, 2022",
              },
              {
                name: "Meera Desai",
                review:
                  "Perfect home office setup. Professional, punctual, and a pleasure to work with.",
                date: "Jan 20, 2023",
              },
              {
                name: "Vikram Singh",
                review:
                  "Needed stylish furniture for my restaurant. Rajesh delivered exactly what I wanted.",
                date: "Feb 11, 2023",
              },
            ].map((rev, i) => (
              <Col md={6} key={i} className="mb-3">
                <Card className="p-3 shadow-sm border-0">
                  <h6>{rev.name}</h6>
                  <p className="text-muted">{rev.review}</p>
                  <small className="text-secondary">{rev.date}</small>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center">
            <Button
              style={{ backgroundColor: "#FFD700", color: "#000", border: "none" }}
            >
              View All Reviews
            </Button>
          </div>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default ProfessionalServicePage;
