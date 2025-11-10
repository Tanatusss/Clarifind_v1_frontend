// src/hooks/useCompanySearch.ts
import useSWR from "swr";
import { buildResolveUrl, resolveCompany, type ResolveResponse } from "@/lib/companyApi";

type UseCompanySearchParams = {
  q: string;
  skip: number;
  take: number;
};

export function useCompanySearch({ q, skip, take }: UseCompanySearchParams) {
  const shouldFetch = Boolean(q && q.trim().length > 0);
  const key = shouldFetch ? ["/v1/company/resolve", q, skip, take] : null;

  const { data, error, isLoading, mutate } = useSWR<ResolveResponse>(
    key,
    () => resolveCompany(q, { skip, take, count: "auto" }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // เปลี่ยนหน้าแล้วไม่สลับว่าง
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    url: shouldFetch ? buildResolveUrl(q, { skip, take }) : undefined,
  };
}
