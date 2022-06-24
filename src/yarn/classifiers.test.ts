import { jlog, p, print } from "../Utils/utils.ts";
import { BaseYarn } from "./base_yarn.ts";
import { baseYarnsToHpmlSections, baseYarnNodeToHpmlNode, baseYarnSectionToHpmlSection } from "./base2hpml.ts";
import { isPositiveRequirement } from "./classifiers.ts";
import { expect } from '../../deps.ts'
const test = Deno.test

test("isPositiveRequirement", () => {
    expect(isPositiveRequirement(['positive', { say: "Whoo!" }])).toBe(true)
    expect(isPositiveRequirement(['positive', {}])).toBe(false)
    expect(isPositiveRequirement(['negative', { say: "Whoo!" }])).toBe(false)
    expect(isPositiveRequirement([{}, { say: "Whoo!" }])).toBe(false)
    expect(isPositiveRequirement(undefined)).toBe(false)
    expect(isPositiveRequirement(null)).toBe(false)
    expect(isPositiveRequirement([{}])).toBe(false)
    expect(isPositiveRequirement(['positive'])).toBe(false)
})
