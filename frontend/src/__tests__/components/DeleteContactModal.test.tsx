import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteContactModal from '../../components/Contacts/DeleteContactModal';
import { Contact } from '../../types/contact';

// Mock the contact data
const mockContact: Contact = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  owner: {
    id: 'user-1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock the callback functions
const mockOnConfirm = jest.fn();
const mockOnClose = jest.fn();

describe('DeleteContactModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with contact information', () => {
    render(
      <DeleteContactModal
        open={true}
        contact={mockContact}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Check if modal title is displayed
    expect(screen.getByText('Delete Contact')).toBeInTheDocument();
    
    // Check if contact name is displayed in confirmation message
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onConfirm when delete button is clicked', () => {
    render(
      <DeleteContactModal
        open={true}
        contact={mockContact}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        loading={false}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <DeleteContactModal
        open={true}
        contact={mockContact}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        loading={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not render when open is false', () => {
    render(
      <DeleteContactModal
        open={false}
        contact={mockContact}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Modal should not be visible
    expect(screen.queryByText('Delete Contact')).not.toBeInTheDocument();
    expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument();
  });

  it('displays warning message about permanent deletion', () => {
    render(
      <DeleteContactModal
        open={true}
        contact={mockContact}
        onConfirm={mockOnConfirm}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Check if warning message is displayed
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
  });
});
