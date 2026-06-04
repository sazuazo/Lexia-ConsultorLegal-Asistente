// ============ LEXIA + LEGALFLOW INTEGRATED DATA LAYER ============
// Optimizado para Android, offline-first con IndexedDB

const DBVERSION = 1;
let indexedDB_ready = false;
let lexiaDB = null;

// ============ INICIALIZAR INDEXEDDB (ANDROID OPTIMIZADO) ============
function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LexiaLegalFlow', DBVERSION);
    
    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      lexiaDB = request.result;
      indexedDB_ready = true;
      console.log('✅ IndexedDB inicializado para Android');
      resolve(lexiaDB);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Object Stores para cada entidad
      if (!db.objectStoreNames.contains('clientes')) {
        const clienteStore = db.createObjectStore('clientes', { keyPath: 'id' });
        clienteStore.createIndex('email', 'email', { unique: false });
        clienteStore.createIndex('telefono', 'telefono', { unique: false });
        clienteStore.createIndex('estado', 'estado', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('casos')) {
        const casoStore = db.createObjectStore('casos', { keyPath: 'id' });
        casoStore.createIndex('cliente_id', 'cliente_id', { unique: false });
        casoStore.createIndex('estado', 'estado', { unique: false });
        casoStore.createIndex('tipo_juicio', 'tipo_juicio', { unique: false });
        casoStore.createIndex('numero_expediente', 'numero_expediente', { unique: true });
      }
      
      if (!db.objectStoreNames.contains('audiencias')) {
        const audienciaStore = db.createObjectStore('audiencias', { keyPath: 'id' });
        audienciaStore.createIndex('caso_id', 'caso_id', { unique: false });
        audienciaStore.createIndex('fecha', 'fecha', { unique: false });
        audienciaStore.createIndex('completada', 'completada', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('escritos')) {
        const escritoStore = db.createObjectStore('escritos', { keyPath: 'id' });
        escritoStore.createIndex('caso_id', 'caso_id', { unique: false });
        escritoStore.createIndex('tipo_escrito', 'tipo_escrito', { unique: false });
        escritoStore.createIndex('fecha_presentacion', 'fecha_presentacion', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('acuerdos')) {
        const acuerdoStore = db.createObjectStore('acuerdos', { keyPath: 'id' });
        acuerdoStore.createIndex('caso_id', 'caso_id', { unique: false });
        acuerdoStore.createIndex('estado', 'estado', { unique: false });
        acuerdoStore.createIndex('fecha_acuerdo', 'fecha_acuerdo', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('sync')) {
        db.createObjectStore('sync', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// ============ DATA STORE (EN-MEMORIA + INDEXEDDB) ============
const DB = {
  // CLIENTES
  clientes: [
    { 
      id: '691b584d5316a860ada75493', 
      nombre_completo: 'LETICIA NAVARRO MANCILLA', 
      telefono: '3141117474', 
      email: 'leticia.navarro@email.com', 
      direccion: 'MANZANILLO, JALISCO', 
      notas: 'INTESTADO Y REIVINDICATORIA',
      estado: 'activo',
      alta: '2024-11-17',
      sync: false
    },
    { 
      id: '691608902f7b7a9fd25740b2', 
      nombre_completo: 'ROSA EVELIA CALIFORNIA', 
      telefono: '559-352-9204', 
      email: 'rosa.california@email.com', 
      direccion: 'CALIFORNIA, JALISCO', 
      notas: '',
      estado: 'activo',
      alta: '2024-11-13',
      sync: false
    },
    { 
      id: '691607eadad890d7c219fd09', 
      nombre_completo: 'JORGE AGUILA', 
      telefono: '33-31-75-8186', 
      email: 'jorge.aguila@email.com', 
      direccion: 'MELAQUE, JALISCO', 
      notas: '',
      estado: 'activo',
      alta: '2024-11-13',
      sync: false
    },
  ],

  // CASOS
  casos: [
    { 
      id: '691b58da7ded250b28e1cba6',
      cliente_id: '691b584d5316a860ada75493', 
      cliente_nombre: 'LETICIA NAVARRO MANCILLA',
      numero_expediente: 'SIN ASIGNAR',
      tipo_juicio: 'Civil', 
      descripcion: 'REIVINDICATORIA',
      estado: 'En espera', 
      fecha_inicio: '2024-12-12',
      juzgado: 'CIVIL CIHUATLAN',
      contraparte: 'OLGA GOMEZ RIVERA',
      sync: false
    },
    { 
      id: '691b58a41e831786d93fd0be',
      cliente_id: '691b584d5316a860ada75493', 
      cliente_nombre: 'LETICIA NAVARRO MANCILLA',
      numero_expediente: '218/2021', 
      tipo_juicio: 'Familiar', 
      descripcion: 'INTESTADO A BIENES DE SU PADRE Y MADRE',
      estado: 'Activo', 
      fecha_inicio: '2023-01-17',
      juzgado: 'CIVIL CIHUATLAN',
      contraparte: '',
      sync: false
    },
    { 
      id: '69160901491cc436992aefdf',
      cliente_id: '691608902f7b7a9fd25740b2', 
      cliente_nombre: 'ROSA EVELIA CALIFORNIA',
      numero_expediente: '545/2024', 
      tipo_juicio: 'Civil', 
      descripcion: '',
      estado: 'Activo', 
      fecha_inicio: '2024-04-22',
      juzgado: 'CIVIL CIHUATLAN',
      contraparte: 'GUILLERMO GARCIA FRANCO',
      sync: false
    },
  ],

  // AUDIENCIAS
  audiencias: [
    { 
      id: '691b59001e1c250b28e1f8a2',
      caso_id: '691b58da7ded250b28e1cba6',
      caso_info: 'Reivindicatoria - Navarro vs Gómez',
      titulo: 'Audiencia de demanda',
      tipo: 'Audiencia', 
      fecha: '2024-06-15',
      hora: '10:00', 
      ubicacion: 'Sala Civil A, Juzgado Civil Cihuatlán',
      notas: 'Llevar documentos originales y fotocopias',
      completada: false,
      dias_restantes: 15,
      sync: false
    },
    { 
      id: '691b59101e1c250b28e1f8b3',
      caso_id: '691b58a41e831786d93fd0be',
      caso_info: 'Intestado - Navarro (Bienes)',
      titulo: 'Seguimiento a testamento',
      tipo: 'Término judicial', 
      fecha: '2024-06-20',
      hora: '14:30', 
      ubicacion: 'Despacho del Juez García',
      notas: 'Esperar resolución sobre admisión de pruebas',
      completada: false,
      dias_restantes: 20,
      sync: false
    },
  ],

  // ESCRITOS
  escritos: [
    { 
      id: '691b5a001e1c250b28e1f9c1',
      caso_id: '691b58da7ded250b28e1cba6',
      titulo: 'Demanda Civil por Reivindicación',
      tipo_escrito: 'Demanda', 
      fecha_presentacion: '2024-05-10',
      descripcion: 'Escrito de demanda presentado ante Juzgado Civil de Cihuatlán',
      file_url: 'reivindicacion_demanda_2024.pdf',
      observaciones: 'Aceptada por el juzgado. Asignado número de expediente al juzgado.',
      sync: false
    },
    { 
      id: '691b5a101e1c250b28e1f9d2',
      caso_id: '691b58a41e831786d93fd0be',
      titulo: 'Escrito de Sucesión Testamentaria',
      tipo_escrito: 'Promoción', 
      fecha_presentacion: '2024-03-25',
      descripcion: 'Promoción para seguimiento del juicio sucesorio',
      file_url: 'sucesion_promocion_2024.pdf',
      observaciones: 'En espera de resolución del juzgado',
      sync: false
    },
  ],

  // ACUERDOS
  acuerdos: [
    { 
      id: '691b5b001e1c250b28e1fa01',
      caso_id: '691b58da7ded250b28e1cba6',
      expediente: 'SIN ASIGNAR',
      fecha_acuerdo: '2024-05-12',
      tipo_acuerdo: 'AUTO DE RADICACIÓN',
      contenido: 'Se radicariza la demanda y se da por iniciado el procedimiento',
      juzgado: 'CIVIL CIHUATLAN',
      estado: 'Revisado',
      notas: 'Acuerdo generado automáticamente por el sistema',
      url_fuente: 'https://sije.pjud.mx',
      sync: false
    },
  ],

  // RECIBOS Y PAGOS
  recibos: [
    { id: 1, cliente: 'LETICIA NAVARRO', monto: 5000, fecha: '2024-05-10', metodo: 'Transferencia', concepto: 'Honorarios por demanda', estado: 'pagado', sync: false },
    { id: 2, cliente: 'ROSA EVELIA CALIFORNIA', monto: 3000, fecha: '2024-05-08', metodo: 'Efectivo', concepto: 'Anticipo', estado: 'pagado', sync: false },
  ],

  // ALERTAS
  alertas: [
    { id: 1, exp: '218/2021', asunto: 'INTESTADO', juzgado: 'CIVIL CIHUATLAN', fecha: '2024-06-01', fuente: 'sistema', revisado: false },
  ]
};

// ============ HELPER FUNCTIONS ============

// Buscar cliente
function getCliente(id) {
  return DB.clientes.find(c => c.id === id);
}

// Buscar caso
function getCaso(id) {
  return DB.casos.find(c => c.id === id);
}

// Obtener casos por cliente
function getCasosPorCliente(clienteId) {
  return DB.casos.filter(c => c.cliente_id === clienteId);
}

// Obtener audiencias por caso
function getAudienciasPorCaso(casoId) {
  return DB.audiencias.filter(a => a.caso_id === casoId).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

// Obtener escritos por caso
function getEscritosPorCaso(casoId) {
  return DB.escritos.filter(e => e.caso_id === casoId).sort((a, b) => new Date(b.fecha_presentacion) - new Date(a.fecha_presentacion));
}

// Obtener acuerdos por caso
function getAcuerdosPorCaso(casoId) {
  return DB.acuerdos.filter(a => a.caso_id === casoId).sort((a, b) => new Date(b.fecha_acuerdo) - new Date(a.fecha_acuerdo));
}

// Estado badge
function estadoBadge(estado) {
  const map = {
    'Activo': 'badge-active',
    'En espera': 'badge-pending',
    'Concluido': 'badge-closed',
    'Archivado': 'badge-closed',
    'activo': 'badge-active',
    'urgente': 'badge-urgent',
    'pendiente': 'badge-pending',
    'cerrado': 'badge-closed'
  };
  const lbl = {
    'Activo': 'Activo',
    'En espera': 'En espera',
    'Concluido': 'Concluido',
    'Archivado': 'Archivado',
    'activo': 'Activo',
    'urgente': 'Urgente',
    'pendiente': 'En proceso',
    'cerrado': 'Cerrado'
  };
  return `<span class="badge ${map[estado] || 'badge-closed'}">${lbl[estado] || estado}</span>`;
}

// Formatear fecha
function formatDate(d) {
  if (!d) return '—';
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const p = d.split('-');
  return `${parseInt(p[2])} ${months[parseInt(p[1]) - 1]} ${p[0]}`;
}

function formatDateLong(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T12:00:00');
  return dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Calcular días faltantes
function diasFaltantes(fecha) {
  const hoy = new Date();
  const evento = new Date(fecha + 'T00:00:00');
  const diff = evento - hoy;
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return dias;
}

// ============ OPERACIONES CRUD OPTIMIZADAS PARA ANDROID ============

async function saveCliente(cliente) {
  if (!indexedDB_ready) {
    console.warn('IndexedDB no listo, guardando en memoria');
    const idx = DB.clientes.findIndex(c => c.id === cliente.id);
    if (idx >= 0) DB.clientes[idx] = cliente;
    else DB.clientes.push(cliente);
    return;
  }
  
  const tx = lexiaDB.transaction(['clientes', 'sync'], 'readwrite');
  tx.objectStore('clientes').put(cliente);
  tx.objectStore('sync').add({ entidad: 'cliente', id: cliente.id, timestamp: Date.now() });
}

async function saveCaso(caso) {
  if (!indexedDB_ready) {
    const idx = DB.casos.findIndex(c => c.id === caso.id);
    if (idx >= 0) DB.casos[idx] = caso;
    else DB.casos.push(caso);
    return;
  }
  
  const tx = lexiaDB.transaction(['casos', 'sync'], 'readwrite');
  tx.objectStore('casos').put(caso);
  tx.objectStore('sync').add({ entidad: 'caso', id: caso.id, timestamp: Date.now() });
}

async function saveAudiencia(audiencia) {
  if (!indexedDB_ready) {
    const idx = DB.audiencias.findIndex(a => a.id === audiencia.id);
    if (idx >= 0) DB.audiencias[idx] = audiencia;
    else DB.audiencias.push(audiencia);
    return;
  }
  
  const tx = lexiaDB.transaction(['audiencias', 'sync'], 'readwrite');
  tx.objectStore('audiencias').put(audiencia);
  tx.objectStore('sync').add({ entidad: 'audiencia', id: audiencia.id, timestamp: Date.now() });
}

// ============ SINCRONIZACIÓN CON BASE44 ============

async function syncWithBase44(appId) {
  if (!indexedDB_ready) {
    console.warn('No se puede sincronizar sin IndexedDB');
    return;
  }
  
  const tx = lexiaDB.transaction(['sync'], 'readonly');
  const syncStore = tx.objectStore('sync');
  const unsyncedRecords = await new Promise((resolve, reject) => {
    const request = syncStore.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  
  console.log(`📤 Sincronizando ${unsyncedRecords.length} registros con Base44...`);
  
  // Aquí se integraría con las APIs de Base44
  // Ejemplo: await fetch(`https://api.base44.com/sync/${appId}`, { ... })
  
  return unsyncedRecords;
}

// ============ INICIALIZACIÓN EN ARRANQUE ============

window.addEventListener('DOMContentLoaded', () => {
  initIndexedDB()
    .then(() => console.log('✅ Lexia + LegalFlow DB listo'))
    .catch(e => console.error('❌ Error inicializando DB:', e));
});
