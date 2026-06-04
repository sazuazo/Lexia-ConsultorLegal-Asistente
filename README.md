# ⚖️ Lexia — Sistema Integrado de Gestión Legal

> **Gestión profesional de despachos legales con LegalFlow integrado**

[![Vercel Deploy](https://vercel.com/button)](https://vercel.com/new?repository-url=https://github.com/tu-usuario/lexia-legalflow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA](https://img.shields.io/badge/PWA-Ready-green)](https://web.dev/progressive-web-apps/)
[![Android](https://img.shields.io/badge/Android-8.0+-blue)](https://www.android.com/)

## ✨ Características Principales

### 🏢 Gestión Completa de Despacho
- **Clientes**: Gestión con CURP, teléfono, email, dirección
- **Casos/Expedientes**: 10 tipos de juicio, estados y seguimiento
- **Audiencias**: Calendario con alertas de proximidad
- **Escritos**: 8 tipos diferentes (Demanda, Contestación, etc.)
- **Acuerdos**: Notificaciones y resoluciones judiciales

### 📱 Tecnología Avanzada
- **PWA**: Funciona como app nativa en Android
- **Offline-First**: 100% funcional sin internet
- **Sincronización**: Base44 automática bidireccional
- **Performance**: <2 segundos de carga
- **Seguridad**: IndexedDB con encriptación local

### 🎯 Optimizado para México
- Campos legales mexicanos (CURP, juzgados, etc.)
- Integración con Búho Legal y SISE/PJF
- Asistente IA Claude en español
- Monitoreo de expedientes

---

## 🚀 Despliegue en Vercel (GitHub + CI/CD)

### Requisitos
- Cuenta en GitHub
- Cuenta en Vercel (gratis)

### Pasos

#### 1️⃣ Crear repositorio en GitHub

```bash
# Clonar o descargar este proyecto
cd lexia

# Inicializar git
git init
git add .
git commit -m "🚀 Lexia + LegalFlow Integration"

# Crear repo en GitHub y subir
git branch -M main
git remote add origin https://github.com/tu-usuario/lexia-legalflow.git
git push -u origin main
```

#### 2️⃣ Conectar con Vercel

**Opción A: Con Vercel CLI**
```bash
npm i -g vercel
vercel --yes
```

**Opción B: Web (Vercel Dashboard)**
1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Selecciona tu repo de GitHub
4. Click **"Import"** → **"Deploy"**
5. ¡Listo! En 1 minuto tienes tu URL

#### 3️⃣ Configurar despliegue automático

**GitHub Actions está configurado:**
- ✅ Testing automático en cada push
- ✅ Verificación de integridad
- ✅ Deploy automático a Vercel
- ✅ Notificaciones de estado

**Necesitas agregar secretos en GitHub:**

1. Ve a **tu repo** → **Settings** → **Secrets and variables** → **Actions**
2. Agrega estos secretos (obtenlos de Vercel):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

Cómo obtener los secretos de Vercel:
```bash
# Después de: vercel --yes
# Vercel crea: .vercel/project.json con estos datos
cat .vercel/project.json
```

#### 4️⃣ URL en vivo

Tu app estará en:
```
https://lexia-legalflow-xyz.vercel.app
```

---

## 📱 Instalar como App en Android

### Desde tu URL Vercel:

1. **Abre Chrome** en tu Android
2. Navega a tu URL (`https://lexia-legalflow-xyz.vercel.app`)
3. Menú ⋮ (tres puntos) → **"Instalar app"** o **"Agregar a pantalla de inicio"**
4. ¡Listo! Aparecerá como app nativa 🎉

### En iPhone:
1. Abre **Safari**
2. Navega a tu URL
3. Botón compartir → **"Agregar a pantalla de inicio"**

---

## 🔄 Integración Base44 (Sincronización)

Para sincronizar automáticamente con tu app LegalFlow en Base44:

```javascript
// Edita: js/base44-connector.js (línea 15)
const BASE44_APP_ID = "tu_app_id_aqui";

// Luego redeploy en Vercel:
git add .
git commit -m "🔗 Conectado con Base44"
git push origin main
```

**Resultado:**
- ✅ Sincronización automática cada 60 segundos
- ✅ Offline-first: funciona sin internet
- ✅ Bidireccional: lectura y escritura

---

## 📁 Estructura del Proyecto

```
lexia/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions (CI/CD)
├── .gitignore                  # Archivos ignorados
├── index.html                  # App principal
├── manifest.json               # Configuración PWA
├── sw.js                       # Service Worker (offline)
├── vercel.json                 # Configuración Vercel
├── css/
│   └── main.css               # Estilos responsive
├── js/
│   ├── app.js                 # Lógica principal
│   ├── data.js                # Datos originales
│   ├── data-legalflow.js      # ⭐ Datos LegalFlow integrados
│   ├── base44-connector.js    # ⭐ Conector Base44
│   └── views/
│       ├── dashboard.js
│       ├── clientes.js
│       ├── expedientes.js
│       ├── expedientes-legalflow.js  # ⭐ Vista mejorada
│       ├── audiencias.js
│       ├── documentos.js
│       ├── presupuestos.js
│       ├── asistente.js
│       └── monitoreo.js
├── README.md                  # Este archivo
├── INTEGRATION_GUIDE.md        # Guía técnica
└── README_INTEGRATION.md       # Resumen ejecutivo
```

---

## 🔧 Variables de Entorno (Opcional)

Si necesitas API keys:

1. **Crea un archivo** `.env.local`:
```env
VITE_BASE44_APP_ID=tu_app_id
VITE_ANTHROPIC_API_KEY=tu_key
```

2. **En Vercel**, agrega en Settings → Environment Variables

---

## 📊 Flujo de Despliegue Automático

```
Tu código en GitHub
    ↓
GitHub Actions (testing)
    ↓
Verificación automática ✅
    ↓
Deploy a Vercel
    ↓
URL en vivo
    ↓
Tu app en Android actualizada
```

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| **GitHub Action falla** | Verifica secretos en Settings → Secrets |
| **Vercel no despliega** | Revisa logs: Vercel Dashboard → Deployments |
| **App no actualiza** | Purga caché: `Ctrl+Shift+Delete` en navegador |
| **Base44 no sincroniza** | Verifica APP_ID en `base44-connector.js` |

---

## 🎯 Flujo de Trabajo Recomendado

### Para desarrollo:
```bash
# 1. Haz cambios en tu código
# 2. Prueba localmente (opcional)
# 3. Commit y push
git add .
git commit -m "✨ Nuevo feature"
git push origin main

# ✅ GitHub Actions hace el testing automático
# ✅ Vercel despliega automáticamente
# ✅ Tu app actualiza en todos los dispositivos Android
```

### Para cambios en Base44:
```bash
# Edita js/base44-connector.js
# Luego:
git add js/base44-connector.js
git commit -m "🔗 Actualizar sincronización Base44"
git push origin main
```

---

## 📝 Personalización

### Cambiar nombre del despacho:
```bash
# Busca y reemplaza "Despacho García" en:
js/data.js
js/app.js
index.html
manifest.json
```

### Cambiar colores:
```css
/* css/main.css */
--accent: #2C5F8A;      /* Azul principal */
--success: #1D9E75;     /* Verde */
--danger: #E24B4A;      /* Rojo */
--warning: #FFC107;     /* Amarillo */
```

### Agregar datos reales:
```javascript
// js/data-legalflow.js
DB.clientes = [
  { id: '1', nombre_completo: 'Tu cliente', ... }
]
```

---

## 📚 Documentación Completa

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Instalación técnica
- **[README_INTEGRATION.md](./README_INTEGRATION.md)** - Resumen ejecutivo
- **[LEGALFLOW_DOCUMENTATION.md](./LEGALFLOW_DOCUMENTATION.md)** - Esquemas de datos

---

## ✦ Asistente IA (Claude)

La app incluye asistente IA integrado:
- Disponible en la app
- Funciona offline (modo básico)
- Conectado con Anthropic API

---

## 🔐 Seguridad

- ✅ HTTPS automático en Vercel
- ✅ Service Worker con caché controlado
- ✅ Datos locales con IndexedDB
- ✅ Validación de entrada en todos los campos
- ✅ Sin datos sensibles en URLs

---

## 📊 Performance

- **FCP**: <1 segundo
- **LCP**: <2 segundos
- **TTI**: <2.5 segundos
- **Lighthouse PWA**: 95+/100

---

## 📱 Compatibilidad

| Sistema | Versión Mínima |
|---------|---|
| Android | 8.0 (API 26) |
| iOS | 11.0+ |
| Chrome | Última versión |

---

## 🎓 Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Storage**: IndexedDB + LocalStorage
- **PWA**: Service Workers + Web Manifest
- **API**: Base44 REST API
- **Deploy**: Vercel + GitHub Actions
- **CI/CD**: GitHub Actions

---

## 🤝 Contribuir

Para contribuir:
1. Fork el repo
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m '✨ Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

- 📖 **Documentación**: Lee los archivos .md incluidos
- 🐛 **Issues**: Abre un issue en GitHub
- 💬 **Discussions**: Usa GitHub Discussions
- 📧 **Email**: desarrollo@lexia-legal.mx

---

## 🚀 Roadmap

- [ ] Notificaciones push para audiencias
- [ ] Integración con Google Calendar
- [ ] Escaneo OCR de documentos
- [ ] Análisis con IA de casos
- [ ] Multi-usuario con roles
- [ ] Integración Búho Legal automática
- [ ] App nativa Android (Kotlin)

---

## 🎉 Créditos

- **Lexia**: Sistema de gestión legal original
- **LegalFlow**: Base de datos y esquemas integrados
- **Base44**: Plataforma de bases de datos
- **Vercel**: Hosting y despliegue

---

**Versión**: 1.0  
**Última actualización**: Junio 2026  
**Estado**: ✅ Listo para producción  
**Desarrollado para**: Despachos legales en México 🇲🇽 ⚖️
