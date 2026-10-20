/**
 * precio-dinamico.js — Contador de Selección y Subtotal en Tiempo Real
 * ------------------------------------------------------------------------
 * Opción 7 del Reto Startup Relámpago, aplicada originalmente por
 * Leandro Acosta. Se integra acá, sobre producto.html, junto al resto
 * de las funciones del equipo (Opción 3 de Santiago Romero Baylac en
 * el catálogo y Opción 12 de Tomás Romero Baylac en inventario.html)
 * para que el proyecto final quede unificado en una sola base de código.
 *
 * Requisitos transversales que cumple:
 *  1) Desacoplamiento: los listeners de cantidad se agregan acá con
 *     addEventListener(), reutilizando los mismos botones +/- y el
 *     input de cantidad que ya usa cart.js (que a su vez tampoco usa
 *     onclick/onsubmit en el HTML).
 *  2) Asincronía real: el precio "actualizado" del producto se consulta
 *     con fetch()+async/await contra precios.json, simulando una
 *     respuesta de servidor con la lista de precios vigente.
 *
 * Fundamentación U1 — SOHDM: modela el escenario de selección rápida
 * del usuario (Scenario-based Object-Oriented Hypermedia Design
 * Method): entra a la ficha, ajusta la cantidad y ve el subtotal
 * actualizarse al instante, sin recargar la página ni perder contexto.
 */
(function () {
  "use strict";

  async function obtenerPrecioActualizado(id) {
    const respuesta = await fetch("precios.json");
    if (!respuesta.ok) {
      throw new Error("No se pudo consultar la lista de precios");
    }
    const precios = await respuesta.json();
    const entrada = precios.find((p) => p.productoId === id);
    return entrada ? entrada.precioActualizado : null;
  }

  function inicializar() {
    const inputCantidad = document.querySelector("#cantidad");
    const subtotalEl = document.querySelector("#producto-subtotal");
    const precioBigEl = document.querySelector("#price-big");
    const addBtn = document.querySelector("#add-btn");

    // Si la pantalla no tiene ficha de producto (id ausente), no hay nada que hacer.
    if (!inputCantidad || !subtotalEl || !addBtn) return;

    let precioUnitario = parseFloat(addBtn.dataset.price) || 0;

    function actualizarSubtotal() {
      const cantidad = Math.max(1, parseInt(inputCantidad.value, 10) || 1);
      subtotalEl.textContent = window.MercadoCart
        ? window.MercadoCart.formatPrice(cantidad * precioUnitario)
        : "$" + (cantidad * precioUnitario).toLocaleString("es-AR");
    }

    // El usuario escribe la cantidad a mano.
    inputCantidad.addEventListener("input", actualizarSubtotal);

    // Los botones +/- modifican el input desde cart.js (delegación de
    // eventos sobre document); acá escuchamos el mismo clic y recalculamos
    // después de que cart.js ya haya actualizado el valor del input.
    document.querySelectorAll("[data-qty-step]").forEach((boton) => {
      boton.addEventListener("click", () => setTimeout(actualizarSubtotal, 0));
    });

    const id = addBtn.dataset.id;
    if (id) {
      obtenerPrecioActualizado(id)
        .then((nuevoPrecio) => {
          if (nuevoPrecio != null) {
            precioUnitario = nuevoPrecio;
            addBtn.dataset.price = precioUnitario;
            if (precioBigEl && window.MercadoCart) {
              precioBigEl.textContent = window.MercadoCart.formatPrice(precioUnitario);
            }
          }
          actualizarSubtotal();
        })
        .catch((error) => {
          console.error("Error al consultar precios.json:", error);
          actualizarSubtotal();
        });
    } else {
      actualizarSubtotal();
    }
  }

  document.addEventListener("DOMContentLoaded", inicializar);
})();
