/*
    Support for standalione actions 

    {  say: "something" }
    {  goto: "a_section" }
    {  exit_to: "a_dialog" }
    {  call: "a_dialog" }
    {  set: "var", to: "value" }
    {  delay: "1" }

    And if: [action]

    { if: "cond", say: "something" }
    { if: "cond", goto: "a_section" }
    { if: "cond", exit_to: "a_dialog" }
    { if: "cond", call: "a_dialog" }
    { if: "cond", set: "var", to: "value" }
    { if: "cond", delay: "1" }
*/
import { SugarYarn } from "../sugar_yarn.ts";
import { yarn2Hpml_Debug } from "../yarn.ts";
import { CalcNode } from "../../hpml/hpml.ts";
import { expect } from '../../../deps.ts'
const test = Deno.test


// describe("baseline actions", () => {
    test("say", () => {
        let yarn: SugarYarn[] = [
            { say: "something" }
        ]
        let res = yarn2Hpml_Debug(yarn)
        // expect(res.baseYarn.slice(1, -1)).toStrictEqual([
            expect(res.baseYarn.slice(1, -1)).toEqual([
                {
                name: "something",
                say: "something"
            },
        ])
    })

//     test("goto:", () => {
//         let yarn: SugarYarn[] = [
//             { goto: "a_section" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)

//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             { name: "a_section", goto: "a_section" },
//         ])

//         expect(res.sections[0].nodes[0].next).toStrictEqual([{ goto: "a_section" }])
//     })

//     test("call:", () => {
//         let yarn: SugarYarn[] = [
//             { call: "a_dialog" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)

//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "call_a_dialog",
//                 call: "a_dialog"
//             },
//         ])

//         expect(res.sections[0].nodes[0].next).toStrictEqual([
//             {
//                 call: {
//                     dialog: "a_dialog",
//                     return: true
//                 }
//             }
//         ])

//     })

//     test("exit_to:", () => {
//         let yarn: SugarYarn[] = [
//             { exit_to: "a_dialog", parameters: ["a", "b"] }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "exit_to_a_dialog",
//                 exit_to: "a_dialog",
//                 parameters: ["a", "b"]
//             },
//         ])

//         expect(res.sections[0].nodes[0].next).toStrictEqual([
//             {
//                 call: {
//                     dialog: "a_dialog",
//                     parameters: ["a", "b"],
//                     return: false
//                 }
//             }
//         ])
//     })

//     test("set:", () => {
//         let yarn: SugarYarn[] = [
//             { set: "a_var", to: "a_value" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)

//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "set_a_var",
//                 set: "a_var",
//                 to: "a_value"
//             },
//         ])

//         expect((res.sections[0].nodes[0] as CalcNode).calc).toStrictEqual([{ variable: "a_var", value: "a_value" }])
//     })

//     test("that explit names aren't overridden", () => {
//         let yarn: SugarYarn[] = [
//             { set: "a_var", to: "a_value", name: "egbert" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)

//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "egbert",
//                 set: "a_var",
//                 to: "a_value"
//             },
//         ])

//         expect(res.sections[0].nodes[0].name).toStrictEqual("egbert")
//         expect((res.sections[0].nodes[0] as CalcNode).calc).toStrictEqual([{ variable: "a_var", value: "a_value" }])
//     })
// })

// describe("baseline if-actions", () => {
//     test("if:say:", () => {
//         let yarn: SugarYarn[] = [
//             { if: "cond", say: "something" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "something",
//                 if: "cond",
//                 say: "something"
//             },
//         ])
//     })

//     test("if:goto:", () => {
//         let yarn: SugarYarn[] = [
//             { if: "cond", goto: "a_section" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             { name: "a_section", if: "cond", goto: "a_section" },
//         ])

//         expect(res.sections[0].nodes[0].condition).toStrictEqual("cond")
//         expect(res.sections[0].nodes[0].next).toStrictEqual([{ goto: "a_section" }])
//     })

//     test("if:call:", () => {
//         let yarn: SugarYarn[] = [
//             { if: "cond", call: "a_dialog" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "call_a_dialog",
//                 if: "cond",
//                 call: "a_dialog"
//             },
//         ])

//         expect(res.sections[0].nodes[0].next).toStrictEqual([
//             {
//                 call: {
//                     dialog: "a_dialog",
//                     return: true
//                 }
//             }
//         ])

//     })

//     test("if:exit_to:", () => {
//         let yarn: SugarYarn[] = [
//             { if: "cond", exit_to: "a_dialog" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "exit_to_a_dialog",
//                 if: "cond",
//                 exit_to: "a_dialog"
//             },
//         ])

//         expect(res.sections[0].nodes[0].next).toStrictEqual([
//             {
//                 call: {
//                     dialog: "a_dialog",
//                     return: false
//                 }
//             }
//         ])

//     })

//     test("if:set:", () => {
//         let yarn: SugarYarn[] = [
//             { if: "cond", set: "a_var", to: "a_value" }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "set_a_var",
//                 if: "cond",
//                 set: "a_var",
//                 to: "a_value"
//             },
//         ])

//         expect((res.sections[0].nodes[0] as CalcNode).calc).toStrictEqual([{ variable: "a_var", value: "a_value" }])
//     })

