import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DemoGuideModal } from './DemoGuideModal';
import { AppearanceControl } from './AppearanceControl';
import { CommandPaletteModal } from './CommandPaletteModal';
import {
  SearchIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  BookOpenIcon,
  TrendingUpIcon,
  BellIcon,
  SlidersIcon,
  CompassIcon,
  ShieldCheckIcon,
  MenuIcon,
  XIcon
} from './Icons';

export type NavigationTab = 'dashboard' | 'incidents' | 'machines' | 'sops' | 'analytics' | 'alerts' | 'settings' | 'audit';

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
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(true);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // System Health Polling
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

  const handleTabSelect = (tab: NavigationTab) => {
    onSelectTab(tab);
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileSidebarOpen ? 'open' : ''}`} aria-label="Operations Navigation Rail">
        <div className="sidebar-header">
          <div className="sidebar-logo">V</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-brand-title">VAJRA</div>
            <div className="sidebar-brand-sub">Agentic Industrial Crisis Response</div>
          </div>
          {isMobileSidebarOpen && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              aria-label="Close sidebar"
            >
              <XIcon size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Operations</div>

          <button
            className={`sidebar-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabSelect('dashboard')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><ActivityIcon size={16} /></span>
              Overview
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'incidents' ? 'active' : ''}`}
            onClick={() => handleTabSelect('incidents')}
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
            onClick={() => handleTabSelect('machines')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><CpuIcon size={16} /></span>
              Fleet & Telemetry
            </span>
          </button>

          <div className="nav-section-title">Intelligence</div>

          <button
            className={`sidebar-item ${currentTab === 'sops' ? 'active' : ''}`}
            onClick={() => handleTabSelect('sops')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><BookOpenIcon size={16} /></span>
              SOP Knowledge
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleTabSelect('analytics')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><TrendingUpIcon size={16} /></span>
              Predictive Analytics
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'alerts' ? 'active' : ''}`}
            onClick={() => handleTabSelect('alerts')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><BellIcon size={16} /></span>
              Anomaly Feeds
            </span>
          </button>

          <div className="nav-section-title">System</div>

          <button
            className={`sidebar-item ${currentTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabSelect('settings')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><SlidersIcon size={16} /></span>
              Control Config
            </span>
          </button>

          <button
            className={`sidebar-item ${currentTab === 'audit' ? 'active' : ''}`}
            onClick={() => handleTabSelect('audit')}
          >
            <span className="sidebar-item-label">
              <span className="item-icon"><ShieldCheckIcon size={16} /></span>
              Audit Ledger
            </span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-system-status">
            <span className={`status-dot ${systemHealthy === false ? 'critical' : 'normal'}`} />
            <span>{systemHealthy === false ? 'Connection degraded' : 'Operational'}</span>
          </div>

          <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.78rem' }}>Plant B — Main Line</div>
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

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header Bar */}
        <header className="top-header">
          <div className="top-header-left">
            <button
              className="mobile-menu-trigger"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <MenuIcon size={18} />
            </button>

            {/* Global Search Command Trigger */}
            <button
              type="button"
              className="search-box-btn"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search assets, telemetry, incident IDs"
            >
              <SearchIcon size={14} color="var(--text-muted)" />
              <span className="search-box-text">Search assets, telemetry, incident IDs...</span>
              <span className="search-shortcut">⌘K</span>
            </button>
          </div>

          <div className="top-header-actions">
            {/* System Status Indicator */}
            <div className="status-indicator">
              <span className={`status-dot ${systemHealthy === false ? 'critical' : 'normal'}`} />
              <span>{systemHealthy === false ? 'Connection degraded' : 'System operational'}</span>
            </div>

            {/* Ledger Status Indicator */}
            <div className="status-indicator">
              <span className="status-dot info" />
              <span>Ledger verified</span>
            </div>

            {/* Premium Appearance Control */}
            <AppearanceControl />

            {/* Operator Identity */}
            <div className="operator-profile">
              <div className="avatar-circle">OP</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>Shift Lead</div>
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

      {/* Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(tab) => {
          handleTabSelect(tab);
        }}
      />

      {/* Demo Guide Walkthrough Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onNavigateToTab={(tab) => {
          handleTabSelect(tab);
        }}
      />
    </div>
  );
};
