import { AdminModel } from '../src/models/AdminModel.js';
import { query } from '../src/lib/db.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createAdminUser() {
  console.log('🔐 Creación de Usuario Administrador - NeuraIdev\n');
  
  try {
    // Verificar conexión a la base de datos
    console.log('📡 Verificando conexión a la base de datos...');
    await query('SELECT 1');
    console.log('✅ Conexión exitosa\n');

    // Obtener datos del administrador
    const full_name = await askQuestion('👤 Nombre completo: ');
    const username = await askQuestion('🔑 Usuario (username): ');
    const email = await askQuestion('📧 Email: ');
    const password = await askPassword('🔒 Contraseña: ');
    const confirmPassword = await askPassword('🔒 Confirmar contraseña: ');

    // Validaciones
    if (!full_name || !username || !email || !password) {
      console.log('\n❌ Todos los campos son requeridos');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.log('\n❌ Las contraseñas no coinciden');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ La contraseña debe tener al menos 6 caracteres');
      process.exit(1);
    }

    // Verificar si el usuario ya existe
    console.log('\n🔍 Verificando si el usuario ya existe...');
    const existingUser = await AdminModel.findByUsernameOrEmail(username);
    if (existingUser) {
      console.log('❌ Ya existe un usuario con ese username o email');
      process.exit(1);
    }

    const existingEmail = await AdminModel.findByUsernameOrEmail(email);
    if (existingEmail) {
      console.log('❌ Ya existe un usuario con ese email');
      process.exit(1);
    }

    // Crear usuario
    console.log('⏳ Creando usuario administrador...');
    const newAdmin = await AdminModel.create({
      username,
      email,
      password,
      full_name,
      is_super_admin: true // Como es el primer usuario, será super admin
    });

    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('📋 Detalles:');
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Nombre: ${newAdmin.full_name}`);
    console.log(`   Usuario: ${newAdmin.username}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Super Admin: ${newAdmin.is_super_admin ? 'Sí' : 'No'}`);
    console.log(`   Creado: ${newAdmin.created_at}`);
    
    console.log('\n🚀 Puedes acceder al panel de administración en:');
    console.log('   URL: http://localhost:3000/admin/login');
    console.log(`   Usuario: ${username}`);
    console.log('   Contraseña: La que acabas de configurar\n');

  } catch (error) {
    console.error('\n❌ Error creando usuario administrador:', error.message);
    
    if (error.code === '23505') { // Unique violation
      console.log('💡 El usuario o email ya está en uso');
    }
    
    process.exit(1);
  } finally {
    rl.close();
    process.exit(0);
  }
}

// Ejecutar el script
createAdminUser();