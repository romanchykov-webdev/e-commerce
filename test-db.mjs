// import "dotenv/config"; // <--- ЗАКОММЕНТИРУЙТЕ ИЛИ УДАЛИТЕ ЭТУ СТРОКУ
import pg from "pg";

const { Client } = pg;

// Загрузка переменных окружения для локального теста
// Если у вас Node.js v20.6+, можно запускать как: node --env-file=.env.local test-db.mjs
// Иначе установите dotenv: npm i dotenv

async function testConnection() {
	if (!process.env.DATABASE_URL) {
		console.error("❌ Ошибка: DATABASE_URL не найден в переменных окружения.");
		return;
	}

	const client = new Client({
		connectionString: process.env.DATABASE_URL,
	});

	try {
		console.log("⏳ Подключение к базе данных...");
		await client.connect();
		console.log("✅ УСПЕХ! Подключение установлено.");

		const res = await client.query("SELECT NOW()");
		console.log("🕒 Время сервера базы данных:", res.rows[0].now);

		await client.end();
	} catch (err) {
		console.error("❌ Ошибка подключения:", err);
	}
}

testConnection();
