/**
* @jest-environment node
*/
import { HandlerSection, HpmlDialog, writeDialog } from "../../hpml/hpml.ts"
import { validate_hpml_and_report_if_error } from "../../Utils/utils.ts"
import { expect } from '../../../deps.ts'
const test = Deno.test


//jest.setTimeout(15000)

test("handler-scratchpad", async () => {
    let dialog: HpmlDialog = {
        context: [
            {
                folder: "vars",
                local_vars: [
                    { name: "_last_text_input", value: "''", type: "str" },
                    { name: "_count", value: "0", type: "int" },
                    { name: "_count_111", value: "0", type: "int" },
                    { name: "_count_222", value: "0", type: "int" },
                ]
            }
        ],
        sections: [
            {
                name: "intro",
                sequential: true,
                nodes: [
                    {
                        name: "intro",
                        ask: { prompts: "Hello" },
                        input: { interim: true }
                    },
                    {
                        name: "how_are_you",
                        ask: {
                            prompts: "How are you?  / Last: '{_last_text_input}'. {nlc('pos_neg_neutral', _last_text_input)['top_class']}  {nlc('pos_neg_neutral', _last_text_input)['confidence']}   {(nlc('pos_neg_neutral', _last_text_input)['top_class'] if nlc('pos_neg_neutral',_last_text_input)['classes'][0]['confidence'] > 0.65 else 'undetermined') != 'positive'}",
                            alternative_prompts: [
                                {
                                    handler: "be_positive_handler",
                                    prompts: [
                                        "Can you say that in a more positive way?",
                                        "Put your happy face on and try again",
                                    ]
                                },
                                {
                                    handler: "handler111",
                                    prompts: [
                                        "alternative prompt 111.1 #{_count_111}",
                                        "alternative prompt 111.2 #{_count_111}",
                                        "alternative prompt 111.3 #{_count_111}"
                                    ]
                                },
                                {
                                    handler: "handler222",
                                    prompts: [
                                        "alternative prompt 222.1 #{_count_222}",
                                        "alternative prompt 222.2 #{_count_222}",
                                        // "alternative prompt 222.3 #{_count_222}"
                                    ]
                                }
                            ]

                        },
                        input: { text_line: true },
                        post_calc: [
                            {
                                variable: "_last_text_input",
                                value: "str(sensor)"
                            }
                        ],

                    },
                    {
                        name: "parrot",
                        ask: { prompts: "You said: '{_last_text_input}'. {nlc('pos_neg_neutral', _last_text_input)['top_class']}  {nlc('pos_neg_neutral', _last_text_input)['confidence']}" },
                        input: { interim: true },
                    },
                    {
                        name: "loop",
                        condition: "_last_text_input != 'end'",
                        ask: { prompts: "----- Continuing on -----  " },
                        input: { interim: true },
                        next: [{ goto: "intro" }]
                    },
                    {
                        name: "done",
                        ask: { prompts: "All done" },
                        input: { end: true }
                    },

                ]
            }
        ],
        name: "handler-scratchpad",
        handler_sections: handler_sections(),
    }

    await validate_hpml_and_report_if_error(dialog, 'qa01')

    writeDialog(dialog, `./generated/${dialog.name}_hpml.json`)
})

function handler_sections(): Array<HandlerSection> {
    return [
        {
            name: "be_positive_handler",
            condition: "(nlc('pos_neg_neutral', _last_text_input)['top_class'] if nlc('pos_neg_neutral',_last_text_input)['classes'][0]['confidence'] > 0.65 else 'undetermined') != 'positive'",
            sequential: true,
            repeat: true,
            run_alternative_prompts: true,
        },

        // This doesn't work, it rotates through and should stop at two.
        {
            name: "rotating_be_positive_handler",
            condition: "(nlc('pos_neg_neutral', _last_text_input)['top_class'] if nlc('pos_neg_neutral',_last_text_input)['classes'][0]['confidence'] > 0.65 else 'undetermined') != 'positive'",
            sequential: true,
            repeat: true,
            run_alternative_prompts: true,
        },
        {
            name: "handler111",
            condition: "_count_111 < 3 and str(sensor) == '111'",
            sequential: true,
            repeat: true,
            run_alternative_prompts: true,
            nodes: [
                {
                    name: "node111",
                    ask: {
                        prompts: "111 was detected  #{_count_111}"
                    },
                    input: {
                        interim: true
                    },
                    post_calc: [
                        {
                            "variable": "_count_111",
                            "value": "_count_111 + 1"
                        }
                    ]
                }
            ]
        },
        // {
        //     name: "handler111_exhausted",
        //     condition: "_count_111 >= 3 and str(sensor) == '111'",
        //     sequential: true,
        //     repeat: false,
        //     nodes: [
        //         {
        //             name: "node111",
        //             ask: {
        //                 prompts: "Ug.. too much! (111) #{_count_111}"
        //             },
        //             input: {
        //                 interim: true
        //             },
        //         }
        //     ]
        // },
        {
            name: "handler222",
            condition: "_count_222 < 3 and str(sensor) == '222'",
            sequential: true,
            repeat: true,
            run_alternative_prompts: true,
            nodes: [
                { name: "node222", calc: [{ variable: "_count_222", value: "_count_222 + 1" }] }
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