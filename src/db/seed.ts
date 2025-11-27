import { hashSync } from "bcrypt";
import { sql } from "drizzle-orm";
import { _ingredients, categories, products } from "./constants";
import { db } from "./index";
import * as schema from "./schema";

const randomDecimalPrice = (min: number, max: number): string => {
	const val = Math.round((Math.random() * (max - min) + min) * 100) / 100;
	return String(val);
};

const generateProductItem = ({
	productId,
	doughTypeId,
	sizeId,
	price,
}: {
	productId: number;
	doughTypeId?: number;
	sizeId?: number;
	price?: number;
}) => {
	return {
		productId,
		price: price ? String(price) : randomDecimalPrice(1.99, 24.99),
		doughTypeId,
		sizeId,
	};
};

async function down() {
	console.log("🧨 Очистка базы данных...");
	// Используем SQL для каскадной очистки, так как порядок удаления важен
	await db.execute(sql`TRUNCATE TABLE "user" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "category" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "cart" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "cart_item" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "ingredient" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "product" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "product_item" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "story" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "story_item" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "order" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "verification_code" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "product_size" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "dough_type" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "product_to_ingredient" RESTART IDENTITY CASCADE`);
	await db.execute(sql`TRUNCATE TABLE "cart_item_to_ingredient" RESTART IDENTITY CASCADE`);
}

