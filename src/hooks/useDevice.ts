// src/hooks/useDevice.ts
/**
 * Hook para detectar tipo de dispositivo
 * Útil para ajustes específicos de UI
 * Implementação SIMPLES
 */

import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  width: number;
  height: number;
}

export const useDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Valores iniciais baseados no window (se disponível)
    if (typeof window !== 'undefined') {
      return getDeviceInfo();
    }
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isSmallMobile: false,
      width: 1200,
      height: 800
    };
  });

  function getDeviceInfo(): DeviceInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isSmallMobile: width <= 480,
      isMobile: width <= 767,
      isTablet: width > 767 && width <= 1023,
      isDesktop: width > 1023
    };
  }

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    // Atualiza no mount
    handleResize();

    // Adiciona listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
};

/**
 * Hook para detectar orientação do dispositivo
 */
export const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerHeight > window.innerWidth;
    }
    return true;
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    isPortrait,
    isLandscape: !isPortrait
  };
};