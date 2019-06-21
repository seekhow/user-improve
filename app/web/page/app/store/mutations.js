'use strict';

import {
  SET_ARTICLE_LIST,
  SET_ARTICLE_DETAIL
} from './mutation-type';

const mutations = {
  [SET_ARTICLE_LIST](state, items) {
    state.articleList = items;
  },
  [SET_ARTICLE_DETAIL](state, data) {
    state.article = data;
  },
  changeLoading(state, data) {
    state.loading = Boolean(data);
  },
  saveUser(state, data) {
    state.user = data;
  }
};
export default mutations;
