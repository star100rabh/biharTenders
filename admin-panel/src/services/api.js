/**
 * @file admin-panel/src/services/api.js
 * @description Administrative API client communicating with backend /api/v1/admin endpoints.
 */

export const PRODUCTION_BACKEND_URL = 'https://bihartenders-backend.onrender.com/api/v1/admin';
export const LOCAL_BACKEND_URL = 'http://localhost:8000/api/v1/admin';

const sanitizeUrl = (url) => {
  if (!url) return '';
  return url.trim().replace('bihartenders-backend-jofq.onrender.com', 'bihartenders-backend.onrender.com');
};

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = sessionStorage.getItem('ADMIN_CUSTOM_API_URL') || localStorage.getItem('ADMIN_CUSTOM_API_URL');
    if (custom) return sanitizeUrl(custom);
  }
  if (import.meta.env.VITE_API_URL) {
    return sanitizeUrl(import.meta.env.VITE_API_URL);
  }
  return PRODUCTION_BACKEND_URL;
};

export const setCustomApiUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (url) {
      const clean = sanitizeUrl(url);
      sessionStorage.setItem('ADMIN_CUSTOM_API_URL', clean);
      localStorage.setItem('ADMIN_CUSTOM_API_URL', clean);
    } else {
      sessionStorage.removeItem('ADMIN_CUSTOM_API_URL');
      localStorage.removeItem('ADMIN_CUSTOM_API_URL');
    }
  }
};

export function getStoredAdminKey() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('TENDERHUB_ADMIN_KEY') || localStorage.getItem('TENDERHUB_ADMIN_KEY') || '';
}

export function getStoredAdminEmail() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem('TENDERHUB_ADMIN_EMAIL') || localStorage.getItem('TENDERHUB_ADMIN_EMAIL') || '';
}

export function setStoredAdminCredentials(key, email, persist = false) {
  sessionStorage.setItem('TENDERHUB_ADMIN_KEY', key);
  sessionStorage.setItem('TENDERHUB_ADMIN_EMAIL', email);
  if (persist) {
    localStorage.setItem('TENDERHUB_ADMIN_KEY', key);
    localStorage.setItem('TENDERHUB_ADMIN_EMAIL', email);
  } else {
    localStorage.removeItem('TENDERHUB_ADMIN_KEY');
    localStorage.removeItem('TENDERHUB_ADMIN_EMAIL');
  }
}

export function setStoredAdminKey(key, persist = false) {
  sessionStorage.setItem('TENDERHUB_ADMIN_KEY', key);
  if (persist) {
    localStorage.setItem('TENDERHUB_ADMIN_KEY', key);
  } else {
    localStorage.removeItem('TENDERHUB_ADMIN_KEY');
  }
}

export function clearStoredAdminCredentials() {
  sessionStorage.removeItem('TENDERHUB_ADMIN_KEY');
  sessionStorage.removeItem('TENDERHUB_ADMIN_EMAIL');
  localStorage.removeItem('TENDERHUB_ADMIN_KEY');
  localStorage.removeItem('TENDERHUB_ADMIN_EMAIL');
}

export function clearStoredAdminKey() {
  clearStoredAdminCredentials();
}

async function request(endpoint, options = {}) {
  const adminKey = options.adminKey || getStoredAdminKey();
  const adminEmail = options.adminEmail || getStoredAdminEmail();

  const headers = {
    'Content-Type': 'application/json',
    'x-admin-key': adminKey,
    'x-admin-email': adminEmail,
    ...options.headers,
  };

  const primaryUrl = getBaseUrl();
  let response;

  try {
    response = await fetch(`${primaryUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    if (primaryUrl !== PRODUCTION_BACKEND_URL) {
      console.warn(`Primary backend ${primaryUrl} failed (${err.message}). Retrying with production fallback ${PRODUCTION_BACKEND_URL}...`);
      try {
        response = await fetch(`${PRODUCTION_BACKEND_URL}${endpoint}`, {
          ...options,
          headers,
        });
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ADMIN_CUSTOM_API_URL', PRODUCTION_BACKEND_URL);
        }
      } catch (fallbackErr) {
        throw new Error(`Failed to reach backend at ${primaryUrl}`);
      }
    } else {
      throw err;
    }
  }

  if (response.status === 401) {
    clearStoredAdminCredentials();
    const error = new Error('UNAUTHORIZED_ADMIN');
    error.status = 401;
    throw error;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP ${response.status}`);
  }

  return data;
}

export const adminApi = {
  verify: (key, email) => request('/verify', { adminKey: key, adminEmail: email }),
  getTelemetry: () => request('/telemetry'),
  getOverview: () => request('/overview'),
  getDiagnostics: () => request('/diagnostics'),
  getLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/logs?${query}`);
  },
  resolveLog: (id) => request(`/logs/${id}/resolve`, { method: 'POST' }),
  getSyncHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/sync/history?${query}`);
  },
  getLiveSyncStatus: () => request('/sync/live-status'),
  triggerManualSync: (options = {}) => 
    request('/sync/trigger', { 
      method: 'POST', 
      body: JSON.stringify(options) 
    }),
  stopActiveSync: () => request('/sync/stop', { method: 'POST' }),
  resetCrawlCheckpoint: () => request('/sync/checkpoint/reset', { method: 'POST' }),
  triggerMissingPdfRecovery: () => request('/sync/retry-missing-pdfs', { method: 'POST' }),
  getPendingDocsOverview: () => request('/pending-docs/overview'),
  triggerPendingDocsFetch: (options = {}) => 
    request('/pending-docs/fetch', { 
      method: 'POST', 
      body: JSON.stringify(options) 
    }),
  updateScheduleConfig: (isAutomatedSyncEnabled) => 
    request('/sync/schedule-config', {
      method: 'POST',
      body: JSON.stringify({ isAutomatedSyncEnabled }),
    }),
  purgeExpiredArchive: () => request('/maintenance/purge-archive', { method: 'POST' }),
  purgeExpiredTenders: () => request('/maintenance/purge-expired', { method: 'POST' }),
  getBackupStatus: () => request('/backup/status'),
  triggerBackup: (type = 'database') => 
    request('/backup/trigger', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  syncMirror: () => request('/backup/sync-mirror', { method: 'POST' }),
  downloadBackupFile: async (fileName) => {
    const adminKey = getStoredAdminKey();
    const response = await fetch(`${BASE_URL}/backup/download/${encodeURIComponent(fileName)}`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (!response.ok) {
      throw new Error(`Failed to download backup archive: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
  downloadDisasterRecoveryGuide: async () => {
    const adminKey = getStoredAdminKey();
    const response = await fetch(`${BASE_URL}/backup/disaster-recovery-guide`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (!response.ok) {
      throw new Error(`Failed to download disaster recovery manual: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TenderHub_Disaster_Recovery_and_Backup_Manual.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
  downloadDeploymentGuide: async () => {
    const adminKey = getStoredAdminKey();
    const response = await fetch(`${BASE_URL}/backup/deployment-guide`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (!response.ok) {
      throw new Error(`Failed to download deployment manual: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TenderHub_Production_Deployment_Manual.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
  downloadFutureConfigGuide: async () => {
    const adminKey = getStoredAdminKey();
    const response = await fetch(`${BASE_URL}/backup/future-config-guide`, {
      headers: { 'x-admin-key': adminKey },
    });
    if (!response.ok) {
      throw new Error(`Failed to download future configuration manual: HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TenderHub_Future_Configurations_Render_and_Failover.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  },
};

