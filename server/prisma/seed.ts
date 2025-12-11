import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados SQLite...');

  console.log('Limpando dados existentes...');
  await prisma.visitor.deleteMany();
  await prisma.user.deleteMany();

  console.log('Criando usuários...');
  
  const adminPassword = await hashPassword('admin123');
  const recepcaoPassword = await hashPassword('recepcao123');

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@casaapoio.com',
      password: adminPassword,
      name: 'Administrador Sistema',
      role: 'ADMIN'
    }
  });

  const recepcaoUser = await prisma.user.create({
    data: {
      email: 'recepcao@casaapoio.com',
      password: recepcaoPassword,
      name: 'Maria da Recepção',
      role: 'RECEPCAO'
    }
  });

  console.log(`Usuários criados - Admin ID: ${adminUser.id}, Recepção ID: ${recepcaoUser.id}`);


  console.log('Criando visitas de exemplo...');

  const activeVisitors = await prisma.visitor.createMany({
    data: [
      {
        name: 'João Silva',
        document: '123.456.789-00',
        documentType: 'CPF',
        phone: '(11) 99999-1111',
        relationship: 'Filho',
        patientName: 'Maria Santos Silva',
        checkIn: new Date(),
        status: 'ACTIVE',
        userId: recepcaoUser.id, 
        notes: 'Trouxe medicamentos para a paciente'
      },
      {
        name: 'Ana Oliveira',
        document: '987.654.321-00',
        documentType: 'CPF', 
        phone: '(11) 98888-2222',
        relationship: 'Irmã',
        patientName: 'Carlos Oliveira',
        checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000), 
        status: 'ACTIVE',
        userId: adminUser.id, 
        notes: 'Visita de rotina'
      }
    ]
  });


  const completedVisitors = await prisma.visitor.createMany({
    data: [
      {
        name: 'Pedro Costa',
        document: '45.678.901-X',
        documentType: 'RG',
        phone: '(11) 97777-3333',
        relationship: 'Amigo',
        patientName: 'Roberto Almeida',
        checkIn: new Date(Date.now() - 24 * 60 * 60 * 1000), 
        checkOut: new Date(Date.now() - 23 * 60 * 60 * 1000), 
        status: 'COMPLETED',
        userId: recepcaoUser.id, 
        notes: 'Visita rápida, trouxe frutas'
      },
      {
        name: 'Mariana Lima',
        document: '234.567.890-11',
        documentType: 'CPF',
        phone: '(11) 96666-4444',
        relationship: 'Fisioterapeuta',
        patientName: 'Antônio Rodrigues',
        checkIn: new Date(Date.now() - 3 * 60 * 60 * 1000),
        checkOut: new Date(Date.now() - 2 * 60 * 60 * 1000), 
        status: 'COMPLETED', 
        userId: adminUser.id, 
        notes: 'Sessão de fisioterapia completa'
      }
    ]
  });

  console.log('Seed concluído com sucesso!');
  console.log('');
  console.log('Dados criados:');
  console.log(`      Usuários (IDs: ${adminUser.id}, ${recepcaoUser.id}):`);
  console.log('      - admin@casaapoio.com / admin123 (ADMIN)');
  console.log('      - recepcao@casaapoio.com / recepcao123 (RECEPCAO)');
  console.log('      Visitantes:');
  console.log('      - 2 visitas ATIVAS (dentro da casa)');
  console.log('      - 2 visitas COMPLETADAS (já saíram)');
  console.log('');
  console.log('Acesse o Prisma Studio: npm run prisma:studio');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });