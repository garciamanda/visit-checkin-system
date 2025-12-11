import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const createVisitor = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      document,
      documentType,
      phone,
      relationship,
      patientName,
      notes
    } = req.body;

    if (!name || !document || !documentType || !relationship || !patientName) {
      return res.status(400).json({ 
        error: 'Nome, documento, tipo documento, relação e nome do paciente são obrigatórios' 
      });
    }

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const visitor = await prisma.visitor.create({
      data: {
        name,
        document,
        documentType,
        phone: phone || null,
        relationship,
        patientName,
        notes: notes || null,
        checkIn: new Date(),
        status: 'ACTIVE',
        userId: userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Visitante registrado com sucesso',
      visitor
    });

  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ error: 'Erro ao registrar visitante' });
  }
};

export const checkOutVisitor = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const visitorId = parseInt(id);

    if (isNaN(visitorId)) {
      return res.status(400).json({ error: 'ID do visitante inválido' });
    }

    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId }
    });

    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    if (visitor.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Visitante já fez check-out ou visita foi cancelada' });
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        checkOut: new Date(),
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Check-out realizado com sucesso',
      visitor: updatedVisitor
    });

  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Erro ao realizar check-out' });
  }
};

export const getActiveVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await prisma.visitor.findMany({
      where: { 
        status: 'ACTIVE' 
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { 
        checkIn: 'desc' 
      }
    });

    res.json({
      count: visitors.length,
      visitors
    });

  } catch (error) {
    console.error('Get active visitors error:', error);
    res.status(500).json({ error: 'Erro ao buscar visitantes ativos' });
  }
};

export const getAllVisitors = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && ['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status as string)) {
      where.status = status;
    }

    const [visitors, total] = await Promise.all([
      prisma.visitor.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { 
          createdAt: 'desc' 
        },
        skip,
        take: limitNum
      }),
      prisma.visitor.count({ where })
    ]);

    res.json({
      visitors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Get all visitors error:', error);
    res.status(500).json({ error: 'Erro ao buscar visitantes' });
  }
};

export const getVisitorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const visitorId = parseInt(id);

    if (isNaN(visitorId)) {
      return res.status(400).json({ error: 'ID do visitante inválido' });
    }

    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    res.json({ visitor });

  } catch (error) {
    console.error('Get visitor by ID error:', error);
    res.status(500).json({ error: 'Erro ao buscar visitante' });
  }
};

export const cancelVisit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const visitorId = parseInt(id);

    if (isNaN(visitorId)) {
      return res.status(400).json({ error: 'ID do visitante inválido' });
    }

    const visitor = await prisma.visitor.findUnique({
      where: { id: visitorId }
    });

    if (!visitor) {
      return res.status(404).json({ error: 'Visitante não encontrado' });
    }

    if (visitor.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Só é possível cancelar visitas ativas' });
    }

    const updatedVisitor = await prisma.visitor.update({
      where: { id: visitorId },
      data: {
        status: 'CANCELLED',
        notes: visitor.notes ? `${visitor.notes} | [CANCELADO: ${new Date().toLocaleString()}]` : `[CANCELADO: ${new Date().toLocaleString()}]`
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Visita cancelada com sucesso',
      visitor: updatedVisitor
    });

  } catch (error) {
    console.error('Cancel visit error:', error);
    res.status(500).json({ error: 'Erro ao cancelar visita' });
  }
};