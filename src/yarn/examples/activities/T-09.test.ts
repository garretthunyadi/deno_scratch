/**
* @jest-environment node
*/
import { validate_hpml_and_report_if_error, writeAsJson } from "../../../Utils/utils.ts"
import { yarn2Hpml_Debug } from "../../yarn.ts"
import { toDialog, writeDialog } from "../../yarn_dialog.ts"
import { SugarYarn } from "../../sugar_yarn.ts"
import { dialog_data } from "./T-09.ts"
// import { expect } from '../../deps.ts'
const test = Deno.test


//jest.setTimeout(15000)

test("example/use classifer dialog", async () => {
    let dialog = toDialog(dialog_data.dialog, dialog_data.items as SugarYarn[], dialog_data.lookups, dialog_data.vars, dialog_data.lgvs)
    let versions = yarn2Hpml_Debug(dialog_data.items as SugarYarn[], dialog_data.lookups, dialog_data.vars, dialog_data.lgvs)
    await validate_hpml_and_report_if_error(dialog, 'qa01')
    writeAsJson(versions, `./generated/${dialog.name}_versions.json`)
    writeDialog(dialog, `./generated/${dialog.name}_hpml.json`)
})



