import * as cheerio from 'cheerio'

// https://github.com/cheeriojs/cheerio/issues/866#issuecomment-275699121
let cheerioHtml = cheerio.prototype.html

// eslint-disable-next-line @typescript-eslint/no-explicit-any
cheerio.prototype.html = function html(...args: any[]) {
  let result = cheerioHtml.apply(this, ...args)

  if (typeof result === 'string') {
    result = result.replace(/&#x([0-9a-f]{1,6});/gi, (entity, code) => {
      code = parseInt(code, 16)

      // don't unescape ascii characters, assuming that all ascii characters
      // are encoded for a good reason
      if (code < 0x80) {
        return entity
      }

      return String.fromCodePoint(code)
    })
  }

  return result
}

export { cheerio }
