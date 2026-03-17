// --- Funções Utilitárias (Helpers) ---

// Normaliza texto: remove acentos e converte para minúsculas
function normalizar(s) {
  if (s == null) return "";
  const mapa = {
    á: "a",
    à: "a",
    â: "a",
    ã: "a",
    ä: "a",
    é: "e",
    è: "e",
    ê: "e",
    ë: "e",
    í: "i",
    ì: "i",
    î: "i",
    ï: "i",
    ó: "o",
    ò: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ú: "u",
    ù: "u",
    û: "u",
    ü: "u",
    ç: "c",
    ñ: "n",
  };
  return s
    .toLowerCase()
    .split("")
    .map((ch) => mapa[ch] ?? ch)
    .join("");
}

// Saneamento: remove quebras de linha e escapa HTML perigoso
function sanear(msg) {
  const s = String(msg ?? "").replace(/\r?\n|\r/g, " ");
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// --- Função Principal ---

async function consumirApiPlanejada(provedor, config) {
  // 1) Montar a requisição mantendo imutabilidade do config
  const req = {
    endpoint: config?.endpoint ?? "/posts",
    metodo: config?.metodo ?? "GET",
    headers: { ...(config?.headers ?? {}) },
    payload: config?.payload ?? null,
  };

  try {
    // 2) Chamar o provedor (função que simula a Promise)
    const resp = await provedor(req);

    // Verifica falha lógica do provedor (ex: 404, 500 simulado)
    if (!resp || resp.ok !== true) {
      const status = resp?.status ?? 0;
      return {
        ok: false,
        status,
        codigo: "API_FALHA",
        mensagem: sanear("Falha no provedor de API."),
      };
    }

    // 3) Pós-processamento
    // Cria cópia do array para garantir imutabilidade (slice)
    let posts = Array.isArray(resp.data) ? resp.data.slice() : [];

    // Validação: Garante que os itens tenham id, title e body válidos
    posts = posts.filter(
      (p) =>
        p &&
        (p.id ?? null) !== null &&
        typeof p.title === "string" &&
        typeof p.body === "string",
    );

    // Filtro por userId (se definido)
    if (typeof config?.userId === "number") {
      posts = posts.filter((p) => p.userId === config.userId);
    }

    // Filtro por termo de busca (case-insensitive e sem acentos)
    if (config?.termo) {
      const q = normalizar(config.termo);
      posts = posts.filter(
        (p) =>
          normalizar(p.title).includes(q) || normalizar(p.body).includes(q),
      );
    }

    // Ordenação Estável
    const ordenarPor = (config?.ordenarPor ?? "id").toLowerCase();
    const ordem = (config?.ordem ?? "asc").toLowerCase();

    // Mapeia para guardar o índice original (para desempate estável)
    posts = posts.map((p, i) => ({ p, i }));

    posts.sort((a, b) => {
      let c = 0;

      if (ordenarPor === "title") {
        c = a.p.title.localeCompare(b.p.title);
      } else {
        // Ordenação numérica por ID
        c = a.p.id === b.p.id ? 0 : a.p.id < b.p.id ? -1 : 1;
      }

      // Inverte se for decrescente
      if (ordem === "desc") c = -c;

      // Se houve empate (c === 0), usa o índice original (a.i - b.i)
      return c !== 0 ? c : a.i - b.i;
    });

    // Remove o wrapper do índice, voltando a ser apenas o objeto post
    posts = posts.map((x) => x.p);

    // Deduplicação por ID (somente após ordenar, conforme regra)
    if (config?.deduplicarPorId === true) {
      const vistos = new Set();
      posts = posts.filter((p) => {
        if (vistos.has(p.id)) return false;
        vistos.add(p.id);
        return true;
      });
    }

    // Limite de resultados (aplicado por último)
    if (
      Number.isInteger(config?.limite) &&
      config.limite > 0 &&
      posts.length > config.limite
    ) {
      posts = posts.slice(0, config.limite);
    }

    // Retorno de Sucesso Padronizado
    return {
      ok: true,
      status: resp.status ?? 200,
      dados: {
        posts,
        total: posts.length,
      },
    };
  } catch (err) {
    // Tratamento de Erro e Saneamento
    const msgBruta = err && (err.message ?? err);
    const msg = sanear(msgBruta);

    // Detecção simples do tipo de erro baseada na string
    const strErr = String(err);
    const codigo = /network|fetch/i.test(strErr)
      ? "REDE_INDISPONIVEL"
      : /timeout/i.test(strErr)
        ? "REQUISICAO_EXPIRADA"
        : "ERRO_DESCONHECIDO";

    return {
      ok: false,
      status: 0,
      codigo,
      mensagem: msg,
    };
  }
}
