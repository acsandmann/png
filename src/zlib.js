const SIZE = 65530;
const HEAD = new Uint8Array([120, 1]);

function clength(size) {
    const n = (size / SIZE) | 0; // Bitwise OR instead of Math.floor for faster integer division
    return 2 + 4 + size + 5 * (n + ((size % SIZE) !== 0 ? 1 : 0));
}

function blength(buffer) {
    const n = (buffer.length / SIZE) | 0;
    return 2 + 4 + buffer.length + 5 * (n + ((buffer.length % SIZE) !== 0 ? 1 : 0));
}

function compress_into(buffer, target) {
    const length = blength(buffer);

    let pos = 0;
    let offset = 2;
    let s1 = 1;
    let s2 = 0;
    const MOD_ADLER = 65521;
    const bufferLength = buffer.length;
    const fullChunks = (bufferLength / SIZE) | 0;
    const hasPartial = (bufferLength % SIZE) !== 0;

    target[0] = HEAD[0];
    target[1] = HEAD[1];

    for (var i = 0; i < fullChunks; +i) {
        // BFINAL=0 (not last block), BTYPE=00 (no compression)
        target[offset++] = 0;

        target[offset++] = SIZE & 0xFF;
        target[offset++] = (SIZE >> 8) & 0xFF;

        target[offset++] = (0xFF - (SIZE & 0xFF));
        target[offset++] = (0xFF - ((SIZE >> 8) & 0xFF));

        let end = pos + SIZE;
        for (var j = pos; j < end; ++j) {
            s1 += buffer[j];
            s2 += s1;
        }
        s1 %= MOD_ADLER;
        s2 %= MOD_ADLER;

        target.set(buffer.subarray(pos, end), offset);
        offset += SIZE;
        pos += SIZE;
    }

    if (hasPartial) {
        const chunk_length = bufferLength - pos;

        // BFINAL=1 (last block), BTYPE=00 (no compression)
        target[offset++] = 1;

        target[offset++] = chunk_length & 0xFF;
        target[offset++] = (chunk_length >> 8) & 0xFF;

        target[offset++] = (0xFF - (chunk_length & 0xFF));
        target[offset++] = (0xFF - ((chunk_length >> 8) & 0xFF));

        let end = pos + chunk_length;
        for (let j = pos; j < end; ++j) {
            s1 += buffer[j];
            s2 += s1;
        }
        s1 %= MOD_ADLER;
        s2 %= MOD_ADLER;

        target.set(buffer.subarray(pos, end), offset);
        offset += chunk_length;
        pos += chunk_length;
    }

    target[offset++] = (s2 >> 8) & 0xFF;
    target[offset++] = s2 & 0xFF;
    target[offset++] = (s1 >> 8) & 0xFF;
    target[offset++] = s1 & 0xFF;

    return target;
}

export { compress_into, clength }