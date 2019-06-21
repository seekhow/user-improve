'use strict';
import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import getters from './getters';
import mutations from './mutations';

Vue.use(Vuex);

export default function createStore(initState = {}) {

  const state = {
    loading: false,
    user: {},
    ...initState
  };

  return new Vuex.Store({
    state,
    actions,
    getters,
    mutations
  });
}