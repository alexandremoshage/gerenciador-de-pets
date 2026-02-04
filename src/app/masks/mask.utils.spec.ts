import { applyMask, formatCpf, formatPhoneBr, onlyDigits } from './mask.utils';

describe('mask.utils', () => {
  it('onlyDigits should strip non-digits', () => {
    expect(onlyDigits(' (11) 99999-9999 ')).toBe('11999999999');
  });

  it('formatCpf should format progressively and cap at 11 digits', () => {
    expect(formatCpf('5')).toBe('5');
    expect(formatCpf('5299')).toBe('529.9');
    expect(formatCpf('5299822')).toBe('529.982.2');
    expect(formatCpf('52998224725')).toBe('529.982.247-25');
    expect(formatCpf('52998224725000')).toBe('529.982.247-25');
  });

  it('formatPhoneBr should format 10 or 11 digits', () => {
    expect(formatPhoneBr('1')).toBe('(1');
    expect(formatPhoneBr('11')).toBe('(11');
    expect(formatPhoneBr('119')).toBe('(11) 9');
    expect(formatPhoneBr('1199999')).toBe('(11) 9999-9');
    expect(formatPhoneBr('1199999999')).toBe('(11) 9999-9999');
    expect(formatPhoneBr('11999999999')).toBe('(11) 99999-9999');
  });

  it('applyMask should route by type', () => {
    expect(applyMask('52998224725', 'cpf')).toBe('529.982.247-25');
    expect(applyMask('11999999999', 'phone')).toBe('(11) 99999-9999');
  });
});
