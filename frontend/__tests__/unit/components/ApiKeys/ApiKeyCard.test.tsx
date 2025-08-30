import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiKeyCard from '@/components/ApiKeys/ApiKeyCard';
import { ApiKey } from '@/types/apiKey';

const mockApiKey: ApiKey = {
  id: 'key-123',
  name: 'Test API Key',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  lastUsedAt: null,
  expiresAt: null
};

const mockHandlers = {
  onRevoke: jest.fn(),
  onDelete: jest.fn(),
  onRestore: jest.fn()
};

describe('ApiKeyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render API key information correctly', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    expect(screen.getByText('Test API Key')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last used:/)).toBeInTheDocument();
  });

  it('should show revoke option for active keys', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Revoke Key')).toBeInTheDocument();
  });

  it('should show restore and delete options for revoked keys', () => {
    const revokedKey = { ...mockApiKey, isActive: false };
    render(<ApiKeyCard apiKey={revokedKey} {...mockHandlers} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    expect(screen.getByText('Restore Key')).toBeInTheDocument();
    expect(screen.getByText('Delete Permanently')).toBeInTheDocument();
  });

  it('should call onRevoke when revoke is clicked', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const revokeButton = screen.getByText('Revoke Key');
    fireEvent.click(revokeButton);

    expect(mockHandlers.onRevoke).toHaveBeenCalledWith(mockApiKey.id);
  });

  it('should call onRestore when restore is clicked', () => {
    const revokedKey = { ...mockApiKey, isActive: false };
    render(<ApiKeyCard apiKey={revokedKey} {...mockHandlers} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const restoreButton = screen.getByText('Restore Key');
    fireEvent.click(restoreButton);

    expect(mockHandlers.onRestore).toHaveBeenCalledWith(revokedKey.id);
  });

  it('should call onDelete when delete is clicked', () => {
    const revokedKey = { ...mockApiKey, isActive: false };
    render(<ApiKeyCard apiKey={revokedKey} {...mockHandlers} />);

    const menuButton = screen.getByRole('button');
    fireEvent.click(menuButton);

    const deleteButton = screen.getByText('Delete Permanently');
    fireEvent.click(deleteButton);

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(revokedKey.id);
  });

  it('should display warning for revoked keys', () => {
    const revokedKey = { ...mockApiKey, isActive: false };
    render(<ApiKeyCard apiKey={revokedKey} {...mockHandlers} />);

    expect(screen.getByText(/This API key has been revoked/)).toBeInTheDocument();
  });

  it('should not display warning for active keys', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    expect(screen.queryByText(/This API key has been revoked/)).not.toBeInTheDocument();
  });

  it('should display expiration date when available', () => {
    const keyWithExpiration = {
      ...mockApiKey,
      expiresAt: new Date('2024-12-31')
    };

    render(<ApiKeyCard apiKey={keyWithExpiration} {...mockHandlers} />);

    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
  });

  it('should not display expiration date when not available', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    expect(screen.queryByText(/Expires:/)).not.toBeInTheDocument();
  });

  it('should display last used information correctly', () => {
    const keyWithLastUsed = {
      ...mockApiKey,
      lastUsedAt: new Date('2023-12-01T10:00:00Z')
    };

    render(<ApiKeyCard apiKey={keyWithLastUsed} {...mockHandlers} />);

    expect(screen.getByText(/Last used:/)).toBeInTheDocument();
  });

  it('should display "Never used" when lastUsedAt is null', () => {
    render(<ApiKeyCard apiKey={mockApiKey} {...mockHandlers} />);

    expect(screen.getByText(/Last used: Never used/)).toBeInTheDocument();
  });
});
