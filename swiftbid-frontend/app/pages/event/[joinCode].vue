<script setup>
import { computed, ref } from "#imports";

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
  refresh: refreshQuestions,
} = await useFetch(
  () =>
    event.value
      ? `${config.public.apiBase}/questions/${event.value._id}`
      : null,
  {
    watch: [event],
  },
);

// Extract question array
const questions = computed(() => questionsResponse.value?.data ?? []);

/**
 * 3️⃣ Ask a Question (Client-Side POST)
 */
const newQuestionText = ref("");
const submitError = ref(null);
const isSubmitting = ref(false);

async function submitQuestion() {
  // Guard: don't submit empty text or if event isn't loaded
  if (!newQuestionText.value.trim() || !event.value) return;

  submitError.value = null;
  isSubmitting.value = true;

  try {
    await $fetch(`${config.public.apiBase}/questions`, {
      method: "POST",
      body: {
        eventId: event.value._id,
        text: newQuestionText.value.trim(),
      },
    });

    // Clear input after successful submission
    newQuestionText.value = "";

    // Refresh the questions list so the new question appears immediately
    await refreshQuestions();
  } catch (err) {
    submitError.value =
      err.data?.message || "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * 4️⃣ Upvote a Question (Optimistic UI)
 */
async function upvoteQuestion(questionId) {
  // Find the question in our local reactive data
  const question = questionsResponse.value?.data?.find(
    (q) => q._id === questionId,
  );
  if (!question) return;

  // Optimistic update — increment immediately
  question.upvotes++;

  try {
    await $fetch(`${config.public.apiBase}/questions/${questionId}/upvote`, {
      method: "PATCH",
    });
  } catch {
    // Rollback on failure
    question.upvotes--;
  }
}
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

      <!-- Ask a Question Form -->
      <form @submit.prevent="submitQuestion">
        <input
          v-model="newQuestionText"
          type="text"
          placeholder="Type your question..."
          :disabled="isSubmitting"
        />
        <button
          type="submit"
          :disabled="isSubmitting || !newQuestionText.trim()"
        >
          {{ isSubmitting ? "Submitting..." : "Ask" }}
        </button>
      </form>

      <!-- Submission Error -->
      <p v-if="submitError" style="color: red">{{ submitError }}</p>

      <!-- Questions Loading -->
      <div v-if="questionsPending">Loading questions...</div>

      <!-- Questions -->
      <ul v-else>
        <li v-for="q in questions" :key="q._id">
          {{ q.text }}
          <button @click="upvoteQuestion(q._id)">👍 {{ q.upvotes }}</button>
        </li>
      </ul>
    </div>
  </div>
</template>
