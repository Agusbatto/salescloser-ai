/** Lee un File (subido o pegado del portapapeles) como data URL base64. */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

/**
 * Achica una imagen antes de mandarla: menos tokens en la llamada a la
 * IA (las imágenes pesan en tokens según su tamaño) y, si se guarda
 * (chat del cliente), menos espacio en la base de datos. Una captura
 * de pantalla de texto sigue siendo perfectamente legible a 1280px de
 * ancho — no hace falta la resolución original.
 */
export function downscaleImage(file: File, maxWidth = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };

    img.src = objectUrl;
  });
}

/** Busca la primera imagen entre los items pegados del portapapeles, si hay alguna. */
export function getImageFromClipboard(items: DataTransferItemList): File | null {
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
