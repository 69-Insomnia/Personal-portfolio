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
    <Section id="faq" className="border-t border-line">
      <Container>
        <SectionHeading
          section="faq"
          title="Questions, Answered"
          description="A quick overview of how I work, what I do and how a project usually starts."
        />

        <Reveal delay={0.05}>
          <ul className="mt-10 border-t border-line">
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
