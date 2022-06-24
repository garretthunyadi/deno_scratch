// import { validate_hpml } from "../compass_service/compass_service.ts";
import { HpmlDialog } from "../hpml/hpml.ts";
import { Dialog } from "../yarn/yarn_dialog.ts";
import { assert } from '../../deps.ts'
// import { readFileSync, writeFile } from 'fs';

const readFileSync = Deno.readFileSync
const writeFileSync = Deno.writeTextFileSync

// //var R = require('ramda');
import { R } from '../../deps.ts'

export function expandStringsToObjects(key: string, array: any): any {
    if (Array.isArray(array)) {
        return array.map(function (v: any) {
            if (typeof v === "string") {
                return {
                    [key]: v
                };
            } else {
                return v
            }
        })
    }
    else { return array }
}
export let expandStringsToSayObjects = R.curry(expandStringsToObjects)("say")

export let jlog = (pre: string, x: any) => console.log(pre, ':', JSON.stringify(x, null, 2))

export function readLinesFromFile(filepath: string): Array<string> {
    var text = readFileSync(filepath).toString();
    return text.split("\n")
}

export function readJsonFromFile(filepath: string): any {
    var text = readFileSync(filepath).toString();
    return JSON.parse(text)
}


export function writeAsJson(content: object, filepath: string) {
    let json = JSON.stringify(content, null, 2)
    // @ts-ignore
    writeFileSync(filepath, json, err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })

}

export function isObject(variable: any): variable is object {
    return variable !== undefined && variable !== null && variable.constructor === Object
}
export function isString(variable: any): variable is string {
    return typeof variable === "string"
}

export let duplicate = (x: any) => [deepCopy(x), deepCopy(x)];
// export let first = R.nth(0)
// export let second = R.nth(1)

export function deepCopy(o: object): object {
    return JSON.parse(JSON.stringify(o))
}

export let isArrayOfStrings = R.both(Array.isArray, R.all(R.is(String)))
export let isArrayOfObjects = R.both(Array.isArray, R.all(R.is(Object)))

export function ensureList(o: any): any[] {
    if (Array.isArray(o)) return o
    else return [o]
}

export let isNonEmptyString = R.both(R.is(String), R.complement(R.isEmpty))

// ?       ->  "_question"
// spaces  ->  "_"
export let key_to_name = (s: string) => {
    if (typeof s !== 'string') {
        return s
    }
    return R.pipe(
        R.replace(/\?/g, "_question"),
        R.replace(/ /g, "_"))(s)
}

/*
    converts a string name to more of a node id.
    see test case for examples.
*/
export function keyify(s?: string): string {
    if (s === undefined) return ""
    if (Array.isArray(s)) return s
    if (!s.toLowerCase) {
        console.log("keyify, not a string:", s)
    }
    return s.toLowerCase().replace("'", '').replace(/[^a-zA-Z0-9?]/g, "_");
}


export function toVariableName(s: string): string {
    // print("toVariableName", s)
    assert(typeof s === "string" && s !== undefined && s.length > 0, `to_variable_name, invalid arg: ${s}`)
    return s.startsWith('_') ? s : `_${s}`
}


function _print_(prefix: string, o: any): any {
    console.log(prefix, JSON.stringify(o, null, 2))
    return o
}
export let p = R.curry(_print_)("|>")
export let print = R.curry(_print_)


export let LOCAL_HPML_VALIDATION_HOST = "localhost:9091"
export let QA01_HPML_VALIDATION_HOST = "compass-gw-qa01.happify.com"

export async function validate_hpml_and_report_if_error(dialog: Dialog | HpmlDialog, system: 'qa01' | 'local' = 'local') {
    console.log("temp/removed - validate_hpml_and_report_if_error")
    //     let host = system === 'qa01' ? QA01_HPML_VALIDATION_HOST : LOCAL_HPML_VALIDATION_HOST
    //     let validation_errors = await validate_hpml(host, JSON.stringify(dialog))
    //     if (validation_errors.length > 0) { console.log(validation_errors) }
}
