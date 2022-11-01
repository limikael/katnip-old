// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var i;
var t;
var o;
var r;
var f = {};
var e = [];
var c = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function s(n3, l4) {
  for (var u4 in l4)
    n3[u4] = l4[u4];
  return n3;
}
function a(n3) {
  var l4 = n3.parentNode;
  l4 && l4.removeChild(n3);
}
function h(l4, u4, i4) {
  var t3, o4, r3, f4 = {};
  for (r3 in u4)
    "key" == r3 ? t3 = u4[r3] : "ref" == r3 ? o4 = u4[r3] : f4[r3] = u4[r3];
  if (arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : i4), "function" == typeof l4 && null != l4.defaultProps)
    for (r3 in l4.defaultProps)
      void 0 === f4[r3] && (f4[r3] = l4.defaultProps[r3]);
  return v(l4, f4, t3, o4, null);
}
function v(n3, i4, t3, o4, r3) {
  var f4 = { type: n3, props: i4, key: t3, ref: o4, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == r3 ? ++u : r3 };
  return null == r3 && null != l.vnode && l.vnode(f4), f4;
}
function p(n3) {
  return n3.children;
}
function d(n3, l4) {
  this.props = n3, this.context = l4;
}
function _(n3, l4) {
  if (null == l4)
    return n3.__ ? _(n3.__, n3.__.__k.indexOf(n3) + 1) : null;
  for (var u4; l4 < n3.__k.length; l4++)
    if (null != (u4 = n3.__k[l4]) && null != u4.__e)
      return u4.__e;
  return "function" == typeof n3.type ? _(n3) : null;
}
function k(n3) {
  var l4, u4;
  if (null != (n3 = n3.__) && null != n3.__c) {
    for (n3.__e = n3.__c.base = null, l4 = 0; l4 < n3.__k.length; l4++)
      if (null != (u4 = n3.__k[l4]) && null != u4.__e) {
        n3.__e = n3.__c.base = u4.__e;
        break;
      }
    return k(n3);
  }
}
function b(n3) {
  (!n3.__d && (n3.__d = true) && t.push(n3) && !g.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || setTimeout)(g);
}
function g() {
  for (var n3; g.__r = t.length; )
    n3 = t.sort(function(n4, l4) {
      return n4.__v.__b - l4.__v.__b;
    }), t = [], n3.some(function(n4) {
      var l4, u4, i4, t3, o4, r3;
      n4.__d && (o4 = (t3 = (l4 = n4).__v).__e, (r3 = l4.__P) && (u4 = [], (i4 = s({}, t3)).__v = t3.__v + 1, j(r3, t3, i4, l4.__n, void 0 !== r3.ownerSVGElement, null != t3.__h ? [o4] : null, u4, null == o4 ? _(t3) : o4, t3.__h), z(u4, t3), t3.__e != o4 && k(t3)));
    });
}
function w(n3, l4, u4, i4, t3, o4, r3, c4, s4, a4) {
  var h4, y4, d4, k4, b4, g5, w4, x5 = i4 && i4.__k || e, C4 = x5.length;
  for (u4.__k = [], h4 = 0; h4 < l4.length; h4++)
    if (null != (k4 = u4.__k[h4] = null == (k4 = l4[h4]) || "boolean" == typeof k4 ? null : "string" == typeof k4 || "number" == typeof k4 || "bigint" == typeof k4 ? v(null, k4, null, null, k4) : Array.isArray(k4) ? v(p, { children: k4 }, null, null, null) : k4.__b > 0 ? v(k4.type, k4.props, k4.key, k4.ref ? k4.ref : null, k4.__v) : k4)) {
      if (k4.__ = u4, k4.__b = u4.__b + 1, null === (d4 = x5[h4]) || d4 && k4.key == d4.key && k4.type === d4.type)
        x5[h4] = void 0;
      else
        for (y4 = 0; y4 < C4; y4++) {
          if ((d4 = x5[y4]) && k4.key == d4.key && k4.type === d4.type) {
            x5[y4] = void 0;
            break;
          }
          d4 = null;
        }
      j(n3, k4, d4 = d4 || f, t3, o4, r3, c4, s4, a4), b4 = k4.__e, (y4 = k4.ref) && d4.ref != y4 && (w4 || (w4 = []), d4.ref && w4.push(d4.ref, null, k4), w4.push(y4, k4.__c || b4, k4)), null != b4 ? (null == g5 && (g5 = b4), "function" == typeof k4.type && k4.__k === d4.__k ? k4.__d = s4 = m(k4, s4, n3) : s4 = A(n3, k4, d4, x5, b4, s4), "function" == typeof u4.type && (u4.__d = s4)) : s4 && d4.__e == s4 && s4.parentNode != n3 && (s4 = _(d4));
    }
  for (u4.__e = g5, h4 = C4; h4--; )
    null != x5[h4] && N(x5[h4], x5[h4]);
  if (w4)
    for (h4 = 0; h4 < w4.length; h4++)
      M(w4[h4], w4[++h4], w4[++h4]);
}
function m(n3, l4, u4) {
  for (var i4, t3 = n3.__k, o4 = 0; t3 && o4 < t3.length; o4++)
    (i4 = t3[o4]) && (i4.__ = n3, l4 = "function" == typeof i4.type ? m(i4, l4, u4) : A(u4, i4, i4, t3, i4.__e, l4));
  return l4;
}
function x(n3, l4) {
  return l4 = l4 || [], null == n3 || "boolean" == typeof n3 || (Array.isArray(n3) ? n3.some(function(n4) {
    x(n4, l4);
  }) : l4.push(n3)), l4;
}
function A(n3, l4, u4, i4, t3, o4) {
  var r3, f4, e3;
  if (void 0 !== l4.__d)
    r3 = l4.__d, l4.__d = void 0;
  else if (null == u4 || t3 != o4 || null == t3.parentNode)
    n:
      if (null == o4 || o4.parentNode !== n3)
        n3.appendChild(t3), r3 = null;
      else {
        for (f4 = o4, e3 = 0; (f4 = f4.nextSibling) && e3 < i4.length; e3 += 2)
          if (f4 == t3)
            break n;
        n3.insertBefore(t3, o4), r3 = o4;
      }
  return void 0 !== r3 ? r3 : t3.nextSibling;
}
function C(n3, l4, u4, i4, t3) {
  var o4;
  for (o4 in u4)
    "children" === o4 || "key" === o4 || o4 in l4 || H(n3, o4, null, u4[o4], i4);
  for (o4 in l4)
    t3 && "function" != typeof l4[o4] || "children" === o4 || "key" === o4 || "value" === o4 || "checked" === o4 || u4[o4] === l4[o4] || H(n3, o4, l4[o4], u4[o4], i4);
}
function $(n3, l4, u4) {
  "-" === l4[0] ? n3.setProperty(l4, u4) : n3[l4] = null == u4 ? "" : "number" != typeof u4 || c.test(l4) ? u4 : u4 + "px";
}
function H(n3, l4, u4, i4, t3) {
  var o4;
  n:
    if ("style" === l4)
      if ("string" == typeof u4)
        n3.style.cssText = u4;
      else {
        if ("string" == typeof i4 && (n3.style.cssText = i4 = ""), i4)
          for (l4 in i4)
            u4 && l4 in u4 || $(n3.style, l4, "");
        if (u4)
          for (l4 in u4)
            i4 && u4[l4] === i4[l4] || $(n3.style, l4, u4[l4]);
      }
    else if ("o" === l4[0] && "n" === l4[1])
      o4 = l4 !== (l4 = l4.replace(/Capture$/, "")), l4 = l4.toLowerCase() in n3 ? l4.toLowerCase().slice(2) : l4.slice(2), n3.l || (n3.l = {}), n3.l[l4 + o4] = u4, u4 ? i4 || n3.addEventListener(l4, o4 ? T : I, o4) : n3.removeEventListener(l4, o4 ? T : I, o4);
    else if ("dangerouslySetInnerHTML" !== l4) {
      if (t3)
        l4 = l4.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("href" !== l4 && "list" !== l4 && "form" !== l4 && "tabIndex" !== l4 && "download" !== l4 && l4 in n3)
        try {
          n3[l4] = null == u4 ? "" : u4;
          break n;
        } catch (n4) {
        }
      "function" == typeof u4 || (null == u4 || false === u4 && -1 == l4.indexOf("-") ? n3.removeAttribute(l4) : n3.setAttribute(l4, u4));
    }
}
function I(n3) {
  this.l[n3.type + false](l.event ? l.event(n3) : n3);
}
function T(n3) {
  this.l[n3.type + true](l.event ? l.event(n3) : n3);
}
function j(n3, u4, i4, t3, o4, r3, f4, e3, c4) {
  var a4, h4, v4, y4, _4, k4, b4, g5, m4, x5, A4, C4, $2, H3, I3, T4 = u4.type;
  if (void 0 !== u4.constructor)
    return null;
  null != i4.__h && (c4 = i4.__h, e3 = u4.__e = i4.__e, u4.__h = null, r3 = [e3]), (a4 = l.__b) && a4(u4);
  try {
    n:
      if ("function" == typeof T4) {
        if (g5 = u4.props, m4 = (a4 = T4.contextType) && t3[a4.__c], x5 = a4 ? m4 ? m4.props.value : a4.__ : t3, i4.__c ? b4 = (h4 = u4.__c = i4.__c).__ = h4.__E : ("prototype" in T4 && T4.prototype.render ? u4.__c = h4 = new T4(g5, x5) : (u4.__c = h4 = new d(g5, x5), h4.constructor = T4, h4.render = O), m4 && m4.sub(h4), h4.props = g5, h4.state || (h4.state = {}), h4.context = x5, h4.__n = t3, v4 = h4.__d = true, h4.__h = [], h4._sb = []), null == h4.__s && (h4.__s = h4.state), null != T4.getDerivedStateFromProps && (h4.__s == h4.state && (h4.__s = s({}, h4.__s)), s(h4.__s, T4.getDerivedStateFromProps(g5, h4.__s))), y4 = h4.props, _4 = h4.state, v4)
          null == T4.getDerivedStateFromProps && null != h4.componentWillMount && h4.componentWillMount(), null != h4.componentDidMount && h4.__h.push(h4.componentDidMount);
        else {
          if (null == T4.getDerivedStateFromProps && g5 !== y4 && null != h4.componentWillReceiveProps && h4.componentWillReceiveProps(g5, x5), !h4.__e && null != h4.shouldComponentUpdate && false === h4.shouldComponentUpdate(g5, h4.__s, x5) || u4.__v === i4.__v) {
            for (h4.props = g5, h4.state = h4.__s, u4.__v !== i4.__v && (h4.__d = false), h4.__v = u4, u4.__e = i4.__e, u4.__k = i4.__k, u4.__k.forEach(function(n4) {
              n4 && (n4.__ = u4);
            }), A4 = 0; A4 < h4._sb.length; A4++)
              h4.__h.push(h4._sb[A4]);
            h4._sb = [], h4.__h.length && f4.push(h4);
            break n;
          }
          null != h4.componentWillUpdate && h4.componentWillUpdate(g5, h4.__s, x5), null != h4.componentDidUpdate && h4.__h.push(function() {
            h4.componentDidUpdate(y4, _4, k4);
          });
        }
        if (h4.context = x5, h4.props = g5, h4.__v = u4, h4.__P = n3, C4 = l.__r, $2 = 0, "prototype" in T4 && T4.prototype.render) {
          for (h4.state = h4.__s, h4.__d = false, C4 && C4(u4), a4 = h4.render(h4.props, h4.state, h4.context), H3 = 0; H3 < h4._sb.length; H3++)
            h4.__h.push(h4._sb[H3]);
          h4._sb = [];
        } else
          do {
            h4.__d = false, C4 && C4(u4), a4 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;
          } while (h4.__d && ++$2 < 25);
        h4.state = h4.__s, null != h4.getChildContext && (t3 = s(s({}, t3), h4.getChildContext())), v4 || null == h4.getSnapshotBeforeUpdate || (k4 = h4.getSnapshotBeforeUpdate(y4, _4)), I3 = null != a4 && a4.type === p && null == a4.key ? a4.props.children : a4, w(n3, Array.isArray(I3) ? I3 : [I3], u4, i4, t3, o4, r3, f4, e3, c4), h4.base = u4.__e, u4.__h = null, h4.__h.length && f4.push(h4), b4 && (h4.__E = h4.__ = null), h4.__e = false;
      } else
        null == r3 && u4.__v === i4.__v ? (u4.__k = i4.__k, u4.__e = i4.__e) : u4.__e = L(i4.__e, u4, i4, t3, o4, r3, f4, c4);
    (a4 = l.diffed) && a4(u4);
  } catch (n4) {
    u4.__v = null, (c4 || null != r3) && (u4.__e = e3, u4.__h = !!c4, r3[r3.indexOf(e3)] = null), l.__e(n4, u4, i4);
  }
}
function z(n3, u4) {
  l.__c && l.__c(u4, n3), n3.some(function(u5) {
    try {
      n3 = u5.__h, u5.__h = [], n3.some(function(n4) {
        n4.call(u5);
      });
    } catch (n4) {
      l.__e(n4, u5.__v);
    }
  });
}
function L(l4, u4, i4, t3, o4, r3, e3, c4) {
  var s4, h4, v4, y4 = i4.props, p4 = u4.props, d4 = u4.type, k4 = 0;
  if ("svg" === d4 && (o4 = true), null != r3) {
    for (; k4 < r3.length; k4++)
      if ((s4 = r3[k4]) && "setAttribute" in s4 == !!d4 && (d4 ? s4.localName === d4 : 3 === s4.nodeType)) {
        l4 = s4, r3[k4] = null;
        break;
      }
  }
  if (null == l4) {
    if (null === d4)
      return document.createTextNode(p4);
    l4 = o4 ? document.createElementNS("http://www.w3.org/2000/svg", d4) : document.createElement(d4, p4.is && p4), r3 = null, c4 = false;
  }
  if (null === d4)
    y4 === p4 || c4 && l4.data === p4 || (l4.data = p4);
  else {
    if (r3 = r3 && n.call(l4.childNodes), h4 = (y4 = i4.props || f).dangerouslySetInnerHTML, v4 = p4.dangerouslySetInnerHTML, !c4) {
      if (null != r3)
        for (y4 = {}, k4 = 0; k4 < l4.attributes.length; k4++)
          y4[l4.attributes[k4].name] = l4.attributes[k4].value;
      (v4 || h4) && (v4 && (h4 && v4.__html == h4.__html || v4.__html === l4.innerHTML) || (l4.innerHTML = v4 && v4.__html || ""));
    }
    if (C(l4, p4, y4, o4, c4), v4)
      u4.__k = [];
    else if (k4 = u4.props.children, w(l4, Array.isArray(k4) ? k4 : [k4], u4, i4, t3, o4 && "foreignObject" !== d4, r3, e3, r3 ? r3[0] : i4.__k && _(i4, 0), c4), null != r3)
      for (k4 = r3.length; k4--; )
        null != r3[k4] && a(r3[k4]);
    c4 || ("value" in p4 && void 0 !== (k4 = p4.value) && (k4 !== l4.value || "progress" === d4 && !k4 || "option" === d4 && k4 !== y4.value) && H(l4, "value", k4, y4.value, false), "checked" in p4 && void 0 !== (k4 = p4.checked) && k4 !== l4.checked && H(l4, "checked", k4, y4.checked, false));
  }
  return l4;
}
function M(n3, u4, i4) {
  try {
    "function" == typeof n3 ? n3(u4) : n3.current = u4;
  } catch (n4) {
    l.__e(n4, i4);
  }
}
function N(n3, u4, i4) {
  var t3, o4;
  if (l.unmount && l.unmount(n3), (t3 = n3.ref) && (t3.current && t3.current !== n3.__e || M(t3, null, u4)), null != (t3 = n3.__c)) {
    if (t3.componentWillUnmount)
      try {
        t3.componentWillUnmount();
      } catch (n4) {
        l.__e(n4, u4);
      }
    t3.base = t3.__P = null, n3.__c = void 0;
  }
  if (t3 = n3.__k)
    for (o4 = 0; o4 < t3.length; o4++)
      t3[o4] && N(t3[o4], u4, i4 || "function" != typeof n3.type);
  i4 || null == n3.__e || a(n3.__e), n3.__ = n3.__e = n3.__d = void 0;
}
function O(n3, l4, u4) {
  return this.constructor(n3, u4);
}
n = e.slice, l = { __e: function(n3, l4, u4, i4) {
  for (var t3, o4, r3; l4 = l4.__; )
    if ((t3 = l4.__c) && !t3.__)
      try {
        if ((o4 = t3.constructor) && null != o4.getDerivedStateFromError && (t3.setState(o4.getDerivedStateFromError(n3)), r3 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n3, i4 || {}), r3 = t3.__d), r3)
          return t3.__E = t3;
      } catch (l5) {
        n3 = l5;
      }
  throw n3;
} }, u = 0, i = function(n3) {
  return null != n3 && void 0 === n3.constructor;
}, d.prototype.setState = function(n3, l4) {
  var u4;
  u4 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = s({}, this.state), "function" == typeof n3 && (n3 = n3(s({}, u4), this.props)), n3 && s(u4, n3), null != n3 && this.__v && (l4 && this._sb.push(l4), b(this));
}, d.prototype.forceUpdate = function(n3) {
  this.__v && (this.__e = true, n3 && this.__h.push(n3), b(this));
}, d.prototype.render = p, t = [], g.__r = 0, r = 0;

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = [];
var e2 = l.__b;
var a2 = l.__r;
var v2 = l.diffed;
var l2 = l.__c;
var m2 = l.unmount;
function d2(t3, u4) {
  l.__h && l.__h(r2, t3, o2 || u4), o2 = 0;
  var i4 = r2.__H || (r2.__H = { __: [], __h: [] });
  return t3 >= i4.__.length && i4.__.push({ __V: c2 }), i4.__[t3];
}
function _2(n3) {
  return o2 = 5, F(function() {
    return { current: n3 };
  }, []);
}
function F(n3, r3) {
  var u4 = d2(t2++, 7);
  return z2(u4.__H, r3) ? (u4.__V = n3(), u4.i = r3, u4.__h = n3, u4.__V) : u4.__;
}
function b2() {
  for (var t3; t3 = f2.shift(); )
    if (t3.__P && t3.__H)
      try {
        t3.__H.__h.forEach(k2), t3.__H.__h.forEach(w2), t3.__H.__h = [];
      } catch (r3) {
        t3.__H.__h = [], l.__e(r3, t3.__v);
      }
}
l.__b = function(n3) {
  "function" != typeof n3.type || n3.__m || null === n3.__ ? n3.__m || (n3.__m = n3.__ && n3.__.__m ? n3.__.__m : "") : n3.__m = (n3.__ && n3.__.__m ? n3.__.__m : "") + (n3.__ && n3.__.__k ? n3.__.__k.indexOf(n3) : 0), r2 = null, e2 && e2(n3);
}, l.__r = function(n3) {
  a2 && a2(n3), t2 = 0;
  var i4 = (r2 = n3.__c).__H;
  i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.forEach(function(n4) {
    n4.__N && (n4.__ = n4.__N), n4.__V = c2, n4.__N = n4.i = void 0;
  })) : (i4.__h.forEach(k2), i4.__h.forEach(w2), i4.__h = [])), u2 = r2;
}, l.diffed = function(t3) {
  v2 && v2(t3);
  var o4 = t3.__c;
  o4 && o4.__H && (o4.__H.__h.length && (1 !== f2.push(o4) && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o4.__H.__.forEach(function(n3) {
    n3.i && (n3.__H = n3.i), n3.__V !== c2 && (n3.__ = n3.__V), n3.i = void 0, n3.__V = c2;
  })), u2 = r2 = null;
}, l.__c = function(t3, r3) {
  r3.some(function(t4) {
    try {
      t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n3) {
        return !n3.__ || w2(n3);
      });
    } catch (u4) {
      r3.some(function(n3) {
        n3.__h && (n3.__h = []);
      }), r3 = [], l.__e(u4, t4.__v);
    }
  }), l2 && l2(t3, r3);
}, l.unmount = function(t3) {
  m2 && m2(t3);
  var r3, u4 = t3.__c;
  u4 && u4.__H && (u4.__H.__.forEach(function(n3) {
    try {
      k2(n3);
    } catch (n4) {
      r3 = n4;
    }
  }), u4.__H = void 0, r3 && l.__e(r3, u4.__v));
};
var g2 = "function" == typeof requestAnimationFrame;
function j2(n3) {
  var t3, r3 = function() {
    clearTimeout(u4), g2 && cancelAnimationFrame(t3), setTimeout(n3);
  }, u4 = setTimeout(r3, 100);
  g2 && (t3 = requestAnimationFrame(r3));
}
function k2(n3) {
  var t3 = r2, u4 = n3.__c;
  "function" == typeof u4 && (n3.__c = void 0, u4()), r2 = t3;
}
function w2(n3) {
  var t3 = r2;
  n3.__c = n3.__(), r2 = t3;
}
function z2(n3, t3) {
  return !n3 || n3.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n3[r3];
  });
}

