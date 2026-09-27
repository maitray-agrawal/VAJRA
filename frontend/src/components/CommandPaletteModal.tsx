import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon, CpuIcon, AlertTriangleIcon, ActivityIcon, BookOpenIcon, ShieldCheckIcon } from './Icons';
import { NavigationTab } from './Layout';

interface SearchItem {
  id: string;
  title: string;
  category: 'Assets' | 'Incidents' | 'Telemetry' | 'Knowledge' | 'Audit';
  subtitle: string;
  badge?: string;
  badgeType?: 'critical' | 'warning' | 'normal' | 'info';
  tab: NavigationTab;
  targetId?: string;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Assets
  {
    id: 'M-204',
    title: 'Machine M-204 — Hydraulic Drive & Bearing',
    category: 'Assets',
    subtitle: 'Line B - Station 4 • Centrifugal Compressor',
    badge: 'CRITICAL',
    badgeType: 'critical',
    tab: 'machines',
    targetId: 'M-204'
  },
  {
    id: 'M-101',
    title: 'Machine M-101 — Auxiliary Cooling Pump',
    category: 'Assets',
    subtitle: 'Line A - Cooling Station • Fluid Coolant Circulation',
    badge: 'OPERATIONAL',
    badgeType: 'normal',
    tab: 'machines',
    targetId: 'M-101'
  },
  {
    id: 'M-305',
    title: 'Machine M-305 — Turbine Generator',
    category: 'Assets',
    subtitle: 'Substation 2 • Standby Power Generation',
    badge: 'OPERATIONAL',
    badgeType: 'normal',
    tab: 'machines',
    targetId: 'M-305'
  },

  // Incidents
  {
    id: 'INC-M204-001',
    title: 'INC-M204-001 — Bearing Degradation',
    category: 'Incidents',
    subtitle: 'Vibration spike 7.82 mm/s • Maintenance overdue MNT-882',
    badge: 'CRITICAL',
    badgeType: 'critical',
    tab: 'incidents',
    targetId: 'INC-M204-001'
  },

  // Telemetry
  {
    id: 'TEL-VIB',
    title: 'Vibration Sensor CH-02 (Accelerometer)',
    category: 'Telemetry',
    subtitle: 'Observed 7.82 mm/s • Baseline 2.50 mm/s (+132.8% Z = +3.83)',
    badge: 'ANOMALY',
    badgeType: 'critical',
    tab: 'machines',
    targetId: 'M-204'
  },
  {
    id: 'TEL-TEMP',
    title: 'Bearing Temperature RTD-04 (Thermal)',
    category: 'Telemetry',
    subtitle: 'Observed 88.4°C • Nominal envelope 52.0°C - 75.0°C',
    badge: 'ELEVATED',
    badgeType: 'warning',
    tab: 'machines',
    targetId: 'M-204'
  },

  // Knowledge
  {
    id: 'SOP-M204-BEARING',
    title: 'SOP-M204-BEARING — Emergency Containment',
    category: 'Knowledge',
    subtitle: 'Bearing Failure Lockout & Lubrication Flushing Protocol',
    badge: 'INDEXED',
    badgeType: 'info',
    tab: 'sops',
    targetId: 'SOP-M204-BEARING'
  },
  {
    id: 'SOP-COOLING-PUMP',
    title: 'SOP-COOLING-PUMP — Secondary Pump Response',
    category: 'Knowledge',
    subtitle: 'Loop pressure drop < 2.0 bar & bypass valve actuation',
    badge: 'INDEXED',
    badgeType: 'info',
    tab: 'sops',
    targetId: 'SOP-COOLING-PUMP'
  },

  // Audit
  {
    id: 'AUDIT-LEDGER',
    title: 'SHA-256 Decision Ledger & Root Hashes',
    category: 'Audit',
    subtitle: 'Cryptographic parent-child hash verification & forensic trail',
    badge: 'VERIFIED',
    badgeType: 'normal',
    tab: 'audit',
    targetId: 'AUDIT-LEDGER'
  }
];

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tab: NavigationTab, targetId?: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = SEARCH_DATABASE.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          const item = filteredItems[selectedIndex];
          onSelect(item.tab, item.targetId);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose, onSelect]);

  if (!isOpen) return null;

  const categories = ['Assets', 'Incidents', 'Telemetry', 'Knowledge', 'Audit'] as const;

  const getCategoryIcon = (cat: typeof categories[number]) => {
    switch (cat) {
      case 'Assets': return <CpuIcon size={14} />;
      case 'Incidents': return <AlertTriangleIcon size={14} />;
      case 'Telemetry': return <ActivityIcon size={14} />;
      case 'Knowledge': return <BookOpenIcon size={14} />;
      case 'Audit': return <ShieldCheckIcon size={14} />;
    }
  };

  let globalCounter = 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card command-palette-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Global Search Command Palette"
      >
        {/* Search Input Bar */}
        <div className="palette-input-wrap">
          <SearchIcon size={16} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets, telemetry, incident IDs, SOPs, audit records..."
            aria-autocomplete="list"
          />
          <span className="search-shortcut">Esc to close</span>
          <button
            type="button"
            onClick={onClose}
            className="palette-close-btn"
            aria-label="Close search"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Results Body */}
        <div className="palette-results">
          {filteredItems.length === 0 ? (
            <div className="palette-empty-state">
              <p style={{ margin: 0, fontWeight: 500 }}>No operational entities found</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                No assets, incidents, telemetry signals or SOP documents match "{query}".
              </p>
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = filteredItems.filter((i) => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="palette-group">
                  <div className="palette-group-header">
                    <span className="palette-group-icon">{getCategoryIcon(cat)}</span>
                    <span>{cat}</span>
                    <span className="palette-group-count">{catItems.length}</span>
                  </div>

                  <div className="palette-group-items">
                    {catItems.map((item) => {
                      const itemIndex = globalCounter++;
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          className={`palette-item ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            onSelect(item.tab, item.targetId);
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <div className="palette-item-main">
                            <div className="palette-item-title-row">
                              <span className="palette-item-title">{item.title}</span>
                              {item.badge && (
                                <span className={`badge badge-${item.badgeType || 'info'}`} style={{ fontSize: '0.62rem' }}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="palette-item-subtitle">{item.subtitle}</div>
                          </div>
                          <span className="palette-item-action">Jump →</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Palette Footer */}
        <div className="palette-footer">
          <div className="palette-footer-keys">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>Esc</kbd> Dismiss</span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>VAJRA Operational Command Palette</span>
        </div>
      </div>
    </div>
  );
};
