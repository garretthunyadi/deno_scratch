
import { isSecondaryAction, Requirement } from "./base_yarn.ts"

import { R } from "../../deps.ts"

export type ClassifierName
    = 'A-Goal' | 'A-Meaning' | 'A-Optimism' | 'agency' | 'causal'
    | 'E-Interaction' | 'E-Perspective' | 'E-Self' | 'G-Activity'
    | 'G-Forgive' | 'G-Person' | 'meaning' | 'pos_neg_neutral'
    | 'robinson_emotions' | 'robinson_types' | 'S-CBT' | 'S-Item'
    | 'S-Meditation' | 'S-Relationship' | 'self_efficacy' | 'self_other_harm'
    | 'self_vs_other_focus1' | 'senses' | 'senses_yn' | 'situation'
    | 'specific' | 'T-Express' | 'T-Reflect' | 'time_orientation'

/*
specific: general, specific
meaning:  meaningful, trivial
*/
let isClassificationRequirement = R.curry((_class: string, req: Requirement): boolean => {
    return Array.isArray(req) && req.length === 2 && req[0] === _class && isSecondaryAction(req[1])
})

export let isPositiveRequirement = isClassificationRequirement('positive')
export let isNegativeRequirement = isClassificationRequirement('negative')
export let isNeutralRequirement = isClassificationRequirement('neutral')

let _isSpecificClassifierRequirement = isClassificationRequirement('specific')
// let isSelfEfficacyClassifierRequirement = isClassificationRequirement('self_efficacy')
// let isSelfOtherHarmClassifierRequirement = isClassificationRequirement('self_other_harm')
// let isSelfVsOtherFocus1ClassifierRequirement = isClassificationRequirement('self_vs_other_focus1')
// let isSensesClassifierRequirement = isClassificationRequirement('senses')
// let isSensesYnClassifierRequirement = isClassificationRequirement('senses_yn')
// let isSituationClassifierRequirement = isClassificationRequirement('situation')
// let isTimeOrientationClassifierRequirement = isClassificationRequirement('time_orientation')
// let isAgencyClassifierRequirement = isClassificationRequirement('agency')
// let isCausalClassifierRequirement = isClassificationRequirement('causal')
// let isAGoalClassifierRequirement = isClassificationRequirement('A-Goal')
// let isAMeaningClassifierRequirement = isClassificationRequirement('A-Meaning')
// let isAOptimismClassifierRequirement = isClassificationRequirement('A-Optimism')
// let isEInteractionClassifierRequirement = isClassificationRequirement('E-Interaction')
// let isEPerspectiveClassifierRequirement = isClassificationRequirement('E-Perspective')
// let isESelfClassifierRequirement = isClassificationRequirement('E-Self')
// let isGActivityClassifierRequirement = isClassificationRequirement('G-Activity')
// let isGForgiveClassifierRequirement = isClassificationRequirement('G-Forgive')
// let isGPersonClassifierRequirement = isClassificationRequirement('G-Person')
// let isMeaningClassifierRequirement = isClassificationRequirement('meaning')
// let isRobinsonEmotionsClassifierRequirement = isClassificationRequirement('robinson_emotions')
// let isRobinsonTypesClassifierRequirement = isClassificationRequirement('robinson_types')
// let isSCBTClassifierRequirement = isClassificationRequirement('S-CBT')
// let isSItemClassifierRequirement = isClassificationRequirement('S-Item')
// let isSMeditationClassifierRequirement = isClassificationRequirement('S-Meditation')
// let isSRelationshipClassifierRequirement = isClassificationRequirement('S-Relationship')
