import { ConfigProvider, theme as antTheme } from 'antd';
import { useThemeStore } from '@/store/theme-store';
import type { ReactNode } from 'react';

const lightTokens = {
  colorPrimary: '#3A8DFF',
  colorBgContainer: '#FFFFFF',
  colorBgLayout: '#F4F5F7',
  colorBgElevated: '#FFFFFF',
  colorBgSpotlight: '#FFFFFF',
  colorText: '#2D3142',
  colorTextSecondary: '#4A5568',
  colorTextTertiary: '#8A94A6',
  colorTextQuaternary: '#AEB7C4',
  colorBorder: '#D0D5DD',
  colorBorderSecondary: '#E8EBF0',
  borderRadius: 2,
  fontFamily: "'Manrope', sans-serif",
  colorSuccess: '#21B573',
  colorWarning: '#FFB020',
  colorError: '#E5484D',
  colorInfo: '#3A8DFF',
  colorLink: '#3A8DFF',
  controlItemBgActive: '#EDF4FF',
  controlItemBgHover: '#F4F5F7',
  colorFillQuaternary: '#F8F9FB',
  colorFillSecondary: '#F4F5F7',
};

const darkTokens = {
  colorPrimary: '#3A8DFF',
  colorBgContainer: '#1e2028',
  colorBgLayout: '#14161c',
  colorBgElevated: '#262830',
  colorBgSpotlight: '#262830',
  colorText: '#e8eaed',
  colorTextSecondary: '#AEB7C4',
  colorTextTertiary: '#8A94A6',
  colorTextQuaternary: '#6b7280',
  colorBorder: '#363940',
  colorBorderSecondary: '#2a2d35',
  borderRadius: 2,
  fontFamily: "'Manrope', sans-serif",
  colorSuccess: '#21B573',
  colorWarning: '#FFB020',
  colorError: '#E5484D',
  colorInfo: '#3A8DFF',
  colorLink: '#3A8DFF',
  controlItemBgActive: 'rgba(58,141,255,0.15)',
  controlItemBgHover: 'rgba(255,255,255,0.06)',
  colorFillQuaternary: 'rgba(255,255,255,0.04)',
  colorFillSecondary: 'rgba(255,255,255,0.06)',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeMode } = useThemeStore();
  const isDark = themeMode === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: isDark ? darkTokens : lightTokens,
        components: {
          Button: { borderRadius: 2, controlHeight: 40, fontWeight: 600 },
          Card: { borderRadius: 2, paddingLG: 28 },
          Input: { borderRadius: 2, controlHeight: 40 },
          Select: { borderRadius: 2, controlHeight: 40 },
          Table: { borderRadius: 2 },
          Tag: { borderRadius: 2 },
          Menu: { borderRadius: 0, itemBorderRadius: 0 },
          Layout: {
            siderBg: isDark ? '#1a1d24' : '#2D3142',
            headerBg: isDark ? '#14161c' : '#FFFFFF',
            bodyBg: isDark ? '#14161c' : '#F4F5F7',
          },
          Modal: {},
          Dropdown: {},
          Tabs: { inkBarColor: '#3A8DFF', itemActiveColor: '#3A8DFF', itemSelectedColor: '#3A8DFF' },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
