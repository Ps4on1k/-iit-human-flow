import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tabs, Timeline, Form, Input, Upload, List, Typography, Divider, Select, Row, Col, Modal, message, Space, Tag } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { candidatesApi, pipelinesApi, votingApi, interviewsApi, downloadFile } from '@/services/api';
import { useAuthStore } from '@/store/auth-store';
import api from '@/services/api';

const { Text } = Typography;
const { TextArea } = Input;

const voteLabels: Record<string, string> = { for: 'За', against: 'Против', neutral: 'Нейтрально' };
const voteColors: Record<string, string> = { for: 'success', against: 'error', neutral: 'default' };
const voteIcons: Record<string, string> = { for: '👍', against: '👎', neutral: '😐' };

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [candidate, setCandidate] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [votes, setVotes] = useState<any>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteForm] = Form.useForm();
  const [noteContext, setNoteContext] = useState('general');
  const [editMode, setEditMode] = useState(false);
  const [editForm] = Form.useForm();
  const [voteModal, setVoteModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const isRecruiterOrAdmin = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  const load = async () => {
    if (!id) return;
    try {
      const c = await candidatesApi.get(id);
      setCandidate(c.data);
      setActivityLog(c.data.activityLogs || []);
      if (c.data.vacancy?.pipelineId) {
        try {
          const { data: pipeline } = await pipelinesApi.get(c.data.vacancy.pipelineId);
          setStages(pipeline.stages.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        } catch { loadDefaultStages(); }
      } else { loadDefaultStages(); }
      loadAttachments();
      loadVotes();
      loadUsers();
      loadInterviews();
    } catch {
      message.error('Ошибка загрузки кандидата');
    } finally { setLoading(false); }
  };

  const loadDefaultStages = () => setStages([
    { code: 'new', name: 'Новый', color: 'var(--neutral, #8A94A6)' },
    { code: 'screening', name: 'Скрининг', color: 'var(--blue, #3A8DFF)' },
    { code: 'interview', name: 'Собеседование', color: 'var(--cyan, #42D9C8)' },
    { code: 'offer', name: 'Оффер', color: 'var(--yellow, #FFB020)' },
    { code: 'hired', name: 'Нанят', color: 'var(--green, #21B573)' },
    { code: 'rejected', name: 'Отказ', color: 'var(--red, #E5484D)' },
  ]);

  const loadAttachments = useCallback(async () => {
    if (!id) return;
    try { const { data } = await api.get(`/candidates/${id}/attachments`); setAttachments(data); } catch {}
  }, [id]);

  const loadVotes = useCallback(async () => {
    if (!id) return;
    try { const { data } = await votingApi.getSummary(id); setVotes(data); } catch {}
  }, [id]);

  const loadUsers = useCallback(async () => {
    try { const { data } = await api.get('/users'); setAllUsers(data); } catch {}
  }, []);

  const loadInterviews = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await interviewsApi.list(id);
      setInterviews(data);
    } catch {}
  }, [id]);

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (timelineRef.current) timelineRef.current.scrollLeft = timelineRef.current.scrollWidth; }, [candidate?.status, stages]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await candidatesApi.updateStatus(id, status);
      message.success('Статус обновлён');
      load();
    } catch {
      message.error('Ошибка смены статуса');
    }
  };

  const openEdit = () => {
    editForm.setFieldsValue({
      firstName: candidate.firstName, lastName: candidate.lastName, email: candidate.email,
      phone: candidate.phone, source: candidate.source, currentCompany: candidate.currentCompany,
      experienceYears: candidate.experienceYears,
    });
    setEditMode(true);
  };

  const handleEditSave = async (values: any) => {
    if (!id) return;
    try {
      await candidatesApi.update(id, values);
      message.success('Кандидат обновлён');
      setEditMode(false);
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка сохранения');
    }
  };

  const handleAddNote = async (values: { content: string }) => {
    if (!id) return;
    try {
      await api.post(`/candidates/${id}/notes`, { content: values.content, context: noteContext });
      noteForm.resetFields();
      load();
    } catch {
      message.error('Ошибка добавления заметки');
    }
  };

  const handleUpload = async (info: any, context: string) => {
    if (!id || !info.file) return;
    const formData = new FormData();
    formData.append('file', info.file);
    formData.append('context', context);
    try {
      await api.post(`/candidates/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      loadAttachments();
      load();
    } catch {
      message.error('Ошибка загрузки файла');
    }
  };

  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const response = await downloadFile(attachmentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error('Ошибка скачивания');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    try {
      await api.delete(`/candidates/${id}/notes/${noteId}`);
      load();
    } catch {
      message.error('Ошибка удаления заметки');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    try {
      await api.delete(`/candidates/${id}/attachments/${attachmentId}`);
      loadAttachments();
      load();
    } catch {
      message.error('Ошибка удаления файла');
    }
  };

  const handleVote = async () => {
    if (!id || !selectedVote) return;
    try {
      await votingApi.vote(id, selectedVote);
      message.success('Голос учтён');
      setVoteModal(false);
      setSelectedVote('');
      loadVotes();
      load();
    } catch {
      message.error('Ошибка голосования');
    }
  };

  const handleAddInterviewer = async (userId: string) => {
    if (!id || !userId) return;
    try {
      await api.post('/interviews', {
        candidateId: id,
        interviewerId: userId,
        type: 'SCREENING',
        vacancyId: candidate.vacancyId,
      });
      message.success('Интервьюер добавлен');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleRemoveInterviewer = async (interviewId: string) => {
    try {
      await interviewsApi.remove(interviewId);
      message.success('Интервьюер удалён');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const activityLogItems = activityLog.map((log) => {
    let title = '💬 Заметка';
    let color = 'green';
    if (log.action === 'file_upload') { title = '📎 Файл'; color = 'blue'; }
    else if (log.action === 'vote') { title = '🗳 Голос'; color = 'purple'; }
    else if (log.action === 'status_change') {
      const details = log.details || '';
      let toName = '';
      const textMatch = details.match(/→ «(.+?)»/);
      if (textMatch) {
        toName = textMatch[1];
      } else {
        try {
          const parsed = JSON.parse(details);
          if (parsed.to) {
            const stageMatch = stages.find((s) => s.code === parsed.to);
            toName = stageMatch?.name || parsed.to;
          }
        } catch {}
      }
      title = toName || '🔄 Смена статуса';
      color = 'orange';
    }

    const fileMatch = log.details?.match(/«(.+?)»/);

    return {
      color,
      children: (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{log.user?.firstName} {log.user?.lastName} — {new Date(log.createdAt).toLocaleString('ru')}</Text>
          {log.details && <div style={{ fontSize: 12, color: 'var(--neutral, #8A94A6)', marginTop: 2 }}>{log.details}</div>}
          {log.action === 'file_upload' && fileMatch && (
            <Button type="link" size="small" icon={<DownloadOutlined />}
              onClick={() => {
                const file = attachments.find((a: any) => a.context === log.context);
                if (file) handleDownload(file.id, fileMatch[1]);
              }}
              style={{ padding: 0, marginTop: 4, fontSize: 12 }}>
              Скачать файл
            </Button>
          )}
        </div>
      ),
    };
  });

  if (!candidate) return null;

  const getAttachmentsForContext = (ctx: string) => attachments.filter((a: any) => a.context === ctx);
  const getNotesForContext = (ctx: string) => (candidate.notes || []).filter((n: any) => n.context === ctx);

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
        <List size="small" style={{ marginTop: 8 }} dataSource={files} renderItem={(file: any) => (
          <List.Item actions={[
            <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(file.id, file.originalName)}>Скачать</Button>,
            isRecruiterOrAdmin && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteAttachment(file.id)} />,
          ].filter(Boolean)}>
            <List.Item.Meta avatar={<FileOutlined />} title={file.originalName}
              description={`${(file.size / 1024).toFixed(1)} KB · ${file.uploader?.firstName} ${file.uploader?.lastName}`} />
          </List.Item>
        )} />
      </div>
    );
  };

  const renderLinkifiedText = (text: string): React.ReactNode => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return <>{parts.map((part, i) =>
      urlRegex.test(part) ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part
    )}</>;
  };

  const renderNotes = (ctx: string) => {
    const ctxNotes = getNotesForContext(ctx);
    return (
      <List size="small" dataSource={ctxNotes} renderItem={(note: any) => (
        <List.Item actions={[
          isRecruiterOrAdmin && <Button key="del" type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteNote(note.id)} />,
        ].filter(Boolean)}>
          <List.Item.Meta
            title={<>{note.author?.firstName} {note.author?.lastName} <Text type="secondary">— {new Date(note.createdAt).toLocaleString('ru')}</Text></>}
            description={<span style={{ wordBreak: 'break-word' }}>{renderLinkifiedText(note.content)}</span>}
          />
        </List.Item>
      )} />
    );
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Назад</Button>

      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Typography.Title level={4} style={{ margin: 0 }}>{candidate.firstName} {candidate.lastName}</Typography.Title>
            {isRecruiterOrAdmin && <Button type="text" icon={<EditOutlined />} size="small" onClick={openEdit} />}
            {/* Vote summary pills near name */}
            {votes && votes.total > 0 && (
              <Space size={4}>
                <Tag color="success" style={{ borderRadius: 8, fontWeight: 600 }}>👍 {votes.for}</Tag>
                <Tag color="error" style={{ borderRadius: 8, fontWeight: 600 }}>👎 {votes.against}</Tag>
                {votes.neutral > 0 && <Tag style={{ borderRadius: 8, fontWeight: 600 }}>😐 {votes.neutral}</Tag>}
              </Space>
            )}
          </div>
          <Select style={{ width: 200 }} value={candidate.status} onChange={handleStatusChange}
            options={stages.map((s) => ({ value: s.code, label: s.name }))} />
        </div>

        {candidate.email && <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{candidate.email}</Text>}

        {/* Stylish Horizontal Timeline */}
        <div ref={timelineRef} style={{
          display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 12, marginBottom: 16,
          borderBottom: '1px solid var(--ant-color-border-secondary, #E8EBF0)', scrollBehavior: 'smooth',
        }}>
          {stages.map((stage, idx) => {
            const isActive = stage.code === candidate.status;
            const isPast = stages.findIndex((s) => s.code === candidate.status) > idx;
            return (
              <div key={stage.code} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '8px 20px', borderRadius: 16,
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  background: isActive ? stage.color : isPast ? `${stage.color}20` : 'transparent',
                  color: isActive ? '#fff' : isPast ? stage.color : 'var(--secondary, #AEB7C4)',
                  border: `1.5px solid ${isActive ? stage.color : isPast ? `${stage.color}40` : 'var(--ant-color-border-secondary, #E8EBF0)'}`,
                  whiteSpace: 'nowrap', transition: 'all 0.25s ease',
                  cursor: 'default', boxShadow: isActive ? `0 2px 8px ${stage.color}40` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                  {stage.name}
                </div>
                {idx < stages.length - 1 && (
                  <div style={{
                    width: 32, height: 2,
                    background: isPast ? stage.color : 'var(--ant-color-border-secondary, #E8EBF0)',
                    flexShrink: 0, borderRadius: 1,
                    opacity: isPast ? 0.8 : 0.4,
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
          <Descriptions.Item label="Телефон">{candidate.phone || '—'}</Descriptions.Item>
          <Descriptions.Item label="Источник">{candidate.source}</Descriptions.Item>
          <Descriptions.Item label="Компания">{candidate.currentCompany || '—'}</Descriptions.Item>
          <Descriptions.Item label="Опыт">{candidate.experienceYears ? `${candidate.experienceYears} лет` : '—'}</Descriptions.Item>
          <Descriptions.Item label="Вакансия"><a onClick={() => navigate(`/vacancies/${candidate.vacancyId}`)}>{candidate.vacancy?.title}</a></Descriptions.Item>
          <Descriptions.Item label="Создатель">{candidate.creator?.firstName} {candidate.creator?.lastName}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="timeline" style={{ marginTop: 16 }} items={[
        {
          key: 'timeline', label: 'История',
          children: <Card>{activityLogItems.length > 0 ? <Timeline items={activityLogItems} /> : <Text type="secondary">Пока нет действий</Text>}</Card>,
        },
        {
          key: 'interviews', label: 'Собеседования',
          children: (
            <Card>
              {/* Interviewer pills */}
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Интервьюеры</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {interviews.map((interview: any) => (
                    <Tag key={interview.id} closable={isRecruiterOrAdmin} onClose={() => handleRemoveInterviewer(interview.id)}
                      color="#3A8DFF" style={{ borderRadius: 16, padding: '4px 12px', fontWeight: 500, fontSize: 12 }}>
                      {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                    </Tag>
                  ))}
                  {isRecruiterOrAdmin && (
                    <Select
                      style={{ minWidth: 300 }} placeholder="Добавить интервьюера"
                      showSearch optionFilterProp="label"
                      onChange={handleAddInterviewer}
                      fieldNames={{ label: 'label', value: 'value' }}
                      options={allUsers
                        .filter((u) => !interviews.some((i) => i.interviewer?.id === u.id))
                        .map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.role})` }))}
                    />
                  )}
                </div>
              </div>

              {/* Voting section */}
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>Голосование</Text>
                <Button size="small" onClick={() => setVoteModal(true)}>Проголосовать</Button>
              </div>
              {votes && votes.total > 0 ? (
                <List size="small" dataSource={votes.votes} renderItem={(v: any) => (
                  <List.Item>
                    <Tag color={voteColors[v.vote]} style={{ borderRadius: 8 }}>{voteIcons[v.vote]} {voteLabels[v.vote]}</Tag>
                    <Text>{v.user?.firstName} {v.user?.lastName}</Text>
                  </List.Item>
                )} />
              ) : (
                <Text type="secondary">Пока нет голосов</Text>
              )}

              <Divider />
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
          key: 'background', label: 'Проверка СБ',
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
          key: 'offers', label: 'Офферы',
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
      ]} />

      {/* Edit modal */}
      <Modal title="Редактировать кандидата" open={editMode} onCancel={() => setEditMode(false)} onOk={() => editForm.submit()} okText="Сохранить" cancelText="Отмена">
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="firstName" label="Имя" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="lastName" label="Фамилия" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="email" label="Email"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="phone" label="Телефон"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="source" label="Источник"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="experienceYears" label="Опыт (лет)"><Input type="number" /></Form.Item></Col>
          </Row>
          <Form.Item name="currentCompany" label="Компания"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Vote modal */}
      <Modal title="Проголосовать за кандидата" open={voteModal} onCancel={() => { setVoteModal(false); setSelectedVote(''); }}
        onOk={handleVote} okText="Отправить" cancelText="Отмена">
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '24px 0' }}>
          {Object.entries(voteLabels).map(([value, label]) => (
            <Button key={value} size="large" type={selectedVote === value ? 'primary' : 'default'}
              onClick={() => setSelectedVote(value)}
              style={{ borderColor: selectedVote === value ? undefined : 'var(--ant-color-border, #D8DCE3)', borderRadius: 8 }}>
              {voteIcons[value]} {label}
            </Button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
