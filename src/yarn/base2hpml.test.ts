import { jlog, p, print } from "../Utils/utils.ts";
import { BaseYarn } from "./base_yarn.ts";
// import { baseYarnsToHpmlSections, baseYarnNodeToHpmlNode, baseYarnSectionToHpmlSection, nextSectionsForRequirements } from "./base2hpml";
import { expect } from '../../deps.ts'
const test = Deno.test

/*
test("options", () => {

    let res = baseYarnNodeToHpmlNode({
        name: "x",
        ask: "hello?",
        into: "_x_answer",
        type: "str",
        options: [
            ["Option 1", "value1"],
            ["Option 2", "value2"]
        ]
    })

    expect(res).toStrictEqual([{
        name: "x",
        ask: { prompts: ["hello?"] },
        input: {
            single: [
                {
                    "value1": "Option 1"
                },
                {
                    "value2": "Option 2"
                }
            ]
        },
        post_calc: [
            {
                "variable": "_x_answer",
                "value": "str(sensor)"
            }
        ]
    }])
})

test("actions", () => {
    expect(baseYarnNodeToHpmlNode({
        name: "x",
        ask: "hello?",
        into: "_x_answer",
        type: "string",
        options: [
            ["Option 1", "value1", { goto: "somewhere" }],
            ["Option 2", "value2", { say: "Bye now!" }]
        ]
    })).toStrictEqual([{
        name: "x",
        ask: { prompts: ["hello?"] },
        input: {
            single: [
                {
                    "value1": "Option 1"
                },
                {
                    "value2": "Option 2"
                }
            ]
        },
        post_calc: [
            {
                "variable": "_x_answer",
                "value": "str(sensor)"
            },
        ],
        next: [
            {
                condition: "_x_answer == 'value1'",
                goto: "somewhere",
            },
            {
                condition: "_x_answer == 'value2'",
                text: "Bye now!"
            }
        ]
    }])
})

test.each([
    [
        { name: "hello", say: "Hello" },
        [{
            name: "hello",
            ask: { prompts: ["Hello"] },
            input: { interim: true }
        }],
    ],
    [
        { name: "hello", delay: 1500, say: "Hello" },
        [{
            name: "hello",
            delay: 1500,
            ask: { prompts: ["Hello"] },
            input: { interim: true }
        }],
    ],
    [
        {
            name: "check_in?", ask: "check_in?", into: "_check_in_question_answer",
            options: [
                ["go_to_track", "go_to_track", { goto: "end" }],
                ["check_in", "check_in"]
            ],
            type: "str"
        },
        [{
            name: "check_in_question",
            ask: { prompts: ["check_in?"] },
            input: {
                single: [
                    {
                        "go_to_track": "go_to_track"
                    },
                    {
                        "check_in": "check_in"
                    }
                ]
            },
            post_calc: [
                {
                    "variable": "_check_in_question_answer",
                    "value": "str(sensor)"
                }
            ],
            next: [
                {
                    condition: "_check_in_question_answer == 'go_to_track'",
                    goto: "end"
                },
            ]
        }]
    ],
    [
        { name: "goto_another_section", goto: "another_section" },
        [{
            name: "goto_another_section",
            calc: {
                value: "'bogus'",
                variable: "_bogus",
            },
            next: [
                { goto: "another_section" }
            ]
        }],
    ],
    [
        { name: "overall_welcome_text", if: "{first_day()}", say: "Hi, I'm Anna." },
        [{
            name: "overall_welcome_text",
            condition: "{first_day()}",
            ask: { prompts: ["Hi, I'm Anna."] },
            input: { interim: true }
        }]
    ],
    [
        { name: "your_name", ask: "What's your name?", type: 'string' },
        [{
            name: "your_name",
            ask: { prompts: ["What's your name?"] },
            input: { text_line: true },
            post_calc: [{
                variable: "_last_text_input",
                value: "str(sensor)"
            }]
        }]
    ],
    // @ts-ignore
])("base/%j", (base: BaseYarn, expected: object) => {
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})


test("ack", () => {
    let base: BaseYarn = {
        name: "greeting",
        say: "Hi, I'm Anna",
        ack: "Hi Anna!",
    }
    let expected = [
        {
            "name": "greeting",
            "ask": {
                "prompts": [
                    "Hi, I'm Anna"
                ]
            },
            "input": {
                "single": [
                    {
                        "ack": "Hi Anna!"
                    }
                ]
            }
        }
    ]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

test.each([
    [
        { name: "continue?", ask: "Do you want to continue?", into: "_cont_answer", options: [['Yes', true], ['No', false]], type: 'bool' },
        [{
            name: "continue_question",
            ask: { prompts: ["Do you want to continue?"] },
            input: {
                single: [
                    { "true": "Yes" },
                    { "false": "No" },
                ]
            },
            post_calc: [
                {
                    value: "bool(sensor)",
                    variable: "_cont_answer",
                },
            ],

        }]
    ],
    [
        { name: "your age", ask: "What's your age?", into: "_your_age_ans", type: 'float' },
        [{
            ask: {
                "prompts": [
                    "What's your age?",
                ],
            },
            name: "your_age",
            input: { float: [] },
            post_calc: [
                {
                    value: "float(sensor)",
                    variable: "_your_age_ans",
                },
            ],
            // input: { interim: true }
        }]
    ],
    [
        { name: "what_time?", ask: "What time would you like to get up?", into: "_what_time_question_ans", type: 'time' },
        [{
            ask: {
                prompts: [
                    "What time would you like to get up?",
                ],
            },
            name: "what_time_question",
            post_calc: [
                {
                    value: "time(sensor)", // TODO: Incorrect
                    variable: "_what_time_question_ans",
                },
            ],
            // input: { interim: true }
        }]
    ],
    [
        { name: "number", ask: "What's your number?", into: "_number_answer", type: 'int' },
        [{
            name: "number",
            ask: { prompts: ["What's your number?"] },
            input: { integer: [] },
            post_calc: [
                {
                    value: "int(sensor)",
                    variable: "_number_answer",
                },
            ],
        }]
    ],
    [
        { name: "number", ask: "What's your number?", into: "_number_answer", type: 'float' },
        [{
            name: "number",
            ask: { prompts: ["What's your number?"] },
            input: { float: [] },
            post_calc: [
                {
                    value: "float(sensor)",
                    variable: "_number_answer",
                },
            ],
        }]
    ],

    // @ts-ignore
])("ask-types/%j", (base: BaseYarn, expected: object) => {
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

// test("ask for int", () => {
//     expect(toHpml({ name: "number", ask: "What's your number?", type: 'int' })).toStrictEqual(
//         {
//             name: "number",
//             ask: { prompts: ["What's your number?"] },
//             input: {
//                 single: [
//                     { "1": "1" },
//                     { "2": "2" },
//                     { "3": "3" },
//                 ]
//             }
//         }
//     )
// })

describe("into_lgv", () => {
    test("into_lgv", () => {
        expect(baseYarnNodeToHpmlNode({
            name: "first_name",
            ask: "What's your first name?",
            into_lgv: "first_name",
            type: "str",
        })).toStrictEqual([{
            name: "first_name",
            ask: { prompts: ["What's your first name?"] },
            post_calc: [
                {
                    "variable": "first_name",
                    "value": "str(sensor)"
                }
            ]
        }])
    })

    test("use result", () => {
        expect(baseYarnNodeToHpmlNode({
            name: "first_name",
            ask: "What's your first name?",
            into_lgv: "first_name",
            type: "str",
            then: { say: "Hi {first_name}" }
        })).toStrictEqual([{
            name: "first_name",
            ask: { prompts: ["What's your first name?"] },
            post_calc: [
                {
                    "variable": "first_name",
                    "value": "str(sensor)"
                }
            ],
            next: [
                {
                    text: "Hi {first_name}",
                },
            ]
        }])
    })
})

test("ask with single select string options", () => {
    let base: BaseYarn = {
        name: "preferences",
        ask: "Who do you like the most?",
        into: "_preferences_answer",
        options: [["Alice", "alice"], ["Bob", "bob"], ["Cindy", "cindy"]],
        type: 'string'
    }
    let expected = [{
        name: "preferences",
        ask: { prompts: ["Who do you like the most?"] },
        input: {
            single: [
                { "alice": "Alice" },
                { "bob": "Bob" },
                { "cindy": "Cindy" },
            ],
        },
        post_calc: [
            {
                "value": "str(sensor)",
                "variable": "_preferences_answer",
            },
        ],
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

test("ask with multi select string options", () => {
    let base: BaseYarn = { name: "preferences", ask: "Who do you like the most?", into: '_ans', options: [["alice", "Alice"], ["bob", "Bob"], ["cindy", "Cindy"]], type: 'string_list' }
    let expected = [{
        name: "preferences",
        ask: { prompts: ["Who do you like the most?"] },
        input: {
            multi: [
                { "Alice": "alice" },
                { "Bob": "bob" },
                { "Cindy": "cindy" },
            ],
        },
        post_calc: [
            {
                variable: "_ans",
                value: "str(sensor)",

            }
        ]
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})


test("then/say", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then: { say: "then is called!" }
    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        next: [
            {
                "text": "then is called!"
            }
        ]
    }]
    // jlog("baseYarnNodeToHpmlNode", baseYarnNodeToHpmlNode(base))
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)

})
test("then/set", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then: { set: "foo" }
    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        post_calc: [
            {
                variable: "foo",
                value: "'True'",
            }
        ],
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

test("then/set-to", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then:
            { set: "foo", to: "bar" }

    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        post_calc: [
            {
                variable: "foo",
                value: "bar",
            }
        ],
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

test("then/call", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then:
        {
            call: "another-dialog",
        }
    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        next: [
            {
                call: {
                    dialog: "another-dialog",
                    return: true
                }
            }
        ],
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})

test("then/call w params", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then:
        {
            call: "Person-Interview",
            parameters: ["sensor_text"],
        }
    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        next: [
            {
                call: {
                    dialog: "Person-Interview",
                    parameters: ["sensor_text"],
                    return: true
                }
            }
        ],
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})


test("then/multi", () => {
    let base: BaseYarn = {
        name: "testing-then",
        say: "testing-then",
        then: [
            { say: "then is called!" },
            { set: "foo", to: "bar" },
            { set: "baz" },
            { call: "a-different-dialog" },
            { exit_to: "a-third-dialog", parameters: ["foo", "bar"] },
        ]
    }

    let expected = [{
        name: "testing-then",
        ask: {
            prompts: [
                "testing-then",
            ],
        },
        input: {
            interim: true,
        },
        post_calc: [
            {
                variable: "foo",
                value: "bar",
            },
            {
                variable: "baz",
                value: "'True'",
            }
        ],
        next: [
            {
                "text": "then is called!"
            },
            {
                call: {
                    dialog: "a-different-dialog",
                    return: true
                }
            },
            {
                call: {
                    dialog: "a-third-dialog",
                    parameters: ["foo", "bar"],
                    return: false
                }
            }


        ]
    }]
    expect(baseYarnNodeToHpmlNode(base)).toStrictEqual(expected)
})


let END_NODE = {
    name: "end",
    condition: true,
    nodes: [{
        name: "end",
        ask: { prompts: [""] },
        input: { end: true }
    }],
    sequential: true,
}

test("end", () => {
    let base: BaseYarn = { section: "end" }

    let expected = END_NODE

    expect(baseYarnSectionToHpmlSection({ section: "end" })).toStrictEqual(expected)

    base = { section: "end", say: "Caio!" }
    expected = {
        name: "end",
        condition: true,
        nodes: [{
            name: "end",
            ask: { prompts: ["Caio!"] },
            input: { end: true }
        }],
        sequential: true,
    }

    expect(baseYarnSectionToHpmlSection(base)).toStrictEqual(expected)
})

test("baseYarnsToHpmlSections", () => {
    let baseYarns: BaseYarn[] = [
        { section: 'intro', if: "should_show?" },
        { name: "hello", say: "Hi!" },
        { section: 'end' },
    ]
    // jlog("baseYarnsToHpmlSections", baseYarnsToHpmlSections(baseYarns))
    let expected = [
        {
            name: "intro",
            condition: "should_show_question",
            nodes: [
                {
                    name: "hello",
                    ask: { prompts: ["Hi!"] },
                    input: {
                        interim: true,
                    },
                },
            ], sequential: true
        },
        END_NODE
    ]
    expect(baseYarnsToHpmlSections(baseYarns)).toStrictEqual(expected)
})

test("baseYarnsToHpmlSections multiple sections", () => {
    let baseYarns: BaseYarn[] = [
        { section: 'intro' },
        { name: "hello", say: "Hi!" },
        { name: "how_are_you?", ask: "how are you?", into: "_how_are_you_question_ans", options: [["Good", "good"], ["Eh", "not_good"]], type: 'string' },
        { section: 'education' },
        { name: "explain", say: "Let me tell you about..." },
        { section: 'end' },
    ]

    let expected = [
        {
            name: "intro", nodes: [
                {
                    name: "hello",
                    ask: { prompts: ["Hi!"] },
                    input: {
                        interim: true,
                    },
                },
                {
                    name: "how_are_you_question",
                    ask: { prompts: ["how are you?"] },
                    input: {
                        single: [
                            { "good": "Good" },
                            { "not_good": "Eh" },
                        ],
                    },
                    post_calc: [
                        {
                            variable: "_how_are_you_question_ans",
                            value: "str(sensor)",
                        },
                    ],
                },
            ], sequential: true
        },
        {
            name: "education", nodes: [
                {
                    name: "explain",
                    ask: { prompts: ["Let me tell you about..."] },
                    input: {
                        interim: true,
                    },
                }
            ], sequential: true
        },
        END_NODE
    ]
    expect(baseYarnsToHpmlSections(baseYarns)).toStrictEqual(expected)
})


test("nextSectionsForRequirements", () => {
    let res = nextSectionsForRequirements([
        ['positive', { say: "that's great" }],
    ])

    let expected = [
        {
            "condition": "sensor.nlc('pos_neg_neutral')['top_class'] if sensor.nlc('pos_neg_neutral')['classes'][0]['confidence'] > _emotvalence_threshold else 'undetermined'",
            "text": "that's great"
        }
    ]
    expect(res).toStrictEqual(expected)
})

test("collect lgv - minimal", () => {
    let baseYarns: BaseYarn[] = [
        { section: 'intro' },
        {
            name: "ask_for_name",
            ask: "What's your name?",
            collect_lgv: "name"
        },
        { section: 'end' },
    ]
    let expected = [
        {
            name: "intro", nodes: [
                {
                    name: "ask_for_name",
                    collect_lgv: { lgv: 'name', prompt: "What's your name?" }
                },
            ], sequential: true
        },
        END_NODE
    ]
    expect(baseYarnsToHpmlSections(baseYarns)).toStrictEqual(expected)
})

test("collect lgv - w options", () => {
    let baseYarns: BaseYarn[] = [
        { section: 'intro' },
        {
            name: "ask_for_name",
            collect_lgv: "name",
            ask: "what's your name?",
            // type: 'string'
            include_values: ["m1", "m2"],
            value_labels: {
                m1: "Custom Label 1",
                m2: "Custom Label 2"
            },
            guidance: "Select at least one item",
            min: 1,

        },
        { section: 'end' },
    ]
    let expected = [
        {
            name: "intro", nodes: [
                {
                    name: "ask_for_name",
                    collect_lgv: {
                        lgv: 'name',
                        prompt: "what's your name?",
                        guidance: "Select at least one item",
                        include_values: [
                            "m1",
                            "m2",
                        ],
                        min: 1,
                        value_labels: {
                            m1: "Custom Label 1",
                            m2: "Custom Label 2",
                        },
                    }
                },
            ], sequential: true
        },
        END_NODE
    ]
    expect(baseYarnsToHpmlSections(baseYarns)).toStrictEqual(expected)
})

test("conditional then", () => {
    let baseYarns: BaseYarn[] = [
        { section: 'intro' },
        {
            name: "something",
            say: "something",
            then: {
                if: "cond",
                say: "something-else",
            },
        },
        { section: 'end' },
    ]

    let expected = [
        {
            name: "intro", nodes: [
                {
                    name: "something",
                    ask: { prompts: ["something"] },
                    input: { interim: true },
                    next: [{
                        condition: "cond",
                        text: "something-else",
                    }]
                }
            ],
            sequential: true
        },
        END_NODE
    ]

    expect(baseYarnsToHpmlSections(baseYarns)).toStrictEqual(expected)
})



test("skinnable", () => {
    let baseYarns: BaseYarn[] = [
        {
            name: "depressed_intro_line_2",
            if: "should_show_depressed_intro_line_2",
            say: "text for node",
            skinnable: { description: "depressed_intro_line_2_desc", category: "Depression Intro" },
        },
    ]

    let expected = [{
        name: "depressed_intro_line_2",
        ask: {
            prompts: [{
                description: "depressed_intro_line_2_desc",
                category: "Depression Intro",
                value: "text for node",
                skinnable: true,
            }]
        },
        condition: "should_show_depressed_intro_line_2",
        input: { interim: true }
    }]

    let res = baseYarnNodeToHpmlNode(baseYarns)
    expect(res).toStrictEqual(expected)
})

test("skinnable w defaults", () => {
    let baseYarns: BaseYarn[] = [
        {
            name: "depressed_intro_line_3",
            if: "should_show_depressed_intro_line_3",
            say: "text for node",
            skinnable: {},
        },
    ]

    let expected = [{
        name: "depressed_intro_line_3",
        ask: {
            prompts: [{
                description: "depressed_intro_line_3",
                category: "",
                value: "text for node",
                skinnable: true,
            }]
        },
        condition: "should_show_depressed_intro_line_3",
        input: { interim: true }
    }]

    let res = baseYarnNodeToHpmlNode(baseYarns)
    expect(res).toStrictEqual(expected)
})

describe("elided nodes", () => {
    test("remove empty-say nodes", () => {
        let baseYarns: BaseYarn[] = [
            {
                name: "empty_node",
                say: "",
            },
        ]

        let expected: any = []

        let res = baseYarnNodeToHpmlNode(baseYarns)

        expect(res).toStrictEqual(expected)

    })
})
*/