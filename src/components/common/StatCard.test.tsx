import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard Component', () => {
  it('should render title and value correctly', () => {
    render(<StatCard title="Total Cards" value={100} />);

    expect(screen.getByText('Total Cards')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(<StatCard title="Studied" value={50} subtitle="50%" />);

    expect(screen.getByText('Studied')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should apply default blue theme', () => {
    const { container } = render(<StatCard title="Test" value={10} />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('bg-white');
  });

  it('should apply different color themes', () => {
    const icon = <span>📊</span>;
    const { container, rerender } = render(
      <StatCard title="Test" value={10} color="green" icon={icon} />
    );

    let card = container.firstChild as HTMLElement;
    expect(card.querySelector('.bg-green-50')).toBeInTheDocument();

    rerender(<StatCard title="Test" value={10} color="purple" icon={icon} />);
    card = container.firstChild as HTMLElement;
    expect(card.querySelector('.bg-purple-50')).toBeInTheDocument();

    rerender(<StatCard title="Test" value={10} color="orange" icon={icon} />);
    card = container.firstChild as HTMLElement;
    expect(card.querySelector('.bg-orange-50')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const icon = <span data-testid="icon">📊</span>;
    render(<StatCard title="Test" value={10} icon={icon} />);

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should handle number and string values', () => {
    const { rerender } = render(<StatCard title="Test" value={42} />);
    expect(screen.getByText('42')).toBeInTheDocument();

    rerender(<StatCard title="Test" value="42%" />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });
});

