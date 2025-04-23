import React from "react";
import { BookImage } from "lucide-react";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      {/* <Sparkles className="size-8" strokeWidth={1.5} /> */}
      <BookImage className="size-8" strokeWidth={1.5} />
      <span className="text-lg font-semibold">Hanzi AI</span>
    </Link>
  );
};

export default Logo;
