
// ============ DASHBOARD ============
function renderDashboard(el) {
  const alertas = DB.alertasBuho.filter(a=>!a.revisado).length;
  el.innerHTML = `
    ${alertas ? `<div class="alert-card" onclick="navigate('monitoreo',null)">
      <div class="alert-card-title">🦉 Búho Legal — ${alertas} alerta nueva</div>
      <div class="alert-card-body">Exp. 00424/2023 — TIA FIDE · Cihuatlán Juzgado Civil · 27 abr</div>
      <div style="margin-top:10px"><span class="resumen-btn">Ver alerta →</span></div>
    </div>` : ''}
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Clientes activos</div><div class="stat-value">${DB.clientes.filter(c=>c.estado==='activo').length}</div><div class="stat-delta">+2 este mes</div></div>
      <div class="stat-card"><div class="stat-label">Expedientes</div><div class="stat-value">${DB.expedientes.length}</div><div class="stat-delta">3 urgentes</div></div>
      <div class="stat-card"><div class="stat-label">Audiencias</div><div class="stat-value">${DB.audiencias.length}</div><div class="stat-delta">Esta semana</div></div>
      <div class="stat-card"><div class="stat-label">Ingresos mes</div><div class="stat-value" style="font-size:18px">$47,200</div><div class="stat-delta">+12%</div></div>
    </div>
    <div class="quick-actions">
      <div class="qa-btn" onclick="navigate('asistente',null)"><div class="qa-icon">✦</div><div class="qa-label">Asistente IA</div><div class="qa-sub">Consulta legal</div></div>
      <div class="qa-btn" onclick="_openCliForm(null)"><div class="qa-icon">◎</div><div class="qa-label">Nuevo cliente</div><div class="qa-sub">Registrar</div></div>
      <div class="qa-btn" onclick="navigate('documentos',null)"><div class="qa-icon">▤</div><div class="qa-label">Redactar</div><div class="qa-sub">Documento</div></div>
      <div class="qa-btn" onclick="navigate('audiencias',null)"><div class="qa-icon">◷</div><div class="qa-label">Audiencias</div><div class="qa-sub">Ver agenda</div></div>
    </div>
    <div class="card">
      <div class="card-header"><h2>Próximas audiencias</h2></div>
      ${DB.audiencias.slice(0,3).map(a=>{const c=getClienteByExp(a.expId);return`<div class="event-item" style="border-left-color:${a.color}">
        <div class="event-time">${formatDate(a.fecha)} — ${a.hora} · ${a.juzgado}</div>
        <div class="event-title">${a.titulo}</div><div class="event-sub">${c?.nombre||''}</div>
        <div class="event-actions">
          <button class="resumen-btn" onclick="mostrarResumen('${c?.nombre}','${getExpediente(a.expId)?.tipo}','${(c?.asunto||'').replace(/'/g,'`')}','${a.expId}')">✦ Resumen</button>
          <button class="wa-btn" onclick="openWA('${c?.telefono||''}','Hola ${c?.nombre?.split(' ')[0]||''}, recordatorio audiencia ${formatDate(a.fecha)} a las ${a.hora} en ${a.juzgado}.')">● WA</button>
        </div></div>`;}).join('')}
    </div>
    <div class="card">
      <div class="card-header"><h2>Clientes recientes</h2><button class="btn btn-sm btn-primary" onclick="navigate('clientes',null)">Ver todos</button></div>
      ${DB.clientes.slice(0,4).map(c=>`<div class="list-item" onclick="navigate('clientes',null);setTimeout(()=>_selCli(${c.id}),100)"><div class="list-avatar">${c.iniciales}</div><div class="list-info"><div class="list-name">${c.nombre}</div><div class="list-meta" style="font-family:monospace;font-size:10px;color:var(--accent);font-weight:700;margin-bottom:2px">${c.numExpediente||c.expediente}</div><div class="list-meta">${c.tipo} · ${estadoBadge(c.estado)}</div></div><span class="list-arrow">›</span></div>`).join('')}
    </div>`;
}

// ============ CLIENTES — v3 (edición inline, eliminar, expediente, juzgado) ============
let _filtroClientes='todos', _cliSel=null, _editSec=null;

function renderClientes(el){
  el.innerHTML=`
    <style>
      .cli-layout{display:grid;grid-template-columns:280px 1fr;height:calc(100vh - var(--topbar-h) - var(--bottom-nav-h));overflow:hidden;}
      .cli-lista{border-right:0.5px solid var(--border);display:flex;flex-direction:column;background:var(--bg);overflow:hidden;}
      .cli-lista-hdr{padding:12px 14px;border-bottom:0.5px solid var(--border);flex-shrink:0;}
      .cli-lista-hdr-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
      .cli-items{flex:1;overflow-y:auto;}
      .cli-row{padding:10px 14px;border-bottom:0.5px solid var(--border);cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .1s;}
      .cli-row:hover{background:var(--bg2);}
      .cli-row.selected{background:var(--accent-light);border-left:3px solid var(--accent);}
      .cli-av{width:36px;height:36px;border-radius:50%;background:var(--accent-light);color:var(--accent);font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .cli-ficha{overflow-y:auto;background:var(--bg3);padding:16px;display:flex;flex-direction:column;gap:12px;}
      .cli-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text2);font-size:13px;gap:10px;}
      .sec-card{background:var(--bg);border:0.5px solid var(--border);border-radius:var(--radius);overflow:hidden;}
      .sec-hdr{padding:10px 14px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between;}
      .sec-title{font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;}
      .sec-edit-btn{font-size:11px;padding:3px 10px;border-radius:6px;border:0.5px solid var(--border);background:var(--bg2);color:var(--accent);cursor:pointer;font-family:var(--font-body);font-weight:500;}
      .sec-edit-btn:hover{background:var(--accent-light);border-color:var(--accent-mid);}
      .fgrid{display:grid;grid-template-columns:1fr 1fr;padding:12px 14px;gap:10px;}
      .fg{display:flex;flex-direction:column;gap:3px;}
      .fl{font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px;font-weight:500;}
      .fv{font-size:13px;color:var(--text);padding:6px 9px;background:var(--bg2);border-radius:6px;min-height:30px;display:flex;align-items:center;word-break:break-word;}
      .fv-exp{font-family:'Courier New',monospace;font-weight:700;color:var(--accent);font-size:11px;letter-spacing:1px;background:var(--accent-light);}
      .fv-juz{font-size:12px;background:#fff8e6;color:#7a5800;}
      .fv-money{color:var(--success);font-weight:600;background:var(--success-bg);}
      .fv-mono{font-family:'Courier New',monospace;letter-spacing:1px;font-size:11px;}
      .inline-form{padding:12px 14px;display:flex;flex-direction:column;gap:9px;}
      .if-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
      .if-row{display:flex;flex-direction:column;gap:3px;}
      .if-lbl{font-size:11px;color:var(--text2);font-weight:500;text-transform:uppercase;letter-spacing:.4px;}
      .if-inp{padding:8px 10px;border-radius:8px;border:0.5px solid var(--border);font-size:13px;background:var(--bg);color:var(--text);font-family:var(--font-body);width:100%;}
      .if-inp:focus{outline:2px solid var(--accent);border-color:var(--accent-mid);}
      .if-ta{padding:8px 10px;border-radius:8px;border:0.5px solid var(--border);font-size:13px;background:var(--bg);color:var(--text);font-family:var(--font-body);width:100%;resize:vertical;min-height:64px;line-height:1.5;}
      .if-ta:focus{outline:2px solid var(--accent);}
      .if-actions{display:flex;gap:8px;justify-content:flex-end;}
      .exp-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:7px;background:var(--accent-light);border:0.5px solid var(--accent-mid);font-family:'Courier New',monospace;font-size:11px;font-weight:700;color:var(--accent);}
      .del-modal-box{background:#fff0f0;border:1.5px solid #ffbcbc;border-radius:12px;padding:18px;}
      @media(max-width:767px){.cli-layout{grid-template-columns:1fr;}.cli-lista{display:none;}.cli-lista.show{display:flex;}.cli-ficha{padding:12px;}}
    </style>
    <div class="cli-layout" id="cli-layout">
      <div class="cli-lista" id="cli-lista">
        <div class="cli-lista-hdr">
          <div class="cli-lista-hdr-row">
            <span style="font-family:var(--font-display);font-size:14px;font-weight:500">Directorio</span>
            <span id="cli-cnt" style="font-size:11px;color:var(--text2)"></span>
          </div>
          <div class="search-bar" style="margin-bottom:8px"><span class="search-icon">🔍</span><input id="cli-search" placeholder="Nombre, CURP, exp., juzgado..." oninput="_filtrarCli()"></div>
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${[['todos','Todos'],['activo','Activos'],['urgente','Urgentes'],['pendiente','En proceso'],['cerrado','Cerrados']].map(([v,l])=>`<button class="btn btn-sm${v==='todos'?' btn-primary':''}" id="cfil-${v}" onclick="_setFiltroCli('${v}',this)" style="white-space:nowrap;font-size:11px">${l}</button>`).join('')}
          </div>
        </div>
        <div class="cli-items" id="cli-items"></div>
        <div style="padding:10px 14px;border-top:0.5px solid var(--border);flex-shrink:0">
          <button class="btn btn-primary btn-full" style="font-size:12px" onclick="_openCliForm(null)">+ Agregar cliente</button>
        </div>
      </div>
      <div id="cli-ficha-wrap">
        <div class="cli-empty" id="cli-empty"><div style="font-size:36px;opacity:.3">◎</div><div style="font-weight:500">Selecciona un cliente</div></div>
        <div class="cli-ficha" id="cli-ficha" style="display:none"></div>
      </div>
    </div>`;
  _renderCliLista();
}

