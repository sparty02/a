module.exports = function createAnnotator() {
  var registry = {};
  var a = {};

  function A () {
    this._annotations = [];
    this._factories = [];
  };
  
  A.prototype.for = function (SomeClass) {
    var annotations = this._annotations;
    if (SomeClass.annotations) {
      SomeClass.annotations = SomeClass.annotations.concat()
    }
    SomeClass.annotations = this._annotations;
    this._factories.forEach(function (fn, params) {
      fn(SomeClass, params);
    });
    return SomeClass;
  }

  function register(name, impl) {
    registry[name] = impl;
    A.prototype[name] = function (param) {
      var Annotation = registry[name];
      if (typeof param === 'function') {
        this._annotations.push(new Annotation());
        return this.for(param);
      }
      var Annotation = registry[name];
      this._annotations.push(new Annotation(param));

      // chaining
      var self = this;
      return function (chain) {
        if (typeof chain === 'object') {
          return self;
        } else {
          return self.for(chain);  
        }
      }
    };
    a[name] = function (param) {
      var instance = new A();
      return instance[name](param);
    }
  };

  function registerFactory(name, impl) {
    registry[name] = impl;
    A.prototype[name] = function () {
      var args = arguments;
      var fn = registry[name];
      this._factories.push(function (SomeClass) {
        fn(SomeClass, args);
      });

      // chaining
      var self = this;
      return function (chain) {
        if (typeof chain === 'object') {
          return self;
        } else {
          return self.for(chain);  
        }
      }
    };
    a[name] = function (param) {
      var instance = new A();
      return instance[name](param);
    }
  }

  return {
    annotator: a,
    register: register,
    registerFactory: registerFactory
  };
};
