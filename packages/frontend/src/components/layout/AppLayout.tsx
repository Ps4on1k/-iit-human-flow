import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Switch, Typography } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined,
  ApartmentOutlined,
  BankOutlined,
  ToolOutlined,
  TagsOutlined,
  ImportOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { themeMode, toggleTheme } = useThemeStore();
  const isDark = themeMode === 'dark';

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Дашборд' },
    { key: '/vacancies', icon: <TeamOutlined />, label: 'Вакансии' },
    { key: '/candidates', icon: <UserOutlined />, label: 'Кандидаты' },
    ...(user?.role === 'ADMIN'
      ? [
          { type: 'divider' as const },
          {
            key: 'admin-section',
            label: 'Администрирование',
            type: 'group' as const,
            children: [
              { key: '/pipelines', icon: <ApartmentOutlined />, label: 'Флоу найма' },
              { key: '/departments', icon: <BankOutlined />, label: 'Департаменты' },
              { key: '/professions', icon: <ToolOutlined />, label: 'Профессии' },
              { key: '/sources', icon: <ImportOutlined />, label: 'Источники' },
              { key: '/tags', icon: <TagsOutlined />, label: 'Теги' },
              { key: '/users', icon: <SettingOutlined />, label: 'Пользователи' },
            ],
          },
        ]
      : []),
  ];

  const userMenuItems = [
    { key: 'role', label: `Роль: ${user?.role}`, disabled: true },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: () => { logout(); navigate('/login'); },
    },
  ];

  const sidebarBg = isDark ? '#1a1d24' : '#111315';
  const headerBg = isDark ? '#14161c' : '#FFFFFF';
  const bodyBg = isDark ? '#14161c' : '#EEF1F4';
  const headerBorder = isDark ? '#262830' : '#D8DCE3';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={248}
        collapsedWidth={60}
        style={{ background: sidebarBg }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 8px' : '0 24px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.1)'}`,
            gap: 12,
          }}
        >
          <svg viewBox="0 0 44 44" fill="none" width={24} height={24}>
            <line x1="22" y1="3" x2="22" y2="41" stroke="white" strokeWidth="4.5" strokeLinecap="butt"/>
            <line x1="38.5" y1="12.5" x2="5.5" y2="31.5" stroke="white" strokeWidth="4.5" strokeLinecap="butt"/>
            <line x1="5.5" y1="12.5" x2="38.5" y2="31.5" stroke="white" strokeWidth="4.5" strokeLinecap="butt"/>
          </svg>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase' }}>
                Инновация ИТ
              </div>
              <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.14em', color: '#AEB7C4', textTransform: 'uppercase', marginTop: 2 }}>
                Human Flow
              </div>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1]]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: 'transparent', borderRight: 'none', paddingTop: 16 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: headerBg,
            borderBottom: `1px solid ${headerBorder}`,
            height: 64,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
            <Button type="text" icon={<BellOutlined style={{ fontSize: 18 }} />} />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar style={{ background: '#3A8DFF' }} icon={<UserOutlined />} />
                {!collapsed && (
                  <Typography.Text style={{ fontSize: 13, fontWeight: 600 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography.Text>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ padding: 32, minHeight: 'calc(100vh - 64px)', background: bodyBg }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
