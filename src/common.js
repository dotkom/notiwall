import moment from 'moment';
import 'moment/locale/nb';

export const formatDate = (date) => {
    if (!date) {
      return '...';
    }

    return moment(date).startOf('minute').fromNow();
};
