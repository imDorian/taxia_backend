import { Router } from 'express';
import { createBilling, getBilling, getBillingById, updateBilling, deleteBilling } from '../controllers/billing.js';

const billingRouter = Router();

billingRouter.post('/create-billing', createBilling);
billingRouter.get('/get-billing', getBilling);
billingRouter.get('/get-billing/:id', getBillingById);
billingRouter.put('/update-billing/:id', updateBilling);
billingRouter.delete('/delete-billing/:id', deleteBilling);
export { billingRouter };

// app.get('/billing', getBilling);
// app.put('/billing/:id', updateBilling);
// app.delete('/billing/:id', deleteBilling);

