import type { IPersonConfig } from '@/types/storeType'

export type ParticipantRecord = Pick<IPersonConfig, 'uuid' | 'id' | 'uid'> | null | undefined

/** Stable identity for linking a selected participant to its visual card. */
export function getParticipantKey(person: ParticipantRecord): string {
    if (person?.uuid) {
        return `uuid:${person.uuid}`
    }
    if (person?.id !== undefined && person?.id !== null) {
        return `id:${String(person.id)}`
    }
    return person?.uid ? `uid:${person.uid}` : ''
}

export function findParticipantCardIndex(cardKeys: string[], participantKey: string, excludedIndexes: number[] = []) {
    return cardKeys.findIndex((key, index) => key === participantKey && !excludedIndexes.includes(index))
}
