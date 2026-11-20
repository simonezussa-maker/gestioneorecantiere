/* Public client configuration. The publishable key is safe for client code;
   table access is restricted by the RLS policies installed from backend/. */
(() => {
  'use strict';
  const SUPABASE_URL = 'https://xpqznrkioghpexgvtenh.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_H4ZpHi9BakagIcJwsBvRRA_-HHK5Uhs';
  const SESSION_KEY = 'registro-ore-test-cloud-session-v1';
  const WORKER_URL_KEY = 'registro-ore-test-worker-url-v1';
  let session = null;
  let workspaceDocumentUpdatedAt = null;
  let workerUrl = localStorage.getItem(WORKER_URL_KEY) || 'https://registro-ore-photo-api.simonezussa.workers.dev';

  const readJson = async response => {
    const text = await response.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return text; }
  };
  const errorText = body => body?.msg || body?.message || body?.error_description || body?.error || 'Richiesta non riuscita.';
  const persist = value => {
    session = value;
    if (value) localStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else localStorage.removeItem(SESSION_KEY);
  };
  async function authRequest(path, body, token = null) {
    const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
      method: 'POST', headers, body: JSON.stringify(body)
    });
    const result = await readJson(response);
    if (!response.ok) throw Error(errorText(result));
    return result;
  }
  async function api(path, options = {}) {
    if (session) await refreshIfNeeded();
    const headers = new Headers(options.headers || {});
    headers.set('apikey', SUPABASE_PUBLISHABLE_KEY);
    if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
    const result = await readJson(response);
    if (!response.ok) throw Error(errorText(result));
    return result;
  }
  async function workerApi(path, options = {}) {
    if (!workerUrl) throw Error('Configura prima l’URL del Worker Cloudflare.');
    if (!session) throw Error('Accedi per continuare.');
    await refreshIfNeeded();
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);
    if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(`${workerUrl}${path}`, { ...options, headers });
    const result = await readJson(response);
    if (!response.ok) throw Error(errorText(result));
    return result;
  }
  async function workerBinary(path, options = {}) {
    if (!workerUrl) throw Error('Configura prima l’URL del Worker Cloudflare.');
    if (!session) throw Error('Accedi per continuare.');
    await refreshIfNeeded();
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${session.access_token}`);
    const response = await fetch(`${workerUrl}${path}`, { ...options, headers });
    if (!response.ok) throw Error(errorText(await readJson(response)));
    return response.blob();
  }
  function configureWorker(value) {
    const candidate = String(value || '').trim().replace(/\/+$/, '');
    let parsed;
    try { parsed = new URL(candidate); } catch { throw Error('Inserisci un URL Worker valido.'); }
    const localHost = ['localhost', '127.0.0.1'].includes(parsed.hostname);
    if ((!localHost && parsed.protocol !== 'https:') ||
        (parsed.protocol === 'https:' && !parsed.hostname.endsWith('.workers.dev'))) {
      throw Error('Per questa prova usa l’URL HTTPS *.workers.dev fornito da Cloudflare.');
    }
    workerUrl = parsed.origin;
    localStorage.setItem(WORKER_URL_KEY, workerUrl);
    return workerUrl;
  }
  function currentWorkerUrl() { return workerUrl; }
  function storeAuthResult(data, preserveAuthSetup = false) {
    const expiresIn = Number(data.expires_in) || 3600;
    const value = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Number(data.expires_at) || Math.floor(Date.now() / 1000) + expiresIn,
      user: data.user
    };
    if (!value.access_token || !value.refresh_token || !value.user?.id) throw Error('Risposta di accesso incompleta.');
    if (preserveAuthSetup && session?.pending_auth_type && session.user?.id === value.user.id) {
      value.pending_auth_type = session.pending_auth_type;
    }
    persist(value);
    return value;
  }
  async function refreshIfNeeded() {
    if (!session) return null;
    if (session.expires_at > Math.floor(Date.now() / 1000) + 90) return session;
    try {
      const data = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token });
      return storeAuthResult(data, true);
    } catch (error) {
      persist(null);
      throw Error(`Sessione scaduta. Accedi di nuovo. (${error.message})`);
    }
  }
  async function signIn(email, password) {
    const data = await authRequest('token?grant_type=password', { email: email.trim(), password });
    return storeAuthResult(data);
  }
  async function requestPasswordReset(email, redirectTo) {
    const redirect = new URL(redirectTo);
    if (redirect.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(redirect.hostname)) {
      throw Error('Indirizzo di recupero non sicuro. Riapri la PWA dal suo indirizzo HTTPS.');
    }
    const query = new URLSearchParams({ redirect_to: redirect.href });
    await authRequest(`recover?${query}`, { email: email.trim() });
  }
  async function consumeAuthLink() {
    const hash = new URLSearchParams((location.hash || '').replace(/^#/, ''));
    const type = hash.get('type');
    const accessToken = hash.get('access_token');
    if (hash.get('error') || hash.get('error_code')) {
      history.replaceState(null, '', `${location.pathname}${location.search}`);
      throw Error('Il link di invito o recupero password è scaduto o non valido. Richiedi una nuova email.');
    }
    if (!accessToken) {
      let saved;
      try { saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
      if (['invite', 'recovery'].includes(saved?.pending_auth_type)) {
        const restored = await restoreSession();
        if (restored) return { type: restored.pending_auth_type, email: restored.user.email || '' };
      }
      return null;
    }
    if (!['invite', 'recovery'].includes(type)) return null;
    session = {
      pending_auth_type: type,
      access_token: accessToken,
      refresh_token: hash.get('refresh_token') || '',
      expires_at: Number(hash.get('expires_at')) || Math.floor(Date.now() / 1000) + (Number(hash.get('expires_in')) || 3600),
      user: null
    };
    const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` };
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
    const user = await readJson(response);
    if (!response.ok || !user?.id) throw Error('Il link di invito o recupero password è scaduto o non valido. Richiedi una nuova email.');
    session.user = user;
    persist(session);
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    return { type, email: user.email || '' };
  }
  async function completeInvite(password) {
    if (!session?.access_token) throw Error('Il link di invito non è valido.');
    const user = await api('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) });
    session.user = user;
    delete session.pending_auth_type;
    persist(session);
    return user;
  }
  function cancelAuthSetup() { persist(null); }
  async function restoreSession() {
    try {
      const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      if (!saved?.refresh_token) return null;
      session = saved;
      await refreshIfNeeded();
      const headers = { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${session.access_token}` };
      const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
      const user = await readJson(response);
      if (!response.ok || !user?.id) throw Error('Sessione non valida.');
      session = { ...session, user };
      persist(session);
      return session;
    } catch (error) {
      persist(null);
      return null;
    }
  }
  async function signOut() {
    try { await api('/auth/v1/logout', { method: 'POST' }); } catch { /* Local sign-out must still complete. */ }
    persist(null);
    workspaceDocumentUpdatedAt = null;
  }
  async function memberships() {
    if (!session) throw Error('Accedi per continuare.');
    const query = new URLSearchParams({
      select: 'id,workspace_id,email,display_name,status,is_admin,is_titular,can_manage_members,can_view_clients,can_edit_clients,can_delete_clients,can_view_photos,can_add_photos,can_manage_photos,can_write_reports,can_view_team_reports,can_use_utilities,workspace:workspaces(name)',
      user_id: `eq.${session.user.id}`,
      order: 'created_at.asc'
    });
    return api(`/rest/v1/workspace_memberships?${query}`);
  }
  async function isPlatformMaster() {
    if (!session) return false;
    const query = new URLSearchParams({ select: 'user_id', user_id: `eq.${session.user.id}`, limit: '1' });
    return (await api(`/rest/v1/platform_masters?${query}`)).length > 0;
  }
  async function createWorkspace(name) {
    const result = await api('/rest/v1/rpc/create_workspace', { method: 'POST', body: JSON.stringify({ workspace_name: name.trim() }) });
    return String(result);
  }
  async function manageMembersApi(path, options = {}) {
    if (!session?.access_token) throw Error('Accedi per continuare.');
    return api('/functions/v1/manage-members' + path, options);
  }
  async function listWorkspaces() {
    const result = await manageMembersApi('?action=workspaces');
    return result.workspaces || [];
  }
  async function listMembers(workspaceId) {
    const query = new URLSearchParams({ action: 'members', workspaceId });
    return manageMembersApi('?' + query);
  }
  async function inviteMember(workspaceId, member) {
    return manageMembersApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'invite', workspaceId, ...member })
    });
  }
  async function updateMember(workspaceId, memberId, update) {
    return manageMembersApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'update', workspaceId, memberId, ...update })
    });
  }
  async function listPhotos(workspaceId) {
    const query = new URLSearchParams({ workspaceId });
    const result = await workerApi(`/photos?${query}`);
    return result.photos || [];
  }
  async function fetchPhoto(photoId) { return workerBinary(`/photos/${encodeURIComponent(photoId)}`); }
  async function deletePhoto(photoId) {
    await workerApi(`/photos/${encodeURIComponent(photoId)}`, { method: 'DELETE' });
  }
  async function uploadPhoto(workspaceId, customerId, siteId, dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    if (blob.type !== 'image/jpeg' || blob.size < 4 || blob.size > 2 * 1024 * 1024) throw Error('La foto deve essere JPEG e non superare 2 MB.');
    const headers = { 'Content-Type': 'image/jpeg', 'X-Workspace-Id': workspaceId, 'X-Customer-Id': customerId };
    if (siteId) headers['X-Site-Id'] = siteId;
    return workerApi('/photos', { method: 'POST', headers, body: blob });
  }
  async function loadWorkspace(workspaceId) {
    if (!session) throw Error('Accedi per continuare.');
    const workspaceQuery = new URLSearchParams({ select: 'document,updated_at', workspace_id: `eq.${workspaceId}`, limit: '1' });
    let documentRow = null;
    try { documentRow = (await api(`/rest/v1/workspace_documents?${workspaceQuery}`))[0] || null; }
    catch (error) {
      if (!/permission|policy|row-level|403/i.test(error.message)) throw error;
    }
    workspaceDocumentUpdatedAt = documentRow?.updated_at || null;
    const reportQuery = new URLSearchParams({
      select: 'id,workspace_id,owner_user_id,report_date,customer_id,customer_name,site_id,site_name,internal_id,internal_code,report_type,hours,notes,expenses,created_at,updated_at',
      workspace_id: `eq.${workspaceId}`,
      order: 'report_date.asc,created_at.asc',
      limit: '10000'
    });
    const reports = await api(`/rest/v1/reports?${reportQuery}`);
    const settingsQuery = new URLSearchParams({
      select: 'display_name,default_report_hours,overtime_rate_eur',
      workspace_id: `eq.${workspaceId}`,
      user_id: `eq.${session.user.id}`,
      limit: '1'
    });
    let settings = null;
    try { settings = (await api(`/rest/v1/user_settings?${settingsQuery}`))[0] || null; }
    catch { /* Settings may not exist until the first save. */ }
    return { document: documentRow?.document || null, documentUpdatedAt: workspaceDocumentUpdatedAt, reports, settings };
  }
  function stableJson(value) {
    if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
    if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  }
  function comparableClient(client) {
    const { fotoPaths, fotoData, fotoCloudIds, ...rest } = client || {};
    if (Array.isArray(rest.cantieri)) rest.cantieri = rest.cantieri.map(site => {
      const { fotoPaths: _paths, fotoData: _data, fotoCloudIds: _ids, ...cleanSite } = site || {};
      return cleanSite;
    });
    return stableJson(rest);
  }
  function mergeAdditionsOnly(remoteItems, localItems, label, compare = stableJson) {
    const remoteById = new Map(), localById = new Map();
    for (const item of remoteItems) {
      const id = String(item?.id || '');
      if (!id || remoteById.has(id)) throw Error(`Conflitto su ${label}: identificativi non validi nel cloud.`);
      remoteById.set(id, item);
    }
    for (const item of localItems) {
      const id = String(item?.id || '');
      if (!id || localById.has(id)) throw Error(`Conflitto su ${label}: identificativi non validi su questo dispositivo.`);
      localById.set(id, item);
    }
    for (const [id, remoteItem] of remoteById) {
      const localItem = localById.get(id);
      if (!localItem || compare(remoteItem) !== compare(localItem)) {
        throw Error(`Conflitto su ${label}: il cloud contiene modifiche o rimozioni non presenti su questo dispositivo. Nessun dato è stato sovrascritto.`);
      }
    }
    return [...remoteItems, ...localItems.filter(item => !remoteById.has(String(item.id)))];
  }
  async function saveWorkspaceDocument(workspaceId, document) {
    const query = new URLSearchParams({ select: 'document,updated_at', workspace_id: `eq.${workspaceId}`, limit: '1' });
    for (let attempt = 0; attempt < 2; attempt++) {
      const knownStamp = workspaceDocumentUpdatedAt;
      const rows = await api(`/rest/v1/workspace_documents?${query}`);
      const remoteRow = rows?.[0] || null;
      if (!remoteRow) {
        if (knownStamp) throw Error('L’archivio cloud non è più disponibile. Nessun dato è stato sovrascritto.');
        const now = new Date().toISOString();
        const result = await api('/rest/v1/workspace_documents?on_conflict=workspace_id', {
          method: 'POST', headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
          body: JSON.stringify({ workspace_id: workspaceId, document, updated_by: session.user.id, updated_at: now })
        });
        if (result?.length) { workspaceDocumentUpdatedAt = result[0].updated_at || now; return; }
        continue;
      }

      const remoteStamp = remoteRow.updated_at;
      if (!remoteStamp) throw Error('Il cloud non ha restituito la versione dell’archivio. Riprova.');
      const remoteDocument = remoteRow.document || {};
      let outgoingDocument;
      if (knownStamp === remoteStamp) {
        outgoingDocument = { ...remoteDocument, ...document };
      } else {
        const mergedClients = mergeAdditionsOnly(remoteDocument.clienti || [], document.clienti || [], 'clienti', comparableClient);
        const mergedBoards = mergeAdditionsOnly(remoteDocument.quadriSalvati || [], document.quadriSalvati || [], 'quadri salvati');
        outgoingDocument = { ...remoteDocument, ...document, clienti: mergedClients, quadriSalvati: mergedBoards };
      }

      const now = new Date().toISOString();
      const row = { workspace_id: workspaceId, document: outgoingDocument, updated_by: session.user.id, updated_at: now };
      const patchQuery = new URLSearchParams({ workspace_id: `eq.${workspaceId}`, updated_at: `eq.${remoteStamp}` });
      const result = await api(`/rest/v1/workspace_documents?${patchQuery}`, {
        method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row)
      });
      if (result?.length) { workspaceDocumentUpdatedAt = result[0].updated_at || now; return; }
      // The document changed during this attempt; fetch once more and rebase safely.
    }
    throw Error('L’archivio è cambiato durante la sincronizzazione. Riprova; non ho sovrascritto i dati del gruppo.');
  }
  const reportToRow = (workspaceId, report) => ({
    id: report.id,
    workspace_id: workspaceId,
    owner_user_id: session.user.id,
    report_date: report.data,
    customer_id: report.clienteId,
    customer_name: report.clienteNome,
    site_id: report.cantiereId,
    site_name: report.cantiereNome,
    internal_id: report.internoId,
    internal_code: report.internoCodice,
    report_type: report.tipologia,
    hours: report.ore,
    notes: report.note || '',
    expenses: report.speseAnticipate || 0
  });
  async function saveReports(workspaceId, reports) {
    const own = reports.filter(report => !report.owner_user_id || report.owner_user_id === session.user.id);
    const rows = own.map(report => reportToRow(workspaceId, report));
    if (rows.length) {
      await api('/rest/v1/reports?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows)
      });
    }
  }
  async function deleteOwnReport(workspaceId, reportId) {
    const query = new URLSearchParams({
      id: `eq.${reportId}`, workspace_id: `eq.${workspaceId}`, owner_user_id: `eq.${session.user.id}`
    });
    await api(`/rest/v1/reports?${query}`, { method: 'DELETE' });
  }
  async function saveSettings(workspaceId, settings) {
    const row = {
      workspace_id: workspaceId,
      user_id: session.user.id,
      display_name: settings.nomeOperaio || '',
      default_report_hours: Number(settings.orePredefiniteRapportino) || 8.5,
      overtime_rate_eur: Number(settings.tariffaStraordinarioEuroOra) || 0,
      updated_at: new Date().toISOString()
    };
    await api('/rest/v1/user_settings?on_conflict=workspace_id,user_id', {
      method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(row)
    });
  }
  async function syncWorkspace(workspaceId, membership, db) {
    if (!session || membership.status !== 'active') throw Error('Account in sola lettura.');
    let photosChanged = false;
    if (membership.can_edit_clients || membership.can_delete_clients) {
      const clients = db.clienti.map(client => ({
        ...client,
        fotoPaths: [], fotoData: [], fotoCloudIds: [],
        cantieri: (client.cantieri || []).map(site => ({ ...site, fotoPaths: [], fotoData: [], fotoCloudIds: [] }))
      }));
      await saveWorkspaceDocument(workspaceId, { clienti: clients, quadriSalvati: db.quadriSalvati || [] });
    }
    if (membership.can_write_reports) await saveReports(workspaceId, db.rapportini);
    await saveSettings(workspaceId, db);
    if (workerUrl && membership.can_add_photos) {
      for (const client of db.clienti) {
        client.fotoCloudIds ||= [];
        for (let index = 0; index < (client.fotoData || []).length; index++) {
          if (client.fotoCloudIds[index]) continue;
          const result = await uploadPhoto(workspaceId, client.id, null, client.fotoData[index]);
          client.fotoCloudIds[index] = result.photo?.id || '';
          photosChanged = true;
        }
        for (const site of client.cantieri || []) {
          site.fotoCloudIds ||= [];
          for (let index = 0; index < (site.fotoData || []).length; index++) {
            if (site.fotoCloudIds[index]) continue;
            const result = await uploadPhoto(workspaceId, client.id, site.id, site.fotoData[index]);
            site.fotoCloudIds[index] = result.photo?.id || '';
            photosChanged = true;
          }
        }
      }
    }
    return photosChanged;
  }
  function currentSession() { return session; }
  function currentUserId() { return session?.user?.id || null; }
  function currentUserEmail() { return session?.user?.email || ''; }
  async function loadWorkspaceForMembership(membership) {
    const result = await loadWorkspace(membership.workspace_id);
    return { ...result, workspaceId: membership.workspace_id };
  }
  function currentWorkspaceDocumentUpdatedAt() { return workspaceDocumentUpdatedAt; }
  globalThis.CloudRegistro = {
    siteWork: (workspace, args) => api('/rest/v1/rpc/site_work', {method:'POST', body:JSON.stringify({...args,p_workspace:workspace})}),
    signIn, requestPasswordReset, consumeAuthLink, completeInvite, cancelAuthSetup, restoreSession, signOut, memberships, isPlatformMaster, createWorkspace, listWorkspaces, loadWorkspace, syncWorkspace, deleteOwnReport,
    configureWorker, currentWorkerUrl, listMembers, inviteMember, updateMember, listPhotos, fetchPhoto, uploadPhoto, deletePhoto,
    loadWorkspaceForMembership, currentSession, currentUserId, currentUserEmail,
    currentWorkspaceDocumentUpdatedAt
  };
})();
