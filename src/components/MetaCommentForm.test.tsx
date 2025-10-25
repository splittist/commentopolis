import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MetaCommentForm } from './MetaCommentForm';

describe('MetaCommentForm', () => {
  it('should render form with all fields', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Create Meta-Comment')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Comment Text')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Include in Report')).toBeInTheDocument();
  });

  it('should have default values', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    const authorInput = screen.getByDisplayValue('Current User') as HTMLInputElement;
    const reportCheckbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(typeSelect.value).toBe('synthesis');
    expect(authorInput.value).toBe('Current User');
    expect(reportCheckbox.checked).toBe(false);
  });

  it('should call onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it('should call onSubmit with correct data when form is submitted', () => {
    const handleSubmit = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    const textArea = screen.getByPlaceholderText(/Enter your meta-comment/);
    const submitButton = screen.getByText('Create Meta-Comment');

    fireEvent.change(textArea, { target: { value: 'Test meta-comment #test' } });
    fireEvent.click(submitButton);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'synthesis',
        text: 'Test meta-comment #test',
        author: 'Current User',
        linkedComments: [],
        tags: [],
        includeInReport: false
      })
    );
  });

  it('should not submit when text is empty', () => {
    const handleSubmit = vi.fn();
    render(
      <MetaCommentForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Create Meta-Comment/i });
    fireEvent.click(submitButton);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should update type when changed', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const typeSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(typeSelect, { target: { value: 'question' } });

    expect(typeSelect.value).toBe('question');
  });

  it('should toggle includeInReport checkbox', () => {
    render(
      <MetaCommentForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});
