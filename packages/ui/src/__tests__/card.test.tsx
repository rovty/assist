import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/card';

describe('Card', () => {
  it('renders card with children', () => {
    render(<Card data-testid="card">Card content</Card>);
    expect(screen.getByTestId('card')).toHaveTextContent('Card content');
  });

  it('applies custom className', () => {
    render(<Card data-testid="card" className="custom" />);
    expect(screen.getByTestId('card').className).toContain('custom');
  });

  it('renders full card composition', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Body content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('CardHeader has flex-col class', () => {
    render(<CardHeader data-testid="header">H</CardHeader>);
    expect(screen.getByTestId('header').className).toContain('flex-col');
  });

  it('CardContent has padding class', () => {
    render(<CardContent data-testid="content">C</CardContent>);
    expect(screen.getByTestId('content').className).toContain('p-6');
  });

  it('CardFooter has flex class', () => {
    render(<CardFooter data-testid="footer">F</CardFooter>);
    expect(screen.getByTestId('footer').className).toContain('flex');
  });
});
