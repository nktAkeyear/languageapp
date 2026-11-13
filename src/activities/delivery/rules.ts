/** Pure delivery rules: map geometry, time slots, evaluation. No text, no state. */
import type { Outcome } from '../../core/types';
import type {
  DeliveryChoice,
  DeliveryIssueKind,
  DeliveryRule,
  DeliveryShared,
  LandmarkId,
  MapCell,
  Relation,
  SlipSpec,
  SlipTime,
  TimeSlot,
} from '../../core/townTypes';

export function cellAt(map: MapCell[], col: number, row: number): MapCell | undefined {
  return map.find((c) => c.col === col && c.row === row);
}

export function landmarkCell(map: MapCell[], lm: LandmarkId): MapCell | undefined {
  return map.find((c) => c.landmark === lm);
}

const isHouse = (c: MapCell | undefined): c is MapCell => !!c && !c.landmark;

/**
 * The map cell a relation points at, or null if it does not point at exactly one house.
 * Rows 0–1 are north of the main street (row 1 faces it), rows 2–3 south (row 2 faces it).
 * - behind: the back-row cell behind a street-facing landmark
 * - across: the cell on the other side of the street
 * - left / right: neighbour in the same row as drawn on the map
 * - next_to: the only house among the left/right neighbours
 */
export function resolveDest(map: MapCell[], rel: Relation, lm: LandmarkId): MapCell | null {
  const L = landmarkCell(map, lm);
  if (!L) return null;
  if (rel === 'at') return L;
  let target: MapCell | undefined;
  if (rel === 'behind') {
    if (L.row === 1) target = cellAt(map, L.col, 0);
    else if (L.row === 2) target = cellAt(map, L.col, 3);
  } else if (rel === 'across') {
    if (L.row === 1) target = cellAt(map, L.col, 2);
    else if (L.row === 2) target = cellAt(map, L.col, 1);
  } else if (rel === 'left') target = cellAt(map, L.col - 1, L.row);
  else if (rel === 'right') target = cellAt(map, L.col + 1, L.row);
  else if (rel === 'next_to') {
    const n = [cellAt(map, L.col - 1, L.row), cellAt(map, L.col + 1, L.row)].filter(isHouse);
    if (n.length === 1) target = n[0];
  }
  return isHouse(target) ? target : null;
}

/** Every (relation, landmark) description that points at this house, among allowed relations. */
export function descriptionsOf(map: MapCell[], cellId: string, rels: Relation[]): { rel: Relation; landmark: LandmarkId }[] {
  const out: { rel: Relation; landmark: LandmarkId }[] = [];
  for (const c of map) {
    if (!c.landmark) continue;
    for (const rel of rels) {
      const t = resolveDest(map, rel, c.landmark);
      if (t?.id === cellId) out.push({ rel, landmark: c.landmark });
    }
  }
  return out;
}

/** Slip time → hours that satisfy it. 12h numbers on slips are mapped to the slot hours. */
export function slotsFor(slots: TimeSlot[], t: SlipTime | undefined): number[] | null {
  if (!t) return null;
  if (t.kind === 'period') return slots.filter((s) => s.period === t.period).map((s) => s.hour);
  if (t.kind === 'at') return slots.filter((s) => s.hour === t.hour).map((s) => s.hour);
  if (t.kind === 'before') return slots.filter((s) => s.hour < t.hour).map((s) => s.hour);
  return slots.filter((s) => s.hour > t.hour).map((s) => s.hour);
}

/** 24h → 12h clock number as written on slips. */
export function clockNumber(hour: number): number {
  const h = hour % 12;
  return h === 0 ? 12 : h;
}

export function ruleFor(d: DeliveryShared, spec: SlipSpec): DeliveryRule | null {
  const dest = resolveDest(d.map, spec.dest.rel, spec.dest.landmark);
  if (!dest) return null;
  return {
    place: dest.id,
    slots: slotsFor(d.slots, spec.time),
    give: spec.give,
    avoid: spec.avoid,
    knocks: spec.knocks,
    absent: spec.absent,
  };
}

export const DELIVERY_ISSUE_PRIORITY: DeliveryIssueKind[] = [
  'wrong_place',
  'too_early',
  'too_late',
  'wrong_time',
  'avoided_person',
  'wrong_person',
  'wrong_absent',
  'wrong_knock',
];

/**
 * Evaluate the player's choices. `home` = somebody answers the door at the right house.
 * Outcome: perfect / minor (only the knock was off) / bad (handed to the person to avoid) / fail.
 */
export function evaluateDelivery(rule: DeliveryRule, c: DeliveryChoice, home: boolean): { issues: DeliveryIssueKind[]; outcome: Outcome } {
  const issues: DeliveryIssueKind[] = [];
  if (c.place !== rule.place) issues.push('wrong_place');
  if (rule.slots && (c.hour === null || !rule.slots.includes(c.hour))) {
    const h = c.hour ?? -1;
    if (rule.slots.every((s) => s > h)) issues.push('too_early');
    else if (rule.slots.every((s) => s < h)) issues.push('too_late');
    else issues.push('wrong_time');
  }
  if (c.place === rule.place) {
    if (home) {
      if (rule.avoid && c.person === rule.avoid) issues.push('avoided_person');
      else if (rule.give && c.person !== rule.give) issues.push('wrong_person');
      else if (!c.person) issues.push('wrong_person');
    } else if (c.absent !== (rule.absent ?? 'back')) issues.push('wrong_absent');
  }
  if (rule.knocks && c.knocks !== rule.knocks) issues.push('wrong_knock');
  issues.sort((a, b) => DELIVERY_ISSUE_PRIORITY.indexOf(a) - DELIVERY_ISSUE_PRIORITY.indexOf(b));
  let outcome: Outcome = 'perfect';
  if (issues.length) {
    if (issues.includes('avoided_person')) outcome = 'bad';
    else if (issues.every((i) => i === 'wrong_knock')) outcome = 'minor';
    else outcome = 'fail';
  }
  return { issues, outcome };
}

/** A choice that satisfies the rule (for the validator / simulator / tests). */
export function witnessChoice(rule: DeliveryRule, home: boolean, slots: TimeSlot[]): DeliveryChoice {
  return {
    place: rule.place,
    hour: rule.slots ? rule.slots[0] ?? null : slots[0].hour,
    knocks: rule.knocks ?? 1,
    person: home ? (rule.give ?? 'mother') : null,
    absent: home ? null : (rule.absent ?? 'back'),
  };
}
