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

import { isObject } from "../Utils/utils.ts"
import { Skinnable } from "./strict_yarn.ts"
import { MediaAction } from "./sugar_yarn.ts"

export type BaseYarn = MainAction | Goto | End | Section

export type Section = {
    section: string
    if?: string
    sequential?: boolean
}

export type Named = { name: string }

export type Node = Named & {
    // condition?: string,  => condition is in HPML, but 'if' is in IDL
    delay?: number | number[],
    then?: SecondaryAction | SecondaryAction[],
    skinnable?: Skinnable,
    // ask?: string,
    // options?: string,
    // require?: string,
    // then?: string,
    // delay?: string,
    // comment?: string,
    // else?: string,
    // goto?: string,
    /*into?: string,
    into_lgv?: string,
    set?: string,
    exit_to?: string,
    call?: string,
    say?: string,
    ack?: string,
    end?: string,
    minutes_interval?: string,
    default_var?: string,*/
}


type Conditional = {
    if?: string,
    // else?: MainAction | MainAction[],
}


export type Statement = Node & {
    say: string,
    ack?: string,
} & Conditional

export type Question = VarQuestion | LgvQuestion | CollectLgvQuestion
type VarQuestion = _Question & { into: string }
type LgvQuestion = _Question & { into_lgv: string }
export type CollectLgvQuestion = {
    collect_lgv: string,
    include_values?: string[],
    value_labels?: { [key: string]: string },
    guidance?: string,
    min?: number,
    progress_bar?: string,
}

export type InputType = 'int' | 'float' | 'bool' | 'string' | 'string_list' | 'time' | 'int_list' | 'float_list' | 'bool_list' | 'time_list'

type _Question = Node & {
    ask: string,
    options?: QuestionOption[],
    require?: Requirement | Requirement[],
    type: InputType,
} & Conditional


type Ack = Node & {
    ack: string // arrays are not supported as I don't think there is a use case for multiple ack buttons in a row
}

export type Requirement = [string, SecondaryAction] | DateInputOptions | { min?: number, max?: number } | 'multiple_input' | 'natural_number'

type DateInputOptions = {
    minutes_interval?: number,
    default_var?: string, // the name of a var to pull the default from
}

// simplest is a string which is a key and that key 
export type QuestionOption = OptionNameAndValue | OptionNameAndValueAndAction

export type MainAction = { if?: string } & (
    | Statement
    | Question
    | GotoAction
    | CallDialogAction
    | ExitToDialogAction
    | SetAction
    | MediaAction
)

export type SecondaryAction = { if?: string } & (
    | SayAction
    | GotoAction
    | CallDialogAction
    | ExitToDialogAction
    | SetAction
)

export type SayAction = { say: string | string[] }
export type GotoAction = { goto: string }
export type CallDialogAction = { call: string, parameters?: string[] } // call a subdialog
export type ExitToDialogAction = { exit_to: string, parameters?: string[] } // not yet supported in hpml
export type SetAction = { set: string, to?: string }

export type Audio = Node & { audio: string, cover?: string }
export type Video = Node & { video: string, cover?: string, }
export type Image = Node & { image: string }

export function isMainAction(o: any): o is MainAction {
    return isObject(o) &&
        (o.hasOwnProperty('say') ||
            o.hasOwnProperty('set') ||
            o.hasOwnProperty('call') ||
            o.hasOwnProperty('exit_to') ||
            o.hasOwnProperty('goto'))
}

export function isSecondaryAction(o: any): o is SecondaryAction {
    return isObject(o) &&
        (o.hasOwnProperty('say') ||
            o.hasOwnProperty('set') ||
            o.hasOwnProperty('call') ||
            o.hasOwnProperty('exit_to') ||
            o.hasOwnProperty('goto') ||
            o.hasOwnProperty('audio') ||
            o.hasOwnProperty('video') ||
            o.hasOwnProperty('image'))
}

type Goto = Named & GotoAction

// Question Options:
type OptionValue = string | number | boolean
type OptionNameAndValue = [string, OptionValue]
// type OptionNameAndAction = [string, Action | Action[]]
type OptionNameAndValueAndAction = [string, OptionValue, SecondaryAction | SecondaryAction[]]

// Note that this is not robust.. only currently checking if it is an array or not
export function isBaseYarn(yarn: BaseYarn | BaseYarn[]): yarn is BaseYarn { return !(Array.isArray(yarn)) }
export function isBaseYarnArray(yarn: BaseYarn | BaseYarn[]): yarn is BaseYarn[] { return (Array.isArray(yarn)) }
export function isStatement(yarn: BaseYarn): yarn is Statement { return 'say' in yarn }
export function isQuestion(yarn: BaseYarn): yarn is Question { return 'ask' in yarn }
export function isEnd(yarn: BaseYarn): yarn is End { return ('name' in yarn && yarn.name === 'end') }
export function isGoto(yarn: BaseYarn): yarn is Goto { return ('goto' in yarn) }
export function isDialogAction(yarn: BaseYarn): yarn is (CallDialogAction | ExitToDialogAction) { return ('call' in yarn) || ('exit_to' in yarn) }
export function isCallDialogAction(yarn: BaseYarn): yarn is CallDialogAction { return 'call' in yarn }
export function isExitToDialogAction(yarn: BaseYarn): yarn is ExitToDialogAction { return 'exit_to' in yarn }
export function isSetAction(yarn: BaseYarn): yarn is SetAction { return ('set' in yarn) }
export function isSection(yarn: BaseYarn): yarn is Section { return 'section' in yarn }
export function isCollectLgvQuestion(yarn: BaseYarn): yarn is CollectLgvQuestion { return 'collect_lgv' in yarn }

export function isOptionNameAndValueAndAction(option: QuestionOption): option is OptionNameAndValueAndAction {
    if (Array.isArray(option) && option.length > 1 && isObject(option[2])) {
        // @ts-ignore
        return true
    } else { return false }
}

export type End = Section & {
    section: 'end',
    say?: string,
    save?: boolean,
    delete?: boolean,
    return?: boolean, // TODO: is this only meaningful for subdialogs?
}
