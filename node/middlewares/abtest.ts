const traffic = 0.5;

const MatchRandom = () => {
  return Math.random() < traffic;
};

export async function abtest(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  const { cookies } = ctx;
  const inAbtest = cookies.get('abtest');

  if (inAbtest) {
    ctx.state.abtest = inAbtest === 'true';
    await next();
    return;
  }

  const setAbTest = MatchRandom();

  cookies.set('abtest', setAbTest.toString(), {
    path: '/',
    httpOnly: true,
    // maxAge: 60 * 60 * 24 * 30,
  });

  ctx.state.abtest = setAbTest;

  await next();
}
