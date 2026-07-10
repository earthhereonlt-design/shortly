import QRCode from "qrcode";

/** Render a QR code as an inline SVG string (no external image needed). */
export async function renderQrSvg(
  text: string,
  opts: { size?: number; fg?: string; bg?: string; ec?: "L" | "M" | "Q" | "H" } = {},
): Promise<string> {
  const { size = 256, fg = "#09090B", bg = "#FFFFFF", ec = "M" } = opts;
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: ec,
    margin: 1,
    color: { dark: fg, light: bg },
    width: size,
  });
}
