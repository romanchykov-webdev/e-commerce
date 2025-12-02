"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Container } from "../container";
import { Logo } from "./logo-component";
import { RightSide } from "./right-side";
import { SearchInput } from "./serch-input";

interface Props {
	className?: string;
	hasSearch?: boolean;
}

export const Header: React.FC<Props> = ({ className, hasSearch }) => {
	const [openAuthModal, setOpenAuthModal] = useState(false);

	return (
		<div className={cn(" ", className)}>
			<Container className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:py-8tems-center justify-between">
				{/* Верхняя часть — логотип и поиск */}
				<div className="flex flex-col md:flex-row md:items-center md:gap-10 w-full">
					<div className="flex justify-center md:justify-start">
						<Logo />
					</div>
					{hasSearch && (
						<div className="mt-4 md:mt-0 md:flex-1">
							<SearchInput />
						</div>
					)}
				</div>

				{/* Правая часть (вход + корзина) */}
				<RightSide openAuthModal={openAuthModal} setOpenAuthModal={setOpenAuthModal} hasCart={true} />
			</Container>
		</div>
	);
};
