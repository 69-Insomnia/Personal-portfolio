'use client';

import { useState } from 'react';
import { FAQItem } from '@/components/common/FAQItem';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { faqs } from '@/data/faqs';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" className="border-t border-line bg-subtle">
      <Container>
        <SectionHeading
          section="faq"
          title="Questions, answered"
          description="The ones that actually arrive by email, in the order they tend to."
        />

        {/*
          The accordion sits in one white panel on the section's subtle band.
          The band is what separates this from the hairline lists above it —
          the FAQ reads as a single object lifted off the page rather than as
          another full-width ruled list.
        */}
        <Reveal delay={0.05}>
          <ul className="card mt-12 overflow-hidden !shadow-none">
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
      </Container>
    </Section>
  );
}
