export const bootApp = async (path = "/", { timeout = 30000 } = {}) => {
  const frame = document.createElement("iframe");
  frame.style.cssText = "width:1024px;height:768px;border:0;position:absolute;left:-2000px;top:0";
  frame.src = path;
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  await new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const tick = setInterval(() => {
      if (win.$APP?.ready) {
        clearInterval(tick);
        resolve(undefined);
      } else if (Date.now() > deadline) {
        clearInterval(tick);
        reject(new Error(`app at ${path} did not boot within ${timeout}ms`));
      }
    }, 50);
  });
  await win.$APP.ready;
  return { win, $APP: win.$APP, doc: frame.contentDocument, frame };
};

export const disposeApp = (app) => app?.frame?.remove();

export const awaitModule = async (win, name, { timeout = 10000 } = {}) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (typeof win.$APP?.[name]?.get === "function") return win.$APP[name].get();
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`controller "${name}" not registered within ${timeout}ms`);
};

export const wipe = async ($APP, model) => {
  const rows = await $APP.Model[model].getAll().catch(() => []);
  for (const row of rows) if (row?.id) await $APP.Model[model].remove(row.id).catch(() => {});
};
