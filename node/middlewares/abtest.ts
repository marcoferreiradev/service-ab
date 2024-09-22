const convertTraffic = (value: number) => {
  value = value || 1;
  return value / 100;
};

const traffic = convertTraffic(50);

const MatchRandom = () => Math.random() < traffic;

export async function abtest(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  const { cookies, query } = ctx;

  if (query?.abtest) {
    const abtestFlag = query.abtest === "1" ? 1 : 0;

    cookies.set("abtest", abtestFlag.toString(), {
      path: "/",
      httpOnly: false,
    });

    ctx.state.abtest = abtestFlag === 1;
    await next();
    return;
  }

  const inAbtest = cookies.get("abtest");

  if (inAbtest) {
    ctx.state.abtest = inAbtest === "1";
  } else {
    const setAbTest = MatchRandom() ? 1 : 0;
    cookies.set("abtest", setAbTest.toString(), {
      path: "/",
      httpOnly: false,
    });

    ctx.state.abtest = setAbTest === 1;
  }

  await next();
}
