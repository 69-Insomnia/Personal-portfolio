/**
 * "What happens next" steps shown beside the contact form.
 * Edit freely — plain copy, no personal or client data.
 */
export interface ProcessStep {
  step: string;
  text: string;
}

export const contactProcess: ProcessStep[] = [
  { step: '01', text: 'I read every message myself.' },
  { step: '02', text: "If it's a fit, we book a short call." },
  { step: '03', text: 'You get a clear proposal, no fluff.' },
];
