import { crc32 } from './crc.js';
import { compress } from './zlib.js';

const __IHDR__ = new Uint8Array([73, 72, 68, 82]); // 'IHDR'
const __IDAT__ = new Uint8Array([73, 68, 65, 84]); // 'IDAT'
const __IEND__ = new Uint8Array([73, 69, 78, 68]); // 'IEND'
const __IEND_CRC__ = crc32(__IEND__);
const HEAD = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG Signature

const color_types = {
  GREYSCALE: 0,
  TRUECOLOR: 2,
  INDEXED_COLOR: 3,
  GREYSCALE_ALPHA: 4,
  TRUECOLOR_ALPHA: 6
};

const channels_to_color_type = {
  1: color_types.GREYSCALE,
  2: color_types.GREYSCALE_ALPHA,
  3: color_types.TRUECOLOR,
  4: color_types.TRUECOLOR_ALPHA
};

const utf8encoder = new TextEncoder();

export function encode(data, { text, width, height, channels, depth = 8, level = 0 }) {
  const bytesPerLine = width * channels;
  const filteredData = new Uint8Array(height * (1 + bytesPerLine));

  for (let y = 0; y < height; ++y) {
    const srcOffset = y * bytesPerLine;
    const destOffset = y * (1 + bytesPerLine);
    filteredData[destOffset] = 0; // No filter
    filteredData.set(data.subarray(srcOffset, srcOffset + bytesPerLine), destOffset + 1);
  }

  const compressedData = compress(filteredData, level);

  let textChunks = null;
  let totalTextLength = 0;

  if (text) {
    const keys = Object.keys(text);
    const chunks = [];

    for (const key of keys) {
      const value = text[key];
      if (!value) continue;

      const keyBytes = utf8encoder.encode(key);
      const valueBytes = utf8encoder.encode(value);
      const dataLength = keyBytes.length + 1 + valueBytes.length; // Key + null separator + value
      const chunkLength = 8 + dataLength + 4; // Length + Type + Data + CRC

      const chunk = new Uint8Array(chunkLength);
      const view = new DataView(chunk.buffer);

      view.setUint32(0, dataLength);

      // 'tEXt'
      chunk.set([0x74, 0x45, 0x58, 0x74], 4);

      chunk.set(keyBytes, 8);
      chunk[8 + keyBytes.length] = 0; 
      chunk.set(valueBytes, 9 + keyBytes.length);

      const crc = crc32(chunk.subarray(4, 8 + dataLength));
      view.setUint32(8 + dataLength, crc);

      chunks.push(chunk);
      totalTextLength += chunkLength;
    }

    textChunks = new Uint8Array(totalTextLength);
    let offset = 0;
    for (const chunk of chunks) {
      textChunks.set(chunk, offset);
      offset += chunk.length;
    }
  }

  const ihdrLength = 8 + 13 + 4; // Length + Type + Data + CRC
  const idatLength = 8 + compressedData.length + 4;
  const iendLength = 8 + 0 + 4;
  const totalLength = HEAD.length + ihdrLength + idatLength + iendLength + (textChunks ? textChunks.length : 0);

  const png = new Uint8Array(totalLength);
  let offset = 0;

  png.set(HEAD, offset);
  offset += HEAD.length;

  const view = new DataView(png.buffer);

  view.setUint32(offset, 13);
  offset += 4;
  png.set(__IHDR__, offset);
  offset += 4;

  view.setUint32(offset, width);
  offset += 4;
  view.setUint32(offset, height);
  offset += 4;

  png[offset++] = depth; // Bit depth
  png[offset++] = channels_to_color_type[channels]; // Color type
  png[offset++] = 0; // Compression method
  png[offset++] = 0; // Filter method
  png[offset++] = 0; // Interlace method

  const ihdrCrc = crc32(png.subarray(offset - 17, offset));
  view.setUint32(offset, ihdrCrc);
  offset += 4;

  view.setUint32(offset, compressedData.length);
  offset += 4;
  png.set(__IDAT__, offset);
  offset += 4;
  png.set(compressedData, offset);
  offset += compressedData.length;

  const idatCrc = crc32(png.subarray(offset - compressedData.length - 4, offset));
  view.setUint32(offset, idatCrc);
  offset += 4;

  if (textChunks) {
    png.set(textChunks, offset);
    offset += textChunks.length;
  }

  view.setUint32(offset, 0); 
  offset += 4;
  png.set(__IEND__, offset);
  offset += 4;
  view.setUint32(offset, __IEND_CRC__);
  offset += 4;

  return png;
}