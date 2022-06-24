import { isCallDialogAction, isCommentOnly, isEnd, isGotoAction, isQuestion, isSection, isSetAction, StrictYarn, isExitToDialogAction } from "./strict_yarn.ts";
import { duplicate, ensureList, isObject, keyify, key_to_name, toVariableName, print, isNonEmptyString, p, jlog } from "../Utils/utils.ts";
import { BaseYarn, InputType } from "./base_yarn.ts";
import { LookupTable, processLookups } from "./lookups.ts";
import { Lgv, LgvType, Var, VarType } from "../hpml/hpml.ts";

import { R, assert } from '../../deps.ts'


export function strict2base(yarn: StrictYarn | StrictYarn[], lookups: LookupTable, additional_vars: Var[] = [], additional_lgvs: Lgv[] = []): { baseYarn: BaseYarn[], lgvs: Lgv[], vars: Var[] } {
    // print("1", yarn)
    // let p1 = processLookups(yarn, lookups)
    // print("2", p1)

    // let lgvs = lgvsInStrictYarn(ensureList(p1))
    // let vars = varsInStrictYarn(ensureList(p1))
    // let baseYarn = ensureList(lower(ensureList(p1), lookups))

    let lgvs = [...lgvsInStrictYarn(ensureList(yarn), lookups), ...additional_lgvs]
    let vars = [...varsInStrictYarn(ensureList(yarn), lookups), ...additional_vars]
    let baseYarn = ensureList(lower(ensureList(yarn), lookups))
    return { baseYarn, lgvs, vars }
}

export function lower(yarn: StrictYarn | StrictYarn[], lookups: LookupTable = {}): BaseYarn | BaseYarn[] {
    // jlog('lower - input', yarn)
    let expanded_else = _expand_else_list(ensureList(yarn))

    // WARNING.  If there are multiple dos AND multiple says, then the 'then' will be duplicated.  However, 
    // there should never be *both* a do and a say (see the types), so it shouldn't be an issue in practice.
    let expanded_dos = _expand_dos(expanded_else)
    let expanded_says = _expand_composite_say(expanded_dos)

    let named = addName(ensureList(expanded_says))

    // jlog('lower - named', named)
    let withSections = addSections(ensureList(named))
    // jlog('lower - withSections', withSections)
    let lowered = lowerObject(ensureList(withSections))
    // jlog('lower - lowered', lowered)

    let expanded = processLookups(ensureList(lowered), lookups)
    // jlog('lower - expanded', expanded)

    // follow the lookups with a second pass of lowerObject, as the lookups may have expansions
    let res = lowerObject(ensureList(expanded))



    // TODO: This is probably/hopefully the place where we can ensure that vars have underscores.
    // But I need to think this through first.


    // @ts-ignore
    let final = removeMetadata(ensureList(res))
    // jlog('lower - lower#2', res)
    return final
}

let _hasExpandedSayForm = (o: any) => 'say' in o && Array.isArray(o.say)
let _hasExpandedDoForm = (o: any) => 'do' in o && Array.isArray(o.do)

/*
    Expand 'else' by duplicating and making the second copy have a an negated 'if'.
*/
export function _expand_else(o: any): any {
    // I backed away from doing fully in Ramda style as it was getting a bit unwieldy.  Revisit.
    if (R.has('else', o)) {
        assert(o.say !== undefined, "_desugar_else: o.say is undefined")
        assert(o.if !== undefined, "_desugar_else: o.if is undefined")

        let [o1, o2] = duplicate(o)
        o1 = R.dissoc('else', o1)
        // @ts-ignore
        o2.if = `not:${o2.if}`

        // @ts-ignore
        if (isObject(o2.else) && 'say' in o2.else) {
            // "else: {say: 'hi'}" -> "{say: 'hi'}"
            // @ts-ignore
            o2.say = o2.else.say
        } else {
            // "else: 'something'" -> set the 'say' to the string
            // @ts-ignore
            o2.say = o2.else
        }

        o2 = R.dissoc('else', o2)
        return [o1, o2]
    }
    else return o
}

