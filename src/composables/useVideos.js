import { ref } from 'vue'

export function useVideos(API_BASE) {
  const videos = ref([])
  const selectedVideo = ref(null)
  const selectedInfo = ref(null)

  const uploading = ref(false)
  const uploadError = ref(null)
  const loadingInfo = ref(false)
  const deletingId = ref(null)

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_BASE}/videos`)
      if (!res.ok) throw new Error('Failed to load videos')
      const data = await res.json()
      videos.value = data

      if (data.length > 0 && !selectedVideo.value) {
        selectedVideo.value = data[0]
        await fetchVideoInfo(data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVideoInfo = async (id) => {
    loadingInfo.value = true
    selectedInfo.value = null
    try {
      // 1) basic info
      const res = await fetch(`${API_BASE}/videos/${id}/info`)
      if (!res.ok) throw new Error('Failed to load video info')
      const info = await res.json()

      // 2) group boxes — now stored AS-IS (array of frames)
      try {
        const grpRes = await fetch(`${API_BASE}/videos/${id}/group_boxes`)
        if (grpRes.ok) {
          const frames = await grpRes.json()
          // frames is already:  List[List[ { id, bbox, frameNo } ]]
          info.groupAnnotations = frames
        } else {
          info.groupAnnotations = []
        }
      } catch (e) {
        console.error('Failed to load group boxes', e)
        info.groupAnnotations = []
      }

      selectedInfo.value = info
    } catch (err) {
      console.error(err)
    } finally {
      loadingInfo.value = false
    }
  }

const fetchVideoGroups = async (id) => {
  loadingInfo.value = true
  try {
    const res = await fetch(`${API_BASE}/videos/${id}/group_boxes`)
    if (!res.ok) throw new Error('Failed to load video group boxes')
    selectedInfo.value.groupAnnotations = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loadingInfo.value = false
  }
}

  const uploadVideo = async (file) => {
    if (!file) return
    uploading.value = true
    uploadError.value = null
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_BASE}/videos`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(await res.text())

      const item = await res.json()

      await fetchVideos()
      selectedVideo.value = videos.value.find(v => v.id === item.id)
      await fetchVideoInfo(item.id)
    } catch (err) {
      uploadError.value = err.message || 'Upload failed'
    } finally {
      uploading.value = false
    }
  }

  const deleteVideo = async (video) => {
    deletingId.value = video.id
    try {
      const res = await fetch(`${API_BASE}/videos/${video.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(await res.text())

      videos.value = videos.value.filter(v => v.id !== video.id)

      if (selectedVideo.value?.id === video.id) {
        const next = videos.value[0] || null
        selectedVideo.value = next
        selectedInfo.value = null
        if (next) await fetchVideoInfo(next.id)
      }
    } finally {
      deletingId.value = null
    }
  }

  return {
    videos,
    selectedVideo,
    selectedInfo,
    uploading,
    uploadError,
    loadingInfo,
    deletingId,
    fetchVideos,
    fetchVideoInfo,
    fetchVideoGroups,
    uploadVideo,
    deleteVideo
  }
}
