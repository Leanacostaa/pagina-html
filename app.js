/**
 * app.js — Panel de Inventario (Mercado Fresco)
 * ------------------------------------------------------------
 * Módulo nuevo del TP2, sobre el mismo proyecto de supermercado del TP1.
 * Enriquece la pantalla inventario.html con:
 *
 *  1) Desacoplamiento: todos los listeners se agregan acá con
 *     addEventListener(). El HTML no tiene onclick ni onsubmit.
 *  2) Asincronía real: el stock se consulta con fetch()+async/await
 *     contra stock.json, simulando la respuesta de un servidor.
 *  3) Alerta de estado crítico: cada producto cuya cantidad cae por
 *     debajo de su umbral se marca visualmente (clase .stock-critico)
 *     y se cuenta en el resumen de arriba.
 *  4) VSDM (vista Cliente vs. vista Empleado): el mismo panel muestra
 *     distinta información y acciones según el rol elegido en
 *     #selector-rol. Es una simulación en el cliente (no hay login
 *     real), pensada para argumentar el modelo de vistas separadas
 *     por rol de acceso que plantea VSDM — no como mecanismo de
 *     seguridad real.
 */
(function () {
  "use strict";

  const STOCK_URL = "stock.json";

  // Estado del módulo, encapsulado dentro de este IIFE.
  // rolActual arranca en null: se sincroniza al valor real del <select>
  // en inicializar(), para que el estado en JS y lo que se ve en pantalla
  // nunca queden desalineados (si el HTML cambia la opción "selected",
  // el JS la sigue automáticamente en vez de tener un valor hardcodeado).
  let inventario = [];
  let rolActual = null; // "cliente" | "empleado"  → vista VSDM activa

  /* ---------- Acceso a datos (asincrónico) ---------- */

  /**
   * Pide el inventario a "stock.json" con fetch() + async/await.
   * En un backend real esto sería un endpoint (ej. GET /api/stock);
   * acá se simula esa respuesta de servidor con un archivo local.
   */
  async function cargarInventario() {
    mostrarEstado("Consultando stock…");
    try {
      const respuesta = await fetch(STOCK_URL);
      if (!respuesta.ok) {
        throw new Error("El servidor respondió con estado " + respuesta.status);
      }
      const datos = await respuesta.json();
      inventario = datos;
      renderInventario();
      mostrarEstado(
        "Inventario actualizado · " + new Date().toLocaleTimeString("es-AR")
      );
    } catch (error) {
      mostrarEstado(
        "No se pudo cargar el inventario. Revisá la conexión e intentá de nuevo.",
        true
      );
      console.error("Error al cargar stock.json:", error);
    }
  }

  /* ---------- Lógica de negocio ---------- */

  function esCritico(item) {
    return item.cantidad < item.umbral;
  }

  function actualizarCantidad(id, delta) {
    const item = inventario.find((p) => p.id === id);
    if (!item) return;
    item.cantidad = Math.max(0, item.cantidad + delta);
    renderInventario();
  }

  /* ---------- Render (manipulación del DOM) ---------- */

  function renderInventario() {
    const tbody = document.querySelector("#cuerpo-inventario");
    const filtroCategoria = document.querySelector("#filtro-categoria").value;
    const busqueda = document
      .querySelector("#buscador")
      .value.trim()
      .toLowerCase();

    const visibles = inventario.filter((item) => {
      const coincideCategoria =
        filtroCategoria === "todas" || item.categoria === filtroCategoria;
      const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda);
      return coincideCategoria && coincideBusqueda;
    });

    tbody.innerHTML = "";

    visibles.forEach((item) => {
      const critico = esCritico(item);
      const tr = document.createElement("tr");
      tr.className = critico ? "stock-critico" : "";

      tr.innerHTML = `
        <td><strong>${item.nombre}</strong></td>
        <td><span class="tag">${item.categoria}</span></td>
        <td>${item.cantidad} ${item.unidad}</td>
        <td>${item.umbral} ${item.unidad}</td>
        <td>
          ${
            critico
              ? '<span class="alert-badge">⚠ Stock crítico</span>'
              : '<span class="stock-ok">OK</span>'
          }
        </td>
        <td class="col-empleado">
          <div class="qty-box qty-box-sm">
            <button type="button" data-stock-action="restar" data-id="${item.id}" aria-label="Restar">−</button>
            <span>${item.cantidad}</span>
            <button type="button" data-stock-action="sumar" data-id="${item.id}" aria-label="Sumar">+</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (visibles.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; color:var(--ink-soft); padding:24px;">No hay productos que coincidan con el filtro.</td></tr>';
    }

    actualizarResumen();
  }

  function actualizarResumen() {
    const total = inventario.length;
    const criticos = inventario.filter(esCritico).length;

    document.querySelector("#resumen-total").textContent = total;
    document.querySelector("#resumen-criticos").textContent = criticos;

    const banner = document.querySelector("#banner-critico");
    banner.style.display = criticos > 0 ? "flex" : "none";
    if (criticos > 0) {
      document.querySelector("#banner-critico-texto").textContent =
        criticos === 1
          ? "Hay 1 producto por debajo del umbral de stock."
          : `Hay ${criticos} productos por debajo del umbral de stock.`;
    }
  }

  function mostrarEstado(texto, esError) {
    const el = document.querySelector("#estado-carga");
    el.textContent = texto;
    el.classList.toggle("mensaje-error", Boolean(esError));
  }

  /* ---------- VSDM: alternar entre vista Cliente y vista Empleado ---------- */

  function aplicarRol(rol) {
    rolActual = rol;
    document.body.classList.toggle("rol-empleado", rol === "empleado");
    document.querySelector("#rol-explicacion").textContent =
      rol === "empleado"
        ? "Vista Empleado: se muestran las cantidades exactas y los controles para ajustar stock."
        : "Vista Cliente: solo se informa si el producto está disponible, sin cantidades ni controles internos.";
  }

  /* ---------- Cableado de eventos (todo acá, nada en el HTML) ---------- */

  function inicializar() {
    document
      .querySelector("#btn-refrescar")
      .addEventListener("click", cargarInventario);

    document
      .querySelector("#selector-rol")
      .addEventListener("change", (evento) => aplicarRol(evento.target.value));

    document
      .querySelector("#filtro-categoria")
      .addEventListener("change", renderInventario);

    document
      .querySelector("#buscador")
      .addEventListener("input", renderInventario);

    // Delegación de eventos: los botones +/- se generan dinámicamente
    // en cada render, así que el listener se pone una sola vez en el
    // contenedor padre y se identifica el botón clickeado con closest().
    document
      .querySelector("#cuerpo-inventario")
      .addEventListener("click", (evento) => {
        const boton = evento.target.closest("[data-stock-action]");
        if (!boton) return;
        const delta = boton.dataset.stockAction === "sumar" ? 1 : -1;
        actualizarCantidad(boton.dataset.id, delta);
      });

    // El estado inicial del rol se toma del propio <select> (fuente única
    // de verdad), no de una constante repetida en el JS.
    aplicarRol(document.querySelector("#selector-rol").value);
    cargarInventario();
  }

  document.addEventListener("DOMContentLoaded", inicializar);
})();
