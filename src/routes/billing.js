import { Router } from "express";
import {
  createBilling,
  getBillings,
  getBillingById,
  updateBilling,
  deleteBilling,
} from "../controllers/billing.js";
import { isValidToken } from "../middlewares/isValidToken.js";

const billingRouter = Router();

billingRouter.post("/create-billing", [isValidToken], createBilling);
billingRouter.get("/get-billings/:id", [isValidToken], getBillings);
billingRouter.get("/get-billing/:id", [isValidToken], getBillingById);
billingRouter.put("/update-billing/:id", updateBilling);
billingRouter.delete("/delete-billing/:id", [isValidToken], deleteBilling);
export { billingRouter };

// app.get('/billing', getBilling);
// app.put('/billing/:id', updateBilling);
// app.delete('/billing/:id', deleteBilling);
