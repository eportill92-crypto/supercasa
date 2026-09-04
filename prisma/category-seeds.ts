// Categorías default del sistema (userId null, visibles para todos). Los usuarios pueden crear
// las suyas propias además de estas (ej. "Cenas light") desde Pedir el súper / Recetario.

export const DEFAULT_PRODUCT_CATEGORIES = [
  { name: "Lácteos", emoji: "🥛", sortOrder: 0 },
  { name: "Frutas y verduras", emoji: "🍎", sortOrder: 1 },
  { name: "Carnes y pescados", emoji: "🍗", sortOrder: 2 },
  { name: "Panadería", emoji: "🥖", sortOrder: 3 },
  { name: "Abarrotes y despensa", emoji: "🥫", sortOrder: 4 },
  { name: "Congelados", emoji: "🧊", sortOrder: 5 },
  { name: "Bebidas", emoji: "🥤", sortOrder: 6 },
  { name: "Limpieza del hogar", emoji: "🧽", sortOrder: 7 },
  { name: "Higiene personal", emoji: "🧴", sortOrder: 8 },
  { name: "Mascotas", emoji: "🐾", sortOrder: 9 },
  { name: "Bebé y niños", emoji: "👶", sortOrder: 10 },
];

// Alias de texto libre (lo que la gente ya haya escrito a mano en Product.category) hacia el
// nombre normalizado de arriba, para el backfill único al migrar.
export const PRODUCT_CATEGORY_ALIASES: Record<string, string> = {
  "lacteos": "Lácteos",
  "lácteos": "Lácteos",
  "frutas": "Frutas y verduras",
  "verduras": "Frutas y verduras",
  "frutas y verduras": "Frutas y verduras",
  "carnes": "Carnes y pescados",
  "carnes frias": "Carnes y pescados",
  "carnes frías": "Carnes y pescados",
  "pescados": "Carnes y pescados",
  "panaderia": "Panadería",
  "panadería": "Panadería",
  "pan": "Panadería",
  "abarrotes": "Abarrotes y despensa",
  "despensa": "Abarrotes y despensa",
  "congelados": "Congelados",
  "bebidas": "Bebidas",
  "limpieza": "Limpieza del hogar",
  "limpieza del hogar": "Limpieza del hogar",
  "higiene": "Higiene personal",
  "higiene personal": "Higiene personal",
  "mascotas": "Mascotas",
  "bebe": "Bebé y niños",
  "bebé": "Bebé y niños",
  "bebe y niños": "Bebé y niños",
};

export const DEFAULT_RECIPE_CATEGORIES = [
  { name: "Desayunos", emoji: "🌅", sortOrder: 0 },
  { name: "Comidas", emoji: "🍲", sortOrder: 1 },
  { name: "Cenas", emoji: "🌙", sortOrder: 2 },
  { name: "Snacks", emoji: "🍪", sortOrder: 3 },
  { name: "Antiinflamatorio", emoji: "🥗", sortOrder: 4 },
];

export const MEAL_TYPE_TO_RECIPE_CATEGORY: Record<string, string> = {
  desayuno: "Desayunos",
  comida: "Comidas",
  cena: "Cenas",
  snack: "Snacks",
};