// })

// describe("array of actions", () => {
//     test("do:", () => {
//         let yarn: SugarYarn[] = [
//             {
//                 // say: "hi",
//                 do: [
//                     { say: "something" },
//                     { say: "something-else" },
//                     { goto: "somewhere" },
//                     { exit_to: "a-dialog" },
//                 ],
//                 // then: [{ say: "fin" }]
//             }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "something",
//                 say: "something"
//             },
//             {
//                 name: "something_else",
//                 say: "something-else"
//             },
//             {
//                 name: "somewhere",
//                 goto: "somewhere"
//             },
//             {
//                 name: "exit_to_a_dialog",
//                 exit_to: "a-dialog"
//             }
//         ])
//     })


//     test("if:do:", () => {
//         let yarn: SugarYarn[] = [
//             {
//                 if: "cond",
//                 do: [
//                     { say: "something" },
//                     { say: "something-else" },
//                     { goto: "somewhere" },
//                     { exit_to: "a-dialog" },
//                 ],
//             }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 if: "cond",
//                 name: "something",
//                 say: "something"
//             },
//             {
//                 if: "cond",
//                 name: "something_else",
//                 say: "something-else"
//             },
//             {
//                 if: "cond",
//                 name: "somewhere",
//                 goto: "somewhere"
//             },
//             {
//                 if: "cond",
//                 name: "exit_to_a_dialog",
//                 exit_to: "a-dialog"
//             }
//         ])
//     })

//     test("do:then", () => {
//         let yarn: SugarYarn[] = [
//             {
//                 do: [
//                     { say: "something" },
//                     { say: "something-else" },
//                     { goto: "somewhere" },
//                     { exit_to: "a-dialog" },
//                 ],
//                 then: { say: "fin" }
//             }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 name: "something",
//                 say: "something"
//             },
//             {
//                 name: "something_else",
//                 say: "something-else"
//             },
//             {
//                 name: "somewhere",
//                 goto: "somewhere"
//             },
//             {
//                 name: "exit_to_a_dialog",
//                 exit_to: "a-dialog",
//                 then: { say: "fin" }
//             }
//         ])
//     })

//     test("if:do:then", () => {
//         let yarn: SugarYarn[] = [
//             {
//                 if: "cond",
//                 do: [
//                     { say: "something" },
//                     { say: "something-else" },
//                     { goto: "somewhere" },
//                     { exit_to: "a-dialog" },
//                 ],
//                 then: { say: "fin" }
//             }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         // p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 if: "cond",
//                 name: "something",
//                 say: "something"
//             },
//             {
//                 if: "cond",
//                 name: "something_else",
//                 say: "something-else"
//             },
//             {
//                 if: "cond",
//                 name: "somewhere",
//                 goto: "somewhere"
//             },
//             {
//                 if: "cond",
//                 name: "exit_to_a_dialog",
//                 exit_to: "a-dialog",
//                 then: { say: "fin" }
//             }
//         ])
//     })


//     test("if:do:else", () => {
//         let yarn: SugarYarn[] = [
//             {
//                 if: "cond",
//                 do: [
//                     { say: "something" },
//                     { say: "something-else" },
//                     { goto: "somewhere" },
//                     { exit_to: "a-dialog" },
//                 ],
//                 else: { say: "fin" }
//             }
//         ]
//         let res = yarn2Hpml_Debug(yarn)
//         //p(res)
//         expect(res.baseYarn.slice(1, -1)).toStrictEqual([
//             {
//                 if: "cond",
//                 name: "something",
//                 say: "something"
//             },
//             {
//                 if: "cond",
//                 name: "something_else",
//                 say: "something-else"
//             },
//             {
//                 if: "cond",
//                 name: "somewhere",
//                 goto: "somewhere"
//             },
//             {
//                 if: "cond",
//                 name: "exit_to_a_dialog",
//                 exit_to: "a-dialog",
//             },
//             {
//                 if: "not (cond)",
//                 name: "fin",
//                 say: "fin",
//             }
//         ])
//     })


//     test.todo("if:do:then:else")
//     /*
//      test("do_multi", () => {
//          let yarn: SugarYarn[] = [
//              {
//                  do: [
//                      { say: "something" },
//                      { say: "something_else" },
//                  ]
//              }
//          ]
//          let res = yarn2Hpml_Debug(yarn)
//          expect(res.baseYarn).toStrictEqual([
//              { section: "intro" },
//              {
//                  name: "something",
//                  say: "something"
//              },
//              {
//                  name: "something_else",
//                  say: "something_else"
//              },
//              { section: "end" }
//          ])
//      })
 
//      test("if_do_multi", () => {
//          let yarn: SugarYarn[] = [
//              {
//                  if: "cond", do: [
//                      { say: "something" },
//                      { say: "something_else" },
//                  ]
//              }
//          ]
//          let res = yarn2Hpml_Debug(yarn)
//          expect(res.baseYarn).toStrictEqual([
//              { section: "intro" },
//              {
//                  if: "cond",
//                  name: "something",
//                  say: "something"
//              },
//              {
//                  if: "cond",
//                  name: "something_else",
//                  say: "something_else"
//              },
//              { section: "end" }
//          ])
//      })
//  */
// })