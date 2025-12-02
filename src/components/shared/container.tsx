import { cn } from "@/lib/utils";
import React, { JSX } from "react";

interface Props {
	className?: string;
}

export const Container: React.FC<React.PropsWithChildren<Props>> = ({ className, children }): JSX.Element => {
	return <section className={cn("mx-auto max-w-[1280px] px-2 ", className)}>{children}</section>;
};