let _expand_else_list = R.map(_expand_else)

let _detach_dos = (o: any) => {
    if (o.do) {
        let action = o.do
        delete o.do
        return { ...o, ...action }
    }
    else return []
}

/*
    convert the form:  {..., do:[{say:s1},{goto:s2},]} to
    [{say:s1},{goto:s2}]

    If a 'then' exists, it should be only on the last item in the list.
     {..., do:[{say:s1},{set:s2}, then: {goto:s3}}] ]}
     -> [{say:s1},{set:s2, then: {say:s3} }]
*/
export function _expand_dos(o: any): any {
    if (Array.isArray(o)) {
        return R.map(_expand_dos, o)
    }

    // array entries could be either strings or objects with say:
    // let _normalizeDo = (o: any) => {
    //     if ('do' in o && isObject(o.say) && 'say' in o.say) {
    //         return { ...o, say: o.say.say }
    //     }
    //     return o
    // }

    if (_hasExpandedDoForm(o)) {
        let then = ('then' in o) ? o.then : undefined
        delete o.then
        let updated = R.pipe(
            R.unwind('do'),
            R.map(_detach_dos),
        )(o)

        // reattach the then to the last item in the list
        if (then !== undefined) {
            updated[updated.length - 1].then = then
        }

        return updated
    }
    else return o
}


/*
    convert the temp degerate form:  {..., say:[{say:s1},{say:s2}]} to
    [{say:s1},{say:s2}]

    If a 'then' exists, it should be only on the last item in the list.

*/
export function _expand_composite_say(o: any): any {
    if (Array.isArray(o)) {
        return R.map(_expand_composite_say, o)
    }

    // array entries could be either strings or objects with say:
    let _normalizeSay = (o: any) => {
        if ('say' in o && isObject(o.say) && 'say' in o.say) {
            return { ...o, say: o.say.say }
        }
        return o
    }

    if (_hasExpandedSayForm(o)) {
        let then = ('then' in o) ? o.then : undefined
        delete o.then
        let updated = R.pipe(
            R.unwind('say'),
            R.map(_normalizeSay),
        )(o)

        // reattach the then to the last item in the list
        if (then !== undefined) {
            updated[updated.length - 1].then = then
        }

        return updated
    }
    else return o
}


/*
*   Naming

    Add names for each node.
*
*/

function addName(o: any): StrictYarn | StrictYarn[] {
    function _keyforArrayOrString(o: any): string {
        if (Array.isArray(o) && o.length >= 1) {
            return o[0]
        } else if (Array.isArray(o) && o.length === 0) {
            throw new Error("_keyforArrayOrString: o is an empty array (this is unexpected)")
        } else if (isObject(o) && 'name' in o) {
            // @ts-ignore
            return _keyforArrayOrString(o.name)
        }
        return o
    }

    // function _prependedNameFor(o: StrictYarn): any {
    //     if (isGoto(o)) {
    //         return 'goto_'+o.goto
    //     } else if (isExitToDialogAction(o)) {
    //         return 'exit_to_'+o.exit_to
    //     } else if (isCallDialogAction(o)) {
    //         return 'call_'+o.call
    //     } else if (isSetAction(o)) {
    //         return 'set_'+o.set
    //     } 
    // }
    function _prefixFor(o: StrictYarn): any {
        if (isGotoAction(o)) {
            // return 'goto_'
            return ''
        } else if (isExitToDialogAction(o)) {
            return 'exit_to_'
        } else if (isCallDialogAction(o)) {
            return 'call_'
        } else if (isSetAction(o)) {
            return 'set_'
        } else return ''
    }

    if (Array.isArray(o)) {
        return R.map(addName, o)
    } else {
        let key = o['name'] || _keyforArrayOrString(o['say'] || o['ask']) || o['section'] || o['comment'] || o['goto'] || o['call'] || o['exit_to'] || o['set'] || o['collect_lgv'] || o['audio'] || o['video'] || o['image'] || o['if'] || "UNKNOWN"

        // don't add a prefix to an explicitly-named node
        let key2 = ('name' in o) ? keyify(key) : keyify(_prefixFor(o) + key)
        let name = key_to_name(key2)
        return R.assoc('name', name)(o)
    }
}


