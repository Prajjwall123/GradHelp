// frontend/src/core/admin/AdminDashboard.jsx
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
        },
        {
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            width: 100,
        },
        {
            title: 'Path',
            dataIndex: 'path',
            key: 'path',
            width: 150,
            ellipsis: true,
        },
        {
            title: 'Status',
            dataIndex: 'statusCode',
            key: 'statusCode',
            width: 100,
            render: (statusCode) => (
                <Tag color={statusCode >= 400 ? 'red' : statusCode >= 300 ? 'orange' : 'green'}>
                    {statusCode}
                </Tag>
            ),
        },
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'timestamp',
            width: 180,
            render: (text) => new Date(text).toLocaleString(),
        }
    ];

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {statCards.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={{ color: stat.color }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Quick Actions */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col span={24}>
                    <Card title="Quick Actions">
                        <Space>
                            <Button type="primary" onClick={() => navigate('/admin/applications')}>
                                View Applications
                            </Button>
                            <Button onClick={() => navigate('/admin/universities')}>
                                Manage Universities
                            </Button>
                            <Button onClick={() => navigate('/admin/courses')}>
                                Manage Courses
                            </Button>
                            <Button onClick={() => navigate('/admin/scholarships')}>
                                Manage Scholarships
                            </Button>
                            <Button onClick={() => navigate('/admin/logs')}>
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
                        title="Recent Activity"
                        loading={loading}
                        extra={
                            <Button
                                type="link"
                                icon={<ReloadOutlined />}
                                onClick={() => window.location.reload()}
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
                                hideOnSinglePage: true
                            }}
                            size="small"
                            scroll={{ x: true }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;