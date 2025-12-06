import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Navbar, Nav, Button, Badge, Dropdown } from 'react-bootstrap';
import { motion } from 'framer-motion';

function NavaPro() {
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const inputRef = useRef(null);               // ✅ ref for search input
  const [searchTerm, setSearchTerm] = useState(''); // ✅ state for search

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
  ];

  const handleLogout = () => {
    localStorage.removeItem("userid");
    navigate("/login");
  };

  
  // ✅ handle Enter key on search input
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const q = encodeURIComponent(searchTerm.trim());
      // SPA navigation – final URL will be like:
      // https://www.apnamestri.com/product?search=ITEM
      navigate(`/product?search=${q}`);
    }
  };

  return (
    <>
      <style>
        {`
          .navbar-desktop { position: sticky; top: 0; z-index: 1100; min-height: 65px; }
          .mobile-nav {
            position: fixed; bottom: 0.8rem; left: 50%;
            transform: translateX(-50%);
            width: 94%; max-width: 450px; height: 60px;
            background-color: #000; display: flex; justify-content: space-around;
            align-items: center; box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            border-radius: 40px; z-index: 1100;
          }
          .mobile-nav-link {
            display: flex; flex-direction: column; align-items: center;
            text-decoration: none; color: #fff; font-size: 0.7rem;
            font-weight: 500; width: 60px; height: 55px; border-radius: 10px;
            transition: all 0.3s ease;
          }
          .mobile-nav-link.active {
            color: #000; background: linear-gradient(145deg, #FFC107, #FFD54F);
            transform: translateY(-4px); box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }
          .mobile-topbar {
            position: sticky; top: 0; background-color: #000; color: #fff;
            padding: 8px 15px; display: flex; align-items: center;
            justify-content: space-between; z-index: 1100;
          }
          .mobile-topbar h5 { font-size: 1rem; font-weight: 600; margin: 0; color: #FFD700; }
          .mobile-profile-menu {
            position: fixed;
            bottom: 70px;
            right: 1rem;
            background: #111;
            color: white;
            border-radius: 16px;
            width: 180px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            overflow: hidden;
            z-index: 1200;
          }
          .mobile-profile-menu a, .mobile-profile-menu span {
            display: block;
            padding: 10px 14px;
            color: #fff;
            font-size: 0.9rem;
            text-decoration: none;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .mobile-profile-menu a:hover, .mobile-profile-menu span:hover {
            background-color: #222;
          }
          .mobile-profile-menu span.text-danger { color: #ff5252; }
          @media (max-width: 992px) { .navbar-desktop { display: none !important; } }

          /* ✅ small styling touch for navbar search */
          .navbar-search-input {
            padding: 6px 10px;
            border-radius: 20px;
            border: 1px solid #666;
            background-color: #222;
            color: #fff;
            margin-right: 10px;
            width: 220px;
          }
          .navbar-search-input::placeholder {
            color: #aaa;
          }
        `}
      </style>

      {/* DESKTOP NAVBAR */}
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
            </Nav>

            {/* ✅ SEARCH INPUT */}
            <input
              type="text"
              ref={inputRef}
              placeholder="Search..."
              className="navbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />

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
                    <Dropdown.Item href="/myorder">My Orders</Dropdown.Item>
                    <Dropdown.Item href="/wishlist">Wishlist</Dropdown.Item>
                    <Dropdown.Item href="/support">Support</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">Logout</Dropdown.Item>
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

      {/* MOBILE NAVBAR */}
      <div className="mobile-topbar d-lg-none">
        <h5>Apna Mestri</h5>
        <Link to={userId ? "#" : "/login"} onClick={() => userId && setShowMobileMenu(!showMobileMenu)} className="text-light">
          <i className="bi bi-person-circle fs-4"></i>
        </Link>
      </div>

      {/* MOBILE PROFILE MENU */}
      {showMobileMenu && (
        <motion.div
          className="mobile-profile-menu"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Link to="/profile" onClick={() => setShowMobileMenu(false)}>👤 My Profile</Link>
          <Link to="/myorder" onClick={() => setShowMobileMenu(false)}>📦 My Orders</Link>
          <Link to="/wishlist" onClick={() => setShowMobileMenu(false)}>❤️ Wishlist</Link>
          <Link to="/support" onClick={() => setShowMobileMenu(false)}>🛠️ Support</Link>
          <span className="text-danger" onClick={handleLogout}>🚪 Sign Out</span>
        </motion.div>
      )}

      {/* MOBILE NAV BOTTOM */}
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