function _renderCliLista(){
  const q=(document.getElementById('cli-search')?.value||'').toLowerCase();
  const lista=DB.clientes.filter(c=>(_filtroClientes==='todos'||c.estado===_filtroClientes)&&(!q||[c.nombre,c.curp,c.email,c.numExpediente||c.expediente,c.juzgado||'',c.tipo].join(' ').toLowerCase().includes(q)));
  const el=document.getElementById('cli-items');if(!el)return;
  document.getElementById('cli-cnt').textContent=lista.length+' cliente'+(lista.length!==1?'s':'');
  el.innerHTML=lista.map(c=>`
    <div class="cli-row${_cliSel?.id===c.id?' selected':''}" onclick="_selCli(${c.id})">
      <div class="cli-av">${c.iniciales}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.nombre}</div>
        <div style="font-family:monospace;font-size:10px;color:var(--accent);font-weight:700;margin-top:2px">${c.numExpediente||c.expediente||'—'}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">${c.tipo} · ${estadoBadge(c.estado)}</div>
      </div>
    </div>`).join('')||'<div style="padding:20px;text-align:center;color:var(--text2);font-size:13px">Sin resultados</div>';
}

function _setFiltroCli(f,el){
  _filtroClientes=f;
  ['todos','activo','urgente','pendiente','cerrado'].forEach(v=>{const b=document.getElementById('cfil-'+v);if(b)b.className='btn btn-sm'+(v===f?' btn-primary':'');});
  _renderCliLista();
}
function _filtrarCli(){_renderCliLista();}

function _selCli(id){
  _cliSel=DB.clientes.find(c=>c.id===id);_editSec=null;
  document.getElementById('cli-empty').style.display='none';
  const f=document.getElementById('cli-ficha');f.style.display='flex';
  _renderFicha();_renderCliLista();
}

