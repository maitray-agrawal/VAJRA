import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { ExplainabilityReport } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorAlert } from './ErrorAlert';
import {
  BrainIcon,
  TrendingUpIcon,
  WrenchIcon,
  BookOpenIcon
} from './Icons';

interface ExplainabilityMapProps {
  incidentId: string;
}

export const ExplainabilityMap: React.FC<ExplainabilityMapProps> = ({ incidentId }) => {
  const [report, setReport] = useState<ExplainabilityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExplainability = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getExplainabilityReport(incidentId);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load explainability breakdown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      fetchExplainability();
    }
  }, [incidentId]);

  if (loading) return <LoadingSpinner message="Generating AI Explainability Matrix..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchExplainability} />;
  if (!report) return null;

  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-bright)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ color: 'var(--accent-primary)' }}><BrainIcon size={18} /></span>
            Root Cause Explainability Matrix
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Surfacing feature attribution weights, RAG SOP citations, and multi-agent reasoning evidence.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confidence Score:</span>
          <span className="mono" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--status-normal)' }}>{report.confidence_score}%</span>
        </div>
      </div>

      {/* Hypothesis & Reasoning Summary */}
      <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-primary)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
          Primary RCA Hypothesis
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-bright)', fontWeight: 600, marginBottom: '0.4rem' }}>
          {report.hypothesis}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.45', margin: 0 }}>
          {report.reasoning_summary}
        </p>
      </div>

      {/* Feature Attribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Telemetry Anomalies */}
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--status-critical)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <TrendingUpIcon size={14} color="var(--status-critical)" /> Telemetry Anomaly Evidence
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {report.telemetry_features.map((feat, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>{feat.title}</span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--status-critical)', fontWeight: 600 }}>Weight: {(feat.confidence * 100).toFixed(0)}%</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 0.4rem 0' }}>{feat.description}</p>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${feat.confidence * 100}%`, height: '100%', backgroundColor: 'var(--status-critical)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Correlation */}
        <div style={{ backgroundColor: 'var(--bg-surface-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--status-warning)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <WrenchIcon size={14} color="var(--status-warning)" /> Maintenance Log Attribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {report.correlated_maintenance.map((maint, idx) => (
              <div key={idx} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.65rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-bright)' }}>{maint.title}</span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--status-warning)', fontWeight: 600 }}>Weight: {(maint.confidence * 100).toFixed(0)}%</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '0 0 0.4rem 0' }}>{maint.description}</p>
                <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-surface-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${maint.confidence * 100}%`, height: '100%', backgroundColor: 'var(--status-warning)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cited SOP Citation Block */}
      {report.cited_sop && (
        <div style={{ padding: '0.9rem 1rem', backgroundColor: 'var(--copper-tint)', border: '1px solid var(--copper-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpenIcon size={14} /> Grounded SOP Citation ({report.cited_sop.code})
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Component: {report.cited_sop.target_component}</span>
          </div>
          <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.35rem' }}>{report.cited_sop.title}</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '2px solid var(--accent-primary)', paddingLeft: '0.75rem', margin: 0 }}>
            "{report.cited_sop.snippet}"
          </p>
        </div>
      )}
    </div>
  );
};
