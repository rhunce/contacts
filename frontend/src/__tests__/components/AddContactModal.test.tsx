import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddContactModal from '../../components/Contacts/AddContactModal';

// Mock the callback functions
const mockOnSubmit = jest.fn();
const mockOnClose = jest.fn();

describe('AddContactModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with form fields', () => {
    render(
      <AddContactModal
        open={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Check if modal title is displayed
    expect(screen.getByText('Add New Contact')).toBeInTheDocument();
    
    // Check if form fields are present
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Contact')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <AddContactModal
        open={true}
        onSubmit={mockOnSubmit}
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
      <AddContactModal
        open={false}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Modal should not be visible
    expect(screen.queryByText('Add New Contact')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/First Name/)).not.toBeInTheDocument();
  });

  it('allows user to input contact information', async () => {
    render(
      <AddContactModal
        open={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Get form fields
    const firstNameInput = screen.getByLabelText(/First Name/);
    const lastNameInput = screen.getByLabelText(/Last Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const phoneInput = screen.getByLabelText(/Phone/);

    // Type in the fields
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1-555-9876' } });

    // Check if values are set
    expect(firstNameInput).toHaveValue('Jane');
    expect(lastNameInput).toHaveValue('Smith');
    expect(emailInput).toHaveValue('jane.smith@example.com');
    expect(phoneInput).toHaveValue('+1-555-9876');
  });

  it('calls onSubmit with form data when form is submitted', async () => {
    render(
      <AddContactModal
        open={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Fill out the form
    const firstNameInput = screen.getByLabelText(/First Name/);
    const lastNameInput = screen.getByLabelText(/Last Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const phoneInput = screen.getByLabelText(/Phone/);

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1-555-9876' } });

    // Submit the form
    const submitButton = screen.getByText('Create Contact');
    fireEvent.click(submitButton);

    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-9876'
      });
    });
  });

  it('resets form data after successful submission', async () => {
    render(
      <AddContactModal
        open={true}
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
        loading={false}
      />
    );

    // Fill out and submit the form
    const firstNameInput = screen.getByLabelText(/First Name/);
    const lastNameInput = screen.getByLabelText(/Last Name/);
    const emailInput = screen.getByLabelText(/Email/);
    const phoneInput = screen.getByLabelText(/Phone/);

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1-555-9876' } });

    const submitButton = screen.getByText('Create Contact');
    fireEvent.click(submitButton);

    // Check if onSubmit was called with correct data
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-9876'
      });
    });

    // Check if form was reset (inputs are empty)
    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toHaveValue('');
    expect(emailInput).toHaveValue('');
    expect(phoneInput).toHaveValue('');
  });
});
