import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// --- ENUMS ---
export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN", "CONTENT_MAKER", "OWNER"]);
export const orderStatusEnum = pgEnum("order_status", ["PENDING", "SUCCEEDED", "CANCELLED"]);

// --- BETTER-AUTH TABLES (Snake Case) ---
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	role: userRoleEnum("role").default("USER"),
	phone: text("phone"),
	address: text("address"),
	password: text("password"),
	verified: timestamp("verified"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

// --- SHOP TABLES ---
export const category = pgTable("category", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export const product = pgTable("product", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	imageUrl: text("image_url").notNull(),
	categoryId: integer("category_id")
		.notNull()
		.references(() => category.id),

	isNew: boolean("is_new").default(false).notNull(),
	isOnSale: boolean("is_on_sale").default(false).notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export type Product = typeof product.$inferSelect;

export const ingredient = pgTable("ingredient", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
	imageUrl: text("image_url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productSize = pgTable("product_size", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	value: integer("value").notNull().unique(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const doughType = pgTable("dough_type", {
	id: serial("id").primaryKey(),
	name: text("name").notNull().unique(),
	value: integer("value").notNull().unique(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productItem = pgTable("product_item", {
	id: serial("id").primaryKey(),
	price: decimal("price", { precision: 10, scale: 2 }).default("0").notNull(),
	productId: integer("product_id")
		.notNull()
		.references(() => product.id),
	sizeId: integer("size_id").references(() => productSize.id),
	doughTypeId: integer("dough_type_id").references(() => doughType.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productToIngredient = pgTable(
	"product_to_ingredient",
	{
		productId: integer("product_id")
			.notNull()
			.references(() => product.id, { onDelete: "cascade" }),
		ingredientId: integer("ingredient_id")
			.notNull()
			.references(() => ingredient.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.productId, t.ingredientId] }),
	}),
);

export const cart = pgTable("cart", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
	tokenId: text("token_id"),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItem = pgTable("cart_item", {
	id: uuid("id").defaultRandom().primaryKey(),
	cartId: uuid("cart_id")
		.notNull()
		.references(() => cart.id, { onDelete: "cascade" }),
	productItemId: integer("product_item_id")
		.notNull()
		.references(() => productItem.id),
	quantity: integer("quantity").default(1).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItemToIngredient = pgTable(
	"cart_item_to_ingredient",
	{
		cartItemId: uuid("cart_item_id")
			.notNull()
			.references(() => cartItem.id, { onDelete: "cascade" }),
		ingredientId: integer("ingredient_id")
			.notNull()
			.references(() => ingredient.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.cartItemId, t.ingredientId] }),
	}),
);

export const order = pgTable("order", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id").references(() => user.id),
	tokenId: text("token_id").notNull(),
	items: jsonb("items").notNull(),
	status: orderStatusEnum("status").default("PENDING").notNull(),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0").notNull(),
	fullName: text("full_name").notNull(),
	address: text("address").notNull(),
	email: text("email").notNull(),
	phone: text("phone").notNull(),
	comment: text("comment"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationCode = pgTable("verification_code", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }),
	code: text("code").notNull(),
	expiresAt: timestamp("expires_at").defaultNow().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const story = pgTable("story", {
	id: serial("id").primaryKey(),
	previewImageUrl: text("preview_image_url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const storyItem = pgTable("story_item", {
	id: serial("id").primaryKey(),
	storyId: integer("story_id")
		.notNull()
		.references(() => story.id, { onDelete: "cascade" }),
	sourceUrl: text("source_url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- RELATIONS ---
export const categoryRelations = relations(category, ({ many }) => ({
	products: many(product),
}));

export const productRelations = relations(product, ({ one, many }) => ({
	category: one(category, { fields: [product.categoryId], references: [category.id] }),
	items: many(productItem),
	ingredients: many(productToIngredient),
}));

export const productToIngredientRelations = relations(productToIngredient, ({ one }) => ({
	product: one(product, { fields: [productToIngredient.productId], references: [product.id] }),
	ingredient: one(ingredient, { fields: [productToIngredient.ingredientId], references: [ingredient.id] }),
}));
