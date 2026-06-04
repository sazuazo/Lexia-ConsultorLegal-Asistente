// ============ DATA STORE ============
const DB = {
  clientes: [
    { id:1, nombre:'Juan Martínez García', iniciales:'JM', curp:'MAGJ800101HDFRRN09', nacimiento:'1980-01-01', email:'juan.martinez@gmail.com', email2:'', telefono:'5213315551234', tel2:'5213315554321', direccion:'Calle Reforma No. 123, Col. Centro, Guadalajara, Jal. C.P. 44100', tipo:'Laboral', estado:'activo', alta:'2024-01-12', honorarios:'$8,000', asunto:'Demanda laboral por despido injustificado vs Corporación XYZ S.A. de C.V.', notas:'Cliente fue despedido sin causa justificada. Pruebas en WhatsApp. Indemnización superior a 3 salarios.', expediente:'EXP-2024-041', numExpediente:'00-LAB-2024-041', juzgado:'Juzgado 4° de lo Laboral — Guadalajara, Jal.' },
    { id:2, nombre:'Ana Rodríguez Pérez', iniciales:'AR', curp:'ROPA850605MDFDRN02', nacimiento:'1985-06-05', email:'ana.rodriguez@hotmail.com', email2:'ana.work@empresa.com', telefono:'5213315555678', tel2:'', direccion:'Av. Vallarta No. 456, Col. Americana, Guadalajara, Jal. C.P. 44160', tipo:'Familiar', estado:'urgente', alta:'2024-02-20', honorarios:'$12,000', asunto:'Divorcio contencioso con custodia de menores y pensión alimenticia', notas:'Caso urgente. Solicitar medidas cautelares de forma inmediata.', expediente:'EXP-2024-038', numExpediente:'00-FAM-2024-038', juzgado:'Tribunal Familiar No. 3 — Guadalajara, Jal.' },
    { id:3, nombre:'Carlos López Mendoza', iniciales:'CL', curp:'LOMC770312HDFPDN05', nacimiento:'1977-03-12', email:'clopez@empresa.mx', email2:'', telefono:'5213315559012', tel2:'5213315550000', direccion:'Blvd. Puerta de Hierro No. 789, Zapopan, Jal. C.P. 45116', tipo:'Mercantil', estado:'pendiente', alta:'2024-03-05', honorarios:'$15,000', asunto:'Revisión y litigio de contrato mercantil — incumplimiento de cláusulas', notas:'Prefiere comunicación por correo. Tiene contrato digitalizado.', expediente:'EXP-2024-035', numExpediente:'00-MER-2024-035', juzgado:'Juzgado 1° de lo Mercantil — Zapopan, Jal.' },
    { id:4, nombre:'María Elena Torres Vega', iniciales:'MT', curp:'TOVM600918MDFRRR07', nacimiento:'1960-09-18', email:'matorres@gmail.com', email2:'', telefono:'5213315553456', tel2:'', direccion:'Calle Hidalgo No. 234, Zapopan Centro, Jal. C.P. 45100', tipo:'Civil', estado:'activo', alta:'2024-04-01', honorarios:'$6,000', asunto:'Trámite de testamento y escrituración de herencia — 3 herederos', notas:'Adulta mayor. Documentos en orden. Acude acompañada de su hijo Roberto.', expediente:'EXP-2024-030', numExpediente:'00-CIV-2024-030', juzgado:'Juzgado 2° de lo Civil — Zapopan, Jal.' },
    { id:5, nombre:'Roberto Sánchez Ruiz', iniciales:'RS', curp:'SARR920714HDFNBN03', nacimiento:'1992-07-14', email:'rsanchez@outlook.com', email2:'roberto@trabajo.com', telefono:'5213315557890', tel2:'', direccion:'Calle Juárez No. 567, Col. El Santuario, Guadalajara, Jal. C.P. 44890', tipo:'Administrativo', estado:'activo', alta:'2024-04-10', honorarios:'$10,000', asunto:'Juicio de amparo indirecto contra resolución administrativa municipal', notas:'Muy participativo. Documentación digitalizada y organizada.', expediente:'EXP-2024-028', numExpediente:'00-ADM-2024-028', juzgado:'Tribunal de lo Administrativo — Guadalajara, Jal.' }
  ],

  expedientes: [
    { id:'EXP-2024-041', clienteId:1, tipo:'Laboral', estado:'activo', juzgado:'Juzgado 4° Laboral', apertura:'2024-01-12' },
    { id:'EXP-2024-038', clienteId:2, tipo:'Familiar', estado:'urgente', juzgado:'Tribunal Familiar No.3', apertura:'2024-02-20' },
    { id:'EXP-2024-035', clienteId:3, tipo:'Mercantil', estado:'pendiente', juzgado:'Juzgado 1° Mercantil', apertura:'2024-03-05' },
    { id:'EXP-2024-030', clienteId:4, tipo:'Civil', estado:'activo', juzgado:'Juzgado 2° Civil', apertura:'2024-04-01' },
    { id:'EXP-2024-028', clienteId:5, tipo:'Administrativo', estado:'activo', juzgado:'Tribunal Administrativo', apertura:'2024-04-10' },
  ],

  audiencias: [
    { id:1, expId:'EXP-2024-041', titulo:'Juicio Martínez vs Empresa XYZ', fecha:'2024-04-30', hora:'10:00', juzgado:'Juzgado 4° Laboral', sala:'Sala B', color:'#2C5F8A' },
    { id:2, expId:'EXP-2024-038', titulo:'Audiencia preliminar Rodríguez', fecha:'2024-05-02', hora:'09:00', juzgado:'Tribunal Familiar No.3', sala:'', color:'#E24B4A' },
    { id:3, expId:'EXP-2024-035', titulo:'Conciliación López vs López', fecha:'2024-05-08', hora:'11:30', juzgado:'Centro de Mediación', sala:'', color:'#1D9E75' },
    { id:4, expId:'EXP-2024-030', titulo:'Audiencia Torres — Civil', fecha:'2024-05-15', hora:'10:00', juzgado:'Juzgado 2° Civil', sala:'', color:'#2C5F8A' },
  ],

  timeline: {
    'EXP-2024-041': [
      { id:1, fecha:'2024-04-28', titulo:'Demanda laboral presentada', sub:'Juzgado 4° Laboral', tipo:'escrito', origen:'despacho', icon:'📋', tag:'Escrito propio' },
      { id:2, fecha:'2024-04-25', titulo:'Auto de radicación recibido', sub:'Juzgado 4° Laboral', tipo:'acuerdo', origen:'juzgado', icon:'⚖', tag:'Acuerdo juzgado' },
      { id:3, fecha:'2024-04-15', titulo:'Contrato laboral digitalizado', sub:'CamScanner', tipo:'scan', origen:'scan', icon:'📷', tag:'Escaneado' },
      { id:4, fecha:'2024-01-12', titulo:'Apertura de expediente', sub:'Primer contacto', tipo:'escrito', origen:'despacho', icon:'📁', tag:'Inicio' },
    ],
    'EXP-2024-038': [
      { id:1, fecha:'2024-04-22', titulo:'Escrito de divorcio presentado', sub:'Tribunal Familiar No.3', tipo:'escrito', origen:'despacho', icon:'📋', tag:'Escrito propio' },
      { id:2, fecha:'2024-04-18', titulo:'Medidas cautelares solicitadas', sub:'Tribunal Familiar No.3', tipo:'escrito', origen:'despacho', icon:'🔒', tag:'Urgente' },
      { id:3, fecha:'2024-02-20', titulo:'Apertura de expediente', sub:'Primer contacto', tipo:'escrito', origen:'despacho', icon:'📁', tag:'Inicio' },
    ],
    'EXP-2024-035': [
      { id:1, fecha:'2024-04-10', titulo:'Demanda mercantil presentada', sub:'Juzgado 1° Mercantil', tipo:'escrito', origen:'despacho', icon:'📋', tag:'Escrito propio' },
      { id:2, fecha:'2024-03-05', titulo:'Apertura de expediente', sub:'Primer contacto', tipo:'escrito', origen:'despacho', icon:'📁', tag:'Inicio' },
    ],
    'EXP-2024-030': [
      { id:1, fecha:'2024-04-15', titulo:'Testamento presentado al juzgado', sub:'Juzgado 2° Civil', tipo:'escrito', origen:'despacho', icon:'📋', tag:'Escrito propio' },
      { id:2, fecha:'2024-04-01', titulo:'Apertura de expediente', sub:'Primer contacto', tipo:'escrito', origen:'despacho', icon:'📁', tag:'Inicio' },
    ],
    'EXP-2024-028': [
      { id:1, fecha:'2024-04-18', titulo:'Amparo indirecto presentado', sub:'Tribunal Administrativo', tipo:'escrito', origen:'despacho', icon:'📋', tag:'Escrito propio' },
      { id:2, fecha:'2024-04-10', titulo:'Apertura de expediente', sub:'Primer contacto', tipo:'escrito', origen:'despacho', icon:'📁', tag:'Inicio' },
    ],
  },

  recibos: [
    { id:1, cliente:'Juan Martínez', monto:3000, fecha:'2024-04-22', metodo:'Efectivo', concepto:'Anticipo honorarios', estado:'pagado' },
    { id:2, cliente:'Ana Rodríguez', monto:5500, fecha:'2024-04-18', metodo:'Transferencia', concepto:'Honorarios divorcio', estado:'pagado' },
    { id:3, cliente:'Carlos López', monto:12000, fecha:'2024-04-10', metodo:'Cheque', concepto:'Pago final', estado:'pagado' },
    { id:4, cliente:'M.E. Torres', monto:8500, fecha:'2024-04-05', metodo:'Pendiente', concepto:'Anticipo testamento', estado:'pendiente' },
  ],

  alertasBuho: [
    { id:1, exp:'00424/2023', asunto:'TIA FIDE', juzgado:'Cihuatlán — Juzgado Civil', fecha:'2026-04-27', fuente:'alerta_expediente@buholegal.com', revisado:false }
  ]
};

// Helpers
function getCliente(id) { return DB.clientes.find(c=>c.id===id); }
function getExpediente(id) { return DB.expedientes.find(e=>e.id===id); }
function getClienteByExp(expId) {
  const exp = getExpediente(expId);
  return exp ? getCliente(exp.clienteId) : null;
}
function estadoBadge(estado) {
  const map = { activo:'badge-active', urgente:'badge-urgent', pendiente:'badge-pending', cerrado:'badge-closed' };
  const lbl = { activo:'Activo', urgente:'Urgente', pendiente:'En proceso', cerrado:'Cerrado' };
  return `<span class="badge ${map[estado]||'badge-closed'}">${lbl[estado]||estado}</span>`;
}
function formatDate(d) {
  const months=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const p=d.split('-');
  return `${parseInt(p[2])} ${months[parseInt(p[1])-1]} ${p[0]}`;
}
function formatDateLong(d) {
  if(!d) return '—';
  const dt = new Date(d+'T12:00:00');
  return dt.toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'});
}
