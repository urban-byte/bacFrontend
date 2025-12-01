<template>
  <v-container
    class="mx-auto pa-0"
    id="canvas-container"
    ref="container"
  >
    <div>
      <video ref="video" style="display: none;">
        <source :src="videoData.source" :type="videoData.type" />
        Your browser does not support the video tag.
      </video>

      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="responsive-canvas"
      ></canvas>

      <button
        class="mx-auto text-center ma-3 bbox-button"
        @click="cycleBBoxMode"
      >
        {{ bboxButtonLabel }}
      </button>

      <VideoControls
        @previousFrame="previousFrame"
        @playVideo="playVideo"
        @pauseVideo="pauseVideo"
        @nextFrame="nextFrame"
        @playFrame="playFrame"
        :isPlaying="isPlaying"
        :currentFrame="videoData.currentFrame"
        :currentDuration="videoData.currentDuration"
        :duration="videoData.duration"
      />
    </div>
  </v-container>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
} from 'vue'
import VideoControls from './VideoControls.vue'

const props = defineProps({
  source: { type: String, required: true },
  type: { type: String, default: 'video/mp4' },
  fps: { type: Number, default: 60 },
  // individual annotations: { [frameNo]: [{ id, fillColor: [r,g,b], bbox: [x1,y1,x2,y2] }, ...] }
  annotations: { type: Object, default: () => ({}) },
  // group annotations in the SAME shape as annotations above
  groupAnnotations: { type: Object, default: () => ({}) },
  // base resolution in which bboxes are defined (from backend)
  baseWidth: { type: Number, default: 1280 },
  baseHeight: { type: Number, default: 720 },
})

const video = ref(null)
const canvas = ref(null)
const ctx = ref(null)
const container = ref(null)

const isPlaying = ref(false)
const frameRequestId = ref(null)

// dynamic canvas size (preserve aspect ratio)
const canvasWidth = ref(props.baseWidth)
const canvasHeight = ref(props.baseHeight)

const annotationsRef = ref(props.annotations)
const groupAnnotationsRef = ref(props.groupAnnotations)

// bbox mode: 'none' | 'individual' | 'group'
const bboxMode = ref('individual')

const bboxButtonLabel = computed(() => {
  if (bboxMode.value === 'none') return 'BBOX: OFF'
  if (bboxMode.value === 'individual') return 'BBOX: INDIVIDUAL'
  return 'BBOX: GROUP'
})

const cycleBBoxMode = () => {
  if (bboxMode.value === 'none') {
    bboxMode.value = 'individual'
  } else if (bboxMode.value === 'individual') {
    bboxMode.value = 'group'
  } else {
    bboxMode.value = 'none'
  }
}

const activeAnnotations = computed(() => {
  if (bboxMode.value === 'group') {
    return groupAnnotationsRef.value || {}
  }
  return annotationsRef.value || {}
})

const scaleX = computed(() => {
  if (!props.baseWidth) return 1
  return canvasWidth.value / props.baseWidth
})
const scaleY = computed(() => {
  if (!props.baseHeight) return 1
  return canvasHeight.value / props.baseHeight
})

const resizeCanvas = () => {
  if (!container.value) return
  const el = container.value.$el || container.value
  const w = el.clientWidth || window.innerWidth
  const width = Math.min(w, window.innerWidth - 40)
  // keep aspect ratio of base resolution
  const aspect = props.baseHeight / props.baseWidth
  canvasWidth.value = width
  canvasHeight.value = Math.round(width * aspect)
}

const videoData = ref({
  source: props.source,
  type: props.type,
  fps: props.fps,
  duration: 0,
  currentDuration: 0,
  currentFrame: 0,
})

watch(
  () => props.source,
  (newSource) => {
    videoData.value.source = newSource
    if (video.value) {
      video.value.pause()
      video.value.currentTime = 0
      video.value.load()
    }
  }
)

watch(
  () => props.fps,
  (newFps) => {
    videoData.value.fps = newFps || 60
  }
)

watch(
  () => props.annotations,
  (v) => {
    annotationsRef.value = v || {}
  }
)

