// Listas fixas usadas no formulário de lançamento e no questionário de
// serviços adicionais do Controle Operacional. Ajustar aqui reflete em
// toda a página — sem mudança de schema.

export const CLIENTES_OPERACAO = [
  "Citrosuco",
  "Elementis",
  "Wegochem",
  "Activas",
  "Livital",
  "Tergo",
  "Medcorp",
  "Cardiovent",
  "Westrock",
  "Abecom",
  "Teccom",
  "Dyno",
  "Outro",
] as const;

export const TIPOS_OPERACAO = [
  "Carga",
  "Descarga",
  "Carga Crossdocking",
  "Descarga Crossdocking",
  "Entrega",
] as const;

// Serviços com pergunta Sim/Não fixa. "Outro" é tratado à parte no
// formulário (permite descrever o serviço).
export const SERVICOS_FIXOS = ["Stretch film", "Fornecimento de pallet", "Etiquetagem"] as const;
