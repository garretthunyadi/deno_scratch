/*
    Strict IDL types

    Sugar IDL includes semantic sugar (e.g. strings and arrays of strings for say and ask)        
    Strict IDL is IDL without semantic sugar, but has convention over 
        configuration (i.e. "magic")
    Base IDL is IDL that can be converted to HPML directly. It has no magic, 
        though it does have sensible defaults.

    ---
    Strict IDL is meant to be very readable.
      - It has question marks
      - It does not have lookups applied to it

    Lookups are done while convering ("lowering") Strict IDL to Base IDL
*/
import { isObject } from "../Utils/utils.ts"


// export type StrictYarn = YarnStatement | YarnQuestion | YarnMainAction | YarnEnd | YarnSection | YarnComment
export type StrictYarn = YarnMainAction | YarnEnd | YarnSection | YarnComment

export type YarnNamed = { name?: string }
export type YarnDelayed = { delay?: number }

export type YarnSection = { section: string }

export type Skinnable = {
    description?: string,
    category?: string, // This is used for grouping vars at the top of the skin spreadsheet
    value?: string,
}

export type YarnSingleStatement = YarnNamed & YarnDelayed & ({
    say: string | string[],
    ack?: string | string[],
    skinnable?: Skinnable
})

export type YarnMultiStatement = YarnNamed & YarnDelayed & ({
    do: YarnMainAction[],
    ack?: string | string[],
    skinnable?: Skinnable
})

export type YarnStatement = YarnSingleStatement | YarnMultiStatement

export type YarnQuestion = Yarn__Question | YarnVarQuestion | YarnLgvQuestion | YarnCollectLgvQuestion

export type InputType = 'int' | 'float' | 'bool' | 'string' | 'string_list' | 'time' | 'int_list' | 'float_list' | 'bool_list' | 'time_list'

type Yarn__Question = {
    ask: string | string[],
    options?: YarnQuestionOption | YarnQuestionOption[],
    require?: YarnRequirement | YarnRequirement[],
    type?: InputType,
    skinnable?: Skinnable,
} & YarnOptionalProperties

export type YarnRequirement = [string, YarnSecondaryAction] | YarnDateInputOptions | { min?: number, max?: number } | 'multiple_input' | 'natural_number'

export type YarnDateInputOptions = {
    minutes_interval?: number,
    default_var?: string, // the name of a var to pull the default from
}

export type YarnVarQuestion = Yarn__Question & { into: string }
export type YarnLgvQuestion = Yarn__Question & { into_lgv: string }
type YarnCollectLgvQuestion = Yarn__Question & {
    collect_lgv: string,
    include_values?: string[],
    value_labels?: { [key: string]: string },
    guidance?: string,
    min?: number,
    progress_bar?: string,
}

export type YarnConditional = {
    if?: string,
    else?: YarnMainAction | YarnMainAction[],
}

export type YarnThen = YarnSecondaryAction

export type YarnOptionalProperties = {
    comment?: string,
    then?: YarnThen | YarnThen[],
    delay?: number | number[],
} & YarnConditional

export type YarnConditionalStatement = YarnStatement & YarnConditional

// simplest is a string which is a key and that key 
export type YarnQuestionOption = YarnOptionNameAndValue | YarnOptionNameAndAction | YarnOptionNameAndValueAndAction

// main actions are a superset of secondary actions.
export type YarnMainAction =
    | YarnStatement
    | YarnQuestion
    | YarnGotoAction
    | YarnCallDialogAction
    | YarnExitToDialogAction
    | YarnSetAction
    | YarnMediaAction

// secondary actions are for 'then' and 'options'.
export type YarnSecondaryAction =
    | YarnSayAction
    | YarnGotoAction
    | YarnCallDialogAction
    | YarnExitToDialogAction
    | YarnSetAction

export type YarnSayAction = { say: string | string[] }
export type YarnGotoAction = { goto: string }
export type YarnCallDialogAction = { call: string, parameters?: string[] } // call a subdialog
export type YarnExitToDialogAction = { exit_to: string, parameters?: string[] } // not yet supported in hpml
export type YarnSetAction = { set: string, to?: string }

export type YarnAudioAction = { audio: string, cover?: string }
export type YarnVideoAction = { video: string, cover?: string }
export type YarnImageAction = { image: string, }

export type YarnMediaAction = YarnAudioAction | YarnVideoAction | YarnImageAction

// export type YarnConditionalAction = YarnAction & YarnConditional

// Question Options:
export type YarnOptionType = string | number | boolean
export type YarnOptionNameAndValue = [string, YarnOptionType]
export type YarnOptionNameAndAction = [string, YarnSecondaryAction | YarnSecondaryAction[]]
export type YarnOptionNameAndValueAndAction = [string, YarnOptionType, YarnSecondaryAction | YarnSecondaryAction[]]

export type YarnEnd = { section: 'end' }
export type YarnComment = { comment: string }

export let isSection = (yarn: StrictYarn): yarn is YarnSection => (isObject(yarn) && 'section' in yarn)
export function isEnd(yarn: StrictYarn): yarn is YarnEnd { return ('section' in yarn && yarn.section === 'end') }
export function isStatement(yarn: StrictYarn): yarn is YarnStatement { return isObject(yarn) && 'say' in yarn }
export function isQuestion(yarn: StrictYarn): yarn is YarnQuestion { return isObject(yarn) && 'ask' in yarn }
export function isCommentOnly(yarn: StrictYarn): yarn is YarnComment { return (yarn.hasOwnProperty('comment') && Object.keys(yarn).length <= 2) }
export function isGotoAction(yarn: StrictYarn): yarn is YarnGotoAction { return (isObject(yarn) && 'ask' in yarn) }
export function isDialogAction(yarn: StrictYarn): yarn is (YarnCallDialogAction | YarnExitToDialogAction) { return ('call' in yarn) || ('exit_to' in yarn) }
export function isCallDialogAction(yarn: StrictYarn): yarn is YarnCallDialogAction { return 'call' in yarn }
export function isExitToDialogAction(yarn: StrictYarn): yarn is YarnExitToDialogAction { return 'exit_to' in yarn }
export function isSetAction(yarn: StrictYarn): yarn is YarnSetAction { return ('set' in yarn) }
