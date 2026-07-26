import React, { createContext, useState, useEffect } from 'react';
import { getSettingsApi } from '../services/settingService';
import { SCHOOL_DEFAULTS } from '../utils/constants';

export const SettingContext = createContext();

export const SettingProvider = ({ children }) => {
  const [settings, setSettings] = useState(SCHOOL_DEFAULTS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettingsApi();
      if (res.success && res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.warn('[SettingContext] Could not fetch remote settings, using default preset:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingContext.Provider value={{ settings, loading, fetchSettings }}>
      {children}
    </SettingContext.Provider>
  );
};
