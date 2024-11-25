import { crypto } from "https://deno.land/std/crypto/mod.ts";

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

async function verifyGitHubSignature(payload: string, signature: string): Promise<boolean> {
  if (!WEBHOOK_SECRET || !signature) return false;
  
  const key = new TextEncoder().encode(WEBHOOK_SECRET);
  const message = new TextEncoder().encode(payload);
  
  const hmac = new crypto.HmacSha256(key);
  hmac.update(message);
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', hmac.digest())))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `sha256=${hash}` === signature;
}


const server = Deno.listen({ port: 9000 });

async function handleWebhook(req: Request) {
  if (req.method === 'POST') {
    const signature = req.headers.get('X-Hub-Signature-256');
    const payload = await req.text();
    
    if (!await verifyGitHubSignature(payload, signature || '')) {
      return new Response('Invalid signature', { status: 403 });
    }
    
    const body = JSON.parse(payload);
    if (body.ref === 'refs/heads/main') {
      console.log('Main branch updated, rebuilding application...');
      
      // Execute docker compose commands from the parent directory
      const rebuild = new Deno.Command('docker', {
        args: ['compose', '-f', '/app/docker-compose.yml', 'up', '-d', '--build', 'school-bud-e-frontend'],
        cwd: '/app'
      });
      
      try {
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