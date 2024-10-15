/**
 * Options for the encode function.
 */
export interface Options {
    /**
     * The width of the image in pixels.
     */
    width: number;

    /**
     * The height of the image in pixels.
     */
    height: number;

    /**
     * The number of color channels in the image.
     * 
     * - `1`: Greyscale
     * - `2`: Greyscale with Alpha
     * - `3`: Truecolor
     * - `4`: Truecolor with Alpha
     */
    channels: 1 | 2 | 3 | 4;

    /**
     * The bit depth per channel. Defaults to `8`.
     */
    depth?: 8;

    /**
    * Compression level: `0`, `3`, `6`, or `9`. Defaults to `6`.
    */
    level?: 0 | 3 | 6 | 9;
}

/**
 * Encodes raw pixel data into a PNG image.
 *
 * @param data - A `Uint8Array` containing the raw pixel data.
 * @param options - An object containing encoding options.
 * @returns A `Uint8Array` representing the encoded PNG image.
 *
 * @throws Will throw an error if the provided options are invalid.
 */
export declare function encode(
    data: Uint8Array,
    options: Options
): Uint8Array;