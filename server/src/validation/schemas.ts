import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória')
  })
});

export const registerSchema = z.object({
  body: z.object({
    email: z.email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    role: z.enum(['ADMIN', 'RECEPCAO']).optional().default('RECEPCAO')
  })
});

export const visitorSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    document: z.string().min(3, 'Documento é obrigatório'),
    documentType: z.enum(['CPF', 'RG', 'CNH', 'OUTRO']),
    phone: z.string().optional(),
    relationship: z.string().min(2, 'Relação é obrigatória'),
    patientName: z.string().min(2, 'Nome do paciente é obrigatório'),
    notes: z.string().optional()
  })
});

export const reportSchema = z.object({
  query: z.object({
    startDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
    status: z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    documentType: z.string().optional(),
    relationship: z.string().optional()
  })
});

export const checkoutSchema = z.object({
  params: z.object({
    id: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {
      message: 'ID deve ser um número válido'
    })
  })
});