// node_modules/preact/compat/dist/compat.module.js
function g3(n3, t3) {
  for (var e3 in t3)
    n3[e3] = t3[e3];
  return n3;
}
function C2(n3, t3) {
  for (var e3 in n3)
    if ("__source" !== e3 && !(e3 in t3))
      return true;
  for (var r3 in t3)
    if ("__source" !== r3 && n3[r3] !== t3[r3])
      return true;
  return false;
}
function E(n3) {
  this.props = n3;
}
(E.prototype = new d()).isPureReactComponent = true, E.prototype.shouldComponentUpdate = function(n3, t3) {
  return C2(this.props, n3) || C2(this.state, t3);
};
var R = l.__b;
l.__b = function(n3) {
  n3.type && n3.type.__f && n3.ref && (n3.props.ref = n3.ref, n3.ref = null), R && R(n3);
};
var x3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
var O2 = l.__e;
l.__e = function(n3, t3, e3, r3) {
  if (n3.then) {
    for (var u4, o4 = t3; o4 = o4.__; )
      if ((u4 = o4.__c) && u4.__c)
        return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u4.__c(n3, t3);
  }
  O2(n3, t3, e3, r3);
};
var T3 = l.unmount;
function I2(n3, t3, e3) {
  return n3 && (n3.__c && n3.__c.__H && (n3.__c.__H.__.forEach(function(n4) {
    "function" == typeof n4.__c && n4.__c();
  }), n3.__c.__H = null), null != (n3 = g3({}, n3)).__c && (n3.__c.__P === e3 && (n3.__c.__P = t3), n3.__c = null), n3.__k = n3.__k && n3.__k.map(function(n4) {
    return I2(n4, t3, e3);
  })), n3;
}
function L2(n3, t3, e3) {
  return n3 && (n3.__v = null, n3.__k = n3.__k && n3.__k.map(function(n4) {
    return L2(n4, t3, e3);
  }), n3.__c && n3.__c.__P === t3 && (n3.__e && e3.insertBefore(n3.__e, n3.__d), n3.__c.__e = true, n3.__c.__P = e3)), n3;
}
function U() {
  this.__u = 0, this.t = null, this.__b = null;
}
function D(n3) {
  var t3 = n3.__.__c;
  return t3 && t3.__a && t3.__a(n3);
}
function M2() {
  this.u = null, this.o = null;
}
l.unmount = function(n3) {
  var t3 = n3.__c;
  t3 && t3.__R && t3.__R(), t3 && true === n3.__h && (n3.type = null), T3 && T3(n3);
}, (U.prototype = new d()).__c = function(n3, t3) {
  var e3 = t3.__c, r3 = this;
  null == r3.t && (r3.t = []), r3.t.push(e3);
  var u4 = D(r3.__v), o4 = false, i4 = function() {
    o4 || (o4 = true, e3.__R = null, u4 ? u4(l4) : l4());
  };
  e3.__R = i4;
  var l4 = function() {
    if (!--r3.__u) {
      if (r3.state.__a) {
        var n4 = r3.state.__a;
        r3.__v.__k[0] = L2(n4, n4.__c.__P, n4.__c.__O);
      }
      var t4;
      for (r3.setState({ __a: r3.__b = null }); t4 = r3.t.pop(); )
        t4.forceUpdate();
    }
  }, c4 = true === t3.__h;
  r3.__u++ || c4 || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n3.then(i4, i4);
}, U.prototype.componentWillUnmount = function() {
  this.t = [];
}, U.prototype.render = function(n3, e3) {
  if (this.__b) {
    if (this.__v.__k) {
      var r3 = document.createElement("div"), o4 = this.__v.__k[0].__c;
      this.__v.__k[0] = I2(this.__b, r3, o4.__O = o4.__P);
    }
    this.__b = null;
  }
  var i4 = e3.__a && h(p, null, n3.fallback);
  return i4 && (i4.__h = null), [h(p, null, e3.__a ? null : n3.children), i4];
};
var V2 = function(n3, t3, e3) {
  if (++e3[1] === e3[0] && n3.o.delete(t3), n3.props.revealOrder && ("t" !== n3.props.revealOrder[0] || !n3.o.size))
    for (e3 = n3.u; e3; ) {
      for (; e3.length > 3; )
        e3.pop()();
      if (e3[1] < e3[0])
        break;
      n3.u = e3 = e3[2];
    }
};
(M2.prototype = new d()).__a = function(n3) {
  var t3 = this, e3 = D(t3.__v), r3 = t3.o.get(n3);
  return r3[0]++, function(u4) {
    var o4 = function() {
      t3.props.revealOrder ? (r3.push(u4), V2(t3, n3, r3)) : u4();
    };
    e3 ? e3(o4) : o4();
  };
}, M2.prototype.render = function(n3) {
  this.u = null, this.o = /* @__PURE__ */ new Map();
  var t3 = x(n3.children);
  n3.revealOrder && "b" === n3.revealOrder[0] && t3.reverse();
  for (var e3 = t3.length; e3--; )
    this.o.set(t3[e3], this.u = [1, 0, this.u]);
  return n3.children;
}, M2.prototype.componentDidUpdate = M2.prototype.componentDidMount = function() {
  var n3 = this;
  this.o.forEach(function(t3, e3) {
    V2(n3, e3, t3);
  });
};
var j3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
var z3 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var B2 = "undefined" != typeof document;
var H2 = function(n3) {
  return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n3);
};
d.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
  Object.defineProperty(d.prototype, t3, { configurable: true, get: function() {
    return this["UNSAFE_" + t3];
  }, set: function(n3) {
    Object.defineProperty(this, t3, { configurable: true, writable: true, value: n3 });
  } });
});
var q3 = l.event;
function G() {
}
function J() {
  return this.cancelBubble;
}
function K() {
  return this.defaultPrevented;
}
l.event = function(n3) {
  return q3 && (n3 = q3(n3)), n3.persist = G, n3.isPropagationStopped = J, n3.isDefaultPrevented = K, n3.nativeEvent = n3;
};
var Q;
var X = { configurable: true, get: function() {
  return this.class;
} };
var nn = l.vnode;
l.vnode = function(n3) {
  var t3 = n3.type, e3 = n3.props, u4 = e3;
  if ("string" == typeof t3) {
    var o4 = -1 === t3.indexOf("-");
    for (var i4 in u4 = {}, e3) {
      var l4 = e3[i4];
      B2 && "children" === i4 && "noscript" === t3 || "value" === i4 && "defaultValue" in e3 && null == l4 || ("defaultValue" === i4 && "value" in e3 && null == e3.value ? i4 = "value" : "download" === i4 && true === l4 ? l4 = "" : /ondoubleclick/i.test(i4) ? i4 = "ondblclick" : /^onchange(textarea|input)/i.test(i4 + t3) && !H2(e3.type) ? i4 = "oninput" : /^onfocus$/i.test(i4) ? i4 = "onfocusin" : /^onblur$/i.test(i4) ? i4 = "onfocusout" : /^on(Ani|Tra|Tou|BeforeInp|Compo)/.test(i4) ? i4 = i4.toLowerCase() : o4 && z3.test(i4) ? i4 = i4.replace(/[A-Z0-9]/g, "-$&").toLowerCase() : null === l4 && (l4 = void 0), /^oninput$/i.test(i4) && (i4 = i4.toLowerCase(), u4[i4] && (i4 = "oninputCapture")), u4[i4] = l4);
    }
    "select" == t3 && u4.multiple && Array.isArray(u4.value) && (u4.value = x(e3.children).forEach(function(n4) {
      n4.props.selected = -1 != u4.value.indexOf(n4.props.value);
    })), "select" == t3 && null != u4.defaultValue && (u4.value = x(e3.children).forEach(function(n4) {
      n4.props.selected = u4.multiple ? -1 != u4.defaultValue.indexOf(n4.props.value) : u4.defaultValue == n4.props.value;
    })), n3.props = u4, e3.class != e3.className && (X.enumerable = "className" in e3, null != e3.className && (u4.class = e3.className), Object.defineProperty(u4, "className", X));
  }
  n3.$$typeof = j3, nn && nn(n3);
};
var tn = l.__r;
l.__r = function(n3) {
  tn && tn(n3), Q = n3.__c;
};

