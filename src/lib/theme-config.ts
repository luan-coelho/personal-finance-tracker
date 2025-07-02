'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ThemeConfig {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
}

export interface NotificationConfig {
  enableNotifications: boolean
  emailNotifications: boolean
  desktopNotifications: boolean
  soundAlerts: boolean
}

export interface PrivacyConfig {
  shareUsageData: boolean
  storeHistory: boolean
  autoSave: boolean
}

export interface SystemConfig {
  theme: ThemeConfig
  notifications: NotificationConfig
  privacy: PrivacyConfig
}

interface SystemConfigStore {
  config: SystemConfig
  updateThemeConfig: (config: Partial<ThemeConfig>) => void
  updateNotificationConfig: (config: Partial<NotificationConfig>) => void
  updatePrivacyConfig: (config: Partial<PrivacyConfig>) => void
}

export const useSystemConfig = create<SystemConfigStore>()(
  persist(
    set => ({
      config: {
        theme: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
        },
        notifications: {
          enableNotifications: true,
          emailNotifications: false,
          desktopNotifications: true,
          soundAlerts: false,
        },
        privacy: {
          shareUsageData: true,
          storeHistory: true,
          autoSave: true,
        },
      },
      updateThemeConfig: (newConfig: Partial<ThemeConfig>) =>
        set((state: SystemConfigStore) => ({
          config: {
            ...state.config,
            theme: {
              ...state.config.theme,
              ...newConfig,
            },
          },
        })),
      updateNotificationConfig: (newConfig: Partial<NotificationConfig>) =>
        set((state: SystemConfigStore) => ({
          config: {
            ...state.config,
            notifications: {
              ...state.config.notifications,
              ...newConfig,
            },
          },
        })),
      updatePrivacyConfig: (newConfig: Partial<PrivacyConfig>) =>
        set((state: SystemConfigStore) => ({
          config: {
            ...state.config,
            privacy: {
              ...state.config.privacy,
              ...newConfig,
            },
          },
        })),
    }),
    {
      name: 'sheet-ledger-system-config',
    },
  ),
)

// Para compatibilidade com código existente
export const useThemeConfig = () => {
  const { config, updateThemeConfig } = useSystemConfig()
  return {
    config: config.theme,
    updateConfig: updateThemeConfig,
  }
}

export const getThemeConfig = () => useSystemConfig.getState().config.theme
