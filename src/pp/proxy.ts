import * as HttpProxy from 'http-proxy'
import { ppRulesConfig, ppEncodingMode } from './config'
import * as zlib from 'zlib'
import { Stream } from 'stream'
import { ppify } from './utils'

export let ppProxy = new HttpProxy({
  selfHandleResponse: true,
  ws: true,
  // secure: false,
  // ignorePath: true,
  // preserveHeaderKeyCase: true,

  // fixing Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match
  // certificate's altnames: Host: localhost. is not in the cert's altnames: DNS: xxx
  changeOrigin: true,

  // todo location rewrite config
  // autoRewrite: true,

  // todo partition
  // seems not work with selfHandleResponse=true
  cookieDomainRewrite: {
    '*': '',
  },
  // cookieDomainRewrite: '',
  cookiePathRewrite: {
    '*': '',
  },
})

ppProxy.on('error', err => {
  console.log('proxy error', err)
})

ppProxy.on('proxyRes', (proxyRes, req, res) => {
  let ppres = res as PpServerResponse
  res.statusCode = proxyRes.statusCode

  Object.keys(proxyRes.headers).forEach(k => {
    let v = proxyRes.headers[k]
    if (k === 'location') v = ppify(v, ppres._ppCtx)
    res.setHeader(k, v)
  })

  let stream: Stream = proxyRes

  if (ppEncodingMode === 'try-unzip') {
    let enc = proxyRes.headers['content-encoding']
    if (['gzip', 'deflate', 'br'].includes(enc)) {
      res.setHeader('content-encoding', '')
      let decompress =
        enc === 'br' ? zlib.createBrotliDecompress() : zlib.createUnzip()
      stream = proxyRes.pipe(decompress)
    }
  }

  let chunks = []
  stream.on('data', chunk => {
    chunks.push(chunk)
  })
  stream.on('end', async () => {
    let body = Buffer.concat(chunks)
    ppres._ppCtx.body = body
    ppres._ppBody = body

    for (let rule of ppRulesConfig) {
      if (await rule.match(ppres._ppCtx)) {
        await rule.transform(req, ppres)
      }
    }

    let newLen = Buffer.byteLength(ppres._ppBody)
    res.setHeader('content-length', newLen)
    res.end(ppres._ppBody)
  })
})
