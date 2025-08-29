import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Contact, UpdateContactRequest } from '@/types/contact';

interface EditContactModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSubmit: (data: UpdateContactRequest) => Promise<void>;
  loading: boolean;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  open,
  contact,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<UpdateContactRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
      });
      setError('');
    }
  }, [contact]);

  const handleChange = (field: keyof UpdateContactRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSubmit(formData);
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.errors) {
        const emailError = error.response.data.errors.find((err: any) => err.field === 'email');
        if (emailError) {
          setError('You already have a contact with this email address');
          return;
        }
      }
      
      // Handle other errors
      setError(error.message || 'Failed to update contact. Please try again.');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Contact</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                disabled={loading}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                disabled={loading}
                margin="normal"
              />
            </Grid>
          </Grid>
          <TextField
            required
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            disabled={loading}
            margin="normal"
          />
          <TextField
            required
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={handleChange('phone')}
            disabled={loading}
            margin="normal"
          />
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Update Contact'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditContactModal;