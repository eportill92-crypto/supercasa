export type RecipeSeed = {
  name: string;
  mealType: "desayuno" | "comida" | "cena" | "snack";
  servings: number;
  instructions: string;
  ingredients: { product: string; unit: string; category: string; quantity: number }[];
};

// Recetario base curado a mano (no viene de ninguna API externa). Las recetas que agregues tú
// desde /recetas, o las que ya hayas cocinado, se priorizan sobre estas al recomendar qué
// cocinar con tu inventario actual.
export const RECIPE_SEEDS: RecipeSeed[] = [
  {
    name: "Huevos a la mexicana",
    mealType: "desayuno",
    servings: 4,
    instructions: "Acitrona cebolla y chile, agrega jitomate picado, deja sazonar y añade huevo batido. Cocina revolviendo. Sirve con tortillas.",
    ingredients: [
      { product: "Huevo (cartón 18 pza)", unit: "cartón", category: "Lácteos", quantity: 0.3 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.1 },
      { product: "Chile serrano", unit: "kg", category: "Frutas y verduras", quantity: 0.05 },
      { product: "Tortilla de maíz", unit: "kg", category: "Abarrotes", quantity: 0.3 },
    ],
  },
  {
    name: "Chilaquiles verdes",
    mealType: "desayuno",
    servings: 4,
    instructions: "Fríe totopos, baña en salsa verde caliente, sirve con crema, queso fresco y cebolla.",
    ingredients: [
      { product: "Tortilla de maíz", unit: "kg", category: "Abarrotes", quantity: 0.4 },
      { product: "Salsa verde", unit: "frasco", category: "Abarrotes", quantity: 1 },
      { product: "Crema", unit: "envase", category: "Lácteos", quantity: 0.5 },
      { product: "Queso fresco", unit: "pza", category: "Lácteos", quantity: 0.5 },
    ],
  },
  {
    name: "Hot cakes",
    mealType: "desayuno",
    servings: 4,
    instructions: "Mezcla harina, huevo y leche hasta tener una pasta tersa. Cocina en sartén con poca mantequilla.",
    ingredients: [
      { product: "Harina de trigo", unit: "kg", category: "Abarrotes", quantity: 0.3 },
      { product: "Huevo (cartón 18 pza)", unit: "cartón", category: "Lácteos", quantity: 0.1 },
      { product: "Leche entera 1L", unit: "L", category: "Lácteos", quantity: 0.5 },
      { product: "Mantequilla", unit: "barra", category: "Lácteos", quantity: 0.25 },
    ],
  },
  {
    name: "Licuado de plátano y avena",
    mealType: "desayuno",
    servings: 2,
    instructions: "Licúa plátano, leche y avena hasta que quede tersa.",
    ingredients: [
      { product: "Plátano", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Leche entera 1L", unit: "L", category: "Lácteos", quantity: 0.5 },
      { product: "Avena", unit: "kg", category: "Abarrotes", quantity: 0.1 },
    ],
  },
  {
    name: "Quesadillas de queso",
    mealType: "desayuno",
    servings: 2,
    instructions: "Rellena tortillas con queso y calienta en comal hasta que gratine.",
    ingredients: [
      { product: "Tortilla de maíz", unit: "kg", category: "Abarrotes", quantity: 0.3 },
      { product: "Queso Oaxaca", unit: "pza", category: "Lácteos", quantity: 0.5 },
    ],
  },
  {
    name: "Arroz con pollo",
    mealType: "comida",
    servings: 4,
    instructions: "Dora el pollo, retira. Sofríe el arroz, agrega verduras y caldo, regresa el pollo y cocina tapado hasta que el arroz esté suave.",
    ingredients: [
      { product: "Arroz", unit: "kg", category: "Abarrotes", quantity: 0.4 },
      { product: "Pollo", unit: "kg", category: "Carnes", quantity: 0.6 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.15 },
      { product: "Zanahoria", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Chícharo", unit: "kg", category: "Frutas y verduras", quantity: 0.15 },
    ],
  },
  {
    name: "Sopa de fideo",
    mealType: "comida",
    servings: 4,
    instructions: "Fríe el fideo hasta dorar, agrega caldillo de jitomate licuado con cebolla y ajo, deja hervir hasta que el fideo esté suave.",
    ingredients: [
      { product: "Fideo", unit: "paquete", category: "Abarrotes", quantity: 1 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.1 },
      { product: "Ajo", unit: "kg", category: "Frutas y verduras", quantity: 0.02 },
    ],
  },
  {
    name: "Frijoles de la olla",
    mealType: "comida",
    servings: 6,
    instructions: "Cocina los frijoles con cebolla y ajo hasta que estén suaves. Sazona al final.",
    ingredients: [
      { product: "Frijol", unit: "kg", category: "Abarrotes", quantity: 0.5 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.1 },
      { product: "Ajo", unit: "kg", category: "Frutas y verduras", quantity: 0.02 },
    ],
  },
  {
    name: "Tacos de picadillo",
    mealType: "comida",
    servings: 4,
    instructions: "Sofríe carne molida con papa y zanahoria picadas en cubitos hasta cocer. Sirve en tortillas.",
    ingredients: [
      { product: "Carne molida", unit: "kg", category: "Carnes", quantity: 0.5 },
      { product: "Papa", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Zanahoria", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Tortilla de maíz", unit: "kg", category: "Abarrotes", quantity: 0.4 },
    ],
  },
  {
    name: "Pollo guisado",
    mealType: "comida",
    servings: 4,
    instructions: "Sella el pollo, retira. Sofríe cebolla y jitomate, regresa el pollo y cocina tapado hasta que esté suave.",
    ingredients: [
      { product: "Pollo", unit: "kg", category: "Carnes", quantity: 0.8 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.15 },
    ],
  },
  {
    name: "Enchiladas rojas",
    mealType: "comida",
    servings: 4,
    instructions: "Pasa las tortillas por salsa roja, rellena con pollo deshebrado, enrolla y baña con más salsa. Sirve con crema y queso.",
    ingredients: [
      { product: "Tortilla de maíz", unit: "kg", category: "Abarrotes", quantity: 0.4 },
      { product: "Pollo", unit: "kg", category: "Carnes", quantity: 0.4 },
      { product: "Salsa roja", unit: "frasco", category: "Abarrotes", quantity: 1 },
      { product: "Queso fresco", unit: "pza", category: "Lácteos", quantity: 0.5 },
      { product: "Crema", unit: "envase", category: "Lácteos", quantity: 0.5 },
    ],
  },
  {
    name: "Espagueti a la mexicana",
    mealType: "comida",
    servings: 4,
    instructions: "Cuece el espagueti. Aparte, licúa jitomate con cebolla, sofríe y agrega el espagueti con un poco de crema.",
    ingredients: [
      { product: "Espagueti", unit: "paquete", category: "Abarrotes", quantity: 1 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Crema", unit: "envase", category: "Lácteos", quantity: 0.3 },
    ],
  },
  {
    name: "Ensalada de atún",
    mealType: "comida",
    servings: 2,
    instructions: "Mezcla atún escurrido con jitomate y cebolla picados, sazona con limón y sal.",
    ingredients: [
      { product: "Atún en lata", unit: "lata", category: "Abarrotes", quantity: 2 },
      { product: "Jitomate", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Cebolla", unit: "kg", category: "Frutas y verduras", quantity: 0.05 },
    ],
  },
  {
    name: "Molletes",
    mealType: "cena",
    servings: 2,
    instructions: "Abre el bolillo, unta frijol, cubre con queso y gratina al horno. Sirve con pico de gallo.",
    ingredients: [
      { product: "Bolillo", unit: "pza", category: "Panadería", quantity: 2 },
      { product: "Frijol", unit: "kg", category: "Abarrotes", quantity: 0.15 },
      { product: "Queso Oaxaca", unit: "pza", category: "Lácteos", quantity: 0.3 },
    ],
  },
  {
    name: "Sincronizadas",
    mealType: "cena",
    servings: 2,
    instructions: "Rellena tortillas de harina con jamón y queso, calienta en comal hasta gratinar.",
    ingredients: [
      { product: "Tortilla de harina", unit: "paquete", category: "Abarrotes", quantity: 0.5 },
      { product: "Jamón", unit: "paquete", category: "Carnes frías", quantity: 0.3 },
      { product: "Queso Oaxaca", unit: "pza", category: "Lácteos", quantity: 0.3 },
    ],
  },
  {
    name: "Sopa de verduras",
    mealType: "cena",
    servings: 4,
    instructions: "Cuece todas las verduras picadas en caldo hasta que estén suaves. Sazona al gusto.",
    ingredients: [
      { product: "Zanahoria", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Papa", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
      { product: "Calabaza", unit: "kg", category: "Frutas y verduras", quantity: 0.2 },
    ],
  },
  {
    name: "Torta de jamón",
    mealType: "cena",
    servings: 1,
    instructions: "Rellena el bolillo con jamón, queso y aguacate.",
    ingredients: [
      { product: "Bolillo", unit: "pza", category: "Panadería", quantity: 1 },
      { product: "Jamón", unit: "paquete", category: "Carnes frías", quantity: 0.15 },
      { product: "Queso Oaxaca", unit: "pza", category: "Lácteos", quantity: 0.15 },
      { product: "Aguacate", unit: "kg", category: "Frutas y verduras", quantity: 0.15 },
    ],
  },
  {
    name: "Fruta picada con chile",
    mealType: "snack",
    servings: 2,
    instructions: "Corta la fruta en cubos, agrega limón y chile piquín al gusto.",
    ingredients: [
      { product: "Manzana", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
      { product: "Jícama", unit: "kg", category: "Frutas y verduras", quantity: 0.3 },
    ],
  },
  {
    name: "Palomitas caseras",
    mealType: "snack",
    servings: 4,
    instructions: "Calienta aceite en una olla tapada, agrega el maíz palomero y mueve hasta que reviente todo.",
    ingredients: [
      { product: "Maíz palomero", unit: "paquete", category: "Abarrotes", quantity: 0.5 },
      { product: "Aceite vegetal 1L", unit: "L", category: "Abarrotes", quantity: 0.1 },
    ],
  },
  {
    name: "Yogurt con granola",
    mealType: "snack",
    servings: 1,
    instructions: "Sirve el yogurt en un tazón y agrega granola y miel al gusto.",
    ingredients: [
      { product: "Yogurt natural", unit: "envase", category: "Lácteos", quantity: 0.5 },
      { product: "Granola", unit: "paquete", category: "Abarrotes", quantity: 0.15 },
    ],
  },
];
