import React, { useState } from 'react';
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
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: 'onBlur',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', variant: 'success' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');

  const showToast = (message, variant = 'success') => {
    setToast({ show: true, message, variant });
  };

  const onSubmit = async (data) => {
    if (!otpVerified) {
      showToast('Please verify your email with OTP first.', 'danger');
      return;
    }

    if (data.Password !== confirmPassword) {
      showToast('Passwords do not match.', 'danger');
      return;
    }

    try {
      await axios.post('https://backend-d6mx.vercel.app/profiledata', data);
      showToast('Account created successfully! Redirecting to login...', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      showToast('Failed to create account.', 'danger');
    }
  };

  const sendOtp = async () => {
    const email = getValues('Emailaddress');
    if (!email) {
      showToast('Please enter your email first.', 'warning');
      return;
    }
    try {
      await axios.post('https://backend-d6mx.vercel.app/sendotp', { Email: email });
      showToast('OTP sent to your email', 'success');
      setOtpSent(true);
      setOtpVerified(false);
    } catch {
      showToast('Failed to send OTP.', 'danger');
    }
  };

  const verifyOtp = async () => {
    const email = getValues('Emailaddress');
    if (!otp) {
      showToast('Please enter the OTP', 'warning');
      return;
    }
    try {
      await axios.post('https://backend-d6mx.vercel.app/verifyotp', {
        Email: email,
        otp,
      });
      setOtpVerified(true);
      showToast('OTP verified successfully!', 'success');
    } catch {
      setOtpVerified(false);
      showToast('Invalid OTP', 'danger');
    }
  };

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        Full_Name: decoded.name,
        Emailaddress: decoded.email,
        Password: decoded.sub,
        Phone_Number: '',
        Location: 'Google',
      };

      await axios.post('https://backend-d6mx.vercel.app/profiledata', userData);
      showToast('Signed up successfully with Google!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      showToast('Google sign-up failed. Try again.', 'danger');
    }
  };

  const styles = `
    .signup-page { background-color: #1A202C; min-height: 100vh; font-family: sans-serif; display: flex; align-items: center; justify-content: center; }
    .form-container { max-width: 450px; margin: auto; color: #E2E8F0; }
    .brand-title {
      background: -webkit-linear-gradient(left, #FFD700, #FFC107);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: bold;
      font-size: 2.5rem;
    }
    .brand-subtitle { color: #A0AEC0; }
    .form-control-dark, .form-select-dark {
      background-color: #2D3748;
      border: 1px solid #4A5568;
      border-radius: 8px;
      color: #fff;
      padding: 12px 12px 12px 40px;
    }
    .form-control-dark:focus, .form-select-dark:focus {
      border-color: #FFD700;
      box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.4);
    }
    .input-group-text-dark {
      position: absolute;
      z-index: 10;
      color: #A0AEC0;
      background: transparent;
      border: none;
      padding-left: 15px;
      height: 100%;
      display: flex;
      align-items: center;
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
  `;

  const inputVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <>
      <style>{styles}</style>
      <div className="signup-page p-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast
            className={`toast-${toast.variant}`}
            show={toast.show}
            onClose={() => setToast({ ...toast, show: false })}
            delay={3000}
            autohide
          >
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <motion.div className="w-100 form-container" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-5">
            <h1 className="brand-title">Civil Mestri</h1>
            <h4 className="text-white">Create Account</h4>
            <p className="brand-subtitle">Join the future of civil engineering</p>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)}>
            <InputGroup className="mb-3">
              <span className="input-group-text-dark"><i className="bi bi-person"></i></span>
              <Form.Control placeholder="Full Name" {...register('Full_Name')} className="form-control-dark" />
            </InputGroup>
            <p className="text-danger">{errors.Full_Name?.message}</p>

            <InputGroup className="mb-3">
              <span className="input-group-text-dark"><i className="bi bi-envelope"></i></span>
              <Form.Control placeholder="Emailaddress" {...register('Emailaddress')} className="form-control-dark" />
              {!otpSent && <Button variant="outline-secondary" onClick={sendOtp}>Send OTP</Button>}
            </InputGroup>
            <p className="text-danger">{errors.Emailaddress?.message}</p>

            <AnimatePresence>
              {otpSent && !otpVerified && (
                <motion.div variants={inputVariant} initial="hidden" animate="visible" exit="exit">
                  <InputGroup className="mb-3">
                    <span className="input-group-text-dark"><i className="bi bi-shield-check"></i></span>
                    <Form.Control placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="form-control-dark" />
                    <Button variant="secondary" onClick={verifyOtp}>Verify</Button>
                  </InputGroup>
                </motion.div>
              )}
            </AnimatePresence>

            <InputGroup className="mb-3">
              <span className="input-group-text-dark"><i className="bi bi-phone"></i></span>
              <Form.Control placeholder="Phone_Number" {...register('Phone_Number')} className="form-control-dark" />
            </InputGroup>
            <p className="text-danger">{errors.Phone_Number?.message}</p>

            <InputGroup className="mb-3">
              <span className="input-group-text-dark"><i className="bi bi-building"></i></span>
              <Form.Select {...register('Location')} className="form-select-dark">
                <option value="">Choose your Location</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Mumbai">Mumbai</option>
              </Form.Select>
            </InputGroup>

            <InputGroup className="mb-3">
              <span className="input-group-text-dark"><i className="bi bi-lock"></i></span>
              <Form.Control type="password" placeholder="Password" {...register('Password')} className="form-control-dark" />
            </InputGroup>

            <InputGroup className="mb-4">
              <span className="input-group-text-dark"><i className="bi bi-lock-fill"></i></span>
              <Form.Control type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control-dark" />
            </InputGroup>

            <Button type="submit" className="create-account-btn" disabled={!otpVerified}>
              Create Account
            </Button>

            <div className="google-btn-container mt-3">
              <GoogleLogin onSuccess={handleGoogleSignup} onError={() => showToast('Google Login Failed', 'danger')} />
            </div>

            <p className="text-center mt-4">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </Form>
        </motion.div>
      </div>
    </>
  );
}

export default Registration;