/*
*   Sections

    Add Sections where necessary.  Sections needed:
    - At the start of the list
    - There needs to be an 'end' section
    - Any node that is a "goto" target needs to be have it's own section

    Additionally, section markers can be added at will.
*
*/
export function addSections(yarn: StrictYarn[]): StrictYarn[] {
    // if there is no initial section, add one named 'intro
    // TODO: error checking
    if (!isSection(yarn[0])) {
        yarn = [{ section: 'intro' }, ...yarn]
    }

    // add an 'end' section if necessary
    if (yarn.find(isEnd) === undefined) {
        yarn = [...yarn, { section: 'end' }]
    }

    return yarn
}

/*
    LOWER OBJECT
    // for ask
    // #. add type, into
    // #. add options for ask




    YarnStatement -> Statement
        name
        say
        ack
        goto
        if
        else
        section
        x  comment

    YarnQuestion -> Question
        name
        ask

    YarnSection -> Section
        name?
        section

    YarnGotoAction -> Goto
        goto
        
    YarnEnd -> End



*/

export function lowerObject(yarn: StrictYarn | StrictYarn[]): BaseYarn | BaseYarn[] {
    if (Array.isArray(yarn)) {
        return R.pipe(
            _stripCommentOnlyNodes,
            R.map(lowerObject),
            R.flatten
        )(yarn)
    }

    function expandSayArray(node: StrictYarn): StrictYarn[] {
        // console.log('expandSayArray', node)
        let nodes = R.unwind('say')(node)
        // the names of the nodes are the same, update them with index values (1-based)
        nodes = nodes.map((n: StrictYarn, i: number) =>
            // @ts-ignore
            R.assoc('name', `${n.name}_${i + 1}`)(n))

        // console.log('expandSayArray -> nodes', nodes)

        return nodes
    }

    // if form is {say: [array of strings]}
    // expand the array of strings into an array of nodes
    //  then recursively lower the result nodes
    if ('say' in yarn && Array.isArray(yarn.say)) {
        // console.log('CALLING expandSayArray')
        // could be a list of strings or objects (with ack)
        let newNodes = expandSayArray(yarn)
        let loweredNodes = newNodes.flatMap(lowerObject)
        return loweredNodes // TODO: this return will prevent else/then arrays from being expanded.  Recur? 
    }

    // check for embedded say:
    // {say: {say: string, ack: string}} -> {say: string, ack: string}
    if ('say' in yarn && isObject(yarn.say) && 'say' in yarn.say) {
        // print('expandEmbeddedSayObject', yarn)
        if ('ack' in yarn) {
            print("WARNING: replacing ack with embedded say.ack", yarn)
        }

        // @ts-ignore
        yarn.ack = yarn.say.ack

        // @ts-ignore
        yarn.say = yarn.say.say
    }

    function expandAskArray(node: StrictYarn): StrictYarn[] {
        let nodes = R.unwind('ask')(node)
        // the names of the nodes are the same, update them with index values (1-based)
        nodes = nodes.map((n: StrictYarn, i: number) =>
            // @ts-ignore
            R.pipe(R.assoc('name', `${n.name}_${i + 1}`)(n)),
            // @ts-ignore
            R.assoc('say', n.ask))(n)

        // console.log('expandAskArray -> nodes', nodes)

        return nodes
    }
    if ('ask' in yarn && Array.isArray(yarn.ask)) {
        // console.log('CALLING expandAskArray')
        // could be a list of strings or objects (with ack)
        let newNodes = expandAskArray(yarn)
        let loweredNodes = newNodes.flatMap(lowerObject)
        return loweredNodes
    }

    // if form is {say: [array of strings]}
    // expand the array of strings into an array of nodes
    //  then recursively lower the result nodes
    // if ('say' in yarn && Array.isArray(yarn.say)) {
    //     // console.log('CALLING expandSayArray')
    //     // could be a list of strings or objects (with ack)
    //     let newNodes = expandSayArray(yarn)
    //     let loweredNodes = newNodes.flatMap(lowerObject)
    //     return loweredNodes
    // }



    // jlog("yarn->byarn:", yarn)
    let byarn = yarn as BaseYarn

    // print('byarn', byarn)
    // 'into' is a variable name, which in base yarn must have an underscore
    if ('into_lgv' in yarn) {
        // @ts-ignore
        byarn.into = yarn.into_lgv

        // Note: lowering must be reentrant/idempotent, so we need to keep the information that
        // tells is that we are dealing with an lgv. 
        // @ts-ignore
        // delete byarn.into_lgv
    } else if ('into' in byarn && !('into_lgv' in byarn)) {
        byarn.into = toVariableName(byarn.into)
    }

    // if form is {ask: [array of strings]}
    // expand the array of strings into an array of nodes
    // were the all but the last are made into 'say' nodes
    // and the last is retained as the 'ask' node



    // #. add type for ask
    // if isAsk(byarn) && !('type' in byarn) {
    if (isQuestion(yarn) && !('type' in yarn)) {
        byarn = R.assoc('type', 'string', byarn)
    }

    if (isQuestion(yarn) && !('into' in yarn)) {
        // @ts-ignore
        byarn = R.assoc('into', `_${key_to_name(byarn.name)}_answer`, byarn)
    }

    // if requirements include 'multiple_input', then the
    // type is 'list'
    if (isMultipleChoice(yarn)) {
        byarn = R.assoc('type', 'list', byarn)
    }

    // if (('ask' in yarn) && !('options' in yarn)) {
    //     byarn.type = 'str'
    // }




    // base yarn should never have an 'else'
    assert(!('else' in byarn))
    return byarn
}

