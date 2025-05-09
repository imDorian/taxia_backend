import { Router } from 'express';
import { createBilling } from '../controllers/billing.js';

const billingRouter = Router();

billingRouter.post('/create-billing', createBilling);

export { billingRouter };

// app.get('/billing', getBilling);
// app.put('/billing/:id', updateBilling);
// app.delete('/billing/:id', deleteBilling);

