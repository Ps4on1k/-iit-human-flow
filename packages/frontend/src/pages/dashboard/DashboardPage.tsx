import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tabs, Typography } from 'antd';
const { Text } = Typography;
import { TeamOutlined, FileTextOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { dashboardApi } from '@/services/api';

function FunnelChart({ pipeline }: { pipeline: any }) {
  const maxCount = Math.max(...pipeline.stages.map((s: any) => s.count), 1);

  return (
    <div style={{ padding: '16px 0' }}>
      <Row gutter={[8, 12]} align="middle">
        {pipeline.stages.map((stage: any) => {
          const widthPercent = Math.max((stage.count / maxCount) * 100, 10);
          return (
            <Col key={stage.code} flex="auto" style={{ minWidth: 80 }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: `${widthPercent}%`,
                    minWidth: 32,
                    maxWidth: '100%',
                    height: 48,
                    background: stage.color || '#3A8DFF',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    opacity: stage.count > 0 ? 1 : 0.25,
                  }}
                >
                  {stage.count > 0 && (
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                      {stage.count}
                    </span>
                  )}
                </div>
                <Text style={{ fontSize: 11, marginTop: 4, display: 'block', color: '#8A94A6' }}>
                  {stage.name}
                </Text>
              </div>
            </Col>
          );
        })}
      </Row>
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Text type="secondary">Всего: <strong>{pipeline.totalCandidates}</strong> кандидатов</Text>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [pipelineFunnels, setPipelineFunnels] = useState<any[]>([]);

  useEffect(() => {
    dashboardApi.stats().then((r) => setStats(r.data));
    dashboardApi.funnel().then((r) => setFunnel(r.data));
    dashboardApi.pipelineFunnels().then((r) => setPipelineFunnels(r.data));
  }, []);

  const totalHired = funnel.find((f) => f.status === 'hired')?.count || 0;

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: 24 }}>Дашборд</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Вакансии" value={stats?.totalVacancies || 0} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Открытые" value={stats?.openVacancies || 0} prefix={<TeamOutlined />} valueStyle={{ color: '#3A8DFF' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Кандидаты" value={stats?.totalCandidates || 0} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="Наняты" value={totalHired} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#21B573' }} />
          </Card>
        </Col>
      </Row>

      <Card title="Воронка найма (общая)" style={{ marginTop: 16 }}>
        <Row gutter={[8, 8]}>
          {funnel.sort((a, b) => b.count - a.count).map((item) => (
            <Col key={item.status} xs={8} sm={6} md={4} lg={3}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic value={item.count} valueStyle={{ fontSize: 20, color: item.count > 0 ? '#3A8DFF' : undefined }} />
                <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8A94A6' }}>
                  {item.status}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {pipelineFunnels.length > 0 && (
        <Card title="Воронки по флоу" style={{ marginTop: 16 }}>
          <Tabs
            defaultActiveKey="0"
            items={pipelineFunnels.map((pipeline, idx) => ({
              key: String(idx),
              label: (
                <span>
                  {pipeline.name}
                  {pipeline.isDefault && <span style={{ fontSize: 10, color: '#3A8DFF', marginLeft: 4 }}>*</span>}
                  <span style={{ fontSize: 11, color: '#8A94A6', marginLeft: 6 }}>({pipeline.totalCandidates})</span>
                </span>
              ),
              children: <FunnelChart pipeline={pipeline} />,
            }))}
          />
        </Card>
      )}
    </div>
  );
}