export function _stripCommentOnlyNodes(yarns: StrictYarn[]): StrictYarn[] {
    return yarns.filter(yarn => !isCommentOnly(yarn))
}

export function isMultipleChoice(yarn: StrictYarn): boolean {
    // @ts-ignore
    if (Array.isArray(yarn.require)) {
        // @ts-ignore
        return yarn.require.includes('multiple_input')
    } else {
        // @ts-ignore
        return (yarn.require && (yarn.require === 'multiple_input'))

    }
}

export function removeMetadata(yarn: BaseYarn): BaseYarn {
    // @ts-ignore
    if (Array.isArray(yarn)) { return yarn.map(removeMetadata) }
    // @ts-ignore
    return R.omit(['into_lgv'], yarn)

}


//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////

function lgvsInStrictYarn(yarn: StrictYarn[], lookups: LookupTable): Lgv[] {
    assert(lookups)

    // this will collects all the lgvs that are (1) in the 'collect_lgv' AND have a type set. 
    // (Without the type, we cannot put it in lgvs list, because it could cause a validation error - type mismatch
    let collectLgvs = R.pipe(
        R.filter(R.both(R.has('collect_lgv'), R.has('type'))),
        R.map(R.props(['collect_lgv', 'type'])),
        R.uniq,
        // if this is a lookup, exclude it
        R.reject((maybe_lgv: string) => (R.head(maybe_lgv) in lookups)),
        // @ts-ignore
        R.map(([lgv, type]) => asLgv(yarnTypeToHpmlType(type) || 'str', lgv)),
    )



    let intoLgvs = R.pipe(
        R.filter(R.has('into_lgv')),
        R.map(R.props(['into_lgv', 'type'])),
        R.uniq,
        R.reject((maybe_lgv: string) => (R.head(maybe_lgv) in lookups)),
        // @ts-ignore
        R.map(([lgv, type]) => asLgv(yarnTypeToHpmlType(type) || 'str', lgv)),
    )

    // Mar 7: Backing off autodetection of LGVs until I see more use cases
    // let ifLgvs = R.pipe(
    //     _extract(['if']),
    //     R.map(_extractLgvOrVarOrLookupKeyName),
    //     R.filter(isNonEmptyString),
    //     R.reject((maybe_lgv: string) => (maybe_lgv in lookups)),
    //     R.map(asLgv("bool")),
    // )

    // let lgvs = [...intoLgvs(yarn), ...ifLgvs(yarn)]
    let lgvs = [...intoLgvs(yarn), ...collectLgvs(yarn)]
    return lgvs
    // console.log('lgvsInStrictYarn -> lgvs', lgvs)
    // lgvs = R.reject((v: string) => R.includes(v, lookups.keys))(yarn)
    // console.log('lgvsInStrictYarn -> lgvs 2', lgvs)
    // return lgvs
}

