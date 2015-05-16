var createInstance = require('./a');

describe('a', function () {
  var register,
      registerFactory,
      a;

  beforeEach(function () {
    var obj = createInstance();
    register = obj.register;
    registerFactory = obj.registerFactory;
    a = obj.annotator;
  });

  it('should add methods on register', function () {
    register('RouteConfig', RouteConfig);
    expect(a.RouteConfig).toBeDefined();
  });

  it('should annotate classes', function () {
    register('RouteConfig', RouteConfig);

    (a).RouteConfig([
      { path: '/', component: 'Foo'}
    ])
    (MyCtrl);
    function MyCtrl () {};

    expect(MyCtrl.annotations).toBeDefined();
    expect(MyCtrl.annotations.length).toBe(1);
    expect(MyCtrl.annotations[0] instanceof RouteConfig).toBe(true);
  });

  it('should allow chaining', function () {
    register('RouteConfig', RouteConfig);
    register('View', View);

    (a).RouteConfig([
      { path: '/', component: 'Foo'}
    ])
    (a).View({
      template: 'my.html'
    })
    (MyCtrl);
    function MyCtrl () {};

    expect(MyCtrl.annotations.length).toBe(2);
    expect(MyCtrl.annotations[0] instanceof RouteConfig).toBe(true);
    expect(MyCtrl.annotations[1] instanceof View).toBe(true);
  });

  it('should annotate methods', function () {
    register('CanActivate', CanActivate);
    
    function MyCtrl () {};
    a.CanActivate(
    MyCtrl.prototype.myHook = function () {
      // ...
    });

    expect(MyCtrl.prototype.myHook.annotations).toBeDefined();
    expect(MyCtrl.prototype.myHook.annotations.length).toBe(1);
    expect(MyCtrl.prototype.myHook.annotations[0] instanceof CanActivate).toBe(true);
  });

  it('should allow registering factories', function () {
    registerFactory('inject', function (SomeClass, args) {
      SomeClass.parameters = [Array.prototype.slice.call(args, 0)];
    });

    (a).inject(Service)
    (MyCtrl)
    function MyCtrl (service) {}

    expect(MyCtrl.parameters).toEqual([[Service]]);
  });

  it('should allow registering factories while chaining non-factories', function () {
    register('RouteConfig', RouteConfig);
    registerFactory('inject', function (SomeClass, args) {
      SomeClass.parameters = [Array.prototype.slice.call(args, 0)];
    });

    (a).RouteConfig([
      { path: '/', component: 'Foo'}
    ])
    (a).inject(Service)
    (MyCtrl)
    function MyCtrl (service) {}

    expect(MyCtrl.parameters).toEqual([[Service]]);
  });

  it('should not care about the order of annotations', function () {
    register('RouteConfig', RouteConfig);
    registerFactory('inject', function (SomeClass, args) {
      SomeClass.parameters = [Array.prototype.slice.call(args, 0)];
    });

    (a).inject(Service)
    (a).RouteConfig([
      { path: '/', component: 'Foo'}
    ])
    (MyCtrl)
    function MyCtrl (service) {}

    expect(MyCtrl.parameters).toEqual([[Service]]);
  });

  it('should return the target of the annotation', function () {
    register('CanActivate', CanActivate);
    function MyCtrl () {};
    var methodImpl = function () {};
    expect(a.CanActivate(MyCtrl.prototype.myHook = methodImpl)).toBe(methodImpl);
  });

  //TODO: throw when there's more than one "for"

  //TODO: throw when there's no "for" block for a chained context

  function RouteConfig(config) {
    this.config = config;
  }
  function View(config) {
    this.config = config;
  }
  function CanActivate() {}
  function Service() {}
});
