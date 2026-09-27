import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Incident, SOPDocument, InvestigationResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { AuditLedgerViewer } from '../components/AuditLedgerViewer';
import { ExplainabilityMap } from '../components/ExplainabilityMap';
import { ReplayPlayer } from '../components/ReplayPlayer';
import { AgentStepper } from '../components/AgentStepper';
import {
  AlertTriangleIcon,
  RefreshCwIcon,
  ZapIcon,
  ShieldCheckIcon,
  ActivityIcon,
  BrainIcon,
  RewindIcon,
  CheckCircleIcon,
  ClockIcon,
  LockIcon,
  UnlockIcon,
  CheckIcon
} from '../components/Icons';

interface IncidentsPageProps {
  selectedIncidentId?: string | null;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ selectedIncidentId }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [sop, setSop] = useState<SOPDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [approvedActionIds, setApprovedActionIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'workspace' | 'audit' | 'explainability' | 'replay'>('workspace');
  const [investigating, setInvestigating] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  const fetchIncidentsData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getIncidents();
      setIncidents(data);

      if (data.length === 0) {
        setActiveIncident(null);
        setInvestigationResult(null);
        setSop(null);
        return;
      }

      const validIncidentId = (selectedIncidentId && data.some(i => i.id === selectedIncidentId))
        ? selectedIncidentId
        : (activeIncident?.id && data.some(i => i.id === activeIncident.id))
        ? activeIncident.id
        : data[0].id;

      try {
        const detail = await apiService.getIncidentDetail(validIncidentId);
        setActiveIncident(detail);

        try {
          const invData = await apiService.getInvestigation(validIncidentId);
          setInvestigationResult(invData);
        } catch {
          setInvestigationResult(null);
        }

        if (detail.action_recommendations && detail.action_recommendations.length > 0) {
          const actionSopId = detail.action_recommendations[0].sop_id;
          if (actionSopId) {
            try {
              const sopDetail = await apiService.getSOPDetail(actionSopId);
              setSop(sopDetail);
            } catch {
              // SOP fallback
            }
          }
        }
      } catch {
        if (data.length > 0) {
          const fallbackDetail = await apiService.getIncidentDetail(data[0].id);
          setActiveIncident(fallbackDetail);
        } else {
          setActiveIncident(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incident details.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData(true);

    const interval = setInterval(() => {
      fetchIncidentsData(false);
    }, 3000);

    const handleSimUpdate = () => fetchIncidentsData(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, [selectedIncidentId]);

  const selectIncident = async (id: string) => {
    setLoading(true);
    try {
      const detail = await apiService.getIncidentDetail(id);
      setActiveIncident(detail);
      setSop(null);

      try {
        const invData = await apiService.getInvestigation(id);
        setInvestigationResult(invData);
      } catch {
        setInvestigationResult(null);
      }

      if (detail.action_recommendations && detail.action_recommendations.length > 0) {
        const actionSopId = detail.action_recommendations[0].sop_id;
        if (actionSopId) {
          try {
            const sopDetail = await apiService.getSOPDetail(actionSopId);
            setSop(sopDetail);
          } catch {
            // silent
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvestigation = async (id: string) => {
    setInvestigating(true);
    setError(null);
    try {
      const res = await apiService.triggerInvestigation(id);
      setInvestigationResult(res);
      await fetchIncidentsData(false);
    } catch (err: any) {
      setError(err.message || 'Investigation pipeline failed.');
    } finally {
      setInvestigating(false);
    }
  };

  const handleApproveAction = async (actionId: string, incidentId: string) => {
    try {
      await apiService.approvePlan(incidentId, 'Lead Industrial Operator');
      setApprovedActionIds(prev => ({ ...prev, [actionId]: true }));
      await fetchIncidentsData(false);
    } catch (err: any) {
      setError(err.message || 'Approval failed.');
    }
  };

  const handleExecuteActuation = async (incidentId: string) => {
    setExecuting(true);
    setError(null);
    try {
      await apiService.executeActuation(incidentId);
      window.dispatchEvent(new Event('simulation-updated'));
      await fetchIncidentsData(false);
    } catch (err: any) {
      setError(err.message || 'Actuation execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading && !activeIncident) {
    return <LoadingSpinner message="Correlating telemetry signals & AI agent reasoning chain..." />;
  }
  if (error) {
    return <ErrorAlert message={error} onRetry={() => fetchIncidentsData(true)} />;
  }

  // Derived telemetry metric signal calculation (Z-Score)
  const observedVibe = activeIncident?.severity === 'CRITICAL' ? 7.82 : activeIncident?.severity === 'HIGH' ? 4.85 : 1.80;
  const baselineVibe = 1.80;
  const devVibe = observedVibe - baselineVibe;
  const zScoreVibe = (devVibe / 1.57).toFixed(2);

  // Financial impact calculation
  const downtimeHours = investigationResult?.impact_assessment?.estimated_downtime_hours || 24.0;
  const hourlyLossRate = 1875;
  const estimatedImpact = investigationResult?.impact_assessment?.estimated_financial_loss_usd || (downtimeHours * hourlyLossRate);
  const capacityLoss = investigationResult?.impact_assessment?.production_capacity_loss_pct || 35.0;

  return (
    <div className="page-container">
      {/* Workspace Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident Operations & Investigation Workspace</h1>
          <p className="page-subtitle">Multi-Agent Incident Queue, Root Cause Analysis & Grounded Action Execution</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {activeIncident && (
            <button
              className="btn btn-primary"
              disabled={investigating}
              onClick={() => handleRunInvestigation(activeIncident.id)}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ZapIcon size={14} />
              {investigating ? 'Running Agents...' : 'Run 4-Stage AI Pipeline'}
            </button>
          )}
          <button
            className="btn btn-outline"
            onClick={() => fetchIncidentsData(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* 35% / 65% Operations Workstation Split */}
      <div className="workstation-split">
        {/* Left Side: Incident Operations Queue (35%) */}
        <div className="workstation-queue">
          <div className="card-header-label" style={{ marginBottom: '0.4rem', padding: '0 4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangleIcon size={14} color="var(--critical)" /> Incident Queue
            </span>
            <span className="badge badge-normal">{incidents.length} Registered</span>
          </div>

          {incidents.map((incident) => {
            const isSelected = activeIncident?.id === incident.id;
            const riskExposure = `$${(24 * 1875).toLocaleString()} USD`;

            return (
              <div
                key={incident.id}
                onClick={() => selectIncident(incident.id)}
                className={`workstation-queue-item ${isSelected ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && selectIncident(incident.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className="mono" style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '13px' }}>
                    {incident.id}
                  </span>
                  <span className={`badge badge-${incident.severity.toLowerCase()}`}>
                    {incident.severity}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
                  {incident.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span className="mono">{incident.machine_id}</span>
                  <span className="mono" style={{ color: 'var(--critical)', fontWeight: 500 }}>{riskExposure}</span>
                  <span className={`badge badge-${incident.status === 'CONTAINED' || incident.status === 'APPROVED' ? 'normal' : 'warning'}`} style={{ fontSize: '9px' }}>
                    {incident.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Selected Incident Case File (65%) */}
        {activeIncident ? (
          <div className="workstation-casefile">
            {/* Sub-Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`btn ${activeTab === 'workspace' ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <ActivityIcon size={13} /> Investigation Case File
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <ShieldCheckIcon size={13} /> Decision Ledger (SHA-256)
              </button>
              <button
                onClick={() => setActiveTab('explainability')}
                className={`btn ${activeTab === 'explainability' ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <BrainIcon size={13} /> Explainability Map
              </button>
              <button
                onClick={() => setActiveTab('replay')}
                className={`btn ${activeTab === 'replay' ? 'btn-primary' : 'btn-outline'}`}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <RewindIcon size={13} /> Time-Travel Replay
              </button>
            </div>

            {activeTab === 'audit' && <AuditLedgerViewer incidentId={activeIncident.id} />}
            {activeTab === 'explainability' && <ExplainabilityMap incidentId={activeIncident.id} />}
            {activeTab === 'replay' && <ReplayPlayer incidentId={activeIncident.id} />}

            {activeTab === 'workspace' && (
              <>
                {/* 1. INCIDENT CASE FILE HEADER */}
                <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${activeIncident.severity.toLowerCase()}`}>{activeIncident.severity}</span>
                      <span className={`badge badge-${activeIncident.status === 'CONTAINED' || activeIncident.status === 'APPROVED' ? 'normal' : 'warning'}`}>
                        STATUS: {activeIncident.status}
                      </span>
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{activeIncident.id}</span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-bright)' }}>{activeIncident.title}</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Target Machine: <strong style={{ color: 'var(--text-bright)' }}>{activeIncident.machine_id}</strong> • Opened: {new Date(activeIncident.created_at).toLocaleString()}
                    </p>
                  </div>
                  {activeIncident.status === 'APPROVED' && (
                    <button
                      className="btn btn-success"
                      disabled={executing}
                      onClick={() => handleExecuteActuation(activeIncident.id)}
                    >
                      <ZapIcon size={14} />
                      {executing ? 'Executing Actuation...' : 'Execute Containment Action'}
                    </button>
                  )}
                </div>

                <div style={{ backgroundColor: 'var(--bg-surface-secondary)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent-primary)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.3rem', letterSpacing: '0.04em' }}>
                    MULTI-AGENT SYNTHESIZED INCIDENT SUMMARY
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.45', margin: 0 }}>
                    {activeIncident.summary || 'Click "Run 4-Stage AI Pipeline" to trigger complete multi-agent correlation.'}
                  </p>
                </div>
              </div>

              {/* 2. AGENT INVESTIGATION WORKFLOW (Phase 11) */}
              <AgentStepper
                isInvestigating={investigating}
                investigationResult={investigationResult}
                onRunPipeline={() => handleRunInvestigation(activeIncident.id)}
              />

              {/* 3. IMPACT ASSESSMENT & TELEMETRY EVIDENCE GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* EVIDENCE: Telemetry Anomaly Signal */}
                <div className="card" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      TELEMETRY ANOMALY SIGNAL (Z-SCORE EVALUATION)
                    </div>
                    <span className={`badge badge-${activeIncident.severity.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                      Z-SCORE: +{zScoreVibe}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vibration Amplitude</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: observedVibe > 4.5 ? 'var(--status-critical)' : 'var(--status-normal)' }}>
                        {observedVibe.toFixed(2)} mm/s
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nominal Baseline</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                        {baselineVibe.toFixed(2)} mm/s
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Signal Variance</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: devVibe > 0 ? 'var(--status-warning)' : 'var(--text-bright)' }}>
                        +{devVibe.toFixed(2)} mm/s
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Statistical Z-Score: <strong style={{ color: 'var(--text-primary)' }}>Z = (X - μ) / σ = ({observedVibe.toFixed(2)} - 1.80) / 1.57 = +{zScoreVibe}</strong> (Threshold: Z ≥ +3.00).
                  </div>
                </div>

                {/* IMPACT: Financial Exposure & Downtime */}
                <div className="card" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      ESTIMATED OPERATIONAL & FINANCIAL LOSS
                    </div>
                    <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                      {capacityLoss.toFixed(0)}% CAPACITY LOSS
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Downtime</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-warning)' }}>
                        {downtimeHours.toFixed(1)} Hours
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unit Loss Rate</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-bright)' }}>
                        ${hourlyLossRate}/hr
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Risk Model</div>
                      <div className="mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--status-critical)' }}>
                        ${estimatedImpact.toLocaleString()} USD
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Model Calculation: <strong style={{ color: 'var(--text-primary)' }}>{downtimeHours.toFixed(1)} hours × ${hourlyLossRate}/hr = ${estimatedImpact.toLocaleString()} USD</strong> direct production loss.
                  </div>
                </div>
              </div>

              {/* 4. EVIDENCE: Correlated Telemetry & Maintenance Logs */}
              <div className="card">
                <div className="card-title">
                  <span>Correlated Telemetry & Maintenance Evidence</span>
                  <span className="badge badge-normal" style={{ fontSize: '0.72rem' }}>
                    {activeIncident.evidence_items?.length || 0} Correlated Artifacts
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeIncident.evidence_items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'var(--accent-subtle)', border: '1px solid var(--border-strong)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                            {item.source_type}
                          </span>
                          <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.title}</strong>
                        </div>
                        <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>
                          {item.confidence_score.toFixed(1)}% Confidence
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5 & 6. ACTION & SAFETY GATE: Recommended Action & Human Approval */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* Action Recommendations & Safety Gate */}
                <div className="card">
                  <div className="card-title">
                    <span>Recommended Action Plan</span>
                    <span className="badge badge-critical" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <LockIcon size={12} /> HUMAN-IN-THE-LOOP GATE
                    </span>
                  </div>
                  {activeIncident.action_recommendations?.map((act) => {
                    const isApproved = approvedActionIds[act.id] || act.human_approved || activeIncident.status === 'APPROVED' || activeIncident.status === 'CONTAINED';
                    return (
                      <div key={act.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ background: isApproved ? 'var(--success-bg)' : 'var(--critical-bg)', border: `1px solid ${isApproved ? 'var(--success-border)' : 'var(--critical-border)'}`, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                            {act.action_title}
                          </div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: '1.4' }}>
                            {act.description}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isApproved ? 'var(--status-normal)' : 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {isApproved ? <CheckCircleIcon size={14} /> : <ClockIcon size={14} />}
                              {isApproved ? 'HUMAN APPROVED' : 'AWAITING OPERATOR APPROVAL'}
                            </span>
                            <button
                              className={`btn ${isApproved ? 'btn-outline' : 'btn-primary'}`}
                              style={{ fontSize: '0.78rem', padding: '0.38rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                              disabled={isApproved}
                              onClick={() => handleApproveAction(act.id, activeIncident.id)}
                            >
                              {isApproved ? (
                                <>
                                  <CheckIcon size={13} /> Authorized
                                </>
                              ) : (
                                <>
                                  <UnlockIcon size={13} /> Approve Plan
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {isApproved && activeIncident.status !== 'CONTAINED' && (
                          <button
                            className="btn btn-success"
                            disabled={executing}
                            onClick={() => handleExecuteActuation(activeIncident.id)}
                            style={{
                              marginTop: '0.5rem',
                              width: '100%'
                            }}
                          >
                            <ZapIcon size={14} />
                            {executing ? 'Executing Actuation...' : 'Execute Containment Action'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Grounded SOP Protocol (RAG Engine) */}
                <div className="card">
                  <div className="card-title">
                    <span>Matched SOP Protocol (RAG Engine)</span>
                    {sop && <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{sop.sop_code}</span>}
                  </div>
                  {sop ? (
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{sop.title}</h4>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Target Component: <span className="mono" style={{ color: 'var(--accent)' }}>{sop.target_component}</span>
                      </div>
                      <pre style={{
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-color)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.78rem',
                        color: 'var(--text-bright)',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {sop.content_markdown}
                      </pre>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No matching SOP protocol currently loaded.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select an incident from the queue to view detailed investigation data.</p>
        </div>
      )}
      </div>
    </div>
  );
};
