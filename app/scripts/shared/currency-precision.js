"use strict";

var _ = require('lodash');

var currencyPrecisionList = {
  USD: 2,
  CAD: 2
};

module.exports = function(currencyCode, amount) {
  if (_.isUndefined(currencyPrecisionList[currencyCode])) {
    return amount;
  }

  return amount.toFixed(currencyPrecisionList[currencyCode]);
};
