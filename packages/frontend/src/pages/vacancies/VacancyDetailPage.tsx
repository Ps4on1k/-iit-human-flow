import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Badge, Modal, Form, Input, InputNumber, Select, Row, Col, Collapse, Table, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import { vacanciesApi, candidatesApi, pipelinesApi, departmentsApi, tagsApi } from '@/services/api';

const { Text } = Typography;

const vacancyStatusLabels: Record<string, string> = {
  DRAFT: 'Черновик', OPEN: 'Открыта', ON_HOLD: 'Приостановлена', CLOSED: 'Закрыта', CANCELLED: 'Отменена',
};

const workFormatLabels: Record<string, string> = {
  OFFICE: 'Офис',
  REMOTE: 'Удалённо',
  HYBRID: 'Гибрид',
};

export function VacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vacancy, setVacancy] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editForm] = Form.useForm();
  const [tagModal, setTagModal] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const load = async () => {
    if (!id) return;
    try {
      const [v, c] = await Promise.all([vacanciesApi.get(id), candidatesApi.list(id)]);
      setVacancy(v.data);
      setCandidates(c.data);
      setSelectedTagIds((v.data.tags || []).map((t: any) => t.tag?.id).filter(Boolean));
      if (v.data.pipelineId) {
        try {
          const { data: pipeline } = await pipelinesApi.get(v.data.pipelineId);
          setStages(pipeline.stages.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        } catch { loadDefaultStages(); }
      } else { loadDefaultStages(); }
    } finally { setLoading(false); }
  };

  const loadDefaultStages = () => setStages([
    { code: 'new', name: 'Новый', color: '#8A94A6' },
    { code: 'screening', name: 'Скрининг', color: '#3A8DFF' },
    { code: 'interview', name: 'Собеседование', color: '#42D9C8' },
    { code: 'offer', name: 'Оффер', color: '#FFB020' },
    { code: 'hired', name: 'Нанят', color: '#21B573' },
    { code: 'rejected', name: 'Отказ', color: '#E5484D' },
  ]);

  useEffect(() => {
    load();
    departmentsApi.list().then((r) => setDepartments(r.data)).catch(() => {});
    tagsApi.list().then((r) => setAllTags(r.data)).catch(() => {});
  }, [id]);

  const openEdit = () => {
    editForm.setFieldsValue({
      title: vacancy.title, description: vacancy.description, requirements: vacancy.requirements,
      location: vacancy.location, grade: vacancy.grade,
      salaryMin: vacancy.salaryMin, salaryMax: vacancy.salaryMax,
      departmentId: vacancy.departmentId, urgency: vacancy.urgency, headcount: vacancy.headcount,
    });
    setEditMode(true);
  };

  const handleEditSave = async (values: any) => {
    if (!id) return;
    try {
      await vacanciesApi.update(id, values);
      message.success('Вакансия обновлена');
      setEditMode(false);
      load();
    } catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  const handleSaveTags = async () => {
    if (!id) return;
    try {
      await vacanciesApi.setTags(id, selectedTagIds);
      message.success('Теги сохранены');
      setTagModal(false);
      load();
    } catch (err: any) { message.error(err.response?.data?.message || 'Ошибка'); }
  };

  if (!vacancy) return null;

  const salary = (() => {
    if (!vacancy.salaryMin && !vacancy.salaryMax) return '—';
    const min = vacancy.salaryMin ? Number(vacancy.salaryMin).toLocaleString('ru-RU') : '';
    const max = vacancy.salaryMax ? Number(vacancy.salaryMax).toLocaleString('ru-RU') : '';
    return `${min}${min && max ? ' — ' : ''}${max} ₽`;
  })();

  const getCandidatesByStage = (code: string) => candidates.filter((c) => c.status === code);

  const candidateColumns = [
    { title: 'Имя', key: 'name', render: (_: any, r: any) => <a onClick={() => navigate(`/candidates/${r.id}`)}>{r.firstName} {r.lastName}</a> },
    { title: 'Email', dataIndex: 'email', key: 'email', render: (v: string) => v || '—' },
    { title: 'Источник', dataIndex: 'source', key: 'source', render: (v: string) => v || '—' },
    { title: 'Опыт', dataIndex: 'experienceYears', key: 'exp', render: (v: number) => v ? `${v} лет` : '—' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/vacancies')} style={{ marginBottom: 16 }}>Назад</Button>

      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>{vacancy.title}</Typography.Title>
            <Button type="text" icon={<EditOutlined />} size="small" onClick={openEdit} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Select style={{ width: 160 }} value={vacancy.status}
              onChange={async (val) => { await vacanciesApi.updateStatus(vacancy.id, val); load(); }}
              options={Object.entries(vacancyStatusLabels).map(([v, l]) => ({ value: v, label: l }))} />
            <Button icon={<TagsOutlined />} onClick={() => setTagModal(true)}>Теги</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/vacancies/${id}`)}>Добавить</Button>
          </div>
        </div>

        {vacancy.tags?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {vacancy.tags.map((vt: any) => (
              <Tag key={vt.tag?.id} color={vt.tag?.color || '#3A8DFF'} style={{ borderRadius: 2 }}>{vt.tag?.name}</Tag>
            ))}
          </div>
        )}

        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Департамент">{vacancy.department?.name}</Descriptions.Item>
          <Descriptions.Item label="Формат работы">{workFormatLabels[vacancy.location] || vacancy.location}</Descriptions.Item>
          <Descriptions.Item label="Грейд">{vacancy.grade || '—'}</Descriptions.Item>
          <Descriptions.Item label="Зарплата">{salary}</Descriptions.Item>
          <Descriptions.Item label="Штат">{vacancy.headcount}</Descriptions.Item>
          <Descriptions.Item label="Флоу">{vacancy.pipeline?.name || 'Стандартный'}</Descriptions.Item>
          <Descriptions.Item label="Создатель">{vacancy.creator?.firstName} {vacancy.creator?.lastName}</Descriptions.Item>
        </Descriptions>

        <Descriptions column={1} style={{ marginTop: 16 }}>
          <Descriptions.Item label="Описание">{vacancy.description}</Descriptions.Item>
          {vacancy.requirements && <Descriptions.Item label="Требования">{vacancy.requirements}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* Vertical Pipeline / Флоу найма */}
      <Card title={`Флоу найма (${candidates.length} кандидатов)`} style={{ marginTop: 16 }}>
        <Collapse
          defaultActiveKey={stages.filter((s) => candidates.some((c) => c.status === s.code)).map((s) => s.code)}
          items={stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.code);
            return {
              key: stage.code,
              label: (
                <span>
                  <Badge count={stageCandidates.length} style={{ backgroundColor: stage.color || '#3A8DFF' }} />
                  <span style={{ marginLeft: 8 }}>{stage.name}</span>
                </span>
              ),
              children: stageCandidates.length > 0 ? (
                <Table
                  dataSource={stageCandidates}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  onRow={(record) => ({ onClick: () => navigate(`/candidates/${record.id}`), style: { cursor: 'pointer' } })}
                  columns={candidateColumns}
                />
              ) : (
                <Text type="secondary">Нет кандидатов на этом этапе</Text>
              ),
            };
          })}
        />
      </Card>

      {/* Edit modal */}
      <Modal title="Редактировать вакансию" open={editMode} onCancel={() => setEditMode(false)} onOk={() => editForm.submit()} okText="Сохранить" cancelText="Отмена">
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} style={{ marginTop: 16 }}>
          <Form.Item name="title" label="Название" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="requirements" label="Требования"><Input.TextArea rows={2} /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="location" label="Формат работы" rules={[{ required: true }]}>
              <Select options={Object.entries(workFormatLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Form.Item></Col>
            <Col span={12}><Form.Item name="grade" label="Грейд">
              <Select options={['Junior', 'Middle', 'Senior', 'Lead', 'Head'].map((g) => ({ value: g, label: g }))} />
            </Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="salaryMin" label="Зарплата от"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="salaryMax" label="Зарплата до"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="departmentId" label="Департамент" rules={[{ required: true }]}>
            <Select options={departments.map((d) => ({ value: d.id, label: d.name }))} />
          </Form.Item>
          <Form.Item name="urgency" label="Срочность">
            <Select options={[
              { value: 'NORMAL', label: 'Обычная' }, { value: 'URGENT', label: 'Срочно' },
              { value: 'MASS_HIRE', label: 'Массовый найм' }, { value: 'REPLACEMENT', label: 'Замена' },
              { value: 'NEW_POSITION', label: 'Новая позиция' },
            ]} />
          </Form.Item>
          <Form.Item name="headcount" label="Штат"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      {/* Tags modal */}
      <Modal title="Теги вакансии" open={tagModal} onCancel={() => setTagModal(false)} onOk={handleSaveTags} okText="Сохранить" cancelText="Отмена">
        <Select mode="multiple" style={{ width: '100%' }} value={selectedTagIds} onChange={setSelectedTagIds}
          placeholder="Выберите теги" options={allTags.map((t) => ({ value: t.id, label: t.name }))} />
      </Modal>
    </div>
  );
}
