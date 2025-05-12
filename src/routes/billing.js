import { Router } from 'express';
import { createBilling, getBilling, getBillingById } from '../controllers/billing.js';

const billingRouter = Router();

billingRouter.post('/create-billing', createBilling);
billingRouter.get('/get-billing', getBilling);
billingRouter.get('/get-billing/:id', getBillingById);
export { billingRouter };

// app.get('/billing', getBilling);
// app.put('/billing/:id', updateBilling);
// app.delete('/billing/:id', deleteBilling);

