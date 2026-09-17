type Cf7Response = {
  status?: string;
  message?: string;
  invalid_fields?: Array<{ field?: string; message?: string }>;
};

/**
 * Envia um formulário para o Contact Form 7.
 *
 * O CF7 responde **HTTP 200 mesmo quando recusa** o envio (validação ou falha
 * de e-mail): quem decide é o campo `status` do corpo. A verificação mora aqui
 * para nenhum formulário poder esquecê-la e anunciar sucesso indevido.
 *
 * Lança em caso de recusa, com a mensagem que o próprio WordPress devolveu.
 */
export async function wp(formId: string, data: Record<string, unknown>) {
  const url = `${process.env.NEXT_PUBLIC_ADMIN_URL}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`;

  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof FileList) {
      for (const file of Array.from(value)) formData.append(`${key}[]`, file);
      continue;
    }

    formData.append(key, value as string);
  }

  formData.append("_wpcf7_unit_tag", `wpcf7-f${formId}-o1`);

  const response = await fetch(url, { method: "POST", body: formData });

  let result: Cf7Response;

  try {
    result = await response.json();
  } catch {
    throw new Error("Não foi possível concluir o envio. Tente novamente.");
  }

  if (result.status !== "mail_sent") {
    const invalidField = result.invalid_fields?.[0]?.message;
    throw new Error(
      invalidField || result.message || "Não foi possível concluir o envio.",
    );
  }

  return result;
}
