import { promises as fs } from 'fs'
import { Middleware } from 'koa'
import * as libPath from 'path'
import { resolve as urlResolve, UrlWithParsedQuery } from 'url'
import { safeUrlParse } from '../lib/url'
import { ppEncodingMode, ppFullPrefix, ppParentPrefix, ppPrefix } from './config'
import { ppProxy } from './proxy'
import { safeInterpolate } from './replace/common'
import { targetifyFit, targetifyFull } from './url/targetify'
import cloneDeep = require('lodash/cloneDeep')
import template = require('lodash/template')

let handleProxy: Middleware = async ctx => {
  {
    let { request } = ctx
    let str = ctx.headers['x-forwarded-for-href'] || ctx.href
    if (Array.isArray(str)) str = str.join(' ')
    let arr = str && str.split(/\s+/)
    let ppUrl = arr[arr.length - 1]
    console.log('ppUrl', ppUrl)

    let ppUrlObj = safeUrlParse(ppUrl)
    ctx.state.ppHeaders = cloneDeep(ctx.headers)
    ctx.state.ppUrl = ppUrl
    ctx.state.ppUrlObj = ppUrlObj

    delete request.headers['x-forwarded-for']
    delete request.headers['x-forwarded-for-href']
  }

  let targetUrl = ''
  let targetUrlObj: UrlWithParsedQuery
  {
    let { url, protocol } = ctx

    if (['/favicon.ico'].includes(url)) {
      // todo favicon
      ctx.status = 404
      return
    }

    if (!url.startsWith(ppPrefix)) {
      let referer = ctx.headers['referer'] || ctx.headers['referrer']
      if (referer) {
        let refererTargetUrl = targetifyFull(referer)
        let newTargetUrl = urlResolve(refererTargetUrl, url)
        let newUrl = `${ppPrefix}${newTargetUrl}`
        console.log('no prefix & no referer redirect', newUrl)
        ctx.redirect(newUrl)
      } else {
        console.log('no prefix & no referer 400', ctx.headers)
        ctx.status = 400
      }
      return
    }

    // let targetUrlEnc = url.substr(ppPrefix.length)
    // targetUrl = decodeURIComponent(targetUrlEnc)
    targetUrl = url.substr(ppPrefix.length)

    // https:/github.githubassets.com/assets/frameworks-1c3d89d5.js.map
    if (/^https?:\/[^/]/i.test(targetUrl)) {
      targetUrl = targetUrl.replace(/:\//, '://')
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      let prefix = ''
      if (targetUrl.startsWith('//')) {
        prefix = `${protocol}:`
      } else {
        prefix = 'https://'
      }
      targetUrl = `${prefix}${targetUrl}`
    }

    targetUrlObj = safeUrlParse(targetUrl)

    if (process.env.ALLOW_PROXY_LOCAL !== 'true') {
      if (!targetUrlObj.hostname || /^(localhost|::1|127\.[\d\.]+)$/i.test(targetUrlObj.hostname)) {
        throw new Error('not allowed to proxy local')
      }
    }
  }

  {
    let { req, res, request } = ctx
    let { protocol, host, path } = targetUrlObj
    let validOrigin = protocol && host
    if (!validOrigin) return

    let targetOrigin = `${protocol}//${host}`
    let targetUrlPath = path

    ctx.state.targetOrigin = targetOrigin
    ctx.state.targetUrl = targetUrl
    ctx.state.targetUrlObj = targetUrlObj

    // could lead to like `https://vendor/blog.css`
    // due to probably chrome's bug
    if (!targetUrlPath) {
      // let newUrl = ctx.href.replace(/([?&#])|$/, '/$1')
      let newUrl = ctx.path.replace(/([?&#])|$/, '/$1')
      if (ppParentPrefix) newUrl = `${ppParentPrefix}${newUrl}` // too hard
      ctx.redirect(newUrl)
      return
    }
    ctx.respond = false

    if (ppEncodingMode === 'disable-accept') {
      request.headers['accept-encoding'] = ''
    }

    request.url = targetUrlPath

    let ppres = res as PpServerResponse
    ppres._ppCtx = ctx as PpCtx
    ;['host', 'origin', 'referer', 'referrer'].forEach(k => {
      let _value = request.headers[k]
      if (_value) {
        // let urlProtocol = `${ctx.protocol}:` as UrlProtocol // completes with `:`
        // let targetValue = targetifyFull(_value, urlProtocol)
        let targetValue = targetifyFit(_value, targetUrl)
        request.headers[k] = targetValue
      }
    })

    // todo baidu login
    // http://passport.bdimg.com/passApi/js/loginv4_1b4b6b2.js
    if (targetUrl.includes('/loginv4')) {
      debugger
    }

    ppProxy.web(req, res, {
      target: targetOrigin,
    })
  }
}

export let ppRoutes: Middleware = async (ctx, next) => {
  if (ctx.url.startsWith(ppPrefix)) {
    await handleProxy(ctx, next)
    return
  }
  // ctx.status = 200
  // ctx.body = 'hello proxy'
  let distDir = libPath.resolve(__dirname, '../')
  let srcDir = libPath.resolve(distDir, '../src')
  const homeHtmlFile = libPath.resolve(srcDir, 'home/index.html')
  const homeHtmlRaw = (await fs.readFile(homeHtmlFile)).toString()
  ctx.status = 200
  ctx.type = 'text/html'
  ctx.body = template(homeHtmlRaw, {
    interpolate: safeInterpolate,
  })({
    data: JSON.stringify({
      ppFullPrefix,
    }),
  })
}
