import I18n from "i18n-js"
import * as RNLocalize from "react-native-localize"
import en from "./locales/en"
import fr from "./locales/fr"

const locales = RNLocalize.getLocales();

if (Array.isArray(locales) && locales.length > 0) {
  I18n.locale = locales[0].languageTag;
}

I18n.fallbacks = true;
I18n.translations = {
  en,
  fr
};

class Translator {
  lineReturn = '\n'

  t(path, args) {
    let translation =  I18n.t(path, args)

    return translation && translation.replace ? translation.replace(/~{\/n}/g, this.lineReturn) : null
  }

  lines(path, args, callback) {
    
    let translation = this.t(path, args)

    let lines = translation.split(this.lineReturn)
    
    for(var i in lines) {
      lines[i] = callback(lines[i], i)
    }

    return lines
  }
}

const translator = new Translator

export default translator