import { rulesReplaceCss } from './replace/css'
import { rulesReplaceHtml } from './replace/html'
import { rulesReplaceJs } from './replace/js'

export let ppPrefix = '/proxy/'

// sometimes Error: unexpected end of file
// at Zlib.zlibOnError [as onerror] (zlib.js:170:17)
// export let ppEncodingMode: PpEncodingMode = 'try-unzip'
export let ppEncodingMode: PpEncodingMode = 'disable-accept'

export let ppRulesConfig: PpRule[] = [
  ...rulesReplaceHtml,
  ...rulesReplaceCss,
  ...rulesReplaceJs,
]
