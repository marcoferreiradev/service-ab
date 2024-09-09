export async function searchRedirect(ctx: Context , next: () => Promise<any>) {
  const { query } = ctx.request;

  const searchTerm = query.q as string | undefined;

  if (!searchTerm) {
    ctx.path = '/_v/segment/routing/vtex.store@2.x/notFoundSearch/search' + ctx.path
    ctx.state.abtest = false;
    await next();
    return;
  }

  const encodedSearchTerm = encodeURIComponent(searchTerm);

  const redirectUrl = `/${encodedSearchTerm}?_q=${encodedSearchTerm}&map=ft`;

  ctx.status = 302;
  ctx.redirect(redirectUrl);
}
