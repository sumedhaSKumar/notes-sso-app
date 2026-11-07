const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  displayName: z.string().trim().min(2).max(100),
  password: z.string(),
});

module.exports = { registerSchema };
