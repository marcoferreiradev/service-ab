import type { IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'

interface FetchSiteResponse {
  data: string;
  headers: Record<string, string | string[]>;
  status: number;
}

export default class Abtest extends ExternalClient {
  constructor(context: IOContext) {
    super('http://usereserva.deco.site', context)
  }

  public fetchSite = (): Promise<FetchSiteResponse> => {
    return this.http.get('', {
      timeout: 8000,
      maxRedirects: 5,
      headers: {
        'X-VTEX-Proxy-To':"https://usereserva.deco.site",
        'X-VTEX-Use-Https': true,
        'Proxy-Authorization': this.context.authToken,
        'Accept-Encoding': '*',
      },
    })
  }
}
