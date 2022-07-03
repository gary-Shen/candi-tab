import _ from 'lodash';

import { FILE_NAME } from '../constant';

export default function (data) {
  const content = _.get(data, ['files', FILE_NAME, 'content']);
  let result;
  try {
    result = JSON.parse(content);
  } catch (err) {
    console.warn(err);
  }

  return result;
}
