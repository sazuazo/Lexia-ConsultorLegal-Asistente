// ============ APP CORE ============
let currentView = 'dashboard';
let viewHistory = [];

function navigate(view, el) {
  closeSidebar();
  if (view === currentView && el) return;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + view);
  if (!target) return;

  viewHistory.push(currentView);
  currentView = view;

  // Render view
  const titles = {
    dashboard: 'Panel principal', clientes: 'Clientes', expedientes: 'Expedientes',
    audiencias: 'Audiencias', documentos: 'Redacción & Docs',
    presupuestos: 'Presupuestos', asistente: 'Asistente IA', monitoreo: 'Monitoreo legal'
  };
  document.getElementById('topbar-title').textContent = titles[view] || view;

  // Highlight nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.bn-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`[data-view="${view}"]`).forEach(n => n.classList.add('active'));

  // Render content
  target.classList.add('active');
  renderView(view, target);

  // Scroll to top
  document.getElementById('main-content').scrollTop = 0;
}

function renderView(view, el) {
  switch(view) {
    case 'dashboard':    renderDashboard(el); break;
    case 'clientes':     renderClientes(el); break;
    case 'expedientes':  renderExpedientes(el); break;
    case 'audiencias':   renderAudiencias(el); break;
    case 'documentos':   renderDocumentos(el); break;
    case 'presupuestos': renderPresupuestos(el); break;
    case 'asistente':    renderAsistente(el); break;
    case 'monitoreo':    renderMonitoreo(el); break;
  }
}

function topbarAction() {
  const actions = {
    dashboard: () => showModal(modalNuevoCliente()),
    clientes: () => _openCliForm(null),
    expedientes: () => showToast('Selecciona un expediente para agregar'),
    audiencias: () => showModal(modalNuevaAudiencia()),
    documentos: () => showModal(modalNuevoDocumento()),
    presupuestos: () => showModal(modalNuevoPresupuesto()),
    asistente: () => {},
    monitoreo: () => showToast('🔄 Escaneando correos...', 2000),
  };
  (actions[currentView] || (() => {}))();
}

