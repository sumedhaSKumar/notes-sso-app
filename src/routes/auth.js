const { Router } = require('express');

const { validate } = require('../middleware/validate');
const { registerSchema } = require('../schemas/authSchemas');
const { register } = require('../controllers/authController');

const router = Router();

router.post('/register', validate(registerSchema), register);

module.exports = router;
