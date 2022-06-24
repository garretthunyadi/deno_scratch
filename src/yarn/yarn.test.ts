import { yarn2Hpml_Debug } from "./yarn.ts"
import { LookupTable } from "./lookups.ts"
import { strict2base } from "./strict2base.ts"
import { desugar } from "./sugar2strict.ts"
import { SugarYarn } from "./sugar_yarn.ts"
import { StatementNode } from "../hpml/hpml.ts"
import { expect } from '../../deps.ts'
const test = Deno.test

// describe("ack", () => {
test("ack", () => {
    let yarn: SugarYarn[] = [
        { say: "embedded ack test", ack: "embedded ack" },
    ]

    let lookups: LookupTable = {}

    let res = yarn2Hpml_Debug(yarn, lookups)

    let expected_hpml_snippet =
    {
        "name": "embedded_ack_test",
        "ask": {
            "prompts": [
                "embedded ack test"
            ]
        },
        "input": {
            "single": [
                {
                    "ack": "embedded ack"
                }
            ]
        }
    }

    expect(res['sections'][0]['nodes'][0]).toEqual(expected_hpml_snippet)
})

test("ack in lookups", () => {
    let yarn: SugarYarn[] = [
        // { say: "embedded ack test", ack: "embedded ack" },
        "intro",
    ]

    let lookups: LookupTable = {
        "intro": [
            { say: "lookup ack test", ack: "lookup ack" },
        ]
    }

    let res = yarn2Hpml_Debug(yarn, lookups)

    let node = res['sections'][0]['nodes'][0] as StatementNode
    expect(node.ask?.prompts[0]).toEqual('lookup ack test')
    // @ts-ignore
    expect(node.input?.single[0]['ack']).toEqual('lookup ack')
})
// })

test('sugarYarnToHpmlSectionsDebug', () => {
    let yarn: SugarYarn[] = [
        { if: "should_say_hi", say: "hi", }
    ]

    let lookups: LookupTable = {
        should_say_hi: true,
    }

    let res = yarn2Hpml_Debug(yarn, lookups)
    // jlog("sugarYarnToHpmlSectionsDebug", res)

    // expect(res).toStrictEqual({
    expect(res).toEqual({
        "sugarYarn": [{
            "if": "should_say_hi",
            "say": "hi"
        }],
        "strictYarn": [
            {
                "if": "should_say_hi",
                "say": "hi"
            }
        ],
        "baseYarn": [
            {
                "section": "intro"
            },
            {
                "if": true,
                "say": "hi",
                "name": "hi"
            },
            {
                "section": "end"
            }
        ],
        "sections": [
            {
                "name": "intro",
                "nodes": [
                    {
                        "name": "hi",
                        "condition": true,
                        "ask": {
                            "prompts": [
                                "hi"
                            ]
                        },
                        "input": {
                            "interim": true
                        }
                    }
                ],
                "sequential": true
            },
            {
                "name": "end",
                "sequential": true,
                "condition": true,
                "nodes": [
                    {
                        "name": "end",
                        "ask": {
                            "prompts": [
                                ""
                            ]
                        },
                        "input": {
                            "end": true
                        }
                    }
                ]
            }
        ],
        "vars": [
            { name: "_last_text_input", type: "str" },
            { name: "_bogus", type: "str" }
        ],
        "lgvs": [
        ],
        "lookupKeys": [
            "hi",
            "should_say_hi"
        ]
    })
})


test("multi-statement if/multi-statement else", () => {
    /*

[{ if: "coming", say: ["hi", "there"], else: ["bye", "now"]}]

[{ if: "coming", say: [{say:"hi"}, {say:"there"}] }]
[{ if: "not:coming", say: [{say:"bye"}, {say:"now"}] }]

[{ if: "coming", say: "hi" }
{ if: "coming", say: "there" }
{ if: "not:coming", say:"bye" }
{ if: "not:coming", say:"now"}]



    */
    let sugarYarn: SugarYarn[] = [{ if: "coming", say: ["hi", "there"], else: ["bye", "now"] }]
    // let { baseYarn } = yarn2Hpml_Debug(yarn, {})

    let strictYarn = desugar(sugarYarn)
    // print("strictYarn", strictYarn)

    let { baseYarn } = strict2base(strictYarn, {})


    // expect(baseYarn).toContainEqual({ if: "coming", name: "hi", say: "hi" })
    // expect(baseYarn).toContainEqual({ if: "coming", name: "there", say: "there" })
    // expect(baseYarn).toContainEqual({ if: "not (coming)", name: "bye", say: "bye" })
    // expect(baseYarn).toContainEqual({ if: "not (coming)", name: "now", say: "now" })
})

test("multi-statement if/multi-statement else & then", () => {
    /*

[{ if: "coming", say: ["hi", "there"], else: ["bye", "now"], then: ["and", "lastly"] }]

[{ if: "coming", say: ["hi", "there"], then: ["and", "lastly"] }]
[{ if: "notcoming", say: ["bye", "now"], then: ["and", "lastly"] }]
[{ say: ["and", "lastly"] }]

base:
[
    { if: "coming", say: "hi" },
    { if: "coming", say: "there" },
    { if: "notcoming", say: "bye" },
    { if: "notcoming", say: "now" },
    { say: "and" },
    { say: "lastly" }
]



    */
    let sugarYarn: SugarYarn[] = [{ if: "coming", say: ["hi", "there"], else: ["bye", "now"], then: ["and", "lastly"] }]
    let { baseYarn } = yarn2Hpml_Debug(sugarYarn, {})

    // expect(baseYarn).toContainEqual({ if: "coming", name: "hi", say: "hi" })
    // expect(baseYarn).toContainEqual({ if: "coming", name: "there", say: "there", then: [{ say: "and" }, { say: "lastly" }] })
    // expect(baseYarn).toContainEqual({ if: "not (coming)", name: "bye", say: "bye" })
    // expect(baseYarn).toContainEqual({ if: "not (coming)", name: "now", say: "now", then: [{ say: "and" }, { say: "lastly" }] })
})


test('elidedContent', () => {
    let yarn: SugarYarn[] = [
        "",
        { say: "" },
        { if: "should_say_hi", say: "replaced_in_lookup", }
    ]

    let lookups: LookupTable = {
        should_say_hi: true,
        replaced_in_lookup: '',
    }

    let res = yarn2Hpml_Debug(yarn, lookups)
    // jlog("sugarYarnToHpmlSectionsDebug", res)

    expect(res.sections[0].nodes.length).toBe(0)
})

