
export function limparMascara(valor: string) {
    return valor.replace(/\D/g, "");
  }
  
  export function aplicarMascaraCpf(valor: string) {
    if (!valor) return "";
    return valor
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2")
      .slice(0, 14);
  }
  
export function aplicarMascaraTelefone(valor: string) {
    if (!valor) return "";
    valor = valor.replace(/\D/g, "");
    if (valor.length <= 10) { // telefone fixo
      return valor
        .replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
        .slice(0, 14);
    } else { // celular
      return valor
        .replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
        .slice(0, 15);
    }
  }

export function normalizarPlaca(valor: string | null | undefined) {
  return (valor ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function formatarPlaca(valor: string | null | undefined) {
  const placa = normalizarPlaca(valor);
  if (!placa) return "--";
  if (placa.length <= 3) return placa;

  return `${placa.slice(0, 3)}-${placa.slice(3)}`;
}
  
