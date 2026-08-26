import { notFound } from "next/navigation";
import { reportConfigs } from "@/lib/reportConfigs";
import IndicatorReportPage from "@/components/IndicatorReportPage";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { slug: string } }) {
  const config = reportConfigs[params.slug];
  if (!config) notFound();
  return <IndicatorReportPage config={config} />;
}
