<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: Number,
    default: 28
  },
  tilt: {
    type: Number,
    default: -14
  }
})

const uid = `bean-${Math.random().toString(36).slice(2, 10)}`

const styles = computed(() => ({
  width: `${props.size}px`,
  height: `${Math.round(props.size * 1.04)}px`
}))
</script>

<template>
  <svg :style="styles" viewBox="0 0 170 176" fill="none" aria-hidden="true">
    <defs>
      <linearGradient :id="`${uid}-edge`" x1="38" y1="18" x2="128" y2="154" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFF6C8" />
        <stop offset="0.28" stop-color="#FFD36A" />
        <stop offset="0.68" stop-color="#F6A63E" />
        <stop offset="1" stop-color="#D87821" />
      </linearGradient>
      <linearGradient :id="`${uid}-body`" x1="54" y1="28" x2="120" y2="148" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFF9DA" />
        <stop offset="0.35" stop-color="#FFD976" />
        <stop offset="0.8" stop-color="#F3A23B" />
        <stop offset="1" stop-color="#E38727" />
      </linearGradient>
      <radialGradient :id="`${uid}-glow`" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(69 50) rotate(52) scale(68 58)">
        <stop stop-color="white" stop-opacity="0.88" />
        <stop offset="0.6" stop-color="white" stop-opacity="0.18" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
      <linearGradient :id="`${uid}-rim`" x1="45" y1="20" x2="126" y2="148" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FFFDF2" />
        <stop offset="0.3" stop-color="#F8C665" />
        <stop offset="1" stop-color="#D97820" />
      </linearGradient>
    </defs>

    <g :transform="`rotate(${tilt} 85 88)`">
      <path
        d="M121.692 12.945C146.793 22.527 161.849 47.747 158.636 78.309C155.484 108.288 138.335 140.343 110.788 154.789C84.342 168.657 49.756 164.236 30.969 140.999C13.17 118.982 9.7 86.568 17.398 57.989C24.822 30.429 44.963 7.884 73.228 2.79C89.981 -.228 106.176 7.021 121.692 12.945Z"
        :fill="`url(#${uid}-edge)`"
      />
      <path
        d="M117.486 18.321C139.385 26.67 152.52 48.779 149.711 75.57C146.954 101.868 131.989 129.985 107.879 142.63C84.765 154.753 54.543 150.89 38.128 130.595C22.583 111.376 19.535 83.077 26.259 58.117C32.742 34.051 50.333 14.378 75.025 9.929C89.658 7.292 103.947 13.626 117.486 18.321Z"
        :fill="`url(#${uid}-body)`"
      />
      <path
        d="M117.486 18.321C139.385 26.67 152.52 48.779 149.711 75.57C146.954 101.868 131.989 129.985 107.879 142.63C84.765 154.753 54.543 150.89 38.128 130.595C22.583 111.376 19.535 83.077 26.259 58.117C32.742 34.051 50.333 14.378 75.025 9.929C89.658 7.292 103.947 13.626 117.486 18.321Z"
        fill="url(#${uid}-glow)"
      />
      <path
        d="M111.87 28.638C129.323 35.298 139.813 53.083 137.58 74.353C135.385 95.256 123.528 117.619 104.37 127.667C86.008 137.298 61.985 134.23 48.951 118.118C36.611 102.864 34.188 80.403 39.525 60.591C44.673 41.481 58.64 25.862 78.248 22.329C89.868 20.235 101.217 25.266 111.87 28.638Z"
        stroke="url(#${uid}-rim)"
        stroke-width="5.5"
        stroke-linecap="round"
      />
      <path d="M62 41C74.5 34.5 89 34.5 103 39" stroke="#B95A12" stroke-opacity="0.8" stroke-width="5.5" stroke-linecap="round" />
      <path d="M54 118C63.5 128.5 74.5 134 87 136.5" stroke="#B95A12" stroke-opacity="0.78" stroke-width="5.5" stroke-linecap="round" />
      <path d="M115 73C119.5 85 118.5 97 113 108" stroke="#B95A12" stroke-opacity="0.72" stroke-width="4.8" stroke-linecap="round" />

      <path d="M85 111C85 98 92.5 88 103.5 79.5" stroke="#B76716" stroke-width="5.8" stroke-linecap="round" />
      <path d="M84.5 111C84.5 97 77 87 66.2 80.2" stroke="#C7771C" stroke-width="5.2" stroke-linecap="round" />
      <path d="M84.5 111C90.5 116 92.5 122.5 90.5 130.5C87.5 133.8 83 133.8 79.5 130.5C77.5 122.8 79 116.2 84.5 111Z" fill="#E68E28" stroke="#BC6619" stroke-width="4.6" stroke-linejoin="round" />
      <path d="M104 78C97.5 78 91 81.5 87 88.3C95 88.5 102 85 106 79.2Z" fill="#FFE6A2" stroke="#BB6717" stroke-width="3.4" stroke-linejoin="round" />
      <path d="M66 79.5C72.5 79.1 78.8 82.1 83.3 88C75.3 89 68.5 86.3 63.8 81.2Z" fill="#FFF0B9" stroke="#C26E1A" stroke-width="3.4" stroke-linejoin="round" />
      <circle cx="118" cy="42" r="5.2" fill="#FFF4D5" fill-opacity="0.92" />
      <circle cx="133" cy="94" r="3.8" fill="#FFF9EA" fill-opacity="0.9" />
    </g>
  </svg>
</template>
