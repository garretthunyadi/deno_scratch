/*
    Sugar IDL includes semantic sugar (e.g. strings and arrays of strings for say and ask)        
    Strict IDL is IDL without semantic sugar, but has convention over 
        configuration (i.e. "magic")
    Base IDL is IDL that can be converted to HPML directly. It has no magic, 
        though it does have sensible defaults.

    ---
    Base IDL - is the last stop before HPML.  It has no magic,
    - all lookups have been applied
    - names exist and are valid hpml names, so no question marks, underscores for cars, spaces->underscores in general?
    - no 'else's.  Only 'if's.
    - converts "not:<conditon>" to python expression
*/

import { isString, keyify } from "../Utils/utils.ts"
import { HpmlSection, HpmlNode, Next, Calc, CallTarget, CalcNode } from "../hpml/hpml.ts"
import { ensureList, key_to_name } from "../Utils/utils.ts"
import { BaseYarn, End, InputType, isBaseYarnArray, isGoto, isOptionNameAndValueAndAction, isSection, QuestionOption, Requirement, Section, isCollectLgvQuestion, CollectLgvQuestion, isDialogAction, isCallDialogAction, isSetAction, SecondaryAction } from "./base_yarn.ts";
import { isPositiveRequirement } from "./classifiers.ts";

//var R = require('ramda');
import { R, assert } from '../../deps.ts'

// Precondition: should be valid BaseIDL when this is called.
// (1) start with a section, 
// (2) have an end section,
// (3) any a goto targets have a section,
export function baseYarnsToHpmlSections(byarns: BaseYarn[]): HpmlSection[] {
    const reducer = (sections: HpmlSection[], byarn: BaseYarn) => {
        // if the next byarn is a section, then:
        // create the hpml section from the byarn section
        // append the new section and return
        // 
        // else get the last hpml section accumulator
        // and create the next node.
        if (isSection(byarn)) {
            if ('hpml' in byarn) {
                // @ts-ignore
                return [...sections, byarn.hpml as HpmlSection]
            }
            return [...sections, baseYarnSectionToHpmlSection(byarn)]
        } else {
            let current_section = sections[sections.length - 1] || { name: "intro", id: "intro", nodes: [], sequential: true }
            current_section.nodes = current_section.nodes.concat(baseYarnNodeToHpmlNode(byarn))
            return sections
        }
    }
    return byarns.reduce(reducer, [])
}

export function baseYarnSectionToHpmlSection(section: Section): HpmlSection {
    let res: HpmlSection = {
        name: key_to_name(section.section),
        // id: section.section,
        nodes: [], // base yarn section doesn't have nodes
        sequential: section.sequential || true // default to true
    }
    // TODO: This should be moved to strict2base as it's 'magic'
    if (section.if !== undefined) {
        res.condition = pythonify_condition(section.if)
    }

    // special processing for the 'end' section
    if (section.section === "end") {
        res = _toEndSection(section as End) // TODO: type assertion
    }
    return res
}

export let baseYarnNodeToHpmlNode = R.pipe(_toHpml, ensureList)

let _makeCalcNode = (name: string, say?: string, cond?: string): CalcNode => {
    let res = {
        name: key_to_name(name),
        calc: {
            variable: "_bogus",
            value: "'bogus'"
        },

        // // @ts-ignore
        // next: [
        //     { goto: location }
        // ],
    }
    if (say) {
        // @ts-ignore
        res.ask = { prompts: [say] }
    }

    if (cond) {
        // @ts-ignore
        res.condition = cond
    }

    // @ts-ignore
    return res
}

let makeGotoNode = (name: string, location: string, say?: string, cond?: string): HpmlNode => {
    let res = _makeCalcNode(name, say, cond)
    res.next = [{ goto: location }]
    return res
}

// TODO: need to support more than just string values
let makeSetActionNode = (name: string, variable: string, to: string, say?: string, cond?: string, parameters: string[] = []): HpmlNode => {
    let res = _makeCalcNode(name, say, cond)
    res.calc = [{
        variable: variable,
        value: to
    }]
    return res
}
let makeDialogActionNode = (name: string, dialog: string, should_return: boolean, say?: string, cond?: string, parameters?: string[]): HpmlNode => {
    let res = _makeCalcNode(name, say, cond)
    res.next = [
        {
            call: {
                dialog: dialog,
                return: should_return
            }
        }
    ]
    if (parameters !== undefined) {
        // @ts-ignore
        res.next[0].call.parameters = parameters
    }
    return res
    /*
    "next": {
      "text": "calling sub-dialog...",
      "call": {
        "dialog": "dialog_name_in_cms",
        "parameters": [
          "lgv1",
          "lgv2"
        ],
        "return": true
      }
    }
    
    */
}


