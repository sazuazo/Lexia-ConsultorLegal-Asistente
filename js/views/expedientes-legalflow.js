// ============ VISTA EXPEDIENTES + LEGALFLOW ============
// Integra casos, audiencias, escritos y acuerdos con optimizaciones para Android

function renderExpedientes(el) {
  const title = 'Expedientes & Casos';
  const casos = DB.casos;

  let html = `
    <div class="view-header">
      <h1>${title}</h1>
      <p class="view-subtitle">${casos.length} casos activos</p>
    </div>

    <div class="search-box">
      <input type="text" id="search-casos" placeholder="🔍 Buscar por número, cliente..." 
        onkeyup="filtrarCasos(this.value)">
    </div>

    <div id="casos-list" class="casos-grid">
  `;

  casos.forEach(caso => {
    const cliente = getCliente(caso.cliente_id);
    const audiencias = getAudienciasPorCaso(caso.id);
    const proximaAudiencia = audiencias.length > 0 ? audiencias[0] : null;
    const diasFalta = proximaAudiencia ? diasFaltantes(proximaAudiencia.fecha) : null;

    const colorEstado = {
      'Activo': '#2C5F8A',
      'En espera': '#FFC107',
      'Concluido': '#1D9E75',
      'Archivado': '#6C757D'
    };

    html += `
      <div class="caso-card" onclick="verDetalleCaso('${caso.id}')">
        <div class="caso-header" style="border-left: 4px solid ${colorEstado[caso.estado] || '#2C5F8A'}">
          <div class="caso-exp">${caso.numero_expediente}</div>
          ${estadoBadge(caso.estado)}
        </div>
        
        <div class="caso-body">
          <div class="caso-tipo">
            <span class="tipo-badge">${caso.tipo_juicio}</span>
          </div>
          
          <div class="caso-cliente">
            <strong>${cliente ? cliente.nombre_completo : 'Cliente desconocido'}</strong>
          </div>
          
          <div class="caso-desc">
            ${caso.descripcion || 'Sin descripción'}
          </div>
          
          <div class="caso-meta">
            <span>🏛️ ${caso.juzgado}</span>
          </div>
          
          ${proximaAudiencia ? `
            <div class="caso-proxima">
              <div class="proxima-label">Próxima audiencia</div>
              <div class="proxima-info">
                <div>${formatDate(proximaAudiencia.fecha)} a las ${proximaAudiencia.hora}</div>
                <div class="dias-falta ${diasFalta <= 7 ? 'urgente' : 'normal'}">
                  ⏰ ${diasFalta} días
                </div>
              </div>
            </div>
          ` : `
            <div class="caso-proxima sin-audiencia">
              Sin audiencias programadas
            </div>
          `}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  el.innerHTML = html;
}

// Filtrar casos en tiempo real
function filtrarCasos(query) {
  const cards = document.querySelectorAll('.caso-card');
  const q = query.toLowerCase();

  cards.forEach(card => {
    const exp = card.querySelector('.caso-exp').textContent.toLowerCase();
    const cliente = card.querySelector('.caso-cliente').textContent.toLowerCase();
    const desc = card.querySelector('.caso-desc').textContent.toLowerCase();

    if (exp.includes(q) || cliente.includes(q) || desc.includes(q)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Ver detalle completo del caso
function verDetalleCaso(casoId) {
  const caso = getCaso(casoId);
  if (!caso) return;

  const cliente = getCliente(caso.cliente_id);
  const audiencias = getAudienciasPorCaso(casoId);
  const escritos = getEscritosPorCaso(casoId);
  const acuerdos = getAcuerdosPorCaso(casoId);

  let html = `
    <div class="modal-header">
      <h2>${caso.numero_expediente}</h2>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>

    <div class="modal-content">
      
      <!-- INFORMACIÓN GENERAL -->
      <section class="detail-section">
        <h3>📋 Información General</h3>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Cliente</label>
            <strong>${cliente ? cliente.nombre_completo : 'N/A'}</strong>
          </div>
          <div class="detail-item">
            <label>Tipo de Juicio</label>
            <strong>${caso.tipo_juicio}</strong>
          </div>
          <div class="detail-item">
            <label>Estado</label>
            ${estadoBadge(caso.estado)}
          </div>
          <div class="detail-item">
            <label>Juzgado</label>
            <strong>${caso.juzgado}</strong>
          </div>
          <div class="detail-item">
            <label>Fecha de Inicio</label>
            <strong>${formatDateLong(caso.fecha_inicio)}</strong>
          </div>
          <div class="detail-item">
            <label>Contraparte</label>
            <strong>${caso.contraparte || 'No especificada'}</strong>
          </div>
          <div class="detail-item full">
            <label>Descripción</label>
            <strong>${caso.descripcion || 'Sin descripción'}</strong>
          </div>
        </div>
      </section>

      <!-- AUDIENCIAS -->
      <section class="detail-section">
        <h3>🗓️ Audiencias (${audiencias.length})</h3>
        ${audiencias.length > 0 ? `
          <div class="audiencias-list">
            ${audiencias.map(a => `
              <div class="audiencia-item ${a.completada ? 'completada' : ''}">
                <div class="aud-header">
                  <div class="aud-titulo">${a.titulo}</div>
                  ${!a.completada ? `<span class="aud-dias ${diasFaltantes(a.fecha) <= 7 ? 'urgente' : ''}">${diasFaltantes(a.fecha)}d</span>` : '<span class="aud-check">✓</span>'}
                </div>
                <div class="aud-meta">
                  <div>📅 ${formatDate(a.fecha)} • ⏰ ${a.hora}</div>
                  <div>📍 ${a.ubicacion || 'Por definir'}</div>
                </div>
                ${a.notas ? `<div class="aud-notas">${a.notas}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="empty-state">Sin audiencias programadas</p>'}
      </section>

      <!-- ESCRITOS -->
      <section class="detail-section">
        <h3>📄 Escritos (${escritos.length})</h3>
        ${escritos.length > 0 ? `
          <div class="escritos-list">
            ${escritos.map(e => `
              <div class="escrito-item">
                <div class="escrito-tipo">${e.tipo_escrito}</div>
                <div class="escrito-titulo">${e.titulo}</div>
                <div class="escrito-fecha">${formatDate(e.fecha_presentacion)}</div>
                ${e.file_url ? `<a href="#" class="escrito-link">📎 ${e.file_url}</a>` : ''}
                ${e.observaciones ? `<div class="escrito-obs">${e.observaciones}</div>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="empty-state">Sin escritos registrados</p>'}
      </section>

      <!-- ACUERDOS -->
      <section class="detail-section">
        <h3>⚖️ Acuerdos & Notificaciones (${acuerdos.length})</h3>
        ${acuerdos.length > 0 ? `
          <div class="acuerdos-list">
            ${acuerdos.map(a => `
              <div class="acuerdo-item">
                <div class="acuerdo-tipo">${a.tipo_acuerdo}</div>
                <div class="acuerdo-fecha">${formatDate(a.fecha_acuerdo)}</div>
                <div class="acuerdo-contenido">${a.contenido}</div>
                ${estadoBadge(a.estado)}
                ${a.url_fuente ? `<a href="${a.url_fuente}" target="_blank" class="acuerdo-link">Ver fuente</a>` : ''}
              </div>
            `).join('')}
          </div>
        ` : '<p class="empty-state">Sin acuerdos registrados</p>'}
      </section>

      <!-- CONTACTO DEL CLIENTE -->
      ${cliente ? `
        <section class="detail-section">
          <h3>📞 Contacto del Cliente</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Teléfono</label>
              <a href="tel:${cliente.telefono}">${cliente.telefono}</a>
            </div>
            ${cliente.email ? `
              <div class="detail-item">
                <label>Email</label>
                <a href="mailto:${cliente.email}">${cliente.email}</a>
              </div>
            ` : ''}
            <div class="detail-item full">
              <label>Dirección</label>
              <strong>${cliente.direccion}</strong>
            </div>
          </div>
        </section>
      ` : ''}

    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
      <button class="btn btn-primary" onclick="editarCaso('${casoId}')">Editar</button>
    </div>
  `;

  showModal(html);
}

function editarCaso(casoId) {
  showToast('⚙️ Función de edición en desarrollo');
}

// ============ ESTILOS ESPECÍFICOS PARA EXPEDIENTES ============
// (Agregar a css/main.css)

/*
.casos-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 16px;
}

.caso-card {
  background: var(--card-bg, #fff);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.caso-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.caso-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
}

.caso-exp {
  font-weight: 600;
  color: #2C5F8A;
  font-size: 14px;
}

.caso-body {
  padding: 16px;
}

.caso-tipo {
  margin-bottom: 8px;
}

.tipo-badge {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.caso-cliente {
  margin-bottom: 8px;
  font-size: 15px;
  color: #222;
}

.caso-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.caso-meta {
  font-size: 12px;
  color: #999;
  margin-bottom: 12px;
}

.caso-proxima {
  background: #f9f9f9;
  padding: 10px;
  border-radius: 6px;
  font-size: 13px;
  border-left: 3px solid #2C5F8A;
}

.proxima-label {
  font-weight: 600;
  color: #666;
  margin-bottom: 4px;
}

.proxima-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dias-falta {
  font-weight: 600;
  color: #2C5F8A;
}

.dias-falta.urgente {
  color: #E24B4A;
}

.sin-audiencia {
  color: #999;
  font-style: italic;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 15px;
  color: #222;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  font-weight: 500;
}

.detail-item strong {
  font-size: 14px;
  color: #222;
}

.audiencias-list,
.escritos-list,
.acuerdos-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audiencia-item {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 6px;
  border-left: 3px solid #2C5F8A;
}

.audiencia-item.completada {
  opacity: 0.6;
  border-left-color: #1D9E75;
}

.aud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.aud-titulo {
  font-weight: 600;
  color: #222;
  flex: 1;
}

.aud-dias {
  background: #FFC107;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.aud-dias.urgente {
  background: #E24B4A;
}

.aud-check {
  color: #1D9E75;
  font-size: 16px;
}

.aud-meta {
  font-size: 12px;
  color: #666;
}

.aud-notas {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ddd;
  font-size: 12px;
  color: #555;
  font-style: italic;
}

.escrito-item,
.acuerdo-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  border-left: 3px solid #1976d2;
}

.escrito-tipo,
.acuerdo-tipo {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.escrito-titulo {
  font-weight: 600;
  color: #222;
  margin: 4px 0;
}

.escrito-fecha,
.acuerdo-fecha {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.escrito-obs,
.acuerdo-contenido {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
  line-height: 1.4;
}

.escrito-link,
.acuerdo-link {
  display: inline-block;
  margin-top: 8px;
  color: #1976d2;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 20px 10px;
  font-style: italic;
}
*/
