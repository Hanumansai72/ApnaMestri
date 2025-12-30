import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../config";
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Container, Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function CustomerLogin() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'danger' });

  const showToast = (message, variant = 'danger') => {
    setToast({ show: true, message, variant });
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email to send OTP', 'warning');
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/sendotp`, { Email: email });
      setOtpSent(true);
      showToast("OTP sent to your email", "success");
    } catch (err) {
      console.log(err);
      showToast("Failed to send OTP", "danger");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast("Please enter OTP", "warning");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE_URL}/verifyotp`, { Email: email, otp: otp });
      if (res.data.message === "OTP verified") {
        const loginRes = await axios.post(`${API_BASE_URL}/login-with-otp`, { email });
        if (loginRes.data.message === "Success") {
          localStorage.setItem('userid', loginRes.data.user._id);
          localStorage.setItem('user_name', loginRes.data.user.Full_Name);
          showToast("Logged in successfully with OTP!", "success");
          setTimeout(() => navigate('/'), 1500);
        } else {
          showToast("Failed to log in after OTP verification", "danger");
        }
      } else {
        showToast("Invalid OTP", "danger");
      }
    } catch (err) {
      console.log(err);
      showToast("OTP verification failed", "danger");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMethod === 'otp' && !otpVerified) {
      showToast("Please verify your OTP before logging in.", "danger");
      return;
    }
    if (!email || !password) {
      showToast("Please provide both email and password.", "warning");
      return;
    }
    try {
      const res = await axios.post(
        `${API_BASE_URL}/fetch/userprofile`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.message === 'Success') {

        showToast('Login successful!', 'success');
        setTimeout(() => navigate('/'), 1500);
      } else {
        showToast(res.data.message || 'Please check your credentials.', 'danger');
      }
    } catch (err) {
      console.error('Login error', err);
      const errorMsg = err.response?.data?.message || 'Server error. Try again later.';
      showToast(errorMsg, 'danger');
    }
  };

  // --- Handle Google Login ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture } = decoded;

      const res = await axios.post(`${API_BASE_URL}/google-login/customer`, {
        email,
        name,
        picture,
      });

      if (res.data.message === "Success") {
        localStorage.setItem("userid", res.data.user._id);
        localStorage.setItem("user_name", res.data.user.Full_Name);
        showToast("Logged in successfully with Google!", "success");
        setTimeout(() => navigate('/'), 1500);
      } else {
        showToast(res.data.message || "Failed Google login", "danger");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Google login failed";
      showToast(errorMsg, "danger");
    }
  };

  const handleGoogleError = () => {
    showToast("Google login failed. Please try again.", "danger");
  };

  // --- Styles ---
  const styles = `
    .login-page { background-color: #1A202C; min-height: 100vh; font-family: sans-serif; }
    .form-panel { color: #E2E8F0; }
    .form-container { max-width: 400px; margin: auto; }
    .brand-title { color: #FFD700; font-weight: bold; font-size: 2rem; }
    .brand-subtitle { color: #A0AEC0; }
    .login-method-toggle { border: 1px solid #4A5568; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 10px; }
    .login-method-btn { flex: 1; border: none; background: #2D3748; color: #A0AEC0; font-weight: 600; padding: 10px; border-radius: 6px; transition: all 0.3s; text-align: center; cursor: pointer; }
    .login-method-btn.active { background: linear-gradient(to right, #FFD700, #FFC300); color: #000; }
    .form-control-dark { background-color: #2D3748; border: 1px solid #4A5568; border-radius: 8px; color: #fff; padding: 12px; }
    .form-control-dark::placeholder { color: #718096; }
    .form-control-dark:focus { background-color: #2D3748; border-color: #FFD700; box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3); color: #fff; }
    .login-btn { background: linear-gradient(to right, #FFD700, #FFC300); border: none; font-weight: bold; padding: 12px; border-radius: 8px; color: #000; }
    .login-btn:hover { background: linear-gradient(to right, #FFC300, #FFD700); }
    .image-panel { background: url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop') no-repeat center center; background-size: cover; position: relative; }
    .image-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(26, 32, 44, 0.7); }
    .info-content { position: relative; z-index: 2; color: #fff; }
    .stat-badge { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(5px); padding: 10px 20px; border-radius: 8px; }
    a { color: #FFD700; }
    a:hover { color: #FFC300; }
  `;

  const formSectionVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
          <Toast bg={toast.variant} show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={3000} autohide>
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <Container fluid>
          <Row className="g-0 min-vh-100">
            <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-4 p-md-5 form-panel">
              <motion.div className="w-100 form-container" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
                <h1 className="brand-title">Apna Mestri</h1>
                <p className="brand-subtitle mb-4">Welcome back to your platform</p>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control type="email" placeholder="Email Address" className="form-control-dark" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </Form.Group>

                  <AnimatePresence mode="wait">
                    {loginMethod === 'password' && (
                      <motion.div key="password" variants={formSectionVariant} initial="hidden" animate="visible" exit="exit">
                        <Form.Group className="mb-3">
                          <Form.Control type="password" placeholder="Password" className="form-control-dark" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>
                      </motion.div>
                    )}

                    {loginMethod === 'otp' && (
                      <motion.div key="otp" variants={formSectionVariant} initial="hidden" animate="visible" exit="exit">
                        {!otpSent && <Button variant="outline-secondary" className="w-100 mb-3" onClick={sendOtp}>Send OTP</Button>}
                        {otpSent && !otpVerified && (
                          <InputGroup className="mb-3">
                            <Form.Control type="text" placeholder="Enter OTP" className="form-control-dark" value={otp} onChange={(e) => setOtp(e.target.value)} />
                            <Button variant="secondary" onClick={verifyOtp}>Verify OTP</Button>
                          </InputGroup>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="d-flex justify-content-end mb-4">
                    <a href="/forgetpassword" style={{ fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</a>
                  </div>

                  <Button type="submit" className="login-btn w-100">Login</Button>

                  {/* OR Divider */}
                  <div className="or-divider my-3 d-flex align-items-center">
                    <hr className="flex-grow-1" />
                    <span className="mx-2 text-muted">or</span>
                    <hr className="flex-grow-1" />
                  </div>

                  {/* Google Login */}
                  <div className="d-flex justify-content-center mb-4">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
                  </div>

                  <div className="login-method-toggle mb-4">
                    <div className={`login-method-btn ${loginMethod === 'password' ? 'active' : ''}`} onClick={() => setLoginMethod('password')}>
                      Login with Password
                    </div>
                    <div className={`login-method-btn ${loginMethod === 'otp' ? 'active' : ''}`} onClick={() => setLoginMethod('otp')}>
                      Login with OTP
                    </div>
                  </div>

                  <p className="text-center mt-4" style={{ color: '#718096' }}>
                    Don't have an account? <a href="/signup" style={{ fontWeight: 'bold', textDecoration: 'none' }}>Sign up</a>
                  </p>
                </Form>
              </motion.div>
            </Col>

            <Col md={7} className="d-none d-md-flex align-items-center justify-content-center p-5 image-panel">
              <div className="image-overlay"></div>
              <motion.div className="info-content text-center" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
                <h2 className="display-4 fw-bold">Build Your Future</h2>
                <p className="lead mb-5">Connect with the best civil engineering professionals and take your projects to the next level.</p>
                <div className="d-flex justify-content-center gap-4">
                  <div className="stat-badge fw-bold"><i className="bi bi-people-fill me-2"></i>10,000+ Professionals</div>
                  <div className="stat-badge fw-bold"><i className="bi bi-kanban-fill me-2"></i>5,000+ Projects</div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}

export default CustomerLogin;
