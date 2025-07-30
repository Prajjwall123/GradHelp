import React, { useState, useEffect } from 'react';
import { Tabs, Table, Card, Tag, Button, Space, Badge, message, Modal, Typography, Upload, Input, Descriptions } from 'antd';
const { TextArea } = Input;
import { FileDoneOutlined, DollarOutlined, CheckOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
const { Text } = Typography;
import API from '../../utils/api';

const { TabPane } = Tabs;

const AdminApplications = () => {
  const [activeTab, setActiveTab] = useState('university');
  const [universityApps, setUniversityApps] = useState([]);
  const [scholarshipApps, setScholarshipApps] = useState([]);
  const [loading, setLoading] = useState({
    university: false,
    scholarship: false,
    accept: false,
    reject: false
  });
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [fileList, setFileList] = useState([]);

  // Basic application columns
  const applicationColumns = [
    {
      title: 'Application ID',
      dataIndex: '_id',
      key: 'id',
      render: (id) => <span className="font-mono">{id.slice(-8)}</span>,
    },
    {
      title: 'Applicant',
      key: 'applicant',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => showApplicationDetails(record)}
          className="p-0"
        >
          {record.profile?.full_name || record.user?.fullName || 'N/A'}
        </Button>
      ),
    },
    {
      title: 'Course',
      key: 'course',
      render: (_, record) => (
        <span>{record.course?.course_name || 'N/A'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'accepted' ? 'green' :
            status === 'rejected' ? 'red' :
              status === 'pending' ? 'orange' : 'blue'
        }>
          {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </Tag>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleAccept(record._id);
            }}
            loading={loading.accept && selectedApp?._id === record._id}
            disabled={record.status === 'accepted'}
          >
            {record.status === 'accepted' ? 'Accepted' : 'Accept'}
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              showRejectModal(record);
            }}
            loading={loading.reject && selectedApp?._id === record._id}
            disabled={record.status === 'rejected'}
          >
            {record.status === 'rejected' ? 'Rejected' : 'Reject'}
          </Button>
        </Space>
      ),
    },
  ];

  // Fetch applications
  const fetchApplications = async (type) => {
    try {
      setLoading(prev => ({ ...prev, [type]: true }));

      if (type === 'university') {
        // Get all applications for admin
        const response = await API.get('/applications/admin/all');

        // Transform the data to match the expected format
        const formattedData = response.data.map(app => ({
          ...app,
          user: app.profile?.user || { fullName: 'Unknown' },
          status: app.status || 'pending'
        }));

        setUniversityApps(formattedData);
      } else {
        // Get all scholarship applications for admin
        const response = await API.get('/scholarship-applications');

        // Transform the data to match the expected format
        const formattedData = response.data.map(app => ({
          ...app,
          user: app.profile?.user || { fullName: 'Unknown' },
          status: app.status || 'pending'
        }));

        setScholarshipApps(formattedData);
      }
    } catch (error) {
      console.error(`Error fetching ${type} applications:`, error);
      // Show error message to user
      message.error(`Failed to load ${type} applications. Please try again later.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle accept application
  const handleAccept = async (applicationId) => {
    try {
      setLoading(prev => ({ ...prev, accept: true }));

      const formData = new FormData();
      formData.append('message', 'Your application has been accepted.');

      // Add file if uploaded
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }

      await API.post(`/application-decisions/${applicationId}/accept`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the local state to reflect the change
      if (activeTab === 'university') {
        setUniversityApps(prev =>
          prev.map(app =>
            app._id === applicationId
              ? { ...app, status: 'accepted' }
              : app
          )
        );
      } else {
        setScholarshipApps(prev =>
          prev.map(app =>
            app._id === applicationId
              ? { ...app, status: 'accepted' }
              : app
          )
        );
      }

      message.success('Application accepted successfully');
      setFileList([]);
    } catch (error) {
      console.error('Error accepting application:', error);
      message.error(error.response?.data?.message || 'Failed to accept application. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, accept: false }));
      setSelectedApp(null);
    }
  };

  // Show application details
  const showApplicationDetails = (application) => {
    setSelectedApp(application);
    setDetailsModalVisible(true);
  };

  // Show reject modal
  const showRejectModal = (application) => {
    setSelectedApp(application);
    setRejectModalVisible(true);
  };

  // Handle reject application
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, reject: true }));

      const formData = new FormData();
      formData.append('message', rejectReason);

      // Add file if uploaded
      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj);
      }

      await API.post(`/application-decisions/${selectedApp._id}/reject`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the local state to reflect the change
      if (activeTab === 'university') {
        setUniversityApps(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { ...app, status: 'rejected' }
              : app
          )
        );
      } else {
        setScholarshipApps(prev =>
          prev.map(app =>
            app._id === selectedApp._id
              ? { ...app, status: 'rejected' }
              : app
          )
        );
      }

      message.success('Application rejected successfully');
      setRejectModalVisible(false);
      setRejectReason('');
      setFileList([]);
    } catch (error) {
      console.error('Error rejecting application:', error);
      message.error(error.response?.data?.message || 'Failed to reject application. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, reject: false }));
      setSelectedApp(null);
    }
  };

  // Handle file upload
  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Load data when tab changes
  useEffect(() => {
    if ((activeTab === 'university' && universityApps.length === 0) ||
      (activeTab === 'scholarship' && scholarshipApps.length === 0)) {
      fetchApplications(activeTab);
    }
  }, [activeTab]);

  return (
    <div className="p-4">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <FileDoneOutlined />
              University Applications
              {universityApps.length > 0 && (
                <Badge
                  count={universityApps.length}
                  style={{ marginLeft: 8 }}
                />
              )}
            </span>
          }
          key="university"
        >
          <Card>
            <Table
              columns={applicationColumns}
              dataSource={universityApps}
              loading={loading.university}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <DollarOutlined />
              Scholarship Applications
              {scholarshipApps.length > 0 && (
                <Badge
                  count={scholarshipApps.length}
                  style={{ marginLeft: 8 }}
                />
              )}
            </span>
          }
          key="scholarship"
        >
          <Card>
            <Table
              columns={applicationColumns}
              dataSource={scholarshipApps}
              loading={loading.scholarship}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Reject Modal */}
      <Modal
        title="Reject Application"
        visible={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setFileList([]);
        }}
        confirmLoading={loading.reject}
        okText="Reject Application"
        okButtonProps={{ danger: true }}
      >
        <div className="mb-4">
          <Text strong>Reason for Rejection</Text>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            className="mt-2"
          />
        </div>
        <div>
          <Text strong>Upload Rejection Letter (Optional)</Text>
          <Upload
            fileList={fileList}
            onChange={handleUpload}
            beforeUpload={() => false} // Prevent auto upload
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
          <Text type="secondary" className="text-xs">
            Supported formats: PDF, DOC, DOCX (Max: 5MB)
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default AdminApplications;
