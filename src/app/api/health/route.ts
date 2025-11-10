import { NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

/**
 * Health Check Endpoint
 * 
 * Used for:
 * - Docker health checks
 * - Uptime monitoring
 * - Load balancer health checks
 * - Deployment verification
 * 
 * Returns:
 * - 200 OK if all services are healthy
 * - 503 Service Unavailable if any service is down
 */
export async function GET() {
  const startTime = Date.now();
  
  const health: {
    status: string;
    timestamp: string;
    uptime: number;
    environment: string | undefined;
    version: string;
    responseTime?: number;
    services: {
      database: { status: string; responseTime: number };
      redis: { status: string; responseTime: number };
    };
  } = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    services: {
      database: { status: "unknown", responseTime: 0 },
      redis: { status: "unknown", responseTime: 0 },
    },
  };

  try {
    // Check Database Connection
    const dbStart = Date.now();
    try {
      await db.execute(sql`SELECT 1`);
      health.services.database = {
        status: "healthy",
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      health.services.database = {
        status: "unhealthy",
        responseTime: Date.now() - dbStart,
      };
      health.status = "degraded";
    }

    // Check Redis Connection (if available)
    const redisStart = Date.now();
    try {
      // Check if Redis is configured
      if (process.env.REDIS_HOST) {
        // Try to import and use Redis client
        try {
          const Redis = (await import("ioredis")).default;
          const redis = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || "6379"),
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 1,
            connectTimeout: 3000,
            lazyConnect: true,
          });
          
          await redis.connect();
          await redis.ping();
          await redis.quit();
          
          health.services.redis = {
            status: "healthy",
            responseTime: Date.now() - redisStart,
          };
        } catch (redisError) {
          health.services.redis = {
            status: "unhealthy",
            responseTime: Date.now() - redisStart,
          };
          // Redis is optional, don't mark as degraded
        }
      } else {
        health.services.redis = {
          status: "not_configured",
          responseTime: 0,
        };
      }
    } catch (error) {
      health.services.redis = {
        status: "not_configured",
        responseTime: Date.now() - redisStart,
      };
    }

    const responseTime = Date.now() - startTime;
    health.responseTime = responseTime;

    // Return appropriate status code
    const statusCode = health.status === "healthy" ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}

/**
 * HEAD request support for basic health checks
 */
export async function HEAD() {
  try {
    await db.execute(sql`SELECT 1`);
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}