let makeCollectLgvNode = (byarn: CollectLgvQuestion): HpmlNode => {
    let collect_lgv = {
        lgv: byarn.collect_lgv,
        // @ts-ignore
        prompt: byarn.say || byarn.ask
    }
    // @ts-ignore
    if ('include_values' in byarn) { collect_lgv.include_values = byarn.include_values }
    // @ts-ignore
    if ('value_labels' in byarn) { collect_lgv.value_labels = byarn.value_labels }
    // @ts-ignore
    if ('guidance' in byarn) { collect_lgv.guidance = byarn.guidance }
    // @ts-ignore
    if ('min' in byarn) { collect_lgv.min = byarn.min }

    return {
        // @ts-ignore
        name: key_to_name(byarn.name),
        // @ts-ignore
        collect_lgv,
    }
}

function shouldBeElided(byarn: BaseYarn): boolean {
    // has an empty say
    return ('say' in byarn && isString(byarn.say) && byarn.say?.trim() === "")
}

export function _toHpml(byarn: BaseYarn | BaseYarn[]): HpmlNode | HpmlNode[] {
    if (isBaseYarnArray(byarn)) {
        // @ts-ignore   
        return byarn.flatMap(x => _toHpml(x))
    }

    if (shouldBeElided(byarn)) {
        return []
    }

    if (isCollectLgvQuestion(byarn)) {
        return makeCollectLgvNode(byarn)
    }

    // Check for a pass-through hpml node
    // @ts-ignore
    if ('hpml' in byarn) { return byarn.hpml }

    // Note: I'm limiting the possibilities that can be 
    // in a goto - this is prob not the right thing to do
    if (isGoto(byarn)) {
        // @ts-ignore
        return makeGotoNode(byarn.name, byarn.goto, byarn.say, byarn.if)
    } else if (isDialogAction(byarn)) {
        // @ts-ignore
        let dialog = byarn.call || byarn.exit_to
        // @ts-ignore
        return makeDialogActionNode(byarn.name, dialog, isCallDialogAction(byarn), byarn.say, byarn.if, byarn.parameters)
    } else if (isSetAction(byarn)) {
        // @ts-ignore
        return makeSetActionNode(byarn.name, byarn.set, byarn.to, byarn.say, byarn.if)
    }

    // === name ===
    // @ts-ignore
    let result: any = { name: key_to_name(byarn.name) }


    // === conditions ===
    // @ts-ignore
    if (byarn.if) {
        // TODO: This should be moved to strict2base as it's 'magic'
        // @ts-ignore
        result.condition = pythonify_condition(byarn.if)
    }

    // === delay ===
    // @ts-ignore
    if (byarn.delay) {
        // @ts-ignore
        result.delay = byarn.delay
    }

    // === say & ask ===
    // @ts-ignore
    if (byarn.say || byarn.ask) {

        if ('skinnable' in byarn) {
            result.ask = {
                prompts: [
                    {
                        description: byarn.skinnable?.description || byarn.name,
                        category: byarn.skinnable?.category || "",
                        // @ts-ignore
                        value: byarn.skinnable?.value || byarn.say || byarn.ask,
                        skinnable: true,
                    }
                ]
            }
        } else {
            result.ask = {
                prompts: [
                    // @ts-ignore
                    byarn.say || byarn.ask
                ]
            }
        }

    }
    // else {
    //     // if (byarn.ask === null && byarn.say === null) {
    //     jlog("no say or ask - CALC NODE?!?", byarn)
    // }

    // === input & options ===
    // @ts-ignore
    if ('say' in byarn) {
        if ('ack' in byarn) {
            // per discussion with Derrick, the default value for an ack can be "ack" by convention, 
            // and then Z can distinquish if an empty say is skippable or not 
            result.input = { single: [{ "ack": byarn.ack }] }
        } else {
            //no user input
            result.input = { interim: true }
        }
    } else if ('type' in byarn && byarn.type === 'string' && !('options' in byarn)) {
        // we have a string type, but no options.  We need to make it a string input
        result.input = { text_line: true }

        result.post_calc = append(result.post_calc, [
            {
                variable: "_last_text_input",
                value: _sensorType(byarn.type) + "(sensor)"
            },
            // {
            //     // variable: `${key_to_name(byarn.name)}_answer`,
            //     // @ts-ignore
            //     variable: byarn.into || '_answer',
            //     value: _sensorType(byarn.type) + "(sensor)"
            // }
        ])
    } else if ('type' in byarn && (byarn.type === 'int' || byarn.type === 'float')) {
        // we have a int or float type,
        result.input = { [byarn.type === 'int' ? 'integer' : byarn.type]: [] }

        // @ts-ignore
        if (byarn.require && byarn.require.max !== 'undefined') {
            // @ts-ignore
            result.input.max = byarn.require.max
        }
        // @ts-ignore
        if (byarn.require && byarn.require.min !== 'undefined') {
            // @ts-ignore
            result.input.min = byarn.require.min
        }

        // result.post_calc = append(result.post_calc, [
        //     {
        //         // variable: `${key_to_name(byarn.name)}_answer`,
        //         // @ts-ignore
        //         variable: byarn.into || '_answer',
        //         value: _sensorType(byarn.type) + "(sensor)"
        //     }
        // ])
    }


    // @ts-ignore
    else if (Array.isArray(byarn.options)) {
        // @ts-ignore
        if (typeof byarn.type === 'string' && byarn.type.includes('list')) {
            result.input = {
                // @ts-ignore
                multi: _optionsFor(byarn.options),
            }
        } else {
            result.input = {
                // @ts-ignore
                single: _optionsFor(byarn.options),
            }
        }

    }

    // === into/into_lgv ===
    if ('into' in byarn || 'into_lgv' in byarn) {
        // if (byarn.type === 'string') {
        //     result.post_calc = append(result.post_calc, [
        //         {
        //             variable: '_last_text_input',
        //             value: _sensorType(byarn.type) + "(sensor)"
        //         }
        //     ])
        // }

        result.post_calc = append(result.post_calc, [{
            // @ts-ignore
            variable: byarn.into ? key_to_name(byarn.into) : byarn.into_lgv,
            // @ts-ignore
            value: _sensorType(byarn.type) + "(sensor)"
        }])
    }

    // === post-calc ===
    // @ts-ignore
    // if ((byarn.into !== undefined || byarn.into_lgv !== undefined) && _has_option_actions(byarn)) {
    //     // @ts-ignore
    //     result.post_calc = append(result.post_calc, [{
    //         // @ts-ignore
    //         variable: pythonify_condition(byarn.into || byarn.into_lgv) || "_answer",
    //         // @ts-ignore
    //         value: _sensorType(byarn.type) + "(sensor)"
    //     }])
    // }


    // === then: next & post calc ===

    // @ts-ignore
    result.next = nextsForThen(byarn.then)

    // @ts-ignore
    // post_calcs = [...post_calcs, ...postCalcsForThen(byarn.then), ...postCalcsForRequirements(byarn.require)]
    result.post_calc = append(result.post_calc, postCalcsForThen(byarn.then))

    // if (post_calcs.length > 0) {
    //     if (Array.isArray(result.post_calc)) {
    //         result.post_calc = [...result.post_calc, ...post_calcs]
    //     } else {
    //         result.post_calc = post_calcs
    //     }
    // }

    if ('audio' in byarn) {
        result.ask = { prompts: [""] }
        result.input = { audio: { media: byarn.audio } }
        if ('cover' in byarn) {
            result.input.audio.cover = byarn.cover
        }
    }

    if ('video' in byarn) {
        result.ask = { prompts: [""] }
        result.input = { video: { media: byarn.video } }
        if ('cover' in byarn) {
            result.input.video.cover = byarn.cover
        }
    }
    if ('image' in byarn) {
        result.ask = { prompts: [""] }
        // TODO: mobile vs web.  Lookups should allow at implementation time.
        // lookup: "<image>_web" || "<image>", and
        //         "<image>_mobile" || "<image>".  This would need to be in strict2base as it has "magic"
        // but byarn would need mobile_image and web_image.
        result.input = { image: { web: byarn.image, mobile: byarn.image } }
    }

    // --- option action -> next ---
    if (_has_option_actions(byarn)) {
        // @ts-ignore
        result.next = [...result.next, ...byarn.options.flatMap((opt, index) => option_to_next(opt, index, byarn.into || "_ans"))]
    }

    if (result.next === undefined || result.next.length === 0) { delete result.next }
    if (result.post_calc === undefined || result.post_calc.length === 0) { delete result.post_calc }
    return result
}


