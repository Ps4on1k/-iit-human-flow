import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tabs, Timeline, Form, Input, Upload, List, Typography, Divider, Select, Row, Col, Modal, message, Space, Tag } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { candidatesApi, pipelinesApi, votingApi, downloadFile } from '@/services/api';
import api from '@/services/api';

const { Text } = Typography;
const { TextArea } = Input;

const voteLabels: Record<string, string> = { for: 'За', against: 'Против', neutral: 'Нейтрально' };
const voteColors: Record<string, string> = { for: 'success', against: 'error', neutral: 'default' };
const voteIcons: Record<string, string> = { for: '👍', against: '👎', neutral: '😐' };

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [votes, setVotes] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteForm] = Form.useForm();
  const [noteContext, setNoteContext] = useState('general');
  const [editMode, setEditMode] = useState(false);
  const [editForm] = Form.useForm();
  const [voteModal, setVoteModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string>('');
  const timelineRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (timelineRef.current) timelineRef.current.scrollLeft = timelineRef.current.scrollWidth; }, [candidate?.status, stages]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    await candidatesApi.updateStatus(id, status);
    message.success('Статус обновлён');
    load();
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
    await candidatesApi.update(id, values);
    message.success('Кандидат обновлён');
    setEditMode(false);
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
    await api.post(`/candidates/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    loadAttachments();
    load();
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
    await api.delete(`/candidates/${id}/notes/${noteId}`);
    load();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    await api.delete(`/candidates/${id}/attachments/${attachmentId}`);
    loadAttachments();
    load();
  };

  const handleVote = async () => {
    if (!id || !selectedVote) return;
    await votingApi.vote(id, selectedVote);
    message.success('Голос учтён');
    setVoteModal(false);
    setSelectedVote('');
    loadVotes();
    load();
  };

  const handleAddInterviewer = async (userId: string) => {
    if (!id) return;
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

  const activityLogItems = activityLog.map((log) => {
    let title = '💬 Заметка';
    let color = 'green';
    if (log.action === 'file_upload') { title = '📎 Файл'; color = 'blue'; }
    else if (log.action === 'vote') { title = '🗳 Голос'; color = 'purple'; }
    else if (log.action === 'status_change') {
      const details = log.details || '';
      let toName = '';
      // Try new format: Статус изменён: «old» → «new»
      const textMatch = details.match(/→ «(.+?)»/);
      if (textMatch) {
        toName = textMatch[1];
      } else {
        // Try old JSON format: {"from":"code","to":"code"}
        try {
          const parsed = JSON.parse(details);
          if (parsed.to) {
            // Resolve code to name
            const stageMatch = stages.find((s) => s.code === parsed.to);
            toName = stageMatch?.name || parsed.to;
          }
        } catch {}
      }
      title = toName || '🔄 Смена статуса';
      color = 'orange';
    }

    // Parse file name from details for file_upload entries
    const fileMatch = log.details?.match(/«(.+?)»/);

    return {
      color,
      children: (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{log.user?.firstName} {log.user?.lastName} — {new Date(log.createdAt).toLocaleString('ru')}</Text>
          {log.details && <div style={{ fontSize: 12, color: '#8A94A6', marginTop: 2 }}>{log.details}</div>}
          {log.action === 'file_upload' && fileMatch && (
            <Button type="link" size="small" icon={<DownloadOutlined />}
              onClick={() => {
                // Find the most recent attachment matching this context
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

  const getAttachmentsForContext = (ctx: string) => attachments.filter((a) => a.context === ctx);
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
            <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteAttachment(file.id)} />,
          ]}>
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
      <List
        size="small"
        dataSource={ctxNotes}
        renderItem={(note: any) => {
          const authorName = `${note.author?.firstName} ${note.author?.lastName}`;
          const dateStr = new Date(note.createdAt).toLocaleString('ru');
          return (
            <List.Item
              actions={[
                <Button
                  key="del"
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteNote(note.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={<>{authorName} <Text type="secondary">— {dateStr}</Text></>}
                description={<span style={{ wordBreak: 'break-word' }}>{renderLinkifiedText(note.content)}</span>}
              />
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>Назад</Button>

      <Card loading={loading}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Title level={4} style={{ margin: 0 }}>{candidate.firstName} {candidate.lastName}</Typography.Title>
            <Button type="text" icon={<EditOutlined />} size="small" onClick={openEdit} />
          </div>
          <Select style={{ width: 200 }} value={candidate.status} onChange={handleStatusChange}
            options={stages.map((s) => ({ value: s.code, label: s.name }))} />
        </div>

        {candidate.email && <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>{candidate.email}</Text>}

        {/* Vote summary */}
        {votes && votes.total > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
            <Tag color="success" style={{ borderRadius: 2 }}>👍 За: {votes.for}</Tag>
            <Tag color="error" style={{ borderRadius: 2 }}>👎 Против: {votes.against}</Tag>
            <Tag style={{ borderRadius: 2 }}>😐 Нейтрально: {votes.neutral}</Tag>
            <Button size="small" onClick={() => setVoteModal(true)}>Проголосовать</Button>
          </div>
        )}
        {votes && votes.total === 0 && (
          <Button size="small" onClick={() => setVoteModal(true)} style={{ marginBottom: 12 }}>Проголосовать</Button>
        )}

        {/* Horizontal timeline */}
        <div ref={timelineRef} style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8, marginBottom: 16, borderBottom: '1px solid #E8EBF0', scrollBehavior: 'smooth' }}>
          {stages.map((stage, idx) => {
            const isActive = stage.code === candidate.status;
            const isPast = stages.findIndex((s) => s.code === candidate.status) > idx;
            return (
              <div key={stage.code} style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                <div style={{ padding: '6px 16px', borderRadius: 2, fontSize: 12, fontWeight: isActive ? 700 : 500, background: isActive ? stage.color : isPast ? '#E8EBF0' : 'transparent', color: isActive ? '#fff' : isPast ? '#8A94A6' : '#AEB7C4', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{stage.name}</div>
                {idx < stages.length - 1 && <div style={{ width: 24, height: 2, background: isPast ? stage.color : '#E8EBF0', flexShrink: 0 }} />}
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
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                  <Text strong>Добавить интервьюера:</Text>
                  <Select style={{ width: 300 }} placeholder="Выберите пользователя" showSearch optionFilterProp="label"
                    onChange={handleAddInterviewer}
                    options={allUsers.map((u) => ({ value: u.id, label: `${u.firstName} ${u.lastName} (${u.role})` }))} />
                </div>
                {candidate.votes?.length > 0 && (
                  <>
                    <Divider />
                    <Text strong>Голоса интервьюеров</Text>
                    <List size="small" dataSource={candidate.votes} renderItem={(v: any) => (
                      <List.Item>
                        <Tag color={voteColors[v.vote]}>{voteLabels[v.vote]}</Tag>
                        <Text>{v.user?.firstName} {v.user?.lastName}</Text>
                        <Text type="secondary" style={{ marginLeft: 'auto' }}>{new Date(v.createdAt).toLocaleString('ru')}</Text>
                      </List.Item>
                    )} />
                  </>
                )}
              </Space>
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
              style={{ borderColor: selectedVote === value ? undefined : '#D8DCE3' }}>
              {voteIcons[value]} {label}
            </Button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
