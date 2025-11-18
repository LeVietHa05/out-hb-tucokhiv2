import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataPath = path.join(process.cwd(), "data.json");

// get all books in db
export async function GET(request: NextRequest) {
  try {
    const data = JSON.parse(await fs.readFile(dataPath, "utf-8")).items;

    return NextResponse.json(data);
  } catch (error) {}
}

export async function POST(request: NextRequest) {
  try {
    const { name, qr_code } = await request.json();

    if (!name || !qr_code) {
      return NextResponse.json(
        { error: "Name and qr_code are required" },
        { status: 400 }
      );
    }

    const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));

    const newId = `book_${Date.now()}`;
    const newItem = {
      id: newId,
      name,
      type: "book",
      qr_code,
      borrowed_by: null,
    };

    data.items.push(newItem);

    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({
      message: "Book added successfully",
      item: newItem,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
