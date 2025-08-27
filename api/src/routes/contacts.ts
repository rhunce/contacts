import { Router, Response } from 'express';
import { ContactService } from '../services/contactService';
import { AuthenticatedRequest, CustomSession } from '../types';
import { CreateContactDto, UpdateContactDto } from '../dtos/external/contact.dto';
import { PaginationQueryDto } from '../dtos/shared/pagination.dto';

const router = Router();
const contactService = new ContactService();

// GET /contacts - Get paginated contacts
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { page = '1', pageSize = '10' } = req.query as PaginationQueryDto;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    const result = await contactService.getContacts(session.userId, pageNum, pageSizeNum);
    
    res.paginated(result.data, result.pagination);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.error('Internal server error');
  }
});

// GET /contact/:id - Get specific contact
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { id } = req.params;
    const contact = await contactService.getContact(id, session.userId);

    if (!contact) {
      return res.notFound('Contact not found');
    }

    res.success(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.error('Internal server error');
  }
});

// POST /contact - Create new contact (with 20-second delay)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { firstName, lastName, email, phone }: CreateContactDto = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      const errors = [];
      if (!firstName) errors.push({ message: 'First name is required', field: 'firstName' });
      if (!lastName) errors.push({ message: 'Last name is required', field: 'lastName' });
      if (!email) errors.push({ message: 'Email is required', field: 'email' });
      if (!phone) errors.push({ message: 'Phone is required', field: 'phone' });
      
      return res.validationError(errors);
    }

    const contact = await contactService.createContact({
      firstName,
      lastName,
      email,
      phone
    }, session.userId);

    res.success(contact, 201);
  } catch (error: any) {
    console.error('Error creating contact:', error);
    
    if (error.message?.includes('already exists')) {
      return res.conflict(error.message, 'email');
    }
    
    if (error.message?.includes('Validation failed')) {
      return res.validationError([
        { message: error.message, field: 'validation' }
      ]);
    }

    res.error('Internal server error');
  }
});

// PATCH /contact/:id - Update contact and create history
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { id } = req.params;
    const updateData: UpdateContactDto = req.body;

    const updatedContact = await contactService.updateContact(id, session.userId, updateData);

    res.success(updatedContact);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    
    if (error.message === 'Contact not found') {
      return res.notFound('Contact not found');
    }
    
    if (error.message?.includes('already exists')) {
      return res.conflict(error.message, 'email');
    }
    
    if (error.message === 'No changes provided') {
      return res.validationError([
        { message: 'No changes provided', field: 'update' }
      ]);
    }

    res.error('Internal server error');
  }
});

// DELETE /contact/:id - Delete contact
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = req.session as CustomSession;
    if (!session.userId) {
      return res.unauthorized();
    }

    const { id } = req.params;
    const contact = await contactService.deleteContact(id, session.userId);

    res.success(contact);
  } catch (error: any) {
    console.error('Error deleting contact:', error);
    
    if (error.message === 'Contact not found') {
      return res.notFound('Contact not found');
    }

    res.error('Internal server error');
  }
});

export default router;
