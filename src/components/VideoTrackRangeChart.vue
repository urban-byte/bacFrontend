<template>
  <div class="mt-4">
    <div class="d-flex align-center mb-2" style="gap: 8px; flex-wrap: wrap">
      <!-- filtr: minimální velikost skupiny -->
      <v-text-field
        v-model.number="minSize"
        type="number"
        label="Min group size"
        variant="outlined"
        density="compact"
        style="max-width: 160px"
        hide-details
      />

      <!-- filtr: minimální trvání v sekundách -->
      <v-text-field
        v-model.number="minDurationSec"
        type="number"
        label="Min duration (s)"
        variant="outlined"
        density="compact"
        style="max-width: 180px"
        hide-details
      />

      <span class="text-medium-emphasis">
        Showing groups with ≥ {{ minSize }} IDs and ≥ {{ minDurationSec }} s
      </span>
    </div>

    <div v-if="loading" class="text-medium-emphasis">
      Loading groups…
    </div>

    <div v-else-if="error" class="text-error">
      {{ error }}
    </div>

    <ApexChart
      v-else-if="chartSeries.length > 0"
      type="scatter"
      height="300"
      :options="chartOptions"
      :series="chartSeries"
    />

    <div v-else class="text-medium-emphasis">
      No group data available (after filters).
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const ApexChart = VueApexCharts

const props = defineProps({
  videoId: {
    type: [String, Number],
    required: true,
  },
  fps: {
    type: Number,
    required: true,
  },
})

const API_BASE = 'http://127.0.0.1:8000'

const loading = ref(false)
const error = ref(null)
const groups = ref([])

// ⬅ filtry
const minSize = ref(1)
const minDurationSec = ref(0)

// Format seconds → mm:ss.xx
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`
}

const fetchGroups = async (id) => {
  if (!id && id !== 0) return
  loading.value = true
  error.value = null

  try {
    const res = await fetch(`${API_BASE}/videos/${id}/groups`)
    if (!res.ok) throw new Error('Failed to load groups')
    const data = await res.json()
    groups.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error(err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

watch(
  () => props.videoId,
  (id) => fetchGroups(id),
  { immediate: true },
)

// groups po aplikaci obou filtrů (size + duration)
const filteredGroups = computed(() => {
  const sizeThreshold = Math.max(1, Number(minSize.value) || 1)
  const durThreshold = Math.max(0, Number(minDurationSec.value) || 0)
  const fps = props.fps || 1

  return groups.value.filter((g) => {
    const size = Array.isArray(g.members) ? g.members.length : 0
    const durationFrames = (g.end ?? g.stop ?? 0) - (g.start ?? g.begin ?? 0)
    const durationSec = durationFrames / fps
    return size >= sizeThreshold && durationSec >= durThreshold
  })
})

// ---------------------
// BUILD SERIES (scatter)
// ---------------------
const chartSeries = computed(() => {
  if (!filteredGroups.value || filteredGroups.value.length === 0) return []

  const fps = props.fps || 1

  const points = filteredGroups.value.map((g) => {
    const size = g.members.length
    const startFrame = g.start
    const endFrame = g.end
    const startSec = startFrame / fps
    const endSec = endFrame / fps
    const midSec = (startSec + endSec) / 2

    return {
      x: midSec, // čas (sekundy) – střed intervalu
      y: size,   // počet IDs
      _size: size,
      _members: g.members,
      _start: startFrame,
      _end: endFrame,
      _startSec: startSec,
      _endSec: endSec,
    }
  })

  return [
    {
      name: 'Groups',
      data: points,
    },
  ]
})

// ---------------------
// OPTIONS
// ---------------------
const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: true },
    zoom: { enabled: true },
  },
  dataLabels: { enabled: false },
  markers: {
    size: 5,
  },

  xaxis: {
    type: 'numeric',
    title: { text: 'Time (s)' },
    labels: {
      formatter: (v) => formatTime(v),
    },
  },

  yaxis: {
    title: { text: 'Group size (# IDs)' },
    min: 0,
    tickAmount: 6,
    forceNiceScale: true,
  },

  tooltip: {
    theme: 'dark',
    custom: ({ seriesIndex, dataPointIndex, w }) => {
      const point =
        w.config.series?.[seriesIndex]?.data?.[dataPointIndex] ?? null
      if (!point) return ''

      const members = point._members || []
      return `
        <div class="apex-tooltip">
          <div><strong>Group size:</strong> ${point._size}</div>
          <div><strong>Members:</strong> [${members.join(', ')}]</div>
          <div><strong>Frames:</strong> ${point._start} – ${point._end}</div>
          <div><strong>Time:</strong> ${formatTime(point._startSec)} – ${formatTime(
        point._endSec,
      )}</div>
        </div>
      `
    },
  },
}))
</script>

<style scoped>
.text-error {
  color: #ef5350;
}
.text-medium-emphasis {
  opacity: 0.7;
}

:deep(.apexcharts-tooltip) {
  background-color: #1e1e1e !important;
  color: white !important;
  border: 1px solid #444 !important;
}
.apex-tooltip {
  font-size: 12px;
  line-height: 1.4;
}
</style>
