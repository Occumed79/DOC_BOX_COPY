"use client";

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { MetalFx } from "metal-fx";

type MetalButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  metalFxClassName?: string;
  metalPreset?: "chromatic" | "silver" | "gold";
  metalStrength?: number;
  metalVariant?: "button" | "circle";
};

function wrapperClassFor(className = "", extra = "") {
  const classes = ["doc-metal-fx"];
  if (/\bw-full\b/.test(className)) classes.push("w-full");
  if (/\bflex-1\b/.test(className)) classes.push("flex-1");
  if (/\bshrink-0\b/.test(className)) classes.push("shrink-0");
  if (extra) classes.push(extra);
  return classes.join(" ");
}

export const MetalButton = forwardRef<HTMLDivElement, MetalButtonProps>(function MetalButton(
  {
    className = "",
    metalFxClassName = "",
    metalVariant = "button",
    metalStrength = 0.9,
    metalPreset = "chromatic",
    children,
    ...buttonProps
  },
  ref
) {
  return (
    <MetalFx
      ref={ref}
      className={wrapperClassFor(className, metalFxClassName)}
      preset={metalPreset}
      theme="dark"
      strength={metalStrength}
      variant={metalVariant}
      normalizeHostStyles={false}
    >
      <button className={className} {...buttonProps}>
        {children}
      </button>
    </MetalFx>
  );
});

MetalButton.displayName = "MetalButton";
export default MetalButton;
