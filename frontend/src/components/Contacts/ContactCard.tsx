import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Edit,
  Delete,
  History,
  Email,
  Phone,
} from '@mui/icons-material';
import { Contact } from '@/types/contact';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
  onViewHistory: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onViewHistory,
}) => {
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || '?';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              mr: 2,
            }}
          >
            {getInitials(contact?.firstName, contact?.lastName)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
              {contact?.firstName || 'Unknown'} {contact?.lastName || ''}
            </Typography>
            <Chip
              label={(contact?.lastName?.charAt(0) || '?').toUpperCase()}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact.email}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {contact.phone}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            size="small"
            onClick={() => onViewHistory(contact)}
            sx={{ color: 'primary.main' }}
            title="View History"
          >
            <History />
          </IconButton>
          <Box>
            <IconButton
              size="small"
              onClick={() => onEdit(contact)}
              sx={{ color: 'primary.main' }}
              title="Edit Contact"
            >
              <Edit />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(contact)}
              sx={{ color: 'error.main' }}
              title="Delete Contact"
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContactCard;