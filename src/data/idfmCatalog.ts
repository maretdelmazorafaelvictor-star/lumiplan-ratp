import { Line, Mode } from "../types";

/**
 * Catalogue des lignes structurantes d'Île-de-France, avec les couleurs
 * du référentiel BULB-MAX. Permet d'ajouter des lignes prêtes à l'emploi
 * dans l'éditeur sans tout ressaisir à chaque fois.
 */

const DARK_TEXT = "#231f20";
const LIGHT_TEXT = "#ffffff";

interface CatalogEntry {
  id: string;
  name: string;
  color: string;
  textColor: string;
  mode: Mode;
}

const e = (
  id: string,
  name: string,
  color: string,
  textColor: string,
  mode: Mode,
): CatalogEntry => ({ id, name, color, textColor, mode });

export const IDFM_CATALOG: Record<string, CatalogEntry[]> = {
  Métro: [
    e("idfm:metro:1", "1", "#ffcd02", DARK_TEXT, Mode.METRO),
    e("idfm:metro:2", "2", "#006db8", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:3", "3", "#9b993b", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:3bis", "3bis", "#87d3df", DARK_TEXT, Mode.METRO),
    e("idfm:metro:4", "4", "#bb4a9b", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:5", "5", "#f78f4b", DARK_TEXT, Mode.METRO),
    e("idfm:metro:6", "6", "#77c696", DARK_TEXT, Mode.METRO),
    e("idfm:metro:7", "7", "#f59fb3", DARK_TEXT, Mode.METRO),
    e("idfm:metro:7bis", "7bis", "#77c696", DARK_TEXT, Mode.METRO),
    e("idfm:metro:8", "8", "#c5a3cd", DARK_TEXT, Mode.METRO),
    e("idfm:metro:9", "9", "#cec92a", DARK_TEXT, Mode.METRO),
    e("idfm:metro:10", "10", "#e0b03b", DARK_TEXT, Mode.METRO),
    e("idfm:metro:11", "11", "#8d6539", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:12", "12", "#008c5a", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:13", "13", "#87d3df", DARK_TEXT, Mode.METRO),
    e("idfm:metro:14", "14", "#662c91", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:15", "15", "#b80b4b", LIGHT_TEXT, Mode.METRO),
    e("idfm:metro:16", "16", "#f59fb3", DARK_TEXT, Mode.METRO),
    e("idfm:metro:17", "17", "#cec92a", DARK_TEXT, Mode.METRO),
    e("idfm:metro:18", "18", "#00b397", DARK_TEXT, Mode.METRO),
  ],
  RER: [
    e("idfm:rer:a", "A", "#ed1c2a", LIGHT_TEXT, Mode.RER),
    e("idfm:rer:b", "B", "#4c90cd", LIGHT_TEXT, Mode.RER),
    e("idfm:rer:c", "C", "#ffcd02", DARK_TEXT, Mode.RER),
    e("idfm:rer:d", "D", "#008c5a", LIGHT_TEXT, Mode.RER),
    e("idfm:rer:e", "E", "#bb4a9b", LIGHT_TEXT, Mode.RER),
  ],
  Transilien: [
    e("idfm:transilien:h", "H", "#8d6539", LIGHT_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:j", "J", "#cec92a", DARK_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:k", "K", "#9b993b", LIGHT_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:l", "L", "#c5a3cd", DARK_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:n", "N", "#00b397", DARK_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:p", "P", "#f78f4b", DARK_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:r", "R", "#f59fb3", DARK_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:u", "U", "#b80b4b", LIGHT_TEXT, Mode.TRANSILIEN),
    e("idfm:transilien:v", "V", "#9b993b", LIGHT_TEXT, Mode.TRANSILIEN),
  ],
  Tramway: [
    e("idfm:tram:t1", "T1", "#006db8", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t2", "T2", "#bb4a9b", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t3a", "T3a", "#f78f4b", DARK_TEXT, Mode.TRAM),
    e("idfm:tram:t3b", "T3b", "#008c5a", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t5", "T5", "#662c91", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t6", "T6", "#ed1c2a", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t7", "T7", "#8d6539", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t8", "T8", "#9b993b", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t9", "T9", "#4c90cd", LIGHT_TEXT, Mode.TRAM),
    e("idfm:tram:t10", "T10", "#9b993b", LIGHT_TEXT, Mode.TRAM),
  ],
  "Tram-train": [
    e("idfm:tramtrain:t4", "T4", "#e0b03b", DARK_TEXT, Mode.TRAM_TRAIN),
    e("idfm:tramtrain:t11", "T11", "#f78f4b", DARK_TEXT, Mode.TRAM_TRAIN),
    e("idfm:tramtrain:t12", "T12", "#b80b4b", LIGHT_TEXT, Mode.TRAM_TRAIN),
    e("idfm:tramtrain:t13", "T13", "#8d6539", LIGHT_TEXT, Mode.TRAM_TRAIN),
    e("idfm:tramtrain:t14", "T14", "#00b397", DARK_TEXT, Mode.TRAM_TRAIN),
  ],
  "VAL & câbles": [
    e("idfm:val:cdgval", "CDG VAL", "#f78f4b", DARK_TEXT, Mode.VAL),
    e("idfm:val:orlyval", "ORLYVAL", "#87d3df", DARK_TEXT, Mode.VAL),
    e("idfm:funicular:montmartre", "FUN", "#bb4a9b", LIGHT_TEXT, Mode.FUNICULAR),
    e("idfm:gondola:c1", "C1", "#4c90cd", LIGHT_TEXT, Mode.GONDOLA),
  ],
};

/** Convertit une entrée du catalogue en Line de l'éditeur. */
export const catalogEntryToLine = (entry: CatalogEntry): Line => ({ ...entry });
