import PlatformHome from "@/components/PlatformHome";

export const dynamic = "force-dynamic";

export default async function PlatformPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <PlatformHome query={q || ""} />;
}
