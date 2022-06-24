import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
import { get_lgv_list } from "./compass_service/compass_service.ts";


serve(async (_req: any) => {
  let lgvs = await get_lgv_list('compass-gw-qa01.happify.com')
  // let foo = await get_lgv_by_id("http://localhost:8080", 1)

  return new Response(`Hello World w lgvs:! ${JSON.stringify(lgvs[0])}`, {
    headers: { "content-type": "text/plain" },
  });
});
