import type { InstanceOptions, IOContext, IOResponse } from "@vtex/api";
import { ExternalClient } from "@vtex/api";
import { AxiosResponse } from "axios";
import qs from "qs";

interface FetchSiteResponse {
  data: string;
  headers: Record<string, string | string[]>;
  status: number;
}

export default class Proxy extends ExternalClient {
  constructor(context: IOContext, opts?: InstanceOptions) {
    super("http://usereserva.deco.site", context, opts);
  }

  public fetchSite = (
    path: string,
    headers?: Record<string, string>,
  ): Promise<AxiosResponse> => {
    return this.http.get("", {
      timeout: 8000,
      maxRedirects: 5,
      url: path,
      headers: {
        ...headers,
        "X-VTEX-Use-Https": true,
        "Proxy-Authorization": this.context.authToken,
        "Accept-Encoding": "*",
      },
    });
  };

  public postToDecoRender = (
    path: string,
    headers: Record<string, string>,
    params: any,
  ): Promise<any> => {
    // console.log("🔥 POST Request to /deco/render");
    // console.log('🔥 Headers:', headers);
    // console.log('🔥 Body:', body);
    // console.log("🔥 params:", params);

    return this.http.post(path, "", {
      timeout: 8000,
      headers: {
        ...headers,
        "X-VTEX-Use-Https": true,
        "Proxy-Authorization": this.context.authToken,
        "Accept-Encoding": "*",
        "X-VTEX-Proxy-To": "https://usereserva.deco.site",
        "origin": "https://usereserva.deco.site",
        "referer": "https://usereserva.deco.site",
        "hx-current-url": "https://usereserva.deco.site/",
      },
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
    });
  };

  public teste = (
    path: string,
    headers?: Record<string, string>,
    params?: any,
  ): Promise<AxiosResponse> => {
    return (this.http as any).request({
      headers: {
        ...headers,
        "X-VTEX-Use-Https": true,
        "Proxy-Authorization": this.context.authToken,
        "Accept-Encoding": "*",
        "hx-current-url": "https://usereserva.deco.site/",
      },
      responseType: "stream",
      transformResponse: (x: any) => x,
      url: path,
      params,
      validateStatus: (_: any) => true,
    }) as Promise<AxiosResponse>;
  };
}
