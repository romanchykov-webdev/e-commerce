"use client";

import { Container } from "@/components/shared/container";
import { Category } from "@/db/schema";
import { cn } from "@/lib/utils";

import React, { JSX } from "react";
import { Categories } from "./categories";

interface Props {
	className?: string;
	categories: Category[];
}

export const TopBar: React.FC<Props> = ({ categories, className }): JSX.Element => {
	return (
		<div
			className={cn(
				"sticky top-0 py-5 bg-white shadow-lg shadow-black/5 z-10 overflow-x-auto scrollbar ",
				className,
			)}
		>
			<Container className="flex items-center justify-between ">
				<Categories items={categories} />
				<div className="flex items-center">{/* <SortPopup value="none" onChange={() => {}} /> */}</div>
			</Container>
		</div>
	);
};
