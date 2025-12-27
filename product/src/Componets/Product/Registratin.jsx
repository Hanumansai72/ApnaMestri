import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, ToastContainer, Form, Button, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { signupSchema } from './signupschema';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

function Registration() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
  });

  const emailValue = watch('Emailaddress');

  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  // 🔒 Reset OTP when email changes
  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
  }, [emailValue]);

  // ✅ SUBMIT
  const onSubmit = async (data) => {
    if (!otpVerified) {
      showToast('Please verify your email with OTP first.', 'danger');
      return;
    }

    try {
      await axios.post(
        'https://backend-d6mx.vercel.app/profiledata',
        data,
        { withCredentials: true }
      );

      showToast('Account created successfully!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'danger');
    }
  };

  // ✅ SEND OTP
  const sendOtp = async () => {
    if (!emailValue) {
      showToast('Enter email first', 'warning');
      return;
    }

    try {
      await axios.post('https://backend-d6mx.vercel.app/sendotp', {
        Email: emailValue,
      });
      setOtpSent(true);
      showToast('OTP sent to email', 'success');
    } catch {
      showToast('Failed to send OTP', 'danger');
    }
  };

  // ✅ VERIFY OTP
  const verifyOtp = async () => {
    if (!otp) {
      showToast('Enter OTP', 'warning');
      return;
    }

    try {
      await axios.post('https://backend-d6mx.vercel.app/verifyotp', {
        Email: emailValue,
        otp,
      });
      setOtpVerified(true);
      showToast('OTP verified', 'success');
    } catch {
      setOtpVerified(false);
      showToast('Invalid OTP', 'danger');
    }
  };

  // ✅ GOOGLE SIGNUP
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      await axios.post('https://backend-d6mx.vercel.app/customer/signup', {
        Full_Name: decoded.name,
        Emailaddress: decoded.email,
        Location: 'Google',
        authProvider: 'google',
      });

      showToast('Signed up with Google!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      showToast('Google signup failed', 'danger');
    }
  };

  // ---------------- STYLES ----------------
  const styles = `
    .signup-page {
      background-color: #1A202C;
      min-height: 100vh;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .form-container {
      max-width: 450px;
      margin: auto;
      color: #E2E8F0;
    }
    .brand-title {
      background: -webkit-linear-gradient(left, #FFD700, #FFC107);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: bold;
      font-size: 2.5rem;
    }
    .brand-subtitle {
      color: #A0AEC0;
    }
    .form-control-dark,
    .form-select-dark {
      background-color: #2D3748;
      border: 1px solid #4A5568;
      border-radius: 8px;
      color: #fff;
      padding: 12px;
    }
    .form-control-dark::placeholder {
      color: #718096;
    }
    .form-control-dark:focus,
    .form-select-dark:focus {
      background-color: #2D3748;
      border-color: #FFD700;
      box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.4);
      color: #fff;
    }
    .create-account-btn {
      background: linear-gradient(to right, #FFD700, #FFC107);
      border: none;
      font-weight: bold;
      padding: 12px;
      border-radius: 8px;
      width: 100%;
      color: #000;
    }
    .google-btn-container {
      display: flex;
      justify-content: center;
      margin-top: 15px;
    }
    .toast-success {
      background-color: #FFC107 !important;
      color: black;
    }
    .toast-danger {
      background-color: #FF4C4C !important;
      color: white;
    }
    .toast-warning {
      background-color: #FFD700 !important;
      color: black;
    }
  `;

  const inputVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      <style>{styles}</style>

      <div className="signup-page p-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast
            show={toast.show}
            onClose={() => setToast({ ...toast, show: false })}
            delay={3000}
            autohide
            className={`toast-${toast.variant}`}
          >
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <motion.div className="form-container">
          <div className="text-center mb-5">
            <h1 className="brand-title">Civil Mestri</h1>
            <h4 className="text-white">Create Account</h4>
            <p className="brand-subtitle">Join the future of civil engineering</p>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Full Name"
                {...register('Full_Name')}
                className="form-control-dark"
              />
            </InputGroup>
            <p className="text-danger">{errors.Full_Name?.message}</p>

            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Email"
                {...register('Emailaddress')}
                className="form-control-dark"
              />
              {!otpSent && (
                <Button type="button" variant="outline-secondary" onClick={sendOtp}>
                  Send OTP
                </Button>
              )}
            </InputGroup>
            <p className="text-danger">{errors.Emailaddress?.message}</p>

            <AnimatePresence>
              {otpSent && !otpVerified && (
                <motion.div variants={inputVariant} initial="hidden" animate="visible">
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="form-control-dark"
                    />
                    <Button type="button" onClick={verifyOtp}>
                      Verify
                    </Button>
                  </InputGroup>
                </motion.div>
              )}
            </AnimatePresence>

            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Phone Number"
                {...register('Phone_Number')}
                className="form-control-dark"
              />
            </InputGroup>
            <p className="text-danger">{errors.Phone_Number?.message}</p>

            <Form.Select {...register('Location')} className="mb-3 form-select-dark">
              <option value="">Choose Location</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
            </Form.Select>
            <p className="text-danger">{errors.Location?.message}</p>

            <Form.Control
              type="password"
              placeholder="Password"
              {...register('Password')}
              className="mb-3 form-control-dark"
            />
            <p className="text-danger">{errors.Password?.message}</p>

            <Form.Control
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword')}
              className="mb-4 form-control-dark"
            />
            <p className="text-danger">{errors.confirmPassword?.message}</p>

            <Button type="submit" className="create-account-btn" disabled={!otpVerified}>
              Create Account
            </Button>

            <div className="google-btn-container">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => showToast('Google Login Failed', 'danger')}
              />
            </div>

            <p className="text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#FFD700', fontWeight: 'bold' }}>
                Login
              </Link>
            </p>
          </Form>
        </motion.div>
      </div>
    </>
  );
}

export default Registration;
