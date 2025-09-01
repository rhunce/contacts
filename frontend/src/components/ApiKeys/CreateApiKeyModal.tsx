import { CreateApiKeyRequest } from '@/types/apiKey';
import { Close, Info } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

interface CreateApiKeyModalProps {
  onClose: () => void;
  onSubmit: (data: CreateApiKeyRequest) => Promise<void>;
}

const CreateApiKeyModal: React.FC<CreateApiKeyModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    expiresAt: ''
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
        name: formData.name.trim()
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2">
                  Permissions
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    bgcolor: 'grey.100',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1
                  }}
                >
                  Coming soon
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      disabled={true}
                      sx={{ 
                        '&.Mui-disabled': {
                          color: 'grey.400'
                        }
                      }}
                    />
                  }
                  label="Read contacts"
                  sx={{ 
                    color: 'text.disabled',
                    '& .MuiFormControlLabel-label': {
                      color: 'text.disabled'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      disabled={true}
                      sx={{ 
                        '&.Mui-disabled': {
                          color: 'grey.400'
                        }
                      }}
                    />
                  }
                  label="Create contacts"
                  sx={{ 
                    color: 'text.disabled',
                    '& .MuiFormControlLabel-label': {
                      color: 'text.disabled'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      disabled={true}
                      sx={{ 
                        '&.Mui-disabled': {
                          color: 'grey.400'
                        }
                      }}
                    />
                  }
                  label="Update contacts"
                  sx={{ 
                    color: 'text.disabled',
                    '& .MuiFormControlLabel-label': {
                      color: 'text.disabled'
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={true}
                      disabled={true}
                      sx={{ 
                        '&.Mui-disabled': {
                          color: 'grey.400'
                        }
                      }}
                    />
                  }
                  label="Delete contacts"
                  sx={{ 
                    color: 'text.disabled',
                    '& .MuiFormControlLabel-label': {
                      color: 'text.disabled'
                    }
                  }}
                />
              </Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontStyle: 'italic' }}
              >
                All API keys currently have full access to contact operations. Granular permissions will be available in a future update.
              </Typography>
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
