import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../../config";
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

  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
  }, [emailValue]);

  const onSubmit = async (data) => {
    if (!otpVerified) {
      showToast('Please verify your email with OTP first.', 'danger');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/customer/signup`,
        data,
        { withCredentials: true }
      );

      showToast('Account created successfully!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed', 'danger');
    }
  };

  const sendOtp = async () => {
    if (!emailValue) {
      showToast('Enter email first', 'warning');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/sendotp`, {
        Email: emailValue,
      });
      setOtpSent(true);
      showToast('OTP sent to email', 'success');
    } catch {
      showToast('Failed to send OTP', 'danger');
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      showToast('Enter OTP', 'warning');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/verifyotp`, {
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

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      await axios.post(`${API_BASE_URL}/customer/signup`, {
        Full_Name: decoded.name,
        Emailaddress: decoded.email,
        Location: 'Google',
        authProvider: 'google',
      });

      showToast('Signed up with Google!', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Google signup failed';
      showToast(errorMsg, 'danger');
    }
  };

  const styles = `
    .signup-page { background-color: #1A202C; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .form-container { max-width: 450px; color: #E2E8F0; }
    .brand-title { background: -webkit-linear-gradient(left, #FFD700, #FFC107); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2.5rem; font-weight: bold; }
    .form-control-dark, .form-select-dark { background-color: #2D3748; border: 1px solid #4A5568; color: #fff; }
    .create-account-btn { background: linear-gradient(to right, #FFD700, #FFC107); border: none; font-weight: bold; }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="signup-page p-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast show={toast.show} onClose={() => setToast({ ...toast, show: false })} delay={3000} autohide>
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        <motion.div className="form-container">
          <Form onSubmit={handleSubmit(onSubmit)}>

            <Form.Control
              id="Full_Name"
              name="Full_Name"
              placeholder="Full Name"
              {...register('Full_Name')}
              className="mb-3 form-control-dark"
            />
            <p className="text-danger">{errors.Full_Name?.message}</p>

            <InputGroup className="mb-3">
              <Form.Control
                id="Emailaddress"
                name="Emailaddress"
                placeholder="Email"
                {...register('Emailaddress')}
                className="form-control-dark"
              />
              {!otpSent && (
                <Button type="button" onClick={sendOtp}>
                  Send OTP
                </Button>
              )}
            </InputGroup>
            <p className="text-danger">{errors.Emailaddress?.message}</p>

            {otpSent && !otpVerified && (
              <InputGroup className="mb-3">
                <Form.Control
                  id="otp"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-control-dark"
                />
                <Button type="button" onClick={verifyOtp}>
                  Verify
                </Button>
              </InputGroup>
            )}

            <Form.Control
              id="Phone_Number"
              name="Phone_Number"
              placeholder="Phone Number"
              {...register('Phone_Number')}
              className="mb-3 form-control-dark"
            />

            <Form.Select
              id="Location"
              name="Location"
              {...register('Location')}
              className="mb-3 form-select-dark"
            >
              <option value="">Choose Location</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
            </Form.Select>

            <Form.Control
              id="Password"
              name="Password"
              type="password"
              placeholder="Password"
              {...register('Password')}
              className="mb-3 form-control-dark"
            />

            <Form.Control
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              {...register('confirmPassword')}
              className="mb-4 form-control-dark"
            />

            <Button type="submit" className="create-account-btn" disabled={!otpVerified}>
              Create Account
            </Button>

            <div className="google-btn-container mt-3">
              <GoogleLogin onSuccess={handleGoogleSignup} />
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
