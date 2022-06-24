/**
* @jest-environment node
*/
import { validate_hpml_and_report_if_error, writeAsJson } from "../../../Utils/utils.ts"
import { yarn2Hpml_Debug } from "../../yarn.ts"
import { toDialog, writeDialog } from "../../yarn_dialog.ts"
import { LookupTable } from "../../lookups.ts"
import { SugarYarn } from "../../sugar_yarn.ts"
import { Lgv, Var } from "../../../hpml/hpml.ts"
import { ClassifierName } from "../../classifiers.ts"
import { expect } from '../../../../deps.ts'
const test = Deno.test

import { R } from "../../../../deps.ts"

test("example/use classifer dialog", async () => {
    let dialog = toDialog(classifiers.dialog, classifiers.items as SugarYarn[], classifiers.lookups, classifiers.vars, classifiers.lgvs)
    let versions = yarn2Hpml_Debug(classifiers.items as SugarYarn[], classifiers.lookups, classifiers.vars, classifiers.lgvs)
    // await validate_hpml_and_report_if_error(dialog, 'qa01')

    console.log(dialog.name)
    writeAsJson(versions, `./generated/${dialog.name}_versions.json`)
    writeDialog(dialog, `./generated/${dialog.name}_hpml.json`)
})

// hpml that will give the top class if above the threshold, or 'undetermined'
let topSensorClassHpml = R.curry((classifier: ClassifierName, threshold: number, variable: string): string => {
    return `nlc('${classifier}', ${variable})['top_class'] if nlc('${classifier}',${variable})['classes'][0]['confidence'] > ${threshold} else 'undetermined'`
})

let OLD_THRESHOLD_LOOKUPS: LookupTable = { _emotvalence_threshold: 0.65, _emotvalencemin_threshold: 0.45, _emotkind_threshold: 0.28, _emotname_threshold: 0.52, nlc_emotname_threshold: 0.52, _emotname2_threshold: 0.5, _meaning_threshold: 0.55, _meaning2_threshold: 0.8, _sensesyn_threshold: 0.55, _sense_threshold: 0.5, _senses_threshold: 0.22, _specificity_threshold: 0.56, _focus_threshold: 0.5, _tense_threshold: 0.5, _agency_threshold: 0.5, _energy_threshold: 0.57, _causal_threshold: 0.65, _situation_threshold: 0.27, _mirror_threshold: 0.42, }

let pnnTopClassFor = topSensorClassHpml('pos_neg_neutral', OLD_THRESHOLD_LOOKUPS._emotvalence_threshold as number)


let SENSOR_LOOKUPS: LookupTable = {
    "condition": "(nlc('pos_neg_neutral', _how_are_you_question_answer)['top_class'] if nlc('pos_neg_neutral',_how_are_you_question_answer)['classes'][0]['confidence'] > 0.65 else 'undetermined') == 'positive'",
    "pos_neg_neut_top_class": pnnTopClassFor("_last_text_input"),
    "is_positive": "({pos_neg_neut_top_class}) == 'positive'",
    "is_negative": "({pos_neg_neut_top_class}) == 'negative'",
    "is_neutral": "({pos_neg_neut_top_class}) == 'neutral'",
}

export let classifiers: { dialog: string, lookups: LookupTable, items: SugarYarn[], lgvs: Lgv[], vars: Var[] } =
{
    dialog: "classifiers-example",
    lookups: {
        ...SENSOR_LOOKUPS, ...OLD_THRESHOLD_LOOKUPS,
        "How are you?": "How ya doin'?",
        "pos_neg_neut_top_class": pnnTopClassFor("_how_are_you_question_answer"),
    },
    items: [
        { ask: "How are you?" },
        { if: "is_positive", say: "Good to hear!" },
        { if: "is_negative", say: "Oh, I'm sorry to hear that." },
        { say: "ok, let's get on with it..." },
        { goto: "intro" },
    ],
    lgvs: [],
    vars: [{ name: "_how_are_you_question_answer", type: "str" }],
}