function postCalcsForThen(then: SecondaryAction | SecondaryAction[] | undefined): Calc[] {
    if (then === undefined) { return [] }
    if (Array.isArray(then)) {
        return then.flatMap(postCalcsForThen)
    }

    if ('set' in then) {
        return [{
            // @ts-ignore
            variable: then.set,
            // @ts-ignore
            value: (then.to === undefined) ? "'True'" : then.to
        }]
    }

    return []
}

function append(to: any[] | undefined, items: any[]) {
    if (items === undefined || items.length === 0) { return to }
    if (to) {
        return [...to, ...items]
    }
    return items
}

// function postCalcsForRequirements(then: Requirement[]): Calc[] {
//     if (then === undefined) { return [] }
//     return then.flatMap(req => _postCalcsForRequirement(req))

//     function _postCalcsForRequirement(req: Requirement): Calc[] {
//         if (isPositiveRequirement(req)) {
//             /*
//              post calc:
//                 _pos_neg_neutral = "sensor.nlc('pos_neg_neutral')['top_class'] if sensor.nlc('pos_neg_neutral')['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'"
//             {
//               "variable" : "_emotvalence",
//               "value" : "nlc('pos_neg_neutral', lgv_adherelimit_target)['top_class'] if nlc('pos_neg_neutral', lgv_adherelimit_target)['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'"
//             },

