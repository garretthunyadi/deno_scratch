/**
* @jest-environment node
*/
// import { get_lgv_list, get_lgvs_by_id, get_lgv_by_id, get_lgvs_by_name, get_dialog_info, validate_hpml, search_lgfs, get_lgf_list, validate_lgf_expression, get_value_set_by_id, get_value_set_by_name } from "./compass_service.ts"
import { get_lgv_list, get_lgvs_by_id, get_lgv_by_id, get_lgvs_by_name, get_dialog_info, search_lgfs, get_lgf_list, validate_lgf_expression, get_value_set_by_id, get_value_set_by_name } from "./compass_service.ts"
import { expect } from '../../deps.ts'
const test = Deno.test


let local_testing = false
let host = local_testing ? '0.0.0.0:9091' : 'compass-gw-qa01.happify.com'

if (!local_testing) {
  console.log(`testing against ${host}`)
}
// type CompassRequestType = ValidateHpml | ValidateLgf | GetLgv 
// type CompassRequestType = 'validate/hpml' | 'lgf/validate' | 'lgv' 
// type CompassRequestType = 'validate_hpml' | 'validate_lgf' | 'lgv' 

// type CompassRequest = {
//     type: CompassRequestType,
//     host: string, // compass-gw-qa01.happify.com
// }

// //jest.setTimeout(15000)

// describe("compass_service_access", () => {
//   describe("lgv", () => {

test("get_lgv_list", async () => {
  // @ts-ignore
  let res = await get_lgv_list(host)
  expect(res.length).toBeGreaterThan(100)
})


// test("get_lgvs_by_names", async () => {
//   let names = ['tr_stress', 'tr_bouncing']
//   // @ts-ignore
//   let res = await get_lgvs_by_name(host, names)
//   // console.log(res.length)
//   // console.log(res)
//   expect(res.length).toBe(2)
// })

// test("get_lgv_by_id", async () => {
//   let id = 100
//   // @ts-ignore
//   let res = await get_lgv_by_id(host, id)
//   expect(res.id).toBe(100)
// })

// test("get_lgv_by_id/nonexistent", async () => {
//   let id = 9999
//   // @ts-ignore
//   let res = await get_lgv_by_id(host, id)
//   expect(res).toBeUndefined()
// })

// test("get_lgvs_by_ids", async () => {
//   // tr_relationship: int (1451)
//   // tr_relationship_multi: str (4637)
//   let ids = [1451, 4637]
//   // @ts-ignore
//   let res = await get_lgvs_by_id(host, ids)
//   // console.log(res.length)
//   // console.log(res)
//   expect(res.length).toBe(2)
// })

// test("get_lgv_by_ids", async () => {
//   // tr_relationship: int (1451)
//   // tr_relationship_multi: str (4637)
//   let id = 1451
//   // @ts-ignore
//   let res = await get_lgv_by_id(host, id)
//   // console.log(res.length)
//   // console.log(res)
//   expect(res.id).toBe(1451)
//   expect(res.name).toBe("tr_relationship")
// })

// /*
//   tr_age: int (1449)
//   tr_age_22plus: int (4635)
//   tr_age_hum: int (3357)
//   tr_age_uhc: int (3306)
//   tr_anthmed_insurance: str (4886)
//   tr_anthmed_insurance_name: str (4887)
//   tr_sncl_gender: int (4791)
//   tr_sncl_race: str (4790)
//   tr_social: int (1459)
//   tr_stress: int (1458)
//   tr_stress_ra: int (4546)
// */

// // })

// // describe("dialogs", () => {

// test("get_dialog_info", async () => {
//   // @ts-ignore
//   let res = await get_dialog_info(host, 100)
//   expect(res.id).toBe(100)
//   // console.log(res)
// })

