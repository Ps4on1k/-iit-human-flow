import { useEffect, useState } from 'react';
import { Table, Tag, Select, Row, Col, Button, Modal, Form, Input, InputNumber, message, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { candidatesApi, vacanciesApi, sourcesApi } from '@/services/api';

const statusLabels: Record<string, string> = {
  new: 'Новый',
  screening: 'Скрининг',
  interview: 'Собеседование',
  tech_interview: 'Тех. интервью',
  offer: 'Оффер',
  hired: 'Нанят',
  rejected: 'Отказ',
  reviewed: 'Резюме просмотрено',
  test_task: 'Тестовое задание',
  manager_interview: 'Интервью с рук.',
};

const statusColors: Record<string, string> = {
  new: 'default',
  screening: 'processing',
  interview: 'blue',
  tech_interview: 'cyan',
  offer: 'purple',
  hired: 'success',
  rejected: 'error',
  reviewed: 'geekblue',
  test_task: 'warning',
  manager_interview: 'cyan',
};

const allStatuses = Object.keys(statusLabels);

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [sources, setSources] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadVacancies = async () => {
    try {
      const { data } = await vacanciesApi.list();
      setVacancies(data);
    } catch {}
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      if (selectedVacancy) {
        const { data } = await candidatesApi.list(selectedVacancy, selectedStatus);
        setCandidates(data);
      } else {
        const results: any[] = [];
        for (const v of vacancies) {
          try {
            const { data } = await candidatesApi.list(v.id, selectedStatus);
            results.push(...data.map((c: any) => ({ ...c, vacancyTitle: v.title })));
          } catch {}
        }
        setCandidates(results);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVacancies();
    sourcesApi.list().then(r => setSources(r.data)).catch(() => {});
  }, []);
  useEffect(() => { if (vacancies.length > 0) loadCandidates(); }, [vacancies, selectedVacancy, selectedStatus]);

  const handleCreate = async (values: any) => {
    try {
      await candidatesApi.create(values);
      setModalOpen(false);
      form.resetFields();
      message.success('Кандидат добавлен');
      loadCandidates();
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
          {record.email && <div style={{ fontSize: 12, color: 'var(--neutral, #8A94A6)' }}>{record.email}</div>}
        </div>
      ),
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '—',
    },
    {
      title: 'Вакансия',
      key: 'vacancy',
      render: (_: any, record: any) => record.vacancy?.title || record.vacancyTitle || '—',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'} style={{ borderRadius: 2, fontWeight: 600, fontSize: 10 }}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source',
      render: (text: string) => text || '—',
    },
    {
      title: 'Опыт',
      dataIndex: 'experienceYears',
      key: 'experience',
      render: (years: number) => years ? `${years} лет` : '—',
    },
    {
      title: 'Дата',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru'),
    },
  ];

  return (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              УПРАВЛЕНИЕ
            </Typography.Text>
            <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Кандидаты</Typography.Title>
          </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
          Добавить кандидата
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Фильтр по вакансии"
            allowClear
            value={selectedVacancy}
            onChange={setSelectedVacancy}
            options={vacancies.map((v) => ({ value: v.id, label: v.title }))}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Фильтр по статусу"
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={allStatuses.map((s) => ({ value: s, label: statusLabels[s] }))}
          />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={candidates}
        rowKey="id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => navigate(`/candidates/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title="Новый кандидат"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Добавить"
        cancelText="Отмена"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ source: 'MANUAL' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Имя" rules={[{ required: true, message: 'Введите имя' }]}>
                <Input placeholder="Иван" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Фамилия" rules={[{ required: true, message: 'Введите фамилию' }]}>
                <Input placeholder="Иванов" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="ivanov@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Телефон">
                <Input placeholder="+7 (999) 123-45-67" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="vacancyId" label="Вакансия" rules={[{ required: true, message: 'Выберите вакансию' }]}>
            <Select
              placeholder="Выберите вакансию"
              showSearch
              optionFilterProp="label"
              options={vacancies.map(v => ({ value: v.id, label: v.title }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
          <Form.Item name="source" label="Источник">
            <Select
              showSearch
              optionFilterProp="label"
              options={sources.map((s: any) => ({ value: s.name, label: s.name }))}
              placeholder="Выберите источник"
            />
          </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="experienceYears" label="Опыт (лет)">
                <InputNumber min={0} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="currentCompany" label="Текущая компания">
            <Input placeholder="ООО «Компания»" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
