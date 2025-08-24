import { config } from 'dotenv'

// Загружаем переменные окружения
config({ path: '.env.local' })

const VERCEL_TOKEN = 'wtJ2s0OJz6g1E2TvTECeBCtc'
const TEAM_ID = 'team_UzfIwS1DYmABcaIQqKS2sTUn'
const PROJECT_NAME = 'affectivity'

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
          
          // Получаем логи ошибок
          const logsResponse = await fetch(
            `https://api.vercel.com/v2/deployments/${latestDeploy.uid}/events`,
            {
              headers: {
                'Authorization': `Bearer ${VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (logsResponse.ok) {
            const logs = await logsResponse.json()
            console.log('Error logs:')
            logs.forEach((log: any) => {
              if (log.type === 'error') {
                console.log('-', log.payload.text)
              }
            })
          }
        } else if (latestDeploy.state === 'READY') {
          console.log('✅ Deployment successful!')
        } else {
          console.log('⏳ Deployment in progress...')
        }
    } else {
      console.log('No deployments found')
    }
    
  } catch (error) {
    console.error('Error checking deploy status:', error)
  }
}

checkDeployStatus()
