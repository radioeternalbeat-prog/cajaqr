# 🏎️ CajaQR — Bóveda de Enlaces & Códigos QR (McLaren F1 Edition)

> Aplicación web moderna y ultra-rápida para almacenar, organizar y generar códigos QR con acceso directo instantáneo para enlaces web, WhatsApp y redes Wi-Fi.

Diseñada con la estética de ingeniería de alto rendimiento inspirada en **McLaren F1** (*Papaya Orange*, *Stealth Carbon* y *Velocity Blue*).

---

## 🚀 Características Principales

- **Caja de Enlaces Inteligente**:
  - Detección automática de enlaces y títulos desde la URL.
  - Asistente para **WhatsApp Directo** con código de país, teléfono y mensaje inicial prefijado.
  - Generador de acceso rápido a **Red Wi-Fi** (SSID, contraseña, tipo de encriptación WPA/WEP/abierta).
  - Previsualización en vivo en tiempo real del código QR mientras escribes.

- **Doble Modo de Visualización en la Bóveda**:
  - **Vista Cuadrícula**: Tarjetas detalladas con accesos directos, badges de categorías y visor de visitas.
  - **Vista Lista Compacta**: Visualización de alta densidad para gestionar grandes volúmenes de enlaces rápidamente.
  - Persistencia de la preferencia de vista en `localStorage`.

- **Estudio de Personalización y Descarga de Códigos QR**:
  - Marcos profesionales: *Banner "ESCANEA AQUÍ"*, *Tarjeta con Título*, *Insignia Acceso*, *QR Limpio*.
  - Paleta de color oficial **McLaren F1**: Papaya Orange (`#FF8000`), Velocity Blue (`#00A3E0`), Carbon Stealth (`#14171A`), Fluro Papaya (`#FF5500`), Titanium Gray y selector hexadecimal.
  - Niveles de corrección de error configurables (L, M, Q, H).
  - Exportación en **PNG** en alta resolución (512px, 1024px o 2048px).
  - Exportación vectorial en **SVG** sin pérdida de calidad.
  - Copiado de imagen directo al portapapeles.
  - Impresión individual de tarjeta.

- **Herramientas de Productividad**:
  - **Lector / Escáner QR**: Decodifica códigos QR desde imágenes subidas o cámara web en tiempo real.
  - **Plantillas de Impresión en Hojas**: Genera hojas de 2 o 3 columnas listas para imprimir en papel o etiquetas adhesivas.
  - **Buscador y Filtros en Tiempo Real**: Búsqueda instantánea y segmentación por categorías (*Comercio*, *Redes*, *Documentos*, *Wi-Fi*, *Trabajo*, *Favoritos*).
  - **Portabilidad y Respaldo**: Exporta e importa la bóveda completa en formato JSON sin depender de servidores externos.

---

## 🛠️ Stack Tecnológico

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Motor QR**: [qrcode](https://www.npmjs.com/package/qrcode) (Canvas, DataURL, SVG)
- **Lector QR**: [jsQR](https://www.npmjs.com/package/jsqr) (Decodificación de video y fotos)

---

## 📦 Instalación y Desarrollo Local

### Requisitos previos
- [Node.js](https://nodejs.org/) v18 o superior
- `npm` o `bun` o `pnpm`

### Pasos

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/cajaqr.git
   cd cajaqr
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. Compilar para producción:
   ```bash
   npm run build
   ```
   Los archivos listos para producción se generarán en la carpeta `dist/`.

---

## 🌐 Despliegue en Producción

El proyecto es un Single Page Application (SPA) estático optimizado, compatible con:

- **Vercel**: Importa directamente el repositorio desde GitHub (`Framework Preset: Vite`).
- **Netlify**: Conecta tu repositorio con `Build command: npm run build` y `Publish directory: dist`.
- **GitHub Pages**: Despliega la carpeta `dist` automáticamente con GitHub Actions.
- **Cloud Run / Docker**: Utiliza un contenedor Nginx simple sirviendo la carpeta `dist`.

---

## 📈 Hoja de Ruta para Escalar en el Tiempo

1. **Fase 1 (Actual - SPA Standalone)**:
   - Almacenamiento local ultrarrápido sin costos de base de datos ni servidores.
   - Generación y lectura offline en el cliente.
   - Respaldo portátil en JSON.

2. **Fase 2 (Sincronización en la Nube & Cuentas)**:
   - Autenticación con Google / GitHub (OAuth o Firebase Auth).
   - Base de datos relacional (PostgreSQL / Cloud SQL / Supabase) para sincronizar enlaces entre múltiples dispositivos.

3. **Fase 3 (Códigos QR Dinámicos & Analítica)**:
   - Acortador de URLs integrado (`cajaqr.link/xyz`) para cambiar el enlace de destino sin reimprimir el código QR físico.
   - Métricas avanzadas: dispositivos, países, horarios y tasa de escaneos.

4. **Fase 4 (Módulos Empresariales)**:
   - Generación por lotes desde archivos CSV / Excel.
   - API REST / Webhooks para conectar con catálogos y sistemas de punto de venta (POS).

---

## 📄 Licencia

Este proyecto está bajo la Licencia Apache 2.0.
