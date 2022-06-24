import { SugarYarn } from "../sugar_yarn.ts";
import { yarn2Hpml_Debug } from "../yarn.ts";
/*
describe("audio", () => {
    test("basic", () => {
        let yarn: SugarYarn[] = [
            { audio: "some_audio" }
        ]
        let res = yarn2Hpml_Debug(yarn, {})

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_audio",
            audio: "some_audio",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_audio",
            ask: { prompts: [""], },
            input: { audio: { media: "some_audio" } },
        })
    })

    test("with cover", () => {
        let yarn: SugarYarn[] = [
            { audio: "some_audio", cover: "some_cover" }
        ]
        let res = yarn2Hpml_Debug(yarn, {})

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_audio",
            audio: "some_audio",
            cover: "some_cover",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_audio",
            ask: { prompts: [""], },
            input: { audio: { media: "some_audio", cover: "some_cover" } },
        })
    })
    test("w lookup", () => {
        let yarn: SugarYarn[] = [
            { audio: "some_audio", cover: "some_cover" }
        ]
        let res = yarn2Hpml_Debug(yarn, { some_audio: "some_mp3_url", some_cover: "some_image_url" })

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_audio",
            audio: "some_mp3_url",
            cover: "some_image_url",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_audio",
            ask: { prompts: [""], },
            input: { audio: { media: "some_mp3_url", cover: "some_image_url" } },
        })

    })

})

describe("video", () => {
    test("basic", () => {
        let yarn: SugarYarn[] = [
            { video: "some_video" }
        ]
        let res = yarn2Hpml_Debug(yarn, {})

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_video",
            video: "some_video",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_video",
            ask: { prompts: [""], },
            input: { video: { media: "some_video" } },
        })
    })

    test("with cover", () => {
        let yarn: SugarYarn[] = [
            { video: "some_video", cover: "some_cover" }
        ]
        let res = yarn2Hpml_Debug(yarn, {})

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_video",
            video: "some_video",
            cover: "some_cover",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_video",
            ask: { prompts: [""], },
            input: { video: { media: "some_video", cover: "some_cover" } },
        })
    })
    test("w lookup", () => {
        let yarn: SugarYarn[] = [
            { video: "some_video", cover: "some_cover" }
        ]
        let res = yarn2Hpml_Debug(yarn, { some_video: "some_mp3_url", some_cover: "some_image_url" })

        expect(res.baseYarn[1]).toStrictEqual({
            name: "some_video",
            video: "some_mp3_url",
            cover: "some_image_url",
        })

        expect(res.sections[0].nodes[0]).toStrictEqual({
            name: "some_video",
            ask: { prompts: [""], },
            input: { video: { media: "some_mp3_url", cover: "some_image_url" } },
        })

    })

})
*/