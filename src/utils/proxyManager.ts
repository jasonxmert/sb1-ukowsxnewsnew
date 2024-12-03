import axios from 'axios';

const PROXY_LIST = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.rss2json.com/v1/api.json?rss_url='
];

class ProxyManager {
  private currentProxy = 0;
  private failedAttempts: Record<string, number> = {};

  private getNextProxy(): string {
    const proxy = PROXY_LIST[this.currentProxy];
    this.currentProxy = (this.currentProxy + 1) % PROXY_LIST.length;
    return proxy;
  }

  async fetch(url: string, options: any = {}): Promise<any> {
    let lastError;
    
    for (let i = 0; i < PROXY_LIST.length; i++) {
      const proxy = this.getNextProxy();
      
      try {
        const response = await axios({
          ...options,
          url: `${proxy}${encodeURIComponent(url)}`,
          timeout: options.timeout || 15000,
          headers: {
            ...options.headers,
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
            'Accept': 'application/json, text/plain, */*'
          }
        });

        // Handle RSS2JSON API specific response format
        if (proxy.includes('rss2json')) {
          if (response.data?.status === 'ok' && response.data?.items) {
            return { data: response.data.items };
          }
          throw new Error('Invalid RSS2JSON response');
        }

        // Ensure response data is a plain object/array
        const cleanData = JSON.parse(JSON.stringify(response.data));
        return { data: cleanData };
      } catch (error) {
        lastError = error;
        this.failedAttempts[proxy] = (this.failedAttempts[proxy] || 0) + 1;
        continue;
      }
    }

    throw new Error(`Failed to fetch after trying all proxies. Last error: ${lastError?.message}`);
  }
}

export const proxyManager = new ProxyManager();