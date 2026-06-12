const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveRefreshToken: (token) => ipcRenderer.invoke('save-refresh-token', token),
  getRefreshToken: () => ipcRenderer.invoke('get-refresh-token'),
  deleteRefreshToken: () => ipcRenderer.invoke('delete-refresh-token'),
  startOAuthFlow: (clientId, clientSecret) => ipcRenderer.invoke('start-oauth-flow', clientId, clientSecret),
  refreshAccessToken: (clientId, clientSecret, refreshToken) => ipcRenderer.invoke('refresh-access-token', clientId, clientSecret, refreshToken)
});
