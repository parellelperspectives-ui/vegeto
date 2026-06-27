import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.vegeto.app",
  "appName": "Vegeto",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
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
