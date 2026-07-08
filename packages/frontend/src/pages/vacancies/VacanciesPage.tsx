import { useEffect, useState } from 'react';
import { Table, Tag, Modal, Form, Input, Select, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { vacanciesApi, departmentsApi, pipelinesApi } from '@/services/api';

const statusColors: Record<string, string> = {
  DRAFT: 'default',
  OPEN: 'processing',
  ON_HOLD: 'warning',
  CLOSED: 'success',
  CANCELLED: 'error',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Черновик',
  OPEN: 'Открыта',
  ON_HOLD: 'Приостановлена',
  CLOSED: 'Закрыта',
  CANCELLED: 'Отменена',
};

const urgencyLabels: Record<string, string> = {
  NORMAL: 'Обычная',
  URGENT: 'Срочно',
  MASS_HIRE: 'Массовый найм',
  REPLACEMENT: 'Замена',
  NEW_POSITION: 'Новая позиция',
};

const urgencyColors: Record<string, string> = {
  NORMAL: 'default',
  URGENT: 'red',
  MASS_HIRE: 'blue',
  REPLACEMENT: 'orange',
  NEW_POSITION: 'green',
};

const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань', 'Нижний Новгород', 'Краснодар', 'Уфа', 'Волгоград', 'Удалённо'];

export function VacanciesPage() {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await vacanciesApi.list();
      setVacancies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    departmentsApi.list().then(r => setDepartments(r.data));
    pipelinesApi.list().then(r => setPipelines(r.data));
  }, []);

  const handleCreate = async (values: any) => {
    await vacanciesApi.create(values);
    setModalOpen(false);
    form.resetFields();
    load();
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: any) => (
        <a onClick={() => navigate(`/vacancies/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: 'Департамент',
      dataIndex: ['department', 'name'],
      key: 'department',
    },
    {
      title: 'Локация',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Зарплата',
      key: 'salary',
      render: (_: any, record: any) => {
        if (!record.salaryMin && !record.salaryMax) return '—';
        const min = record.salaryMin ? `${Number(record.salaryMin).toLocaleString('ru-RU')}` : '';
        const max = record.salaryMax ? `${Number(record.salaryMax).toLocaleString('ru-RU')}` : '';
        return `${min}${min && max ? ' — ' : ''}${max} ₽`;
      },
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{statusLabels[status] || status}</Tag>,
    },
    {
      title: 'Срочность',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency: string) => <Tag color={urgencyColors[urgency]}>{urgencyLabels[urgency] || urgency}</Tag>,
    },
    {
      title: 'Кандидаты',
      key: 'candidates',
      render: (_: any, record: any) => record._count?.candidates || 0,
    },
    {
      title: 'Создатель',
      key: 'creator',
      render: (_: any, record: any) => record.creator ? `${record.creator.firstName} ${record.creator.lastName}` : '—',
    },
  ];

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              УПРАВЛЕНИЕ
            </Typography.Text>
            <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Вакансии</Typography.Title>
          </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          Создать вакансию
        </Button>
      </div>

      <Table columns={columns} dataSource={vacancies} rowKey="id" loading={loading} />

      <Modal
        title="Новая вакансия"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Создать"
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ currency: 'RUB' }}>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="location" label="Город" rules={[{ required: true }]}>
            <Select showSearch placeholder="Выберите город" options={cities.map(c => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="grade" label="Грейд">
            <Select
              options={[
                { value: 'Junior', label: 'Junior' },
                { value: 'Middle', label: 'Middle' },
                { value: 'Senior', label: 'Senior' },
                { value: 'Lead', label: 'Lead' },
                { value: 'Head', label: 'Head' },
              ]}
            />
          </Form.Item>
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="salaryMin" label="Зарплата от" style={{ flex: 1 }}>
              <Input type="number" suffix="₽" />
            </Form.Item>
            <Form.Item name="salaryMax" label="Зарплата до" style={{ flex: 1 }}>
              <Input type="number" suffix="₽" />
            </Form.Item>
          </div>
          <Form.Item name="urgency" label="Срочность">
            <Select options={Object.entries(urgencyLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="departmentId" label="Департамент" rules={[{ required: true, message: 'Выберите департамент' }]}>
            <Select
              placeholder="Выберите департамент"
              showSearch
              optionFilterProp="label"
              options={departments.map(d => ({ value: d.id, label: d.name }))}
            />
          </Form.Item>
          <Form.Item name="pipelineId" label="Флоу найма">
            <Select
              placeholder="Выберите флоу"
              allowClear
              showSearch
              optionFilterProp="label"
              options={pipelines.map(p => ({ value: p.id, label: p.name + (p.isDefault ? ' (по умолчанию)' : '') }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
