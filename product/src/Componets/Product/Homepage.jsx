import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaPlayCircle, FaSearch, FaUserCheck, FaBoxOpen, FaClipboardCheck, FaCalculator, FaCubes, FaPaintRoller, FaLayerGroup, FaTruck, FaHardHat, FaCogs, FaRegBuilding } from 'react-icons/fa';
import { FaTrowelBricks } from 'react-icons/fa6';
import { BsChevronDoubleDown, BsHouse } from 'react-icons/bs';
import { FiArrowRight } from 'react-icons/fi';
import { Link as ScrollLink } from 'react-scroll';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

import NavaPro from './navbarproduct';
import Footer from './footer';
import './Homepage.css';

const Homepage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState([]);


  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingIcons = [
    { icon: 'ri-flashlight-line', color: 'text-warning', delay: 0 },
    { icon: 'ri-drop-line', color: 'text-warning', delay: 0.2 },
    { icon: 'ri-hammer-line', color: 'text-warning', delay: 0.4 },
    { icon: 'ri-tools-line', color: 'text-warning', delay: 0.6 },
    { icon: 'ri-settings-3-line', color: 'text-warning', delay: 0.8 },
  ];

  const handleCategoryClick = (type, cat) => {
  const key = type.toLowerCase();
  const searchTerm = cat.name || cat.title; // fallback to title if name is undefined
  if (key === "materials") {
    navigate(`/product?search=${encodeURIComponent(searchTerm)}`);
  } else if (key === "service" || key === "services") {
    navigate(`/service?search=${encodeURIComponent(searchTerm)}`);
  } else {
    console.error("Unknown category type for navigation:", type);
  }
};


  const yellow = "#FFD700";

  const howItWorksData = [
    { icon: FaSearch, title: "Plan & Design", text: "Submit your project requirements and get consultation.", color: yellow },
    { icon: FaUserCheck, title: "Book Engineers", text: "Select certified civil engineers, contractors, and workers.", color: yellow },
    { icon: FaBoxOpen, title: "Order Materials", text: "Get quality materials delivered directly to your project site.", color: yellow },
    { icon: FaClipboardCheck, title: "Build & Complete", text: "Monitor project progress and ensure quality completion.", color: yellow }
  ];

  const civilServicesData = [
    { icon: FaRegBuilding, title: "Civil Engineer", text: "Structural design, planning, project management", projects: "0 projects done", color: yellow },
    { icon: BsHouse, title: "Contractor", text: "Building construction, renovation, supervision", projects: "0 projects done", color: yellow },
    { icon: FaTrowelBricks, title: "Mason", text: "Brickwork, concrete, plastering", projects: "0 projects done", color: yellow },
    { icon: FaTruck, title: "Material Supplier", text: "Cement, steel, bricks delivery", projects: "0 projects done", color: yellow },
    { icon: FaHardHat, title: "Site Engineer", text: "Quality control, supervision, testing", projects: "0 projects done", color: yellow },
    { icon: FaCogs, title: "Equipment Rental", text: "Excavators, cranes, construction tools", projects: "0 projects done", color: yellow },
  ];

  const materialsData = [
    { icon: FaCalculator, title: "Cement", text: "Portland cement, ready mix concrete", items: "0 items", color: yellow },
    { icon: FaLayerGroup, title: "Steel", text: "TMT bars, structural steel, mesh", items: "0 items", color: yellow },
    { icon: FaCubes, title: "Bricks", text: "Clay bricks, concrete blocks, tiles", items: "0 items", color: yellow },
    { icon: FaPaintRoller, title: "Paints", text: "Exterior paints, primers, sealers", items: "0 items", color: yellow },
  ];

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0, opacity: 1,
      transition: { type: "spring", stiffness: 50, duration: 0.8 }
    }
  };

  const sectionVariants = {
    offscreen: { opacity: 0 },
    onscreen: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };
  // ⭐ Fetch Recently Viewed Products
useEffect(() => {
  const ids = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

  if (ids.length === 0) return;

  axios.post("https://backend-d6mx.vercel.app/recent-products", { ids })
    .then(res => setRecentProducts(res.data))
    .catch(err => console.log(err));
}, [product?._id]);


  return (
    <>
      <NavaPro />

      {/* Hero Section */}
      <header className="hero-section position-relative d-flex align-items-center justify-content-center overflow-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, white, #f8f8f8)' }}>
        <div className="position-absolute w-100 h-100 opacity-10 z-0" style={{
          backgroundImage: `linear-gradient(rgba(255,215,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className={`position-absolute ${item.color} fs-2 d-flex justify-content-center align-items-center`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + index * 10}%`,
              width: '60px',
              height: '60px'
            }}
          >
            <i className={item.icon}></i>
          </motion.div>
        ))}

        {/* Cursor Glow */}
        <motion.div
          className="position-fixed pointer-events-none z-0"
          animate={{
            x: mousePosition.x - 50,
            y: mousePosition.y - 50,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 30 }}
          style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.2), rgba(255,215,0,0.1))',
            filter: 'blur(40px)',
            position: 'fixed',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />

        {/* Content */}
        <Container className="text-center position-relative z-2">
          <motion.h1 className="display-3 fw-bold text-dark mb-4" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            Book Experts,<br />Buy Products
          </motion.h1>
          <motion.p className="lead text-dark mb-4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            Your one-stop platform for civil services & quality materials.
          </motion.p>
          <motion.div className="d-flex justify-content-center gap-3 flex-wrap" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <Button
  className="px-4 py-2 fw-semibold text-dark"
  style={{ backgroundColor: yellow, border: 'none' }}
  onClick={() => navigate('/login')}
