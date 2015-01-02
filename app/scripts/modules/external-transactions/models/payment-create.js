"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var RippleName = require('ripple-name');
var Backbone = require('backbone');
var ValidationMixins = require('../../../shared/helpers/validation_mixin');
var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var paymentConfigActions = require('../config.json').actions;
var session = require('../../session/models/session');

Backbone.$ = $;

var Payment = Backbone.Model.extend({
  defaults: {
    source_account_id: 0,
    source_amount: 0.0,
    source_currency: '',
    destination_account_id: 0,
    destination_amount: 0.0,
    destination_currency: '',
    deposit: true, // always true
    external_account_id: 1, // why is this required?
    status: 'queued', // always starts off queued
    // ripple_transaction_id: 0,
    // uid: '',
    // data: '',
    invoice_id: '',
    memos: ''
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
    status: {
      validators: ['isString', 'minLength:1']
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

    handleAction[paymentConfigActions.reset] = this.reset;
    handleAction[paymentConfigActions.sendPaymentAttempt] = this.sendPaymentAttempt;
    handleAction[paymentConfigActions.validateField] = this.validateField;

    if (!_.isUndefined(handleAction[payload.actionType])) {
      handleAction[payload.actionType](payload.data);
    }
  },

  reset: function() {
    this.clear().set(this.defaults);
  },

  sendPayment: function() {
    this.save(null, {
      url: path.join(session.get('gatewaydUrl'), 'v1/external_transactions'),
      contentType: 'application/json',
      headers: {
        Authorization: session.get('credentials')
      }
    });
  },

  validateField: function(data) {
    var attributeValidation = this.attributeIsValid(data.fieldName, data.fieldValue);

    if (attributeValidation.result) {
      this.trigger('validationComplete', true, data.fieldName, '');
    } else {
      this.trigger('validationComplete', false, data.fieldName, attributeValidation.errorMessages);
    }
  },

  sendPaymentAttempt: function(payment) {
    this.set(payment);

    if (this.isValid()) {
      this.sendPayment();
    }
  }
});

//add validation mixin
_.extend(Payment.prototype, ValidationMixins);

module.exports = Payment;
