import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, DatePicker, Select, Space, Button, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    level: '',
    dateRange: [],
  });

  
  const loadLogs = async (page = 1, pageSize = 10) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pageSize,
        level: filters.level || undefined,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      };

      const res = await api.get('/logs', { params });
      
      
      const formattedLogs = res.data.data.map(log => ({
        ...log,
        key: log._id,
        timestamp: log.createdAt
      }));
      
      setLogs(formattedLogs);
      setPagination({
        current: page,
        pageSize,
        total: res.data.count,
      });
    } catch (err) {
      console.error('Error loading logs:', err);
      message.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  
  const handleTableChange = (pagination, filters, sorter) => {
    loadLogs(pagination.current, pagination.pageSize);
  };

  
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    loadLogs(1, pagination.pageSize);
  };

  
  useEffect(() => {
    loadLogs();
  }, []);

  
  const levelColors = {
    error: 'red',
    warn: 'orange',
    info: 'blue',
    debug: 'green',
  };

  
  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'timestamp',
      render: (timestamp) => moment(timestamp).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      render: (level) => (
        <Tag color={levelColors[level] || 'default'}>
          {level?.toUpperCase() || 'INFO'}
        </Tag>
      ),
      filters: [
        { text: 'Error', value: 'error' },
        { text: 'Warn', value: 'warn' },
        { text: 'Info', value: 'info' },
        { text: 'Debug', value: 'debug' },
      ],
      onFilter: (value, record) => record.level === value,
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
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 120,
      render: (time) => `${time}ms`,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>System Logs</h2>
      </div>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <RangePicker
              showTime
              onChange={(dates) => handleFilterChange('dateRange', dates)}
              value={filters.dateRange}
            />
            
            <Select
              placeholder="Filter by level"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange('level', value)}
              value={filters.level || undefined}
            >
              <Option value="error">Error</Option>
              <Option value="warn">Warning</Option>
              <Option value="info">Info</Option>
              <Option value="debug">Debug</Option>
            </Select>

            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadLogs(pagination.current, pagination.pageSize)}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={logs}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default AdminLogs;
