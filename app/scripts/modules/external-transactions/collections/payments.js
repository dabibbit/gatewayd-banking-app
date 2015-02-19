"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
var moment = require('moment');
var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var paymentConfigActions = require('../config.json').actions;
var session = require('../../../modules/session/models/session');
var Model = require('../models/payment.js');
var appConfig = require('../../../../../app-config');

Backbone.$ = $;

var Payments = Backbone.Collection.extend({

  model: Model,

  comparator: function(a, b) {
    return b.id - a.id;
  },

  initialize: function() {
    _.bindAll(this);

    adminDispatcher.register(this.dispatcherCallback);
  },

  dispatcherCallback: function(payload) {
    var handleAction = {};

    handleAction[paymentConfigActions.updateUrl] = this.updateUrl;
    handleAction[paymentConfigActions.flagAsDone] = this.flagAsDone;
    handleAction[paymentConfigActions.fetchExternalTransactions] = this.fetchExternalTransactions;
    handleAction[paymentConfigActions.fetchNewExternalTransactions] = this.fetchNewExternalTransactions;
    handleAction[paymentConfigActions.sendPaymentComplete] = this.sendPaymentComplete;

    if (!_.isUndefined(this[payload.actionType])) {
      this[payload.actionType](payload.data);
    }
  },

  urlObject: {
    "payments": {
      "path": "v1/external_transactions",
      "method": "get"
    },
    "flagAsDone": {
      "path": "v1/external_transactions",
      "method": "save"
    }
  },

  updateUrl: function(page) {
    page = page.split('/')[1];

    if (!page || _.isUndefined(this.urlObject[page])) {
      return false;
    }

    this.url = session.get('gatewaydUrl') + this.urlObject[page].path;
    this.httpMethod = this.urlObject[page].method;

    this.fetchExternalTransactions();
  },

  flagAsDone: function(id) {
    var model = this.get(id);

    if (model.get('deposit')) {
      model.set({
        status: appConfig.status.deposits.processed.name
      });
    } else {
      model.set({
        status: appConfig.status.withdrawals.succeeded.name
      });
    }

    model.save(null, {
      url: path.join(session.get('gatewaydUrl'), this.urlObject.flagAsDone.path, id.toString()),
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Authorization', session.get('credentials'));
      }
    });
  },

  fetchExternalTransactions: function() {
    var _this = this;

    if (_.isUndefined(this.url)) {
      this.url = path.join(session.get('gatewaydUrl'), this.urlObject.payments.path);
    }

    this.fetch({
      url: this.url + '?count=200',
      headers: {
        Authorization: session.get('credentials')
      },
      success: function(collection, response) {
        _this.trigger('fetchedTransactions', collection);
      }
    });
  },

  getNewExternalTransactionsUrl: function(updatedAt) {
    var timeStamp = encodeURIComponent(moment(updatedAt).format('YYYY-MM-DD HH:mm:ss.SSS'));

    return this.url + '?count=200' + '&sort_direction=asc' + '&index=' + timeStamp;
  },

  fetchNewExternalTransactions: function() {
    if (!this.length) {
      this.fetchExternalTransactions();
      return false;
    }

    var _this = this;
    var url = this.getNewExternalTransactionsUrl(this.at(0).get('updatedAt'));

    this.fetch({
      url: url,
      remove: false,
      headers: {
        Authorization: session.get('credentials')
      },
      success: function(collection, response) {

        // do nothing if nothing returned
        if (!response.external_transactions.length) {
          return false;
        }

        // todo: not sure why we need to set explicitly
        // rather than letting bbone merge data
        _this.set(response.external_transactions, {remove: false});
        _this.trigger('refreshedTransactions', collection);
      }
    });
  },

  parse: function(data) {
    return data.external_transactions;
  },

  sendPaymentComplete: function(paymentData) {
    var _this = this;

    this.fetch({
      headers: {
        Authorization: session.get('credentials')
      },
      success: function() {

        // poll status of sent payment until failed/succeeded to see changes
        // _this.get(paymentData.id).pollStatus();
      }
    });
  }
});

module.exports = Payments;
