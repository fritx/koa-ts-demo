import { rulesReplaceCss } from './replace/css'
import { rulesReplaceHtml } from './replace/html'
import { rulesReplaceJs } from './replace/js'

export let ppRulesConfig: PpRule[] = [
  // todo pre replace
  ...rulesReplaceHtml,
  ...rulesReplaceCss,
  ...rulesReplaceJs,
  // todo post replace
]
