const { z } = require('zod');

const schema = z.object({
  title: z.string().trim().min(1),
  priority: z.number().int().min(1).max(5),
});
// A schema is a description: "an object with a non-empty trimmed string called title
// and a whole number called priority between 1 and 5".

const good = schema.safeParse({ title: '  Buy milk  ', priority: 3 });
console.log(good.success, good.data);
// success: true, data: { title: 'Buy milk', priority: 3 }. Zod also CLEANED the title (trim).

const bad = schema.safeParse({ title: '', priority: 9 });
console.log(bad.success, bad.error);

// success: false. "issues" is an array, one entry per problem,
// each with a "path" (which field) and a "message" (what's wrong).

/**
 * { success: true, data: { title: 'Buy milk', priority: 3 } }
 * { success: false, error: [Getter/Setter] }
 */
