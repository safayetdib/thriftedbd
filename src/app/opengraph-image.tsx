import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Branded share card — the "t" icon + the colourful thriftedBD wordmark on a
// clean canvas. Deliberately NOT a lifestyle banner (those are reserved for
// hero/section backgrounds), so shared links read as the brand, not a product.
export const alt = "thriftedBD — imported preloved fashion, cash on delivery across Bangladesh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [iconData, logoData] = await Promise.all([
    readFile(join(process.cwd(), "public/icons/icon-512.png")),
    readFile(join(process.cwd(), "public/logos/thriftedBD_logo_colorful.png")),
  ]);
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;
  const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <img src={iconSrc} width={248} height={248} style={{ marginBottom: 52 }} alt="" />
      {/* colourful wordmark is 2400×420 (ratio ~5.71) */}
      <img src={logoSrc} width={820} height={144} alt="" />
      <div style={{ width: 200, height: 8, background: "#111111", marginTop: 44 }} />
    </div>,
    { ...size },
  );
}
