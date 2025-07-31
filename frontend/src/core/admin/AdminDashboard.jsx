
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button } from 'antd';
import {
    UserOutlined,
    FileDoneOutlined,
    BankOutlined,
    BookOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import API from '../../utils/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await API.get('/admin/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Total Users',
            value: stats?.users || 0,
            icon: <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
            color: '#1890ff'
        },
        {
            title: 'Applications',
            value: stats?.applications || 0,
            icon: <FileDoneOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
            color: '#52c41a'
        },
        {
            title: 'Scholarship Applications',
            value: stats?.scholarshipApplications || 0,
            icon: <DollarOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
            color: '#722ed1'
        },
        {
            title: 'Pending Actions',
            value: (stats?.pending?.applications || 0) + (stats?.pending?.scholarships || 0),
            icon: <ClockCircleOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />,
            color: '#fa8c16'
        }
    ];

    const columns = [
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
            render: (text) => (
                <span style={{ fontWeight: 500 }}>{text}</span>
            )
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            width: 100,
            render: (method) => (
                <Tag 
                    color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PUT' ? 'orange' : method === 'DELETE' ? 'red' : 'default'}
                    style={{ fontWeight: 500, borderRadius: '4px', padding: '2px 8px' }}
                >
                    {method}
                </Tag>
            )
        },
        {
            title: 'Path',
            dataIndex: 'path',
            key: 'path',
            width: 150,
            ellipsis: true,
            render: (text) => (
                <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{text}</code>
            )
        },
        {
            title: 'Status',
            dataIndex: 'statusCode',
            key: 'statusCode',
            width: 100,
            render: (statusCode) => (
                <Tag 
                    color={statusCode >= 400 ? 'red' : statusCode >= 300 ? 'orange' : 'green'}
                    style={{ fontWeight: 500, borderRadius: '4px', padding: '2px 8px' }}
                >
                    {statusCode}
                </Tag>
            ),
        },
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'timestamp',
            width: 180,
            render: (text) => (
                <span style={{ color: '#8c8c8c' }}>{new Date(text).toLocaleString()}</span>
            ),
        }
    ];

    return (
        <div className="admin-dashboard">
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px' }}>Admin Dashboard</h1>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
                {statCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card 
                            hoverable 
                            style={{ 
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s ease',
                                borderTop: `3px solid ${stat.color}`
                            }}
                        >
                            <Statistic
                                title={<span style={{ fontSize: '16px', fontWeight: 500 }}>{stat.title}</span>}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={{ color: stat.color, fontSize: '28px', fontWeight: 600 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Quick Actions */}
            <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
                <Col span={24}>
                    <Card 
                        title={<span style={{ fontSize: '18px', fontWeight: 500 }}>Quick Actions</span>}
                        style={{ 
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Space size="middle" wrap>
                            <Button 
                                type="primary" 
                                size="large"
                                onClick={() => navigate('/admin/applications')}
                                style={{ borderRadius: '6px', height: '42px', fontWeight: 500 }}
                            >
                                View Applications
                            </Button>
                            <Button 
                                size="large"
                                onClick={() => navigate('/admin/universities')}
                                style={{ borderRadius: '6px', height: '42px', fontWeight: 500 }}
                            >
                                Manage Universities
                            </Button>
                            <Button 
                                size="large"
                                onClick={() => navigate('/admin/courses')}
                                style={{ borderRadius: '6px', height: '42px', fontWeight: 500 }}
                            >
                                Manage Courses
                            </Button>
                            <Button 
                                size="large"
                                onClick={() => navigate('/admin/scholarships')}
                                style={{ borderRadius: '6px', height: '42px', fontWeight: 500 }}
                            >
                                Manage Scholarships
                            </Button>
                            <Button 
                                size="large"
                                onClick={() => navigate('/admin/logs')}
                                style={{ borderRadius: '6px', height: '42px', fontWeight: 500 }}
                            >
                                View Logs
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity */}
            <Row>
                <Col span={24}>
                    <Card
                        title={<span style={{ fontSize: '18px', fontWeight: 500 }}>Recent Activity</span>}
                        loading={loading}
                        style={{ 
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
                        }}
                        extra={
                            <Button
                                type="primary"
                                ghost
                                icon={<ReloadOutlined />}
                                onClick={() => window.location.reload()}
                                style={{ borderRadius: '6px', fontWeight: 500 }}
                            >
                                Refresh
                            </Button>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={stats?.recentActivity?.map(item => ({
                                ...item,
                                key: item._id
                            })) || []}
                            rowKey="_id"
                            pagination={{
                                pageSize: 5,
                                showSizeChanger: false,
                                hideOnSinglePage: true,
                                style: { marginTop: '16px' }
                            }}
                            size="middle"
                            scroll={{ x: true }}
                            style={{ borderRadius: '8px', overflow: 'hidden' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;