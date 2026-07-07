const { app, BrowserWindow, ipcMain, safeStorage, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let mainWindow = null;
let oauthServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    title: "FitApp Premium"
  });

  // Clear cache and service workers on startup during development to prevent stale Service Worker caching issues
  mainWindow.webContents.session.clearCache();
  mainWindow.webContents.session.clearStorageData({ storages: ['serviceworkers'] });
  
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Paths and Secure Storage Helpers
const getSecureStorePath = () => {
  return path.join(app.getPath('userData'), 'secure_store.json');
};

// IPC Handlers

// 1. Save Refresh Token securely
ipcMain.handle('save-refresh-token', async (event, token) => {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('OS encryption storage is not available on this machine.');
    }
    const encryptedBuffer = safeStorage.encryptString(token);
    const payload = {
      refreshToken: encryptedBuffer.toString('base64')
    };
    await fs.promises.writeFile(getSecureStorePath(), JSON.stringify(payload), 'utf8');
    return { success: true };
  } catch (err) {
    console.error('[Main Process] Failed to securely save refresh token:', err);
    throw err;
  }
});

// 2. Load Refresh Token securely
ipcMain.handle('get-refresh-token', async () => {
  try {
    const storePath = getSecureStorePath();
    let rawData;
    try {
      rawData = await fs.promises.readFile(storePath, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return null;
      }
      throw err;
    }
    const payload = JSON.parse(rawData);
    if (!payload.refreshToken) {
      return null;
    }
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error('OS encryption storage is not available on this machine.');
    }
    const encryptedBuffer = Buffer.from(payload.refreshToken, 'base64');
    const decryptedToken = safeStorage.decryptString(encryptedBuffer);
    return decryptedToken;
  } catch (err) {
    console.error('[Main Process] Failed to securely load refresh token:', err);
    return null;
  }
});

// 3. Delete Refresh Token
ipcMain.handle('delete-refresh-token', async () => {
  try {
    const storePath = getSecureStorePath();
    try {
      await fs.promises.unlink(storePath);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    return { success: true };
  } catch (err) {
    console.error('[Main Process] Failed to delete secure store file:', err);
    throw err;
  }
});

// 4. Start OAuth Desktop Flow using Loopback Server
ipcMain.handle('start-oauth-flow', async (event, clientId, clientSecret) => {
  return new Promise((resolve, reject) => {
    // Shutdown any existing OAuth server running
    if (oauthServer) {
      oauthServer.close();
    }

    const port = 8085;
    const redirectUri = `http://localhost:${port}`;

    oauthServer = http.createServer(async (req, res) => {
      try {
        const reqUrl = new URL(req.url, redirectUri);
        const code = reqUrl.searchParams.get('code');
        const error = reqUrl.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="background-color: #1e293b; padding: 2rem; border-radius: 1rem; text-align: center; border: 1px solid #ef4444;">
                  <h1 style="color: #ef4444; margin-top: 0;">Authentication Error</h1>
                  <p>Google OAuth failed: ${error}</p>
                </div>
              </body>
            </html>
          `);
          reject(new Error(`OAuth Error from Google: ${error}`));
          return;
        }

        if (code) {
          // Send friendly response to browser tab
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="background-color: #1e293b; padding: 2rem; border-radius: 1rem; text-align: center;">
                  <h1 style="color: #6366f1; margin-top: 0;">Authentication Successful!</h1>
                  <p>FitApp has been linked. You can close this browser tab and return to the application.</p>
                </div>
              </body>
            </html>
          `);

          // Exchange code for tokens
          try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
              })
            });

            if (!tokenResponse.ok) {
              const errorText = await tokenResponse.text();
              console.error('[OAuth Token Exchange Failed]', tokenResponse.status, tokenResponse.statusText, errorText);
              throw new Error(`Token exchange failed: ${tokenResponse.statusText} - ${errorText}`);
            }

            const tokens = await tokenResponse.json();
            resolve(tokens);
          } catch (exchangeErr) {
            console.error('[OAuth Server Error during exchange]:', exchangeErr);
            reject(exchangeErr);
          } finally {
            // Close the loopback server in the next tick
            process.nextTick(() => {
              oauthServer.close();
              oauthServer = null;
            });
          }
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>Invalid OAuth callback</h1>');
        }
      } catch (err) {
        console.error('[OAuth Server] Request handler error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal server error');
        reject(err);
      }
    });

    oauthServer.listen(port, (err) => {
      if (err) {
        console.error(`[OAuth Server] Failed to listen on port ${port}:`, err);
        reject(err);
        return;
      }

      console.log(`[OAuth Server] Loopback server listening on port ${port}`);

      // Generate authorize URL and launch default browser
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/drive.file',
        access_type: 'offline',
        prompt: 'consent'
      }).toString();

      shell.openExternal(authUrl).catch(shellErr => {
        reject(new Error(`Failed to launch external browser: ${shellErr.message}`));
      });
    });

    oauthServer.on('error', (err) => {
      console.error('[OAuth Server] Server error event:', err);
      reject(err);
    });
  });
});

// 5. Refresh Access Token using Refresh Token
ipcMain.handle('refresh-access-token', async (event, clientId, clientSecret, refreshToken) => {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`);
    }

    const tokens = await response.json();
    return tokens;
  } catch (err) {
    console.error('[Main Process] Failed to refresh access token:', err);
    throw err;
  }
});
