import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

serve((_req: any) => {
  return new Response("Hello World3!", {
    headers: { "content-type": "text/plain" },
  });
});