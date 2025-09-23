const LANGUAGES = [
    {code: "bo", name: "Tibetan"},
    {code: "en", name: "English"},
    {code: "zh", name: "Chinese"},
    {code: "es", name: "Spanish"},
    {code: "fr", name: "French"},
    {code: "de", name: "German"},
    {code: "ja", name: "Japanese"},
    {code: "ko", name: "Korean"},
    {code: "hi", name: "Hindi"},
    {code: "ar", name: "Arabic"},
    {code: "pt", name: "Portuguese"},
    {code: "ru", name: "Russian"},
    {code: "it", name: "Italian"},
    {code: "nl", name: "Dutch"},
    {code: "sv", name: "Swedish"},
    {code: "no", name: "Norwegian"},
    {code: "da", name: "Danish"},
    {code: "fi", name: "Finnish"},
    {code: "pl", name: "Polish"},
    {code: "tr", name: "Turkish"},
    {code: "th", name: "Thai"},
    {code: "vi", name: "Vietnamese"},
]

const getLanguageName = (code: string) => {
    return LANGUAGES.find(language => language.code === code)?.name;
}

export { LANGUAGES, getLanguageName };