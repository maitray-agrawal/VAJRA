import React from 'react';

export type AstraXLogoVariant = 'primary' | 'dark' | 'light' | 'monochrome' | 'sandstone' | 'transparent';

export interface AstraXLogoProps {
  variant?: AstraXLogoVariant;
  size?: number;
  iconOnly?: boolean;
  className?: string;
}

export const AstraXLogo: React.FC<AstraXLogoProps> = ({
  variant = 'primary',
  size = 28,
  iconOnly = true,
  className = ''
}) => {
  const assetMap: Record<AstraXLogoVariant, { icon: string; full: string }> = {
    primary: {
      icon: '/brand/astrax_icon_primary.png',
      full: '/brand/astrax_primary.png'
    },
    dark: {
      icon: '/brand/astrax_icon_dark.png',
      full: '/brand/astrax_dark.png'
    },
    light: {
      icon: '/brand/astrax_icon_transparent.png',
      full: '/brand/astrax_light.png'
    },
    monochrome: {
      icon: '/brand/astrax_icon_monochrome.png',
      full: '/brand/astrax_monochrome.png'
    },
    sandstone: {
      icon: '/brand/astrax_icon_sandstone.png',
      full: '/brand/astrax_sandstone.png'
    },
    transparent: {
      icon: '/brand/astrax_icon_transparent.png',
      full: '/brand/astrax_transparent.png'
    }
  };

  const src = iconOnly ? assetMap[variant].icon : assetMap[variant].full;

  return (
    <img
      src={src}
      alt={iconOnly ? 'AstraX Intelligence Icon' : 'AstraX Master Logo'}
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'inline-block' }}
      className={`astrax-logo-img ${className}`}
    />
  );
};
