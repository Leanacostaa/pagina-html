# Mercado Fresco — Tienda online de supermercado de barrio

Proyecto para la materia **Paradigmas y Lenguajes de Programación III** — Grupo D
(Acosta Leandro, Romero Baylac Santiago, Romero Baylac Tomás).

Entregable unificado: el maquetado original del TP1 (HTML5 + CSS3, sin frameworks)
más las tres funciones de JavaScript del Reto "Startup Relámpago" (AE2), integradas
en una sola base de código, como se pidió en la corrección del TP.

## Requerimiento funcional (RF) resuelto

**RF-01 — Consulta de catálogo y generación de pedido de compra.**
El cliente debe poder consultar el catálogo de productos del supermercado (en formato
tabla o en formato de tarjetas), buscar en tiempo real, acceder a la ficha detallada
de un producto puntual, y completar un formulario para generar un pedido de compra
con sus datos de contacto, dirección de entrega, medio de pago y el listado de
productos elegidos.

### Alcance de la pantalla `comprar.html`
Datos solicitados según consigna:
- Nombre del cliente
- Dirección
- Teléfono
- E-mail
- Medio de pago (efectivo / tarjeta / transferencia)
- Listado de productos del pedido (resumen con cantidades y totales)

## Estructura de archivos

```
mercado-fresco/
├── index.html              Portada principal
├── listado_tabla.html      Catálogo en tabla (filtro por categoría/ofertas + buscador en tiempo real)
├── listado_box.html        Catálogo en tarjetas (filtro por categoría/ofertas + buscador en tiempo real)
├── producto.html           Ficha de producto dinámica (lee ?id= de la URL) + subtotal en tiempo real
├── comprar.html            Formulario de compra (incluye cupón de descuento)
├── inventario.html         Panel interno de inventario, con vistas por rol (Cliente/Empleado)
├── styles.css              Hoja de estilos compartida por todas las páginas
├── products.js             Catálogo de productos — fuente única de datos (16 productos, 8 categorías)
├── productos.json          Mismo catálogo en JSON, consumido por catalogo-filtro.js vía fetch()
├── precios.json            Lista de precios "actualizados", consumida por precio-dinamico.js vía fetch()
├── stock.json              Datos de stock consumidos por app.js vía fetch() (simula un servidor)
├── cart.js                 Lógica del carrito (JS del lado del cliente, sin backend)
├── catalogo-filtro.js       Buscador y filtro de catálogo en tiempo real (Opción 3 — Santiago)
├── precio-dinamico.js       Contador de selección y subtotal en tiempo real (Opción 7 — Leandro)
├── app.js                   Panel de inventario, autenticación y estado de sesión
├── api/                     Endpoints PHP y esquema SQL de usuarios
└── README.md                Este archivo
```

## Decisiones de diseño

- **Paleta:** verde pino (`#16281C`) como color de marca/header, mustaza (`#E8A93B`) como acento de precios y CTA, tomate (`#C0472B`) para ofertas/stock bajo, sobre un fondo verde salvia muy claro (`#F1F4EC`).
- **Tipografía:** `Bitter` (serif, tipo cartel de almacén) para títulos, `Mulish` (sans-serif) para texto y componentes de interfaz.
- **Layout:** alineación mayormente a la izquierda, grillas de 4 columnas para categorías y productos, navegación fija (sticky) en la parte superior.
- **Componentes reutilizables:** `.btn`, `.product-card`, `table.products`, `.cat-card`, `.pay-option`, `.cart-list`, `.filter-row` — todos definidos en `styles.css` para mantener consistencia entre páginas.
- **Alcance:** catálogo y carrito siguen del lado del cliente. El panel de inventario incorpora una API PHP/MySQL para registro e inicio de sesión; las contraseñas se guardan con BCRYPT y `api/perfil.php` requiere una sesión válida. El selector Cliente/Empleado es una demostración visual y no concede permisos en el servidor.
- **Selectores:** todo el JavaScript usa `document.querySelector()`/`querySelectorAll()` en vez de `getElementById()`, para un desacoplamiento total entre la lógica y la estructura del HTML (corrección aplicada tras la devolución del profesor).

## Reto "Startup Relámpago" (AE2) — las tres funciones integradas

Cada integrante del grupo resolvió individualmente una tarjeta distinta sobre este
mismo proyecto. Tras la corrección del profesor, las tres quedaron unificadas en
esta única base de código, cada una en su propio archivo `.js`, todas cumpliendo
los dos requisitos transversales: eventos desacoplados con `addEventListener()`
(sin `onclick`/`onsubmit` en el HTML) y carga asíncrona de datos con `fetch()` +
`async/await` contra un `.json` local que simula la respuesta de un servidor.

### Opción 3 — Buscador y Filtro de Catálogo en Tiempo Real (Santiago Romero Baylac)
`catalogo-filtro.js`, usado en `listado_tabla.html` y `listado_box.html`.
Carga el catálogo completo de forma asíncrona (`fetch('productos.json')`), y al
escribir en el buscador filtra en memoria con `Array.filter()`, combinando el
resultado con el filtro de categoría/ofertas que ya traía la URL.
**Fundamentación U1 — SOHDM:** modela el escenario de exploración y búsqueda del
usuario dentro del catálogo.

### Opción 7 — Contador de Selección y Subtotal en Tiempo Real (Leandro Acosta)
`precio-dinamico.js`, usado en `producto.html`.
Escucha los cambios de cantidad (input y botones +/-) y recalcula el subtotal al
instante; el precio unitario se consulta de forma asíncrona con
`fetch('precios.json')`, simulando una lista de precios vigente del servidor.
**Fundamentación U1 — SOHDM:** modela el escenario de selección rápida del usuario
en la ficha de producto.

### Opción 12 — Monitor de Inventario y Alerta de Estado Crítico (Tomás Romero Baylac)
`app.js`, usado en `inventario.html` (panel interno, no es parte del sitio de cara
al cliente). El stock se consulta con `fetch('stock.json')` + `async/await`, y cada
producto por debajo de su umbral se marca como crítico. Incluye además un selector
de rol (Cliente/Empleado) que alterna la vista mostrada sobre el mismo panel.
**Fundamentación U1 — VSDM:** vistas separadas por rol de acceso — es una
simulación del lado del cliente (sin login real), documentada dentro de la propia
página. La autenticación de cuentas se implementa por separado mediante `api/`.

### API de autenticación

Se requiere PHP 8+, las extensiones `pdo` y `pdo_mysql`, y un servidor MySQL.
Importá `api/schema.sql` desde phpMyAdmin y configurá `DB_HOST`, `DB_PORT`,
`DB_NAME`, `DB_USER` y `DB_PASSWORD` en el entorno de PHP. Los endpoints JSON son
`POST api/registro.php`, `POST api/login.php`, `GET api/perfil.php` y
`POST api/logout.php`. El perfil responde `401 Unauthorized` si no hay sesión.

## Cómo verlo

Todas las páginas que usan `fetch()` (`inventario.html`, `producto.html`,
`listado_tabla.html`, `listado_box.html`) necesitan abrirse por `http://`, no por
`file://` (el navegador bloquea tanto `fetch()` como `localStorage` en archivos
locales abiertos con doble clic). Para ejecutar los endpoints PHP, usá el servidor
integrado de PHP desde la carpeta del proyecto, con `pdo_mysql` habilitado y las
variables de entorno de la base configuradas:

```
php -S 127.0.0.1:8000
```

Abrí `http://localhost:8000` en el navegador. `python -m http.server` solo sirve
archivos estáticos y no ejecuta los endpoints PHP.
