import * as fs from 'fs'
import * as libPath from 'path'
import { cheerio } from '../../lib/cheerio'
import { ppPrefix } from '../config'
import { ppify } from '../url/ppify'
import { safeInterpolate, tagAttrsArr, wrapScript } from './common'
import template = require('lodash/template')

let distDir = libPath.resolve(__dirname, '../../')
let srcDir = libPath.resolve(distDir, '../src')
let preloadJsFile = libPath.resolve(srcDir, 'pp/replace/html-preload.js')
let preloadJsRaw = fs.readFileSync(preloadJsFile).toString()
let preloadJs = template(preloadJsRaw, {
  interpolate: safeInterpolate,
})({
  data: JSON.stringify({
    tagAttrsArr,
    ppPrefix,
  }),
})

export let rulesReplaceHtml: PpRule[] = [
  {
    match: ctx => {
      let isRedirect =
        [301, 302, 307].includes(ctx.status) && ctx.headers['location']
      let typeLikeHtml = Boolean(ctx.response.is('text/html'))
      let bodyLikeHtml = ctx.body
        .toString()
        .trim()
        .startsWith('<')
      return !isRedirect && typeLikeHtml && bodyLikeHtml
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
        .text(preloadJs)
        .prependTo($('head'))

      html = $.root().html()
      res._ppBody = html
    },
  },
]
