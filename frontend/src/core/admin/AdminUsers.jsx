import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, values);
        message.success('User updated');
      } else {
        await api.post('/users', values);
        message.success('User added');
      }
      setModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (err) {
      message.error('Failed to save user');
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      message.success('User deleted');
      loadUsers();
    } catch (err) {
      message.error('Failed to delete user');
    }
  };

  
  const handleEdit = (user) => {
    setEditingId(user._id);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setModalVisible(true);
  };

  
  useEffect(() => {
    loadUsers();
  }, []);

  
  const roleColors = {
    admin: 'red',
    user: 'blue',
    student: 'green',
  };

  
  const columns = [
    { title: 'Name', dataIndex: 'fullName', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={roleColors[role] || 'default'}>{role.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button 
            type="link" 
            danger 
            onClick={() => handleDelete(record._id)}
            disabled={record.role === 'admin'}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Users</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add User
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Edit User' : 'Add User'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item 
            name="fullName" 
            label="Full Name" 
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="Email" 
            rules={[{ required: true, type: 'email' }]}
          >
            <Input type="email" />
          </Form.Item>
          
          <Form.Item 
            name="role" 
            label="Role" 
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="student">Student</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            name="isActive" 
            label="Status" 
            valuePropName="checked"
          >
            <Select>
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUsers;
