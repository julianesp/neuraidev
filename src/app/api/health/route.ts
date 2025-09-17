// src/app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    // Count total products
    const productCount = await prisma.producto.count();

    return NextResponse.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalProducts: productCount,
        testQuery: result
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "..."
      }
    });
  } catch (error: unknown) {
    console.error("Health check failed:", error);

    return NextResponse.json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlExists: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "..."
      }
    }, { status: 500 });
  }
}