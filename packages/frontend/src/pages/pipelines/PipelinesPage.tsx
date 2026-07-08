import { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Typography, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, SettingOutlined } from '@ant-design/icons';
import { pipelinesApi } from '@/services/api';

export function PipelinesPage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [_loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<any>(null);
  const [stageForm] = Form.useForm();
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await pipelinesApi.list();
      setPipelines(data);
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

  const openEdit = (pipeline: any) => {
    setEditingId(pipeline.id);
    form.setFieldsValue({ name: pipeline.name });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingId) {
        await pipelinesApi.update(editingId, values);
        message.success('Флоу обновлён');
      } else {
        await pipelinesApi.create(values.name);
        message.success('Флоу создан');
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
      await pipelinesApi.delete(id);
      message.success('Флоу удалён');
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const openStages = (pipeline: any) => {
    setSelectedPipeline(pipeline);
    setStageModalOpen(true);
  };

  const openStageForm = (stage?: any) => {
    setEditingStageId(stage?.id || null);
    stageForm.setFieldsValue({ name: stage?.name || '', code: stage?.code || '', color: stage?.color || '#3A8DFF' });
    if (!stage) stageForm.resetFields();
  };

  const handleStageSubmit = async (values: any) => {
    try {
      if (editingStageId) {
        await pipelinesApi.updateStage(editingStageId, { name: values.name, color: values.color });
        message.success('Стадия обновлена');
      } else {
        await pipelinesApi.addStage(selectedPipeline.id, values);
        message.success('Стадия добавлена');
      }
      setEditingStageId(null);
      stageForm.resetFields();
      const { data } = await pipelinesApi.get(selectedPipeline.id);
      setSelectedPipeline(data);
      load();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleStageDelete = async (stageId: string) => {
    try {
      await pipelinesApi.deleteStage(stageId);
      message.success('Стадия удалена');
      const { data } = await pipelinesApi.get(selectedPipeline.id);
      setSelectedPipeline(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleMoveStage = async (stageId: string, direction: 'up' | 'down') => {
    if (!selectedPipeline) return;
    const sorted = [...selectedPipeline.stages].sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s: any) => s.id === stageId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
    const stageIds = sorted.map((s: any) => s.id);
    try {
      await pipelinesApi.reorderStages(selectedPipeline.id, stageIds);
      const { data } = await pipelinesApi.get(selectedPipeline.id);
      setSelectedPipeline(data);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>НАСТРОЙКА</Typography.Text>
          <Typography.Title level={2} style={{ margin: '8px 0 0' }}>Флоу найма</Typography.Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Создать флоу</Button>
      </div>

      {pipelines.map((pipeline) => (
        <Card
          key={pipeline.id}
          style={{ marginBottom: 16 }}
          title={
            <Space>
              <span>{pipeline.name}</span>
              {pipeline.isDefault && <Tag color="blue">По умолчанию</Tag>}
              <Tag>{pipeline._count?.vacancies || 0} вакансий</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button icon={<SettingOutlined />} onClick={() => openStages(pipeline)}>Стадии</Button>
              <Button icon={<EditOutlined />} onClick={() => openEdit(pipeline)} />
              {!pipeline.isDefault && (
                <Popconfirm title="Удалить флоу?" onConfirm={() => handleDelete(pipeline.id)}>
                  <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
              )}
            </Space>
          }
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pipeline.stages?.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((stage: any) => (
              <Tag
                key={stage.id}
                color={stage.color || 'default'}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 2 }}
              >
                {stage.name}
              </Tag>
            ))}
            {(!pipeline.stages || pipeline.stages.length === 0) && (
              <Typography.Text type="secondary">Нет стадий. Нажмите "Стадии" для настройки.</Typography.Text>
            )}
          </div>
        </Card>
      ))}

      {/* Create/Edit Pipeline Modal */}
      <Modal
        title={editingId ? 'Редактировать флоу' : 'Новый флоу'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editingId ? 'Сохранить' : 'Создать'}
        cancelText="Отмена"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Название" rules={[{ required: true, message: 'Введите название' }]}>
            <Input placeholder="Например: Технический набор" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Stages Management Modal */}
      <Modal
        title={`Стадии: ${selectedPipeline?.name || ''}`}
        open={stageModalOpen}
        onCancel={() => { setStageModalOpen(false); setEditingStageId(null); stageForm.resetFields(); }}
        footer={null}
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Form form={stageForm} layout="inline" onFinish={handleStageSubmit}>
            <Form.Item name="name" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 200 }}>
              <Input placeholder="Название стадии" />
            </Form.Item>
            {!editingStageId && (
              <Form.Item name="code" rules={[{ required: true }]} style={{ marginBottom: 0, minWidth: 150 }}>
                <Input placeholder="Код (latin)" />
              </Form.Item>
            )}
            <Form.Item name="color" style={{ marginBottom: 0, width: 80 }}>
              <input type="color" style={{ width: 32, height: 32, border: 'none', cursor: 'pointer' }} />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">{editingStageId ? 'Сохранить' : 'Добавить'}</Button>
            </Form.Item>
            {editingStageId && (
              <Form.Item style={{ marginBottom: 0 }}>
                <Button onClick={() => { setEditingStageId(null); stageForm.resetFields(); }}>Отмена</Button>
              </Form.Item>
            )}
          </Form>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {selectedPipeline?.stages?.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((stage: any, idx: number) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: '1px solid #EEF1F4', borderRadius: 2 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: stage.color || '#3A8DFF', flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{stage.name}</span>
              <Space size={4}>
                <Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={idx === 0} onClick={() => handleMoveStage(stage.id, 'up')} />
                <Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={idx === ((selectedPipeline.stages as any[])?.length || 0) - 1} onClick={() => handleMoveStage(stage.id, 'down')} />
                <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openStageForm(stage)} />
                <Popconfirm title="Удалить стадию?" onConfirm={() => handleStageDelete(stage.id)}>
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
