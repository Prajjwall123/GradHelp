import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';

const AdminUniversities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch universities
  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/universities');
      setUniversities(response.data);
    } catch (error) {
      console.error('Error fetching universities:', error);
      message.error('Failed to load universities');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      if (editingUniversity) {
        await api.put(`/api/universities/${editingUniversity._id}`, values);
        message.success('University updated successfully');
      } else {
        await api.post('/api/universities', values);
        message.success('University added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchUniversities();
    } catch (error) {
      console.error('Error saving university:', error);
      message.error('Failed to save university');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/universities/${id}`);
      message.success('University deleted successfully');
      fetchUniversities();
    } catch (error) {
      console.error('Error deleting university:', error);
      message.error('Failed to delete university');
    }
  };

  // Set up edit form
  const handleEdit = (university) => {
    setEditingUniversity(university);
    form.setFieldsValue({
      university_name: university.university_name,
      city: university.city,
      country: university.country,
      institution_type: university.institution_type,
      website: university.website,
      email: university.email,
      phone: university.phone
    });
    setIsModalVisible(true);
  };

  // Reset form when modal is closed
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingUniversity(null);
  };

  // Load data on component mount
  useEffect(() => {
    fetchUniversities();
  }, []);

  // Filter universities based on search text
  const filteredUniversities = universities.filter(uni => 
    uni.university_name.toLowerCase().includes(searchText.toLowerCase()) ||
    uni.city.toLowerCase().includes(searchText.toLowerCase()) ||
    uni.country.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns
  const columns = [
    {
      title: 'University Name',
      dataIndex: 'university_name',
      key: 'university_name',
      sorter: (a, b) => a.university_name.localeCompare(b.university_name),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_, record) => (
        <span>{record.city}, {record.country}</span>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'institution_type',
      key: 'institution_type',
      render: (type) => (
        <Tag color={type === 'public' ? 'blue' : 'purple'}>
          {type?.toUpperCase() || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this university?')) {
                handleDelete(record._id);
              }
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-universities">
      <div className="flex justify-between items-center mb-4">
        <h2>Manage Universities</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Add University
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search universities..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredUniversities} 
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUniversity ? 'Edit University' : 'Add New University'}
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="university_name"
            label="University Name"
            rules={[{ required: true, message: 'Please enter university name' }]}
          >
            <Input placeholder="Enter university name" />
          </Form.Item>

          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter city' }]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>

          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please enter country' }]}
          >
            <Input placeholder="Enter country" />
          </Form.Item>

          <Form.Item
            name="institution_type"
            label="Institution Type"
            rules={[{ required: true, message: 'Please select institution type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="public">Public</Select.Option>
              <Select.Option value="private">Private</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
            rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input placeholder="contact@university.edu" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
          >
            <Input placeholder="+1 (123) 456-7890" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingUniversity ? 'Update' : 'Add'} University
            </Button>
            <Button onClick={handleModalCancel} style={{ marginLeft: 8 }}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUniversities;
