<script setup>
defineProps({
  uploading: Boolean,
  uploadError: String
})

defineEmits(['upload'])
</script>

<template>
  <v-card class="pa-3 dark-card" elevation="2">
    <v-file-input
      theme="dark"
      label="Upload new video"
      accept="video/*"
      prepend-icon="mdi-upload"
      density="compact"
      variant="outlined"
      @change="e => $emit('upload', e.target.files[0])"
    />
    <div class="mt-2">
      <span v-if="uploading" class="text-info">Uploading…</span>
      <span v-if="uploadError" class="text-error">
        {{ uploadError }}
      </span>
    </div>
  </v-card>
</template>
