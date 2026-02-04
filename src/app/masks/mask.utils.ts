export type MaskType = 'cpf' | 'phone';

export function onlyDigits(value?: string | null): string {
  return String(value ?? '').replace(/\D+/g, '');
}

export function formatCpf(value?: string | null): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatPhoneBr(value?: string | null): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (digits.length <= 6) {
    return `(${ddd}) ${rest}`;
  }

  if (digits.length <= 10) {
    const prefix = rest.slice(0, 4);
    const suffix = rest.slice(4, 8);
    return suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`;
  }

  const prefix = rest.slice(0, 5);
  const suffix = rest.slice(5, 9);
  return suffix ? `(${ddd}) ${prefix}-${suffix}` : `(${ddd}) ${prefix}`;
}

export function applyMask(value: string, type: MaskType): string {
  switch (type) {
    case 'cpf':
      return formatCpf(value);
    case 'phone':
      return formatPhoneBr(value);
    default:
      return value;
  }
}

export function caretPositionForDigitIndex(maskedValue: string, digitIndex: number): number {
  if (digitIndex <= 0) return 0;

  let digitsSeen = 0;
  for (let i = 0; i < maskedValue.length; i++) {
    if (/\d/.test(maskedValue[i])) {
      digitsSeen++;
      if (digitsSeen >= digitIndex) return i + 1;
    }
  }
  return maskedValue.length;
}
