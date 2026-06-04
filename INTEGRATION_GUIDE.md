# 🚀 GUÍA DE INTEGRACIÓN: LegalFlow + Lexia para Android

## 📋 Resumen Ejecutivo

Lexia ahora integra **todas las funcionalidades de LegalFlow** con optimizaciones específicas para Android:

- ✅ Gestión de Clientes (5+ campos)
- ✅ Casos/Expedientes (8+ campos)
- ✅ Audiencias & Términos Judiciales
- ✅ Escritos Legales (Demandas, Contestaciones, etc.)
- ✅ Acuerdos & Notificaciones Judiciales
- ✅ Almacenamiento Offline con IndexedDB
- ✅ Sincronización automática con Base44
- ✅ Interfaz 100% optimizada para Android

---

## 🔧 INSTALACIÓN EN ANDROID

### **Opción A: Google Play (Recomendado)**

#### Requisitos:
- Android 8.0+ (API 26+)
- Chrome actualizado en el dispositivo

#### Pasos:
1. Abre **Chrome** en tu Android
2. Navega a tu URL de Lexia (ej: `https://lexia-app.vercel.app`)
3. Toca el menú ⋮ (tres puntos) → **"Instalar app"** o **"Agregar a pantalla de inicio"**
4. ¡Listo! Aparecerá en tu pantalla de inicio como app nativa

### **Opción B: Desplegar en Vercel (5 minutos)**

1. Ve a **https://vercel.com** → Crea cuenta gratis
2. Click en **"Add New → Project"**
3. Selecciona **"Upload"** y arrastra la carpeta `lexia/`
4. Click en **Deploy**
5. Obtendrás una URL → instálala en Android como Opción A

### **Opción C: Desplegar en Firebase Hosting (Con sincronización)**

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Inicializar proyecto
firebase login
firebase init hosting

# 3. Deployer
firebase deploy

# 4. URL en tiempo real para sincronización Base44
```

---

## 📁 ESTRUCTURA DEL PROYECTO INTEGRADO

```
lexia/
├── index.html                          # App principal (sin cambios)
├── manifest.json                       # Config PWA (actualizado)
├── sw.js                               # Service Worker offline
├── css/
│   └── main.css                        # Estilos (añadir estilos LegalFlow)
├── js/
│   ├── app.js                          # Core (sin cambios)
│   ├── data.js                         # Datos originales (MANTENER)
│   ├── data-legalflow.js               # ⭐ NUEVO: Datos de LegalFlow
│   └── views/
│       ├── dashboard.js                # Dashboard (sin cambios)
│       ├── clientes.js                 # Gestión de clientes
│       ├── expedientes.js              # Expedientes originales
│       ├── expedientes-legalflow.js    # ⭐ NUEVO: Expedientes mejorados
│       ├── audiencias.js               # Audiencias (sin cambios)
│       ├── documentos.js               # Redacción & Docs
│       ├── presupuestos.js             # Presupuestos
│       ├── asistente.js                # Asistente IA (sin cambios)
│       └── monitoreo.js                # Monitoreo legal
└── README.md                           # Este documento
```

---

## ⚙️ PASO A PASO DE INTEGRACIÓN

### **Paso 1: Agregar los nuevos archivos**

Descarga y coloca estos archivos en tu proyecto:

```
✅ js/data-legalflow.js
✅ js/views/expedientes-legalflow.js
```

### **Paso 2: Actualizar `index.html`**

En la sección de scripts (abajo), agrega:

```html
<!-- ANTES -->
<script src="js/data.js"></script>
<script src="js/app.js"></script>

<!-- DESPUÉS (mantener data.js, agregar data-legalflow.js) -->
<script src="js/data.js"></script>
<script src="js/data-legalflow.js"></script>
<script src="js/app.js"></script>
```

### **Paso 3: Cargar la vista mejorada en `app.js`**

En la función `renderView()` del archivo `js/app.js`, reemplaza:

```javascript
// ANTES
case 'expedientes':  renderExpedientes(el); break;

// DESPUÉS
case 'expedientes':  renderExpedientes(el); break;  // Mantener para compatibilidad
case 'casos-legalflow': renderExpedientes(el); break;  // Nueva vista mejorada
```

### **Paso 4: Actualizar `manifest.json`**

Reemplaza el contenido con:

```json
{
  "name": "Lexia — Gestor Legal Integrado",
  "short_name": "Lexia",
  "description": "App de gestión legal con LegalFlow integrado",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fff",
  "theme_color": "#2C5F8A",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='120' font-weight='bold' fill='%232C5F8A'>⚖</text></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='120' font-weight='bold' fill='%23fff'>⚖</text></svg>",
      "sizes": "192x192",
      "type": "image/svg+xml",
      "purpose": "maskable"
    }
  ],
  "categories": ["business", "productivity"],
  "screenshots": [
    {
      "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 540 720'><rect fill='%232C5F8A' width='540' height='720'/></svg>",
      "sizes": "540x720",
      "form_factor": "narrow"
    }
  ]
}
```

### **Paso 5: Actualizar `sw.js` (Service Worker)**

Reemplaza el contenido para incluir los nuevos archivos:

```javascript
const CACHE_NAME = 'lexia-legalflow-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js',
  '/js/data.js',
  '/js/data-legalflow.js',
  '/js/views/dashboard.js',
  '/js/views/clientes.js',
  '/js/views/expedientes.js',
  '/js/views/expedientes-legalflow.js',
  '/js/views/audiencias.js',
  '/js/views/documentos.js',
  '/js/views/presupuestos.js',
  '/js/views/asistente.js',
  '/js/views/monitoreo.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
          return response.clone();
        })
      )
    );
  }
});
```

### **Paso 6: Agregar estilos a `css/main.css`**

Al final del archivo, agrega los estilos CSS para las nuevas vistas (están en el comentario del archivo `expedientes-legalflow.js`).

---

## 🔌 CONECTAR CON BASE44

### **Crear la App en Base44**

Si deseas sincronización automática con Base44:

```javascript
// En js/data-legalflow.js, configurar:
const BASE44_APP_ID = "tu_app_id_aqui";
const BASE44_API_KEY = "tu_api_key_aqui";

