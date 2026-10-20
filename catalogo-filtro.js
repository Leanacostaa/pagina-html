/**
 * catalogo-filtro.js — Buscador y Filtro de Catálogo en Tiempo Real
 * ------------------------------------------------------------------
 * Opción 3 del Reto Startup Relámpago, aplicada originalmente por
 * Santiago Romero Baylac sobre listado_box.html. Se integra acá junto
 * al resto de las funciones del equipo (Opción 7 de Leandro Acosta en
 * producto.html y Opción 12 de Tomás Romero Baylac en inventario.html)
 * para que el proyecto final quede unificado en una sola base de código.
 *
 * Requisitos transversales que cumple:
 *  1) Desacoplamiento: todos los listeners se agregan acá con
 *     addEventListener(). No hay input/onchange en el HTML.
 *  2) Asincronía real: el catálogo se consulta con fetch()+async/await
 *     contra productos.json, simulando la respuesta de un servidor, y
 *     se filtra en memoria con Array.filter().
 *
 * Fundamentación U1 — SOHDM: modela el escenario de exploración y
 * búsqueda del usuario (Scenario-based Object-Oriented Hypermedia
 * Design Method): el recorrido natural de un cliente que entra al
 * catálogo, escribe lo que busca y ve el resultado filtrarse al
 * instante, sin recargar la página.
 */
(function () {
  "use strict";

  let catalogoCompleto = [];

  /** Trae el catálogo completo de forma asíncrona (simula un servidor). */
  async function cargarCatalogo() {
    try {
      const respuesta = await fetch("productos.json");
      if (!respuesta.ok) {
        throw new Error("El servidor respondió con estado " + respuesta.status);
      }
      catalogoCompleto = await respuesta.json();
    } catch (error) {
      console.error("No se pudo cargar productos.json para el buscador:", error);
      catalogoCompleto = [];
    }
  }

  /** Aplica, sobre las tarjetas/filas ya presentes en el HTML, el filtro
   *  combinado de categoría/oferta (vía URL) y de búsqueda por texto
   *  (vía catalogoCompleto.filter()). */
  function aplicarFiltros(items, buscador, catSlug, onlyOffers, vacioTexto) {
    const termino = (buscador && buscador.value ? buscador.value : "").toLowerCase().trim();

    const idsQueMatchean = termino
      ? catalogoCompleto
          .filter(
            (p) =>
              p.name.toLowerCase().includes(termino) ||
              p.category.toLowerCase().includes(termino)
          )
          .map((p) => p.id)
      : null;

    let visibles = 0;
    items.forEach((item) => {
      const matchesCat = !catSlug || item.dataset.cat === catSlug;
      const matchesOffer = !onlyOffers || item.dataset.discount === "true";
      const matchesSearch = !idsQueMatchean || idsQueMatchean.includes(item.dataset.id);
      const visible = matchesCat && matchesOffer && matchesSearch;
      item.style.display = visible ? "" : "none";
      if (visible) visibles++;
    });

    const caption = document.querySelector("#catalog-caption");
    if (caption) {
      caption.textContent =
        `${visibles} producto${visibles === 1 ? "" : "s"} encontrado${visibles === 1 ? "" : "s"} · actualizado hoy`;
    }

    let mensaje = document.querySelector("#sin-resultados");
    if (visibles === 0) {
      if (!mensaje) {
        mensaje = document.createElement("p");
        mensaje.id = "sin-resultados";
        mensaje.style.padding = "24px 4px";
        mensaje.style.color = "var(--ink-soft)";
        items[0] && items[0].parentElement.insertAdjacentElement("afterend", mensaje);
      }
      mensaje.textContent = vacioTexto;
      mensaje.style.display = "";
    } else if (mensaje) {
      mensaje.style.display = "none";
    }
  }

  function inicializar() {
    const contenedor = document.querySelector(".box-grid") || document.querySelector("table.products tbody");
    if (!contenedor) return; // esta página no tiene catálogo para filtrar

    const items = Array.from(contenedor.children).filter(
      (el) => el.classList.contains("product-card") || el.tagName === "TR"
    );
    const buscador = document.querySelector("#buscador-catalogo");
    const params = new URLSearchParams(window.location.search);
    const catSlug = params.get("cat");
    const onlyOffers = params.get("filter") === "ofertas";
    const vacioTexto = "No se encontraron productos que coincidan con la búsqueda.";

    // Filtro inmediato por categoría/oferta (no depende de la red).
    aplicarFiltros(items, buscador, catSlug, onlyOffers, vacioTexto);

    if (buscador) {
      cargarCatalogo().then(() => aplicarFiltros(items, buscador, catSlug, onlyOffers, vacioTexto));
      buscador.addEventListener("input", () => aplicarFiltros(items, buscador, catSlug, onlyOffers, vacioTexto));
    }
  }

  document.addEventListener("DOMContentLoaded", inicializar);
})();
