import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // 1: enter email, 2: enter otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ variant: "", message: "", show: false });

  const showAlert = (message, variant = "danger") => {
    setAlert({ message, variant, show: true });
    setTimeout(() => setAlert({ message: "", variant: "", show: false }), 4000);
  };

  // Send OTP API call
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      showAlert("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://backend-d6mx.vercel.app/sendotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(2);
        showAlert(data.message || "OTP sent to your email.", "success");
      } else {
        showAlert(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      showAlert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showAlert("Please enter OTP.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://backend-d6mx.vercel.app/verifyotp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, otp }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep(3);
        showAlert(data.message || "OTP verified successfully.", "success");
      } else {
        showAlert(data.message || "Invalid OTP.");
      }
    } catch (error) {
      showAlert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password API call
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showAlert("Please enter a new password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("https://backend-d6mx.vercel.app/forgetpassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        showAlert(data.message || "Password reset successful!", "success");
        setStep(1);
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        showAlert(data.message || "Failed to reset password.");
      }
    } catch (error) {
      showAlert("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={8} md={6} lg={5}>
          <h3 className="mb-4 text-center">Forget Password</h3>
          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}

          {/* Step 1: Email */}
          {step === 1 && (
            <Form onSubmit={handleSendOtp}>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                variant="warning"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Send OTP"}
              </Button>
            </Form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <Form.Group controlId="formOtp" className="mb-3">
              <Form.Label>OTP</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <Button
                  variant="warning"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </InputGroup>
            </Form.Group>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <Form onSubmit={handleResetPassword}>
              <Form.Group controlId="formNewPassword" className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>
              <Button
                variant="warning"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ForgetPassword;
