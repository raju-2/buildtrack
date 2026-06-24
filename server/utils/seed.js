/**
 * Seeds the database with default expense categories and an admin user.
 * Run with: npm run seed
 */
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('../config/db');
const Category = require('../models/Category');
const User = require('../models/User');
const { CATEGORIES } = require('../models/Expense');

const seed = async () => {
  await connectDB();

  for (const name of CATEGORIES) {
    await Category.findOneAndUpdate({ name }, { name, isDefault: true }, { upsert: true });
  }
  console.log(`Seeded ${CATEGORIES.length} default categories`);

  const adminEmail = 'admin@buildtrack.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'BuildTrack Admin',
      email: adminEmail,
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
    });
    console.log(`Created default admin user: ${adminEmail} / Admin@123 (change this password immediately)`);
  } else {
    console.log('Admin user already exists, skipping');
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
