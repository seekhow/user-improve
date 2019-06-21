<template>
  <html v-if="isNode">
    <head>
      <title>{{title || '水钰莱'}}</title>
      <meta name="keywords" :content="keywords">
      <meta name="description" :content="description">
      <meta http-equiv="content-type" content="text/html;charset=utf-8">
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="stylesheet" href="/public/asset/css/vant.css">
      <link rel="stylesheet" href="/public/asset/css/icon.css">
      <link rel="stylesheet" href="/public/asset/css/init.css">
    </head>
    <body>
      <div id="app"><MainLayout><div slot="main"><slot></slot></div></MainLayout></div>    
    </body>
  </html>
  <div v-else-if="!isNode" id="app"><MainLayout><div slot="main"><slot></slot></div></MainLayout></div>
</template>
<script type="text/babel">
  import MainLayout from './main';
  export default {
    props: [ 'title', 'description', 'keywords' ],
    components: {
      MainLayout
    },
    computed:{
      isNode() {
        return EASY_ENV_IS_NODE;
      }
    }
  }
</script>
