import AppLayout from "@/components/AppLayout";
import { getHome } from "@/utils/routes";
import { useEffect, useState } from "react";

export default async function Home() {
  const home = await getHome();

  return <AppLayout>{home.lists.map((l) => l.name)}</AppLayout>;
}
