"use client";
import { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Data = {
  nodes: { id: string; url: string; texte: string; createdAt: Date }[];
  links: { source: string; target: string }[];
};
export default function Graph(props: { data: Data }) {
  const dataA = props.data;
  const [data, setData] = useState<Data>(dataA);
  const [counter, setCounter] = useState(6);
  const [offset, setOffset] = useState(dataA.nodes.length);

  const FetchData = async () => {
    console.log(offset);
    const res = await fetch(
      `${process.env.BASEURL}/api/wikipedia?offset=${offset}&limit=5`,
      {
        headers: {
          Accept: "application/json",
          method: "GET",
          cache: "no-store",
        },
      }
    );
    if (res) {
      const newJson = await res.json();
      setData((prevData) => ({
        nodes: [...(prevData?.nodes || []), ...newJson.nodes],
        links: [...(prevData?.links || []), ...newJson.links],
      }));
    }
  };

  useEffect(() => {
    setOffset(data?.nodes.length);
    if (counter === 0) {
      FetchData();
      setCounter(60);
    }
    const interval = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [counter]);

  return (
    <div>
      <div className="absolute z-50 top-4 right-4 flex flex-col justify-center items-center space-y-4">
        <Link
          href="https://www.linkedin.com/in/corneliusvincent/"
          className=" text-white text-xs "
          target="_blank"
        >
          <Image
            src="https://avatars.githubusercontent.com/u/126483961?v=4"
            width={50}
            height={50}
            alt="cornelius vincent"
            className="rounded-full"
          />
        </Link>
        <Link
          target="_blank"
          href="https://github.com/Cornelius-BobCat/reseau3D/tree/master"
          className="hover:bg-black bg-stone-200/10 text-white text-xs rounded-xl p-2"
        >
          <Github size={14} />
        </Link>
      </div>
      <div className="sticky w-fit pt-5 pl-5 z-50">
        <div className="flex flex-col  scroll-smooth text-2xl font-light">
          <div>{data?.nodes.length} Nodes</div>
          <div className="text-sm text-slate-400">
            {counter} seconds before next fetch
          </div>
        </div>
      </div>
      <div className="fixed top-0 left-0 h-screen w-full">
        <ForceGraph3D
          graphData={data}
          nodeLabel={(node) => node.texte}
          nodeAutoColorBy="id"
          linkDirectionalParticles={1}
        />
      </div>
    </div>
  );
}
