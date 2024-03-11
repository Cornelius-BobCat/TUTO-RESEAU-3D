"use client";
import { useEffect, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import { Github, InfinityIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

type Data = {
  nodes: { id: string; url: string; texte: string; createdAt: Date }[];
  links: { source: string; target: string }[];
};
export default function Graph() {
  const [infinity, setInfinity] = useState(false);
  const [relaod, setRelaod] = useState(false);
  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data, error, isLoading, mutate } = useSWR("/api/wikipedia", fetcher);

  const [counter, setCounter] = useState(timeToNextTenMinutes());

  useEffect(() => {
    if (counter === 0) {
      setRelaod(true);
      const fetchMoreData = async () => {
        const nextUrl = `/api/wikipedia?offset=${data?.nodes.length}&limit=5`; // Calculate offset based on current data
        const newData = await fetcher(nextUrl);
        if (newData) {
          mutate((currentData: any) => ({
            ...currentData,
            nodes: [...currentData.nodes, ...newData.nodes], // Concatenate existing and new nodes
            links: [...currentData.links, ...newData.links], // Concatenate existing and new links
          }));
        }
      };
      fetchMoreData();
      setCounter(timeToNextTenMinutes());
      setRelaod(false);
    }
  }, [counter]);

  useEffect(() => {
    setCounter(timeToNextTenMinutes());
  }, []);

  const Rerun = () => {
    setInfinity(!infinity);
  };

  if (error) return <div>échec du chargement</div>;
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-stone-200"></div>
      </div>
    );

  return (
    <div>
      {infinity && (
        <div className="z-50 fixed bg-black/70 w-full h-screen flex justify-center items-center">
          <div className=" relative">
            <button
              onClick={Rerun}
              className="hover:bg-black text-black hover:text-white bg-stone-200 text-xs rounded-xl p-2 absolute -top-2 -right-2"
            >
              <X size={12} className="" />
            </button>
            <div className="p-10 bg-white rounded-xl">
              <h1 className="text-stone-700 text-2xl font-semibold">
                POC reseau 3d
              </h1>
              <p className="text-stone-500 text-sm font-light">
                This project and a concept of 3d network creation.
                <br />
                <ul className="py-2">
                  <li>
                    Collection of Wikipedia url data (5 random links per page)
                  </li>
                  <li>storage in a mongoDB database on an EC2 instance</li>
                  <li>Data consumption via React and Next.js</li>
                  <li>CICD github / vercel</li>
                </ul>
                The code for this POC is available on github - MIT License
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="absolute z-40 top-4 right-4 flex flex-col justify-center items-center space-y-4">
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
          href="https://github.com/Cornelius-BobCat/TUTO-RESEAU-3D"
          className="hover:bg-black bg-stone-200/10 text-white text-xs rounded-xl p-2"
        >
          <Github size={14} />
        </Link>
        <button
          onClick={Rerun}
          className="hover:bg-black bg-stone-200/10 text-white text-xs rounded-xl p-2 "
        >
          <InfinityIcon size={12} />
        </button>
      </div>
      <div className="sticky w-fit pt-5 pl-5 z-50">
        <div className="flex flex-col  scroll-smooth text-2xl font-light">
          <div className="flex flex-rows">
            <span>{data?.nodes.length} Nodes</span>
          </div>

          <div className="text-sm text-slate-400">
            {!relaod ? (
              <>{counter} seconds before next fetch</>
            ) : (
              "fetching data ..."
            )}
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

const timeToNextTenMinutes = () => {
  const now = new Date();
  const currentMinutes = now.getUTCMinutes();
  const currentSeconds = now.getUTCSeconds();
  const totalSecondsSinceHourStart = currentMinutes * 60 + currentSeconds;
  const secondsUntilNextTenMinutes = 600 - (totalSecondsSinceHourStart % 600);
  return secondsUntilNextTenMinutes;
};
