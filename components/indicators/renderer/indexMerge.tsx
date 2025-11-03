"use client";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { GenericDetail } from "./GenericDetail";
import { AD10000 } from "./AD10000";
import AD20000 from "./AD20000";
import AU10000 from "./AU10000";
import AU20000 from "./AU20000";
import C10000 from "./C10000";
import D10000 from "./D10000";
import D40000 from "./D40000";
import D60000 from "./D60000";
import H20000 from "./H20000";
import H30000 from "./H30000";
import H40000 from "./H40000";
import H70000 from "./H70000";
import S20000 from "./S20000";
import S30000 from "./S30000";
import D70000 from "./D70000";
import D80000 from "./D80000";
import S50000 from "./S50000";
import F10000 from "./F10000";
import U10000 from "./U10000";
import U30000 from "./U30000";



// ---------------------------
// Map ทุกตัว
// ---------------------------
export const DETAIL_RENDERERS: Record<string, (d: IndicatorDetailResponse) => JSX.Element> = {
  // Shared resources
  AD10000: (d) => <AD10000 resp={d} />, 
  AD20000: (d) => <AD20000 resp={d} />,
  AU10000: (d) => <AU10000 resp={d} />,
  AU20000: (d) => <AU20000 resp={d} />,

  // Shareholding patterns
  C10000: (d) => <C10000 resp={d} />,
  H20000: (d) => <H20000 resp={d} />,
  H30000: (d) => <H30000 resp={d} />,
  H40000: (d) => <H40000 resp={d} />,
  H70000: (d) => <H70000 resp={d} />,
  S20000: (d) => <S20000 resp={d} />,
  S30000: (d) => <S30000 resp={d} />,
  U30000: (d) => <U30000 resp={d} />,

  // Directorship pattern
  D10000: (d) => <D10000 resp={d} />,
  D40000: (d) => <D40000 resp={d} />,
  D60000: (d) => <D60000 resp={d} />,
  D70000: (d) => <D70000 resp={d} />,
  D80000: (d) => <D80000 resp={d} />,

  // Foreigner control
  S50000: (d) => <S50000 resp={d} />,
  U10000: (d) => <U10000 resp={d} />,

  // Financial
  F10000: (d) => <F10000 resp={d} />,

  // High-risk industry
  // I10000: (d) => <I10000 resp={d} />,
  // I20000: (d) => <I20000 resp={d} />,
  // I30000: (d) => <I30000 resp={d} />,
};

// ---------------------------
// ใช้ render ตามรหัส
// ---------------------------
export function renderDetailByCode(code: string, resp: IndicatorDetailResponse) {
  const upper = code.toUpperCase();
  const renderer = DETAIL_RENDERERS[upper];
  return renderer ? renderer(resp) : <GenericDetail resp={resp} />;
}
