import { useMemo } from "react";
import { useLocation } from "react-router";

export const useReqQueryParams = () => {
  const search = useLocation().search;
  return useMemo(() => new URLSearchParams(search), [search]);
};