// test("validate_hpml/valid hpml", async () => {
//   let some_hpml = `
//         {
//             "name": "AudioExample",
//             "context": [
//               {
//                 "folder": "vars",
//                 "local_vars": [
//                   {
//                     "name": "_last_text_input",
//                     "type": "str",
//                     "value": "''"
//                   },
//                   {
//                     "name": "_bogus",
//                     "type": "str",
//                     "value": "''"
//                   }
//                 ]
//               }
//             ],
//             "sections": [
//               {
//                 "name": "intro",
//                 "nodes": [
//                   {
//                     "name": "intro",
//                     "ask": {
//                       "prompts": [
//                         "intro"
//                       ]
//                     },
//                     "input": {
//                       "interim": true
//                     }
//                   },
//                   {
//                     "name": "audio_example_url",
//                     "ask": {
//                       "prompts": [
//                         ""
//                       ]
//                     },
//                     "input": {
//                       "audio": {
//                         "media": "https://hpf-happify-b2c-eu-qa-11-user-uploads.happify.com/cms_uploads/en_US/audio/localization_audios/sample_audio.mp3",
//                         "cover": "https://hpf-happify-b2c-eu-qa-11-user-uploads.happify.com/cms_uploads/en_US/img/localization_images/your_logo.png"
//                       }
//                     }
//                   },
//                   {
//                     "name": "summary",
//                     "ask": {
//                       "prompts": [
//                         "summary"
//                       ]
//                     },
//                     "input": {
//                       "interim": true
//                     }
//                   }
//                 ],
//                 "sequential": true
//               },
//               {
//                 "name": "end",
//                 "sequential": true,
//                 "condition": true,
//                 "nodes": [
//                   {
//                     "name": "end",
//                     "ask": {
//                       "prompts": [
//                         ""
//                       ]
//                     },
//                     "input": {
//                       "end": true
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         `
//   // @ts-ignore
//   let errors = await validate_hpml(host, some_hpml)
//   expect(errors.length).toBe(0)
// })


// test("validate_hpml/invalid hpml", async () => {
//   let some_hpml = `
//         {
//             "name": "AudioExample",
//             "context": [
//               {
//                 "folder": "vars",
//                 "local_vars_ERRIRIR": [
//                   {
//                     "name": "_last_text_input",
//                     "type": "str",
//                     "value": "''"
//                   },
//                   {
//                     "name": "_bogus",
//                     "type": "str",
//                     "value": "''"
//                   }
//                 ]
//               }
//             ],
//             "sections": [
//               {
//                 "name": "intro",
//                 "nodes": [
//                   {
//                     "name": "intro",
//                     "ask": {
//                       "prompts": [
//                         "intro"
//                       ]
//                     },
//                     "input": {
//                       "interim": true
//                     }
//                   },
//                   {
//                     "name": "audio_example_url",
//                     "ask": {
//                       "prompts": [
//                         ""
//                       ]
//                     },
//                     "input": {
//                       "audio": {
//                         "media": "https://hpf-happify-b2c-eu-qa-11-user-uploads.happify.com/cms_uploads/en_US/audio/localization_audios/sample_audio.mp3",
//                         "cover": "https://hpf-happify-b2c-eu-qa-11-user-uploads.happify.com/cms_uploads/en_US/img/localization_images/your_logo.png"
//                       }
//                     }
//                   },
//                   {
//                     "name": "summary",
//                     "ask": {
//                       "prompts": [
//                         "summary"
//                       ]
//                     },
//                     "input": {
//                       "interim": true
//                     }
//                   }
//                 ],
//                 "sequential": true
//               },
//               {
//                 "name": "end",
//                 "sequential": true,
//                 "condition": true,
//                 "nodes": [
//                   {
//                     "name": "end",
//                     "ask": {
//                       "prompts": [
//                         ""
//                       ]
//                     },
//                     "input": {
//                       "end": true
//                     }
//                   }
//                 ]
//               }
//             ]
//           }
//         `
//   // @ts-ignore
//   let errors = await validate_hpml(host, some_hpml)
//   expect(errors.length).toBeGreaterThan(0)
//   // console.log(errors[0])
// })

// // })


// // describe("lgfs", () => {

// test("validate_lgf_expression/valid", async () => {
//   let res = await validate_lgf_expression(host, '1+1', 'int')
//   expect(res[0]).toBe(2)
// })

// test("validate_lgf_expression/invalid", async () => {
//   let res = await validate_lgf_expression(host, '1+foo', 'int')
//   // expect(res).toStrictEqual({ detail: { msg: 'Unknown variable: foo', type: 'expression_error' } })
//   expect(res).toEqual({ detail: { msg: 'Unknown variable: foo', type: 'expression_error' } })
// })

