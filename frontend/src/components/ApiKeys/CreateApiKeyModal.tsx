import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close, Info } from '@mui/icons-material';
import { CreateApiKeyRequest } from '@/types/apiKey';

interface CreateApiKeyModalProps {
  onClose: () => void;
  onSubmit: (data: CreateApiKeyRequest) => void;
}

const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    expiresAt: '',
    permissions: {
      read: true,
      create: true,
      update: true,
      delete: true
    }
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    setLoading(true);
    
    try {
      const submitData: CreateApiKeyRequest = {
        name: formData.name.trim(),
        permissions: formData.permissions
      };

      if (formData.expiresAt) {
        submitData.expiresAt = new Date(formData.expiresAt);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error creating API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create New API Key</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Key Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., CRM Integration"
              required
              fullWidth
            />

            <TextField
              label="Expiration Date (Optional)"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Leave empty for no expiration"
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {Object.entries(formData.permissions).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={value}
                        onChange={() => handlePermissionChange(key as keyof typeof formData.permissions)}
                      />
                    }
                    label={`${key.charAt(0).toUpperCase() + key.slice(1)} contacts`}
                  />
                ))}
              </Box>
            </Box>

            <Alert severity="info" icon={<Info />}>
              <Typography variant="body2">
                <strong>Important:</strong> You will only see the API key once after creation. 
                Make sure to copy and store it securely.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create API Key'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateApiKeyModal;
