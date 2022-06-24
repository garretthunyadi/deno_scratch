import { SugarYarn } from "./sugar_yarn.ts";
import { desugar } from "./sugar2strict.ts";
import { StrictYarn } from "./strict_yarn.ts";
import { strict2base } from "./strict2base.ts";
import { BaseYarn } from "./base_yarn.ts";
import { baseYarnsToHpmlSections } from "./base2hpml.ts";
import { ensureList } from "../Utils/utils.ts"
import { findLookupKeys, LookupTable } from "./lookups.ts"
import { HpmlSection, Var, Lgv } from "../hpml/hpml.ts"


export function yarn2Hpml_Debug(sugarYarn: SugarYarn[], lookups: LookupTable = {}, additional_vars: Var[] = [], additional_lgvs: Lgv[] = []): { sugarYarn: SugarYarn[], strictYarn: StrictYarn[], baseYarn: BaseYarn[], sections: HpmlSection[], vars: Var[], lgvs: Lgv[], lookupKeys: string[] } {
    let strictYarn = desugar(sugarYarn)
    let { baseYarn, vars, lgvs } = strict2base(strictYarn, lookups, additional_vars, additional_lgvs)
    let sections = ensureList(baseYarnToHtmlSections(baseYarn))
    let lookupKeys = findLookupKeys(strictYarn, lookups)
    return {
        sugarYarn,
        strictYarn,
        baseYarn,
        sections,
        vars,
        lgvs,
        lookupKeys,
    }
}

export let yarn2Hpml = sugarYarnToHpml

export function sugarYarnToHpml(sugarYarn: SugarYarn[], lookups: LookupTable = {}, additional_vars: Var[] = [], additional_lgvs: Lgv[] = []): { vars: Var[], lgvs: Lgv[], sections: HpmlSection[] } {
    let strictYarn = desugar(sugarYarn)
    // let baseYarns = ensureList(lower(strictYarn, lookups))
    let { baseYarn, vars, lgvs } = strict2base(strictYarn, lookups, additional_vars, additional_lgvs)

    return {
        vars,
        lgvs,
        // vars: varsInBaseYarn(baseYarns),
        // lgvs: lgvsInBaseYarn(baseYarns),
        sections: baseYarnsToHpmlSections(baseYarn)
    }
}

export function sugarYarn2StrictYarn(yarn: SugarYarn | SugarYarn[]): StrictYarn | StrictYarn[] {
    return desugar(ensureList(yarn))
}

export function strictYarn2BaseYarn(yarn: StrictYarn | StrictYarn[], lookups: LookupTable): BaseYarn | BaseYarn[] {
    let { baseYarn } = strict2base(yarn, lookups)
    // return lower(ensureList(yarn), lookups)
    return baseYarn
}

export function baseYarnToHtmlSections(yarn: BaseYarn | BaseYarn[]): HpmlSection[] {
    return baseYarnsToHpmlSections(ensureList(yarn))
}

// export function yarn2HtmlSections(yarn: StrictYarn | StrictYarn[], lookups: LookupTable): HpmlSection[] {
//     return baseYarnToHtml(strictYarn2BaseYarn(yarn, lookups))
// }