// // test("lgf_validation - post", () => {
// //   const options = {
// //     method: 'POST',
// //     url: 'https://compass-gw-qa01.happify.com/compass/lgf/validate/',
// //     params: { '': '' },
// //     headers: {
// //       'X-HappifyFamily-Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjo0MDAwMDAwMjUsInJvbGVzIjpbImFkbWluIiwic3RhZmYiXSwiZXhwIjoxNjcwMDgyOTA2fQ.QeV5qah8MYjgaGlWusB3r4azd4Mvhv3xEu0WY-hMSDQwg2dXA9ExboF1_nXbPxqU6vSEDRjfEkJMyeBq7RoUGggtU4qc0H4BZMVOc2_dua2I72fRa3sr7T0IzHcRd3wccxFhjDMfvBQNwIz7gjia3FYdjewKDpVt5FnPFp-u0Mu10ayfSV-E2vO3itfikGhA7vib4GKjgg-3UibwfcR2BmMbj1IJIcMcS4h8gWC61LA-d5ImaoUSZJeVSsY3uFvnlTL9YJKj7DJsvK-snmEo8SmlJ8fA18Sov5zhkYn-3eKKvWoq19-wwGURqu9AO6z8lWVLxhFYe9kSHma8RSsGaXJRb925S8i88vT2vtjzZWllATup-NrdsKdNRUxWfbH8bInC_2kvka6BCjfjUaImunnu7ISfDhYnCAjfMt5l_39XxZhoencxVOBgAkvZcX1CODmtNkOhdQVzxzoTG3X5mg3WMySh4LK3GyMlAVSFVbud77o8zgT-SFpcn00ME7cxqWJMoQ6WYZnX-bvl_4hUdGzUR0ZxtV4AUj6jejO4QgJ4pEbh7EurUgKIE4gGinMfAJr7gnuv4OFeL7rIqQfGgIBmU-P5qvxz8FmJOzNK23dTXgJKauKePln3nRjTqxJzULDdQAayUFNTrLX0474IjDsN1NR3d35iUsGy0RHjIwA',
// //       'Content-Type': 'application/json'
// //     },
// //     data: { source: '1+3', return_type: 'int', number_of_tests: 2 }
// //   };

// //   // @ts-ignore
// //   return axios.request(options).then(function (response) {
// //     console.log(response.data);
// //   }).catch(function (error) {
// //     console.error(error);
// //   });
// // })

// if (local_testing) {
//   // NOT OPEN ON GATEWAY
//   test("search_lgfs", async () => {
//     // @ts-ignore
//     let res = await search_lgfs(host, "gender")
//     expect(res.length).toBeGreaterThan(2)
//     expect(res.length).toBeLessThan(5)

//     // console.log(res)
//   })

//   // NOT OPEN ON GATEWAY
//   test("get_lgf_list", async () => {
//     // @ts-ignore
//     let res = await get_lgf_list(host)
//     expect(res.length).toBeGreaterThan(100)

//     // console.log(res)
//   })
// }

// // })


// // describe("value sets", () => {

// // test("get_value_set_list", async () => {
// //   // @ts-ignore
// //   let res = await get_value_set_list(host)
// //   // console.log(res.length)
// //   // console.log(res)
// //   expect(res.length).toBeGreaterThan(10)
// //   // console.log(res.map(x => `${x.name}: ${x.py_type} (${x.id})`).join('\n'))
// // })

// // test("get_value_set_by_name", async () => {
// //   let names = ['tr_stress', 'tr_bouncing']
// //   // @ts-ignore
// //   let res = await get_lgvs_by_name(host, names)
// //   // console.log(res.length)
// //   // console.log(res)
// //   expect(res.length).toBe(2)
// // })


// test("get_value_set_by_name", async () => {
//   let res = await get_value_set_by_name(host, "tr_stress")
//   // expect(res).toStrictEqual([{ "label": "Not at all", "value": 1 }, { "label": "A little", "value": 2 }, { "label": "Somewhat", "value": 3 }, { "label": "Very much", "value": 4 }])
//   expect(res).toEqual([{ "label": "Not at all", "value": 1 }, { "label": "A little", "value": 2 }, { "label": "Somewhat", "value": 3 }, { "label": "Very much", "value": 4 }])
// })

// test("get_value_set_by_name/nonexistent", async () => {
//   let res = await get_value_set_by_name(host, "bobby")
//   expect(res.length).toBe(0)
// })

// test("get_value_set_by_id", async () => {
//   let res = await get_value_set_by_id(host, 1)
//   // expect(res).toStrictEqual([
//   expect(res).toEqual([
//     { label: '18-24', value: 0 },
//     { label: '25-34', value: 1 },
//     { label: '35-44', value: 2 },
//     { label: '45-54', value: 3 },
//     { label: '55-64', value: 4 },
//     { label: '65 or older', value: 5 }
//   ])
// })

// test("get_value_set_by_id/nonexistent", async () => {
//   let res = await get_value_set_by_id(host, 9999)
//   expect(res.length).toBe(0)
// })

// /*
//   tr_age: int (1449)
//   tr_age_22plus: int (4635)
//   tr_age_hum: int (3357)
//   tr_age_uhc: int (3306)
//   tr_anthmed_insurance: str (4886)
//   tr_anthmed_insurance_name: str (4887)
//   tr_sncl_gender: int (4791)
//   tr_sncl_race: str (4790)
//   tr_social: int (1459)
//   tr_stress: int (1458)
//   tr_stress_ra: int (4546)
// */

// //   })

// // })
