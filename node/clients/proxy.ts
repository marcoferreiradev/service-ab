import type { InstanceOptions, IOContext, IOResponse } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { AxiosResponse } from 'axios'

interface FetchSiteResponse {
  data: string;
  headers: Record<string, string | string[]>;
  status: number;
}

export default class Proxy extends ExternalClient {
  constructor(context: IOContext, opts?: InstanceOptions) {
    super('http://usereserva.deco.site', context, opts)
  }

  public fetchSite = (path: string, headers?: Record<string, string>): Promise<AxiosResponse> => {
    return this.http.get('', {
      timeout: 8000,
      maxRedirects: 5,
      url: path,
      headers: {
        ...headers,
        'X-VTEX-Use-Https': true,
        'Proxy-Authorization': this.context.authToken,
        'Accept-Encoding': '*',
      },
    })

  //   return (this.http as any).request({
  //     headers:{
  //       ...headers,
  //       'X-VTEX-Use-Https': true,
  //       'Proxy-Authorization': this.context.authToken,
  //       'Accept-Encoding': '*',
  //     },
  //     responseType: 'stream',
  //     transformResponse: (x: any) => x,
  //     url: path,
  //     validateStatus: (_: any) => true,
  //   }) as Promise<AxiosResponse>
  }
}
