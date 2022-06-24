/**
* @jest-environment node
*/
import { LookupTable } from "../lookups.ts"
import { SugarYarn } from "../sugar_yarn.ts"
import { toDialog, writeDialog } from "../yarn_dialog.ts"
import { Lgv, Var } from "../../hpml/hpml.ts"
import { validate_hpml_and_report_if_error, writeAsJson } from "../../Utils/utils.ts"
import { yarn2Hpml_Debug } from "../yarn.ts"
import { validate_hpml } from "../../compass_service/compass_service.ts"
// import { expect } from '../../deps.ts'
const test = Deno.test


//jest.setTimeout(15000)

type Variant = { variant: string } & LookupTable

type DialogData = { dialog: string, defaults: LookupTable, variants: Variant[], items: SugarYarn[], lgvs?: Lgv[], vars?: Var[] }

export let dialog_data: DialogData =
{
    dialog: "ActionsExample",
    items: [
        "setting a var...",
        { set: "_a_var", to: "'a_value'" },

        { comment: "a list of actions" },
        {
            do: [
                { say: "list item 1" },
                { say: "list item 2 (_counter is {_counter})" },
                { set: "_counter", to: "10" },
                { say: "_counter is now {_counter}", name: "counter_is_now" },
                { goto: "after_list" },
                { say: "shouldnt's see this" }
            ]
        },

        { section: "after_list" },

        "calling the hello_world dialog...",
        { call: "test-dialog-01" },

        "goto the 'skip ahead' section",
        { goto: "skip_ahead" },

        "YOU SHOULD NOT SEE THIS!",

        { section: "skip_ahead" },

        { if: "_a_var == 'a_value'", say: "a_var is 'a_value', good." },

        "exit to the hello-world dialog...",
        { exit_to: "test-dialog-01" },

    ],
    vars: [
        { name: '_a_var', type: 'str' },
        { name: '_counter', type: 'int', value: '0' },
    ],
    defaults: {
        variant: "default",
    },
    variants: []
}

async function process(dd: DialogData) {
    let dialog = toDialog(dd.dialog, dd.items, dd.defaults, dd.vars, dd.lgvs)
    let versions = yarn2Hpml_Debug(dd.items as SugarYarn[], dd.defaults)
    await validate_hpml_and_report_if_error(dialog, "qa01")
    writeAsJson(versions, `./generated/${dialog.name}_versions.json`)
    writeDialog(dialog, `./generated/${dialog.name}_hpml.json`)
}

test("audio_test", async () => {
    await process(dialog_data)
})
