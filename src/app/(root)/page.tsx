import { TopBar } from "@/components/shared";
import { db } from "@/db";
import { category } from "@/db/schema";

export default async function Home() {
	// Тестовый запрос к базе данных
	// const products = await db.select().from(product);
	const categories = await db.select().from(category);

	// Вывод в консоль сервера (терминал, где запущен npm run dev) - для проверки
	// console.log("Список товаров:", products);
	// console.log("Список категорий:", categories);

	// Группируем продукты по категориям
	// const productsByCategory = categories.map((cat) => ({
	// 	...cat,
	// 	items: products.filter((p) => p.categoryId === cat.id),
	// }));

	// const categories = await db.query.category.findMany({
	// 	with: {
	// 		products: {
	// 			with: {
	// 				items: true,
	// 				ingredients: {
	// 					with: {
	// 						ingredient: true,
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// });
	// console.log(JSON.stringify(categories, null, 2));

	// // Фильтруем пустые категории и преобразуем данные для UI
	// // (Drizzle возвращает цены как строки для точности, преобразуем в числа для UI)
	// const productsByCategory = categories
	// 	.filter((cat) => cat.products.length > 0)
	// 	.map((cat) => ({
	// 		...cat,
	// 		items: cat.products.map((product) => ({
	// 			...product,
	// 			items: product.items.map((item) => ({
	// 				...item,
	// 				price: Number(item.price),
	// 			})),
	// 			ingredients: product.ingredients.map((ing) => ({
	// 				...ing.ingredient,
	// 				price: Number(ing.ingredient.price),
	// 			})),
	// 		})),
	// 	}));

	return (
		<main>
			<TopBar categories={categories.map(({ id, name }) => ({ id, name }))} />

			{/* Список товаров */}
			<div className="flex-1">
				<div className="flex flex-col gap-16">
					{/* {productsByCategory.map((cat, index) => (
						<article id={`category-${cat.id}`} key={cat.id}>
							<ProductsGroupList
								categoryId={cat.id}
								title={cat.name}
								items={cat.items as any}
								isFirstCategory={index === 0}
							/>
						</article>
					))} */}
				</div>
			</div>
		</main>
	);
}
