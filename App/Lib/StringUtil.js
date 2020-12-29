export default {
    trim(string, maxLength, endChars) {
        if(!endChars) endChars = '...'

        return string && string.length > maxLength ? 
                    string.substring(0, maxLength - 3) + endChars : 
                    string;
    }
}