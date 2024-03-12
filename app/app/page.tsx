"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

export default function Home() {
  const [clientSide, setClientSide] = useState(false);
  // call conponent with dynamic import
  const ClientSideForceGraph3D = dynamic(() => import("./components/graph"), {
    ssr: false,
  });
  useEffect(() => {
    // set clientSide to true after component is mounted
    setClientSide(true);
  }, []);
  return <> {clientSide && <ClientSideForceGraph3D />}</>;
}
