import { Router } from 'express';
import { postsController } from '../controllers/postsController';
import upload from '../middleware/upload';
import { validatePostCreate, validatePostUpdate } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', postsController.list);
router.get('/:id', postsController.getById);

router.post(
  '/',
  authMiddleware,
  upload.array('photos', 6),
  validatePostCreate,
  postsController.create
);

router.patch(
  '/:id',
  authMiddleware,
  upload.array('photos', 6),
  validatePostUpdate,
  postsController.update
);

router.delete('/:id', authMiddleware, postsController.remove);

export default router;
