// frontend/src/pages/ProfessionalServicePage.jsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import NavaPro from "./navbarproduct";
import Footer from "./footer";

const ProfessionalServicePage = () => {
  const { id } = useParams(); // get vendor id from URL
  const [vendor, setVendor] = useState(null);
  const [projects, setProjects] = useState([]);

  // fetch vendor details
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

  // fetch vendor projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`https://backend-d6mx.vercel.app/api/projects/${id}`);
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
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
            {vendor.description} <br />
            <strong>Category:</strong> {vendor.Category} (
            {vendor.Sub_Category?.join(", ")})
          </p>
        </Card>

        {/* Recent Projects from DB */}
        <Card className="p-4 mb-4 shadow-sm border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Recent Projects</h5>
          </div>
          <Row>
            {projects.length > 0 ? (
              projects.map((project) => (
                <Col md={4} key={project._id} className="mb-3">
                  <Card className="h-100 shadow-sm border-0">
                    <Card.Img
                      variant="top"
                      src={project.image}
                      alt={project.title}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <Card.Body>
                      <Card.Title>{project.title}</Card.Title>
                      <p className="text-muted mb-1">{project.category}</p>
                      <p>{project.description}</p>
                      <small className="text-secondary">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p>No projects uploaded yet.</p>
            )}
          </Row>
        </Card>

        {/* Client Reviews (still dummy for now) */}
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
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default ProfessionalServicePage;
