<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { Announcements, normalizeStopName } from "../../announcements";
import { StopWithTime } from "../../types";

/**
 * Enregistrement d'annonces personnalisées par station : micro
 * (MediaRecorder) ou fichier audio, stockées localement (IndexedDB) et
 * jouées sur l'écran à la place de la synthèse vocale.
 */

const props = defineProps<{
  stops: StopWithTime[];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const recordedNames = ref<Set<string>>(new Set());
const recordingFor = ref<string | null>(null);
const micError = ref(false);

let mediaRecorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let chunks: Blob[] = [];

const open = async () => {
  dialogRef.value?.showModal();
  micError.value = false;
  recordedNames.value = new Set(
    (await Announcements.listNames()).map(normalizeStopName),
  );
};
const close = () => {
  stopRecording(false);
  dialogRef.value?.close();
};
defineExpose({ open, close });

/** Stations de la course courante, dédoublonnées par nom. */
const stopNames = computed(() => {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const s of props.stops) {
    const key = normalizeStopName(s.stop.name);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    names.push(s.stop.name);
  }
  return names;
});

const hasRecording = (name: string) =>
  recordedNames.value.has(normalizeStopName(name));

const startRecording = async (name: string) => {
  stopRecording(false);
  micError.value = false;
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    micError.value = true;
    return;
  }

  chunks = [];
  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, {
      type: mediaRecorder?.mimeType || "audio/webm",
    });
    if (blob.size > 0 && recordingFor.value) {
      await Announcements.set(recordingFor.value, blob);
      recordedNames.value = new Set([
        ...recordedNames.value,
        normalizeStopName(recordingFor.value),
      ]);
    }
    recordingFor.value = null;
  };
  recordingFor.value = name;
  mediaRecorder.start();
};

const stopRecording = (save = true) => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    if (!save) recordingFor.value = null;
    mediaRecorder.stop();
  }
  mediaStream?.getTracks().forEach((t) => t.stop());
  mediaStream = null;
  mediaRecorder = null;
};

const importFile = async (name: string, event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  await Announcements.set(name, file);
  recordedNames.value = new Set([
    ...recordedNames.value,
    normalizeStopName(name),
  ]);
};

const preview = async (name: string) => {
  const blob = await Announcements.get(name);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.play();
};

const removeRecording = async (name: string) => {
  await Announcements.remove(name);
  const next = new Set(recordedNames.value);
  next.delete(normalizeStopName(name));
  recordedNames.value = next;
};

onBeforeUnmount(() => stopRecording(false));
</script>

<template>
  <dialog class="announcements-modal" ref="dialogRef">
    <header class="dialog-header">
      <h3>Annonces des stations</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <p class="hint">
      Enregistrez votre voix (ou importez un fichier audio) pour chaque
      station : l'écran la jouera à l'approche et à l'arrivée, à la place
      de la synthèse vocale. Les annonces sont conservées sur cet appareil
      et réutilisées dans toutes vos courses.
    </p>

    <p v-if="micError" class="error">
      Micro inaccessible — vérifiez l'autorisation du navigateur.
    </p>

    <p v-if="stopNames.length === 0" class="hint">
      Aucun arrêt dans la course actuelle.
    </p>

    <div class="stop-row" v-for="name in stopNames" :key="name">
      <span class="stop-name">
        {{ name }}
        <span v-if="hasRecording(name)" class="badge">annonce perso</span>
        <span v-else class="badge badge-tts">synthèse vocale</span>
      </span>
      <span class="actions">
        <button
          v-if="recordingFor !== name"
          class="btn"
          title="Enregistrer au micro"
          @click="startRecording(name)"
        >
          ● Enregistrer
        </button>
        <button
          v-else
          class="btn btn-recording"
          title="Terminer l'enregistrement"
          @click="stopRecording(true)"
        >
          ■ Terminer
        </button>
        <label class="btn" title="Importer un fichier audio">
          Importer
          <input
            type="file"
            accept="audio/*"
            class="file-input"
            @change="importFile(name, $event)"
          />
        </label>
        <button
          class="btn"
          :disabled="!hasRecording(name)"
          title="Écouter"
          @click="preview(name)"
        >
          ▶
        </button>
        <button
          class="btn"
          :disabled="!hasRecording(name)"
          title="Supprimer l'annonce"
          @click="removeRecording(name)"
        >
          🗑
        </button>
      </span>
    </div>
  </dialog>
</template>

<style scoped>
.announcements-modal {
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #1a1a1a;
  padding: 24px;
  width: min(600px, 94vw);
  max-height: 84vh;
  overflow-y: auto;
}

.announcements-modal::backdrop {
  background: rgba(0, 0, 0, 0.45);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dialog-header h3 {
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.1em;
  cursor: pointer;
}

.hint {
  color: #4b5563;
  font-size: 0.9em;
  margin: 0 0 14px;
}

.error {
  color: #b91c1c;
}

.stop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.stop-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge {
  font-size: 0.72em;
  font-weight: 600;
  background: #dcfce7;
  color: #166534;
  border-radius: 999px;
  padding: 2px 8px;
}

.badge-tts {
  background: #f3f4f6;
  color: #4b5563;
}

.actions {
  display: flex;
  gap: 6px;
}

.btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  color: #1f2937;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.85em;
}

.btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-recording {
  background: #fee2e2;
  border-color: #ef4444;
  color: #b91c1c;
}

.file-input {
  display: none;
}
</style>
