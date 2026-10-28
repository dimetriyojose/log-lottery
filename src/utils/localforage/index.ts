import localforage from 'localforage'

const imageDbStore = localforage.createInstance({
    name: 'imgStore',
})

const audioDbStore = localforage.createInstance({
    name: 'audioStore',
})

async function clearImageDbStore() {
    await imageDbStore.clear()
}

async function clearAudioDbStore() {
    await audioDbStore.clear()
}

export async function setAudioDbItem(key: string, value: Blob) {
    await audioDbStore.setItem(key, value)
}

export async function getAudioDbItem(key: string) {
    return await audioDbStore.getItem<Blob>(key)
}

export async function removeAudioDbItem(key: string) {
    await audioDbStore.removeItem(key)
}

export function clearAllDbStore() {
    clearImageDbStore()
    clearAudioDbStore()
}
