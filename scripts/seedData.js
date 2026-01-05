require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/InventorySchema');
const User = require('../models/User');
const { sampleInventoryData, sampleUsers } = require('../data/sampleData');

/**
 * Seed Database Script
 * Populates database with sample data
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Inventory.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed users
    console.log('👥 Seeding users...');
    // Use create() instead of insertMany() to trigger password hashing middleware
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed inventory
    console.log('📦 Seeding inventory items...');
    const createdInventory = await Inventory.insertMany(sampleInventoryData);
    console.log(`✅ Created ${createdInventory.length} inventory items`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin: admin@restaurant.com / admin123');
    console.log('Manager: manager@restaurant.com / manager123');
    console.log('Staff: staff@restaurant.com / staff123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

