import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactCard from '@/components/Contacts/ContactCard';
import { Contact } from '@/types/contact';

const mockContact: Contact = {
  id: 'contact-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
};

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn()
};

describe('ContactCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contact information correctly', () => {
    render(<ContactCard contact={mockContact} {...mockHandlers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('123-456-7890')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ContactCard contact={mockContact} {...mockHandlers} />);

    const editButton = screen.getByLabelText('Edit contact');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockContact);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ContactCard contact={mockContact} {...mockHandlers} />);

    const deleteButton = screen.getByLabelText('Delete contact');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockContact);
  });

  it('should display contact name in correct format', () => {
    const contactWithLongName = {
      ...mockContact,
      firstName: 'VeryLongFirstName',
      lastName: 'VeryLongLastName'
    };

    render(<ContactCard contact={contactWithLongName} {...mockHandlers} />);

    expect(screen.getByText('VeryLongFirstName VeryLongLastName')).toBeInTheDocument();
  });

  it('should handle contact with missing phone number', () => {
    const contactWithoutPhone = {
      ...mockContact,
      phone: ''
    };

    render(<ContactCard contact={contactWithoutPhone} {...mockHandlers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.queryByText('123-456-7890')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ContactCard contact={mockContact} {...mockHandlers} />);

    const editButton = screen.getByLabelText('Edit contact');
    const deleteButton = screen.getByLabelText('Delete contact');

    expect(editButton).toHaveAttribute('aria-label', 'Edit contact');
    expect(deleteButton).toHaveAttribute('aria-label', 'Delete contact');
  });
});
