const gartal = require('../lib');
const assert = require('assert');
const streamBuffers = require('stream-buffers');

function createStream(buf) {
    const stream = new streamBuffers.ReadableStreamBuffer();
    stream.put(buf);
    stream.stop();
    return stream;
}

function createIntLE(val, size) {
    const buf = new Buffer(size);
    buf.writeIntLE(val, 0, size);
    return buf;
}

function createIntBE(val, size) {
    const buf = new Buffer(size);
    buf.writeIntBE(val, 0, size);
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
const NEGATIVE_ONE_TRILLION = -1 * 1000 * 1000 * 1000 * 1000;
const ONE_MILLION = 1000 * 1000;
const INT64BE_ONE_TRILLION = createIntBE(ONE_TRILLION, 8);
const INT64LE_ONE_TRILLION = createIntLE(ONE_TRILLION, 8);
const INT64BE_NEGATIVE_ONE_TRILLION = createIntBE(NEGATIVE_ONE_TRILLION, 8);
const INT64LE_NEGATIVE_ONE_TRILLION = createIntLE(NEGATIVE_ONE_TRILLION, 8);
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

    it('should read 64-bit big endian integers', async function () {
        const stream = createStream(INT64BE_ONE_TRILLION);
        const actual = await gartal.readInt64BE(stream);
        actual.should.equal(ONE_TRILLION);
    });

    it('should read 64-bit little endian integers', async function () {
        const stream = createStream(INT64LE_ONE_TRILLION);
        const actual = await gartal.readInt64LE(stream);
        actual.should.equal(ONE_TRILLION);
    });

    it('should read 64-bit big endian negative integers', async function () {
        const stream = createStream(INT64BE_NEGATIVE_ONE_TRILLION);
        const actual = await gartal.readInt64BE(stream);
        actual.should.equal(NEGATIVE_ONE_TRILLION);
    });

    it('should read 64-bit little endian negative integers', async function () {
        const stream = createStream(INT64LE_NEGATIVE_ONE_TRILLION);
        const actual = await gartal.readInt64LE(stream);
        actual.should.equal(NEGATIVE_ONE_TRILLION);
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
