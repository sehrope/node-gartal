# gartal

[![NPM](https://nodei.co/npm/gartal.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gartal/)

[![Build Status](https://travis-ci.org/sehrope/node-gartal.svg?branch=master)](https://travis-ci.org/sehrope/node-gartal)

# Overview
Read bytes, numbers and text from streams as Promises.

Combined with async/await, this makes it very easy to interact with binary protocols.

* [Install](#install)
* [Usage](#usage)
* [Features](#features)
* [Building and Testing](#building-and-testing)
* [License](#license)

# Install

    $ npm install gartal --save

# Usage

    // Load the module
    const gartal = require('gartal');

    // Read 10 bytes
    const buf = await gartal.readBytes(stream, 10);

    // Read a 32-bit big endian integer
    const num = await gartal.readInt32BE(stream);

    // Read a fixed length string
    const text = await gartal.readText(stream, 8);

    // Read a UUID serialized as a 36-byte hex string with dashes
    const uuid = await gartal.readTextUuid(stream);

    // Read a UUID serialized as 16-bytes
    const uuid = await gartal.readBinaryUuid(stream);

# Dependencies

None!

# Features
* Natively promisified for easy async/await integration
* Supports reading arbitrarily sized byte buffers
* Supports reading fixed length text strings
* Supports reading numeric types (integers, doubles, etc)

# Building and Testing
To build the module run:

    $ make

Then, to run the tests run:

    $ make test

# License
ISC. See the file [LICENSE](LICENSE).
