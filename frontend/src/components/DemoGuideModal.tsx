import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { NavigationTab } from './Layout';
import { XIcon } from './Icons';

interface DemoStep {
  act: number;
  title: string;
  subtitle: string;
  description: string;
  keyMetric: string;
  actionText?: string;
  actionType?: 'trigger' | 'tick' | 'reset' | 'navigate_incidents';
  targetTab?: NavigationTab;
}

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: NavigationTab) => void;
}

const DEMO_STEPS: DemoStep[] = [
  {
    act: 1,
    title: 'Act 1 — Normal Plant Operations',
    subtitle: 'Baseline Health & Asset Monitoring',
    description: 'Inspect the Operations Command Center. Monitored assets (M-204 Centrifugal Compressor, M-101 Water Pump, M-305 Turbine) are running in green NORMAL state.',
    keyMetric: 'M-204 Vibration: ~1.8 mm/s | Temp: ~52.0°C | Status: NORMAL',
    actionText: 'Verify Baseline Operations',
    actionType: 'reset',
    targetTab: 'dashboard'
  },
  {
    act: 2,
    title: 'Act 2 — Inject M-204 Bearing Failure',
    subtitle: 'Simulate Industrial Degradation',
    description: 'Trigger the M-204 bearing degradation sequence. Mechanical degradation begins immediately across vibration, temperature, and output metrics.',
    keyMetric: 'M-204 Vibration: Spiking towards 7.82 mm/s | Temp: 88.4°C',
    actionText: 'Trigger M-204 Failure Scenario',
    actionType: 'trigger',
    targetTab: 'dashboard'
  },
  {
    act: 3,
    title: 'Act 3 — Real-Time Anomaly & Incident Detection',
    subtitle: 'Statistical Threshold Breached',
    description: 'The Anomaly Detection Engine identifies critical vibration and temperature threshold breaches, automatically transitioning M-204 state to CRITICAL and opening incident ticket INC-M204-001.',
    keyMetric: 'Machine State: CRITICAL | Active Incidents: 1 (INC-M204-001)',
    actionText: 'View Incidents Operations Queue',
    actionType: 'navigate_incidents',
    targetTab: 'incidents'
  },
  {
    act: 4,
    title: 'Act 4 — 4-Stage AI Agent Investigation',
    subtitle: 'Autonomous Multi-Agent Analysis',
    description: 'The 4-stage agent pipeline executes sequentially: Signal Correlator → Root Cause Analysis (89% confidence) → Business Impact ($45,000 risk) → SOP RAG Retrieval (SOP-M204-BEARING).',
    keyMetric: 'Hypothesis: Centrifugal Compressor Bearing Failure (89% Confidence)',
    actionText: 'Inspect Investigation Pipeline',
    actionType: 'navigate_incidents',
    targetTab: 'incidents'
  },
  {
    act: 5,
    title: 'Act 5 — Human-in-the-Loop Approval Gate',
    subtitle: 'Industrial Safety Boundary Enforced',
    description: 'The platform prohibits autonomous physical actuation. The response plan is locked until the Shift Operator reviews evidence, verifies SOP-M204-BEARING, and toggles explicit authorization.',
    keyMetric: 'Gate Lock Status: REQUIRES OPERATOR APPROVAL',
    actionText: 'Review Approval Gate',
    actionType: 'navigate_incidents',
    targetTab: 'incidents'
  },
  {
    act: 6,
    title: 'Act 6 — Containment Actuation & System Recovery',
    subtitle: 'Software-Guided Containment Execution',
    description: 'Upon operator approval, execute the simulated containment action (Lockout & Lubrication Flush). Machine M-204 transitions to CONTAINED and telemetry graphs return to green baseline.',
    keyMetric: 'Machine State: CONTAINED | Vibration Restored: 1.8 mm/s',
    actionText: 'Execute Containment Action',
    actionType: 'navigate_incidents',
    targetTab: 'incidents'
  },
  {
    act: 7,
    title: 'Act 7 — Cryptographic Ledger & Incident Replay',
    subtitle: 'SHA-256 Auditability & Explainability',
    description: 'Inspect the tamper-evident SHA-256 Decision Ledger, review the grounded RAG Explainability Map, and scrub step-by-step through the Incident Time-Travel Replay player.',
    keyMetric: 'Ledger Status: 100% SHA-256 VERIFIED | Cryptographic Chain Valid',
    actionText: 'Open Decision Ledger & Replay',
    actionType: 'navigate_incidents',
    targetTab: 'incidents'
  }
];

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'pitch'>('walkthrough');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1));
        return;
      }

      if (e.key >= '1' && e.key <= '7') {
        const actNum = parseInt(e.key, 10);
        setCurrentStepIndex(actNum - 1);
        setActiveTab('walkthrough');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex];

  const handleStepAction = async () => {
    setActionLoading(true);
    try {
      if (currentStep.actionType === 'reset') {
        await apiService.resetSimulation();
        window.dispatchEvent(new Event('simulation-updated'));
      } else if (currentStep.actionType === 'trigger') {
        await apiService.triggerDegradation();
        window.dispatchEvent(new Event('simulation-updated'));
      } else if (currentStep.actionType === 'tick') {
        await apiService.triggerSimulationTick();
        window.dispatchEvent(new Event('simulation-updated'));
      }

      if (currentStep.targetTab) {
        onNavigateToTab(currentStep.targetTab);
      }
    } catch (err) {
      console.error('Demo step action failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          width: '90%',
          maxWidth: '700px',
          boxShadow: 'var(--shadow-elevated)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                background: 'var(--accent-primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                padding: '2px 8px',
                fontSize: '0.75rem'
              }}
            >
              ACT {currentStep.act} / 7
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              Industrial Demonstration Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Tab Switcher & Keyboard Hint */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('walkthrough')}
              className={`btn ${activeTab === 'walkthrough' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              7-Act Flow
            </button>
            <button
              onClick={() => setActiveTab('pitch')}
              className={`btn ${activeTab === 'pitch' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}
            >
              System Architecture & Pitch
            </button>
          </div>

          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Keys <strong style={{ color: 'var(--text-primary)' }}>[1–7]</strong> Act • <strong style={{ color: 'var(--text-primary)' }}>[←/→]</strong> Nav • <strong style={{ color: 'var(--text-primary)' }}>[Esc]</strong> Close
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'pitch' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Product Positioning */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '3px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Core Value Proposition
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.55', margin: 0, fontWeight: 400 }}>
                  "VAJRA is the agentic industrial crisis response platform that transforms high-frequency plant telemetry into grounded, explainable incident investigation and adaptive recovery—strictly bounded by human-in-the-loop authorization and tamper-evident SHA-256 cryptographic auditability."
                </p>
              </div>

              {/* End-to-End Architecture Flow */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
                  End-to-End System Architecture
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem'
                  }}
                >
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--accent-primary)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Sensor Signal
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--status-warning)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Anomaly Detection
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--status-critical)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Incident Ticket
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--accent-primary)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Agent Investigation
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--status-warning)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Human Approval Gate
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--status-normal)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    Actuation
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ background: 'var(--bg-surface)', color: 'var(--accent-primary)', border: '1px solid var(--border-strong)', padding: '4px 8px', borderRadius: 'var(--radius-sm)' }}>
                    SHA-256 Ledger
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Act Header */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {currentStep.subtitle}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0.2rem 0 0.5rem 0' }}>
                  {currentStep.title}
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                  {currentStep.description}
                </p>
              </div>

              {/* Key Metric Box */}
              <div
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderLeft: '3px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.1rem',
                  marginBottom: '1.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}
              >
                <strong style={{ color: 'var(--accent-primary)' }}>Key Demonstration Metric:</strong> {currentStep.keyMetric}
              </div>

              {/* Action Trigger Button */}
              {currentStep.actionText && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleStepAction}
                    disabled={actionLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.25rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {actionLoading ? 'Executing Step Action...' : currentStep.actionText}
                  </button>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)'
                }}
              >
                <button
                  className="btn btn-outline"
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  style={{ opacity: currentStepIndex === 0 ? 0.4 : 1, fontSize: '0.8rem' }}
                >
                  Previous Act
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {DEMO_STEPS.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: 'var(--radius-sm)',
                        background: idx === currentStepIndex ? 'var(--accent-primary)' : 'var(--bg-surface-elevated)',
                        color: idx === currentStepIndex ? '#FFFFFF' : 'var(--text-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        border: idx === currentStepIndex ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)'
                      }}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  disabled={currentStepIndex === DEMO_STEPS.length - 1}
                  onClick={() => setCurrentStepIndex((prev) => Math.min(DEMO_STEPS.length - 1, prev + 1))}
                  style={{ opacity: currentStepIndex === DEMO_STEPS.length - 1 ? 0.4 : 1, fontSize: '0.8rem' }}
                >
                  Next Act
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
