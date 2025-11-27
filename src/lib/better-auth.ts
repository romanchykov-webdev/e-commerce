import { betterAuth } from "better-auth";

export const auth = betterAuth({
	database: {
		// BetterAuth требует прямого подключения к БД или адаптера.
		// Для Supabase часто используют PostgreSQL адаптер или плагины.
		// Пример для PostgreSQL (нужен URL подключения):
		provider: "postgresql",
		url: process.env.DATABASE_URL,
	},
	socialProviders: {
		// google: { ... },
		// github: { ... }
	},
});
