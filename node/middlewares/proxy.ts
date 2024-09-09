import { forEachObjIndexed, pick } from "ramda";
import bodyParser from "co-body";
import { error } from "console";

const DECO_ROUTES = [
  "/live/",
  "/fonts/",
  "/deco/",
  "/_frsh/",
  "/image/",
  "/sprites",
  "/site.webmanifest",
  "/sw",
];

const HEADERS_TO_SEND = [
  "accept",
  "accept-language",
  "content-length",
  "content-type",
  "rest-range",
  "x-forwarded-host",
  "x-forwarded-path",
  "x-vtex-root-path",
  "cloudfront-is-mobile-viewer",
  "cloudfront-is-tablet-viewer",
  "cloudfront-viewer-country",
  "vtex-io-device-type",
  "vtex-io-viewer-country",
];

const HEADERS_TO_RESPOND = [
  "content-type",
  "cache-control",
  "access-control-allow-origin",
  "access-control-allow-credentials",
  "access-control-allow-headers",
  "x-frame-options",
  "x-vtex-etag-control",
];

const ORIGINAL_PATH_HEADER = "x-vtex-original-path";
const FORWARDED_PATH_HEADER = "x-forwarded-path";

const isDecoRoute = (path: string) => {
  return DECO_ROUTES.some((route) => path.startsWith(route));
};

export async function proxy(ctx: Context, next: () => Promise<any>) {
  const {
    state: { abtest },
    clients: { proxy },
    query,
    vtex: {
      route: { id },
    },
  } = ctx;
  const currentPath = ctx.path;
  console.log(`🔥 Iniciando proxy para o id ${id} - rota:`, currentPath);

  const segmentToken = ctx.cookies.get("vtex_segment");
  const sessionToken = ctx.cookies.get("vtex_session");
  const bindingAddress = ctx.cookies.get("vtex_binding_address");

  const segmentCookie = segmentToken ? `vtex_segment=${segmentToken};` : "";
  const sessionCookie = sessionToken ? `vtex_session=${sessionToken};` : "";
  const bindingAddressCookie = bindingAddress
    ? `vtex_binding_address=${bindingAddress}`
    : "";

  const cookie =
    `VtexIdclientAutCookie=${ctx.vtex.authToken};${segmentCookie}${sessionCookie}${bindingAddressCookie}`;

  const forwardedPath = ctx?.get(FORWARDED_PATH_HEADER);
  const originalPathHeader = forwardedPath
    ? { [ORIGINAL_PATH_HEADER]: encodeURI(forwardedPath) }
    : null;

  const headers = {
    ...pick(HEADERS_TO_SEND, ctx?.request?.headers),
    cookie,
    ...originalPathHeader,
    ...(isDecoRoute(currentPath)
      ? { "X-VTEX-Proxy-To": "https://usereserva.deco.site" }
      : abtest && {
        "X-VTEX-Proxy-To": "https://usereserva.deco.site",
      }),
  };


  const params = { ...query };

  if (ctx.method === "POST" && currentPath.includes("/deco/render")) {
    const contentType = ctx.get("content-type") || "";

    const body = contentType
      ? await bodyParser(ctx.req).catch((error) => {
        console.log("🔥 error in bodyParser", error);

        return "";
      })
      : "";

    try {
      const response = await proxy.postToDecoRender(
        ctx.url,
        headers,
        params,
        body,
      );
      ctx.body = response;
    } catch (error) {
      console.error("🔥 Error in POST /deco/render:", error);
      ctx.status = 500;
      ctx.body = `Error processing /deco/render: ${error}`;
    }

    await next();
    return;
  }

  try {
    const response = await proxy.teste(ctx.url, headers, params);

    ctx.status = response?.status || 500;
    ctx.body = response?.data;

    if (response?.headers?.vary) {
      ctx.vary(response.headers.vary);
    }

    const headersToRespond = pick(HEADERS_TO_RESPOND, response?.headers || {});
    forEachObjIndexed(
      (value: string, header) => value && ctx.set(header, value),
      headersToRespond,
    );

    if (response?.headers?.["content-encoding"]) {
      ctx.set("Content-Encoding", response?.headers["content-encoding"]);
    }
  } catch (error) {
    console.error("🔥 Error fetching site content:", error);
    ctx.status = 500;
    ctx.body = `Error fetching site content: ${error}`;
  }

  await next();
}
