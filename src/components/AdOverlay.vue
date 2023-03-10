<template>
  <div class="ad-overlay stack">
    <PokemonOverlay :isActive="isActive" />

    <div class="stack ad-overlay__container">
      <Transition name="fade">
        <div v-show="isActive">
          <div class="ad-overlay__progressbar">
            <div class="ad-overlay__progressbar__inner" :style="{ width: (adProgress * 100) + '%' }"></div>
          </div>

          <div class="ad-overlay__timeleft">
            <span class="ad-overlay__timeleft__badge">Werbung läuft</span>
            <span class="ad-overlay__timeleft__value">{{ adTimeLeft }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <button v-if="test" style="position: fixed; bottom: 0; left: 0; font-size: 32px" @click="startAd(5)">Test Ad</button>
    <button v-if="test" style="position: fixed; bottom: 0; left: 200px; font-size: 32px" @click="stopAd()">Stop Ad</button>
  </div>
</template>

<script setup lang="ts">
import { useDateFormat, useTimestamp } from '@vueuse/core';
import { computed, onUnmounted, ref, watch } from 'vue';
import { AdRunEvent, defineHandler, useStreamerbotClient } from '../composables/useStreamerbotClient';
import PokemonOverlay from './PokemonOverlay.vue';

withDefaults(defineProps<{
  test: boolean;
}>(), {
  test: false
});

const isActive = ref(false);
const adStart = ref(0);
const adLength = ref(0);
const adTimeout = ref<ReturnType<typeof setTimeout>>();

const { timestamp, pause, resume } = useTimestamp({ controls: true });

watch(isActive, (value) => value ? resume() : pause(), { immediate: true });

const adProgress = computed(() => {
  if (!isActive.value || adLength.value <= 0) return 0;

  return (timestamp.value - adStart.value) / adLength.value;
});

const adTimeLeft = useDateFormat(computed(() => adStart.value + adLength.value - timestamp.value), "mm:ss");

function startAd(lengthSecs: number) {
  adStart.value = Date.now();
  adLength.value = lengthSecs * 1000;

  adTimeout.value && clearTimeout(adTimeout.value);
  adTimeout.value = setTimeout(stopAd, adLength.value);

  isActive.value = true;
}

function stopAd() {
  adTimeout.value && clearTimeout(adTimeout.value);
  adTimeout.value = undefined;
  isActive.value = false;
}

const { client } = useStreamerbotClient({
  onConnect() {
    client.value!.on("Twitch.AdRun", defineHandler(({ data }: AdRunEvent) => {
      startAd(data.length);
    }));
  }
});

onUnmounted(() => {
  adTimeout.value && clearTimeout(adTimeout.value);
});
</script>

<style>
.ad-overlay {
  --color-primary: #FB1D76;
  --color-primary-rgb: 251, 29, 118;
  --color-primary-light: #FF5E8C;
  --color-primary-light-rgb: 255, 94, 140;
  --color-background: #2F2F30;
  --color-background-rgb: 47, 47, 48;
  --color-background-light: #383649;
  --color-background-light-rgb: 56, 54, 73;

  --background-opacity: 90%;

  --gradient-background: linear-gradient(to right bottom,
      rgb(var(--color-background-rgb), var(--background-opacity)),
      rgb(var(--color-background-light-rgb), var(--background-opacity)));

  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
}

.ad-overlay__container {
  position: relative;
}

.ad-overlay__progressbar {
  width: 100%;
  height: 8px;
  background: var(--gradient-background);
  border-radius: 4px;
}

.ad-overlay__progressbar__inner {
  height: 100%;
  background-color: var(--color-primary);
  box-shadow: 0 0 6px -3px rgb(var(--color-primary-rgb), 0.5);
  border-radius: 4px;
}

.ad-overlay__timeleft {
  display: inline-flex;
  margin-top: 10px;
  background: var(--gradient-background);
  padding: .4rem 0.5rem;
  line-height: 1;
  border-radius: 4px;

  font-weight: 300;
  font-size: 32px;
}

.ad-overlay__timeleft__value {
  font-weight: 500;
  color: var(--color-primary-light);
  margin-left: 0.5rem;
}
</style>