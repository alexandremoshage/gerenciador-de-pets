export function normalizeCpf(value?: string | null): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function isValidCpf(value?: string | null): boolean {
  const cpf = normalizeCpf(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(cpf[i]) * (10 - i);
  }
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(cpf[i]) * (11 - i);
  }
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;

  return check2 === Number(cpf[10]);
}
