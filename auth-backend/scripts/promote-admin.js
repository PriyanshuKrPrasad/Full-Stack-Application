/**
 * promote-admin.js
 * Usage: node scripts/promote-admin.js alice@example.com
 *
 * Makes the given email address an ADMIN.
 * Run from inside auth-api/ directory.
 */
'use strict';
require('dotenv').config();
const prisma = require('../src/lib/prisma');

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('\n❌  Usage: node scripts/promote-admin.js your@email.com\n');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`\n❌  No user found with email: ${email}\n`);
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.log(`\n⚠️   ${user.name} (${email}) is already an ADMIN.\n`);
    process.exit(0);
  }

  const updated = await prisma.user.update({
    where: { email },
    data:  { role: 'ADMIN' },
  });

  console.log(`\n✅  Success! ${updated.name} (${email}) is now an ADMIN.`);
  console.log(`    Log out and log back in to see the Admin panel.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
