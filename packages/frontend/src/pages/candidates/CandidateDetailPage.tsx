import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Descriptions, Button, Tabs, Timeline, Form, Input, Upload, List, Typography, Divider, Select, message } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { candidatesApi, pipelinesApi } from '@/services/api';
import api from '@/services/api';

const { Text } = Typography;
const { TextArea } = Input;

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteForm] = Form.useForm();
  const [noteContext, setNoteContext] = useState('general');

  const load = async () => {
    if (!id) return;
    try {
      const c = await candidatesApi.get(id);
      setCandidate(c.data);
      setNotes(c.data.notes || []);
      setActivityLog(c.data.activityLogs || []);

      if (c.data.vacancy?.pipelineId) {
        try {
          const { data: pipeline } = await pipelinesApi.get(c.data.vacancy.pipelineId);
          setStages(pipeline.stages.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        } catch { loadDefaultStages(); }
      } else { loadDefaultStages(); }

      loadAttachments();
    } finally { setLoading(false); }
  };

  const loadDefaultStages = () => {
    setStages([
      { code: 'new', name: 'Новый', color: '#8A94A6' },
      { code: 'screening', name: 'Скрининг', color: '#3A8DFF' },
      { code: 'interview', name: 'Собеседование', color: '#42D9C8' },
      { code: 'offer', name: 'Оффер', color: '#FFB020' },
      { code: 'hired', name: 'Нанят', color: '#21B573' },
      { code: 'rejected', name: 'Отказ', color: '#E5484D' },
    ]);
  };

  const loadAttachments = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await api.get(`/candidates/${id}/attachments`);
      setAttachments(data);
    } catch {}
  }, [id]);

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    await candidatesApi.updateStatus(id, status);
    message.success('Статус обновлён');
    load();
  };

  const handleAddNote = async (values: { content: string }) => {
    if (!id) return;
    await api.post(`/candidates/${id}/notes`, { content: values.content, context: noteContext });
    noteForm.resetFields();
    load();
  };

  const handleUpload = async (info: any, context: string) => {
    if (!id || !info.file) return;
    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('context', context);
    await api.post(`/candidates/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    loadAttachments();
    load();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    await api.delete(`/candidates/${id}/notes/${noteId}`);
    load();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    await api.delete(`/candidates/${id}/attachments/${attachmentId}`);
    loadAttachments();
    load();
  };

  if (!candidate) return null;

  const currentStage = stages.find((s) => s.code === candidate.status);
  const lastStatusChange = candidate.statusHistory?.[0];

  const getAttachmentsForContext = (ctx: string) => {
    if (ctx === 'general') return attachments.filter((a) => !a.interviewId && !a.backgroundCheckId && !a.offerId);
    if (ctx === 'interview') return attachments.filter((a) => a.interviewId);
    if (ctx === 'background_check') return attachments.filter((a) => a.backgroundCheckId);
    if (ctx === 'offer') return attachments.filter((a) => a.offerId);
    return [];
  };

  const getNotesForContext = (ctx: string) => notes.filter((n) => n.context === ctx);

  const renderNoteForm = (ctx: string) => (
    <Form form={noteForm} onFinish={handleAddNote} layout="inline" style={{ marginBottom: 16 }}>
      <Form.Item name="content" rules={[{ required: true }]} style={{ flex: 1 }}>
        <TextArea rows={2} placeholder="Добавить заметку..." />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" onClick={() => setNoteContext(ctx)}>Добавить</Button>
      </Form.Item>
    </Form>
  );

  const renderAttachments = (ctx: string) => {
    const files = getAttachmentsForContext(ctx);
    return (
      <div>
        <Upload customRequest={(info) => handleUpload(info, ctx)} showUploadList={false}>
          <Button icon={<UploadOutlined />}>Загрузить файл</Button>
        </Upload>
        <List
          size="small"
          style={{ marginTop: 8 }}
          dataSource={files}
          renderItem={(file: any) => (
            <List.Item actions={[
              <Button type="text" danger size="small" icon={<DeleteOutlined />}
                onClick={() => handleDeleteAttachment(file.id)} />,
            ]}>
              <List.Item.Meta
                avatar={<FileOutlined />}
                title={file.originalName}
                description={`${(file.size / 1024).toFixed(1)} KB · ${file.uploader?.firstName} ${file.uploader?.lastName}`}
              />
            </List.Item>
          )}
        />
      </div>
    );
  };

  const renderNotes = (ctx: string) => {
    const ctxNotes = getNotesForContext(ctx);
    return (
      <List
        size="small"
        dataSource={ctxNotes}
        renderItem={(note: any) => (
          <List.Item actions={[
            <Button type="text" danger size="small" icon={<DeleteOutlined />}
              onClick={() => handleDeleteNote(note.id)} />,
          ]}>
            <List.Item.Meta
              title={<>{note.author?.firstName} {note.author?.lastName} <Text type="secondary">— {new Date(note.createdAt).toLocaleString('ru')}</Text></>}
              description={note.content}
            />
          </List.Item>
        )}
      />
    );
  };

  // Timeline — only file uploads and notes (no status changes as separate items)
  const timelineItems = activityLog
    .filter((log) => log.action !== 'status_change')
    .map((log) => ({
      color: log.action === 'file_upload' ? 'blue' : 'green',
      children: (
        <div>
          <Text strong>{log.action === 'file_upload' ? '📎 Загружен файл' : '💬 Заметка'}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {log.user?.firstName} {log.user?.lastName} — {new Date(log.createdAt).toLocaleString('ru')}
          </Text>
          {log.details && <div style={{ fontSize: 12, color: '#8A94A6', marginTop: 2 }}>{log.details}</div>}
        </div>
      ),
    }));

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Назад
      </Button>

      <Card loading={loading}>
        {/* Status card with meta info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>{candidate.firstName} {candidate.lastName}</Typography.Title>
            {candidate.email && <Text type="secondary">{candidate.email}</Text>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {currentStage && <Tag color={currentStage.color || 'default'}>{currentStage.name}</Tag>}
            <Select
              style={{ width: 200 }}
              value={candidate.status}
              onChange={handleStatusChange}
              options={stages.map((s) => ({ value: s.code, label: s.name }))}
            />
          </div>
        </div>

        {lastStatusChange && (
          <div style={{ padding: '8px 12px', borderRadius: 2, background: 'var(--color-fill-secondary, #F4F5F7)', marginBottom: 16, fontSize: 12, color: '#8A94A6' }}>
            Последняя смена статуса: <Text strong>{stages.find((s) => s.code === lastStatusChange.toStatus)?.name || lastStatusChange.toStatus}</Text>
            {' — '}{lastStatusChange.changer?.firstName} {lastStatusChange.changer?.lastName}, {new Date(lastStatusChange.createdAt).toLocaleString('ru')}
          </div>
        )}

        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Телефон">{candidate.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Источник">{candidate.source}</Descriptions.Item>
          <Descriptions.Item label="Компания">{candidate.currentCompany || '—'}</Descriptions.Item>
          <Descriptions.Item label="Опыт">{candidate.experienceYears ? `${candidate.experienceYears} лет` : '—'}</Descriptions.Item>
          <Descriptions.Item label="Вакансия">
            <a onClick={() => navigate(`/vacancies/${candidate.vacancyId}`)}>{candidate.vacancy?.title}</a>
          </Descriptions.Item>
          <Descriptions.Item label="Создатель">{candidate.creator?.firstName} {candidate.creator?.lastName}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs
        defaultActiveKey="timeline"
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'timeline',
            label: 'История',
            children: (
              <Card>
                {timelineItems.length > 0 ? <Timeline items={timelineItems} /> : <Text type="secondary">Пока нет действий</Text>}
              </Card>
            ),
          },
          {
            key: 'interviews',
            label: 'Собеседования',
            children: (
              <Card>
                <Typography.Text strong>Файлы</Typography.Text>
                {renderAttachments('interview')}
                <Divider />
                <Typography.Text strong>Заметки</Typography.Text>
                {renderNoteForm('interview')}
                {renderNotes('interview')}
              </Card>
            ),
          },
          {
            key: 'background',
            label: 'Проверка СБ',
            children: (
              <Card>
                <Typography.Text strong>Файлы</Typography.Text>
                {renderAttachments('background_check')}
                <Divider />
                <Typography.Text strong>Заметки</Typography.Text>
                {renderNoteForm('background_check')}
                {renderNotes('background_check')}
              </Card>
            ),
          },
          {
            key: 'offers',
            label: 'Офферы',
            children: (
              <Card>
                <Typography.Text strong>Файлы</Typography.Text>
                {renderAttachments('offer')}
                <Divider />
                <Typography.Text strong>Заметки</Typography.Text>
                {renderNoteForm('offer')}
                {renderNotes('offer')}
              </Card>
            ),
          },
          {
            key: 'notes',
            label: `Заметки (${notes.length})`,
            children: (
              <Card>
                {renderNoteForm('general')}
                <Divider />
                {renderAttachments('general')}
                <Divider />
                {renderNotes('general')}
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
