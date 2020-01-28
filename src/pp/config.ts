import { cheerio } from './cheerio'
import { ppify } from './utils'

export let ppPrefix = '/proxy/'

export let ppEncodingMode: PpEncodingMode = 'try-unzip'

let tagAttrsArr = [
  ['a', 'href'],
  ['area', 'href'],
  ['base', 'href'],
  ['form', 'action'],
  ['img', 'src'],
  ['frame', 'src'],
  ['iframe', 'src'],
  ['script', 'src'],
  ['link', 'href'],
]

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
      tagAttrsArr.forEach(([tag, ...attrs]) => {
        attrs.forEach(attr => {
          $(tag).each((i, el) => {
            let s = $(el).attr(attr)
            let ns = ppify(s, res._ppCtx)
            $(el).attr(attr, ns)
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
        .attr('id', 'ppPreloadScript')
        .text(
          `{
          let tagAttrsArr = ${JSON.stringify(tagAttrsArr)}
          let ppPrefix = ${JSON.stringify(ppPrefix)}

          let ppPathname = location.pathname // to store against history pushState api
          let ppEntry = \`\${location.origin}\${ppPrefix}\`
          let targetOrigin = location.pathname.replace(ppPrefix, '').replace(/\\/.*/, '')
          if (!/^https?:\\/\\//i.test(targetOrigin)) {
            if (targetOrigin.startsWith('//')) {
              targetOrigin = 'https:' + targetOrigin
            } else {
              targetOrigin = 'https://' + targetOrigin
            }
          }

          let ppify = url => {
            if (/^(https?:)?\\/\\//i.test(url)) {
              if (!url.startsWith(ppEntry)) {
                return \`\${ppEntry}\${url}\`
              }
            } else if (url.startsWith('/')) {
              if (!url.startsWith(ppPathname)) {
                return url.replace(/^\\//, ppPathname)
              }
            }
            return url
          }
          window.__ppify = ppify

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

          {
            ;['appendChild', 'insertBefore'].forEach(k => {
              let _fn = Node.prototype[k]
              Node.prototype[k] = function (newNode, ...rest) {
                tagAttrsArr.some(([tag, ...attrs]) => {
                  if (newNode.tagName === tag.toUpperCase()) {
                    attrs.forEach(attr => {
                      // or setAttribute?
                      newNode[attr] = ppify(newNode[attr])
                    })
                    return true
                  }
                })
                return _fn.call(this, newNode, ...rest)
              }
            })
          }
          
          {
            let _open=XMLHttpRequest.prototype.open
            XMLHttpRequest.prototype.open = function (method, url) {
              url = ppify(url)
              return _open.call(this, method, url)
            }
          }

          {
            // placed at the end
            let s = document.querySelector('#ppPreloadScript')
            s.parentNode.removeChild(s)
          }
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
      let s = res._ppBody
      s = wrapScript(s)
      res._ppBody = s
    },
  },
]
