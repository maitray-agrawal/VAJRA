import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Machine, Incident, TelemetryRecord } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import {
  RefreshCwIcon,
  ActivityIcon,
  SearchIcon,
  BookOpenIcon,
  TrendingUpIcon,
  CpuIcon,
  ChevronRightIcon
} from '../components/Icons';

interface DashboardPageProps {
  onNavigateToIncident: (incidentId: string) => void;
  onNavigateToMachine: (machineId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToIncident,
  onNavigateToMachine
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [m204Telemetry, setM204Telemetry] = useState<TelemetryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [machinesData, incidentsData, telemetryData] = await Promise.all([
        apiService.getMachines(),
        apiService.getIncidents(),
        apiService.getMachineTelemetry('M-204', 5)
      ]);
      setMachines(machinesData);
      setIncidents(incidentsData);
      setM204Telemetry(telemetryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(true);

    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 3000);

    const handleSimUpdate = () => loadDashboardData(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, []);

  if (loading) return <LoadingSpinner message="Connecting to industrial telemetry pipeline & AI agent stream..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadDashboardData(true)} />;

  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  const criticalMachineCount = machines.filter(m => m.status === 'CRITICAL' || m.status === 'WARNING').length;
  const latestM204Vibration = m204Telemetry.length > 0 ? m204Telemetry[0].vibration_mm_s : 5.82;
  const latestM204Temp = m204Telemetry.length > 0 ? m204Telemetry[0].temp_celsius : 82.4;

  return (
    <div className="page-container">
      {/* Top Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Operations Command Center</h1>
          <p className="page-subtitle">Real-time telemetry, anomaly detection and incident response.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Last synchronized: Just now</span>
          <button
            className="btn btn-outline"
            onClick={() => loadDashboardData(true)}
            style={{ height: '34px', fontSize: '0.78rem' }}
          >
            <RefreshCwIcon size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* Structured Critical Incident Panel */}
      {criticalIncidents.length > 0 && (
        <div className="incident-panel-critical">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-critical">CRITICAL INCIDENT</span>
                <span className="mono" style={{ color: 'var(--status-critical)', fontWeight: 600, fontSize: '0.82rem' }}>
                  {criticalIncidents[0].id}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>• Target Asset: Machine M-204</span>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-bright)', margin: '0 0 0.35rem 0' }}>
                {criticalIncidents[0].title}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45', maxWidth: '820px' }}>
                {criticalIncidents[0].summary}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => onNavigateToIncident(criticalIncidents[0].id)}
              >
                <SearchIcon size={14} /> Investigate incident
              </button>
              <button
                className="btn btn-outline"
                onClick={() => onNavigateToMachine('M-204')}
              >
                <ActivityIcon size={14} /> View telemetry
              </button>
            </div>
          </div>

          {/* Structured Evidence Block */}
          <div className="incident-evidence-grid">
            <div className="evidence-cell">
              <span className="evidence-label">Observed Vibration</span>
              <span className="evidence-val" style={{ color: 'var(--status-critical)' }}>
                {latestM204Vibration.toFixed(2)} mm/s
              </span>
            </div>
            <div className="evidence-cell">
              <span className="evidence-label">Bearing Temperature</span>
              <span className="evidence-val" style={{ color: 'var(--status-critical)' }}>
                {latestM204Temp.toFixed(1)}°C
              </span>
            </div>
            <div className="evidence-cell">
              <span className="evidence-label">Correlated Record</span>
              <span className="evidence-val mono" style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>
                MNT-882 (Overdue)
              </span>
            </div>
            <div className="evidence-cell">
              <span className="evidence-label">Agent Confidence</span>
              <span className="evidence-val" style={{ color: 'var(--text-bright)' }}>
                89% Verified
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Operational Summary Grid */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header-label">
            <span>Fleet Monitored Assets</span>
            <span className="badge badge-normal">3 Active</span>
          </div>
          <div className="metric-value">
            {machines.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
          </div>
          <div className="metric-desc">Continuous telemetry stream online</div>
        </div>

        <div className="card">
          <div className="card-header-label">
            <span>Anomalous Assets</span>
            <span style={{ color: criticalMachineCount > 0 ? 'var(--status-critical)' : 'var(--status-normal)', fontWeight: 600 }}>
              {criticalMachineCount > 0 ? 'Critical Attention' : 'All Clear'}
            </span>
          </div>
          <div className="metric-value" style={{ color: criticalMachineCount > 0 ? 'var(--status-critical)' : 'var(--status-normal)' }}>
            {criticalMachineCount}
          </div>
          <div className="metric-desc">Machine M-204 bearing degradation</div>
        </div>

        <div className="card">
          <div className="card-header-label">
            <span>M-204 Peak Vibration</span>
            <span className="badge badge-critical">+132.8%</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--status-critical)' }}>
            {latestM204Vibration.toFixed(2)} <span style={{ fontSize: '0.85rem' }}>mm/s</span>
          </div>
          <div className="metric-desc">Baseline Limit: 2.50 mm/s</div>
        </div>

        <div className="card">
          <div className="card-header-label">
            <span>Agentic Lifecycle</span>
            <span className="badge badge-info">AUTONOMOUS</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>
            READY
          </div>
          <div className="metric-desc">6-Stage Closed-Loop Response Protocol</div>
        </div>
      </div>

      {/* Decision Support Shortcuts */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ color: 'var(--accent-primary)' }}><CpuIcon size={18} /></div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-bright)', fontSize: '0.85rem' }}>VAJRA Decision Support Shortcuts</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Direct investigation workflows for shift operators</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" style={{ height: '32px', fontSize: '0.75rem' }} onClick={() => onNavigateToIncident('INC-M204-001')}>
              <ActivityIcon size={12} /> Summarize M-204 Root Cause
            </button>
            <button className="btn btn-outline" style={{ height: '32px', fontSize: '0.75rem' }} onClick={() => onNavigateToIncident('INC-M204-001')}>
              <BookOpenIcon size={12} /> Fetch Emergency SOP
            </button>
            <button className="btn btn-outline" style={{ height: '32px', fontSize: '0.75rem' }} onClick={() => onNavigateToMachine('M-204')}>
              <TrendingUpIcon size={12} /> Check Vibration Z-Score
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Overview & Recent Incidents Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Machine Status Table */}
        <div className="card">
          <div className="card-title">
            <span>Fleet Status Overview</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Feed</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Machine ID</th>
                  <th>Name & Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine.id}>
                    <td className="mono" style={{ fontWeight: 600, color: machine.id === 'M-204' ? 'var(--status-critical)' : 'inherit' }}>
                      {machine.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{machine.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{machine.type}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{machine.location}</td>
                    <td>
                      <span className={`badge badge-${machine.status.toLowerCase()}`}>
                        {machine.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={() => onNavigateToMachine(machine.id)}
                      >
                        Inspect Telemetry <ChevronRightIcon size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Incident List */}
        <div className="card">
          <div className="card-title">
            <span>Active Incidents</span>
            <span className="badge badge-critical">{incidents.length} Open</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {incidents.map((incident) => (
              <div
                key={incident.id}
                style={{
                  backgroundColor: 'var(--bg-surface-secondary)',
                  border: '1px solid var(--border-color)',
                  borderLeft: incident.severity === 'CRITICAL' ? '3px solid var(--status-critical)' : '3px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.85rem 1rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
                onClick={() => onNavigateToIncident(incident.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{incident.id}</span>
                  <span className={`badge badge-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
                </div>
                <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-bright)', marginBottom: '0.25rem' }}>
                  {incident.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Target: {incident.machine_id}</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    Investigate <ChevronRightIcon size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
