import { cn } from "@/lib/utils";
import React, { JSX } from "react";
import { CartButton } from "../cart/cart-button";
import { AuthModal } from "../modals";
import { ProfileButton } from "../profile-button";

interface Props {
	className?: string;
	openAuthModal: boolean;
	setOpenAuthModal: (open: boolean) => void;
	hasCart: boolean;
}

export const RightSide: React.FC<Props> = ({ className, openAuthModal, setOpenAuthModal, hasCart }): JSX.Element => {
	return (
		<div className={cn("flex items-center gap-3 justify-center md:justify-end", className)}>
			<AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
			<ProfileButton onClockSignIn={() => setOpenAuthModal(true)} />

			{hasCart && <CartButton />}
		</div>
	);
};