//////////////////////////////////////////////////////////////////////////////////////////////
function varsInStrictYarn(yarns: StrictYarn[], lookups: LookupTable): Var[] {

    let intoVars = R.pipe(
        R.filter(R.has('into')),
        R.map(R.props(['into', 'type'])),
        R.uniq,
        R.reject((maybe_var: string) => (R.head(maybe_var) in lookups)),

        // @ts-ignore
        R.map(([varib, type]) => asVar(yarnTypeToHpmlType(type) || 'str', _extractLgvOrVarOrLookupKeyName(varib))))

    let ifVars = R.pipe(
        _extract(['if']),
        R.map(_extractLgvOrVarOrLookupKeyName),
        R.filter(isNonEmptyString),
        R.reject((maybe_var: string) => (maybe_var in lookups)),
        R.uniq,
        R.map(asVar("bool")),
    )

    let forEachOption = R.map(R.path([2, 'set']))

    let setVars = R.pipe(
        R.map(R.prop('options')),
        R.reject(R.isNil),
        R.map(forEachOption),
        R.flatten,
        R.reject(R.isNil),
        R.reject((maybe_var: string) => (maybe_var in lookups)),
        R.uniq,
        R.map(_extractLgvOrVarOrLookupKeyName),
        R.map(asVar("str")),
        // todo: I need to support other types here!
    )

    let additions = [asVar("str", "_last_text_input"), asVar("str", "_bogus")]
    return [...intoVars(yarns), ...ifVars(yarns), ...setVars(yarns), ...additions]
}

let _extract = (path: (string | number)[]) => R.pipe(
    R.map(R.path(path)),
    R.flatten,
    R.uniq,
    R.filter(isNonEmptyString),
)

function yarnTypeToHpmlType(yarnType: InputType): VarType | LgvType {
    switch (yarnType) {
        case 'string':
            return 'str'
        case 'string_list':
        case 'int_list':
        case 'float_list':
        case 'bool_list':
            return 'list'
        default:
            return yarnType as VarType | LgvType;
    }

}

// enforce leading underscores
function _asVar(type: VarType, name: string): Var {
    name = name.startsWith("_") ? name : `_${name}`
    return {
        name,
        type,
    }
}
let asVar = R.curry(_asVar)

function _asLgv(type: LgvType, name: string): Lgv {
    return {
        name,
        type,
    }
}
let asLgv = R.curry(_asLgv)

function _extractLgvOrVarOrLookupKeyName(cond: string): string | undefined {
    // if (cond.includes("not")) {
    //     print('_extractLgvOrVarOrLookupKeyName', cond)
    // }
    assert(typeof cond === "string", `Expected a string, but got ${cond}`)

    // skip complex conditions for now
    if (cond.includes("=") || cond.includes(">") || cond.includes("<")) {
        return undefined
    }

    let res = key_to_name(cond.slice());

    // extract the name from the form: "not_(something)" 
    // (the underscore comes from previous key_to_name call)
    const not_matcher = /not[ _:]\((.*?)\)/
    let match = res.match(not_matcher)
    if (match) {
        print("_extractLgvOrVarOrLookupKeyName/match", match)
        res = match[1]
    }
    // if (cond.includes("not")) {
    //     print('_extractLgvOrVarOrLookupKeyName/res', res)
    // }

    // todo: generalize this
    if (res === "true" || res === "false" || res === "not:true" || res === "not:false") {
        return undefined
    }

    // add an underscore to the name, so it can be used as a variable name
    // res = res.startsWith("_") ? res : `_${res}`
    return res
}

