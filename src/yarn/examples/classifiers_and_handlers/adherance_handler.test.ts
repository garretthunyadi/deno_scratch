/**
* @jest-environment node
*/
/*
   Handler should chack n times and then do exhaustion
*/

import { Lgv, Var } from "../../../hpml/hpml.ts"
import { validate_hpml_and_report_if_error, writeAsJson } from "../../../Utils/utils.ts"
import { yarn2Hpml_Debug } from "../../yarn.ts"
import { toDialog, writeDialog } from "../../yarn_dialog.ts"
import { LookupTable } from "../../lookups.ts"
import { SugarYarn } from "../../sugar_yarn.ts"
import { expect } from '../../../../deps.ts'
const test = Deno.test


//jest.setTimeout(15000)

// let R = require("ramda")
// hpml that will give the top class if above the threshold, or 'undetermined'
// let topSensorClassHpml = R.curry((classifier: ClassifierName, threshold: number, variable: string): string => {
//     return `nlc('${classifier}', ${variable})['top_class'] if nlc('${classifier}',${variable})['classes'][0]['confidence'] > ${threshold} else 'undetermined'`
// })
// let OLD_THRESHOLD_LOOKUPS: LookupTable = { _emotvalence_threshold: 0.65, _emotvalencemin_threshold: 0.45, _emotkind_threshold: 0.28, _emotname_threshold: 0.52, nlc_emotname_threshold: 0.52, _emotname2_threshold: 0.5, _meaning_threshold: 0.55, _meaning2_threshold: 0.8, _sensesyn_threshold: 0.55, _sense_threshold: 0.5, _senses_threshold: 0.22, _specificity_threshold: 0.56, _focus_threshold: 0.5, _tense_threshold: 0.5, _agency_threshold: 0.5, _energy_threshold: 0.57, _causal_threshold: 0.65, _situation_threshold: 0.27, _mirror_threshold: 0.42, }
//let pnnTopClassFor = topSensorClassHpml('pos_neg_neutral', OLD_THRESHOLD_LOOKUPS._emotvalence_threshold as number)

test("adherance handler exaample", async () => {
    let dialog = toDialog(dialog_data.dialog, dialog_data.items as SugarYarn[], dialog_data.lookups, dialog_data.additional_vars, dialog_data.additional_lgvs)

    // @ts-ignore
    dialog.handler_sections = handler_sections()
    let versions = yarn2Hpml_Debug(dialog_data.items as SugarYarn[], dialog_data.lookups, dialog_data.additional_vars, dialog_data.additional_lgvs)
    await validate_hpml_and_report_if_error(dialog, 'qa01')

    writeAsJson(versions, `./generated/classifiers_and_handlers/${dialog.name}_versions.json`)
    writeDialog(dialog, `./generated/classifiers_and_handlers/${dialog.name}_hpml.json`)
})

export let dialog_data: { dialog: string, lookups: LookupTable, items: SugarYarn[], additional_lgvs: Lgv[], additional_vars: Var[], } =
{
    dialog: "adherance_handler_example",
    additional_lgvs: [],
    additional_vars: [
        { name: "_count", type: "int", value: "0" },
        { name: "_count_123", type: "int", value: "0" },
        { name: "_say_something_positive____count_____count___5___answer", type: "str", value: "''" },
    ],
    lookups: {
        // "has_name?": "lgv('first_name','') != ''",
        // "yes": "Yes",
        // "no": "No",

        // "condition": "(nlc('pos_neg_neutral', _last_text_input)['top_class'] if nlc('pos_neg_neutral',_last_text_input)['classes'][0]['confidence'] > 0.65 else 'undetermined') == 'positive'",
        // "pos_neg_neut_top_class": pnnTopClassFor("_last_text_input"),
        // "is_positive": "({pos_neg_neut_top_class}) == 'positive'",
        // "is_negative": "({pos_neg_neut_top_class}) == 'negative'",
        // "is_neutral": "({pos_neg_neut_top_class}) == 'neutral'",

    },
    items: [



        // { section: "change_name" },
        { ask: "Say something positive ({_count}, {_count < 5})", then: { set: "_count", to: "_count + 1" } },
        // { if: "_count >= 3", say: "Time's up! {_count} times", then: [{ goto: "end" }] },
        // { if: "_count < 3", goto: "intro" }
        { say: "Fin." },
    ]
}

function handler_sections() {
    return [
        {
            name: "be_positive_handler",
            condition: "_count < 3 and (nlc('pos_neg_neutral', _last_text_input)['top_class'] if nlc('pos_neg_neutral',_last_text_input)['classes'][0]['confidence'] > 0.65 else 'undetermined') == 'positive'",
            sequential: true,
            repeat: true,
            nodes: [
                {
                    name: "adherance_handler",
                    ask: {
                        prompts: "Try again ({_count})"
                    },
                    input: {
                        interim: true
                    }
                }
            ]
        },
        {
            name: "handler123",
            condition: "_count_123 < 3 and str(sensor) == '123'",
            sequential: true,
            repeat: true,
            nodes: [
                {
                    name: "node123",
                    ask: {
                        prompts: "123 was detected"
                    },
                    input: {
                        interim: true
                    },
                    post_calc: [
                        {
                            "variable": "_count_123",
                            "value": "_count_123 + 1"
                        }
                    ]
                }
            ]
        },
        {
            name: "handler123_exhausted",
            condition: "_count_123 >= 3 and str(sensor) == '123'",
            sequential: true,
            repeat: false,
            nodes: [
                {
                    name: "node123",
                    ask: {
                        prompts: "Ug.. too much!"
                    },
                    input: {
                        interim: true
                    },
                }
            ]
        },
        {
            name: "garbage",
            condition: "sensor.check('garbage') < 1.0",
            sequential: true,
            repeat: false,
            nodes: [
                {
                    name: "garbage",
                    ask: {
                        prompts: "garbage? {sensor.check('garbage')}"
                    },
                    input: {
                        interim: true
                    }
                }
            ]

        }
    ]
}