import { db } from "@/db";
import { product } from "@/db/schema";

export default async function Home() {
	// Тестовый запрос к базе данных
	const products = await db.select().from(product);

	// Вывод в консоль сервера (терминал, где запущен npm run dev) - для проверки
	console.log("Список товаров:", products);

	return <div>Home</div>;
}
