import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    revalidatePath("/", "layout");
    return Response.json({
      message: "Cache limpo com sucesso!",
    });
  } catch (err) {
    return Response.json(err, {
      status: 500,
    });
  }
}
