'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { settingsCopy } from '../../copy';
import { formatMoney } from '../../money/money';
import { TextField } from '../../components/ui/TextField';
import { Button } from '../../components/ui/Button';
import { useOnboardingApplication } from '../onboarding/useOnboardingApplication';
import { useNotificationPrefs } from '../../hooks/useNotificationPrefs';
import { useDefaultCurrency } from '../../hooks/useDefaultCurrency';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

const SECTIONS = [
  { id: 'profile', label: settingsCopy.sections.profile },
  { id: 'notifications', label: settingsCopy.sections.notifications },
  { id: 'defaults', label: settingsCopy.sections.defaults },
  { id: 'security', label: settingsCopy.sections.security },
  { id: 'appearance', label: settingsCopy.sections.appearance },
];

export function SettingsView() {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
      {/* Section nav */}
      <nav
        aria-label="Settings sections"
        className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-44 lg:flex-col"
      >
        {SECTIONS.map(({ id, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className="rounded-xl px-3.5 py-2 text-left text-sm font-semibold transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                color: isActive ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
              }}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Section content */}
      <div className="min-w-0 flex-1">
        {activeSection === 'profile' && <ProfileSection />}
        {activeSection === 'notifications' && <NotificationsSection />}
        {activeSection === 'defaults' && <DefaultsSection />}
        {activeSection === 'security' && <SecuritySection />}
        {activeSection === 'appearance' && <AppearanceSection />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section shells — each will be filled in subsequent steps
// ---------------------------------------------------------------------------

function ProfileSection() {
  const { data: application, isLoading, isError } = useOnboardingApplication();
  const copy = settingsCopy.profile;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {copy.sectionTitle}
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {copy.sectionSubtitle}
      </p>

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {copy.loading}
          </p>
        )}

        {isError && (
          <p className="text-sm" style={{ color: 'var(--color-danger)' }}>
            {copy.error}
          </p>
        )}

        {!isLoading && !isError && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileField
              label={copy.legalName}
              value={application?.business?.legalName ?? '—'}
            />
            <ProfileField
              label={copy.accountId}
              value={application?.approvedSummary?.accountId ?? '—'}
            />
            <ProfileField
              label={copy.segment}
              value={application?.approvedSummary?.segment ?? '—'}
            />
            <ProfileField
              label={copy.corridor}
              value={application?.approvedSummary?.corridor ?? '—'}
            />
            <ProfileField
              label={copy.monthlyLimit}
              value={
                application?.approvedSummary?.monthlyLimit
                  ? formatMoney(application.approvedSummary.monthlyLimit, { useCode: true })
                  : '—'
              }
            />
          </dl>
        )}
      </div>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{ backgroundColor: 'var(--color-surface-2)' }}
    >
      <dt className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {value}
      </dd>
    </div>
  );
}

