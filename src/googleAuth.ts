import firebaseConfig from '../firebase-applet-config.json';

// Memory cache for token and user info
let cachedAccessToken: string | null = null;
let cachedUser: { displayName: string; email: string } | null = null;

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.body.appendChild(script);
  });
}

// Compatibility helper
export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (cachedAccessToken && cachedUser) {
    if (onAuthSuccess) onAuthSuccess(cachedUser, cachedAccessToken);
  } else {
    if (onAuthFailure) onAuthFailure();
  }
  return () => {};
};

/**
 * Trigger direct Google OAuth 2.0 flow via Google Identity Services (GIS).
 * Bypasses Firebase Auth domain authorization restrictions.
 */
export const googleSignIn = async (): Promise<{ user: { displayName: string; email: string }; accessToken: string } | null> => {
  await loadGsiScript();

  return new Promise((resolve, reject) => {
    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (response: any) => {
          if (response.error) {
            let errorMsg = response.error_description || response.error || 'Error al autenticar con Google';
            if (response.error === 'access_denied') {
              errorMsg = 'El usuario canceló la autorización de Google Drive.';
            }
            reject(new Error(errorMsg));
            return;
          }
          if (response.access_token) {
            cachedAccessToken = response.access_token;
            let userInfo = { displayName: 'Usuario de Google', email: '' };
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              if (res.ok) {
                const info = await res.json();
                userInfo = {
                  displayName: info.name || info.given_name || 'Usuario de Google',
                  email: info.email || '',
                };
              }
            } catch (e) {
              console.warn('No se pudo obtener información del usuario:', e);
            }
            cachedUser = userInfo;
            resolve({ user: userInfo, accessToken: response.access_token });
          } else {
            reject(new Error('No se recibió token de acceso de Google'));
          }
        },
        error_callback: (err: any) => {
          reject(new Error(err.message || 'Error en el diálogo de Google'));
        },
      });

      // Request explicit prompt so user can select account
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err: any) {
      reject(err);
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  if (cachedAccessToken && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      (window as any).google.accounts.oauth2.revoke(cachedAccessToken);
    } catch (e) {
      console.warn('Revoke error:', e);
    }
  }
  cachedAccessToken = null;
  cachedUser = null;
};

/**
 * Uploads a PDF blob directly to Google Drive in the specified parent folder ID.
 */
export async function uploadFileToGoogleDrive(
  blob: Blob,
  fileName: string,
  parentFolderId: string,
  accessToken: string
): Promise<{ id: string; name: string; webViewLink: string }> {
  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName,
    mimeType: 'application/pdf',
  };

  if (parentFolderId && parentFolderId.trim() !== '') {
    metadata.parents = [parentFolderId.trim()];
  }

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error en la API de Google Drive (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Uploads a PDF blob directly to a Google Apps Script Web App endpoint.
 * Bypasses OAuth logins and origin mismatch restrictions completely.
 */
export async function uploadFileToAppsScript(
  blob: Blob,
  fileName: string,
  parentFolderId: string,
  webAppUrl: string
): Promise<{ id?: string; name?: string; webViewLink?: string }> {
  // Convert blob to base64
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const base64 = await base64Promise;

  const payload = {
    base64,
    pdfBase64: base64,
    data: base64,
    fileContent: base64,
    fileName,
    filename: fileName,
    name: fileName,
    folderId: parentFolderId || '',
    mimeType: 'application/pdf',
  };

  const response = await fetch(webAppUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const resText = await response.text();
  let data;
  try {
    data = JSON.parse(resText);
  } catch (e) {
    return { name: fileName, webViewLink: '' };
  }

  if (data.status === 'error') {
    throw new Error(data.message || 'Error en Google Apps Script');
  }

  return {
    id: data.id,
    name: data.name || fileName,
    webViewLink: data.url || data.webViewLink || '',
  };
}

/**
 * Submits the PDF base64 payload to Google Apps Script via a hidden HTML form in a new tab.
 * This utilizes the browser's active Google session (@empresaspolar.com) so Google Apps Script
 * executes with proper permissions and saves directly to Google Drive.
 */
export async function submitFileToAppsScriptViaForm(
  blob: Blob,
  fileName: string,
  parentFolderId: string,
  webAppUrl: string
): Promise<void> {
  const reader = new FileReader();
  const base64Promise = new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1] || result;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const base64 = await base64Promise;

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = webAppUrl;
  form.target = '_blank';

  const fields: Record<string, string> = {
    fileName,
    filename: fileName,
    name: fileName,
    base64,
    pdfBase64: base64,
    data: base64,
    folderId: parentFolderId || '1BQXv4gqCFIHiGeRa2G2FXys3ZpuFFbBd',
    mimeType: 'application/pdf',
  };

  for (const [key, val] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = val;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

