"use client";

import React, { useEffect, useRef } from "react";
import { useIntersection } from "react-use";

import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/store/category";

// import { ProductWithRelations } from "../../../@types/prisma";
import { ProductWithRelations } from "../../../../public/@types/drizle";
import { Title } from "../title";
import { ProductCard } from "./product-card";
// import { Title } from "./title";

interface Props {
	title: string;

	items: ProductWithRelations[];
	categoryId: number;
	className?: string;
	isFirstCategory?: boolean; // ✅ Для оптимизации LCP - грузим первые 3 изображения сразу
}

export const ProductsGroupList: React.FC<Props> = ({
	title,
	items,
	categoryId,
	className,
	isFirstCategory = false,
}) => {
	//
	const HEADER_OFFSET = 100; // высота sticky-зоны (TopBar + отступы)

	const setActiveCategoryId = useCategoryStore((state) => state.setActiveId);

	const intersectionRef = useRef<HTMLDivElement>(null);

	// const intersection = useIntersection(intersectionRef as React.RefObject<HTMLElement>, {
	// 	threshold: 0.4,
	// });

	const intersection = useIntersection(intersectionRef as React.RefObject<HTMLElement>, {
		root: null,
		// сдвигаем окно наблюдения вниз на высоту шапки, и “сужаем” снизу, чтобы
		// предыдущая секция не считалась активной, когда новая почти у верха
		rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
		threshold: [0, 0.1, 0.25, 0.5],
	});

	useEffect(() => {
		if (intersection?.isIntersecting) {
			setActiveCategoryId(categoryId);
			// console.log("categoryId", categoryId);
		}
	}, [categoryId, intersection?.isIntersecting, title, setActiveCategoryId]);

	return (
		<div className={className} id={title} ref={intersectionRef} style={{ scrollMarginTop: "120px" }}>
			<Title text={title} size="lg" className="font-extrabold mb-5" />

			<div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4")}>
				{items.map((product, index) => {
					// Пытаемся найти минимальную цену, если items есть
					const minPriceItem =
						product.items.length > 0
							? product.items.reduce((min, item) => (item.price < min.price ? item : min))
							: null;

					return (
						<ProductCard
							key={product.id}
							id={product.id}
							name={product.name}
							imageUrl={product.imageUrl}
							price={minPriceItem ? minPriceItem.price : 0}
							ingredients={product.ingredients}
							itemId={minPriceItem ? minPriceItem.id : 0}
						/>
					);
				})}
			</div>
		</div>
	);
};
