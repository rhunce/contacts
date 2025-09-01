import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactCard from '../../components/Contacts/ContactCard';
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
const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();
const mockOnViewHistory = jest.fn();

describe('ContactCard', () => {
  beforeEach(() => {
    // Clear mock function calls before each test
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    // Check if contact name is displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    // Check if email is displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    
    // Check if phone is displayed
    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    
    // Check if initials are displayed in avatar
    expect(screen.getByText('JD')).toBeInTheDocument();
    
    // Check if last name initial chip is displayed
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('displays contact information correctly with all required fields', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    // Check if all required fields are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    const editButton = screen.getByTitle('Edit Contact');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockContact);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    const deleteButton = screen.getByTitle('Delete Contact');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockContact);
  });

  it('calls onViewHistory when history button is clicked', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    const historyButton = screen.getByTitle('View History');
    fireEvent.click(historyButton);

    expect(mockOnViewHistory).toHaveBeenCalledTimes(1);
    expect(mockOnViewHistory).toHaveBeenCalledWith(mockContact);
  });

  it('has proper accessibility attributes', () => {
    render(
      <ContactCard
        contact={mockContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    // Check if buttons have proper titles for screen readers
    expect(screen.getByTitle('Edit Contact')).toBeInTheDocument();
    expect(screen.getByTitle('Delete Contact')).toBeInTheDocument();
    expect(screen.getByTitle('View History')).toBeInTheDocument();
    
    // Check if the contact name is properly marked as a heading
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('John Doe');
  });

  it('handles contact with different name combinations', () => {
    const singleNameContact: Contact = {
      ...mockContact,
      firstName: 'Alice',
      lastName: 'Smith',
    };

    render(
      <ContactCard
        contact={singleNameContact}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewHistory={mockOnViewHistory}
      />
    );

    // Should display full name
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    
    // Avatar should show initials
    expect(screen.getByText('AS')).toBeInTheDocument();
    
    // Chip should show last name initial
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});
