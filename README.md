# Banco · Productos Financieros

Aplicación frontend en **Angular 18** para listar, buscar, agregar y editar los productos financieros de un banco, consumiendo una API REST local.

Prueba técnica Frontend Angular (2024) — perfil **SemiSenior**.

| Funcionalidad | Estado |
|---|---|
| F1 · Listado de productos (D1) | ✅ |
| F2 · Búsqueda por texto (D1) | ✅ |
| F3 · Cantidad de registros + select 5/10/20 (D1) | ✅ |
| F4 · Agregar producto con validaciones (D2 + D3) | ✅ |
| F5 · Editar producto desde menú contextual (D2 + D3) *(deseable)* | ✅ |
| Uso de rutas *(deseable)* | ✅ |
| F6 · Eliminar producto | ➖ Fuera del alcance SemiSenior |

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

### Flujo de datos

```
ProductsService (HTTP)  →  ProductsStore (signals)  →  Página (smart)  →  Componentes (dumb)
                                   ↑                         │
                                   └──── acciones ───────────┘   (output → página → store)
```

- El **store** es la única fuente de verdad: `products`, `loading`, `error`, `searchTerm`, `pageSize` son signals privados expuestos como `readonly`; `filtered`, `visible` y `total` son `computed`.
- Las **páginas** leen el store y traducen eventos de UI en acciones (`setSearchTerm`, `create`, `update`, navegación).
- Los **componentes de presentación** no inyectan servicios ni conocen rutas: reciben datos por `input()` y avisan por `output()`.

### Principios SOLID aplicados

| Principio | Dónde |
|---|---|
| **S** — Responsabilidad única | `ProductsService` solo HTTP; `ProductsStore` solo estado; `errorInterceptor` solo errores; cada componente de presentación una pieza de UI. |
| **O** — Abierto/cerrado | `<app-form-field>` acepta mensajes personalizados que extienden los genéricos sin modificarlos; nuevos validadores se agregan sin tocar el formulario base. |
| **L** — Sustitución de Liskov | `UniqueProductIdValidator` implementa la interfaz `AsyncValidator` de Angular y es intercambiable por cualquier otra implementación (así se mockea en pruebas). |
| **I** — Segregación de interfaces | `ProductUpdate = Omit<Product, 'id'>`; los componentes exponen solo los inputs/outputs que necesitan. |
| **D** — Inversión de dependencias | Las páginas dependen del store, no de `HttpClient`; todo se inyecta con `inject()` y se reemplaza por fakes en las pruebas. |

---

## Decisiones técnicas

### Angular moderno
- **Standalone components**, **signals** (`signal`, `computed`, `input()`, `output()`), nuevo control flow (`@if`, `@for … track`, `@empty`) y `inject()`.
- **`ChangeDetectionStrategy.OnPush`** en todos los componentes.
- **Lazy loading** por ruta (cada página es un chunk independiente) con **precarga en segundo plano** (`PreloadAllModules`): el formulario ya está descargado cuando el usuario pulsa *Agregar* o *Editar*.
- **`withComponentInputBinding()`**: el producto resuelto llega a la página como `input()`, sin `ActivatedRoute` ni suscripciones.

### Búsqueda y paginación (F2, F3)
- La API no ofrece búsqueda, así que se filtra en cliente con `computed`, **sin distinguir mayúsculas ni tildes** (`"credito"` encuentra `"Crédito"`).
- El input aplica **debounce de 300 ms** + `distinctUntilChanged` (`outputFromObservable`).
- **"N Resultados"** muestra el total que coincide con la búsqueda; el select limita las filas visibles.