function _renderFicha(){
  const c=_cliSel;if(!c)return;
  const alta=c.alta?new Date(c.alta+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}):'—';
  const nac=c.nacimiento?new Date(c.nacimiento+'T12:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'}):'—';
  const est=({activo:{cls:'badge-active',lbl:'Activo'},urgente:{cls:'badge-urgent',lbl:'Urgente'},pendiente:{cls:'badge-pending',lbl:'En proceso'},cerrado:{cls:'badge-closed',lbl:'Cerrado'}})[c.estado]||{cls:'badge-closed',lbl:'—'};
  const s=_editSec;
  const numExp=c.numExpediente||c.expediente||'—';
  const juzgado=c.juzgado||'Sin juzgado asignado';

  document.getElementById('cli-ficha').innerHTML=`
    <!-- HEADER -->
    <div class="sec-card">
      <div style="padding:16px;display:flex;align-items:flex-start;gap:12px">
        <div class="cli-av" style="width:48px;height:48px;font-size:16px;flex-shrink:0">${c.iniciales}</div>
        <div style="flex:1">
          <div style="font-family:var(--font-display);font-size:17px;font-weight:500;margin-bottom:3px">${c.nombre}</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:7px">${c.tipo} · Alta: ${alta}</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">
            <span class="badge ${est.cls}">${est.lbl}</span>
            <span class="exp-badge">📋 ${numExp}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
          <button class="btn btn-primary btn-sm" onclick="_openCliForm(${c.id})">✎ Editar todo</button>
          <button class="btn btn-sm" style="background:#fff0f0;color:var(--red,#E24B4A);border-color:#ffbcbc" onclick="_confirmDel(${c.id})">🗑 Eliminar</button>
        </div>
      </div>
    </div>

    <!-- EXPEDIENTE & JUZGADO -->
    <div class="sec-card">
      <div class="sec-hdr"><span class="sec-title">📋 Expediente & Juzgado</span><button class="sec-edit-btn" onclick="_editSec='exp';_renderFicha()">✎ Editar</button></div>
      ${s==='exp'?`<div class="inline-form">
        <div class="if-row"><label class="if-lbl">Número de expediente *</label><input class="if-inp" id="ie-numexp" value="${numExp}" placeholder="Ej. 00-LAB-2024-041" style="font-family:monospace;letter-spacing:1px"></div>
        <div class="if-row"><label class="if-lbl">Juzgado / Tribunal</label><input class="if-inp" id="ie-juzgado" value="${c.juzgado||''}" placeholder="Ej. Juzgado 4° de lo Laboral — Guadalajara"></div>
        <div class="if-grid">
          <div class="if-row"><label class="if-lbl">Tipo de caso</label><select class="if-inp" id="ie-tipo">${['Laboral','Civil','Familiar','Mercantil','Administrativo','Penal','Amparo'].map(t=>`<option${c.tipo===t?' selected':''}>${t}</option>`).join('')}</select></div>
          <div class="if-row"><label class="if-lbl">Estado</label><select class="if-inp" id="ie-estado">${[['activo','Activo'],['urgente','Urgente'],['pendiente','En proceso'],['cerrado','Cerrado']].map(([v,l])=>`<option value="${v}"${c.estado===v?' selected':''}>${l}</option>`).join('')}</select></div>
        </div>
        <div class="if-actions"><button class="btn btn-sm" onclick="_editSec=null;_renderFicha()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="_saveSec('exp')">Guardar</button></div>
      </div>`:`<div class="fgrid">
        <div class="fg" style="grid-column:1/-1"><div class="fl">Número de expediente</div><div class="fv fv-exp">${numExp}</div></div>
        <div class="fg" style="grid-column:1/-1"><div class="fl">Juzgado / Tribunal</div><div class="fv fv-juz">⚖ ${juzgado}</div></div>
        <div class="fg"><div class="fl">Tipo de caso</div><div class="fv">${c.tipo}</div></div>
        <div class="fg"><div class="fl">Estado</div><div class="fv" style="background:transparent;padding:0"><span class="badge ${est.cls}">${est.lbl}</span></div></div>
      </div>`}
    </div>

    <!-- DATOS PERSONALES -->
    <div class="sec-card">
      <div class="sec-hdr"><span class="sec-title">◎ Datos personales</span><button class="sec-edit-btn" onclick="_editSec='datos';_renderFicha()">✎ Editar</button></div>
      ${s==='datos'?`<div class="inline-form">
        <div class="if-row"><label class="if-lbl">Nombre completo *</label><input class="if-inp" id="ie-nombre" value="${c.nombre}"></div>
        <div class="if-grid">
          <div class="if-row"><label class="if-lbl">CURP</label><input class="if-inp" id="ie-curp" value="${c.curp||''}" maxlength="18" oninput="this.value=this.value.toUpperCase()" style="font-family:monospace;letter-spacing:1px"></div>
          <div class="if-row"><label class="if-lbl">Fecha de nacimiento</label><input class="if-inp" id="ie-nac" type="date" value="${c.nacimiento||''}"></div>
        </div>
        <div class="if-row"><label class="if-lbl">Dirección completa</label><input class="if-inp" id="ie-dir" value="${c.direccion||''}"></div>
        <div class="if-grid">
          <div class="if-row"><label class="if-lbl">Fecha de alta</label><input class="if-inp" id="ie-alta" type="date" value="${c.alta||''}"></div>
          <div class="if-row"><label class="if-lbl">Honorarios</label><input class="if-inp" id="ie-honor" value="${c.honorarios||''}"></div>
        </div>
        <div class="if-actions"><button class="btn btn-sm" onclick="_editSec=null;_renderFicha()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="_saveSec('datos')">Guardar</button></div>
      </div>`:`<div class="fgrid">
        <div class="fg" style="grid-column:1/-1"><div class="fl">Nombre completo</div><div class="fv">${c.nombre}</div></div>
        <div class="fg"><div class="fl">CURP</div><div class="fv fv-mono">${c.curp||'—'}</div></div>
        <div class="fg"><div class="fl">Fecha de nacimiento</div><div class="fv">${nac}</div></div>
        <div class="fg" style="grid-column:1/-1"><div class="fl">Dirección</div><div class="fv">${c.direccion||'—'}</div></div>
        <div class="fg"><div class="fl">Fecha de alta</div><div class="fv">${alta}</div></div>
        <div class="fg"><div class="fl">Honorarios</div><div class="fv fv-money">${c.honorarios||'—'}</div></div>
      </div>`}
    </div>

    <!-- CONTACTO -->
    <div class="sec-card">
      <div class="sec-hdr"><span class="sec-title">📞 Contacto</span><button class="sec-edit-btn" onclick="_editSec='contacto';_renderFicha()">✎ Editar</button></div>
      ${s==='contacto'?`<div class="inline-form">
        <div class="if-grid">
          <div class="if-row"><label class="if-lbl">Teléfono / WhatsApp</label><input class="if-inp" id="ie-tel" type="tel" value="${c.telefono||''}"></div>
          <div class="if-row"><label class="if-lbl">Teléfono alternativo</label><input class="if-inp" id="ie-tel2" type="tel" value="${c.tel2||''}"></div>
          <div class="if-row"><label class="if-lbl">Correo principal</label><input class="if-inp" id="ie-email" type="email" value="${c.email||''}"></div>
          <div class="if-row"><label class="if-lbl">Correo alternativo</label><input class="if-inp" id="ie-email2" type="email" value="${c.email2||''}"></div>
        </div>
        <div class="if-actions"><button class="btn btn-sm" onclick="_editSec=null;_renderFicha()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="_saveSec('contacto')">Guardar</button></div>
      </div>`:`<div class="fgrid">
        <div class="fg"><div class="fl">Teléfono principal</div><div class="fv" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">${c.telefono||'—'}${c.telefono?`<button class="wa-btn" style="font-size:11px" onclick="openWA('${c.telefono}','Hola ${c.nombre.split(' ')[0]}, soy el Lic. García.')">● WA</button>`:''}  </div></div>
        <div class="fg"><div class="fl">Teléfono alternativo</div><div class="fv">${c.tel2||'—'}</div></div>
        <div class="fg"><div class="fl">Correo principal</div><div class="fv" style="color:var(--accent)">${c.email||'—'}</div></div>
        <div class="fg"><div class="fl">Correo alternativo</div><div class="fv">${c.email2||'—'}</div></div>
      </div>`}
    </div>

    <!-- ASUNTO -->
    <div class="sec-card">
      <div class="sec-hdr"><span class="sec-title">▤ Asunto legal</span><button class="sec-edit-btn" onclick="_editSec='asunto';_renderFicha()">✎ Editar</button></div>
      ${s==='asunto'?`<div class="inline-form">
        <textarea class="if-ta" id="ie-asunto" rows="3">${c.asunto||''}</textarea>
        <div class="if-actions"><button class="btn btn-sm" onclick="_editSec=null;_renderFicha()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="_saveSec('asunto')">Guardar</button></div>
      </div>`:`<div style="padding:12px 14px;font-size:13px;color:var(--text);line-height:1.6">${c.asunto||'Sin descripción.'}</div>`}
    </div>

    <!-- NOTAS -->
    <div class="sec-card">
      <div class="sec-hdr"><span class="sec-title">📝 Notas internas</span><button class="sec-edit-btn" onclick="_editSec='notas';_renderFicha()">✎ Editar</button></div>
      ${s==='notas'?`<div class="inline-form">
        <textarea class="if-ta" id="ie-notas" rows="4">${c.notas||''}</textarea>
        <div class="if-actions"><button class="btn btn-sm" onclick="_editSec=null;_renderFicha()">Cancelar</button><button class="btn btn-primary btn-sm" onclick="_saveSec('notas')">Guardar</button></div>
      </div>`:`<div style="padding:12px 14px;font-size:13px;color:var(--text2);line-height:1.6">${c.notas||'Sin notas.'}</div>`}
    </div>

    <!-- ACCIONES -->
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-bottom:4px">
      <button class="btn btn-primary" onclick="_openCliForm(${c.id})">✎ Editar todos los campos</button>
      ${c.telefono?`<button class="wa-btn" style="padding:8px 14px;font-size:13px" onclick="openWA('${c.telefono}','Hola ${c.nombre.split(' ')[0]}, soy el Lic. García.')">● WhatsApp</button>`:''}
      <button class="resumen-btn" style="padding:8px 14px;font-size:13px" onclick="mostrarResumen('${c.nombre}','${c.tipo}','${(c.asunto||'').replace(/'/g,'`')}','${c.numExpediente||c.expediente||''}')">✦ Resumen</button>
      <button class="btn btn-sm" style="background:#fff0f0;color:#E24B4A;border-color:#ffbcbc" onclick="_confirmDel(${c.id})">🗑 Eliminar</button>
    </div>`;
}

function _saveSec(sec){
  const c=_cliSel;if(!c)return;
  if(sec==='exp'){
    const n=document.getElementById('ie-numexp')?.value.trim();if(!n){showToast('⚠️ El número de expediente es obligatorio');return;}
    c.numExpediente=n;c.juzgado=document.getElementById('ie-juzgado')?.value.trim();
    c.tipo=document.getElementById('ie-tipo')?.value;c.estado=document.getElementById('ie-estado')?.value;
  }else if(sec==='datos'){
    const n=document.getElementById('ie-nombre')?.value.trim();if(!n){showToast('⚠️ El nombre es obligatorio');return;}
    c.nombre=n;c.iniciales=n.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
    c.curp=document.getElementById('ie-curp')?.value.trim();c.nacimiento=document.getElementById('ie-nac')?.value;
    c.direccion=document.getElementById('ie-dir')?.value.trim();c.alta=document.getElementById('ie-alta')?.value;
    c.honorarios=document.getElementById('ie-honor')?.value.trim();
  }else if(sec==='contacto'){
    c.telefono=document.getElementById('ie-tel')?.value.trim();c.tel2=document.getElementById('ie-tel2')?.value.trim();
    c.email=document.getElementById('ie-email')?.value.trim();c.email2=document.getElementById('ie-email2')?.value.trim();
  }else if(sec==='asunto'){c.asunto=document.getElementById('ie-asunto')?.value.trim();}
  else if(sec==='notas'){c.notas=document.getElementById('ie-notas')?.value.trim();}
  _editSec=null;_renderFicha();_renderCliLista();
  showToast('✅ '+{exp:'Expediente actualizado',datos:'Datos guardados',contacto:'Contacto guardado',asunto:'Asunto guardado',notas:'Notas guardadas'}[sec]);
}

function _confirmDel(id){
  const c=DB.clientes.find(x=>x.id===id);if(!c)return;
  showModal(`<div class="del-modal-box">
    <div style="font-size:15px;font-weight:600;color:#E24B4A;margin-bottom:8px">🗑 Eliminar cliente</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6">¿Estás seguro de eliminar a <strong>${c.nombre}</strong> (${c.numExpediente||c.expediente})? Se eliminará toda la información asociada. Esta acción no se puede deshacer.</div>
    <div style="display:flex;gap:10px">
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-full" style="background:#E24B4A;color:white;border-color:#E24B4A" onclick="_eliminarCli(${id})">Sí, eliminar</button>
    </div>
  </div>`);
}

function _eliminarCli(id){
  const c=DB.clientes.find(x=>x.id===id);
  DB.clientes=DB.clientes.filter(x=>x.id!==id);
  if(_cliSel?.id===id){
    _cliSel=null;_editSec=null;
    const f=document.getElementById('cli-ficha');if(f)f.style.display='none';
    const e=document.getElementById('cli-empty');if(e)e.style.display='';
  }
  closeModal();_renderCliLista();
  showToast(`🗑 "${c?.nombre}" eliminado`);
}

function _openCliForm(id){
  const c=id?DB.clientes.find(x=>x.id===id):null;
  showModal(`<div style="font-family:var(--font-display);font-size:17px;font-weight:500;margin-bottom:16px">${c?`Editar — ${c.nombre}`:'Nuevo cliente'}</div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;padding-bottom:8px;border-bottom:0.5px solid var(--border);margin-bottom:12px">📋 Expediente & Juzgado</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div class="form-row"><label class="form-label">Número de expediente *</label><input class="form-input" id="nf-numexp" value="${c?.numExpediente||c?.expediente||''}" placeholder="Ej. 00-LAB-2024-041" style="font-family:monospace;letter-spacing:1px"></div>
          <div class="form-row"><label class="form-label">Tipo de caso</label><select class="form-input" id="nf-tipo">${['Laboral','Civil','Familiar','Mercantil','Administrativo','Penal','Amparo'].map(t=>`<option${c?.tipo===t?' selected':''}>${t}</option>`).join('')}</select></div>
        </div>
        <div class="form-row"><label class="form-label">Juzgado / Tribunal</label><input class="form-input" id="nf-juzgado" value="${c?.juzgado||''}" placeholder="Ej. Juzgado 4° de lo Laboral — Guadalajara, Jal."></div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;padding-bottom:8px;border-bottom:0.5px solid var(--border);margin-bottom:12px">◎ Datos personales</div>
        <div class="form-row" style="margin-bottom:10px"><label class="form-label">Nombre completo *</label><input class="form-input" id="nf-nombre" value="${c?.nombre||''}" placeholder="Juan Martínez García"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div class="form-row"><label class="form-label">CURP</label><input class="form-input" id="nf-curp" value="${c?.curp||''}" maxlength="18" oninput="this.value=this.value.toUpperCase()" style="font-family:monospace;letter-spacing:1px"></div>
          <div class="form-row"><label class="form-label">Fecha de nacimiento</label><input class="form-input" id="nf-nac" type="date" value="${c?.nacimiento||''}"></div>
        </div>
        <div class="form-row" style="margin-bottom:10px"><label class="form-label">Dirección completa</label><input class="form-input" id="nf-dir" value="${c?.direccion||''}" placeholder="Calle, número, colonia, ciudad, C.P."></div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div class="form-row"><label class="form-label">Fecha de alta</label><input class="form-input" id="nf-alta" type="date" value="${c?.alta||new Date().toISOString().split('T')[0]}"></div>
          <div class="form-row"><label class="form-label">Estado</label><select class="form-input" id="nf-estado">${[['activo','Activo'],['urgente','Urgente'],['pendiente','En proceso'],['cerrado','Cerrado']].map(([v,l])=>`<option value="${v}"${c?.estado===v?' selected':''}>${l}</option>`).join('')}</select></div>
          <div class="form-row"><label class="form-label">Honorarios</label><input class="form-input" id="nf-honor" value="${c?.honorarios||''}" placeholder="$0.00"></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;padding-bottom:8px;border-bottom:0.5px solid var(--border);margin-bottom:12px">📞 Contacto</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-row"><label class="form-label">Teléfono / WhatsApp</label><input class="form-input" id="nf-tel" type="tel" value="${c?.telefono||''}" placeholder="521 33 1234 5678"></div>
          <div class="form-row"><label class="form-label">Correo electrónico</label><input class="form-input" id="nf-email" type="email" value="${c?.email||''}" placeholder="cliente@correo.com"></div>
          <div class="form-row"><label class="form-label">Teléfono alternativo</label><input class="form-input" id="nf-tel2" type="tel" value="${c?.tel2||''}" placeholder="Opcional"></div>
          <div class="form-row"><label class="form-label">Correo alternativo</label><input class="form-input" id="nf-email2" type="email" value="${c?.email2||''}" placeholder="Opcional"></div>
        </div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;padding-bottom:8px;border-bottom:0.5px solid var(--border);margin-bottom:12px">▤ Caso & Notas</div>
        <div class="form-row" style="margin-bottom:10px"><label class="form-label">Descripción del asunto</label><textarea class="form-textarea" id="nf-asunto">${c?.asunto||''}</textarea></div>
        <div class="form-row"><label class="form-label">Notas internas</label><textarea class="form-textarea" id="nf-notas">${c?.notas||''}</textarea></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="_guardarCliForm(${id||'null'})">Guardar cliente</button>
    </div>`);
}

function _guardarCliForm(editId){
  const nombre=document.getElementById('nf-nombre')?.value.trim();
  if(!nombre){showToast('⚠️ El nombre es obligatorio');return;}
  const data={
    nombre,iniciales:nombre.split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase(),
    numExpediente:document.getElementById('nf-numexp')?.value.trim()||('EXP-'+Date.now()),
    expediente:document.getElementById('nf-numexp')?.value.trim()||('EXP-'+Date.now()),
    juzgado:document.getElementById('nf-juzgado')?.value.trim(),
    curp:document.getElementById('nf-curp')?.value.trim(),
    nacimiento:document.getElementById('nf-nac')?.value,
    email:document.getElementById('nf-email')?.value.trim(),
    email2:document.getElementById('nf-email2')?.value.trim(),
    telefono:document.getElementById('nf-tel')?.value.trim(),
    tel2:document.getElementById('nf-tel2')?.value.trim(),
    direccion:document.getElementById('nf-dir')?.value.trim(),
    tipo:document.getElementById('nf-tipo')?.value,
    estado:document.getElementById('nf-estado')?.value,
    alta:document.getElementById('nf-alta')?.value,
    honorarios:document.getElementById('nf-honor')?.value.trim(),
    asunto:document.getElementById('nf-asunto')?.value.trim(),
    notas:document.getElementById('nf-notas')?.value.trim(),
  };
  if(editId&&editId!=='null'){
    const idx=DB.clientes.findIndex(c=>c.id===editId);
    if(idx!==-1){data.id=editId;DB.clientes[idx]=data;}
    if(_cliSel?.id===editId){_cliSel=data;_editSec=null;_renderFicha();}
    showToast('✅ Cliente actualizado');
  }else{
    data.id=Date.now();DB.clientes.push(data);
    DB.expedientes.push({id:data.numExpediente,clienteId:data.id,tipo:data.tipo,estado:data.estado,juzgado:data.juzgado||'',apertura:data.alta});
    _cliSel=data;_editSec=null;
    const f=document.getElementById('cli-ficha');if(f)f.style.display='flex';
    const e=document.getElementById('cli-empty');if(e)e.style.display='none';
    _renderFicha();showToast('✅ Cliente registrado');
  }
  closeModal();_renderCliLista();
}

// Legacy aliases so dashboard still works
function verCliente(id){_selCli(id);}
function guardarNotasCliente(id){const c=DB.clientes.find(x=>x.id===id);if(c){c.notas=document.getElementById('notas-edit')?.value||'';showToast('✅ Notas guardadas');}}

// ============ EXPEDIENTES ============
function renderExpedientes(el){
  el.innerHTML=`<div class="search-bar"><span class="search-icon">🔍</span><input placeholder="Buscar expediente..." oninput="filtrarExpedientes(this.value)" id="exp-search"></div><div id="exp-cards"></div>`;
  renderExpCards('');
}
function filtrarExpedientes(q){renderExpCards(q.toLowerCase());}
function renderExpCards(q){
  const el=document.getElementById('exp-cards');if(!el)return;
  const lista=DB.expedientes.filter(e=>!q||(e.id+(getClienteByExp(e.id)?.nombre||'')).toLowerCase().includes(q));
  el.innerHTML=lista.map(e=>{const c=getClienteByExp(e.id);const tl=DB.timeline[e.id]||[];
    return`<div class="card" style="margin-bottom:12px"><div style="padding:16px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
        <div><div style="font-size:12px;color:var(--accent);font-weight:600">${e.id}</div><div style="font-family:var(--font-display);font-size:15px;font-weight:500;margin-top:3px">${(c?.asunto||'Sin descripción').slice(0,50)}...</div></div>
        ${estadoBadge(e.estado)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--bg2);padding:8px;border-radius:8px"><div style="font-size:10px;color:var(--text2)">Cliente</div><div style="font-size:13px;font-weight:500;margin-top:2px">${c?.nombre||'—'}</div></div>
        <div style="background:var(--bg2);padding:8px;border-radius:8px"><div style="font-size:10px;color:var(--text2)">Tipo</div><div style="font-size:13px;font-weight:500;margin-top:2px">${e.tipo}</div></div>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px">${e.juzgado||'Sin juzgado'} · ${tl.length} documentos</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-sm btn-primary" onclick="verTimeline('${e.id}')">📋 Expediente</button>
        <button class="wa-btn" onclick="openWA('${c?.telefono||''}','Hola ${c?.nombre?.split(' ')[0]||''}')">● WA</button>
        <button class="resumen-btn" onclick="mostrarResumen('${c?.nombre}','${e.tipo}','${(c?.asunto||'').replace(/'/g,'`')}','${e.id}')">✦ Resumen</button>
      </div></div></div>`;}).join('');
}
function verTimeline(expId){
  const exp=getExpediente(expId);const c=getClienteByExp(expId);const tl=DB.timeline[expId]||[];
  const icons={escrito:'📋',acuerdo:'⚖',scan:'📷'};
  showModal(`<div style="margin-bottom:16px"><div style="font-size:12px;color:var(--accent);font-weight:600">${expId}</div><div style="font-family:var(--font-display);font-size:17px;font-weight:500;margin-top:3px">${c?.nombre||''}</div><div style="font-size:13px;color:var(--text2);margin-top:3px">${exp?.tipo} · ${exp?.juzgado||''}</div></div>
    <div style="border-top:0.5px solid var(--border);padding-top:14px">
      ${tl.map(it=>`<div class="tl-item"><div class="tl-icon ${it.tipo}">${icons[it.tipo]||'📄'}</div><div class="tl-body"><div class="tl-date">${formatDate(it.fecha)}</div><div class="tl-title">${it.titulo}</div><div class="tl-sub">${it.sub}</div><span class="badge ${it.origen==='juzgado'?'badge-active':it.origen==='scan'?'':'badge-blue'}" style="font-size:10px;margin-top:4px">${it.tag}</span></div></div>`).join('')}
      <button class="btn btn-primary btn-full" style="margin-top:14px" onclick="closeModal();navigate('documentos',null)">+ Agregar documento</button>
    </div>
    <div class="modal-footer"><button class="btn btn-full" onclick="closeModal()">Cerrar</button></div>`);
}

// ============ AUDIENCIAS ============
let calDate=new Date(2024,3,1);
function renderAudiencias(el){
  el.innerHTML=`<div class="card" style="margin-bottom:14px">
    <div style="padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid var(--border)">
      <button class="btn btn-sm" onclick="prevMes()">‹</button>
      <span id="cal-month-label" style="flex:1;text-align:center;font-family:var(--font-display);font-size:15px;font-weight:500"></span>
      <button class="btn btn-sm" onclick="nextMes()">›</button>
    </div>
    <div class="cal-grid" id="cal-grid-main"></div>
  </div>
  <div class="card">
    <div class="card-header"><h2>Audiencias</h2><button class="btn btn-sm btn-primary" onclick="showModal(modalNuevaAudiencia())">+ Nueva</button></div>
    ${DB.audiencias.map(a=>{const c=getClienteByExp(a.expId);return`<div class="event-item" style="border-left-color:${a.color}">
      <div class="event-time">${formatDate(a.fecha)} — ${a.hora} · ${a.juzgado}</div>
      <div class="event-title">${a.titulo}</div><div class="event-sub">${c?.nombre||''}</div>
      <div class="event-actions">
        <button class="resumen-btn" onclick="mostrarResumen('${c?.nombre}','${getExpediente(a.expId)?.tipo}','${(c?.asunto||'').replace(/'/g,'`')}','${a.expId}')">✦ Resumen</button>
        <button class="wa-btn" onclick="openWA('${c?.telefono||''}','Recordatorio audiencia ${formatDate(a.fecha)} ${a.hora} en ${a.juzgado}.')">● WA</button>
      </div></div>`;}).join('')}
  </div>`;
  buildCalendar();
}
function buildCalendar(){
  const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const label=document.getElementById('cal-month-label');if(label)label.textContent=months[calDate.getMonth()]+' '+calDate.getFullYear();
  const grid=document.getElementById('cal-grid-main');if(!grid)return;
  const evDays=DB.audiencias.filter(a=>a.fecha.startsWith(`${calDate.getFullYear()}-${String(calDate.getMonth()+1).padStart(2,'0')}`)).map(a=>parseInt(a.fecha.split('-')[2]));
  let html=['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d=>`<div class="cal-day-label">${d}</div>`).join('');
  const first=new Date(calDate.getFullYear(),calDate.getMonth(),1);
  let start=first.getDay()-1;if(start<0)start=6;
  const dim=new Date(calDate.getFullYear(),calDate.getMonth()+1,0).getDate();
  const prev=new Date(calDate.getFullYear(),calDate.getMonth(),0).getDate();
  const today=new Date();
  for(let i=start-1;i>=0;i--)html+=`<div class="cal-day other-month">${prev-i}</div>`;
  for(let d=1;d<=dim;d++){const iT=d===today.getDate()&&calDate.getMonth()===today.getMonth()&&calDate.getFullYear()===today.getFullYear();const hE=evDays.includes(d);html+=`<div class="cal-day${iT?' today':''}${hE?' has-event':''}">${d}</div>`;}
  grid.innerHTML=html;
}
function prevMes(){calDate.setMonth(calDate.getMonth()-1);buildCalendar();}
function nextMes(){calDate.setMonth(calDate.getMonth()+1);buildCalendar();}

// ============ DOCUMENTOS ============
let docExpActivo='EXP-2024-041';
function renderDocumentos(el){
  el.innerHTML=`<div style="margin-bottom:12px"><label class="form-label">Expediente</label>
    <select class="form-input" id="doc-exp-sel" onchange="docExpActivo=this.value;renderTLDoc()">
      ${DB.expedientes.map(e=>{const c=getClienteByExp(e.id);return`<option value="${e.id}">${e.id} — ${c?.nombre||''}</option>`;}).join('')}
    </select></div>
    <div class="doc-toolbar">
      <button class="tb-btn" onclick="execDocCmd('bold')"><strong>N</strong></button>
      <button class="tb-btn" onclick="execDocCmd('italic')"><em>K</em></button>
      <button class="tb-btn" onclick="execDocCmd('underline')"><u>S</u></button>
      <button class="tb-btn" onclick="execDocCmd('justifyFull')">≡</button>
      <button class="tb-btn" onclick="insertPlantilla('demanda')">📋 Demanda</button>
      <button class="tb-btn" onclick="insertPlantilla('escrito')">📋 Escrito</button>
      <button class="tb-btn" onclick="insertPlantilla('amparo')">📋 Amparo</button>
      <button class="tb-btn ia" onclick="showIAModal()">✦ IA</button>
    </div>
    <div class="doc-editor" id="doc-editor" contenteditable="true" spellcheck="true">
      <p style="text-align:center;font-weight:bold">JUZGADO CUARTO DE LO LABORAL — GUADALAJARA, JAL.</p>
      <p style="text-align:center;font-weight:bold;margin-bottom:16px">DEMANDA LABORAL</p>
      <p><strong>C. JUEZ:</strong></p><br>
      <p style="text-align:justify">Juan Martínez García comparezco a demandar a CORPORACIÓN XYZ S.A. de C.V. por despido injustificado ocurrido el 15 de diciembre de 2023.</p>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:20px">
      <button class="btn btn-green btn-full" onclick="guardarDocEnExp()">💾 Guardar en expediente</button>
      <button class="btn btn-primary btn-full" onclick="exportarWordDoc()">📄 Word</button>
    </div>
    <div class="card">
      <div class="card-header"><h3>Cronología del expediente</h3><button class="btn btn-sm" onclick="showModal(modalImportScan())">📷 Escanear</button></div>
      <div id="tl-doc-list" style="padding:12px"></div>
    </div>`;
  renderTLDoc();
}
function renderTLDoc(){
  const el=document.getElementById('tl-doc-list');if(!el)return;
  const tl=DB.timeline[docExpActivo]||[];
  const icons={escrito:'📋',acuerdo:'⚖',scan:'📷'};
  el.innerHTML=tl.map(it=>`<div class="tl-item"><div class="tl-icon ${it.tipo}">${icons[it.tipo]||'📄'}</div><div class="tl-body"><div class="tl-date">${formatDate(it.fecha)}</div><div class="tl-title">${it.titulo}</div><div class="tl-sub">${it.sub}</div><span class="badge ${it.origen==='juzgado'?'badge-active':it.origen==='scan'?'':'badge-blue'}" style="font-size:10px;margin-top:4px">${it.tag}</span></div></div>`).join('')||'<div style="color:var(--text2);font-size:13px;text-align:center;padding:12px">Sin documentos aún</div>';
}
function execDocCmd(cmd){document.getElementById('doc-editor')?.focus();document.execCommand(cmd,false,null);}
const plantillasDoc={
  demanda:`<p style="text-align:center;font-weight:bold">DEMANDA</p><p><strong>C. JUEZ:</strong></p><br><p style="text-align:justify">[NOMBRE DEL ACTOR] comparezco a demandar a [DEMANDADO]:</p><br><p><strong>HECHOS</strong></p><p><strong>1.</strong> [Hecho]</p><br><p><strong>DERECHO</strong></p><p>Son aplicables los artículos [FUNDAMENTOS]...</p>`,
  escrito:`<p style="text-align:center;font-weight:bold">ESCRITO DE ALEGATOS</p><p><strong>C. JUEZ:</strong></p><br><p>[NOMBRE], parte en el exp. [NÚMERO], expongo los siguientes alegatos:</p><br><p><strong>1.</strong> [Primer alegato]</p><br><p>Por lo expuesto, solicito a Su Señoría...</p>`,
  amparo:`<p style="text-align:center;font-weight:bold">DEMANDA DE AMPARO INDIRECTO</p><p><strong>C. JUEZ DE DISTRITO:</strong></p><br><p>[QUEJOSO] solicita amparo contra el acto de [AUTORIDAD]:</p><br><p><strong>ACTO RECLAMADO</strong></p><p>[Descripción]</p><br><p><strong>GARANTÍAS VIOLADAS</strong></p><p>Artículos 14 y 16 Constitución.</p>`
};
function insertPlantilla(tipo){const ed=document.getElementById('doc-editor');if(ed){ed.innerHTML=plantillasDoc[tipo]||'';ed.focus();}showToast('📋 Plantilla cargada');}
function guardarDocEnExp(){
  if(!DB.timeline[docExpActivo])DB.timeline[docExpActivo]=[];
  DB.timeline[docExpActivo].unshift({id:Date.now(),fecha:new Date().toISOString().split('T')[0],titulo:'Documento — '+new Date().toLocaleDateString('es-MX'),sub:getExpediente(docExpActivo)?.juzgado||'',tipo:'escrito',origen:'despacho',icon:'📋',tag:'Escrito propio'});
  renderTLDoc();showToast('✅ Guardado en '+docExpActivo);
}
function exportarWordDoc(){showToast('📄 Generando .docx...',1500);setTimeout(()=>showToast('✅ Documento listo'),1600);}
function showIAModal(){
  showModal(`<div class="modal-title">✦ Redactar con IA</div>
    <div class="form-row"><label class="form-label">¿Qué necesitas?</label><textarea class="form-textarea" id="ia-p" rows="4" placeholder="Ej: Continúa la demanda con fundamentos del art. 48 LFT..."></textarea></div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" id="ia-gen-btn" onclick="generarIADoc()">✦ Generar texto</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`);
}
async function generarIADoc(){
  const p=document.getElementById('ia-p')?.value.trim();if(!p){showToast('⚠️ Escribe una instrucción');return;}
  const btn=document.getElementById('ia-gen-btn');btn.textContent='Generando...';btn.disabled=true;
  const ctx=(document.getElementById('doc-editor')?.innerText||'').slice(0,600);
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,system:'Eres abogado experto en derecho mexicano. Responde SOLO con texto legal formal para insertar en un documento judicial. Sin explicaciones ni markdown.',messages:[{role:'user',content:`Documento:\n${ctx}\n\nInstrucción: ${p}`}]})});
    const data=await res.json();
    const text=data.content?.find(b=>b.type==='text')?.text||'';
    const ed=document.getElementById('doc-editor');
    if(ed){const p2=document.createElement('p');p2.style.cssText='text-align:justify;margin-bottom:12px';p2.textContent=text;ed.appendChild(p2);}
    closeModal();showToast('✦ Texto generado con IA');
  }catch(e){showToast('Error al conectar con IA');}
  btn.textContent='✦ Generar texto';btn.disabled=false;
}
function modalImportScan(){
  return`<div class="modal-title">📷 Importar documento</div>
    <div class="scan-drop" onclick="document.getElementById('scan-file').click()">
      <div class="scan-icon">📄</div><div style="font-size:14px;font-weight:500;margin-bottom:4px">Selecciona archivo</div>
      <div style="font-size:12px;color:var(--text2)">PDF, JPG, PNG — CamScanner u otra app</div>
      <input type="file" id="scan-file" accept=".pdf,.jpg,.jpeg,.png" style="display:none" onchange="handleScanFile(this)">
    </div>
    <div class="platform-item" onclick="document.getElementById('scan-file').click()"><div class="platform-icon" style="background:#FFF3CD">📷</div><div class="platform-info"><div class="platform-name">CamScanner</div><div class="platform-sub">Importar PDF desde la app</div></div><span class="badge badge-active">Disponible</span></div>
    <div class="platform-item"><div class="platform-icon" style="background:var(--success-bg)">📧</div><div class="platform-info"><div class="platform-name">Adjuntos Gmail</div><div class="platform-sub">Documentos de correos legales</div></div><span class="badge badge-blue">Gmail ✓</span></div>
    <div class="form-row" style="margin-top:14px"><label class="form-label">Expediente destino</label>
      <select class="form-input" id="scan-exp-sel">${DB.expedientes.map(e=>{const c=getClienteByExp(e.id);return`<option value="${e.id}">${e.id} — ${c?.nombre||''}`;}).join('')}</select></div>
    <div id="scan-fn" style="font-size:12px;color:var(--text2);min-height:18px;margin-bottom:8px"></div>
    <div class="modal-footer">
      <button class="btn btn-primary btn-full" onclick="confirmarScanImport()">📎 Adjuntar al expediente</button>
      <button class="btn btn-full" onclick="closeModal()">Cancelar</button>
    </div>`;
}
function handleScanFile(input){const f=input.files[0];if(f){const el=document.getElementById('scan-fn');if(el)el.textContent='Archivo: '+f.name;}}
function confirmarScanImport(){
  const exp=document.getElementById('scan-exp-sel')?.value||docExpActivo;
  if(!DB.timeline[exp])DB.timeline[exp]=[];
  DB.timeline[exp].unshift({id:Date.now(),fecha:new Date().toISOString().split('T')[0],titulo:'Documento digitalizado',sub:'CamScanner / Importado',tipo:'scan',origen:'scan',icon:'📷',tag:'Escaneado'});
  closeModal();renderTLDoc();showToast('📷 Documento adjuntado');
}

