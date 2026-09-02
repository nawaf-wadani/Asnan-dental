/** Reads an image File, scales it down and re-encodes as a JPEG data URL so
 *  special-request photos stay small enough to store and email. */
export function compressImage(file: File, maxDim = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) return reject(new Error("Please choose an image file"));
    if (file.size > 12 * 1024 * 1024) return reject(new Error("Image must be under 12 MB"));

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That image could not be decoded"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
