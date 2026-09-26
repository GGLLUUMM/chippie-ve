# 🛒 Chippie.ve

> Comparador de precios de tiendas venezolanas. Busca un producto y compáralo al instante en múltiples tiendas, sin registro y sin intermediarios.

![Version](https://img.shields.io/badge/version-1.0.0-emerald)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 ¿Qué es Chippie?

**Chippie.ve** es un comparador de precios independiente que consulta simultáneamente los catálogos de las principales tiendas de Venezuela y te muestra los mismos productos ordenados por precio, para que encuentres la mejor oferta sin tener que visitar cada sitio por separado.

### ✨ Características principales

- 🔍 **Búsqueda unificada** — Un solo término, resultados de todas las tiendas.
- 💰 **Comparación de precios** — Los productos se ordenan automáticamente por precio.
- ⚡ **Resultados en segundos** — Consultas paralelas a cada tienda.
- 🔗 **Compra directa** — Cada resultado enlaza a la página oficial del producto.
- 🔒 **Sin registro** — No hay cuentas, ni tracking, ni datos personales.
- 📱 **100% responsive** — Funciona igual de bien en móvil y escritorio.
- 🎨 **Interfaz animada** — Transiciones fluidas con Framer Motion.

---

## 🖼️ Capturas de pantalla

> Añade aquí tus capturas una vez desplegado el proyecto.

| Landing | Resultados |
|---------|------------|
| ![Landing](docs/landing.png) | ![Resultados](docs/results.png) |

| Modal "Cómo funciona" |
|----------------------|-------------|
| ![Modal](docs/modal.png) | 

---

## 🏪 Tiendas soportadas

Actualmente Chippie compara precios en:

| Tienda | Estado | Método |
|--------|--------|--------|
| Farmacias Saas | ✅ Activo | Scraping HTML |
| Locatel | ✅ Activo | Scraping HTML |
| Farma Go | ✅ Activo | Scraping HTML |
| Damasco | ✅ Activo | API pública (VTEX) |
| Gama en Línea | ✅ Activo | Scraping HTML |
| Farmatodo | ✅ Activo | API Algolia + scraping |
| Tiendas Daka | ✅ Activo | API interna + scraping |
| EPA | ⏸️ Suspendido | Mantenimiento |
| Canguro | ⏸️ Suspendido | Bloqueo Cloudflare |
| SoyTecno | ⏸️ Suspendido | Bloqueo Cloudflare |

---

## 🚀 Empezar a desarrollar

### Requisitos previos

- **Node.js 18** o superior
- **npm**, **yarn**, **pnpm** o **bun**
- **PostgreSQL** (para la base de datos con Prisma)

### Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/chippie.git
cd chippie

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de base de datos

# 4. Aplica las migraciones de Prisma
npx prisma migrate dev

# 5. Instala los navegadores de Playwright (para scraping)
npx playwright install chromium