import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Navbar, Nav, Button, Badge, Dropdown } from 'react-bootstrap';

function NavaPro() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const storedId = localStorage.getItem("userid");
    if (storedId) {
      setUserId(storedId);
      axios.get(`https://backend-d6mx.vercel.app/cart/${storedId}/count`)
        .then(res => {
          setCount(res.data.count || 0);
        })
        .catch(err => {
          console.error('Failed to fetch cart count:', err);
        });
    }
  }, []);

  const yellowButtonStyle = {
    background: 'linear-gradient(90deg, #FFD700, #FFC107)',
    border: 'none',
    borderRadius: '50px',
    padding: '10px 25px',
    fontWeight: '600',
    color: '#000',
  };

  const mobileNavItems = [
    { path: '/', icon: 'bi-house-heart-fill', label: 'Home' },
    { path: '/Category', icon: 'bi-grid-fill', label: 'Categories' },
    { path: '/cart', icon: 'bi-cart-fill', label: 'Cart', badge: count > 0 },
    { path: userId ? '/profile' : '/login', icon: 'bi-person-circle', label: userId ? 'Account' : 'Login' }
  ];

  return (
    <>
      <style>
        {`
          .mobile-nav {
            position: fixed;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            width: 95%;
            max-width: 450px;
            height: 70px;
            background-color: #000;
            display: flex;
            justify-content: space-around;
            align-items: center;
            padding: 0 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            border-radius: 50px;
          }
          .mobile-nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 500;
            position: relative;
            width: 65px;
            height: 60px;
            border-radius: 12px;
            transition: all 0.3s ease;
          }
          .mobile-nav-link .nav-icon {
            font-size: 1.5rem;
            margin-bottom: 4px;
          }
          .mobile-nav-link.active {
            color: #000;
            background: linear-gradient(145deg, #FFC107, #FFD54F);
            transform: translateY(-5px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .mobile-nav-link .nav-label {
            transition: color 0.3s ease;
          }
          .mobile-nav-link.active .nav-label {
            font-weight: 600;
          }
          .cart-badge-mobile {
            position: absolute;
            top: 5px;
            right: 10px;
            font-size: 10px;
            width: 18px;
            height: 18px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          @media (max-width: 992px) {
            .navbar-desktop {
              display: none !important;
            }
          }
          .sticky-navbar {
            position: sticky;
            top: 0;
            z-index: 1100;
          }
        `}
      </style>

      {/* Desktop Navbar */}
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="py-3 navbar-desktop sticky-navbar"
        style={{ minHeight: '70px' }}
      >
        <Container>
          <Navbar.Brand
            href="/"
            className="d-flex align-items-center"
            style={{ height: '70px' }}
          >
            <img
              src={`${process.env.PUBLIC_URL}/Changed_logo.png`}
              alt="Apna Mestri Logo"
              style={{
                height: '250%',
                maxHeight: '180px',
                width: 'auto',
                marginRight: '0px',
                objectFit: 'contain',
                paddingTop:"21px"
              }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link href="/" className="text-light">Home</Nav.Link>
              <Nav.Link href="/Category" className="text-light">Categories</Nav.Link>
              <Nav.Link href="/about" className="text-light">About</Nav.Link>
            </Nav>
            <Nav className="align-items-center">
              <Nav.Link as={Link} to="/cart" className="text-light position-relative me-2">
                <i className="bi bi-cart" style={{ fontSize: '1.2rem' }}></i>
                {count > 0 && (
                  <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                    {count}
                  </Badge>
                )}
              </Nav.Link>
              {userId ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="dark" className="text-light border-0" id="dropdown-user">
                    <i className="bi bi-person-circle fs-5"></i>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                    <Dropdown.Item href="/myorder">Orders</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={() => {
                      localStorage.removeItem("userid");
                      window.location.href = '/login';
                    }}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login" className="text-light">Sign In</Nav.Link>
                  <Button as={Link} to="/signup" style={yellowButtonStyle} className="ms-2">
                    Get Started
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Mobile Navbar */}
      <nav className="mobile-nav d-lg-none sticky-navbar">
        {mobileNavItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={`nav-icon ${item.icon}`}></i>
            <span className="nav-label">{item.label}</span>
            {item.path === '/cart' && count > 0 && (
              <Badge pill bg="light" text="dark" className="cart-badge-mobile">
                {count}
              </Badge>
            )}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default NavaPro;
