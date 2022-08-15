"use strict";
const BUF_SIGNATURE = new Buffer.from("DLPE", "ascii");

/**
 * @typedef {Buffer} inputBuffer
 */
/**
 * Unbundles a Buffer-Bundle
 * ```
 * const buffers = unbundleBuffer(bufferBundle)
 * console.log(buffers["name1"])
 * ```
 * @param {inputBuffer} buf
 */
const unbundleBuffer = (buf) => {
  if (!BUF_SIGNATURE.equals(buf.subarray(0, BUF_SIGNATURE.length))) {
    throw Error("[Bundler] Bundle Signature is missing in the buffer");
  }

  const version = buf.readUInt8(BUF_SIGNATURE.length);

  switch (version) {
    case 0:
      return unbundleV1(buf);
    default:
      throw Error(
        `[Bundler] Bundle Format Version is invalid (got v${version.toString()})`
      );
  }
};

/**
 * @typedef {Object} inputObject
 */
/**
 * Bundles into a Buffer-Bundle
 * ```
 * const file1 = { content: Buffer.from("hello"), name: "file1" }
 * const file2 = { content: Buffer.from(fs.readFileSync("./file")), name: "file2" }
 * const input = { name1: file1, name2: file2 }
 * const bufBundled = bundleBuffers(input)
 * ```
 * @param {inputObject} input
 */
const bundleBuffers = (input) => {
  const BUF_VERSION = Buffer.allocUnsafe(1);
  BUF_VERSION.writeUInt8(0);

  const buffers = [];
  const inputEntries = Object.entries(input)

  for (const [name, bufContent] of inputEntries) {
    const bufName = Buffer.from(name, "ascii");

    const bufNameLength = Buffer.alloc(1);
    bufNameLength.writeUInt8(bufName.length, 0);

    const bufContentLength = Buffer.alloc(4);
    bufContentLength.writeUInt32LE(bufContent.length, 0);

    buffers.push(Buffer.concat([
      bufNameLength,
      bufName,
      bufContentLength,
      bufContent,
    ]));
  }

  const filesCount = Buffer.alloc(1);
  filesCount.writeUInt8(inputEntries.length);

  return Buffer.concat([
    BUF_SIGNATURE,
    BUF_VERSION,
    filesCount,
    ...buffers,
  ]);
};

const unbundleV1 = (buf) => {
  let offset = BUF_SIGNATURE.length + 1;

  let bufferCount = buf.readUInt8(offset);
  offset += 1;

  const buffers = {};
  while (bufferCount--) {
    const nameLength = buf.readUInt8(offset);
    offset += 1;

    const name = buf.toString("ascii", offset, offset + nameLength);
    offset += nameLength;

    const contentLength = buf.readUInt32LE(offset);
    offset += 4;

    const content = buf.subarray(offset, offset + contentLength);
    offset += contentLength;

    buffers[name] = content;
  }

  return buffers;
};

module.exports = {
  bundleBuffers,
  unbundleBuffer,
};

