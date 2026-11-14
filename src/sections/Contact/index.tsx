'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, LoaderCircle, MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { SocialLinks } from '@/components/common/SocialLinks';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { contactProcess } from '@/data/contact';
import { profile } from '@/data/profile';
import { cn } from '@/utils/cn';
import { mailtoUrl, telUrl, whatsappUrl } from '@/utils/links';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface FormValues {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: '',
  email: '',
  company: '',
  service: '',
  budget: '',
  message: '',
};

const serviceOptions = [
  'Web Development',
  'SEO',
  'Meta Ads',
  'Google Ads',
  'Ecommerce',
  'Digital Marketing',
  'Other',
];

const budgetOptions = [
  'Not sure yet',
  'Under Rs.50,000',
  'Rs.50,000 – Rs.1,00,000',
  'Rs.1,00,000 – Rs.5,00,000',
  'Rs.5,00,000+',
];

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please add a few details about your project.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'A little more detail helps. At least a sentence.';
  }

  return errors;
}

/**
 * `showHeading` is false on `/contact`, which already opens with an `<h1>`
 * carrying this exact sentence. Rendering the section heading there too would
 * put the same line on the page twice, once as an `<h1>` and once as an `<h2>`
 * immediately below it — a duplicate heading is the one thing a search engine
 * reads as boilerplate. Same pattern as `Projects`' `showHeading`.
 */
