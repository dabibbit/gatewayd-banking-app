"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var paymentConfigActions = require('../config.json').actions;
var session = require('../../../modules/session/models/session');
var Model = require('../models/payment.js');

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

    this.url = path.join(session.get('gatewaydUrl'), this.urlObject[page].path);
    this.httpMethod = this.urlObject[page].method;

    this.fetchExternalTransactions();
  },

  flagAsDone: function(id) {
    var model = this.get(id);

    if (model.get('deposit')) {
      model.set({
        status: 'processed'
      });
    } else {
      model.set({
        status: 'succeeded'
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
    if (_.isUndefined(this.url)) {
      this.url = path.join(session.get('gatewaydUrl'), this.urlObject.payments.path);
    }

    this.fetch({
      headers: {
        Authorization: session.get('credentials')
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
