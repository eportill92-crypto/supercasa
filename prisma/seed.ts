import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const STARTER_PRODUCTS: {
  name: string;
  unit: string;
  category: string;
  quantity: number;
  minThreshold: number;
  targetQty: number;
}[] = [
  { name: "Leche entera 1L", unit: "L", category: "Lácteos", quantity: 2, minThreshold: 2, targetQty: 4 },
  { name: "Huevo (cartón 18 pza)", unit: "cartón", category: "Lácteos", quantity: 1, minThreshold: 1, targetQty: 2 },
  { name: "Papel higiénico", unit: "rollo", category: "Limpieza", quantity: 4, minThreshold: 4, targetQty: 12 },
  { name: "Jabón para trastes", unit: "pza", category: "Limpieza", quantity: 1, minThreshold: 1, targetQty: 2 },
  { name: "Arroz", unit: "kg", category: "Abarrotes", quantity: 1, minThreshold: 1, targetQty: 2 },
  { name: "Frijol", unit: "kg", category: "Abarrotes", quantity: 1, minThreshold: 1, targetQty: 2 },
  { name: "Café molido", unit: "paquete", category: "Abarrotes", quantity: 1, minThreshold: 1, targetQty: 2 },
  { name: "Aceite vegetal 1L", unit: "L", category: "Abarrotes", quantity: 1, minThreshold: 1, targetQty: 2 },
];

async function main() {
  for (const p of STARTER_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: { name: p.name, unit: p.unit, category: p.category },
    });
    await prisma.pantryItem.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        quantity: p.quantity,
        minThreshold: p.minThreshold,
        targetQty: p.targetQty,
      },
    });
  }

  await prisma.deliveryAddress.upsert({
    where: { id: "default-address" },
    update: {},
    create: {
      id: "default-address",
      label: "Casa",
      street: "Completa tu calle y número",
      city: "Ciudad de México",
      state: "CDMX",
      zip: "00000",
      isDefault: true,
    },
  });

  console.log(`Sembrados ${STARTER_PRODUCTS.length} productos de ejemplo.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
