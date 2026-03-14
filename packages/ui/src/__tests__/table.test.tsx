import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from '../components/table';

describe('Table', () => {
  function renderTable() {
    return render(
      <Table>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@test.com</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>bob@test.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total: 2</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
  }

  it('renders table element', () => {
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders caption', () => {
    renderTable();
    expect(screen.getByText('A list of users')).toBeInTheDocument();
  });

  it('renders column headers', () => {
    renderTable();
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument();
  });

  it('renders body cells', () => {
    renderTable();
    expect(screen.getByRole('cell', { name: 'Alice' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'alice@test.com' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Bob' })).toBeInTheDocument();
  });

  it('renders footer', () => {
    renderTable();
    expect(screen.getByText('Total: 2')).toBeInTheDocument();
  });

  it('renders two body rows', () => {
    renderTable();
    // 2 body + 1 header + 1 footer = 4 rows
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('table is wrapped in overflow container', () => {
    renderTable();
    const wrapper = screen.getByRole('table').parentElement;
    expect(wrapper?.className).toContain('overflow-auto');
  });

  it('applies custom className to Table', () => {
    render(<Table className="custom-table" data-testid="t"><TableBody><TableRow><TableCell>X</TableCell></TableRow></TableBody></Table>);
    expect(screen.getByRole('table').className).toContain('custom-table');
  });
});
