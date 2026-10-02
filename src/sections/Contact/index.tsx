'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ChevronDown, CircleAlert, CircleCheck, LoaderCircle, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/components/ui/Reveal';
import { Section } from '@/components/ui/Section';
import { SocialLinks } from '@/components/common/SocialLinks';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { contactProcess } from '@/data/contact';
import { profile } from '@/data/profile';
import { cn } from '@/utils/cn';

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

export function Contact() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');

  // Fields sit raised ON the tinted form panel rather than sharing its fill.
  // Previously the only thing marking an input was a 12%-alpha border over a
  // background the same colour as the panel behind it, which composites to
  // well under the 3:1 that WCAG 1.4.11 asks of a component boundary.
  // `outline-none` is also gone — for a text field the outline is the focus
  // indicator, and the border colour change alone is too thin to rely on.
  const fieldClass = (field: keyof FormValues) =>
    cn(
      'w-full border bg-surface px-4 py-3 text-base transition-colors duration-300 placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent-soft',
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

  const whatsappDigits = profile.whatsapp?.replace(/\D/g, '') ?? '';
  const hasSocials = Object.values(profile.socialLinks).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return (
    <Section id="contact" className="bg-surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <div className="rounded-card border border-line bg-paper p-6 md:p-8">
                {status === 'success' ? (
                  <div role="status" className="flex min-h-[24rem] flex-col items-start justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <CircleCheck size={22} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-xl font-medium tracking-tight">
                      Message sent.
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
                      Thanks for reaching out. I&apos;ll get back to you as soon as I can.
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
                          <p id="contact-name-error" className="mt-1.5 text-xs text-danger">
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
                          <p id="contact-email-error" className="mt-1.5 text-xs text-danger">
                            {errors.email}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label htmlFor="contact-company" className="text-sm font-medium">
                          Company <span className="text-xs font-normal text-muted">(optional)</span>
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
                          <p id="contact-message-error" className="mt-1.5 text-xs text-danger">
                            {errors.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {status === 'error' ? (
                      <p
                        role="alert"
                        className="mt-5 flex items-center gap-2 border border-danger px-4 py-3 text-sm text-danger"
                      >
                        <CircleAlert size={15} aria-hidden />
                        Something went wrong. Please try again.
                      </p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center gap-4">
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
                          'Send Message'
                        )}
                      </Button>
                      <p className="text-xs text-muted">
                        I usually reply within 24 hours.
                      </p>
                    </div>
                   </form>
                )}
              </div>
            </Reveal>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {profile.email || profile.location ? (
              <Reveal delay={0.08}>
                <div className="rounded-card border border-line bg-subtle p-6">
                  <p className="text-label text-muted">Direct</p>
                  {profile.email ? (
                    profile.email.includes('@') ? (
                      <a
                        href={`mailto:${profile.email}`}
                        className="mt-3 block break-all py-1 text-base text-ink transition-colors duration-300 hover:text-accent"
                      >
                        {profile.email}
                      </a>
                    ) : (
                      <p className="mt-3 break-all text-base text-ink">{profile.email}</p>
                    )
                  ) : null}
                  {profile.location ? (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <MapPin size={14} aria-hidden className="text-accent" />
                      {profile.location}
                    </p>
                  ) : null}
                </div>
              </Reveal>
            ) : null}

            {whatsappDigits ? (
              <Reveal delay={0.12}>
                <div className="rounded-card border border-line bg-subtle p-6">
                  <p className="text-label text-muted">Fastest</p>
                  <Button
                    href={`https://wa.me/${whatsappDigits}`}
                    variant="whatsapp"
                    className="mt-4 w-full"
                    ariaLabel={`Chat on WhatsApp at ${profile.whatsapp}`}
                  >
                    <WhatsAppIcon size={17} className="mr-2" />
                    Chat on WhatsApp
                  </Button>
                  <Button
                    href={`tel:+${whatsappDigits}`}
                    variant="outline"
                    className="mt-3 w-full"
                    ariaLabel={`Call ${profile.whatsapp}`}
                  >
                    <Phone size={15} aria-hidden className="mr-2" />
                    {profile.whatsapp}
                  </Button>
                </div>
              </Reveal>
            ) : null}

            {hasSocials ? (
              <Reveal delay={0.16}>
                <div className="rounded-card border border-line bg-subtle p-6">
                  <p className="text-label text-muted">Elsewhere</p>
                  <SocialLinks links={profile.socialLinks} className="mt-4" />
                </div>
              </Reveal>
            ) : null}

            <Reveal delay={0.2}>
              <div className="rounded-card border border-line bg-subtle p-6">
                <p className="text-label text-muted">What happens next</p>
                <ol className="mt-4 space-y-3">
                  {contactProcess.map((item) => (
                    <li key={item.step} className="flex gap-3 text-sm leading-relaxed">
                      <span className="text-label font-semibold text-accent">{item.step}</span>
                      <span className="text-muted">{item.text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