export function Contact({ showHeading = true }: { showHeading?: boolean }) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  // Fields sit raised ON the form panel rather than sharing its fill: a border
  // at 12% alpha over a background the same colour as the panel behind it
  // composites to well under the 3:1 that WCAG 1.4.11 asks of a component
  // boundary. `outline-none` is also gone — for a text field the outline is the
  // focus indicator, and a border colour change alone is too thin to rely on.
  const fieldClass = (field: keyof FormValues) =>
    cn(
      'w-full rounded-card border bg-surface px-4 py-3 text-base transition-colors duration-200 placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent-soft',
      errors[field] ? 'border-danger' : 'border-line-strong',
    );

  const handleChange =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setValues((previous) => ({ ...previous, [field]: event.target.value }));
      if (errors[field]) {
        setErrors((previous) => ({ ...previous, [field]: undefined }));
      }
      if (status === 'error') {
        setStatus('idle');
      }
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setStatus('submitting');

    try {
      const { getSupabase } = await import('@/lib/supabase-browser');
      const { error } = await getSupabase()
        .from('messages')
        .insert({
          name: values.name.trim(),
          email: values.email.trim(),
          company: values.company.trim() || null,
          service: values.service || null,
          budget: values.budget || null,
          message: values.message.trim(),
        });

      if (error) {
        setStatus('error');
        return;
      }
      setStatus('success');
      setValues(initialValues);
    } catch {
      setStatus('error');
    }
  };

  const waHref = whatsappUrl(profile.whatsapp);
  const telHref = telUrl(profile.whatsapp);
  const hasSocials = Object.values(profile.socialLinks).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return (
    <Section id="contact" className="border-t border-line bg-surface">
      <Container>
        {showHeading ? (
          <SectionHeading
            section="contact"
            title="Tell me what you're trying to build"
            description="A store, better search visibility, paid campaigns, or a site that finally converts. Start wherever you are."
          />
        ) : null}

        <div className={cn('grid gap-6 lg:grid-cols-12 lg:gap-8', showHeading && 'mt-14')}>
          {/* Form — the wide column. */}
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <Card className="p-6 md:p-8">
                {status === 'success' ? (
                  <div
                    role="status"
                    className="flex min-h-[24rem] flex-col items-start justify-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <CircleCheck size={22} aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-h3">Message sent.</h3>
                    <p className="mt-2 max-w-sm leading-relaxed text-muted">
                      Thanks for reaching out. I read every message myself and usually reply
                      within a day.
                    </p>
                    <div className="mt-6">
                      <Button variant="outline" onClick={() => setStatus('idle')}>
                        Send another message
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="contact-name" className="text-sm font-medium">
                          Name <span className="text-accent" aria-hidden>*</span>
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          aria-required="true"
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? 'contact-name-error' : undefined}
                          placeholder="Your name"
                          value={values.name}
                          onChange={handleChange('name')}
                          className={cn('mt-2', fieldClass('name'))}
                        />
                        {errors.name ? (
                          <p id="contact-name-error" className="mt-1.5 text-sm text-danger">
                            {errors.name}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="contact-email" className="text-sm font-medium">
                          Email <span className="text-accent" aria-hidden>*</span>
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          aria-required="true"
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={errors.email ? 'contact-email-error' : undefined}
                          placeholder="you@company.com"
                          value={values.email}
                          onChange={handleChange('email')}
                          className={cn('mt-2', fieldClass('email'))}
                        />
                        {errors.email ? (
                          <p id="contact-email-error" className="mt-1.5 text-sm text-danger">
                            {errors.email}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="contact-company" className="text-sm font-medium">
                          Company <span className="font-normal text-muted">(optional)</span>
                        </label>
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          placeholder="Company name"
                          value={values.company}
                          onChange={handleChange('company')}
                          className={cn('mt-2', fieldClass('company'))}
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-service" className="text-sm font-medium">
                          Service
                        </label>
                        <div className="relative mt-2">
                          <select
                            id="contact-service"
                            name="service"
                            value={values.service}
                            onChange={handleChange('service')}
                            className={cn(fieldClass('service'), 'appearance-none pr-10')}
                          >
                            <option value="">Select a service</option>
                            {serviceOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={15}
                            aria-hidden
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="contact-budget" className="text-sm font-medium">
                          Budget
                        </label>
                        <div className="relative mt-2">
                          <select
                            id="contact-budget"
                            name="budget"
                            value={values.budget}
                            onChange={handleChange('budget')}
                            className={cn(fieldClass('budget'), 'appearance-none pr-10')}
                          >
                            <option value="">Select a budget range</option>
                            {budgetOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={15}
                            aria-hidden
                            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="contact-message" className="text-sm font-medium">
                          Message <span className="text-accent" aria-hidden>*</span>
                        </label>
                        <textarea
                          id="contact-message"
                          name="message"
                          rows={5}
                          required
                          aria-required="true"
                          aria-invalid={Boolean(errors.message)}
                          aria-describedby={errors.message ? 'contact-message-error' : undefined}
                          placeholder="Tell me about the project, timeline and goals..."
                          value={values.message}
                          onChange={handleChange('message')}
                          className={cn('mt-2 resize-y', fieldClass('message'))}
                        />
                        {errors.message ? (
                          <p id="contact-message-error" className="mt-1.5 text-sm text-danger">
                            {errors.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {status === 'error' ? (
                      <p
                        role="alert"
                        className="mt-5 flex items-center gap-2 rounded-card border border-danger px-4 py-3 text-sm text-danger"
                      >
                        <CircleAlert size={15} aria-hidden />
                        Something went wrong. Please try again.
                      </p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={status === 'submitting'}
                        showArrow={status !== 'submitting'}
                      >
                        {status === 'submitting' ? (
                          <>
                            <LoaderCircle size={16} aria-hidden className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send enquiry'
                        )}
                      </Button>
                      <p className="text-sm text-muted">I usually reply within 24 hours.</p>
                    </div>
                  </form>
                )}
              </Card>
            </Reveal>
          </div>

          {/*
            The right column was four separate panels — Direct, Fastest,
            Elsewhere, What happens next — each with its own border, its own
            label and its own top margin. Four boxes to convey one thing ("here
            is how to reach me, and here is what happens if you do") reads as a
            dashboard.

            It is now one card with three sections divided by rules, which is
            the same information at a third of the visual weight.
          */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <Card className="p-6 md:p-7">
                <p className="text-sm font-medium text-ink">Reach me directly</p>

                <div className="mt-4 flex flex-col gap-2.5">
                  {profile.email ? (
                    <a
                      href={mailtoUrl(profile.email) ?? undefined}
                      className="flex min-h-[44px] items-center gap-2.5 text-[15px] break-all text-muted transition-colors duration-200 hover:text-accent"
                    >
                      <Mail size={16} aria-hidden className="shrink-0 text-accent" />
                      {profile.email}
                    </a>
                  ) : null}

                  {telHref ? (
                    <a
                      href={telHref}
                      className="flex min-h-[44px] items-center gap-2.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                      aria-label={`Call ${profile.whatsapp}`}
                    >
                      <Phone size={16} aria-hidden className="shrink-0 text-accent" />
                      {profile.whatsapp}
                    </a>
                  ) : null}

                  {profile.location ? (
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Kathmandu%2C%20Nepal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-[44px] items-center gap-2.5 text-[15px] text-muted transition-colors duration-200 hover:text-accent"
                      aria-label={`View ${profile.location} service area on Google Maps`}
                    >
                      <MapPin size={16} aria-hidden className="shrink-0 text-accent" />
                      {profile.location}
                    </a>
                  ) : null}
                </div>

                {waHref ? (
                  <Button
                    href={waHref}
                    variant="whatsapp"
                    size="lg"
                    className="mt-5 w-full"
                    ariaLabel={`Message me on WhatsApp at ${profile.whatsapp}`}
                  >
                    <WhatsAppIcon size={17} className="mr-2" aria-hidden />
                    Message me on WhatsApp
                  </Button>
                ) : null}

                <div className="mt-7 border-t border-line pt-6">
                  <p className="text-sm font-medium text-ink">What happens next</p>
                  <ol className="mt-4 space-y-3">
                    {contactProcess.map((item) => (
                      <li key={item.text} className="flex gap-3">
                        <span
                          aria-hidden
                          className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-marigold"
                        />
                        <span className="text-[15px] leading-relaxed text-muted">
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {hasSocials ? (
                  <div className="mt-7 border-t border-line pt-6">
                    <p className="text-sm font-medium text-ink">Elsewhere</p>
                    <SocialLinks links={profile.socialLinks} className="mt-4" />
                  </div>
                ) : null}
              </Card>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
