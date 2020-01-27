import * as cheerio from 'cheerio'
import { ppify } from './utils'

export let ppPrefix = '/proxy/'

export let ppEncodingMode: PpEncodingMode = 'try-unzip'

let wrapScript = (str: string) => {
  return `
    with (__fakedWindow) {
      ${str}
    }
  `
}

export let ppRulesConfig: PpRule[] = [
  {
    match: ctx => {
      return Boolean(ctx.response.is('text/html'))
    },
    transform: (req, res) => {
      let html = res._ppBody.toString()
      let $ = cheerio.load(html)

        // todo all atrrs of all tags??
      ;[
        ['a', 'href'],
        ['base', 'href'],
        ['img', 'src'],
        ['frame', 'src'],
        ['iframe', 'src'],
        ['script', 'src'],
        ['link', 'href'],
      ].forEach(([tagName, ...attrs]) => {
        attrs.forEach(attr => {
          $(tagName).each((i, el) => {
            let s = $(el).attr(attr)
            s = ppify(s, res._ppCtx)
            $(el).attr(attr, s)
          })
        })
      })

      // cheerio script looks like
      // can only be read as html() and writen as txt()
      $('script').each((i, el) => {
        if (
          !$(el).attr('src') &&
          $(el)
            .html()
            .trim()
        ) {
          let s = $(el).html()
          s = wrapScript(s)
          $(el).text(s)
        }
      })

      $('<script>')
        .text(
          `{
          let ppPrefix = ${JSON.stringify(ppPrefix)}
          let ppEntry = \`\${location.origin}\${ppPrefix}\`
          let ppify = url => {
            if (/^(https?:)?\\/\\//i.test(url)) {
              if (!url.startsWith(ppEntry)) {
                return \`\${ppEntry}\${url}\`
              }
            }
            return url
          }

          // todo wrap & bind
          // ;['setTimeout', 'setInterval'].forEach(k => {
          //   let origFn = window[\`__original_\${k}\`] = window[k]
          //   window[k] = function (str, ms) {
          //     if (typeof str === 'string') {
          //       str = \`with (__fakedWindow) { \${str} }\`
          //     }
          //     return origFn.call(this, str, ms)
          //   }
          // })

          window.__fakedLocation = new Proxy(location, {
            get: (t, k) => {
              return t[k]
            },
            set: (t, k, v) => {
              if (k === 'href') {
                location.href = ppify(v)
                return
              }
              t[k] = v
            }
          })
          window.__fakedWindow = new Proxy(window, {
            get: (t, k) => {
              if (k === 'location') return __fakedLocation
              let v = t[k]
              if (k === 'open') {
                v = (url, target, features) => {
                  url = ppify(url)
                  console.log(['url', url])
                  return window.open(url, target, features)
                }
              } else if (typeof v === 'function') {
                if (v.toString().includes('{ [native code] }')) {
                  v = v.bind(window)
                }
              }
              return v
            },
            set: (t, k, v) => {
              if (k === 'location') {
                location.href = ppify(v)
                return
              }
              t[k] = v
            }
          })
          window.__originalWindow = window
          }`
        )
        .prependTo($('head'))

      html = $.root().html()
      res._ppBody = html
    },
  },
  {
    match: ctx => {
      return Boolean(ctx.response.is('text/css'))
    },
    transform: (req, res) => {
      res._ppBody = res._ppBody
    },
  },
  {
    match: ctx => {
      return Boolean(ctx.response.is('application/javascript'))
    },
    transform: (req, res) => {
      res._ppBody = res._ppBody
    },
  },
]
