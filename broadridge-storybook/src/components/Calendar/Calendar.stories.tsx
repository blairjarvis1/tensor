import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Calendar, CalendarDay, type DateRange, type DayState } from './Calendar';

const TODAY = new Date(2025, 8, 16); // fixed so the story matches Figma (September 2025)

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Figma: Calendar page. Click one date, or a start and an end in range mode. In Light mode the day text uses Text/Body On instead of Figma’s Text/Action/On Primary Default, which is near-white in both modes and would vanish on the light menu surface.',
      },
    },
  },
  args: { today: TODAY },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Range: Story = {
  render: (args) => {
    const [value, setValue] = useState<DateRange>({ start: new Date(2025, 8, 10), end: new Date(2025, 8, 14) });
    return <Calendar {...args} mode="range" value={value} onChange={(v) => setValue(v as DateRange)} />;
  },
};

export const Single: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date(2025, 8, 22));
    return <Calendar {...args} mode="single" value={value} onChange={(v) => setValue(v as Date)} />;
  },
};

export const WithLimits: Story = {
  name: 'Min and max dates',
  render: (args) => {
    const [value, setValue] = useState<Date>(new Date(2025, 8, 18));
    return <Calendar {...args} value={value} min={new Date(2025, 8, 8)} max={new Date(2025, 8, 26)} onChange={(v) => setValue(v as Date)} />;
  },
};

const states: { state: DayState; label: string; disabled?: boolean }[] = [
  { state: 'default', label: 'Default' },
  { state: 'active', label: 'Active' },
  { state: 'range', label: 'Range' },
  { state: 'outside', label: 'Outside month' },
  { state: 'default', label: 'Disabled', disabled: true },
  { state: 'hidden', label: 'Hidden' },
];

export const DayStates: Story = {
  name: 'Calendar button states',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--br-scale-600)', padding: 'var(--br-scale-400)', background: 'var(--br-surface-menu-default)', borderRadius: 'var(--br-radius-xlg)' }}>
      {states.map((s) => (
        <div key={s.label} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--br-scale-200)' }}>
          <CalendarDay state={s.state} disabled={s.disabled}>
            1
          </CalendarDay>
          <span className="br-text-bdy-xxsm-reg" style={{ color: 'var(--br-text-information-low)' }}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  ),
};
