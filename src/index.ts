/**
 * Read some bytes from a stream.
 * 
 * @param stream the stream to read from
 * @param size the length in bytes to read
 */
export function readBytes(stream: NodeJS.ReadableStream, size: number): Promise<Buffer> {
    return new Promise(function (resolve, reject) {
        stream.on('error', reject);
        function checkDone() {
            const buf: Buffer = <any>stream.read(size);
            if (buf) {
                stream.removeListener('error', reject);
                if (buf.length !== size) {
                    return reject(new Error(`Attempted to read ${size} bytes but only ${buf.length} bytes are available`));
                }
                return resolve(buf);
            }
            // Check again once there is more data available
            stream.once('readable', checkDone);
        }
        checkDone();
    });
}

/**
 * Reads a fixed length string from a stream.

 * @param stream the stream to read from
 * @param size the length in bytes of the string
 * @param encoding the encoding of the string, defaults to 'utf8'
 */
export async function readText(stream: NodeJS.ReadableStream, size: number, encoding: string = 'utf8'): Promise<string> {
    const buf = await readBytes(stream, size);
    return buf.toString(encoding);
}

const UUID_STRING_LENGTH = 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx'.length;
const UUID_STRING_PATTERN = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;

export interface ReadTextUuidOpts {
    validator?: RegExp | ((text: string) => boolean);
    size?: number;
    encoding?: string;
}

/**
 * Reads a UUID serialized as text from a stream.
 * 
 * By default, this function assumes the UUID is seralized in it's string form: xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx
 *
 * @param stream the stream to read from
 * @param validator an optional validator to verify that the UUID is properly formatted. Defaults to a matching a dash-separated hex UUID.
 * @param size the size in bytes of the text UUID. Defaults to 36.
 * @param encoding the encoding of the string, defaults to 'utf8'
 */
export async function readTextUuid(stream: NodeJS.ReadableStream,
    { validator = UUID_STRING_PATTERN,
        size = UUID_STRING_LENGTH,
        encoding = 'utf8' }: ReadTextUuidOpts = {}): Promise<string> {
    const text = await readText(stream, size, encoding);
    if (validator) {
        if (validator instanceof RegExp) {
            if (!validator.test(text)) {
                throw new Error('UUID failed validation: ' + text);
            }
        }
        else if (validator instanceof Function) {
            if (!validator(text)) {
                throw new Error('UUID failed validation: ' + text);
            }
        }
        else {
            throw new Error('UUID validator is of invalid type: ' + validator);
        }
    }
    return text;
}

/**
 * Reads a UUID serialized as 16-bytes from a stream.
 * 
 * @param stream the stream to read from
 */
export async function readBinaryUuid(stream: NodeJS.ReadableStream): Promise<string> {
    const buf = await readBytes(stream, 16);
    return [
        buf.slice(0, 4).toString('hex'),
        buf.slice(4, 6).toString('hex'),
        buf.slice(6, 8).toString('hex'),
        buf.slice(8, 10).toString('hex'),
        buf.slice(10, 16).toString('hex'),
    ].join('-');
}

export async function readDoubleBE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 8);
    return buf.readDoubleBE(0);
}

export async function readDoubleLE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 8);
    return buf.readDoubleLE(0);
}

export async function readFloatBE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readFloatBE(0);
}

export async function readFloatLE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readFloatLE(0);
}

export async function readInt8(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 1);
    return buf.readInt8(0);
}

export async function readInt16BE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 2);
    return buf.readInt16BE(0);
}

export async function readInt16LE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 2);
    return buf.readInt16LE(0);
}

export async function readInt32BE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readInt32BE(0);
}

export async function readInt32LE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readInt32LE(0);
}

export async function readIntBE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    const buf = await readBytes(stream, byteLength);
    return buf.readIntBE(0, byteLength);
}

export async function readInt64BE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 8);
    return buf.readIntBE(0, 8);
}

export async function readInt64LE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 8);
    return buf.readIntLE(0, 8);
}

export async function readIntLE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    const buf = await readBytes(stream, byteLength);
    return buf.readIntLE(0, byteLength);
}

export async function readUInt8(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 1);
    return buf.readUInt8(0);
}

export async function readUInt16BE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 2);
    return buf.readUInt16BE(0);
}

export async function readUInt16LE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 2);
    return buf.readUInt16LE(0);
}

export async function readUInt32BE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readUInt32BE(0);
}

export async function readUInt32LE(stream: NodeJS.ReadableStream): Promise<number> {
    const buf = await readBytes(stream, 4);
    return buf.readUInt32LE(0);
}

export async function readUIntBE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    const buf = await readBytes(stream, byteLength);
    return buf.readUIntBE(0, byteLength);
}

export async function readUIntLE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    const buf = await readBytes(stream, byteLength);
    return buf.readUIntLE(0, byteLength);
}
