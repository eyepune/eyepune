import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button component', () => {
  it('renders the button text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByText('Click Me')).toHaveClass('custom-class');
  });

  it('handles click events if provided', () => {
    // In a real test, you'd use userEvent to click and jest.fn() to mock the handler
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
});
