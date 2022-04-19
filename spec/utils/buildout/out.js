(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // spec/utils/buildtest/moda.js
  var Pluggy = class {
  };
  console.log(new Pluggy());

  // spec/utils/buildtest/modb.js
  console.log("hello modb");

  // spec/utils/buildtest/mainmod.js
  var mainmod_exports = {};
  __export(mainmod_exports, {
    default: () => Hello
  });
  var Hello = class {
    hello() {
      console.log("blabla");
    }
  };

  // spec/utils/buildout/out.js.import.js
  if (typeof window !== "undefined")
    window.main = mainmod_exports;
  if (typeof global !== "undefined")
    window.main = mainmod_exports;
})();
