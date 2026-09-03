import { useClock } from "./composables/useClock";
import { CustomIndexShape, Line, Mode, SaveFile } from "./types";

export const getSecondesFromDate = (
  dateString: string,
  allowNegativesValues = false,
): number => {
  const { now } = useClock();

  const current = now.value;
  const inputDate = new Date(dateString);

  const target = new Date(current);
  target.setHours(
    inputDate.getHours(),
    inputDate.getMinutes(),
    inputDate.getSeconds(),
    inputDate.getMilliseconds(),
  );

  const diff = Math.floor((target.getTime() - current.getTime()) / 1000);

  return allowNegativesValues ? diff : Math.max(0, diff);
};

export const getMinutesFromDate = (dateString: string): number => {
  return Math.max(0, Math.floor(getSecondesFromDate(dateString) / 60));
};
/**
 * Clean and strip a stop id or a line id
 * From STIF::Line:C01742: to C01742 or from STIF::StopPoint:SP:18455: to 18455
 * @param id
 * @returns  string
 */
export const cleanId = (id: string): string => {
  return id
    .toLocaleUpperCase()
    .replace("FR-IDF", "")
    .split(":")
    .filter((s) => s)
    .pop() as string;
};

// Fonction qui enlève les parenthèses et ce qu'il y a dedans
export const cleanText = (text: string): string => {
  return text.replace(/\(.*?\)/g, "").trim();
};
// Fonction qui récupère uniquement ce qu'il y a entre les parenthèses
export const extractTextInParentheses = (text: string): string => {
  const match = text.match(/\((.*?)\)/);
  return match ? match[1] : "";
};
export const sortedLines = (lines: Line[]): Line[] => {
  const modeOrder = [
    Mode.RER,
    Mode.TRANSILIEN,
    Mode.METRO,
    Mode.CABLE,
    Mode.TRAM,
    Mode.TER,
    Mode.BUS,
    Mode.NOCTILIEN,
  ];

  return lines.sort((a, b) => {
    const aIndex = modeOrder.indexOf(a.mode);
    const bIndex = modeOrder.indexOf(b.mode);
    if (aIndex === bIndex) {
      // on essaie de parser en chiffre
      const aNumber = parseInt(a.name, 10);
      const bNumber = parseInt(b.name, 10);
      if (!isNaN(aNumber) && !isNaN(bNumber)) {
        return aNumber - bNumber;
      }
      return a.name.localeCompare(b.name);
    }
    return aIndex - bIndex;
  });
};

/* ///////////// SaveFile v2 (pictos personnalisés BULB-MAX) ///////////// */


/** Version écrite dans l'en-tête des sauvegardes de l'éditeur. */
export const SAVE_FILE_VERSION = "2.0.0";

const VALID_SHAPES: CustomIndexShape[] = [
  "CIRCLE",
  "ROUNDED_SQUARE",
  "LINES",
  "RECTANGLE",
  "CUT_RECTANGLE",
];

/**
 * Nettoie le champ customIndex d'une ligne : s'il est absent (sauvegarde
 * v1) on ne touche à rien ; s'il est présent mais invalide, on le retire
 * pour retomber sur le rendu standard plutôt que de casser l'affichage.
 */
function sanitizeLineCustomIndex(line: Line | null | undefined): void {
  if (!line || !line.customIndex) return;
  const ci = line.customIndex;
  const isValid =
    typeof ci === "object" &&
    typeof ci.index === "string" &&
    ci.index.length > 0 &&
    typeof ci.color === "string" &&
    ci.color.length > 0 &&
    VALID_SHAPES.includes(ci.shape);
  if (!isValid) {
    delete line.customIndex;
  }
}

/**
 * Normalise un SaveFile après JSON.parse, quel que soit son numéro de
 * version (v1 sans pictos personnalisés, v2 avec). À appeler avant
 * d'injecter les données dans l'éditeur.
 */
export function normalizeSaveFile(data: SaveFile): SaveFile {
  (data.lines || []).forEach(sanitizeLineCustomIndex);
  sanitizeLineCustomIndex(data.journey?.line);
  data.journey?.desserte?.stops?.forEach((s) => {
    (s.stop?.connectedLines || []).forEach(sanitizeLineCustomIndex);
  });
  return data;
}
