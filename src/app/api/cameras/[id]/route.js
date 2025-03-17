import { NextResponse } from "next/server";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ลบข้อมูลกล้อง
export async function DELETE(req, props) {
    const params = await props.params;
    try {
        // ลบข้อมูลกล้องตาม id
        await prisma.camera.delete({
            where: { camera_id: Number(params.id) },  
        });

        return new Response(JSON.stringify({ message: 'ลบข้อมูลกล้องสำเร็จ!' }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}