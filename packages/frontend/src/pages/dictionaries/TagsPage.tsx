import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Transfer, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { tagsApi } from '@/services/api';
import api from '@/services/api';

export function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [visibilityModal, setVisibilityModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [visForm] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await tagsApi.list(); setTags(data); } finally { setLoading(false); }
  };

  const loadUsers = async () => {
    try { const { data } = await api.get('/users'); setUsers(data); } catch {}
  };

  useEffect(() => { load(); loadUsers(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await tagsApi.update(editingId, values);
        message.success('Тег обновлён');
      } else {
        await tagsApi.create(values);
        message.success('Тег создан');
      }
      setModalOpen(false); form.resetFields(); setEditingId(null); load();
    } catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    try { await tagsApi.delete(id); message.success('Тег удалён'); load(); }
    catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const openVisibility = async (tag: any) => {
    setSelectedTag(tag);
    try {
      const { data } = await tagsApi.getVisibility(tag.id);
      const visibleUserIds = data.map((v: any) => v.user.id);
      visForm.setFieldsValue({ userIds: visibleUserIds });
    } catch { visForm.setFieldsValue({ userIds: [] }); }
    setVisibilityModal(true);
  };

  const handleVisibilitySave = async (values: any) => {
    try {
      await tagsApi.setVisibility(selectedTag.id, values.userIds || []);
      message.success('Видимость обновлена');
      setVisibilityModal(false);
    } catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const columns = [
    {
      title: 'Тег', key: 'tag',
      render: (_: any, record: any) => (
        <Tag color={record.color || '#3A8DFF'} style={{ borderRadius: 2, fontWeight: 600 }}>{record.name}</Tag>
      ),
    },
    { title: 'Вакансий', key: 'vacancies', render: (_: any, r: any) => r._count?.vacancyTags || 0 },
    { title: 'Кандидатов', key: 'candidates', render: (_: any, r: any) => r._count?.candidateTags || 0 },
    {
      title: '', key: 'actions', width: 100,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} size="small" onClick={() => openVisibility(record)} />
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => { setEditingId(record.id); form.setFieldsValue({ name: record.name, color: record.color }); setModalOpen(true); }} />
          <Popconfirm title="Удалить?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userOptions = users.map((u: any) => ({ label: `${u.firstName} ${u.lastName} (${u.email})`, value: u.id }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>СПРАВОЧНИКИ</Typography.Text>
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Теги</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>Добавить</Button>
      </div>
      <Table columns={columns} dataSource={tags} rowKey="id" loading={loading} pagination={false} />

      <Modal title={editingId ? 'Редактировать тег' : 'Новый тег'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText={editingId ? 'Сохранить' : 'Создать'} cancelText="Отмена">
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ color: '#3A8DFF' }} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Цвет">
            <input type="color" style={{ width: 40, height: 32, border: 'none', cursor: 'pointer' }} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={`Видимость: ${selectedTag?.name || ''}`} open={visibilityModal} onCancel={() => setVisibilityModal(false)} onOk={() => visForm.submit()} okText="Сохранить" cancelText="Отмена" width={600}>
        <div style={{ marginBottom: 12, fontSize: 12, color: '#8A94A6' }}>
          Выберите пользователей, которые будут видеть этот тег. Если список пуст — тег видят все.
        </div>
        <Form form={visForm} layout="vertical" onFinish={handleVisibilitySave}>
          <Form.Item name="userIds">
            <Transfer
              dataSource={userOptions}
              titles={['Доступные', 'Видят тег']}
              render={(item: any) => item.label}
              listStyle={{ width: 250, height: 300 }}
              showSearch
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
