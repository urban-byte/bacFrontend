<template>
  <v-card color="black" compact class="pa-0" min-height="52" max-height="52">
    <template v-slot:text>
      <p v-for="(caption, index) in captions" :key="index" align="center">
        <span style="color: white; font-size: 16px; font-family: 'Trebuchet MS', sans-serif;">{{
            currentDuration >= caption.startTime && currentDuration <= caption.endTime ? caption.text : ""
          }}</span>
      </p>
    </template>
  </v-card>
</template>

<script>
import {videoDataStore} from "@/store/videoData";

export default {
  data: () => ({
    captions: ""
  }),
  props: ['currentDuration'],
  computed: {
    getCaptions() {
      // Get request for vtt file and save as text. (Only vtt is supported)
      return videoDataStore().transcript;
    }
  },
  watch: {
    getCaptions() {
      console.log("Watch Caption", this.getCaptions);
      this.parseCaptions(this.getCaptions);
    }
  },
  mounted() {
    this.parseCaptions(this.getCaptions);
  },
  methods: {
    parseCaptions(vttData) {
      if (!vttData) return null;
      const lines = vttData.trim().split('\n\n');
      lines.shift();
      this.captions = lines.map((line) => {
        const [count, time, text] = line.split('\n');
        const [startTime, endTime] = time.split(' --> ');
        return {
          startTime: this.convertTimeToSeconds(startTime),
          endTime: this.convertTimeToSeconds(endTime),
          text,
          active: false,
        };
      });
    },
    // Function to convert VTT time format to seconds
    convertTimeToSeconds(time) {
      const [hours, minutes, seconds] = time.split(':').map(parseFloat);
      return hours * 3600 + minutes * 60 + seconds;
    },
    // Function to update captions based on video current time
    updateCaptions() {
      const currentTime = this.currentDuration;
      // console.log(currentTime);
      if (currentTime > 0)
        for (const caption of this.captions) {
          console.log(caption)
          caption.active = currentTime >= caption.startTime && currentTime <= caption.endTime;
        }
    },
  }
}
</script>

<style scoped>

</style>
