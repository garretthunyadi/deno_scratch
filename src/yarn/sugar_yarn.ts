/*
    Sugar IDL includes semantic sugar (e.g. strings and arrays of strings for say and ask)        
    Strict IDL is IDL without semantic sugar, but has convention over 
        configuration (i.e. "magic")
    Base IDL is IDL that can be converted to HPML directly. It has no magic, 
        though it does have sensible defaults.

    ---
    Sugar IDL allows strings or arrays of strings to be used where appropriate.  These
    will be "expanded" into proper IDL (Strict IDL)
*/

import { isObject } from "../Utils/utils.ts"
import { Skinnable } from "./strict_yarn.ts"

// export type SugarYarn = Statement | Question | Comment | ConditionalAction | ConditionalMediaAction | Section | End
export type SugarYarn = ConditionalMainAction | Comment | Section | End

export type Named = { name?: string }

export type Section = { section: string }

export type SingleStatement = string | string[] | ({
    say: string | string[],
    ack?: string | string[],
    skinnable?: Skinnable
} & OptionalProperties)

export type MultiStatement = ({
    do: MainAction[], // TODO: ideally, this should allow strings as sugar, but it seems not very important.
    ack?: string | string[],
    skinnable?: Skinnable
} & OptionalProperties)

export type Statement = SingleStatement | MultiStatement

export type InputType = 'int' | 'float' | 'bool' | 'string' | 'string_list' | 'time' | 'int_list' | 'float_list' | 'bool_list' | 'time_list'

type _Question = {
    ask: string | string[],
    options?: QuestionOption | QuestionOption[],
    require?: Requirement | Requirement[],
    type?: InputType,
    skinnable?: Skinnable
} & OptionalProperties

// TODO: in order to support handler sections, where we aren't overriding the default, I need to make the action optional
export type Requirement =
    | [string, SecondaryAction] // if requirement is not met, the action is executed
    | [string, SecondaryAction, SecondaryAction] // [requirement, if met, if not met]
    | DateInputOptions | { min?: number, max?: number } | 'multiple_input' | 'natural_number'

export type DateInputOptions = {
    minutes_interval?: number,
    default_var?: string, // the name of a var to pull the default from
}

export type Question = _Question | VarQuestion | LgvQuestion | CollectLgvQuestion
type VarQuestion = _Question & { into: string }
type LgvQuestion = _Question & { into_lgv: string }
type CollectLgvQuestion = Named & {
    collect_lgv: string,
    include_values?: string[],
    value_labels?: { [key: string]: string },
    guidance?: string,
    min?: number,
    progress_bar?: string,
}

export type MainAction =
    | string | string[]
    | Statement
    | Question
    | GotoAction
    | CallDialogAction
    | ExitToDialogAction
    | SetAction
    | MediaAction

export type SecondaryAction =
    | string | string[]
    | SayAction
    | GotoAction
    | CallDialogAction
    | ExitToDialogAction
    | SetAction

export type SayAction = { say: string | string[] }
export type GotoAction = { goto: string }
export type CallDialogAction = { call: string, parameters?: string[] } // call a subdialog
export type ExitToDialogAction = { exit_to: string, parameters?: string[] } // not yet supported in hpml
export type SetAction = { set: string, to?: string }

export type AudioAction = { audio: string, cover?: string }
export type VideoAction = { video: string, cover?: string, }
export type ImageAction = { image: string }
export type MediaAction = AudioAction | VideoAction | ImageAction

export type ConditionalMainAction = MainAction & Conditional

export type Conditional = {
    if?: string,
    else?: MainAction | MainAction[]
}

export type Then = SecondaryAction

export type OptionalProperties = {
    name?: string,
    comment?: string,
    then?: Then | Then[],
    delay?: number | number[],
} & Conditional

export type ConditionalStatement = Statement & Conditional
export type QuestionOption = string | OptionNameAndValue | OptionNameAndAction | OptionNameAndValueAndAction
export type OptionType = string | number | boolean
export type OptionNameAndValue = [string, OptionType]
export type OptionNameAndAction = [string, SecondaryAction | SecondaryAction[]]
export type OptionNameAndValueAndAction = [string, OptionType, SecondaryAction | SecondaryAction[]]

export type End = { name: 'end' }
export type Comment = { comment: string }

export function isStatement(yarn: SugarYarn): yarn is Statement { return isObject(yarn) && 'say' in yarn }
