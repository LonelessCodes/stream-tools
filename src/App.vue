<script setup lang="ts">
import AdOverlay from './components/AdOverlay.vue';
import { useUrlSearchParams } from '@vueuse/core';
import { computed } from 'vue';

const param = useUrlSearchParams("history");
const isTest = computed(() => param.test === "true");
</script>

<template>
  <img v-if="isTest" src="@/assets/test-bg.png" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 1" />

  <AdOverlay v-if="param.q === 'adoverlay'" :test="isTest" />
</template>

<style>
.stack {
  display: grid;
}
.stack>* {
  grid-column: 1;
  grid-row: 1;
}
</style>
