import { writeAsJson } from "../Utils/utils.ts"

export type HpmlDialog = {
    name: string
    description?: string
    // author:string
    context: Array<Context>
    handler_sections: Array<HandlerSection>
    sections: Array<HpmlSection>
    // created: string
    // updated: string
}

export type Context = {
    folder: string
    category?: string
    // variables: Array<Var>
    local_vars?: Array<Var>
    lgvs?: Array<Lgv>
}

export type HpmlSection = {
    name: string
    nodes: Array<HpmlNode>
    sequential: boolean
    condition?: string | boolean
    repeat?: boolean,
}

export type HandlerSection = {
    name: string
    nodes?: Array<HpmlNode>
    sequential: boolean
    condition?: string | boolean
    repeat?: boolean,
    run_alternative_prompts?: boolean
}

export type Calc = { condition?: string | boolean, variable: string, value: string }
export type Calcs = Array<Calc>

export type HpmlNode = CalcNode | StatementNode

export type CalcNode = {
    name: string
    condition?: string | boolean
    delay?: number
    calc?: Calcs
    next?: Next[]
}

export type StatementNode = {
    name: string
    condition?: string | boolean
    delay?: number
    ask?:
    | {
        prompts: string | Array<string>,
        alternative_prompts?: Array<{
            handler: string,
            prompts: string | Array<string>,
        }>,
        random?: boolean
    }
    input:
    | { intro: boolean }
    | { interim: boolean }
    | { single: Array<[index: number, text: string]> }
    | { multi: Array<[index: number, text: string]> }
    | { end: boolean }
    | { text_line: true }

    pre_calc?: Calcs
    post_calc?: Calcs

    next?: Next[]
}


// export type HpmlNode = {
//     name: string
//     // id: string
//     condition?: string | boolean
//     delay?: number
//     ask?:
//     | {
//         prompts: string | Array<string>,
//         alternative_prompts?: Array<{
//             handler: string,
//             prompts: string | Array<string>,
//         }>,
//         random?: boolean
//     }
//     input:
//     | { intro: boolean }
//     | { interim: boolean }
//     | { single: Array<[index: number, text: string]> }
//     | { multi: Array<[index: number, text: string]> }
//     | { end: boolean }
//     | { text_line: true }

//     pre_calc?: Calcs
//     calc?: Calcs
//     post_calc?: Calcs

//     next?: Next[]

// }

export type Next = { condition?: string | boolean } & (
    | { goto: string, text?: string }
    | { text: string }
    | { call: CallTarget })

export type CallTarget = { dialog: string, parameters?: string[], return: boolean }

// type RawLgv = { name: string, type: string, value: string }
export type LgvType = 'str' | 'bool' | 'date' | 'int' | 'float' | 'list'
export type Lgv = {
    name: string | Skinnable
    type: LgvType
    default?: string | Skinnable
}
// type RawVar = {name:string, type:string, value:string}
export type VarType = 'str' | 'bool' | 'date' | 'int' | 'float' | 'list'
export type Var = {
    name: string
    type: VarType
    value?: string | Skinnable
}

export type Skinnable = {
    description?: string,
    category?: string,
    value?: string,
    skinnable?: boolean
}

export function isHpmlNode(node: HpmlNode | HpmlNode[]): node is HpmlNode {
    return !(Array.isArray(node))
}


export function hpmlDialogFromJson(json: any): HpmlDialog | undefined {
    return json
}

export function writeDialog(dialog: HpmlDialog, filepath: string) {
    writeAsJson(dialog, filepath)
}
