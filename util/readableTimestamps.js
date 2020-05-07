// https://github.com/grafana/grafana/blob/master/packages/grafana-data/src/datetime/datemath.ts
const moment = require('moment');

const units = new Set(['y', 'M', 'w', 'd', 'h', 'm', 's']);

function parseDateMath(mathString, time) {
  const strippedMathString = mathString.replace(/\s/g, '');
  const dateTime = time;
  let i = 0;
  const { length } = strippedMathString;

  while (i < length) {
    const c = strippedMathString.charAt(i);
    i += 1;
    let type;
    let number;

    if (c === '/') {
      type = 0;
    } else if (c === '+') {
      type = 1;
    } else if (c === '-') {
      type = 2;
    } else {
      return undefined;
    }

    if (Number.isNaN(Number.parseInt(strippedMathString.charAt(i), 10))) {
      number = 1;
    } else if (strippedMathString.length === 2) {
      number = strippedMathString.charAt(i);
    } else {
      const numberFrom = i;
      while (!Number.isNaN(Number.parseInt(strippedMathString.charAt(i), 10))) {
        i += 1;
        if (i > 10) {
          return undefined;
        }
      }
      number = Number.parseInt(strippedMathString.slice(numberFrom, i), 10);
    }

    if (type === 0 && number !== 1) {
      return undefined;
    }

    const unit = strippedMathString.charAt(i);
    i += 1;

    if (!units.has(unit)) {
      return undefined;
    }
    if (type === 0) {
      dateTime.startOf(unit);
    } else if (type === 1) {
      dateTime.add(number, unit);
    } else if (type === 2) {
      dateTime.subtract(number, unit);
    }
  }

  return dateTime;
}

function parse(text) {
  if (!text) return undefined;

  if (typeof text !== 'string') {
    if (moment.isMoment(text)) {
      return text;
    }
    if (moment.isDate(text)) {
      return moment(text);
    }
    return undefined;
  }

  let time;
  let mathString = '';
  let index;
  let parseString;

  if (text.slice(0, 3) === 'now') {
    time = moment.utc();
    mathString = text.slice(3);
  } else {
    index = text.indexOf('||');
    if (index === -1) {
      parseString = text;
      mathString = '';
    } else {
      parseString = text.slice(0, Math.max(0, index));
      mathString = text.slice(Math.max(0, index + 2));
    }

    time = moment(parseString, moment.ISO_8601);
  }

  if (mathString.length === 0) {
    return time.valueOf();
  }

  const dateMath = parseDateMath(mathString, time);
  return dateMath ? dateMath.valueOf() : undefined;
}

module.exports = parse;