async function up() {
	console.log("🌱 Наполнение базы данных...");

	// --- ПОЛЬЗОВАТЕЛИ ---
	const [user1] = await db
		.insert(schema.user)
		.values({
			id: crypto.randomUUID(),
			name: "User Test",
			email: "user@test.com",
			emailVerified: true,
			password: hashSync("111111", 10),
			role: "USER",
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	const [user2] = await db
		.insert(schema.user)
		.values({
			id: crypto.randomUUID(),
			name: "Admin Admin",
			email: "admin@test.com",
			emailVerified: true,
			password: hashSync("111111", 10),
			role: "ADMIN",
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	await db.insert(schema.user).values({
		id: crypto.randomUUID(),
		name: "Content Maker",
		email: "content@test.com",
		emailVerified: true,
		password: hashSync("111111", 10),
		role: "CONTENT_MAKER",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await db.insert(schema.user).values({
		id: crypto.randomUUID(),
		name: "Owner Owner",
		email: "owner@test.com",
		emailVerified: true,
		password: hashSync("111111", 10),
		role: "OWNER",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	// --- КАТЕГОРИИ ---
	await db.insert(schema.category).values(categories);

	// --- РАЗМЕРЫ ---
	await db.insert(schema.productSize).values([
		{ name: "Piccola", value: 20, sortOrder: 1 },
		{ name: "Media", value: 30, sortOrder: 2 },
		{ name: "Grande", value: 40, sortOrder: 3 },
		{ name: "0.33L", value: 33, sortOrder: 4 },
		{ name: "0.5L", value: 50, sortOrder: 5 },
		{ name: "1L", value: 100, sortOrder: 6 },
		{ name: "No_size", value: 0, sortOrder: 7 },
	]);

	// --- ТИПЫ ТЕСТА ---
	await db.insert(schema.doughType).values([
		{ name: "Tradizionale", value: 1, sortOrder: 1 },
		{ name: "Sottile", value: 2, sortOrder: 2 },
		{ name: "Standart", value: 3, sortOrder: 3 },
		{ name: "No_type", value: 4, sortOrder: 4 },
	]);

	// --- ИНГРЕДИЕНТЫ ---
	// Сохраняем созданные ингредиенты, чтобы брать их ID
	const createdIngredients = await db
		.insert(schema.ingredient)
		.values(_ingredients.map((ing) => ({ ...ing, price: String(ing.price) })))
		.returning();

	// --- ПРОДУКТЫ (ПИЦЦЫ И ДР.) ---

	// Функция помощник для создания продукта с ингредиентами
	const createProductWithIngredients = async (
		data: (typeof products)[0],
		ingredientsSlice: typeof createdIngredients,
	) => {
		const [product] = await db.insert(schema.product).values(data).returning();

		if (ingredientsSlice.length > 0) {
			await db.insert(schema.productToIngredient).values(
				ingredientsSlice.map((ing) => ({
					productId: product.id,
					ingredientId: ing.id,
				})),
			);
		}
		return product;
	};

	// Базовые продукты из констант (без ингредиентов пока)
	// 1. Пепперони фреш
	const pizza1 = await createProductWithIngredients(
		{
			name: "Pepperoni fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
		},
		createdIngredients.slice(0, 5),
	);

	// 2. 4 Сыра
	const pizza2 = await createProductWithIngredients(
		{
			name: "4 Formaggio",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Formaggio.webp",
			categoryId: 1,
		},
		createdIngredients.slice(5, 10),
	);

	// 3. Чоризо
	const pizza3 = await createProductWithIngredients(
		{
			name: "Chorizo ​​fresh",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Chorizo%20__fresh.webp",
			categoryId: 1,
		},
		createdIngredients.slice(10, 40), // slice может быть больше длины массива, это ок
	);

	// 4. Маргарита
	const pizza4 = await createProductWithIngredients(
		{
			name: "Margherita",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Margherita.webp",
			categoryId: 1,
		},
		createdIngredients.slice(15, 20),
	);

	// 5. Барбекю
	const pizza5 = await createProductWithIngredients(
		{
			name: "Barbecue",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Barbecue.webp",
			categoryId: 1,
		},
		createdIngredients.slice(2, 15),
	);

	// 6. Гавайская
	const pizza6 = await createProductWithIngredients(
		{
			name: "Hawaiano",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Hawaiano.webp",
			categoryId: 1,
		},
		createdIngredients.slice(5, 12),
	);

	// 7. Ветчина и грибы
	const pizza7 = await createProductWithIngredients(
		{
			name: "Prosciutto e funghi",
			imageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Pepperoni_freshJPG.webp",
			categoryId: 1,
		},
		createdIngredients.slice(1, 7),
	);

	// 8. Мясная
	const pizza8 = await createProductWithIngredients(
		{
			name: "4 Carne",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/4_Carne.webp",
			categoryId: 1,
		},
		createdIngredients.slice(10, 16),
	);

	// 9. 6 Сыров
	const pizza9 = await createProductWithIngredients(
		{
			name: "6 Formaggi",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/6_Formaggi.webp",
			categoryId: 1,
		},
		createdIngredients.slice(0, 7),
	);

	// 10. Деревенская
	const pizza10 = await createProductWithIngredients(
		{
			name: "Villaggio",
			imageUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/pizza/Villaggio.webp",
			categoryId: 1,
		},
		createdIngredients.slice(7, 14),
	);

	// Остальные продукты из constants.ts (начиная с индекса, который не конфликтует с уже созданными, если нужно, или просто добавляем всё остальное)
	// В вашем примере вы создавали products через createMany, но там были duplicate names с пиццами выше.
	// Drizzle не упадет, если нет unique constraints на имя. Добавим остальные продукты из массива products:
	await db.insert(schema.product).values(products);

	// --- ВАРИАЦИИ ПРОДУКТОВ (ITEMS) ---
	const productItemsData = [
		// Пицца 1
		generateProductItem({ productId: pizza1.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza1.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza1.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza1.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza1.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza1.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 2
		generateProductItem({ productId: pizza2.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza2.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza2.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza2.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza2.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza2.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 3
		generateProductItem({ productId: pizza3.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza3.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza3.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza3.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza3.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza3.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 4
		generateProductItem({ productId: pizza4.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza4.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza4.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza4.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza4.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza4.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 5
		generateProductItem({ productId: pizza5.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza5.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza5.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza5.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza5.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza5.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 6
		generateProductItem({ productId: pizza6.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza6.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza6.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza6.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza6.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza6.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 7
		generateProductItem({ productId: pizza7.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza7.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza7.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza7.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza7.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza7.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 8
		generateProductItem({ productId: pizza8.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza8.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza8.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza8.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza8.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza8.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 9
		generateProductItem({ productId: pizza9.id, doughTypeId: 1, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza9.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza9.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza9.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza9.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza9.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Пицца 10
		generateProductItem({ productId: pizza10.id, doughTypeId: 1, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza10.id, doughTypeId: 1, sizeId: 3, price: 15 }),
		generateProductItem({ productId: pizza10.id, doughTypeId: 2, sizeId: 1, price: 5 }),
		generateProductItem({ productId: pizza10.id, doughTypeId: 2, sizeId: 2, price: 10 }),
		generateProductItem({ productId: pizza10.id, doughTypeId: 2, sizeId: 3, price: 15 }),

		// Для остальных (просто заглушки, ID могут отличаться, если мы не сбросили sequence, но мы сбросили)
		// ВАЖНО: Т.к. мы создавали пиццы вручную, их ID — 1..10.
		// Продукты из массива products добавятся с ID 11...
		generateProductItem({ productId: 11 }),
		generateProductItem({ productId: 12 }),
		generateProductItem({ productId: 13 }),
		generateProductItem({ productId: 14 }),
		generateProductItem({ productId: 15 }),
		generateProductItem({ productId: 16 }),
		generateProductItem({ productId: 17 }),
	];

	await db.insert(schema.productItem).values(productItemsData);

	// --- КОРЗИНЫ ---

	// Cart 1
	const [cart1] = await db
		.insert(schema.cart)
		.values({
			userId: user1.id,
			totalAmount: "650",
			tokenId: "11111",
		})
		.returning();

	// CartItem 1 (Pizza ID 1 is product item 1 approx? No, product_item_id is sequence)
	// Assuming product_item sequence starts at 1 and we inserted in order.
	const [cartItem1] = await db
		.insert(schema.cartItem)
		.values({
			productItemId: 1,
			cartId: cart1.id,
			quantity: 2,
		})
		.returning();

	// Добавляем ингредиенты в CartItem 1 (ID 1, 2, 3)
	await db.insert(schema.cartItemToIngredient).values([
		{ cartItemId: cartItem1.id, ingredientId: 1 },
		{ cartItemId: cartItem1.id, ingredientId: 2 },
		{ cartItemId: cartItem1.id, ingredientId: 3 },
	]);

	// Cart 2
	const [cart2] = await db
		.insert(schema.cart)
		.values({
			userId: user2.id,
			totalAmount: "0",
			tokenId: "222222",
		})
		.returning();

	// CartItem 2
	const [cartItem2] = await db
		.insert(schema.cartItem)
		.values({
			productItemId: 2,
			cartId: cart2.id,
			quantity: 1,
		})
		.returning();

	// Добавляем ингредиенты в CartItem 2 (ID 4, 5)
	await db.insert(schema.cartItemToIngredient).values([
		{ cartItemId: cartItem2.id, ingredientId: 4 },
		{ cartItemId: cartItem2.id, ingredientId: 5 },
	]);

	// --- СТОРИС ---
	await db.insert(schema.story).values([
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/logo-350x440.webp",
		},
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/logo2.webp",
		},
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/3.webp",
		},
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/4.webp",
		},
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/5.webp",
		},
		{
			previewImageUrl:
				"https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyImg/6.webp",
		},
	]);

	await db.insert(schema.storyItem).values([
		// Story 1
		{
			storyId: 1,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
		},
		{
			storyId: 1,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/2.webp",
		},
		// Story 2
		{
			storyId: 2,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/3.webp",
		},
		{
			storyId: 2,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
		},
		// Story 3
		{
			storyId: 3,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/6.webp",
		},
		{
			storyId: 3,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
		},
		// Story 4
		{
			storyId: 4,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
		},
		{
			storyId: 4,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/3.webp",
		},
		// Story 5
		{
			storyId: 5,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
		},
		{
			storyId: 5,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
		},
		// Story 6
		{
			storyId: 6,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/1.webp",
		},
		{
			storyId: 2,
			sourceUrl: "https://twjhdhfkcwoapajrkakp.supabase.co/storage/v1/object/public/gemma/story/storyItem/4.webp",
		},
	]);

	// Сброс sequences (Drizzle не делает это сам, нужно SQL)
	// В PostgreSQL, когда мы вставляем ID явно (если бы делали), sequence не обновляется.
	// Но тут мы использовали Serial (автоинкремент) почти везде, кроме UUID.
	// На всякий случай, чтобы синхронизировать счетчики:

	await db.execute(sql`
        SELECT setval('ingredient_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ingredient));
        SELECT setval('category_id_seq', (SELECT COALESCE(MAX(id), 1) FROM category));
        SELECT setval('product_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product));
        SELECT setval('product_item_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_item));
        SELECT setval('product_size_id_seq', (SELECT COALESCE(MAX(id), 1) FROM product_size));
        SELECT setval('dough_type_id_seq', (SELECT COALESCE(MAX(id), 1) FROM dough_type));
        SELECT setval('story_id_seq', (SELECT COALESCE(MAX(id), 1) FROM story));
        SELECT setval('story_item_id_seq', (SELECT COALESCE(MAX(id), 1) FROM story_item));
    `);

	console.log("✅ Seed выполнен успешно!");
}

async function main() {
	try {
		await down();
		await up();
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
}

main();