function NotificationsSection() {
  const { prefs, toggle } = useNotificationPrefs();
  const copy = settingsCopy.notifications;

  const events = [
    { id: 'transferCompleted', label: copy.events.transferCompleted },
    { id: 'complianceHold',    label: copy.events.complianceHold },
    { id: 'documentRequested', label: copy.events.documentRequested },
  ];

  const channels = [
    { id: 'email', label: copy.channels.email },
    { id: 'sms',   label: copy.channels.sms },
    { id: 'push',  label: copy.channels.push },
  ];

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {copy.sectionTitle}
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {copy.sectionSubtitle}
      </p>

      {/* Below sm: stacked cards, each channel toggle laid out inline — avoids
          horizontal scrolling to reach a basic on/off control. */}
      <div className="mt-6 flex flex-col gap-3 sm:hidden">
        {events.map(({ id: eventId, label: eventLabel }) => (
          <div
            key={eventId}
            className="rounded-xl p-3.5"
            style={{ backgroundColor: 'var(--color-surface-2)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {eventLabel}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              {channels.map(({ id: channelId, label: channelLabel }) => (
                <label key={channelId} className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <ToggleSwitch
                    checked={prefs[eventId][channelId]}
                    onChange={() => toggle(eventId, channelId)}
                    label={`${eventLabel} via ${channelId}`}
                  />
                  {channelLabel}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* sm and up: full comparison table */}
      <div className="mt-6 hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr>
              {/* Empty top-left cell */}
              <th className="pb-3 text-left font-medium w-full" style={{ color: 'var(--color-text-secondary)' }} />
              {channels.map(({ id, label }) => (
                <th
                  key={id}
                  className="pb-3 px-4 text-center font-semibold whitespace-nowrap"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map(({ id: eventId, label: eventLabel }) => (
              <tr
                key={eventId}
                className="border-t"
                style={{ borderColor: 'var(--color-border-subtle)' }}
              >
                <td className="py-4 pr-4 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {eventLabel}
                </td>
                {channels.map(({ id: channelId }) => (
                  <td key={channelId} className="py-4 px-4 text-center">
                    <ToggleSwitch
                      checked={prefs[eventId][channelId]}
                      onChange={() => toggle(eventId, channelId)}
                      label={`${eventLabel} via ${channelId}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center" aria-label={label}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      {/* Track */}
      <span
        className="relative inline-block h-5 w-9 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: checked ? 'var(--color-brand-600)' : 'var(--color-surface-2)',
          border: `1px solid ${checked ? 'var(--color-brand-600)' : 'var(--color-border-subtle)'}`,
        }}
      >
        {/* Thumb */}
        <span
          className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-transform duration-200"
          style={{
            backgroundColor: 'var(--color-text-primary)',
            transform: checked ? 'translateX(1rem)' : 'translateX(0)',
          }}
        />
      </span>
    </label>
  );
}

function DefaultsSection() {
  const { preferredCurrency, setPreferredCurrency } = useDefaultCurrency();
  const copy = settingsCopy.defaults;

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {copy.sectionTitle}
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {copy.sectionSubtitle}
      </p>

      <div className="mt-6 max-w-xs">
        <label
          htmlFor="default-currency"
          className="mb-1.5 block text-sm font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {copy.label}
        </label>
        <div className="relative">
          <select
            id="default-currency"
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value)}
            className="w-full appearance-none rounded-sm px-3.5 py-2.5 pr-9 text-base outline-none"
            style={{
              background: 'var(--color-surface-2)',
              color: 'var(--color-text-primary)',
              border: '1px solid transparent',
            }}
          >
            {copy.options.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {/* Chevron — matches SelectField.jsx */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="var(--color-text-secondary)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          This reorders the balance cards on the Overview so your chosen currency appears first.
        </p>
      </div>
    </div>
  );
}

function SecuritySection() {
  const copy = settingsCopy.security;

  return (
    <div className="space-y-6">
      {/* Change password card */}
      <ChangePasswordForm copy={copy.changePassword} />

      {/* 2FA placeholder card */}
      <div
        className="rounded-2xl border p-4 sm:p-6"
        style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
              {copy.twoFactor.title}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {copy.twoFactor.description}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }}
          >
            {copy.twoFactor.badge}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Password-change form — client-side validation only, mock success state
// ---------------------------------------------------------------------------

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

function ChangePasswordForm({ copy }) {
  const [succeeded, setSucceeded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async () => {
    // Simulate a brief async call — no real API in this mock step.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSucceeded(true);
    reset();
  };

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <h3 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {copy.title}
      </h3>

      <form
        className="mt-6 space-y-5 max-w-sm"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <TextField
          label={copy.currentPassword.label}
          type="password"
          placeholder={copy.currentPassword.placeholder}
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <TextField
          label={copy.newPassword.label}
          type="password"
          placeholder={copy.newPassword.placeholder}
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <TextField
          label={copy.confirmPassword.label}
          type="password"
          placeholder={copy.confirmPassword.placeholder}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {succeeded && (
          <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
            {copy.success}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? copy.submitting : copy.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}

function AppearanceSection() {
  const copy = settingsCopy.appearance;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6"
      style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border-subtle)' }}
    >
      <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {copy.sectionTitle}
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        {copy.sectionSubtitle}
      </p>

      <div className="mt-6">
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border-subtle)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {copy.themeLabel}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {copy.themeHint}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {isDark ? 'Dark' : 'Light'}
            </span>
            <ThemeToggle size={34} />
          </div>
        </div>
      </div>
    </div>
  );
}

// SectionShell removed — all sections are now implemented.
