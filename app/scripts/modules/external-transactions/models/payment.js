"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var heartbeats = require('heartbeats');

var Backbone = require('backbone');
var ValidationMixins = require('../../../shared/mixins/models/validation_mixin');

var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var paymentConfigActions = require('../config.json').actions;
var session = require('../../../modules/session/models/session');

var pollingHeart = new heartbeats.Heart(5000);

Backbone.$ = $;

var Payment = Backbone.Model.extend({
  defaults: {
    id: 0,
    // amount: 0.0,
    // currency: '',
    source_account_id: 0,
    source_amount: 0.0,
    source_currency: '',
    destination_account_id: 0,
    destination_amount: 0.0,
    destination_currency: '',
    deposit: true,
    // external_account_id: 0,
    status: '',
    ripple_transaction_id: 0,
    uid: '',
    data: '',
    invoice_id: '',
    memos: '',
    toAccount: {},
    fromAccount: {}
  },

  validationRules: {
    source_account_id: {
      validators: ['isRequired', 'isNumber']
    },
    source_amount: {
      validators: ['isRequired', 'isNumber']
    },
    source_currency: {
      validators: ['isRequired', 'isString', 'minLength:1']
    },
    destination_account_id: {
      validators: ['isRequired', 'isNumber']
    },
    destination_amount: {
      validators: ['isRequired', 'isNumber']
    },
    destination_currency: {
      validators: ['isRequired', 'isString', 'minLength:1']
    },
    deposit: {
      validators: ['isRequired', 'isBoolean']
    },
    external_account_id: {
      validators: ['isRequired', 'isNumber']
    },
    ripple_transaction_id: {
      validators: ['isNumber']
    },
    uid: {
      validators: ['isString', 'minLength:1']
    },
    data: {
      validators: ['isString', 'minLength:1']
    },
    invoice_id: {
      validators: ['isString', 'minLength:1']
    },
    memos: {
      validators: ['isString', 'minLength:1']
    }
  },

  initialize: function() {
    _.bindAll(this);

    adminDispatcher.register(this.dispatchCallback);
  },

  dispatchCallback: function(payload) {
    var handleAction = {};

    if (!_.isUndefined(handleAction[payload.actionType])) {
      handleAction[payload.actionType](payload.data);
    }
  },

  parse: function(data, options) {
    // fetching from collection uses model's parse method
    if (options.collection) {
      return data;
    }

    return data.external_transaction;
  },

  checkPollCompletion: function(model) {
    if (model.get('status') === 'processed' || model.get('status') === 'succeeded') {
      pollingHeart.clearEvents();
      this.trigger('pollingStop');
    }
  },

  pollStatusHelper: function() {
    this.fetch({
      url: path.join(session.get('gatewaydUrl'), 'v1/external_transactions', this.get('id').toString()),
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        Authorization: session.get('credentials')
      },
      success: this.checkPollCompletion
    });
  },

  pollStatus: function() {
    var _this = this;

    // update displayed payment information every interval to watch status changes
    pollingHeart.onBeat(1, this.pollStatusHelper);
    pollingHeart.onceOnBeat(0, this.trigger('pollingStart'));

    // stop polling after 10 intervals
    pollingHeart.onceOnBeat(10, function() {
      pollingHeart.clearEvents();
      _this.trigger('pollingStop');
    });
  }
});

//add validation mixin
_.extend(Payment.prototype, ValidationMixins);

module.exports = Payment;
