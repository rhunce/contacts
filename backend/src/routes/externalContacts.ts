import { Router, Response } from 'express';
import { ContactService } from '../services/contactService';
import { ApiKeyRequest, requireApiKey } from '../middleware/apiKeyAuth';
import { CreateContactDto, UpdateContactDto } from '../dtos/external/contact.dto';

const router = Router();
const contactService = new ContactService();

// Apply API key authentication to all external contact routes
router.use(requireApiKey);

// GET /api/external/contact/:externalId - Get contact by external ID
router.get('/:externalId', async (req: ApiKeyRequest, res: Response) => {
  try {
    const { externalId } = req.params;
    const userId = req.apiKeyUserId;

    if (!userId) {
      return res.unauthorized('API key authentication required');
    }

    const contact = await contactService.getContactByExternalId(externalId, userId);

    if (!contact) {
      return res.notFound('Contact not found');
    }

    res.success(contact);
  } catch (error: any) {
    console.error('Error fetching external contact:', error);
    res.appError(error);
  }
});

// PATCH /api/external/contact/:externalId - Update contact by external ID
router.patch('/:externalId', async (req: ApiKeyRequest, res: Response) => {
  try {
    const { externalId } = req.params;
    const userId = req.apiKeyUserId;
    const updateData: UpdateContactDto = req.body;

    if (!userId) {
      return res.unauthorized('API key authentication required');
    }

    const updatedContact = await contactService.updateContactByExternalId(externalId, userId, updateData);

    res.success(updatedContact);
  } catch (error: any) {
    console.error('Error updating external contact:', error);
    res.appError(error);
  }
});

// POST /api/external/contact - Create contact with external ID
router.post('/', async (req: ApiKeyRequest, res: Response) => {
  try {
    const userId = req.apiKeyUserId;
    const { firstName, lastName, email, phone, externalId }: CreateContactDto & { externalId?: string } = req.body;

    if (!userId) {
      return res.unauthorized('API key authentication required');
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      const errors = [];
      if (!firstName) errors.push({ message: 'First name is required', field: 'firstName' });
      if (!lastName) errors.push({ message: 'Last name is required', field: 'lastName' });
      if (!email) errors.push({ message: 'Email is required', field: 'email' });
      if (!phone) errors.push({ message: 'Phone is required', field: 'phone' });
      
      return res.validationError(errors);
    }

    const contact = await contactService.createContactWithExternalId({
      firstName,
      lastName,
      email,
      phone,
      externalId
    }, userId);

    res.success(contact, 201);
  } catch (error: any) {
    console.error('Error creating external contact:', error);
    res.appError(error);
  }
});

// DELETE /api/external/contact/:externalId - Delete contact by external ID
router.delete('/:externalId', async (req: ApiKeyRequest, res: Response) => {
  try {
    const { externalId } = req.params;
    const userId = req.apiKeyUserId;

    if (!userId) {
      return res.unauthorized('API key authentication required');
    }

    const contact = await contactService.deleteContactByExternalId(externalId, userId);

    res.success(contact);
  } catch (error: any) {
    console.error('Error deleting external contact:', error);
    res.appError(error);
  }
});

export default router;
