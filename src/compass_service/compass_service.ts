
// import axios, { Method } from "axios";
import { VarType } from "../hpml/hpml.ts";
// const qs = require('qs');
import { stringify } from '../../deps.ts'

let service_access_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjo0MDAwMDAwMjUsInJvbGVzIjpbImFkbWluIiwic3RhZmYiXSwiZXhwIjoxNjcwMDgyOTA2fQ.QeV5qah8MYjgaGlWusB3r4azd4Mvhv3xEu0WY-hMSDQwg2dXA9ExboF1_nXbPxqU6vSEDRjfEkJMyeBq7RoUGggtU4qc0H4BZMVOc2_dua2I72fRa3sr7T0IzHcRd3wccxFhjDMfvBQNwIz7gjia3FYdjewKDpVt5FnPFp-u0Mu10ayfSV-E2vO3itfikGhA7vib4GKjgg-3UibwfcR2BmMbj1IJIcMcS4h8gWC61LA-d5ImaoUSZJeVSsY3uFvnlTL9YJKj7DJsvK-snmEo8SmlJ8fA18Sov5zhkYn-3eKKvWoq19-wwGURqu9AO6z8lWVLxhFYe9kSHma8RSsGaXJRb925S8i88vT2vtjzZWllATup-NrdsKdNRUxWfbH8bInC_2kvka6BCjfjUaImunnu7ISfDhYnCAjfMt5l_39XxZhoencxVOBgAkvZcX1CODmtNkOhdQVzxzoTG3X5mg3WMySh4LK3GyMlAVSFVbud77o8zgT-SFpcn00ME7cxqWJMoQ6WYZnX-bvl_4hUdGzUR0ZxtV4AUj6jejO4QgJ4pEbh7EurUgKIE4gGinMfAJr7gnuv4OFeL7rIqQfGgIBmU-P5qvxz8FmJOzNK23dTXgJKauKePln3nRjTqxJzULDdQAayUFNTrLX0474IjDsN1NR3d35iUsGy0RHjIwA'
// let QA01_HOST = 'compass-gw-qa01.happify.com'
let DEFAULT_LOCALE = 'en_US'

// //var R = require('ramda');
import { R } from '../../deps.ts'

// const FormData = require('form-data');

type Method = 'get' | 'post'

const url_base = (host: string) => host.includes('happify.com') ? `https://${host}/compass` : 'http://' + host

function compass_request_spec(host: string, method: Method, request: string, locale: string, additional_params?: object) {
    let params = R.mergeRight({ locale }, additional_params)

    return {
        method,
        params,
        // url: `https://${host}/compass/${request}/?locale=${locale}`,
        url: `${url_base(host)}/${request}`,
        //url: `https://postman-echo.com/get/?locale=${locale}`,
        headers: { 'X-HappifyFamily-Authorization': service_access_key },
        paramsSerializer: function (params: object) {
            return stringify(params, { arrayFormat: 'repeat' })
        }
    }
}

// function compass_request(request_spec: any) { return axios.request(request_spec) }
async function compass_request({ url, headers }: any) {
    const response = await fetch(url, {
        headers,
    });
    console.log(response.status);  // e.g. 200
    console.log(response.statusText); // e.g. "OK"
    const jsonData = await response.json()
    return jsonData
    // fetch(request_spec.url, {
    //     method: request_spec.method,
    //     headers: request_spec.headers,
    //     body: request_spec.paramsSerializer(request_spec.params)
    // })
    //     .then(res => res.json())
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err))
}


export async function get_lgv_list(host: string, locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'vars/list/', locale)
    // p(req)
    let res = await compass_request(req)
    // console.log(res)
    return res
}

export async function get_lgvs_by_id(host: string, ids: number[], locale = DEFAULT_LOCALE) {
    try {
        let req = compass_request_spec(host, 'get', 'vars/list/', locale, { ids })
        let res = await compass_request(req)
        // console.log(res)
        return res.data
    } catch (e) {
        // console.log(e)
        return undefined
    }
}

export async function get_lgv_by_id(host: string, id: number, locale = DEFAULT_LOCALE) {
    let res = await get_lgvs_by_id(host, [id], locale)
    if (res?.length > 0) {
        return res[0]
    }
    return res
}