// ============ PRESUPUESTOS ============
function renderPresupuestos(el){
  el.innerHTML=`<div class="card" style="margin-bottom:14px">
    <div class="card-header"><h2>Recibos de pago</h2><button class="btn btn-sm btn-primary" onclick="showModal(modalNuevoRecibo())">+ Recibo</button></div>
    ${DB.recibos.map(r=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:0.5px solid var(--border)"><div><div style="font-size:14px;font-weight:500">${r.cliente}</div><div style="font-size:12px;color:var(--text2);margin-top:2px">${r.concepto} · ${formatDate(r.fecha)}</div></div><div style="text-align:right"><div style="font-size:15px;font-weight:600;color:${r.estado==='pagado'?'var(--success)':'var(--warn)'}">$${r.monto.toLocaleString()}</div><span class="badge ${r.estado==='pagado'?'badge-active':'badge-pending'}" style="font-size:10px">${r.estado==='pagado'?'Pagado':'Pendiente'}</span></div></div>`).join('')}
    <div style="padding:12px 16px;display:flex;justify-content:space-between;font-size:14px;font-weight:500;color:var(--success)"><span>Total cobrado</span><span>$${DB.recibos.filter(r=>r.estado==='pagado').reduce((a,r)=>a+r.monto,0).toLocaleString()}</span></div>
  </div>
  <div class="card"><div class="card-header"><h2>Nuevo presupuesto</h2></div><div style="padding:16px">
    <div class="form-row"><label class="form-label">Cliente</label><select class="form-input" id="pres-cli">${DB.clientes.map(c=>`<option>${c.nombre}</option>`).join('')}</select></div>
    <div class="form-row"><label class="form-label">Servicio</label><select class="form-input">${['Representación en juicio','Asesoría jurídica','Redacción de documentos'].map(t=>`<option>${t}</option>`).join('')}</select></div>
    <div class="form-row"><label class="form-label">Honorarios ($)</label><input class="form-input" id="pres-monto" type="number" value="8000" oninput="calcPres()"></div>
    <div class="receipt-preview"><div style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--accent);margin-bottom:2px">⚖ Despacho García & Asoc.</div><div style="font-size:12px;color:var(--text2);margin-bottom:14px">PRE-2024-089</div>
      <div class="receipt-row"><span>Honorarios</span><span id="pres-r-base">$8,000</span></div>
      <div class="receipt-row"><span>Gastos procesales</span><span>$1,200</span></div>
      <div class="receipt-row"><span>IVA (16%)</span><span id="pres-r-iva">$1,472</span></div>
      <div class="receipt-total"><span>Total</span><span id="pres-r-total">$10,672</span></div>
      <div style="display:flex;gap:10px;margin-top:14px">
        <button class="btn btn-full" onclick="showToast('📄 Exportando PDF...')">PDF</button>
        <button class="btn btn-primary btn-full" onclick="showToast('✉ Enviando...')">Enviar correo</button>
      </div>
    </div>
  </div></div>`;
}
function calcPres(){const base=parseFloat(document.getElementById('pres-monto')?.value||8000);const iva=(base+1200)*0.16;const total=base+1200+iva;const s=v=>'$'+Math.round(v).toLocaleString();if(document.getElementById('pres-r-base'))document.getElementById('pres-r-base').textContent=s(base);if(document.getElementById('pres-r-iva'))document.getElementById('pres-r-iva').textContent=s(iva);if(document.getElementById('pres-r-total'))document.getElementById('pres-r-total').textContent=s(total);}
function modalNuevoRecibo(){return`<div class="modal-title">Nuevo recibo</div><div class="form-row"><label class="form-label">Cliente</label><select class="form-input" id="rec-cli">${DB.clientes.map(c=>`<option value="${c.nombre}">${c.nombre}</option>`).join('')}</select></div><div class="form-row"><label class="form-label">Monto ($)</label><input class="form-input" id="rec-monto" type="number" placeholder="0"></div><div class="form-row"><label class="form-label">Concepto</label><input class="form-input" id="rec-concepto" placeholder="Anticipo honorarios"></div><div class="form-row"><label class="form-label">Forma de pago</label><select class="form-input" id="rec-metodo">${['Efectivo','Transferencia','Cheque','Tarjeta'].map(t=>`<option>${t}</option>`).join('')}</select></div><div class="modal-footer"><button class="btn btn-primary btn-full" onclick="guardarRecibo()">Guardar recibo</button><button class="btn btn-full" onclick="closeModal()">Cancelar</button></div>`;}
function guardarRecibo(){const monto=parseFloat(document.getElementById('rec-monto')?.value||0);if(!monto){showToast('⚠️ Ingresa un monto');return;}DB.recibos.unshift({id:Date.now(),cliente:document.getElementById('rec-cli')?.value,monto,concepto:document.getElementById('rec-concepto')?.value,fecha:new Date().toISOString().split('T')[0],metodo:document.getElementById('rec-metodo')?.value,estado:'pagado'});closeModal();showToast('✅ Recibo guardado');navigate('presupuestos',null);}

// ============ ASISTENTE IA ============
const IA_SYSTEM=`Eres un asistente legal experto en derecho mexicano integrado en Lexia. Tienes acceso al Gmail del usuario (Lic. Salvador González Zuazo). Alerta REAL de Búho Legal: Exp. 00424/2023, TIA FIDE, Juzgado Civil Cihuatlán, 27 abril 2026. Responde en español, conciso y profesional. Usa **negritas**.`;
let iaMsgs=[];
function renderAsistente(el){
  iaMsgs=[{role:'assistant',content:`Hola, Lic. Salvador. Soy tu asistente legal IA con acceso a tu Gmail.\n\n**📧 Alerta detectada:**\n🦉 Búho Legal — Exp. **00424/2023 — TIA FIDE**\nJuzgado Civil de Cihuatlán · 27 abr 2026\n\n¿Quieres que analice el acuerdo?`}];
  el.innerHTML=`<div class="chat-wrap"><div class="chat-messages" id="ia-msgs-list"></div>
    <div style="padding-top:4px">
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px">
        ${['🦉 Analizar alerta Búho Legal','¿Qué hago ahora?','Redactar respuesta','Escanear correos'].map(t=>`<button class="btn btn-sm" style="white-space:nowrap;flex-shrink:0" onclick="enviarIA('${t}')">${t}</button>`).join('')}
      </div>
      <div class="chat-input-row">
        <input class="chat-input" id="ia-input" placeholder="Pregunta legal..." onkeydown="if(event.key==='Enter')enviarIA()">
        <button class="chat-send" onclick="enviarIA()">➤</button>
      </div>
    </div></div>`;
  renderIAMsgs();
}
function renderIAMsgs(){const el=document.getElementById('ia-msgs-list');if(!el)return;el.innerHTML=iaMsgs.map(m=>`<div class="msg ${m.role==='user'?'user':'bot'}"><div class="bubble">${m.content.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>')}</div></div>`).join('');el.scrollTop=el.scrollHeight;}
async function enviarIA(override){
  const input=document.getElementById('ia-input');const text=override||input?.value.trim();if(!text)return;
  if(input)input.value='';iaMsgs.push({role:'user',content:text});renderIAMsgs();
  const el=document.getElementById('ia-msgs-list');
  if(el){const d=document.createElement('div');d.className='msg bot';d.id='ia-typing-msg';d.innerHTML='<div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';el.appendChild(d);el.scrollTop=el.scrollHeight;}
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:800,system:IA_SYSTEM,messages:iaMsgs.map(m=>({role:m.role,content:m.content}))})});
    const data=await res.json();document.getElementById('ia-typing-msg')?.remove();
    const reply=data.content?.find(b=>b.type==='text')?.text||'No pude obtener respuesta.';
    iaMsgs.push({role:'assistant',content:reply});renderIAMsgs();
  }catch(e){document.getElementById('ia-typing-msg')?.remove();iaMsgs.push({role:'assistant',content:'Error de conexión.'});renderIAMsgs();}
}

