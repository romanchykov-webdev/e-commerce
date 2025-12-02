This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# e-commerce

#supabase RLS
-- 1. Включение RLS для всех таблиц
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_size" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dough_type" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_to_ingredient" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_item" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_item_to_ingredient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_code" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "story" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "story_item" ENABLE ROW LEVEL SECURITY;

-- 2. Создание функции для проверки прав администратора/персонала
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
BEGIN
RETURN EXISTS (
SELECT 1
FROM "user"
WHERE id = auth.uid()::text
AND role IN ('ADMIN', 'OWNER', 'CONTENT_MAKER')
);
END;

$$
LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Политики доступа (Policies)

-- === ПОЛЬЗОВАТЕЛИ ===
-- Пользователь видит только себя, Персонал видит всех
CREATE POLICY "Read users" ON "user" FOR SELECT
USING (auth.uid()::text = id OR is_staff());

-- Только владелец аккаунта может обновлять свои данные (или админ)
CREATE POLICY "Update users" ON "user" FOR UPDATE
USING (auth.uid()::text = id OR is_staff());


-- === ПУБЛИЧНЫЙ КАТАЛОГ (Товары, Категории и т.д.) ===
-- Все (включая анонимов) могут читать, только Персонал может менять

-- Категории
CREATE POLICY "Read categories" ON "category" FOR SELECT USING (true);
CREATE POLICY "Manage categories" ON "category" FOR ALL USING (is_staff());

-- Продукты
CREATE POLICY "Read products" ON "product" FOR SELECT USING (true);
CREATE POLICY "Manage products" ON "product" FOR ALL USING (is_staff());

-- Ингредиенты
CREATE POLICY "Read ingredients" ON "ingredient" FOR SELECT USING (true);
CREATE POLICY "Manage ingredients" ON "ingredient" FOR ALL USING (is_staff());

-- Размеры продуктов
CREATE POLICY "Read sizes" ON "product_size" FOR SELECT USING (true);
CREATE POLICY "Manage sizes" ON "product_size" FOR ALL USING (is_staff());

-- Типы теста
CREATE POLICY "Read dough types" ON "dough_type" FOR SELECT USING (true);
CREATE POLICY "Manage dough types" ON "dough_type" FOR ALL USING (is_staff());

-- Вариации продуктов (Product Items)
CREATE POLICY "Read product items" ON "product_item" FOR SELECT USING (true);
CREATE POLICY "Manage product items" ON "product_item" FOR ALL USING (is_staff());

-- Связь Продукт-Ингредиент
CREATE POLICY "Read product ingredients" ON "product_to_ingredient" FOR SELECT USING (true);
CREATE POLICY "Manage product ingredients" ON "product_to_ingredient" FOR ALL USING (is_staff());

-- Сторис
CREATE POLICY "Read stories" ON "story" FOR SELECT USING (true);
CREATE POLICY "Manage stories" ON "story" FOR ALL USING (is_staff());

CREATE POLICY "Read story items" ON "story_item" FOR SELECT USING (true);
CREATE POLICY "Manage story items" ON "story_item" FOR ALL USING (is_staff());


-- === ЛИЧНЫЕ ДАННЫЕ (Корзина, Заказы) ===

-- Корзина
-- Видит владелец корзины ИЛИ персонал
CREATE POLICY "Read cart" ON "cart" FOR SELECT
USING (auth.uid()::text = user_id OR is_staff());

-- Создавать/менять может владелец ИЛИ персонал
CREATE POLICY "Manage cart" ON "cart" FOR ALL
USING (auth.uid()::text = user_id OR is_staff());

-- Элементы корзины (Cart Items)
-- Доступ, если есть доступ к самой корзине
CREATE POLICY "Read cart items" ON "cart_item" FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM cart
        WHERE cart.id = cart_item.cart_id
        AND (cart.user_id = auth.uid()::text OR is_staff())
    )
);

CREATE POLICY "Manage cart items" ON "cart_item" FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM cart
        WHERE cart.id = cart_item.cart_id
        AND (cart.user_id = auth.uid()::text OR is_staff())
    )
);

-- Ингредиенты в корзине
CREATE POLICY "Manage cart item ingredients" ON "cart_item_to_ingredient" FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM cart_item
        JOIN cart ON cart.id = cart_item.cart_id
        WHERE cart_item.id = cart_item_to_ingredient.cart_item_id
        AND (cart.user_id = auth.uid()::text OR is_staff())
    )
);


-- Заказы
-- Видит владелец ИЛИ персонал
CREATE POLICY "Read orders" ON "order" FOR SELECT
USING (auth.uid()::text = user_id OR is_staff());

-- Создавать может авторизованный пользователь для себя
CREATE POLICY "Create orders" ON "order" FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Обновлять статус заказа может только персонал
CREATE POLICY "Update orders" ON "order" FOR UPDATE
USING (is_staff());


-- Коды верификации
CREATE POLICY "Manage verification codes" ON "verification_code" FOR ALL
USING (auth.uid()::text = user_id OR is_staff());


-- === BETTER AUTH ===
-- Эти таблицы обычно читаются сервером (service_role), но для клиента можно открыть чтение
CREATE POLICY "Read sessions" ON "session" FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Read accounts" ON "account" FOR SELECT USING (auth.uid()::text = user_id);
$$
