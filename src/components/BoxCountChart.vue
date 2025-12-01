<template>
  <div class="mt-4">
    <div v-if="loading" class="text-medium-emphasis">
      Loading bbox stats…
    </div>

    <div v-else-if="error" class="text-error">
      {{ error }}
    </div>

    <ApexChart
      v-else-if="chartSeries.length > 0"
      type="area"
      height="240"
      :options="chartOptions"
      :series="chartSeries"
    />

    <div v-else class="text-medium-emphasis">
      No bbox data available.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import VueApexCharts from "vue3-apexcharts";

const ApexChart = VueApexCharts;

// -------- PROPS --------
const props = defineProps({
  videoId: {
    type: [String, Number],
    required: true,
  },
  fps: {
    type: Number,
    required: true, // needed for time conversion
  },
});

// -------- STATE --------
const loading = ref(false);
const error = ref(null);
const bboxCounts = ref([]);

// -------- API BASE --------
const API_BASE = "http://127.0.0.1:8000";

// Format seconds → mm:ss.xx
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

// -------- FETCH DATA --------
const fetchStats = async (id) => {
  if (!id && id !== 0) return;

  loading.value = true;
  error.value = null;
  bboxCounts.value = [];

  try {
    const res = await fetch(`${API_BASE}/videos/${id}/bbox_counts`);
    if (!res.ok) throw new Error("Failed to load bbox counts");

    const data = await res.json();

    // expected: [{ frame: 0, count: X }, ...]
    bboxCounts.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    error.value = err.message || "Failed to load stats";
    bboxCounts.value = [];
  } finally {
    loading.value = false;
  }
};

// Fetch when video ID changes
watch(
  () => props.videoId,
  (id) => fetchStats(id),
  { immediate: true }
);

// -------- DATA FOR CHART --------
const chartSeries = computed(() => {
  if (!bboxCounts.value || bboxCounts.value.length === 0) return [];

  const fps = props.fps || 1;

  const data = bboxCounts.value.map((p) => {
    const frame = Number(p.frame);
    const timeSec = frame / fps;

    return {
      x: timeSec, // seconds on X-axis
      y: p.count,
      frame,      // stored for tooltip
    };
  });

  return [
    {
      name: "Bounding boxes",
      data,
    },
  ];
});

// -------- CHART OPTIONS --------
const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" },

  xaxis: {
    type: "numeric",
    decimalsInFloat: 2,
    title: { text: "Time (s)" },
    labels: {
      formatter: (val) => formatTime(val), // mm:ss.xx labels
    },
  },

  yaxis: {
    title: { text: "Bounding boxes" },
    min: 0,
  },

  tooltip: {
    theme: "dark",
    x: {
      formatter: (value, { seriesIndex, dataPointIndex, w }) => {
        const point =
          w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex] ?? null;

        const frame =
          point && typeof point.frame === "number"
            ? point.frame
            : Math.round(value * (props.fps || 1));

        return `${formatTime(value)} (frame ${frame})`;
      },
    },
  },
}));
</script>

<style scoped>
.text-error {
  color: #ef5350;
}
.text-medium-emphasis {
  opacity: 0.7;
}

/* Fix tooltip visibility on dark themes */
:deep(.apexcharts-tooltip) {
  background-color: #1e1e1e !important;
  color: #ffffff !important;
  border: 1px solid #424242 !important;
}
:deep(.apexcharts-tooltip-title) {
  background-color: #2c2c2c !important;
  border-bottom: 1px solid #424242 !important;
}
</style>
