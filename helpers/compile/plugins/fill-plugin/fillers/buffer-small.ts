import { type Buffer as NodeBuffer } from 'buffer'
import {
  areUint8ArraysEqual,
  base64ToUint8Array,
  compareUint8Arrays,
  hexToUint8Array,
  stringToUint8Array,
  uint8ArrayToBase64,
  uint8ArrayToHex,
  uint8ArrayToString,
} from 'uint8array-extras'

export class Buffer extends Uint8Array implements NodeBuffer {
  readonly _isBuffer = true

  static isBuffer(arg: any): arg is Buffer {
    return arg && arg._isBuffer
  }

  slice(start = 0, end = this.length) {
    return this.subarray(start, end)
  }

  subarray(start = 0, end = this.length) {
    return Object.setPrototypeOf(super.subarray(start, end), Buffer.prototype) as Buffer
  }

  reverse() {
    super.reverse()

    return this
  }

  readBigInt64BE(offset = 0) {
    return new DataView(this.buffer).getBigInt64(offset, false)
  }

  readBigInt64LE(offset = 0) {
    return new DataView(this.buffer).getBigInt64(offset, true)
  }

  readBigUInt64BE(offset = 0) {
    return new DataView(this.buffer).getBigUint64(offset, false)
  }

  readBigUInt64LE(offset = 0) {
    return new DataView(this.buffer).getBigUint64(offset, true)
  }

  readDoubleBE(offset = 0) {
    return new DataView(this.buffer).getFloat64(offset, false)
  }

  readDoubleLE(offset = 0) {
    return new DataView(this.buffer).getFloat64(offset, true)
  }

  readFloatBE(offset = 0) {
    return new DataView(this.buffer).getFloat32(offset, false)
  }

  readFloatLE(offset = 0) {
    return new DataView(this.buffer).getFloat32(offset, true)
  }

  readInt8(offset = 0) {
    return new DataView(this.buffer).getInt8(offset)
  }

  readInt16BE(offset = 0) {
    return new DataView(this.buffer).getInt16(offset, false)
  }

  readInt16LE(offset = 0) {
    return new DataView(this.buffer).getInt16(offset, true)
  }

  readInt32BE(offset = 0) {
    return new DataView(this.buffer).getInt32(offset, false)
  }

  readInt32LE(offset = 0) {
    return new DataView(this.buffer).getInt32(offset, true)
  }

  readUint8(offset = 0) {
    return this.readUInt8(offset)
  }

  readUint16BE(offset = 0) {
    return this.readUInt16BE(offset)
  }

  readUint16LE(offset = 0) {
    return this.readUInt16LE(offset)
  }

  readUint32BE(offset = 0) {
    return this.readUInt32BE(offset)
  }

  readUint32LE(offset = 0) {
    return this.readUInt32LE(offset)
  }

  readUInt8(offset = 0) {
    return new DataView(this.buffer).getUint8(offset)
  }

  readUInt16BE(offset = 0) {
    return new DataView(this.buffer).getUint16(offset, false)
  }

  readUInt16LE(offset = 0) {
    return new DataView(this.buffer).getUint16(offset, true)
  }

  readUInt32BE(offset = 0) {
    return new DataView(this.buffer).getUint32(offset, false)
  }

  readUInt32LE(offset = 0) {
    return new DataView(this.buffer).getUint32(offset, true)
  }

  readBigUint64BE(offset = 0) {
    return this.readBigUInt64BE(offset)
  }

  readBigUint64LE(offset = 0) {
    return this.readBigUInt64LE(offset)
  }

