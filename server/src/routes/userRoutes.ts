import { Router } from 'express'
import { createUser, deleteUser, getAllUsers } from '../controllers/userController'

const router = Router()

router.get('/list', getAllUsers)
router.post('/register', createUser)
router.delete('/delete/:id', deleteUser)

export default router