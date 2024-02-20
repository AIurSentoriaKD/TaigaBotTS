import { writeFile, readdirSync } from "fs";
import path from "path";
const SD_URL = "http://127.0.0.1:7860";
function obtenerNombreArchivoNuevo(directorio: string) {
  const archivos = readdirSync(directorio);
  const nuevoNumero = archivos.length + 1;
  const nombreArchivo = `${nuevoNumero.toString().padStart(6, "0")}.png`; // Asegura que el nombre tenga 6 dígitos

  return nombreArchivo;
}

function escribirArchivo(datos: any) {
  const nombreArchivo = obtenerNombreArchivoNuevo(`./outputs`);
  const rutaCompleta = path.join(`./outputs`, nombreArchivo);

  writeFile(
    `./outputs/${nombreArchivo}`,
    datos,
    { encoding: "base64" },
    (err) => {
      if (err) {
        console.error("Error al escribir el archivo:", err);
      } else {
        console.log("Archivo escrito exitosamente:", rutaCompleta);
      }
    }
  );
  return nombreArchivo;
}

export async function txt2img(payload: any) {
  let endpoint = "/sdapi/v1/txt2img";

  const response = await fetch(`${SD_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) throw new Error("SD no disponible");
  const data: any = await response.json();
  if (!data?.images) throw new Error("Sin respuesta Valida");

  const nombreArchivo = escribirArchivo(data.images[0]);
  const info = JSON.parse(data.info);
  return [nombreArchivo, data.images[0], info];
}

export async function img2img(payload: any) {
  let endpoint = "/sdapi/v1/img2img";
  const response = await fetch(`${SD_URL}${endpoint}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status !== 200) throw new Error("SD no disponible");
  const data: any = await response.json();
  if (!data?.images) throw new Error("Sin respuesta Valida");

  const nombreArchivo = escribirArchivo(data.images[0]);

  return [nombreArchivo, data.images[0]];
}
