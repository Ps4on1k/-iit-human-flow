import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { sourcesApi } from '@/services/api';

export function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try { const { data } = await sourcesApi.list(); setSources(data); }
    catch { message.error('Ошибка загрузки источников'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await sourcesApi.update(editingId, values);
        message.success('Источник обновлён');
      } else {
        await sourcesApi.create(values);
        message.success('Источник создан');
      }
      setModalOpen(false); form.resetFields(); setEditingId(null); load();
    } catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const handleDelete = async (id: string) => {
    try { await sourcesApi.delete(id); message.success('Источник удалён'); load(); }
    catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Код', dataIndex: 'code', key: 'code', render: (code: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{code}</span> },
    { title: 'Кандидатов', key: 'count', render: (_: any, r: any) => r._count?.candidates || 0 },
    {
      title: '', key: 'actions', width: 80,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => { setEditingId(record.id); form.setFieldsValue({ name: record.name, code: record.code }); setModalOpen(true); }} />
          <Popconfirm title="Удалить?" onConfirm={() => handleDelete(record.id)}>
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>СПРАВОЧНИКИ</Typography.Text>
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Источники кандидатов</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>Добавить</Button>
      </div>
      <Table columns={columns} dataSource={sources} rowKey="id" loading={loading} pagination={false} />
      <Modal title={editingId ? 'Редактировать источник' : 'Новый источник'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText={editingId ? 'Сохранить' : 'Создать'} cancelText="Отмена">
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input placeholder="Например: LinkedIn" />
          </Form.Item>
          <Form.Item name="code" label="Код" rules={[{ required: true }]}>
            <Input placeholder="Например: linkedin" disabled={!!editingId} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
