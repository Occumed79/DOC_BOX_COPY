"use client";

import React, { type CSSProperties, type ReactNode } from "react";

type NeonBorderProps = {
  color1?: string;
  color2?: string;
  animationType?: "none" | "half" | "full";
  duration?: number;
  className?: string;
  children: ReactNode;
};

function getWidth(animationType: "none" | "half" | "full") {
  switch (animationType) {
    case "none": return 12;
    case "half": return 50;
    case "full": return 100;
  }
}

export default function NeonBorder({
  color1 = "#0496ff",
  color2 = "#ff0a54",
  duration = 6,
  animationType = "half",
  className = "",
  children,
}: NeonBorderProps) {
  const style = {
    "--neon-border-duration": `${duration}s`,
    "--neon-border-width": `${getWidth(animationType)}%`,
    "--neon-border-color-1": color1,
    "--neon-border-color-2": color2,
  } as CSSProperties;

  const animate = animationType !== "none" ? " animate-neon-border" : "";

  return (
    <div className={`neon-border-shell ${className}`} style={style}>
      <div className={`neon-border-one${animate}`} />
      <div className={`neon-border-two${animate}`} />
      {children}
    </div>
  );
}
