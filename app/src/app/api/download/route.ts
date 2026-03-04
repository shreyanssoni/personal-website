import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    link: "https://drive.google.com/drive/folders/17RtGQ9Tqm9nzuPXj8FvE3aGkoUS2Knq6",
  });
}
