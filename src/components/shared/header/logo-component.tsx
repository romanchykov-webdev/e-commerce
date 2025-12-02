import Image from "next/image";
import Link from "next/link";
import React, { JSX } from "react";

interface Props {
	className?: string;
}

export const Logo: React.FC<Props> = ({ className }): JSX.Element => {
	return (
		<Link href="/" className="flex items-center gap-3 flex-col md:flex-row">
			<Image src="/logo.png" alt="logo" width={40} height={40} />
			<div className="text-center md:text-left">
				<h1 className="text-xl md:text-2xl uppercase font-black">Gemma</h1>
				<p className="text-xs md:text-sm text-gray-400 leading-3">
					non potrebbe essere <br /> più delizioso
				</p>
			</div>
		</Link>
	);
};
