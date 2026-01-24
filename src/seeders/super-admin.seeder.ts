import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import AppDataSource from '../../data-source';
import { SuperAdminEntity } from '../modules/super-admin/domain/entities/super-admin.entity';

export class SuperAdminSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    const superAdminRepository = dataSource.getRepository(SuperAdminEntity);

    // Check if super admin already exists
    const existingSuperAdmin = await superAdminRepository.findOne({
      where: { email: 'superadmin@dirham.com' },
    });

    if (existingSuperAdmin) {
      console.log('Super Admin already exists. Skipping seeder.');
      return;
    }

    // Create default super admin
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 440);

    const superAdmin = superAdminRepository.create({
      id: uuidV4(),
      email: 'superadmin@dirham.com',
      password: hashedPassword,
      name: 'Super Administrator',
      phone: '+923001234567',
      is_active: true,
    });

    await superAdminRepository.save(superAdmin);

    console.log('✅ Super Admin seeded successfully!');
    console.log('📧 Email: superadmin@dirham.com');
    console.log('🔑 Password: SuperAdmin@123');
    console.log('⚠️  Please change the password after first login!');
  }
}

// Run seeder if executed directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(async (dataSource) => {
      const seeder = new SuperAdminSeeder();
      await seeder.run(dataSource);
      await dataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding super admin:', error);
      process.exit(1);
    });
}
