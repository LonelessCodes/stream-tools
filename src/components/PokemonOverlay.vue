<template>
  <div class="pokemon">
    <audio ref="startSound" preload="auto">
      <source src="@/assets/pokemon-assets/start-sound.mp3" type="audio/mpeg" />
    </audio>
    <audio ref="endSound" preload="auto">
      <source src="@/assets/pokemon-assets/end-sound.mp3" type="audio/mpeg" />
    </audio>

    <Transition name="fade">
      <div class="pokemon-main" v-show="isVisible">
        <div class="pokemon-planes stack">
          <img src="@/assets/pokemon-assets/plane3.png" class="pokemon-plane"
            style="animation-duration: 65s; animation-delay: -20s; animation-direction: reverse;" />
          <img src="@/assets/pokemon-assets/plane2.png" class="pokemon-plane"
            style="animation-duration: 40s; animation-delay: -10s;" />
          <img src="@/assets/pokemon-assets/plane1.png" class="pokemon-plane"
            style="animation-duration: 19s; animation-delay: 0s; position: relative; left: 25px;" />
        </div>

        <img :src="currentPokemon?.url" :key="currentPokemon?.name" class="pokemon-character" :class="{ 'pokemon-character--hidden': !isRevealed }" />

        <Transition name="fade">
          <div v-show="!isRevealed">
            <span class="fredoka-one pokemon-text pokemon-questionmark">?</span>
            <span class="fredoka-one pokemon-text pokemon-question">Na, wer ist es?</span>
          </div>
        </Transition>

        <span v-show="isRevealed" class="fredoka-one pokemon-text pokemon-its-blank">It's {{ currentPokemon?.name }}</span>

        <!-- <img src="@/assets/pokemon-assets/sunrays.svg" class="pokemon-sunrays" />

        <span class="fredoka-one pokemon-text pokemon-its-blank">
          <span>Username</span> lag richtig!
        </span> -->

      </div>
    </Transition>

    <img src="@/assets/pokemon-assets/head.png" class="pokemon-stinger"
      :class="{ 'pokemom-stinger--active': isVisible }" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const pokemon = Object
  .entries(
    import.meta.glob("../assets/pokemon/*.png", {
      eager: true, import: "default", as: "url"
    })
  )
  .map(([key, value]) => ({
    name: key.split("/").at(-1)!.slice(0, -4),
    url: value,
  }));

let currentIndex = 0;

pokemon.sort(() => 0.5 - Math.random());

function getRandomPokemon() {
  if (currentIndex >= pokemon.length) {
    // reshuffle array when all pokemon have been used
    pokemon.sort(() => 0.5 - Math.random());
    currentIndex = 0;
  }
  return pokemon[currentIndex++];
}

const startSound = ref<HTMLAudioElement>();
const endSound = ref<HTMLAudioElement>();

const $props = defineProps<{
  isActive: boolean;
  ttsSecret?: string;
}>();

const isVisible = ref(false);
const isRevealed = ref(false);

const currentPokemon = ref<(typeof pokemon)[number]>();

function onStartPlay() {
  isVisible.value = true;
}

function onEndPlay() {
  if (!currentPokemon.value) return;

  isRevealed.value = true;

  if ($props.ttsSecret) {
    fetch(`https://tiny-tts.loneless.art/execute/custom?key=${$props.ttsSecret}`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: currentPokemon.value.name,
    });
  }
}

function onEndDone() {
  isVisible.value = false;
}

watch(startSound, (sound, _, onCleanup) => {
  if (!sound) return;

  onCleanup(() => {
    sound.removeEventListener('play', onStartPlay);
  });

  sound.addEventListener('play', onStartPlay);
});

watch(endSound, (sound, _, onCleanup) => {
  if (!sound) return;

  onCleanup(() => {
    sound.removeEventListener('play', onEndPlay);
    sound.removeEventListener('ended', onEndDone);
    sound.removeEventListener('pause', onEndDone);
  });

  sound.addEventListener('play', onEndPlay);
  sound.addEventListener('ended', onEndDone);
  sound.addEventListener('pause', onEndDone);
});

watch(() => $props.isActive, (value, _, onCleanup) => {
  if (value) {
    if (!startSound.value) return;

    currentPokemon.value = getRandomPokemon();
    isRevealed.value = false;

    startSound.value.play();

    // when value changes to false, stop the sound
    onCleanup(() => {
      if (!startSound.value) return;
      startSound.value.pause();
      startSound.value.currentTime = 0;
    });
  } else {
    if (!endSound.value) return;

    endSound.value.play();

    // when value changes to true, stop the sound
    onCleanup(() => {
      if (!endSound.value) return;
      endSound.value.pause();
      endSound.value.currentTime = 0;
    });
  }
});
</script>

<style scoped>
.pokemon {
  --drop-filter: drop-shadow(-20px 15px 0 rgb(0 0 0 / 20%));
}

.pokemon-planes {
  opacity: 1;
  position: absolute;
  top: -300px;
  left: -250px;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.pokemon-plane {
  animation: rotate 10s linear infinite;
}

.pokemon-character {
  position: absolute;
  top: 150px;
  left: 260px;
  height: 700px;
  width: 700px;
  object-fit: contain;
  filter: contrast(100%) brightness(100%) var(--drop-filter);
  transition: filter 0.4s ease-in-out;
  transition-delay: 1s;
}

.pokemon-character--hidden {
  filter: contrast(0) brightness(20%) var(--drop-filter);
}

@keyframes float-up-and-down {

  0%,
  100% {
    transform: translate(0, 0) rotate(10deg);
  }

  50% {
    transform: translate(0, 40px) rotate(10deg);
  }
}

.pokemon-text {
  position: absolute;
  color: #FFCB05;
  font-size: 150px;
  line-height: 1;
  -webkit-text-stroke: 7px #3565AD;
}

.pokemon-question {
  left: 598px;
  top: 851px;
  transform: rotate(356deg);
}

.pokemon-questionmark {
  -webkit-text-stroke: 20px #3565AD;
  font-size: 500px;
  left: 1000px;
  top: 100px;
  filter: var(--drop-filter);

  animation: float-up-and-down 5s ease-in-out infinite;
}

@keyframes zoom-in {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) rotate(356deg) scale(10);
  }

  100% {
    opacity: 1;
    transform: translate(-50%, -50%) rotate(356deg) scale(1);
  }
}

.pokemon-its-blank {
  left: 1098px;
  top: 800px;
  text-align: center;
  animation: zoom-in 0.4s ease-in 1;
  animation-fill-mode: both;
  animation-delay: .8s;
}

@keyframes rotate-and-scale-out {
  0% {
    opacity: 0;
    transform: translate(0, -80px) rotate(0deg) scale(2);
  }

  10% {
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform: translate(-450px, 0) rotate(-300deg) scale(0);
  }
}

.pokemon-stinger {
  display: none;
  opacity: 0;
  position: absolute;
  top: -50px;
  left: 0;
  width: 100%;
  animation: rotate-and-scale-out 800ms cubic-bezier(0.55, 0, 1, 0.45) 1;
  animation-delay: 10ms;
}

.pokemon-stinger.pokemom-stinger--active {
  display: block;
  animation-delay: 10ms;
}

.pokemon-sunrays {
  animation: rotate 20s linear infinite;
}
</style>