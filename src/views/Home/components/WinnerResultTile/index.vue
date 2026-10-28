<script setup lang="ts">
import type { IPersonConfig } from '@/types/storeType'
import { computed } from 'vue'

const props = defineProps<{
    winner: IPersonConfig | null
    visible: boolean
    winnerColor?: string
}>()

const tileStyle = computed(() => ({
    '--winner-color': props.winnerColor || '#22c55e',
}))
</script>

<template>
  <Transition name="winner-result" appear>
    <div v-if="visible && winner" class="winner-result-layer" aria-live="polite">
      <article class="winner-result-tile" :style="tileStyle" aria-label="Winner result">
        <div class="winner-result-badge">WINNER</div>
        <img v-if="winner.avatar" :src="winner.avatar" class="winner-result-avatar" alt="">
        <div class="winner-result-content">
          <div class="winner-result-id">{{ winner.uid }}</div>
          <h2 class="winner-result-name">{{ winner.name }}</h2>
          <div v-if="winner.department || winner.identity" class="winner-result-details">
            <div v-if="winner.department">{{ winner.department }}</div>
            <div v-if="winner.identity">{{ winner.identity }}</div>
          </div>
        </div>
      </article>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.winner-result-layer {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    pointer-events: none;
}

.winner-result-tile {
    width: min(560px, calc(100vw - 48px));
    min-height: 220px;
    max-height: calc(100vh - 48px);
    box-sizing: border-box;
    overflow: auto;
    padding: 32px clamp(24px, 5vw, 56px);
    border: 3px solid var(--winner-color);
    border-radius: 24px;
    background: color-mix(in srgb, var(--winner-color) 16%, var(--b1, #111827));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--winner-color) 35%, transparent), 0 0 42px color-mix(in srgb, var(--winner-color) 55%, transparent), 0 22px 60px rgb(0 0 0 / 45%);
    color: var(--bc, #fff);
    text-align: center;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.winner-result-badge {
    margin-bottom: 16px;
    color: var(--winner-color);
    font-size: clamp(14px, 1.4vw, 20px);
    font-weight: 800;
    letter-spacing: 0.24em;
}

.winner-result-avatar {
    display: block;
    width: min(180px, 45vw);
    height: min(180px, 45vw);
    margin: 0 auto 18px;
    border: 3px solid var(--winner-color);
    border-radius: 50%;
    object-fit: cover;
}

.winner-result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.winner-result-id,
.winner-result-details {
    max-width: 100%;
    font-size: clamp(14px, 1.5vw, 19px);
    line-height: 1.45;
}

.winner-result-id {
    opacity: 0.8;
    font-variant-numeric: tabular-nums;
}

.winner-result-name {
    max-width: 100%;
    margin: 0;
    color: var(--winner-color);
    font-size: clamp(30px, 4vw, 52px);
    line-height: 1.12;
    overflow-wrap: anywhere;
    word-break: break-word;
}

.winner-result-enter-active,
.winner-result-leave-active {
    transition: opacity 600ms ease;
}

.winner-result-enter-active .winner-result-tile,
.winner-result-leave-active .winner-result-tile {
    transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 600ms ease;
}

.winner-result-enter-from,
.winner-result-leave-to {
    opacity: 0;
}

.winner-result-enter-from .winner-result-tile,
.winner-result-leave-to .winner-result-tile {
    opacity: 0;
    transform: translateY(18px) scale(0.62);
}

@media (prefers-reduced-motion: reduce) {
    .winner-result-enter-active,
    .winner-result-leave-active,
    .winner-result-enter-active .winner-result-tile,
    .winner-result-leave-active .winner-result-tile {
        transition-duration: 1ms;
    }
}
</style>