// ============ MONITOREO ============
function renderMonitoreo(el){
  el.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
    <div class="stat-card"><div class="stat-label">Alertas activas</div><div class="stat-value" style="color:var(--danger)">1</div></div>
    <div class="stat-card"><div class="stat-label">Último escaneo</div><div class="stat-value" style="font-size:18px">Hoy</div></div>
  </div>
  <div class="alert-card" style="margin-bottom:14px">
    <div class="alert-card-title">🦉 Búho Legal — Alerta nueva</div>
    <div class="alert-card-body"><div style="margin-bottom:8px"><strong>Exp. 00424/2023 — TIA FIDE</strong></div>
      <div style="font-size:12px;margin-bottom:4px">📍 Cihuatlán — Juzgado Civil</div>
      <div style="font-size:12px;margin-bottom:4px">📅 27 de abril 2026</div>
      <div style="font-size:12px;color:var(--text2)">alerta_expediente@buholegal.com</div>
    </div>
    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn btn-primary btn-sm" onclick="navigate('asistente',null);setTimeout(()=>enviarIA('Analiza la alerta Búho Legal exp. 00424/2023 y dime qué acción tomar'),400)">✦ Analizar con IA</button>
      <button class="btn btn-sm" onclick="marcarRevisado()">✓ Revisado</button>
    </div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="card-header"><h3>Correos detectados</h3><button class="btn btn-sm" onclick="escanearCorreos()">🔄 Escanear</button></div>
    <div class="list-item"><div style="font-size:22px">🦉</div><div class="list-info"><div class="list-name">Búho Legal — Exp. 00424/2023</div><div class="list-meta">27 abr 2026 · alerta_expediente@buholegal.com</div></div><span class="badge badge-urgent" style="font-size:10px">Nueva</span></div>
    <div class="list-item"><div style="font-size:22px">📧</div><div class="list-info"><div class="list-name">AIG Seguros — Siniestro 1488834</div><div class="list-meta">28 abr 2026 · AIG Seguros México</div></div><span class="badge badge-pending" style="font-size:10px">Media</span></div>
  </div>
  <div class="card">
    <div class="card-header"><h3>Plataformas monitoreadas</h3></div>
    <div class="platform-item"><div class="platform-icon" style="background:#FFF3CD">🦉</div><div class="platform-info"><div class="platform-name">Búho Legal</div><div class="platform-sub">alerta_expediente@buholegal.com</div></div><span class="badge badge-active">Activo</span></div>
    <div class="platform-item"><div class="platform-icon" style="background:var(--accent-light)">⚖</div><div class="platform-info"><div class="platform-name">SISE / PJF</div><div class="platform-sub">Poder Judicial Federal</div></div><span class="badge badge-closed">Config.</span></div>
    <div class="platform-item"><div class="platform-icon" style="background:var(--success-bg)">📧</div><div class="platform-info"><div class="platform-name">Gmail conectado</div><div class="platform-sub">salvadorzuazo@gmail.com</div></div><span class="badge badge-active">✓ Activo</span></div>
    <div style="padding:14px 16px"><button class="btn btn-primary btn-full" onclick="showToast('Próximamente')">+ Agregar plataforma</button></div>
  </div>`;
}
function marcarRevisado(){DB.alertasBuho.forEach(a=>a.revisado=true);showToast('✅ Alerta revisada');navigate('monitoreo',null);}
function escanearCorreos(){showToast('🔄 Escaneando...',1500);setTimeout(()=>showToast('🦉 1 alerta Búho Legal detectada'),1600);}

// ============ RESUMEN ============
function mostrarResumen(nombre,tipo,asunto,expId){
  const c=getClienteByExp(expId);
  showModal(`<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px"><div style="width:40px;height:40px;border-radius:50%;background:var(--accent-light);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:18px">✦</div><div><div style="font-family:var(--font-display);font-size:17px;font-weight:500">Resumen del juicio</div><div style="font-size:12px;color:var(--text2)">${expId}</div></div></div>
    <div style="background:var(--bg2);border-radius:var(--radius);padding:16px;margin-bottom:14px">
      <div style="margin-bottom:10px"><div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">Cliente</div><div style="font-size:14px;font-weight:500;margin-top:3px">${nombre||'—'}</div></div>
      <div style="margin-bottom:10px"><div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">Tipo</div><div style="font-size:14px;margin-top:3px">${tipo||'—'}</div></div>
      <div style="margin-bottom:10px"><div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">Asunto</div><div style="font-size:14px;margin-top:3px">${asunto||'—'}</div></div>
      <div><div style="font-size:11px;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Próximos pasos</div><div style="font-size:13px;line-height:1.7">1. Asistir a la audiencia en la fecha indicada.<br>2. Portar identificación oficial.<br>3. Llegar 15 min antes al juzgado.<br>4. Cualquier novedad será notificada.</div></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-green btn-full" onclick="closeModal();openWA('${c?.telefono||''}','Estimado/a ${(nombre||'').split(' ')[0]}, resumen de su caso:\\n\\n📋 ${expId}\\n⚖ ${tipo}\\n📄 ${asunto}\\n\\nEtapa: En proceso.\\n\\nAtte, Lic. González')">📱 Enviar por WhatsApp</button>
      <button class="btn btn-full" onclick="closeModal()">Cerrar</button>
    </div>`);
}
