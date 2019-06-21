
module.exports = app => {
  const {
    controller: { user, home, cos, check, product, plan, point, upgrade },
    middleware: { auth }
  } = app;
  app.get('/api/user/index', auth(), user.index);
  app.get('/api/user/logout', auth(), user.logout);
  app.post('/api/user/changePwd', auth(), user.changePwd);
  // app.post('/api/user/isValidPost', auth(), user.isVaildPost);
  app.get('/api/user/getHomeData', auth(), user.getHomeData);
  app.get('/api/user/getGroupRes', auth(), user.getGroupRes);
  app.get('/api/user/getGrouperList', auth(), user.getGrouperList);
  app.get('/api/user/getGrouper/:id', auth(), user.getGrouper);
  app.get('/api/user/getUserDetail/:id', auth(), user.getUserDetail);
  app.get('/api/user/getUserList', auth(), user.getUserList);
  app.post('/api/user/changeAvator', auth(), user.changeAvator);

  app.get('/api/check/list', auth(), check.getList);
  app.get('/api/check/:id', auth(), check.getOne);
  app.post('/api/check/agree', auth(), check.agree);
  app.post('/api/check/refuse', auth(), check.refuse);

  app.get('/api/product/list', auth(), product.getList);
  app.get('/api/product/getOne', auth(), product.getOne);
  app.get('/api/product/remain', auth(), product.getRemain);

  app.post('/api/plan/create', auth(), plan.create);
  app.get('/api/plan/getValidLimit', auth(), plan.getValidLimit);
  app.get('/api/plan/getOne/:id', auth(), plan.getOne);
  app.post('/api/plan/updateEvi/:id', auth(), plan.updateEvi);
  app.get('/api/plan/getList', auth(), plan.getList);
  app.post('/api/plan/agree/:id', auth(), plan.agreePlan);
  app.post('/api/plan/reject/:id', auth(), plan.rejectPlan);
  app.post('/api/plan/remove/:id', auth(), plan.remove);

  app.get('/api/point/getCurrent', auth(), point.getCurrent);
  app.get('/api/point/getPointList', auth(), point.getList);
  app.post('/api/point/createRefund', auth(), point.createRefund);
  app.get('/api/point/getCurrentRefund', auth(), point.getCurrentRefund);
  app.get('/api/point/getRefundList', auth(), point.getRefundList);
  app.post('/api/point/agreeRefund/:id', auth(), point.agreeRefund);
  app.post('/api/point/rejectRefund/:id', auth(), point.rejectRefund);

  app.get('/api/upgrade/getCurrent', auth(), upgrade.getCurrent);
  app.post('/api/upgrade/create', auth(), upgrade.create);
  app.get('/api/upgrade/getOne/:id', auth(), upgrade.getOne);
  app.post('/api/upgrade/updateEvi/:id', auth(), upgrade.updateEvi);
  app.get('/api/upgrade/getList', auth(), upgrade.getList);
  app.post('/api/upgrade/agree/:id', auth(), upgrade.agreePlan);
  app.post('/api/upgrade/reject/:id', auth(), upgrade.rejectPlan);
  app.post('/api/upgrade/remove/:id', auth(), upgrade.remove);

  app.get('/api/cos/getAvatorSTS', auth(), cos.getAvatorSTS);

  app.post('/api/user/sendSms', user.sendSms);
  app.post('/api/user/validateSmsCode', user.validateCode);
  app.post('/api/user/noAuthChangePwd', user.noAuthChangePwd);
  app.post('/api/user/register', user.register);
  app.post('/api/user/login', user.login);
  app.get('/api/getSTS', cos.getSTS);
  app.get('/*', home.index);
};