//              then:

//             * /
//         }
//     }


// ["positive", {say:"Yay!"}] => add conditioned next 'text'
// ["negative", [{say:"Oh no!"},{goto:"repeat"}] => add two conditioned next objects one w/ text, one w/ goto
export function nextSectionsForRequirements(requirements: Requirement[]): Next[] {
    if (requirements === undefined) { return [] }
    return requirements.flatMap(req => _nextSectionsForRequirement(req))

    function _nextSectionsForRequirement(req: Requirement): Next[] {
        let nexts: Next[] = []

        // say, set, call/exit_to, goto

        // TODO: refactor this to be more general
        // @ts-ignore
        if (isPositiveRequirement(req) && req[1].say !== undefined) {
            nexts = [...nexts,
            {
                condition: "sensor.nlc('pos_neg_neutral')['top_class'] if sensor.nlc('pos_neg_neutral')['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'",
                // @ts-ignore
                text: req[1].say
            }
            ]
            /*
             post calc:
                _pos_neg_neutral = "sensor.nlc('pos_neg_neutral')['top_class'] if sensor.nlc('pos_neg_neutral')['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'"
            {
              "variable" : "_emotvalence",
              "value" : "nlc('pos_neg_neutral', lgv_adherelimit_target)['top_class'] if nlc('pos_neg_neutral', lgv_adherelimit_target)['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'"
            },

             then:

            */
        }
        return nexts
    }

}


// Forms:
// Original flavor:
//      options: [['Yes',1], ['No',2]],
// Actions:
//      options: [
//          ["Yes", { say: "Great!" }],
//          ["No", { say: "Let's keep working on it" }]]
function _optionsFor(options: any[]): object {
    if (typeof options[0][1] === "object") {
        // Action flavor:  [[text, { action }]]
        return options.map((x, i) => ({ [i]: x[0] }))
    } else {
        // Original flavor:  [[value, text]]
        return options.map(x => ({ [x[1]]: x[0] }))

    }
}

function _toEndSection(byarn: End): HpmlSection {
    // name: 'end',
    // say?: string,
    // save?: boolean,
    // delete?: boolean,

    // Support skinnable end sections
    let statement = ('skinnable' in byarn) ?
        {
            // @ts-ignore
            description: byarn.skinnable?.description || byarn.name,
            // @ts-ignore
            category: byarn.skinnable?.category || "",
            // @ts-ignore
            value: byarn.skinnable?.value || byarn.say || byarn.ask,
            skinnable: true,
        } : byarn.say || ""

    let res = {
        name: "end",
        sequential: true,
        condition: true,
        nodes: [
            {
                name: "end",
                ask: { prompts: [statement] },
                input: { end: true }
            }
        ],
    }

    if (byarn.save !== undefined) {
        // @ts-ignore TODO: deal with save and delete on sections (in typescript)
        res.save = byarn.save
    }
    if (byarn.delete !== undefined) {
        // @ts-ignore
        res.delete = byarn.delete
    }
    // @ts-ignore
    return res
}

