export async function status(ctx: Context, next: () => Promise<any>) {
  const {
    req,
    state: { code },
    clients: { status },
  } = ctx

  const currentPath = ctx.path
  console.log('currentPath',currentPath)

  try {
    const response = await status.fetchSite(currentPath,{
      'X-VTEX-Proxy-To':"https://usereserva.deco.site",
    });

    // console.log('console full master atualizado',response)
    if (response) {
      ctx.status = 200;
      ctx.body = response;
    } else {
      ctx.status = 500;
      ctx.body = 'Failed to fetch content from the site';
    }

  } catch (error) {
    ctx.status = 500;
    ctx.body = `Error fetching site content: ${error}`;
  }

  await next()
}
