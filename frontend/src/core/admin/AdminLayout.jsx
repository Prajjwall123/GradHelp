// frontend/src/core/admin/AdminLayout.jsx
import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileDoneOutlined,
    BankOutlined,
    BookOutlined,
    DollarOutlined,
    UnorderedListOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const location = useLocation();
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin">Dashboard</Link>,
        },
        {
            key: 'applications',
            icon: <FileDoneOutlined />,
            label: <Link to="/admin/applications">Applications</Link>,
        },
        {
            key: 'universities',
            icon: <BankOutlined />,
            label: <Link to="/admin/universities">Universities</Link>,
        },
        {
            key: 'courses',
            icon: <BookOutlined />,
            label: <Link to="/admin/courses">Courses</Link>,
        },
        {
            key: 'scholarships',
            icon: <DollarOutlined />,
            label: <Link to="/admin/scholarships">Scholarships</Link>,
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Users</Link>,
        },
        {
            key: 'logs',
            icon: <UnorderedListOutlined />,
            label: <Link to="/admin/logs">System Logs</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider width={200} theme="light">
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <h2>Admin Panel</h2>
                </div>
                <Menu
                    mode="inline"
                    defaultSelectedKeys={[location.pathname.split('/')[2] || 'dashboard']}
                    style={{ height: '100%', borderRight: 0 }}
                    items={menuItems}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;