import { duplicate, ensureList, expandStringsToSayObjects, isArrayOfObjects, isArrayOfStrings, isObject, isString } from "../Utils/utils.ts";
import { _expand_composite_say } from "./strict2base.ts";
import { StrictYarn } from "./strict_yarn.ts";
import { isStatement, SugarYarn } from "./sugar_yarn.ts";
import { print } from "../Utils/utils.ts";

//var R = require('ramda');
import { R, assert } from '../../deps.ts'



/*
*    Desugaring

    Desugaring is like a macro expansion that takes the string or string array 
    forms and converts them into proper node forms.
*
*/

// Given a key, and a value, create an object
// say:  "hello" -> { say: "hello" }
// say:  ["hello","there"] -> [{ say: "hello" }, { say: "there" }]
// export let _expand_value_to_key_and_value = (key: string, value: any) => {
export function _make_object(key: string, value: any) {
    // console.log("_expand_value_to_key_and_value", value)
    if (typeof value === "string") {
        // console.log("STRING--", key, value)

        return { [key]: value }
    }
    else if (isArrayOfStrings(value)) {
        // console.log("STRING[]", key, value)

        let f = (v: any) => _make_object(key, v)
        let res = R.map(f, value)
        // console.log("RES", res)
        return res
    }
    // else if (isArrayOfObjects(value)) {
    //     console.log("OBJECT[]", value)
    //     return val
    // }
    // else if (Array.isArray(value)) {
    //     console.log("ANY[]", value)
    //     return R.map((v: any) => _expand_value_to_key_and_value(key, v), value)
    // }
    // console.log("PASSING", value)
    return value
}

let add_say = R.curry(_make_object)("say")

// {say: ["s1", "s2"]}
// @ts-ignore
export let _is_say_object_with_array_of_strings = (o: any) => isStatement(o) && isObject(o) && isArrayOfStrings(o.say)
export let _desugar_say_object_with_array_of_strings = (o: any) => {
    let then_value = undefined
    if ('then' in o) {
        then_value = o.then
    }
    delete o.then
    o = R.unwind('say')(o)

    if (Array.isArray(o) && then_value !== undefined) {
        R.last(o).then = then_value
    }


    // jlog("_desugar_say_object_with_array_of_strings:", o)
    return o
}


// "hello" -> { say: "hello" }
// ["hello","there"] -> [{ say: "hello" },{say: "there"}]
// {say: ["hello","there"} -> [{ say: "hello" },{say: "there"}]
// export function _desugar_then(o: any) {
//     console.log("_desugar_then", o)
//     return _desugar_say(o)
// }
export let _desugar_say = R.cond([
    [isString, add_say], // "hello" -> { say: "hello" }
    [isArrayOfStrings, R.map(add_say)], // TODO: this needs to be more flexible as there can be an array of objects and one string.  That string should be expanded.
    [_is_say_object_with_array_of_strings, _desugar_say_object_with_array_of_strings],
    // [isObject, _desugar_say_object_with_array_of_strings],
    // [isArrayOfObjects, R.map(R.unwind('say'))], // {say: ["hello","there"]} -> [{ say: "hello" },{say: "there"}]
    [R.T, R.identity] // else: x -> x
])


let _desugar_then = _desugar_say


// If there is a string as the option value, then we replicates as both the option value and label.
// Passes in the option value:
//   ["hi","bye"] -> ["hi","hi"],["bye","bye"]]
//   [["yes","Yes"],["no","no"]] -> no change (already expanded)
export let _desugar_options = R.map((val: any) => {
    if (typeof val === "string") {
        return [val, val]
        // [str, object] -> [str, str, object]
    }
    else if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'string') {
        // degenrate case of [str]
        return [val[0], val[0]]
    } else if (Array.isArray(val) && val.length === 2 && isObject(val[1])) {
        // [str, str] -> [str, str]
        // [str, object] -> [str, str, object]
        return [val[0], val[0], val[1]]
    }
    return val
})

export let _desugar_say_within_node =
    R.when(isObject, R.evolve({
        // say: _desugar_say, // we already have a 'say', so don't try to 'add_say'
        options: _desugar_options,
        else: _desugar_say,
        then: _desugar_then,
        // requirement: _desugar_say, // TODO: the potential 'say' sugar is in an array
    }))



/* 
 For a 'say' node, if a node has a 'else' duplicate the node and
  1. remove the 'else' on the first
  2. logically invert the second node. (adding 'if: "not {cond}")
  3. replace the 'say' with the 'else' on the second node
  4. remove the 'else' on the second node
 
For a 'do' node, replace the do on the 'negated clone' with else content
   and then delete the else.

 Precondition, node has an 'if'
 
 E.g.
    { if: "not {cond}", say "hello", else: "hi" }
*/
export function _desugar_else(node: SugarYarn | SugarYarn[]): SugarYarn | SugarYarn[] {
    if (Array.isArray(node)) { return R.map(_desugar_else, node) }
    else if (typeof node === "string") { return node }

    else if (isObject(node)) {

        if ('else' in node) {
            assert('if' in node, "node must have an 'if'")

            if (isArrayOfStrings(node.else)) {
                node = R.clone(node)
                // @ts-ignore
                node.else = _desugar_say(node.else)
            }

            let [first, second] = duplicate(node)
            // @ts-ignore
            second.if = `not:${second.if}`

            // @ts-ignore
            if (typeof second.else === "string") {
                // @ts-ignore
                second.say = second.else
                // @ts-ignore
                delete (second.do)
                // @ts-ignore
            } else if (isObject(second.else) && 'say' in second.else) {
                // @ts-ignore
                delete (second.say)
                // @ts-ignore
                delete (second.do)

                // @ts-ignore
                second.say = second.else.say

                // @ts-ignore
            } else if (isObject(second.else) && 'do' in second.else) {
                // @ts-ignore
                second.say = second.else.say
                // @ts-ignore
                delete (second.do)
                // @ts-ignore
            } else if (isArrayOfObjects(second.else)) {
                // @ts-ignore
                second.do = second.else
                // @ts-ignore
                delete (second.say)
            } else {
                // @ts-ignore
                throw new Error("_desugar_else: invalid 'else': " + JSON.stringify(second.else))
            }

            // @ts-ignore
            delete first.else
            // @ts-ignore
            delete second.else
            // @ts-ignore
            return [first, second]
        }
        else {
            return node
        }
    } else {
        console.log("_desugar_else, not an object or array:", node)
        throw new Error("_desugar_else: not an object or array")
    }
}

export let _expandStringsWherePossible =
    R.map(R.evolve({
        // else: (prev: any) => expandStringsToSayObjects(prev),
        then: (prev: any) => expandStringsToSayObjects(prev),
    }))


export let desugar = R.pipe(
    ensureList,

    _expandStringsWherePossible,
    // print(' after _expandStringsWherePossible'),

    _desugar_else,
    // R.flatten,
    // print(' before _desugar_say'),
    R.map(_desugar_say),
    // print(' after _desugar_say'),
    R.flatten,

    // print('after _desugar_say, before _desugar_else'),
    R.map(_desugar_say_within_node),
    // print('after _desugar_say_within_node, before _expand_composite_say'),

    R.map(_expand_composite_say),
    // print('after _expand_composite_say, before flatten'),

    // print('after _desugar_say_within_node (fin.)'),
    R.flatten,
    // print('sugar2strict'),
)

export function sugar2strict(yarn: SugarYarn | SugarYarn[]): StrictYarn[] {
    return desugar(ensureList(yarn))
}