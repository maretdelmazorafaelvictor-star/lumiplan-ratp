<script setup lang="ts">
import { computed, ref } from "vue";
import { CustomIndex, Line, Mode, SaveFile } from "../../types";
import { publicPath, SAVE_FILE_VERSION } from "../../utils";
import LineLogo from "../Other/LineLogo.vue";

/**
 * Lignes préconfigurées issues des presets BULB-MAX : choix de la ligne,
 * puis de la branche pour les lignes qui en ont plusieurs, puis des
 * horaires fictifs (heure de départ + intervalle), et chargement comme
 * service courant.
 */

interface PresetStop {
  id: string;
  name: string;
  subtitle?: string;
  isAccessible: boolean;
  hasGapWhenSteppingOff: boolean;
  connectedLines: Line[];
}

interface PresetPath {
  label: string;
  stops: PresetStop[];
}

interface PresetEntry {
  id: string;
  label: string;
  line: Line & { customIndex?: CustomIndex };
  paths: PresetPath[];
}

const emit = defineEmits<{
  (e: "load", saveFile: SaveFile): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);
const presets = ref<PresetEntry[]>([]);
const loadError = ref(false);
const search = ref("");
const selected = ref<PresetEntry | null>(null);
const selectedPathIndex = ref(0);
const departure = ref("");
const intervalMinutes = ref(2);

const DEFAULT_INTERVALS: Partial<Record<Mode, number>> = {
  [Mode.METRO]: 1.5,
  [Mode.TRAM]: 2,
  [Mode.TRAM_TRAIN]: 3,
  [Mode.RER]: 4,
  [Mode.TRANSILIEN]: 5,
};

const open = async () => {
  dialogRef.value?.showModal();
  resetSelection();
  if (presets.value.length === 0) {
    try {
      const response = await fetch(publicPath("/data/bulbmax-presets.json"));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      presets.value = (await response.json()).presets;
    } catch (error) {
      console.error("Chargement des presets impossible :", error);
      loadError.value = true;
    }
  }
};
const close = () => dialogRef.value?.close();
defineExpose({ open, close });

const resetSelection = () => {
  selected.value = null;
  selectedPathIndex.value = 0;
  search.value = "";
  const inFiveMinutes = new Date(Date.now() + 5 * 60_000);
  inFiveMinutes.setSeconds(0, 0);
  // datetime-local attend l'heure locale sans fuseau
  const offset = inFiveMinutes.getTimezoneOffset() * 60_000;
  departure.value = new Date(inFiveMinutes.getTime() - offset)
    .toISOString()
    .slice(0, 16);
};

const filteredPresets = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return presets.value;
  return presets.value.filter((p) => p.label.toLowerCase().includes(query));
});

const selectPreset = (preset: PresetEntry) => {
  selected.value = preset;
  selectedPathIndex.value = 0;
  intervalMinutes.value = DEFAULT_INTERVALS[preset.line.mode] ?? 2;
};

const loadJourney = () => {
  const preset = selected.value;
  if (!preset) return;
  const path = preset.paths[selectedPathIndex.value];
  if (!path || path.stops.length < 2) return;

  const start = new Date(departure.value);
  const lastIndex = path.stops.length - 1;
  const allLines = new Map<string, Line>([[preset.line.id, preset.line]]);

  const stops = path.stops.map((stop, i) => {
    stop.connectedLines.forEach((l) => allLines.set(l.id, l));
    const arrival = new Date(
      start.getTime() + i * intervalMinutes.value * 60_000,
    );
    return {
      stop,
      timeOfArrival: arrival.toISOString(),
      timeOfDeparture: new Date(arrival.getTime() + 30_000).toISOString(),
      isTerminus: i === lastIndex,
      isFirstStop: i === 0,
      isStopSkipped: false,
    };
  });

  const saveFile: SaveFile = {
    header: {
      dateTime: new Date().toISOString(),
      version: SAVE_FILE_VERSION,
      name: preset.label,
    },
    lines: Array.from(allLines.values()),
    journey: {
      line: preset.line,
      desserte: {
        id: preset.id + ":" + selectedPathIndex.value,
        direction: path.stops[lastIndex].name,
        isLimitedService: false,
        stops,
      },
    },
    messages: [],
  };

  emit("load", saveFile);
  close();
};
</script>

<template>
  <dialog class="bulbmax-presets" ref="dialogRef">
    <header class="dialog-header">
      <h3>Lignes préconfigurées</h3>
      <button class="close-btn" @click="close" title="Fermer">✕</button>
    </header>

    <p v-if="loadError" class="error">
      Impossible de charger les lignes préconfigurées.
    </p>

    <template v-else-if="!selected">
      <input
        type="text"
        v-model="search"
        placeholder="Rechercher une ligne (ex: RER B, Métro 7...)"
        class="search-input"
      />
      <div class="preset-list">
        <button
          v-for="preset in filteredPresets"
          :key="preset.id"
          class="preset-item"
          @click="selectPreset(preset)"
        >
          <LineLogo :line="preset.line" className="" size="1.6em" />
          <span>{{ preset.label }}</span>
          <span v-if="preset.paths.length > 1" class="branch-count"
            >{{ preset.paths.length }} branches</span
          >
        </button>
      </div>
    </template>

    <template v-else>
      <button class="btn btn-sm back-btn" @click="selected = null">
        ← Autre ligne
      </button>

      <div class="selected-line">
        <LineLogo :line="selected.line" className="" size="2em" />
        <strong>{{ selected.label }}</strong>
      </div>

      <div class="field-group" v-if="selected.paths.length > 1">
        <label for="preset-path">Branche</label>
        <select id="preset-path" v-model="selectedPathIndex">
          <option v-for="(path, i) in selected.paths" :key="i" :value="i">
            {{ path.label }}
          </option>
        </select>
      </div>
      <p v-else class="single-branch">{{ selected.paths[0].label }}</p>

      <div class="field-group">
        <label for="preset-departure">Départ du premier arrêt</label>
        <input id="preset-departure" type="datetime-local" v-model="departure" />
      </div>

      <div class="field-group">
        <label for="preset-interval">Minutes entre deux arrêts</label>
        <input
          id="preset-interval"
          type="number"
          min="0.5"
          step="0.5"
          v-model.number="intervalMinutes"
        />
      </div>

      <button class="btn btn-primary" @click="loadJourney">
        Charger cette course
      </button>
    </template>
  </dialog>
</template>

<style scoped>
.bulbmax-presets {
  border: none;
  border-radius: 12px;
  background: #ffffff;
  color: #1a1a1a;
  padding: 24px;
  width: min(520px, 92vw);
  max-height: 84vh;
  overflow-y: auto;
}

.bulbmax-presets::backdrop {
  background: rgba(0, 0, 0, 0.45);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
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

.error {
  color: #b91c1c;
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 12px;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preset-item {
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  padding: 8px 12px;
  cursor: pointer;
  text-align: left;
}

.preset-item:hover {
  border-color: #0a0086;
  background: #f3f4ff;
}

.branch-count {
  margin-left: auto;
  font-size: 0.8em;
  color: #4b5563;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 2px 8px;
}

.back-btn {
  margin-bottom: 12px;
}

.selected-line {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.single-branch {
  color: #4b5563;
  font-size: 0.9em;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.field-group select,
.field-group input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.btn {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f9fafb;
  padding: 6px 12px;
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
