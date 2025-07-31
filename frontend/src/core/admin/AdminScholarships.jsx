import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [universities, setUniversities] = useState([]);

  
  const loadData = async () => {
    try {
      setLoading(true);
      const [scholarshipsRes, universitiesRes] = await Promise.all([
        api.get('/scholarships'),
        api.get('/universities')
      ]);
      setScholarships(scholarshipsRes.data);
      setUniversities(universitiesRes.data);
    } catch (err) {
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/scholarships/${editingId}`, values);
        message.success('Scholarship updated');
      } else {
        await api.post('/scholarships', values);
        message.success('Scholarship added');
      }
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (err) {
      message.error('Failed to save scholarship');
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scholarship?')) return;
    try {
      await api.delete(`/scholarships/${id}`);
      message.success('Scholarship deleted');
      loadData();
    } catch (err) {
      message.error('Failed to delete scholarship');
    }
  };

  
  const handleEdit = (scholarship) => {
    setEditingId(scholarship._id);
    form.setFieldsValue({
      scholarship_name: scholarship.scholarship_name,
      university: scholarship.university,
      amount_per_year: scholarship.amount_per_year,
      terms_and_conditions: scholarship.terms_and_conditions,
    });
    setModalVisible(true);
  };

  
  useEffect(() => {
    loadData();
  }, []);

  
  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'scholarship_name', 
      key: 'scholarship_name',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'University', 
      key: 'university',
      render: (_, record) => {
        
        const uni = universities.find(u => u._id === record.university);
        return uni?.name || 'N/A';
      },
    },
    { 
      title: 'Amount/Year', 
      render: (_, record) => `$${record.amount_per_year?.toLocaleString() || '0'}`,
    },
    {
      title: 'Terms & Conditions',
      dataIndex: 'terms_and_conditions',
      key: 'terms_and_conditions',
      render: (text) => text ? `${text.substring(0, 50)}...` : 'N/A',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Scholarships</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Scholarship
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={scholarships} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Edit Scholarship' : 'Add Scholarship'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item 
            name="scholarship_name" 
            label="Scholarship Name" 
            rules={[{ required: true, message: 'Please enter the scholarship name' }]}
          >
            <Input placeholder="Enter scholarship name" />
          </Form.Item>
          
          <Form.Item 
            name="university" 
            label="University" 
            rules={[{ required: true, message: 'Please select a university' }]}
          >
            <Select placeholder="Select university">
              {universities.map(uni => (
                <Select.Option key={uni._id} value={uni._id}>
                  {uni.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="amount_per_year" 
            label="Amount Per Year ($)" 
            rules={[{ required: true, message: 'Please enter the scholarship amount' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item 
            name="terms_and_conditions" 
            label="Terms and Conditions" 
            rules={[{ required: true, message: 'Please enter the terms and conditions' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter the terms and conditions for this scholarship" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminScholarships;
