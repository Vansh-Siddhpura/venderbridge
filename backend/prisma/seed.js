"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../src/config/database"));
async function main() {
    console.log('🌱 Seeding database...');
    // ── Sequences ──────────────────────────────────────────────────────────────
    await database_1.default.sequence.upsert({
        where: { name: 'rfq' },
        update: {},
        create: { name: 'rfq', prefix: 'RFQ', currentValue: 0, padLength: 5 },
    });
    await database_1.default.sequence.upsert({
        where: { name: 'po' },
        update: {},
        create: { name: 'po', prefix: 'PO', currentValue: 0, padLength: 5 },
    });
    await database_1.default.sequence.upsert({
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
        await database_1.default.vendorCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }
    console.log('✅ Vendor categories seeded');
    // ── Admin User ─────────────────────────────────────────────────────────────
    const adminEmail = 'admin@vendorbridge.com';
    const adminExists = await database_1.default.user.findUnique({ where: { email: adminEmail } });
    if (!adminExists) {
        const passwordHash = await bcryptjs_1.default.hash('Admin@123', 12);
        await database_1.default.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                firstName: 'Super',
                lastName: 'Admin',
                role: client_1.UserRole.ADMIN,
                isActive: true,
            },
        });
        console.log('✅ Admin user created: admin@vendorbridge.com / Admin@123');
    }
    else {
        console.log('ℹ️  Admin user already exists — skipping');
    }
    // ── Manager User ───────────────────────────────────────────────────────────
    const managerEmail = 'manager@vendorbridge.com';
    const managerExists = await database_1.default.user.findUnique({ where: { email: managerEmail } });
    if (!managerExists) {
        const passwordHash = await bcryptjs_1.default.hash('Manager@123', 12);
        await database_1.default.user.create({
            data: {
                email: managerEmail,
                passwordHash,
                firstName: 'Procurement',
                lastName: 'Manager',
                role: client_1.UserRole.MANAGER,
                isActive: true,
            },
        });
        console.log('✅ Manager user created: manager@vendorbridge.com / Manager@123');
    }
    else {
        console.log('ℹ️  Manager user already exists — skipping');
    }
    // ── Procurement Officer ────────────────────────────────────────────────────
    const officerEmail = 'officer@vendorbridge.com';
    const officerExists = await database_1.default.user.findUnique({ where: { email: officerEmail } });
    if (!officerExists) {
        const passwordHash = await bcryptjs_1.default.hash('Officer@123', 12);
        await database_1.default.user.create({
            data: {
                email: officerEmail,
                passwordHash,
                firstName: 'Procurement',
                lastName: 'Officer',
                role: client_1.UserRole.PROCUREMENT_OFFICER,
                isActive: true,
            },
        });
        console.log('✅ Procurement Officer created: officer@vendorbridge.com / Officer@123');
    }
    else {
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
    await database_1.default.$disconnect();
});
//# sourceMappingURL=seed.js.map