// ============ SIDEBAR ============
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ============ MODAL ============
function showModal(html) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="active-modal" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-handle"></div>
        ${html}
      </div>
    </div>`;
  requestAnimationFrame(() => document.getElementById('active-modal').classList.add('open'));
}
function closeModal() {
  const m = document.getElementById('active-modal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => { document.getElementById('modal-root').innerHTML = ''; }, 300);
}

// ============ TOAST ============
function showToast(msg, dur = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), dur);
}

// ============ WHATSAPP ============
function openWA(phone, msg) {
  const clean = String(phone).replace(/\D/g,'');
  window.open('https://wa.me/' + clean + '?text=' + encodeURIComponent(msg), '_blank');
}

// ============ MODAL TEMPLATES ============
function modalNuevoCliente(c) {
  const edit = !!c;
  return `
    <div class="modal-title">${edit ? 'Editar cliente' : 'Nuevo cliente'}</div>
    <div class="form-section">
      <div class="form-section-title">Datos personales</div>
      <div class="form-row"><label class="form-label">Nombre completo *</label>
        <input class="form-input" id="f-nombre" placeholder="Juan Martínez García" value="${c?.nombre||''}"></div>
      <div class="form-row"><label class="form-label">CURP *</label>
        <input class="form-input" id="f-curp" placeholder="MAGJ800101HDFRRN09" style="text-transform:uppercase;font-family:monospace" maxlength="18" value="${c?.curp||''}" oninput="this.value=this.value.toUpperCase()"></div>
      <div class="form-row"><label class="form-label">Fecha de nacimiento</label>
        <input class="form-input" id="f-nac" type="date" value="${c?.nacimiento||''}"></div>
      <div class="form-row"><label class="form-label">Dirección completa *</label>
        <input class="form-input" id="f-dir" placeholder="Calle, número, colonia, ciudad, C.P." value="${c?.direccion||''}"></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Contacto</div>
      <div class="form-row"><label class="form-label">Teléfono / WhatsApp *</label>
        <input class="form-input" id="f-tel" type="tel" placeholder="521 33 1234 5678" value="${c?.telefono||''}"></div>
      <div class="form-row"><label class="form-label">Correo electrónico *</label>
        <input class="form-input" id="f-email" type="email" placeholder="cliente@correo.com" value="${c?.email||''}"></div>
      <div class="form-row"><label class="form-label">Teléfono alternativo</label>
        <input class="form-input" id="f-tel2" type="tel" placeholder="Opcional" value="${c?.tel2||''}"></div>
      <div class="form-row"><label class="form-label">Correo alternativo</label>
        <input class="form-input" id="f-email2" type="email" placeholder="Opcional" value="${c?.email2||''}"></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Caso legal</div>
      <div class="form-row"><label class="form-label">Tipo de caso *</label>
        <select class="form-input" id="f-tipo">
          ${['Laboral','Civil','Familiar','Mercantil','Administrativo','Penal','Amparo'].map(t=>`<option${c?.tipo===t?' selected':''}>${t}</option>`).join('')}
        </select></div>
      <div class="form-row"><label class="form-label">Estado</label>
        <select class="form-input" id="f-estado">
          ${[['activo','Activo'],['urgente','Urgente'],['pendiente','En proceso'],['cerrado','Cerrado']].map(([v,l])=>`<option value="${v}"${c?.estado===v?' selected':''}>${l}</option>`).join('')}
        </select></div>
      <div class="form-row"><label class="form-label">Fecha de alta</label>
        <input class="form-input" id="f-alta" type="date" value="${c?.alta||new Date().toISOString().split('T')[0]}"></div>
      <div class="form-row"><label class="form-label">Honorarios pactados</label>
        <input class="form-input" id="f-honor" placeholder="$0.00" value="${c?.honorarios||''}"></div>
      <div class="form-row"><label class="form-label">Descripción del asunto</label>
        <textarea class="form-textarea" id="f-asunto">${c?.asunto||''}</textarea></div>
    </div>
    <div class="form-section">
      <div class="form-section-title">Notas internas</div>
      <div class="form-row"><textarea class="form-textarea" id="f-notas" placeholder="Observaciones, estrategia...">${c?.notas||''}</textarea></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="guardarCliente(${c?.id||'null'})">Guardar cliente</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`;
}

function guardarCliente(editId) {
  const nombre = document.getElementById('f-nombre')?.value.trim();
  if (!nombre) { showToast('⚠️ El nombre es obligatorio'); return; }
  const data = {
    nombre, iniciales: nombre.trim().split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(),
    curp: document.getElementById('f-curp')?.value,
    nacimiento: document.getElementById('f-nac')?.value,
    email: document.getElementById('f-email')?.value,
    email2: document.getElementById('f-email2')?.value,
    telefono: document.getElementById('f-tel')?.value,
    tel2: document.getElementById('f-tel2')?.value,
    direccion: document.getElementById('f-dir')?.value,
    tipo: document.getElementById('f-tipo')?.value,
    estado: document.getElementById('f-estado')?.value,
    alta: document.getElementById('f-alta')?.value,
    honorarios: document.getElementById('f-honor')?.value,
    asunto: document.getElementById('f-asunto')?.value,
    notas: document.getElementById('f-notas')?.value,
  };
  if (editId && editId !== 'null') {
    const idx = DB.clientes.findIndex(c => c.id === editId);
    if (idx !== -1) { data.id = editId; data.expediente = DB.clientes[idx].expediente; DB.clientes[idx] = data; }
  } else {
    data.id = Date.now(); data.expediente = 'EXP-' + new Date().getFullYear() + '-0' + (50 + DB.clientes.length);
    DB.clientes.push(data);
    DB.expedientes.push({ id: data.expediente, clienteId: data.id, tipo: data.tipo, estado: data.estado, juzgado: '', apertura: data.alta });
  }
  closeModal();
  showToast('✅ Cliente guardado');
  navigate('clientes', null);
}

function modalNuevaAudiencia() {
  return `
    <div class="modal-title">Nueva audiencia</div>
    <div class="form-row"><label class="form-label">Expediente</label>
      <select class="form-input" id="a-exp">
        ${DB.expedientes.map(e=>{const c=getClienteByExp(e.id);return`<option value="${e.id}">${e.id} — ${c?.nombre||''}</option>`}).join('')}
      </select></div>
    <div class="form-row"><label class="form-label">Título</label>
      <input class="form-input" id="a-titulo" placeholder="Ej. Audiencia inicial"></div>
    <div class="form-row"><label class="form-label">Fecha</label>
      <input class="form-input" id="a-fecha" type="date"></div>
    <div class="form-row"><label class="form-label">Hora</label>
      <input class="form-input" id="a-hora" type="time" value="09:00"></div>
    <div class="form-row"><label class="form-label">Juzgado / Tribunal</label>
      <input class="form-input" id="a-juzgado" placeholder="Ej. Juzgado 4° Laboral"></div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="guardarAudiencia()">Guardar audiencia</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`;
}

function guardarAudiencia() {
  const titulo = document.getElementById('a-titulo')?.value.trim();
  if (!titulo) { showToast('⚠️ Ingresa un título'); return; }
  DB.audiencias.push({
    id: Date.now(),
    expId: document.getElementById('a-exp')?.value,
    titulo, fecha: document.getElementById('a-fecha')?.value,
    hora: document.getElementById('a-hora')?.value,
    juzgado: document.getElementById('a-juzgado')?.value,
    color: '#2C5F8A'
  });
  closeModal(); showToast('✅ Audiencia programada');
  navigate('audiencias', null);
}

function modalNuevoDocumento() {
  return `
    <div class="modal-title">Nuevo documento</div>
    <div class="form-row"><label class="form-label">Tipo de documento</label>
      <select class="form-input" id="d-tipo">
        ${['Demanda','Escrito de alegatos','Amparo','Acuerdo del juzgado','Notificación','Contrato','Poder notarial','Otro'].map(t=>`<option>${t}</option>`).join('')}
      </select></div>
    <div class="form-row"><label class="form-label">Expediente</label>
      <select class="form-input" id="d-exp">
        ${DB.expedientes.map(e=>{const c=getClienteByExp(e.id);return`<option value="${e.id}">${e.id} — ${c?.nombre||''}</option>`}).join('')}
      </select></div>
    <div class="form-row"><label class="form-label">Usar asistente IA para redactar</label>
      <select class="form-input" id="d-ia"><option value="si">Sí — generar borrador con IA</option><option value="no">No — empezar en blanco</option></select></div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="abrirEditor()">Abrir editor</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`;
}

function abrirEditor() {
  const tipo = document.getElementById('d-tipo')?.value;
  const exp = document.getElementById('d-exp')?.value;
  closeModal();
  navigate('documentos', null);
  showToast('📝 Editor listo: ' + tipo);
}

function modalNuevoPresupuesto() {
  return `
    <div class="modal-title">Nuevo presupuesto</div>
    <div class="form-row"><label class="form-label">Cliente</label>
      <select class="form-input" id="p-cliente">
        ${DB.clientes.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('')}
      </select></div>
    <div class="form-row"><label class="form-label">Tipo de servicio</label>
      <select class="form-input" id="p-servicio">
        ${['Representación en juicio','Asesoría jurídica','Redacción de documentos','Consultoría'].map(t=>`<option>${t}</option>`).join('')}
      </select></div>
    <div class="form-row"><label class="form-label">Honorarios base ($)</label>
      <input class="form-input" id="p-monto" type="number" placeholder="8000" oninput="calcModalTotal()"></div>
    <div id="p-total-preview" style="padding:12px;background:var(--bg2);border-radius:var(--radius-sm);font-size:14px;text-align:center;margin-bottom:14px">Total: —</div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="generarPresupuesto()">Generar presupuesto</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`;
}

function calcModalTotal() {
  const base = parseFloat(document.getElementById('p-monto')?.value || 0);
  const iva = base * 0.16;
  const total = base + iva;
  const el = document.getElementById('p-total-preview');
  if (el) el.textContent = `Subtotal: $${base.toLocaleString()} + IVA $${Math.round(iva).toLocaleString()} = Total: $${Math.round(total).toLocaleString()}`;
}

function generarPresupuesto() {
  closeModal(); showToast('✅ Presupuesto generado');
  navigate('presupuestos', null);
}

// ============ INIT ============
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    setTimeout(() => {
      document.getElementById('splash').style.display = 'none';
      document.getElementById('app').style.display = '';
      navigate('dashboard', null);
    }, 400);
  }, 1200);

  // PWA service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
});