/*
    { say: ["text 1", "text 2"] }
    -> 
    { say: "text 1" }
    { say: "text 2" }
 
    // conditions should be applied to each node
    { say: ["text 1", "text 2"], condition: "should_say" }
    -> 
    { say: "text 1", condition: "should_say" }
    { say: "text 2", condition: "should_say" }
 
    // but post_calc should be applied only to the last node
    { say: ["text 1", "text 2"], post_calc: "some calc" }
    -> 
    { say: "text 1" }
    { say: "text 2", post_calc: "some calc" }
*/

// export function expand_composite_say(byarn: object, lookups: object): object[] {

//     // @ts-ignore
//     if (Array.isArray(byarn.say)) {
//         // @ts-ignore
//         return byarn.say.map(text => expand({ ...byarn, say: text }, lookups))
//     }

//     return [] // TODO: probably incorrect
// }


// options can contain actions, which are converted to next
//   [["Yes", { say: "Great!" }], ["No", { say: "Let's keep working on it" }]]
// or goto:, call:
/* if the options have action, then collect those into conditioned 'next' nodes
    {...name:'choices'  options: [
        ['Option 1',option1'],
        ['Option 2',option2', { say: "Great!" }],
        ['I'm done!',done'], { goto: "end" }},
    ]... }
 
   should generate:
    next: [
        { condition: "choices_answer == 'option2'", text: "Great!" },
        { condition: "choices_answer == 'done'", goto: "Great!" },
        { condition: "option1 == 'I'm done!'", goto: "end" },
    ]
 
*/
export function option_to_next(option: QuestionOption, index: number, into: string): Next[] {
    function optionActionToNextItem(action: SecondaryAction, into: string): Next {
        // @ts-ignore
        let next: Next = {
            // @ts-ignore
            condition: `${into} == '${option[1]}'`,
        }

        if ("say" in action) {
            // @ts-ignore
            next.text = action.say
        }
        // @ts-ignore
        if (action.goto) {
            // @ts-ignore
            next.goto = keyify(action.goto)
            // @ts-ignore
        } else if (action.call) {
            // @ts-ignore
            next.call = action.call

            // @ts-ignore
        } else if (action.set) {
            // @ts-ignore
            // assert(false, `TODO set actions ${action.set}`)
            // no next for a set action (it's a post_calc)
        }
        return next
    }

    if (isOptionNameAndValueAndAction(option)) {
        let [, , actionOrActions] = option
        let actions = ensureList(actionOrActions)

        return actions.map(x => optionActionToNextItem(x, into))
        // // @ts-ignore
        // if (option[2].goto !== undefined) {
        //     let obj = { goto: option[2].goto }
        //     return obj
        // } else if (option[2].call !== undefined) {
        //     return { call: option[2].call }
        // } else if (option[2].say !== undefined) {
        //     return {
        //         condition: `${into} == ${value}`,
        //         text: option[1].say
        //     }
        // } else {
        //     return {}
        // }

    } else { return [] }
}



function nextsForThen(then: SecondaryAction | SecondaryAction[] | undefined): Next[] {
    assert(typeof then !== "string", `Received a string ("${then}") when producing hpml.  Any string should been expanded to a 'say' object before this point (when 'desugaring')`)
    if (then === undefined) { return [] }
    if (Array.isArray(then)) {
        return then.flatMap(nextsForThen)
    }

    let next = {}

    if ("if" in then) {
        // @ts-ignore
        next.condition = then.if
    }
    if ('say' in then) {
        return [{
            ...next,
            // @ts-ignore
            text: then.say,
        }]
    }
    else if ('goto' in then) {
        return [{
            ...next,
            // @ts-ignore
            goto: then.goto,
        }]
    }
    else if ('call' in then || 'exit_to' in then) {
        let return_val = ('call' in then)
        let callNode: CallTarget = {
            ...next,
            // @ts-ignore
            dialog: then.call || then.exit_to,
            return: return_val
        }

        if (then.parameters !== undefined) {
            // @ts-ignore
            callNode.parameters = then.parameters
        }

        return [{ call: callNode }]
    }
    else return []
}



export function _has_option_actions(byarn: BaseYarn): boolean {
    // @ts-ignore
    if (Array.isArray(byarn.options) && byarn.options.length > 1 && byarn.options.some(x => typeof x[2] === "object")) {
        // @ts-ignore
        return true
    }

    return false
}


// used by lgvsInBaseYarn and varsInBaseYarn
// let _extract = (path: (string | number)[]) => R.pipe(
//     R.map(R.path(path)),
//     R.flatten,
//     R.uniq,
//     R.filter(isNonEmptyString),
// )

