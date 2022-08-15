const BUF_SIGNATURE = new Buffer.from("DLPE", "ascii");

/**
 * @typedef {Buffer} input_buffer
 */
/**
 * Unbundles a Buffer-Bundle
 * ```
 * const myBuffers = unbundleBuffer(myBuffer);
 * console.log(myBuffers[0].content);
 * ```
 * @param {input_buffer} buf
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
 * @typedef {Array} input_array
 */
/**
 * Bundles into a Buffer-Bundle
 * @param {...input_array} input_buffers
 * 
 * @example
 * ```javascript
 * const file1 = { content: Buffer.from("hello"), name: "file1" }
 * const file2 = { content: Buffer.from(fs.readFileSync("file", "binary")), name: "file2" }
 * const buf_bundled: Buffer = bundleBuffers([file1, file2])
 * ```
 */
const bundleBuffers = (input_buffers) => {
  const BUF_VERSION = Buffer.allocUnsafe(1);
  BUF_VERSION.writeUInt8(0);

  const output_buffers = [];

  for (const { name: file_name, content: buf_content } of input_buffers) {
    const buf_file_name = Buffer.from(file_name, "ascii");

    const buf_file_name_length = Buffer.alloc(1);
    buf_file_name_length.writeUInt8(buf_file_name.length, 0);

    const buf_content_length = Buffer.alloc(4);
    buf_content_length.writeUInt32LE(buf_content.length, 0);

    const buf_file_result = Buffer.concat([
      buf_file_name_length,
      buf_file_name,
      buf_content_length,
      buf_content,
    ]);
    output_buffers.push(buf_file_result);
  }

  let files_count = Buffer.alloc(1);
  files_count.writeUInt8(input_buffers.length);

  return Buffer.concat([
    BUF_SIGNATURE,
    BUF_VERSION,
    files_count,
    ...output_buffers,
  ]);
};

const unbundleV1 = (buf) => {
  let offset = 1 + BUF_SIGNATURE.length;

  let files_count = buf.readUInt8(offset);
  offset += 1;

  let files = [];
  while (files_count--) {
    const file_name_length = buf.readUInt8(offset);
    offset += 1;
    const file_name = buf.toString("ascii", offset, offset + file_name_length);
    offset += file_name_length;

    const content_length = buf.readUInt32LE(offset);
    offset += 4;

    const content = buf.subarray(offset, offset + content_length);
    offset += content_length;

    files.push({
      name: file_name,
      content,
    });
  }

  return files;
};

module.exports = {
  bundleBuffers,
  unbundleBuffer,
};

