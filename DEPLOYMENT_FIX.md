# Deployment Fix for Render

## Problem
The deployment was failing with the error:
```
Error: Cannot find module '/opt/render/project/src/backend/dist/main.js'
```

This occurred because Render expected the project structure to include a `src` directory at the root level.

## Solution Applied

### 1. Directory Restructure
- Moved the `backend` directory into `src/` directory
- New structure: `src/backend/`

### 2. Updated package.json Scripts
Changed scripts to reflect the new directory structure:
```json
{
  "scripts": {
    "build": "cd src/backend && npm run build",
    "start:prod": "node ./src/backend/dist/main.js",
    "prebuild": "cd src/backend && npm install",
    "postinstall": "cd src/backend && npm install"
  }
}
```

### 3. Created render.yaml
Added configuration file for Render deployment:
```yaml
services:
  - type: web
    name: online-boutique-backend
    runtime: node
    buildCommand: npm run build
    startCommand: npm run start:prod
```

### 4. Updated start.sh
Modified the startup script to use the new path:
```bash
#!/bin/bash
cd src/backend && node dist/main.js
```

## Result
These changes ensure that:
1. The compiled files are in the expected location: `src/backend/dist/`
2. All build and startup commands use the correct paths
3. Render can properly locate and run the application

The deployment should now succeed without the MODULE_NOT_FOUND error.