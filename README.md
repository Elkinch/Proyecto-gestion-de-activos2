# gestionactivos — Sistema de Gestión de Activos Fijos (ULEAM)

Proyecto Vue 3 generado con Vue CLI (`vue create`). Aquí se migró la app
que antes cargaba Vue por CDN (index.html + js/app.js) a un componente
real `src/App.vue`, para que compile con el framework en vez de un
script suelto.

## Qué se movió

- `src/App.vue` — plantilla (login, dashboard, gestión, reportes, etc.)
  más toda la lógica de `setup()` (estado, computed, métodos).
- `src/store.js`, `src/roles.js`, `src/validations.js`, `src/utils.js`
  — mismos módulos que tenías, sin cambios de lógica.
- `public/css/*.css` — tus hojas de estilo, enlazadas desde
  `public/index.html`.
- `public/index.html` — mantiene `#toastContainer` y `#modalDetalle`
  fuera de `#app` (no usan directivas Vue), y el punto de montaje
  `<div id="app"></div>` donde Vue renderiza todo lo demás.
- Los modales que sí usan `v-model`/`:class`/`@click` (registro y
  confirmación) están dentro de `App.vue`, para que Vue los compile.
- Los gráficos del dashboard ahora usan `chart.js` como dependencia
  real de npm (`import { Chart, registerables } from 'chart.js'`) en
  vez de cargarlo dinámicamente desde un CDN.

## Instalación y ejecución

```bash
npm install
npm run serve
```

Abre la URL que te indique la terminal (por defecto
`http://localhost:8080`).

### Build de producción

```bash
npm run build
```

## Credenciales de prueba

- **Admin:** admin@uleam.edu.ec / Admin123
- **Gestor:** gestor@uleam.edu.ec / Gestor123
- **Usuario:** usuario@uleam.edu.ec / Usuario123
