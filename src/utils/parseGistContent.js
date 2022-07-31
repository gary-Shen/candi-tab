import _ from 'lodash';

export default function (data) {
  const fileName = _.chain(data).get('files').keys().first().value();
  const content = _.get(data, ['files', fileName, 'content']);
  let result;
  try {
    result = JSON.parse(content);
  } catch (err) {
    console.warn(err);
  }

  return result;
}
