import { isObject, isString, p, print } from "../Utils/utils.ts";
import { BaseYarn } from "./base_yarn.ts";
import { StrictYarn } from "./strict_yarn.ts";
import { R, assert } from '../../deps.ts'


export type LookupTable = { [key: string]: LookupEntry }
export type LookupEntry = string | LookupItem[] | boolean | number | null | undefined
export type LookupItem = string | { say: string, ack?: string }

/*
    Lookups can be for 
     - string/string[] sugar
     - say, ask, ack
     - if <condition>, 
     - else <action>,
     - options ([lookup, ...])
     - action/goto, call
     - delay?

    if the lookup is not found, return the key
    if the lookup is a string, return the string
    if the lookup is an array, duplicate the node

    if the lookup value has an "embedded lookup", like:
         "hello {username}", or
         "call {dialog-name}",
    The term inside the brackets will be looked up and the brackets diagarded.
    If the lookup value is a python expression, then the brackets should be part of the lookup value, as in:
        "hello {username}", where username: "{get(get_user_info(), 'user', 'username')}"


    lookup_say:
        {say: "hi"}, lookup: {"hi": "Hello!"} ->
        {say: "Hello!"},

        lookup: {hi:["Hello!", "I'm Anna"]}
        {say: ["Hello!", "I'm Anna"]}, // requires post-processing

        // lookups with embedded lookups
        {say: "hi"}
        lookup: {
            hi:"Hello {username}!",
            username: "get(get_user_info(), 'user', 'username')"
        }
        {say: "Hello {get(get_user_info(), 'user', 'username'}"}
        // TAKE NOTE: I will need to keep the curley braces in the result.
        // This makes recursion a bit wierd.  If I support recursive replacements, then
        // if will try to lookup 
        //     "get(get_user_info(), 'user', 'username')"
        // This will work IF I don't return a keyified result

    lookup_ask:
        {ask: "hello"}, lookup: {"Hello": "Hello!"} ->

    lookup_ack:
        {name: "hello", ack: "hello"},

    lookup_if:
        {name: "hello", if: "first_day", say: "I'm Anna, Nice to meet you!"},
        lookup: {"first_day": "sleep_interview_date == date(1,1,1)"} ->
        {name: "hello", if: "sleep_interview_date == date(1,1,1)", say: "I'm Anna, Nice to meet you!"},

        // I don't think there is any other replacement for ifs.
        // they can "pass through" to the backend though

    lookup_options:
        replace the head of the array with the lookup

    process_lookups:
        evolve:
            say: lookup_say,
            ask: lookup_ask,
            if: lookup_if,
            options: lookup_options,

*/

type Named = {
    name: string
}

export function isNamed(yarn: any): yarn is Named {
    return ('name' in yarn)
}

export let processLookups = (yarn: BaseYarn | BaseYarn[], lookups: LookupTable): BaseYarn[] => {
    if (Array.isArray(yarn)) {
        return R.flatten(yarn.map((one: BaseYarn) => processLookups(one, lookups)))
    }
    return _processLookups(yarn, lookups)
}


function _processLookups(yarn: BaseYarn, lookups: LookupTable): BaseYarn[] {
    assert(isObject(yarn), `yarn is not an object: ${typeof yarn}  \n${JSON.stringify(yarn, null, 2)}`)
    return R.evolve({
        say: lookup(lookups),
        ask: lookup(lookups),
        ack: lookup(lookups),
        if: lookup(lookups),
        then: lookupActions(lookups),
        options: lookupOptions(lookups),
        into: lookup(lookups),
        into_lgv: lookup(lookups),
        collect_lgv: lookup(lookups),
        audio: lookup(lookups),
        video: lookup(lookups),
        image: lookup(lookups),
        cover: lookup(lookups),
    })(yarn)
}

let lookup = R.curry(_lookup)

// Variants
//  "hi"
//  {say: "hi"}
//  {call: "dialog2"}
//  {say: ["hi", "hello"]}
//  ["hi", "bye"]
//  [{say: "hi"}, {say: "hello"}]
//  [{say: "hi"},"hello", {say: "hi"}]
//  []    ?
function _lookupActions(lookups: LookupTable, actions: any): any {
    if (Array.isArray(actions)) {
        return actions.map(one => _lookupActions(lookups, one))
    } else if (isObject(actions)) {
        return R.evolve({
            say: lookup(lookups),
            if: lookup(lookups),
            call: lookup(lookups),
            exit_to: lookup(lookups),
            // set: lookup(lookups), -- leaving set out for now.. seems unlikely need a lookup
            // goto: lookup(lookups),-- same as 'set' skipping for now
        })(actions)
    } else if (typeof actions === 'string') {
        return lookup(lookups)(actions)
    } else {
        throw new Error("unexpected type for then: " + typeof actions)
    }
}
let lookupActions = R.curry(_lookupActions)


function _lookupOptions(lookups: LookupTable, options: any): any {
    if (Array.isArray(options)) {
        return options.map((option: any) => {
            if (Array.isArray(option) && option.length === 2) {
                // form:  [title, ...], lookup the first element
                let res = [_simpleLookup(lookups, option[0]), ...option.slice(1)]
                return res
            } else if (Array.isArray(option) && option.length === 3) {
                // form:  [title, name, action|action[]], lookup the first element
                let res = [_simpleLookup(lookups, option[0]), option[1], _lookupActions(lookups, option[2])]
                return res
            } else { return option }
        })
    }
    return options
}
let lookupOptions = R.curry(_lookupOptions)


