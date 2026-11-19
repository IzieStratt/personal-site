import { streaks, dayParts, validTZ, clamp, esc } from './vibetime-core.js'
import assert from 'node:assert/strict'
const day = (min) => ({ seconds: min * 60 })
assert.deepEqual(streaks([]), [0, 0])
assert.deepEqual(streaks([20, 20, 0, 30, 30, 30].map(day)), [3, 3])
assert.deepEqual(streaks([20, 20, 20, 0].map(day)), [3, 3], 'today incomplete keeps streak')
assert.deepEqual(streaks([20, 20, 20, 0, 0].map(day)), [0, 3], 'missed yesterday breaks')
assert.deepEqual(streaks([20, 14, 20].map(day)), [1, 1], '14min under bar')
const ny = 'America/New_York'
assert.equal(dayParts(new Date('2026-11-19T02:00:00Z'), ny).key, '2026-11-18', 'NY day boundary')
assert.equal(dayParts(new Date('2026-11-19T02:00:00Z'), 'UTC').key, '2026-11-19', 'UTC day')
assert.equal(new Date(dayParts(new Date('2026-11-19T15:00:00Z'), ny).start).toISOString(), '2026-11-19T05:00:00.000Z', 'EST midnight=05:00Z')
assert.ok(validTZ('UTC') && validTZ('America/New_York') && !validTZ('Mars/Base'))
assert.equal(clamp(999, 0, 60), 60); assert.equal(clamp(-5, 0, 60), 0); assert.equal(clamp(30.9, 0, 60), 30)
assert.equal(esc('<b>&"'), '&lt;b&gt;&amp;&quot;')
console.log('vibetime-core: all passed')