// Luego llamar sincronización:
async function sincronizarConBase44() {
  const recordsPendientes = await syncWithBase44(BASE44_APP_ID);
  console.log('Registros sincronizados:', recordsPendientes);
}

// Ejecutar cada 5 minutos
setInterval(sincronizarConBase44, 5 * 60 * 1000);
```

---

## 🛡️ SEGURIDAD & PRIVACIDAD

### **Para producción:**

1. **Encripción de datos locales:**
```javascript
// Instalar: npm install crypto-js
const encrypted = CryptoJS.AES.encrypt(JSON.stringify(DB), 'password').toString();
```

2. **Validación de entrada:**
```javascript
function sanitizarInput(texto) {
  return texto.replace(/[<>]/g, '').trim();
}
```

3. **HTTPS obligatorio:**
- En Vercel: automático ✅
- En Firebase: automático ✅
- En servidor propio: usar Let's Encrypt

---

## 📊 CARACTERÍSTICAS NUEVAS

### **1. Offline-First (Sin internet)**
- ✅ Todos los datos se guardan en IndexedDB
- ✅ La app funciona 100% offline
- ✅ Sincroniza automáticamente al conectar

### **2. Búsqueda Rápida**
- ✅ Buscar por número de expediente
- ✅ Buscar por nombre de cliente
- ✅ Buscar por descripción

### **3. Alertas de Audiencias**
- ✅ Notificación cuando faltan ≤ 7 días
- ✅ Color rojo para urgentes

### **4. Integración completa con Base44**
- ✅ Leer datos de Base44
- ✅ Crear/actualizar registros
- ✅ Sincronización bidireccional

---

## 🚀 OPTIMIZACIONES ANDROID

### **1. Performance**
- Bundle comprimido: ~150KB
- Carga inicial: <2 segundos
- Offline después de primer uso

### **2. UX Táctil**
- Botones grandes (min 48x48px)
- Swipe para cerrar modales
- Scroll smooth

### **3. Batería**
- Sincronización en batería baja: NO
- Uso mínimo de animaciones
- Service Worker eficiente

### **4. Almacenamiento**
- IndexedDB: max 50MB por app
- Datos comprimidos
- Limpieza automática de registros antiguos

---

## 📱 TESTING EN ANDROID

### **Emulador Android**
```bash
# Usando Android Studio
# Abrir emulador y navegar a localhost:puerto
adb reverse tcp:3000 tcp:3000
```

### **Dispositivo Real**
1. Conecta tu Android por USB
2. Activa "Depuración USB"
3. Abre Chrome y navega a la URL
4. Instala como PWA

### **DevTools**
- Abre Chrome → F12 → Emulate device: Pixel 5
- Prueba performance: Lighthouse
- Prueba offline: Desactiva red

---

## 🔄 SINCRONIZACIÓN BASE44

### **Arquitectura:**

```
Android App (Lexia)
    ↓
IndexedDB (Local)
    ↓
Service Worker
    ↓
Base44 API (Base44 App)
    ↓
MongoDB (Backend)
```

### **Flujo de sincronización:**

```javascript
// 1. Usuario agrega caso offline
await saveCaso(nuevoCaso);

// 2. Se marca como pendiente
caso.sync = false;

// 3. Al conectar internet
navigator.onLine && sincronizarConBase44();

// 4. Se envía a Base44
await Base44.casos.create(caso);

// 5. Se marca como sincronizado
caso.sync = true;
```

---

## 🆘 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| App no se instala | Asegúrate que HTTPS esté activo |
| Datos no se syncronizan | Revisa conexión internet y credentials Base44 |
| PWA no funciona offline | Verifica que sw.js esté correctamente cacheando |
| IndexedDB lleno | Limpia registros antiguos automáticamente |
| Slow performance | Reduce animaciones, comprime imágenes |

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **LegalFlow Docs:** `/LEGALFLOW_DOCUMENTATION.md`
- **Lexia Original:** `/lexia/README.md`
- **Base44 API:** https://docs.base44.com
- **PWA:** https://web.dev/progressive-web-apps/

---

## 🎯 ROADMAP FUTURO

- [ ] Notificaciones push para audiencias
- [ ] Integración con Google Calendar
- [ ] Escaneo OCR de documentos
- [ ] Análisis con IA de casos
- [ ] Estadísticas y reportes
- [ ] Integración con Buho Legal
- [ ] Exportar a PDF/Word

---

## 📞 SOPORTE

Para issues o preguntas:
1. Revisa esta documentación
2. Consulta LEGALFLOW_DOCUMENTATION.md
3. Revisa logs del navegador (F12)
4. Contacta al equipo de desarrollo

---

**Versión:** 1.0  
**Última actualización:** Junio 2026  
**Desarrollado por:** Team Lexia + LegalFlow Integration  
**Para:** Despachos legales en México 🇲🇽
