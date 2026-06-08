import path from "path";
import { writeFile, mkdir } from "fs/promises";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return jsonResponse({ error: "Nenhum arquivo recebido" }, 400);
    }

    // Valida tipo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return jsonResponse(
        { error: "Tipo de arquivo inválido. Apenas JPG, PNG e WebP são permitidos." },
        400
      );
    }

    // Valida tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return jsonResponse({ error: "Arquivo muito grande. Máximo 5MB." }, 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gera nome único
    const timestamp = Date.now();
    const sanitizedName = file.name.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const filename = `${timestamp}-${sanitizedName}`;

    // Salva em public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Retorna URL pública
    const publicUrl = `/uploads/${filename}`;

    return jsonResponse({ url: publicUrl, success: true });
  } catch (error) {
    console.error("Erro no upload:", error);
    return jsonResponse({ error: "Erro ao fazer upload" }, 500);
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
