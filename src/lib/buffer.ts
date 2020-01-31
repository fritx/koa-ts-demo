export let bufferStringReplace = (buf: Buffer, strReplace: StrReplace) => {
  let str = buf.toString()
  str = strReplace(str)
  buf = Buffer.from(str)
  return buf
}
