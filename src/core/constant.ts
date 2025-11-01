export class ApiSource {
  static PORT: number = 3000;

  private static getConfig(key: string): string {
    const env = (window as any)._env_;
    if (env && env[key]) {
      return env[key];
    }

    console.warn(`Configuration ${key} not found`);
    return '';
  }

  static get url(): string {
    return this.getConfig('VITE_BACKEND_URL');
  }

  static get strapiUrl(): string {
    return this.getConfig('VITE_STRAPI_URL');
  }

  static get botUrl(): string {
    return this.getConfig('VITE_BOT_URL');
  }

  static get environment(): string {
    return this.getConfig('VITE_APP_ENV');
  }

  // Méthode utilitaire pour vérifier la configuration
  static validateConfig(): boolean {
    const required = ['VITE_BACKEND_URL', 'VITE_STRAPI_URL'];
    const missing = required.filter((key) => !this.getConfig(key));

    if (missing.length > 0) {
      console.error('Missing required configuration:', missing);
      return false;
    }

    return true;
  }
}
