export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function normalizeHexAddress(input: string): string | null {
  const hexRegex = /^(0x)?[0-9a-fA-F]{64}$/;

  if (hexRegex.test(input)) {
    if (input.startsWith('0x')) {
      return input;
    } else {
      return '0x' + input;
    }
  } else {
    return null;
  }
}

export function numberToAddressHex(num: number): string {
  const hex = num.toString(16);
  const paddedHex = '0x' + hex.padStart(64, '0');
  return paddedHex;
}
