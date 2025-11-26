import { NextRequest, NextResponse } from "next/server";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3NdPQF5p59m965pNMd_AzSPhO1-DXa8tcbi_T_4ZR-hLAfQ/formResponse";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data) {
      return NextResponse.json(
        { error: "Dados não fornecidos" },
        { status: 400 },
      );
    }

    const formData = new URLSearchParams();

    if (data.dadosPessoais) {
      formData.append(
        "entry.502479035",
        data.dadosPessoais.entry_502479035 || "",
      );
      formData.append(
        "entry.1045653986",
        data.dadosPessoais.entry_1045653986 || "",
      );
      formData.append(
        "entry.431975596",
        data.dadosPessoais.entry_431975596 || "",
      );
      formData.append(
        "entry.1067624691",
        data.dadosPessoais.entry_1067624691 || "",
      );
    }

    if (data.situacaoAtual) {
      formData.append(
        "entry.1524797025",
        data.situacaoAtual.entry_1524797025 || "",
      );
      formData.append(
        "entry.936724915",
        data.situacaoAtual.entry_936724915 || "",
      );
      formData.append(
        "entry.1945294488",
        data.situacaoAtual.entry_1945294488 || "",
      );
      formData.append(
        "entry.661900987",
        data.situacaoAtual.entry_661900987 || "",
      );
    }

    // Histórico Online
    if (data.historicoOnline) {
      formData.append(
        "entry.683158185",
        data.historicoOnline.entry_683158185 || "",
      );
      formData.append(
        "entry.1091112575",
        data.historicoOnline.entry_1091112575 || "",
      );
    }

    // Metas e Dedicação
    if (data.metasDedicacao) {
      formData.append(
        "entry.1979104888",
        data.metasDedicacao.entry_1979104888 || "",
      );
      formData.append(
        "entry.899222282",
        data.metasDedicacao.entry_899222282 || "",
      );
      formData.append(
        "entry.462376964",
        data.metasDedicacao.entry_462376964 || "",
      );
      formData.append(
        "entry.1510858042",
        data.metasDedicacao.entry_1510858042 || "",
      );
    }

    // UTM Parameters (opcional)
    if (data.utm_source) formData.append("entry.utm_source", data.utm_source);
    if (data.utm_medium) formData.append("entry.utm_medium", data.utm_medium);
    if (data.utm_campaign)
      formData.append("entry.utm_campaign", data.utm_campaign);

    const response = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
      redirect: "manual",
    });

    if (
      response.status === 0 ||
      response.status === 303 ||
      response.status === 302 ||
      response.status === 200
    ) {
      return NextResponse.json(
        { success: true, message: "Formulário enviado com sucesso!" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Erro ao enviar formulário",
        status: response.status,
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Erro ao processar formulário:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
