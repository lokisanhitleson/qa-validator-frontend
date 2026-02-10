import Image from "next/image";
import { ZENSAR_LOGO_URL } from "@/utils/constants";

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export default function Logo({
  width = 120,
  height = 32,
  className = "",
}: LogoProps) {
  return (
    <Image
      src={ZENSAR_LOGO_URL}
      alt="Zensar Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
