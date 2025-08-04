#!/usr/bin/env node

import { AdminModel } from '../src/models/AdminModel.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  try {
    console.log('🚀 Creador de Usuario Administrador\n');
    
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const fullName = await question('Nombre completo: ');
    const isSuperAdmin = (await question('¿Es super administrador? (s/N): ')).toLowerCase() === 's';
    
    if (!username || !email || !password || !fullName) {
      console.error('❌ Todos los campos son obligatorios');
      process.exit(1);
    }
    
    console.log('\n⏳ Creando usuario administrador...');
    
    const admin = await AdminModel.create({
      username,
      email,
      password,
      full_name: fullName,
      is_super_admin: isSuperAdmin
    });
    
    console.log('\n✅ Usuario administrador creado exitosamente:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nombre: ${admin.full_name}`);
    console.log(`   Super Admin: ${admin.is_super_admin ? 'Sí' : 'No'}`);
    console.log(`   Activo: ${admin.is_active ? 'Sí' : 'No'}`);
    console.log(`   Creado: ${admin.created_at}`);
    
    console.log('\n🎉 Ya puedes iniciar sesión en /admin/login');
    
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error.message);
    
    if (error.code === '23505') {
      console.error('   El username o email ya existe');
    }
  } finally {
    rl.close();
    process.exit(0);
  }
}

createAdminUser();