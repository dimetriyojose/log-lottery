import { describe, expect, it } from 'vitest'
import { findParticipantCardIndex, getParticipantKey } from '@/views/Home/utils/winner'

describe('winner card mapping', () => {
    it('uses stable participant identity instead of display name or array position', () => {
        const first = { uuid: 'record-a', id: 1, uid: 'U1', name: 'Same Name' }
        const second = { uuid: 'record-b', id: 2, uid: 'U1', name: 'Same Name' }
        const keys = [getParticipantKey(first), getParticipantKey(second)]

        expect(findParticipantCardIndex(keys, getParticipantKey(second))).toBe(1)
        expect(getParticipantKey(first)).not.toBe(getParticipantKey(second))
    })

    it('skips a card already reserved by another winner', () => {
        const key = getParticipantKey({ uuid: 'record-a', id: 1, uid: 'U1' })

        expect(findParticipantCardIndex([key, key], key, [0])).toBe(1)
    })
})
