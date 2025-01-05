interface SharedData {
  text: string;
  image?: string; // Base64 encoded image
}

let sharedData: SharedData = {
  text: '',
  image: undefined
};

export async function GET() {
  return Response.json(sharedData);
}

export async function POST(request: Request) {
  const data = await request.json();
  sharedData = { ...sharedData, ...data };
  return Response.json(sharedData);
}