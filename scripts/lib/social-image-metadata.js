// Build-only: measure actual local asset bytes; never infer dimensions from names.
import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL } from '../../src/lib/socialImage.js';

export function decodeImageMetadata(bytes) {
  const result = (width, height, type) =>
    Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0
      ? { width, height, type } : null;
  const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length >= 33 && bytes.subarray(0, 8).equals(png) &&
      bytes.readUInt32BE(8) === 13 && bytes.toString('ascii', 12, 16) === 'IHDR') {
    return result(bytes.readUInt32BE(16), bytes.readUInt32BE(20), 'image/png');
  }
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  // JPEG segment lengths include their own two length bytes, not the marker.
  const sof = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset++] !== 0xff) return null;
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) return null;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9 || marker === 0x00) return null;
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) return null;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if (sof.has(marker)) {
      if (length < 8) return null;
      const components = bytes[offset + 7];
      if (!components || length !== 8 + components * 3) return null;
      return result(bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3), 'image/jpeg');
    }
    offset += length;
  }
  return null;
}

export function readSocialImageMetadata(image, { publicDir = path.resolve('public') } = {}) {
  let url, decoded;
  try {
    url = new URL(image, SITE_URL + '/');
    if (url.origin !== SITE_URL || url.username || url.password) return null;
    decoded = decodeURIComponent(url.pathname);
  } catch { return null; }
  if (/[\\\u0000-\u001f\u007f]/u.test(decoded) ||
      decoded.split('/').some(part => part === '..' || part === '.')) {
    throw new Error('Social image path escapes or is unsafe for public directory');
  }
  const root = path.resolve(publicDir);
  const file = path.resolve(root, '.' + decoded);
  if (!file.startsWith(root + path.sep)) return null;
  try {
    const realRoot = fs.realpathSync(root), realFile = fs.realpathSync(file);
    if (!realFile.startsWith(realRoot + path.sep)) {
      throw new Error('Social image symlink escapes public directory');
    }
    if (!fs.statSync(realFile).isFile()) return null;
    return decodeImageMetadata(fs.readFileSync(realFile));
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null;
    throw error;
  }
}
