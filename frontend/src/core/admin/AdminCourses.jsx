import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../../services/api';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  
  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  
  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, values);
        message.success('Course updated');
      } else {
        await api.post('/courses', values);
        message.success('Course added');
      }
      setModalVisible(false);
      form.resetFields();
      loadCourses();
    } catch (err) {
      message.error('Failed to save course');
    }
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      message.success('Course deleted');
      loadCourses();
    } catch (err) {
      message.error('Failed to delete course');
    }
  };

  
  const handleEdit = (course) => {
    setEditingId(course._id);
    form.setFieldsValue({
      course_name: course.course_name,
      university: course.university?._id || course.university,
      course_level: course.course_level,
      course_duration: course.course_duration,
      course_tuition: course.course_tuition,
      application_fee: course.application_fee,
      about: course.about,
      entry_requirements: course.entry_requirements,
      modules: course.modules,
      intake: course.intake,
      terms_and_conditions: course.terms_and_conditions
    });
    setModalVisible(true);
  };

  
  useEffect(() => {
    loadCourses();
  }, []);

  
  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'course_name', 
      key: 'course_name',
      render: (text) => text || 'N/A'
    },
    { 
      title: 'University', 
      key: 'university',
      render: (_, record) => record.university?.name || 'N/A',
    },
    { 
      title: 'Level', 
      dataIndex: 'course_level', 
      key: 'course_level',
      render: (text) => text ? text.charAt(0).toUpperCase() + text.slice(1) : 'N/A'
    },
    { 
      title: 'Duration', 
      dataIndex: 'course_duration',
      key: 'course_duration',
      render: (text) => text || 'N/A'
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
        <h2>Courses</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add Course
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={courses} 
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? 'Edit Course' : 'Add Course'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="course_name" label="Course Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="university" label="University" rules={[{ required: true }]}>
            <Select placeholder="Select university">
              {courses[0]?.university && (
                <Select.Option value={courses[0].university._id}>
                  {courses[0].university.name}
                </Select.Option>
              )}
            </Select>
          </Form.Item>
          <Form.Item name="course_level" label="Level" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="undergraduate">Undergraduate</Select.Option>
              <Select.Option value="graduate">Graduate</Select.Option>
              <Select.Option value="postgraduate">Postgraduate</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="course_duration" label="Duration" rules={[{ required: true }]}>
            <Input placeholder="e.g., 3 years" />
          </Form.Item>
          <Form.Item name="course_tuition" label="Tuition Fee" rules={[{ required: true }]}>
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item name="application_fee" label="Application Fee" rules={[{ required: true }]}>
            <Input type="number" prefix="$" />
          </Form.Item>
          <Form.Item name="about" label="About" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