### Formulario (F4, F5)
- **Reactive Forms tipados** con `NonNullableFormBuilder`: `getRawValue()` ya es un `Product` y *Reiniciar* vuelve a `''`, no a `null`.
- Un **único componente** de formulario para crear y editar (F5 exige "las mismas validaciones de F4").
- **Fecha de revisión derivada**: se calcula automáticamente como liberación + 1 año y es de solo lectura. Se usa `readonly` (no `disabled`) para que su validador siga ejecutándose y su valor viaje en el formulario.
- **ID único**: `AsyncValidator` con `timer(400)` que actúa como debounce (Angular cancela la validación anterior en cada tecla). No se ejecuta mientras fallen las reglas síncronas, y en edición se elimina porque el ID ya existe.
- **Errores visibles por campo** (borde rojo + mensaje, como en D2) solo después de que el usuario interactúa con el control. `control.events` (Angular 18) se convierte a signal para funcionar con OnPush.
- **Textos sin espacios fantasma**: un campo con solo espacios cuenta como vacío, las longitudes se miden sin los espacios de los extremos y se envía el valor recortado ([`text.validators.ts`](src/app/shared/validators/text.validators.ts)).
- *Enviar* se deshabilita mientras el formulario es inválido o se está guardando (evita doble envío).

| Campo | Validaciones |
|---|---|
| ID | Requerido · 3–10 caracteres · no existente (`/verification/:id`) · deshabilitado en edición |
| Nombre | Requerido · 5–100 caracteres |
| Descripción | Requerido · 10–200 caracteres |
| Logo | Requerido |
| Fecha de liberación | Requerido · igual o mayor a la fecha actual |
| Fecha de revisión | Requerido · exactamente un año después de la liberación |

### Fechas sin desfase de zona horaria
`new Date('2025-01-01')` se interpreta en UTC y en Ecuador (UTC-5) se muestra como el día anterior. Por eso las fechas viajan siempre como strings ISO `YYYY-MM-DD` y se construyen en hora local ([`date.utils.ts`](src/app/shared/utils/date.utils.ts)). Además, las fechas ISO se comparan correctamente como texto.

### Edición (F5)
- **Menú contextual** con `position: fixed` para que el `overflow-x` de la tabla no lo recorte; se cierra con clic fuera, `Escape`, scroll o resize. Incluye roles ARIA (`menu`, `menuitem`, `aria-expanded`).
- **`productResolver`**: la API no tiene `GET /products/:id`, así que el producto se toma de la lista cacheada en el store (o se carga si se entra directo por URL). Si no existe, se notifica y se redirige al listado con `RedirectCommand`.
- El `PUT` se envía sin `id` en el body, tal como define el contrato.

### Manejo de errores
- **`errorInterceptor`** traduce cualquier error HTTP a un mensaje en español y lo muestra como toast (servidor caído, 400, 404, 5xx). Luego re-lanza el error para que cada pantalla actualice su estado.
- **`SKIP_ERROR_NOTIFY`** (`HttpContextToken`) permite que una petición maneje su propio error; lo usa la verificación de ID para no mostrar toasts mientras se escribe.
- Estados visuales en el listado: cargando, error con **Reintentar** y vacío (con mensaje distinto si hay búsqueda activa).
- Logos que no cargan → avatar con iniciales.

### Estilos
- **CSS propio**, sin frameworks de estilos ni librerías de componentes, como exige la prueba.
- **Design tokens** (colores, espaciado, tipografía, radios) como variables CSS en [`styles.css`](src/styles.css); los componentes solo consumen variables.
- **Responsive**: el toolbar y el formulario se apilan en móvil y la tabla tiene scroll horizontal (como en D1).
- Accesibilidad básica: `label` asociado a cada control, `:focus-visible`, `aria-live` en resultados y errores, `role="alert"` para errores y `prefers-reduced-motion`.

---

## Posibles mejoras

- **F6 · Eliminar** con modal de confirmación (D4), reutilizando el menú contextual existente.
- **Skeletons** en lugar del spinner durante la primera carga.
- Paginación completa (páginas siguientes) además del límite de registros.
- Pruebas end-to-end (Playwright / Cypress) contra el backend real.
