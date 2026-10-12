# Banco · Productos Financieros

Aplicación frontend en **Angular 18** para listar, buscar, agregar y editar los productos financieros de un banco, consumiendo una API REST local.

Prueba técnica Frontend Angular (2024) — perfil **SemiSenior**.

| Funcionalidad | Estado |
|---|---|
| F1 · Listado de productos (D1)
| F2 · Búsqueda por texto (D1)
| F3 · Cantidad de registros + select 5/10/20 (D1) 
| F4 · Agregar producto con validaciones (D2 + D3) 
| F5 · Editar producto desde menú contextual (D2 + D3) *(deseable)* 
| Uso de rutas *(deseable)*

---

## Requisitos

- **Node.js** 18.19+, 20.11+ o 22+
- **npm** 9+
- El backend `repo-interview-main` corriendo en `http://localhost:3002`

## Puesta en marcha

### 1. Backend

```bash
# DENTRO DE LA CARPETA DESCOMPRIMIDA DE REPO-INTERVIEW-MAIN
npm install
npm run start:dev   # → http://localhost:3002
```

### 2. Frontend

```bash
npm install
npm start           # → http://localhost:4200
```

En desarrollo, `ng serve` usa [`proxy.conf.json`](proxy.conf.json): las peticiones a `/bp/*` se reenvían a `http://localhost:3002`, por lo que el navegador nunca hace llamadas cross-origin (sin problemas de CORS).

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo con proxy al backend |
| `npm run build` | Build de producción en `dist/` |
| `npm test` | Pruebas unitarias con Jest |
| `npm run test:watch` | Pruebas en modo watch |
| `npm run test:coverage` | Pruebas + reporte de cobertura (`coverage/index.html`) |

## Pruebas y cobertura

Pruebas unitarias con **Jest** (`jest-preset-angular`). El umbral mínimo de **70 %** está configurado en [`jest.config.js`](jest.config.js): si la cobertura baja, `npm run test:coverage` falla.

```
Test Suites: 25 passed · Tests: 163 passed
Statements 100% · Branches 100% · Functions 100% · Lines 100%
```

Se excluyen de la cobertura solo archivos de configuración sin lógica (`main.ts`, `app.config.ts`, `*.routes.ts`, `environments/`) y los builders de datos de prueba (`testing/`). Las rutas igualmente se prueban con navegación real en [`app.routes.spec.ts`](src/app/app.routes.spec.ts).

---

## Arquitectura

```
src/app/
├── core/                         # Singleton, transversal, sin UI
│   ├── interceptors/error/       # Manejo centralizado de errores HTTP → toast
│   ├── models/                   # Product, ApiResponse<T>, Notification
│   └── service/
│       ├── products/             # ProductsService: SOLO llamadas HTTP
│       └── ui/notify/            # NotifyService: estado de toasts (signals)
├── environments/                 # apiUrl por entorno
├── features/
│   └── products/
│       ├── products.routes.ts    # '' · 'new' · ':id/edit' (lazy)
│       ├── state/                # ProductsStore: estado + búsqueda + paginación
│       ├── resolvers/            # productResolver (carga el producto a editar)
│       ├── validators/           # Validadores de negocio + mensajes
│       ├── pages/                # Componentes "smart": orquestan
│       │   ├── product-list-page/
│       │   └── product-form-page/      (crear y editar)
│       ├── components/           # Componentes "dumb": solo input()/output()
│       │   ├── product-search/
│       │   ├── product-table/
│       │   ├── product-logo/
│       │   ├── product-actions-menu/
│       │   ├── product-list-footer/
│       │   └── product-form/
│       └── testing/              # Builders de datos para specs
├── layout/principal/             # Header "BANCO" + <router-outlet>
└── shared/                       # Reutilizable y agnóstico al dominio
    ├── form-field/               # Label + control + mensaje de error
    ├── toast/
    ├── pages/not-found/
    ├── pipes/initials.pipe.ts
    └── utils/                    # date, text, form-errors
```

**Regla de dependencias:** `features → core/shared`, nunca al revés. `core` y `shared` no conocen ninguna feature.

### Principios SOLID aplicados

| Principio | Dónde |
|---|---|
| **S** — Responsabilidad única | `ProductsService` solo HTTP; `ProductsStore` solo estado; `errorInterceptor` solo errores; cada componente de presentación una pieza de UI. |
| **O** — Abierto/cerrado | `<app-form-field>` acepta mensajes personalizados que extienden los genéricos sin modificarlos; nuevos validadores se agregan sin tocar el formulario base. |
| **L** — Sustitución de Liskov | `UniqueProductIdValidator` implementa la interfaz `AsyncValidator` de Angular y es intercambiable por cualquier otra implementación (así se mockea en pruebas). |
| **I** — Segregación de interfaces | `ProductUpdate = Omit<Product, 'id'>`; los componentes exponen solo los inputs/outputs que necesitan. |
| **D** — Inversión de dependencias | Las páginas dependen del store, no de `HttpClient`; todo se inyecta con `inject()` y se reemplaza por fakes en las pruebas. |
