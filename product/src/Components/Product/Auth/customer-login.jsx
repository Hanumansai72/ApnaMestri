import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../../config";
import { useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Container, Row, Col, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from './AuthContext';
import './auth-styles.css';

function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState('password');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', variant: 'danger' });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message, variant = 'danger') => setToast({ show: true, message, variant });

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!email) { showToast('Please enter your email to send OTP', 'warning'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sendotp`, { Email: email });
      setOtpSent(true);
      showToast("OTP sent to your email", "success");
    } catch { showToast("Failed to send OTP", "danger"); }
    finally { setIsLoading(false); }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) { showToast("Please enter OTP", "warning"); return; }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/verifyotp`, { Email: email, otp });
      if (res.data.message === "OTP verified") {
        const loginRes = await axios.post(`${API_BASE_URL}/login-with-otp`, { email });
        if (loginRes.data.message === "Success") {
          login(loginRes.data.user);
          showToast("Logged in successfully!", "success");
          setTimeout(() => navigate('/'), 1500);
        } else { showToast("Login failed after OTP verification", "danger"); }
      } else { showToast("Invalid OTP", "danger"); }
    } catch { showToast("OTP verification failed", "danger"); }
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loginMethod === 'otp' && !otpVerified) { showToast("Please verify OTP first", "danger"); return; }
    if (!email || !password) { showToast("Please provide email and password", "warning"); return; }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/fetch/userprofile`, { email, password }, { withCredentials: true });
      if (res.data.message === 'Success') {
        login(res.data.user);
        showToast('Login successful!', 'success');
        setTimeout(() => navigate('/'), 1500);
      } else { showToast(res.data.message || 'Invalid credentials', 'danger'); }
    } catch (err) { showToast(err.response?.data?.message || 'Server error', 'danger'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await axios.post(`${API_BASE_URL}/google-login`, { email: decoded.email, name: decoded.name, picture: decoded.picture });
      if (res.data.message === "Success") {
        login(res.data.user);
        showToast("Logged in with Google!", "success");
        setTimeout(() => navigate('/'), 1500);
      } else { showToast(res.data.message || "Google login failed", "danger"); }
    } catch (err) { showToast(err.response?.data?.message || "Google login failed", "danger"); }
  };

  const formVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="auth-page">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
        <Toast bg={toast.variant} show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={3000} autohide>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Container fluid>
        <Row className="g-0 min-vh-100">
          <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-4 auth-form-panel">
            <motion.div className="w-100 auth-form-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="auth-brand-container">
                <motion.div className="auth-brand-logo" initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <svg viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>
                </motion.div>
                <motion.h1 className="auth-brand-title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Apna Mestri</motion.h1>
                <motion.p className="auth-brand-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>Welcome back! Login to continue</motion.p>
              </div>

              <motion.div className="auth-method-toggle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <div className={`auth-method-btn ${loginMethod === 'password' ? 'active' : ''}`} onClick={() => setLoginMethod('password')}>🔐 Password</div>
                <div className={`auth-method-btn ${loginMethod === 'otp' ? 'active' : ''}`} onClick={() => setLoginMethod('otp')}>📱 OTP</div>
              </motion.div>

              <Form onSubmit={handleSubmit}>
                <motion.div className="auth-input-group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <input type="email" placeholder="Email Address" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg></span>
                </motion.div>

                <AnimatePresence mode="wait">
                  {loginMethod === 'password' && (
                    <motion.div key="password" variants={formVariant} initial="hidden" animate="visible" exit="exit" className="auth-input-group">
                      <input type="password" placeholder="Password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} />
                      <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg></span>
                    </motion.div>
                  )}

                  {loginMethod === 'otp' && (
                    <motion.div key="otp" variants={formVariant} initial="hidden" animate="visible" exit="exit">
                      {!otpSent && <button type="button" className="auth-btn" onClick={sendOtp} disabled={isLoading} style={{ marginBottom: '20px' }}>{isLoading ? <span className="auth-spinner"></span> : '📨 Send OTP'}</button>}
                      {otpSent && !otpVerified && (
                        <div className="auth-otp-input-group">
                          <input type="text" placeholder="Enter 6-digit OTP" className="auth-input" value={otp} onChange={(e) => setOtp(e.target.value)} />
                          <button type="button" className="auth-otp-btn" onClick={verifyOtp} disabled={isLoading}>{isLoading ? '...' : 'Verify'}</button>
                        </div>
                      )}
                      {otpVerified && <div className="auth-success-badge"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> OTP Verified!</div>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {loginMethod === 'password' && <motion.a href="/forgetpassword" className="auth-forgot-link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Forgot Password?</motion.a>}

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <button type="submit" className="auth-btn" disabled={isLoading}>{isLoading ? <span className="auth-spinner"></span> : <>Login <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg></>}</button>
                </motion.div>

                <div className="auth-divider"><span className="auth-divider-line"></span><span className="auth-divider-text">or continue with</span><span className="auth-divider-line"></span></div>

                <div className="auth-google-btn"><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => showToast("Google login failed", "danger")} /></div>

                <motion.p className="auth-switch-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Don't have an account? <a href="/signup">Create Account</a></motion.p>
              </Form>
            </motion.div>
          </Col>

          <Col md={7} className="d-none d-md-flex align-items-center justify-content-center auth-image-panel">
            <motion.div className="auth-info-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>Build Your Future</motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>Connect with the best civil engineering professionals and take your projects to new heights.</motion.p>
              <motion.div className="auth-stats-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <div className="auth-stat-badge"><div className="auth-stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg></div>10,000+ Professionals</div>
                <div className="auth-stat-badge"><div className="auth-stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg></div>5,000+ Projects</div>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CustomerLogin;
