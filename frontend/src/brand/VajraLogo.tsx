import React from 'react';

export type VajraLogoVariant = 'primary' | 'dark' | 'monochrome' | 'sandstone' | 'inverted' | 'icon' | 'transparent';

export interface VajraLogoProps {
  variant?: VajraLogoVariant;
  size?: number;
  showWordmark?: boolean;
  showAttribution?: boolean;
  showDomain?: boolean;
  className?: string;
  useAssetImage?: boolean;
}

export const VajraLogo: React.FC<VajraLogoProps> = ({
  variant = 'primary',
  size = 32,
  showWordmark = false,
  showAttribution = false,
  showDomain = false,
  className = '',
  useAssetImage = false
}) => {
  // Asset map for approved raster files from master AstraX board
  const assetMap: Record<VajraLogoVariant, string> = {
    primary: '/brand/vajra_icon_primary.png',
    dark: '/brand/vajra_icon_dark.png',
    monochrome: '/brand/vajra_icon_monochrome.png',
    sandstone: '/brand/vajra_icon_sandstone.png',
    inverted: '/brand/vajra_icon_inverted.png',
    icon: '/brand/vajra_icon_transparent.png',
    transparent: '/brand/vajra_icon_transparent.png'
  };

  const copperColor = variant === 'dark' ? '#C8873D' : variant === 'monochrome' ? '#221B14' : variant === 'inverted' ? '#FDF7EC' : '#B87333';
  const vermilionColor = variant === 'monochrome' ? '#221B14' : variant === 'inverted' ? '#FFFFFF' : '#DC2626';
  const bladeColor = variant === 'dark' ? '#C8873D' : variant === 'monochrome' ? '#221B14' : variant === 'inverted' ? '#FDF7EC' : '#452613';
  const guideColor = variant === 'dark' ? 'rgba(200, 135, 61, 0.25)' : variant === 'monochrome' ? 'rgba(34, 27, 20, 0.2)' : 'rgba(184, 115, 51, 0.22)';
  const textColor = variant === 'dark' ? '#FDF7EC' : variant === 'inverted' ? '#FFFFFF' : '#221B14';
  const subtextColor = variant === 'dark' ? '#B7BEC8' : '#7D7062';

  const renderMark = () => {
    if (useAssetImage) {
      return (
        <img
          src={assetMap[variant] || assetMap.primary}
          alt="VAJRA Project Mark"
          width={size}
          height={size}
          style={{ objectFit: 'contain', display: 'block' }}
          className="vajra-mark-img"
        />
      );
    }

    // Mathematical SVG construction faithfully adhering to the AstraX logo board geometry
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="vajra-mark-svg"
        aria-hidden="true"
      >
        {/* Subtle Astra Grid guide lines */}
        <line x1="60" y1="36" x2="26" y2="54" stroke={guideColor} strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="60" y1="36" x2="94" y2="54" stroke={guideColor} strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Central Vertical Axis */}
        <line x1="60" y1="20" x2="60" y2="94" stroke={copperColor} strokeWidth="2.2" strokeLinecap="square" />

        {/* Angular V-Wings / Main Crossed Arms */}
        <polyline
          points="26,54 60,98 94,54"
          fill="none"
          stroke={copperColor}
          strokeWidth="3.2"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />

        {/* Downward Angular Razor Blades */}
        <polygon points="53,88 22,104 46,84" fill={bladeColor} />
        <polygon points="67,88 98,104 74,84" fill={bladeColor} />

        {/* Central Bindu Diamond (Core decision node) */}
        <polygon points="60,68 68,76 60,84 52,76" fill="none" stroke={copperColor} strokeWidth="2.5" />
        <polygon points="60,73 63,76 60,79 57,76" fill={copperColor} />

        {/* Mid-axis Diamond Node */}
        <polygon points="60,32 65,37 60,42 55,37" fill="none" stroke={copperColor} strokeWidth="2" />

        {/* Left Wing Node */}
        <polygon points="26,48 32,54 26,60 20,54" fill={copperColor} />

        {/* Right Wing Node */}
        <polygon points="94,48 100,54 94,60 88,54" fill={copperColor} />

        {/* Top Spearhead / Vermilion Diamond Tip */}
        <polygon points="60,6 66,16 60,26 54,16" fill={vermilionColor} />
        <line x1="60" y1="11" x2="60" y2="21" stroke="#221B14" strokeWidth="1" />
      </svg>
    );
  };

  if (!showWordmark && !showAttribution && !showDomain) {
    return (
      <div className={`vajra-logo-container ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {renderMark()}
      </div>
    );
  }

  return (
    <div className={`vajra-brand-lockup ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ flexShrink: 0 }}>{renderMark()}</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: `${Math.max(16, size * 0.58)}px`,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: textColor
            }}
          >
            VAJRA
          </span>
          {showDomain && (
            <span
              className="mono"
              style={{
                fontSize: '9px',
                color: 'var(--accent)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              CRISIS INTELLIGENCE
            </span>
          )}
        </div>
        {showAttribution && (
          <span
            style={{
              fontSize: '8.5px',
              color: subtextColor,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginTop: '2px'
            }}
          >
            AN ASTRA X INTELLIGENCE SYSTEM
          </span>
        )}
      </div>
    </div>
  );
};
