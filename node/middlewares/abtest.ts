const traffic = 0.5;

const MatchRandom = () => Math.random() < traffic;

export async function abtest(
  ctx: Context,
  next: () => Promise<unknown>,
) {
  const { cookies, query } = ctx;

  if (query?.abtest) {
    const abtestFlag = query.abtest === "true";

    cookies.set("abtest", abtestFlag.toString(), {
      path: "/",
      httpOnly: false,
    });

    ctx.state.abtest = abtestFlag;
    await next();
    return;
  }

  const inAbtest = cookies.get("abtest");

  if (inAbtest) {
    ctx.state.abtest = inAbtest === "true";
  } else {
    const setAbTest = MatchRandom();
    cookies.set("abtest", setAbTest.toString(), {
      path: "/",
      httpOnly: false,
    });

    ctx.state.abtest = setAbTest;
  }

  await next();
}
