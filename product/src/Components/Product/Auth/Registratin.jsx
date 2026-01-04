import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../../config";
import { Link, useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Container, Row, Col, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { signupSchema } from './signupschema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import './auth-styles.css';

function Registration() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: yupResolver(signupSchema), mode: 'onBlur' });
  const emailValue = watch('Emailaddress');

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (message, variant = 'success') => setToast({ show: true, message, variant });

  useEffect(() => { setOtp(''); setOtpSent(false); setOtpVerified(false); }, [emailValue]);

  const onSubmit = async (data) => {
    if (!otpVerified) { showToast('Please verify your email with OTP first.', 'danger'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/customer/signup`, data, { withCredentials: true });
      showToast('Account created successfully!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) { showToast(err.response?.data?.message || 'Signup failed', 'danger'); }
    finally { setIsLoading(false); }
  };

  const sendOtp = async () => {
    if (!emailValue) { showToast('Enter email first', 'warning'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sendotp`, { Email: emailValue });
      setOtpSent(true);
      showToast('OTP sent to email', 'success');
    } catch { showToast('Failed to send OTP', 'danger'); }
    finally { setIsLoading(false); }
  };

  const verifyOtp = async () => {
    if (!otp) { showToast('Enter OTP', 'warning'); return; }
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/verifyotp`, { Email: emailValue, otp });
      setOtpVerified(true);
      showToast('OTP verified', 'success');
    } catch { setOtpVerified(false); showToast('Invalid OTP', 'danger'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      await axios.post(`${API_BASE_URL}/customer/signup`, { Full_Name: decoded.name, Emailaddress: decoded.email, Location: 'Google', authProvider: 'google' });
      showToast('Signed up with Google!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) { showToast(err.response?.data?.message || 'Google signup failed', 'danger'); }
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
          <Col md={7} className="d-none d-md-flex align-items-center justify-content-center auth-image-panel">
            <motion.div className="auth-info-content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>Join Our Community</motion.h2>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Create an account to connect with skilled professionals and bring your projects to life.</motion.p>
              <motion.div className="auth-stats-container" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="auth-stat-badge"><div className="auth-stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg></div>Trusted Platform</div>
                <div className="auth-stat-badge"><div className="auth-stat-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg></div>Secure & Safe</div>
              </motion.div>
            </motion.div>
          </Col>

          <Col xs={12} md={5} className="d-flex align-items-center justify-content-center p-4 auth-form-panel">
            <motion.div className="w-100 auth-form-container" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div className="auth-brand-container">
                <motion.div className="auth-brand-logo" initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <svg viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>
                </motion.div>
                <motion.h1 className="auth-brand-title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>Apna Mestri</motion.h1>
                <motion.p className="auth-brand-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>Create your account</motion.p>
              </div>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <motion.div className="auth-input-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <input placeholder="Full Name" {...register('Full_Name')} className="auth-input" />
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></span>
                </motion.div>
                {errors.Full_Name && <p className="auth-error">{errors.Full_Name.message}</p>}

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                  <div className="auth-otp-input-group">
                    <input placeholder="Email Address" {...register('Emailaddress')} className="auth-input" style={{ paddingLeft: '16px' }} />
                    {!otpSent && <button type="button" className="auth-otp-btn" onClick={sendOtp} disabled={isLoading}>{isLoading ? '...' : 'Send OTP'}</button>}
                  </div>
                </motion.div>
                {errors.Emailaddress && <p className="auth-error">{errors.Emailaddress.message}</p>}

                {otpSent && !otpVerified && (
                  <motion.div className="auth-otp-input-group" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                    <input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="auth-input" style={{ paddingLeft: '16px' }} />
                    <button type="button" className="auth-otp-btn" onClick={verifyOtp} disabled={isLoading}>{isLoading ? '...' : 'Verify'}</button>
                  </motion.div>
                )}

                {otpVerified && <div className="auth-success-badge"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> Email Verified!</div>}

                <motion.div className="auth-input-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                  <input placeholder="Phone Number" {...register('Phone_Number')} className="auth-input" />
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg></span>
                </motion.div>

                <motion.div className="auth-input-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 }}>
                  <select {...register('Location')} className="auth-input" style={{ paddingLeft: '48px' }}>
                    <option value="">Choose Location</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg></span>
                </motion.div>

                <motion.div className="auth-input-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                  <input type="password" placeholder="Password" {...register('Password')} className="auth-input" />
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg></span>
                </motion.div>

                <motion.div className="auth-input-group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.75 }}>
                  <input type="password" placeholder="Confirm Password" {...register('confirmPassword')} className="auth-input" />
                  <span className="auth-input-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg></span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                  <button type="submit" className="auth-btn" disabled={!otpVerified || isLoading}>
                    {isLoading ? <span className="auth-spinner"></span> : <>Create Account <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg></>}
                  </button>
                </motion.div>

                <div className="auth-divider"><span className="auth-divider-line"></span><span className="auth-divider-text">or sign up with</span><span className="auth-divider-line"></span></div>

                <div className="auth-google-btn"><GoogleLogin onSuccess={handleGoogleSignup} onError={() => showToast('Google signup failed', 'danger')} /></div>

                <motion.p className="auth-switch-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Already have an account? <Link to="/login">Login</Link></motion.p>
              </Form>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Registration;
