export default (str) => {

    str = str ? str.replace(/\D/g,'').toString() : null

    if(str && str.length == 10) {
        str = str.substr(1)
    }

    if(!str.startsWith('33')) str = '33' + str

    return str;
}