export async function get_lgvs_by_name(host: string, names: string[], locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'vars/', locale, { names })
    // p(req)
    let res = await compass_request(req)
    // console.log(res)
    return res.data
}

export async function get_lgv_by_name(host: string, name: string, locale = DEFAULT_LOCALE) {
    let res = await get_lgvs_by_name(host, [name], locale)
    // console.log(res)
    if (res.length > 0) {
        return res[0]
    }
    return res // TODO: error policy?
}

export async function get_value_set_by_id(host: string, id: number, locale = DEFAULT_LOCALE) {
    try {
        let req = compass_request_spec(host, 'get', 'vars/allowed_values/', locale, { id })
        let res = await compass_request(req)
        // console.log(res.data)
        return res.data
    } catch (e) {
        // console.log(e)
        return undefined
    }
}

export async function get_value_set_by_name(host: string, name: string, locale = DEFAULT_LOCALE) {
    try {
        let req = compass_request_spec(host, 'get', 'vars/allowed_values/', locale, { name })
        let res = await compass_request(req)
        // console.log(res.data)
        return res.data
    } catch (e) {
        // console.log(e)
        return undefined
    }
}


// no way to do this?!?
// export async function get_lgf_list(host: string, locale = DEFAULT_LOCALE) {
//     let req = compass_request_spec(host, 'get', 'lgf/list', locale)
//     let res = await compass_request(req)
//     return res.data
// }

// this is not anabled on QA01
export async function get_lgf_list(host: string, locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf/search', locale, {})
    let res = await compass_request(req)
    return res.data
}

// this is not anabled on QA01
export async function search_lgfs(host: string, partial_name = '', limit = '100', locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf/search', locale, { partial_name, limit })
    let res = await compass_request(req)
    return res.data
}


export async function get_lgfs_by_name(host: string, names: string[], locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf/list/', locale, { names })
    let res = await compass_request(req)
    return res.data
}
/*
export async function get_lgfs_by_id(host: string, lgf_ids: number[], locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf/list', locale)
    let res = await compass_request(req)
    return res.data
}

export async function get_lgfs_by_id(host: string, lgf_id: string, locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf', locale)
    let res = await compass_request(req)
    return res.data
}

export async function get_lgf_by_id(host: string, lgf_id: string, locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'lgf', locale)
    let res = await compass_request(req)
    return res.data
}

*/

export async function get_dialog_info(host: string, dialog_id: string, locale = DEFAULT_LOCALE) {
    let req = compass_request_spec(host, 'get', 'dialog/by/', locale, { id: dialog_id })
    // p(req)
    let res = await compass_request(req)
    return res.data
}

// export async function validate_hpml(host: string, hpml: string, locale = DEFAULT_LOCALE) {
//     let form_data: FormData = new FormData()
//     form_data.append('locale', locale)
//     const buffer = Buffer.from(hpml);
//     // @ts-ignore
//     form_data.append('file', buffer, 'file');

//     let req = compass_request_spec(host, 'post', 'validate/hpml/', locale)
//     // @ts-ignore
//     req.headers = { ...form_data.getHeaders(), ...req.headers }
//     // @ts-ignore
//     req.data = form_data

//     // @ts-ignore
//     // let res = await axios.post(`${url_base(host)}/validate/hpml/`, form_data, { headers: headers })
//     let res = await compass_request(req)
//     // console.log(res.data)
//     return res.data.errors
// }
export async function validate_hpml(host: string, hpml: string, locale = DEFAULT_LOCALE) {
    return [] // TODO
}


export async function validate_lgf_expression(host: string, lgf_expr: string, return_type: VarType, locale = DEFAULT_LOCALE) {
    try {
        let req = compass_request_spec(host, 'post', 'lgf/validate/', locale)
        // @ts-ignore
        req.data = { source: lgf_expr, return_type, number_of_tests: 1 }
        let res = await compass_request(req)
        // console.log(res.data)
        return res.data.results
    } catch (e) {
        // @ts-ignore
        if (e.response?.status === 422) { return e.response.data }
        // @ts-ignore
        return e.response
    }
}
