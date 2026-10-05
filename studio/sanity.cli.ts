import {defineCliConfig} from 'sanity/cli'

import {dataset, projectId} from './env'

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {
    // After the first `npm run deploy`, paste the appId it prints here so
    // later deploys reuse the same hosted Studio without prompting.
    // appId: '',
    autoUpdates: true,
  },
})
