import 'moment/locale/fr'
import AppConfig from '../Config/AppConfig';

var moment = require('moment');

class Time {
    moment(date) {
        return moment(date).lang(AppConfig.lang)
    } 

    datediff(first, second) {
        return Math.round((second - first) / (1000 * 60 * 60 * 12) - 1);
    }

    formatMessage(timestamp) {
        if(!timestamp) return
        
        var date = new Date(timestamp);

        var lastTime_msg = '';
        
        if (this.datediff(date, new Date()) < 1) {
          lastTime_msg = this.moment(date).format("HH:mm");
        } else {
          lastTime_msg = this.moment(date).format("ddd HH:mm");
        }

        return lastTime_msg;
    }
}

const timeService = new Time()

export default timeService