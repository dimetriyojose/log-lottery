<script setup lang="ts">
import type { ISoundEffect } from '@/types/storeType'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import { getAudioDbItem, removeAudioDbItem, setAudioDbItem } from '@/utils/localforage'

type SoundEffectKind = 'spinning' | 'winner'

const toast = useToast()
const globalConfig = useStore().globalConfig
const { getSoundEffects: soundEffects } = storeToRefs(globalConfig)
const fileInputs = ref<Record<SoundEffectKind, HTMLInputElement | null>>({ spinning: null, winner: null })
const previewAudio = ref<Record<SoundEffectKind, HTMLAudioElement | null>>({ spinning: null, winner: null })
const previewUrls = ref<Record<SoundEffectKind, string | null>>({ spinning: null, winner: null })

const effectLabels: Record<SoundEffectKind, string> = {
    spinning: 'Spinning Sound',
    winner: 'Winner Announcement Sound',
}

function effect(kind: SoundEffectKind) {
    return computed(() => soundEffects.value[kind])
}

function setFileInput(kind: SoundEffectKind, element: HTMLInputElement | null) {
    fileInputs.value[kind] = element
}

function stopPreview(kind: SoundEffectKind) {
    const audio = previewAudio.value[kind]
    if (audio) {
        audio.pause()
        audio.src = ''
    }
    previewAudio.value[kind] = null
    const url = previewUrls.value[kind]
    if (url) {
        URL.revokeObjectURL(url)
    }
    previewUrls.value[kind] = null
}

async function preview(kind: SoundEffectKind) {
    try {
        stopPreview(kind)
        const config = soundEffects.value[kind]
        if (!config) {
            return
        }
        const blob = await getAudioDbItem(config.id)
        if (!blob) {
            toast.open({ message: `${effectLabels[kind]} is unavailable`, type: 'warning', position: 'top-right' })
            return
        }
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = config.volume / 100
        audio.onended = () => stopPreview(kind)
        previewUrls.value[kind] = url
        previewAudio.value[kind] = audio
        await audio.play()
    }
    catch {
        toast.open({ message: 'Audio preview could not be played', type: 'warning', position: 'top-right' })
        stopPreview(kind)
    }
}

function chooseFile(kind: SoundEffectKind) {
    fileInputs.value[kind]?.click()
}

async function upload(kind: SoundEffectKind, event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) {
        return
    }
    const accepted = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/mp3']
    if (!accepted.includes(file.type) && !/\.(mp3|wav|ogg)$/i.test(file.name)) {
        toast.open({ message: 'Please select an MP3, WAV, or OGG file', type: 'error', position: 'top-right' })
        return
    }
    const oldEffect = soundEffects.value[kind]
    const nextEffect: ISoundEffect = {
        id: uuidv4(),
        name: file.name,
        type: file.type || 'audio/*',
        volume: oldEffect?.volume ?? 80,
    }
    try {
        await setAudioDbItem(nextEffect.id, file)
        if (oldEffect) {
            await removeAudioDbItem(oldEffect.id)
        }
        globalConfig.setSoundEffect(kind, nextEffect)
    }
    catch {
        await removeAudioDbItem(nextEffect.id)
        toast.open({ message: 'The audio file could not be saved', type: 'error', position: 'top-right' })
    }
}

async function remove(kind: SoundEffectKind) {
    stopPreview(kind)
    const config = soundEffects.value[kind]
    if (config) {
        await removeAudioDbItem(config.id)
    }
    globalConfig.setSoundEffect(kind, null)
}

function setVolume(kind: SoundEffectKind, event: Event) {
    globalConfig.setSoundEffectVolume(kind, Number((event.target as HTMLInputElement).value))
}

onUnmounted(() => {
    stopPreview('spinning')
    stopPreview('winner')
})
</script>

<template>
  <fieldset class="p-4 border fieldset bg-base-200 border-base-300 rounded-box w-xs pb-10">
    <legend class="fieldset-legend">Sound Effects</legend>
    <label class="flex items-center justify-between w-full max-w-xs gap-2 mb-4 form-control">
      <span class="label-text">Enable Sound Effects</span>
      <input
        type="checkbox" :checked="soundEffects.enabled" class="border-solid checkbox checkbox-secondary border"
        @change="globalConfig.setSoundEffectsEnabled(!soundEffects.enabled)"
      >
    </label>
    <div v-for="kind in (['spinning', 'winner'] as SoundEffectKind[])" :key="kind" class="mb-5 last:mb-0">
      <div class="mb-2 font-semibold">{{ effectLabels[kind] }}</div>
      <input :ref="(element) => setFileInput(kind, element as HTMLInputElement | null)" type="file" accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg" class="hidden" @change="upload(kind, $event)">
      <div class="flex flex-wrap gap-2">
        <button class="btn btn-primary btn-sm" @click="chooseFile(kind)">{{ effect(kind).value ? 'Replace' : 'Upload' }}</button>
        <button class="btn btn-outline btn-sm" :disabled="!effect(kind).value" @click="preview(kind)">Preview</button>
        <button class="btn btn-error btn-outline btn-sm" :disabled="!effect(kind).value" @click="remove(kind)">Remove</button>
      </div>
      <div class="mt-2 text-xs truncate" :title="effect(kind).value?.name || 'No file configured'">
        {{ effect(kind).value?.name || 'No file configured' }}
      </div>
      <label v-if="effect(kind).value" class="flex items-center gap-2 mt-2 text-sm">
        <span>Volume</span>
        <input type="range" min="0" max="100" :value="effect(kind).value?.volume" class="range range-xs" @input="setVolume(kind, $event)">
        <span class="w-10 text-right">{{ effect(kind).value?.volume }}%</span>
      </label>
    </div>
  </fieldset>
</template>
