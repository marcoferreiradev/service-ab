import type { InstanceOptions, IOContext } from "@vtex/api";
import { ExternalClient } from "@vtex/api";
import { AxiosResponse } from "axios";
import qs from "qs";
import { TIMEOUT_MS } from "..";

export const BASE_URL = {
  "http": "http://neovista.mizuno.com.br",
  "https": "https://neovista.mizuno.com.br"
}

export default class Proxy extends ExternalClient {
  constructor(context: IOContext, opts?: InstanceOptions) {
    super(BASE_URL.http, context, opts);
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
    body: any = ""
  ): Promise<any> => {
    // console.log("🔥 POST Request to /deco/render");
    // console.log('🔥 Headers:', headers);
    // console.log('🔥 Body:', body);
    // console.log("🔥 params:", params);
    // console.log("🔥 params string:", qs.stringify(params, { arrayFormat: "repeat" }));
    const contentType = headers['content-type'] || 'application/x-www-form-urlencoded';

    return this.http.post(path, body, {
      timeout: TIMEOUT_MS,
      headers: {
        ...headers,
        "X-VTEX-Use-Https": true,
        "Proxy-Authorization": this.context.authToken,
        // "Accept-Encoding": "*",
        contentType,
        "Accept-Encoding": "gzip, deflate, br",
        "X-VTEX-Proxy-To": BASE_URL.https,
        "origin": BASE_URL.https,
        "referer": BASE_URL.https,
        "hx-current-url": BASE_URL.https,
        "Connection": "keep-alive",
      },
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" }),
      transformRequest: (p) => qs.stringify(p, { arrayFormat: "repeat" })
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
        "hx-current-url": BASE_URL.https,
      },
      responseType: "stream",
      transformResponse: (x: any) => x,
      url: path,
      params,
      validateStatus: (_: any) => true,
    }) as Promise<AxiosResponse>;
  };
}
