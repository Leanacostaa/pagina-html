/* Mercado Fresco — catálogo de productos (fuente única de datos) */
window.MercadoProducts = [
  {
    id: "tomate-perita", name: "Tomate perita", category: "Frutas y verduras", categorySlug: "frutas-verduras",
    price: 1850, oldPrice: 2180, discount: true, unit: "kg", emoji: "🍅",
    stockQty: "42 kg", stockLevel: "ok", origin: "Misiones, Argentina",
    description: "Tomate perita fresco de productores regionales, ideal para salsas y ensaladas. Seleccionado a diario en el local para asegurar el mejor punto de maduración.",
  },
  {
    id: "papa-negra", name: "Papa negra", category: "Frutas y verduras", categorySlug: "frutas-verduras",
    price: 980, unit: "kg", emoji: "🥔",
    stockQty: "120 kg", stockLevel: "ok", origin: "Buenos Aires, Argentina",
    description: "Papa negra de buen tamaño, ideal para hervir, freír o al horno. Se recibe fresca todas las semanas.",
  },
  {
    id: "banana-ecuatoriana", name: "Banana ecuatoriana", category: "Frutas y verduras", categorySlug: "frutas-verduras",
    price: 1320, unit: "kg", emoji: "🍌",
    stockQty: "6 kg", stockLevel: "low", origin: "Ecuador",
    description: "Banana dulce y madura, perfecta para el desayuno o la merienda. Quedan pocas unidades esta semana.",
  },
  {
    id: "leche-entera", name: "Leche entera La Serrana", category: "Lácteos", categorySlug: "lacteos",
    price: 1150, unit: "un.", emoji: "🥛",
    stockQty: "88 un.", stockLevel: "ok", origin: "Santa Fe, Argentina",
    description: "Leche entera pasteurizada en sachet de 1 litro, de una marca regional de confianza.",
  },
  {
    id: "queso-cremoso", name: "Queso cremoso", category: "Lácteos", categorySlug: "lacteos",
    price: 4200, unit: "un.", emoji: "🧀",
    stockQty: "30 un.", stockLevel: "ok", origin: "Córdoba, Argentina",
    description: "Queso cremoso artesanal en bolsa de 500 g, suave y ligeramente salado, ideal para el pan de todos los días.",
  },
  {
    id: "yogur-frutilla", name: "Yogur bebible frutilla", category: "Lácteos", categorySlug: "lacteos",
    price: 1680, unit: "un.", emoji: "🍓",
    stockQty: "4 un.", stockLevel: "low", origin: "Santa Fe, Argentina",
    description: "Yogur bebible sabor frutilla en botella de 1 litro. Quedan pocas unidades disponibles.",
  },
  {
    id: "bife-chorizo", name: "Bife de chorizo", category: "Carnicería", categorySlug: "carniceria",
    price: 9800, unit: "kg", emoji: "🥩",
    stockQty: "25 kg", stockLevel: "ok", origin: "Misiones, Argentina",
    description: "Bife de chorizo de novillo, corte clásico para la parrilla, cortado en el local al momento.",
  },
  {
    id: "milanesa-nalga", name: "Milanesa de nalga", category: "Carnicería", categorySlug: "carniceria",
    price: 8100, unit: "kg", emoji: "🍖",
    stockQty: "18 kg", stockLevel: "ok", origin: "Misiones, Argentina",
    description: "Milanesas de nalga finitas, listas para pasar por pan rallado. Corte magro y tierno.",
  },
  {
    id: "pan-frances", name: "Pan francés", category: "Panadería", categorySlug: "panaderia",
    price: 1400, unit: "kg", emoji: "🥖",
    stockQty: "60 kg", stockLevel: "ok", origin: "Elaboración propia",
    description: "Pan francés horneado varias veces al día, con la corteza bien crocante.",
  },
  {
    id: "facturas-surtidas", name: "Facturas surtidas", category: "Panadería", categorySlug: "panaderia",
    price: 3600, unit: "doc.", emoji: "🥐",
    stockQty: "3 doc.", stockLevel: "low", origin: "Elaboración propia",
    description: "Docena de facturas surtidas: medialunas, vigilantes y cañoncitos recién horneados.",
  },
  {
    id: "detergente", name: "Detergente x 750 ml", category: "Limpieza", categorySlug: "limpieza",
    price: 2150, unit: "un.", emoji: "🧴",
    stockQty: "40 un.", stockLevel: "ok", origin: "Buenos Aires, Argentina",
    description: "Detergente concentrado para vajilla, rinde hasta 300 platos por botella.",
  },
  {
    id: "agua-mineral", name: "Agua mineral sin gas", category: "Bebidas", categorySlug: "bebidas",
    price: 1050, unit: "un.", emoji: "💧",
    stockQty: "75 un.", stockLevel: "ok", origin: "Córdoba, Argentina",
    description: "Agua mineral natural sin gas, botella de 2 litros, ideal para toda la semana.",
  },
  {
    id: "arroz-largo-fino", name: "Arroz largo fino", category: "Almacén", categorySlug: "almacen",
    price: 1200, unit: "kg", emoji: "🍚",
    stockQty: "50 kg", stockLevel: "ok", origin: "Entre Ríos, Argentina",
    description: "Arroz largo fino tipo 000, grano suelto, ideal para guarniciones y ensaladas.",
  },
  {
    id: "aceite-girasol", name: "Aceite de girasol 1.5L", category: "Almacén", categorySlug: "almacen",
    price: 2400, unit: "un.", emoji: "🫒",
    stockQty: "35 un.", stockLevel: "ok", origin: "Santa Fe, Argentina",
    description: "Aceite de girasol puro, botella de litro y medio, apto para todo tipo de cocción.",
  },
  {
    id: "alfajor-maicena", name: "Alfajor de maicena", category: "Kiosco", categorySlug: "kiosco",
    price: 650, unit: "un.", emoji: "🍪",
    stockQty: "60 un.", stockLevel: "ok", origin: "Buenos Aires, Argentina",
    description: "Alfajor de maicena relleno de dulce de leche, cubierto con coco rallado.",
  },
  {
    id: "chocolate-barra", name: "Chocolate en barra", category: "Kiosco", categorySlug: "kiosco",
    price: 1800, unit: "un.", emoji: "🍫",
    stockQty: "45 un.", stockLevel: "ok", origin: "Córdoba, Argentina",
    description: "Chocolate con leche en barra de 150 g, ideal para acompañar el mate o el café.",
  },
];

window.MercadoCategories = [
  { slug: "frutas-verduras", name: "Frutas y verduras", emoji: "🥕" },
  { slug: "lacteos", name: "Lácteos", emoji: "🥛" },
  { slug: "carniceria", name: "Carnicería", emoji: "🥩" },
  { slug: "panaderia", name: "Panadería", emoji: "🍞" },
  { slug: "limpieza", name: "Limpieza", emoji: "🧴" },
  { slug: "almacen", name: "Almacén", emoji: "🥫" },
  { slug: "bebidas", name: "Bebidas", emoji: "🧃" },
  { slug: "kiosco", name: "Kiosco", emoji: "🍬" },
];
