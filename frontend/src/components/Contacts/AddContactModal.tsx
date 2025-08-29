import React, { useState } from 'react';
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
import { CreateContactRequest } from '@/types/contact';

interface AddContactModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContactRequest) => Promise<void>;
  loading: boolean;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState<CreateContactRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const handleChange = (field: keyof CreateContactRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Contact</DialogTitle>
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
          
          {loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Creating contact... This may take up to 30 seconds due to server processing.
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
            {loading ? 'Creating...' : 'Create Contact'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddContactModal;