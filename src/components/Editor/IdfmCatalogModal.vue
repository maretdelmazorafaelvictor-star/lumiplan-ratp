<script setup lang="ts">
import { ref } from "vue";
import { Line } from "../../types";
import { IDFM_CATALOG, catalogEntryToLine } from "../../data/idfmCatalog";
import LineLogo from "../Other/LineLogo.vue";

const emit = defineEmits<{
  (e: "add-lines", lines: Line[]): void;
}>();

const props = defineProps<{
  existingLineIds: string[];
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

const open = () => dialogRef.value?.showModal();
const close = () => dialogRef.value?.close();
defineExpose({ open, close });

const isAdded = (id: string) => props.existingLineIds.includes(id);

const addOne = (entryId: string, group: string) => {
  const entry = IDFM_CATALOG[group].find((l) => l.id === entryId);
  if (!entry || isAdded(entry.id)) return;
  emit("add-lines", [catalogEntryToLine(entry)]);
};

const addGroup = (group: string) => {
  const lines = IDFM_CATALOG[group]
    .filter((l) => !isAdded(l.id))
    .map(catalogEntryToLine);
  if (lines.length) emit("add-lines", lines);
};

const addAll = () => {
  Object.keys(IDFM_CATALOG).forEach(addGroup);
};
</script>

<template>
  <dialog class="idfm-catalog" ref="dialogRef">
    <header class="dialog-header">
      <h3>Catalogue des lignes IDFM</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <p class="catalog-hint">
      Cliquez sur une ligne pour l'ajouter aux lignes disponibles, avec son
      nom et sa couleur officiels.
    </p>

    <button class="btn btn-primary add-all-btn" @click="addAll">
      Tout ajouter
    </button>

    <section
      v-for="(entries, group) in IDFM_CATALOG"
      :key="group"
      class="catalog-group"
    >
      <div class="catalog-group-header">
        <h4>{{ group }}</h4>
        <button class="btn btn-sm" @click="addGroup(String(group))">
          Ajouter le groupe
        </button>
      </div>
      <div class="catalog-lines">
        <button
          v-for="entry in entries"
          :key="entry.id"
          class="catalog-line"
          :class="{ added: isAdded(entry.id) }"
          :disabled="isAdded(entry.id)"
          :title="isAdded(entry.id) ? 'Déjà ajoutée' : 'Ajouter ' + entry.name"
          @click="addOne(entry.id, String(group))"
        >
          <LineLogo :line="entry" className="" size="1.75em" />
          <span class="catalog-line-name">{{ entry.name }}</span>
        </button>
      </div>
    </section>
  </dialog>
</template>

<style scoped>
.idfm-catalog {
  border: none;
  border-radius: 12px;
  padding: 24px;
  width: min(560px, 92vw);
  max-height: 84vh;
  overflow-y: auto;
}

.idfm-catalog::backdrop {
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

.catalog-hint {
  color: #4b5563;
  margin: 0 0 12px;
  font-size: 0.9em;
}

.add-all-btn {
  margin-bottom: 16px;
}

.catalog-group {
  margin-bottom: 18px;
}

.catalog-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.catalog-group-header h4 {
  margin: 0;
}

.catalog-lines {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.catalog-line {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  padding: 6px 10px;
  cursor: pointer;
}

.catalog-line:hover:not(:disabled) {
  border-color: #0a0086;
  background: #f3f4ff;
}

.catalog-line.added {
  opacity: 0.45;
  cursor: default;
}

.catalog-line-name {
  font-weight: 600;
}

.btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  padding: 4px 10px;
  cursor: pointer;
}

.btn-primary {
  background: #0a0086;
  border-color: #0a0086;
  color: #ffffff;
}

.btn-sm {
  font-size: 0.85em;
}
</style>