>
  <FaPlayCircle className="me-2" /> Get Started
</Button>

          </motion.div>
          <ScrollLink to="how-it-works" smooth={true} duration={500}>
            <motion.div className="mt-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <BsChevronDoubleDown size={30} style={{ color: yellow }} />
              </motion.div>
            </motion.div>
          </ScrollLink>
        </Container>
      </header>
      {/* ⭐ Recently Viewed Section */}
{recentProducts.length > 0 && (
  <div className="mt-5">
    <h4 className="mb-3">Recently Viewed</h4>
    <Row>
      {recentProducts.slice(0, 4).map((prod) => (
        <Col md={3} key={prod._id} className="mb-3">
          <Card className="related-product-card h-100">
            <Card.Img
              variant="top"
              src={prod.ProductUrl?.[0] || '/placeholder.png'}
              style={{ height: '200px', objectFit: 'cover' }}
            />
            <Card.Body>
              <Card.Title>{prod.ProductName}</Card.Title>
              <Card.Text className="fw-bold">₹{prod.ProductPrice}</Card.Text>
              <Button
                className="w-100 btn-add-to-cart"
                size="sm"
                onClick={() => navigate(`/product/${prod._id}`)}
              >
                View
              </Button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
)}


      {/* How It Works */}
      <section className="py-5 text-center bg-white border-top border-light" id="how-it-works">
        <Container>
          <h2 className="fw-bold display-5 mb-3" style={{ color: yellow }}>How It Works</h2>
          <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
            <Row>
              {howItWorksData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Col lg={3} md={6} key={index} className="mb-4">
                    <motion.div variants={cardVariants}>
                      <Card className="bg-light text-dark border-light h-100 p-3 rounded-4">
                        <Card.Body>
                          <div className="d-flex align-items-center justify-content-center rounded-3 mx-auto mb-4" style={{ backgroundColor: item.color, width: '60px', height: '60px' }}>
                            <Icon size="1.8rem" />
                          </div>
                          <Card.Title className="fw-bold">{item.title}</Card.Title>
                          <Card.Text className="text-secondary">{item.text}</Card.Text>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Civil Services */}
      <section className="py-5 text-center bg-white">
        <Container>
          <h2 className="fw-bold display-5 mb-3" style={{ color: yellow }}>Services</h2>
          <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
            <Row>
              {civilServicesData.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Col lg={4} md={6} key={index} className="mb-4">
                    <motion.div variants={cardVariants}>
                      <Card 
                        className="bg-light text-dark border-light h-100 p-3 rounded-4 text-start cursor-pointer"
                        onClick={() => handleCategoryClick("service", service)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body>
                          <div className="d-flex align-items-start mb-3">
                            <div className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0" style={{ backgroundColor: service.color, width: '60px', height: '60px' }}>
                              <Icon size="1.8rem" />
                            </div>
                            <div>
                              <Card.Title className="fw-bold">{service.title}</Card.Title>
                              <Card.Text className="text-secondary small">{service.text}</Card.Text>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span style={{ color: yellow, fontWeight: '600' }}>{service.projects}</span>
                            <FiArrowRight size={20} className="text-secondary" />
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Materials Section */}
      <section className="py-5 text-center bg-white text-dark">
        <Container>
          <h2 className="fw-bold display-5 mb-3" style={{ color: yellow }}>Construction Materials</h2>
          <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.3 }} variants={sectionVariants}>
            <Row>
              {materialsData.map((material, index) => {
                const Icon = material.icon;
                return (
                  <Col lg={3} md={6} key={index} className="mb-4">
                    <motion.div variants={cardVariants}>
                      <Card 
                        className="bg-light text-dark border-light h-100 p-3 rounded-4 text-start"
                        onClick={() => handleCategoryClick("materials", material)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body>
                          <div className="d-flex align-items-start mb-3">
                            <div className="d-flex align-items-center justify-content-center rounded-3 me-3 flex-shrink-0" style={{ backgroundColor: material.color, width: '60px', height: '60px' }}>
                              <Icon size="1.8rem" />
                            </div>
                            <div>
                              <Card.Title className="fw-bold">{material.title}</Card.Title>
                              <Card.Text className="text-secondary small">{material.text}</Card.Text>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span style={{ color: yellow, fontWeight: '600' }}>{material.items}</span>
                            <FiArrowRight size={20} className="text-secondary" />
                          </div>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                );
              })}
            </Row>
          </motion.div>
        </Container>
      </section>

      <Footer />
    </>
  );
};

export default Homepage;
