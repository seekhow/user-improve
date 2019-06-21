'use strict';

import * as Type from './mutation-type';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import axios from 'axios';

// const host = 'http://127.0.0.1:7001';

const request = axios.create({
  timeout: 3000,
  withCredentials: true, // 自动携带cookie，很重要
});

request.interceptors.response.use(function (response) {
  if (response && response.status === 200 && response.data) {
    return response.data;
  }
  return Promise.resolve(response);
}, function (error) {
  return Promise.reject(error);
});

Vue.use(Vuex);

const actions = {
  getUserData: ({ commit, dispatch, state }, router) => {
    return  request.get(`/api/user/index`).then(res => {
      commit('saveUser', res.data);
      return res.data;
    }).catch(err => {
      if (router) {
        router.push('/login');
      }
    });
  },

  FETCH_ARTICLE_LIST: ({ commit, dispatch, state }) => {
    if (!state.articleList.length) {
      return axios.get(`/api/article/list`)
        .then(response => {
          const data = response.data.list;
          commit(Type.SET_ARTICLE_LIST, data);
          return data;
        });
    }
    return Promise.resolve();
  },

  FETCH_ARTICLE_DETAIL: ({ commit, dispatch, state }, { id }) => {
    if (state.article.id !== Number(id)) {
      return axios.get(`/api/article/${id}`)
        .then(response => {
          const data = response.data;
          commit(Type.SET_ARTICLE_DETAIL, data);
        });
    }
    return Promise.resolve();
  }
};

export default actions;
