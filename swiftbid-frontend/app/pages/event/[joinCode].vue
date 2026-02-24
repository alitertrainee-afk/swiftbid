<script setup>
import { computed } from "#imports";

const route = useRoute();
const config = useRuntimeConfig();

// Normalize joinCode
const joinCode = route.params.joinCode?.toString().toUpperCase();

/**
 * 1️⃣ Fetch Event (SSR)
 */
const {
  data: eventResponse,
  error: eventError,
  pending: eventPending,
} = await useFetch(`${config.public.apiBase}/events/${joinCode}`);

// Extract usable event object
const event = computed(() => eventResponse.value?.data ?? null);

/**
 * 2️⃣ Fetch Questions (Dependent Fetch)
 *
 * This will ONLY execute if event.value exists.
 */
const {
  data: questionsResponse,
  error: questionsError,
  pending: questionsPending,
} = await useFetch(
  () =>
    event.value
      ? `${config.public.apiBase}/questions/${event.value._id}`
      : null, // Returning null prevents execution
  {
    watch: [event], // Re-run if event changes
  },
);

// Extract question array
const questions = computed(() => questionsResponse.value?.data ?? []);
</script>
<template>
  <div class="container">
    <!-- Event Loading -->
    <div v-if="eventPending">Loading event...</div>

    <!-- Event Error -->
    <div v-else-if="eventError || !event">
      <h2>Event Not Found or Closed</h2>
    </div>

    <!-- Event Content -->
    <div v-else>
      <h1>{{ event.title }}</h1>

      <!-- Questions Loading -->
      <div v-if="questionsPending">Loading questions...</div>

      <!-- Questions -->
      <ul v-else>
        <li v-for="q in questions" :key="q._id">
          {{ q.text }} — 👍 {{ q.upvotes }}
        </li>
      </ul>
    </div>
  </div>
</template>
