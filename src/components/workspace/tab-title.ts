/** Only path-parameter routes have separately named page instances. */
export const canRenameRouteTab = (matched: readonly { path: string }[]) =>
  matched.some(({ path }) => {
    for (let index = 0; index < path.length; index++) {
      if (path[index] === "\\") index++;
      else if (path[index] === ":") return true;
    }
    return false;
  });
