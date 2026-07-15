// Centraliza a formatação de datas para não usar split("-") no JSX
export const formatDateBR = (dateStr: string) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

export const formatMonthBR = (monthStr: string) => {
  if (!monthStr) return "";
  const [y, m] = monthStr.split("-");
  return `${m}/${y}`;
};