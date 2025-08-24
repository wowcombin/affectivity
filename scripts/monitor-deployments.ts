import { config } from 'dotenv'

// Загружаем переменные окружения
config({ path: '.env.local' })

const VERCEL_TOKEN = 'wtJ2s0OJz6g1E2TvTECeBCtc'
const TEAM_ID = 'team_UzfIwS1DYmABcaIQqKS2sTUn'
const PROJECT_NAME = 'affectivity'

let lastCheckedDeployId: string | null = null

async function checkDeployStatus() {
  try {
    console.log('=== CHECKING VERCEL DEPLOY STATUS ===')
    
    // Получаем список деплоев
    const deploymentsResponse = await fetch(
      `https://api.vercel.com/v6/deployments?teamId=${TEAM_ID}&projectId=${PROJECT_NAME}&limit=5`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!deploymentsResponse.ok) {
      console.error('Failed to fetch deployments:', deploymentsResponse.status)
      return
    }
    
    const deployments = await deploymentsResponse.json()
    
    if (deployments.deployments && deployments.deployments.length > 0) {
      const latestDeploy = deployments.deployments[0]
      
      // Проверяем, не проверяли ли мы уже этот деплой
      if (lastCheckedDeployId === latestDeploy.uid) {
        console.log('No new deployments to check')
        return
      }
      
      console.log('Latest deployment:')
      console.log('- ID:', latestDeploy.uid)
      console.log('- Status:', latestDeploy.state)
      console.log('- Created:', new Date(latestDeploy.created).toLocaleString())
      console.log('- URL:', latestDeploy.url)
      console.log('- Commit:', latestDeploy.meta?.githubCommitMessage)
      
      if (latestDeploy.state === 'ERROR') {
        console.log('❌ Deployment failed!')
        console.log('- Error Code:', latestDeploy.errorCode)
        console.log('- Error Message:', latestDeploy.errorMessage)
        
        // Анализируем ошибку и предлагаем решение
        await analyzeAndFixError(latestDeploy)
        
      } else if (latestDeploy.state === 'READY') {
        console.log('✅ Deployment successful!')
      } else {
        console.log('⏳ Deployment in progress...')
      }
      
      lastCheckedDeployId = latestDeploy.uid
    }
    
  } catch (error) {
    console.error('Error checking deploy status:', error)
  }
}

async function analyzeAndFixError(deploy: any) {
  console.log('🔍 Analyzing error...')
  
  if (deploy.errorCode === 'BUILD_UTILS_SPAWN_1') {
    console.log('📝 Build error detected. This usually means TypeScript compilation failed.')
    
    // Получаем логи ошибок для более детального анализа
    const logsResponse = await fetch(
      `https://api.vercel.com/v2/deployments/${deploy.uid}/events`,
      {
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (logsResponse.ok) {
      const logs = await logsResponse.json()
      console.log('📋 Build logs:')
      
      let hasTypeScriptError = false
      let errorDetails = ''
      
      logs.forEach((log: any) => {
        if (log.type === 'error' || log.type === 'log') {
          const text = log.payload?.text || ''
          console.log('-', text)
          
          if (text.includes('Type error') || text.includes('Failed to compile')) {
            hasTypeScriptError = true
            errorDetails = text
          }
        }
      })
      
      if (hasTypeScriptError) {
        console.log('🔧 TypeScript error detected. Need to fix compilation issues.')
        console.log('💡 Common fixes:')
        console.log('   - Check for syntax errors in TypeScript files')
        console.log('   - Fix missing imports or type definitions')
        console.log('   - Ensure all required dependencies are installed')
        console.log('   - Check for unused variables or imports')
      }
    }
  }
}

// Функция для запуска мониторинга
async function startMonitoring() {
  console.log('🚀 Starting deployment monitoring...')
  console.log('📡 Will check for new deployments every 30 seconds')
  
  // Первая проверка
  await checkDeployStatus()
  
  // Запускаем мониторинг каждые 30 секунд
  setInterval(checkDeployStatus, 30000)
}

// Запускаем мониторинг
startMonitoring()