  readIntBE(offset: number, byteLength: number) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let i = byteLength
    let mul = 1
    let val = this[offset + --i]
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul
    }
    mul *= 0x80

    if (val >= mul) val -= Math.pow(2, 8 * byteLength)

    return val
  }

  readIntLE(offset: number, byteLength: number) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let val = this[offset]
    let mul = 1
    let i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }
    mul *= 0x80

    if (val >= mul) val -= Math.pow(2, 8 * byteLength)

    return val
  }

  readUIntBE(offset: number, byteLength: number) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let val = this[offset + --byteLength]
    let mul = 1
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul
    }

    return val
  }

  readUintBE(offset: number, byteLength: number) {
    return this.readUIntBE(offset, byteLength)
  }

  readUIntLE(offset: number, byteLength: number) {
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let val = this[offset]
    let mul = 1
    let i = 0
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul
    }

    return val
  }

  readUintLE(offset: number, byteLength: number) {
    return this.readUIntLE(offset, byteLength)
  }

  writeBigInt64BE(value: bigint, offset = 0) {
    new DataView(this.buffer).setBigInt64(offset, value, false)

    return offset + 8
  }

  writeBigInt64LE(value: bigint, offset = 0) {
    new DataView(this.buffer).setBigInt64(offset, value, true)

    return offset + 8
  }

  writeBigUInt64BE(value: bigint, offset = 0) {
    new DataView(this.buffer).setBigUint64(offset, value, false)

    return offset + 8
  }

  writeBigUInt64LE(value: bigint, offset = 0) {
    new DataView(this.buffer).setBigUint64(offset, value, true)

    return offset + 8
  }

  writeDoubleBE(value, offset = 0) {
    new DataView(this.buffer).setFloat64(offset, value, false)

    return offset + 8
  }

  writeDoubleLE(value, offset = 0) {
    new DataView(this.buffer).setFloat64(offset, value, true)

    return offset + 8
  }

  writeFloatBE(value, offset = 0) {
    new DataView(this.buffer).setFloat32(offset, value, false)

    return offset + 4
  }

  writeFloatLE(value, offset = 0) {
    new DataView(this.buffer).setFloat32(offset, value, true)

    return offset + 4
  }

  writeInt8(value: number, offset = 0) {
    new DataView(this.buffer).setInt8(offset, value)

    return offset + 1
  }

  writeInt16BE(value: number, offset = 0) {
    new DataView(this.buffer).setInt16(offset, value, false)

    return offset + 2
  }

  writeInt16LE(value: number, offset = 0) {
    new DataView(this.buffer).setInt16(offset, value, true)

    return offset + 2
  }

  writeInt32BE(value: number, offset = 0) {
    new DataView(this.buffer).setInt32(offset, value, false)

    return offset + 4
  }

  writeInt32LE(value: number, offset = 0) {
    new DataView(this.buffer).setInt32(offset, value, true)

    return offset + 4
  }

  writeUInt8(value: number, offset = 0) {
    new DataView(this.buffer).setUint8(offset, value)

    return offset + 1
  }

  writeUInt16BE(value: number, offset = 0) {
    new DataView(this.buffer).setUint16(offset, value, false)

    return offset + 2
  }

  writeUInt16LE(value: number, offset = 0) {
    new DataView(this.buffer).setUint16(offset, value, true)

    return offset + 2
  }

  writeUInt32BE(value: number, offset = 0) {
    new DataView(this.buffer).setUint32(offset, value, false)

    return offset + 4
  }

  writeUInt32LE(value: number, offset = 0) {
    new DataView(this.buffer).setUint32(offset, value, true)

    return offset + 4
  }

  writeIntBE(value: number, offset: number, byteLength: number) {
    value = +value
    offset = offset >>> 0

    let i = byteLength - 1
    let mul = 1
    let sub = 0
    this[offset + i] = value & 0xff
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1
      }
      this[offset + i] = (((value / mul) >> 0) - sub) & 0xff
    }

    return offset + byteLength
  }

  writeIntLE(value: number, offset: number, byteLength: number) {
    value = +value
    offset = offset >>> 0

    let i = 0
    let mul = 1
    let sub = 0
    this[offset] = value & 0xff
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1
      }
      this[offset + i] = (((value / mul) >> 0) - sub) & 0xff
    }

    return offset + byteLength
  }

  writeUIntBE(value: number, offset: number, byteLength: number) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let i = byteLength - 1
    let mul = 1
    this[offset + i] = value
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) >>> 0
    }

    return offset + byteLength
  }

  writeUintBE(value: number, offset: number, byteLength: number) {
    return this.writeUIntBE(value, offset, byteLength)
  }

  writeUIntLE(value: number, offset: number, byteLength: number) {
    value = +value
    offset = offset >>> 0
    byteLength = byteLength >>> 0

    let mul = 1
    let i = 0
    this[offset] = value & 0xff
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xff
    }

    return offset + byteLength
  }

  writeUintLE(value: number, offset: number, byteLength: number) {
    return this.writeUIntLE(value, offset, byteLength)
  }

  writeBigUint64BE(value: bigint, offset = 0) {
    return this.writeBigUInt64BE(value, offset)
  }

  writeBigUint64LE(value: bigint, offset = 0) {
    return this.writeBigUInt64LE(value, offset)
  }

  writeUint16BE(value: number, offset = 0) {
    return this.writeUInt16BE(value, offset)
  }

  writeUint16LE(value: number, offset = 0) {
    return this.writeUInt16LE(value, offset)
  }

  writeUint32BE(value: number, offset = 0) {
    return this.writeUInt32BE(value, offset)
  }

  writeUint32LE(value: number, offset = 0) {
    return this.writeUInt32LE(value, offset)
  }

  writeUint8(value: number, offset = 0) {
    return this.writeUInt8(value, offset)
  }

  toJSON() {
    return { type: 'Buffer', data: Array.from(this) } as const
  }

  swap16() {
    const buffer = new DataView(this.buffer)
    const length = this.length
    for (let i = 0; i < length; i += 2) {
      buffer.setUint16(i, buffer.getUint16(i, true), false)
    }
    return this
  }

  swap32() {
    const buffer = new DataView(this.buffer)
    const length = this.length
    for (let i = 0; i < length; i += 4) {
      buffer.setUint32(i, buffer.getUint32(i, true), false)
    }
    return this
  }

  swap64() {
    const buffer = new DataView(this.buffer)
    const length = this.length
    for (let i = 0; i < length; i += 8) {
      buffer.setBigUint64(i, buffer.getBigUint64(i, true), false)
    }
    return this
  }

  compare(target: Uint8Array, start = 0, end = target.length, thisStart = 0, thisEnd = this.length) {
    return compareUint8Arrays(this.slice(thisStart, thisEnd), target.slice(start, end))
  }

  equals(other: Uint8Array) {
    return areUint8ArraysEqual(this, other)
  }

  copy(target: Buffer, targetStart = 0, sourceStart = 0, sourceEnd = this.length) {
    const data = this.slice(sourceStart, sourceEnd)
    target.set(data, targetStart)

    return data.length
  }

  write(string: string, encoding?: Encoding): number
  write(string: string, offset: number, encoding?: Encoding): number
  write(string: string, offset: number, length: number, encoding?: Encoding): number
  write(
    string: string,
    offsetOrEncoding?: number | Encoding,
    lengthOrEncoding?: number | Encoding,
    encoding?: Encoding,
  ) {
    let offset: number | undefined
    let length: number | undefined
    if (typeof offsetOrEncoding === 'string') {
      encoding = offsetOrEncoding
      offset = 0
    } else if (typeof lengthOrEncoding === 'string') {
      encoding = lengthOrEncoding
      offset = offsetOrEncoding!
    } else {
      encoding ??= 'utf8'
      offset = offsetOrEncoding!
      length = lengthOrEncoding!
    }

    if (length === undefined) {
      length = this.length - offset
    }

    if (encoding === 'utf8' || encoding === 'utf-8') {
      return new Buffer(stringToUint8Array(string)).copy(this, offset, 0, length)
    }
    if (encoding === 'base64') {
      return new Buffer(base64ToUint8Array(string)).copy(this, offset, 0, length)
    }
    if (encoding === 'hex') {
      return new Buffer(hexToUint8Array(string)).copy(this, offset, 0, length)
    }
  }

  toString(encoding: Encoding = 'utf8', start = 0, end = this.length) {
    if (encoding === 'utf-8') return uint8ArrayToString(this.slice(start, end))
    if (encoding === 'utf8') return uint8ArrayToString(this.slice(start, end))
    if (encoding === 'hex') return uint8ArrayToHex(this.slice(start, end))
    if (encoding === 'base64') return uint8ArrayToBase64(this.slice(start, end))

    throw new Error(`buffer.toString does not support encoding "${encoding}"`)
  }
}

export type Encoding = 'utf8' | 'utf-8' | 'hex' | 'base64'
