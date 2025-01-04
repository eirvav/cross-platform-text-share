let sharedText = '';

export async function GET() {
  return Response.json({ text: sharedText });
}

export async function POST(request: Request) {
  const data = await request.json();
  sharedText = data.text;
  return Response.json({ text: sharedText });
}