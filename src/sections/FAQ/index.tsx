'use client';

import { useState } from 'react';
import { FAQItem } from '@/components/common/FAQItem';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { RevealText } from '@/components/ui/RevealText';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { faqs } from '@/data/faqs';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="border-t border-line bg-subtle">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <SectionLabel section="faq" />
              <RevealText as="h2" text="Questions, answered" className="mt-7 text-h2" />
              <p className="mt-5 max-w-sm border-l-2 border-marigold pl-5 text-[0.975rem] leading-relaxed text-muted">
                The ones that actually arrive by email, in the order they tend to.
              </p>
            </div>
          </div>

          <Reveal delay={0.05} className="lg:col-span-8">
            <ul className="flex flex-col gap-3">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
