import LZString from "lz-string";

interface CartItem {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

/**
 * Encodes cart items into a URL-safe base64 string using LZ-String compression.
 * Returns a string suitable for use as a URL query parameter.
 */
export function encodeCartToURL(cart: CartItem[]): string {
  if (cart.length === 0) return "";
  const json = JSON.stringify(cart);
  const compressed = LZString.compressToBase64(json);
  // Make URL-safe: replace + with - and / with _, remove = padding
  return compressed.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodes a URL parameter back into cart items.
 * Returns null if the parameter is empty, invalid, or decoding fails.
 */
export function decodeCartFromURL(param: string): CartItem[] | null {
  if (!param) return null;
  try {
    // Restore URL-safe characters
    let base64 = param.replace(/-/g, "+").replace(/_/g, "/");
    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const decompressed = LZString.decompressFromBase64(base64);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    if (!Array.isArray(parsed)) return null;
    return parsed as CartItem[];
  } catch {
    return null;
  }
}
