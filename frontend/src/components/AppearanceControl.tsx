import React from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { MonitorIcon, SunIcon, MoonIcon } from './Icons';

export const AppearanceControl: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'system', label: 'System', icon: <MonitorIcon size={13} /> },
    { id: 'light', label: 'Light', icon: <SunIcon size={13} /> },
    { id: 'dark', label: 'Dark', icon: <MoonIcon size={13} /> },
  ];

  return (
    <div className="appearance-segmented-control" role="radiogroup" aria-label="Appearance Mode">
      {options.map((opt) => {
        const isActive = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.id)}
            className={`appearance-segment-btn ${isActive ? 'active' : ''}`}
            title={`${opt.label} Appearance`}
          >
            <span className="appearance-segment-icon">{opt.icon}</span>
            <span className="appearance-segment-text">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
