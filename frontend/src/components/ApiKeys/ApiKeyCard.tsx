import { ApiKey } from '@/types/apiKey';
import { MoreVert } from '@mui/icons-material';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import React, { useState } from 'react';

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const ApiKeyCard: React.FC<ApiKeyCardProps> = ({
  apiKey,
  onRevoke,
  onDelete,
  onRestore
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastUsedText = () => {
    if (!apiKey.lastUsedAt) {
      return 'Never used';
    }
    
    const lastUsed = new Date(apiKey.lastUsedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: () => void) => {
    action();
    handleMenuClose();
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="h6" component="h3">
                {apiKey.name}
              </Typography>
              <Chip
                label={apiKey.isActive ? 'Active' : 'Revoked'}
                color={apiKey.isActive ? 'success' : 'error'}
                size="small"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(apiKey.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last used: {getLastUsedText()}
              </Typography>
              {apiKey.expiresAt && (
                <Typography variant="body2" color="text.secondary">
                  Expires: {formatDate(apiKey.expiresAt)}
                </Typography>
              )}
            </Box>
          </Box>

          <IconButton
            onClick={handleMenuClick}
            size="small"
          >
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {apiKey.isActive ? (
              <MenuItem
                onClick={() => handleAction(() => onRevoke(apiKey.id))}
                sx={{ color: 'error.main' }}
              >
                Revoke Key
              </MenuItem>
            ) : (
              <>
                <MenuItem
                  onClick={() => handleAction(() => onRestore(apiKey.id))}
                  sx={{ color: 'success.main' }}
                >
                  Restore Key
                </MenuItem>
                <MenuItem
                  onClick={() => handleAction(() => onDelete(apiKey.id))}
                  sx={{ color: 'error.main' }}
                >
                  Delete Permanently
                </MenuItem>
              </>
            )}
          </Menu>
        </Box>

        {/* Warning for revoked keys */}
        {!apiKey.isActive && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This API key has been revoked and cannot be used for authentication.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyCard;
