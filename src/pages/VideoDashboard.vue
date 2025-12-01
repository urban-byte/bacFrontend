<script setup>
import { onMounted } from 'vue'
import { useVideos } from '@/composables/useVideos'

import VideoPlayer from '@/components/VideoPlayer.vue'
import BoxCountChart from '@/components/BoxCountChart.vue'
import VideoTrackRangeChart from '@/components/VideoTrackRangeChart.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import VideoList from '@/components/VideoList.vue'

const API_BASE = 'http://127.0.0.1:8000'

const {
  videos,
  selectedVideo,
  selectedInfo,
  uploading,
  uploadError,
  loadingInfo,
  deletingId,
  fetchVideos,
  fetchVideoInfo,
  uploadVideo,
  deleteVideo
} = useVideos(API_BASE)

onMounted(fetchVideos)
</script>

<template>
  <v-app>
    <v-main class="bg-dark">
      <v-container class="pa-6" fluid>
        <h1 class="text-h5 text-primary mb-4">
          🎬 Detection of groups of people in video
        </h1>

        <v-row>
          <v-col cols="12" md="9">
            <v-card class="pa-4 dark-card" elevation="3">
              <template v-if="selectedVideo">
                <h2 class="text-h6 text-primary mb-1">
                  {{ selectedVideo.filename }}
                </h2>

                <div v-if="loadingInfo">Loading video info…</div>

                <VideoPlayer v-if="selectedInfo" :source="API_BASE + selectedInfo.url" :type="selectedInfo.content_type"
                  :fps="selectedInfo.fps" :annotations="selectedInfo.annotations"
                  :group-annotations="selectedInfo.groupAnnotations" :baseWidth="selectedInfo.width"
                  :baseHeight="selectedInfo.height" />

                <!-- Graphs -->
                <div v-if="selectedInfo" class="mt-6">
                  <h3 class="text-subtitle-1 text-primary mb-2">
                    Number of detected boxes per frame
                  </h3>
                  <BoxCountChart :video-id="selectedVideo.id" :fps="selectedInfo.fps" />
                </div>

                <div v-if="selectedInfo" class="mt-8">
                  <h3 class="text-subtitle-1 text-primary mb-2">
                    Track duration overview
                  </h3>
                  <VideoTrackRangeChart :video-id="selectedVideo.id" :fps="selectedInfo.fps" />
                </div>
              </template>

              <template v-else>
                <p>Select a video from the list.</p>
              </template>
            </v-card>
          </v-col>

          <v-col cols="12" md="3">
            <VideoUploader :uploading="uploading" :uploadError="uploadError" @upload="uploadVideo" />

            <VideoList class="mt-4" :videos="videos" :selectedId="selectedVideo?.id" :deletingId="deletingId"
              @select="v => { selectedVideo = v; fetchVideoInfo(v.id) }" @delete="deleteVideo" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
