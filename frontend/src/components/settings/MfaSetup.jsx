import React, { useState, useEffect } from 'react';
import { Button, Card, Steps, Typography, Alert, message, Modal, Space, Divider } from 'antd';
import { LockOutlined, CheckCircleOutlined, QrcodeOutlined, KeyOutlined } from '@ant-design/icons';
import authApi from '../../services/authApi';
import QRCode from 'qrcode';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const MfaSetup = ({ onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaData, setMfaData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  useEffect(() => {
    const generateQRCode = async () => {
      if (mfaData?.otpUrl) {
        try {
          const url = await QRCode.toDataURL(mfaData.otpUrl);
          setQrCodeDataUrl(url);
        } catch (err) {
          console.error('Error generating QR code:', err);
          setError('Failed to generate QR code');
        }
      }
    };
    generateQRCode();
  }, [mfaData]);

  const startMfaSetup = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authApi.setupMfa();
      
      if (response.data.success) {
        setMfaData(response.data);
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      setError('Failed to start MFA setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMfaSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await authApi.verifyMfa({
        token: verificationCode,
        secret: mfaData.secret
      });

      if (response.data.success) {
        setBackupCodes(response.data.backupCodes || []);
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      setError(error.response?.data?.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codes = backupCodes.map(code => code.plain).join('\n');
    navigator.clipboard.writeText(codes);
    setCopied(true);
    message.success('Backup codes copied to clipboard');
    
    setTimeout(() => setCopied(false), 3000);
  };

  const downloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        'GradHelp - Backup Codes\n\n',
        'These are your backup codes for two-factor authentication.\n',
        'Each code can be used once. Store them in a safe place.\n\n',
        backupCodes.map(code => code.plain).join('\n')
      ],
      { type: 'text/plain' }
    );
    
    element.href = URL.createObjectURL(file);
    element.download = 'gradhelp-backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const completeSetup = () => {
    if (onSetupComplete) {
      onSetupComplete();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: 
        return (
          <div className="text-center">
            <div className="mb-6">
              <LockOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
              <Title level={3} className="mt-4">Set Up Two-Factor Authentication</Title>
              <Text type="secondary">
                Protect your account with an extra layer of security. You'll need an
                authenticator app like Google Authenticator or Microsoft Authenticator.
              </Text>
            </div>

            {error && (
              <Alert message={error} type="error" showIcon className="mb-6" />
            )}

            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={startMfaSetup}
            >
              Set Up Now
            </Button>
          </div>
        );

      case 1: 
        return (
          <div>
            <div className="text-center mb-6">
              <Title level={3}>Set Up Authenticator App</Title>
              <Text type="secondary">
                Scan the QR code below with your authenticator app
              </Text>
            </div>

            <div className="flex flex-col items-center mb-6">
              <div className="p-4 bg-white rounded-lg border border-gray-200 mb-4" style={{ minHeight: '232px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Scan this QR code with your authenticator app"
                    style={{ width: 200, height: 200, margin: '0 auto', display: 'block' }}
                    onError={(e) => {
                      console.error('Error loading QR code');
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
                        <QrcodeOutlined className="text-4xl text-gray-400" />
                      </div>
                      <div className="w-48 h-4 bg-gray-200 rounded mt-2"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center mb-6">
                <Text type="secondary">Or enter this code manually:</Text>
                <div className="mt-2 p-2 bg-gray-50 rounded-md font-mono text-lg">
                  {mfaData?.secret}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Title level={4} className="mb-2">Can't scan the code?</Title>
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Open your authenticator app</li>
                <li>Tap the + button to add a new account</li>
                <li>Select "Scan a QR code" and point your camera at the code above</li>
                <li>Or select "Enter a setup key" and enter the code above</li>
              </ol>
            </div>

            <div className="mb-6">
              <Title level={4} className="mb-2">Enter Verification Code</Title>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md text-center text-lg"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <Button
                  type="primary"
                  onClick={verifyMfaSetup}
                  loading={loading}
                  disabled={verificationCode.length !== 6}
                >
                  Verify
                </Button>
              </div>
              {error && (
                <Alert message={error} type="error" showIcon className="mt-4" />
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-center mb-6">
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              <Title level={3} className="mt-4">Two-Factor Authentication Enabled</Title>
              <Text type="secondary">
                You've successfully enabled two-factor authentication for your account.
              </Text>
            </div>

            <Alert
              message="Save Your Backup Codes"
              description={
                <div>
                  <p className="mb-2">
                    These backup codes can be used to access your account if you lose access to your 
                    authenticator app. Each code can only be used once.
                  </p>
                  <p className="font-semibold text-red-500">
                    Save these codes in a safe place. You won't be able to see them again.
                  </p>
                </div>
              }
              type="warning"
              showIcon
              className="mb-6"
            />

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-center p-2 bg-white rounded border">
                    {code.plain}
                  </div>
                ))}
              </div>

              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  type="default" 
                  icon={<KeyOutlined />} 
                  block
                  onClick={copyBackupCodes}
                  disabled={copied}
                >
                  {copied ? 'Copied!' : 'Copy Codes'}
                </Button>
                <Button 
                  type="default" 
                  icon={<KeyOutlined />} 
                  block
                  onClick={downloadBackupCodes}
                >
                  Download Codes
                </Button>
              </Space>
            </div>

            <div className="text-center">
              <Text type="secondary" className="block mb-4">
                Make sure you've saved your backup codes before continuing.
              </Text>
              <Button 
                type="primary" 
                size="large"
                onClick={completeSetup}
              >
                I've Saved My Backup Codes
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <Steps current={currentStep} className="mb-8">
        <Step title="Start" />
        <Step title="Scan QR Code" />
        <Step title="Backup Codes" />
      </Steps>

      {renderStep()}
    </Card>
  );
};

export default MfaSetup;
