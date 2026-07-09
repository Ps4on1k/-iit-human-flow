import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { departmentsApi } from '@/services/api';

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await departmentsApi.list();
      setDepartments(data);
    } catch {
      message.error('Ошибка загрузки департаментов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name, code: record.code, description: record.description });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await departmentsApi.update(editingId, values);
        message.success('Департамент обновлён');
      } else {
        await departmentsApi.create(values);
        message.success('Департамент создан');
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await departmentsApi.delete(id);
      message.success('Департамент удалён');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Код',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{code}</span>,
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '—',
    },
    {
      title: 'Вакансий',
      key: 'vacancies',
      render: (_: any, record: any) => record._count?.vacancies || 0,
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Удалить департамент?" onConfirm={() => handleDelete(record.id)} okText="Да" cancelText="Нет">
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
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Департаменты</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Добавить</Button>
      </div>

      <Table columns={columns} dataSource={departments} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title={editingId ? 'Редактировать департамент' : 'Новый департамент'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingId ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="Код" rules={[{ required: true, message: 'Введите код' }]}>
            <Input placeholder="Например: IT, HR, FIN" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="description" label="Описание">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
