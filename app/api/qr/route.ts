import { NextResponse } from "next/server";
import { getCurrentUser, readPersistentData, writePersistentData } from "../../../lib/store";

let qrRevceived = {};
let lastAction: { type: string; message: string } | null = null;

export async function GET() {
  return NextResponse.json({ qr: qrRevceived, action: lastAction });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body)
    if (body.event != "qr" || body.code != 0)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    qrRevceived = {data: body.data, time: body.time};

    // Logic for book borrow/return
    const barcode = body.data;
    const currentUser = getCurrentUser();
    if (!currentUser) {
      lastAction = { type: "login_required", message: "Please Login First" };
      return NextResponse.json({ error: "No current user" }, { status: 400 });
    }

    // Check session: last_access within 5 minutes
    const now = new Date();
    const lastAccess = new Date(currentUser.last_access);
    const sessionDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    if (now.getTime() - lastAccess.getTime() > sessionDuration) {
      lastAction = { type: "login_required", message: "Session expired. Please log in again." };
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const persistentData = await readPersistentData();
    const item = persistentData.items.find((item: any) => item.qr_code.endsWith(barcode));
    if (!item) {
      lastAction = { type: "error", message: "Item not found" };
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let action: "borrow" | "return";
    if (item.borrowed_by === null) {
      item.borrowed_by = currentUser.id;
      action = "borrow";
      lastAction = { type: "borrow", message: `Borrowed: ${item.name}` };
    } else {
      item.borrowed_by = null;
      action = "return";
      lastAction = { type: "return", message: `Returned: ${item.name}` };
    }

    const newLog = {
      id: `log_${Date.now()}`,
      user_id: currentUser.id,
      action,
      item_id: item.id,
      item_name: item.name,
      timestamp: new Date().toISOString()
    };
    persistentData.activityLogs.push(newLog);

    await writePersistentData(persistentData);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
}
