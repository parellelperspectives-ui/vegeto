import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.vegeto.app",
  "appName": "Vegeto",
  "webDir": "build",
  "server": {
    "androidScheme": "https",
    "cleartext": true,
    "allowNavigation": [
      "vegeto-production.up.railway.app"
    ]
  },
  "plugins": {
    "CapacitorSQLite": {
      "androidIsEncryption": false,
      "androidBiometric": {
        "biometricAuth": false
      }
    }
  }
}

export default config;
