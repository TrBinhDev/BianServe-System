import { Router, IRouter } from 'express';
import * as ordersController from './orders.controller';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';

const router: IRouter = Router();

// Public
router.post('/', ordersController.createOrder);
router.get('/:id', ordersController.getOrderById);
router.post('/:id/items', ordersController.addItem);
router.put('/:id/items/:itemId', ordersController.updateItem);
router.delete('/:id/items/:itemId', ordersController.deleteItem);

export default router;

export const adminOrderRouter: IRouter = Router();

adminOrderRouter.use(authenticate, authorize('admin', 'staff'));
adminOrderRouter.get('/', ordersController.listOrders);
adminOrderRouter.get('/:id', ordersController.getOrderByIdAdmin);
adminOrderRouter.patch('/:id/status', ordersController.updateStatus);
adminOrderRouter.post('/:id/cancel', ordersController.cancelOrder);
