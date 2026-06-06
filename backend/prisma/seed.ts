import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/database';

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // ── Sequences ──────────────────────────────────────────────────────────────
  await prisma.sequence.upsert({
    where: { name: 'rfq' },
    update: {},
    create: { name: 'rfq', prefix: 'RFQ', currentValue: 0, padLength: 5 },
  });
  await prisma.sequence.upsert({
    where: { name: 'po' },
    update: {},
    create: { name: 'po', prefix: 'PO', currentValue: 0, padLength: 5 },
  });
  await prisma.sequence.upsert({
    where: { name: 'invoice' },
    update: {},
    create: { name: 'invoice', prefix: 'INV', currentValue: 0, padLength: 5 },
  });
  console.log('✅ Sequences seeded (rfq, po, invoice)');

  // ── Vendor Categories ──────────────────────────────────────────────────────
  const categories = [
    { name: 'IT & Software', description: 'Software, hardware, IT services' },
    { name: 'Office Supplies', description: 'Stationery, furniture, office equipment' },
    { name: 'Raw Materials', description: 'Manufacturing inputs and raw materials' },
    { name: 'Logistics & Transport', description: 'Freight, courier, warehousing' },
    { name: 'Professional Services', description: 'Consulting, legal, accounting' },
    { name: 'Facilities & Maintenance', description: 'Building maintenance, utilities, cleaning' },
  ];

  for (const cat of categories) {
    await prisma.vendorCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✅ Vendor categories seeded');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const adminEmail = 'admin@vendorbridge.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        isActive: true,
      },
    });
    console.log('✅ Admin user created: admin@vendorbridge.com / Admin@123');
  } else {
    console.log('ℹ️  Admin user already exists — skipping');
  }

  // ── Manager User ───────────────────────────────────────────────────────────
  const managerEmail = 'manager@vendorbridge.com';
  const managerExists = await prisma.user.findUnique({ where: { email: managerEmail } });

  if (!managerExists) {
    const passwordHash = await bcrypt.hash('Manager@123', 12);
    await prisma.user.create({
      data: {
        email: managerEmail,
        passwordHash,
        firstName: 'Procurement',
        lastName: 'Manager',
        role: UserRole.MANAGER,
        isActive: true,
      },
    });
    console.log('✅ Manager user created: manager@vendorbridge.com / Manager@123');
  } else {
    console.log('ℹ️  Manager user already exists — skipping');
  }

  // ── Procurement Officer ────────────────────────────────────────────────────
  const officerEmail = 'officer@vendorbridge.com';
  const officerExists = await prisma.user.findUnique({ where: { email: officerEmail } });

  if (!officerExists) {
    const passwordHash = await bcrypt.hash('Officer@123', 12);
    await prisma.user.create({
      data: {
        email: officerEmail,
        passwordHash,
        firstName: 'Procurement',
        lastName: 'Officer',
        role: UserRole.PROCUREMENT_OFFICER,
        isActive: true,
      },
    });
    console.log('✅ Procurement Officer created: officer@vendorbridge.com / Officer@123');
  } else {
    console.log('ℹ️  Officer user already exists — skipping');
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('Default credentials:');
  console.log('  Admin:    admin@vendorbridge.com    / Admin@123');
  console.log('  Manager:  manager@vendorbridge.com  / Manager@123');
  console.log('  Officer:  officer@vendorbridge.com  / Officer@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
