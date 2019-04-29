const gartal = require('../lib');
const assert = require('assert');
const streamBuffers = require('stream-buffers');

function createStream(buf) {
    const stream = new streamBuffers.ReadableStreamBuffer();
    stream.put(buf);
    stream.stop();
    return stream;
}

const MAX_FORTY_EIGHT_BIT_UINT = Math.pow(2, 48) - 1;

function createIntLE(val, size) {
    if (Math.abs(val) > MAX_FORTY_EIGHT_BIT_UINT) {
        throw new Error('Value out of range: ' + val);
    } else if (size < 1 || size > 6) {
        throw new Error('Invalid size: ' + size);
    }
    const buf = new Buffer(size);
    buf.writeIntLE(val, 0, size);
    return buf;
}

function createIntBE(val, size) {
    if (Math.abs(val) > MAX_FORTY_EIGHT_BIT_UINT) {
        throw new Error('Value out of range: ' + val);
    } else if (size < 1 || size > 6) {
        throw new Error('Invalid size: ' + size);
    }
    const buf = new Buffer(size);
    buf.writeIntBE(val, 0, size);
    return buf;
}

function createUInt64BE(val) {
    const buf = Buffer.alloc(8);
    buf[0] = 0;
    buf[1] = 0;
    buf.writeUIntBE(val, 2, 6);
    return buf;
}

function createUInt64LE(val) {
    const buf = Buffer.alloc(8);
    buf.writeUIntLE(val, 0, 6);
    buf[6] = 0;
    buf[7] = 0;
    return buf;
}

function createInt8(val) {
    const buf = new Buffer(1);
    buf.writeInt8(val, 0);
    return buf;
}

function createUInt8(val) {
    const buf = new Buffer(1);
    buf.writeUInt8(val, 0);
    return buf;
}

function createDoubleBE(val) {
    const buf = new Buffer(8);
    buf.writeDoubleBE(val, 0);
    return buf;
}

function createDoubleLE(val) {
    const buf = new Buffer(8);
    buf.writeDoubleLE(val, 0);
    return buf;
}

function createFloatBE(val) {
    const buf = new Buffer(4);
    buf.writeFloatBE(val, 0);
    return buf;
}

function createFloatLE(val) {
    const buf = new Buffer(4);
    buf.writeFloatLE(val, 0);
    return buf;
}

const ONE_TRILLION = 1000 * 1000 * 1000 * 1000;
const ONE_MILLION = 1000 * 1000;
const UINT64BE_ONE_TRILLION = createUInt64BE(ONE_TRILLION);
const UINT64LE_ONE_TRILLION = createUInt64LE(ONE_TRILLION);
const UINT64BE_MAX_FORTY_EIGHT_BITS = createUInt64BE(MAX_FORTY_EIGHT_BIT_UINT);
const UINT64LE_MAX_FORTY_EIGHT_BITS = createUInt64LE(MAX_FORTY_EIGHT_BIT_UINT);
const INT32BE_ONE_MILLION = createIntBE(ONE_MILLION, 4);
const INT32LE_ONE_MILLION = createIntLE(ONE_MILLION, 4);
const INT16BE_12345 = createIntBE(12345, 2);
const INT16LE_12345 = createIntLE(12345, 2);
const INT8_N123 = createInt8(-123);
const UINT8_250 = createUInt8(250);

const SAMPLE_DOUBLE = 12345.6789
const SAMPLE_DOUBLE_BE = createDoubleBE(SAMPLE_DOUBLE);
const SAMPLE_DOUBLE_LE = createDoubleLE(SAMPLE_DOUBLE);

const SAMPLE_FLOAT = 12345.6789
const SAMPLE_FLOAT_BE = createFloatBE(SAMPLE_DOUBLE);
const SAMPLE_FLOAT_LE = createFloatLE(SAMPLE_DOUBLE);

const TESTING_123 = 'TESTING 1 2 3';
const TESTING_123_BYTES = new Buffer(TESTING_123);
const UUID = '4bfabc01-d385-46fe-b010-8eb17cf657e7';
const UUID_AS_TEXT_BYTES = new Buffer(UUID);

describe('gartal.readBytes', function () {
    it('should read bytes', async function () {
        const stream = createStream(TESTING_123_BYTES);
        const actual = await gartal.readBytes(stream, TESTING_123_BYTES.length);
        actual.should.be.instanceof(Buffer);
        actual.should.eql(TESTING_123_BYTES);
    });

    it('should read partial bytes', async function () {
        const stream = createStream(TESTING_123_BYTES);
        const actual = await gartal.readBytes(stream, 4);
        actual.should.be.instanceof(Buffer);
        actual.should.eql(TESTING_123_BYTES.slice(0, 4));
    });

    it('should throw an error if insufficent bytes are available', async function () {
        const stream = createStream(TESTING_123_BYTES);
        try {
            const actual = await gartal.readBytes(stream, 1000);
            assert(false);
        } catch (e) {
        }
    });
});

describe('gartal.readText', function () {
    it('should read fixed length strings', async function () {
        const stream = createStream(TESTING_123_BYTES);
        const actual = await gartal.readText(stream, 7);
        actual.should.be.instanceof(String);
        actual.should.eql('TESTING');
    });
});

describe('gartal.readTextUuid', function () {
    it('should read text UUIDs', async function () {
        const notUuidText = 'this is a test of some text that is clearly not a UUID';
        const stream = createStream(new Buffer(notUuidText));
        try {
            const actual = await gartal.readTextUuid(stream);
            assert(false);
        } catch (e) {
        }
    });

    it('should throw an error when reading invalid text UUIDs', async function () {
        const stream = createStream(UUID_AS_TEXT_BYTES);
        const actual = await gartal.readTextUuid(stream);
        actual.should.be.instanceof(String);
        actual.should.eql(UUID);
    });
});

describe('gartal.readBinaryUuid', function () {
    it('should read binary UUIDs', async function () {
        const uuidAsBytes = new Buffer(UUID.replace(/\-/g, ''), 'hex');
        assert(uuidAsBytes.length === 16);
        const stream = createStream(uuidAsBytes);
        const actual = await gartal.readBinaryUuid(stream);
        actual.should.eql(UUID);
    });
});

describe('gartal', function () {
    it('should read big endian doubles', async function () {
        const stream = createStream(SAMPLE_DOUBLE_BE);
        const actual = await gartal.readDoubleBE(stream);
        actual.should.equal(SAMPLE_DOUBLE);
    });

    it('should read little endian doubles', async function () {
        const stream = createStream(SAMPLE_DOUBLE_LE);
        const actual = await gartal.readDoubleLE(stream);
        actual.should.equal(SAMPLE_DOUBLE);
    });

    it('should read big endian floats', async function () {
        const stream = createStream(SAMPLE_FLOAT_BE);
        const actual = await gartal.readFloatBE(stream);
        const epsilon = .001;
        assert(Math.abs(actual - SAMPLE_FLOAT) < epsilon);
    });

    it('should read little endian floats', async function () {
        const stream = createStream(SAMPLE_FLOAT_LE);
        const actual = await gartal.readFloatLE(stream);
        const epsilon = .001;
        assert(Math.abs(actual - SAMPLE_FLOAT) < epsilon);
    });

    it('should read unsigned 64-bit big endian integers', async function () {
        const stream = createStream(UINT64BE_ONE_TRILLION);
        const actual = await gartal.readUInt64BE(stream);
        actual.should.equal(ONE_TRILLION);
    });

    it('should read unsigned 64-bit little endian integers', async function () {
        const stream = createStream(UINT64LE_ONE_TRILLION);
        const actual = await gartal.readUInt64LE(stream);
        actual.should.equal(ONE_TRILLION);
    });

    it('should read really big 64-bit big endian integers', async function () {
        const stream = createStream(UINT64BE_MAX_FORTY_EIGHT_BITS);
        const actual = await gartal.readUInt64BE(stream);
        actual.should.equal(MAX_FORTY_EIGHT_BIT_UINT);
    });

    it('should read unsigned 64-bit little endian integers', async function () {
        const stream = createStream(UINT64LE_MAX_FORTY_EIGHT_BITS);
        const actual = await gartal.readUInt64LE(stream);
        actual.should.equal(MAX_FORTY_EIGHT_BIT_UINT);
    });

    it('should read 32-bit big endian integers', async function () {
        const stream = createStream(INT32BE_ONE_MILLION);
        const actual = await gartal.readInt32BE(stream);
        actual.should.equal(ONE_MILLION);
    });

    it('should read 32-bit little endian integers', async function () {
        const stream = createStream(INT32LE_ONE_MILLION);
        const actual = await gartal.readInt32LE(stream);
        actual.should.equal(ONE_MILLION);
    });

    it('should read 16-bit big endian integers', async function () {
        const stream = createStream(INT16BE_12345);
        const actual = await gartal.readInt16BE(stream);
        actual.should.equal(12345);
    });

    it('should read 16-bit little endian integers', async function () {
        const stream = createStream(INT16LE_12345);
        const actual = await gartal.readInt16LE(stream);
        actual.should.equal(12345);
    });

    it('should read 8-bit signed integers', async function () {
        const stream = createStream(INT8_N123);
        const actual = await gartal.readInt8(stream);
        actual.should.equal(-123);
    });

    it('should read 8-bit unsigned integers', async function () {
        const stream = createStream(UINT8_250);
        const actual = await gartal.readUInt8(stream);
        actual.should.equal(250);
    });

    it('should read only the bytes we asked for', async function () {
        const data = new Buffer(100);
        for (let i = 0; i < data.length; i++) {
            data[i] = i;
        }
        const stream = createStream(data);
        for (let i = 0; i < data.length; i++) {
            const val = await gartal.readUInt8(stream);
            val.should.eql(data[i]);
        }
    });
});
