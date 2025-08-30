import { Router, Response } from 'express';
import { ContactService } from '../services/contactService';
import { AuthenticatedRequest } from '../types';
import { CreateContactDto, UpdateContactDto } from '../dtos/external/contact.dto';
import { PaginationQueryDto } from '../dtos/shared/pagination.dto';
import { requireAuth } from '../middleware/auth';

const router = Router();
const contactService = new ContactService();

// GET /contacts - Get paginated contacts
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = '1', pageSize = '10', filter } = req.query as PaginationQueryDto & { filter?: string };
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    const result = await contactService.getContacts(req.userId!, pageNum, pageSizeNum, filter);
    
    res.paginated(result.data, result.pagination);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.error('Internal server error');
  }
});

// GET /contact/:id - Get specific contact
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await contactService.getContact(id, req.userId!);

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
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
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
    }, req.userId!);

    res.success(contact, 201);
  } catch (error: any) {
    console.error('Error creating contact:', error);
    res.appError(error);
  }
});

// PATCH /contact/:id - Update contact and create history
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateContactDto = req.body;

    const updatedContact = await contactService.updateContact(id, req.userId!, updateData);

    res.success(updatedContact);
  } catch (error: any) {
    console.error('Error updating contact:', error);
    res.appError(error);
  }
});

// DELETE /contact/:id - Delete contact
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await contactService.deleteContact(id, req.userId!);

    res.success(contact);
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.error('Internal server error');
  }
});

export default router;
