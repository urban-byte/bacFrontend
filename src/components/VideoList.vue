<script setup>
defineProps({
  videos: Array,
  selectedId: Number,
  deletingId: Number
})

defineEmits(['select','delete'])
</script>

<template>
  <v-card class="pa-3 dark-card" elevation="2">
    <h3 class="text-subtitle-1 mb-3 text-primary">Uploaded Videos</h3>

    <div v-if="videos.length === 0" class="text-medium-emphasis">
      No videos yet. Upload one above 👆
    </div>

    <v-list v-else density="compact" nav>
      <v-list-item
        v-for="video in videos"
        :key="video.id"
        @click="$emit('select', video)"
        :active="video.id === selectedId"
        class="rounded mb-1"
      >
        <v-list-item-title>{{ video.filename }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ video.content_type }}
        </v-list-item-subtitle>

        <template #append>
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="error"
            :loading="deletingId === video.id"
            @click.stop="$emit('delete', video)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
