import { NextResponse } from "next/server";

const KIE_DOWNLOAD_URL =
  "https://api.kie.ai/api/v1/common/download-url";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.KIE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "KIE_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { error: "A Kie-generated file URL is required" },
        { status: 400 }
      );
    }

    const response = await fetch(KIE_DOWNLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Kie.ai download URL request failed",
          details: data,
        },
        { status: response.status }
      );
    }

    if (!data || typeof data.data !== "string") {
      return NextResponse.json(
        { error: "Kie.ai returned an unexpected response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      downloadUrl: data.data,
    });
  } catch (error) {
    console.error("Kie.ai download URL error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
