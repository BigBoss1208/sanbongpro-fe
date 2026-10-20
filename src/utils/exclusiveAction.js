export function exclusiveAction(action) {
  let running = false;
  return async (...args) => {
    if (running) { args[0]?.preventDefault?.(); return; }
    running = true;
    try { return await action(...args); }
    finally { running = false; }
  };
}
