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
 *     #selector-rol. La selección de rol es una simulación visual
 *     para argumentar VSDM y no concede permisos en el servidor.
 */
(function () {
  "use strict";

  const STOCK_URL = "stock.json";
  const API_URL = "api/";

  // Estado del módulo, encapsulado dentro de este IIFE.
  // rolActual arranca en null: se sincroniza al valor real del <select>
  // en inicializar(), para que el estado en JS y lo que se ve en pantalla
  // nunca queden desalineados (si el HTML cambia la opción "selected",
  // el JS la sigue automáticamente en vez de tener un valor hardcodeado).
  let inventario = [];
  let rolActual = null; // "cliente" | "empleado"  → vista VSDM activa
  let usuarioActual = null;

  async function enviarJson(endpoint, datos) {
    const respuesta = await fetch(API_URL + endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo completar la operación.");
    }
    return resultado;
  }

  async function verificarSesion() {
    const respuesta = await fetch(API_URL + "perfil.php", {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (respuesta.status === 401) {
      actualizarVistaSesion(null);
      mostrarEstadoAuth("No hay una sesión activa. Iniciá sesión o creá una cuenta.");
      return;
    }
    const resultado = await respuesta.json();
    if (!respuesta.ok) {
      throw new Error(resultado.error || "No se pudo verificar la sesión.");
    }
    actualizarVistaSesion(resultado.usuario);
  }

  function actualizarVistaSesion(usuario) {
    usuarioActual = usuario;
    document.querySelector("#formularios-auth").hidden = Boolean(usuario);
    document.querySelector("#cuenta-activa").hidden = !usuario;
    if (usuario) {
      document.querySelector("#saludo-usuario").textContent =
        `Sesión iniciada como ${usuario.nombre} (${usuario.email}).`;
      mostrarEstadoAuth("Tu sesión está activa.");
    }
  }

  function mostrarEstadoAuth(texto, esError = false) {
    const estado = document.querySelector("#estado-auth");
    estado.textContent = texto;
    estado.classList.toggle("mensaje-error", esError);
    estado.classList.toggle("mensaje-exito", !esError);
  }

  function configurarAutenticacion() {
    document.querySelector("#form-registro").addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const formulario = evento.currentTarget;
      const datos = new FormData(formulario);
      try {
        const respuesta = await enviarJson("registro.php", {
          nombre: datos.get("nombre"),
          email: datos.get("email"),
          password: datos.get("password"),
        });
        formulario.reset();
        mostrarEstadoAuth(respuesta.mensaje);
      } catch (error) {
        mostrarEstadoAuth(error.message, true);
      }
    });

    document.querySelector("#form-login").addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const datos = new FormData(evento.currentTarget);
      try {
        await enviarJson("login.php", {
          email: datos.get("email"),
          password: datos.get("password"),
        });
        evento.currentTarget.reset();
        await verificarSesion();
      } catch (error) {
        mostrarEstadoAuth(error.message, true);
      }
    });

    document.querySelector("#btn-logout").addEventListener("click", async () => {
      try {
        await enviarJson("logout.php", {});
        actualizarVistaSesion(null);
        mostrarEstadoAuth("Sesión cerrada.");
      } catch (error) {
        mostrarEstadoAuth(error.message, true);
      }
    });
  }

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

    tbody.replaceChildren();

    visibles.forEach((item) => {
      const critico = esCritico(item);
      const tr = document.createElement("tr");
      tr.className = critico ? "stock-critico" : "";

      const nombre = document.createElement("strong");
      nombre.textContent = item.nombre;
      tr.appendChild(crearCelda(nombre));

      const categoria = document.createElement("span");
      categoria.className = "tag";
      categoria.textContent = item.categoria;
      tr.appendChild(crearCelda(categoria));
      tr.appendChild(crearCelda(`${item.cantidad} ${item.unidad}`));
      tr.appendChild(crearCelda(`${item.umbral} ${item.unidad}`));

      const estado = document.createElement("span");
      estado.className = critico ? "alert-badge" : "stock-ok";
      estado.textContent = critico ? "⚠ Stock crítico" : "OK";
      tr.appendChild(crearCelda(estado));

      const acciones = document.createElement("td");
      acciones.className = "col-empleado";
      const caja = document.createElement("div");
      caja.className = "qty-box qty-box-sm";
      const restar = crearBotonStock("restar", item.id, "−", "Restar");
      const cantidad = document.createElement("span");
      cantidad.textContent = item.cantidad;
      const sumar = crearBotonStock("sumar", item.id, "+", "Sumar");
      caja.append(restar, cantidad, sumar);
      acciones.appendChild(caja);
      tr.appendChild(acciones);
      tbody.appendChild(tr);
    });

    if (visibles.length === 0) {
      const fila = document.createElement("tr");
      const celda = document.createElement("td");
      celda.colSpan = 6;
      celda.className = "sin-resultados";
      celda.textContent = "No hay productos que coincidan con el filtro.";
      fila.appendChild(celda);
      tbody.appendChild(fila);
    }

    actualizarResumen();
  }

  function crearCelda(contenido) {
    const celda = document.createElement("td");
    if (contenido instanceof Node) {
      celda.appendChild(contenido);
    } else {
      celda.textContent = contenido;
    }
    return celda;
  }

  function crearBotonStock(accion, id, texto, etiqueta) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.dataset.stockAction = accion;
    boton.dataset.id = id;
    boton.setAttribute("aria-label", etiqueta);
    boton.textContent = texto;
    return boton;
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
    configurarAutenticacion();

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
    verificarSesion().catch((error) => {
      mostrarEstadoAuth(error.message, true);
    });
  }

  document.addEventListener("DOMContentLoaded", inicializar);
})();
