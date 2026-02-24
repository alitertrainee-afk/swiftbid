<script setup>
import { ref } from 'vue'
import { useRouter } from '#imports'

const joinCode = ref('')
const router = useRouter()

const handleSubmit = () => {
  const normalized = joinCode.value.trim().toUpperCase()
  if (!normalized) return

  router.push(`/event/${normalized}`)
}
</script>

<template>
  <div class="container">
    <h1>SwiftBid</h1>

    <form @submit.prevent="handleSubmit">
      <input
        v-model="joinCode"
        type="text"
        placeholder="Enter Join Code"
      />
      <button type="submit">Join Event</button>
    </form>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
</style>