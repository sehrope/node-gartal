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
export function readText(stream: NodeJS.ReadableStream, size: number, encoding: string = 'utf8'): Promise<string> {
    return readBytes(stream, size).then(function (buf) {
        return buf.toString(encoding);
    });
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
export function readTextUuid(stream: NodeJS.ReadableStream,
    { validator = UUID_STRING_PATTERN,
        size = UUID_STRING_LENGTH,
        encoding = 'utf8' }: ReadTextUuidOpts = {}): Promise<string> {
    return readText(stream, size, encoding).then(function (text) {
        if (validator) {
            if (validator instanceof RegExp) {
                if (!validator.test(text)) {
                    throw new Error('UUID failed validation: ' + text);
                }
            } else if (validator instanceof Function) {
                if (!validator(text)) {
                    throw new Error('UUID failed validation: ' + text);
                }
            } else {
                throw new Error('UUID validator is of invalid type: ' + validator);
            }
        }
        return text;
    });
}

/**
 * Reads a UUID serialized as 16-bytes from a stream.
 * 
 * @param stream the stream to read from
 */
export function readBinaryUuid(stream: NodeJS.ReadableStream): Promise<string> {
    return readBytes(stream, 16).then(function (buf) {
        return [
            buf.slice(0, 4).toString('hex'),
            buf.slice(4, 6).toString('hex'),
            buf.slice(6, 8).toString('hex'),
            buf.slice(8, 10).toString('hex'),
            buf.slice(10, 16).toString('hex'),
        ].join('-');
    });
}

export function readDoubleBE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 8).then(function (buf) {
        return buf.readDoubleBE(0);
    });
}

export function readDoubleLE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 8).then(function (buf) {
        return buf.readDoubleLE(0);
    });
}

export function readFloatBE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readFloatBE(0);
    });
}

export function readFloatLE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readFloatLE(0);
    });
}

export function readInt8(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 1).then(function (buf) {
        return buf.readInt8(0);
    });
}

export function readInt16BE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 2).then(function (buf) {
        return buf.readInt16BE(0);
    });
}

export function readInt16LE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 2).then(function (buf) {
        return buf.readInt16LE(0);
    });
}

export function readInt32BE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readInt32BE(0);
    });
}

export function readInt32LE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readInt32LE(0);
    });
}

export function readIntBE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    return readBytes(stream, byteLength).then(function (buf) {
        return buf.readIntBE(0, byteLength);
    });
}

export function readInt64BE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 8).then(function (buf) {
        return buf.readIntBE(0, 8);
    });
}

export function readInt64LE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 8).then(function (buf) {
        return buf.readIntLE(0, 8);
    });
}

export function readIntLE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    return readBytes(stream, byteLength).then(function (buf) {
        return buf.readIntLE(0, byteLength);
    });
}

export function readUInt8(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 1).then(function (buf) {
        return buf.readUInt8(0);
    });
}

export function readUInt16BE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 2).then(function (buf) {
        return buf.readUInt16BE(0);
    });
}

export function readUInt16LE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 2).then(function (buf) {
        return buf.readUInt16LE(0);
    });
}

export function readUInt32BE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readUInt32BE(0);
    });
}

export function readUInt32LE(stream: NodeJS.ReadableStream): Promise<number> {
    return readBytes(stream, 4).then(function (buf) {
        return buf.readUInt32LE(0);
    });
}

export function readUIntBE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    return readBytes(stream, byteLength).then(function (buf) {
        return buf.readUIntBE(0, byteLength);
    });
}

export function readUIntLE(stream: NodeJS.ReadableStream, byteLength: number): Promise<number> {
    return readBytes(stream, byteLength).then(function (buf) {
        return buf.readUIntLE(0, byteLength);
    });
}
