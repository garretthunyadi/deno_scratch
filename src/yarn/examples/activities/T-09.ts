/**
* @jest-environment node
*/
import { LookupTable } from "../../lookups.ts"
import { SugarYarn } from "../../sugar_yarn.ts"
import { Lgv, Var } from "../../../hpml/hpml.ts"
import { ClassifierName } from "../../classifiers.ts"

import { R } from '../../../../deps.ts'

// hpml that will give the top class if above the threshold, or 'undetermined'
let topSensorClassHpml = R.curry((classifier: ClassifierName, threshold: number, variable: string): string => {
  return `nlc('${classifier}', ${variable})['top_class'] if nlc('${classifier}',${variable})['classes'][0]['confidence'] > ${threshold} else 'undetermined'`
})

let OLD_THRESHOLD_LOOKUPS: LookupTable = { _emotvalence_threshold: 0.65, _emotvalencemin_threshold: 0.45, _emotkind_threshold: 0.28, _emotname_threshold: 0.52, nlc_emotname_threshold: 0.52, _emotname2_threshold: 0.5, _meaning_threshold: 0.55, _meaning2_threshold: 0.8, _sensesyn_threshold: 0.55, _sense_threshold: 0.5, _senses_threshold: 0.22, _specificity_threshold: 0.56, _focus_threshold: 0.5, _tense_threshold: 0.5, _agency_threshold: 0.5, _energy_threshold: 0.57, _causal_threshold: 0.65, _situation_threshold: 0.27, _mirror_threshold: 0.42, }

let pnnTopClassFor = topSensorClassHpml('pos_neg_neutral', OLD_THRESHOLD_LOOKUPS._emotvalence_threshold as number)

// general, specific
let specificTopClassFor = topSensorClassHpml('specific', OLD_THRESHOLD_LOOKUPS._specificity_threshold as number)

// meaningful, trivial
let meaningTopClassFor = topSensorClassHpml('meaning', OLD_THRESHOLD_LOOKUPS._meaning_threshold as number)


let SENSOR_LOOKUPS: LookupTable = {
  "pos_neg_neut_top_class": pnnTopClassFor("_last_text_input"),
  "meaningful_top_class": meaningTopClassFor("_last_text_input"),
  "specific_top_class": specificTopClassFor("_last_text_input"),
  "not_positive?": "({pos_neg_neut_top_class}) != 'positive'",
  "not_meaningful?": "({meaningful_top_class}) != 'meaningful'",
  "not_specific?": "({specific_top_class}) == 'specific'",
}

