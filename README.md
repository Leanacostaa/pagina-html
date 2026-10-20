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
├── app.js                   Panel de inventario y alerta de estado crítico (Opción 12 — Tomás)
└── README.md                Este archivo
```

## Decisiones de diseño

- **Paleta:** verde pino (`#16281C`) como color de marca/header, mustaza (`#E8A93B`) como acento de precios y CTA, tomate (`#C0472B`) para ofertas/stock bajo, sobre un fondo verde salvia muy claro (`#F1F4EC`).
- **Tipografía:** `Bitter` (serif, tipo cartel de almacén) para títulos, `Mulish` (sans-serif) para texto y componentes de interfaz.
- **Layout:** alineación mayormente a la izquierda, grillas de 4 columnas para categorías y productos, navegación fija (sticky) en la parte superior.
- **Componentes reutilizables:** `.btn`, `.product-card`, `table.products`, `.cat-card`, `.pay-option`, `.cart-list`, `.filter-row` — todos definidos en `styles.css` para mantener consistencia entre páginas.
- **Alcance:** maquetado en HTML/CSS (lo que se evalúa) + una capa de JavaScript del lado del cliente para que el flujo se sienta real: `products.js` centraliza el catálogo como única fuente de datos, `producto.html` lee el producto a mostrar desde la URL (`?id=...`), y los listados filtran de verdad por categoría (`?cat=...`), por ofertas (`?filter=ofertas`) y por texto libre. Los botones "Agregar" suman productos a un carrito guardado en el navegador (`localStorage`), `comprar.html` muestra ese carrito con sus totales, y el formulario valida los campos obligatorios antes de confirmar. No hay backend ni base de datos — todo corre en el navegador.
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
página.

## Cómo verlo

Todas las páginas que usan `fetch()` (`inventario.html`, `producto.html`,
`listado_tabla.html`, `listado_box.html`) necesitan abrirse por `http://`, no por
`file://` (el navegador bloquea tanto `fetch()` como `localStorage` en archivos
locales abiertos con doble clic). Alcanza con levantar un servidor simple en la
carpeta del proyecto:

```
python -m http.server 8000
```

y abrir `http://localhost:8000` en el navegador.
