//import yargs from 'https://cdn.deno.land/yargs/versions/yargs-v16.2.1-deno/raw/deno.ts';
import { yargs } from '../deps.ts';

interface Arguments {
    from: string;
    to: string;
    body: string;
    sid: string;
    apikey: string;
    secret: string;
}

let inputArgs: Arguments = yargs(Deno.args)
    .alias('f', 'from')
    .alias('t', 'to')
    .alias('b', 'body')
    .alias('i', 'sid')
    .alias('k', 'apikey')
    .alias('s', 'secret').argv;

console.log(inputArgs);
