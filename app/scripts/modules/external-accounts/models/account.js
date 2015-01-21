"use strict";

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

var Account = Backbone.Model.extend({
  defaults: {
    id: 0,
    name: '', // account name
    address: '', // phone number, email address, IBAN/USBN, etc.
    user_id: 0,
    uid: '',
    type: '', // gateway / customer (acct)
    data: '' // bank name
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

    if (!_.isUndefined(handleAction[payload.actionType])) {
      handleAction[payload.actionType](payload.data);
    }
  },

  parse: function(data, options) {
    // fetching from collection uses model's parse method
    if (options.collection) {
      return data;
    }

    return data.external_account;
  },
});

//add validation mixin
_.extend(Account.prototype, ValidationMixins);

module.exports = Account;
