export async function proxy(ctx: Context, next: () => Promise<any>) {
  const {
    req,
    state: { abtest },
    clients: { proxy },
  } = ctx;

  const currentPath = ctx.path;
  console.log("currentPath", currentPath);

  try {
    const response = await proxy.fetchSite(currentPath, {
      ...(abtest && { "X-VTEX-Proxy-To": "https://usereserva.deco.site" }),
    });

    // console.log('console full master atualizado',response)
    if (response) {
      ctx.status = 200;
      ctx.body = response;
    } else {
      ctx.status = 500;
      ctx.body = "Failed to fetch content from the site";
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = `Error fetching site content: ${error}`;
  }

  await next();
}
