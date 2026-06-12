import { Router, IRouter } from "express";
import * as accountsController from './accounts.controller';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';

const router: IRouter = Router();
// Tất cả route accounts đều cần authenticate + admin
router.use(authenticate, authorize('admin'));

router.get('/', accountsController.listAccounts);
router.post('/', accountsController.createAccount);
router.patch('/:id/password', accountsController.changePassword);
router.patch('/:id/status', accountsController.changeStatus);

export default router;
