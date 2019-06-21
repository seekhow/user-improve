import axios from 'axios';
import Cookie from 'js-cookie';

const instance = axios.create({
  timeout: 3000,
  withCredentials: true, // 自动携带cookie，很重要
});

instance.interceptors.request.use(function (config) {
  if (window) {
    const csrfToken = Cookie.get('csrfToken');
    config.headers['x-csrf-token'] = csrfToken;
    return config;
  }
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
  if (response && response.status === 200 && response.data) {
    return response.data;
  }
  if (response && response.status === 401) {
    return location.replace(`${location.origin}/login`);
  }
  return Promise.reject(response);
}, function (error) {
  const errorStr = String(error);
  if (errorStr.includes('status code 401')) {
    location.replace(`${location.origin}/login`);
  }
  return Promise.reject(error);
});

export default instance;