watch(
  () => props.groupAnnotations,
  (v) => {
    groupAnnotationsRef.value = v || {}
  }
)

const estimateCurrentFrame = (currentTime) =>
  Math.floor(currentTime * videoData.value.fps) || 1

const drawBoundingBox = (frameNo, label, x_1, y_1, x_2, y_2, color) => {
  if (!ctx.value) return

  ctx.value.strokeStyle = color
  ctx.value.lineWidth = 2
  ctx.value.beginPath()
  ctx.value.rect(x_1, y_1, x_2 - x_1, y_2 - y_1)
  ctx.value.stroke()

  ctx.value.fillStyle = color
  ctx.value.font = '12px Arial'
  ctx.value.fillText(String(label), x_1, y_1 - 5)
}

const drawBoundingBoxes = (frameNo) => {
  const boxes = activeAnnotations.value?.[frameNo]
  if (!Array.isArray(boxes) || boxes.length === 0) return

  for (const item of boxes) {
    if (!item) continue

    const label = item.id ?? ''
    const fillColor = Array.isArray(item.fillColor) ? item.fillColor : [0, 255, 0]
    const bbox = Array.isArray(item.bbox) ? item.bbox : [0, 0, 0, 0]

    const [x1, y1, x2, y2] = bbox.map(n => Number(n) || 0)

    // scale from base resolution
    const sx1 = x1 * scaleX.value
    const sy1 = y1 * scaleY.value
    const sx2 = x2 * scaleX.value
    const sy2 = y2 * scaleY.value

    const color = `rgb(${fillColor.join(',')})`

    drawBoundingBox(frameNo, label, sx1, sy1, sx2, sy2, color)
  }
}

const drawFrame = () => {
  if (!video.value || !canvas.value || !ctx.value) return

  videoData.value.currentFrame = estimateCurrentFrame(video.value.currentTime)
  videoData.value.currentDuration = video.value.currentTime

  ctx.value.drawImage(
    video.value,
    0,
    0,
    canvasWidth.value,
    canvasHeight.value
  )

  if (bboxMode.value !== 'none') {
    drawBoundingBoxes(videoData.value.currentFrame)
  }

  frameRequestId.value = requestAnimationFrame(drawFrame)
}

const playVideo = () => {
  if (!video.value) return
  video.value.play()
  if (!frameRequestId.value) drawFrame()
}

const pauseVideo = () => {
  if (!video.value) return
  video.value.pause()
  isPlaying.value = false
  if (frameRequestId.value) {
    cancelAnimationFrame(frameRequestId.value)
    frameRequestId.value = null
  }
}

const nextFrame = () => {
  if (!video.value) return
  video.value.currentTime += 1 / videoData.value.fps
  drawFrame()
}

const previousFrame = () => {
  if (!video.value) return
  video.value.currentTime -= 1 / videoData.value.fps
  if (video.value.currentTime < 0) video.value.currentTime = 0
  drawFrame()
}

const playFrame = (value) => {
  if (!video.value) return
  const time = Number(value) || 0   // slider emits seconds
  video.value.currentTime = time
  drawFrame()
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')

  video.value.addEventListener('loadedmetadata', () => {
    videoData.value.duration = video.value.duration
  })

  video.value.addEventListener('play', () => {
    isPlaying.value = true
  })

  video.value.addEventListener('pause', () => {
    isPlaying.value = false
  })

  video.value.addEventListener('ended', () => {
    isPlaying.value = false
    if (frameRequestId.value) {
      cancelAnimationFrame(frameRequestId.value)
      frameRequestId.value = null
    }
  })

  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
  drawFrame()
})

onBeforeUnmount(() => {
  if (frameRequestId.value) {
    cancelAnimationFrame(frameRequestId.value)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
#canvas-container {
  position: relative;
  width: 100%;
}

.responsive-canvas {
  display: block;
  width: 100%;
  height: auto;
  background: #000;
  border-radius: 8px;
}

.bbox-button {
  background: #424242;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}

.bbox-button:hover {
  background: #616161;
}
</style>
