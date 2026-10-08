export function securePassword(length = 16): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const ceiling = Math.floor(256 / alphabet.length) * alphabet.length;
  let password = '';
  while (password.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (const byte of bytes) {
      if (byte < ceiling) password += alphabet[byte % alphabet.length];
      if (password.length === length) break;
    }
  }
  return password;
}
