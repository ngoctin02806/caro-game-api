module.exports.sortObject = o => {
  const sorted = {};
  let key;
  const a = [];

  // eslint-disable-next-line no-restricted-syntax
  for (key in o) {
    // eslint-disable-next-line
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  // eslint-disable-next-line no-plusplus
  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
};
