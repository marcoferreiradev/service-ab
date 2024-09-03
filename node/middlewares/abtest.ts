export async function abtest(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  const {
    clients: { abtest },
  } = ctx;

  try {
    // Faça a requisição usando o client Abtest
    const response = await abtest.fetchSite();

    console.log('console full master atualizado',response)
    if (response) {
      ctx.status = 200;
      ctx.body = response;
      ctx.set('Content-Type', 'text/html');
    } else {
      ctx.status = 500;
      ctx.body = 'Failed to fetch content from the site';
    }

  } catch (error) {
    ctx.status = 500;
    ctx.body = `Error fetching site content: ${error}`;
  }
}
