import { crc32 } from './crc.js';
import { clength, compress_into } from './zlib.js';

const __IHDR__ = new Uint8Array([73, 72, 68, 82]);
const __IDAT__ = new Uint8Array([73, 68, 65, 84]);
const __IEND__ = new Uint8Array([73, 69, 78, 68]);
const __IEND_CRC__ = crc32(__IEND__);
const HEAD = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const color_types = [0, 4, 2, 6];

function encode(data, { width, height, channels, depth = 8 }) {
    const compressed_size = clength(height + data.length);
    const array_length = 49 + 3501 + HEAD.length + compressed_size;
    const array = new Uint8Array(array_length);
    let offset = 0;

    array.set(HEAD, offset); offset += HEAD.length;
    array.set(__IHDR__, 12);

    array[24] = depth;
    array[25] = color_types[channels - 1];

    array.set(__IDAT__, 37);

    const view = new DataView(array.buffer);
    view.setUint32(8, 13);
    view.setUint32(16, width);
    view.setUint32(20, height);
    view.setUint32(29, crc32(array.subarray(12, 29)));
    view.setUint32(33, compressed_size);

    const row_length = width * channels;
    let tmp_offset = 3550;

    for (let i = 0; i < height; ++i) {
        array[tmp_offset++] = 0;  // Filter byte
        array.set(data.subarray(i * row_length, (i + 1) * row_length), tmp_offset);
        tmp_offset += row_length;
    }

    compress_into(array.subarray(3550, tmp_offset), array.subarray(41, 41 + compressed_size));
    view.setUint32(41 + compressed_size, crc32(array.subarray(37, 41 + compressed_size))); 

    view.setUint32(45 + compressed_size, 0);
    array.set(__IEND__, 49 + compressed_size);
    view.setUint32(53 + compressed_size, __IEND_CRC__);

    return array.subarray(0, array_length - 3501);
}

export { encode };
