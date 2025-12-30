import { NextRequest, NextResponse } from 'next/server';
import { Workbook } from 'exceljs';
import fs from 'fs/promises';
import path from 'path';
import {
    UserData,
    DetectionData,
    User,
    Item,
    Prediction,
    ActivityLog,
    ExportRow
} from '@/lib/type';

export async function GET(request: NextRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'excel';

        // Đọc dữ liệu từ file
        const userDataPath = path.join(process.cwd(), 'data.json');
        const detectionDataPath = path.join(process.cwd(), 'data', 'detections.json');

        const [userDataFile, detectionDataFile] = await Promise.all([
            fs.readFile(userDataPath, 'utf8'),
            fs.readFile(detectionDataPath, 'utf8')
        ]);

        const userData: UserData = JSON.parse(userDataFile);
        const detectionData: DetectionData = JSON.parse(detectionDataFile);

        // Chuẩn bị dữ liệu
        const exportData = prepareExportData(userData, detectionData);

        let fileData: BodyInit;
        let fileName: string;
        let contentType: string;

        if (format === 'csv') {
            const csvContent = generateCSV(exportData);
            fileData = csvContent;
            fileName = `export_${Date.now()}.csv`;
            contentType = 'text/csv; charset=utf-8';
        } else {
            const buffer = await generateExcel(exportData);
            // Tạo Uint8Array từ buffer và cast thành BodyInit
            const uint8Array = new Uint8Array(buffer);
            fileData = uint8Array as BodyInit;
            fileName = `export_${Date.now()}.xlsx`;
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        }

        // Trả về Response với file data
        return new Response(fileData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': fileData instanceof Uint8Array
                    ? fileData.length.toString()
                    : new TextEncoder().encode(fileData as string).length.toString(),
            },
        });

    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json(
            { error: 'Failed to export data' },
            { status: 500 }
        );
    }
}

function prepareExportData(userData: UserData, detectionData: DetectionData): ExportRow[] {
    const rows: ExportRow[] = [];

    // Current User
    if (userData.currentUser) {
        rows.push({
            category: 'Current User',
            id: userData.currentUser.id,
            name: userData.currentUser.name,
            type: userData.currentUser.role,
            details: `Fingerprint: ${userData.currentUser.fingerprint_status}, Position: ${userData.currentUser.positionFingerprint}`,
            timestamp: userData.currentUser.last_access
        });
    }

    // All Users
    userData.allUsers.forEach((user: User) => {
        rows.push({
            category: 'All Users',
            id: user.id,
            name: user.name,
            type: user.role,
            details: `Fingerprint: ${user.fingerprint_status}`,
            timestamp: user.last_access
        });
    });

    // Items
    userData.items.forEach((item: Item) => {
        rows.push({
            category: 'Items',
            id: item.id,
            name: item.name,
            type: item.type,
            details: `QR Code: ${item.qr_code}, Borrowed by: ${item.borrowed_by}`,
            timestamp: ''
        });
    });

    // Activity Logs 
    if (userData.activityLogs && Array.isArray(userData.activityLogs)) {
        userData.activityLogs.forEach((log: ActivityLog) => {
            rows.push({
                category: 'Activity Log',
                id: log.id,
                name: log.item_name,
                type: `Action: ${log.action}`,
                details: `User ID: ${log.user_id}, Item ID: ${log.item_id}`,
                timestamp: log.timestamp,
                action: log.action,
                user_id: log.user_id,
                item_name: log.item_name
            });
        });
    }

    // Predictions
    detectionData.predictions.predictions.forEach((prediction: Prediction) => {
        rows.push({
            category: 'Detection',
            id: prediction.detection_id,
            name: prediction.class,
            type: `Class ID: ${prediction.class_id}`,
            details: `Position: (${prediction.x}, ${prediction.y}), Size: ${prediction.width}x${prediction.height}`,
            timestamp: detectionData.time,
            confidence: prediction.confidence,
            position: `${prediction.x},${prediction.y}`
        });
    });

    return rows;
}

function generateCSV(data: ExportRow[]): string {
    const headers = ['Category', 'ID', 'Name', 'Type', 'Details', 'Timestamp', 'Confidence', 'Position', 'Action', 'User_ID', 'Item_Name'];
    const rows = data.map(row => [
        row.category,
        row.id,
        row.name,
        row.type,
        row.details,
        row.timestamp,
        row.confidence?.toString() || '',
        row.position || '',
        row.action || '',
        row.user_id || '',
        row.item_name || ''
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row =>
            row.map(cell =>
                `"${cell.toString().replace(/"/g, '""')}"`
            ).join(',')
        )
    ].join('\n');

    return csvContent;
}

async function generateExcel(data: ExportRow[]): Promise<Buffer> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Export Data');

    worksheet.columns = [
        { header: 'Category', key: 'category', width: 15 },
        { header: 'ID', key: 'id', width: 25 },
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Type', key: 'type', width: 20 },
        { header: 'Details', key: 'details', width: 40 },
        { header: 'Timestamp', key: 'timestamp', width: 25 },
        { header: 'Confidence', key: 'confidence', width: 12 },
        { header: 'Position', key: 'position', width: 15 },
        { header: 'Action', key: 'action', width: 12 },       
        { header: 'User_ID', key: 'user_id', width: 25 },     
        { header: 'Item_Name', key: 'item_name', width: 25 }  
    ];

    data.forEach(row => {
        worksheet.addRow({
            category: row.category,
            id: row.id,
            name: row.name,
            type: row.type,
            details: row.details,
            timestamp: row.timestamp,
            confidence: row.confidence,
            position: row.position,
            action: row.action || '',       
            user_id: row.user_id || '',     
            item_name: row.item_name || '' 
        });
    });

    // Style cho header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E8' } // Màu xanh lá nhạt cho header
    };

    // Style cho từng loại category
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            const category = row.getCell('category').value;

            // Màu nền khác nhau cho từng category
            switch (category) {
                case 'Current User':
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } }; // AliceBlue
                    break;
                case 'All Users':
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } }; // WhiteSmoke
                    break;
                case 'Items':
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F5' } }; // LavenderBlush
                    break;
                case 'Activity Log':
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FFF0' } }; // Honeydew
                    break;
                case 'Detection':
                    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F8FF' } }; // AliceBlue
                    break;
            }
        }
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        if (column.width) {
            column.width = Math.max(column.width, 10);
        }
    });

    // Tạo sheet riêng cho Activity Logs (tuỳ chọn)
    if (data.some(row => row.category === 'Activity Log')) {
        const activitySheet = workbook.addWorksheet('Activity Logs');

        activitySheet.columns = [
            { header: 'Timestamp', key: 'timestamp', width: 25 },
            { header: 'Action', key: 'action', width: 15 },
            { header: 'User ID', key: 'user_id', width: 25 },
            { header: 'Item Name', key: 'item_name', width: 30 },
            { header: 'Item ID', key: 'item_id', width: 25 }
        ];

        // Lọc chỉ activity logs
        const activityRows = data.filter(row => row.category === 'Activity Log');
        activityRows.forEach(row => {
            // Extract item_id từ details nếu có
            const itemIdMatch = row.details.match(/Item ID: ([^,]+)/);
            const itemId = itemIdMatch ? itemIdMatch[1] : '';

            activitySheet.addRow({
                timestamp: row.timestamp,
                action: row.action,
                user_id: row.user_id,
                item_name: row.item_name,
                item_id: itemId
            });
        });

        // Style cho activity sheet
        const activityHeader = activitySheet.getRow(1);
        activityHeader.font = { bold: true };
        activityHeader.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE8F5E8' }
        };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}