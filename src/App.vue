<script setup lang="ts">
import AdOverlay from './components/AdOverlay.vue';
import { useUrlSearchParams } from '@vueuse/core';
import { computed } from 'vue';

const param = useUrlSearchParams("history");
const isTest = computed(() => param.test === "true");
</script>

<template>
  <img v-if="isTest" src="@/assets/test-bg.png" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1" />

  <AdOverlay class="full" v-if="param.q === 'adoverlay'" :test="isTest" />
</template>

<style scoped>
.full {
  position: absolute;
  inset: 0;
}
</style>
