/**
 * "What happens next" — the three steps beside the contact form.
 *
 * Edit freely; plain copy, no personal or client data.
 *
 * The `step` field ("01", "02", "03") that used to key this array is gone. The
 * contact panel now marks each line with a marigold dot: the ordinals were
 * numbered labels of the same kind the rest of the redesign removed, and in a
 * list of three the order is already carried by the reading order. The array
 * index is the React key now, which is stable because the list is static and
 * never reordered at runtime.
 */
export interface ProcessStep {
  text: string;
}

export const contactProcess: ProcessStep[] = [
  { text: 'I read every message myself — no autoresponder, no assistant.' },
  { text: "If it looks like a fit, we book a short call and I ask the awkward questions." },
  { text: 'You get a written proposal: the scope, the price, and what I would do first.' },
];
