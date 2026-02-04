import { isValidCpf, normalizeCpf } from './cpf.validator';

describe('cpf.validator', () => {
  it('should normalize CPF by stripping non-digits', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
  });

  it('should accept a valid CPF', () => {
    expect(isValidCpf('52998224725')).toBe(true);
    expect(isValidCpf('529.982.247-25')).toBe(true);
  });

  it('should reject CPF with wrong length', () => {
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCpf('')).toBe(false);
  });

  it('should reject repeated-digit CPF', () => {
    expect(isValidCpf('00000000000')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
  });

  it('should reject invalid CPF', () => {
    expect(isValidCpf('52998224724')).toBe(false);
    expect(isValidCpf('12345678909')).toBe(true);
  });
});
