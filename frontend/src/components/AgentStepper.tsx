import React from 'react';
import { InvestigationResult } from '../types';
import {
  CpuIcon,
  RefreshCwIcon,
  ZapIcon,
  TargetIcon,
  CheckCircleIcon,
  CheckIcon,
  XIcon
} from './Icons';

interface AgentStepperProps {
  isInvestigating: boolean;
  investigationResult: InvestigationResult | null;
  onRunPipeline: () => void;
}

export const AgentStepper: React.FC<AgentStepperProps> = ({
  isInvestigating,
  investigationResult,
  onRunPipeline
}) => {
  const traces = investigationResult?.agent_runtime_trace;
  const verification = investigationResult?.verification_results;
  const goal = investigationResult?.goal || 'Resolve M-204 degradation and return the machine to a safe operating state.';

  // Fallback static capabilities if runtime trace has not yet run
  const fallbackSteps = [
    {
      id: 'signal',
      stepNumber: 1,
      title: 'Signal Correlation',
      toolSelected: 'get_recent_telemetry',
      toolCategory: 'Observation',
      evidenceObtained: investigationResult?.signal_analysis?.signal_summary || 'Vibration variance +7.82 mm/s (Z = +3.83 standard deviations over nominal baseline).',
      confidence: investigationResult?.signal_analysis ? `${(100 - (investigationResult.signal_analysis.used_fallback ? 15 : 0))}%` : '96%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Adaptive threshold calibrated to 4.5 mm/s limit'
    },
    {
      id: 'rca',
      stepNumber: 2,
      title: 'Root Cause Analysis',
      toolSelected: 'get_maintenance_history',
      toolCategory: 'Investigation',
      evidenceObtained: investigationResult?.root_cause_analysis?.hypothesis || 'Bearing replacement work order correlated with mechanical drive vibration spikes.',
      confidence: `${investigationResult?.root_cause_analysis?.confidence_score?.toFixed(0) || 89}%`,
      status: 'SUCCESS' as const,
      adaptationEvent: 'Cross-validated against historical maintenance logs (MR-204-01)'
    },
    {
      id: 'impact',
      stepNumber: 3,
      title: 'Impact Assessment',
      toolSelected: 'calculate_business_impact',
      toolCategory: 'Evaluation',
      evidenceObtained: investigationResult?.impact_assessment?.summary || 'Production loss modeled at $1,875/hr direct loss rate over 24.0h estimated downtime.',
      confidence: '94%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Dynamic escalation to High-Severity queue'
    },
    {
      id: 'sop',
      stepNumber: 4,
      title: 'SOP Response Engine',
      toolSelected: 'retrieve_relevant_sop',
      toolCategory: 'Action Formulation',
      evidenceObtained: investigationResult?.action_plan?.action_summary || 'Indexed SOP-M204-BEARING retrieved with matched auxiliary coolant flushing sequence.',
      confidence: '98%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Action bound to strict Human-in-the-Loop Operator Approval Gate'
    }
  ];

  // 6-stage core agentic loop stages with operational telemetry timestamps
  const coreLifecycle = [
    {
      num: '01',
      name: 'Observe',
      time: '14:31:02',
      desc: 'Telemetry Z-score breach (+3.83 std dev)',
      status: 'VERIFIED'
    },
    {
      num: '02',
      name: 'Investigate',
      time: '14:31:14',
      desc: 'Maintenance record MNT-882 correlated',
      status: 'VERIFIED'
    },
    {
      num: '03',
      name: 'Decide',
      time: '14:31:25',
      desc: 'Bearing degradation probability exceeded threshold',
      status: 'VERIFIED'
    },
    {
      num: '04',
      name: 'Act',
      time: '14:31:40',
      desc: 'Human authorization gate for coolant flush',
      status: isInvestigating ? 'ACTIVE' : 'READY'
    },
    {
      num: '05',
      name: 'Evaluate',
      time: '14:32:05',
      desc: 'Vibration normalized to 1.80 mm/s',
      status: isInvestigating ? 'PENDING' : 'VERIFIED'
    },
    {
      num: '06',
      name: 'Verify',
      time: '14:32:18',
      desc: 'Goal verified and SHA-256 ledger hashed',
      status: isInvestigating ? 'PENDING' : 'VERIFIED'
    },
  ];

  const currentStageIdx = isInvestigating ? 3 : (traces && traces.length > 0 ? 5 : 0);

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      {/* Header with Goal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--accent)' }}><CpuIcon size={16} /></span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Agent Runtime Execution Trace
            </span>
            <span className="badge badge-info" style={{ fontSize: '10px' }}>
              AUTONOMOUS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', backgroundColor: 'var(--bg-surface-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--accent)', marginTop: '2px' }}><TargetIcon size={14} /></span>
            <div>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Operational Objective:
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                {goal}
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          disabled={isInvestigating}
          onClick={onRunPipeline}
          style={{ height: '36px', fontSize: '13px', alignSelf: 'center' }}
        >
          {isInvestigating ? (
            <>
              <RefreshCwIcon size={14} className="spin-slow" /> Executing Agent Loop...
            </>
          ) : (
            <>
              <ZapIcon size={14} /> Run Autonomous Agent Loop
            </>
          )}
        </button>
      </div>

      {/* 6-Stage Core Agentic Timeline */}
      <div className="agentic-timeline">
        {coreLifecycle.map((stage, idx) => {
          const isDone = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;
          const stageStatus = isDone ? 'COMPLETED' : isCurrent ? (isInvestigating ? 'RUNNING' : 'ACTIVE') : 'PENDING';

          return (
            <div
              key={stage.num}
              className={`timeline-node ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
            >
              <div className="timeline-step-index">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="timeline-bindu" aria-hidden="true" />
                  <strong>{stage.num}</strong>
                </span>
                <span className="timeline-step-time">{stage.time}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="timeline-step-label">{stage.name}</span>
                <span
                  className={`badge ${isDone ? 'badge-normal' : isCurrent ? 'badge-info' : ''}`}
                  style={{ fontSize: '9px', padding: '1px 4px' }}
                >
                  {stageStatus}
                </span>
              </div>
              <div className="timeline-step-desc">{stage.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Iteration Trace Flow */}
      {traces && traces.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {traces.map((trace) => {
            const isFailed = trace.status === 'FAILED';
            const isAdapted = trace.status === 'ADAPTED';

            const borderColor = isFailed
              ? 'var(--critical-border)'
              : isAdapted
              ? 'var(--copper-border)'
              : 'var(--success-border)';

            const badgeBg = isFailed
              ? 'var(--critical-bg)'
              : isAdapted
              ? 'var(--accent-tint)'
              : 'var(--success-bg)';

            const badgeColor = isFailed
              ? 'var(--status-critical)'
              : isAdapted
              ? 'var(--accent-primary)'
              : 'var(--status-normal)';

            return (
              <div
                key={trace.iteration}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: `1px solid ${borderColor}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Iteration Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                    <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                      ITERATION 0{trace.iteration}
                    </span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.4rem',
                        background: badgeBg,
                        color: badgeColor,
                        borderColor
                      }}
                    >
                      {trace.status}
                    </span>
                  </div>

                  {/* Tool Name & Category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div className="mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {trace.tool_name}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      {trace.tool_category}
                    </span>
                  </div>

                  {/* Decision Rationale */}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    <strong style={{ color: 'var(--text-bright)' }}>Decision:</strong> {trace.decision_rationale}
                  </div>

                  {/* Result Summary */}
                  <div style={{
                    background: isFailed ? 'var(--critical-bg)' : 'var(--bg-surface-secondary)',
                    border: `1px solid ${isFailed ? 'var(--critical-border)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.65rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: isFailed ? 'var(--critical)' : 'var(--text-dim)', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {isFailed ? 'Execution Failure' : 'Result & Observation'}
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0 }}>
                      {trace.result_summary}
                    </p>
                  </div>

                  {/* Adaptation Note if present */}
                  {trace.adaptation_note && (
                    <div style={{
                      backgroundColor: 'var(--copper-tint)',
                      borderLeft: '3px solid var(--accent-primary)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      fontSize: '0.72rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.4rem'
                    }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                        Adaptation Triggered:
                      </div>
                      {trace.adaptation_note}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Policy Gate:</span>
                  <span className="mono" style={{ color: 'var(--status-normal)', fontWeight: 600 }}>
                    AUTONOMOUS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {fallbackSteps.map((step) => (
            <div
              key={step.id}
              style={{
                backgroundColor: 'var(--bg-surface-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    CAPABILITY 0{step.stepNumber}
                  </span>
                  <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>
                    READY
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.2rem' }}>
                  {step.title}
                </div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {step.toolSelected}
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.65rem', marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: '1.4', margin: 0 }}>
                    {step.evidenceObtained}
                  </p>
                </div>
              </div>
              <div style={{ marginTop: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                <span className="mono" style={{ color: 'var(--status-normal)', fontWeight: 600 }}>{step.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Verification Matrix (Phase 5 requirement) */}
      {verification && (
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: 'var(--success)' }}><CheckCircleIcon size={16} /></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                GOAL VERIFICATION MATRIX
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Outcome Evaluation:</span>
              <span className="badge" style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                background: verification.goal_achieved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: verification.goal_achieved ? '#4ade80' : '#ef4444',
                borderColor: verification.goal_achieved ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
                padding: '0.2rem 0.6rem'
              }}>
                {verification.overall_status || (verification.goal_achieved ? 'GOAL ACHIEVED' : 'GOAL NOT ACHIEVED')}
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.76rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>Metric</th>
                  <th style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>Target Threshold</th>
                  <th style={{ padding: '0.4rem 0.5rem', fontWeight: 600 }}>Current Telemetry</th>
                  <th style={{ padding: '0.4rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {verification.criteria.map((crit, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.45rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {crit.metric}
                    </td>
                    <td className="mono" style={{ padding: '0.45rem 0.5rem', color: 'var(--text-muted)' }}>
                      {crit.target}
                    </td>
                    <td className="mono" style={{ padding: '0.45rem 0.5rem', color: 'var(--text-bright)', fontWeight: 600 }}>
                      {crit.current}
                    </td>
                    <td style={{ padding: '0.45rem 0.5rem', textAlign: 'right' }}>
                      <span className="badge" style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.35rem',
                        background: crit.status === 'PASS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: crit.status === 'PASS' ? '#4ade80' : '#ef4444',
                        borderColor: crit.status === 'PASS' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                      }}>
                        {crit.status === 'PASS' ? <CheckIcon size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> : <XIcon size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                        {crit.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
