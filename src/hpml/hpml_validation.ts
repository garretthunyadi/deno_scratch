export type HpmlValudationError = string
export function validate(hpml: object): HpmlValudationError[] {
    let errors: HpmlValudationError[] = []
    //     Path: context
    // HPML Error: Array can not be empty

    // xPath: sections(hello).nodes
    // Value: {'name': 'hello', 'ask': {'prompts': ['hello']}}
    // HPML Error: Value '{'name': 'hello', 'ask': {'prompts': ['hello']}}' has incorrect type Object. Must be Array

    // Path: context(0).local_vars
    // Value: {}
    // HPML Error: Value '{}' has incorrect type Object. Must be Array

    // xPath: sections(hello).nodes
    // Value: {'name': 'hello', 'ask': {'prompts': ['hello']}}
    // HPML Error: Value '{'name': 'hello', 'ask': {'prompts': ['hello']}}' has incorrect type Object. Must be Array

    //     Path: context(0).local_vars(_ans).type
    // Value: 'string'
    // HPML Error: Unknown type: 'string'. Must be one of: str, int, float, bool, date, list, dict, set, Arrow, DialogSensor, TimeSeriesValue, AggTimeSeriesValue, TSVContext

    // Path: context(0).local_vars(_ans).value
    // Value: ''
    // Expression Error: ExpressionError: Invalid expression, must be non-empty string
    //    Note: needs to be "''" instead of ""

    // Path: sections(hello).nodes(hello)
    // Value: {'name': 'hello', 'ask': {'prompts': ['hello']}}
    // HPML Error: Keys 'ask' and 'input' are required for Full nodes

    /*
        Path: context(0).local_vars(whats_your_name_answer).name
    Value: 'whats_your_name_answer'
    HPML Error: Invalid Lifegraph Variable name: 'whats_your_name_answer'. Must start with _ (underscore) and can contain lowercase chars a-z, numbers 0-9 or _
    
    
    HPML Error: Keys 'ask' and 'input' are required for Full nodes

    HPML Error: Unknown type: 'multiple_string'. Must be one of: str, int, float, bool, date, list, dict, set, Arrow, DialogSensor, TimeSeriesValue, AggTimeSeriesValue, TSVContext

    */
    return errors
}