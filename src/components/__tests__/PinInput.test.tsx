import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { PinInput } from '../PinInput';

function Harness({ onComplete }: { onComplete?: (v: string) => void }) {
  const [v, setV] = useState('');
  return <PinInput value={v} onChange={setV} label="Transaction PIN" onComplete={onComplete} masked />;
}

describe('PinInput', () => {
  it('exposes a labelled group with one labelled input per digit', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: 'Transaction PIN' })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Digit \d of 6/)).toHaveLength(6);
  });

  it('moves focus forward as digits are typed and reports completion', async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.keyboard('482915');
    expect(onComplete).toHaveBeenCalledWith('482915');
  });

  it('ignores non-digits', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.keyboard('a1b2');
    expect((screen.getByLabelText('Digit 1 of 6') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Digit 2 of 6') as HTMLInputElement).value).toBe('2');
  });

  it('accepts a pasted code', async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.paste('739204');
    expect(onComplete).toHaveBeenCalledWith('739204');
  });

  it('Backspace on an empty box returns to the previous one', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText('Digit 1 of 6'));
    await user.keyboard('12{Backspace}');          // focus is on the empty 3rd box -> deletes the 2nd digit
    expect((screen.getByLabelText('Digit 2 of 6') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Digit 1 of 6') as HTMLInputElement).value).toBe('1');
    expect(screen.getByLabelText('Digit 2 of 6')).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Harness />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
