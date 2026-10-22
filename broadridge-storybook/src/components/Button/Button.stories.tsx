import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { iconNames } from '../Icon/Icon';
import { Button, type ButtonSize, type ButtonVariant } from './Button';
import { CircleButton, IconTileButton, SquareIconButton, Stepper } from './ActionButtons';

const meta = {
  title: 'Components/Buttons',
  component: Button,
  args: { children: 'Maturity', variant: 'primary', size: 'medium', destructive: false, disabled: false, iconStart: 'close', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large'] },
    iconStart: { control: 'select', options: [undefined, ...iconNames] },
    iconEnd: { control: 'select', options: [undefined, ...iconNames] },
  },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary'];
const sizes: ButtonSize[] = ['small', 'medium', 'large'];
const cell = { padding: 'var(--br-scale-200) var(--br-scale-300)', verticalAlign: 'middle' } as const;
const head = { ...cell, color: 'var(--br-text-information-low)', textAlign: 'left' as const };

function Matrix({ destructive }: { destructive: boolean }) {
  return (
    <table className="br-text-bdy-xxsm-med" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={head} />
          <th style={head} />
          {sizes.map((s) => (
            <th key={s} style={head} colSpan={2}>
              {s[0].toUpperCase() + s.slice(1)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {variants.flatMap((v) =>
          [false, true].map((disabled) => (
            <tr key={`${v}-${disabled}`}>
              <td style={{ ...head, fontWeight: 600 }}>{disabled ? '' : v[0].toUpperCase() + v.slice(1)}</td>
              <td style={head}>{disabled ? 'Disabled' : 'Active'}</td>
              {sizes.flatMap((s) => [
                <td key={`${s}-l`} style={cell}>
                  <Button variant={v} size={s} destructive={destructive} disabled={disabled} iconStart="close" iconEnd="close">
                    {destructive ? 'Delete' : 'Maturity'}
                  </Button>
                </td>,
                <td key={`${s}-i`} style={cell}>
                  <Button variant={v} size={s} destructive={destructive} disabled={disabled} iconStart="close" aria-label="Remove" />
                </td>,
              ])}
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

export const AllVariants: Story = {
  name: 'All variants',
  parameters: { layout: 'fullscreen', docs: { description: { story: 'Hover and focus are live: point at a button or tab to it.' } } },
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
      <section>
        <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 8px' }}>Destructive: No</h3>
        <Matrix destructive={false} />
      </section>
      <section>
        <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 8px' }}>Destructive: Yes</h3>
        <Matrix destructive />
      </section>
    </div>
  ),
};

export const ActionButtons: Story = {
  name: 'Icon, square, circle & stepper',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const row = { display: 'flex', gap: 'var(--br-scale-400)', alignItems: 'center', flexWrap: 'wrap' } as const;
    const label = (t: string) => (
      <h3 className="br-text-h5-med" style={{ color: 'var(--br-text-headings)', margin: '0 0 8px' }}>
        {t}
      </h3>
    );
    return (
      <div style={{ display: 'grid', gap: 'var(--br-scale-800)' }}>
        <section>
          {label('Icon button (tile)')}
          <div style={row}>
            <IconTileButton icon="send-32">Send Price</IconTileButton>
            <IconTileButton icon="send-32" disabled>Send Price</IconTileButton>
            <IconTileButton variant="secondary" icon="add-2">Add</IconTileButton>
            <IconTileButton variant="secondary" icon="add-2" disabled>Add</IconTileButton>
          </div>
        </section>
        <section>
          {label('Square icon button')}
          <div style={row}>
            <SquareIconButton variant="primary" icon="check" aria-label="Confirm" />
            <SquareIconButton variant="primary" icon="check" aria-label="Confirm" disabled />
            <SquareIconButton icon="chevron-back" aria-label="Previous" />
            <SquareIconButton icon="chevron-forward" aria-label="Next" />
            <SquareIconButton icon="chevron-forward" aria-label="Next" disabled />
          </div>
        </section>
        <section>
          {label('Circle button')}
          <div style={row}>
            <CircleButton>Add from columns below to add</CircleButton>
            <CircleButton disabled>Add from columns below to add</CircleButton>
          </div>
        </section>
        <section>
          {label('Stepper')}
          <div style={row}>
            <Stepper action="remove" />
            <Stepper action="add" />
            <Stepper action="remove" disabled />
            <Stepper action="add" disabled />
          </div>
        </section>
      </div>
    );
  },
};
