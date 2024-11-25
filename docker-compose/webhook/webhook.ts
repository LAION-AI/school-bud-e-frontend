import { crypto } from "https://deno.land/std/crypto/mod.ts";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

async function verifyGitHubSignature(payload: string, signature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return false;

  console.log('Verifying signature...');
  
  const key = new TextEncoder().encode(WEBHOOK_SECRET);
  const message = new TextEncoder().encode(payload);
  
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signed = await crypto.subtle.sign("HMAC", hmacKey, message);
  const hash = Array.from(new Uint8Array(signed))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `sha256=${hash}` === signature;
}

function parseFormUrlEncoded(formData: string): Record<string, string> {
  const params: Record<string, string> = {};
  const pairs = formData.split('&');
  
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
}

const server = Deno.listen({ port: 9000 });

async function handleWebhook(req: Request) {
  if (req.method === 'POST') {
    const signature = req.headers.get('X-Hub-Signature-256');
    const payload = await req.text();
    
    if (!await verifyGitHubSignature(payload, signature || '')) {
      return new Response('Invalid signature', { status: 403 });
    }
    
    const formData = parseFormUrlEncoded(payload);
    const body = JSON.parse(formData.payload || '{}');
    
    if (body.ref === 'refs/heads/main') {
      console.log('Main branch updated, rebuilding labeled services...');
      
      // First pull latest changes
      const pull = new Deno.Command('docker', {
        args: ['compose', '-f', '/app/docker-compose.yml', 'pull', 'school-bud-e-frontend'],
        cwd: '/app'
      });
      
      // Then rebuild and restart only the frontend service
      const rebuild = new Deno.Command('docker', {
        args: ['compose', '-f', '/app/docker-compose.yml', 'up', '-d', '--build', '--force-recreate', 'school-bud-e-frontend'],
        cwd: '/app'
      });
      
      try {
        await pull.output();
        const { code } = await rebuild.output();
        if (code === 0) {
          return new Response('Rebuild triggered successfully', { status: 200 });
        } else {
          return new Response('Rebuild failed', { status: 500 });
        }
      } catch (error) {
        console.error('Rebuild error:', error);
        return new Response('Rebuild error', { status: 500 });
      }
    }
  }
  return new Response('OK', { status: 200 });
}

console.log('Webhook server running on port 9000');
for await (const conn of server) {
  (async () => {
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
      requestEvent.respondWith(handleWebhook(requestEvent.request));
    }
  })();
}