import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, List, Badge, Modal, Form, Input, InputNumber, Select, Row, Col, message, Typography } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { vacanciesApi, candidatesApi, pipelinesApi } from '@/services/api';

const vacancyStatusLabels: Record<string, string> = {
  DRAFT: 'Черновик', OPEN: 'Открыта', ON_HOLD: 'Приостановлена', CLOSED: 'Закрыта', CANCELLED: 'Отменена',
};

const sourceLabels: Record<string, string> = {
  MANUAL: 'Ручное добавление',
  RESUME_UPLOAD: 'Загрузка резюме',
  JOB_BOARD: 'Биржа вакансий',
  REFERRAL: 'Рекомендация',
  HEADHUNTER: 'Хедхантер',
};

export function VacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    if (!id) return;
    try {
      const [v, c] = await Promise.all([
        vacanciesApi.get(id),
        candidatesApi.list(id),
      ]);
      setVacancy(v.data);
      setCandidates(c.data);
      const pipelineId = v.data.pipelineId;
      if (pipelineId) {
        try {
          const { data: pipeline } = await pipelinesApi.get(pipelineId);
          setStages(pipeline.stages.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        } catch {}
      } else {
        setStages([
          { code: 'new', name: 'Новый', color: '#8A94A6' },
          { code: 'screening', name: 'Скрининг', color: '#3A8DFF' },
          { code: 'interview', name: 'Собеседование', color: '#42D9C8' },
          { code: 'offer', name: 'Оффер', color: '#FFB020' },
          { code: 'hired', name: 'Нанят', color: '#21B573' },
          { code: 'rejected', name: 'Отказ', color: '#E5484D' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddCandidate = async (values: any) => {
    try {
      await candidatesApi.create({ ...values, vacancyId: id });
      setModalOpen(false);
      form.resetFields();
      message.success('Кандидат добавлен');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  if (!vacancy) return null;

  const salary = (() => {
    if (!vacancy.salaryMin && !vacancy.salaryMax) return '—';
    const min = vacancy.salaryMin ? `${Number(vacancy.salaryMin).toLocaleString('ru-RU')}` : '';
    const max = vacancy.salaryMax ? `${Number(vacancy.salaryMax).toLocaleString('ru-RU')}` : '';
    return `${min}${min && max ? ' — ' : ''}${max} ₽`;
  })();

  const getCandidatesByStage = (stageCode: string) =>
    candidates.filter((c: any) => c.status === stageCode);

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vacancies')} style={{ marginBottom: 16 }}>
        Назад к вакансиям
      </Button>

      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{vacancy.title}</Typography.Title>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select
              style={{ width: 160 }}
              value={vacancy.status}
              onChange={async (val) => { await vacanciesApi.updateStatus(vacancy.id, val); load(); }}
              options={Object.entries(vacancyStatusLabels).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>
              Добавить кандидата
            </Button>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Департамент">{vacancy.department?.name}</Descriptions.Item>
          <Descriptions.Item label="Город">{vacancy.location}</Descriptions.Item>
          <Descriptions.Item label="Грейд">{vacancy.grade || '—'}</Descriptions.Item>
          <Descriptions.Item label="Зарплата">{salary}</Descriptions.Item>
          <Descriptions.Item label="Штат">{vacancy.headcount}</Descriptions.Item>
          <Descriptions.Item label="Флоу">{vacancy.pipeline?.name || 'Стандартный'}</Descriptions.Item>
          <Descriptions.Item label="Создатель">{vacancy.creator ? `${vacancy.creator.firstName} ${vacancy.creator.lastName}` : '—'}</Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 16 }}>
          <Descriptions column={1}>
            <Descriptions.Item label="Описание">{vacancy.description}</Descriptions.Item>
            {vacancy.requirements && <Descriptions.Item label="Требования">{vacancy.requirements}</Descriptions.Item>}
          </Descriptions>
        </div>
      </Card>

      <Card
        title="Канбан-доска кандидатов"
        style={{ marginTop: 16 }}
        extra={<Button icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>Добавить</Button>}
      >
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.code);
            return (
              <div key={stage.code} style={{ minWidth: 220, flex: '0 0 220px', borderRadius: 2, padding: 12, border: '1px solid #D8DCE3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color || '#3A8DFF' }} />
                  <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '0.04em' }}>{stage.name}</span>
                  <Badge count={stageCandidates.length} size="small" />
                </div>
                <List
                  size="small"
                  dataSource={stageCandidates}
                  renderItem={(candidate: any) => (
                    <List.Item
                      style={{ cursor: 'pointer', padding: '8px', borderRadius: 2, marginBottom: 4, border: '1px solid #EEF1F4' }}
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{candidate.firstName} {candidate.lastName}</div>
                        {candidate.email && <div style={{ fontSize: 11, color: '#8A94A6' }}>{candidate.email}</div>}
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Modal
        title="Новый кандидат"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Добавить"
        cancelText="Отмена"
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleAddCandidate} initialValues={{ source: 'MANUAL' }}>
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="source" label="Источник">
                <Select options={Object.entries(sourceLabels).map(([v, l]) => ({ value: v, label: l }))} />
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
