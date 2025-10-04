import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Navbar, Nav, Button, Badge, Dropdown, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';

function NavaPro() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedId = localStorage.getItem("userid");
    if (storedId) {
      setUserId(storedId);
      axios.get(`https://backend-d6mx.vercel.app/cart/${storedId}/count`)
        .then(res => setCount(res.data.count || 0))
        .catch(err => console.error('Failed to fetch cart count:', err));
    }
  }, []);

  const yellowButtonStyle = {
    background: 'linear-gradient(90deg, #FFD700, #FFC107)',
    border: 'none',
    borderRadius: '50px',
    padding: '8px 20px',
    fontWeight: '600',
    color: '#000',
  };

  const mobileNavItems = [
    { path: '/', icon: 'bi-house-heart-fill', label: 'Home' },
    { path: '/Category', icon: 'bi-grid-fill', label: 'Categories' },
    { path: '/cart', icon: 'bi-cart-fill', label: 'Cart', badge: count > 0 },
    { path: userId ? '/profile' : '/login', icon: 'bi-person-circle', label: userId ? 'Account' : 'Login' }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`product?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  return (
    <>
      <style>
        {`
          .navbar-desktop {
            position: sticky;
            top: 0;
            z-index: 1100;
            min-height: 65px;
          }

          .mobile-nav {
            position: fixed;
            bottom: 0.8rem;
            left: 50%;
            transform: translateX(-50%);
            width: 94%;
            max-width: 450px;
            height: 60px;
            background-color: #000;
            display: flex;
            justify-content: space-around;
            align-items: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            z-index: 1100;
            border-radius: 40px;
          }

          .mobile-nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: #fff;
            font-size: 0.7rem;
            font-weight: 500;
            width: 60px;
            height: 55px;
            border-radius: 10px;
            transition: all 0.3s ease;
          }

          .mobile-nav-link .nav-icon {
            font-size: 1.3rem;
            margin-bottom: 2px;
          }

          .mobile-nav-link.active {
            color: #000;
            background: linear-gradient(145deg, #FFC107, #FFD54F);
            transform: translateY(-4px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }

          .mobile-topbar {
            position: sticky;
            top: 0;
            background-color: #000;
            color: #fff;
            padding: 8px 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1100;
          }

          .mobile-topbar h5 {
            font-size: 1rem;
            font-weight: 600;
            margin: 0;
            color: #FFD700;
          }

          .mobile-topbar input {
            flex-grow: 1;
            border-radius: 25px;
            border: none;
            outline: none;
            padding: 7px 15px;
            margin-right: 10px;
          }

          @media (max-width: 992px) {
            .navbar-desktop { display: none !important; }
          }
        `}
      </style>

      {/* Desktop Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="navbar-desktop">
        <Container>
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <img
              src={`${process.env.PUBLIC_URL}/Changed_logo.png`}
              alt="Apna Mestri Logo"
              style={{ height: '65px', width: 'auto', objectFit: 'contain' }}
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto align-items-center">
              <Nav.Link href="/" className="text-light">Home</Nav.Link>
              <Nav.Link href="/Category" className="text-light">Categories</Nav.Link>
              <Nav.Link href="/about" className="text-light">About</Nav.Link>

              {/* Animated Search Bar */}
              
            </Nav>

            <Nav className="align-items-center">

              <div className="ms-3 d-flex align-items-center position-relative">
                <motion.div
                  initial={{ width: 40 }}
                  animate={{ width: showSearch ? 220 : 40 }}
                  transition={{ duration: 0.3 }}
                  className="d-flex align-items-center  rounded-pill px-2 overflow-hidden"
                  style={{ cursor: 'pointer'}}
                  onClick={() => setShowSearch(true)}
                >
                  <i className="bi bi-search text-white"></i>
                  {showSearch && (
                    <motion.form
                      onSubmit={handleSearchSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ flexGrow: 1 }}
                    >
                      <input
                        type="text"
                        className="border-0 bg-transparent ms-2"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ outline: 'none', width: '100%',color:"white", backgroundColor:"white"}}
                      />
                    </motion.form>
                  )}
                </motion.div>
              </div>
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
                    <Dropdown.Item
                      onClick={() => {
                        localStorage.removeItem("userid");
                        window.location.href = '/login';
                      }}
                    >
                      Logout
                    </Dropdown.Item>
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

      {/* Mobile Top Bar */}
      <motion.div
        className="mobile-topbar d-lg-none"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h5>Apna Mestri</h5>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexGrow: 1, marginLeft: '10px' }}>
          <motion.input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            initial={{ width: 120 }}
            animate={{ width: 170 }}
            transition={{ duration: 0.4 }}
          />
          <button type="submit" className="btn btn-warning ms-2 rounded-circle p-2">
            <i className="bi bi-search"></i>
          </button>
        </form>
        <Link to={userId ? "/profile" : "/login"} className="ms-2 text-light">
          <i className="bi bi-person-circle fs-4"></i>
        </Link>
      </motion.div>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav d-lg-none">
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
