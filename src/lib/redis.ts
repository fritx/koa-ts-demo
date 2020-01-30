import * as Redis from 'ioredis'
import { redisOptions } from './redis-options'

export let redis = new Redis(redisOptions)
