import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Avatar, Dropdown, Typography, Button, Tooltip } from 'antd';
import {
    DashboardOutlined,
    UserOutlined,
    FileDoneOutlined,
    BankOutlined,
    BookOutlined,
    DollarOutlined,
    UnorderedListOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, currentUser } = useAuth();
    const {
        token: { colorBgContainer, colorPrimary },
    } = theme.useToken();

    // Menu items configuration
    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            path: '/admin/dashboard'
        },
        {
            key: 'applications',
            icon: <FileDoneOutlined />,
            label: 'Applications',
            path: '/admin/applications'
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Users',
            path: '/admin/users'
        },
        {
            key: 'universities',
            icon: <BankOutlined />,
            label: 'Universities',
            path: '/admin/universities'
        },
        {
            key: 'courses',
            icon: <BookOutlined />,
            label: 'Courses',
            path: '/admin/courses'
        },
        {
            key: 'scholarships',
            icon: <DollarOutlined />,
            label: 'Scholarships',
            path: '/admin/scholarships'
        },
        {
            key: 'logs',
            icon: <UnorderedListOutlined />,
            label: 'System Logs',
            path: '/admin/logs'
        }
    ];

    // Update selected key when location changes
    useEffect(() => {
        const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
        if (currentItem) {
            setSelectedKey(currentItem.key);
        }
    }, [location.pathname]);

    const userMenu = (
        <Menu
            items={[
                {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: 'Profile',
                    onClick: () => navigate('/profile')
                },
                {
                    key: 'help',
                    icon: <QuestionCircleOutlined />,
                    label: 'Help & Support',
                    onClick: () => navigate('/help')
                },
                { type: 'divider' },
                {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Logout',
                    danger: true,
                    onClick: () => {
                        logout();
                        navigate('/login');
                    }
                },
            ]}
        />
    );

    return (
        <Layout className="admin-layout">
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={250}
                className="admin-sider"
                style={{
                    overflow: 'auto',
                    height: '100vh',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                    boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
                }}
            >
                <div className="admin-logo" style={{ background: colorPrimary }}>
                    {collapsed ? (
                        <div className="logo-collapsed">GH</div>
                    ) : (
                        <div className="logo-expanded">GradHelp Admin</div>
                    )}
                </div>

                <div className="admin-user-info">
                    <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
                        <div className="user-dropdown">
                            <Avatar
                                size="large"
                                icon={<UserOutlined />}
                                src={currentUser?.avatar}
                                style={{ backgroundColor: colorPrimary }}
                            />
                            {!collapsed && (
                                <div className="user-details">
                                    <Text strong className="user-name">
                                        {currentUser?.name || 'Admin User'}
                                    </Text>
                                    <Text type="secondary" className="user-role">
                                        {currentUser?.role || 'Administrator'}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>

                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    className="admin-menu"
                    onClick={({ key }) => {
                        const item = menuItems.find(i => i.key === key);
                        if (item) navigate(item.path);
                    }}
                >
                    {menuItems.map(item => (
                        <Menu.Item key={item.key} icon={item.icon}>
                            {item.label}
                        </Menu.Item>
                    ))}
                </Menu>

                {/* Collapse button */}
                <div className="sidebar-footer">
                    <Tooltip placement="right" title={collapsed ? 'Expand' : 'Collapse'}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="collapse-btn"
                        />
                    </Tooltip>
                </div>
            </Sider>

            {/* Main Content */}
            <Layout
                className="site-layout"
                style={{
                    marginLeft: collapsed ? 80 : 250,
                    minHeight: '100vh',
                    transition: 'all 0.2s'
                }}
            >
                <Header
                    className="admin-header"
                    style={{
                        padding: '0 24px',
                        background: colorBgContainer,
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
                    }}
                >
                    <div className="header-left">
                        <h2 className="page-title">
                            {menuItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="header-right">
                        <Button 
                            type="primary" 
                            onClick={() => navigate('/admin/dashboard')}
                            style={{ marginRight: '10px' }}
                        >
                            Home
                        </Button>
                    </div>
                </Header>

                <Content
                    className="admin-content"
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: 8,
                        overflow: 'initial'
                    }}
                >
                    <div className="content-container">
                        <Outlet />
                    </div>
                </Content>

                <Footer 
                    style={{ 
                        textAlign: 'center',
                        background: '#fff',
                        padding: '16px',
                        borderTop: '1px solid #f0f0f0',
                        fontWeight: 500
                    }}
                >
                    <span style={{ color: colorPrimary }}>GradHelp</span> Admin Portal © {new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;