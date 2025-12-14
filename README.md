# Video Analytics Frontend

This repository contains the frontend application for a video analytics and group-detection system.
The application provides an interactive web interface for uploading videos, playing them with visual overlays, and exploring analytical results such as bounding-box counts, trajectories, and detected groups.

The frontend is built using Vue 3 and Vuetify and communicates with a FastAPI backend that performs video processing and analysis.

---

## Features

- Video upload and management
- Video playback with bounding-box and group overlays
- Visualization of detected objects and groups
- Interactive charts for analytical results
- Global dark theme (Vuetify)
- Reactive state management using Vue Composition API
- REST API integration with backend service

---

## Tech Stack

- Vue 3
- Vuetify 3
- JavaScript (ES6+)
- ApexCharts
- Material Design Icons
- Fetch API

---

## Project Structure

src/
├── assets/
│   ├── base.css
│   └── main.css
├── components/
│   ├── VideoPlayer.vue
│   ├── VideoControls.vue
│   ├── VideoUploader.vue
│   ├── VideoList.vue
│   ├── Captions.vue
│   ├── BoxCountChart.vue
│   ├── VideoTrackRangeChart.vue
│   └── VideoDashboard.vue
├── composables/
│   └── useVideos.js
├── App.vue
├── main.js
└── vuetify.js

---

## Backend Requirements

This frontend expects a running backend API providing at least the following endpoints:

- GET /videos
- POST /videos
- DELETE /videos/{id}
- GET /videos/{id}/info
- GET /videos/{id}/group_boxes
- GET /videos/{id}/stream

The backend is typically implemented using FastAPI and performs object detection, tracking, and group detection.

---

## Installation

### Prerequisites

- Node.js >= 18
- npm or yarn
- Running backend API

### Install Dependencies

npm install

---

## Development

### Start Development Server

npm run dev

The application will be available at:
http://localhost:5173

---

## Configuration

### Backend API URL

Set the backend base URL in the application (for example in useVideos.js):

const API_BASE = "http://localhost:8000"

---

## Dark Theme

The application uses a global dark theme to ensure visual consistency and readability.
Custom CSS overrides are applied to fix common Vuetify dark-mode contrast issues.

---

## Usage Workflow

1. Upload a video file
2. Wait for backend processing to complete
3. Select the video from the list
4. Play the video with overlays enabled
5. Explore analytical charts and group information

---

## Known Limitations

- Processing time depends on backend hardware (CPU/GPU)
- Large videos may require longer processing time
- Group detection accuracy depends on tracking quality

---

## License

This project is intended primarily for academic and research use.
License details can be added if required.