// export function lgvsInBaseYarn(byarn: BaseYarn[]): Lgv[] {
//     let into_lgvs = R.pipe(
//         _extract(['into_lgv']),
//         R.map(asLgv("str"))

//     )(byarn)

//     return into_lgvs
// }

// export function varsInBaseYarn(byarn: BaseYarn[]): Var[] {

//     let if_vars = R.pipe(
//         _extract(['if']),
//         R.map(_extractVarName),
//         R.filter(isNonEmptyString),
//         R.map(asVar("bool")),
//     )(byarn)


//     let into_vars = R.pipe(
//         R.filter(R.has('into')),
//         R.map(R.props(['into', 'type'])),
//         // @ts-ignore
//         R.map(([into, type]) => asVar(yarnTypeToHpmlType(type), into)),
//     )(byarn)

//     // let into_vars = R.pipe(
//     //     _extract(['into']),
//     //     R.map(_extractVarName),
//     //     R.map(asVar("str"))
//     // ) (byarn)

//     let forEachOption = R.map(R.path([2, 'set']))

//     let set_vars = R.pipe(
//         R.map(R.prop('options')),
//         R.reject(R.isNil),
//         R.map(forEachOption),
//         R.flatten,
//         R.reject(R.isNil),

//         R.map(_extractVarName),
//         R.map(asVar("str")),
//         // todo: I need to support other types here!
//     )(byarn)

//     let additions = [asVar("str", "_bogus")]
//     return [...if_vars, ...into_vars, ...set_vars, ...additions]
// }

// function _asVar(type: VarType, name: string): Var {
//     return {
//         name,
//         type,
//     }
// }
// let asVar = R.curry(_asVar)

// function _asLgv(type: LgvType, name: string): Lgv {
//     return {
//         name,
//         type,
//     }
// }
// let asLgv = R.curry(_asLgv)


// function _extractVarName(cond: string): string | undefined {
//     assert(typeof cond === "string", `Expected a string, but got ${cond}`)
//     // skip complex conditions for now
//     if (cond.includes("=")) {
//         return undefined
//     }

//     let res = key_to_name(cond.slice());

//     // extract the name from the form: "not_(something)" 
//     // (the underscore comes from previous key_to_name call)
//     const not_matcher = /not_\((.*?)\)/
//     let match = res.match(not_matcher)
//     if (match) {
//         res = match[1]
//     }

//     if (res === "true" || res === "false") {
//         return undefined
//     }

//     // add an underscore to the name, so it can be used as a variable name
//     // res = res.startsWith("_") ? res : `_${res}`
//     return res
// }

function _sensorType(type: InputType): string {
    switch (type) {
        case "string": return "str"
        case "string_list": return "str"
        case "int_list": return "int"
        case "float_list": return "float"
        case "bool_list": return "bool"
    }
    return type
}

// "not:cond" -> "not (_cond)"
// "not:true" -> "not (True)"
// "false" -> "False"
// "something" -> "_something"
// "something?" -> "_something_question"

// 
export function pythonify_condition(condition: string): string {
    if (typeof condition === "boolean") {
        return condition
    }

    assert(typeof condition === "string", "pythonify_condition arg is not a string")

    // if (condition.startsWith("not:")) {
    //     condition = `not ('${condition.substring(4)}')`
    // }
    condition = condition.replace("?", "_question")

    // TODO: Move the generation of underscores to strict2base.  By the time we have base yarn, the underscores should 
    // exist #no magic
    // condition = add_var_underscore_if_needed(condition)

    condition = condition.replace(/true/g, "True")
    condition = condition.replace(/false/g, "False")

    return condition
}


//
// TODO: This should be moved to Strict->Base
//
// "something" -> "_something"
// "not (something)" -> "not (_something)"
// "not (True) -> "not (True)"
// function add_var_underscore_if_needed(condition: string): string {
//     if (condition.toLowerCase().includes("true") || condition.toLowerCase().includes("false")) {
//         // prob need to handle expressions like:
//         //  "foo is not False"  (converting foo to _foo)
//         return condition
//     }
//     const not_matcher = /not \((.*?)\)/
//     let match = condition.match(not_matcher)
//     if (match) {

//         return condition.replace(match[1], add_var_underscore_if_needed(match[1]))
//     } else {

//         if (condition.includes(" ") || condition.startsWith("_")) {

//             return condition
//         } else {

//             // this seems to be just one identifier, so add an underscore
//             return `_${condition}`
//         }
//     }

// }

// function isCollectLgv(byarn: BaseYarn) {
//     throw new Error("Function not implemented.");
// }