// let log = console.log
let stripBraces = (s: string) => {
    return s.replace(/[{}]/g, '')
}

// First level functionality, no embedded lookups
// or logic processing (e.g. inversion)
// 
// currently used bu option text lookups. that don't need embedded lookups or logic processing
function _simpleLookup(lookups: LookupTable, key: string): LookupEntry {
    if (key in lookups) {
        return lookups[key]
    } else return key
}

function _embeddedKeys(line: string): string[] {
    if (Array.isArray(line)) {
        return R.flatten(line.map(_embeddedKeys))
    }
    if (line === undefined || !isString(line)) return []
    let regex = /\{(.*?)\}/g
    let matches = line.match(regex) || []
    return matches.map(stripBraces)
}

// supports
//  embedded lookups like "hello, {username}"
//  logical inversion with the tag 'not:<cond>'
function _lookup(lookups: LookupTable, key: string): LookupEntry {
    // console.log("_lookup:", "key:", key, "lookups:", lookups)
    // console.log("_lookup:", "key:", key)

    let logical_inversion = false
    if (typeof key === 'string' && key.startsWith("not:")) {
        key = key.substring(4)
        logical_inversion = true
    }


    let val = lookups[key]

    // allow empty string replacements
    if (isString(val) && val.trim() === '') val = ''
    else val = val || key

    // lookup embedded lookups
    //   e.g. "welcome {username}"
    if (Array.isArray(val)) {
        return val.map((line: any) => {
            if (typeof line === 'string') {
                // console.log("RECURSIVE LOOKUP:", line)
                return _lookup(lookups, line)
            } else {
                // console.log("_lookup:", "line:", line, " typeof line:", typeof line)
                // throw new Error("_lookup: line is not a string")
                return line
            }
        })
    }
    else if (typeof val === 'string') {
        // let regex = /\{(.*)\}/g
        // let matches = val.match(regex) || []
        let keys = _embeddedKeys(val)
        // print("  - matches:", matches)
        // matches.forEach(embedded_possible_key => {
        keys.forEach(embedded_possible_key => {
            // embedded_possible_key = stripBraces(embedded_possible_key)
            // console.log("  - KEY:", embedded_possible_key)
            let embedded_raplacement_value = lookups[embedded_possible_key]

            // console.log("  - VALUE:", embedded_raplacement_value)
            if (typeof embedded_raplacement_value === 'number') {
                val = (val as string).replace(`{${embedded_possible_key}}`, embedded_raplacement_value.toString())
            } else if ((typeof embedded_raplacement_value === 'string') && embedded_raplacement_value) {
                let new_val = _lookup(lookups, embedded_raplacement_value)
                if (typeof new_val === 'string') {
                    val = (val as string).replace(`{${embedded_possible_key}}`, new_val)
                }
            } else if (Array.isArray(embedded_raplacement_value)) {
                // console.log("   -- IS ARRAY", embedded_raplacement_value)
                throw new Error("Not yet supported")
            }
        })
    }



    // // look for embedded keys in the value, like:  "not (key)"
    // // and recall to replace those keys
    // let embedded_key = _embedded_key(val)
    // if (embedded_key!== undefined) {
    //     val = _lookup(lookups, embedded_key)
    // }

    // log("  - res:", val)
    if (logical_inversion) {
        //console.log("  - logical_inversion:", logical_inversion)
        val = `not (${val})`
    }
    return val
}

// function to find all lookup keys in the yarn
export function findLookupKeys(yarn: StrictYarn[], lookups: LookupTable): string[] {
    let says = R.pluck('say')(yarn)
    let asks = R.pluck('ask')(yarn)
    let ifs = R.pluck('if')(yarn)

    let extractThenProperty = (prop: String, node: StrictYarn): string[] => {
        if ('then' in node) {
            return R.flatten(R.pluck(prop)(node.then))
        } else {
            return []
        }
    }
    let extractThenSays = R.curry(extractThenProperty)('say')
    let extractThenGotos = R.curry(extractThenProperty)('goto')

    let then_says = R.map(extractThenSays)(yarn)
    let then_gotos = R.map(extractThenGotos)(yarn)

    let options = R.pipe(
        R.pluck('options'),
        R.without([undefined]),
        R.map(R.map(R.nth(0))),
        R.flatten,
        R.uniq,
    )(yarn)

    let say_embeds = R.flatten(R.map(_embeddedKeys)(says))
    let ask_embeds = R.flatten(R.map(_embeddedKeys)(asks))

    let lookup_value_embeds = R.pipe(
        R.map(_embeddedKeys),
        R.flatten,
    )(Object.values(lookups))


    let all = [
        ...asks, ...says, ...ifs,
        ...options, ...then_says, ...then_gotos,
        ...say_embeds, ...ask_embeds,
        ...lookup_value_embeds
    ]

    return R.pipe(
        R.flatten,
        R.uniq,
        R.without([undefined, null]),
    )(all)
}
