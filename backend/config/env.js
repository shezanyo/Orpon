/**
 * Environment Variable Validation & Management
 * Ensures required config is present before the app starts
 */

const requiredVars = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'BACKEND_URL',
  'FRONTEND_URL',
  'BKASH_USERNAME',
  'BKASH_PASSWORD',
  'BKASH_APP_KEY',
  'BKASH_APP_SECRET',
  'BKASH_BASE_URL',
  'SSLCOMMERZ_STORE_ID',
  'SSLCOMMERZ_STORE_PASSWORD',
  'SSLCOMMERZ_BASE_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const validateEnv = () => {
  const missing = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('❌ FATAL: Missing required environment variables:');
    missing.forEach(v => console.error(`   - ${v}`));
    console.error('\n📋 Required Configuration:');
    console.error('   Set these in your .env file (local) or Azure App Service Settings (production):\n');
    
    console.error('   Database:');
    console.error('   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME');
    console.error('   - BACKEND_URL (your backend API URL)');
    console.error('   - FRONTEND_URL (your frontend/SPA URL)\n');
    
    console.error('   Security:');
    console.error('   - JWT_SECRET (random string, e.g., "your-secret-key-here")\n');
    
    console.error('   Payments (bKash Sandbox):');
    console.error('   - BKASH_USERNAME, BKASH_PASSWORD');
    console.error('   - BKASH_APP_KEY, BKASH_APP_SECRET\n');
    
    console.error('   Payments (SSLCommerz Sandbox):');
    console.error('   - SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD\n');

    process.exit(1);
  }

  console.log('✅ All required environment variables are set');
  
  // Check optional SMTP variables for email service
  const optionalSMTPVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'];
  const missingSMTP = optionalSMTPVars.filter(v => !process.env[v]);
  if (missingSMTP.length > 0) {
    console.warn('⚠️ WARNING: Optional SMTP configuration variables are missing:');
    missingSMTP.forEach(v => console.warn(`   - ${v}`));
    console.warn('   Email sending will be simulated, and password reset links will be printed to the server console.\n');
  } else {
    console.log('✉️ SMTP Email Service configuration is fully set.\n');
  }
  
  // Log important configuration (without secrets)
  console.log('\n📍 Current Configuration:');
  console.log(`   Backend URL: ${process.env.BACKEND_URL}`);
  console.log(`   Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`   Database: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`   JWT Secret: ${process.env.JWT_SECRET.substring(0, 10)}...`);
  console.log(`   Redis: ${process.env.USE_REDIS === 'true' ? 'ENABLED' : 'DISABLED (using local memory)'}\n`);
};

module.exports = { validateEnv };
