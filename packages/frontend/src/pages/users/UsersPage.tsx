import { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, Form, Input, Select, message, Popconfirm, Transfer, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import api from '@/services/api';
import { tagsApi } from '@/services/api';

const roleColors: Record<string, string> = {
  ADMIN: 'var(--graphite, #111315)',
  RECRUITER: 'var(--blue, #3A8DFF)',
  HIRING_MANAGER: 'var(--cyan, #42D9C8)',
  HR: 'var(--green, #21B573)',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Администратор',
  RECRUITER: 'Рекрутер',
  HIRING_MANAGER: 'Наниматель',
  HR: 'HR',
};

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tagsModalOpen, setTagsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userTagIds, setUserTagIds] = useState<string[]>([]);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      const usersWithTags = await Promise.all(
        data.map(async (u: any) => {
          try {
            const { data: tags } = await tagsApi.getUserTags(u.id);
            return { ...u, userTags: tags };
          } catch {
            return { ...u, userTags: [] };
          }
        })
      );
      setUsers(usersWithTags);
    } catch {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try { const { data } = await tagsApi.list(); setAllTags(data); } catch {}
  };

  useEffect(() => { load(); loadTags(); }, []);

  const handleCreate = async (values: any) => {
    try {
      await api.post('/users', values);
      setModalOpen(false);
      form.resetFields();
      message.success('Пользователь создан');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('Пользователь деактивирован');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const openTagsModal = async (user: any) => {
    setSelectedUser(user);
    try {
      const { data } = await tagsApi.getUserTags(user.id);
      setUserTagIds(data.map((t: any) => t.id));
    } catch { setUserTagIds([]); }
    setTagsModalOpen(true);
  };

  const handleSaveTags = async () => {
    if (!selectedUser) return;
    try {
      await tagsApi.setUserTags(selectedUser.id, userTagIds);
      message.success('Теги обновлены');
      setTagsModalOpen(false);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const columns = [
    {
      title: 'Имя',
      key: 'name',
      render: (_: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{record.firstName} {record.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--neutral, #8A94A6)' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={roleColors[role]} style={{ borderRadius: 2, fontWeight: 600, fontSize: 10, letterSpacing: '0.06em' }}>
          {roleLabels[role] || role}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'var(--green, #21B573)' : 'var(--red, #E5484D)'} style={{ borderRadius: 2 }}>
          {active ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Теги',
      key: 'tags',
      render: (_: any, record: any) => {
        const userTags = record.userTags?.map((ut: any) => ut.tag).filter(Boolean) || [];
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {userTags.map((tag: any) => (
              <Tag key={tag.id} color={tag.color || 'var(--blue, #3A8DFF)'} style={{ borderRadius: 2, fontSize: 10 }}>
                {tag.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru'),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<TagsOutlined />} size="small" onClick={() => openTagsModal(record)} title="Теги" />
          <Popconfirm title="Деактивировать пользователя?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const tagTransferData = allTags.map((t: any) => ({ key: t.id, title: t.name }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>АДМИНИСТРИРОВАНИЕ</Typography.Text>
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Пользователи</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Создать</Button>
      </div>

      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />

      <Modal title="Новый пользователь" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Создать" cancelText="Отмена">
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="firstName" label="Имя" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
          <Form.Item name="role" label="Роль" rules={[{ required: true }]}>
            <Select options={[
              { value: 'ADMIN', label: 'Администратор' },
              { value: 'RECRUITER', label: 'Рекрутер' },
              { value: 'HIRING_MANAGER', label: 'Наниматель' },
              { value: 'HR', label: 'HR' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Теги: ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        open={tagsModalOpen}
        onCancel={() => setTagsModalOpen(false)}
        onOk={handleSaveTags}
        okText="Сохранить"
        cancelText="Отмена"
        width={600}
      >
        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--neutral, #8A94A6)' }}>
          Перенесите теги в правую колонку, чтобы назначить их пользователю.
        </div>
        <Transfer
          dataSource={tagTransferData}
          titles={['Доступные', 'Назначенные']}
          targetKeys={userTagIds}
          onChange={(nextTargetKeys) => setUserTagIds(nextTargetKeys as string[])}
          render={(item) => item.title}
          listStyle={{ width: 250, height: 300 }}
          showSearch
        />
      </Modal>
    </div>
  );
}
