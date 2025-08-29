import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Contact } from '@/types/contact';

interface DeleteContactModalProps {
  open: boolean;
  contact: Contact | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const DeleteContactModal: React.FC<DeleteContactModalProps> = ({
  open,
  contact,
  onClose,
  onConfirm,
  loading,
}) => {
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Contact</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete{' '}
          <strong>{contact?.firstName || 'Unknown'} {contact?.lastName || ''}</strong>?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteContactModal;