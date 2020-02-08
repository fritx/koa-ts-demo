import * as libUrl from 'url'

export let safeUrlParse = (url: string, protocol?: UrlProtocol) => {
  // let urlObj = libUrl.parse(url, false, true)
  // urlObj.protocol = urlObj.protocol || protocol
  url = completeUrlFull(url, protocol)
  let urlObj = libUrl.parse(url, true, false)
  return urlObj
}

export let completeUrlFull = (url: string, protocol?: UrlProtocol) => {
  protocol = protocol || 'https:'
  if (/^https?:\/\//i.test(url)) {
    // noop
  } else if (url.startsWith('//')) {
    url = protocol + url
  } else if (url.startsWith('/')) {
    // noop
  } else {
    // url = `${protocol}//` + url
    url = 'https://' + url // prefer https
  }
  return url
}