export let dialog_data: { dialog: string, lookups: LookupTable, items: SugarYarn[], lgvs: Lgv[], vars: Var[] } =
{
  dialog: "T-09-example",
  lookups: {
    ...SENSOR_LOOKUPS, ...OLD_THRESHOLD_LOOKUPS,
    "How are you?": "How ya doin'?",
    "pos_neg_neut_top_class": pnnTopClassFor("_how_are_you_question_answer"),
  },
  items: [
    // { ask: "How are you?" },
    // { if: "is_positive", say: "Good to hear!" },
    // { if: "is_negative", say: "Oh, I'm sorry to hear that." },
    // { say: "ok, let's get on with it..." },
    // { goto: "intro" },
    {
      "section": "Introduction"
    },
    {
      "say": "explain the benefit of daily gratitude"
    },
    {
      "section": "What are you grateful for?"
    },
    {
      "ask": "What are you grateful for?",
      "into_lgv": "t_09_gratitude_statement",
      "require": [
        [
          "enough_text",
          {
            "say": "Tell me a bit more about what you appreciate.  Sharing more details will help you hone in on what fills you with gratitude."
          }
        ],
        [
          "surity",
          {
            "say": "If you're having trouble, take a look around. What makes you happy? Perhaps the view from your window, your favorite piece of furniture, or a supportive friend fills you with joy."
          }
        ]
      ],
    },
    {
      "section": "Not specific enough",
      "if": "not_specific?"
    },
    {
      "ask": "Paint me a mental picture. Use as many details as you can remember.",
      "into_lgv": "t_09_gratitude_statement",
    },
    {
      "ask": "Why did you choose this particular positive aspect to recall?",
      "if": "not_specific?",
      "into_lgv": "t_09_gratitude_statement",
    },
    {
      "say": "Let's move on...",
      "if": "not_specific?"
    },
    {
      "section": "Not meaningful",
      "if": "not_meaningful?"
    },
    {
      "ask": "Tell me why this part of your life is meaningful.",
      "into_lgv": "t_09_gratitude_statement",
    },
    {
      "ask": "Why is this meaningful to your life?",
      "if": "not_meaningful?",
      "into_lgv": "t_09_gratitude_statement",
    },
    {
      "section": "Not positive",
      "if": "not_positive?"
    },
    {
      "name": "positive_statement",
      "ask": "When you think about the gratitude you feel, what emotions does it bring up?",
      "into_lgv": "t_09_gratitude_statement",

    },
    {
      "name": "gratitude_statement_more",
      "ask": "Tell me a bit about the positive impact this has on you.",
      "if": "not_positive?"
    },
    {
      "section": "Elaborate"
    },
    {
      "say": "Let's identify the cause of the gratitude"
    },
    {
      "ask": "How did this good thing come about?",
      "into_lgv": "t_09_gratitude_statement_cause",
      "require": [
        [
          "surity",
          {
            "say": "Keep it simple. If you're thankful for a friend, maybe you were brought together by the values you share. What made this source of gratitude happen?"
          }
        ],
        [
          "long_enough?",
          {
            "say": "To really maximize the benefits of gratitude, the key is to reflect on the details of how this came to pass. Share a bit more about why this might have happened."
          }
        ]
      ]
    },
    {
      "section": "Reflection"
    },
    {
      "say": "reflection on {t_09_gratitude_statement}"
    }

  ],
  lgvs: [
  ],
  vars: [
    { name: "_how_are_you_question_answer", type: "str" },
    { name: "_gratitude_statement_more_answer", type: "str" },
    // { name: "_what_emotions_does_it_bring_up_question_answer", type: "str" },
    // { name: "_tell_me_a_bit_about_the_positive_impact_this_has_on_you__answer", type: "str" },
  ],
}


