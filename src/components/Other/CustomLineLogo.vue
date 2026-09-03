<script setup lang="ts">
import { computed } from "vue";
import { CustomIndex } from "../../types";

/**
 * Rendu d'un pictogramme de ligne personnalisé (importé depuis BULB-MAX).
 * Reproduit les 5 formes : cercle, carré arrondi, lignes, rectangle,
 * rectangle coupé. Les formes sont dessinées via des masques SVG
 * (public/masks/) colorés en CSS, comme dans BULB-MAX.
 */
interface Props {
  customIndex: CustomIndex;
  size?: string;
}

const props = defineProps<Props>();

const LIGHT_TEXT = "#ffffff";
const DARK_TEXT = "#231f20";
const DARK_TEXT_RECT = "#24303B";

/** Luminance relative (sRGB) pour choisir la couleur du texte. */
function isDarkBackground(hexColor: string): boolean {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return true;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance < 0.4;
}

const shapeClass = computed(() => ({
  circle: props.customIndex.shape === "CIRCLE",
  "rounded-square": props.customIndex.shape === "ROUNDED_SQUARE",
  lines: props.customIndex.shape === "LINES",
  rectangle: props.customIndex.shape === "RECTANGLE",
  "cut-rectangle": props.customIndex.shape === "CUT_RECTANGLE",
}));

const maskUrl = computed(() => {
  switch (props.customIndex.shape) {
    case "ROUNDED_SQUARE":
      return "url(/masks/rounded_square.svg)";
    case "LINES":
      return "url(/masks/lines.svg)";
    case "RECTANGLE":
      return "url(/masks/rectangle.svg)";
    case "CUT_RECTANGLE":
      return "url(/masks/rectangle.svg)";
    default:
      return "url(/masks/circle.svg)";
  }
});

const textColor = computed(() => {
  const { shape, color } = props.customIndex;
  if (shape === "LINES") return DARK_TEXT;
  if (shape === "CUT_RECTANGLE") return LIGHT_TEXT;
  if (shape === "RECTANGLE")
    return isDarkBackground(color) ? LIGHT_TEXT : DARK_TEXT_RECT;
  return isDarkBackground(color) ? LIGHT_TEXT : DARK_TEXT;
});

const style = computed(() => ({
  "--picto-color": props.customIndex.color,
  "--picto-text-color": textColor.value,
  "--picto-mask": maskUrl.value,
  "--picto-size": props.size ?? "1em",
}));
</script>

<template>
  <div class="custom-line-logo" :class="shapeClass" :style="style">
    <div class="shape-layer" />
    <div
      v-if="customIndex.shape === 'CUT_RECTANGLE'"
      class="shape-layer cut-layer"
    />
    <span class="index">
      <span
        v-if="customIndex.prefix && customIndex.shape === 'LINES'"
        class="prefix"
        >{{ customIndex.prefix }}</span
      >
      <span>{{ customIndex.index }}</span>
      <span v-if="customIndex.suffix" class="suffix">{{
        customIndex.suffix
      }}</span>
    </span>
  </div>
</template>

<style scoped>
.custom-line-logo {
  position: relative;
  display: inline-block;
  font-size: var(--picto-size);
  min-width: 1em;
  width: 1em;
  min-height: 1em;
  height: 1em;
  overflow: hidden;
}

.shape-layer {
  position: absolute;
  inset: 0;
  mask: var(--picto-mask) no-repeat center;
  -webkit-mask: var(--picto-mask) no-repeat center;
  mask-size: 100%;
  -webkit-mask-size: 100%;
  background-color: var(--picto-color);
}

/* LINES : fond blanc arrondi derrière les deux barres */
.custom-line-logo.lines::before {
  content: "";
  position: absolute;
  inset: 0;
  background-color: white;
  border-radius: 0.0625em;
}

/* CUT_RECTANGLE : barre inférieure dans la couleur du picto,
   corps du rectangle en bleu nuit */
.custom-line-logo.cut-rectangle .shape-layer {
  background-color: #24303b;
  mask-position: top;
  -webkit-mask-position: top;
}
.custom-line-logo.cut-rectangle .cut-layer {
  mask: url(/masks/cut_rectangle.svg) no-repeat center;
  -webkit-mask: url(/masks/cut_rectangle.svg) no-repeat center;
  mask-size: 100%;
  -webkit-mask-size: 100%;
  mask-position: top;
  -webkit-mask-position: top;
  background-color: var(--picto-color);
}

.rectangle,
.cut-rectangle {
  min-width: 2em;
  width: 2em;
  min-height: 0.9em;
  height: 0.9em;
}

.index {
  display: flex;
  flex-direction: row;
  align-items: start;
  font-weight: 600;
  font-size: 0.6em;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--picto-text-color);
  line-height: 1;
  white-space: nowrap;
}

.lines .index {
  font-size: 0.5375em;
}

.rectangle .index,
.cut-rectangle .index {
  font-size: 0.5em;
}

.prefix {
  margin-right: 0.125em;
}

.suffix {
  font-size: 0.6em;
  margin-top: 0.35em;
}

.circle .index .suffix {
  font-size: 0.375em;
  margin-top: 0.8em;
  margin-right: -0.25em;
}
</style>
