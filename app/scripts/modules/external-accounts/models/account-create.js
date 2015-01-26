"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var RippleName = require('ripple-name');
var Backbone = require('backbone');
var ValidationMixins = require('../../../shared/mixins/models/validation_mixin');
var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var accountConfigActions = require('../config.json').actions;
var session = require('../../session/models/session');

Backbone.$ = $;

var Account = Backbone.Model.extend({
  defaults: {
    name: '',
    address: '', // federation address
    uid: '', // bank account number
    type: '', // gateway / customer (acct)
    data: ''
  },

  validationRules: {
    name: {
      validators: ['isString', 'minLength:1']
    },
    address: {
      validators: ['isRequired', 'isString', 'minLength:1']
    },
    uid: {
      validators: ['isString', 'minLength:1']
    },
    type: {
      validators: ['isRequired', 'isString', 'minLength:1']
    },
    data: {
      validators: ['isString', 'minLength:1']
    }
  },

  initialize: function() {
    _.bindAll(this);

    adminDispatcher.register(this.dispatchCallback);
  },

  dispatchCallback: function(payload) {
    var handleAction = {};

    handleAction[accountConfigActions.reset] = this.reset;
    handleAction[accountConfigActions.createAccountAttempt] = this.createAccountAttempt;
    handleAction[accountConfigActions.validateField] = this.validateField;

    if (!_.isUndefined(handleAction[payload.actionType])) {
      handleAction[payload.actionType](payload.data);
    }
  },

  reset: function() {
    this.clear().set(this.defaults);
  },

  createAccount: function() {
    this.save(null, {
      url: session.get('gatewaydUrl') + path.join('/', 'v1/external_accounts'),
      contentType: 'application/json',
      headers: {
        Authorization: session.get('credentials')
      }
    });
  },

  validateField: function(data) {
    var attributeValidation = this.attributeIsValid(data.fieldName, data.fieldValue);
    var updatedField = {};

    updatedField[data.fieldName] = data.fieldValue;

    this.set(updatedField);

    if (attributeValidation.result) {
      this.trigger('validationComplete', true, data.fieldName, '');
    } else {
      this.trigger('validationComplete', false, data.fieldName, attributeValidation.errorMessages);
    }
  },

  createAccountAttempt: function(account) {
    this.set(account);

    if (this.isValid()) {
      this.createAccount();
    }
  }
});

//add validation mixin
_.extend(Account.prototype, ValidationMixins);

module.exports = Account;
