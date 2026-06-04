// ============ CONECTOR BASE44 PARA LEXIA ============
// Sincroniza datos entre Lexia (PWA) y Base44 (LegalFlow)
// Archivo: js/base44-connector.js

class Base44Connector {
  constructor(appId, apiUrl = 'https://api.base44.com/v1') {
    this.appId = appId;
    this.apiUrl = apiUrl;
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSync = null;
    this.retryCount = 3;
    this.retryDelay = 5000; // 5 segundos
  }

  // ============ AUTENTICACIÓN ============

  async autenticar(apiKey) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey })
      });

      if (!response.ok) throw new Error('Autenticación fallida');
      
      const data = await response.json();
      this.token = data.token;
      localStorage.setItem('base44_token', this.token);
      console.log('✅ Autenticado con Base44');
      return true;
    } catch (error) {
      console.error('❌ Error de autenticación:', error);
      return false;
    }
  }

  // ============ OPERACIONES CRUD ============

  async leerClientes() {
    return this._request('GET', `/apps/${this.appId}/entities/Cliente/records`);
  }

  async crearCliente(cliente) {
    return this._request('POST', `/apps/${this.appId}/entities/Cliente/records`, [cliente]);
  }

  async actualizarCliente(clienteId, datos) {
    return this._request('PATCH', `/apps/${this.appId}/entities/Cliente/records/${clienteId}`, datos);
  }

  async leerCasos(filtro = {}) {
    const query = new URLSearchParams(filtro).toString();
    return this._request('GET', `/apps/${this.appId}/entities/Caso/records?${query}`);
  }

  async crearCaso(caso) {
    return this._request('POST', `/apps/${this.appId}/entities/Caso/records`, [caso]);
  }

  async actualizarCaso(casoId, datos) {
    return this._request('PATCH', `/apps/${this.appId}/entities/Caso/records/${casoId}`, datos);
  }

  async leerAudiencias(filtro = {}) {
    const query = new URLSearchParams(filtro).toString();
    return this._request('GET', `/apps/${this.appId}/entities/Audiencia/records?${query}`);
  }

  async crearAudiencia(audiencia) {
    return this._request('POST', `/apps/${this.appId}/entities/Audiencia/records`, [audiencia]);
  }

  async leerEscritos(filtro = {}) {
    const query = new URLSearchParams(filtro).toString();
    return this._request('GET', `/apps/${this.appId}/entities/Escrito/records?${query}`);
  }

  async crearEscrito(escrito) {
    return this._request('POST', `/apps/${this.appId}/entities/Escrito/records`, [escrito]);
  }

  async leerAcuerdos(filtro = {}) {
    const query = new URLSearchParams(filtro).toString();
    return this._request('GET', `/apps/${this.appId}/entities/Acuerdo/records?${query}`);
  }

  async crearAcuerdo(acuerdo) {
    return this._request('POST', `/apps/${this.appId}/entities/Acuerdo/records`, [acuerdo]);
  }

  // ============ SINCRONIZACIÓN BIDIRECCIONAL ============

  async sincronizarDesdeBase44() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      console.log('📥 Sincronizando datos desde Base44...');

      // Leer todos los datos
      const [clientes, casos, audiencias, escritos, acuerdos] = await Promise.all([
        this.leerClientes(),
        this.leerCasos(),
        this.leerAudiencias(),
        this.leerEscritos(),
        this.leerAcuerdos()
      ]);

      // Actualizar DB local
      if (clientes.data) DB.clientes = clientes.data;
      if (casos.data) DB.casos = casos.data;
      if (audiencias.data) DB.audiencias = audiencias.data;
      if (escritos.data) DB.escritos = escritos.data;
      if (acuerdos.data) DB.acuerdos = acuerdos.data;

      // Guardar en IndexedDB
      await Promise.all([
        this._saveToIndexedDB('clientes', DB.clientes),
        this._saveToIndexedDB('casos', DB.casos),
        this._saveToIndexedDB('audiencias', DB.audiencias),
        this._saveToIndexedDB('escritos', DB.escritos),
        this._saveToIndexedDB('acuerdos', DB.acuerdos)
      ]);

      this.lastSync = new Date();
      console.log('✅ Sincronización completada desde Base44');
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando desde Base44:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  async sincronizarHaciaBase44() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      console.log('📤 Sincronizando datos hacia Base44...');

      // Obtener registros pendientes de sincronizar
      const registrosPendientes = await this._getUnsyncedRecords();

      if (registrosPendientes.length === 0) {
        console.log('✅ Todo sincronizado');
        return true;
      }

      // Agrupar por entidad
      const porEntidad = {};
      registrosPendientes.forEach(reg => {
        if (!porEntidad[reg.entidad]) porEntidad[reg.entidad] = [];
        porEntidad[reg.entidad].push(reg);
      });

      // Enviar por lotes
      for (const [entidad, registros] of Object.entries(porEntidad)) {
        const datos = registros.map(r => this._obtenerDato(entidad, r.id));
        
        if (entidad === 'Cliente') {
          await this._request('POST', `/apps/${this.appId}/entities/Cliente/records`, datos);
        } else if (entidad === 'Caso') {
          await this._request('POST', `/apps/${this.appId}/entities/Caso/records`, datos);
        } else if (entidad === 'Audiencia') {
          await this._request('POST', `/apps/${this.appId}/entities/Audiencia/records`, datos);
        } else if (entidad === 'Escrito') {
          await this._request('POST', `/apps/${this.appId}/entities/Escrito/records`, datos);
        } else if (entidad === 'Acuerdo') {
          await this._request('POST', `/apps/${this.appId}/entities/Acuerdo/records`, datos);
        }

        // Marcar como sincronizado
        await this._markAsSynced(registros);
      }

      console.log(`✅ ${registrosPendientes.length} registros sincronizados hacia Base44`);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando hacia Base44:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  async sincronizarAutomaticamente(intervalMs = 60000) {
    // Sincronizar cada X milisegundos
    setInterval(async () => {
      if (navigator.onLine) {
        await this.sincronizarDesdeBase44();
        await this.sincronizarHaciaBase44();
        console.log(`🔄 Última sincronización: ${new Date().toLocaleTimeString('es-MX')}`);
      }
    }, intervalMs);

    // Escuchar cambios de conexión
    window.addEventListener('online', async () => {
      console.log('🟢 Conexión recuperada, sincronizando...');
      await this.sincronizarDesdeBase44();
      await this.sincronizarHaciaBase44();
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Conexión perdida. Modo offline activado.');
      showToast('🔴 Offline - Los cambios se sincronizarán cuando se recupere la conexión');
    });
  }

  // ============ HELPERS PRIVADOS ============

  async _request(method, endpoint, body = null) {
    const token = this.token || localStorage.getItem('base44_token');
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (body) options.body = JSON.stringify(body);

    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, options);
      
      if (response.status === 401) {
        throw new Error('Token expirado. Por favor autenticate nuevamente.');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  async _saveToIndexedDB(storeName, data) {
    if (!indexedDB_ready) return;

    return new Promise((resolve, reject) => {
      const tx = lexiaDB.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      
      data.forEach(item => {
        store.add(item);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async _getUnsyncedRecords() {
    if (!indexedDB_ready) {
      // Fallback a datos en memoria
      const unsynced = [];
      Object.entries(DB).forEach(([key, values]) => {
        if (Array.isArray(values)) {
          values.forEach(v => {
            if (v.sync === false) {
              unsynced.push({ entidad: key, id: v.id });
            }
          });
        }
      });
      return unsynced;
    }

    return new Promise((resolve, reject) => {
      const tx = lexiaDB.transaction(['sync'], 'readonly');
      const store = tx.objectStore('sync');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  _obtenerDato(entidad, id) {
    if (entidad === 'Cliente') return DB.clientes.find(c => c.id === id);
    if (entidad === 'Caso') return DB.casos.find(c => c.id === id);
    if (entidad === 'Audiencia') return DB.audiencias.find(a => a.id === id);
    if (entidad === 'Escrito') return DB.escritos.find(e => e.id === id);
    if (entidad === 'Acuerdo') return DB.acuerdos.find(a => a.id === id);
    return null;
  }

  async _markAsSynced(registros) {
    registros.forEach(reg => {
      const entidad = reg.entidad.toLowerCase() + 's';
      const item = DB[entidad]?.find(i => i.id === reg.id);
      if (item) item.sync = true;
    });
  }
}

// ============ INICIALIZACIÓN ============

// Crear instancia global
const base44 = new Base44Connector('6914d5d60a8e1251429248ad');

// Inicializar sincronización al cargar la app
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Intentar autenticar (necesita token de Base44)
    const token = localStorage.getItem('base44_token');
    if (token) {
      base44.token = token;
      
      // Sincronizar inmediatamente
      await base44.sincronizarDesdeBase44();
      
      // Luego sincronizar automáticamente cada 60 segundos
      base44.sincronizarAutomaticamente(60000);
    } else {
      console.log('⚠️  No hay token Base44. Usando datos locales.');
    }
  } catch (error) {
    console.error('Error iniciando Base44:', error);
  }
});

// ============ FUNCIONES DE UTILIDAD ============

async function agregarNuevoCliente(cliente) {
  // Primero guardar en local
  await saveCliente(cliente);
  
  // Si está conectado, sincronizar
  if (navigator.onLine) {
    try {
      await base44.crearCliente(cliente);
      cliente.sync = true;
      console.log('✅ Cliente sincronizado con Base44');
    } catch (error) {
      console.warn('⚠️  Cliente guardado localmente, se sincronizará después');
    }
  }
}

async function agregarNuevoCaso(caso) {
  await saveCaso(caso);
  
  if (navigator.onLine) {
    try {
      await base44.crearCaso(caso);
      caso.sync = true;
      console.log('✅ Caso sincronizado con Base44');
    } catch (error) {
      console.warn('⚠️  Caso guardado localmente, se sincronizará después');
    }
  }
}

async function agregarNuevaAudiencia(audiencia) {
  await saveAudiencia(audiencia);
  
  if (navigator.onLine) {
    try {
      await base44.crearAudiencia(audiencia);
      audiencia.sync = true;
      console.log('✅ Audiencia sincronizada con Base44');
    } catch (error) {
      console.warn('⚠️  Audiencia guardada localmente, se sincronizará después');
    }
  }
}

// ============ PANEL DE SINCRONIZACIÓN (para DEBUG) ============

function mostrarPanelSync() {
  const html = `
    <div class="modal-header">
      <h2>⚙️ Estado de Sincronización</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <div class="modal-content">
      <div class="sync-status">
        <div class="sync-item">
          <label>Estado de conexión:</label>
          <span class="sync-value ${navigator.onLine ? 'online' : 'offline'}">
            ${navigator.onLine ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>

        <div class="sync-item">
          <label>Última sincronización:</label>
          <span class="sync-value">
            ${base44.lastSync ? base44.lastSync.toLocaleTimeString('es-MX') : 'Nunca'}
          </span>
        </div>

        <div class="sync-item">
          <label>Sincing:</label>
          <span class="sync-value ${base44.isSyncing ? 'syncing' : ''}">
            ${base44.isSyncing ? '🔄 En progreso...' : '✅ Inactivo'}
          </span>
        </div>

        <div class="sync-item">
          <label>Registros locales:</label>
          <span class="sync-value">
            ${DB.clientes.length + DB.casos.length + DB.audiencias.length} total
          </span>
        </div>
      </div>

      <div class="sync-buttons">
        <button class="btn btn-primary" onclick="base44.sincronizarDesdeBase44(); closeModal();">
          📥 Descargar desde Base44
        </button>
        <button class="btn btn-primary" onclick="base44.sincronizarHaciaBase44(); closeModal();">
          📤 Cargar a Base44
        </button>
      </div>
    </div>

    <style>
      .sync-status { padding: 16px; background: #f9f9f9; border-radius: 6px; }
      .sync-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
      .sync-item:last-child { border-bottom: none; }
      .sync-item label { font-weight: 600; color: #666; }
      .sync-value { color: #222; }
      .sync-value.online { color: #1D9E75; font-weight: 600; }
      .sync-value.offline { color: #E24B4A; font-weight: 600; }
      .sync-value.syncing { color: #FFC107; font-weight: 600; }
      .sync-buttons { display: flex; gap: 8px; margin-top: 16px; }
      .sync-buttons .btn { flex: 1; }
    </style>
  `;

  showModal(html);
}
