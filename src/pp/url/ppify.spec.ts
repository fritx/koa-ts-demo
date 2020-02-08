import test from 'ava'
import { safeUrlParse } from '../../lib/url'
import { ppParentPrefix, ppPrefix } from '../config'
import { ppify } from './ppify'

// let originArr = ['http://localhost:3000', 'https://abc.proxy.com']

let testArr = [
  [
    `http://localhost:3000${ppParentPrefix}${ppPrefix}https://ncov.dxy.cn/ncovh5/view/pneumonia`,
    'https://assets.dxycdn.com/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931',
    `http://localhost:3000${ppParentPrefix}${ppPrefix}https://assets.dxycdn.com/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931`,
  ],
  [
    `http://localhost:3000${ppParentPrefix}${ppPrefix}https://ncov.dxy.cn/ncovh5/view/pneumonia`,
    '//assets.dxycdn.com/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931',
    `//localhost:3000${ppParentPrefix}${ppPrefix}https://assets.dxycdn.com/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931`,
  ],
  [
    `http://localhost:3000${ppParentPrefix}${ppPrefix}https://ncov.dxy.cn/ncovh5/view/pneumonia`,
    '/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931',
    `${ppParentPrefix}${ppPrefix}https://assets.dxycdn.com/gitrepo/ncov-mobile/dist/umi.bundle.css?t=1581162032931`,
  ],
]

testArr.forEach(([ppUrl, input, expected]) => {
  let ppUrlObj = safeUrlParse(ppUrl)
  let ppCtxMock = {
    state: { ppUrl, ppUrlObj },
  }
  let actual = ppify(input, ppCtxMock as PpCtx)

  test(`ppify ${input} => ${expected}`, t => {
    t.is(actual, expected)
  })

  test(`ppify ${actual} => ${expected}`, t => {
    let repeated = ppify(actual, ppCtxMock as PpCtx)
    t.is(repeated, expected)
  })
})
