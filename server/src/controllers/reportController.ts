import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getVisitsReport = async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      documentType,
      relationship 
    } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); 
    const end = endDate ? new Date(endDate as string) : new Date();
    
    end.setHours(23, 59, 59, 999);
    
    const where: any = {
      AND: [
        { createdAt: { gte: start } },
        { createdAt: { lte: end } }
      ]
    };

    if (status && ['ACTIVE', 'COMPLETED', 'CANCELLED'].includes(status as string)) {
      where.AND.push({ status });
    }

    if (documentType) {
      where.AND.push({ documentType });
    }

    if (relationship) {
      where.AND.push({ relationship: { contains: relationship as string, mode: 'insensitive' } });
    }

    const visits = await prisma.visitor.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalVisits = visits.length;
    const activeVisits = visits.filter(v => v.status === 'ACTIVE').length;
    const completedVisits = visits.filter(v => v.status === 'COMPLETED').length;
    const cancelledVisits = visits.filter(v => v.status === 'CANCELLED').length;

    const relationshipStats = visits.reduce((acc: any, visit) => {
      const rel = visit.relationship;
      if (!acc[rel]) {
        acc[rel] = { count: 0, active: 0, completed: 0, cancelled: 0 };
      }
      acc[rel].count++;
      acc[rel][visit.status.toLowerCase() as keyof typeof acc[typeof rel]]++;
      return acc;
    }, {});

    
    const documentTypeStats = visits.reduce((acc: any, visit) => {
      const docType = visit.documentType;
      if (!acc[docType]) {
        acc[docType] = 0;
      }
      acc[docType]++;
      return acc;
    }, {});

    
    const visitsByDay = visits.reduce((acc: any, visit) => {
      const date = visit.createdAt.toISOString().split('T')[0]; 
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    res.json({
      visits,
      statistics: {
        total: totalVisits,
        byStatus: {
          active: activeVisits,
          completed: completedVisits,
          cancelled: cancelledVisits
        },
        byRelationship: relationshipStats,
        byDocumentType: documentTypeStats
      },
      timeline: {
        visitsByDay: Object.entries(visitsByDay).map(([date, count]) => ({ date, count })),
        period: {
          startDate: start,
          endDate: end
        }
      },
      filters: {
        startDate: start,
        endDate: end,
        status: status || 'all',
        documentType: documentType || 'all',
        relationship: relationship || 'all'
      }
    });

  } catch (error) {
    console.error('Get visits report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório' });
  }
};

export const getUsersReport = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            visits: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;
    const recepcaoUsers = users.filter(u => u.role === 'RECEPCAO').length;
    
    const mostActiveUser = users.reduce((prev, current) => 
      (prev._count.visits > current._count.visits) ? prev : current
    );

    res.json({
      users,
      statistics: {
        total: totalUsers,
        byRole: {
          admin: adminUsers,
          recepcao: recepcaoUsers
        },
        mostActiveUser: {
          name: mostActiveUser.name,
          email: mostActiveUser.email,
          visitsCount: mostActiveUser._count.visits
        }
      }
    });

  } catch (error) {
    console.error('Get users report error:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de usuários' });
  }
};


export const getDashboard = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [
      totalVisits,
      todayVisits,
      activeVisits,
      totalUsers,
      recentVisits
    ] = await Promise.all([
      
      prisma.visitor.count(),
      
      prisma.visitor.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      
      prisma.visitor.count({
        where: { status: 'ACTIVE' }
      }),
      
      prisma.user.count(),
      
      prisma.visitor.findMany({
        take: 5,
        include: {
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const relationshipStats = await prisma.visitor.groupBy({
      by: ['relationship'],
      _count: {
        relationship: true
      },
      orderBy: {
        _count: {
          relationship: 'desc'
        }
      },
      take: 5
    });

    res.json({
      overview: {
        totalVisits,
        todayVisits,
        activeVisits,
        totalUsers
      },
      recentActivity: {
        visits: recentVisits
      },
      popularRelationships: relationshipStats.map(rel => ({
        relationship: rel.relationship,
        count: rel._count.relationship
      }))
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};

export const exportVisitsCSV = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let where: any = {};
    
    if (startDate || endDate) {
      where.AND = [];
      
      if (startDate) {
        const start = new Date(startDate as string);
        where.AND.push({ createdAt: { gte: start } });
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.AND.push({ createdAt: { lte: end } });
      }
    }

    const visits = await prisma.visitor.findMany({
      where,
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (visits.length === 0) {
      const headers = ['Mensagem'];
      const csvContent = [headers.join(','), 'Nenhuma visita encontrada no período selecionado'].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio_vazio.csv"');
      return res.send(csvContent);
    }

    const headers = [
      'ID',
      'Nome Visitante',
      'Documento',
      'Tipo Documento',
      'Telefone',
      'Relação',
      'Paciente',
      'Check-in',
      'Check-out',
      'Status',
      'Registrado por',
      'Observações',
      'Data Registro'
    ];

    const csvData = visits.map(visit => [
      visit.id,
      `"${visit.name.replace(/"/g, '""')}"`, 
      `"${visit.document.replace(/"/g, '""')}"`,
      `"${visit.documentType}"`,
      `"${visit.phone || 'N/A'}"`,
      `"${visit.relationship}"`,
      `"${visit.patientName.replace(/"/g, '""')}"`,
      `"${visit.checkIn?.toISOString() || 'N/A'}"`,
      `"${visit.checkOut?.toISOString() || 'N/A'}"`,
      `"${visit.status}"`,
      `"${visit.user.name}"`,
      `"${(visit.notes || 'N/A').replace(/"/g, '""')}"`,
      `"${visit.createdAt.toISOString()}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const filename = `relatorio_visitas_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório' });
  }
};