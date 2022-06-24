import { hpmlDialogFromJson } from './hpml.ts'
import { readJsonFromFile } from '../Utils/utils.ts'
import { expect } from '../../deps.ts'
const test = Deno.test

// test('json dialog structure', () => {
//     let json = readJsonFromFile('./examples/Anxiety-Setbacks-and-Steps-Forward_v32.json')
//     expect(json['description']).toBe("Activity 3, Part 2, CNT")
//     expect(json['context'][1]['include']['dialog']).toBe("Threshold-Source-Code")
//     expect(json['context'][2]['folder']).toBe("intro")
//     expect(json['context'][2]['variables'][2]['name']).toBe("person_statement")

//     expect(json['handler_sections'][2]['include']['handler_section']).toBe('faq')

//     expect(json['sections'][0]['name']).toBe('intro')
//     expect(json['sections'][0]['nodes'][0]['ask']['prompts'][0]).toBe("We all have setbacks and adversities in our past that bring up negative thoughts for us.")
// })

// test('basic read into Hpml', () => {
//     let json = readJsonFromFile('./examples/Anxiety-Setbacks-and-Steps-Forward_v32.json')
//     let d = hpmlDialogFromJson(json)!
//     expect(d).toBeDefined()
//     expect(d.name).toBe("Setbacks and Steps Forward")
//     expect(d.description).toBe("Activity 3, Part 2, CNT")
//     expect(d.context).toBeDefined()
//     expect(d.context.length).toBe(3)
//     expect(d.handler_sections.length).toBe(7)
// })

// test('dynamic construction of paths', () => {
//     let json = readJsonFromFile('./examples/Anxiety-Setbacks-and-Steps-Forward_v32.json')
//     let d = hpmlDialogFromJson(json)!
//     expect(d).toBeDefined()
//     expect(json['context'][2]['folder']).toBe("intro")
// })


