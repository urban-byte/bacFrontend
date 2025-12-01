<template>
  <v-row class="pa-2" justify="center">
    <v-slider
        :model-value="currentDuration"
        v-model="thumb"
        @update:modelValue="emit('playFrame', thumb)"
        :max="duration"
        :step="1"
        color="white"
        thumb-color="red"
        hide-details
        rounded
        class="ma-1"
    ></v-slider>
  </v-row>
  <v-row class="pa-2 mb-2" justify="center">
    <v-col cols="4">
    <v-chip color="surface-variant" theme="dark" size="large" class="mt-2">
      {{ formatDuration(currentDuration > 0 ? currentDuration : 0) }} / {{ formatDuration(duration ?? 0) }}
    </v-chip>
    </v-col>
    <v-col cols="1">
      <v-btn icon="mdi-skip-previous-outline" @click="emit('previousFrame')"></v-btn>
    </v-col>
    <v-col cols="1" v-if="!isPlaying">
      <v-btn icon="mdi-play-outline" @click="emit('playVideo')"></v-btn>
    </v-col>
    <v-col cols="1" v-else>
      <v-btn icon="mdi-pause" @click="emit('pauseVideo')"></v-btn>
    </v-col>
    <v-col cols="1">
      <v-btn icon="mdi-skip-next-outline" @click="emit('nextFrame')"></v-btn>
    </v-col>
    <v-col cols="4" style="text-align: right;">
      <v-chip color="surface-variant" theme="dark" size="large" class="mt-2">Frame: {{ currentFrame }}</v-chip>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

// Define props
const props = defineProps({
  isPlaying: Boolean,
  currentFrame: Number,
  currentDuration: Number,
  duration: Number
});

// Define emits
const emit = defineEmits(["previousFrame", "playVideo", "pauseVideo", "nextFrame", "playFrame"]);

const thumb = ref(0);

// Watchers
watch(() => props.currentDuration, (newVal) => {
  thumb.value = newVal;
});

// Methods
const formatDuration = (duration) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  if (hours > 0)
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  else
    return `${formattedMinutes}:${formattedSeconds}`;
};
</script>