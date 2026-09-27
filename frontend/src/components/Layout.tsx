import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DemoGuideModal } from './DemoGuideModal';
import {
  SearchIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  BookOpenIcon,
  TrendingUpIcon,
  BellIcon,
  SlidersIcon,
  CompassIcon
} from './Icons';

export type NavigationTab = 'dashboard' | 'incidents' | 'machines' | 'sops' | 'analytics' | 'alerts' | 'settings';

interface LayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
  activeIncidentCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  activeIncidentCount = 1
}) => {
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(true);

  useEffect(() => {
    let isMounted = true;
    const checkSystemHealth = async () => {
      try {
        const health = await apiService.checkHealth();
        if (isMounted) {
          setSystemHealthy(health.status === 'healthy' || health.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setSystemHealthy(false);
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">V</div>
          <div>
            <div className="sidebar-brand-title">VAJRA</div>
            <div className="sidebar-brand-sub">Agentic Industrial Crisis Response</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Core Operations</div>
          
          <button
            className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onSelectTab('dashboard')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><ActivityIcon size={16} /></span>
              Overview
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'incidents' ? 'active' : ''}`}
            onClick={() => onSelectTab('incidents')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><AlertTriangleIcon size={16} /></span>
              Incidents
            </span>
            {activeIncidentCount > 0 && (
              <span className="sidebar-item-badge">{activeIncidentCount}</span>
            )}
          </button>

          <button
            className={`sidebar-item ${currentTab === 'machines' ? 'active' : ''}`}
            onClick={() => onSelectTab('machines')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><CpuIcon size={16} /></span>
              Fleet & Telemetry
            </span>
          </button>

          <div className="nav-section-title">Intelligence & SOPs</div>

          <button
            className={`sidebar-item ${currentTab === 'sops' ? 'active' : ''}`}
            onClick={() => onSelectTab('sops')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><BookOpenIcon size={16} /></span>
              SOP Knowledge
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => onSelectTab('analytics')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><TrendingUpIcon size={16} /></span>
              Predictive Analytics
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'alerts' ? 'active' : ''}`}
            onClick={() => onSelectTab('alerts')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><BellIcon size={16} /></span>
              Anomaly Feeds
            </span>
          </button>

          <div className="nav-section-title">System</div>

          <button
            className={`sidebar-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => onSelectTab('settings')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><SlidersIcon size={16} /></span>
              Control Config
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.78rem' }}>Plant B — Main Line</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Mode: Human-in-the-Loop</div>
          <button
            onClick={() => setIsDemoGuideOpen(true)}
            className="btn btn-outline"
            style={{
              width: '100%',
              marginTop: '0.75rem',
              height: '32px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}
            title="Launch Demo Guide"
          >
            <CompassIcon size={13} /> Demo Walkthrough
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="search-box">
            <SearchIcon size={14} color="var(--text-muted)" />
            <input type="text" placeholder="Search assets, telemetry, incident IDs..." readOnly />
            <span className="search-shortcut">Ctrl+K</span>
          </div>

          <div className="top-header-actions">
            {/* System Status Indicator */}
            <div className="status-indicator">
              <span className={`status-dot ${systemHealthy === false ? 'critical' : 'normal'}`} />
              <span>{systemHealthy === false ? 'API offline' : 'System operational'}</span>
            </div>

            {/* Ledger Status Indicator */}
            <div className="status-indicator">
              <span className="status-dot info" />
              <span>Ledger verified</span>
            </div>

            {/* Operator Identity */}
            <div className="operator-profile">
              <div className="avatar-circle">OP</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.2 }}>Shift Lead</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Site Operator #42</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page View Container */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      {/* Demo Guide Walkthrough Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigateToTab={(tab) => {
          onSelectTab(tab);
        }}
      />
    </div>
  );
};
