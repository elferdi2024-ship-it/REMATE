"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface AdBannerProps {
  id: string;
  type: "image" | "html";
  imgSrc?: string;
  imgAlt?: string;
  href?: string;
  htmlContent?: React.ReactNode;
  backgroundColor?: string;
}

export default function AdBanner({
  id,
  type,
  imgSrc,
  imgAlt = "Publicidad",
  href,
  htmlContent,
  backgroundColor = "var(--bg2)",
}: AdBannerProps) {
  const content = (
    <div
      className="ad-banner"
      style={{
        backgroundColor,
        borderRadius: "var(--r-lg, 16px)",
        overflow: "hidden",
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "var(--shadow-md)",
        border: "1.5px solid var(--border)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      {type === "image" && imgSrc && (
        <div style={{ position: "relative", width: "100%", paddingTop: "20%" /* 5:1 aspect ratio roughly */, minHeight: "120px" }}>
          <Image
            src={imgSrc}
            alt={imgAlt}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      )}
      
      {type === "html" && htmlContent && (
        <div style={{ padding: "24px", width: "100%" }}>
          {htmlContent}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="ad-banner-link" style={{ display: "block", textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}
