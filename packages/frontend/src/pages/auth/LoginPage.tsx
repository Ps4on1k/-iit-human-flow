import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await authApi.login(values.email, values.password);
      login(data.user, data.token);
      message.success('Добро пожаловать!');
      navigate('/');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#F4F5F7',
      fontFamily: "'Manrope', sans-serif",
    }}>
      <Card style={{ width: 400, borderRadius: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <svg viewBox="0 0 44 44" fill="none" width={40} height={40} style={{ marginBottom: 16 }}>
            <line x1="22" y1="3" x2="22" y2="41" stroke="#2D3142" strokeWidth="4.5" strokeLinecap="butt"/>
            <line x1="38.5" y1="12.5" x2="5.5" y2="31.5" stroke="#2D3142" strokeWidth="4.5" strokeLinecap="butt"/>
            <line x1="5.5" y1="12.5" x2="38.5" y2="31.5" stroke="#2D3142" strokeWidth="4.5" strokeLinecap="butt"/>
          </svg>
          <Typography.Title level={3} style={{ margin: 0 }}>Инновация ИТ</Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>Human Flow — Система найма</Typography.Text>
        </div>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Введите email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
