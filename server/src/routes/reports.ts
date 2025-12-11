import { Router } from 'express';
import { 
  getVisitsReport, 
  getUsersReport, 
  getDashboard,
  exportVisitsCSV 
} from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/visits', getVisitsReport); 
router.get('/users', getUsersReport); 
router.get('/dashboard', getDashboard); 
router.get('/export/csv', exportVisitsCSV); 

export default router;