const fs = require('fs')
const path = require('path')

console.log('=== CHECKING ENVIRONMENT VARIABLES ===')

// Проверяем наличие .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists')
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))
  
  console.log('Environment variables found:')
  envVars.forEach(line => {
    const [key] = line.split('=')
    if (key) {
      console.log(`  - ${key.trim()}`)
    }
  })
} else {
  console.log('❌ .env.local file not found')
  console.log('Creating .env.local with required variables...')
  
  const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://izjneklmbzgaihvwgwqx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6am5la2xtYnpnYWlodnZnd3F4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk5NzQ5MCwiZXhwIjoyMDUwNTczNDkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8
SUPABASE_JWT_SECRET=your-super-secret-jwt-token-with-at-least-32-characters-long

# Database Configuration
POSTGRES_URL=postgres://postgres.izjneklmbzgaihvwgwqx:CbJyOhauEs8QMVtD@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

# Vercel Configuration
VERCEL_TOKEN=wtJ2s0OJz6g1E2TvTECeBCtc
VERCEL_TEAM_ID=team_UzfIwS1DYmABcaIQqKS2sTUn
`
  
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ .env.local file created successfully')
  } catch (error) {
    console.log('❌ Failed to create .env.local file:', error.message)
  }
}

// Проверяем переменные окружения
console.log('\n=== CHECKING PROCESS ENV ===')
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
]

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName} is set`)
  } else {
    console.log(`❌ ${varName} is not set`)
  }
})

console.log('\n=== ENVIRONMENT CHECK COMPLETE ===')
