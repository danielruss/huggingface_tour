import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";
window.pipeline = pipeline


console.log(`===============\nTransformers.js\nversion: ${env.version}\nonnx version: ${env.backends.onnx.versions.web}\n===============`)
env.allowLocalModels = false;

const translation_pipeline = await pipeline("translation", 'Xenova/nllb-200-distilled-600M');
const langs = {
    en: "eng_Latn",
    es: "spa_Latn",
    fr: "fra_Latn",
    nl: "nld_Latn",
    pt: "por_Latn",
    he: "heb_Hebr",
}

const translation_pipeline2 = await pipeline("translation", 'Xenova/m2m100_418M');
const langs2 = {
    en: "en",
    es: "es",
    fr: "fr",
    nl: "nl",
    pt: "pt",
    he: "he",
}


async function translate_text(event) {
    // get the HTML elements that I am going to get text from and fill
    let src_text_element = document.getElementById("source_text");
    let tgt_text_element = document.getElementById("target_text");

    // if you didn't give text, just return...
    let src_text = src_text_element.value.trim();
    if (src_text.length == 0) return
    console.log(src_text)

    // get the input/output language
    const src_lang = document.getElementById("source_language").value
    const tgt_lang = document.getElementById("target_language").value
    console.log(`${src_lang} [${langs[src_lang]}, ${langs2[src_lang]}]--> ${tgt_lang} [${langs[tgt_lang]}, ${langs2[tgt_lang]}]`)


    // translate the text twice
    // Once with Xenova/nllb-200-distilled-600M
    console.time("time to translate text")
    const result = await translation_pipeline(src_text, {
        src_lang: langs[src_lang],
        tgt_lang: langs[tgt_lang]
    })
    console.timeEnd("time to translate text")

    // and once with Xenova/m2m100_418M
    console.time("time to translate text2")
    const result2 = await translation_pipeline2(src_text, {
        src_lang: langs2[src_lang],
        tgt_lang: langs2[tgt_lang]
    })
    console.timeEnd("time to translate text2")
    // cannot await both promises... Onnx session failure.
    //let res = await Promise.all([result, result2])
    let res = [result, result2]


    tgt_text_element.value = 'Xenova/nllb-200-distilled-600M:\n' + res[0][0].translation_text + '\n\nXenova/m2m100_418M:\n' + res[1][0].translation_text;
}


/**
 * Checks that the source and target languages
 * are not the same.
 */
function check_input(event) {
    let eventTargetElement = document.getElementById((event?.target.id == "target_language") ? "target_language" : "source_language")
    let otherElement = document.getElementById((eventTargetElement.id == "source_language") ? "target_language" : "source_language")
    console.log(`selected element: ${eventTargetElement.id}`)
    console.log(`other element: ${otherElement.id}`)



    if (eventTargetElement.value == otherElement.value) {
        otherElement.value = (eventTargetElement.value != "en" ? "en" : "es")
    }

}

/* when you start up or change the source/target language, check the languages are different */
document.getElementById("source_language").addEventListener("change", check_input)
document.getElementById("target_language").addEventListener("change", check_input)
check_input()

document.getElementById("translate_button").addEventListener("click", translate_text)