import test from 'ava'
import { ppPrefix } from '../config'
import { targetifyFull } from './targetify'

let prefixes = [
  '',
  'localhost:3000',
  'http://localhost:3000',
  'https://localhost:3000',
]

prefixes.forEach(prefix => {
  test(`${prefix}${ppPrefix}https://...`, t => {
    let actual = targetifyFull(
      `${prefix}${ppPrefix}https://baidu.com/a1/a2?q1=1&q2=2`
    )
    let expected = `https://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}${ppPrefix}http://...`, t => {
    let actual = targetifyFull(
      `${prefix}${ppPrefix}http://baidu.com/a1/a2?q1=1&q2=2`
    )
    let expected = `http://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}${ppPrefix}//... with protocol=(void)`, t => {
    let actual = targetifyFull(
      `${prefix}${ppPrefix}//baidu.com/a1/a2?q1=1&q2=2`
    )
    let expected = `https://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}${ppPrefix}//... with protocol=https:`, t => {
    let actual = targetifyFull(
      `${prefix}${ppPrefix}//baidu.com/a1/a2?q1=1&q2=2`,
      'https:'
    )
    let expected = `https://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })

  test(`${prefix}${ppPrefix}//... with protocol=http:`, t => {
    let actual = targetifyFull(
      `${prefix}${ppPrefix}//baidu.com/a1/a2?q1=1&q2=2`,
      'http:'
    )
    let expected = `http://baidu.com/a1/a2?q1=1&q2=2`
    t.is(actual, expected)
  })
})
