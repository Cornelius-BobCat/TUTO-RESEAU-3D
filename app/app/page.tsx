"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

export default function Home() {
  const [clientSide, setClientSide] = useState(false);
  const ClientSideForceGraph3D = dynamic(() => import("./components/graph"), {
    ssr: false,
  });
  useEffect(() => {
    setClientSide(true);
  }, []);
  return <> {clientSide && <ClientSideForceGraph3D />}</>;
}
