const fs = require('fs');
const path = require('path');

const replaceInFile = (filePath, regex, replacement) => {
  const p = path.join(__dirname, filePath);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(p, content, 'utf8');
  }
};

// Fix db logs
replaceInFile('src/config/database.ts', /prisma\.\$on\('query'/g, 'prisma.$on(\'query\' as any');

// Fix Zod errors
replaceInFile('src/middlewares/error.middleware.ts', /err\.errors/g, 'err.issues');
replaceInFile('src/middlewares/validate.middleware.ts', /err\.errors/g, 'err.issues');

// Fix activity action enums
replaceInFile('src/config/constants.ts', /QUOTATION_SELECTED: 'quotation.selected',/g, 'QUOTATION_SELECTED: \'quotation.selected\',\n  QUOTATION_REJECTED: \'quotation.rejected\',');

// Fix duplicate Prisma
replaceInFile('src/modules/invoices/repository.ts', /import \{ Prisma \} from '@prisma\/client';\nconst Decimal = Prisma\.Decimal;/g, 'const Decimal = Prisma.Decimal;');

// Fix invoice repo poId
replaceInFile('src/modules/invoices/repository.ts', /poId,/g, 'purchaseOrderId: poId,');
replaceInFile('src/modules/invoices/repository.ts', /po: /g, 'purchaseOrder: ');

// Fix Decimal imports again
replaceInFile('src/modules/purchase-orders/repository.ts', /import \{ Decimal \} from '@prisma\/client\/runtime\/library';/g, 'import { Prisma } from \'@prisma/client\';\nconst Decimal = Prisma.Decimal;');
replaceInFile('src/modules/quotations/repository.ts', /import \{ Decimal \} from '@prisma\/client\/runtime\/library';/g, 'import { Prisma } from \'@prisma/client\';\nconst Decimal = Prisma.Decimal;');

// Fix RFQ Items specifications
replaceInFile('src/modules/rfqs/repository.ts', /specifications: unknown/g, 'specifications: any');

// Fix invoices controller
replaceInFile('src/modules/invoices/controller.ts', /req\.user!\.vendorId\)/g, 'req.user!.vendorId as string)');

console.log('Fixed more TS errors');
