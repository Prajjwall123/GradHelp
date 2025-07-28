import React, { useState, useEffect } from 'react';
import { Card, Switch, Button, Typography, Divider, Alert, Modal } from 'antd';
import { LockOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import MfaSetup from './MfaSetup';
import authApi from '../../services/authApi';

const { Title, Text } = Typography;

const SecuritySettings = () => {
  const [mfaStatus, setMfaStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const fetchMfaStatus = async () => {
    try {
      setLoading(true);
      const response = await authApi.getMfaStatus();
      setMfaStatus(response.data.enabled || false);
    } catch (error) {
      console.error('Failed to fetch MFA status:', error);
      setError('Failed to load security settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMfaStatus();
  }, []);

  const handleMfaToggle = (checked) => {
    checked ? setShowMfaSetup(true) : setShowDisableConfirm(true);
  };

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
    fetchMfaStatus();
  };

  const confirmDisableMfa = async () => {
    try {
      setDisabling(true);
      await authApi.disableMfa();
      setMfaStatus(false);
      setShowDisableConfirm(false);
    } catch (error) {
      console.error('Failed to disable MFA:', error);
      setError('Failed to disable two-factor authentication');
    } finally {
      setDisabling(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    try {
      const response = await authApi.generateBackupCodes();
      Modal.info({
        title: 'Your New Backup Codes',
        content: (
          <div>
            <p>Save these codes in a secure location:</p>
            <div className="mt-4 space-y-2">
              {response.data.backupCodes.map((code, index) => (
                <div key={index} className="font-mono bg-gray-100 p-2 rounded">
                  {code.plain}
                </div>
              ))}
            </div>
          </div>
        ),
        width: 500,
      });
    } catch (error) {
      console.error('Failed to generate backup codes:', error);
      setError('Failed to generate backup codes');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Title level={2} className="mb-6">Security Settings</Title>
      
      {error && (
        <Alert 
          message="Error" 
          description={error} 
          type="error" 
          showIcon 
          className="mb-6" 
          closable
          onClose={() => setError('')}
        />
      )}

      <Card 
        title={
          <span className="flex items-center">
            <LockOutlined className="mr-2" />
            Two-Factor Authentication (2FA)
          </span>
        }
        className="mb-6"
        loading={loading}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <Title level={5} className="mb-1">
              {mfaStatus ? '2FA is enabled' : '2FA is disabled'}
            </Title>
            <Text type="secondary">
              {mfaStatus 
                ? 'An extra layer of security is enabled for your account.'
                : 'Add an extra layer of security to your account.'}
            </Text>
          </div>
          
          <div className="flex items-center">
            <Switch 
              checked={mfaStatus} 
              onChange={handleMfaToggle}
              className={mfaStatus ? 'bg-blue-500' : ''}
            />
            <span className="ml-2">{mfaStatus ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>

        {mfaStatus && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Title level={5} className="mb-3">Backup Options</Title>
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <div className="flex items-start">
                <WarningOutlined className="text-yellow-500 text-lg mr-2 mt-1" />
                <div>
                  <Text className="block font-medium mb-1">Save Your Backup Codes</Text>
                  <Text type="secondary" className="block mb-3">
                    If you lose access to your authenticator app, you can use backup codes.
                  </Text>
                  <Button 
                    type="default" 
                    onClick={handleGenerateBackupCodes}
                    className="flex items-center"
                  >
                    Generate New Backup Codes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* MFA Setup Modal */}
      <Modal
        title="Set Up Two-Factor Authentication"
        open={showMfaSetup}
        onCancel={() => setShowMfaSetup(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <MfaSetup onSetupComplete={handleMfaSetupComplete} />
      </Modal>

      {/* Disable MFA Confirmation */}
      <Modal
        title="Disable Two-Factor Authentication"
        open={showDisableConfirm}
        onOk={confirmDisableMfa}
        onCancel={() => setShowDisableConfirm(false)}
        confirmLoading={disabling}
        okText="Disable"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to disable two-factor authentication?</p>
        <p className="text-red-500 mt-2">
          Your account will be less secure without two-factor authentication.
        </p>
      </Modal>
    </div>
  );
};

export default SecuritySettings;
