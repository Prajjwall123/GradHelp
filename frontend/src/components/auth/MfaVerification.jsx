import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Spin } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authApi from '../../services/authApi';

const { Title, Text } = Typography;

const MfaVerification = ({ tempToken, user, onBack, onComplete }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  // Countdown timer for the temporary token
  useEffect(() => {
    if (timeLeft <= 0) {
      setError('Verification code has expired. Please try logging in again.');
      return;
    }

    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResendCode = async () => {
    try {
      setResending(true);
      setError('');
      
      // Call the login API again to get a new temp token
      const response = await authApi.login({
        email: user.email,
        password: '' // Password is not needed as we already have a valid session
      });

      if (response.data.requiresMFA) {
        setTimeLeft(300); // Reset the timer
        form.resetFields();
      }
    } catch (error) {
      console.error('Failed to resend code:', error);
      setError('Failed to resend verification code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Submitting MFA verification with code:', values.code);
      console.log('Using tempToken (first 10 chars):', tempToken ? `${tempToken.substring(0, 10)}...` : 'undefined');
      
      const response = await authApi.verifyMfaLogin({
        token: values.code.toString().trim(), // Ensure code is a string and trim whitespace
        tempToken: tempToken?.trim() // Ensure tempToken is a string and trim whitespace
      });

      console.log('MFA verification response:', response);

      if (response.data?.success) {
        // Call the onComplete handler with the response data
        if (onComplete) {
          onComplete(response.data);
        }
      } else {
        // Handle different error cases
        const errorMessage = response.data?.message || 'Failed to verify MFA code. Please try again.';
        console.error('MFA verification failed:', errorMessage, response.data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to verify MFA code. Please try again.';
      setError(errorMessage);
      form.setFields([{ name: 'code', errors: [errorMessage] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={onBack}
        className="mb-4 p-0"
      >
        Back to login
      </Button>
      
      <div className="auth-form">
        <div className="text-center mb-6">
          <Title level={3} className="mb-2">Two-Factor Authentication</Title>
          <Text type="secondary">
            Enter the 6-digit verification code from your authenticator app
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
            action={
              timeLeft <= 0 && (
                <Button type="link" onClick={onBack}>
                  Back to Login
                </Button>
              )
            }
          />
        )}

        {timeLeft > 0 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="w-full"
          >
            <Form.Item
              name="code"
              rules={[
                { required: true, message: 'Please enter the verification code' },
                { len: 6, message: 'Verification code must be 6 digits' },
                {
                  pattern: /^\d+$/,
                  message: 'Please enter numbers only',
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="123456"
                maxLength={6}
                size="large"
                autoComplete="off"
                autoFocus
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Text type="secondary">
                Code expires in: <span className="font-medium">{formatTime(timeLeft)}</span>
              </Text>
              <Button 
                type="link" 
                onClick={handleResendCode}
                loading={resending}
                disabled={timeLeft > 240} // Only allow resend after 1 minute
                className="p-0 h-auto"
              >
                Resend code{timeLeft > 240 ? ` (${Math.ceil((timeLeft - 240) / 60)}m)` : ''}
              </Button>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="mt-2"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </Form.Item>

            <div className="mt-4 text-center">
              <Button type="link" onClick={onBack}>
                Back to Login
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
};

export default MfaVerification;