/*

{
  "dialog": "T-09: Today's grateful moment",
  "implementationLookup": {
    "enough_text": "enough_text",
    "surity": "surity",
    "long_enough?": "long_enough?",
    "neither_positive_nor_specific?": "{not positive(_ans) and not specific(_ans)}"
  },
  "lookups": {
    "root": {
      "lookupTitle": "default",
      "lookupTable": {
        "What are you grateful for?": [
          "What springs to mind?"
        ],
        "explain the benefit of daily gratitude": [
          "There's a powerful tool you can use every day to boost your mood.",
          "It costs nothing and takes only minutes. That amazing elixir? It's gratitude! Research shows it can decrease stress while helping us feel more positive about life.",
          {
            "say": "In this exercise, you'll identify something or someone you're grateful for and bask in the positive rays of appreciation.",
            "ack": "Let's do it!"
          },
          "Okay. Start by thinking of something today (this week, this month, or this year!) that you're thankful for. Big or small, anything goes."
        ],
        "[\"There's a powerful tool you can use every day to boost your mood.\",\"It costs nothing and takes only minutes. That amazing elixir? It's gratitude! Research shows it can decrease stress while helping us feel more positive about life.\",{\"say\":\"In this exercise, you'll identify something or someone you're grateful for and bask in the positive rays of appreciation.\",\"ack\":\"Let's do it!\"}]": [
          "There's a powerful tool you can use every day to boost your mood.",
          "It costs nothing and takes only minutes. That amazing elixir? It's gratitude! Research shows it can decrease stress while helping us feel more positive about life.",
          {
            "say": "In this exercise, you'll identify something or someone you're grateful for and bask in the positive rays of appreciation.",
            "ack": "Let's do it!"
          }
        ],
        "Tell me a bit more about what you appreciate.  Sharing more details will help you hone in on what fills you with gratitude.": "Tell me a bit more about what you appreciate.  Sharing more details will help you hone in on what fills you with gratitude.",
        "Paint me a mental picture. Use as many details as you can remember.": "Paint me a mental picture. Use as many details as you can remember.",
        "reflection on {t_09_gratitude_statement}": [
          "Nice work!",
          "Now, let's look back on what we worked on today.",
          "You identified something or someone you're grateful for today",
          "{t_09_gratitude_statement}",
          "And to really feel the power of gratitude, you reflected on how this may have happened."
        ],
        "Why did you choose this particular positive aspect to recall?": "Why did you choose this particular positive aspect to recall?",
        "Let's move on...": "Let's move on...",
        "If you're having trouble, take a look around. What makes you happy? Perhaps the view from your window, your favorite piece of furniture, or a supportive friend fills you with joy.": "If you're having trouble, take a look around. What makes you happy? Perhaps the view from your window, your favorite piece of furniture, or a supportive friend fills you with joy.",
        "When you think about the gratitude you feel, what emotions does it bring up?": "When you think about the gratitude you feel, what emotions does it bring up?",
        "Tell me a bit about the positive impact this has on you.": "Tell me a bit about the positive impact this has on you.",
        "Okay! Now let's take this a step further.": "Okay! Now let's take this a step further.",
        "(let's identify the cause of the gratitude)": [
          "Okay! Now let's take this a step further.",
          "Studies show that identifying the cause of our gratitude is just as important as what we're grateful for.  It could be your own efforts paying off, the positive impact of another, or something else."
        ],
        "(how did this good thing come about?)": [
          "In a few sentences, describe how this came about."
        ],
        "t_09_gratitude_statement_cause": "t_09_gratitude_statement_cause",
        "Keep it simple. If you're thankful for a friend, maybe you were brought together by the values you share. What made this source of gratitude happen?": "Keep it simple. If you're thankful for a friend, maybe you were brought together by the values you share. What made this source of gratitude happen?",
        "To really maximize the benefits of gratitude, the key is to reflect on the details of how this came to pass. Share a bit more about why this might have happened.": "To really maximize the benefits of gratitude, the key is to reflect on the details of how this came to pass. Share a bit more about why this might have happened.",
        "Nice work!": "Nice work!"
      }
    },
    "children": []
  },
  "items": [
    {
      "section": "Introduction"
    },
    {
      "say": "explain the benefit of daily gratitude"
    },
    {
      "section": "What are you grateful for?"
    },
    {
      "ask": "What are you grateful for?",
      "into_lgv": "t_09_gratitude_statement",
      "require": [
        [
          "enough_text",
          {
            "say": "Tell me a bit more about what you appreciate.  Sharing more details will help you hone in on what fills you with gratitude."
          }
        ],
        [
          "surity",
          {
            "say": "If you're having trouble, take a look around. What makes you happy? Perhaps the view from your window, your favorite piece of furniture, or a supportive friend fills you with joy."
          }
        ]
      ],
      "isLocked": false
    },
    {
      "section": "Not specific enough",
      "if": "not_specific?"
    },
    {
      "ask": "Paint me a mental picture. Use as many details as you can remember.",
      "into_lgv": "t_09_gratitude_statement",
      "isLocked": false
    },
    {
      "ask": "Why did you choose this particular positive aspect to recall?",
      "if": "not_specific?",
      "into_lgv": "t_09_gratitude_statement",
      "isLocked": false
    },
    {
      "say": "Let's move on...",
      "if": "not_specific?"
    },
    {
      "section": "Not meaningful",
      "if": "not_meaningful?"
    },
    {
      "ask": "Tell me why this part of your life is meaningful.",
      "into_lgv": "t_09_gratitude_statement",
      "isLocked": false
    },
    {
      "ask": "",
      "if": "not_meaningful?",
      "into_lgv": "t_09_gratitude_statement",
      "isLocked": false
    },
    {
      "section": "Not positive",
      "if": "not_positive?"
    },
    {
      "ask": "When you think about the gratitude you feel, what emotions does it bring up?"
    },
    {
      "ask": "Tell me a bit about the positive impact this has on you.",
      "if": "not_positive?"
    },
    {
      "section": "Elaborate"
    },
    {
      "say": "(let's identify the cause of the gratitude)"
    },
    {
      "ask": "(how did this good thing come about?)",
      "into_lgv": "t_09_gratitude_statement_cause",
      "require": [
        [
          "surity",
          {
            "say": "Keep it simple. If you're thankful for a friend, maybe you were brought together by the values you share. What made this source of gratitude happen?"
          }
        ],
        [
          "long_enough?",
          {
            "say": "To really maximize the benefits of gratitude, the key is to reflect on the details of how this came to pass. Share a bit more about why this might have happened."
          }
        ]
      ]
    },
    {
      "section": "Reflection"
    },
    {
      "say": "reflection on {t_09_gratitude_statement}"
    }
  ]
}


*/