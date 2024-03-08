"use server";

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET(request: NextRequest) {
  const client = new MongoClient(process.env.MONGODB!);
  const dbName = "reseau";
  const collectionName = "wikipedia";
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const params = request.nextUrl.searchParams;
  const offset = Number(params.get("offset")) || 0;
  const limit = Number(params.get("limit")) || 0;

  const data = await collection.find().skip(offset).limit(limit).toArray();

  const nodes = data.map(({ _id, url, texte, createdAt }) => ({
    id: String(_id),
    url,
    texte,
    createdAt,
  }));
  const links = data.map(({ _id, parent }) => ({
    source: String(_id),
    target: String(parent),
  }));

  client.close();
  //console.log({ nodes, links });
  return NextResponse.json({ nodes, links });
}
