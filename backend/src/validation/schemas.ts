import { z } from 'zod';

const money = z.coerce
  .number({ message: 'Must be a number' })
  .positive('Must be greater than 0')
  .max(1_000_000_000_000, 'Amount too large')
  .multipleOf(0.01, 'Max 2 decimals');
const id = z.coerce.number().int().positive();

// The frontend sends null/'' (e.g. parseInt('') -> NaN -> null) for "not selected"
const blankToUndefined = (v: unknown) => (v === null || v === '' ? undefined : v);
const optionalId = z.preprocess(blankToUndefined, id.optional());
const optionalMoney = z.preprocess(blankToUndefined, money.optional());

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().trim().min(1, 'Name is required').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createSourceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  balance: z.preprocess(blankToUndefined, z.coerce.number().min(0, 'Balance cannot be negative').optional()),
  description: z.string().max(1000).nullish(),
});

export const createTransactionSchema = z
  .object({
    type: z.enum(['income', 'expense', 'transfer']),
    amount: money,
    description: z.string().max(500).nullish(),
    source_id: optionalId,
    destination_id: optionalId,
  })
  .superRefine((t, ctx) => {
    if ((t.type === 'expense' || t.type === 'transfer') && !t.source_id) {
      ctx.addIssue({ code: 'custom', path: ['source_id'], message: `source_id is required for ${t.type}` });
    }
    if ((t.type === 'income' || t.type === 'transfer') && !t.destination_id) {
      ctx.addIssue({ code: 'custom', path: ['destination_id'], message: `destination_id is required for ${t.type}` });
    }
    if (t.type === 'transfer' && t.source_id && t.source_id === t.destination_id) {
      ctx.addIssue({ code: 'custom', path: ['destination_id'], message: 'Source and destination must differ' });
    }
  });

export const updateTransactionSchema = z
  .object({
    amount: optionalMoney,
    description: z.string().max(500).nullish(),
  })
  .refine((b) => b.amount !== undefined || b.description !== undefined, 'Nothing to update');

export const savingDepositSchema = z.object({ amount: money, source_id: optionalId });
export const savingWithdrawSchema = z.object({ amount: money, destination_id: optionalId });
export const objectiveMoneySchema = z.object({ amount: money, source_id: id });
export const objectivePurchaseSchema = z.object({ source_id: id });
