import { deppify } from './utils'
import test from 'ava'

let prefixes = [
  '',
  'localhost:3000',
  'http://localhost:3000',
  'https://localhost:3000',
]

prefixes.forEach(prefix => {
  test(`${prefix}/proxy/https://...`, t => {
    let actual = deppify(`${prefix}/proxy/https://baidu.com/a1/a2?q1=1&q2=2`)
    let expected = 'https://baidu.com/a1/a2?q1=1&q2=2'
    t.is(actual, expected)
  })

  test(`${prefix}/proxy/http://...`, t => {
    let actual = deppify(`${prefix}/proxy/http://baidu.com/a1/a2?q1=1&q2=2`)
    let expected = `http://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}/proxy///... with protocol=(void)`, t => {
    let actual = deppify(`${prefix}/proxy///baidu.com/a1/a2?q1=1&q2=2`)
    let expected = `https://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}/proxy///... with protocol=https:`, t => {
    let actual = deppify(
      `${prefix}/proxy///baidu.com/a1/a2?q1=1&q2=2`,
      'https:'
    )
    let expected = `https://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}/proxy///... with protocol=http:`, t => {
    let actual = deppify(`${prefix}/proxy///baidu.com/a1/a2?q1=1&q2=2`, 'http:')
    let expected = `http://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })
})