// node_modules/preact-render-to-string/dist/index.mjs
var n2 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i;
var o3 = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
var i3 = /[\s\n\\/='"\0<>]/;
var l3 = /^xlink:?./;
var a3 = /["&<]/;
function s3(e3) {
  if (false === a3.test(e3 += ""))
    return e3;
  for (var t3 = 0, r3 = 0, n3 = "", o4 = ""; r3 < e3.length; r3++) {
    switch (e3.charCodeAt(r3)) {
      case 34:
        o4 = "&quot;";
        break;
      case 38:
        o4 = "&amp;";
        break;
      case 60:
        o4 = "&lt;";
        break;
      default:
        continue;
    }
    r3 !== t3 && (n3 += e3.slice(t3, r3)), n3 += o4, t3 = r3 + 1;
  }
  return r3 !== t3 && (n3 += e3.slice(t3, r3)), n3;
}
var f3 = function(e3, t3) {
  return String(e3).replace(/(\n+)/g, "$1" + (t3 || "	"));
};
var u3 = function(e3, t3, r3) {
  return String(e3).length > (t3 || 40) || !r3 && -1 !== String(e3).indexOf("\n") || -1 !== String(e3).indexOf("<");
};
var c3 = {};
var _3 = /([A-Z])/g;
function p3(e3) {
  var t3 = "";
  for (var r3 in e3) {
    var o4 = e3[r3];
    null != o4 && "" !== o4 && (t3 && (t3 += " "), t3 += "-" == r3[0] ? r3 : c3[r3] || (c3[r3] = r3.replace(_3, "-$1").toLowerCase()), t3 = "number" == typeof o4 && false === n2.test(r3) ? t3 + ": " + o4 + "px;" : t3 + ": " + o4 + ";");
  }
  return t3 || void 0;
}
function d3(e3, t3) {
  return Array.isArray(t3) ? t3.reduce(d3, e3) : null != t3 && false !== t3 && e3.push(t3), e3;
}
function v3() {
  this.__d = true;
}
function h3(e3, t3) {
  return { __v: e3, context: t3, props: e3.props, setState: v3, forceUpdate: v3, __d: true, __h: [] };
}
function g4(e3, t3) {
  var r3 = e3.contextType, n3 = r3 && t3[r3.__c];
  return null != r3 ? n3 ? n3.props.value : r3.__ : t3;
}
var y3 = [];
function m3(r3, n3, a4, c4, _4, v4) {
  if (null == r3 || "boolean" == typeof r3)
    return "";
  if ("object" != typeof r3)
    return "function" == typeof r3 ? "" : s3(r3);
  var b4 = a4.pretty, x5 = b4 && "string" == typeof b4 ? b4 : "	";
  if (Array.isArray(r3)) {
    for (var k4 = "", S3 = 0; S3 < r3.length; S3++)
      b4 && S3 > 0 && (k4 += "\n"), k4 += m3(r3[S3], n3, a4, c4, _4, v4);
    return k4;
  }
  if (void 0 !== r3.constructor)
    return "";
  var w4, C4 = r3.type, O4 = r3.props, j5 = false;
  if ("function" == typeof C4) {
    if (j5 = true, !a4.shallow || !c4 && false !== a4.renderRootComponent) {
      if (C4 === p) {
        var A4 = [];
        return d3(A4, r3.props.children), m3(A4, n3, a4, false !== a4.shallowHighOrder, _4, v4);
      }
      var F3, H3 = r3.__c = h3(r3, n3);
      l.__b && l.__b(r3);
      var M3 = l.__r;
      if (C4.prototype && "function" == typeof C4.prototype.render) {
        var L3 = g4(C4, n3);
        (H3 = r3.__c = new C4(O4, L3)).__v = r3, H3._dirty = H3.__d = true, H3.props = O4, null == H3.state && (H3.state = {}), null == H3._nextState && null == H3.__s && (H3._nextState = H3.__s = H3.state), H3.context = L3, C4.getDerivedStateFromProps ? H3.state = Object.assign({}, H3.state, C4.getDerivedStateFromProps(H3.props, H3.state)) : H3.componentWillMount && (H3.componentWillMount(), H3.state = H3._nextState !== H3.state ? H3._nextState : H3.__s !== H3.state ? H3.__s : H3.state), M3 && M3(r3), F3 = H3.render(H3.props, H3.state, H3.context);
      } else
        for (var T4 = g4(C4, n3), E2 = 0; H3.__d && E2++ < 25; )
          H3.__d = false, M3 && M3(r3), F3 = C4.call(r3.__c, O4, T4);
      return H3.getChildContext && (n3 = Object.assign({}, n3, H3.getChildContext())), l.diffed && l.diffed(r3), m3(F3, n3, a4, false !== a4.shallowHighOrder, _4, v4);
    }
    C4 = (w4 = C4).displayName || w4 !== Function && w4.name || function(e3) {
      var t3 = (Function.prototype.toString.call(e3).match(/^\s*function\s+([^( ]+)/) || "")[1];
      if (!t3) {
        for (var r4 = -1, n4 = y3.length; n4--; )
          if (y3[n4] === e3) {
            r4 = n4;
            break;
          }
        r4 < 0 && (r4 = y3.push(e3) - 1), t3 = "UnnamedComponent" + r4;
      }
      return t3;
    }(w4);
  }
  var $2, D2, N2 = "<" + C4;
  if (O4) {
    var P2 = Object.keys(O4);
    a4 && true === a4.sortAttributes && P2.sort();
    for (var W = 0; W < P2.length; W++) {
      var I3 = P2[W], R2 = O4[I3];
      if ("children" !== I3) {
        if (!i3.test(I3) && (a4 && a4.allAttributes || "key" !== I3 && "ref" !== I3 && "__self" !== I3 && "__source" !== I3)) {
          if ("defaultValue" === I3)
            I3 = "value";
          else if ("defaultChecked" === I3)
            I3 = "checked";
          else if ("defaultSelected" === I3)
            I3 = "selected";
          else if ("className" === I3) {
            if (void 0 !== O4.class)
              continue;
            I3 = "class";
          } else
            _4 && l3.test(I3) && (I3 = I3.toLowerCase().replace(/^xlink:?/, "xlink:"));
          if ("htmlFor" === I3) {
            if (O4.for)
              continue;
            I3 = "for";
          }
          "style" === I3 && R2 && "object" == typeof R2 && (R2 = p3(R2)), "a" === I3[0] && "r" === I3[1] && "boolean" == typeof R2 && (R2 = String(R2));
          var U2 = a4.attributeHook && a4.attributeHook(I3, R2, n3, a4, j5);
          if (U2 || "" === U2)
            N2 += U2;
          else if ("dangerouslySetInnerHTML" === I3)
            D2 = R2 && R2.__html;
          else if ("textarea" === C4 && "value" === I3)
            $2 = R2;
          else if ((R2 || 0 === R2 || "" === R2) && "function" != typeof R2) {
            if (!(true !== R2 && "" !== R2 || (R2 = I3, a4 && a4.xml))) {
              N2 = N2 + " " + I3;
              continue;
            }
            if ("value" === I3) {
              if ("select" === C4) {
                v4 = R2;
                continue;
              }
              "option" === C4 && v4 == R2 && void 0 === O4.selected && (N2 += " selected");
            }
            N2 = N2 + " " + I3 + '="' + s3(R2) + '"';
          }
        }
      } else
        $2 = R2;
    }
  }
  if (b4) {
    var V3 = N2.replace(/\n\s*/, " ");
    V3 === N2 || ~V3.indexOf("\n") ? b4 && ~N2.indexOf("\n") && (N2 += "\n") : N2 = V3;
  }
  if (N2 += ">", i3.test(C4))
    throw new Error(C4 + " is not a valid HTML tag name in " + N2);
  var q4, z4 = o3.test(C4) || a4.voidElements && a4.voidElements.test(C4), Z = [];
  if (D2)
    b4 && u3(D2) && (D2 = "\n" + x5 + f3(D2, x5)), N2 += D2;
  else if (null != $2 && d3(q4 = [], $2).length) {
    for (var B3 = b4 && ~N2.indexOf("\n"), G2 = false, J2 = 0; J2 < q4.length; J2++) {
      var K2 = q4[J2];
      if (null != K2 && false !== K2) {
        var Q2 = m3(K2, n3, a4, true, "svg" === C4 || "foreignObject" !== C4 && _4, v4);
        if (b4 && !B3 && u3(Q2) && (B3 = true), Q2)
          if (b4) {
            var X2 = Q2.length > 0 && "<" != Q2[0];
            G2 && X2 ? Z[Z.length - 1] += Q2 : Z.push(Q2), G2 = X2;
          } else
            Z.push(Q2);
      }
    }
    if (b4 && B3)
      for (var Y = Z.length; Y--; )
        Z[Y] = "\n" + x5 + f3(Z[Y], x5);
  }
  if (Z.length || D2)
    N2 += Z.join("");
  else if (a4 && a4.xml)
    return N2.substring(0, N2.length - 1) + " />";
  return !z4 || q4 || D2 ? (b4 && ~N2.indexOf("\n") && (N2 += "\n"), N2 = N2 + "</" + C4 + ">") : N2 = N2.replace(/>$/, " />"), N2;
}
var b3 = { shallow: true };
S2.render = S2;
var x4 = function(e3, t3) {
  return S2(e3, t3, b3);
};
var k3 = [];
function S2(n3, o4, i4) {
  o4 = o4 || {};
  var l4 = l.__s;
  l.__s = true;
  var a4, s4 = h(p, null);
  return s4.__k = [n3], a4 = i4 && (i4.pretty || i4.voidElements || i4.sortAttributes || i4.shallow || i4.allAttributes || i4.xml || i4.attributeHook) ? m3(n3, o4, i4) : F2(n3, o4, false, void 0, s4), l.__c && l.__c(n3, k3), l.__s = l4, k3.length = 0, a4;
}
function w3(e3) {
  return null == e3 || "boolean" == typeof e3 ? null : "string" == typeof e3 || "number" == typeof e3 || "bigint" == typeof e3 ? h(null, null, e3) : e3;
}
function C3(e3, t3) {
  return "className" === e3 ? "class" : "htmlFor" === e3 ? "for" : "defaultValue" === e3 ? "value" : "defaultChecked" === e3 ? "checked" : "defaultSelected" === e3 ? "selected" : t3 && l3.test(e3) ? e3.toLowerCase().replace(/^xlink:?/, "xlink:") : e3;
}
function O3(e3, t3) {
  return "style" === e3 && null != t3 && "object" == typeof t3 ? p3(t3) : "a" === e3[0] && "r" === e3[1] && "boolean" == typeof t3 ? String(t3) : t3;
}
var j4 = Array.isArray;
var A3 = Object.assign;
function F2(r3, n3, l4, a4, f4) {
  if (null == r3 || true === r3 || false === r3 || "" === r3)
    return "";
  if ("object" != typeof r3)
    return "function" == typeof r3 ? "" : s3(r3);
  if (j4(r3)) {
    var u4 = "";
    f4.__k = r3;
    for (var c4 = 0; c4 < r3.length; c4++)
      u4 += F2(r3[c4], n3, l4, a4, f4), r3[c4] = w3(r3[c4]);
    return u4;
  }
  if (void 0 !== r3.constructor)
    return "";
  r3.__ = f4, l.__b && l.__b(r3);
  var _4 = r3.type, p4 = r3.props;
  if ("function" == typeof _4) {
    var d4;
    if (_4 === p)
      d4 = p4.children;
    else {
      d4 = _4.prototype && "function" == typeof _4.prototype.render ? function(e3, r4) {
        var n4 = e3.type, o4 = g4(n4, r4), i4 = new n4(e3.props, o4);
        e3.__c = i4, i4.__v = e3, i4.__d = true, i4.props = e3.props, null == i4.state && (i4.state = {}), null == i4.__s && (i4.__s = i4.state), i4.context = o4, n4.getDerivedStateFromProps ? i4.state = A3({}, i4.state, n4.getDerivedStateFromProps(i4.props, i4.state)) : i4.componentWillMount && (i4.componentWillMount(), i4.state = i4.__s !== i4.state ? i4.__s : i4.state);
        var l5 = l.__r;
        return l5 && l5(e3), i4.render(i4.props, i4.state, i4.context);
      }(r3, n3) : function(e3, r4) {
        var n4, o4 = h3(e3, r4), i4 = g4(e3.type, r4);
        e3.__c = o4;
        for (var l5 = l.__r, a5 = 0; o4.__d && a5++ < 25; )
          o4.__d = false, l5 && l5(e3), n4 = e3.type.call(o4, e3.props, i4);
        return n4;
      }(r3, n3);
      var v4 = r3.__c;
      v4.getChildContext && (n3 = A3({}, n3, v4.getChildContext()));
    }
    var y4 = F2(d4 = null != d4 && d4.type === p && null == d4.key ? d4.props.children : d4, n3, l4, a4, r3);
    return l.diffed && l.diffed(r3), r3.__ = void 0, l.unmount && l.unmount(r3), y4;
  }
  var m4, b4, x5 = "<";
  if (x5 += _4, p4)
    for (var k4 in m4 = p4.children, p4) {
      var S3 = p4[k4];
      if (!("key" === k4 || "ref" === k4 || "__self" === k4 || "__source" === k4 || "children" === k4 || "className" === k4 && "class" in p4 || "htmlFor" === k4 && "for" in p4 || i3.test(k4))) {
        if (S3 = O3(k4 = C3(k4, l4), S3), "dangerouslySetInnerHTML" === k4)
          b4 = S3 && S3.__html;
        else if ("textarea" === _4 && "value" === k4)
          m4 = S3;
        else if ((S3 || 0 === S3 || "" === S3) && "function" != typeof S3) {
          if (true === S3 || "" === S3) {
            S3 = k4, x5 = x5 + " " + k4;
            continue;
          }
          if ("value" === k4) {
            if ("select" === _4) {
              a4 = S3;
              continue;
            }
            "option" !== _4 || a4 != S3 || "selected" in p4 || (x5 += " selected");
          }
          x5 = x5 + " " + k4 + '="' + s3(S3) + '"';
        }
      }
    }
  var H3 = x5;
  if (x5 += ">", i3.test(_4))
    throw new Error(_4 + " is not a valid HTML tag name in " + x5);
  var M3 = "", L3 = false;
  if (b4)
    M3 += b4, L3 = true;
  else if ("string" == typeof m4)
    M3 += s3(m4), L3 = true;
  else if (j4(m4)) {
    r3.__k = m4;
    for (var T4 = 0; T4 < m4.length; T4++) {
      var E2 = m4[T4];
      if (m4[T4] = w3(E2), null != E2 && false !== E2) {
        var $2 = F2(E2, n3, "svg" === _4 || "foreignObject" !== _4 && l4, a4, r3);
        $2 && (M3 += $2, L3 = true);
      }
    }
  } else if (null != m4 && false !== m4 && true !== m4) {
    r3.__k = [w3(m4)];
    var D2 = F2(m4, n3, "svg" === _4 || "foreignObject" !== _4 && l4, a4, r3);
    D2 && (M3 += D2, L3 = true);
  }
  if (l.diffed && l.diffed(r3), r3.__ = void 0, l.unmount && l.unmount(r3), L3)
    x5 += M3;
  else if (o3.test(_4))
    return H3 + " />";
  return x5 + "</" + _4 + ">";
}
S2.shallowRender = x4;

// spec/lab/ssr/client.jsx
function Hello() {
  let ref = _2();
  console.log(ref.current);
  ref.current = 123;
  return /* @__PURE__ */ h("div", null, "test");
}
function run() {
  let html1 = S2(h(Hello), {});
  let html2 = S2(h(Hello), {});
  console.log(html1);
}
export {
  Hello,
  run
};
