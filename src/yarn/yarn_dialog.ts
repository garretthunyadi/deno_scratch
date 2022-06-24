import { HpmlSection, Var, VarType, Lgv, LgvType, Skinnable } from "../hpml/hpml.ts";
import { ensureList, writeAsJson } from "../Utils/utils.ts";
import { yarn2Hpml } from "./yarn.ts";
import { SugarYarn } from "./sugar_yarn.ts";
import { LookupTable } from "./lookups.ts";

// TODO: Shift these types to use the types from hpml/hpml.ts

export type Dialog = {
    name: string,
    // condition?: string,
    context: Folder[],
    sections: Section[],
}

export type Section = HpmlSection

type Folder = {
    folder: string,
    local_vars?: LocalVar[]
    lgvs?: LgvValue[]
}

type LocalVar = {
    name: string,
    type: VarType
    value: string | boolean | number | Skinnable,
}
type LgvValue = {
    name: string,
    type: LgvType,
    default: string | boolean | number,
}

function defaultForType(type: VarType | LgvType) {
    if (type === 'int') {
        return '0'
    } else if (type === 'bool') {
        return "False"
    } else if (type === 'float') {
        return "0.0"
    } else if (type === 'list') {
        return '[]'
    } else if (type === 'date') {
        return "'date(1,1,1)'"
    }
    return "''"
}

function localVar(v: Var): LocalVar {
    return {
        name: v.name,
        type: v.type,
        value: v.value || defaultForType(v.type),
    }
}

function lgv(l: Lgv, value: number | string | boolean | undefined = undefined): LgvValue {
    // @ts-ignore
    value = value || l.default || defaultForType(l.type)
    return {
        // @ts-ignore
        name: l.name,
        type: l.type,
        // @ts-ignore
        default: value,
    }
}

export function toDialog(dialogName: string, yarn: SugarYarn | SugarYarn[], lookups: LookupTable, additional_vars: Var[] = [], additional_lgvs: Lgv[] = []): Dialog {
    let { sections, vars, lgvs } = yarn2Hpml(ensureList(yarn), lookups, additional_vars, additional_lgvs)

    let dialog: Dialog = {
        name: dialogName,
        context: [
            {
                folder: "vars",
            }],
        sections: sections,
    }

    let local_vars = vars.map(v => localVar(v))
    if (local_vars.length > 0) {
        dialog.context[0].local_vars = local_vars
    }
    let hpml_lgvs = lgvs.map(v => lgv(v))

    if (hpml_lgvs.length > 0) {
        dialog.context[0].lgvs = hpml_lgvs
    }

    return dialog
}

// {
//     "include": {
//       "dialog": "Dialog-Master",
//       "folder": "master_education"
//     }
//   },
export type SkeletonInclude = { include: { dialog: string, folder: string } }

export function toSkeletonDialog(
    dialogName: string,
    yarn: SugarYarn | SugarYarn[],
    lookups: LookupTable,
    additional_vars: Var[] = [],
    additional_lgvs: Lgv[] = [],
    skeleton_includes: SkeletonInclude[] = [],
): Dialog {
    let { sections, vars, lgvs } = yarn2Hpml(ensureList(yarn), lookups, additional_vars, additional_lgvs)

    let dialog: Dialog = {
        name: dialogName,
        context: [
            // @ts-ignore
            {
                folder: "vars",
            },
            // @ts-ignore
            ...skeleton_includes,
        ],
        sections: sections,
    }

    let local_vars = vars.map(v => localVar(v))
    if (local_vars.length > 0) {
        dialog.context[0].local_vars = local_vars
    }
    let hpml_lgvs = lgvs.map(v => lgv(v))

    if (hpml_lgvs.length > 0) {
        dialog.context[0].lgvs = hpml_lgvs
    }

    return dialog
}

export function writeDialog(dialog: Dialog, filepath: string) {
    writeAsJson(dialog, filepath)
}
