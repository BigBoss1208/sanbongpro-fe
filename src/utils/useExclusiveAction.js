import { useRef } from "react";
import { exclusiveAction } from "./exclusiveAction";

export function useExclusiveAction(action) {
  const current = useRef(action);
  current.current = action;
  const guarded = useRef(null);
  if (!guarded.current) guarded.current = exclusiveAction((...args) => current.current(...args));
  return guarded.current;
}
