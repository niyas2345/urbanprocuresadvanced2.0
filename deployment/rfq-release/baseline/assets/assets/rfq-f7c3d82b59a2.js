var e = Object.create,
  t = Object.defineProperty,
  n = Object.getOwnPropertyDescriptor,
  r = Object.getOwnPropertyNames,
  i = Object.getPrototypeOf,
  a = Object.prototype.hasOwnProperty,
  o = (e, t) => () => (
    t || (e((t = { exports: {} }).exports, t), (e = null)),
    t.exports
  ),
  s = (e, i, o, s) => {
    if ((i && typeof i == `object`) || typeof i == `function`)
      for (var c = r(i), l = 0, u = c.length, d; l < u; l++)
        ((d = c[l]),
          !a.call(e, d) &&
            d !== o &&
            t(e, d, {
              get: ((e) => i[e]).bind(null, d),
              enumerable: !(s = n(i, d)) || s.enumerable,
            }));
    return e;
  },
  c = (n, r, o) => (
    (o = n == null ? {} : e(i(n))),
    s(
      r || !n || !n.__esModule || !a.call(n, `default`)
        ? t(o, `default`, { value: n, enumerable: !0 })
        : o,
      n,
    )
  );
(function () {
  let e = document.createElement(`link`).relList;
  if (e && e.supports && e.supports(`modulepreload`)) return;
  for (let e of document.querySelectorAll(`link[rel="modulepreload"]`)) n(e);
  new MutationObserver((e) => {
    for (let t of e)
      if (t.type === `childList`)
        for (let e of t.addedNodes)
          e.tagName === `LINK` && e.rel === `modulepreload` && n(e);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(e) {
    let t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerPolicy && (t.referrerPolicy = e.referrerPolicy),
      (t.credentials =
        e.crossOrigin === `use-credentials`
          ? `include`
          : e.crossOrigin === `anonymous`
            ? `omit`
            : `same-origin`),
      t
    );
  }
  function n(e) {
    if (e.ep) return;
    e.ep = !0;
    let n = t(e);
    fetch(e.href, n);
  }
})();
var l = o((e) => {
    function t(e, t) {
      var n = e.length;
      e.push(t);
      a: for (; 0 < n;) {
        var r = (n - 1) >>> 1,
          a = e[r];
        if (0 < i(a, t)) ((e[r] = t), (e[n] = a), (n = r));
        else break a;
      }
    }
    function n(e) {
      return e.length === 0 ? null : e[0];
    }
    function r(e) {
      if (e.length === 0) return null;
      var t = e[0],
        n = e.pop();
      if (n !== t) {
        e[0] = n;
        a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
          var s = 2 * (r + 1) - 1,
            c = e[s],
            l = s + 1,
            u = e[l];
          if (0 > i(c, n))
            l < a && 0 > i(u, c)
              ? ((e[r] = u), (e[l] = n), (r = l))
              : ((e[r] = c), (e[s] = n), (r = s));
          else if (l < a && 0 > i(u, n)) ((e[r] = u), (e[l] = n), (r = l));
          else break a;
        }
      }
      return t;
    }
    function i(e, t) {
      var n = e.sortIndex - t.sortIndex;
      return n === 0 ? e.id - t.id : n;
    }
    if (
      ((e.unstable_now = void 0),
      typeof performance == `object` && typeof performance.now == `function`)
    ) {
      var a = performance;
      e.unstable_now = function () {
        return a.now();
      };
    } else {
      var o = Date,
        s = o.now();
      e.unstable_now = function () {
        return o.now() - s;
      };
    }
    var c = [],
      l = [],
      u = 1,
      d = null,
      f = 3,
      p = !1,
      m = !1,
      h = !1,
      g = !1,
      _ = typeof setTimeout == `function` ? setTimeout : null,
      v = typeof clearTimeout == `function` ? clearTimeout : null,
      y = typeof setImmediate < `u` ? setImmediate : null;
    function b(e) {
      for (var i = n(l); i !== null;) {
        if (i.callback === null) r(l);
        else if (i.startTime <= e)
          (r(l), (i.sortIndex = i.expirationTime), t(c, i));
        else break;
        i = n(l);
      }
    }
    function x(e) {
      if (((h = !1), b(e), !m)) {
        if (n(c) !== null) ((m = !0), S || ((S = !0), E()));
        else {
          var t = n(l);
          t !== null && k(x, t.startTime - e);
        }
      }
    }
    var S = !1,
      ee = -1,
      C = 5,
      w = -1;
    function te() {
      return g ? !0 : !(e.unstable_now() - w < C);
    }
    function T() {
      if (((g = !1), S)) {
        var t = e.unstable_now();
        w = t;
        var i = !0;
        try {
          a: {
            ((m = !1), h && ((h = !1), v(ee), (ee = -1)), (p = !0));
            var a = f;
            try {
              b: {
                for (
                  b(t), d = n(c);
                  d !== null && !(d.expirationTime > t && te());
                ) {
                  var o = d.callback;
                  if (typeof o == `function`) {
                    ((d.callback = null), (f = d.priorityLevel));
                    var s = o(d.expirationTime <= t);
                    if (((t = e.unstable_now()), typeof s == `function`)) {
                      ((d.callback = s), b(t), (i = !0));
                      break b;
                    }
                    (d === n(c) && r(c), b(t));
                  } else r(c);
                  d = n(c);
                }
                if (d !== null) i = !0;
                else {
                  var u = n(l);
                  (u !== null && k(x, u.startTime - t), (i = !1));
                }
              }
              break a;
            } finally {
              ((d = null), (f = a), (p = !1));
            }
            i = void 0;
          }
        } finally {
          i ? E() : (S = !1);
        }
      }
    }
    var E;
    if (typeof y == `function`)
      E = function () {
        y(T);
      };
    else if (typeof MessageChannel < `u`) {
      var D = new MessageChannel(),
        O = D.port2;
      ((D.port1.onmessage = T),
        (E = function () {
          O.postMessage(null);
        }));
    } else
      E = function () {
        _(T, 0);
      };
    function k(t, n) {
      ee = _(function () {
        t(e.unstable_now());
      }, n);
    }
    ((e.unstable_IdlePriority = 5),
      (e.unstable_ImmediatePriority = 1),
      (e.unstable_LowPriority = 4),
      (e.unstable_NormalPriority = 3),
      (e.unstable_Profiling = null),
      (e.unstable_UserBlockingPriority = 2),
      (e.unstable_cancelCallback = function (e) {
        e.callback = null;
      }),
      (e.unstable_forceFrameRate = function (e) {
        0 > e || 125 < e
          ? console.error(
              `forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported`,
            )
          : (C = 0 < e ? Math.floor(1e3 / e) : 5);
      }),
      (e.unstable_getCurrentPriorityLevel = function () {
        return f;
      }),
      (e.unstable_next = function (e) {
        switch (f) {
          case 1:
          case 2:
          case 3:
            var t = 3;
            break;
          default:
            t = f;
        }
        var n = f;
        f = t;
        try {
          return e();
        } finally {
          f = n;
        }
      }),
      (e.unstable_requestPaint = function () {
        g = !0;
      }),
      (e.unstable_runWithPriority = function (e, t) {
        switch (e) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            e = 3;
        }
        var n = f;
        f = e;
        try {
          return t();
        } finally {
          f = n;
        }
      }),
      (e.unstable_scheduleCallback = function (r, i, a) {
        var o = e.unstable_now();
        switch (
          (typeof a == `object` && a
            ? ((a = a.delay), (a = typeof a == `number` && 0 < a ? o + a : o))
            : (a = o),
          r)
        ) {
          case 1:
            var s = -1;
            break;
          case 2:
            s = 250;
            break;
          case 5:
            s = 1073741823;
            break;
          case 4:
            s = 1e4;
            break;
          default:
            s = 5e3;
        }
        return (
          (s = a + s),
          (r = {
            id: u++,
            callback: i,
            priorityLevel: r,
            startTime: a,
            expirationTime: s,
            sortIndex: -1,
          }),
          a > o
            ? ((r.sortIndex = a),
              t(l, r),
              n(c) === null &&
                r === n(l) &&
                (h ? (v(ee), (ee = -1)) : (h = !0), k(x, a - o)))
            : ((r.sortIndex = s),
              t(c, r),
              m || p || ((m = !0), S || ((S = !0), E()))),
          r
        );
      }),
      (e.unstable_shouldYield = te),
      (e.unstable_wrapCallback = function (e) {
        var t = f;
        return function () {
          var n = f;
          f = t;
          try {
            return e.apply(this, arguments);
          } finally {
            f = n;
          }
        };
      }));
  }),
  u = o((e, t) => {
    t.exports = l();
  }),
  d = o((e) => {
    var t = Symbol.for(`react.transitional.element`),
      n = Symbol.for(`react.portal`),
      r = Symbol.for(`react.fragment`),
      i = Symbol.for(`react.strict_mode`),
      a = Symbol.for(`react.profiler`),
      o = Symbol.for(`react.consumer`),
      s = Symbol.for(`react.context`),
      c = Symbol.for(`react.forward_ref`),
      l = Symbol.for(`react.suspense`),
      u = Symbol.for(`react.memo`),
      d = Symbol.for(`react.lazy`),
      f = Symbol.for(`react.activity`),
      p = Symbol.for(`react.view_transition`),
      m = Symbol.iterator;
    function h(e) {
      return typeof e != `object` || !e
        ? null
        : ((e = (m && e[m]) || e[`@@iterator`]),
          typeof e == `function` ? e : null);
    }
    var g = {
        isMounted: function () {
          return !1;
        },
        enqueueForceUpdate: function () {},
        enqueueReplaceState: function () {},
        enqueueSetState: function () {},
      },
      _ = Object.assign,
      v = {};
    function y(e, t, n) {
      ((this.props = e),
        (this.context = t),
        (this.refs = v),
        (this.updater = n || g));
    }
    ((y.prototype.isReactComponent = {}),
      (y.prototype.setState = function (e, t) {
        if (typeof e != `object` && typeof e != `function` && e != null)
          throw Error(
            `takes an object of state variables to update or a function which returns an object of state variables.`,
          );
        this.updater.enqueueSetState(this, e, t, `setState`);
      }),
      (y.prototype.forceUpdate = function (e) {
        this.updater.enqueueForceUpdate(this, e, `forceUpdate`);
      }));
    function b() {}
    b.prototype = y.prototype;
    function x(e, t, n) {
      ((this.props = e),
        (this.context = t),
        (this.refs = v),
        (this.updater = n || g));
    }
    var S = (x.prototype = new b());
    ((S.constructor = x), _(S, y.prototype), (S.isPureReactComponent = !0));
    var ee = Array.isArray;
    function C() {}
    var w = { H: null, A: null, T: null, S: null },
      te = Object.prototype.hasOwnProperty;
    function T(e, n, r) {
      var i = r.ref;
      return {
        $$typeof: t,
        type: e,
        key: n,
        ref: i === void 0 ? null : i,
        props: r,
      };
    }
    function E(e, t) {
      return T(e.type, t, e.props);
    }
    function D(e) {
      return typeof e == `object` && !!e && e.$$typeof === t;
    }
    function O(e) {
      var t = { "=": `=0`, ":": `=2` };
      return (
        `$` +
        e.replace(/[=:]/g, function (e) {
          return t[e];
        })
      );
    }
    var k = /\/+/g;
    function ne(e, t) {
      return typeof e == `object` && e && e.key != null
        ? O(`` + e.key)
        : t.toString(36);
    }
    function re(e) {
      switch (e.status) {
        case `fulfilled`:
          return e.value;
        case `rejected`:
          throw e.reason;
        default:
          switch (
            (typeof e.status == `string`
              ? e.then(C, C)
              : ((e.status = `pending`),
                e.then(
                  function (t) {
                    e.status === `pending` &&
                      ((e.status = `fulfilled`), (e.value = t));
                  },
                  function (t) {
                    e.status === `pending` &&
                      ((e.status = `rejected`), (e.reason = t));
                  },
                )),
            e.status)
          ) {
            case `fulfilled`:
              return e.value;
            case `rejected`:
              throw e.reason;
          }
      }
      throw e;
    }
    function ie(e, r, i, a, o) {
      var s = typeof e;
      (s === `undefined` || s === `boolean`) && (e = null);
      var c = !1;
      if (e === null) c = !0;
      else
        switch (s) {
          case `bigint`:
          case `string`:
          case `number`:
            c = !0;
            break;
          case `object`:
            switch (e.$$typeof) {
              case t:
              case n:
                c = !0;
                break;
              case d:
                return ((c = e._init), ie(c(e._payload), r, i, a, o));
            }
        }
      if (c)
        return (
          (o = o(e)),
          (c = a === `` ? `.` + ne(e, 0) : a),
          ee(o)
            ? ((i = ``),
              c != null && (i = c.replace(k, `$&/`) + `/`),
              ie(o, r, i, ``, function (e) {
                return e;
              }))
            : o != null &&
              (D(o) &&
                (o = E(
                  o,
                  i +
                    (o.key == null || (e && e.key === o.key)
                      ? ``
                      : (`` + o.key).replace(k, `$&/`) + `/`) +
                    c,
                )),
              r.push(o)),
          1
        );
      c = 0;
      var l = a === `` ? `.` : a + `:`;
      if (ee(e))
        for (var u = 0; u < e.length; u++)
          ((a = e[u]), (s = l + ne(a, u)), (c += ie(a, r, i, s, o)));
      else if (((u = h(e)), typeof u == `function`))
        for (e = u.call(e), u = 0; !(a = e.next()).done;)
          ((a = a.value), (s = l + ne(a, u++)), (c += ie(a, r, i, s, o)));
      else if (s === `object`) {
        if (typeof e.then == `function`) return ie(re(e), r, i, a, o);
        throw (
          (r = String(e)),
          Error(
            `Objects are not valid as a React child (found: ` +
              (r === `[object Object]`
                ? `object with keys {` + Object.keys(e).join(`, `) + `}`
                : r) +
              `). If you meant to render a collection of children, use an array instead.`,
          )
        );
      }
      return c;
    }
    function A(e, t, n) {
      if (e == null) return e;
      var r = [],
        i = 0;
      return (
        ie(e, r, ``, ``, function (e) {
          return t.call(n, e, i++);
        }),
        r
      );
    }
    function ae(e) {
      if (e._status === -1) {
        var t = e._result,
          n = t();
        (n.then(
          function (t) {
            (e._status === 0 || e._status === -1) &&
              ((e._status = 1),
              (e._result = t),
              n.status === void 0 && ((n.status = `fulfilled`), (n.value = t)));
          },
          function (t) {
            (e._status === 0 || e._status === -1) &&
              ((e._status = 2),
              (e._result = t),
              n.status === void 0 && ((n.status = `rejected`), (n.reason = t)));
          },
        ),
          e._status === -1 && ((e._status = 0), (e._result = n)));
      }
      if (e._status === 1) return e._result.default;
      throw e._result;
    }
    var oe =
      typeof reportError == `function`
        ? reportError
        : function (e) {
            if (
              typeof window == `object` &&
              typeof window.ErrorEvent == `function`
            ) {
              var t = new window.ErrorEvent(`error`, {
                bubbles: !0,
                cancelable: !0,
                message:
                  typeof e == `object` && e && typeof e.message == `string`
                    ? String(e.message)
                    : String(e),
                error: e,
              });
              if (!window.dispatchEvent(t)) return;
            } else if (
              typeof process == `object` &&
              typeof process.emit == `function`
            ) {
              process.emit(`uncaughtException`, e);
              return;
            }
            console.error(e);
          };
    function se(e) {
      var t = w.T,
        n = {};
      ((n.types = t === null ? null : t.types), (w.T = n));
      try {
        var r = e(),
          i = w.S;
        (i !== null && i(n, r),
          typeof r == `object` &&
            r &&
            typeof r.then == `function` &&
            r.then(C, oe));
      } catch (e) {
        oe(e);
      } finally {
        (t !== null && n.types !== null && (t.types = n.types), (w.T = t));
      }
    }
    function ce(e) {
      var t = w.T;
      if (t !== null) {
        var n = t.types;
        n === null ? (t.types = [e]) : n.indexOf(e) === -1 && n.push(e);
      } else se(ce.bind(null, e));
    }
    var le = {
      map: A,
      forEach: function (e, t, n) {
        A(
          e,
          function () {
            t.apply(this, arguments);
          },
          n,
        );
      },
      count: function (e) {
        var t = 0;
        return (
          A(e, function () {
            t++;
          }),
          t
        );
      },
      toArray: function (e) {
        return (
          A(e, function (e) {
            return e;
          }) || []
        );
      },
      only: function (e) {
        if (!D(e))
          throw Error(
            `React.Children.only expected to receive a single React element child.`,
          );
        return e;
      },
    };
    ((e.Activity = f),
      (e.Children = le),
      (e.Component = y),
      (e.Fragment = r),
      (e.Profiler = a),
      (e.PureComponent = x),
      (e.StrictMode = i),
      (e.Suspense = l),
      (e.ViewTransition = p),
      (e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w),
      (e.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function (e) {
          return w.H.useMemoCache(e);
        },
      }),
      (e.addTransitionType = ce),
      (e.cache = function (e) {
        return function () {
          return e.apply(null, arguments);
        };
      }),
      (e.cacheSignal = function () {
        return null;
      }),
      (e.cloneElement = function (e, t, n) {
        if (e == null)
          throw Error(
            `The argument must be a React element, but you passed ` + e + `.`,
          );
        var r = _({}, e.props),
          i = e.key;
        if (t != null)
          for (a in (t.key !== void 0 && (i = `` + t.key), t))
            !te.call(t, a) ||
              a === `key` ||
              a === `__self` ||
              a === `__source` ||
              (a === `ref` && t.ref === void 0) ||
              (r[a] = t[a]);
        var a = arguments.length - 2;
        if (a === 1) r.children = n;
        else if (1 < a) {
          for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
          r.children = o;
        }
        return T(e.type, i, r);
      }),
      (e.createContext = function (e) {
        return (
          (e = {
            $$typeof: s,
            _currentValue: e,
            _currentValue2: e,
            _threadCount: 0,
            Provider: null,
            Consumer: null,
          }),
          (e.Provider = e),
          (e.Consumer = { $$typeof: o, _context: e }),
          e
        );
      }),
      (e.createElement = function (e, t, n) {
        var r,
          i = {},
          a = null;
        if (t != null)
          for (r in (t.key !== void 0 && (a = `` + t.key), t))
            te.call(t, r) &&
              r !== `key` &&
              r !== `__self` &&
              r !== `__source` &&
              (i[r] = t[r]);
        var o = arguments.length - 2;
        if (o === 1) i.children = n;
        else if (1 < o) {
          for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
          i.children = s;
        }
        if (e && e.defaultProps)
          for (r in ((o = e.defaultProps), o)) i[r] === void 0 && (i[r] = o[r]);
        return T(e, a, i);
      }),
      (e.createRef = function () {
        return { current: null };
      }),
      (e.forwardRef = function (e) {
        return { $$typeof: c, render: e };
      }),
      (e.isValidElement = D),
      (e.lazy = function (e) {
        return {
          $$typeof: d,
          _payload: { _status: -1, _result: e },
          _init: ae,
        };
      }),
      (e.memo = function (e, t) {
        return { $$typeof: u, type: e, compare: t === void 0 ? null : t };
      }),
      (e.startTransition = se),
      (e.unstable_useCacheRefresh = function () {
        return w.H.useCacheRefresh();
      }),
      (e.use = function (e) {
        return w.H.use(e);
      }),
      (e.useActionState = function (e, t, n) {
        return w.H.useActionState(e, t, n);
      }),
      (e.useCallback = function (e, t) {
        return w.H.useCallback(e, t);
      }),
      (e.useContext = function (e) {
        return w.H.useContext(e);
      }),
      (e.useDebugValue = function () {}),
      (e.useDeferredValue = function (e, t) {
        return w.H.useDeferredValue(e, t);
      }),
      (e.useEffect = function (e, t) {
        return w.H.useEffect(e, t);
      }),
      (e.useEffectEvent = function (e) {
        return w.H.useEffectEvent(e);
      }),
      (e.useId = function () {
        return w.H.useId();
      }),
      (e.useImperativeHandle = function (e, t, n) {
        return w.H.useImperativeHandle(e, t, n);
      }),
      (e.useInsertionEffect = function (e, t) {
        return w.H.useInsertionEffect(e, t);
      }),
      (e.useLayoutEffect = function (e, t) {
        return w.H.useLayoutEffect(e, t);
      }),
      (e.useMemo = function (e, t) {
        return w.H.useMemo(e, t);
      }),
      (e.useOptimistic = function (e, t) {
        return w.H.useOptimistic(e, t);
      }),
      (e.useReducer = function (e, t, n) {
        return w.H.useReducer(e, t, n);
      }),
      (e.useRef = function (e) {
        return w.H.useRef(e);
      }),
      (e.useState = function (e) {
        return w.H.useState(e);
      }),
      (e.useSyncExternalStore = function (e, t, n) {
        return w.H.useSyncExternalStore(e, t, n);
      }),
      (e.useTransition = function () {
        return w.H.useTransition();
      }),
      (e.version = `19.3.0`));
  }),
  f = o((e, t) => {
    t.exports = d();
  }),
  p = o((e) => {
    var t = f();
    function n(e) {
      var t = `https://react.dev/errors/` + e;
      if (1 < arguments.length) {
        t += `?args[]=` + encodeURIComponent(arguments[1]);
        for (var n = 2; n < arguments.length; n++)
          t += `&args[]=` + encodeURIComponent(arguments[n]);
      }
      return (
        `Minified React error #` +
        e +
        `; visit ` +
        t +
        ` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
      );
    }
    function r() {}
    var i = {
        d: {
          f: r,
          r: function () {
            throw Error(n(522));
          },
          D: r,
          C: r,
          L: r,
          m: r,
          X: r,
          S: r,
          M: r,
        },
        p: 0,
        findDOMNode: null,
      },
      a = Symbol.for(`react.portal`),
      o = Symbol.for(`react.recoverable`),
      s = Symbol.for(`react.optimistic_key`);
    function c(e, t, n) {
      var r =
        3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
      return {
        $$typeof: a,
        key: r == null ? null : r === s ? s : `` + r,
        children: e,
        containerInfo: t,
        implementation: n,
      };
    }
    var l = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function u(e, t) {
      if (e === `font`) return ``;
      if (typeof t == `string`) return t === `use-credentials` ? t : ``;
    }
    ((e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i),
      (e.browser = function (e) {
        return { $$typeof: o, _reason: e };
      }),
      (e.createPortal = function (e, t) {
        var r =
          2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!t || (t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11))
          throw Error(n(299));
        return c(e, t, null, r);
      }),
      (e.flushSync = function (e) {
        var t = l.T,
          n = i.p;
        try {
          if (((l.T = null), (i.p = 2), e)) return e();
        } finally {
          ((l.T = t), (i.p = n), i.d.f());
        }
      }),
      (e.preconnect = function (e, t) {
        typeof e == `string` &&
          (t
            ? ((t = t.crossOrigin),
              (t =
                typeof t == `string`
                  ? t === `use-credentials`
                    ? t
                    : ``
                  : void 0))
            : (t = null),
          i.d.C(e, t));
      }),
      (e.prefetchDNS = function (e) {
        typeof e == `string` && i.d.D(e);
      }),
      (e.preinit = function (e, t) {
        if (typeof e == `string` && t && typeof t.as == `string`) {
          var n = t.as,
            r = u(n, t.crossOrigin),
            a = typeof t.integrity == `string` ? t.integrity : void 0,
            o = typeof t.fetchPriority == `string` ? t.fetchPriority : void 0;
          n === `style`
            ? i.d.S(
                e,
                typeof t.precedence == `string` ? t.precedence : void 0,
                { crossOrigin: r, integrity: a, fetchPriority: o },
              )
            : n === `script` &&
              i.d.X(e, {
                crossOrigin: r,
                integrity: a,
                fetchPriority: o,
                nonce: typeof t.nonce == `string` ? t.nonce : void 0,
              });
        }
      }),
      (e.preinitModule = function (e, t) {
        if (typeof e == `string`) {
          if (typeof t == `object` && t) {
            if (t.as == null || t.as === `script`) {
              var n = u(t.as, t.crossOrigin);
              i.d.M(e, {
                crossOrigin: n,
                integrity:
                  typeof t.integrity == `string` ? t.integrity : void 0,
                nonce: typeof t.nonce == `string` ? t.nonce : void 0,
                fetchPriority:
                  typeof t.fetchPriority == `string` ? t.fetchPriority : void 0,
              });
            }
          } else t ?? i.d.M(e);
        }
      }),
      (e.preload = function (e, t) {
        if (
          typeof e == `string` &&
          typeof t == `object` &&
          t &&
          typeof t.as == `string`
        ) {
          var n = t.as,
            r = u(n, t.crossOrigin);
          i.d.L(e, n, {
            crossOrigin: r,
            integrity: typeof t.integrity == `string` ? t.integrity : void 0,
            nonce: typeof t.nonce == `string` ? t.nonce : void 0,
            type: typeof t.type == `string` ? t.type : void 0,
            fetchPriority:
              typeof t.fetchPriority == `string` ? t.fetchPriority : void 0,
            referrerPolicy:
              typeof t.referrerPolicy == `string` ? t.referrerPolicy : void 0,
            imageSrcSet:
              typeof t.imageSrcSet == `string` ? t.imageSrcSet : void 0,
            imageSizes: typeof t.imageSizes == `string` ? t.imageSizes : void 0,
            media: typeof t.media == `string` ? t.media : void 0,
          });
        }
      }),
      (e.preloadModule = function (e, t) {
        if (typeof e == `string`) {
          if (t) {
            var n = u(t.as, t.crossOrigin);
            i.d.m(e, {
              as: typeof t.as == `string` && t.as !== `script` ? t.as : void 0,
              crossOrigin: n,
              integrity: typeof t.integrity == `string` ? t.integrity : void 0,
              nonce: typeof t.nonce == `string` ? t.nonce : void 0,
              fetchPriority:
                typeof t.fetchPriority == `string` ? t.fetchPriority : void 0,
            });
          } else i.d.m(e);
        }
      }),
      (e.requestFormReset = function (e) {
        i.d.r(e);
      }),
      (e.unstable_batchedUpdates = function (e, t) {
        return e(t);
      }),
      (e.useFormState = function (e, t, n) {
        return l.H.useFormState(e, t, n);
      }),
      (e.useFormStatus = function () {
        return l.H.useHostTransitionStatus();
      }),
      (e.version = `19.3.0`));
  }),
  m = o((e, t) => {
    function n() {
      if (
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < `u` &&
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == `function`
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
        } catch (e) {
          console.error(e);
        }
    }
    (n(), (t.exports = p()));
  }),
  h = o((e) => {
    var t = u(),
      n = f(),
      r = m();
    function i(e) {
      var t = `https://react.dev/errors/` + e;
      if (1 < arguments.length) {
        t += `?args[]=` + encodeURIComponent(arguments[1]);
        for (var n = 2; n < arguments.length; n++)
          t += `&args[]=` + encodeURIComponent(arguments[n]);
      }
      return (
        `Minified React error #` +
        e +
        `; visit ` +
        t +
        ` for the full message or use the non-minified dev environment for full errors and additional helpful warnings.`
      );
    }
    function a(e) {
      return !(
        !e ||
        (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
      );
    }
    function o(e) {
      for (var t = e, n = t; n && !n.alternate;)
        ((t = n), t.flags & 4098 && (e = t.return), (n = t.return));
      for (; t.return;) t = t.return;
      return t.tag === 3 ? e : null;
    }
    function s(e) {
      if (e.tag === 13) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function c(e) {
      if (e.tag === 31) {
        var t = e.memoizedState;
        if (
          (t === null &&
            ((e = e.alternate), e !== null && (t = e.memoizedState)),
          t !== null)
        )
          return t.dehydrated;
      }
      return null;
    }
    function l(e) {
      if (o(e) !== e) throw Error(i(188));
    }
    function d(e) {
      var t = e.alternate;
      if (!t) {
        if (((t = o(e)), t === null)) throw Error(i(188));
        return t === e ? e : null;
      }
      for (var n = e, r = t; ;) {
        var a = n.return;
        if (a === null) break;
        var s = a.alternate;
        if (s === null) {
          if (((r = a.return), r !== null)) {
            n = r;
            continue;
          }
          break;
        }
        if (a.child === s.child) {
          for (s = a.child; s;) {
            if (s === n) return (l(a), e);
            if (s === r) return (l(a), t);
            s = s.sibling;
          }
          throw Error(i(188));
        }
        if (n.return !== r.return) ((n = a), (r = s));
        else {
          for (var c = !1, u = a.child; u;) {
            if (u === n) {
              ((c = !0), (n = a), (r = s));
              break;
            }
            if (u === r) {
              ((c = !0), (r = a), (n = s));
              break;
            }
            u = u.sibling;
          }
          if (!c) {
            for (u = s.child; u;) {
              if (u === n) {
                ((c = !0), (n = s), (r = a));
                break;
              }
              if (u === r) {
                ((c = !0), (r = s), (n = a));
                break;
              }
              u = u.sibling;
            }
            if (!c) throw Error(i(189));
          }
        }
        if (n.alternate !== r) throw Error(i(190));
      }
      if (n.tag !== 3) throw Error(i(188));
      return n.stateNode.current === n ? e : t;
    }
    function p(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e;
      for (e = e.child; e !== null;) {
        if (((t = p(e)), t !== null)) return t;
        e = e.sibling;
      }
      return null;
    }
    function h(e, t, n, r, i, a) {
      for (; e !== null;) {
        if (
          ((e.tag === 5 || e.tag === 27 || e.tag === 6) && n(e, r, i, a)) ||
          ((e.tag !== 22 || e.memoizedState === null) &&
            (t || (e.tag !== 5 && e.tag !== 27)) &&
            h(e.child, t, n, r, i, a))
        )
          return !0;
        e = e.sibling;
      }
      return !1;
    }
    function g(e) {
      for (e = e.return; e !== null;) {
        if (e.tag === 3 || e.tag === 5 || e.tag === 27) return e;
        e = e.return;
      }
      return null;
    }
    function _(e) {
      var t = !1;
      for (
        e = e.return;
        e !== null &&
        (e.tag === 4 && (t = !0), e.tag !== 3 && e.tag !== 5 && e.tag !== 27);
      )
        e = e.return;
      return t;
    }
    function v(e) {
      var t = [null, null],
        n = g(e);
      return (n === null || y(t, e, n.child, { foundSelf: !1 }), t);
    }
    function y(e, t, n, r) {
      for (; n !== null;) {
        if (n === t) r.foundSelf = !0;
        else if (n.tag === 5 || n.tag === 27 || n.tag === 6) {
          if (r.foundSelf) return ((e[1] = n), !0);
          e[0] = n;
        } else if (
          (n.tag !== 22 || n.memoizedState === null) &&
          y(e, t, n.child, r)
        )
          return !0;
        n = n.sibling;
      }
      return !1;
    }
    function b(e) {
      switch (e.tag) {
        case 5:
        case 27:
        case 6:
          return e.stateNode;
        case 3:
          return e.stateNode.containerInfo;
        default:
          throw Error(i(559));
      }
    }
    var x = null,
      S = null;
    function ee(e, t, n) {
      return e === n || (e === t && ((x = e), !0));
    }
    function C(e, t, n) {
      return e === n ? ((S = e), !1) : e === t && (S !== null && (x = e), !0);
    }
    function w(e) {
      if (e === null) return null;
      do e = e === null ? null : e.return;
      while (e && e.tag !== 5 && e.tag !== 27 && e.tag !== 3);
      return e || null;
    }
    function te(e, t, n) {
      for (var r = 0, i = e; i; i = n(i)) r++;
      i = 0;
      for (var a = t; a; a = n(a)) i++;
      for (; 0 < r - i;) ((e = n(e)), r--);
      for (; 0 < i - r;) ((t = n(t)), i--);
      for (; r--;) {
        if (e === t || (t !== null && e === t.alternate)) return e;
        ((e = n(e)), (t = n(t)));
      }
      return null;
    }
    var T = Object.assign,
      E = Symbol.for(`react.element`),
      D = Symbol.for(`react.transitional.element`),
      O = Symbol.for(`react.portal`),
      k = Symbol.for(`react.fragment`),
      ne = Symbol.for(`react.strict_mode`),
      re = Symbol.for(`react.profiler`),
      ie = Symbol.for(`react.consumer`),
      A = Symbol.for(`react.context`),
      ae = Symbol.for(`react.forward_ref`),
      oe = Symbol.for(`react.suspense`),
      se = Symbol.for(`react.suspense_list`),
      ce = Symbol.for(`react.memo`),
      le = Symbol.for(`react.lazy`),
      ue = Symbol.for(`react.activity`),
      de = Symbol.for(`react.legacy_hidden`),
      fe = Symbol.for(`react.memo_cache_sentinel`),
      pe = Symbol.for(`react.view_transition`),
      me = Symbol.for(`react.recoverable`),
      he = Symbol.iterator;
    function ge(e) {
      return typeof e != `object` || !e
        ? null
        : ((e = (he && e[he]) || e[`@@iterator`]),
          typeof e == `function` ? e : null);
    }
    var _e = Symbol.for(`react.client.reference`);
    function ve(e) {
      if (e == null) return null;
      if (typeof e == `function`)
        return e.$$typeof === _e ? null : e.displayName || e.name || null;
      if (typeof e == `string`) return e;
      switch (e) {
        case k:
          return `Fragment`;
        case re:
          return `Profiler`;
        case ne:
          return `StrictMode`;
        case oe:
          return `Suspense`;
        case se:
          return `SuspenseList`;
        case ue:
          return `Activity`;
        case pe:
          return `ViewTransition`;
      }
      if (typeof e == `object`)
        switch (e.$$typeof) {
          case O:
            return `Portal`;
          case A:
            return e.displayName || `Context`;
          case ie:
            return (e._context.displayName || `Context`) + `.Consumer`;
          case ae:
            var t = e.render;
            return (
              (e = e.displayName),
              (e ||=
                ((e = t.displayName || t.name || ``),
                e === `` ? `ForwardRef` : `ForwardRef(` + e + `)`)),
              e
            );
          case ce:
            return (
              (t = e.displayName || null),
              t === null ? ve(e.type) || `Memo` : t
            );
          case le:
            ((t = e._payload), (e = e._init));
            try {
              return ve(e(t));
            } catch {}
        }
      return null;
    }
    var ye = Array.isArray,
      j = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      M = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
      be = { pending: !1, data: null, method: null, action: null },
      xe = [],
      Se = -1;
    function Ce(e) {
      return { current: e };
    }
    function we(e) {
      0 > Se || ((e.current = xe[Se]), (xe[Se] = null), Se--);
    }
    function N(e, t) {
      (Se++, (xe[Se] = e.current), (e.current = t));
    }
    var Te = Ce(null),
      Ee = Ce(null),
      P = Ce(null),
      De = Ce(null);
    function Oe(e, t) {
      switch ((N(P, t), N(Ee, e), N(Te, null), t.nodeType)) {
        case 9:
        case 11:
          e = (e = t.documentElement) && (e = e.namespaceURI) ? up(e) : 0;
          break;
        default:
          if (((e = t.tagName), (t = t.namespaceURI)))
            ((t = up(t)), (e = dp(t, e)));
          else
            switch (e) {
              case `svg`:
                e = 1;
                break;
              case `math`:
                e = 2;
                break;
              default:
                e = 0;
            }
      }
      (we(Te), N(Te, e));
    }
    function F() {
      (we(Te), we(Ee), we(P));
    }
    function ke(e) {
      var t = e.memoizedState;
      (t !== null && ((sh._currentValue = t.memoizedState), N(De, e)),
        (t = Te.current));
      var n = dp(t, e.type);
      t !== n && (N(Ee, e), N(Te, n));
    }
    function Ae(e) {
      (Ee.current === e && (we(Te), we(Ee)),
        De.current === e && (we(De), (sh._currentValue = be)));
    }
    var je, Me;
    function Ne(e) {
      if (je === void 0)
        try {
          throw Error();
        } catch (e) {
          var t = e.stack.trim().match(/\n( *(at )?)/);
          ((je = (t && t[1]) || ``),
            (Me =
              -1 <
              e.stack.indexOf(`
    at`)
                ? ` (<anonymous>)`
                : -1 < e.stack.indexOf(`@`)
                  ? `@unknown:0:0`
                  : ``));
        }
      return (
        `
` +
        je +
        e +
        Me
      );
    }
    var Pe = !1;
    function Fe(e, t) {
      if (!e || Pe) return ``;
      Pe = !0;
      var n = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      try {
        var r = {
          DetermineComponentFrameRoot: function () {
            try {
              if (t) {
                var n = function () {
                  throw Error();
                };
                if (
                  (Object.defineProperty(n.prototype, "props", {
                    set: function () {
                      throw Error();
                    },
                  }),
                  typeof Reflect == `object` && Reflect.construct)
                ) {
                  try {
                    Reflect.construct(n, []);
                  } catch (e) {
                    var r = e;
                  }
                  Reflect.construct(e, [], n);
                } else {
                  try {
                    n.call();
                  } catch (e) {
                    r = e;
                  }
                  n = !1;
                  try {
                    var i = Object.getOwnPropertyDescriptor(
                      e.prototype,
                      `props`,
                    );
                    (Object.defineProperty(e.prototype, "props", {
                      configurable: !0,
                      set: function () {
                        throw Error();
                      },
                    }),
                      (n = !0),
                      new e());
                  } finally {
                    n &&
                      (i === void 0
                        ? delete e.prototype.props
                        : Object.defineProperty(e.prototype, "props", i));
                  }
                }
              } else {
                try {
                  throw Error();
                } catch (e) {
                  r = e;
                }
                (n = e()) &&
                  typeof n.catch == `function` &&
                  n.catch(function () {});
              }
            } catch (e) {
              if (e && r && typeof e.stack == `string`)
                return [e.stack, r.stack];
            }
            return [null, null];
          },
        };
        r.DetermineComponentFrameRoot.displayName = `DetermineComponentFrameRoot`;
        var i = Object.getOwnPropertyDescriptor(
          r.DetermineComponentFrameRoot,
          `name`,
        );
        i &&
          i.configurable &&
          Object.defineProperty(r.DetermineComponentFrameRoot, "name", {
            value: `DetermineComponentFrameRoot`,
          });
        var a = r.DetermineComponentFrameRoot(),
          o = a[0],
          s = a[1];
        if (o && s) {
          var c = o.split(`
`),
            l = s.split(`
`);
          for (
            i = r = 0;
            r < c.length && !c[r].includes(`DetermineComponentFrameRoot`);
          )
            r++;
          for (; i < l.length && !l[i].includes(`DetermineComponentFrameRoot`);)
            i++;
          if (r === c.length || i === l.length)
            for (
              r = c.length - 1, i = l.length - 1;
              1 <= r && 0 <= i && c[r] !== l[i];
            )
              i--;
          for (; 1 <= r && 0 <= i; r--, i--)
            if (c[r] !== l[i]) {
              if (r !== 1 || i !== 1)
                do
                  if ((r--, i--, 0 > i || c[r] !== l[i])) {
                    var u =
                      `
` + c[r].replace(` at new `, ` at `);
                    return (
                      e.displayName &&
                        u.includes(`<anonymous>`) &&
                        (u = u.replace(`<anonymous>`, e.displayName)),
                      u
                    );
                  }
                while (1 <= r && 0 <= i);
              break;
            }
        }
      } finally {
        ((Pe = !1), (Error.prepareStackTrace = n));
      }
      return (n = e ? e.displayName || e.name : ``) ? Ne(n) : ``;
    }
    function I(e, t) {
      switch (e.tag) {
        case 26:
        case 27:
        case 5:
          return Ne(e.type);
        case 16:
          return Ne(`Lazy`);
        case 13:
          return e.child !== t && t !== null
            ? Ne(`Suspense Fallback`)
            : Ne(`Suspense`);
        case 19:
          return Ne(`SuspenseList`);
        case 0:
        case 15:
          return Fe(e.type, !1);
        case 11:
          return Fe(e.type.render, !1);
        case 1:
          return Fe(e.type, !0);
        case 31:
          return Ne(`Activity`);
        case 30:
          return Ne(`ViewTransition`);
        default:
          return ``;
      }
    }
    function L(e) {
      try {
        var t = ``,
          n = null;
        do ((t += I(e, n)), (n = e), (e = e.return));
        while (e);
        return t;
      } catch (e) {
        return (
          `
Error generating stack: ` +
          e.message +
          `
` +
          e.stack
        );
      }
    }
    var Ie = Object.prototype.hasOwnProperty,
      Le = t.unstable_scheduleCallback,
      Re = t.unstable_cancelCallback,
      ze = t.unstable_shouldYield,
      Be = t.unstable_requestPaint,
      Ve = t.unstable_now,
      He = t.unstable_getCurrentPriorityLevel,
      Ue = t.unstable_ImmediatePriority,
      We = t.unstable_UserBlockingPriority,
      Ge = t.unstable_NormalPriority,
      Ke = t.unstable_LowPriority,
      qe = t.unstable_IdlePriority,
      Je = t.log,
      Ye = t.unstable_setDisableYieldValue,
      Xe = null,
      Ze = null;
    function Qe(e) {
      if (
        (typeof Je == `function` && Ye(e),
        Ze && typeof Ze.setStrictMode == `function`)
      )
        try {
          Ze.setStrictMode(Xe, e);
        } catch {}
    }
    var $e = Math.clz32 ? Math.clz32 : nt,
      et = Math.log,
      tt = Math.LN2;
    function nt(e) {
      return ((e >>>= 0), e === 0 ? 32 : (31 - ((et(e) / tt) | 0)) | 0);
    }
    var rt = 256,
      it = 262144,
      at = 4194304;
    function ot(e) {
      var t = e & 42;
      if (t !== 0) return t;
      switch (e & -e) {
        case 1:
          return 1;
        case 2:
          return 2;
        case 4:
          return 4;
        case 8:
          return 8;
        case 16:
          return 16;
        case 32:
          return 32;
        case 64:
          return 64;
        case 128:
          return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
          return e & -e;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return e & 62914560;
        case 67108864:
          return 67108864;
        case 134217728:
          return 134217728;
        case 268435456:
          return 268435456;
        case 536870912:
          return 536870912;
        case 1073741824:
          return 0;
        default:
          return e;
      }
    }
    function st(e, t, n) {
      var r = e.pendingLanes;
      if (r === 0) return 0;
      var i = 0,
        a = e.suspendedLanes,
        o = e.pingedLanes;
      e = e.warmLanes;
      var s = r & 134217727;
      return (
        s === 0
          ? ((s = r & ~a),
            s === 0
              ? o === 0
                ? n || ((n = r & ~e), n !== 0 && (i = ot(n)))
                : (i = ot(o))
              : (i = ot(s)))
          : ((r = s & ~a),
            r === 0
              ? ((o &= s),
                o === 0
                  ? n || ((n = s & ~e), n !== 0 && (i = ot(n)))
                  : (i = ot(o)))
              : (i = ot(r))),
        i === 0
          ? 0
          : t !== 0 &&
              t !== i &&
              (t & a) === 0 &&
              ((a = i & -i), (n = t & -t), a >= n || (a === 32 && n & 4194048))
            ? t
            : i
      );
    }
    function ct(e, t) {
      return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
    }
    function lt(e, t) {
      t & 8 && (t |= t & 32);
      var n = e.entangledLanes;
      if (n !== 0)
        for (e = e.entanglements, n &= t; 0 < n;) {
          var r = 31 - $e(n),
            i = 1 << r;
          ((t |= e[r]), (n &= ~i));
        }
      return t;
    }
    function ut(e, t) {
      switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
          return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
          return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
          return -1;
        default:
          return -1;
      }
    }
    function dt() {
      var e = at;
      return ((at <<= 1), !(at & 62914560) && (at = 4194304), e);
    }
    function ft(e) {
      for (var t = [], n = 0; 31 > n; n++) t.push(e);
      return t;
    }
    function pt(e, t) {
      ((e.pendingLanes |= t),
        t !== 268435456 &&
          ((e.suspendedLanes = 0), (e.pingedLanes = 0), (e.warmLanes = 0)));
    }
    function mt(e, t, n, r, i, a) {
      var o = e.pendingLanes;
      ((e.pendingLanes = n),
        (e.suspendedLanes = 0),
        (e.pingedLanes = 0),
        (e.warmLanes = 0),
        (e.expiredLanes &= n),
        (e.entangledLanes &= n),
        (e.errorRecoveryDisabledLanes &= n),
        (e.shellSuspendCounter = 0));
      var s = e.entanglements,
        c = e.expirationTimes,
        l = e.hiddenUpdates;
      for (n = o & ~n; 0 < n;) {
        var u = 31 - $e(n),
          d = 1 << u;
        ((s[u] = 0), (c[u] = -1));
        var f = l[u];
        if (f !== null)
          for (l[u] = null, u = 0; u < f.length; u++) {
            var p = f[u];
            p !== null && (p.lane &= -536870913);
          }
        n &= ~d;
      }
      (r !== 0 && ht(e, r, 0),
        a !== 0 &&
          i === 0 &&
          e.tag !== 0 &&
          (e.suspendedLanes |= a & ~(o & ~t)));
    }
    function ht(e, t, n) {
      ((e.pendingLanes |= t), (e.suspendedLanes &= ~t));
      var r = 31 - $e(t);
      ((e.entangledLanes |= t),
        (e.entanglements[r] = e.entanglements[r] | 1073741824 | (n & 261930)));
    }
    function gt(e, t) {
      var n = (e.entangledLanes |= t);
      for (e = e.entanglements; n;) {
        var r = 31 - $e(n),
          i = 1 << r;
        ((i & t) | (e[r] & t) && (e[r] |= t), (n &= ~i));
      }
    }
    function _t(e, t) {
      var n = t & -t;
      return (
        (n = n & 42 ? 1 : vt(n)),
        (n & (e.suspendedLanes | t)) === 0 ? n : 0
      );
    }
    function vt(e) {
      switch (e) {
        case 2:
          e = 1;
          break;
        case 8:
          e = 4;
          break;
        case 32:
          e = 16;
          break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
          e = 128;
          break;
        case 268435456:
          e = 134217728;
          break;
        default:
          e = 0;
      }
      return e;
    }
    function yt(e) {
      return (
        (e &= -e),
        2 < e ? (8 < e ? (e & 134217727 ? 32 : 268435456) : 8) : 2
      );
    }
    function bt() {
      var e = M.p;
      return e === 0 ? ((e = window.event), e === void 0 ? 32 : Ch(e.type)) : e;
    }
    function xt(e, t) {
      var n = M.p;
      try {
        return ((M.p = e), t());
      } finally {
        M.p = n;
      }
    }
    var St = Math.random().toString(36).slice(2),
      Ct = `__reactFiber$` + St,
      wt = `__reactProps$` + St,
      Tt = `__reactContainer$` + St,
      Et = `__reactEvents$` + St,
      Dt = `__reactListeners$` + St,
      Ot = `__reactHandles$` + St,
      kt = `__reactResources$` + St,
      At = `__reactMarker$` + St,
      jt = `__reactLoad$` + St;
    function Mt(e) {
      (delete e[Ct], delete e[wt], delete e[Dt], delete e[Ot]);
    }
    function Nt(e) {
      var t;
      if ((t = e[Ct])) return t;
      for (var n = e.parentNode; n;) {
        if ((t = n[Tt] || n[Ct])) {
          if (
            ((n = t.alternate),
            t.child !== null || (n !== null && n.child !== null))
          )
            for (e = fm(e); e !== null;) {
              if ((n = e[Ct])) return n;
              e = fm(e);
            }
          return t;
        }
        ((e = n), (n = e.parentNode));
      }
      return null;
    }
    function Pt(e) {
      if ((e = e[Ct] || e[Tt])) {
        var t = e.tag;
        if (
          t === 5 ||
          t === 6 ||
          t === 13 ||
          t === 31 ||
          t === 26 ||
          t === 27 ||
          t === 3
        )
          return e;
      }
      return null;
    }
    function Ft(e) {
      var t = e.tag;
      if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
      throw Error(i(33));
    }
    function It(e) {
      var t = e[kt];
      return (
        (t ||= e[kt] =
          { hoistableStyles: new Map(), hoistableScripts: new Map() }),
        t
      );
    }
    function Lt(e) {
      e[At] = !0;
    }
    function Rt(e) {
      e[jt] = void 0;
    }
    var zt = new Set(),
      Bt = {};
    function Vt(e, t) {
      (Ht(e, t), Ht(e + `Capture`, t));
    }
    function Ht(e, t) {
      for (Bt[e] = t, e = 0; e < t.length; e++) zt.add(t[e]);
    }
    var Ut = RegExp(
        `^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$`,
      ),
      Wt = {},
      Gt = {};
    function Kt(e) {
      return Ie.call(Gt, e)
        ? !0
        : Ie.call(Wt, e)
          ? !1
          : Ut.test(e)
            ? (Gt[e] = !0)
            : ((Wt[e] = !0), !1);
    }
    var R = !1;
    function qt() {
      var e = R;
      return ((R = !1), e);
    }
    function Jt(e, t, n) {
      if (Kt(t)) {
        if (n === null) e.removeAttribute(t);
        else {
          switch (typeof n) {
            case `undefined`:
            case `function`:
            case `symbol`:
              e.removeAttribute(t);
              return;
            case `boolean`:
              var r = t.toLowerCase().slice(0, 5);
              if (r !== `data-` && r !== `aria-`) {
                e.removeAttribute(t);
                return;
              }
          }
          e.setAttribute(t, n);
        }
      }
    }
    function Yt(e, t, n) {
      if (n === null) e.removeAttribute(t);
      else {
        switch (typeof n) {
          case `undefined`:
          case `function`:
          case `symbol`:
          case `boolean`:
            e.removeAttribute(t);
            return;
        }
        e.setAttribute(t, n);
      }
    }
    function Xt(e, t, n, r) {
      if (r === null) e.removeAttribute(n);
      else {
        switch (typeof r) {
          case `undefined`:
          case `function`:
          case `symbol`:
          case `boolean`:
            e.removeAttribute(n);
            return;
        }
        e.setAttributeNS(t, n, r);
      }
    }
    function Zt(e) {
      switch (typeof e) {
        case `bigint`:
        case `boolean`:
        case `number`:
        case `string`:
        case `undefined`:
          return e;
        case `object`:
          return e;
        default:
          return ``;
      }
    }
    function Qt(e) {
      var t = e.type;
      return (
        (e = e.nodeName) &&
        e.toLowerCase() === `input` &&
        (t === `checkbox` || t === `radio`)
      );
    }
    function $t(e, t, n) {
      var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      if (
        !e.hasOwnProperty(t) &&
        r !== void 0 &&
        typeof r.get == `function` &&
        typeof r.set == `function`
      ) {
        var i = r.get,
          a = r.set;
        return (
          Object.defineProperty(e, t, {
            configurable: !0,
            get: function () {
              return i.call(this);
            },
            set: function (e) {
              ((n = `` + e), a.call(this, e));
            },
          }),
          Object.defineProperty(e, t, { enumerable: r.enumerable }),
          {
            getValue: function () {
              return n;
            },
            setValue: function (e) {
              n = `` + e;
            },
            stopTracking: function () {
              ((e._valueTracker = null), delete e[t]);
            },
          }
        );
      }
    }
    function en(e) {
      if (!e._valueTracker) {
        var t = Qt(e) ? `checked` : `value`;
        e._valueTracker = $t(e, t, `` + e[t]);
      }
    }
    function tn(e) {
      if (!e) return !1;
      var t = e._valueTracker;
      if (!t) return !0;
      var n = t.getValue(),
        r = ``;
      return (
        e && (r = Qt(e) ? (e.checked ? `true` : `false`) : e.value),
        (e = r),
        e !== n && (t.setValue(e), !0)
      );
    }
    var nn = /[\n"\\]/g;
    function rn(e) {
      return e.replace(nn, function (e) {
        return `\\` + e.charCodeAt(0).toString(16) + ` `;
      });
    }
    function an(e, t, n, r, i, a, o, s) {
      ((e.name = ``),
        o != null &&
        typeof o != `function` &&
        typeof o != `symbol` &&
        typeof o != `boolean`
          ? (e.type = o)
          : e.removeAttribute(`type`),
        t == null
          ? (o !== `submit` && o !== `reset`) || e.removeAttribute(`value`)
          : o === `number`
            ? ((t === 0 && e.value === ``) || e.value != t) &&
              (e.value = `` + Zt(t))
            : e.value !== `` + Zt(t) && (e.value = `` + Zt(t)),
        t == null
          ? n == null
            ? r != null && e.removeAttribute(`value`)
            : sn(e, Zt(n))
          : o === `number` && e.value == t
            ? sn(e, Zt(e.value))
            : sn(e, Zt(t)),
        i == null && a != null && (e.defaultChecked = !!a),
        i != null &&
          (e.checked = i && typeof i != `function` && typeof i != `symbol`),
        s != null &&
        typeof s != `function` &&
        typeof s != `symbol` &&
        typeof s != `boolean`
          ? (e.name = `` + Zt(s))
          : e.removeAttribute(`name`));
    }
    function on(e, t, n, r, i, a, o, s) {
      if (
        (a != null &&
          typeof a != `function` &&
          typeof a != `symbol` &&
          typeof a != `boolean` &&
          (e.type = a),
        t != null || n != null)
      ) {
        if (!((a !== `submit` && a !== `reset`) || t != null)) {
          en(e);
          return;
        }
        ((n = n == null ? `` : `` + Zt(n)),
          (t = t == null ? n : `` + Zt(t)),
          s || t === e.value || (e.value = t),
          (e.defaultValue = t));
      }
      ((r ??= i),
        (r = typeof r != `function` && typeof r != `symbol` && !!r),
        (e.checked = s ? e.checked : !!r),
        (e.defaultChecked = !!r),
        o != null &&
          typeof o != `function` &&
          typeof o != `symbol` &&
          typeof o != `boolean` &&
          (e.name = o),
        en(e));
    }
    function sn(e, t) {
      e.defaultValue !== `` + t && (e.defaultValue = `` + t);
    }
    function cn(e, t, n, r) {
      if (((e = e.options), t)) {
        t = {};
        for (var i = 0; i < n.length; i++) t[`$` + n[i]] = !0;
        for (n = 0; n < e.length; n++)
          ((i = t.hasOwnProperty(`$` + e[n].value)),
            e[n].selected !== i && (e[n].selected = i),
            i && r && (e[n].defaultSelected = !0));
      } else {
        for (n = `` + Zt(n), t = null, i = 0; i < e.length; i++) {
          if (e[i].value === n) {
            ((e[i].selected = !0), r && (e[i].defaultSelected = !0));
            return;
          }
          t !== null || e[i].disabled || (t = e[i]);
        }
        t !== null && (t.selected = !0);
      }
    }
    function ln(e, t, n) {
      if (
        t != null &&
        ((t = `` + Zt(t)), t !== e.value && (e.value = t), n == null)
      ) {
        e.defaultValue !== t && (e.defaultValue = t);
        return;
      }
      e.defaultValue = n == null ? `` : `` + Zt(n);
    }
    function un(e, t, n, r) {
      if (t == null) {
        if (r != null) {
          if (n != null) throw Error(i(92));
          if (ye(r)) {
            if (1 < r.length) throw Error(i(93));
            r = r[0];
          }
          n = r;
        }
        ((n ??= ``), (t = n));
      }
      ((n = Zt(t)),
        (e.defaultValue = n),
        (r = e.textContent),
        r === n && r !== `` && r !== null && (e.value = r),
        en(e));
    }
    function dn(e, t) {
      if (t) {
        var n = e.firstChild;
        if (n && n === e.lastChild && n.nodeType === 3) {
          n.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }
    var fn = new Set(
      `animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp`.split(
        ` `,
      ),
    );
    function pn(e, t, n) {
      var r = t.indexOf(`--`) === 0;
      n == null || typeof n == `boolean` || n === ``
        ? r
          ? e.setProperty(t, ``)
          : t === `float`
            ? (e.cssFloat = ``)
            : (e[t] = ``)
        : r
          ? e.setProperty(t, n)
          : typeof n != `number` || n === 0 || fn.has(t)
            ? t === `float`
              ? (e.cssFloat = n)
              : (e[t] = (`` + n).trim())
            : (e[t] = n + `px`);
    }
    function mn(e, t, n) {
      if (t != null && typeof t != `object`) throw Error(i(62));
      if (((e = e.style), n != null)) {
        for (var r in n)
          !n.hasOwnProperty(r) ||
            (t != null && t.hasOwnProperty(r)) ||
            (r.indexOf(`--`) === 0
              ? e.setProperty(r, ``)
              : r === `float`
                ? (e.cssFloat = ``)
                : (e[r] = ``),
            (R = !0));
        for (var a in t)
          ((r = t[a]),
            t.hasOwnProperty(a) && n[a] !== r && (pn(e, a, r), (R = !0)));
      } else for (var o in t) t.hasOwnProperty(o) && pn(e, o, t[o]);
    }
    function hn(e) {
      if (e.indexOf(`-`) === -1) return !1;
      switch (e) {
        case `annotation-xml`:
        case `color-profile`:
        case `font-face`:
        case `font-face-src`:
        case `font-face-uri`:
        case `font-face-format`:
        case `font-face-name`:
        case `missing-glyph`:
          return !1;
        default:
          return !0;
      }
    }
    var gn = new Map([
        [`acceptCharset`, `accept-charset`],
        [`htmlFor`, `for`],
        [`httpEquiv`, `http-equiv`],
        [`crossOrigin`, `crossorigin`],
        [`accentHeight`, `accent-height`],
        [`alignmentBaseline`, `alignment-baseline`],
        [`arabicForm`, `arabic-form`],
        [`baselineShift`, `baseline-shift`],
        [`capHeight`, `cap-height`],
        [`clipPath`, `clip-path`],
        [`clipRule`, `clip-rule`],
        [`colorInterpolation`, `color-interpolation`],
        [`colorInterpolationFilters`, `color-interpolation-filters`],
        [`colorProfile`, `color-profile`],
        [`colorRendering`, `color-rendering`],
        [`dominantBaseline`, `dominant-baseline`],
        [`enableBackground`, `enable-background`],
        [`fillOpacity`, `fill-opacity`],
        [`fillRule`, `fill-rule`],
        [`floodColor`, `flood-color`],
        [`floodOpacity`, `flood-opacity`],
        [`fontFamily`, `font-family`],
        [`fontSize`, `font-size`],
        [`fontSizeAdjust`, `font-size-adjust`],
        [`fontStretch`, `font-stretch`],
        [`fontStyle`, `font-style`],
        [`fontVariant`, `font-variant`],
        [`fontWeight`, `font-weight`],
        [`glyphName`, `glyph-name`],
        [`glyphOrientationHorizontal`, `glyph-orientation-horizontal`],
        [`glyphOrientationVertical`, `glyph-orientation-vertical`],
        [`horizAdvX`, `horiz-adv-x`],
        [`horizOriginX`, `horiz-origin-x`],
        [`imageRendering`, `image-rendering`],
        [`letterSpacing`, `letter-spacing`],
        [`lightingColor`, `lighting-color`],
        [`markerEnd`, `marker-end`],
        [`markerMid`, `marker-mid`],
        [`markerStart`, `marker-start`],
        [`maskType`, `mask-type`],
        [`overlinePosition`, `overline-position`],
        [`overlineThickness`, `overline-thickness`],
        [`paintOrder`, `paint-order`],
        [`panose-1`, `panose-1`],
        [`pointerEvents`, `pointer-events`],
        [`renderingIntent`, `rendering-intent`],
        [`shapeRendering`, `shape-rendering`],
        [`stopColor`, `stop-color`],
        [`stopOpacity`, `stop-opacity`],
        [`strikethroughPosition`, `strikethrough-position`],
        [`strikethroughThickness`, `strikethrough-thickness`],
        [`strokeDasharray`, `stroke-dasharray`],
        [`strokeDashoffset`, `stroke-dashoffset`],
        [`strokeLinecap`, `stroke-linecap`],
        [`strokeLinejoin`, `stroke-linejoin`],
        [`strokeMiterlimit`, `stroke-miterlimit`],
        [`strokeOpacity`, `stroke-opacity`],
        [`strokeWidth`, `stroke-width`],
        [`textAnchor`, `text-anchor`],
        [`textDecoration`, `text-decoration`],
        [`textRendering`, `text-rendering`],
        [`transformOrigin`, `transform-origin`],
        [`underlinePosition`, `underline-position`],
        [`underlineThickness`, `underline-thickness`],
        [`unicodeBidi`, `unicode-bidi`],
        [`unicodeRange`, `unicode-range`],
        [`unitsPerEm`, `units-per-em`],
        [`vAlphabetic`, `v-alphabetic`],
        [`vHanging`, `v-hanging`],
        [`vIdeographic`, `v-ideographic`],
        [`vMathematical`, `v-mathematical`],
        [`vectorEffect`, `vector-effect`],
        [`vertAdvY`, `vert-adv-y`],
        [`vertOriginX`, `vert-origin-x`],
        [`vertOriginY`, `vert-origin-y`],
        [`wordSpacing`, `word-spacing`],
        [`writingMode`, `writing-mode`],
        [`xmlnsXlink`, `xmlns:xlink`],
        [`xHeight`, `x-height`],
      ]),
      _n =
        /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function vn(e) {
      return _n.test(`` + e)
        ? `javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')`
        : e;
    }
    function yn() {}
    var bn = null;
    function xn(e) {
      return (
        (e = e.target || e.srcElement || window),
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
      );
    }
    var Sn = null,
      Cn = null;
    function wn(e) {
      var t = Pt(e);
      if (t && (e = t.stateNode)) {
        var n = e[wt] || null;
        a: switch (((e = t.stateNode), t.type)) {
          case `input`:
            if (
              (an(
                e,
                n.value,
                n.defaultValue,
                n.defaultValue,
                n.checked,
                n.defaultChecked,
                n.type,
                n.name,
              ),
              (t = n.name),
              n.type === `radio` && t != null)
            ) {
              for (n = e; n.parentNode;) n = n.parentNode;
              for (
                n = n.querySelectorAll(
                  `input[name="` + rn(`` + t) + `"][type="radio"]`,
                ),
                  t = 0;
                t < n.length;
                t++
              ) {
                var r = n[t];
                if (r !== e && r.form === e.form) {
                  var a = r[wt] || null;
                  if (!a) throw Error(i(90));
                  an(
                    r,
                    a.value,
                    a.defaultValue,
                    a.defaultValue,
                    a.checked,
                    a.defaultChecked,
                    a.type,
                    a.name,
                  );
                }
              }
              for (t = 0; t < n.length; t++)
                ((r = n[t]), r.form === e.form && tn(r));
            }
            break a;
          case `textarea`:
            ln(e, n.value, n.defaultValue);
            break a;
          case `select`:
            ((t = n.value), t != null && cn(e, !!n.multiple, t, !1));
        }
      }
    }
    var Tn = !1;
    function En(e, t, n) {
      if (Tn) return e(t, n);
      Tn = !0;
      try {
        return e(t);
      } finally {
        if (
          ((Tn = !1),
          (Sn !== null || Cn !== null) &&
            (zd(), Sn && ((t = Sn), (e = Cn), (Cn = Sn = null), wn(t), e)))
        )
          for (t = 0; t < e.length; t++) wn(e[t]);
      }
    }
    function Dn(e, t) {
      var n = e.stateNode;
      if (n === null) return null;
      var r = n[wt] || null;
      if (r === null) return null;
      n = r[t];
      a: switch (t) {
        case `onClick`:
        case `onClickCapture`:
        case `onDoubleClick`:
        case `onDoubleClickCapture`:
        case `onMouseDown`:
        case `onMouseDownCapture`:
        case `onMouseMove`:
        case `onMouseMoveCapture`:
        case `onMouseUp`:
        case `onMouseUpCapture`:
        case `onMouseEnter`:
          ((r = !r.disabled) ||
            ((e = e.type),
            (r =
              e !== `button` &&
              e !== `input` &&
              e !== `select` &&
              e !== `textarea`)),
            (e = !r));
          break a;
        default:
          e = !1;
      }
      if (e) return null;
      if (n && typeof n != `function`) throw Error(i(231, t, typeof n));
      return n;
    }
    var On =
        typeof window < `u` &&
        window.document !== void 0 &&
        window.document.createElement !== void 0,
      kn = !1;
    if (On)
      try {
        var An = {};
        (Object.defineProperty(An, "passive", {
          get: function () {
            kn = !0;
          },
        }),
          window.addEventListener(`test`, An, An),
          window.removeEventListener(`test`, An, An));
      } catch {
        kn = !1;
      }
    var jn = null,
      Mn = null,
      Nn = null;
    function Pn() {
      if (Nn) return Nn;
      var e,
        t = Mn,
        n = t.length,
        r,
        i = `value` in jn ? jn.value : jn.textContent,
        a = i.length;
      for (e = 0; e < n && t[e] === i[e]; e++);
      var o = n - e;
      for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
      return (Nn = i.slice(e, 1 < r ? 1 - r : void 0));
    }
    function Fn(e) {
      var t = e.keyCode;
      return (
        `charCode` in e
          ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
          : (e = t),
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
      );
    }
    function In() {
      return !0;
    }
    function Ln() {
      return !1;
    }
    function Rn(e) {
      function t(t, n, r, i, a) {
        for (var o in ((this._reactName = t),
        (this._targetInst = r),
        (this.type = n),
        (this.nativeEvent = i),
        (this.target = a),
        (this.currentTarget = null),
        e))
          e.hasOwnProperty(o) && ((t = e[o]), (this[o] = t ? t(i) : i[o]));
        return (
          (this.isDefaultPrevented = (
            i.defaultPrevented == null
              ? !1 === i.returnValue
              : i.defaultPrevented
          )
            ? In
            : Ln),
          (this.isPropagationStopped = Ln),
          this
        );
      }
      return (
        T(t.prototype, {
          preventDefault: function () {
            this.defaultPrevented = !0;
            var e = this.nativeEvent;
            e &&
              (e.preventDefault
                ? e.preventDefault()
                : typeof e.returnValue != `unknown` && (e.returnValue = !1),
              (this.isDefaultPrevented = In));
          },
          stopPropagation: function () {
            var e = this.nativeEvent;
            e &&
              (e.stopPropagation
                ? e.stopPropagation()
                : typeof e.cancelBubble != `unknown` && (e.cancelBubble = !0),
              (this.isPropagationStopped = In));
          },
          persist: function () {},
          isPersistent: In,
        }),
        t
      );
    }
    var zn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function (e) {
          return e.timeStamp || Date.now();
        },
        defaultPrevented: 0,
        isTrusted: 0,
      },
      Bn = Rn(zn),
      Vn = T({}, zn, { view: 0, detail: 0 }),
      Hn = Rn(Vn),
      Un,
      Wn,
      Gn,
      Kn = T({}, Vn, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: rr,
        button: 0,
        buttons: 0,
        relatedTarget: function (e) {
          return e.relatedTarget === void 0
            ? e.fromElement === e.srcElement
              ? e.toElement
              : e.fromElement
            : e.relatedTarget;
        },
        movementX: function (e) {
          return `movementX` in e
            ? e.movementX
            : (e !== Gn &&
                (Gn && e.type === `mousemove`
                  ? ((Un = e.screenX - Gn.screenX),
                    (Wn = e.screenY - Gn.screenY))
                  : (Wn = Un = 0),
                (Gn = e)),
              Un);
        },
        movementY: function (e) {
          return `movementY` in e ? e.movementY : Wn;
        },
      }),
      qn = Rn(Kn),
      Jn = Rn(T({}, Kn, { dataTransfer: 0 })),
      Yn = Rn(T({}, Vn, { relatedTarget: 0 })),
      Xn = Rn(
        T({}, zn, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
      ),
      Zn = Rn(
        T({}, zn, {
          clipboardData: function (e) {
            return `clipboardData` in e
              ? e.clipboardData
              : window.clipboardData;
          },
        }),
      ),
      Qn = Rn(T({}, zn, { data: 0 })),
      $n = {
        Esc: `Escape`,
        Spacebar: ` `,
        Left: `ArrowLeft`,
        Up: `ArrowUp`,
        Right: `ArrowRight`,
        Down: `ArrowDown`,
        Del: `Delete`,
        Win: `OS`,
        Menu: `ContextMenu`,
        Apps: `ContextMenu`,
        Scroll: `ScrollLock`,
        MozPrintableKey: `Unidentified`,
      },
      er = {
        8: `Backspace`,
        9: `Tab`,
        12: `Clear`,
        13: `Enter`,
        16: `Shift`,
        17: `Control`,
        18: `Alt`,
        19: `Pause`,
        20: `CapsLock`,
        27: `Escape`,
        32: ` `,
        33: `PageUp`,
        34: `PageDown`,
        35: `End`,
        36: `Home`,
        37: `ArrowLeft`,
        38: `ArrowUp`,
        39: `ArrowRight`,
        40: `ArrowDown`,
        45: `Insert`,
        46: `Delete`,
        112: `F1`,
        113: `F2`,
        114: `F3`,
        115: `F4`,
        116: `F5`,
        117: `F6`,
        118: `F7`,
        119: `F8`,
        120: `F9`,
        121: `F10`,
        122: `F11`,
        123: `F12`,
        144: `NumLock`,
        145: `ScrollLock`,
        224: `Meta`,
      },
      tr = {
        Alt: `altKey`,
        Control: `ctrlKey`,
        Meta: `metaKey`,
        Shift: `shiftKey`,
      };
    function nr(e) {
      var t = this.nativeEvent;
      return t.getModifierState
        ? t.getModifierState(e)
        : (e = tr[e])
          ? !!t[e]
          : !1;
    }
    function rr() {
      return nr;
    }
    var ir = Rn(
        T({}, Vn, {
          key: function (e) {
            if (e.key) {
              var t = $n[e.key] || e.key;
              if (t !== `Unidentified`) return t;
            }
            return e.type === `keypress`
              ? ((e = Fn(e)), e === 13 ? `Enter` : String.fromCharCode(e))
              : e.type === `keydown` || e.type === `keyup`
                ? er[e.keyCode] || `Unidentified`
                : ``;
          },
          code: 0,
          location: 0,
          ctrlKey: 0,
          shiftKey: 0,
          altKey: 0,
          metaKey: 0,
          repeat: 0,
          locale: 0,
          getModifierState: rr,
          charCode: function (e) {
            return e.type === `keypress` ? Fn(e) : 0;
          },
          keyCode: function (e) {
            return e.type === `keydown` || e.type === `keyup` ? e.keyCode : 0;
          },
          which: function (e) {
            return e.type === `keypress`
              ? Fn(e)
              : e.type === `keydown` || e.type === `keyup`
                ? e.keyCode
                : 0;
          },
        }),
      ),
      ar = Rn(
        T({}, Kn, {
          pointerId: 0,
          width: 0,
          height: 0,
          pressure: 0,
          tangentialPressure: 0,
          tiltX: 0,
          tiltY: 0,
          twist: 0,
          pointerType: 0,
          isPrimary: 0,
        }),
      ),
      or = Rn(T({}, zn, { submitter: 0 })),
      sr = Rn(
        T({}, Vn, {
          touches: 0,
          targetTouches: 0,
          changedTouches: 0,
          altKey: 0,
          metaKey: 0,
          ctrlKey: 0,
          shiftKey: 0,
          getModifierState: rr,
        }),
      ),
      cr = Rn(T({}, zn, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 })),
      lr = Rn(
        T({}, Kn, {
          deltaX: function (e) {
            return `deltaX` in e
              ? e.deltaX
              : `wheelDeltaX` in e
                ? -e.wheelDeltaX
                : 0;
          },
          deltaY: function (e) {
            return `deltaY` in e
              ? e.deltaY
              : `wheelDeltaY` in e
                ? -e.wheelDeltaY
                : `wheelDelta` in e
                  ? -e.wheelDelta
                  : 0;
          },
          deltaZ: 0,
          deltaMode: 0,
        }),
      ),
      ur = Rn(T({}, zn, { newState: 0, oldState: 0, source: 0 })),
      dr = [9, 13, 27, 32],
      fr = On && `CompositionEvent` in window,
      pr = null;
    On && `documentMode` in document && (pr = document.documentMode);
    var mr = On && `TextEvent` in window && !pr,
      hr = On && (!fr || (pr && 8 < pr && 11 >= pr)),
      gr = ` `,
      _r = !1;
    function vr(e, t) {
      switch (e) {
        case `keyup`:
          return dr.indexOf(t.keyCode) !== -1;
        case `keydown`:
          return t.keyCode !== 229;
        case `keypress`:
        case `mousedown`:
        case `focusout`:
          return !0;
        default:
          return !1;
      }
    }
    function yr(e) {
      return (
        (e = e.detail),
        typeof e == `object` && `data` in e ? e.data : null
      );
    }
    var br = !1;
    function xr(e, t) {
      switch (e) {
        case `compositionend`:
          return yr(t);
        case `keypress`:
          return t.which === 32 ? ((_r = !0), gr) : null;
        case `textInput`:
          return ((e = t.data), e === gr && _r ? null : e);
        default:
          return null;
      }
    }
    function Sr(e, t) {
      if (br)
        return e === `compositionend` || (!fr && vr(e, t))
          ? ((e = Pn()), (Nn = Mn = jn = null), (br = !1), e)
          : null;
      switch (e) {
        case `paste`:
          return null;
        case `keypress`:
          if (
            !(t.ctrlKey || t.altKey || t.metaKey) ||
            (t.ctrlKey && t.altKey)
          ) {
            if (t.char && 1 < t.char.length) return t.char;
            if (t.which) return String.fromCharCode(t.which);
          }
          return null;
        case `compositionend`:
          return hr && t.locale !== `ko` ? null : t.data;
        default:
          return null;
      }
    }
    var Cr = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0,
    };
    function wr(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === `input` ? !!Cr[e.type] : t === `textarea`;
    }
    function Tr(e, t, n, r) {
      (Sn ? (Cn ? Cn.push(r) : (Cn = [r])) : (Sn = r),
        (t = Jf(t, `onChange`)),
        0 < t.length &&
          ((n = new Bn(`onChange`, `change`, null, n, r)),
          e.push({ event: n, listeners: t })));
    }
    var Er = null,
      Dr = null;
    function Or(e) {
      Vf(e, 0);
    }
    function kr(e) {
      if (tn(Ft(e))) return e;
    }
    function Ar(e, t) {
      if (e === `change`) return t;
    }
    var jr = !1;
    if (On) {
      var Mr;
      if (On) {
        var Nr = `oninput` in document;
        if (!Nr) {
          var Pr = document.createElement(`div`);
          (Pr.setAttribute(`oninput`, `return;`),
            (Nr = typeof Pr.oninput == `function`));
        }
        Mr = Nr;
      } else Mr = !1;
      jr = Mr && (!document.documentMode || 9 < document.documentMode);
    }
    function Fr() {
      Er && (Er.detachEvent(`onpropertychange`, Ir), (Dr = Er = null));
    }
    function Ir(e) {
      if (e.propertyName === `value` && kr(Dr)) {
        var t = [];
        (Tr(t, Dr, e, xn(e)), En(Or, t));
      }
    }
    function Lr(e, t, n) {
      e === `focusin`
        ? (Fr(), (Er = t), (Dr = n), Er.attachEvent(`onpropertychange`, Ir))
        : e === `focusout` && Fr();
    }
    function Rr(e) {
      if (e === `selectionchange` || e === `keyup` || e === `keydown`)
        return kr(Dr);
    }
    function zr(e, t) {
      if (e === `click`) return kr(t);
    }
    function Br(e, t) {
      if (e === `input` || e === `change`) return kr(t);
    }
    function Vr(e, t) {
      return (e === t && (e !== 0 || 1 / e == 1 / t)) || (e !== e && t !== t);
    }
    var Hr = typeof Object.is == `function` ? Object.is : Vr;
    function Ur(e, t) {
      if (Hr(e, t)) return !0;
      if (typeof e != `object` || !e || typeof t != `object` || !t) return !1;
      var n = Object.keys(e),
        r = Object.keys(t);
      if (n.length !== r.length) return !1;
      for (r = 0; r < n.length; r++) {
        var i = n[r];
        if (!Ie.call(t, i) || !Hr(e[i], t[i])) return !1;
      }
      return !0;
    }
    function Wr(e) {
      if (((e ||= typeof document < `u` ? document : void 0), e === void 0))
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    function Gr(e) {
      for (; e && e.firstChild;) e = e.firstChild;
      return e;
    }
    function Kr(e, t) {
      var n = Gr(e);
      e = 0;
      for (var r; n;) {
        if (n.nodeType === 3) {
          if (((r = e + n.textContent.length), e <= t && r >= t))
            return { node: n, offset: t - e };
          e = r;
        }
        a: {
          for (; n;) {
            if (n.nextSibling) {
              n = n.nextSibling;
              break a;
            }
            n = n.parentNode;
          }
          n = void 0;
        }
        n = Gr(n);
      }
    }
    function qr(e, t) {
      return e && t
        ? e === t
          ? !0
          : e && e.nodeType === 3
            ? !1
            : t && t.nodeType === 3
              ? qr(e, t.parentNode)
              : `contains` in e
                ? e.contains(t)
                : e.compareDocumentPosition
                  ? !!(e.compareDocumentPosition(t) & 16)
                  : !1
        : !1;
    }
    function Jr(e) {
      e =
        e != null &&
        e.ownerDocument != null &&
        e.ownerDocument.defaultView != null
          ? e.ownerDocument.defaultView
          : window;
      for (var t = Wr(e.document); t instanceof e.HTMLIFrameElement;) {
        try {
          var n = typeof t.contentWindow.location.href == `string`;
        } catch {
          n = !1;
        }
        if (n) e = t.contentWindow;
        else break;
        t = Wr(e.document);
      }
      return t;
    }
    function Yr(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return (
        t &&
        ((t === `input` &&
          (e.type === `text` ||
            e.type === `search` ||
            e.type === `tel` ||
            e.type === `url` ||
            e.type === `password`)) ||
          t === `textarea` ||
          e.contentEditable === `true`)
      );
    }
    var Xr = On && `documentMode` in document && 11 >= document.documentMode,
      Zr = null,
      Qr = null,
      $r = null,
      ei = !1;
    function ti(e, t, n) {
      var r =
        n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
      ei ||
        Zr == null ||
        Zr !== Wr(r) ||
        ((r = Zr),
        `selectionStart` in r && Yr(r)
          ? (r = { start: r.selectionStart, end: r.selectionEnd })
          : ((r = (
              (r.ownerDocument && r.ownerDocument.defaultView) ||
              window
            ).getSelection()),
            (r = {
              anchorNode: r.anchorNode,
              anchorOffset: r.anchorOffset,
              focusNode: r.focusNode,
              focusOffset: r.focusOffset,
            })),
        ($r && Ur($r, r)) ||
          (($r = r),
          (r = Jf(Qr, `onSelect`)),
          0 < r.length &&
            ((t = new Bn(`onSelect`, `select`, null, t, n)),
            e.push({ event: t, listeners: r }),
            (t.target = Zr))));
    }
    function ni(e, t) {
      var n = {};
      return (
        (n[e.toLowerCase()] = t.toLowerCase()),
        (n[`Webkit` + e] = `webkit` + t),
        (n[`Moz` + e] = `moz` + t),
        n
      );
    }
    var ri = {
        animationend: ni(`Animation`, `AnimationEnd`),
        animationiteration: ni(`Animation`, `AnimationIteration`),
        animationstart: ni(`Animation`, `AnimationStart`),
        transitionrun: ni(`Transition`, `TransitionRun`),
        transitionstart: ni(`Transition`, `TransitionStart`),
        transitioncancel: ni(`Transition`, `TransitionCancel`),
        transitionend: ni(`Transition`, `TransitionEnd`),
      },
      ii = {},
      ai = {};
    On &&
      ((ai = document.createElement(`div`).style),
      `AnimationEvent` in window ||
        (delete ri.animationend.animation,
        delete ri.animationiteration.animation,
        delete ri.animationstart.animation),
      `TransitionEvent` in window || delete ri.transitionend.transition);
    function oi(e) {
      if (ii[e]) return ii[e];
      if (!ri[e]) return e;
      var t = ri[e],
        n;
      for (n in t) if (t.hasOwnProperty(n) && n in ai) return (ii[e] = t[n]);
      return e;
    }
    var si = oi(`animationend`),
      ci = oi(`animationiteration`),
      li = oi(`animationstart`),
      ui = oi(`transitionrun`),
      di = oi(`transitionstart`),
      fi = oi(`transitioncancel`),
      pi = oi(`transitionend`),
      mi = new Map(),
      hi =
        `abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel`.split(
          ` `,
        );
    hi.push(`scrollEnd`);
    function gi(e, t) {
      (mi.set(e, t), Vt(t, [e]));
    }
    var _i = 0;
    function vi(e, t) {
      if (e.name != null && e.name !== `auto`) return e.name;
      if (t.autoName !== null) return t.autoName;
      e = bd.identifierPrefix;
      var n = _i++;
      return ((e = `_` + e + `t_` + n.toString(32) + `_`), (t.autoName = e));
    }
    function yi(e) {
      if (e == null || typeof e == `string`) return e;
      var t = null,
        n = Od;
      if (n !== null)
        for (var r = 0; r < n.length; r++) {
          var i = e[n[r]];
          if (i != null) {
            if (i === `none`) return `none`;
            t = t == null ? i : t + (` ` + i);
          }
        }
      return t ?? e.default;
    }
    function bi(e, t) {
      return (
        (e = yi(e)),
        (t = yi(t)),
        t == null ? (e === `auto` ? null : e) : t === `auto` ? null : t
      );
    }
    var xi =
        typeof reportError == `function`
          ? reportError
          : function (e) {
              if (
                typeof window == `object` &&
                typeof window.ErrorEvent == `function`
              ) {
                var t = new window.ErrorEvent(`error`, {
                  bubbles: !0,
                  cancelable: !0,
                  message:
                    typeof e == `object` && e && typeof e.message == `string`
                      ? String(e.message)
                      : String(e),
                  error: e,
                });
                if (!window.dispatchEvent(t)) return;
              } else if (
                typeof process == `object` &&
                typeof process.emit == `function`
              ) {
                process.emit(`uncaughtException`, e);
                return;
              }
              console.error(e);
            },
      Si = [],
      Ci = 0,
      wi = 0;
    function Ti() {
      for (var e = Ci, t = (wi = Ci = 0); t < e;) {
        var n = Si[t];
        Si[t++] = null;
        var r = Si[t];
        Si[t++] = null;
        var i = Si[t];
        Si[t++] = null;
        var a = Si[t];
        if (((Si[t++] = null), r !== null && i !== null)) {
          var o = r.pending;
          (o === null ? (i.next = i) : ((i.next = o.next), (o.next = i)),
            (r.pending = i));
        }
        a !== 0 && ki(n, i, a);
      }
    }
    function Ei(e, t, n, r) {
      ((Si[Ci++] = e),
        (Si[Ci++] = t),
        (Si[Ci++] = n),
        (Si[Ci++] = r),
        (wi |= r),
        (e.lanes |= r),
        (e = e.alternate),
        e !== null && (e.lanes |= r));
    }
    function Di(e, t, n, r) {
      return (Ei(e, t, n, r), Ai(e));
    }
    function Oi(e, t) {
      return (Ei(e, null, null, t), Ai(e));
    }
    function ki(e, t, n) {
      e.lanes |= n;
      var r = e.alternate;
      r !== null && (r.lanes |= n);
      for (var i = !1, a = e.return; a !== null;)
        ((a.childLanes |= n),
          (r = a.alternate),
          r !== null && (r.childLanes |= n),
          a.tag === 22 &&
            ((e = a.stateNode), e === null || e._visibility & 1 || (i = !0)),
          (e = a),
          (a = a.return));
      return e.tag === 3
        ? ((a = e.stateNode),
          i &&
            t !== null &&
            ((i = 31 - $e(n)),
            (e = a.hiddenUpdates),
            (r = e[i]),
            r === null ? (e[i] = [t]) : r.push(t),
            (t.lane = n | 536870912)),
          a)
        : null;
    }
    function Ai(e) {
      if (50 < kd) throw ((kd = 0), (Ad = null), Error(i(185)));
      for (var t = e.return; t !== null;) ((e = t), (t = e.return));
      return e.tag === 3 ? e.stateNode : null;
    }
    var ji = {};
    function Mi(e, t, n, r) {
      ((this.tag = e),
        (this.key = n),
        (this.sibling =
          this.child =
          this.return =
          this.stateNode =
          this.type =
          this.elementType =
            null),
        (this.index = 0),
        (this.refCleanup = this.ref = null),
        (this.pendingProps = t),
        (this.dependencies =
          this.memoizedState =
          this.updateQueue =
          this.memoizedProps =
            null),
        (this.mode = r),
        (this.subtreeFlags = this.flags = 0),
        (this.deletions = null),
        (this.childLanes = this.lanes = 0),
        (this.alternate = null));
    }
    function Ni(e, t, n, r) {
      return new Mi(e, t, n, r);
    }
    function Pi(e) {
      return ((e = e.prototype), !(!e || !e.isReactComponent));
    }
    function Fi(e, t) {
      var n = e.alternate;
      return (
        n === null
          ? ((n = Ni(e.tag, t, e.key, e.mode)),
            (n.elementType = e.elementType),
            (n.type = e.type),
            (n.stateNode = e.stateNode),
            (n.alternate = e),
            (e.alternate = n))
          : ((n.pendingProps = t),
            (n.type = e.type),
            (n.flags = 0),
            (n.subtreeFlags = 0),
            (n.deletions = null)),
        (n.flags = e.flags & 1206910976),
        (n.childLanes = e.childLanes),
        (n.lanes = e.lanes),
        (n.child = e.child),
        (n.memoizedProps = e.memoizedProps),
        (n.memoizedState = e.memoizedState),
        (n.updateQueue = e.updateQueue),
        (t = e.dependencies),
        (n.dependencies =
          t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
        (n.sibling = e.sibling),
        (n.index = e.index),
        (n.ref = e.ref),
        (n.refCleanup = e.refCleanup),
        n
      );
    }
    function Ii(e, t) {
      e.flags &= 1206910978;
      var n = e.alternate;
      return (
        n === null
          ? ((e.childLanes = 0),
            (e.lanes = t),
            (e.child = null),
            (e.subtreeFlags = 0),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.updateQueue = null),
            (e.dependencies = null),
            (e.stateNode = null))
          : ((e.childLanes = n.childLanes),
            (e.lanes = n.lanes),
            (e.child = n.child),
            (e.subtreeFlags = 0),
            (e.deletions = null),
            (e.memoizedProps = n.memoizedProps),
            (e.memoizedState = n.memoizedState),
            (e.updateQueue = n.updateQueue),
            (e.type = n.type),
            (t = n.dependencies),
            (e.dependencies =
              t === null
                ? null
                : { lanes: t.lanes, firstContext: t.firstContext })),
        e
      );
    }
    function Li(e, t, n, r, a, o) {
      var s = 0;
      if (((r = e), typeof r == `function`)) Pi(r) && (s = 1);
      else if (typeof r == `string`)
        s = qm(e, n, Te.current)
          ? 26
          : e === `html` || e === `head` || e === `body`
            ? 27
            : 5;
      else
        a: switch (r) {
          case ue:
            return (
              (e = Ni(31, n, t, a)),
              (e.elementType = ue),
              (e.lanes = o),
              e
            );
          case k:
            return Ri(n.children, a, o, t);
          case ne:
            ((s = 8), (a |= 24));
            break;
          case re:
            return (
              (e = Ni(12, n, t, a | 2)),
              (e.elementType = re),
              (e.lanes = o),
              e
            );
          case oe:
            return (
              (e = Ni(13, n, t, a)),
              (e.elementType = oe),
              (e.lanes = o),
              e
            );
          case se:
            return (
              (e = Ni(19, n, t, a)),
              (e.elementType = se),
              (e.lanes = o),
              e
            );
          case de:
          case pe:
            return (
              (e = a | 32),
              (e = Ni(30, n, t, e)),
              (e.elementType = pe),
              (e.lanes = o),
              (e.stateNode = {
                autoName: null,
                paired: null,
                clones: null,
                ref: null,
              }),
              e
            );
          default:
            if (typeof r == `object` && r)
              switch (r.$$typeof) {
                case A:
                  s = 10;
                  break a;
                case ie:
                  s = 9;
                  break a;
                case ae:
                  s = 11;
                  break a;
                case ce:
                  s = 14;
                  break a;
                case le:
                  ((s = 16), (r = null));
                  break a;
              }
            ((s = 29),
              (n = Error(i(130, e === null ? `null` : typeof e, ``))),
              (r = null));
        }
      return (
        (t = Ni(s, n, t, a)),
        (t.elementType = e),
        (t.type = r),
        (t.lanes = o),
        t
      );
    }
    function Ri(e, t, n, r) {
      return ((e = Ni(7, e, r, t)), (e.lanes = n), e);
    }
    function zi(e, t, n) {
      return ((e = Ni(6, e, null, t)), (e.lanes = n), e);
    }
    function Bi(e) {
      var t = Ni(18, null, null, 0);
      return ((t.stateNode = e), t);
    }
    function Vi(e, t, n) {
      return (
        (t = Ni(4, e.children === null ? [] : e.children, e.key, t)),
        (t.lanes = n),
        (t.stateNode = {
          containerInfo: e.containerInfo,
          pendingChildren: null,
          implementation: e.implementation,
        }),
        t
      );
    }
    var Hi = new WeakMap();
    function Ui(e, t) {
      if (typeof e == `object` && e) {
        var n = Hi.get(e);
        return n === void 0
          ? ((t = { value: e, source: t, stack: L(t) }), Hi.set(e, t), t)
          : n;
      }
      return { value: e, source: t, stack: L(t) };
    }
    var Wi = [],
      Gi = 0,
      Ki = null,
      qi = 0,
      Ji = [],
      Yi = 0,
      Xi = null,
      Zi = 1,
      Qi = ``;
    function $i(e, t) {
      ((Wi[Gi++] = qi), (Wi[Gi++] = Ki), (Ki = e), (qi = t));
    }
    function ea(e, t, n) {
      ((Ji[Yi++] = Zi), (Ji[Yi++] = Qi), (Ji[Yi++] = Xi), (Xi = e));
      var r = Zi;
      e = Qi;
      var i = 32 - $e(r) - 1;
      ((r &= ~(1 << i)), (n += 1));
      var a = 32 - $e(t) + i;
      if (30 < a) {
        var o = i - (i % 5);
        ((a = (r & ((1 << o) - 1)).toString(32)),
          (r >>= o),
          (i -= o),
          (Zi = (1 << (32 - $e(t) + i)) | (n << i) | r),
          (Qi = a + e));
      } else ((Zi = (1 << a) | (n << i) | r), (Qi = e));
    }
    function ta(e) {
      e.return !== null && ($i(e, 1), ea(e, 1, 0));
    }
    function na(e) {
      for (; e === Ki;)
        ((Ki = Wi[--Gi]), (Wi[Gi] = null), (qi = Wi[--Gi]), (Wi[Gi] = null));
      for (; e === Xi;)
        ((Xi = Ji[--Yi]),
          (Ji[Yi] = null),
          (Qi = Ji[--Yi]),
          (Ji[Yi] = null),
          (Zi = Ji[--Yi]),
          (Ji[Yi] = null));
    }
    function ra(e, t) {
      ((Ji[Yi++] = Zi),
        (Ji[Yi++] = Qi),
        (Ji[Yi++] = Xi),
        (Zi = t.id),
        (Qi = t.overflow),
        (Xi = e));
    }
    var ia = null,
      z = null,
      B = !1,
      aa = null,
      oa = !1,
      sa = Error(i(519));
    function ca(e) {
      throw (
        ma(
          Ui(
            Error(
              i(
                418,
                1 < arguments.length && arguments[1] !== void 0 && arguments[1]
                  ? `text`
                  : `HTML`,
                ``,
              ),
            ),
            e,
          ),
        ),
        sa
      );
    }
    function la(e) {
      var t = e.stateNode,
        n = e.type,
        r = e.memoizedProps;
      switch (((t[Ct] = e), (t[wt] = r), n)) {
        case `dialog`:
          (Q(`cancel`, t), Q(`close`, t));
          break;
        case `iframe`:
        case `object`:
        case `embed`:
          Q(`load`, t);
          break;
        case `video`:
        case `audio`:
          for (n = 0; n < zf.length; n++) Q(zf[n], t);
          break;
        case `source`:
          Q(`error`, t);
          break;
        case `img`:
        case `image`:
        case `link`:
          (Q(`error`, t), Q(`load`, t));
          break;
        case `details`:
          Q(`toggle`, t);
          break;
        case `input`:
          (Q(`invalid`, t),
            on(
              t,
              r.value,
              r.defaultValue,
              r.checked,
              r.defaultChecked,
              r.type,
              r.name,
              !0,
            ));
          break;
        case `select`:
          Q(`invalid`, t);
          break;
        case `textarea`:
          (Q(`invalid`, t), un(t, r.value, r.defaultValue, r.children));
      }
      ((n = r.children),
        (typeof n != `string` &&
          typeof n != `number` &&
          typeof n != `bigint`) ||
        t.textContent === `` + n ||
        !0 === r.suppressHydrationWarning ||
        ep(t.textContent, n)
          ? (r.popover != null && (Q(`beforetoggle`, t), Q(`toggle`, t)),
            r.onScroll != null && Q(`scroll`, t),
            r.onScrollEnd != null && Q(`scrollend`, t),
            r.onClick != null && (t.onclick = yn),
            (t = !0))
          : (t = !1),
        t || ca(e, !0));
    }
    function ua(e) {
      for (ia = e.return; ia;)
        switch (ia.tag) {
          case 5:
          case 31:
          case 13:
            oa = !1;
            return;
          case 27:
          case 3:
            oa = !0;
            return;
          default:
            ia = ia.return;
        }
    }
    function da(e) {
      if (e !== ia) return !1;
      if (!B) return (ua(e), (B = !0), !1);
      var t = e.tag,
        n;
      if (
        ((n = t !== 3 && t !== 27) &&
          ((n = t === 5) &&
            ((n = e.type),
            (n =
              n === `form` || n === `button` || pp(e.type, e.memoizedProps))),
          (n = !n)),
        n && z && ca(e),
        ua(e),
        t === 13)
      ) {
        if (((e = e.memoizedState), (e = e === null ? null : e.dehydrated), !e))
          throw Error(i(317));
        z = dm(e);
      } else if (t === 31) {
        if (((e = e.memoizedState), (e = e === null ? null : e.dehydrated), !e))
          throw Error(i(317));
        z = dm(e);
      } else
        t === 27
          ? ((t = z), Sp(e.type) ? ((e = um), (um = null), (z = e)) : (z = t))
          : (z = ia ? lm(e.stateNode.nextSibling) : null);
      return !0;
    }
    function fa() {
      ((z = ia = null), (B = !1));
    }
    function pa() {
      var e = aa;
      return (
        e !== null &&
          (fd === null ? (fd = e) : fd.push.apply(fd, e), (aa = null)),
        e
      );
    }
    function ma(e) {
      aa === null ? (aa = [e]) : aa.push(e);
    }
    var ha = Ce(null),
      ga = null,
      _a = null;
    function va(e, t, n) {
      (N(ha, t._currentValue), (t._currentValue = n));
    }
    function ya(e) {
      ((e._currentValue = ha.current), we(ha));
    }
    function ba(e, t, n) {
      for (; e !== null;) {
        var r = e.alternate;
        if (
          ((e.childLanes & t) === t
            ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t)
            : ((e.childLanes |= t), r !== null && (r.childLanes |= t)),
          e === n)
        )
          break;
        e = e.return;
      }
    }
    function xa(e, t, n, r) {
      var a = e.child;
      for (a !== null && (a.return = e); a !== null;) {
        var o = a.dependencies;
        if (o !== null) {
          var s = a.child;
          o = o.firstContext;
          a: for (; o !== null;) {
            var c = o;
            o = a;
            for (var l = 0; l < t.length; l++)
              if (c.context === t[l]) {
                ((o.lanes |= n),
                  (c = o.alternate),
                  c !== null && (c.lanes |= n),
                  ba(o.return, n, e),
                  r || (s = null));
                break a;
              }
            o = c.next;
          }
        } else if (a.tag === 18) {
          if (((s = a.return), s === null)) throw Error(i(341));
          ((s.lanes |= n),
            (o = s.alternate),
            o !== null && (o.lanes |= n),
            ba(s, n, e),
            (s = null));
        } else
          a.tag === 13 &&
          a.memoizedState !== null &&
          a.memoizedState.dehydrated === null
            ? ((a.lanes |= n),
              (s = a.alternate),
              s !== null && (s.lanes |= n),
              ba(a.return, n, e),
              (s = a.child),
              (s = s === null ? null : s.sibling))
            : (s = a.child);
        if (s !== null) s.return = a;
        else
          for (s = a; s !== null;) {
            if (s === e) {
              s = null;
              break;
            }
            if (((a = s.sibling), a !== null)) {
              ((a.return = s.return), (s = a));
              break;
            }
            s = s.return;
          }
        a = s;
      }
    }
    function Sa(e, t, n, r) {
      e = null;
      for (var a = t, o = !1; a !== null;) {
        if (!o) {
          if (a.flags & 524288) o = !0;
          else if (a.flags & 262144) break;
        }
        if (a.tag === 10) {
          var s = a.alternate;
          if (s === null) throw Error(i(387));
          if (((s = s.memoizedProps), s !== null)) {
            var c = a.type;
            Hr(a.pendingProps.value, s.value) ||
              (e === null ? (e = [c]) : e.push(c));
          }
        } else if (a === De.current) {
          if (((s = a.alternate), s === null)) throw Error(i(387));
          s.memoizedState.memoizedState !== a.memoizedState.memoizedState &&
            (e === null ? (e = [sh]) : e.push(sh));
        }
        a = a.return;
      }
      return (e !== null && xa(t, e, n, r), (t.flags |= 262144), e !== null);
    }
    function Ca(e) {
      for (e = e.firstContext; e !== null;) {
        if (!Hr(e.context._currentValue, e.memoizedValue)) return !0;
        e = e.next;
      }
      return !1;
    }
    function wa(e) {
      ((ga = e),
        (_a = null),
        (e = e.dependencies),
        e !== null && (e.firstContext = null));
    }
    function Ta(e) {
      return Da(ga, e);
    }
    function Ea(e, t) {
      return (ga === null && wa(e), Da(e, t));
    }
    function Da(e, t) {
      var n = t._currentValue;
      if (((t = { context: t, memoizedValue: n, next: null }), _a === null)) {
        if (e === null) throw Error(i(308));
        ((_a = t),
          (e.dependencies = { lanes: 0, firstContext: t }),
          (e.flags |= 524288));
      } else _a = _a.next = t;
      return n;
    }
    var Oa =
        typeof AbortController < `u`
          ? AbortController
          : function () {
              var e = [],
                t = (this.signal = {
                  aborted: !1,
                  addEventListener: function (t, n) {
                    e.push(n);
                  },
                });
              this.abort = function () {
                ((t.aborted = !0),
                  e.forEach(function (e) {
                    return e();
                  }));
              };
            },
      ka = t.unstable_scheduleCallback,
      Aa = t.unstable_NormalPriority,
      ja = {
        $$typeof: A,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0,
      };
    function Ma() {
      return { controller: new Oa(), data: new Map(), refCount: 0 };
    }
    function Na(e) {
      (e.refCount--,
        e.refCount === 0 &&
          ka(Aa, function () {
            e.controller.abort();
          }));
    }
    function Pa(e, t) {
      if (e.pendingLanes & 4194048) {
        var n = e.transitionTypes;
        for (
          n === null && (n = e.transitionTypes = []), e = 0;
          e < t.length;
          e++
        ) {
          var r = t[e];
          n.indexOf(r) === -1 && n.push(r);
        }
      }
    }
    var Fa = null;
    function Ia(e) {
      var t = e.transitionTypes;
      return ((e.transitionTypes = null), t);
    }
    var La = null,
      Ra = 0,
      za = 0,
      Ba = null;
    function Va(e, t) {
      if (La === null) {
        var n = (La = []);
        ((Ra = 0),
          (za = Pf()),
          (Ba = {
            status: `pending`,
            value: void 0,
            then: function (e) {
              n.push(e);
            },
          }));
      }
      return (Ra++, t.then(Ha, Ha), t);
    }
    function Ha() {
      if (--Ra === 0 && ((Fa = null), La !== null)) {
        Ba !== null && (Ba.status = `fulfilled`);
        var e = La;
        ((La = null), (za = 0), (Ba = null));
        for (var t = 0; t < e.length; t++) (0, e[t])();
      }
    }
    function Ua(e, t) {
      var n = [],
        r = {
          status: `pending`,
          value: null,
          reason: null,
          then: function (e) {
            n.push(e);
          },
        };
      return (
        e.then(
          function () {
            ((r.status = `fulfilled`), (r.value = t));
            for (var e = 0; e < n.length; e++) (0, n[e])(t);
          },
          function (e) {
            for (r.status = `rejected`, r.reason = e, e = 0; e < n.length; e++)
              (0, n[e])(void 0);
          },
        ),
        r
      );
    }
    var Wa = j.S;
    j.S = function (e, t) {
      if (
        ((hd = Ve()),
        typeof t == `object` && t && typeof t.then == `function` && Va(e, t),
        Fa !== null)
      )
        for (var n = bf; n !== null;) (Pa(n, Fa), (n = n.next));
      if (((n = e.types), n !== null)) {
        for (var r = bf; r !== null;) (Pa(r, n), (r = r.next));
        if (za !== 0) {
          ((r = Fa), r === null && (r = Fa = []));
          for (var i = 0; i < n.length; i++) {
            var a = n[i];
            r.indexOf(a) === -1 && r.push(a);
          }
        }
      }
      Wa !== null && Wa(e, t);
    };
    var Ga = Ce(null);
    function Ka() {
      var e = Ga.current;
      return e === null ? q.pooledCache : e;
    }
    function qa(e, t) {
      t === null ? N(Ga, Ga.current) : N(Ga, t.pool);
    }
    function Ja() {
      var e = Ka();
      return e === null ? null : { parent: ja._currentValue, pool: e };
    }
    var Ya = Error(i(460)),
      Xa = Error(i(474)),
      Za = Error(i(542)),
      Qa = { then: function () {} };
    function $a(e) {
      return ((e = e.status), e === `fulfilled` || e === `rejected`);
    }
    function eo(e, t, n) {
      switch (
        ((n = e[n]),
        n === void 0 ? e.push(t) : n !== t && (t.then(yn, yn), (t = n)),
        t.status)
      ) {
        case `fulfilled`:
          return t.value;
        case `rejected`:
          throw (
            (e = t.reason),
            io(e),
            e === void 0 && !(`reason` in t) ? Error(i(600)) : e
          );
        default:
          if (typeof t.status == `string`) t.then(yn, yn);
          else {
            if (((e = q), e !== null && 100 < e.shellSuspendCounter))
              throw Error(i(482));
            ((e = t),
              (e.status = `pending`),
              e.then(
                function (e) {
                  if (t.status === `pending`) {
                    var n = t;
                    ((n.status = `fulfilled`), (n.value = e));
                  }
                },
                function (e) {
                  if (t.status === `pending`) {
                    var n = t;
                    ((n.status = `rejected`), (n.reason = e));
                  }
                },
              ));
          }
          switch (t.status) {
            case `fulfilled`:
              return t.value;
            case `rejected`:
              throw ((e = t.reason), io(e), e);
          }
          throw ((no = t), Ya);
      }
    }
    function to(e) {
      try {
        var t = e._init;
        return t(e._payload);
      } catch (e) {
        throw typeof e == `object` && e && typeof e.then == `function`
          ? ((no = e), Ya)
          : e;
      }
    }
    var no = null;
    function ro() {
      if (no === null) throw Error(i(459));
      var e = no;
      return ((no = null), e);
    }
    function io(e) {
      if (e === Ya || e === Za) throw Error(i(483));
    }
    var ao = null,
      oo = 0;
    function so(e) {
      var t = oo;
      return ((oo += 1), ao === null && (ao = []), eo(ao, e, t));
    }
    function co(e, t) {
      ((t = t.props.ref), (e.ref = t === void 0 ? null : t));
    }
    function lo(e, t) {
      throw t.$$typeof === E
        ? Error(i(525))
        : ((e = Object.prototype.toString.call(t)),
          Error(
            i(
              31,
              e === `[object Object]`
                ? `object with keys {` + Object.keys(t).join(`, `) + `}`
                : e,
            ),
          ));
    }
    function uo(e) {
      function t(t, n) {
        if (e) {
          var r = t.deletions;
          r === null ? ((t.deletions = [n]), (t.flags |= 16)) : r.push(n);
        }
      }
      function n(n, r) {
        if (!e) return null;
        for (; r !== null;) (t(n, r), (r = r.sibling));
        return null;
      }
      function r(e) {
        for (var t = new Map(); e !== null;)
          (e.key === null ? t.set(e.index, e) : t.set(e.key, e),
            (e = e.sibling));
        return t;
      }
      function a(e, t) {
        return ((e = Fi(e, t)), (e.index = 0), (e.sibling = null), e);
      }
      function o(t, n, r) {
        return (
          (t.index = r),
          e
            ? ((r = t.alternate),
              r === null
                ? ((t.flags |= 134217730), n)
                : ((r = r.index), r < n ? ((t.flags |= 2), n) : r))
            : ((t.flags |= 1048576), n)
        );
      }
      function s(t) {
        return (e && t.alternate === null && (t.flags |= 134217730), t);
      }
      function c(e, t, n, r) {
        return t === null || t.tag !== 6
          ? ((t = zi(n, e.mode, r)), (t.return = e), t)
          : ((t = a(t, n)), (t.return = e), t);
      }
      function l(e, t, n, r) {
        var i = n.type;
        return i === k
          ? ((e = d(e, t, n.props.children, r, n.key)), co(e, n), e)
          : t !== null &&
              (t.elementType === i ||
                (typeof i == `object` &&
                  i &&
                  i.$$typeof === le &&
                  to(i) === t.type))
            ? ((t = a(t, n.props)), co(t, n), (t.return = e), t)
            : ((t = Li(n.type, n.key, n.props, null, e.mode, r)),
              co(t, n),
              (t.return = e),
              t);
      }
      function u(e, t, n, r) {
        return t === null ||
          t.tag !== 4 ||
          t.stateNode.containerInfo !== n.containerInfo ||
          t.stateNode.implementation !== n.implementation
          ? ((t = Vi(n, e.mode, r)), (t.return = e), t)
          : ((t = a(t, n.children || [])), (t.return = e), t);
      }
      function d(e, t, n, r, i) {
        return t === null || t.tag !== 7
          ? ((t = Ri(n, e.mode, r, i)), (t.return = e), t)
          : ((t = a(t, n)), (t.return = e), t);
      }
      function f(e, t, n) {
        if (
          (typeof t == `string` && t !== ``) ||
          typeof t == `number` ||
          typeof t == `bigint`
        )
          return ((t = zi(`` + t, e.mode, n)), (t.return = e), t);
        if (typeof t == `object` && t) {
          switch (t.$$typeof) {
            case D:
              return (
                (n = Li(t.type, t.key, t.props, null, e.mode, n)),
                co(n, t),
                (n.return = e),
                n
              );
            case O:
              return ((t = Vi(t, e.mode, n)), (t.return = e), t);
            case le:
              return ((t = to(t)), f(e, t, n));
          }
          if (ye(t) || ge(t))
            return ((t = Ri(t, e.mode, n, null)), (t.return = e), t);
          if (typeof t.then == `function`) return f(e, so(t), n);
          if (t.$$typeof === A) return f(e, Ea(e, t), n);
          lo(e, t);
        }
        return null;
      }
      function p(e, t, n, r) {
        var i = t === null ? null : t.key;
        if (
          (typeof n == `string` && n !== ``) ||
          typeof n == `number` ||
          typeof n == `bigint`
        )
          return i === null ? c(e, t, `` + n, r) : null;
        if (typeof n == `object` && n) {
          switch (n.$$typeof) {
            case D:
              return n.key === i ? l(e, t, n, r) : null;
            case O:
              return n.key === i ? u(e, t, n, r) : null;
            case le:
              return ((n = to(n)), p(e, t, n, r));
          }
          if (ye(n) || ge(n)) return i === null ? d(e, t, n, r, null) : null;
          if (typeof n.then == `function`) return p(e, t, so(n), r);
          if (n.$$typeof === A) return p(e, t, Ea(e, n), r);
          lo(e, n);
        }
        return null;
      }
      function m(e, t, n, r, i) {
        if (
          (typeof r == `string` && r !== ``) ||
          typeof r == `number` ||
          typeof r == `bigint`
        )
          return ((e = e.get(n) || null), c(t, e, `` + r, i));
        if (typeof r == `object` && r) {
          switch (r.$$typeof) {
            case D:
              return (
                (e = e.get(r.key === null ? n : r.key) || null),
                l(t, e, r, i)
              );
            case O:
              return (
                (e = e.get(r.key === null ? n : r.key) || null),
                u(t, e, r, i)
              );
            case le:
              return ((r = to(r)), m(e, t, n, r, i));
          }
          if (ye(r) || ge(r))
            return ((e = e.get(n) || null), d(t, e, r, i, null));
          if (typeof r.then == `function`) return m(e, t, n, so(r), i);
          if (r.$$typeof === A) return m(e, t, n, Ea(t, r), i);
          lo(t, r);
        }
        return null;
      }
      function h(i, a, s, c) {
        for (
          var l = null, u = null, d = a, h = (a = 0), g = null;
          d !== null && h < s.length;
          h++
        ) {
          d.index > h ? ((g = d), (d = null)) : (g = d.sibling);
          var _ = p(i, d, s[h], c);
          if (_ === null) {
            d === null && (d = g);
            break;
          }
          (e && d && _.alternate === null && t(i, d),
            (a = o(_, a, h)),
            u === null ? (l = _) : (u.sibling = _),
            (u = _),
            (d = g));
        }
        if (h === s.length) return (n(i, d), B && $i(i, h), l);
        if (d === null) {
          for (; h < s.length; h++)
            ((d = f(i, s[h], c)),
              d !== null &&
                ((a = o(d, a, h)),
                u === null ? (l = d) : (u.sibling = d),
                (u = d)));
          return (B && $i(i, h), l);
        }
        for (d = r(d); h < s.length; h++)
          ((g = m(d, i, h, s[h], c)),
            g !== null &&
              (e &&
                ((_ = g.alternate),
                _ !== null && d.delete(_.key === null ? h : _.key)),
              (a = o(g, a, h)),
              u === null ? (l = g) : (u.sibling = g),
              (u = g)));
        return (
          e &&
            d.forEach(function (e) {
              return t(i, e);
            }),
          B && $i(i, h),
          l
        );
      }
      function g(a, s, c, l) {
        if (c == null) throw Error(i(151));
        for (
          var u = null, d = null, h = s, g = (s = 0), _ = null, v = c.next();
          h !== null && !v.done;
          g++, v = c.next()
        ) {
          h.index > g ? ((_ = h), (h = null)) : (_ = h.sibling);
          var y = p(a, h, v.value, l);
          if (y === null) {
            h === null && (h = _);
            break;
          }
          (e && h && y.alternate === null && t(a, h),
            (s = o(y, s, g)),
            d === null ? (u = y) : (d.sibling = y),
            (d = y),
            (h = _));
        }
        if (v.done) return (n(a, h), B && $i(a, g), u);
        if (h === null) {
          for (; !v.done; g++, v = c.next())
            ((v = f(a, v.value, l)),
              v !== null &&
                ((s = o(v, s, g)),
                d === null ? (u = v) : (d.sibling = v),
                (d = v)));
          return (B && $i(a, g), u);
        }
        for (h = r(h); !v.done; g++, v = c.next())
          ((v = m(h, a, g, v.value, l)),
            v !== null &&
              (e &&
                ((_ = v.alternate),
                _ !== null && h.delete(_.key === null ? g : _.key)),
              (s = o(v, s, g)),
              d === null ? (u = v) : (d.sibling = v),
              (d = v)));
        return (
          e &&
            h.forEach(function (e) {
              return t(a, e);
            }),
          B && $i(a, g),
          u
        );
      }
      function _(e, r, o, c) {
        if (
          (typeof o == `object` &&
            o &&
            o.type === k &&
            o.key === null &&
            o.props.ref === void 0 &&
            (o = o.props.children),
          typeof o == `object` && o)
        ) {
          switch (o.$$typeof) {
            case D:
              a: {
                for (var l = o.key; r !== null;) {
                  if (r.key === l) {
                    if (((l = o.type), l === k)) {
                      if (r.tag === 7) {
                        (n(e, r.sibling),
                          (c = a(r, o.props.children)),
                          co(c, o),
                          (c.return = e),
                          (e = c));
                        break a;
                      }
                    } else if (
                      r.elementType === l ||
                      (typeof l == `object` &&
                        l &&
                        l.$$typeof === le &&
                        to(l) === r.type)
                    ) {
                      (n(e, r.sibling),
                        (c = a(r, o.props)),
                        co(c, o),
                        (c.return = e),
                        (e = c));
                      break a;
                    }
                    n(e, r);
                    break;
                  }
                  (t(e, r), (r = r.sibling));
                }
                o.type === k
                  ? ((c = Ri(o.props.children, e.mode, c, o.key)),
                    co(c, o),
                    (c.return = e),
                    (e = c))
                  : ((c = Li(o.type, o.key, o.props, null, e.mode, c)),
                    co(c, o),
                    (c.return = e),
                    (e = c));
              }
              return s(e);
            case O:
              a: {
                for (l = o.key; r !== null;) {
                  if (r.key === l) {
                    if (
                      r.tag === 4 &&
                      r.stateNode.containerInfo === o.containerInfo &&
                      r.stateNode.implementation === o.implementation
                    ) {
                      (n(e, r.sibling),
                        (c = a(r, o.children || [])),
                        (c.return = e),
                        (e = c));
                      break a;
                    }
                    n(e, r);
                    break;
                  }
                  (t(e, r), (r = r.sibling));
                }
                ((c = Vi(o, e.mode, c)), (c.return = e), (e = c));
              }
              return s(e);
            case le:
              return ((o = to(o)), _(e, r, o, c));
          }
          if (ye(o)) return h(e, r, o, c);
          if (ge(o)) {
            if (((l = ge(o)), typeof l != `function`)) throw Error(i(150));
            return ((o = l.call(o)), g(e, r, o, c));
          }
          if (typeof o.then == `function`) return _(e, r, so(o), c);
          if (o.$$typeof === A) return _(e, r, Ea(e, o), c);
          lo(e, o);
        }
        return (typeof o == `string` && o !== ``) ||
          typeof o == `number` ||
          typeof o == `bigint`
          ? ((o = `` + o),
            r !== null && r.tag === 6
              ? (n(e, r.sibling), (c = a(r, o)), (c.return = e), (e = c))
              : (n(e, r), (c = zi(o, e.mode, c)), (c.return = e), (e = c)),
            s(e))
          : n(e, r);
      }
      return function (e, t, n, r) {
        try {
          oo = 0;
          var i = _(e, t, n, r);
          return ((ao = null), i);
        } catch (t) {
          if (t === Ya || t === Za) throw t;
          var a = Ni(29, t, null, e.mode);
          return ((a.lanes = r), (a.return = e), a);
        }
      };
    }
    var fo = uo(!0),
      po = uo(!1),
      mo = !1;
    function ho(e) {
      e.updateQueue = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: { pending: null, lanes: 0, hiddenCallbacks: null },
        callbacks: null,
      };
    }
    function go(e, t) {
      ((e = e.updateQueue),
        t.updateQueue === e &&
          (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            callbacks: null,
          }));
    }
    function _o(e) {
      return { lane: e, tag: 0, payload: null, callback: null, next: null };
    }
    function vo(e, t, n) {
      var r = e.updateQueue;
      if (r === null) return null;
      if (((r = r.shared), K & 2)) {
        var i = r.pending;
        return (
          i === null ? (t.next = t) : ((t.next = i.next), (i.next = t)),
          (r.pending = t),
          (t = Ai(e)),
          ki(e, null, n),
          t
        );
      }
      return (Ei(e, r, t, n), Ai(e));
    }
    function yo(e, t, n) {
      if (((t = t.updateQueue), t !== null && ((t = t.shared), n & 4194048))) {
        var r = t.lanes;
        ((r &= e.pendingLanes), (n |= r), (t.lanes = n), gt(e, n));
      }
    }
    function bo(e, t) {
      var n = e.updateQueue,
        r = e.alternate;
      if (r !== null && ((r = r.updateQueue), n === r)) {
        var i = null,
          a = null;
        if (((n = n.firstBaseUpdate), n !== null)) {
          do {
            var o = {
              lane: n.lane,
              tag: n.tag,
              payload: n.payload,
              callback: null,
              next: null,
            };
            (a === null ? (i = a = o) : (a = a.next = o), (n = n.next));
          } while (n !== null);
          a === null ? (i = a = t) : (a = a.next = t);
        } else i = a = t;
        ((n = {
          baseState: r.baseState,
          firstBaseUpdate: i,
          lastBaseUpdate: a,
          shared: r.shared,
          callbacks: r.callbacks,
        }),
          (e.updateQueue = n));
        return;
      }
      ((e = n.lastBaseUpdate),
        e === null ? (n.firstBaseUpdate = t) : (e.next = t),
        (n.lastBaseUpdate = t));
    }
    var xo = !1;
    function So() {
      if (xo) {
        var e = Ba;
        if (e !== null) throw e;
      }
    }
    function Co(e, t, n, r) {
      xo = !1;
      var i = e.updateQueue;
      mo = !1;
      var a = i.firstBaseUpdate,
        o = i.lastBaseUpdate,
        s = i.shared.pending;
      if (s !== null) {
        i.shared.pending = null;
        var c = s,
          l = c.next;
        ((c.next = null), o === null ? (a = l) : (o.next = l), (o = c));
        var u = e.alternate;
        u !== null &&
          ((u = u.updateQueue),
          (s = u.lastBaseUpdate),
          s !== o &&
            (s === null ? (u.firstBaseUpdate = l) : (s.next = l),
            (u.lastBaseUpdate = c)));
      }
      if (a !== null) {
        var d = i.baseState;
        ((o = 0), (u = l = c = null), (s = a));
        do {
          var f = s.lane & -536870913,
            p = f !== s.lane;
          if (p ? (Y & f) === f : (r & f) === f) {
            (f !== 0 && f === za && (xo = !0),
              u !== null &&
                (u = u.next =
                  {
                    lane: 0,
                    tag: s.tag,
                    payload: s.payload,
                    callback: null,
                    next: null,
                  }));
            a: {
              var m = e,
                h = s;
              f = t;
              var g = n;
              switch (h.tag) {
                case 1:
                  if (((m = h.payload), typeof m == `function`)) {
                    d = m.call(g, d, f);
                    break a;
                  }
                  d = m;
                  break a;
                case 3:
                  m.flags = (m.flags & -65537) | 128;
                case 0:
                  if (
                    ((m = h.payload),
                    (f = typeof m == `function` ? m.call(g, d, f) : m),
                    f == null)
                  )
                    break a;
                  d = T({}, d, f);
                  break a;
                case 2:
                  mo = !0;
              }
            }
            ((f = s.callback),
              f !== null &&
                ((e.flags |= 64),
                p && (e.flags |= 8192),
                (p = i.callbacks),
                p === null ? (i.callbacks = [f]) : p.push(f)));
          } else
            ((p = {
              lane: f,
              tag: s.tag,
              payload: s.payload,
              callback: s.callback,
              next: null,
            }),
              u === null ? ((l = u = p), (c = d)) : (u = u.next = p),
              (o |= f));
          if (((s = s.next), s === null)) {
            if (((s = i.shared.pending), s === null)) break;
            ((p = s),
              (s = p.next),
              (p.next = null),
              (i.lastBaseUpdate = p),
              (i.shared.pending = null));
          }
        } while (1);
        (u === null && (c = d),
          (i.baseState = c),
          (i.firstBaseUpdate = l),
          (i.lastBaseUpdate = u),
          a === null && (i.shared.lanes = 0),
          (od |= o),
          (e.lanes = o),
          (e.memoizedState = d));
      }
    }
    function wo(e, t) {
      if (typeof e != `function`) throw Error(i(191, e));
      e.call(t);
    }
    function To(e, t) {
      var n = e.callbacks;
      if (n !== null)
        for (e.callbacks = null, e = 0; e < n.length; e++) wo(n[e], t);
    }
    var Eo = Ce(null),
      Do = Ce(0);
    function Oo(e, t) {
      ((e = id), N(Do, e), N(Eo, t), (id = e | t.baseLanes));
    }
    function ko() {
      (N(Do, id), N(Eo, Eo.current));
    }
    function Ao() {
      ((id = Do.current), we(Eo), we(Do));
    }
    var jo = Ce(null),
      Mo = null;
    function No(e) {
      var t = e.alternate;
      (N(Ro, Ro.current & 1),
        N(jo, e),
        Mo === null &&
          (t === null || Eo.current !== null || t.memoizedState !== null) &&
          (Mo = e));
    }
    function Po(e) {
      (N(Ro, Ro.current), N(jo, e), Mo === null && (Mo = e));
    }
    function Fo(e) {
      e.tag === 22
        ? (N(Ro, Ro.current), N(jo, e), Mo === null && (Mo = e))
        : Io();
    }
    function Io() {
      (N(Ro, Ro.current), N(jo, jo.current));
    }
    function Lo(e) {
      (we(jo), Mo === e && (Mo = null), we(Ro));
    }
    var Ro = Ce(0);
    function zo(e, t) {
      (N(jo, jo.current), N(Ro, t));
    }
    function Bo(e) {
      (we(Ro), we(jo), Mo === e && (Mo = null));
    }
    function Vo(e) {
      for (var t = e; t !== null;) {
        if (t.tag === 13) {
          var n = t.memoizedState;
          if (n !== null && ((n = n.dehydrated), n === null || om(n) || sm(n)))
            return t;
        } else if (
          t.tag === 19 &&
          t.memoizedProps.revealOrder !== `independent`
        ) {
          if (t.flags & 128) return t;
        } else if (t.child !== null) {
          ((t.child.return = t), (t = t.child));
          continue;
        }
        if (t === e) break;
        for (; t.sibling === null;) {
          if (t.return === null || t.return === e) return null;
          t = t.return;
        }
        ((t.sibling.return = t.return), (t = t.sibling));
      }
      return null;
    }
    var Ho = 0,
      V = null,
      H = null,
      Uo = null,
      Wo = !1,
      Go = !1,
      Ko = !1,
      qo = 0,
      Jo = 0,
      Yo = null,
      Xo = 0;
    function Zo() {
      throw Error(i(321));
    }
    function Qo(e, t) {
      if (t === null) return !1;
      for (var n = 0; n < t.length && n < e.length; n++)
        if (!Hr(e[n], t[n])) return !1;
      return !0;
    }
    function $o(e, t, n, r, i, a) {
      return (
        (Ho = a),
        (V = t),
        (t.memoizedState = null),
        (t.updateQueue = null),
        (t.lanes = 0),
        (j.H = e === null || e.memoizedState === null ? gc : _c),
        (Ko = !1),
        (a = n(r, i)),
        (Ko = !1),
        Go && (a = ts(t, n, r, i)),
        es(e),
        a
      );
    }
    function es(e) {
      j.H = hc;
      var t = H !== null && H.next !== null;
      if (((Ho = 0), (Uo = H = V = null), (Wo = !1), (Jo = 0), (Yo = null), t))
        throw Error(i(300));
      e === null ||
        Pc ||
        ((e = e.dependencies), e !== null && Ca(e) && (Pc = !0));
    }
    function ts(e, t, n, r) {
      V = e;
      var a = 0;
      do {
        if ((Go && (Yo = null), (Jo = 0), (Go = !1), 25 <= a))
          throw Error(i(301));
        if (((a += 1), (Uo = H = null), e.updateQueue != null)) {
          var o = e.updateQueue;
          ((o.lastEffect = null),
            (o.events = null),
            (o.stores = null),
            o.memoCache != null && (o.memoCache.index = 0));
        }
        ((j.H = vc), (o = t(n, r)));
      } while (Go);
      return o;
    }
    function ns() {
      var e = j.H,
        t = e.useState()[0];
      return (
        (t = typeof t.then == `function` ? ls(t) : t),
        (e = e.useState()[0]),
        (H === null ? null : H.memoizedState) !== e && (V.flags |= 1024),
        t
      );
    }
    function rs() {
      var e = qo !== 0;
      return ((qo = 0), e);
    }
    function is(e, t, n) {
      ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~n));
    }
    function as(e) {
      if (Wo) {
        for (e = e.memoizedState; e !== null;) {
          var t = e.queue;
          (t !== null && (t.pending = null), (e = e.next));
        }
        Wo = !1;
      }
      ((Ho = 0), (Uo = H = V = null), (Go = !1), (Jo = qo = 0), (Yo = null));
    }
    function os() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null,
      };
      return (
        Uo === null ? (V.memoizedState = Uo = e) : (Uo = Uo.next = e),
        Uo
      );
    }
    function ss() {
      if (H === null) {
        var e = V.alternate;
        e = e === null ? null : e.memoizedState;
      } else e = H.next;
      var t = Uo === null ? V.memoizedState : Uo.next;
      if (t !== null) ((Uo = t), (H = e));
      else {
        if (e === null)
          throw V.alternate === null ? Error(i(467)) : Error(i(310));
        ((H = e),
          (e = {
            memoizedState: H.memoizedState,
            baseState: H.baseState,
            baseQueue: H.baseQueue,
            queue: H.queue,
            next: null,
          }),
          Uo === null ? (V.memoizedState = Uo = e) : (Uo = Uo.next = e));
      }
      return Uo;
    }
    function cs() {
      return { lastEffect: null, events: null, stores: null, memoCache: null };
    }
    function ls(e) {
      var t = Jo;
      return (
        (Jo += 1),
        Yo === null && (Yo = []),
        (e = eo(Yo, e, t)),
        (t = V),
        (Uo === null ? t.memoizedState : Uo.next) === null &&
          ((t = t.alternate),
          (j.H = t === null || t.memoizedState === null ? gc : _c)),
        e
      );
    }
    function us(e) {
      if (typeof e == `object` && e) {
        if (typeof e.then == `function`) return ls(e);
        if (e.$$typeof === me) return;
        if (e.$$typeof === A) return Ta(e);
      }
      throw Error(i(438, String(e)));
    }
    function ds(e) {
      var t = null,
        n = V.updateQueue;
      if ((n !== null && (t = n.memoCache), t == null)) {
        var r = V.alternate;
        r !== null &&
          ((r = r.updateQueue),
          r !== null &&
            ((r = r.memoCache),
            r != null &&
              (t = {
                data: r.data.map(function (e) {
                  return e.slice();
                }),
                index: 0,
              })));
      }
      if (
        ((t ??= { data: [], index: 0 }),
        n === null && ((n = cs()), (V.updateQueue = n)),
        (n.memoCache = t),
        (n = t.data[t.index]),
        n === void 0)
      )
        for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = fe;
      return (t.index++, n);
    }
    function fs(e, t) {
      return typeof t == `function` ? t(e) : t;
    }
    function ps(e) {
      return ms(ss(), H, e);
    }
    function ms(e, t, n) {
      var r = e.queue;
      if (r === null) throw Error(i(311));
      r.lastRenderedReducer = n;
      var a = e.baseQueue,
        o = r.pending;
      if (o !== null) {
        if (a !== null) {
          var s = a.next;
          ((a.next = o.next), (o.next = s));
        }
        ((t.baseQueue = a = o), (r.pending = null));
      }
      if (((o = e.baseState), a === null)) e.memoizedState = o;
      else {
        t = a.next;
        var c = (s = null),
          l = null,
          u = t,
          d = !1;
        do {
          var f = u.lane & -536870913;
          if (f === u.lane ? (Ho & f) === f : (Y & f) === f) {
            var p = u.revertLane;
            if (p === 0)
              (l !== null &&
                (l = l.next =
                  {
                    lane: 0,
                    revertLane: 0,
                    gesture: null,
                    action: u.action,
                    hasEagerState: u.hasEagerState,
                    eagerState: u.eagerState,
                    next: null,
                  }),
                f === za && (d = !0));
            else if ((Ho & p) === p) {
              ((u = u.next), p === za && (d = !0));
              continue;
            } else
              ((f = {
                lane: 0,
                revertLane: u.revertLane,
                gesture: null,
                action: u.action,
                hasEagerState: u.hasEagerState,
                eagerState: u.eagerState,
                next: null,
              }),
                l === null ? ((c = l = f), (s = o)) : (l = l.next = f),
                (V.lanes |= p),
                (od |= p));
            ((f = u.action),
              Ko && n(o, f),
              (o = u.hasEagerState ? u.eagerState : n(o, f)));
          } else
            ((p = {
              lane: f,
              revertLane: u.revertLane,
              gesture: u.gesture,
              action: u.action,
              hasEagerState: u.hasEagerState,
              eagerState: u.eagerState,
              next: null,
            }),
              l === null ? ((c = l = p), (s = o)) : (l = l.next = p),
              (V.lanes |= f),
              (od |= f));
          u = u.next;
        } while (u !== null && u !== t);
        if (
          (l === null ? (s = o) : (l.next = c),
          !Hr(o, e.memoizedState) && ((Pc = !0), d && ((n = Ba), n !== null)))
        )
          throw n;
        ((e.memoizedState = o),
          (e.baseState = s),
          (e.baseQueue = l),
          (r.lastRenderedState = o));
      }
      return (a === null && (r.lanes = 0), [e.memoizedState, r.dispatch]);
    }
    function hs(e) {
      var t = ss(),
        n = t.queue;
      if (n === null) throw Error(i(311));
      n.lastRenderedReducer = e;
      var r = n.dispatch,
        a = n.pending,
        o = t.memoizedState;
      if (a !== null) {
        n.pending = null;
        var s = (a = a.next);
        do ((o = e(o, s.action)), (s = s.next));
        while (s !== a);
        (Hr(o, t.memoizedState) || (Pc = !0),
          (t.memoizedState = o),
          t.baseQueue === null && (t.baseState = o),
          (n.lastRenderedState = o));
      }
      return [o, r];
    }
    function gs(e, t, n) {
      var r = V,
        a = ss(),
        o = B;
      if (o) {
        if (n === void 0) throw Error(i(407));
        n = n();
      } else n = t();
      var s = !Hr((H || a).memoizedState, n);
      if (
        (s && ((a.memoizedState = n), (Pc = !0)),
        (a = a.queue),
        Vs(ys.bind(null, r, a, e), [e]),
        (e =
          a.getSnapshot !== t ||
          s ||
          (Uo !== null && !!(Uo.memoizedState.tag & 1))),
        Is(e ? 9 : 8, { destroy: void 0 }, vs.bind(null, r, a, n, t), null),
        e)
      ) {
        if (((r.flags |= 2048), q === null)) throw Error(i(349));
        o || Ho & 127 || _s(r, t, n);
      }
      return n;
    }
    function _s(e, t, n) {
      ((e.flags |= 16384),
        (e = { getSnapshot: t, value: n }),
        (t = V.updateQueue),
        t === null
          ? ((t = cs()), (V.updateQueue = t), (t.stores = [e]))
          : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
    }
    function vs(e, t, n, r) {
      ((t.value = n), (t.getSnapshot = r), bs(t) && xs(e));
    }
    function ys(e, t, n) {
      return n(function () {
        bs(t) && xs(e);
      });
    }
    function bs(e) {
      var t = e.getSnapshot;
      e = e.value;
      try {
        var n = t();
        return !Hr(e, n);
      } catch {
        return !0;
      }
    }
    function xs(e) {
      var t = Oi(e, 2);
      t !== null && Pd(t, e, 2);
    }
    function Ss(e) {
      var t = os();
      if (typeof e == `function`) {
        var n = e;
        if (((e = n()), Ko)) {
          Qe(!0);
          try {
            n();
          } finally {
            Qe(!1);
          }
        }
      }
      return (
        (t.memoizedState = t.baseState = e),
        (t.queue = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: fs,
          lastRenderedState: e,
        }),
        t
      );
    }
    function Cs(e, t, n, r) {
      return ((e.baseState = n), ms(e, H, typeof r == `function` ? r : fs));
    }
    function ws(e, t, n, r, a) {
      if (fc(e)) throw Error(i(485));
      if (((e = t.action), e !== null)) {
        var o = {
          payload: a,
          action: e,
          next: null,
          isTransition: !0,
          status: `pending`,
          value: null,
          reason: null,
          listeners: [],
          then: function (e) {
            o.listeners.push(e);
          },
        };
        (j.T === null ? (o.isTransition = !1) : n(!0),
          r(o),
          (n = t.pending),
          n === null
            ? ((o.next = t.pending = o), Ts(t, o))
            : ((o.next = n.next), (t.pending = n.next = o)));
      }
    }
    function Ts(e, t) {
      var n = t.action,
        r = t.payload,
        i = e.state;
      if (t.isTransition) {
        var a = j.T,
          o = {};
        ((o.types = a === null ? null : a.types), (j.T = o));
        try {
          var s = n(i, r),
            c = j.S;
          (c !== null && c(o, s), Es(e, t, s));
        } catch (n) {
          Os(e, t, n);
        } finally {
          (a !== null && o.types !== null && (a.types = o.types), (j.T = a));
        }
      } else
        try {
          ((a = n(i, r)), Es(e, t, a));
        } catch (n) {
          Os(e, t, n);
        }
    }
    function Es(e, t, n) {
      typeof n == `object` && n && typeof n.then == `function`
        ? n.then(
            function (n) {
              Ds(e, t, n);
            },
            function (n) {
              return Os(e, t, n);
            },
          )
        : Ds(e, t, n);
    }
    function Ds(e, t, n) {
      ((t.status = `fulfilled`),
        (t.value = n),
        ks(t),
        (e.state = n),
        (t = e.pending),
        t !== null &&
          ((n = t.next),
          n === t
            ? (e.pending = null)
            : ((n = n.next), (t.next = n), Ts(e, n))));
    }
    function Os(e, t, n) {
      var r = e.pending;
      if (((e.pending = null), r !== null)) {
        r = r.next;
        do ((t.status = `rejected`), (t.reason = n), ks(t), (t = t.next));
        while (t !== r);
      }
      e.action = null;
    }
    function ks(e) {
      e = e.listeners;
      for (var t = 0; t < e.length; t++) (0, e[t])();
    }
    function As(e, t) {
      return t;
    }
    function js(e, t) {
      if (B) {
        var n = q.formState;
        if (n !== null) {
          a: {
            var r = V;
            if (B) {
              if (z) {
                b: {
                  for (var i = z, a = oa; i.nodeType !== 8;) {
                    if (!a) {
                      i = null;
                      break b;
                    }
                    if (((i = lm(i.nextSibling)), i === null)) {
                      i = null;
                      break b;
                    }
                  }
                  ((a = i.data), (i = a === `F!` || a === `F` ? i : null));
                }
                if (i) {
                  ((z = lm(i.nextSibling)), (r = i.data === `F!`));
                  break a;
                }
              }
              ca(r);
            }
            r = !1;
          }
          r && (t = n[0]);
        }
      }
      return (
        (n = os()),
        (n.memoizedState = n.baseState = t),
        (r = {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: As,
          lastRenderedState: t,
        }),
        (n.queue = r),
        (n = lc.bind(null, V, r)),
        (r.dispatch = n),
        (r = Ss(!1)),
        (a = dc.bind(null, V, !1, r.queue)),
        (r = os()),
        (i = { state: t, dispatch: null, action: e, pending: null }),
        (r.queue = i),
        (n = ws.bind(null, V, i, a, n)),
        (i.dispatch = n),
        (r.memoizedState = e),
        [t, n, !1]
      );
    }
    function Ms(e) {
      return Ns(ss(), H, e);
    }
    function Ns(e, t, n) {
      if (
        ((t = ms(e, t, As)[0]),
        (e = ps(fs)[0]),
        typeof t == `object` && t && typeof t.then == `function`)
      )
        try {
          var r = ls(t);
        } catch (e) {
          throw e === Ya ? Za : e;
        }
      else r = t;
      t = ss();
      var i = t.queue,
        a = i.dispatch;
      return (
        n !== t.memoizedState &&
          ((V.flags |= 2048),
          Is(9, { destroy: void 0 }, Ps.bind(null, i, n), null)),
        [r, a, e]
      );
    }
    function Ps(e, t) {
      e.action = t;
    }
    function Fs(e) {
      var t = ss(),
        n = H;
      if (n !== null) return Ns(t, n, e);
      (ss(), (t = t.memoizedState), (n = ss()));
      var r = n.queue.dispatch;
      return ((n.memoizedState = e), [t, r, !1]);
    }
    function Is(e, t, n, r) {
      return (
        (e = { tag: e, create: n, deps: r, inst: t, next: null }),
        (t = V.updateQueue),
        t === null && ((t = cs()), (V.updateQueue = t)),
        (n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e)),
        e
      );
    }
    function Ls() {
      return ss().memoizedState;
    }
    function Rs(e, t, n, r) {
      var i = os();
      ((V.flags |= e),
        (i.memoizedState = Is(
          1 | t,
          { destroy: void 0 },
          n,
          r === void 0 ? null : r,
        )));
    }
    function zs(e, t, n, r) {
      var i = ss();
      r = r === void 0 ? null : r;
      var a = i.memoizedState.inst;
      H !== null && r !== null && Qo(r, H.memoizedState.deps)
        ? (i.memoizedState = Is(t, a, n, r))
        : ((V.flags |= e), (i.memoizedState = Is(1 | t, a, n, r)));
    }
    function Bs(e, t) {
      Rs(8390656, 8, e, t);
    }
    function Vs(e, t) {
      zs(2048, 8, e, t);
    }
    function Hs(e) {
      V.flags |= 4;
      var t = V.updateQueue;
      if (t === null) ((t = cs()), (V.updateQueue = t), (t.events = [e]));
      else {
        var n = t.events;
        n === null ? (t.events = [e]) : n.push(e);
      }
    }
    function Us(e) {
      var t = ss().memoizedState;
      return (
        Hs({ ref: t, nextImpl: e }),
        function () {
          if (K & 2) throw Error(i(440));
          return t.impl.apply(void 0, arguments);
        }
      );
    }
    function Ws(e, t) {
      return zs(4, 2, e, t);
    }
    function Gs(e, t) {
      return zs(4, 4, e, t);
    }
    function Ks(e, t) {
      if (typeof t == `function`) {
        e = e();
        var n = t(e);
        return function () {
          typeof n == `function` ? n() : t(null);
        };
      }
      if (t != null)
        return (
          (e = e()),
          (t.current = e),
          function () {
            t.current = null;
          }
        );
    }
    function qs(e, t, n) {
      ((n = n == null ? null : n.concat([e])),
        zs(4, 4, Ks.bind(null, t, e), n));
    }
    function Js() {}
    function Ys(e, t) {
      var n = ss();
      t = t === void 0 ? null : t;
      var r = n.memoizedState;
      return t !== null && Qo(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
    }
    function Xs(e, t) {
      var n = ss();
      t = t === void 0 ? null : t;
      var r = n.memoizedState;
      if (t !== null && Qo(t, r[1])) return r[0];
      if (((r = e()), Ko)) {
        Qe(!0);
        try {
          e();
        } finally {
          Qe(!1);
        }
      }
      return ((n.memoizedState = [r, t]), r);
    }
    function Zs(e, t, n) {
      return n === void 0 || (Ho & 1073741824 && !(Y & 261930))
        ? (e.memoizedState = t)
        : ((e.memoizedState = n), (e = Md()), (V.lanes |= e), (od |= e), n);
    }
    function Qs(e, t, n, r) {
      return Hr(n, t)
        ? n
        : Eo.current === null
          ? !(Ho & 106) || (Ho & 1073741824 && !(Y & 261930))
            ? ((Pc = !0), (e.memoizedState = n))
            : ((e = Md()), (V.lanes |= e), (od |= e), t)
          : ((e = Zs(e, n, r)), Hr(e, t) || (Pc = !0), e);
    }
    function $s(e, t, n, r, i) {
      var a = M.p;
      M.p = a !== 0 && 8 > a ? a : 8;
      var o = j.T,
        s = {};
      ((s.types = o === null ? null : o.types), (j.T = s), dc(e, !1, t, n));
      try {
        var c = i(),
          l = j.S;
        (l !== null && l(s, c),
          typeof c == `object` && c && typeof c.then == `function`
            ? uc(e, t, Ua(c, r), jd(e))
            : uc(e, t, r, jd(e)));
      } catch (n) {
        uc(e, t, { then: function () {}, status: `rejected`, reason: n }, jd());
      } finally {
        ((M.p = a),
          o !== null && s.types !== null && (o.types = s.types),
          (j.T = o));
      }
    }
    function ec() {}
    function tc(e, t, n, r) {
      if (e.tag !== 5) throw Error(i(476));
      var a = nc(e).queue;
      $s(
        e,
        a,
        t,
        be,
        n === null
          ? ec
          : function () {
              return (rc(e), n(r));
            },
      );
    }
    function nc(e) {
      var t = e.memoizedState;
      if (t !== null) return t;
      t = {
        memoizedState: be,
        baseState: be,
        baseQueue: null,
        queue: {
          pending: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: fs,
          lastRenderedState: be,
        },
        next: null,
      };
      var n = {};
      return (
        (t.next = {
          memoizedState: n,
          baseState: n,
          baseQueue: null,
          queue: {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: fs,
            lastRenderedState: n,
          },
          next: null,
        }),
        (e.memoizedState = t),
        (e = e.alternate),
        e !== null && (e.memoizedState = t),
        t
      );
    }
    function rc(e) {
      var t = nc(e);
      (t.next === null && (t = e.alternate.memoizedState),
        uc(e, t.next.queue, {}, jd()));
    }
    function ic() {
      return Ta(sh);
    }
    function ac() {
      return ss().memoizedState;
    }
    function oc() {
      return ss().memoizedState;
    }
    function sc(e) {
      for (var t = e.return; t !== null;) {
        switch (t.tag) {
          case 24:
          case 3:
            var n = jd();
            e = _o(n);
            var r = vo(t, e, n);
            (r !== null && (Pd(r, t, n), yo(r, t, n)),
              (t = { cache: Ma() }),
              (e.payload = t));
            return;
        }
        t = t.return;
      }
    }
    function cc(e, t, n) {
      var r = jd();
      ((n = {
        lane: r,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
        fc(e)
          ? pc(t, n)
          : ((n = Di(e, t, n, r)), n !== null && (Pd(n, e, r), mc(n, t, r))));
    }
    function lc(e, t, n) {
      uc(e, t, n, jd());
    }
    function uc(e, t, n, r) {
      var i = {
        lane: r,
        revertLane: 0,
        gesture: null,
        action: n,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
      if (fc(e)) pc(t, i);
      else {
        var a = e.alternate;
        if (
          e.lanes === 0 &&
          (a === null || a.lanes === 0) &&
          ((a = t.lastRenderedReducer), a !== null)
        )
          try {
            var o = t.lastRenderedState,
              s = a(o, n);
            if (((i.hasEagerState = !0), (i.eagerState = s), Hr(s, o)))
              return (Ei(e, t, i, 0), q === null && Ti(), !1);
          } catch {}
        if (((n = Di(e, t, i, r)), n !== null))
          return (Pd(n, e, r), mc(n, t, r), !0);
      }
      return !1;
    }
    function dc(e, t, n, r) {
      if (
        ((r = {
          lane: 2,
          revertLane: Pf(),
          gesture: null,
          action: r,
          hasEagerState: !1,
          eagerState: null,
          next: null,
        }),
        fc(e))
      ) {
        if (t) throw Error(i(479));
      } else ((t = Di(e, n, r, 2)), t !== null && Pd(t, e, 2));
    }
    function fc(e) {
      var t = e.alternate;
      return e === V || (t !== null && t === V);
    }
    function pc(e, t) {
      Go = Wo = !0;
      var n = e.pending;
      (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
        (e.pending = t));
    }
    function mc(e, t, n) {
      if (n & 4194048) {
        var r = t.lanes;
        ((r &= e.pendingLanes), (n |= r), (t.lanes = n), gt(e, n));
      }
    }
    var hc = {
        readContext: Ta,
        use: us,
        useCallback: Zo,
        useContext: Zo,
        useEffect: Zo,
        useImperativeHandle: Zo,
        useLayoutEffect: Zo,
        useInsertionEffect: Zo,
        useMemo: Zo,
        useReducer: Zo,
        useRef: Zo,
        useState: Zo,
        useDebugValue: Zo,
        useDeferredValue: Zo,
        useTransition: Zo,
        useSyncExternalStore: Zo,
        useId: Zo,
        useHostTransitionStatus: Zo,
        useFormState: Zo,
        useActionState: Zo,
        useOptimistic: Zo,
        useMemoCache: Zo,
        useCacheRefresh: Zo,
        useEffectEvent: Zo,
      },
      gc = {
        readContext: Ta,
        use: us,
        useCallback: function (e, t) {
          return ((os().memoizedState = [e, t === void 0 ? null : t]), e);
        },
        useContext: Ta,
        useEffect: Bs,
        useImperativeHandle: function (e, t, n) {
          ((n = n == null ? null : n.concat([e])),
            Rs(4194308, 4, Ks.bind(null, t, e), n));
        },
        useLayoutEffect: function (e, t) {
          return Rs(4194308, 4, e, t);
        },
        useInsertionEffect: function (e, t) {
          Rs(4, 2, e, t);
        },
        useMemo: function (e, t) {
          var n = os();
          t = t === void 0 ? null : t;
          var r = e();
          if (Ko) {
            Qe(!0);
            try {
              e();
            } finally {
              Qe(!1);
            }
          }
          return ((n.memoizedState = [r, t]), r);
        },
        useReducer: function (e, t, n) {
          var r = os();
          if (n !== void 0) {
            var i = n(t);
            if (Ko) {
              Qe(!0);
              try {
                n(t);
              } finally {
                Qe(!1);
              }
            }
          } else i = t;
          return (
            (r.memoizedState = r.baseState = i),
            (e = {
              pending: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: e,
              lastRenderedState: i,
            }),
            (r.queue = e),
            (e = e.dispatch = cc.bind(null, V, e)),
            [r.memoizedState, e]
          );
        },
        useRef: function (e) {
          var t = os();
          return ((e = { current: e }), (t.memoizedState = e));
        },
        useState: function (e) {
          e = Ss(e);
          var t = e.queue,
            n = lc.bind(null, V, t);
          return ((t.dispatch = n), [e.memoizedState, n]);
        },
        useDebugValue: Js,
        useDeferredValue: function (e, t) {
          return Zs(os(), e, t);
        },
        useTransition: function () {
          var e = Ss(!1);
          return (
            (e = $s.bind(null, V, e.queue, !0, !1)),
            (os().memoizedState = e),
            [!1, e]
          );
        },
        useSyncExternalStore: function (e, t, n) {
          var r = V,
            a = os();
          if (B) {
            if (n === void 0) throw Error(i(407));
            n = n();
          } else {
            if (((n = t()), q === null)) throw Error(i(349));
            Y & 127 || _s(r, t, n);
          }
          a.memoizedState = n;
          var o = { value: n, getSnapshot: t };
          return (
            (a.queue = o),
            Bs(ys.bind(null, r, o, e), [e]),
            (r.flags |= 2048),
            Is(9, { destroy: void 0 }, vs.bind(null, r, o, n, t), null),
            n
          );
        },
        useId: function () {
          var e = os(),
            t = q.identifierPrefix;
          if (B) {
            var n = Qi,
              r = Zi;
            ((n = (r & ~(1 << (32 - $e(r) - 1))).toString(32) + n),
              (t = `_` + t + `R_` + n),
              (n = qo++),
              0 < n && (t += `H` + n.toString(32)),
              (t += `_`));
          } else ((n = Xo++), (t = `_` + t + `r_` + n.toString(32) + `_`));
          return (e.memoizedState = t);
        },
        useHostTransitionStatus: ic,
        useFormState: js,
        useActionState: js,
        useOptimistic: function (e) {
          var t = os();
          t.memoizedState = t.baseState = e;
          var n = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: null,
            lastRenderedState: null,
          };
          return (
            (t.queue = n),
            (t = dc.bind(null, V, !0, n)),
            (n.dispatch = t),
            [e, t]
          );
        },
        useMemoCache: ds,
        useCacheRefresh: function () {
          return (os().memoizedState = sc.bind(null, V));
        },
        useEffectEvent: function (e) {
          var t = os(),
            n = { impl: e };
          return (
            (t.memoizedState = n),
            function () {
              if (K & 2) throw Error(i(440));
              return n.impl.apply(void 0, arguments);
            }
          );
        },
      },
      _c = {
        readContext: Ta,
        use: us,
        useCallback: Ys,
        useContext: Ta,
        useEffect: Vs,
        useImperativeHandle: qs,
        useInsertionEffect: Ws,
        useLayoutEffect: Gs,
        useMemo: Xs,
        useReducer: ps,
        useRef: Ls,
        useState: function () {
          return ps(fs);
        },
        useDebugValue: Js,
        useDeferredValue: function (e, t) {
          return Qs(ss(), H.memoizedState, e, t);
        },
        useTransition: function () {
          var e = ps(fs)[0],
            t = ss().memoizedState;
          return [typeof e == `boolean` ? e : ls(e), t];
        },
        useSyncExternalStore: gs,
        useId: ac,
        useHostTransitionStatus: ic,
        useFormState: Ms,
        useActionState: Ms,
        useOptimistic: function (e, t) {
          return Cs(ss(), H, e, t);
        },
        useMemoCache: ds,
        useCacheRefresh: oc,
        useEffectEvent: Us,
      },
      vc = {
        readContext: Ta,
        use: us,
        useCallback: Ys,
        useContext: Ta,
        useEffect: Vs,
        useImperativeHandle: qs,
        useInsertionEffect: Ws,
        useLayoutEffect: Gs,
        useMemo: Xs,
        useReducer: hs,
        useRef: Ls,
        useState: function () {
          return hs(fs);
        },
        useDebugValue: Js,
        useDeferredValue: function (e, t) {
          var n = ss();
          return H === null ? Zs(n, e, t) : Qs(n, H.memoizedState, e, t);
        },
        useTransition: function () {
          var e = hs(fs)[0],
            t = ss().memoizedState;
          return [typeof e == `boolean` ? e : ls(e), t];
        },
        useSyncExternalStore: gs,
        useId: ac,
        useHostTransitionStatus: ic,
        useFormState: Fs,
        useActionState: Fs,
        useOptimistic: function (e, t) {
          var n = ss();
          return H === null
            ? ((n.baseState = e), [e, n.queue.dispatch])
            : Cs(n, H, e, t);
        },
        useMemoCache: ds,
        useCacheRefresh: oc,
        useEffectEvent: Us,
      };
    function yc(e, t, n, r) {
      ((t = e.memoizedState),
        (n = n(r, t)),
        (n = n == null ? t : T({}, t, n)),
        (e.memoizedState = n),
        e.lanes === 0 && (e.updateQueue.baseState = n));
    }
    var bc = {
      enqueueSetState: function (e, t, n) {
        e = e._reactInternals;
        var r = jd(),
          i = _o(r);
        ((i.payload = t),
          n != null && (i.callback = n),
          (t = vo(e, i, r)),
          t !== null && (Pd(t, e, r), yo(t, e, r)));
      },
      enqueueReplaceState: function (e, t, n) {
        e = e._reactInternals;
        var r = jd(),
          i = _o(r);
        ((i.tag = 1),
          (i.payload = t),
          n != null && (i.callback = n),
          (t = vo(e, i, r)),
          t !== null && (Pd(t, e, r), yo(t, e, r)));
      },
      enqueueForceUpdate: function (e, t) {
        e = e._reactInternals;
        var n = jd(),
          r = _o(n);
        ((r.tag = 2),
          t != null && (r.callback = t),
          (t = vo(e, r, n)),
          t !== null && (Pd(t, e, n), yo(t, e, n)));
      },
    };
    function xc(e, t, n, r, i, a, o) {
      return (
        (e = e.stateNode),
        typeof e.shouldComponentUpdate == `function`
          ? e.shouldComponentUpdate(r, a, o)
          : t.prototype && t.prototype.isPureReactComponent
            ? !Ur(n, r) || !Ur(i, a)
            : !0
      );
    }
    function Sc(e, t, n, r) {
      ((e = t.state),
        typeof t.componentWillReceiveProps == `function` &&
          t.componentWillReceiveProps(n, r),
        typeof t.UNSAFE_componentWillReceiveProps == `function` &&
          t.UNSAFE_componentWillReceiveProps(n, r),
        t.state !== e && bc.enqueueReplaceState(t, t.state, null));
    }
    function Cc(e, t) {
      var n = t;
      if (`ref` in t) for (var r in ((n = {}), t)) r !== `ref` && (n[r] = t[r]);
      if ((e = e.defaultProps))
        for (var i in (n === t && (n = T({}, n)), e))
          n[i] === void 0 && (n[i] = e[i]);
      return n;
    }
    function wc(e) {
      xi(e);
    }
    function Tc(e) {
      console.error(e);
    }
    function Ec(e) {
      xi(e);
    }
    function Dc(e, t) {
      try {
        var n = e.onUncaughtError;
        n(t.value, { componentStack: t.stack });
      } catch (e) {
        setTimeout(function () {
          throw e;
        });
      }
    }
    function Oc(e, t, n) {
      try {
        var r = e.onCaughtError;
        r(n.value, {
          componentStack: n.stack,
          errorBoundary: t.tag === 1 ? t.stateNode : null,
        });
      } catch (e) {
        setTimeout(function () {
          throw e;
        });
      }
    }
    function kc(e, t, n) {
      return (
        (n = _o(n)),
        (n.tag = 3),
        (n.payload = { element: null }),
        (n.callback = function () {
          Dc(e, t);
        }),
        n
      );
    }
    function Ac(e) {
      return ((e = _o(e)), (e.tag = 3), e);
    }
    function jc(e, t, n, r) {
      var i = n.type.getDerivedStateFromError;
      if (typeof i == `function`) {
        var a = r.value;
        ((e.payload = function () {
          return i(a);
        }),
          (e.callback = function () {
            Oc(t, n, r);
          }));
      }
      var o = n.stateNode;
      o !== null &&
        typeof o.componentDidCatch == `function` &&
        (e.callback = function () {
          (Oc(t, n, r),
            typeof i != `function` &&
              (vd === null ? (vd = new Set([this])) : vd.add(this)));
          var e = r.stack;
          this.componentDidCatch(r.value, {
            componentStack: e === null ? `` : e,
          });
        });
    }
    function Mc(e, t, n, r, a) {
      if (
        ((n.flags |= 32768),
        typeof r == `object` && r && typeof r.then == `function`)
      ) {
        if (
          ((t = n.alternate),
          t !== null && Sa(t, n, a, !0),
          (n = jo.current),
          n !== null)
        ) {
          switch (n.tag) {
            case 31:
            case 13:
            case 19:
              return (
                Mo === null
                  ? Kd()
                  : n.alternate === null && ad === 0 && (ad = 3),
                (n.flags &= -257),
                (n.flags |= 65536),
                (n.lanes = a),
                r === Qa
                  ? (n.flags |= 16384)
                  : ((t = n.updateQueue),
                    t === null ? (n.updateQueue = new Set([r])) : t.add(r),
                    mf(e, r, a)),
                !1
              );
            case 22:
              return (
                (n.flags |= 65536),
                r === Qa
                  ? (n.flags |= 16384)
                  : ((t = n.updateQueue),
                    t === null
                      ? ((t = {
                          transitions: null,
                          markerInstances: null,
                          retryQueue: new Set([r]),
                        }),
                        (n.updateQueue = t))
                      : ((n = t.retryQueue),
                        n === null ? (t.retryQueue = new Set([r])) : n.add(r)),
                    mf(e, r, a)),
                !1
              );
          }
          throw Error(i(435, n.tag));
        }
        return (mf(e, r, a), Kd(), !1);
      }
      if (B)
        return (
          (t = jo.current),
          t === null
            ? (r !== sa && ((t = Error(i(423), { cause: r })), ma(Ui(t, n))),
              (e = e.current.alternate),
              (e.flags |= 65536),
              (a &= -a),
              (e.lanes |= a),
              (r = Ui(r, n)),
              (a = kc(e.stateNode, r, a)),
              bo(e, a),
              ad !== 4 && (ad = 2))
            : (!(t.flags & 65536) && (t.flags |= 256),
              (t.flags |= 65536),
              (t.lanes = a),
              r !== sa && ((e = Error(i(422), { cause: r })), ma(Ui(e, n)))),
          !1
        );
      var o = Error(i(520), { cause: r });
      if (
        ((o = Ui(o, n)),
        dd === null ? (dd = [o]) : dd.push(o),
        ad !== 4 && (ad = 2),
        t === null)
      )
        return !0;
      ((r = Ui(r, n)), (n = t));
      do {
        switch (n.tag) {
          case 3:
            return (
              (n.flags |= 65536),
              (e = a & -a),
              (n.lanes |= e),
              (e = kc(n.stateNode, r, e)),
              bo(n, e),
              !1
            );
          case 1:
            if (
              ((t = n.type),
              (o = n.stateNode),
              !(n.flags & 128) &&
                (typeof t.getDerivedStateFromError == `function` ||
                  (o !== null &&
                    typeof o.componentDidCatch == `function` &&
                    (vd === null || !vd.has(o)))))
            )
              return (
                (n.flags |= 65536),
                (a &= -a),
                (n.lanes |= a),
                (a = Ac(a)),
                jc(a, e, n, r),
                bo(n, a),
                !1
              );
            break;
          case 22:
            if (n.memoizedState !== null) return ((n.flags |= 65536), !1);
        }
        n = n.return;
      } while (n !== null);
      return !1;
    }
    var Nc = Error(i(461)),
      Pc = !1;
    function Fc(e, t, n, r) {
      t.child = e === null ? po(t, null, n, r) : fo(t, e.child, n, r);
    }
    function Ic(e, t, n, r, i) {
      n = n.render;
      var a = t.ref;
      if (`ref` in r) {
        var o = {};
        for (var s in r) s !== `ref` && (o[s] = r[s]);
      } else o = r;
      return (
        wa(t),
        (r = $o(e, t, n, o, a, i)),
        (s = rs()),
        e !== null && !Pc
          ? (is(e, t, i), ul(e, t, i))
          : (B && s && ta(t), (t.flags |= 1), Fc(e, t, r, i), t.child)
      );
    }
    function Lc(e, t, n, r, i) {
      if (e === null) {
        var a = n.type;
        return typeof a == `function` &&
          !Pi(a) &&
          a.defaultProps === void 0 &&
          n.compare === null
          ? ((t.tag = 15), (t.type = a), Rc(e, t, a, r, i))
          : ((e = Li(n.type, null, r, t, t.mode, i)),
            (e.ref = t.ref),
            (e.return = t),
            (t.child = e));
      }
      if (((a = e.child), !dl(e, i))) {
        var o = a.memoizedProps;
        if (
          ((n = n.compare),
          (n = n === null ? Ur : n),
          n(o, r) && e.ref === t.ref)
        )
          return ul(e, t, i);
      }
      return (
        (t.flags |= 1),
        (e = Fi(a, r)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e)
      );
    }
    function Rc(e, t, n, r, i) {
      if (e !== null) {
        var a = e.memoizedProps;
        if (Ur(a, r) && e.ref === t.ref) {
          if (((Pc = !1), (t.pendingProps = r = a), dl(e, i)))
            e.flags & 131072 && (Pc = !0);
          else return ((t.lanes = e.lanes), ul(e, t, i));
        }
      }
      return Kc(e, t, n, r, i);
    }
    function zc(e, t, n, r) {
      var i = r.children,
        a = e === null ? null : e.memoizedState;
      if (
        (e === null &&
          t.stateNode === null &&
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        r.mode === `hidden`)
      ) {
        if (t.flags & 128) {
          if (((a = a === null ? n : a.baseLanes | n), e !== null)) {
            for (r = t.child = e.child, i = 0; r !== null;)
              ((i = i | r.lanes | r.childLanes), (r = r.sibling));
            r = i & ~a;
          } else ((r = 0), (t.child = null));
          return Vc(e, t, a, n, r);
        }
        if (n & 536870912)
          ((t.memoizedState = { baseLanes: 0, cachePool: null }),
            e !== null && qa(t, a === null ? null : a.cachePool),
            a === null ? ko() : Oo(t, a),
            Fo(t));
        else
          return (
            (r = t.lanes = 536870912),
            Vc(e, t, a === null ? n : a.baseLanes | n, n, r)
          );
      } else
        a === null
          ? (e !== null && qa(t, null), ko(), Io())
          : (qa(t, a.cachePool), Oo(t, a), Io(), (t.memoizedState = null));
      return (Fc(e, t, i, n), t.child);
    }
    function Bc(e, t) {
      return (
        (e !== null && e.tag === 22) ||
          t.stateNode !== null ||
          (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null,
          }),
        t.sibling
      );
    }
    function Vc(e, t, n, r, i) {
      var a = Ka();
      return (
        (a = a === null ? null : { parent: ja._currentValue, pool: a }),
        (t.memoizedState = { baseLanes: n, cachePool: a }),
        e !== null && qa(t, null),
        ko(),
        Fo(t),
        e !== null && Sa(e, t, r, !0),
        (t.childLanes = i),
        null
      );
    }
    function Hc(e, t) {
      return (
        (t = tl({ mode: t.mode, children: t.children }, e.mode)),
        (t.ref = e.ref),
        (e.child = t),
        (t.return = e),
        t
      );
    }
    function Uc(e, t, n) {
      return (
        fo(t, e.child, null, n),
        (e = Hc(t, t.pendingProps)),
        (e.flags |= 2),
        Lo(t),
        (t.memoizedState = null),
        e
      );
    }
    function Wc(e, t, n) {
      var r = t.pendingProps,
        a = !!(t.flags & 128);
      if (((t.flags &= -129), e === null)) {
        if (B) {
          if (r.mode === `hidden`)
            return (
              (e = Hc(t, r)),
              (t.lanes = 536870912),
              (e.memoizedState = { baseLanes: 0, cachePool: null }),
              Bc(null, e)
            );
          if (
            (Po(t),
            (e = z)
              ? ((e = am(e, oa)),
                (e = e !== null && e.data === `&` ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: Xi === null ? null : { id: Zi, overflow: Qi },
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = Bi(e)),
                  (n.return = t),
                  (t.child = n),
                  (ia = t),
                  (z = null)))
              : (e = null),
            e === null)
          )
            throw ca(t);
          return ((t.lanes = 536870912), null);
        }
        return Hc(t, r);
      }
      var o = e.memoizedState;
      if (o !== null) {
        var s = o.dehydrated;
        if ((Po(t), a)) {
          if (t.flags & 256) ((t.flags &= -257), (t = Uc(e, t, n)));
          else if (t.memoizedState !== null)
            ((t.child = e.child), (t.flags |= 128), (t = null));
          else throw Error(i(558));
        } else if (
          (Pc || Sa(e, t, n, !1), (a = (n & e.childLanes) !== 0), Pc || a)
        ) {
          if (Eo.current === null) {
            if (
              ((r = q),
              r !== null && ((s = _t(r, n)), s !== 0 && s !== o.retryLane))
            )
              throw ((o.retryLane = s), Oi(e, s), Pd(r, e, s), Nc);
            Kd();
          }
          t = Uc(e, t, n);
        } else
          ((e = o.treeContext),
            (z = lm(s.nextSibling)),
            (ia = t),
            (B = !0),
            (aa = null),
            (oa = !1),
            e !== null && ra(t, e),
            (t = Hc(t, r)),
            (t.flags |= 134221824));
        return t;
      }
      return (
        (e = Fi(e.child, { mode: r.mode, children: r.children })),
        (e.ref = t.ref),
        (t.child = e),
        (e.return = t),
        e
      );
    }
    function Gc(e, t) {
      var n = t.ref;
      if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
      else {
        if (typeof n != `function` && typeof n != `object`) throw Error(i(284));
        (e === null || e.ref !== n) && (t.flags |= 4194816);
      }
    }
    function Kc(e, t, n, r, i) {
      return (
        wa(t),
        (n = $o(e, t, n, r, void 0, i)),
        (r = rs()),
        e !== null && !Pc
          ? (is(e, t, i), ul(e, t, i))
          : (B && r && ta(t), (t.flags |= 1), Fc(e, t, n, i), t.child)
      );
    }
    function qc(e, t, n, r, i, a) {
      return (
        wa(t),
        (t.updateQueue = null),
        (n = ts(t, r, n, i)),
        es(e),
        (r = rs()),
        e !== null && !Pc
          ? (is(e, t, a), ul(e, t, a))
          : (B && r && ta(t), (t.flags |= 1), Fc(e, t, n, a), t.child)
      );
    }
    function Jc(e, t, n, r, i) {
      if ((wa(t), t.stateNode === null)) {
        var a = ji,
          o = n.contextType;
        (typeof o == `object` && o && (a = Ta(o)),
          (a = new n(r, a)),
          (t.memoizedState =
            a.state !== null && a.state !== void 0 ? a.state : null),
          (a.updater = bc),
          (t.stateNode = a),
          (a._reactInternals = t),
          (a = t.stateNode),
          (a.props = r),
          (a.state = t.memoizedState),
          (a.refs = {}),
          ho(t),
          (o = n.contextType),
          (a.context = typeof o == `object` && o ? Ta(o) : ji),
          (a.state = t.memoizedState),
          (o = n.getDerivedStateFromProps),
          typeof o == `function` &&
            (yc(t, n, o, r), (a.state = t.memoizedState)),
          typeof n.getDerivedStateFromProps == `function` ||
            typeof a.getSnapshotBeforeUpdate == `function` ||
            (typeof a.UNSAFE_componentWillMount != `function` &&
              typeof a.componentWillMount != `function`) ||
            ((o = a.state),
            typeof a.componentWillMount == `function` && a.componentWillMount(),
            typeof a.UNSAFE_componentWillMount == `function` &&
              a.UNSAFE_componentWillMount(),
            o !== a.state && bc.enqueueReplaceState(a, a.state, null),
            Co(t, r, a, i),
            So(),
            (a.state = t.memoizedState)),
          typeof a.componentDidMount == `function` && (t.flags |= 4194308),
          (r = !0));
      } else if (e === null) {
        a = t.stateNode;
        var s = t.memoizedProps,
          c = Cc(n, s);
        a.props = c;
        var l = a.context,
          u = n.contextType;
        ((o = ji), typeof u == `object` && u && (o = Ta(u)));
        var d = n.getDerivedStateFromProps;
        ((u =
          typeof d == `function` ||
          typeof a.getSnapshotBeforeUpdate == `function`),
          (s = t.pendingProps !== s),
          u ||
            (typeof a.UNSAFE_componentWillReceiveProps != `function` &&
              typeof a.componentWillReceiveProps != `function`) ||
            ((s || l !== o) && Sc(t, a, r, o)),
          (mo = !1));
        var f = t.memoizedState;
        ((a.state = f),
          Co(t, r, a, i),
          So(),
          (l = t.memoizedState),
          s || f !== l || mo
            ? (typeof d == `function` &&
                (yc(t, n, d, r), (l = t.memoizedState)),
              (c = mo || xc(t, n, c, r, f, l, o))
                ? (u ||
                    (typeof a.UNSAFE_componentWillMount != `function` &&
                      typeof a.componentWillMount != `function`) ||
                    (typeof a.componentWillMount == `function` &&
                      a.componentWillMount(),
                    typeof a.UNSAFE_componentWillMount == `function` &&
                      a.UNSAFE_componentWillMount()),
                  typeof a.componentDidMount == `function` &&
                    (t.flags |= 4194308))
                : (typeof a.componentDidMount == `function` &&
                    (t.flags |= 4194308),
                  (t.memoizedProps = r),
                  (t.memoizedState = l)),
              (a.props = r),
              (a.state = l),
              (a.context = o),
              (r = c))
            : (typeof a.componentDidMount == `function` && (t.flags |= 4194308),
              (r = !1)));
      } else {
        ((a = t.stateNode),
          go(e, t),
          (o = t.memoizedProps),
          (u = Cc(n, o)),
          (a.props = u),
          (d = t.pendingProps),
          (f = a.context),
          (l = n.contextType),
          (c = ji),
          typeof l == `object` && l && (c = Ta(l)),
          (s = n.getDerivedStateFromProps),
          (l =
            typeof s == `function` ||
            typeof a.getSnapshotBeforeUpdate == `function`) ||
            (typeof a.UNSAFE_componentWillReceiveProps != `function` &&
              typeof a.componentWillReceiveProps != `function`) ||
            ((o !== d || f !== c) && Sc(t, a, r, c)),
          (mo = !1),
          (f = t.memoizedState),
          (a.state = f),
          Co(t, r, a, i),
          So());
        var p = t.memoizedState;
        o !== d ||
        f !== p ||
        mo ||
        (e !== null && e.dependencies !== null && Ca(e.dependencies))
          ? (typeof s == `function` && (yc(t, n, s, r), (p = t.memoizedState)),
            (u =
              mo ||
              xc(t, n, u, r, f, p, c) ||
              (e !== null && e.dependencies !== null && Ca(e.dependencies)))
              ? (l ||
                  (typeof a.UNSAFE_componentWillUpdate != `function` &&
                    typeof a.componentWillUpdate != `function`) ||
                  (typeof a.componentWillUpdate == `function` &&
                    a.componentWillUpdate(r, p, c),
                  typeof a.UNSAFE_componentWillUpdate == `function` &&
                    a.UNSAFE_componentWillUpdate(r, p, c)),
                typeof a.componentDidUpdate == `function` && (t.flags |= 4),
                typeof a.getSnapshotBeforeUpdate == `function` &&
                  (t.flags |= 1024))
              : (typeof a.componentDidUpdate != `function` ||
                  (o === e.memoizedProps && f === e.memoizedState) ||
                  (t.flags |= 4),
                typeof a.getSnapshotBeforeUpdate != `function` ||
                  (o === e.memoizedProps && f === e.memoizedState) ||
                  (t.flags |= 1024),
                (t.memoizedProps = r),
                (t.memoizedState = p)),
            (a.props = r),
            (a.state = p),
            (a.context = c),
            (r = u))
          : (typeof a.componentDidUpdate != `function` ||
              (o === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 4),
            typeof a.getSnapshotBeforeUpdate != `function` ||
              (o === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 1024),
            (r = !1));
      }
      return (
        (a = r),
        Gc(e, t),
        (r = !!(t.flags & 128)),
        a || r
          ? ((a = t.stateNode),
            (n =
              r && typeof n.getDerivedStateFromError != `function`
                ? null
                : a.render()),
            (t.flags |= 1),
            e !== null && r
              ? ((t.child = fo(t, e.child, null, i)),
                (t.child = fo(t, null, n, i)))
              : Fc(e, t, n, i),
            (t.memoizedState = a.state),
            (e = t.child))
          : (e = ul(e, t, i)),
        e
      );
    }
    function Yc(e, t, n, r) {
      return (fa(), (t.flags |= 256), Fc(e, t, n, r), t.child);
    }
    var Xc = {
      dehydrated: null,
      treeContext: null,
      retryLane: 0,
      hydrationErrors: null,
    };
    function Zc(e) {
      return { baseLanes: e, cachePool: Ja() };
    }
    function Qc(e, t, n) {
      return ((e = e === null ? 0 : e.childLanes & ~n), t && (e |= ld), e);
    }
    function $c(e, t, n) {
      var r = t.pendingProps,
        i = !1,
        a = !!(t.flags & 128),
        o;
      if (
        ((o = a) ||
          (o =
            e !== null && e.memoizedState === null ? !1 : !!(Ro.current & 2)),
        o && ((i = !0), (t.flags &= -129)),
        (o = !!(t.flags & 32)),
        (t.flags &= -33),
        e === null)
      ) {
        if (B) {
          if (
            (i ? No(t) : Io(),
            (e = z)
              ? ((e = am(e, oa)),
                (e = e !== null && e.data !== `&` ? e : null),
                e !== null &&
                  ((t.memoizedState = {
                    dehydrated: e,
                    treeContext: Xi === null ? null : { id: Zi, overflow: Qi },
                    retryLane: 536870912,
                    hydrationErrors: null,
                  }),
                  (n = Bi(e)),
                  (n.return = t),
                  (t.child = n),
                  (ia = t),
                  (z = null)))
              : (e = null),
            e === null)
          )
            throw ca(t);
          return ((t.lanes = sm(e) ? 32 : 536870912), null);
        }
        return (
          (a = r.children),
          (r = r.fallback),
          i
            ? (Io(),
              (i = t.mode),
              (a = tl({ mode: `hidden`, children: a }, i)),
              (r = Ri(r, i, n, null)),
              (a.return = t),
              (r.return = t),
              (a.sibling = r),
              (t.child = a),
              (r = t.child),
              (r.memoizedState = Zc(n)),
              (r.childLanes = Qc(e, o, n)),
              (t.memoizedState = Xc),
              Bc(null, r))
            : (No(t), el(t, a))
        );
      }
      var s = e.memoizedState;
      if (s !== null) {
        var c = s.dehydrated;
        if (c !== null) return rl(e, t, a, o, r, c, s, n);
      }
      return i
        ? (Io(),
          (i = r.fallback),
          (a = t.mode),
          (s = e.child),
          (c = s.sibling),
          (r = Fi(s, { mode: `hidden`, children: r.children })),
          (r.subtreeFlags = s.subtreeFlags & 1206910976),
          c === null
            ? ((i = Ri(i, a, n, null)), (i.flags |= 2))
            : (i = Fi(c, i)),
          (i.return = t),
          (r.return = t),
          (r.sibling = i),
          (t.child = r),
          Bc(null, r),
          (r = t.child),
          (i = e.child.memoizedState),
          i === null
            ? (i = Zc(n))
            : ((a = i.cachePool),
              a === null
                ? (a = Ja())
                : ((s = ja._currentValue),
                  (a = a.parent === s ? a : { parent: s, pool: s })),
              (i = { baseLanes: i.baseLanes | n, cachePool: a })),
          (r.memoizedState = i),
          (r.childLanes = Qc(e, o, n)),
          (t.memoizedState = Xc),
          Bc(e.child, r))
        : (No(t),
          (n = e.child),
          (e = n.sibling),
          (n = Fi(n, { mode: `visible`, children: r.children })),
          (n.return = t),
          (n.sibling = null),
          e !== null &&
            ((o = t.deletions),
            o === null ? ((t.deletions = [e]), (t.flags |= 16)) : o.push(e)),
          (t.child = n),
          (t.memoizedState = null),
          n);
    }
    function el(e, t) {
      return (
        (t = tl({ mode: `visible`, children: t }, e.mode)),
        (t.return = e),
        (e.child = t)
      );
    }
    function tl(e, t) {
      return ((e = Ni(22, e, null, t)), (e.lanes = 0), e);
    }
    function nl(e, t, n) {
      return (
        fo(t, e.child, null, n),
        (e = el(t, t.pendingProps.children)),
        (e.flags |= 2),
        (t.memoizedState = null),
        e
      );
    }
    function rl(e, t, n, r, a, o, s, c) {
      if (n)
        return t.flags & 256
          ? (No(t), (t.flags &= -257), nl(e, t, c))
          : t.memoizedState === null
            ? (Io(),
              (o = a.fallback),
              (s = t.mode),
              (a = tl({ mode: `visible`, children: a.children }, s)),
              (o = Ri(o, s, c, null)),
              (o.flags |= 2),
              (a.return = t),
              (o.return = t),
              (a.sibling = o),
              (t.child = a),
              fo(t, e.child, null, c),
              (a = t.child),
              (a.memoizedState = Zc(c)),
              (a.childLanes = Qc(e, r, c)),
              (t.memoizedState = Xc),
              Bc(null, a))
            : (Io(), (t.child = e.child), (t.flags |= 128), null);
      if ((No(t), sm(o))) {
        if (((r = o.nextSibling && o.nextSibling.dataset), r)) var l = r.dgst;
        return (
          (r = l),
          r !== `` &&
            ((a = Error(i(419))),
            (a.stack = ``),
            (a.digest = r),
            ma({ value: a, source: null, stack: null })),
          nl(e, t, c)
        );
      }
      if ((Pc || Sa(e, t, c, !1), (r = (c & e.childLanes) !== 0), Pc || r)) {
        if (Eo.current !== null) return nl(e, t, c);
        if (
          ((r = q),
          r !== null && ((a = _t(r, c)), a !== 0 && a !== s.retryLane))
        )
          throw ((s.retryLane = a), Oi(e, a), Pd(r, e, a), Nc);
        return (om(o) || Kd(), nl(e, t, c));
      }
      return om(o)
        ? ((t.flags |= 192), (t.child = e.child), null)
        : ((e = s.treeContext),
          (z = lm(o.nextSibling)),
          (ia = t),
          (B = !0),
          (aa = null),
          (oa = !1),
          e !== null && ra(t, e),
          (t = el(t, a.children)),
          (t.flags |= 134221824),
          t);
    }
    function il(e, t, n) {
      e.lanes |= t;
      var r = e.alternate;
      (r !== null && (r.lanes |= t), ba(e.return, t, n));
    }
    function al(e) {
      for (var t = null; e !== null;) {
        var n = e.alternate;
        (n !== null && Vo(n) === null && (t = e), (e = e.sibling));
      }
      return t;
    }
    function ol(e, t, n, r, i, a) {
      var o = e.memoizedState;
      o === null
        ? (e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: r,
            tail: n,
            tailMode: i,
            treeForkCount: a,
          })
        : ((o.isBackwards = t),
          (o.rendering = null),
          (o.renderingStartTime = 0),
          (o.last = r),
          (o.tail = n),
          (o.tailMode = i),
          (o.treeForkCount = a));
    }
    function sl(e) {
      var t = e.child;
      for (e.child = null; t !== null;) {
        var n = t.sibling;
        ((t.sibling = e.child), (e.child = t), (t = n));
      }
    }
    function cl(e, t, n) {
      var r = t.pendingProps,
        i = r.revealOrder,
        a = r.tail;
      r = r.children;
      var o = Ro.current;
      if (t.flags & 128) return (zo(t, o), null);
      var s = !!(o & 2);
      if (
        (s ? ((o = (o & 1) | 2), (t.flags |= 128)) : (o &= 1),
        zo(t, o),
        i === `backwards` && e !== null
          ? (sl(e), Fc(e, t, r, n), sl(e))
          : Fc(e, t, r, n),
        (r = B ? qi : 0),
        !s && e !== null && e.flags & 128)
      )
        a: for (e = t.child; e !== null;) {
          if (e.tag === 13) e.memoizedState !== null && il(e, n, t);
          else if (e.tag === 19) il(e, n, t);
          else if (e.child !== null) {
            ((e.child.return = e), (e = e.child));
            continue;
          }
          if (e === t) break a;
          for (; e.sibling === null;) {
            if (e.return === null || e.return === t) break a;
            e = e.return;
          }
          ((e.sibling.return = e.return), (e = e.sibling));
        }
      switch (i) {
        case `backwards`:
          ((n = al(t.child)),
            n === null
              ? ((i = t.child), (t.child = null))
              : ((i = n.sibling), (n.sibling = null), sl(t)),
            ol(t, !0, i, null, a, r));
          break;
        case `unstable_legacy-backwards`:
          for (n = null, i = t.child, t.child = null; i !== null;) {
            if (((e = i.alternate), e !== null && Vo(e) === null)) {
              t.child = i;
              break;
            }
            ((e = i.sibling), (i.sibling = n), (n = i), (i = e));
          }
          ol(t, !0, n, null, a, r);
          break;
        case `together`:
          ol(t, !1, null, null, void 0, r);
          break;
        case `independent`:
          t.memoizedState = null;
          break;
        default:
          ((n = al(t.child)),
            n === null
              ? ((i = t.child), (t.child = null))
              : ((i = n.sibling), (n.sibling = null)),
            ol(t, !1, i, n, a, r));
      }
      return t.child;
    }
    function ll(e, t, n) {
      var r = t.pendingProps;
      return (va(t, t.type, r.value), Fc(e, t, r.children, n), t.child);
    }
    function ul(e, t, n) {
      if (
        (e !== null && (t.dependencies = e.dependencies),
        (od |= t.lanes),
        (n & t.childLanes) === 0)
      ) {
        if (e !== null) {
          if ((Sa(e, t, n, !1), (n & t.childLanes) === 0)) return null;
        } else return null;
      }
      if (e !== null && t.child !== e.child) throw Error(i(153));
      if (t.child !== null) {
        for (
          e = t.child, n = Fi(e, e.pendingProps), t.child = n, n.return = t;
          e.sibling !== null;
        )
          ((e = e.sibling),
            (n = n.sibling = Fi(e, e.pendingProps)),
            (n.return = t));
        n.sibling = null;
      }
      return t.child;
    }
    function dl(e, t) {
      return (
        (e.lanes & t) !== 0 || ((e = e.dependencies), !!(e !== null && Ca(e)))
      );
    }
    function fl(e, t, n) {
      switch (t.tag) {
        case 3:
          (Oe(t, t.stateNode.containerInfo),
            va(t, ja, e.memoizedState.cache),
            fa());
          break;
        case 27:
        case 5:
          ke(t);
          break;
        case 4:
          Oe(t, t.stateNode.containerInfo);
          break;
        case 10:
          va(t, t.type, t.memoizedProps.value);
          break;
        case 31:
          if (t.memoizedState !== null) return ((t.flags |= 128), Po(t), null);
          break;
        case 13:
          var r = t.memoizedState;
          if (r !== null) {
            if (r.dehydrated !== null) return (No(t), (t.flags |= 128), null);
            r = Sa(e, t, n, !1);
            var i = t.child.childLanes;
            return r || (n & i) !== 0
              ? $c(e, t, n)
              : (No(t), (e = ul(e, t, n)), e === null ? null : e.sibling);
          }
          No(t);
          break;
        case 19:
          if (t.flags & 128) return cl(e, t, n);
          if (
            ((i = !!(e.flags & 128)),
            (r = (n & t.childLanes) !== 0),
            (r ||= (Sa(e, t, n, !1), (n & t.childLanes) !== 0)),
            i)
          ) {
            if (r) return cl(e, t, n);
            t.flags |= 128;
          }
          if (
            ((i = t.memoizedState),
            i !== null &&
              ((i.rendering = null), (i.tail = null), (i.lastEffect = null)),
            zo(t, Ro.current),
            r)
          )
            break;
          return null;
        case 22:
          return ((t.lanes = 0), zc(e, t, n, t.pendingProps));
        case 24:
          va(t, ja, e.memoizedState.cache);
      }
      return ul(e, t, n);
    }
    function pl(e, t, n) {
      if (e !== null) {
        if (e.memoizedProps !== t.pendingProps) Pc = !0;
        else {
          if (!dl(e, n) && !(t.flags & 128)) return ((Pc = !1), fl(e, t, n));
          Pc = !!(e.flags & 131072);
        }
      } else ((Pc = !1), B && t.flags & 1048576 && ea(t, qi, t.index));
      switch (((t.lanes = 0), t.tag)) {
        case 16:
          a: {
            var r = t.pendingProps;
            if (((e = to(t.elementType)), (t.type = e), typeof e == `function`))
              Pi(e)
                ? ((r = Cc(e, r)), (t.tag = 1), (t = Jc(null, t, e, r, n)))
                : ((t.tag = 0), (t = Kc(null, t, e, r, n)));
            else {
              if (e != null) {
                var a = e.$$typeof;
                if (a === ae) {
                  ((t.tag = 11), (t = Ic(null, t, e, r, n)));
                  break a;
                }
                if (a === ce) {
                  ((t.tag = 14), (t = Lc(null, t, e, r, n)));
                  break a;
                }
                if (a === A) {
                  ((t.tag = 10), (t.type = e), (t = ll(null, t, n)));
                  break a;
                }
              }
              throw ((t = ve(e) || e), Error(i(306, t, ``)));
            }
          }
          return t;
        case 0:
          return Kc(e, t, t.type, t.pendingProps, n);
        case 1:
          return ((r = t.type), (a = Cc(r, t.pendingProps)), Jc(e, t, r, a, n));
        case 3:
          a: {
            if ((Oe(t, t.stateNode.containerInfo), e === null))
              throw Error(i(387));
            r = t.pendingProps;
            var o = t.memoizedState;
            ((a = o.element), go(e, t), Co(t, r, null, n));
            var s = t.memoizedState;
            if (
              ((r = s.cache),
              va(t, ja, r),
              r !== o.cache && xa(t, [ja], n, !0),
              So(),
              (r = s.element),
              o.isDehydrated)
            ) {
              if (
                ((o = { element: r, isDehydrated: !1, cache: s.cache }),
                (t.updateQueue.baseState = o),
                (t.memoizedState = o),
                t.flags & 256)
              ) {
                t = Yc(e, t, r, n);
                break a;
              }
              if (r !== a) {
                ((a = Ui(Error(i(424)), t)), ma(a), (t = Yc(e, t, r, n)));
                break a;
              }
              switch (((e = t.stateNode.containerInfo), e.nodeType)) {
                case 9:
                  e = e.body;
                  break;
                default:
                  e = e.nodeName === `HTML` ? e.ownerDocument.body : e;
              }
              for (
                z = lm(e.firstChild),
                  ia = t,
                  B = !0,
                  aa = null,
                  oa = !0,
                  n = po(t, null, r, n),
                  t.child = n;
                n;
              )
                ((n.flags = (n.flags & -3) | 134221824), (n = n.sibling));
            } else {
              if ((fa(), r === a)) {
                t = ul(e, t, n);
                break a;
              }
              Fc(e, t, r, n);
            }
            t = t.child;
          }
          return t;
        case 26:
          return (
            Gc(e, t),
            e === null
              ? (n = Nm(t.type, null, t.pendingProps, null))
                ? (t.memoizedState = n)
                : B || (t.stateNode = fp(t.type, t.pendingProps, P.current, t))
              : (t.memoizedState = Nm(
                  t.type,
                  e.memoizedProps,
                  t.pendingProps,
                  e.memoizedState,
                )),
            null
          );
        case 27:
          return (
            ke(t),
            e === null &&
              B &&
              ((r = t.stateNode = hm(t.type, t.pendingProps, P.current)),
              (ia = t),
              (oa = !0),
              (a = z),
              Sp(t.type) ? ((um = a), (z = lm(r.firstChild))) : (z = a)),
            Fc(e, t, t.pendingProps.children, n),
            Gc(e, t),
            e === null && (t.flags |= 4194304),
            t.child
          );
        case 5:
          return (
            e === null &&
              B &&
              ((a = r = z) &&
                ((r = rm(r, t.type, t.pendingProps, oa)),
                r === null
                  ? (a = !1)
                  : ((t.stateNode = r),
                    (ia = t),
                    (z = lm(r.firstChild)),
                    (oa = !1),
                    (a = !0))),
              a || ca(t)),
            ke(t),
            (a = t.type),
            (o = t.pendingProps),
            (s = e === null ? null : e.memoizedProps),
            (r = o.children),
            pp(a, o) ? (r = null) : s !== null && pp(a, s) && (t.flags |= 32),
            t.memoizedState !== null &&
              ((a = $o(e, t, ns, null, null, n)), (sh._currentValue = a)),
            Gc(e, t),
            Fc(e, t, r, n),
            t.child
          );
        case 6:
          return (
            e === null &&
              B &&
              ((e = n = z) &&
                ((n = im(n, t.pendingProps, oa)),
                n === null
                  ? (e = !1)
                  : ((t.stateNode = n), (ia = t), (z = null), (e = !0))),
              e || ca(t)),
            null
          );
        case 13:
          return $c(e, t, n);
        case 4:
          return (
            Oe(t, t.stateNode.containerInfo),
            (r = t.pendingProps),
            e === null ? (t.child = fo(t, null, r, n)) : Fc(e, t, r, n),
            t.child
          );
        case 11:
          return Ic(e, t, t.type, t.pendingProps, n);
        case 7:
          return ((r = t.pendingProps), Gc(e, t), Fc(e, t, r, n), t.child);
        case 8:
          return (Fc(e, t, t.pendingProps.children, n), t.child);
        case 12:
          return (Fc(e, t, t.pendingProps.children, n), t.child);
        case 10:
          return ll(e, t, n);
        case 9:
          return (
            (a = t.type._context),
            (r = t.pendingProps.children),
            wa(t),
            (a = Ta(a)),
            (r = r(a)),
            (t.flags |= 1),
            Fc(e, t, r, n),
            t.child
          );
        case 14:
          return Lc(e, t, t.type, t.pendingProps, n);
        case 15:
          return Rc(e, t, t.type, t.pendingProps, n);
        case 19:
          return cl(e, t, n);
        case 31:
          return Wc(e, t, n);
        case 22:
          return zc(e, t, n, t.pendingProps);
        case 24:
          return (
            wa(t),
            (r = Ta(ja)),
            e === null
              ? ((a = Ka()),
                a === null &&
                  ((a = q),
                  (o = Ma()),
                  (a.pooledCache = o),
                  o.refCount++,
                  o !== null && (a.pooledCacheLanes |= n),
                  (a = o)),
                (t.memoizedState = { parent: r, cache: a }),
                ho(t),
                va(t, ja, a))
              : ((e.lanes & n) !== 0 && (go(e, t), Co(t, null, null, n), So()),
                (a = e.memoizedState),
                (o = t.memoizedState),
                a.parent === r
                  ? ((r = o.cache),
                    va(t, ja, r),
                    r !== a.cache && xa(t, [ja], n, !0))
                  : ((a = { parent: r, cache: r }),
                    (t.memoizedState = a),
                    t.lanes === 0 &&
                      (t.memoizedState = t.updateQueue.baseState = a),
                    va(t, ja, r))),
            Fc(e, t, t.pendingProps.children, n),
            t.child
          );
        case 30:
          return (
            t.stateNode === null &&
              (t.stateNode = {
                autoName: null,
                paired: null,
                clones: null,
                ref: null,
              }),
            (r = t.pendingProps),
            r.name != null && r.name !== `auto`
              ? (t.flags |= e === null ? 18882560 : 18874368)
              : B && ta(t),
            e !== null && e.memoizedProps.name !== r.name
              ? (t.flags |= 4194816)
              : Gc(e, t),
            Fc(e, t, r.children, n),
            t.child
          );
        case 29:
          throw t.pendingProps;
      }
      throw Error(i(156, t.tag));
    }
    function ml(e) {
      e.flags |= 4;
    }
    function hl(e, t, n, r, i) {
      var a;
      if (
        ((a = !!(e.mode & 32)) &&
          (a =
            n === null
              ? Jm(t, r)
              : Jm(t, r) && (r.src !== n.src || r.srcSet !== n.srcSet)),
        a)
      ) {
        if (((e.flags |= 16777216), (i & 335544128) === i)) {
          if (e.stateNode.complete) e.flags |= 8192;
          else if (Ud()) e.flags |= 8192;
          else throw ((no = Qa), Xa);
        }
      } else e.flags &= -16777217;
    }
    function gl(e, t) {
      if (t.type !== `stylesheet` || t.state.loading & 4) e.flags &= -16777217;
      else if (((e.flags |= 16777216), !Ym(t))) {
        if (Ud()) e.flags |= 8192;
        else throw ((no = Qa), Xa);
      }
    }
    function _l(e, t) {
      (t !== null && (e.flags |= 4),
        e.flags & 16384 &&
          ((t = e.tag === 22 ? 536870912 : dt()), (e.lanes |= t), (ud |= t)));
    }
    function vl(e, t) {
      if (!B)
        switch (e.tailMode) {
          case `visible`:
            break;
          case `collapsed`:
            for (var n = e.tail, r = null; n !== null;)
              (n.alternate !== null && (r = n), (n = n.sibling));
            r === null
              ? t || e.tail === null
                ? (e.tail = null)
                : (e.tail.sibling = null)
              : (r.sibling = null);
            break;
          default:
            for (t = e.tail, n = null; t !== null;)
              (t.alternate !== null && (n = t), (t = t.sibling));
            n === null ? (e.tail = null) : (n.sibling = null);
        }
    }
    function U(e) {
      var t = e.alternate !== null && e.alternate.child === e.child,
        n = 0,
        r = 0;
      if (t)
        for (var i = e.child; i !== null;)
          ((n |= i.lanes | i.childLanes),
            (r |= i.subtreeFlags & 1206910976),
            (r |= i.flags & 1206910976),
            (i.return = e),
            (i = i.sibling));
      else
        for (i = e.child; i !== null;)
          ((n |= i.lanes | i.childLanes),
            (r |= i.subtreeFlags),
            (r |= i.flags),
            (i.return = e),
            (i = i.sibling));
      return ((e.subtreeFlags |= r), (e.childLanes = n), t);
    }
    function yl(e, t, n) {
      var r = t.pendingProps;
      switch ((na(t), t.tag)) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
          return (U(t), null);
        case 1:
          return (U(t), null);
        case 3:
          return (
            (n = t.stateNode),
            (r = null),
            e !== null && (r = e.memoizedState.cache),
            t.memoizedState.cache !== r && (t.flags |= 2048),
            ya(ja),
            F(),
            n.pendingContext &&
              ((n.context = n.pendingContext), (n.pendingContext = null)),
            (e === null || e.child === null) &&
              (da(t)
                ? ml(t)
                : e === null ||
                  (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
                  ((t.flags |= 1024), pa())),
            U(t),
            null
          );
        case 26:
          var a = t.type,
            o = t.memoizedState;
          return (
            e === null
              ? (ml(t),
                o === null ? (U(t), hl(t, a, null, r, n)) : (U(t), gl(t, o)))
              : o
                ? o === e.memoizedState
                  ? (U(t), (t.flags &= -16777217))
                  : (ml(t), U(t), gl(t, o))
                : ((e = e.memoizedProps),
                  e !== r && ml(t),
                  U(t),
                  hl(t, a, e, r, n)),
            null
          );
        case 27:
          if (
            (Ae(t),
            (n = P.current),
            (a = t.type),
            e !== null && t.stateNode != null)
          )
            e.memoizedProps !== r && ml(t);
          else {
            if (!r) {
              if (t.stateNode === null) throw Error(i(166));
              return (U(t), (t.subtreeFlags &= -33554433), null);
            }
            ((e = Te.current),
              da(t) ? la(t, e) : ((e = hm(a, r, n)), (t.stateNode = e), ml(t)));
          }
          return (U(t), (t.subtreeFlags &= -33554433), null);
        case 5:
          if ((Ae(t), (a = t.type), e !== null && t.stateNode != null))
            e.memoizedProps !== r && ml(t);
          else {
            if (!r) {
              if (t.stateNode === null) throw Error(i(166));
              return (U(t), (t.subtreeFlags &= -33554433), null);
            }
            if (((o = Te.current), da(t))) la(t, o);
            else {
              var s = lp(P.current);
              switch (o) {
                case 1:
                  o = s.createElementNS(`http://www.w3.org/2000/svg`, a);
                  break;
                case 2:
                  o = s.createElementNS(
                    `http://www.w3.org/1998/Math/MathML`,
                    a,
                  );
                  break;
                default:
                  switch (a) {
                    case `svg`:
                      o = s.createElementNS(`http://www.w3.org/2000/svg`, a);
                      break;
                    case `math`:
                      o = s.createElementNS(
                        `http://www.w3.org/1998/Math/MathML`,
                        a,
                      );
                      break;
                    case `script`:
                      ((o = s.createElement(`div`)),
                        (o.innerHTML = `<script><\/script>`),
                        (o = o.removeChild(o.firstChild)));
                      break;
                    case `select`:
                      ((o =
                        typeof r.is == `string`
                          ? s.createElement(`select`, { is: r.is })
                          : s.createElement(`select`)),
                        r.multiple
                          ? (o.multiple = !0)
                          : r.size && (o.size = r.size));
                      break;
                    default:
                      o =
                        typeof r.is == `string`
                          ? s.createElement(a, { is: r.is })
                          : s.createElement(a);
                  }
              }
              ((o[Ct] = t), (o[wt] = r));
              a: for (s = t.child; s !== null;) {
                if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
                else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
                  ((s.child.return = s), (s = s.child));
                  continue;
                }
                if (s === t) break a;
                for (; s.sibling === null;) {
                  if (s.return === null || s.return === t) break a;
                  s = s.return;
                }
                ((s.sibling.return = s.return), (s = s.sibling));
              }
              t.stateNode = o;
              a: switch ((np(o, a, r), a)) {
                case `button`:
                case `input`:
                case `select`:
                case `textarea`:
                  r = !!r.autoFocus;
                  break a;
                case `img`:
                  r = !0;
                  break a;
                default:
                  r = !1;
              }
              r && ml(t);
            }
          }
          return (
            U(t),
            (t.subtreeFlags &= -33554433),
            hl(
              t,
              t.type,
              e === null ? null : e.memoizedProps,
              t.pendingProps,
              n,
            ),
            null
          );
        case 6:
          if (e && t.stateNode != null) e.memoizedProps !== r && ml(t);
          else {
            if (typeof r != `string` && t.stateNode === null)
              throw Error(i(166));
            if (((e = P.current), da(t))) {
              if (
                ((e = t.stateNode),
                (n = t.memoizedProps),
                (r = null),
                (a = ia),
                a !== null)
              )
                switch (a.tag) {
                  case 27:
                  case 5:
                    r = a.memoizedProps;
                }
              ((e[Ct] = t),
                (e = !!(
                  e.nodeValue === n ||
                  (r !== null && !0 === r.suppressHydrationWarning) ||
                  ep(e.nodeValue, n)
                )),
                e || ca(t, !0));
            } else
              ((e = lp(e).createTextNode(r)), (e[Ct] = t), (t.stateNode = e));
          }
          return (U(t), null);
        case 31:
          if (((n = t.memoizedState), e === null || e.memoizedState !== null)) {
            if (((r = da(t)), n !== null)) {
              if (e === null) {
                if (!r) throw Error(i(318));
                if (
                  ((e = t.memoizedState),
                  (e = e === null ? null : e.dehydrated),
                  !e)
                )
                  throw Error(i(557));
                e[Ct] = t;
              } else
                (fa(),
                  !(t.flags & 128) && (t.memoizedState = null),
                  (t.flags |= 4));
              (U(t), (e = !1));
            } else
              ((n = pa()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = n),
                (e = !0));
            if (!e) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
            if (t.flags & 128) throw Error(i(558));
          }
          return (U(t), null);
        case 13:
          if (
            ((r = t.memoizedState),
            e === null ||
              (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
          ) {
            if (((a = da(t)), r !== null && r.dehydrated !== null)) {
              if (e === null) {
                if (!a) throw Error(i(318));
                if (
                  ((a = t.memoizedState),
                  (a = a === null ? null : a.dehydrated),
                  !a)
                )
                  throw Error(i(317));
                a[Ct] = t;
              } else
                (fa(),
                  !(t.flags & 128) && (t.memoizedState = null),
                  (t.flags |= 4));
              (U(t), (a = !1));
            } else
              ((a = pa()),
                e !== null &&
                  e.memoizedState !== null &&
                  (e.memoizedState.hydrationErrors = a),
                (a = !0));
            if (!a) return t.flags & 256 ? (Lo(t), t) : (Lo(t), null);
          }
          return (
            Lo(t),
            t.flags & 128
              ? ((t.lanes = n), t)
              : ((n = r !== null),
                (e = e !== null && e.memoizedState !== null),
                n &&
                  ((r = t.child),
                  (a = null),
                  r.alternate !== null &&
                    r.alternate.memoizedState !== null &&
                    r.alternate.memoizedState.cachePool !== null &&
                    (a = r.alternate.memoizedState.cachePool.pool),
                  (o = null),
                  r.memoizedState !== null &&
                    r.memoizedState.cachePool !== null &&
                    (o = r.memoizedState.cachePool.pool),
                  o !== a && (r.flags |= 2048)),
                n !== e && n && (t.child.flags |= 8192),
                _l(t, t.updateQueue),
                U(t),
                null)
          );
        case 4:
          return (
            F(),
            e === null && Wf(t.stateNode.containerInfo),
            (t.flags |= 67108864),
            U(t),
            null
          );
        case 10:
          return (ya(t.type), U(t), null);
        case 19:
          if ((Bo(t), (r = t.memoizedState), r === null)) return (U(t), null);
          if (((a = !!(t.flags & 128)), (o = r.rendering), o === null)) {
            if (a) vl(r, !1);
            else {
              if (ad !== 0 || (e !== null && e.flags & 128))
                for (e = t.child; e !== null;) {
                  if (((o = Vo(e)), o !== null)) {
                    for (
                      t.flags |= 128,
                        vl(r, !1),
                        e = o.updateQueue,
                        t.updateQueue = e,
                        _l(t, e),
                        t.subtreeFlags = 0,
                        e = n,
                        n = t.child;
                      n !== null;
                    )
                      (Ii(n, e), (n = n.sibling));
                    return (
                      zo(t, (Ro.current & 1) | 2),
                      B && $i(t, r.treeForkCount),
                      t.child
                    );
                  }
                  e = e.sibling;
                }
              r.tail !== null &&
                Ve() > gd &&
                ((t.flags |= 128), (a = !0), vl(r, !1), (t.lanes = 4194304));
            }
          } else {
            if (!a) {
              if (((e = Vo(o)), e !== null)) {
                if (
                  ((t.flags |= 128),
                  (a = !0),
                  (e = e.updateQueue),
                  (t.updateQueue = e),
                  _l(t, e),
                  vl(r, !0),
                  r.tail === null &&
                    r.tailMode !== `collapsed` &&
                    r.tailMode !== `visible` &&
                    !o.alternate &&
                    !B)
                )
                  return (U(t), null);
              } else
                2 * Ve() - r.renderingStartTime > gd &&
                  n !== 536870912 &&
                  ((t.flags |= 128), (a = !0), vl(r, !1), (t.lanes = 4194304));
            }
            r.isBackwards
              ? ((o.sibling = t.child), (t.child = o))
              : ((e = r.last),
                e === null ? (t.child = o) : (e.sibling = o),
                (r.last = o));
          }
          if (r.tail !== null) {
            e = r.tail;
            a: {
              for (n = e; n !== null;) {
                if (n.alternate !== null) {
                  n = !1;
                  break a;
                }
                n = n.sibling;
              }
              n = !0;
            }
            return (
              (r.rendering = e),
              (r.tail = e.sibling),
              (r.renderingStartTime = Ve()),
              (e.sibling = null),
              (o = Ro.current),
              (o = a ? (o & 1) | 2 : o & 1),
              r.tailMode === `visible` || r.tailMode === `collapsed` || !n || B
                ? zo(t, o)
                : ((n = o), N(jo, t), N(Ro, n), Mo === null && (Mo = t)),
              B && $i(t, r.treeForkCount),
              e
            );
          }
          return (U(t), null);
        case 22:
        case 23:
          return (
            Lo(t),
            Ao(),
            (r = t.memoizedState !== null),
            e === null
              ? r && (t.flags |= 8192)
              : (e.memoizedState !== null) !== r && (t.flags |= 8192),
            r
              ? n & 536870912 &&
                !(t.flags & 128) &&
                (U(t), t.subtreeFlags & 6 && (t.flags |= 8192))
              : U(t),
            (n = t.updateQueue),
            n !== null && _l(t, n.retryQueue),
            (n = null),
            e !== null &&
              e.memoizedState !== null &&
              e.memoizedState.cachePool !== null &&
              (n = e.memoizedState.cachePool.pool),
            (r = null),
            t.memoizedState !== null &&
              t.memoizedState.cachePool !== null &&
              (r = t.memoizedState.cachePool.pool),
            r !== n && (t.flags |= 2048),
            e !== null && we(Ga),
            null
          );
        case 24:
          return (
            (n = null),
            e !== null && (n = e.memoizedState.cache),
            t.memoizedState.cache !== n && (t.flags |= 2048),
            ya(ja),
            U(t),
            null
          );
        case 25:
          return null;
        case 30:
          return ((t.flags |= 33554432), U(t), null);
      }
      throw Error(i(156, t.tag));
    }
    function bl(e, t) {
      switch ((na(t), t.tag)) {
        case 1:
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 3:
          return (
            ya(ja),
            F(),
            (e = t.flags),
            e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 26:
        case 27:
        case 5:
          return (Ae(t), null);
        case 31:
          if (t.memoizedState !== null) {
            if ((Lo(t), t.alternate === null)) throw Error(i(340));
            fa();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 13:
          if (
            (Lo(t), (e = t.memoizedState), e !== null && e.dehydrated !== null)
          ) {
            if (t.alternate === null) throw Error(i(340));
            fa();
          }
          return (
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 19:
          return (
            Bo(t),
            (e = t.flags),
            e & 65536
              ? ((t.flags = (e & -65537) | 128),
                (e = t.memoizedState),
                e !== null && ((e.rendering = null), (e.tail = null)),
                (t.flags |= 4),
                t)
              : null
          );
        case 4:
          return (F(), null);
        case 10:
          return (ya(t.type), null);
        case 22:
        case 23:
          return (
            Lo(t),
            Ao(),
            e !== null && we(Ga),
            (e = t.flags),
            e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
          );
        case 24:
          return (ya(ja), null);
        case 25:
          return null;
        default:
          return null;
      }
    }
    function xl(e, t) {
      switch ((na(t), t.tag)) {
        case 3:
          (ya(ja), F());
          break;
        case 26:
        case 27:
        case 5:
          Ae(t);
          break;
        case 4:
          F();
          break;
        case 31:
          t.memoizedState !== null && Lo(t);
          break;
        case 13:
          Lo(t);
          break;
        case 19:
          Bo(t);
          break;
        case 10:
          ya(t.type);
          break;
        case 22:
        case 23:
          (Lo(t), Ao(), e !== null && we(Ga));
          break;
        case 24:
          ya(ja);
      }
    }
    function Sl(e, t) {
      try {
        var n = t.updateQueue,
          r = n === null ? null : n.lastEffect;
        if (r !== null) {
          var i = r.next;
          n = i;
          do {
            if ((n.tag & e) === e) {
              r = void 0;
              var a = n.create,
                o = n.inst;
              ((r = a()), (o.destroy = r));
            }
            n = n.next;
          } while (n !== i);
        }
      } catch (e) {
        Z(t, t.return, e);
      }
    }
    function Cl(e, t, n) {
      try {
        var r = t.updateQueue,
          i = r === null ? null : r.lastEffect;
        if (i !== null) {
          var a = i.next;
          r = a;
          do {
            if ((r.tag & e) === e) {
              var o = r.inst,
                s = o.destroy;
              if (s !== void 0) {
                ((o.destroy = void 0), (i = t));
                var c = n,
                  l = s;
                try {
                  l();
                } catch (e) {
                  Z(i, c, e);
                }
              }
            }
            r = r.next;
          } while (r !== a);
        }
      } catch (e) {
        Z(t, t.return, e);
      }
    }
    function wl(e) {
      var t = e.updateQueue;
      if (t !== null) {
        var n = e.stateNode;
        try {
          To(t, n);
        } catch (t) {
          Z(e, e.return, t);
        }
      }
    }
    function Tl(e, t, n) {
      ((n.props = Cc(e.type, e.memoizedProps)), (n.state = e.memoizedState));
      try {
        n.componentWillUnmount();
      } catch (n) {
        Z(e, t, n);
      }
    }
    function El(e, t) {
      try {
        var n = e.ref;
        if (n !== null) {
          switch (e.tag) {
            case 26:
            case 27:
            case 5:
              var r = e.stateNode;
              break;
            case 30:
              var i = e.stateNode,
                a = vi(e.memoizedProps, i);
              ((i.ref === null || i.ref.name !== a) && (i.ref = Pp(a)),
                (r = i.ref));
              break;
            case 7:
              if (e.stateNode === null) {
                var o = new Fp(e);
                (h(e.child, !1, Qp, o, void 0, void 0), (e.stateNode = o));
              }
              r = e.stateNode;
              break;
            default:
              r = e.stateNode;
          }
          typeof n == `function` ? (e.refCleanup = n(r)) : (n.current = r);
        }
      } catch (n) {
        Z(e, t, n);
      }
    }
    function Dl(e, t) {
      var n = e.ref,
        r = e.refCleanup;
      if (n !== null) {
        if (typeof r == `function`)
          try {
            r();
          } catch (n) {
            Z(e, t, n);
          } finally {
            ((e.refCleanup = null),
              (e = e.alternate),
              e != null && (e.refCleanup = null));
          }
        else if (typeof n == `function`)
          try {
            n(null);
          } catch (n) {
            Z(e, t, n);
          }
        else n.current = null;
      }
    }
    function Ol(e, t) {
      if (
        (e.tag === 5 || e.tag === 27 || e.tag === 6) &&
        e.alternate === null &&
        t !== null
      )
        for (var n = 0; n < t.length; n++) em(e.stateNode, t[n]);
    }
    function kl(e) {
      for (
        var t = e.return;
        t !== null && (Ml(t) && em(e.stateNode, t.stateNode), !jl(t));
      )
        t = t.return;
    }
    function Al(e) {
      for (
        var t = e.return;
        t !== null && (Ml(t) && tm(e.stateNode, t.stateNode), !jl(t));
      )
        t = t.return;
    }
    function jl(e) {
      return e.tag === 5 || e.tag === 3 || e.tag === 27;
    }
    function Ml(e) {
      return e && e.tag === 7 && e.stateNode !== null;
    }
    function Nl(e) {
      var t = e.type,
        n = e.memoizedProps,
        r = e.stateNode;
      try {
        a: switch (t) {
          case `button`:
          case `input`:
          case `select`:
          case `textarea`:
            n.autoFocus && r.focus();
            break a;
          case `img`:
            n.src ? (r.src = n.src) : n.srcSet && (r.srcset = n.srcSet);
        }
      } catch (t) {
        Z(e, e.return, t);
      }
    }
    function Pl(e, t, n) {
      try {
        var r = e.stateNode;
        (ip(r, e.type, n, t), (r[wt] = t));
      } catch (t) {
        Z(e, e.return, t);
      }
    }
    function Fl(e) {
      return (
        e.tag === 5 ||
        e.tag === 3 ||
        e.tag === 26 ||
        (e.tag === 27 && Sp(e.type)) ||
        e.tag === 4
      );
    }
    function Il(e) {
      a: for (;;) {
        for (; e.sibling === null;) {
          if (e.return === null || Fl(e.return)) return null;
          e = e.return;
        }
        for (
          e.sibling.return = e.return, e = e.sibling;
          e.tag !== 5 && e.tag !== 6 && e.tag !== 18;
        ) {
          if (
            (e.tag === 27 && Sp(e.type)) ||
            e.flags & 2 ||
            e.child === null ||
            e.tag === 4
          )
            continue a;
          ((e.child.return = e), (e = e.child));
        }
        if (!(e.flags & 2)) return e.stateNode;
      }
    }
    function Ll(e, t, n, r) {
      var i = e.tag;
      if (i === 5 || i === 6)
        ((i = e.stateNode),
          t
            ? (n.nodeType === 9
                ? n.body
                : n.nodeName === `HTML`
                  ? n.ownerDocument.body
                  : n
              ).insertBefore(i, t)
            : ((t =
                n.nodeType === 9
                  ? n.body
                  : n.nodeName === `HTML`
                    ? n.ownerDocument.body
                    : n),
              t.appendChild(i),
              (n = n._reactRootContainer),
              n != null || t.onclick !== null || (t.onclick = yn)),
          Ol(e, r),
          (R = !0));
      else if (
        i !== 4 &&
        (i === 27 &&
          (Ol(e, r), (r = null), Sp(e.type) && ((n = e.stateNode), (t = null))),
        (e = e.child),
        e !== null)
      )
        for (Ll(e, t, n, r), e = e.sibling; e !== null;)
          (Ll(e, t, n, r), (e = e.sibling));
    }
    function Rl(e, t, n, r) {
      var i = e.tag;
      if (i === 5 || i === 6)
        ((i = e.stateNode),
          t ? n.insertBefore(i, t) : n.appendChild(i),
          Ol(e, r),
          (R = !0));
      else if (
        i !== 4 &&
        (i === 27 && (Ol(e, r), (r = null), Sp(e.type) && (n = e.stateNode)),
        (e = e.child),
        e !== null)
      )
        for (Rl(e, t, n, r), e = e.sibling; e !== null;)
          (Rl(e, t, n, r), (e = e.sibling));
    }
    function zl(e) {
      var t = e.stateNode,
        n = e.memoizedProps;
      try {
        for (var r = e.type, i = t.attributes; i.length;)
          t.removeAttributeNode(i[0]);
        (np(t, r, n), (t[Ct] = e), (t[wt] = n));
      } catch (t) {
        Z(e, e.return, t);
      }
    }
    var Bl = !1,
      Vl = null;
    function Hl(e) {
      (e.tag === 30 || e.subtreeFlags & 33554432) && (Bl = !0);
    }
    var Ul = null;
    function Wl() {
      var e = Ul;
      return ((Ul = null), e);
    }
    var Gl = 0;
    function Kl(e, t, n, r, i) {
      return ((Gl = 0), ql(e.child, t, n, r, i));
    }
    function ql(e, t, n, r, i) {
      for (var a = !1; e !== null;) {
        if (e.tag === 5) {
          var o = e.stateNode;
          if (r !== null) {
            var s = Op(o);
            (r.push(s), s.view && (a = !0));
          } else a || (Op(o).view && (a = !0));
          ((Bl = !0), Tp(o, Gl === 0 ? t : t + `_` + Gl, n), Gl++);
        } else
          (e.tag !== 22 || e.memoizedState === null) &&
            ((e.tag === 30 && i) || (ql(e.child, t, n, r, i) && (a = !0)));
        e = e.sibling;
      }
      return a;
    }
    function Jl(e, t) {
      for (; e !== null;)
        (e.tag === 5
          ? Ep(e.stateNode, e.memoizedProps)
          : (e.tag !== 22 || e.memoizedState === null) &&
            ((e.tag === 30 && t) || Jl(e.child, t)),
          (e = e.sibling));
    }
    function Yl(e) {
      if (e.subtreeFlags & 18874368)
        for (e = e.child; e !== null;) {
          if (
            (e.tag !== 22 || e.memoizedState === null) &&
            (Yl(e), e.tag === 30 && e.flags & 18874368 && e.stateNode.paired)
          ) {
            var t = e.memoizedProps;
            if (t.name == null || t.name === `auto`) throw Error(i(544));
            var n = t.name;
            ((t = bi(t.default, t.share)),
              t !== `none` && (Kl(e, n, t, null, !1) || Jl(e.child, !1)));
          }
          e = e.sibling;
        }
    }
    function Xl(e, t) {
      if (e.tag === 30) {
        var n = e.stateNode,
          r = e.memoizedProps,
          i = vi(r, n),
          a = bi(r.default, n.paired ? r.share : r.enter);
        a === `none`
          ? Yl(e)
          : Kl(e, i, a, null, !1)
            ? (Yl(e), n.paired || t || Nd(e, r.onEnter))
            : Jl(e.child, !1);
      } else if (e.subtreeFlags & 33554432)
        for (e = e.child; e !== null;) (Xl(e, t), (e = e.sibling));
      else Yl(e);
    }
    function Zl(e) {
      if (Vl !== null && Vl.size !== 0) {
        var t = Vl;
        if (e.subtreeFlags & 18874368)
          for (e = e.child; e !== null;) {
            if (e.tag !== 22 || e.memoizedState === null) {
              if (e.tag === 30 && e.flags & 18874368) {
                var n = e.memoizedProps,
                  r = n.name;
                if (r != null && r !== `auto`) {
                  var i = t.get(r);
                  if (i !== void 0) {
                    var a = bi(n.default, n.share);
                    if (
                      (a !== `none` &&
                        (Kl(e, r, a, null, !1)
                          ? ((a = e.stateNode),
                            (i.paired = a),
                            (a.paired = i),
                            Nd(e, n.onShare))
                          : Jl(e.child, !1)),
                      t.delete(r),
                      t.size === 0)
                    )
                      break;
                  }
                }
              }
              Zl(e);
            }
            e = e.sibling;
          }
      }
    }
    function Ql(e) {
      if (e.tag === 30) {
        var t = e.memoizedProps,
          n = vi(t, e.stateNode),
          r = Vl === null ? void 0 : Vl.get(n),
          i = bi(t.default, r === void 0 ? t.exit : t.share);
        (i !== `none` &&
          (Kl(e, n, i, null, !1)
            ? r === void 0
              ? Nd(e, t.onExit)
              : ((i = e.stateNode),
                (r.paired = i),
                (i.paired = r),
                Vl.delete(n),
                Nd(e, t.onShare))
            : Jl(e.child, !1)),
          Vl !== null && Zl(e));
      } else if (e.subtreeFlags & 33554432)
        for (e = e.child; e !== null;) (Ql(e), (e = e.sibling));
      else Vl !== null && Zl(e);
    }
    function $l(e) {
      for (e = e.child; e !== null;) {
        if (e.tag === 30) {
          var t = e.memoizedProps,
            n = vi(t, e.stateNode);
          ((t = bi(t.default, t.update)),
            (e.flags &= -5),
            t !== `none` && Kl(e, n, t, (e.memoizedState = []), !1));
        } else e.subtreeFlags & 33554432 && $l(e);
        e = e.sibling;
      }
    }
    function eu(e) {
      if (e.subtreeFlags & 18874368)
        for (e = e.child; e !== null;) {
          if (e.tag !== 22 || e.memoizedState === null) {
            if (e.tag === 30 && e.flags & 18874368) {
              var t = e.stateNode;
              t.paired !== null && ((t.paired = null), Jl(e.child, !1));
            }
            eu(e);
          }
          e = e.sibling;
        }
    }
    function tu(e) {
      if (e.tag === 30) ((e.stateNode.paired = null), Jl(e.child, !1), eu(e));
      else if (e.subtreeFlags & 33554432)
        for (e = e.child; e !== null;) (tu(e), (e = e.sibling));
      else eu(e);
    }
    function nu(e) {
      for (e = e.child; e !== null;)
        (e.tag === 30 ? Jl(e.child, !1) : e.subtreeFlags & 33554432 && nu(e),
          (e = e.sibling));
    }
    function ru(e, t, n, r, i, a, o) {
      for (var s = !1; t !== null;) {
        if (t.tag === 5) {
          var c = t.stateNode;
          if (a !== null && Gl < a.length) {
            var l = a[Gl],
              u = Op(c);
            (l.view || u.view) && (s = !0);
            var d;
            if ((d = !(e.flags & 4))) {
              if (u.clip) d = !0;
              else {
                d = l.rect;
                var f = u.rect;
                d =
                  d.y !== f.y ||
                  d.x !== f.x ||
                  d.height !== f.height ||
                  d.width !== f.width;
              }
            }
            (d && (e.flags |= 4),
              u.abs
                ? (u = !l.abs)
                : ((l = l.rect),
                  (u = u.rect),
                  (u = l.height !== u.height || l.width !== u.width)),
              u && (e.flags |= 32));
          } else e.flags |= 32;
          (e.flags & 4 && Tp(c, Gl === 0 ? n : n + `_` + Gl, i),
            (s && e.flags & 4) ||
              (Ul === null && (Ul = []),
              Ul.push(c, Gl === 0 ? r : r + `_` + Gl, t.memoizedProps)),
            Gl++);
        } else
          (t.tag !== 22 || t.memoizedState === null) &&
            (t.tag === 30 && o
              ? (e.flags |= t.flags & 32)
              : ru(e, t.child, n, r, i, a, o) && (s = !0));
        t = t.sibling;
      }
      return s;
    }
    function iu(e, t) {
      for (e = e.child; e !== null;) {
        if (e.tag === 30) {
          var n = e.memoizedProps,
            r = e.stateNode,
            i = vi(n, r),
            a = bi(n.default, n.update);
          if (t) {
            r = r.clones;
            var o = r === null ? null : r.map(kp);
          } else ((o = e.memoizedState), (e.memoizedState = null));
          r = e;
          var s = e.child;
          ((Gl = 0),
            (i = ru(r, s, i, i, a, o, !1)),
            e.flags & 4 && i && (t || Nd(e, n.onUpdate)));
        } else e.subtreeFlags & 33554432 && iu(e, t);
        e = e.sibling;
      }
    }
    var au = !1,
      W = !1,
      ou = !1,
      su = !1,
      cu = typeof WeakSet == `function` ? WeakSet : Set,
      lu = null,
      uu = !1,
      du = !1,
      fu = !1,
      pu = !1;
    function mu(e, t, n) {
      if (((e = e.containerInfo), (sp = gh), (e = Jr(e)), Yr(e))) {
        if (`selectionStart` in e)
          var r = { start: e.selectionStart, end: e.selectionEnd };
        else
          a: {
            r = ((r = e.ownerDocument) && r.defaultView) || window;
            var i = r.getSelection && r.getSelection();
            if (i && i.rangeCount !== 0) {
              r = i.anchorNode;
              var a = i.anchorOffset,
                o = i.focusNode;
              i = i.focusOffset;
              try {
                (r.nodeType, o.nodeType);
              } catch {
                r = null;
                break a;
              }
              var s = 0,
                c = -1,
                l = -1,
                u = 0,
                d = 0,
                f = e,
                p = null;
              b: for (;;) {
                for (
                  var m;
                  f !== r || (a !== 0 && f.nodeType !== 3) || (c = s + a),
                    f !== o || (i !== 0 && f.nodeType !== 3) || (l = s + i),
                    f.nodeType === 3 && (s += f.nodeValue.length),
                    (m = f.firstChild) !== null;
                )
                  ((p = f), (f = m));
                for (;;) {
                  if (f === e) break b;
                  if (
                    (p === r && ++u === a && (c = s),
                    p === o && ++d === i && (l = s),
                    (m = f.nextSibling) !== null)
                  )
                    break;
                  ((f = p), (p = f.parentNode));
                }
                f = m;
              }
              r = c === -1 || l === -1 ? null : { start: c, end: l };
            } else r = null;
          }
        r ||= { start: 0, end: 0 };
      } else r = null;
      for (
        cp = { focusedElem: e, selectionRange: r },
          gh = !1,
          n = (n & 335544064) === n,
          lu = t,
          t = n ? 9270 : 1024;
        lu !== null;
      ) {
        if (((e = lu), n && ((r = e.deletions), r !== null)))
          for (a = 0; a < r.length; a++) n && Ql(r[a]);
        if (e.alternate === null && e.flags & 2) (n && Hl(e), hu(n));
        else {
          if (e.tag === 22) {
            if (((r = e.alternate), e.memoizedState !== null)) {
              (r !== null && r.memoizedState === null && n && Ql(r), hu(n));
              continue;
            }
            if (r !== null && r.memoizedState !== null) {
              (n && Hl(e), hu(n));
              continue;
            }
          }
          ((r = e.child),
            (e.subtreeFlags & t) !== 0 && r !== null
              ? ((r.return = e), (lu = r))
              : (n && $l(e), hu(n)));
        }
      }
      Vl = null;
    }
    function hu(e) {
      for (; lu !== null;) {
        var t = lu,
          n = e,
          r = t.alternate,
          a = t.flags;
        switch (t.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (a & 1024 && r !== null) {
              ((n = void 0), (a = r.memoizedProps), (r = r.memoizedState));
              var o = t.stateNode;
              try {
                var s = Cc(t.type, a);
                ((n = o.getSnapshotBeforeUpdate(s, r)),
                  (o.__reactInternalSnapshotBeforeUpdate = n));
              } catch (e) {
                Z(t, t.return, e);
              }
            }
            break;
          case 3:
            if (a & 1024) {
              if (((r = t.stateNode.containerInfo), (n = r.nodeType), n === 9))
                nm(r);
              else if (n === 1)
                switch (r.nodeName) {
                  case `HEAD`:
                  case `HTML`:
                  case `BODY`:
                    nm(r);
                    break;
                  default:
                    r.textContent = ``;
                }
            }
            break;
          case 5:
          case 26:
          case 27:
          case 6:
          case 4:
          case 17:
            break;
          case 30:
            n &&
              r !== null &&
              ((n = vi(r.memoizedProps, r.stateNode)),
              (a = t.memoizedProps),
              (a = bi(a.default, a.update)),
              a !== `none` && Kl(r, n, a, (r.memoizedState = []), !0));
            break;
          default:
            if (a & 1024) throw Error(i(163));
        }
        if (((r = t.sibling), r !== null)) {
          ((r.return = t.return), (lu = r));
          break;
        }
        lu = t.return;
      }
    }
    function gu(e, t, n) {
      var r = n.flags;
      switch (n.tag) {
        case 0:
        case 11:
        case 15:
          (Fu(e, n), r & 4 && Sl(5, n));
          break;
        case 1:
          if ((Fu(e, n), r & 4)) {
            if (((e = n.stateNode), t === null))
              try {
                e.componentDidMount();
              } catch (e) {
                Z(n, n.return, e);
              }
            else {
              var i = Cc(n.type, t.memoizedProps);
              t = t.memoizedState;
              try {
                e.componentDidUpdate(
                  i,
                  t,
                  e.__reactInternalSnapshotBeforeUpdate,
                );
              } catch (e) {
                Z(n, n.return, e);
              }
            }
          }
          (r & 64 && wl(n), r & 512 && El(n, n.return));
          break;
        case 3:
          if ((Fu(e, n), r & 64 && ((e = n.updateQueue), e !== null))) {
            if (((t = null), n.child !== null))
              switch (n.child.tag) {
                case 27:
                case 5:
                  t = n.child.stateNode;
                  break;
                case 1:
                  t = n.child.stateNode;
              }
            try {
              To(e, t);
            } catch (e) {
              Z(n, n.return, e);
            }
          }
          break;
        case 27:
          t === null && r & 4 && zl(n);
        case 26:
        case 5:
          (Fu(e, n), t === null && r & 4 && Nl(n), r & 512 && El(n, n.return));
          break;
        case 12:
          Fu(e, n);
          break;
        case 31:
          (Fu(e, n), r & 4 && wu(e, n));
          break;
        case 13:
          (Fu(e, n),
            r & 4 && Tu(e, n),
            r & 64 &&
              ((e = n.memoizedState),
              e !== null &&
                ((e = e.dehydrated),
                e !== null && ((n = _f.bind(null, n)), cm(e, n)))));
          break;
        case 22:
          if (((r = n.memoizedState !== null || au), !r)) {
            var a = (t !== null && t.memoizedState !== null) || W;
            ((t = au),
              (i = W),
              (au = r),
              (W = a) && !i
                ? ((r = 2), n.subtreeFlags & 8772 && (r |= 1), Lu(e, n, r))
                : Fu(e, n),
              (au = t),
              (W = i));
          }
          break;
        case 30:
          (Fu(e, n), r & 512 && El(n, n.return));
          break;
        case 7:
          r & 512 && El(n, n.return);
        default:
          Fu(e, n);
      }
    }
    function _u(e, t) {
      for (e = e.child; e !== null;) (vu(e, t), (e = e.sibling));
    }
    function vu(e, t) {
      switch (e.tag) {
        case 5:
        case 26:
          try {
            var n = e.stateNode;
            if (t) {
              var r = n.style;
              typeof r.setProperty == `function`
                ? r.setProperty(`display`, `none`, `important`)
                : (r.display = `none`);
            } else {
              var i = e.stateNode,
                a = e.memoizedProps.style,
                o = a != null && a.hasOwnProperty(`display`) ? a.display : null;
              i.style.display =
                o == null || typeof o == `boolean` ? `` : (`` + o).trim();
            }
          } catch (t) {
            Z(e, e.return, t);
          }
          yu(e, t);
          break;
        case 6:
          try {
            ((e.stateNode.nodeValue = t ? `` : e.memoizedProps), (R = !0));
          } catch (t) {
            Z(e, e.return, t);
          }
          break;
        case 18:
          try {
            var s = e.stateNode;
            t ? wp(s, !0) : wp(e.stateNode, !1);
          } catch (t) {
            Z(e, e.return, t);
          }
          break;
        case 22:
        case 23:
          e.memoizedState === null && _u(e, t);
          break;
        default:
          _u(e, t);
      }
    }
    function yu(e, t) {
      if (e.subtreeFlags & 67108864)
        for (e = e.child; e !== null;) {
          a: {
            var n = e,
              r = t;
            switch (n.tag) {
              case 4:
                vu(n, r);
                break a;
              case 22:
                n.memoizedState === null && yu(n, r);
                break a;
              default:
                yu(n, r);
            }
          }
          e = e.sibling;
        }
    }
    function bu(e) {
      var t = e.alternate;
      (t !== null && ((e.alternate = null), bu(t)),
        (e.child = null),
        (e.deletions = null),
        (e.sibling = null),
        e.tag === 5 && ((t = e.stateNode), t !== null && Mt(t)),
        (e.stateNode = null),
        (e.return = null),
        (e.dependencies = null),
        (e.memoizedProps = null),
        (e.memoizedState = null),
        (e.pendingProps = null),
        (e.stateNode = null),
        (e.updateQueue = null));
    }
    var G = null,
      xu = !1;
    function Su(e, t, n) {
      for (n = n.child; n !== null;) (Cu(e, t, n), (n = n.sibling));
    }
    function Cu(e, t, n) {
      if (Ze && typeof Ze.onCommitFiberUnmount == `function`)
        try {
          Ze.onCommitFiberUnmount(Xe, n);
        } catch {}
      switch (n.tag) {
        case 26:
          (W || Dl(n, t),
            Su(e, t, n),
            n.memoizedState
              ? n.memoizedState.count--
              : n.stateNode &&
                !W &&
                ((n = n.stateNode), n.parentNode.removeChild(n)));
          break;
        case 27:
          (W || Dl(n, t), Al(n));
          var r = G,
            i = xu;
          (Sp(n.type) && ((G = n.stateNode), (xu = !1)),
            Su(e, t, n),
            gm(n.stateNode, n.type, n.memoizedProps),
            (G = r),
            (xu = i));
          break;
        case 5:
          (W || Dl(n, t), Al(n));
        case 6:
          if (
            (n.tag === 6 && Al(n),
            (r = G),
            (i = xu),
            (G = null),
            Su(e, t, n),
            (G = r),
            (xu = i),
            G !== null)
          ) {
            if (xu)
              try {
                ((G.nodeType === 9
                  ? G.body
                  : G.nodeName === `HTML`
                    ? G.ownerDocument.body
                    : G
                ).removeChild(n.stateNode),
                  (R = !0));
              } catch (e) {
                Z(n, t, e);
              }
            else
              try {
                (G.removeChild(n.stateNode), (R = !0));
              } catch (e) {
                Z(n, t, e);
              }
          }
          break;
        case 18:
          G !== null &&
            (xu
              ? ((e = G),
                Cp(
                  e.nodeType === 9
                    ? e.body
                    : e.nodeName === `HTML`
                      ? e.ownerDocument.body
                      : e,
                  n.stateNode,
                ),
                Hh(e))
              : Cp(G, n.stateNode));
          break;
        case 4:
          ((r = G),
            (i = xu),
            (G = n.stateNode.containerInfo),
            (xu = !0),
            Su(e, t, n),
            (G = r),
            (xu = i));
          break;
        case 0:
        case 11:
        case 14:
        case 15:
          (Cl(2, n, t), W || Cl(4, n, t), Su(e, t, n));
          break;
        case 1:
          (W ||
            (Dl(n, t),
            (r = n.stateNode),
            typeof r.componentWillUnmount == `function` && Tl(n, t, r)),
            Su(e, t, n));
          break;
        case 21:
          Su(e, t, n);
          break;
        case 22:
          ((W = (r = W) || n.memoizedState !== null), Su(e, t, n), (W = r));
          break;
        case 30:
          (Dl(n, t), Su(e, t, n));
          break;
        case 7:
          (W || Dl(n, t), Su(e, t, n));
          break;
        default:
          Su(e, t, n);
      }
    }
    function wu(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate), e !== null && ((e = e.memoizedState), e !== null))
      ) {
        e = e.dehydrated;
        try {
          Hh(e);
        } catch (e) {
          Z(t, t.return, e);
        }
      }
    }
    function Tu(e, t) {
      if (
        t.memoizedState === null &&
        ((e = t.alternate),
        e !== null &&
          ((e = e.memoizedState),
          e !== null && ((e = e.dehydrated), e !== null)))
      )
        try {
          Hh(e);
        } catch (e) {
          Z(t, t.return, e);
        }
    }
    function Eu(e) {
      switch (e.tag) {
        case 31:
        case 13:
        case 19:
          var t = e.stateNode;
          return (t === null && (t = e.stateNode = new cu()), t);
        case 22:
          return (
            (e = e.stateNode),
            (t = e._retryCache),
            t === null && (t = e._retryCache = new cu()),
            t
          );
        default:
          throw Error(i(435, e.tag));
      }
    }
    function Du(e, t) {
      var n = Eu(e);
      t.forEach(function (t) {
        if (!n.has(t)) {
          n.add(t);
          var r = vf.bind(null, e, t);
          t.then(r, r);
        }
      });
    }
    function Ou(e, t, n) {
      var r = t.deletions;
      if (r !== null)
        for (var a = 0; a < r.length; a++) {
          var o = r[a],
            s = e,
            c = t,
            l = c;
          a: for (; l !== null;) {
            switch (l.tag) {
              case 27:
                if (Sp(l.type)) {
                  ((G = l.stateNode), (xu = !1));
                  break a;
                }
                break;
              case 5:
                ((G = l.stateNode), (xu = !1));
                break a;
              case 3:
              case 4:
                ((G = l.stateNode.containerInfo), (xu = !0));
                break a;
            }
            l = l.return;
          }
          if (G === null) throw Error(i(160));
          (Cu(s, c, o),
            (G = null),
            (xu = !1),
            (s = o.alternate),
            s !== null && (s.return = null),
            (o.return = null));
        }
      if (t.subtreeFlags & 13886)
        for (t = t.child; t !== null;) (Au(t, e, n), (t = t.sibling));
    }
    var ku = null;
    function Au(e, t, n) {
      var r = e.alternate,
        a = e.flags;
      switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          if (
            a & 4 &&
            ((r = e.updateQueue),
            (r = r === null ? null : r.events),
            r !== null)
          )
            for (var o = 0; o < r.length; o++) {
              var s = r[o];
              s.ref.impl = s.nextImpl;
            }
          (Ou(t, e, n),
            ju(e),
            a & 4 && (Cl(3, e, e.return), Sl(3, e), Cl(5, e, e.return)));
          break;
        case 1:
          (Ou(t, e, n),
            ju(e),
            a & 512 && (W || r === null || Dl(r, r.return)),
            a & 64 &&
              au &&
              ((e = e.updateQueue),
              e !== null &&
                ((t = e.callbacks),
                t !== null &&
                  ((n = e.shared.hiddenCallbacks),
                  (e.shared.hiddenCallbacks = n === null ? t : n.concat(t))))));
          break;
        case 26:
          if (
            ((o = ku),
            Ou(t, e, n),
            ju(e),
            a & 512 && (W || r === null || Dl(r, r.return)),
            a & 4)
          ) {
            if (
              ((a = r === null ? null : r.memoizedState),
              (n = e.memoizedState),
              r === null)
            ) {
              if (n === null) {
                if (e.stateNode === null) {
                  if (au)
                    e.stateNode = fp(
                      e.type,
                      e.memoizedProps,
                      t.containerInfo,
                      e,
                    );
                  else {
                    a: {
                      ((t = e.type),
                        (n = e.memoizedProps),
                        (a = o.ownerDocument || o));
                      b: switch (t) {
                        case `title`:
                          ((r = a.getElementsByTagName(`title`)[0]),
                            (!r ||
                              r[At] ||
                              r[Ct] ||
                              r.namespaceURI === `http://www.w3.org/2000/svg` ||
                              r.hasAttribute(`itemprop`)) &&
                              ((r = a.createElement(t)),
                              a.head.insertBefore(
                                r,
                                a.querySelector(`head > title`),
                              )),
                            np(r, t, n),
                            (r[Ct] = e),
                            Lt(r),
                            (t = r));
                          break a;
                        case `link`:
                          if (
                            (o = Gm(`link`, `href`, a).get(t + (n.href || ``)))
                          ) {
                            for (s = 0; s < o.length; s++)
                              if (
                                ((r = o[s]),
                                r.getAttribute(`href`) ===
                                  (n.href == null || n.href === ``
                                    ? null
                                    : n.href) &&
                                  r.getAttribute(`rel`) ===
                                    (n.rel == null ? null : n.rel) &&
                                  r.getAttribute(`title`) ===
                                    (n.title == null ? null : n.title) &&
                                  r.getAttribute(`crossorigin`) ===
                                    (n.crossOrigin == null
                                      ? null
                                      : n.crossOrigin))
                              ) {
                                o.splice(s, 1);
                                break b;
                              }
                          }
                          ((r = a.createElement(t)),
                            np(r, t, n),
                            a.head.appendChild(r));
                          break;
                        case `meta`:
                          if (
                            (o = Gm(`meta`, `content`, a).get(
                              t + (n.content || ``),
                            ))
                          ) {
                            for (s = 0; s < o.length; s++)
                              if (
                                ((r = o[s]),
                                r.getAttribute(`content`) ===
                                  (n.content == null ? null : `` + n.content) &&
                                  r.getAttribute(`name`) ===
                                    (n.name == null ? null : n.name) &&
                                  r.getAttribute(`property`) ===
                                    (n.property == null ? null : n.property) &&
                                  r.getAttribute(`http-equiv`) ===
                                    (n.httpEquiv == null
                                      ? null
                                      : n.httpEquiv) &&
                                  r.getAttribute(`charset`) ===
                                    (n.charSet == null ? null : n.charSet))
                              ) {
                                o.splice(s, 1);
                                break b;
                              }
                          }
                          ((r = a.createElement(t)),
                            np(r, t, n),
                            a.head.appendChild(r));
                          break;
                        default:
                          throw Error(i(468, t));
                      }
                      ((r[Ct] = e), Lt(r), (t = r));
                    }
                    e.stateNode = t;
                  }
                } else au || Km(o, e.type, e.stateNode);
              } else e.stateNode = Bm(o, n, e.memoizedProps);
            } else
              a === n
                ? n === null &&
                  e.stateNode !== null &&
                  Pl(e, e.memoizedProps, r.memoizedProps)
                : (a === null
                    ? ((t = r.stateNode),
                      t === null || W || t.parentNode.removeChild(t))
                    : a.count--,
                  n === null
                    ? au || Km(o, e.type, e.stateNode)
                    : Bm(o, n, e.memoizedProps));
          }
          break;
        case 27:
          (Ou(t, e, n),
            ju(e),
            a & 512 && (W || r === null || Dl(r, r.return)),
            r !== null && a & 4 && Pl(e, e.memoizedProps, r.memoizedProps));
          break;
        case 5:
          if (
            ((o = ou),
            (ou = !1),
            Ou(t, e, n),
            (ou = o),
            ju(e),
            a & 512 && (W || r === null || Dl(r, r.return)),
            e.flags & 32)
          ) {
            t = e.stateNode;
            try {
              (dn(t, ``), (R = !0));
            } catch (t) {
              Z(e, e.return, t);
            }
          }
          (a & 4 &&
            e.stateNode != null &&
            ((t = e.memoizedProps), Pl(e, t, r === null ? t : r.memoizedProps)),
            a & 1024 && (su = !0));
          break;
        case 6:
          if ((Ou(t, e, n), ju(e), a & 4)) {
            if (e.stateNode === null) throw Error(i(162));
            ((t = e.memoizedProps), (n = e.stateNode));
            try {
              ((n.nodeValue = t), (R = !0));
            } catch (t) {
              Z(e, e.return, t);
            }
          }
          break;
        case 3:
          if (
            ((R = !1),
            (Wm = null),
            (o = ku),
            (ku = bm(t.containerInfo)),
            Ou(t, e, n),
            (ku = o),
            ju(e),
            a & 4 && r !== null && r.memoizedState.isDehydrated)
          )
            try {
              Hh(t.containerInfo);
            } catch (t) {
              Z(e, e.return, t);
            }
          (su && ((su = !1), Mu(e)), (R = !1));
          break;
        case 4:
          ((a = ou),
            (ou = au),
            (r = qt()),
            (o = ku),
            (ku = bm(e.stateNode.containerInfo)),
            Ou(t, e, n),
            ju(e),
            (ku = o),
            R && du && (fu = !0),
            (R = r),
            (ou = a));
          break;
        case 12:
          (Ou(t, e, n), ju(e));
          break;
        case 31:
          (Ou(t, e, n),
            ju(e),
            a & 4 &&
              ((t = e.updateQueue),
              t !== null && ((e.updateQueue = null), Du(e, t))));
          break;
        case 13:
          (Ou(t, e, n),
            ju(e),
            e.child.flags & 8192 &&
              (e.memoizedState !== null) !=
                (r !== null && r.memoizedState !== null) &&
              (md = Ve()),
            a & 4 &&
              ((t = e.updateQueue),
              t !== null && ((e.updateQueue = null), Du(e, t))));
          break;
        case 22:
          ((o = e.memoizedState !== null),
            (s = r !== null && r.memoizedState !== null));
          var c = au,
            l = W,
            u = ou;
          ((au = c || o),
            (ou = u || o),
            (W = l || s),
            Ou(t, e, n),
            (W = l),
            (ou = u),
            (au = c),
            ju(e),
            a & 8192 &&
              ((t = e.stateNode),
              (t._visibility = o ? t._visibility & -2 : t._visibility | 1),
              !o ||
                r === null ||
                s ||
                au ||
                W ||
                ((t = s || W),
                (n = au),
                (r = W),
                (au = o || au),
                (W = t),
                Iu(e, 2),
                (au = n),
                (W = r)),
              (!o && ou) || _u(e, o)),
            a & 4 &&
              ((t = e.updateQueue),
              t !== null &&
                ((n = t.retryQueue),
                n !== null && ((t.retryQueue = null), Du(e, n)))));
          break;
        case 19:
          (Ou(t, e, n),
            ju(e),
            a & 4 &&
              ((t = e.updateQueue),
              t !== null && ((e.updateQueue = null), Du(e, t))));
          break;
        case 30:
          (a & 512 && (W || r === null || Dl(r, r.return)),
            (a = qt()),
            (o = du),
            (s = (n & 335544064) === n),
            (c = e.memoizedProps),
            (du = s && bi(c.default, c.update) !== `none`),
            Ou(t, e, n),
            ju(e),
            s && r !== null && R && (e.flags |= 4),
            (du = o),
            (R = a));
          break;
        case 21:
          break;
        case 7:
          (a & 512 && (W || r === null || Dl(r, r.return)),
            r && r.stateNode !== null && (r.stateNode._fragmentFiber = e));
        default:
          (Ou(t, e, n), ju(e));
      }
    }
    function ju(e) {
      var t = e.flags;
      if (t & 2) {
        try {
          for (var n, r = e.return; r !== null;) {
            if (Fl(r)) {
              n = r;
              break;
            }
            r = r.return;
          }
          r = null;
          for (var a = e.return; a !== null;) {
            if (Ml(a)) {
              var o = a.stateNode;
              r === null ? (r = [o]) : r.push(o);
            }
            if (jl(a)) break;
            a = a.return;
          }
          var s = r;
          if (n == null) throw Error(i(160));
          switch (n.tag) {
            case 27:
              var c = n.stateNode;
              Rl(e, Il(e), c, s);
              break;
            case 5:
              var l = n.stateNode;
              (n.flags & 32 && (dn(l, ``), (n.flags &= -33)),
                Rl(e, Il(e), l, s));
              break;
            case 3:
            case 4:
              var u = n.stateNode.containerInfo;
              Ll(e, Il(e), u, s);
              break;
            default:
              throw Error(i(161));
          }
        } catch (t) {
          Z(e, e.return, t);
        }
        e.flags &= -3;
      }
      t & 4096 && (e.flags &= -4097);
    }
    function Mu(e) {
      if (e.subtreeFlags & 1024)
        for (e = e.child; e !== null;) {
          var t = e;
          (Mu(t),
            t.tag === 5 &&
              t.flags & 1024 &&
              ((t = t.stateNode), (gh = !0), t.reset(), (gh = !1)),
            (e = e.sibling));
        }
    }
    function Nu(e, t) {
      if (t.subtreeFlags & 9270)
        for (t = t.child; t !== null;) (Pu(t, e), (t = t.sibling));
      else iu(t, !1);
    }
    function Pu(e, t) {
      var n = e.alternate;
      if (n === null) Xl(e, !1);
      else
        switch (e.tag) {
          case 3:
            if (((pu = uu = !1), Wl(), Nu(t, e), !uu && !fu)) {
              if (((e = Ul), e !== null))
                for (var r = 0; r < e.length; r += 3) {
                  n = e[r];
                  var i = e[r + 1];
                  (Ep(n, e[r + 2]),
                    (n = n.ownerDocument.documentElement),
                    n !== null &&
                      n.animate(
                        { opacity: [0, 0], pointerEvents: [`none`, `none`] },
                        {
                          duration: 0,
                          fill: `forwards`,
                          pseudoElement: `::view-transition-group(` + i + `)`,
                        },
                      ));
                }
              ((e = t.containerInfo),
                (e =
                  e.nodeType === 9
                    ? e.documentElement
                    : e.ownerDocument.documentElement),
                e !== null &&
                  e.style.viewTransitionName === `` &&
                  ((e.style.viewTransitionName = `none`),
                  e.animate(
                    { opacity: [0, 0], pointerEvents: [`none`, `none`] },
                    {
                      duration: 0,
                      fill: `forwards`,
                      pseudoElement: `::view-transition-group(root)`,
                    },
                  ),
                  e.animate(
                    { width: [0, 0], height: [0, 0] },
                    {
                      duration: 0,
                      fill: `forwards`,
                      pseudoElement: `::view-transition`,
                    },
                  )),
                (pu = !0));
            }
            Ul = null;
            break;
          case 5:
            Nu(t, e);
            break;
          case 4:
            ((r = uu), (uu = !1), Nu(t, e), uu && (fu = !0), (uu = r));
            break;
          case 22:
            e.memoizedState === null &&
              (n.memoizedState === null ? Nu(t, e) : Xl(e, !1));
            break;
          case 30:
            ((r = uu), (i = Wl()), (uu = !1), Nu(t, e), uu && (e.flags |= 4));
            var a = e.memoizedProps,
              o = e.stateNode;
            ((t = vi(a, o)), (o = vi(n.memoizedProps, o)));
            var s = bi(a.default, a.update);
            (s === `none`
              ? (t = !1)
              : ((a = n.memoizedState),
                (n.memoizedState = null),
                (n = e.child),
                (Gl = 0),
                (t = ru(e, n, t, o, s, a, !0)),
                Gl !== (a === null ? 0 : a.length) && (e.flags |= 32)),
              e.flags & 4 && t
                ? (Nd(e, e.memoizedProps.onUpdate), (Ul = i))
                : i !== null && (i.push.apply(i, Ul), (Ul = i)),
              (uu = e.flags & 32 ? !0 : r));
            break;
          default:
            Nu(t, e);
        }
    }
    function Fu(e, t) {
      if (t.subtreeFlags & 8772)
        for (t = t.child; t !== null;) (gu(e, t.alternate, t), (t = t.sibling));
    }
    function Iu(e, t) {
      for (e = e.child; e !== null;) {
        var n = e,
          r = t;
        switch (n.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            (Cl(4, n, n.return), Iu(n, r));
            break;
          case 1:
            Dl(n, n.return);
            var i = n.stateNode;
            (typeof i.componentWillUnmount == `function` && Tl(n, n.return, i),
              Iu(n, r));
            break;
          case 27:
            r & 2 && gm(n.stateNode, n.type, n.memoizedProps);
          case 5:
            (Dl(n, n.return), (n.tag !== 5 && n.tag !== 27) || Al(n), Iu(n, r));
            break;
          case 6:
            Al(n);
            break;
          case 26:
            (Dl(n, n.return),
              (i = n.stateNode),
              n.memoizedState !== null ||
                i === null ||
                W ||
                i.parentNode.removeChild(i),
              Iu(n, r));
            break;
          case 22:
            n.memoizedState === null && Iu(n, r);
            break;
          case 30:
            (Dl(n, n.return), Iu(n, r));
            break;
          case 7:
            Dl(n, n.return);
          default:
            Iu(n, r);
        }
        e = e.sibling;
      }
    }
    function Lu(e, t, n) {
      for (n = t.subtreeFlags & 8772 ? n : n & -2, t = t.child; t !== null;) {
        var r = t.alternate,
          i = e,
          a = t,
          o = a.flags,
          s = !!(n & 1);
        switch (a.tag) {
          case 0:
          case 11:
          case 15:
            (Lu(i, a, n), Sl(4, a));
            break;
          case 1:
            if (
              (Lu(i, a, n),
              (r = a),
              (i = r.stateNode),
              typeof i.componentDidMount == `function`)
            )
              try {
                i.componentDidMount();
              } catch (e) {
                Z(r, r.return, e);
              }
            if (((r = a), (i = r.updateQueue), i !== null)) {
              var c = r.stateNode;
              try {
                var l = i.shared.hiddenCallbacks;
                if (l !== null)
                  for (
                    i.shared.hiddenCallbacks = null, i = 0;
                    i < l.length;
                    i++
                  )
                    wo(l[i], c);
              } catch (e) {
                Z(r, r.return, e);
              }
            }
            (s && o & 64 && wl(a), El(a, a.return));
            break;
          case 27:
            n & 2 && zl(a);
          case 5:
            ((a.tag !== 5 && a.tag !== 27) || kl(a),
              Lu(i, a, n),
              s && r === null && o & 4 && Nl(a),
              El(a, a.return));
            break;
          case 6:
            kl(a);
            break;
          case 26:
            ((c = a.stateNode),
              a.memoizedState !== null ||
                c === null ||
                au ||
                Km(bm(c.ownerDocument), a.type, c),
              Lu(i, a, n),
              s && r === null && o & 4 && Nl(a),
              El(a, a.return));
            break;
          case 12:
            Lu(i, a, n);
            break;
          case 31:
            (Lu(i, a, n), s && o & 4 && wu(i, a));
            break;
          case 13:
            (Lu(i, a, n), s && o & 4 && Tu(i, a));
            break;
          case 22:
            (a.memoizedState === null && Lu(i, a, n), El(a, a.return));
            break;
          case 30:
            (Lu(i, a, n), El(a, a.return));
            break;
          case 7:
            El(a, a.return);
          default:
            Lu(i, a, n);
        }
        t = t.sibling;
      }
    }
    function Ru(e, t) {
      var n = null;
      (e !== null &&
        e.memoizedState !== null &&
        e.memoizedState.cachePool !== null &&
        (n = e.memoizedState.cachePool.pool),
        (e = null),
        t.memoizedState !== null &&
          t.memoizedState.cachePool !== null &&
          (e = t.memoizedState.cachePool.pool),
        e !== n && (e != null && e.refCount++, n != null && Na(n)));
    }
    function zu(e, t) {
      ((e = null),
        t.alternate !== null && (e = t.alternate.memoizedState.cache),
        (t = t.memoizedState.cache),
        t !== e && (t.refCount++, e != null && Na(e)));
    }
    function Bu(e, t, n, r) {
      var i = (n & 335544064) === n;
      if (t.subtreeFlags & (i ? 10262 : 10256))
        for (t = t.child; t !== null;) (Vu(e, t, n, r), (t = t.sibling));
      else i && nu(t);
    }
    function Vu(e, t, n, r) {
      var i = (n & 335544064) === n;
      i &&
        t.alternate === null &&
        t.return !== null &&
        t.return.alternate !== null &&
        tu(t);
      var a = t.flags;
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          (Bu(e, t, n, r), a & 2048 && Sl(9, t));
          break;
        case 1:
          Bu(e, t, n, r);
          break;
        case 3:
          (Bu(e, t, n, r),
            i &&
              pu &&
              ((e = e.containerInfo),
              (e =
                e.nodeType === 9
                  ? e.body
                  : e.nodeName === `HTML`
                    ? e.ownerDocument.body
                    : e),
              e.style.viewTransitionName === `root` &&
                (e.style.viewTransitionName = ``),
              (e = e.ownerDocument.documentElement),
              e !== null &&
                e.style.viewTransitionName === `none` &&
                (e.style.viewTransitionName = ``)),
            a & 2048 &&
              ((a = null),
              t.alternate !== null && (a = t.alternate.memoizedState.cache),
              (t = t.memoizedState.cache),
              t !== a && (t.refCount++, a != null && Na(a))));
          break;
        case 12:
          if (a & 2048) {
            (Bu(e, t, n, r), (a = t.stateNode));
            try {
              var o = t.memoizedProps,
                s = o.id,
                c = o.onPostCommit;
              typeof c == `function` &&
                c(
                  s,
                  t.alternate === null ? `mount` : `update`,
                  a.passiveEffectDuration,
                  -0,
                );
            } catch (e) {
              Z(t, t.return, e);
            }
          } else Bu(e, t, n, r);
          break;
        case 31:
          Bu(e, t, n, r);
          break;
        case 13:
          Bu(e, t, n, r);
          break;
        case 23:
          break;
        case 22:
          ((o = t.stateNode),
            (s = t.alternate),
            t.memoizedState === null
              ? (i && s !== null && s.memoizedState !== null && tu(t),
                o._visibility & 2
                  ? Bu(e, t, n, r)
                  : ((o._visibility |= 2),
                    Hu(e, t, n, r, !!(t.subtreeFlags & 10256) || !1)))
              : (i && s !== null && s.memoizedState === null && tu(s),
                o._visibility & 2 ? Bu(e, t, n, r) : Uu(e, t)),
            a & 2048 && Ru(s, t));
          break;
        case 24:
          (Bu(e, t, n, r), a & 2048 && zu(t.alternate, t));
          break;
        case 30:
          (i &&
            ((a = t.alternate),
            a !== null && (Jl(a.child, !0), Jl(t.child, !0))),
            Bu(e, t, n, r));
          break;
        default:
          Bu(e, t, n, r);
      }
    }
    function Hu(e, t, n, r, i) {
      for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
        var a = e,
          o = t,
          s = n,
          c = r,
          l = o.flags;
        switch (o.tag) {
          case 0:
          case 11:
          case 15:
            (Hu(a, o, s, c, i), Sl(8, o));
            break;
          case 23:
            break;
          case 22:
            var u = o.stateNode;
            (o.memoizedState === null
              ? ((u._visibility |= 2), Hu(a, o, s, c, i))
              : u._visibility & 2
                ? Hu(a, o, s, c, i)
                : Uu(a, o),
              i && l & 2048 && Ru(o.alternate, o));
            break;
          case 24:
            (Hu(a, o, s, c, i), i && l & 2048 && zu(o.alternate, o));
            break;
          default:
            Hu(a, o, s, c, i);
        }
        t = t.sibling;
      }
    }
    function Uu(e, t) {
      if (t.subtreeFlags & 10256)
        for (t = t.child; t !== null;) {
          var n = e,
            r = t,
            i = r.flags;
          switch (r.tag) {
            case 22:
              (Uu(n, r), i & 2048 && Ru(r.alternate, r));
              break;
            case 24:
              (Uu(n, r), i & 2048 && zu(r.alternate, r));
              break;
            default:
              Uu(n, r);
          }
          t = t.sibling;
        }
    }
    var Wu = 8192;
    function Gu(e, t, n) {
      if (e.subtreeFlags & Wu)
        for (e = e.child; e !== null;) (Ku(e, t, n), (e = e.sibling));
    }
    function Ku(e, t, n) {
      switch (e.tag) {
        case 26:
          (Gu(e, t, n),
            e.flags & Wu &&
              (e.memoizedState === null
                ? ((e = e.stateNode), (t & 335544128) === t && Zm(n, e))
                : Qm(n, ku, e.memoizedState, e.memoizedProps)));
          break;
        case 5:
          (Gu(e, t, n),
            e.flags & Wu &&
              ((e = e.stateNode), (t & 335544128) === t && Zm(n, e)));
          break;
        case 3:
        case 4:
          var r = ku;
          ((ku = bm(e.stateNode.containerInfo)), Gu(e, t, n), (ku = r));
          break;
        case 22:
          e.memoizedState === null &&
            ((r = e.alternate),
            r !== null && r.memoizedState !== null
              ? ((r = Wu), (Wu = 16777216), Gu(e, t, n), (Wu = r))
              : Gu(e, t, n));
          break;
        case 30:
          if (
            (e.flags & Wu) !== 0 &&
            ((r = e.memoizedProps.name), r != null && r !== `auto`)
          ) {
            var i = e.stateNode;
            ((i.paired = null), Vl === null && (Vl = new Map()), Vl.set(r, i));
          }
          Gu(e, t, n);
          break;
        default:
          Gu(e, t, n);
      }
    }
    function qu(e) {
      var t = e.alternate;
      if (t !== null && ((e = t.child), e !== null)) {
        t.child = null;
        do ((t = e.sibling), (e.sibling = null), (e = t));
        while (e !== null);
      }
    }
    function Ju(e) {
      var t = e.deletions;
      if (e.flags & 16) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            ((lu = r), Zu(r, e));
          }
        qu(e);
      }
      if (e.subtreeFlags & 10256)
        for (e = e.child; e !== null;) (Yu(e), (e = e.sibling));
    }
    function Yu(e) {
      switch (e.tag) {
        case 0:
        case 11:
        case 15:
          (Ju(e), e.flags & 2048 && Cl(9, e, e.return));
          break;
        case 3:
          Ju(e);
          break;
        case 12:
          Ju(e);
          break;
        case 22:
          var t = e.stateNode;
          e.memoizedState !== null &&
          t._visibility & 2 &&
          (e.return === null || e.return.tag !== 13)
            ? ((t._visibility &= -3), Xu(e))
            : Ju(e);
          break;
        default:
          Ju(e);
      }
    }
    function Xu(e) {
      var t = e.deletions;
      if (e.flags & 16) {
        if (t !== null)
          for (var n = 0; n < t.length; n++) {
            var r = t[n];
            ((lu = r), Zu(r, e));
          }
        qu(e);
      }
      for (e = e.child; e !== null;) {
        switch (((t = e), t.tag)) {
          case 0:
          case 11:
          case 15:
            (Cl(8, t, t.return), Xu(t));
            break;
          case 22:
            ((n = t.stateNode),
              n._visibility & 2 && ((n._visibility &= -3), Xu(t)));
            break;
          default:
            Xu(t);
        }
        e = e.sibling;
      }
    }
    function Zu(e, t) {
      for (; lu !== null;) {
        var n = lu;
        switch (n.tag) {
          case 0:
          case 11:
          case 15:
            Cl(8, n, t);
            break;
          case 23:
          case 22:
            if (
              n.memoizedState !== null &&
              n.memoizedState.cachePool !== null
            ) {
              var r = n.memoizedState.cachePool.pool;
              r != null && r.refCount++;
            }
            break;
          case 24:
            Na(n.memoizedState.cache);
        }
        if (((r = n.child), r !== null)) ((r.return = n), (lu = r));
        else
          a: for (n = e; lu !== null;) {
            r = lu;
            var i = r.sibling,
              a = r.return;
            if ((bu(r), r === n)) {
              lu = null;
              break a;
            }
            if (i !== null) {
              ((i.return = a), (lu = i));
              break a;
            }
            lu = a;
          }
      }
    }
    var Qu = {
        getCacheForType: function (e) {
          var t = Ta(ja),
            n = t.data.get(e);
          return (n === void 0 && ((n = e()), t.data.set(e, n)), n);
        },
        cacheSignal: function () {
          return Ta(ja).controller.signal;
        },
      },
      $u = typeof WeakMap == `function` ? WeakMap : Map,
      K = 0,
      q = null,
      J = null,
      Y = 0,
      X = 0,
      ed = null,
      td = !1,
      nd = !1,
      rd = !1,
      id = 0,
      ad = 0,
      od = 0,
      sd = 0,
      cd = 0,
      ld = 0,
      ud = 0,
      dd = null,
      fd = null,
      pd = !1,
      md = 0,
      hd = 0,
      gd = 1 / 0,
      _d = null,
      vd = null,
      yd = 0,
      bd = null,
      xd = null,
      Sd = 0,
      Cd = 0,
      wd = null,
      Td = null,
      Ed = null,
      Dd = null,
      Od = null,
      kd = 0,
      Ad = null;
    function jd() {
      return K & 2 && Y !== 0 ? Y & -Y : j.T === null ? bt() : Pf();
    }
    function Md() {
      if (ld === 0) {
        if (!(Y & 536870912) || B) {
          var e = it;
          ((it <<= 1), !(it & 3932160) && (it = 262144), (ld = e));
        } else ld = 536870912;
      }
      return ((e = jo.current), e !== null && (e.flags |= 32), ld);
    }
    function Nd(e, t) {
      if (t != null) {
        var n = e.stateNode,
          r = n.ref;
        (r === null && (r = n.ref = Pp(vi(e.memoizedProps, n))),
          Dd === null && (Dd = []),
          Dd.push(t.bind(null, r)));
      }
    }
    function Pd(e, t, n) {
      (((e === q && (X === 2 || X === 9)) || e.cancelPendingCommit !== null) &&
        (Vd(e, 0), Rd(e, Y, ld, !1)),
        pt(e, n),
        (!(K & 2) || e !== q) &&
          (e === q && (!(K & 2) && (sd |= n), ad === 4 && Rd(e, Y, ld, !1)),
          Ef(e)));
    }
    function Fd(e, t, n) {
      if (K & 6) throw Error(i(327));
      var r = (!n && !(t & 127) && (t & e.expiredLanes) === 0) || ct(e, t),
        a = r ? Yd(e, t) : qd(e, t, !0),
        o = r;
      do {
        if (a === 0) {
          nd && !r && Rd(e, t, 0, !1);
          break;
        }
        if (((n = e.current.alternate), o && !Ld(n))) {
          ((a = qd(e, t, !1)), (o = !1));
          continue;
        }
        if (a === 2) {
          if (((o = t), e.errorRecoveryDisabledLanes & o)) var s = 0;
          else
            ((s = e.pendingLanes & -536870913),
              (s = s === 0 ? (s & 536870912 ? 536870912 : 0) : s));
          if (s !== 0) {
            t = s;
            a: {
              var c = e;
              a = dd;
              var l = c.current.memoizedState.isDehydrated;
              if (
                (l && (Vd(c, s).flags |= 256),
                (s = qd(c, s, !1)),
                s !== 2 && s !== 6)
              ) {
                if (rd && !l) {
                  ((c.errorRecoveryDisabledLanes |= o), (sd |= o), (a = 4));
                  break a;
                }
                ((o = fd),
                  (fd = a),
                  o !== null &&
                    (fd === null ? (fd = o) : fd.push.apply(fd, o)));
              }
              a = s;
            }
            if (((o = !1), a !== 2)) continue;
          }
        }
        if (a === 1) {
          (Vd(e, 0), Rd(e, t, 0, !0));
          break;
        }
        a: {
          switch (((r = e), (o = a), o)) {
            case 0:
            case 1:
              throw Error(i(345));
            case 4:
              if ((t & 4194048) !== t && (t & 62914560) !== t) break;
            case 6:
              Rd(r, t, ld, !td);
              break a;
            case 2:
              fd = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(i(329));
          }
          if ((t & 62914560) === t && ((a = md + 300 - Ve()), 10 < a)) {
            if ((Rd(r, t, ld, !td), st(r, 0, !0) !== 0)) break a;
            ((Sd = t),
              (r.timeoutHandle = gp(
                Id.bind(
                  null,
                  r,
                  n,
                  fd,
                  _d,
                  pd,
                  t,
                  ld,
                  sd,
                  ud,
                  td,
                  o,
                  `Throttled`,
                  -0,
                  0,
                ),
                a,
              )));
            break a;
          }
          Id(r, n, fd, _d, pd, t, ld, sd, ud, td, o, null, -0, 0);
        }
        break;
      } while (1);
      Ef(e);
    }
    function Id(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
      e.timeoutHandle = -1;
      var m = t.subtreeFlags,
        h = (a & 335544064) === a;
      if (
        ((d = null),
        (h || m & 8192 || (m & 16785408) == 16785408) &&
          ((d = {
            stylesheets: null,
            count: 0,
            imgCount: 0,
            imgBytes: 0,
            suspenseyImages: [],
            waitingForImages: !0,
            waitingForViewTransition: !1,
            unsuspend: yn,
          }),
          (Vl = null),
          Ku(t, a, d),
          h &&
            ((m = d),
            (h = e.containerInfo),
            (h = (h.nodeType === 9 ? h : h.ownerDocument)
              .__reactViewTransition),
            h != null &&
              (m.count++,
              (m.waitingForViewTransition = !0),
              (m = nh.bind(m)),
              h.finished.then(m, m))),
          (m =
            (a & 62914560) === a
              ? md - Ve()
              : (a & 4194048) === a
                ? hd - Ve()
                : 0),
          (m = eh(d, m)),
          m !== null))
      ) {
        ((Sd = a),
          (e.cancelPendingCommit = m(
            nf.bind(null, e, t, a, n, r, i, o, s, c, l, u, d, null, f, p),
          )),
          Rd(e, a, o, !l));
        return;
      }
      nf(e, t, a, n, r, i, o, s, c, l, u, d);
    }
    function Ld(e) {
      for (var t = e; ;) {
        var n = t.tag;
        if (
          (n === 0 || n === 11 || n === 15) &&
          t.flags & 16384 &&
          ((n = t.updateQueue), n !== null && ((n = n.stores), n !== null))
        )
          for (var r = 0; r < n.length; r++) {
            var i = n[r],
              a = i.getSnapshot;
            i = i.value;
            try {
              if (!Hr(a(), i)) return !1;
            } catch {
              return !1;
            }
          }
        if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
          ((n.return = t), (t = n));
        else {
          if (t === e) break;
          for (; t.sibling === null;) {
            if (t.return === null || t.return === e) return !0;
            t = t.return;
          }
          ((t.sibling.return = t.return), (t = t.sibling));
        }
      }
      return !0;
    }
    function Rd(e, t, n, r) {
      ((t = lt(e, t)),
        (t &= ~cd),
        (t &= ~sd),
        (e.suspendedLanes |= t),
        (e.pingedLanes &= ~t),
        r && (e.warmLanes |= t),
        (r = e.expirationTimes));
      for (var i = t; 0 < i;) {
        var a = 31 - $e(i),
          o = 1 << a;
        ((r[a] = -1), (i &= ~o));
      }
      n !== 0 && ht(e, n, t);
    }
    function zd() {
      return K & 6 ? !0 : (Df(0, !1), !1);
    }
    function Bd() {
      if (J !== null) {
        if (X === 0) var e = J.return;
        else ((e = J), (_a = ga = null), as(e), (ao = null), (oo = 0), (e = J));
        for (; e !== null;) (xl(e.alternate, e), (e = e.return));
        J = null;
      }
    }
    function Vd(e, t) {
      var n = e.timeoutHandle;
      return (
        n !== -1 && ((e.timeoutHandle = -1), _p(n)),
        (n = e.cancelPendingCommit),
        n !== null && ((e.cancelPendingCommit = null), n()),
        (Sd = 0),
        Bd(),
        (q = e),
        (J = n = Fi(e.current, null)),
        (Y = t),
        (X = 0),
        (ed = null),
        (td = !1),
        (nd = ct(e, t)),
        (rd = !1),
        (ud = ld = cd = sd = od = ad = 0),
        (fd = dd = null),
        (pd = !1),
        (id = lt(e, t)),
        Ti(),
        n
      );
    }
    function Hd(e, t) {
      ((V = null),
        (j.H = hc),
        t === Ya || t === Za
          ? ((t = ro()), (X = 3))
          : t === Xa
            ? ((t = ro()), (X = 4))
            : (X =
                t === Nc
                  ? 8
                  : typeof t == `object` && t && typeof t.then == `function`
                    ? 6
                    : 1),
        (ed = t),
        J === null && ((ad = 1), Dc(e, Ui(t, e.current))));
    }
    function Ud() {
      var e = jo.current;
      return e === null
        ? !0
        : (Y & 4194048) === Y
          ? Mo === null
          : (Y & 62914560) === Y || Y & 536870912
            ? e === Mo
            : !1;
    }
    function Wd() {
      var e = j.H;
      return ((j.H = hc), e === null ? hc : e);
    }
    function Gd() {
      var e = j.A;
      return ((j.A = Qu), e);
    }
    function Kd() {
      ((ad = 4),
        td || ((Y & 4194048) !== Y && jo.current !== null) || (nd = !0),
        (!(od & 134217727) && !(sd & 134217727)) ||
          q === null ||
          Rd(q, Y, ld, !1));
    }
    function qd(e, t, n) {
      var r = K;
      K |= 2;
      var i = Wd(),
        a = Gd();
      ((q !== e || Y !== t) && ((_d = null), Vd(e, t)), (t = !1));
      var o = ad;
      a: do
        try {
          if (X !== 0 && J !== null) {
            var s = J,
              c = ed;
            switch (X) {
              case 8:
                (Bd(), (o = 6));
                break a;
              case 3:
              case 2:
              case 9:
              case 6:
                jo.current === null && (t = !0);
                var l = X;
                if (((X = 0), (ed = null), $d(e, s, c, l), n && nd)) {
                  o = 0;
                  break a;
                }
                break;
              default:
                ((l = X), (X = 0), (ed = null), $d(e, s, c, l));
            }
          }
          (Jd(), (o = ad));
          break;
        } catch (t) {
          Hd(e, t);
        }
      while (1);
      return (
        t && e.shellSuspendCounter++,
        (_a = ga = null),
        (K = r),
        (j.H = i),
        (j.A = a),
        J === null && ((q = null), (Y = 0), Ti()),
        o
      );
    }
    function Jd() {
      for (; J !== null;) Zd(J);
    }
    function Yd(e, t) {
      var n = K;
      K |= 2;
      var r = Wd(),
        a = Gd();
      q !== e || Y !== t
        ? ((_d = null), (gd = Ve() + 500), Vd(e, t))
        : (nd = ct(e, t));
      a: do
        try {
          if (X !== 0 && J !== null) {
            t = J;
            var o = ed;
            b: switch (X) {
              case 1:
                ((X = 0), (ed = null), $d(e, t, o, 1));
                break;
              case 2:
              case 9:
                if ($a(o)) {
                  ((X = 0), (ed = null), Qd(t));
                  break;
                }
                ((t = function () {
                  ((X !== 2 && X !== 9) || q !== e || (X = 7), Ef(e));
                }),
                  o.then(t, t));
                break a;
              case 3:
                X = 7;
                break a;
              case 4:
                X = 5;
                break a;
              case 7:
                $a(o)
                  ? ((X = 0), (ed = null), Qd(t))
                  : ((X = 0), (ed = null), $d(e, t, o, 7));
                break;
              case 5:
                var s = null;
                switch (J.tag) {
                  case 26:
                    s = J.memoizedState;
                  case 5:
                  case 27:
                    var c = J;
                    if (s ? Ym(s) : c.stateNode.complete) {
                      ((X = 0), (ed = null));
                      var l = c.sibling;
                      if (l !== null) J = l;
                      else {
                        var u = c.return;
                        u === null ? (J = null) : ((J = u), ef(u));
                      }
                      break b;
                    }
                }
                ((X = 0), (ed = null), $d(e, t, o, 5));
                break;
              case 6:
                ((X = 0), (ed = null), $d(e, t, o, 6));
                break;
              case 8:
                (Bd(), (ad = 6));
                break a;
              default:
                throw Error(i(462));
            }
          }
          Xd();
          break;
        } catch (t) {
          Hd(e, t);
        }
      while (1);
      return (
        (_a = ga = null),
        (j.H = r),
        (j.A = a),
        (K = n),
        J === null ? ((q = null), (Y = 0), Ti(), ad) : 0
      );
    }
    function Xd() {
      for (; J !== null && !ze();) Zd(J);
    }
    function Zd(e) {
      var t = pl(e.alternate, e, id);
      ((e.memoizedProps = e.pendingProps), t === null ? ef(e) : (J = t));
    }
    function Qd(e) {
      var t = e,
        n = t.alternate;
      switch (t.tag) {
        case 15:
        case 0:
          t = qc(n, t, t.pendingProps, t.type, void 0, Y);
          break;
        case 11:
          t = qc(n, t, t.pendingProps, t.type.render, t.ref, Y);
          break;
        case 5:
          as(t);
          var r = t;
          r === ia &&
            (B
              ? (ua(r), r.tag === 5 && r.stateNode != null && (z = r.stateNode))
              : (ua(r), (B = !0)));
        default:
          (xl(n, t), (t = J = Ii(t, id)), (t = pl(n, t, id)));
      }
      ((e.memoizedProps = e.pendingProps), t === null ? ef(e) : (J = t));
    }
    function $d(e, t, n, r) {
      ((_a = ga = null), as(t), (ao = null), (oo = 0));
      var i = t.return;
      try {
        if (Mc(e, i, t, n, Y)) {
          ((ad = 1), Dc(e, Ui(n, e.current)), (J = null));
          return;
        }
      } catch (t) {
        if (i !== null) throw ((J = i), t);
        ((ad = 1), Dc(e, Ui(n, e.current)), (J = null));
        return;
      }
      t.flags & 32768
        ? (B || r === 1
            ? (e = !0)
            : nd || Y & 536870912
              ? (e = !1)
              : ((td = e = !0),
                (r === 2 || r === 9 || r === 3 || r === 6) &&
                  ((r = jo.current),
                  r !== null && r.tag === 13 && (r.flags |= 16384))),
          tf(t, e))
        : ef(t);
    }
    function ef(e) {
      var t = e;
      do {
        if (t.flags & 32768) {
          tf(t, td);
          return;
        }
        e = t.return;
        var n = yl(t.alternate, t, id);
        if (n !== null) {
          J = n;
          return;
        }
        if (((t = t.sibling), t !== null)) {
          J = t;
          return;
        }
        J = t = e;
      } while (t !== null);
      ad === 0 && (ad = 5);
    }
    function tf(e, t) {
      do {
        var n = bl(e.alternate, e);
        if (n !== null) {
          ((n.flags &= 32767), (J = n));
          return;
        }
        if (
          ((n = e.return),
          n !== null &&
            ((n.flags |= 32768), (n.subtreeFlags = 0), (n.deletions = null)),
          !t && ((e = e.sibling), e !== null))
        ) {
          J = e;
          return;
        }
        J = e = n;
      } while (e !== null);
      ((ad = 6), (J = null));
    }
    function nf(e, t, n, r, a, o, s, c, l, u, d, f) {
      e.cancelPendingCommit = null;
      do df();
      while (yd !== 0);
      if (K & 6) throw Error(i(327));
      if (t !== null) {
        if (t === e.current) throw Error(i(177));
        (e === q && ((J = q = null), (Y = 0)),
          (xd = t),
          (bd = e),
          (Sd = n),
          (wd = a),
          (Td = r),
          rf(e, t, n, s, c, l, f));
      }
    }
    function rf(e, t, n, r, i, a, o) {
      var s = t.lanes | t.childLanes;
      if (
        ((Cd = s),
        (s |= wi),
        mt(e, n, s, r, i, a),
        (Dd = null),
        (n & 335544064) === n
          ? ((Od = Ia(e)), (r = 10262))
          : ((Od = null), (r = 10256)),
        (t.subtreeFlags & r) !== 0 || (t.flags & r) !== 0
          ? ((e.callbackNode = null),
            (e.callbackPriority = 0),
            yf(Ge, function () {
              return (ff(), null);
            }))
          : ((e.callbackNode = null), (e.callbackPriority = 0)),
        (Bl = !1),
        (r = !!(t.flags & 13878)),
        t.subtreeFlags & 13878 || r)
      ) {
        ((r = j.T), (j.T = null), (i = M.p), (M.p = 2), (a = K), (K |= 4));
        try {
          mu(e, t, n);
        } finally {
          ((K = a), (M.p = i), (j.T = r));
        }
      }
      ((yd = 1),
        Bl
          ? (Ed = Mp(
              o,
              e.containerInfo,
              Od,
              sf,
              cf,
              of,
              lf,
              ff,
              af,
              null,
              null,
            ))
          : (sf(), cf(), lf()));
    }
    function af(e) {
      if (yd !== 0) {
        var t = bd.onRecoverableError;
        t(e, { componentStack: null });
      }
    }
    function of() {
      yd === 3 && ((yd = 0), Pu(xd, bd), (yd = 4));
    }
    function sf() {
      if (yd === 1) {
        yd = 0;
        var e = bd,
          t = xd,
          n = Sd,
          r = !!(t.flags & 13878);
        if (t.subtreeFlags & 13878 || r) {
          ((r = j.T), (j.T = null));
          var i = M.p;
          M.p = 2;
          var a = K;
          K |= 4;
          try {
            ((du = fu = !1), Au(t, e, n), (n = cp));
            var o = Jr(e.containerInfo),
              s = n.focusedElem,
              c = n.selectionRange;
            if (
              o !== s &&
              s &&
              s.ownerDocument &&
              qr(s.ownerDocument.documentElement, s)
            ) {
              if (c !== null && Yr(s)) {
                var l = c.start,
                  u = c.end;
                if ((u === void 0 && (u = l), `selectionStart` in s))
                  ((s.selectionStart = l),
                    (s.selectionEnd = Math.min(u, s.value.length)));
                else {
                  var d = s.ownerDocument || document,
                    f = (d && d.defaultView) || window;
                  if (f.getSelection) {
                    var p = f.getSelection(),
                      m = s.textContent.length,
                      h = Math.min(c.start, m),
                      g = c.end === void 0 ? h : Math.min(c.end, m);
                    !p.extend && h > g && ((o = g), (g = h), (h = o));
                    var _ = Kr(s, h),
                      v = Kr(s, g);
                    if (
                      _ &&
                      v &&
                      (p.rangeCount !== 1 ||
                        p.anchorNode !== _.node ||
                        p.anchorOffset !== _.offset ||
                        p.focusNode !== v.node ||
                        p.focusOffset !== v.offset)
                    ) {
                      var y = d.createRange();
                      (y.setStart(_.node, _.offset),
                        p.removeAllRanges(),
                        h > g
                          ? (p.addRange(y), p.extend(v.node, v.offset))
                          : (y.setEnd(v.node, v.offset), p.addRange(y)));
                    }
                  }
                }
              }
              for (d = [], p = s; (p = p.parentNode);)
                p.nodeType === 1 &&
                  d.push({ element: p, left: p.scrollLeft, top: p.scrollTop });
              for (
                typeof s.focus == `function` && s.focus(), s = 0;
                s < d.length;
                s++
              ) {
                var b = d[s];
                ((b.element.scrollLeft = b.left),
                  (b.element.scrollTop = b.top));
              }
            }
            ((gh = !!sp), (cp = sp = null));
          } finally {
            ((K = a), (M.p = i), (j.T = r));
          }
        }
        ((e.current = t), (yd = 2));
      }
    }
    function cf() {
      if (yd === 2) {
        yd = 0;
        var e = bd,
          t = xd,
          n = !!(t.flags & 8772);
        if (t.subtreeFlags & 8772 || n) {
          ((n = j.T), (j.T = null));
          var r = M.p;
          M.p = 2;
          var i = K;
          K |= 4;
          try {
            gu(e, t.alternate, t);
          } finally {
            ((K = i), (M.p = r), (j.T = n));
          }
        }
        yd = 3;
      }
    }
    function lf() {
      if (yd === 4 || yd === 3) {
        yd = 0;
        var e = Ed;
        ((Ed = null), Be());
        var t = bd,
          n = xd,
          r = Sd,
          i = Td,
          a = (r & 335544064) === r ? 10262 : 10256;
        if (
          ((n.subtreeFlags & a) !== 0 || (n.flags & a) !== 0
            ? (yd = 5)
            : ((yd = 0), (xd = bd = null), uf(t, t.pendingLanes)),
          (a = t.pendingLanes),
          a === 0 && (vd = null),
          yt(r),
          (n = n.stateNode),
          Ze && typeof Ze.onCommitFiberRoot == `function`)
        )
          try {
            Ze.onCommitFiberRoot(Xe, n, void 0, (n.current.flags & 128) == 128);
          } catch {}
        if (i !== null) {
          ((n = j.T), (a = M.p), (M.p = 2), (j.T = null));
          try {
            for (var o = t.onRecoverableError, s = 0; s < i.length; s++) {
              var c = i[s];
              o(c.value, { componentStack: c.stack });
            }
          } finally {
            ((j.T = n), (M.p = a));
          }
        }
        if (
          ((i = Dd),
          (o = Od),
          (Od = null),
          i !== null && ((Dd = null), o === null && (o = []), e !== null))
        )
          for (c = 0; c < i.length; c++)
            ((n = (0, i[c])(o)), n !== void 0 && e.finished.finally(n));
        (Sd & 3 && df(),
          Ef(t),
          (a = t.pendingLanes),
          r & 261930 && a & 42
            ? t === Ad
              ? kd++
              : ((kd = 0), (Ad = t))
            : ((kd = 0), (Ad = null)),
          Df(0, !1));
      }
    }
    function uf(e, t) {
      (e.pooledCacheLanes &= t) === 0 &&
        ((t = e.pooledCache), t != null && ((e.pooledCache = null), Na(t)));
    }
    function df() {
      return (
        Ed !== null && (Ed.skipTransition(), (Ed = null)),
        sf(),
        cf(),
        lf(),
        ff()
      );
    }
    function ff() {
      if (yd !== 5) return !1;
      var e = bd,
        t = Cd;
      Cd = 0;
      var n = yt(Sd),
        r = j.T,
        a = M.p;
      try {
        ((M.p = 32 > n ? 32 : n), (j.T = null), (n = wd), (wd = null));
        var o = bd,
          s = Sd;
        if (((yd = 0), (xd = bd = null), (Sd = 0), K & 6)) throw Error(i(331));
        var c = K;
        if (
          ((K |= 4),
          Yu(o.current),
          Vu(o, o.current, s, n),
          (K = c),
          Df(0, !1),
          Ze && typeof Ze.onPostCommitFiberRoot == `function`)
        )
          try {
            Ze.onPostCommitFiberRoot(Xe, o);
          } catch {}
        return !0;
      } finally {
        ((M.p = a), (j.T = r), uf(e, t));
      }
    }
    function pf(e, t, n) {
      ((t = Ui(n, t)),
        (t = kc(e.stateNode, t, 2)),
        (e = vo(e, t, 2)),
        e !== null && (pt(e, 2), Ef(e)));
    }
    function Z(e, t, n) {
      if (e.tag === 3) pf(e, e, n);
      else
        for (; t !== null;) {
          if (t.tag === 3) {
            pf(t, e, n);
            break;
          }
          if (t.tag === 1) {
            var r = t.stateNode;
            if (
              typeof t.type.getDerivedStateFromError == `function` ||
              (typeof r.componentDidCatch == `function` &&
                (vd === null || !vd.has(r)))
            ) {
              ((e = Ui(n, e)),
                (n = Ac(2)),
                (r = vo(t, n, 2)),
                r !== null && (jc(n, r, t, e), pt(r, 2), Ef(r)));
              break;
            }
          }
          t = t.return;
        }
    }
    function mf(e, t, n) {
      var r = e.pingCache;
      if (r === null) {
        r = e.pingCache = new $u();
        var i = new Set();
        r.set(t, i);
      } else ((i = r.get(t)), i === void 0 && ((i = new Set()), r.set(t, i)));
      i.has(n) ||
        ((rd = !0), i.add(n), (e = hf.bind(null, e, t, n)), t.then(e, e));
    }
    function hf(e, t, n) {
      var r = e.pingCache;
      (r !== null && r.delete(t),
        (e.pingedLanes |= e.suspendedLanes & n),
        (e.warmLanes &= ~n),
        q === e &&
          (Y & n) === n &&
          (ad === 4 || (ad === 3 && (Y & 62914560) === Y && 300 > Ve() - md)
            ? K & 2
              ? (cd |= n)
              : Vd(e, 0)
            : (cd |= n),
          ud === Y && (ud = 0)),
        Ef(e));
    }
    function gf(e, t) {
      (t === 0 && (t = dt()), (e = Oi(e, t)), e !== null && (pt(e, t), Ef(e)));
    }
    function _f(e) {
      var t = e.memoizedState,
        n = 0;
      (t !== null && (n = t.retryLane), gf(e, n));
    }
    function vf(e, t) {
      var n = 0;
      switch (e.tag) {
        case 31:
        case 13:
          var r = e.stateNode,
            a = e.memoizedState;
          a !== null && (n = a.retryLane);
          break;
        case 19:
          r = e.stateNode;
          break;
        case 22:
          r = e.stateNode._retryCache;
          break;
        default:
          throw Error(i(314));
      }
      (r !== null && r.delete(t), gf(e, n));
    }
    function yf(e, t) {
      return Le(e, t);
    }
    var bf = null,
      xf = null,
      Sf = !1,
      Cf = !1,
      wf = !1,
      Tf = 0;
    function Ef(e) {
      (e !== xf &&
        e.next === null &&
        (xf === null ? (bf = xf = e) : (xf = xf.next = e)),
        (Cf = !0),
        Sf || ((Sf = !0), Nf()));
    }
    function Df(e, t) {
      if (!wf && Cf) {
        wf = !0;
        do
          for (var n = !1, r = bf; r !== null;) {
            if (!t) {
              if (e !== 0) {
                var i = r.pendingLanes;
                if (i === 0) var a = 0;
                else {
                  var o = r.suspendedLanes,
                    s = r.pingedLanes;
                  ((a = (1 << (31 - $e(42 | e) + 1)) - 1),
                    (a &= i & ~(o & ~s)),
                    (a = a & 201326741 ? (a & 201326741) | 1 : a ? a | 2 : 0));
                }
                a !== 0 && ((n = !0), Mf(r, a));
              } else
                ((a = Y),
                  (a = st(
                    r,
                    r === q ? a : 0,
                    r.cancelPendingCommit !== null || r.timeoutHandle !== -1,
                  )),
                  !(a & 3) || ct(r, a) || ((n = !0), Mf(r, a)));
            }
            r = r.next;
          }
        while (n);
        wf = !1;
      }
    }
    function Of() {
      kf();
    }
    function kf() {
      Cf = Sf = !1;
      var e = 0;
      Tf !== 0 && hp() && (e = Tf);
      for (var t = Ve(), n = null, r = bf; r !== null;) {
        var i = r.next,
          a = Af(r, t);
        (a === 0
          ? ((r.next = null),
            n === null ? (bf = i) : (n.next = i),
            i === null && (xf = n))
          : ((n = r), (e !== 0 || a & 3) && (Cf = !0)),
          (r = i));
      }
      ((yd !== 0 && yd !== 5) || Df(e, !1), Tf !== 0 && (Tf = 0));
    }
    function Af(e, t) {
      for (
        var n = e.suspendedLanes,
          r = e.pingedLanes,
          i = e.expirationTimes,
          a = e.pendingLanes & -62914561;
        0 < a;
      ) {
        var o = 31 - $e(a),
          s = 1 << o,
          c = i[o];
        (c === -1
          ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ut(s, t))
          : c <= t && (e.expiredLanes |= s),
          (a &= ~s));
      }
      if (
        ((t = q),
        (n = Y),
        (n = st(
          e,
          e === t ? n : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        (r = e.callbackNode),
        n === 0 ||
          (e === t && (X === 2 || X === 9)) ||
          e.cancelPendingCommit !== null)
      )
        return (
          r !== null && r !== null && Re(r),
          (e.callbackNode = null),
          (e.callbackPriority = 0)
        );
      if (!(n & 3) || ct(e, n)) {
        if (((t = n & -n), t === e.callbackPriority)) return t;
        switch ((r !== null && Re(r), yt(n))) {
          case 2:
          case 8:
            n = We;
            break;
          case 32:
            n = Ge;
            break;
          case 268435456:
            n = qe;
            break;
          default:
            n = Ge;
        }
        return (
          (r = jf.bind(null, e)),
          (n = Le(n, r)),
          (e.callbackPriority = t),
          (e.callbackNode = n),
          t
        );
      }
      return (
        r !== null && r !== null && Re(r),
        (e.callbackPriority = 2),
        (e.callbackNode = null),
        2
      );
    }
    function jf(e, t) {
      if (yd !== 0 && yd !== 5)
        return ((e.callbackNode = null), (e.callbackPriority = 0), null);
      var n = e.callbackNode;
      if (df() && e.callbackNode !== n) return null;
      var r = Y;
      return (
        (r = st(
          e,
          e === q ? r : 0,
          e.cancelPendingCommit !== null || e.timeoutHandle !== -1,
        )),
        r === 0
          ? null
          : (Fd(e, r, t),
            Af(e, Ve()),
            e.callbackNode != null && e.callbackNode === n
              ? jf.bind(null, e)
              : null)
      );
    }
    function Mf(e, t) {
      if (df()) return null;
      Fd(e, t, !0);
    }
    function Nf() {
      bp(function () {
        K & 6 ? Le(Ue, Of) : kf();
      });
    }
    function Pf() {
      if (Tf === 0) {
        var e = za;
        (e === 0 && ((e = rt), (rt <<= 1), !(rt & 261888) && (rt = 256)),
          (Tf = e));
      }
      return Tf;
    }
    function Ff(e) {
      return e == null || typeof e == `symbol` || typeof e == `boolean`
        ? null
        : typeof e == `function`
          ? e
          : vn(e);
    }
    function If(e, t, n, r, i) {
      if (t === `submit` && n && n.stateNode === i) {
        var a = Ff((i[wt] || null).action),
          o = r.submitter;
        o &&
          ((t = (t = o[wt] || null)
            ? Ff(t.formAction)
            : o.getAttribute(`formAction`)),
          t !== null && ((a = t), (o = null)));
        var s = new Bn(`action`, `action`, null, r, i);
        e.push({
          event: s,
          listeners: [
            {
              instance: null,
              listener: function () {
                if (r.defaultPrevented) {
                  if (Tf !== 0) {
                    var e = new FormData(i, o);
                    tc(
                      n,
                      { pending: !0, data: e, method: i.method, action: a },
                      null,
                      e,
                    );
                  }
                } else
                  typeof a == `function` &&
                    (s.preventDefault(),
                    (e = new FormData(i, o)),
                    tc(
                      n,
                      { pending: !0, data: e, method: i.method, action: a },
                      a,
                      e,
                    ));
              },
              currentTarget: i,
            },
          ],
        });
      }
    }
    for (var Lf = 0; Lf < hi.length; Lf++) {
      var Rf = hi[Lf];
      gi(Rf.toLowerCase(), `on` + (Rf[0].toUpperCase() + Rf.slice(1)));
    }
    (gi(si, `onAnimationEnd`),
      gi(ci, `onAnimationIteration`),
      gi(li, `onAnimationStart`),
      gi(`dblclick`, `onDoubleClick`),
      gi(`focusin`, `onFocus`),
      gi(`focusout`, `onBlur`),
      gi(ui, `onTransitionRun`),
      gi(di, `onTransitionStart`),
      gi(fi, `onTransitionCancel`),
      gi(pi, `onTransitionEnd`),
      Ht(`onMouseEnter`, [`mouseout`, `mouseover`]),
      Ht(`onMouseLeave`, [`mouseout`, `mouseover`]),
      Ht(`onPointerEnter`, [`pointerout`, `pointerover`]),
      Ht(`onPointerLeave`, [`pointerout`, `pointerover`]),
      Vt(
        `onChange`,
        `change click focusin focusout input keydown keyup selectionchange`.split(
          ` `,
        ),
      ),
      Vt(
        `onSelect`,
        `focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange`.split(
          ` `,
        ),
      ),
      Vt(`onBeforeInput`, [`compositionend`, `keypress`, `textInput`, `paste`]),
      Vt(
        `onCompositionEnd`,
        `compositionend focusout keydown keypress keyup mousedown`.split(` `),
      ),
      Vt(
        `onCompositionStart`,
        `compositionstart focusout keydown keypress keyup mousedown`.split(` `),
      ),
      Vt(
        `onCompositionUpdate`,
        `compositionupdate focusout keydown keypress keyup mousedown`.split(
          ` `,
        ),
      ));
    var zf =
        `abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting`.split(
          ` `,
        ),
      Bf = new Set(
        `beforetoggle cancel close invalid load scroll scrollend toggle`
          .split(` `)
          .concat(zf),
      );
    function Vf(e, t) {
      t = !!(t & 4);
      for (var n = 0; n < e.length; n++) {
        var r = e[n],
          i = r.event;
        r = r.listeners;
        a: {
          var a = void 0;
          if (t)
            for (var o = r.length - 1; 0 <= o; o--) {
              var s = r[o],
                c = s.instance,
                l = s.currentTarget;
              if (((s = s.listener), c !== a && i.isPropagationStopped()))
                break a;
              ((a = s), (i.currentTarget = l));
              try {
                a(i);
              } catch (e) {
                xi(e);
              }
              ((i.currentTarget = null), (a = c));
            }
          else
            for (o = 0; o < r.length; o++) {
              if (
                ((s = r[o]),
                (c = s.instance),
                (l = s.currentTarget),
                (s = s.listener),
                c !== a && i.isPropagationStopped())
              )
                break a;
              ((a = s), (i.currentTarget = l));
              try {
                a(i);
              } catch (e) {
                xi(e);
              }
              ((i.currentTarget = null), (a = c));
            }
        }
      }
    }
    function Q(e, t) {
      var n = t[Et];
      n === void 0 && (n = t[Et] = new Set());
      var r = e + `__bubble`;
      n.has(r) || (Gf(t, e, 2, !1), n.add(r));
    }
    function Hf(e, t, n) {
      var r = 0;
      (t && (r |= 4), Gf(n, e, r, t));
    }
    var Uf = `_reactListening` + Math.random().toString(36).slice(2);
    function Wf(e) {
      if (!e[Uf]) {
        ((e[Uf] = !0),
          zt.forEach(function (t) {
            t !== `selectionchange` &&
              (Bf.has(t) || Hf(t, !1, e), Hf(t, !0, e));
          }));
        var t = e.nodeType === 9 ? e : e.ownerDocument;
        t === null || t[Uf] || ((t[Uf] = !0), Hf(`selectionchange`, !1, t));
      }
    }
    function Gf(e, t, n, r) {
      switch (Ch(t)) {
        case 2:
          var i = _h;
          break;
        case 8:
          i = vh;
          break;
        default:
          i = yh;
      }
      ((n = i.bind(null, t, n, e)),
        (i = void 0),
        !kn ||
          (t !== `touchstart` && t !== `touchmove` && t !== `wheel`) ||
          (i = !0),
        r
          ? i === void 0
            ? e.addEventListener(t, n, !0)
            : e.addEventListener(t, n, { capture: !0, passive: i })
          : i === void 0
            ? e.addEventListener(t, n, !1)
            : e.addEventListener(t, n, { passive: i }));
    }
    function Kf(e, t, n, r, i) {
      var a = r;
      if (!(t & 1) && !(t & 2) && r !== null)
        a: for (;;) {
          if (r === null) return;
          var s = r.tag;
          if (s === 3 || s === 4) {
            var c = r.stateNode.containerInfo;
            if (c === i) break;
            if (s === 4)
              for (s = r.return; s !== null;) {
                var l = s.tag;
                if ((l === 3 || l === 4) && s.stateNode.containerInfo === i)
                  return;
                s = s.return;
              }
            for (; c !== null;) {
              if (((s = Nt(c)), s === null)) return;
              if (((l = s.tag), l === 5 || l === 6 || l === 26 || l === 27)) {
                r = a = s;
                continue a;
              }
              c = c.parentNode;
            }
          }
          r = r.return;
        }
      En(function () {
        var r = a,
          i = xn(n),
          s = [];
        a: {
          var c = mi.get(e);
          if (c !== void 0) {
            var l = Bn,
              u = e;
            switch (e) {
              case `keypress`:
                if (Fn(n) === 0) break a;
              case `keydown`:
              case `keyup`:
                l = ir;
                break;
              case `focusin`:
                ((u = `focus`), (l = Yn));
                break;
              case `focusout`:
                ((u = `blur`), (l = Yn));
                break;
              case `beforeblur`:
              case `afterblur`:
                l = Yn;
                break;
              case `click`:
                if (n.button === 2) break a;
              case `auxclick`:
              case `dblclick`:
              case `mousedown`:
              case `mousemove`:
              case `mouseup`:
              case `mouseout`:
              case `mouseover`:
              case `contextmenu`:
                l = qn;
                break;
              case `drag`:
              case `dragend`:
              case `dragenter`:
              case `dragexit`:
              case `dragleave`:
              case `dragover`:
              case `dragstart`:
              case `drop`:
                l = Jn;
                break;
              case `touchcancel`:
              case `touchend`:
              case `touchmove`:
              case `touchstart`:
                l = sr;
                break;
              case si:
              case ci:
              case li:
                l = Xn;
                break;
              case pi:
                l = cr;
                break;
              case `scroll`:
              case `scrollend`:
                l = Hn;
                break;
              case `wheel`:
                l = lr;
                break;
              case `copy`:
              case `cut`:
              case `paste`:
                l = Zn;
                break;
              case `gotpointercapture`:
              case `lostpointercapture`:
              case `pointercancel`:
              case `pointerdown`:
              case `pointermove`:
              case `pointerout`:
              case `pointerover`:
              case `pointerup`:
                l = ar;
                break;
              case `submit`:
                l = or;
                break;
              case `toggle`:
              case `beforetoggle`:
                l = ur;
            }
            var d = !!(t & 4),
              f = !d && (e === `scroll` || e === `scrollend`),
              p = d ? (c === null ? null : c + `Capture`) : c;
            d = [];
            for (var m = r, h; m !== null;) {
              var g = m;
              if (
                ((h = g.stateNode),
                (g = g.tag),
                (g !== 5 && g !== 26 && g !== 27) ||
                  h === null ||
                  p === null ||
                  ((g = Dn(m, p)), g != null && d.push(qf(m, g, h))),
                f)
              )
                break;
              m = m.return;
            }
            0 < d.length &&
              ((c = new l(c, u, null, n, i)),
              s.push({ event: c, listeners: d }));
          }
        }
        if (!(t & 7)) {
          a: {
            if (
              ((l = e === `mouseover` || e === `pointerover`),
              (c = e === `mouseout` || e === `pointerout`),
              l &&
                n !== bn &&
                (u = n.relatedTarget || n.fromElement) &&
                (Nt(u) || u[Tt]))
            )
              break a;
            (c || l) &&
              ((u =
                i.window === i
                  ? i
                  : (l = i.ownerDocument)
                    ? l.defaultView || l.parentWindow
                    : window),
              c
                ? ((l = n.relatedTarget || n.toElement),
                  (c = r),
                  (l = l ? Nt(l) : null),
                  l !== null &&
                    ((f = o(l)),
                    (d = l.tag),
                    l !== f || (d !== 5 && d !== 27 && d !== 6)) &&
                    (l = null))
                : ((c = null), (l = r)),
              c !== l &&
                ((d = qn),
                (g = `onMouseLeave`),
                (p = `onMouseEnter`),
                (m = `mouse`),
                (e === `pointerout` || e === `pointerover`) &&
                  ((d = ar),
                  (g = `onPointerLeave`),
                  (p = `onPointerEnter`),
                  (m = `pointer`)),
                (f = c == null ? u : Ft(c)),
                (h = l == null ? u : Ft(l)),
                (u = new d(g, m + `leave`, c, n, i)),
                (u.target = f),
                (u.relatedTarget = h),
                (g = null),
                Nt(i) === r &&
                  ((d = new d(p, m + `enter`, l, n, i)),
                  (d.target = h),
                  (d.relatedTarget = f),
                  (g = d)),
                (f = g),
                (d = c && l ? te(c, l, Yf) : null),
                c !== null && Xf(s, u, c, d, !1),
                l !== null && f !== null && Xf(s, f, l, d, !0)));
          }
          a: {
            if (
              ((c = r ? Ft(r) : window),
              (l = c.nodeName && c.nodeName.toLowerCase()),
              l === `select` || (l === `input` && c.type === `file`))
            )
              var _ = Ar;
            else if (wr(c)) {
              if (jr) _ = Br;
              else {
                _ = Rr;
                var v = Lr;
              }
            } else
              ((l = c.nodeName),
                !l ||
                l.toLowerCase() !== `input` ||
                (c.type !== `checkbox` && c.type !== `radio`)
                  ? r && hn(r.elementType) && (_ = Ar)
                  : (_ = zr));
            if ((_ &&= _(e, r))) {
              Tr(s, _, n, i);
              break a;
            }
            v && v(e, c, r);
          }
          switch (((v = r ? Ft(r) : window), e)) {
            case `focusin`:
              (wr(v) || v.contentEditable === `true`) &&
                ((Zr = v), (Qr = r), ($r = null));
              break;
            case `focusout`:
              $r = Qr = Zr = null;
              break;
            case `mousedown`:
              ei = !0;
              break;
            case `contextmenu`:
            case `mouseup`:
            case `dragend`:
              ((ei = !1), ti(s, n, i));
              break;
            case `selectionchange`:
              if (Xr) break;
            case `keydown`:
            case `keyup`:
              ti(s, n, i);
          }
          var y;
          if (fr)
            b: {
              switch (e) {
                case `compositionstart`:
                  var b = `onCompositionStart`;
                  break b;
                case `compositionend`:
                  b = `onCompositionEnd`;
                  break b;
                case `compositionupdate`:
                  b = `onCompositionUpdate`;
                  break b;
              }
              b = void 0;
            }
          else
            br
              ? vr(e, n) && (b = `onCompositionEnd`)
              : e === `keydown` &&
                n.keyCode === 229 &&
                (b = `onCompositionStart`);
          (b &&
            (hr &&
              n.locale !== `ko` &&
              (br || b !== `onCompositionStart`
                ? b === `onCompositionEnd` && br && (y = Pn())
                : ((jn = i),
                  (Mn = `value` in jn ? jn.value : jn.textContent),
                  (br = !0))),
            (v = Jf(r, b)),
            0 < v.length &&
              ((b = new Qn(b, e, null, n, i)),
              s.push({ event: b, listeners: v }),
              y ? (b.data = y) : ((y = yr(n)), y !== null && (b.data = y)))),
            (y = mr ? xr(e, n) : Sr(e, n)) &&
              ((b = Jf(r, `onBeforeInput`)),
              0 < b.length &&
                ((v = new Qn(`onBeforeInput`, `beforeinput`, null, n, i)),
                s.push({ event: v, listeners: b }),
                (v.data = y))),
            If(s, e, r, n, i));
        }
        Vf(s, t);
      });
    }
    function qf(e, t, n) {
      return { instance: e, listener: t, currentTarget: n };
    }
    function Jf(e, t) {
      for (var n = t + `Capture`, r = []; e !== null;) {
        var i = e,
          a = i.stateNode;
        if (
          ((i = i.tag),
          (i !== 5 && i !== 26 && i !== 27) ||
            a === null ||
            ((i = Dn(e, n)),
            i != null && r.unshift(qf(e, i, a)),
            (i = Dn(e, t)),
            i != null && r.push(qf(e, i, a))),
          e.tag === 3)
        )
          return r;
        e = e.return;
      }
      return [];
    }
    function Yf(e) {
      if (e === null) return null;
      do e = e.return;
      while (e && e.tag !== 5 && e.tag !== 27);
      return e || null;
    }
    function Xf(e, t, n, r, i) {
      for (var a = t._reactName, o = []; n !== null && n !== r;) {
        var s = n,
          c = s.alternate,
          l = s.stateNode;
        if (((s = s.tag), c !== null && c === r)) break;
        ((s !== 5 && s !== 26 && s !== 27) ||
          l === null ||
          ((c = l),
          i
            ? ((l = Dn(n, a)), l != null && o.unshift(qf(n, l, c)))
            : i || ((l = Dn(n, a)), l != null && o.push(qf(n, l, c)))),
          (n = n.return));
      }
      o.length !== 0 && e.push({ event: t, listeners: o });
    }
    var Zf = /\r\n?/g,
      Qf = /\u0000|\uFFFD/g;
    function $f(e) {
      return (typeof e == `string` ? e : `` + e)
        .replace(
          Zf,
          `
`,
        )
        .replace(Qf, ``);
    }
    function ep(e, t) {
      return ((t = $f(t)), $f(e) === t);
    }
    function $(e, t, n, r, a, o) {
      switch (n) {
        case `children`:
          if (typeof r == `string`)
            t === `body` || (t === `textarea` && r === ``) || dn(e, r);
          else if (typeof r == `number` || typeof r == `bigint`)
            t !== `body` && dn(e, `` + r);
          else return;
          break;
        case `className`:
          Yt(e, `class`, r);
          break;
        case `tabIndex`:
          Yt(e, `tabindex`, r);
          break;
        case `dir`:
        case `role`:
        case `viewBox`:
        case `width`:
        case `height`:
          Yt(e, n, r);
          break;
        case `style`:
          mn(e, r, o);
          return;
        case `data`:
          if (t !== `object`) {
            Yt(e, `data`, r);
            break;
          }
        case `src`:
        case `href`:
          if (r === `` && (t !== `a` || n !== `href`)) {
            e.removeAttribute(n);
            break;
          }
          if (
            r == null ||
            typeof r == `function` ||
            typeof r == `symbol` ||
            typeof r == `boolean`
          ) {
            e.removeAttribute(n);
            break;
          }
          ((r = vn(r)), e.setAttribute(n, r));
          break;
        case `action`:
        case `formAction`:
          if (typeof r == `function`) {
            e.setAttribute(
              n,
              `javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')`,
            );
            break;
          }
          if (
            (typeof o == `function` &&
              (n === `formAction`
                ? (t !== `input` && $(e, t, `name`, a.name, a, null),
                  $(e, t, `formEncType`, a.formEncType, a, null),
                  $(e, t, `formMethod`, a.formMethod, a, null),
                  $(e, t, `formTarget`, a.formTarget, a, null))
                : ($(e, t, `encType`, a.encType, a, null),
                  $(e, t, `method`, a.method, a, null),
                  $(e, t, `target`, a.target, a, null))),
            r == null || typeof r == `symbol` || typeof r == `boolean`)
          ) {
            e.removeAttribute(n);
            break;
          }
          ((r = vn(r)), e.setAttribute(n, r));
          break;
        case `onClick`:
          r != null && (e.onclick = yn);
          return;
        case `onScroll`:
          r != null && Q(`scroll`, e);
          return;
        case `onScrollEnd`:
          r != null && Q(`scrollend`, e);
          return;
        case `dangerouslySetInnerHTML`:
          if (r != null) {
            if (typeof r != `object` || !(`__html` in r)) throw Error(i(61));
            if (((n = r.__html), n != null)) {
              if (a.children != null) throw Error(i(60));
              o?.__html !== n && (e.innerHTML = n);
            }
          }
          break;
        case `multiple`:
          e.multiple = r && typeof r != `function` && typeof r != `symbol`;
          break;
        case `muted`:
          e.muted = r && typeof r != `function` && typeof r != `symbol`;
          break;
        case `suppressContentEditableWarning`:
        case `suppressHydrationWarning`:
        case `defaultValue`:
        case `defaultChecked`:
        case `innerHTML`:
        case `ref`:
          break;
        case `autoFocus`:
          break;
        case `xlinkHref`:
          if (
            r == null ||
            typeof r == `function` ||
            typeof r == `boolean` ||
            typeof r == `symbol`
          ) {
            e.removeAttribute(`xlink:href`);
            break;
          }
          ((n = vn(r)),
            e.setAttributeNS(`http://www.w3.org/1999/xlink`, `xlink:href`, n));
          break;
        case `contentEditable`:
        case `spellCheck`:
        case `draggable`:
        case `value`:
        case `autoReverse`:
        case `externalResourcesRequired`:
        case `focusable`:
        case `preserveAlpha`:
          r != null && typeof r != `function` && typeof r != `symbol`
            ? e.setAttribute(n, r)
            : e.removeAttribute(n);
          break;
        case `inert`:
        case `allowFullScreen`:
        case `async`:
        case `autoPlay`:
        case `controls`:
        case `credentialless`:
        case `default`:
        case `defer`:
        case `disabled`:
        case `disablePictureInPicture`:
        case `disableRemotePlayback`:
        case `formNoValidate`:
        case `hidden`:
        case `loop`:
        case `noModule`:
        case `noValidate`:
        case `open`:
        case `playsInline`:
        case `readOnly`:
        case `required`:
        case `reversed`:
        case `scoped`:
        case `seamless`:
        case `itemScope`:
          r && typeof r != `function` && typeof r != `symbol`
            ? e.setAttribute(n, ``)
            : e.removeAttribute(n);
          break;
        case `capture`:
        case `download`:
          !0 === r
            ? e.setAttribute(n, ``)
            : !1 !== r &&
                r != null &&
                typeof r != `function` &&
                typeof r != `symbol`
              ? e.setAttribute(n, r)
              : e.removeAttribute(n);
          break;
        case `cols`:
        case `rows`:
        case `size`:
        case `span`:
          r != null &&
          typeof r != `function` &&
          typeof r != `symbol` &&
          !isNaN(r) &&
          1 <= r
            ? e.setAttribute(n, r)
            : e.removeAttribute(n);
          break;
        case `rowSpan`:
        case `start`:
          r == null ||
          typeof r == `function` ||
          typeof r == `symbol` ||
          isNaN(r)
            ? e.removeAttribute(n)
            : e.setAttribute(n, r);
          break;
        case `popover`:
          (Q(`beforetoggle`, e), Q(`toggle`, e), Jt(e, `popover`, r));
          break;
        case `xlinkActuate`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:actuate`, r);
          break;
        case `xlinkArcrole`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:arcrole`, r);
          break;
        case `xlinkRole`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:role`, r);
          break;
        case `xlinkShow`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:show`, r);
          break;
        case `xlinkTitle`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:title`, r);
          break;
        case `xlinkType`:
          Xt(e, `http://www.w3.org/1999/xlink`, `xlink:type`, r);
          break;
        case `xmlBase`:
          Xt(e, `http://www.w3.org/XML/1998/namespace`, `xml:base`, r);
          break;
        case `xmlLang`:
          Xt(e, `http://www.w3.org/XML/1998/namespace`, `xml:lang`, r);
          break;
        case `xmlSpace`:
          Xt(e, `http://www.w3.org/XML/1998/namespace`, `xml:space`, r);
          break;
        case `is`:
          Jt(e, `is`, r);
          break;
        case `innerText`:
        case `textContent`:
          return;
        default:
          if (
            !(2 < n.length) ||
            (n[0] !== `o` && n[0] !== `O`) ||
            (n[1] !== `n` && n[1] !== `N`)
          )
            ((n = gn.get(n) || n), Jt(e, n, r));
          else return;
      }
      R = !0;
    }
    function tp(e, t, n, r, a, o) {
      switch (n) {
        case `style`:
          mn(e, r, o);
          return;
        case `dangerouslySetInnerHTML`:
          if (r != null) {
            if (typeof r != `object` || !(`__html` in r)) throw Error(i(61));
            if (((n = r.__html), n != null)) {
              if (a.children != null) throw Error(i(60));
              o?.__html !== n && (e.innerHTML = n);
            }
          }
          break;
        case `children`:
          if (typeof r == `string`) dn(e, r);
          else if (typeof r == `number` || typeof r == `bigint`) dn(e, `` + r);
          else return;
          break;
        case `onScroll`:
          r != null && Q(`scroll`, e);
          return;
        case `onScrollEnd`:
          r != null && Q(`scrollend`, e);
          return;
        case `onClick`:
          r != null && (e.onclick = yn);
          return;
        case `suppressContentEditableWarning`:
        case `suppressHydrationWarning`:
        case `innerHTML`:
        case `ref`:
          return;
        case `innerText`:
        case `textContent`:
          return;
        default:
          if (!Bt.hasOwnProperty(n))
            a: {
              if (
                n[0] === `o` &&
                n[1] === `n` &&
                ((a = n.endsWith(`Capture`)),
                (o = n.slice(2, a ? n.length - 7 : void 0)),
                (t = e[wt] || null),
                (t = t == null ? null : t[n]),
                typeof t == `function` && e.removeEventListener(o, t, a),
                typeof r == `function`)
              ) {
                (typeof t != `function` &&
                  t !== null &&
                  (n in e
                    ? (e[n] = null)
                    : e.hasAttribute(n) && e.removeAttribute(n)),
                  e.addEventListener(o, r, a));
                break a;
              }
              ((R = !0),
                n in e
                  ? (e[n] = r)
                  : !0 === r
                    ? e.setAttribute(n, ``)
                    : Jt(e, n, r));
            }
          return;
      }
      R = !0;
    }
    function np(e, t, n) {
      switch (t) {
        case `div`:
        case `span`:
        case `svg`:
        case `path`:
        case `a`:
        case `g`:
        case `p`:
        case `li`:
          break;
        case `img`:
          (Q(`error`, e), Q(`load`, e));
          var r = !1,
            a = !1,
            o;
          for (o in n)
            if (n.hasOwnProperty(o)) {
              var s = n[o];
              if (s != null)
                switch (o) {
                  case `src`:
                    r = !0;
                    break;
                  case `srcSet`:
                    a = !0;
                    break;
                  case `children`:
                  case `dangerouslySetInnerHTML`:
                    throw Error(i(137, t));
                  default:
                    $(e, t, o, s, n, null);
                }
            }
          (a && $(e, t, `srcSet`, n.srcSet, n, null),
            r && $(e, t, `src`, n.src, n, null));
          return;
        case `input`:
          Q(`invalid`, e);
          var c = (o = s = a = null),
            l = null,
            u = null;
          for (r in n)
            if (n.hasOwnProperty(r)) {
              var d = n[r];
              if (d != null)
                switch (r) {
                  case `name`:
                    a = d;
                    break;
                  case `type`:
                    s = d;
                    break;
                  case `checked`:
                    l = d;
                    break;
                  case `defaultChecked`:
                    u = d;
                    break;
                  case `value`:
                    o = d;
                    break;
                  case `defaultValue`:
                    c = d;
                    break;
                  case `children`:
                  case `dangerouslySetInnerHTML`:
                    if (d != null) throw Error(i(137, t));
                    break;
                  default:
                    $(e, t, r, d, n, null);
                }
            }
          on(e, o, c, l, u, s, a, !1);
          return;
        case `select`:
          for (a in (Q(`invalid`, e), (r = s = o = null), n))
            if (n.hasOwnProperty(a) && ((c = n[a]), c != null))
              switch (a) {
                case `value`:
                  o = c;
                  break;
                case `defaultValue`:
                  s = c;
                  break;
                case `multiple`:
                  r = c;
                default:
                  $(e, t, a, c, n, null);
              }
          ((t = o),
            (n = s),
            (e.multiple = !!r),
            t == null ? n != null && cn(e, !!r, n, !0) : cn(e, !!r, t, !1));
          return;
        case `textarea`:
          for (s in (Q(`invalid`, e), (o = a = r = null), n))
            if (n.hasOwnProperty(s) && ((c = n[s]), c != null))
              switch (s) {
                case `value`:
                  r = c;
                  break;
                case `defaultValue`:
                  a = c;
                  break;
                case `children`:
                  o = c;
                  break;
                case `dangerouslySetInnerHTML`:
                  if (c != null) throw Error(i(91));
                  break;
                default:
                  $(e, t, s, c, n, null);
              }
          un(e, r, a, o);
          return;
        case `option`:
          for (l in n)
            if (n.hasOwnProperty(l) && ((r = n[l]), r != null))
              switch (l) {
                case `selected`:
                  e.selected =
                    r && typeof r != `function` && typeof r != `symbol`;
                  break;
                default:
                  $(e, t, l, r, n, null);
              }
          return;
        case `dialog`:
          (Q(`beforetoggle`, e), Q(`toggle`, e), Q(`cancel`, e), Q(`close`, e));
          break;
        case `iframe`:
        case `object`:
          Q(`load`, e);
          break;
        case `video`:
        case `audio`:
          for (r = 0; r < zf.length; r++) Q(zf[r], e);
          break;
        case `image`:
          (Q(`error`, e), Q(`load`, e));
          break;
        case `details`:
          Q(`toggle`, e);
          break;
        case `embed`:
        case `source`:
        case `link`:
          (Q(`error`, e), Q(`load`, e));
        case `area`:
        case `base`:
        case `br`:
        case `col`:
        case `hr`:
        case `keygen`:
        case `meta`:
        case `param`:
        case `track`:
        case `wbr`:
        case `menuitem`:
          for (u in n)
            if (n.hasOwnProperty(u) && ((r = n[u]), r != null))
              switch (u) {
                case `children`:
                case `dangerouslySetInnerHTML`:
                  throw Error(i(137, t));
                default:
                  $(e, t, u, r, n, null);
              }
          return;
        default:
          if (hn(t)) {
            for (d in n)
              n.hasOwnProperty(d) &&
                ((r = n[d]), r !== void 0 && tp(e, t, d, r, n, void 0));
            return;
          }
      }
      for (c in n)
        n.hasOwnProperty(c) &&
          ((r = n[c]), r != null && $(e, t, c, r, n, null));
    }
    var rp = {};
    function ip(e, t, n, r) {
      switch (t) {
        case `div`:
        case `span`:
        case `svg`:
        case `path`:
        case `a`:
        case `g`:
        case `p`:
        case `li`:
          break;
        case `input`:
          var a = null,
            o = null,
            s = null,
            c = null,
            l = null,
            u = null,
            d = null;
          for (m in n) {
            var f = n[m];
            if (n.hasOwnProperty(m) && f != null)
              switch (m) {
                case `checked`:
                  break;
                case `value`:
                  break;
                case `defaultValue`:
                  l = f;
                default:
                  r.hasOwnProperty(m) || $(e, t, m, null, r, f);
              }
          }
          for (var p in r) {
            var m = r[p];
            if (((f = n[p]), r.hasOwnProperty(p) && (m != null || f != null)))
              switch (p) {
                case `type`:
                  (m !== f && (R = !0), (o = m));
                  break;
                case `name`:
                  (m !== f && (R = !0), (a = m));
                  break;
                case `checked`:
                  (m !== f && (R = !0), (u = m));
                  break;
                case `defaultChecked`:
                  (m !== f && (R = !0), (d = m));
                  break;
                case `value`:
                  (m !== f && (R = !0), (s = m));
                  break;
                case `defaultValue`:
                  (m !== f && (R = !0), (c = m));
                  break;
                case `children`:
                case `dangerouslySetInnerHTML`:
                  if (m != null) throw Error(i(137, t));
                  break;
                default:
                  m !== f && $(e, t, p, m, r, f);
              }
          }
          an(e, s, c, l, u, d, o, a);
          return;
        case `select`:
          for (o in ((m = s = c = p = null), n))
            if (((l = n[o]), n.hasOwnProperty(o) && l != null))
              switch (o) {
                case `value`:
                  break;
                case `multiple`:
                  m = l;
                default:
                  r.hasOwnProperty(o) || $(e, t, o, null, r, l);
              }
          for (a in r)
            if (
              ((o = r[a]),
              (l = n[a]),
              r.hasOwnProperty(a) && (o != null || l != null))
            )
              switch (a) {
                case `value`:
                  (o !== l && (R = !0), (p = o));
                  break;
                case `defaultValue`:
                  (o !== l && (R = !0), (c = o));
                  break;
                case `multiple`:
                  (o !== l && (R = !0), (s = o));
                default:
                  o !== l && $(e, t, a, o, r, l);
              }
          ((t = c),
            (n = s),
            (r = m),
            p == null
              ? !!r != !!n &&
                (t == null ? cn(e, !!n, n ? [] : ``, !1) : cn(e, !!n, t, !0))
              : cn(e, !!n, p, !1));
          return;
        case `textarea`:
          for (c in ((m = p = null), n))
            if (
              ((a = n[c]),
              n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c))
            )
              switch (c) {
                case `value`:
                  break;
                case `children`:
                  break;
                default:
                  $(e, t, c, null, r, a);
              }
          for (s in r)
            if (
              ((a = r[s]),
              (o = n[s]),
              r.hasOwnProperty(s) && (a != null || o != null))
            )
              switch (s) {
                case `value`:
                  (a !== o && (R = !0), (p = a));
                  break;
                case `defaultValue`:
                  (a !== o && (R = !0), (m = a));
                  break;
                case `children`:
                  break;
                case `dangerouslySetInnerHTML`:
                  if (a != null) throw Error(i(91));
                  break;
                default:
                  a !== o && $(e, t, s, a, r, o);
              }
          ln(e, p, m);
          return;
        case `option`:
          for (var h in n)
            if (
              ((p = n[h]),
              n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h))
            )
              switch (h) {
                case `selected`:
                  e.selected = !1;
                  break;
                default:
                  $(e, t, h, null, r, p);
              }
          for (l in r)
            if (
              ((p = r[l]),
              (m = n[l]),
              r.hasOwnProperty(l) && p !== m && (p != null || m != null))
            )
              switch (l) {
                case `selected`:
                  (p !== m && (R = !0),
                    (e.selected =
                      p && typeof p != `function` && typeof p != `symbol`));
                  break;
                default:
                  $(e, t, l, p, r, m);
              }
          return;
        case `img`:
        case `link`:
        case `area`:
        case `base`:
        case `br`:
        case `col`:
        case `embed`:
        case `hr`:
        case `keygen`:
        case `meta`:
        case `param`:
        case `source`:
        case `track`:
        case `wbr`:
        case `menuitem`:
          for (var g in n)
            ((p = n[g]),
              n.hasOwnProperty(g) &&
                p != null &&
                !r.hasOwnProperty(g) &&
                $(e, t, g, null, r, p));
          for (u in r)
            if (
              ((p = r[u]),
              (m = n[u]),
              r.hasOwnProperty(u) && p !== m && (p != null || m != null))
            )
              switch (u) {
                case `children`:
                case `dangerouslySetInnerHTML`:
                  if (p != null) throw Error(i(137, t));
                  break;
                default:
                  $(e, t, u, p, r, m);
              }
          return;
        default:
          if (hn(t)) {
            for (var _ in n)
              ((p = n[_]),
                n.hasOwnProperty(_) &&
                  p !== void 0 &&
                  !r.hasOwnProperty(_) &&
                  tp(e, t, _, void 0, r, p));
            for (d in r)
              ((p = r[d]),
                (m = n[d]),
                !r.hasOwnProperty(d) ||
                  p === m ||
                  (p === void 0 && m === void 0) ||
                  tp(e, t, d, p, r, m));
            return;
          }
      }
      for (var v in n)
        ((p = n[v]),
          n.hasOwnProperty(v) &&
            p != null &&
            !r.hasOwnProperty(v) &&
            $(e, t, v, null, r, p));
      for (f in r)
        ((p = r[f]),
          (m = n[f]),
          !r.hasOwnProperty(f) ||
            p === m ||
            (p == null && m == null) ||
            $(e, t, f, p, r, m));
    }
    function ap(e) {
      switch (e) {
        case `css`:
        case `script`:
        case `font`:
        case `img`:
        case `image`:
        case `input`:
        case `link`:
          return !0;
        default:
          return !1;
      }
    }
    function op() {
      if (typeof performance.getEntriesByType == `function`) {
        for (
          var e = 0, t = 0, n = performance.getEntriesByType(`resource`), r = 0;
          r < n.length;
          r++
        ) {
          var i = n[r],
            a = i.transferSize,
            o = i.initiatorType,
            s = i.duration;
          if (a && s && ap(o)) {
            for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
              var c = n[r],
                l = c.startTime;
              if (l > s) break;
              var u = c.transferSize,
                d = c.initiatorType;
              u &&
                ap(d) &&
                ((c = c.responseEnd),
                (o += u * (c < s ? 1 : (s - l) / (c - l))));
            }
            if ((--r, (t += (8 * (a + o)) / (i.duration / 1e3)), e++, 10 < e))
              break;
          }
        }
        if (0 < e) return t / e / 1e6;
      }
      return navigator.connection &&
        ((e = navigator.connection.downlink), typeof e == `number`)
        ? e
        : 5;
    }
    var sp = null,
      cp = null;
    function lp(e) {
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    function up(e) {
      switch (e) {
        case `http://www.w3.org/2000/svg`:
          return 1;
        case `http://www.w3.org/1998/Math/MathML`:
          return 2;
        default:
          return 0;
      }
    }
    function dp(e, t) {
      if (e === 0)
        switch (t) {
          case `svg`:
            return 1;
          case `math`:
            return 2;
          default:
            return 0;
        }
      return e === 1 && t === `foreignObject` ? 0 : e;
    }
    function fp(e, t, n, r) {
      return (
        (n = lp(n).createElement(e)),
        (n[Ct] = r),
        (n[wt] = t),
        np(n, e, t),
        Lt(n),
        n
      );
    }
    function pp(e, t) {
      return (
        e === `textarea` ||
        e === `noscript` ||
        typeof t.children == `string` ||
        typeof t.children == `number` ||
        typeof t.children == `bigint` ||
        (typeof t.dangerouslySetInnerHTML == `object` &&
          t.dangerouslySetInnerHTML !== null &&
          t.dangerouslySetInnerHTML.__html != null)
      );
    }
    var mp = null;
    function hp() {
      var e = window.event;
      return e && e.type === `popstate`
        ? e !== mp && ((mp = e), !0)
        : ((mp = null), !1);
    }
    var gp = typeof setTimeout == `function` ? setTimeout : void 0,
      _p = typeof clearTimeout == `function` ? clearTimeout : void 0,
      vp = typeof Promise == `function` ? Promise : void 0,
      yp =
        typeof requestAnimationFrame == `function` ? requestAnimationFrame : gp,
      bp =
        typeof queueMicrotask == `function`
          ? queueMicrotask
          : vp === void 0
            ? gp
            : function (e) {
                return vp.resolve(null).then(e).catch(xp);
              };
    function xp(e) {
      setTimeout(function () {
        throw e;
      });
    }
    function Sp(e) {
      return e === `head`;
    }
    function Cp(e, t) {
      var n = t,
        r = 0;
      do {
        var i = n.nextSibling;
        if ((e.removeChild(n), i && i.nodeType === 8)) {
          if (((n = i.data), n === `/$` || n === `/&`)) {
            if (r === 0) {
              (e.removeChild(i), Hh(t));
              return;
            }
            r--;
          } else if (
            n === `$` ||
            n === `$?` ||
            n === `$~` ||
            n === `$!` ||
            n === `&`
          )
            r++;
          else if (n === `html`) _m(e.ownerDocument.documentElement);
          else if (n === `head`) {
            ((n = e.ownerDocument.head), _m(n));
            for (var a = n.firstChild; a;) {
              var o = a.nextSibling,
                s = a.nodeName;
              (a[At] ||
                s === `SCRIPT` ||
                s === `STYLE` ||
                (s === `LINK` && a.rel.toLowerCase() === `stylesheet`) ||
                n.removeChild(a),
                (a = o));
            }
          } else n === `body` && _m(e.ownerDocument.body);
        }
        n = i;
      } while (n);
      Hh(t);
    }
    function wp(e, t) {
      var n = e;
      e = 0;
      do {
        var r = n.nextSibling;
        if (
          (n.nodeType === 1
            ? t
              ? ((n._stashedDisplay = n.style.display),
                (n.style.display = `none`))
              : ((n.style.display = n._stashedDisplay || ``),
                n.getAttribute(`style`) === `` && n.removeAttribute(`style`))
            : n.nodeType === 3 &&
              (t
                ? ((n._stashedText = n.nodeValue), (n.nodeValue = ``))
                : (n.nodeValue = n._stashedText || ``)),
          r && r.nodeType === 8)
        ) {
          if (((n = r.data), n === `/$`)) {
            if (e === 0) break;
            e--;
          } else (n !== `$` && n !== `$?` && n !== `$~` && n !== `$!`) || e++;
        }
        n = r;
      } while (n);
    }
    function Tp(e, t, n) {
      if (
        ((t = CSS.escape(t) === t ? t : `r-` + btoa(t).replace(/=/g, ``)),
        (e.style.viewTransitionName = t),
        n != null && (e.style.viewTransitionClass = n),
        (n = getComputedStyle(e)),
        n.display === `inline`)
      ) {
        if (((t = e.getClientRects()), t.length === 1)) var r = 1;
        else
          for (var i = (r = 0); i < t.length; i++) {
            var a = t[i];
            0 < a.width && 0 < a.height && r++;
          }
        r === 1 &&
          ((e = e.style),
          (e.display = t.length === 1 ? `inline-block` : `block`),
          (e.marginTop = `-` + n.paddingTop),
          (e.marginBottom = `-` + n.paddingBottom));
      }
    }
    function Ep(e, t) {
      ((e = e.style), (t = t.style));
      var n =
        t == null
          ? null
          : t.hasOwnProperty(`viewTransitionName`)
            ? t.viewTransitionName
            : t.hasOwnProperty(`view-transition-name`)
              ? t[`view-transition-name`]
              : null;
      ((e.viewTransitionName =
        n == null || typeof n == `boolean` ? `` : (`` + n).trim()),
        (n =
          t == null
            ? null
            : t.hasOwnProperty(`viewTransitionClass`)
              ? t.viewTransitionClass
              : t.hasOwnProperty(`view-transition-class`)
                ? t[`view-transition-class`]
                : null),
        (e.viewTransitionClass =
          n == null || typeof n == `boolean` ? `` : (`` + n).trim()),
        e.display === `inline-block` &&
          (t == null
            ? (e.display = e.margin = ``)
            : ((n = t.display),
              (e.display = n == null || typeof n == `boolean` ? `` : n),
              (n = t.margin),
              n == null
                ? ((n = t.hasOwnProperty(`marginTop`)
                    ? t.marginTop
                    : t[`margin-top`]),
                  (e.marginTop = n == null || typeof n == `boolean` ? `` : n),
                  (t = t.hasOwnProperty(`marginBottom`)
                    ? t.marginBottom
                    : t[`margin-bottom`]),
                  (e.marginBottom =
                    t == null || typeof t == `boolean` ? `` : t))
                : (e.margin = n))));
    }
    function Dp(e, t, n) {
      return (
        (n = n.ownerDocument.defaultView),
        {
          rect: e,
          abs: t.position === `absolute` || t.position === `fixed`,
          clip:
            t.clipPath !== `none` ||
            t.overflow !== `visible` ||
            t.filter !== `none` ||
            t.mask !== `none` ||
            t.mask !== `none` ||
            t.borderRadius !== `0px`,
          view:
            0 <= e.bottom &&
            0 <= e.right &&
            e.top <= n.innerHeight &&
            e.left <= n.innerWidth,
        }
      );
    }
    function Op(e) {
      return Dp(e.getBoundingClientRect(), getComputedStyle(e), e);
    }
    function kp(e) {
      var t = e.getBoundingClientRect();
      t = new DOMRect(t.x + 2e4, t.y + 2e4, t.width, t.height);
      var n = getComputedStyle(e);
      return Dp(t, n, e);
    }
    function Ap(e) {
      return e.documentElement.clientHeight;
    }
    function jp(e) {
      (this.addEventListener(`load`, e), this.addEventListener(`error`, e));
    }
    function Mp(e, t, n, r, i, a, o, s, c) {
      var l = t.nodeType === 9 ? t : t.ownerDocument;
      try {
        var u = l.startViewTransition({
          update: function () {
            var t = l.defaultView,
              n = t.navigation && t.navigation.transition,
              o = l.fonts.status;
            r();
            var s = [];
            if (
              (o === `loaded` &&
                (Ap(l), l.fonts.status === `loading` && s.push(l.fonts.ready)),
              (o = s.length),
              e !== null)
            )
              for (var c = e.suspenseyImages, u = 0, d = 0; d < c.length; d++) {
                var f = c[d];
                if (!f.complete) {
                  var p = f.getBoundingClientRect();
                  if (
                    0 < p.bottom &&
                    0 < p.right &&
                    p.top < t.innerHeight &&
                    p.left < t.innerWidth
                  ) {
                    if (((u += Xm(f)), u > $m)) {
                      s.length = o;
                      break;
                    }
                    ((f = new Promise(jp.bind(f))), s.push(f));
                  }
                }
              }
            if (0 < s.length)
              return (
                (t = Promise.race([
                  Promise.all(s),
                  new Promise(function (e) {
                    return setTimeout(e, 500);
                  }),
                ]).then(i, i)),
                (n ? Promise.allSettled([n.finished, t]) : t).then(a, a)
              );
            if ((i(), n)) return n.finished.then(a, a);
            a();
          },
          types: n,
        });
        l.__reactViewTransition = u;
        var d = [];
        return (
          u.ready.then(
            function () {
              for (
                var e = l.documentElement.getAnimations({ subtree: !0 }), t = 0;
                t < e.length;
                t++
              ) {
                var n = e[t],
                  r = n.effect,
                  i = r.pseudoElement;
                if (i != null && i.startsWith(`::view-transition`)) {
                  (d.push(n), (n = r.getKeyframes()));
                  for (var a = (i = void 0), s = !0, c = 0; c < n.length; c++) {
                    var u = n[c],
                      f = u.width;
                    if (i === void 0) i = f;
                    else if (i !== f) {
                      s = !1;
                      break;
                    }
                    if (((f = u.height), a === void 0)) a = f;
                    else if (a !== f) {
                      s = !1;
                      break;
                    }
                    (delete u.width,
                      delete u.height,
                      u.transform === `none` && delete u.transform);
                  }
                  s &&
                    i !== void 0 &&
                    a !== void 0 &&
                    (r.setKeyframes(n),
                    (s = getComputedStyle(r.target, r.pseudoElement)),
                    s.width !== i || s.height !== a) &&
                    ((s = n[0]),
                    (s.width = i),
                    (s.height = a),
                    (s = n[n.length - 1]),
                    (s.width = i),
                    (s.height = a),
                    r.setKeyframes(n));
                }
              }
              o();
            },
            function (e) {
              l.__reactViewTransition === u && (l.__reactViewTransition = null);
              try {
                if (typeof e == `object` && e)
                  switch (e.name) {
                    case `InvalidStateError`:
                      (e.message ===
                        `View transition was skipped because document visibility state is hidden.` ||
                        e.message ===
                          `Skipping view transition because document visibility state has become hidden.` ||
                        e.message ===
                          `Skipping view transition because viewport size changed.` ||
                        e.message ===
                          `Transition was aborted because of invalid state`) &&
                        (e = null);
                  }
                e !== null && c(e);
              } finally {
                (r(), i(), o());
              }
            },
          ),
          u.finished.finally(function () {
            for (var e = 0; e < d.length; e++) d[e].cancel();
            (l.__reactViewTransition === u && (l.__reactViewTransition = null),
              s());
          }),
          u
        );
      } catch {
        return (r(), i(), o(), null);
      }
    }
    function Np(e, t) {
      ((this._scope = document.documentElement),
        (this._selector = `::view-transition-` + e + `(` + t + `)`));
    }
    ((Np.prototype.animate = function (e, t) {
      return (
        (t = typeof t == `number` ? { duration: t } : T({}, t)),
        (t.pseudoElement = this._selector),
        this._scope.animate(e, t)
      );
    }),
      (Np.prototype.getAnimations = function () {
        for (
          var e = this._scope,
            t = this._selector,
            n = e.getAnimations({ subtree: !0 }),
            r = [],
            i = 0;
          i < n.length;
          i++
        ) {
          var a = n[i].effect;
          a !== null && a.target === e && a.pseudoElement === t && r.push(n[i]);
        }
        return r;
      }),
      (Np.prototype.getComputedStyle = function () {
        return getComputedStyle(this._scope, this._selector);
      }));
    function Pp(e) {
      return {
        name: e,
        group: new Np(`group`, e),
        imagePair: new Np(`image-pair`, e),
        old: new Np(`old`, e),
        new: new Np(`new`, e),
      };
    }
    function Fp(e) {
      ((this._fragmentFiber = e),
        (this._observers = this._eventListeners = null));
    }
    Fp.prototype.addEventListener = function (e, t, n) {
      var r = null,
        i = null;
      if (!(
        n != null &&
        typeof n != `boolean` &&
        ((r = n.signal || null), r !== null && r.aborted)
      )) {
        this._eventListeners === null && (this._eventListeners = []);
        var a = this._eventListeners;
        if (Bp(a, e, t, n) === -1) {
          var o = this,
            s = t;
          (n != null &&
            typeof n != `boolean` &&
            !0 === n.once &&
            (s = function (r) {
              (o.removeEventListener(e, t, n),
                typeof t == `function` ? t.call(this, r) : t.handleEvent(r));
            }),
            r !== null &&
              ((i = o.removeEventListener.bind(o, e, t, n)),
              r.addEventListener(`abort`, i, { once: !0 }),
              (i = r.removeEventListener.bind(r, `abort`, i))),
            (r = Rp(n)),
            a.push({
              type: e,
              listener: t,
              optionsOrUseCapture: n,
              attachedListener: s,
              cleanup: i,
            }),
            h(this._fragmentFiber.child, !1, Ip, e, s, r));
        }
        this._eventListeners = a;
      }
    };
    function Ip(e, t, n, r) {
      return (b(e).addEventListener(t, n, r), !1);
    }
    Fp.prototype.removeEventListener = function (e, t, n) {
      var r = this._eventListeners;
      if (r !== null && ((t = Bp(r, e, t, n)), t !== -1)) {
        var i = r[t];
        n = i.attachedListener;
        var a = i.cleanup;
        ((i = Rp(i.optionsOrUseCapture)),
          h(this._fragmentFiber.child, !1, Lp, e, n, i),
          r.splice(t, 1),
          a !== null && a());
      }
    };
    function Lp(e, t, n, r) {
      return (b(e).removeEventListener(t, n, r), !1);
    }
    function Rp(e) {
      return e != null &&
        typeof e != `boolean` &&
        (!0 === e.once || e.signal instanceof AbortSignal)
        ? { capture: e.capture, passive: e.passive }
        : e;
    }
    function zp(e) {
      return e == null
        ? `c=0`
        : typeof e == `boolean`
          ? `c=` + (e ? `1` : `0`)
          : `c=` + (e.capture ? `1` : `0`);
    }
    function Bp(e, t, n, r) {
      if (e.length === 0) return -1;
      r = zp(r);
      for (var i = 0; i < e.length; i++) {
        var a = e[i];
        if (a.type === t && a.listener === n && zp(a.optionsOrUseCapture) === r)
          return i;
      }
      return -1;
    }
    ((Fp.prototype.dispatchEvent = function (e) {
      var t = g(this._fragmentFiber);
      if (t === null) return !0;
      t = b(t);
      var n = this._eventListeners;
      if ((n !== null && 0 < n.length) || !e.bubbles) {
        var r =
          t.nodeType === 9 ? t.createComment(``) : document.createTextNode(``);
        if (n)
          for (var i = 0; i < n.length; i++) {
            var a = n[i];
            r.addEventListener(
              a.type,
              a.attachedListener,
              Rp(a.optionsOrUseCapture),
            );
          }
        if ((t.appendChild(r), (e = r.dispatchEvent(e)), n))
          for (i = 0; i < n.length; i++)
            ((a = n[i]),
              r.removeEventListener(
                a.type,
                a.attachedListener,
                Rp(a.optionsOrUseCapture),
              ));
        return (t.removeChild(r), e);
      }
      return t.dispatchEvent(e);
    }),
      (Fp.prototype.focus = function (e) {
        h(this._fragmentFiber.child, !0, Vp, e, void 0, void 0);
      }));
    function Vp(e, t) {
      return e.tag !== 6 && ((e = b(e)), pm(e, t));
    }
    Fp.prototype.focusLast = function (e) {
      var t = [];
      h(this._fragmentFiber.child, !0, Hp, t, void 0, void 0);
      for (var n = t.length - 1; 0 <= n && !Vp(t[n], e); n--);
    };
    function Hp(e, t) {
      return (t.push(e), !1);
    }
    Fp.prototype.blur = function () {
      var e = g(this._fragmentFiber);
      e !== null &&
        ((e = b(e)),
        (e = lp(e).activeElement),
        e !== null && h(this._fragmentFiber.child, !1, Up, e, void 0, void 0));
    };
    function Up(e, t) {
      return (
        e.tag !== 6 &&
        ((e = b(e)), e === t || e.contains(t) ? (t.blur(), !0) : !1)
      );
    }
    Fp.prototype.observeUsing = function (e) {
      (this._observers === null && (this._observers = new Set()),
        this._observers.add(e),
        h(this._fragmentFiber.child, !1, Wp, e, void 0, void 0));
    };
    function Wp(e, t) {
      return e.tag !== 6 && ((e = b(e)), t.observe(e), !1);
    }
    Fp.prototype.unobserveUsing = function (e) {
      var t = this._observers;
      if (t !== null && t.has(e)) {
        (t.delete(e), h(this._fragmentFiber.child, !1, Gp, e, void 0, void 0));
        for (var n = (t = 0); n < Kp.length; n++) {
          var r = Kp[n];
          r.fragmentInstance === this && r.observer === e
            ? e.unobserve(r.instance)
            : (Kp[t++] = r);
        }
        Kp.length = t;
      }
    };
    function Gp(e, t) {
      return e.tag !== 6 && ((e = b(e)), t.unobserve(e), !1);
    }
    var Kp = [],
      qp = !1;
    function Jp(e, t, n) {
      (Kp.push({ fragmentInstance: e, observer: t, instance: n }),
        qp ||
          ((qp = !0),
          mm(function () {
            qp = !1;
            var e = Kp;
            Kp = [];
            for (var t = 0; t < e.length; t++) {
              var n = e[t];
              n.observer.unobserve(n.instance);
            }
          })));
    }
    Fp.prototype.getClientRects = function () {
      var e = [];
      return (h(this._fragmentFiber.child, !1, Yp, e, void 0, void 0), e);
    };
    function Yp(e, t) {
      if (e.tag === 6) {
        e = e.stateNode;
        var n = e.ownerDocument.createRange();
        (n.selectNodeContents(e), t.push.apply(t, n.getClientRects()));
      } else ((e = b(e)), t.push.apply(t, e.getClientRects()));
      return !1;
    }
    ((Fp.prototype.getRootNode = function (e) {
      var t = g(this._fragmentFiber);
      return t === null ? this : b(t).getRootNode(e);
    }),
      (Fp.prototype.compareDocumentPosition = function (e) {
        var t = g(this._fragmentFiber);
        if (t === null) return Node.DOCUMENT_POSITION_DISCONNECTED;
        var n = [];
        h(this._fragmentFiber.child, !1, Hp, n, void 0, void 0);
        var r = b(t);
        if (n.length === 0) {
          if (((n = r), _(this._fragmentFiber))) {
            a: {
              for (t = this._fragmentFiber.return; t !== null;) {
                if (t.tag === 4) {
                  t = t.stateNode.containerInfo;
                  break a;
                }
                if (t.tag === 3 || t.tag === 5 || t.tag === 27) break;
                t = t.return;
              }
              t = null;
            }
            t != null && (n = t);
          }
          t = this._fragmentFiber;
          var i = (r = n.compareDocumentPosition(e));
          return (
            n === e
              ? (i = Node.DOCUMENT_POSITION_CONTAINS)
              : r & Node.DOCUMENT_POSITION_CONTAINED_BY &&
                ((n = v(t)[1]),
                n === null
                  ? (i = Node.DOCUMENT_POSITION_PRECEDING)
                  : ((e = b(n).compareDocumentPosition(e)),
                    (i =
                      e === 0 || e & Node.DOCUMENT_POSITION_FOLLOWING
                        ? Node.DOCUMENT_POSITION_FOLLOWING
                        : Node.DOCUMENT_POSITION_PRECEDING))),
            (i |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC)
          );
        }
        ((t = b(n[0])), (i = b(n[n.length - 1])));
        var a = _(this._fragmentFiber) ? t.parentElement : r;
        if (a == null) return Node.DOCUMENT_POSITION_DISCONNECTED;
        ((r =
          a.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY),
          (a =
            a.compareDocumentPosition(i) &
            Node.DOCUMENT_POSITION_CONTAINED_BY));
        var o = t.compareDocumentPosition(e),
          s = i.compareDocumentPosition(e),
          c =
            o & Node.DOCUMENT_POSITION_CONTAINED_BY ||
            s & Node.DOCUMENT_POSITION_CONTAINED_BY;
        return (
          (s =
            r &&
            a &&
            o & Node.DOCUMENT_POSITION_FOLLOWING &&
            s & Node.DOCUMENT_POSITION_PRECEDING),
          (t =
            (r && t === e) || (a && i === e) || c || s
              ? Node.DOCUMENT_POSITION_CONTAINED_BY
              : (!r && t === e) || (!a && i === e)
                ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
                : o),
          t & Node.DOCUMENT_POSITION_DISCONNECTED ||
          t & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC ||
          Xp(t, this._fragmentFiber, n[0], n[n.length - 1], e)
            ? t
            : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
        );
      }));
    function Xp(e, t, n, r, i) {
      var a = Nt(i);
      if (e & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        if ((n = !!a))
          a: {
            for (; a !== null;) {
              if (a.tag === 7 && (a === t || a.alternate === t)) {
                n = !0;
                break a;
              }
              a = a.return;
            }
            n = !1;
          }
        return n;
      }
      if (e & Node.DOCUMENT_POSITION_CONTAINS) {
        if (a === null)
          return (
            (a = i.ownerDocument),
            i === a || i === a.documentElement || i === a.body
          );
        a: {
          for (a = t, t = g(t); a !== null;) {
            if (!(
              (a.tag !== 5 && a.tag !== 3 && a.tag !== 27) ||
              (a !== t && a.alternate !== t)
            )) {
              a = !0;
              break a;
            }
            a = a.return;
          }
          a = !1;
        }
        return a;
      }
      return e & Node.DOCUMENT_POSITION_PRECEDING
        ? ((t = !!a) &&
            !(t = a === n) &&
            ((t = te(n, a, w)),
            t === null
              ? (t = !1)
              : (h(t, !0, ee, a, n), (a = x), (x = null), (t = a !== null))),
          t)
        : e & Node.DOCUMENT_POSITION_FOLLOWING
          ? ((t = !!a) &&
              !(t = a === r) &&
              ((t = te(r, a, w)),
              t === null
                ? (t = !1)
                : (h(t, !0, C, a, r),
                  (a = x),
                  (S = x = null),
                  (t = a !== null))),
            t)
          : !1;
    }
    function Zp(e, t) {
      var n = e.ownerDocument.createRange();
      (n.selectNodeContents(e),
        (e = n.getBoundingClientRect()),
        window.scrollTo(
          window.scrollX + e.left,
          t
            ? window.scrollY + e.top
            : window.scrollY + e.bottom - window.innerHeight,
        ));
    }
    Fp.prototype.scrollIntoView = function (e) {
      if (typeof e == `object`) throw Error(i(566));
      var t = [];
      h(this._fragmentFiber.child, !1, Hp, t, void 0, void 0);
      var n = !1 !== e;
      if (t.length === 0) {
        var r = v(this._fragmentFiber);
        if (
          ((r = n ? r[1] || r[0] || g(this._fragmentFiber) : r[0] || r[1]),
          r === null)
        )
          return;
        if (r.tag === 6) {
          ((e = b(r)), Zp(e, n));
          return;
        }
        if (((r = b(r)), r.nodeType !== 9)) {
          if (r.nodeType === 11) {
            ((n = `host` in r ? r.host : null),
              n !== null && n.scrollIntoView(e));
            return;
          }
          r.scrollIntoView(e);
        }
      }
      for (r = n ? t.length - 1 : 0; r !== (n ? -1 : t.length);) {
        var a = t[r];
        (a.tag === 6 ? ((a = b(a)), Zp(a, n)) : b(a).scrollIntoView(e),
          (r += n ? -1 : 1));
      }
    };
    function Qp(e, t) {
      return ((e = b(e)), $p(e, t), !1);
    }
    function $p(e, t) {
      ((e.reactFragments ??= new Set()), e.reactFragments.add(t));
    }
    function em(e, t) {
      var n = t._eventListeners;
      if (n !== null)
        for (var r = 0; r < n.length; r++) {
          var i = n[r];
          e.addEventListener(
            i.type,
            i.attachedListener,
            Rp(i.optionsOrUseCapture),
          );
        }
      e.nodeType !== 3 &&
        ((n = t._observers),
        n !== null &&
          n.forEach(function (n) {
            for (var r = 0, i = 0; i < Kp.length; i++) {
              var a = Kp[i];
              (a.fragmentInstance !== t ||
                a.observer !== n ||
                a.instance !== e) &&
                (Kp[r++] = a);
            }
            ((Kp.length = r), n.observe(e));
          }),
        $p(e, t));
    }
    function tm(e, t) {
      var n = t._eventListeners;
      if (n !== null)
        for (var r = 0; r < n.length; r++) {
          var i = n[r];
          e.removeEventListener(
            i.type,
            i.attachedListener,
            Rp(i.optionsOrUseCapture),
          );
        }
      e.nodeType !== 3 &&
        ((n = t._observers),
        n !== null &&
          n.forEach(function (n) {
            typeof n.rootMargin == `string` ? Jp(t, n, e) : n.unobserve(e);
          }),
        e.reactFragments != null && e.reactFragments.delete(t));
    }
    function nm(e) {
      var t = e.firstChild;
      for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
        var n = t;
        switch (((t = t.nextSibling), n.nodeName)) {
          case `HTML`:
          case `HEAD`:
          case `BODY`:
            (nm(n), Mt(n));
            continue;
          case `SCRIPT`:
          case `STYLE`:
            continue;
          case `LINK`:
            if (n.rel.toLowerCase() === `stylesheet`) continue;
        }
        e.removeChild(n);
      }
    }
    function rm(e, t, n, r) {
      for (; e.nodeType === 1;) {
        var i = n;
        if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
          if (!r && (e.nodeName !== `INPUT` || e.type !== `hidden`)) break;
        } else if (!r) {
          if (t === `input` && e.type === `hidden`) {
            var a = i.name == null ? null : `` + i.name;
            if (i.type === `hidden` && e.getAttribute(`name`) === a) return e;
          } else return e;
        } else if (!e[At])
          switch (t) {
            case `meta`:
              if (!e.hasAttribute(`itemprop`)) break;
              return e;
            case `link`:
              if (
                ((a = e.getAttribute(`rel`)),
                (a === `stylesheet` && e.hasAttribute(`data-precedence`)) ||
                  a !== i.rel ||
                  e.getAttribute(`href`) !==
                    (i.href == null || i.href === `` ? null : i.href) ||
                  e.getAttribute(`crossorigin`) !==
                    (i.crossOrigin == null ? null : i.crossOrigin) ||
                  e.getAttribute(`title`) !==
                    (i.title == null ? null : i.title))
              )
                break;
              return e;
            case `style`:
              if (e.hasAttribute(`data-precedence`)) break;
              return e;
            case `script`:
              if (
                ((a = e.getAttribute(`src`)),
                (a !== (i.src == null ? null : i.src) ||
                  e.getAttribute(`type`) !== (i.type == null ? null : i.type) ||
                  e.getAttribute(`crossorigin`) !==
                    (i.crossOrigin == null ? null : i.crossOrigin)) &&
                  a &&
                  e.hasAttribute(`async`) &&
                  !e.hasAttribute(`itemprop`))
              )
                break;
              return e;
            default:
              return e;
          }
        if (((e = lm(e.nextSibling)), e === null)) break;
      }
      return null;
    }
    function im(e, t, n) {
      if (t === ``) return null;
      for (; e.nodeType !== 3;)
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== `INPUT` ||
            e.type !== `hidden`) &&
            !n) ||
          ((e = lm(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function am(e, t) {
      for (; e.nodeType !== 8;)
        if (
          ((e.nodeType !== 1 ||
            e.nodeName !== `INPUT` ||
            e.type !== `hidden`) &&
            !t) ||
          ((e = lm(e.nextSibling)), e === null)
        )
          return null;
      return e;
    }
    function om(e) {
      return e.data === `$?` || e.data === `$~`;
    }
    function sm(e) {
      return (
        e.data === `$!` ||
        (e.data === `$?` && e.ownerDocument.readyState !== `loading`)
      );
    }
    function cm(e, t) {
      var n = e.ownerDocument;
      if (e.data === `$~`) e._reactRetry = t;
      else if (e.data !== `$?` || n.readyState !== `loading`) t();
      else {
        var r = function () {
          (t(), n.removeEventListener(`DOMContentLoaded`, r));
        };
        (n.addEventListener(`DOMContentLoaded`, r), (e._reactRetry = r));
      }
    }
    function lm(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === 1 || t === 3) break;
        if (t === 8) {
          if (
            ((t = e.data),
            t === `$` ||
              t === `$!` ||
              t === `$?` ||
              t === `$~` ||
              t === `&` ||
              t === `F!` ||
              t === `F`)
          )
            break;
          if (t === `/$` || t === `/&`) return null;
        }
      }
      return e;
    }
    var um = null;
    function dm(e) {
      e = e.nextSibling;
      for (var t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === `/$` || n === `/&`) {
            if (t === 0) return lm(e.nextSibling);
            t--;
          } else
            (n !== `$` &&
              n !== `$!` &&
              n !== `$?` &&
              n !== `$~` &&
              n !== `&`) ||
              t++;
        }
        e = e.nextSibling;
      }
      return null;
    }
    function fm(e) {
      e = e.previousSibling;
      for (var t = 0; e;) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (
            n === `$` ||
            n === `$!` ||
            n === `$?` ||
            n === `$~` ||
            n === `&`
          ) {
            if (t === 0) return e;
            t--;
          } else (n !== `/$` && n !== `/&`) || t++;
        }
        e = e.previousSibling;
      }
      return null;
    }
    function pm(e, t) {
      function n() {
        r = !0;
      }
      if (e.ownerDocument.activeElement === e) return !0;
      var r = !1;
      try {
        (e.ownerDocument.addEventListener(`focus`, n, !0),
          (e.focus || HTMLElement.prototype.focus).call(e, t));
      } finally {
        e.ownerDocument.removeEventListener(`focus`, n, !0);
      }
      return r;
    }
    function mm(e) {
      yp(function () {
        yp(function (t) {
          return e(t);
        });
      });
    }
    function hm(e, t, n) {
      switch (((t = lp(n)), e)) {
        case `html`:
          if (((e = t.documentElement), !e)) throw Error(i(452));
          return e;
        case `head`:
          if (((e = t.head), !e)) throw Error(i(453));
          return e;
        case `body`:
          if (((e = t.body), !e)) throw Error(i(454));
          return e;
        default:
          throw Error(i(451));
      }
    }
    function gm(e, t, n) {
      for (var r in n) {
        var i = n[r];
        n.hasOwnProperty(r) && i != null && $(e, t, r, null, rp, i);
      }
      (n.dangerouslySetInnerHTML != null && (e.textContent = ``),
        e.onclick === yn && (e.onclick = null),
        Mt(e));
    }
    function _m(e) {
      for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
      Mt(e);
    }
    var vm = new Map(),
      ym = new Set();
    function bm(e) {
      if (typeof e.getRootNode == `function`) {
        var t = e.getRootNode();
        if (t.nodeType === 9 || t.nodeType === 11) return t;
      }
      return e.nodeType === 9 ? e : e.ownerDocument;
    }
    var xm = M.d;
    M.d = { f: Sm, r: Cm, D: Em, C: Dm, L: Om, m: km, X: jm, S: Am, M: Mm };
    function Sm() {
      var e = xm.f(),
        t = zd();
      return e || t;
    }
    function Cm(e) {
      var t = Pt(e);
      t !== null && t.tag === 5 && t.type === `form` ? rc(t) : xm.r(e);
    }
    var wm = typeof document > `u` ? null : document;
    function Tm(e, t, n) {
      var r = wm;
      if (r && typeof t == `string` && t) {
        var i = rn(t);
        ((i = `link[rel="` + e + `"][href="` + i + `"]`),
          typeof n == `string` && (i += `[crossorigin="` + n + `"]`),
          ym.has(i) ||
            (ym.add(i),
            (e = { rel: e, crossOrigin: n, href: t }),
            r.querySelector(i) === null &&
              ((t = r.createElement(`link`)),
              np(t, `link`, e),
              Lt(t),
              r.head.appendChild(t))));
      }
    }
    function Em(e) {
      (xm.D(e), Tm(`dns-prefetch`, e, null));
    }
    function Dm(e, t) {
      (xm.C(e, t), Tm(`preconnect`, e, t));
    }
    function Om(e, t, n) {
      xm.L(e, t, n);
      var r = wm;
      if (r && e && t) {
        var i = `link[rel="preload"][as="` + rn(t) + `"]`;
        t === `image` && n && n.imageSrcSet
          ? ((i += `[imagesrcset="` + rn(n.imageSrcSet) + `"]`),
            typeof n.imageSizes == `string` &&
              (i += `[imagesizes="` + rn(n.imageSizes) + `"]`))
          : (i += `[href="` + rn(e) + `"]`);
        var a = i;
        switch (t) {
          case `style`:
            a = Pm(e);
            break;
          case `script`:
            a = Rm(e);
        }
        if (!(
          vm.has(a) ||
          ((e = T(
            {
              rel: `preload`,
              href: t === `image` && n && n.imageSrcSet ? void 0 : e,
              as: t,
            },
            n,
          )),
          vm.set(a, e),
          r.querySelector(i) !== null ||
            (t === `style` && r.querySelector(Fm(a))) ||
            (t === `script` && r.querySelector(zm(a))))
        )) {
          var o = r.createElement(`link`);
          (np(o, `link`, e),
            t === `style` &&
              ((o[jt] = !0),
              (o.onload = o.onerror =
                function () {
                  Rt(o);
                })),
            Lt(o),
            r.head.appendChild(o));
        }
      }
    }
    function km(e, t) {
      xm.m(e, t);
      var n = wm;
      if (n && e) {
        var r = t && typeof t.as == `string` ? t.as : `script`,
          i =
            `link[rel="modulepreload"][as="` +
            rn(r) +
            `"][href="` +
            rn(e) +
            `"]`,
          a = i;
        switch (r) {
          case `audioworklet`:
          case `paintworklet`:
          case `serviceworker`:
          case `sharedworker`:
          case `worker`:
          case `script`:
            a = Rm(e);
        }
        if (
          !vm.has(a) &&
          ((e = T({ rel: `modulepreload`, href: e }, t)),
          vm.set(a, e),
          n.querySelector(i) === null)
        ) {
          switch (r) {
            case `audioworklet`:
            case `paintworklet`:
            case `serviceworker`:
            case `sharedworker`:
            case `worker`:
            case `script`:
              if (n.querySelector(zm(a))) return;
          }
          ((r = n.createElement(`link`)),
            np(r, `link`, e),
            Lt(r),
            n.head.appendChild(r));
        }
      }
    }
    function Am(e, t, n) {
      xm.S(e, t, n);
      var r = wm;
      if (r && e) {
        var i = It(r).hoistableStyles,
          a = Pm(e);
        t ||= `default`;
        var o = i.get(a);
        if (!o) {
          var s = { loading: 0, preload: null };
          if ((o = r.querySelector(Fm(a)))) s.loading = 5;
          else {
            ((e = T({ rel: `stylesheet`, href: e, "data-precedence": t }, n)),
              (n = vm.get(a)) && Hm(e, n));
            var c = (o = r.createElement(`link`));
            (Lt(c),
              np(c, `link`, e),
              (c._p = new Promise(function (e, t) {
                ((c.onload = e), (c.onerror = t));
              })),
              c.addEventListener(`load`, function () {
                s.loading |= 1;
              }),
              c.addEventListener(`error`, function () {
                s.loading |= 2;
              }),
              (s.loading |= 4),
              Vm(o, t, r));
          }
          ((o = { type: `stylesheet`, instance: o, count: 1, state: s }),
            i.set(a, o));
        }
      }
    }
    function jm(e, t) {
      xm.X(e, t);
      var n = wm;
      if (n && e) {
        var r = It(n).hoistableScripts,
          i = Rm(e),
          a = r.get(i);
        a ||
          ((a = n.querySelector(zm(i))),
          a ||
            ((e = T({ src: e, async: !0 }, t)),
            (t = vm.get(i)) && Um(e, t),
            (a = n.createElement(`script`)),
            Lt(a),
            np(a, `link`, e),
            n.head.appendChild(a)),
          (a = { type: `script`, instance: a, count: 1, state: null }),
          r.set(i, a));
      }
    }
    function Mm(e, t) {
      xm.M(e, t);
      var n = wm;
      if (n && e) {
        var r = It(n).hoistableScripts,
          i = Rm(e),
          a = r.get(i);
        a ||
          ((a = n.querySelector(zm(i))),
          a ||
            ((e = T({ src: e, async: !0, type: `module` }, t)),
            (t = vm.get(i)) && Um(e, t),
            (a = n.createElement(`script`)),
            Lt(a),
            np(a, `link`, e),
            n.head.appendChild(a)),
          (a = { type: `script`, instance: a, count: 1, state: null }),
          r.set(i, a));
      }
    }
    function Nm(e, t, n, r) {
      var a = (a = P.current) ? bm(a) : null;
      if (!a) throw Error(i(446));
      switch (e) {
        case `meta`:
        case `title`:
          return null;
        case `style`:
          return typeof n.precedence == `string` && typeof n.href == `string`
            ? ((n = Pm(n.href)),
              (t = It(a).hoistableStyles),
              (r = t.get(n)),
              r ||
                ((r = { type: `style`, instance: null, count: 0, state: null }),
                t.set(n, r)),
              r)
            : { type: `void`, instance: null, count: 0, state: null };
        case `link`:
          if (
            n.rel === `stylesheet` &&
            typeof n.href == `string` &&
            typeof n.precedence == `string`
          ) {
            e = Pm(n.href);
            var o = It(a).hoistableStyles,
              s = o.get(e);
            if (
              (s ||
                ((a = a.ownerDocument || a),
                (s = {
                  type: `stylesheet`,
                  instance: null,
                  count: 0,
                  state: { loading: 0, preload: null },
                }),
                o.set(e, s),
                (o = a.querySelector(Fm(e)))
                  ? o._p || ((s.instance = o), (s.state.loading = 5))
                  : ((o = vm.get(e)),
                    o ||
                      ((o = {
                        rel: `preload`,
                        as: `style`,
                        href: n.href,
                        crossOrigin: n.crossOrigin,
                        integrity: n.integrity,
                        media: n.media,
                        hrefLang: n.hrefLang,
                        referrerPolicy: n.referrerPolicy,
                      }),
                      vm.set(e, o)),
                    Lm(a, e, o, s.state))),
              t && r === null)
            )
              throw Error(i(528, ``));
            return s;
          }
          if (t && r !== null) throw Error(i(529, ``));
          return null;
        case `script`:
          return (
            (t = n.async),
            (n = n.src),
            typeof n == `string` &&
            t &&
            typeof t != `function` &&
            typeof t != `symbol`
              ? ((n = Rm(n)),
                (t = It(a).hoistableScripts),
                (r = t.get(n)),
                r ||
                  ((r = {
                    type: `script`,
                    instance: null,
                    count: 0,
                    state: null,
                  }),
                  t.set(n, r)),
                r)
              : { type: `void`, instance: null, count: 0, state: null }
          );
        default:
          throw Error(i(444, e));
      }
    }
    function Pm(e) {
      return `href="` + rn(e) + `"`;
    }
    function Fm(e) {
      return `link[rel="stylesheet"][` + e + `]`;
    }
    function Im(e) {
      return T({}, e, { "data-precedence": e.precedence, precedence: null });
    }
    function Lm(e, t, n, r) {
      if ((t = e.querySelector(`link[rel="preload"][as="style"][` + t + `]`))) {
        if (!0 !== t[jt]) {
          r.loading = 1;
          return;
        }
      } else
        ((t = e.createElement(`link`)),
          (t[jt] = !0),
          (t.onload = t.onerror = Rt.bind(null, t)),
          np(t, `link`, n),
          Lt(t),
          e.head.appendChild(t));
      ((r.preload = t),
        t.addEventListener(`load`, function () {
          return (r.loading |= 1);
        }),
        t.addEventListener(`error`, function () {
          return (r.loading |= 2);
        }));
    }
    function Rm(e) {
      return `[src="` + rn(e) + `"]`;
    }
    function zm(e) {
      return `script[async]` + e;
    }
    function Bm(e, t, n) {
      if ((t.count++, t.instance === null))
        switch (t.type) {
          case `style`:
            var r = e.querySelector(`style[data-href~="` + rn(n.href) + `"]`);
            if (r) return ((t.instance = r), Lt(r), r);
            var a = T({}, n, {
              "data-href": n.href,
              "data-precedence": n.precedence,
              href: null,
              precedence: null,
            });
            return (
              (r = (e.ownerDocument || e).createElement(`style`)),
              Lt(r),
              np(r, `style`, a),
              Vm(r, n.precedence, e),
              (t.instance = r)
            );
          case `stylesheet`:
            a = Pm(n.href);
            var o = e.querySelector(Fm(a));
            if (o) return ((t.state.loading |= 4), (t.instance = o), Lt(o), o);
            ((r = Im(n)),
              (a = vm.get(a)) && Hm(r, a),
              (o = (e.ownerDocument || e).createElement(`link`)),
              Lt(o));
            var s = o;
            return (
              (s._p = new Promise(function (e, t) {
                ((s.onload = e), (s.onerror = t));
              })),
              np(o, `link`, r),
              (t.state.loading |= 4),
              Vm(o, n.precedence, e),
              (t.instance = o)
            );
          case `script`:
            return (
              (o = Rm(n.src)),
              (a = e.querySelector(zm(o)))
                ? ((t.instance = a), Lt(a), a)
                : ((r = n),
                  (a = vm.get(o)) && ((r = T({}, n)), Um(r, a)),
                  (e = e.ownerDocument || e),
                  (a = e.createElement(`script`)),
                  Lt(a),
                  np(a, `link`, r),
                  e.head.appendChild(a),
                  (t.instance = a))
            );
          case `void`:
            return null;
          default:
            throw Error(i(443, t.type));
        }
      else
        t.type === `stylesheet` &&
          !(t.state.loading & 4) &&
          ((r = t.instance), (t.state.loading |= 4), Vm(r, n.precedence, e));
      return t.instance;
    }
    function Vm(e, t, n) {
      for (
        var r = n.querySelectorAll(
            `link[rel="stylesheet"][data-precedence],style[data-precedence]`,
          ),
          i = r.length ? r[r.length - 1] : null,
          a = i,
          o = 0;
        o < r.length;
        o++
      ) {
        var s = r[o];
        if (s.dataset.precedence === t) a = s;
        else if (a !== i) break;
      }
      a
        ? a.parentNode.insertBefore(e, a.nextSibling)
        : ((t = n.nodeType === 9 ? n.head : n),
          t.insertBefore(e, t.firstChild));
    }
    function Hm(e, t) {
      ((e.crossOrigin ??= t.crossOrigin),
        (e.referrerPolicy ??= t.referrerPolicy),
        (e.title ??= t.title));
    }
    function Um(e, t) {
      ((e.crossOrigin ??= t.crossOrigin),
        (e.referrerPolicy ??= t.referrerPolicy),
        (e.integrity ??= t.integrity));
    }
    var Wm = null;
    function Gm(e, t, n) {
      if (Wm === null) {
        var r = new Map(),
          i = (Wm = new Map());
        i.set(n, r);
      } else ((i = Wm), (r = i.get(n)), r || ((r = new Map()), i.set(n, r)));
      if (r.has(e)) return r;
      for (
        r.set(e, null), n = n.getElementsByTagName(e), i = 0;
        i < n.length;
        i++
      ) {
        var a = n[i];
        if (
          !(
            a[At] ||
            a[Ct] ||
            (e === `link` && a.getAttribute(`rel`) === `stylesheet`)
          ) &&
          a.namespaceURI !== `http://www.w3.org/2000/svg`
        ) {
          var o = a.getAttribute(t) || ``;
          o = e + o;
          var s = r.get(o);
          s ? s.push(a) : r.set(o, [a]);
        }
      }
      return r;
    }
    function Km(e, t, n) {
      ((e = e.ownerDocument || e),
        e.head.insertBefore(
          n,
          t === `title` ? e.querySelector(`head > title`) : null,
        ));
    }
    function qm(e, t, n) {
      if (n === 1 || t.itemProp != null) return !1;
      switch (e) {
        case `meta`:
        case `title`:
          return !0;
        case `style`:
          if (
            typeof t.precedence != `string` ||
            typeof t.href != `string` ||
            t.href === ``
          )
            break;
          return !0;
        case `link`:
          if (
            typeof t.rel != `string` ||
            typeof t.href != `string` ||
            t.href === `` ||
            t.onLoad ||
            t.onError
          )
            break;
          switch (t.rel) {
            case `stylesheet`:
              return (
                (e = t.disabled),
                typeof t.precedence == `string` && e == null
              );
            default:
              return !0;
          }
        case `script`:
          if (
            t.async &&
            typeof t.async != `function` &&
            typeof t.async != `symbol` &&
            !t.onLoad &&
            !t.onError &&
            t.src &&
            typeof t.src == `string`
          )
            return !0;
      }
      return !1;
    }
    function Jm(e, t) {
      return (
        e === `img` &&
        t.src != null &&
        t.src !== `` &&
        t.onLoad == null &&
        t.loading !== `lazy`
      );
    }
    function Ym(e) {
      return !(e.type === `stylesheet` && !(e.state.loading & 3));
    }
    function Xm(e) {
      return (
        (e.width || 100) *
        (e.height || 100) *
        (typeof devicePixelRatio == `number` ? devicePixelRatio : 1) *
        0.25
      );
    }
    function Zm(e, t) {
      typeof t.decode == `function` &&
        (e.imgCount++,
        t.complete || ((e.imgBytes += Xm(t)), e.suspenseyImages.push(t)),
        (e = rh.bind(e)),
        t.decode().then(e, e));
    }
    function Qm(e, t, n, r) {
      if (
        n.type === `stylesheet` &&
        (typeof r.media != `string` || !1 !== matchMedia(r.media).matches) &&
        !(n.state.loading & 4)
      ) {
        if (n.instance === null) {
          var i = Pm(r.href),
            a = t.querySelector(Fm(i));
          if (a) {
            ((t = a._p),
              typeof t == `object` &&
                t &&
                typeof t.then == `function` &&
                (e.count++, (e = nh.bind(e)), t.then(e, e)),
              (n.state.loading |= 4),
              (n.instance = a),
              Lt(a));
            return;
          }
          ((a = t.ownerDocument || t),
            (r = Im(r)),
            (i = vm.get(i)) && Hm(r, i),
            (a = a.createElement(`link`)),
            Lt(a));
          var o = a;
          ((o._p = new Promise(function (e, t) {
            ((o.onload = e), (o.onerror = t));
          })),
            np(a, `link`, r),
            (n.instance = a));
        }
        (e.stylesheets === null && (e.stylesheets = new Map()),
          e.stylesheets.set(n, t),
          (t = n.state.preload) &&
            !(n.state.loading & 3) &&
            (e.count++,
            (n = nh.bind(e)),
            t.addEventListener(`load`, n),
            t.addEventListener(`error`, n)));
      }
    }
    var $m = 0;
    function eh(e, t) {
      return (
        e.stylesheets && e.count === 0 && ah(e, e.stylesheets),
        0 < e.count || 0 < e.imgCount
          ? function (n) {
              var r = setTimeout(function () {
                if ((e.stylesheets && ah(e, e.stylesheets), e.unsuspend)) {
                  var t = e.unsuspend;
                  ((e.unsuspend = null), t());
                }
              }, 6e4 + t);
              0 < e.imgBytes && $m === 0 && ($m = 62500 * op());
              var i = setTimeout(
                function () {
                  if (
                    ((e.waitingForImages = !1),
                    e.count === 0 &&
                      (e.stylesheets && ah(e, e.stylesheets), e.unsuspend))
                  ) {
                    var t = e.unsuspend;
                    ((e.unsuspend = null), t());
                  }
                },
                (e.imgBytes > $m ? 50 : 800) + t,
              );
              return (
                (e.unsuspend = n),
                function () {
                  ((e.unsuspend = null), clearTimeout(r), clearTimeout(i));
                }
              );
            }
          : null
      );
    }
    function th(e) {
      if (e.count === 0 && (e.imgCount === 0 || !e.waitingForImages)) {
        if (e.stylesheets) ah(e, e.stylesheets);
        else if (e.unsuspend) {
          var t = e.unsuspend;
          ((e.unsuspend = null), t());
        }
      }
    }
    function nh() {
      (this.count--, th(this));
    }
    function rh() {
      (this.imgCount--, th(this));
    }
    var ih = null;
    function ah(e, t) {
      ((e.stylesheets = null),
        e.unsuspend !== null &&
          (e.count++,
          (ih = new Map()),
          t.forEach(oh, e),
          (ih = null),
          nh.call(e)));
    }
    function oh(e, t) {
      if (!(t.state.loading & 4)) {
        var n = ih.get(e);
        if (n) var r = n.get(null);
        else {
          ((n = new Map()), ih.set(e, n));
          for (
            var i = e.querySelectorAll(
                `link[data-precedence],style[data-precedence]`,
              ),
              a = 0;
            a < i.length;
            a++
          ) {
            var o = i[a];
            (o.nodeName === `LINK` || o.getAttribute(`media`) !== `not all`) &&
              (n.set(o.dataset.precedence, o), (r = o));
          }
          r && n.set(null, r);
        }
        ((i = t.instance),
          (o = i.getAttribute(`data-precedence`)),
          (a = n.get(o) || r),
          a === r && n.set(null, i),
          n.set(o, i),
          this.count++,
          (r = nh.bind(this)),
          i.addEventListener(`load`, r),
          i.addEventListener(`error`, r),
          a
            ? a.parentNode.insertBefore(i, a.nextSibling)
            : ((e = e.nodeType === 9 ? e.head : e),
              e.insertBefore(i, e.firstChild)),
          (t.state.loading |= 4));
      }
    }
    var sh = {
      $$typeof: A,
      Provider: null,
      Consumer: null,
      _currentValue: be,
      _currentValue2: be,
      _threadCount: 0,
    };
    function ch(e, t, n, r, i, a, o, s, c) {
      ((this.tag = 1),
        (this.containerInfo = e),
        (this.pingCache = this.current = this.pendingChildren = null),
        (this.timeoutHandle = -1),
        (this.callbackNode =
          this.next =
          this.pendingContext =
          this.context =
          this.cancelPendingCommit =
            null),
        (this.callbackPriority = 0),
        (this.expirationTimes = ft(-1)),
        (this.entangledLanes =
          this.shellSuspendCounter =
          this.errorRecoveryDisabledLanes =
          this.expiredLanes =
          this.warmLanes =
          this.pingedLanes =
          this.suspendedLanes =
          this.pendingLanes =
            0),
        (this.entanglements = ft(0)),
        (this.hiddenUpdates = ft(null)),
        (this.identifierPrefix = r),
        (this.onUncaughtError = i),
        (this.onCaughtError = a),
        (this.onRecoverableError = o),
        (this.pooledCache = null),
        (this.pooledCacheLanes = 0),
        (this.formState = c),
        (this.transitionTypes = null),
        (this.incompleteTransitions = new Map()));
    }
    function lh(e, t, n, r, i, a, o, s, c, l, u, d) {
      return (
        (e = new ch(e, t, n, o, c, l, u, d, s)),
        (t = 1),
        !0 === a && (t |= 24),
        (a = Ni(3, null, null, t)),
        (e.current = a),
        (a.stateNode = e),
        (t = Ma()),
        t.refCount++,
        (e.pooledCache = t),
        t.refCount++,
        (a.memoizedState = { element: r, isDehydrated: n, cache: t }),
        ho(a),
        e
      );
    }
    function uh(e) {
      return e ? ((e = ji), e) : ji;
    }
    function dh(e, t, n, r, i, a) {
      ((i = uh(i)),
        r.context === null ? (r.context = i) : (r.pendingContext = i),
        (r = _o(t)),
        (r.payload = { element: n }),
        (a = a === void 0 ? null : a),
        a !== null && (r.callback = a),
        (n = vo(e, r, t)),
        n !== null && (Pd(n, e, t), yo(n, e, t)));
    }
    function fh(e, t) {
      if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
        var n = e.retryLane;
        e.retryLane = n !== 0 && n < t ? n : t;
      }
    }
    function ph(e, t) {
      (fh(e, t), (e = e.alternate) && fh(e, t));
    }
    function mh(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = Oi(e, 67108864);
        (t !== null && Pd(t, e, 67108864), ph(e, 67108864));
      }
    }
    function hh(e) {
      if (e.tag === 13 || e.tag === 31) {
        var t = jd();
        t = vt(t);
        var n = Oi(e, t);
        (n !== null && Pd(n, e, t), ph(e, t));
      }
    }
    var gh = !0;
    function _h(e, t, n, r) {
      var i = j.T;
      j.T = null;
      var a = M.p;
      try {
        ((M.p = 2), yh(e, t, n, r));
      } finally {
        ((M.p = a), (j.T = i));
      }
    }
    function vh(e, t, n, r) {
      var i = j.T;
      j.T = null;
      var a = M.p;
      try {
        ((M.p = 8), yh(e, t, n, r));
      } finally {
        ((M.p = a), (j.T = i));
      }
    }
    function yh(e, t, n, r) {
      if (gh) {
        var i = bh(r);
        if (i === null) (Kf(e, t, r, xh, n), Mh(e, r));
        else if (Ph(i, e, t, n, r)) r.stopPropagation();
        else if ((Mh(e, r), t & 4 && -1 < jh.indexOf(e))) {
          for (; i !== null;) {
            var a = Pt(i);
            if (a !== null)
              switch (a.tag) {
                case 3:
                  if (
                    ((a = a.stateNode), a.current.memoizedState.isDehydrated)
                  ) {
                    var o = ot(a.pendingLanes);
                    if (o !== 0) {
                      var s = a;
                      for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
                        var c = 1 << (31 - $e(o));
                        ((s.entanglements[1] |= c), (o &= ~c));
                      }
                      (Ef(a), !(K & 6) && ((gd = Ve() + 500), Df(0, !1)));
                    }
                  }
                  break;
                case 31:
                case 13:
                  ((s = Oi(a, 2)), s !== null && Pd(s, a, 2), zd(), ph(a, 2));
              }
            if (((a = bh(r)), a === null && Kf(e, t, r, xh, n), a === i)) break;
            i = a;
          }
          i !== null && r.stopPropagation();
        } else Kf(e, t, r, null, n);
      }
    }
    function bh(e) {
      return ((e = xn(e)), Sh(e));
    }
    var xh = null;
    function Sh(e) {
      if (((xh = null), (e = Nt(e)), e !== null)) {
        var t = o(e);
        if (t === null) e = null;
        else {
          var n = t.tag;
          if (n === 13) {
            if (((e = s(t)), e !== null)) return e;
            e = null;
          } else if (n === 31) {
            if (((e = c(t)), e !== null)) return e;
            e = null;
          } else if (n === 3) {
            if (t.stateNode.current.memoizedState.isDehydrated)
              return t.tag === 3 ? t.stateNode.containerInfo : null;
            e = null;
          } else t !== e && (e = null);
        }
      }
      return ((xh = e), null);
    }
    function Ch(e) {
      switch (e) {
        case `beforetoggle`:
        case `cancel`:
        case `click`:
        case `close`:
        case `contextmenu`:
        case `copy`:
        case `cut`:
        case `auxclick`:
        case `dblclick`:
        case `dragend`:
        case `dragstart`:
        case `drop`:
        case `focusin`:
        case `focusout`:
        case `input`:
        case `invalid`:
        case `keydown`:
        case `keypress`:
        case `keyup`:
        case `mousedown`:
        case `mouseup`:
        case `paste`:
        case `pause`:
        case `play`:
        case `pointercancel`:
        case `pointerdown`:
        case `pointerup`:
        case `ratechange`:
        case `reset`:
        case `seeked`:
        case `submit`:
        case `toggle`:
        case `touchcancel`:
        case `touchend`:
        case `touchstart`:
        case `volumechange`:
        case `change`:
        case `selectionchange`:
        case `textInput`:
        case `compositionstart`:
        case `compositionend`:
        case `compositionupdate`:
        case `beforeblur`:
        case `afterblur`:
        case `beforeinput`:
        case `blur`:
        case `fullscreenchange`:
        case `fullscreenerror`:
        case `focus`:
        case `hashchange`:
        case `popstate`:
        case `select`:
        case `selectstart`:
          return 2;
        case `drag`:
        case `dragenter`:
        case `dragexit`:
        case `dragleave`:
        case `dragover`:
        case `mousemove`:
        case `mouseout`:
        case `mouseover`:
        case `pointermove`:
        case `pointerout`:
        case `pointerover`:
        case `resize`:
        case `scroll`:
        case `touchmove`:
        case `wheel`:
        case `mouseenter`:
        case `mouseleave`:
        case `pointerenter`:
        case `pointerleave`:
          return 8;
        case `message`:
          switch (He()) {
            case Ue:
              return 2;
            case We:
              return 8;
            case Ge:
            case Ke:
              return 32;
            case qe:
              return 268435456;
            default:
              return 32;
          }
        default:
          return 32;
      }
    }
    var wh = !1,
      Th = null,
      Eh = null,
      Dh = null,
      Oh = new Map(),
      kh = new Map(),
      Ah = [],
      jh =
        `mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset`.split(
          ` `,
        );
    function Mh(e, t) {
      switch (e) {
        case `focusin`:
        case `focusout`:
          Th = null;
          break;
        case `dragenter`:
        case `dragleave`:
          Eh = null;
          break;
        case `mouseover`:
        case `mouseout`:
          Dh = null;
          break;
        case `pointerover`:
        case `pointerout`:
          Oh.delete(t.pointerId);
          break;
        case `gotpointercapture`:
        case `lostpointercapture`:
          kh.delete(t.pointerId);
      }
    }
    function Nh(e, t, n, r, i, a) {
      return e === null || e.nativeEvent !== a
        ? ((e = {
            blockedOn: t,
            domEventName: n,
            eventSystemFlags: r,
            nativeEvent: a,
            targetContainers: [i],
          }),
          t !== null && ((t = Pt(t)), t !== null && mh(t)),
          e)
        : ((e.eventSystemFlags |= r),
          (t = e.targetContainers),
          i !== null && t.indexOf(i) === -1 && t.push(i),
          e);
    }
    function Ph(e, t, n, r, i) {
      switch (t) {
        case `focusin`:
          return ((Th = Nh(Th, e, t, n, r, i)), !0);
        case `dragenter`:
          return ((Eh = Nh(Eh, e, t, n, r, i)), !0);
        case `mouseover`:
          return ((Dh = Nh(Dh, e, t, n, r, i)), !0);
        case `pointerover`:
          var a = i.pointerId;
          return (Oh.set(a, Nh(Oh.get(a) || null, e, t, n, r, i)), !0);
        case `gotpointercapture`:
          return (
            (a = i.pointerId),
            kh.set(a, Nh(kh.get(a) || null, e, t, n, r, i)),
            !0
          );
      }
      return !1;
    }
    function Fh(e) {
      var t = Nt(e.target);
      if (t !== null) {
        var n = o(t);
        if (n !== null) {
          if (((t = n.tag), t === 13)) {
            if (((t = s(n)), t !== null)) {
              ((e.blockedOn = t),
                xt(e.priority, function () {
                  hh(n);
                }));
              return;
            }
          } else if (t === 31) {
            if (((t = c(n)), t !== null)) {
              ((e.blockedOn = t),
                xt(e.priority, function () {
                  hh(n);
                }));
              return;
            }
          } else if (
            t === 3 &&
            n.stateNode.current.memoizedState.isDehydrated
          ) {
            e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
            return;
          }
        }
      }
      e.blockedOn = null;
    }
    function Ih(e) {
      if (e.blockedOn !== null) return !1;
      for (var t = e.targetContainers; 0 < t.length;) {
        var n = bh(e.nativeEvent);
        if (n === null) {
          n = e.nativeEvent;
          var r = new n.constructor(n.type, n);
          ((bn = r), n.target.dispatchEvent(r), (bn = null));
        } else return ((t = Pt(n)), t !== null && mh(t), (e.blockedOn = n), !1);
        t.shift();
      }
      return !0;
    }
    function Lh(e, t, n) {
      Ih(e) && n.delete(t);
    }
    function Rh() {
      ((wh = !1),
        Th !== null && Ih(Th) && (Th = null),
        Eh !== null && Ih(Eh) && (Eh = null),
        Dh !== null && Ih(Dh) && (Dh = null),
        Oh.forEach(Lh),
        kh.forEach(Lh));
    }
    function zh(e, n) {
      e.blockedOn === n &&
        ((e.blockedOn = null),
        wh ||
          ((wh = !0),
          t.unstable_scheduleCallback(t.unstable_NormalPriority, Rh)));
    }
    var Bh = null;
    function Vh(e) {
      Bh !== e &&
        ((Bh = e),
        t.unstable_scheduleCallback(t.unstable_NormalPriority, function () {
          Bh === e && (Bh = null);
          for (var t = 0; t < e.length; t += 3) {
            var n = e[t],
              r = e[t + 1],
              i = e[t + 2];
            if (typeof r != `function`) {
              if (Sh(r || n) === null) continue;
              break;
            }
            var a = Pt(n);
            a !== null &&
              (e.splice(t, 3),
              (t -= 3),
              tc(
                a,
                { pending: !0, data: i, method: n.method, action: r },
                r,
                i,
              ));
          }
        }));
    }
    function Hh(e) {
      function t(t) {
        return zh(t, e);
      }
      (Th !== null && zh(Th, e),
        Eh !== null && zh(Eh, e),
        Dh !== null && zh(Dh, e),
        Oh.forEach(t),
        kh.forEach(t));
      for (var n = 0; n < Ah.length; n++) {
        var r = Ah[n];
        r.blockedOn === e && (r.blockedOn = null);
      }
      for (; 0 < Ah.length && ((n = Ah[0]), n.blockedOn === null);)
        (Fh(n), n.blockedOn === null && Ah.shift());
      if (((n = (e.ownerDocument || e).$$reactFormReplay), n != null))
        for (r = 0; r < n.length; r += 3) {
          var i = n[r],
            a = n[r + 1],
            o = i[wt] || null;
          if (typeof a == `function`) o || Vh(n);
          else if (o) {
            var s = null;
            if (a && a.hasAttribute(`formAction`)) {
              if (((i = a), (o = a[wt] || null))) s = o.formAction;
              else if (Sh(i) !== null) continue;
            } else s = o.action;
            (typeof s == `function`
              ? (n[r + 1] = s)
              : (n.splice(r, 3), (r -= 3)),
              Vh(n));
          }
        }
    }
    function Uh() {
      function e(e) {
        e.canIntercept &&
          e.info === `react-transition` &&
          e.intercept({
            handler: function () {
              return new Promise(function (e) {
                return (i = e);
              });
            },
            focusReset: `manual`,
            scroll: `manual`,
          });
      }
      function t() {
        (i !== null && (i(), (i = null)), r || setTimeout(n, 20));
      }
      function n() {
        if (!r && !navigation.transition) {
          var e = navigation.currentEntry;
          e &&
            e.url != null &&
            navigation.navigate(e.url, {
              state: e.getState(),
              info: `react-transition`,
              history: `replace`,
            });
        }
      }
      if (typeof navigation == `object`) {
        var r = !1,
          i = null;
        return (
          navigation.addEventListener(`navigate`, e),
          navigation.addEventListener(`navigatesuccess`, t),
          navigation.addEventListener(`navigateerror`, t),
          setTimeout(n, 100),
          function () {
            ((r = !0),
              navigation.removeEventListener(`navigate`, e),
              navigation.removeEventListener(`navigatesuccess`, t),
              navigation.removeEventListener(`navigateerror`, t),
              i !== null && (i(), (i = null)));
          }
        );
      }
    }
    function Wh(e) {
      this._internalRoot = e;
    }
    ((Gh.prototype.render = Wh.prototype.render =
      function (e) {
        var t = this._internalRoot;
        if (t === null) throw Error(i(409));
        var n = t.current;
        dh(n, jd(), e, t, null, null);
      }),
      (Gh.prototype.unmount = Wh.prototype.unmount =
        function () {
          var e = this._internalRoot;
          if (e !== null) {
            this._internalRoot = null;
            var t = e.containerInfo;
            (dh(e.current, 2, null, e, null, null), zd(), (t[Tt] = null));
          }
        }));
    function Gh(e) {
      this._internalRoot = e;
    }
    Gh.prototype.unstable_scheduleHydration = function (e) {
      if (e) {
        var t = bt();
        e = { blockedOn: null, target: e, priority: t };
        for (var n = 0; n < Ah.length && t !== 0 && t < Ah[n].priority; n++);
        (Ah.splice(n, 0, e), n === 0 && Fh(e));
      }
    };
    var Kh = n.version;
    if (Kh !== `19.3.0`) throw Error(i(527, Kh, `19.3.0`));
    M.findDOMNode = function (e) {
      var t = e._reactInternals;
      if (t === void 0)
        throw typeof e.render == `function`
          ? Error(i(188))
          : ((e = Object.keys(e).join(`,`)), Error(i(268, e)));
      return (
        (e = d(t)),
        (e = e === null ? null : p(e)),
        (e = e === null ? null : e.stateNode),
        e
      );
    };
    var qh = {
      bundleType: 0,
      version: `19.3.0`,
      rendererPackageName: `react-dom`,
      currentDispatcherRef: j,
      reconcilerVersion: `19.3.0`,
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < `u`) {
      var Jh = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (!Jh.isDisabled && Jh.supportsFiber)
        try {
          ((Xe = Jh.inject(qh)), (Ze = Jh));
        } catch {}
    }
    e.createRoot = function (e, t) {
      if (!a(e)) throw Error(i(299));
      var n = !1,
        r = ``,
        o = wc,
        s = Tc,
        c = Ec;
      return (
        t != null &&
          (!0 === t.unstable_strictMode && (n = !0),
          t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
          t.onUncaughtError !== void 0 && (o = t.onUncaughtError),
          t.onCaughtError !== void 0 && (s = t.onCaughtError),
          t.onRecoverableError !== void 0 && (c = t.onRecoverableError)),
        (t = lh(e, 1, !1, null, null, n, r, null, o, s, c, Uh)),
        (e[Tt] = t.current),
        Wf(e),
        new Wh(t)
      );
    };
  }),
  g = o((e, t) => {
    function n() {
      if (
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < `u` &&
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE == `function`
      )
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
        } catch (e) {
          console.error(e);
        }
    }
    (n(), (t.exports = h()));
  }),
  _ = o((e) => {
    var t = Symbol.for(`react.transitional.element`),
      n = Symbol.for(`react.fragment`);
    function r(e, n, r) {
      var i = null;
      if (
        (r !== void 0 && (i = `` + r),
        n.key !== void 0 && (i = `` + n.key),
        `key` in n)
      )
        for (var a in ((r = {}), n)) a !== `key` && (r[a] = n[a]);
      else r = n;
      return (
        (n = r.ref),
        { $$typeof: t, type: e, key: i, ref: n === void 0 ? null : n, props: r }
      );
    }
    ((e.Fragment = n), (e.jsx = r), (e.jsxs = r));
  }),
  v = o((e, t) => {
    t.exports = _();
  }),
  y = g(),
  b = c(f(), 1),
  x = v();
function S({ reset: e = !1 }) {
  let [t, n] = (0, b.useState)(e),
    [r, i] = (0, b.useState)(``),
    [a, o] = (0, b.useState)(``),
    [s, c] = (0, b.useState)(``);
  return (0, x.jsxs)(`section`, {
    className: `text-xs text-[#123540] p-4`,
    children: [
      !e &&
        (0, x.jsx)(`button`, {
          className: `underline`,
          onClick: () => n(!t),
          children: `Forgot password?`,
        }),
      t &&
        (0, x.jsxs)(`form`, {
          className: `mt-3 space-y-3 max-w-md`,
          onSubmit: async (t) => {
            t.preventDefault();
            try {
              let t = window.location.hash.slice(1),
                n = await fetch(
                  e ? `/api/auth/reset-password` : `/api/auth/forgot-password`,
                  {
                    method: `POST`,
                    headers: { "Content-Type": `application/json` },
                    body: JSON.stringify(
                      e ? { token: t, password: a } : { email: r },
                    ),
                  },
                ),
                i = await n.json();
              if (!n.ok) throw Error(i.error);
              (e && window.history.replaceState({}, ``, `/reset-password`),
                c(
                  e
                    ? `Password reset. Sign in with your new password.`
                    : i.data.message,
                ));
            } catch (e) {
              c(e.message);
            }
          },
          children: [
            e
              ? (0, x.jsxs)(`label`, {
                  children: [
                    `New password`,
                    (0, x.jsx)(`input`, {
                      type: `password`,
                      minLength: 12,
                      maxLength: 128,
                      required: !0,
                      value: a,
                      onChange: (e) => o(e.target.value),
                      className: `block border rounded p-2 w-full`,
                    }),
                  ],
                })
              : (0, x.jsxs)(`label`, {
                  children: [
                    `Email`,
                    (0, x.jsx)(`input`, {
                      type: `email`,
                      required: !0,
                      value: r,
                      onChange: (e) => i(e.target.value),
                      className: `block border rounded p-2 w-full`,
                    }),
                  ],
                }),
            (0, x.jsx)(`button`, {
              className: `bg-[#123f47] text-white rounded p-2`,
              children: e ? `Reset password` : `Send reset instructions`,
            }),
            (0, x.jsx)(`p`, { role: `status`, children: s }),
          ],
        }),
    ],
  });
}
var ee = (e) => e.replace(/([a-z0-9])([A-Z])/g, `$1-$2`).toLowerCase(),
  C = (e) =>
    e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) =>
      n ? n.toUpperCase() : t.toLowerCase(),
    ),
  w = (e) => {
    let t = C(e);
    return t.charAt(0).toUpperCase() + t.slice(1);
  },
  te = (...e) =>
    e
      .filter((e, t, n) => !!e && e.trim() !== `` && n.indexOf(e) === t)
      .join(` `)
      .trim(),
  T = (e) => {
    for (let t in e)
      if (t.startsWith(`aria-`) || t === `role` || t === `title`) return !0;
  },
  E = {
    xmlns: `http://www.w3.org/2000/svg`,
    width: 24,
    height: 24,
    viewBox: `0 0 24 24`,
    fill: `none`,
    stroke: `currentColor`,
    strokeWidth: 2,
    strokeLinecap: `round`,
    strokeLinejoin: `round`,
  },
  D = (0, b.forwardRef)(
    (
      {
        color: e = `currentColor`,
        size: t = 24,
        strokeWidth: n = 2,
        absoluteStrokeWidth: r,
        className: i = ``,
        children: a,
        iconNode: o,
        ...s
      },
      c,
    ) =>
      (0, b.createElement)(
        `svg`,
        {
          ref: c,
          ...E,
          width: t,
          height: t,
          stroke: e,
          strokeWidth: r ? (Number(n) * 24) / Number(t) : n,
          className: te(`lucide`, i),
          ...(!a && !T(s) && { "aria-hidden": `true` }),
          ...s,
        },
        [
          ...o.map(([e, t]) => (0, b.createElement)(e, t)),
          ...(Array.isArray(a) ? a : [a]),
        ],
      ),
  ),
  O = (e, t) => {
    let n = (0, b.forwardRef)(({ className: n, ...r }, i) =>
      (0, b.createElement)(D, {
        ref: i,
        iconNode: t,
        className: te(`lucide-${ee(w(e))}`, `lucide-${e}`, n),
        ...r,
      }),
    );
    return ((n.displayName = w(e)), n);
  },
  k = O(`arrow-up-right`, [
    [`path`, { d: `M7 7h10v10`, key: `1tivn9` }],
    [`path`, { d: `M7 17 17 7`, key: `1vkiza` }],
  ]),
  ne = O(`award`, [
    [
      `path`,
      {
        d: `m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526`,
        key: `1yiouv`,
      },
    ],
    [`circle`, { cx: `12`, cy: `8`, r: `6`, key: `1vp47v` }],
  ]),
  re = O(`building-2`, [
    [`path`, { d: `M10 12h4`, key: `a56b0p` }],
    [`path`, { d: `M10 8h4`, key: `1sr2af` }],
    [`path`, { d: `M14 21v-3a2 2 0 0 0-4 0v3`, key: `1rgiei` }],
    [
      `path`,
      {
        d: `M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2`,
        key: `secmi2`,
      },
    ],
    [`path`, { d: `M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16`, key: `16ra0t` }],
  ]),
  ie = O(`calculator`, [
    [
      `rect`,
      { width: `16`, height: `20`, x: `4`, y: `2`, rx: `2`, key: `1nb95v` },
    ],
    [`line`, { x1: `8`, x2: `16`, y1: `6`, y2: `6`, key: `x4nwl0` }],
    [`line`, { x1: `16`, x2: `16`, y1: `14`, y2: `18`, key: `wjye3r` }],
    [`path`, { d: `M16 10h.01`, key: `1m94wz` }],
    [`path`, { d: `M12 10h.01`, key: `1nrarc` }],
    [`path`, { d: `M8 10h.01`, key: `19clt8` }],
    [`path`, { d: `M12 14h.01`, key: `1etili` }],
    [`path`, { d: `M8 14h.01`, key: `6423bh` }],
    [`path`, { d: `M12 18h.01`, key: `mhygvu` }],
    [`path`, { d: `M8 18h.01`, key: `lrp35t` }],
  ]),
  A = O(`check`, [[`path`, { d: `M20 6 9 17l-5-5`, key: `1gmf2c` }]]),
  ae = O(`chevron-down`, [[`path`, { d: `m6 9 6 6 6-6`, key: `qrunsl` }]]),
  oe = O(`chevron-right`, [[`path`, { d: `m9 18 6-6-6-6`, key: `mthhwq` }]]),
  se = O(`circle-alert`, [
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
    [`line`, { x1: `12`, x2: `12`, y1: `8`, y2: `12`, key: `1pkeuh` }],
    [`line`, { x1: `12`, x2: `12.01`, y1: `16`, y2: `16`, key: `4dfq90` }],
  ]),
  ce = O(`circle-check`, [
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
    [`path`, { d: `m9 12 2 2 4-4`, key: `dzmm74` }],
  ]),
  le = O(`clock`, [
    [`path`, { d: `M12 6v6l4 2`, key: `mmk7yg` }],
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
  ]),
  ue = O(`copy`, [
    [
      `rect`,
      {
        width: `14`,
        height: `14`,
        x: `8`,
        y: `8`,
        rx: `2`,
        ry: `2`,
        key: `17jyea`,
      },
    ],
    [
      `path`,
      {
        d: `M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,
        key: `zix9uf`,
      },
    ],
  ]),
  de = O(`download`, [
    [`path`, { d: `M12 15V3`, key: `m9g1x1` }],
    [`path`, { d: `M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`, key: `ih7n3h` }],
    [`path`, { d: `m7 10 5 5 5-5`, key: `brsn70` }],
  ]),
  fe = O(`eye`, [
    [
      `path`,
      {
        d: `M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0`,
        key: `1nclc0`,
      },
    ],
    [`circle`, { cx: `12`, cy: `12`, r: `3`, key: `1v7zrd` }],
  ]),
  pe = O(`file-text`, [
    [
      `path`,
      {
        d: `M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z`,
        key: `1rqfz7`,
      },
    ],
    [`path`, { d: `M14 2v4a2 2 0 0 0 2 2h4`, key: `tnqrlb` }],
    [`path`, { d: `M10 9H8`, key: `b1mrlr` }],
    [`path`, { d: `M16 13H8`, key: `t4e002` }],
    [`path`, { d: `M16 17H8`, key: `z1uh3a` }],
  ]),
  me = O(`hard-drive`, [
    [`line`, { x1: `22`, x2: `2`, y1: `12`, y2: `12`, key: `1y58io` }],
    [
      `path`,
      {
        d: `M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z`,
        key: `oot6mr`,
      },
    ],
    [`line`, { x1: `6`, x2: `6.01`, y1: `16`, y2: `16`, key: `sgf278` }],
    [`line`, { x1: `10`, x2: `10.01`, y1: `16`, y2: `16`, key: `1l4acy` }],
  ]),
  he = O(`hard-hat`, [
    [`path`, { d: `M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5`, key: `1p9q5i` }],
    [`path`, { d: `M14 6a6 6 0 0 1 6 6v3`, key: `1hnv84` }],
    [`path`, { d: `M4 15v-3a6 6 0 0 1 6-6`, key: `9ciidu` }],
    [
      `rect`,
      { x: `2`, y: `15`, width: `20`, height: `4`, rx: `1`, key: `g3x8cw` },
    ],
  ]),
  ge = O(`house`, [
    [
      `path`,
      { d: `M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8`, key: `5wwlr5` },
    ],
    [
      `path`,
      {
        d: `M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z`,
        key: `r6nss1`,
      },
    ],
  ]),
  _e = O(`info`, [
    [`circle`, { cx: `12`, cy: `12`, r: `10`, key: `1mglay` }],
    [`path`, { d: `M12 16v-4`, key: `1dtifu` }],
    [`path`, { d: `M12 8h.01`, key: `e9boi3` }],
  ]),
  ve = O(`lock-open`, [
    [
      `rect`,
      {
        width: `18`,
        height: `11`,
        x: `3`,
        y: `11`,
        rx: `2`,
        ry: `2`,
        key: `1w4ew1`,
      },
    ],
    [`path`, { d: `M7 11V7a5 5 0 0 1 9.9-1`, key: `1mm8w8` }],
  ]),
  ye = O(`lock`, [
    [
      `rect`,
      {
        width: `18`,
        height: `11`,
        x: `3`,
        y: `11`,
        rx: `2`,
        ry: `2`,
        key: `1w4ew1`,
      },
    ],
    [`path`, { d: `M7 11V7a5 5 0 0 1 10 0v4`, key: `fwvmzm` }],
  ]),
  j = O(`log-in`, [
    [`path`, { d: `m10 17 5-5-5-5`, key: `1bsop3` }],
    [`path`, { d: `M15 12H3`, key: `6jk70r` }],
    [`path`, { d: `M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4`, key: `u53s6r` }],
  ]),
  M = O(`log-out`, [
    [`path`, { d: `m16 17 5-5-5-5`, key: `1bji2h` }],
    [`path`, { d: `M21 12H9`, key: `dn1m92` }],
    [`path`, { d: `M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`, key: `1uf3rs` }],
  ]),
  be = O(`plus`, [
    [`path`, { d: `M5 12h14`, key: `1ays0h` }],
    [`path`, { d: `M12 5v14`, key: `s699le` }],
  ]),
  xe = O(`send`, [
    [
      `path`,
      {
        d: `M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z`,
        key: `1ffxy3`,
      },
    ],
    [`path`, { d: `m21.854 2.147-10.94 10.939`, key: `12cjpa` }],
  ]),
  Se = O(`shield-alert`, [
    [
      `path`,
      {
        d: `M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,
        key: `oel41y`,
      },
    ],
    [`path`, { d: `M12 8v4`, key: `1got3b` }],
    [`path`, { d: `M12 16h.01`, key: `1drbdi` }],
  ]),
  Ce = O(`shield-check`, [
    [
      `path`,
      {
        d: `M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z`,
        key: `oel41y`,
      },
    ],
    [`path`, { d: `m9 12 2 2 4-4`, key: `dzmm74` }],
  ]),
  we = O(`sparkles`, [
    [
      `path`,
      {
        d: `M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`,
        key: `1s2grr`,
      },
    ],
    [`path`, { d: `M20 2v4`, key: `1rf3ol` }],
    [`path`, { d: `M22 4h-4`, key: `gwowj6` }],
    [`circle`, { cx: `4`, cy: `20`, r: `2`, key: `6kqj1y` }],
  ]),
  N = O(`trash-2`, [
    [`path`, { d: `M10 11v6`, key: `nco0om` }],
    [`path`, { d: `M14 11v6`, key: `outv1u` }],
    [`path`, { d: `M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6`, key: `miytrc` }],
    [`path`, { d: `M3 6h18`, key: `d0wm0j` }],
    [`path`, { d: `M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2`, key: `e791ji` }],
  ]),
  Te = O(`user-check`, [
    [`path`, { d: `m16 11 2 2 4-4`, key: `9rsbq5` }],
    [`path`, { d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`, key: `1yyitq` }],
    [`circle`, { cx: `9`, cy: `7`, r: `4`, key: `nufk8` }],
  ]),
  Ee = O(`user-plus`, [
    [`path`, { d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`, key: `1yyitq` }],
    [`circle`, { cx: `9`, cy: `7`, r: `4`, key: `nufk8` }],
    [`line`, { x1: `19`, x2: `19`, y1: `8`, y2: `14`, key: `1bvyxn` }],
    [`line`, { x1: `22`, x2: `16`, y1: `11`, y2: `11`, key: `1shjgl` }],
  ]),
  P = O(`user`, [
    [`path`, { d: `M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2`, key: `975kel` }],
    [`circle`, { cx: `12`, cy: `7`, r: `4`, key: `17ys0d` }],
  ]),
  De = O(`users`, [
    [`path`, { d: `M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2`, key: `1yyitq` }],
    [`path`, { d: `M16 3.128a4 4 0 0 1 0 7.744`, key: `16gr8j` }],
    [`path`, { d: `M22 21v-2a4 4 0 0 0-3-3.87`, key: `kshegd` }],
    [`circle`, { cx: `9`, cy: `7`, r: `4`, key: `nufk8` }],
  ]),
  Oe = O(`x`, [
    [`path`, { d: `M18 6 6 18`, key: `1bl5f8` }],
    [`path`, { d: `m6 6 12 12`, key: `d8bk6v` }],
  ]),
  F = (0, b.createContext)(void 0),
  ke = ({ children: e }) => {
    let [t, n] = (0, b.useState)([]),
      r = (0, b.useCallback)((e, t = `info`, r) => {
        let i = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        (n((n) => [...n, { id: i, message: e, type: t, title: r }]),
          setTimeout(() => {
            n((e) => e.filter((e) => e.id !== i));
          }, 4500));
      }, []),
      i = (0, b.useCallback)((e) => {
        n((t) => t.filter((t) => t.id !== e));
      }, []);
    return (0, x.jsxs)(F.Provider, {
      value: { showToast: r, removeToast: i },
      children: [
        e,
        (0, x.jsx)(`div`, {
          className: `fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 sm:px-0 pointer-events-none`,
          children: t.map((e) =>
            (0, x.jsxs)(
              `div`,
              {
                className: `pointer-events-auto flex items-start gap-3 p-4 rounded-[6px] shadow-[0_12px_30px_rgba(8,38,49,0.25)] border text-sm transition-all duration-300 animate-in slide-in-from-bottom-2 ${e.type === `success` ? `bg-[#123f47] border-[#1f5963] text-white` : e.type === `error` ? `bg-[#7f1d1d] border-[#991b1b] text-white` : e.type === `warning` ? `bg-[#854d0e] border-[#a16207] text-white` : `bg-[#082631] border-[#194048] text-[#f7f6f2]`}`,
                children: [
                  (0, x.jsxs)(`div`, {
                    className: `shrink-0 mt-0.5`,
                    children: [
                      e.type === `success` &&
                        (0, x.jsx)(ce, { className: `w-5 h-5 text-[#eb6a32]` }),
                      e.type === `error` &&
                        (0, x.jsx)(se, { className: `w-5 h-5 text-[#fca5a5]` }),
                      e.type === `warning` &&
                        (0, x.jsx)(se, { className: `w-5 h-5 text-[#fde047]` }),
                      e.type === `info` &&
                        (0, x.jsx)(_e, { className: `w-5 h-5 text-[#f6a47f]` }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `flex-1`,
                    children: [
                      e.title &&
                        (0, x.jsx)(`div`, {
                          className: `font-['Manrope'] font-bold text-sm tracking-tight mb-0.5 text-white`,
                          children: e.title,
                        }),
                      (0, x.jsx)(`div`, {
                        className: `text-xs leading-relaxed opacity-95`,
                        children: e.message,
                      }),
                    ],
                  }),
                  (0, x.jsx)(`button`, {
                    onClick: () => i(e.id),
                    className: `shrink-0 text-white/70 hover:text-white p-0.5 rounded transition-colors`,
                    children: (0, x.jsx)(Oe, { className: `w-4 h-4` }),
                  }),
                ],
              },
              e.id,
            ),
          ),
        }),
      ],
    });
  },
  Ae = () => {
    let e = (0, b.useContext)(F);
    if (!e) throw Error(`useToast must be used within a ToastProvider`);
    return e;
  },
  je = ({ currentPath: e, onNavigate: t, activeRole: n, onRoleChange: r }) => {
    let [i, a] = (0, b.useState)(!1);
    return (0, x.jsxs)(x.Fragment, {
      children: [
        (0, x.jsxs)(`div`, {
          className: `bg-[#0e3037] text-[#c8d8d7] px-4 sm:px-8 py-1.5 text-xs border-b border-[#194048] flex items-center justify-between`,
          children: [
            (0, x.jsxs)(`div`, {
              className: `flex items-center gap-2`,
              children: [
                (0, x.jsx)(`span`, {
                  className: `w-1.5 h-1.5 rounded-full bg-[#eb6a32]`,
                }),
                (0, x.jsx)(`span`, {
                  className: `text-[11px] font-medium tracking-wide`,
                  children: `Urban Procures · UAE Construction & Property Procurement`,
                }),
              ],
            }),
            (0, x.jsxs)(`div`, {
              className: `relative`,
              children: [
                (0, x.jsxs)(`button`, {
                  onClick: () => a(!i),
                  className: `flex items-center gap-1.5 text-[11px] text-[#e3edeb] hover:text-white px-2 py-0.5 rounded transition-colors`,
                  children: [
                    (0, x.jsx)(`span`, { children: `Portal:` }),
                    (0, x.jsx)(`span`, {
                      className: `font-bold text-[#eb6a32] capitalize`,
                      children: n,
                    }),
                    (0, x.jsx)(ae, { className: `w-3 h-3 text-[#b6c7c9]` }),
                  ],
                }),
                i &&
                  (0, x.jsxs)(`div`, {
                    className: `absolute right-0 mt-1 w-44 bg-white border border-[#e1e7e4] rounded shadow-lg py-1 z-50 text-[#123540]`,
                    children: [
                      (0, x.jsx)(`div`, {
                        className: `px-3 py-1 text-[10px] uppercase font-bold text-[#63797b] border-b border-[#e1e7e4]`,
                        children: `Switch View`,
                      }),
                      (0, x.jsx)(`button`, {
                        onClick: () => {
                          (r(`public`), a(!1));
                        },
                        className: `w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]`,
                        children: `Public (Get a Quote)`,
                      }),
                      (0, x.jsx)(`button`, {
                        onClick: () => {
                          (r(`contractor`), a(!1));
                        },
                        className: `w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]`,
                        children: `Contractor`,
                      }),
                      (0, x.jsx)(`button`, {
                        onClick: () => {
                          (r(`vendor`), a(!1));
                        },
                        className: `w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]`,
                        children: `Vendor`,
                      }),
                      (0, x.jsx)(`button`, {
                        onClick: () => {
                          (r(`admin`), a(!1));
                        },
                        className: `w-full text-left px-3 py-1.5 text-xs hover:bg-[#f7f6f2]`,
                        children: `Admin`,
                      }),
                    ],
                  }),
              ],
            }),
          ],
        }),
        (0, x.jsx)(`header`, {
          className: `sticky top-0 z-40 bg-white border-b border-[#e1e7e4] shadow-[0_2px_10px_rgba(18,53,64,0.03)]`,
          children: (0, x.jsxs)(`div`, {
            className: `max-w-[1240px] mx-auto min-h-[76px] px-4 sm:px-6 flex items-center justify-between gap-4`,
            children: [
              (0, x.jsxs)(`div`, {
                onClick: () => t(`/`),
                className: `flex items-center gap-3 cursor-pointer group`,
                children: [
                  (0, x.jsx)(`img`, {
                    src: `/assets/urbanprocures-logo.png`,
                    width: `36`,
                    height: `40`,
                    alt: `Urban Procures Logo`,
                    className: `object-contain`,
                  }),
                  (0, x.jsx)(`span`, {
                    className: `font-['Manrope'] font-extrabold text-[21px] tracking-[-0.04em] text-[#123540] group-hover:text-[#eb6a32] transition-colors whitespace-nowrap`,
                    children: `Urban Procures`,
                  }),
                ],
              }),
              (0, x.jsxs)(`nav`, {
                className: `hidden md:flex items-center gap-7 text-[15px] font-medium text-[#123540]`,
                children: [
                  (0, x.jsx)(`button`, {
                    onClick: () => t(`/get-a-quote`),
                    className: `hover:text-[#eb6a32] transition-colors ${e === `/get-a-quote` ? `text-[#eb6a32] font-bold` : ``}`,
                    children: `Get a Quote`,
                  }),
                  (0, x.jsx)(`button`, {
                    onClick: () => t(`/contractor`),
                    className: `hover:text-[#eb6a32] transition-colors ${e.startsWith(`/contractor`) ? `text-[#eb6a32] font-bold` : ``}`,
                    children: `Contractor`,
                  }),
                  (0, x.jsx)(`button`, {
                    onClick: () => t(`/vendor`),
                    className: `hover:text-[#eb6a32] transition-colors ${e.startsWith(`/vendor`) ? `text-[#eb6a32] font-bold` : ``}`,
                    children: `Vendor`,
                  }),
                ],
              }),
              (0, x.jsx)(`div`, {
                className: `flex items-center gap-3`,
                children: (0, x.jsxs)(`button`, {
                  onClick: () => t(`/get-a-quote`),
                  className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm px-5 py-2.5 rounded-[5px] inline-flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5`,
                  children: [
                    (0, x.jsx)(`span`, { children: `Get quotes` }),
                    (0, x.jsx)(k, { className: `w-4 h-4` }),
                  ],
                }),
              }),
            ],
          }),
        }),
      ],
    });
  },
  Me = ({ onNavigate: e }) =>
    (0, x.jsxs)(`footer`, {
      className: `bg-[#0e3037] text-[#c8d8d7] border-t border-[#1a444c] py-10 px-4 sm:px-6 lg:px-8 text-xs font-['DM_Sans']`,
      children: [
        (0, x.jsxs)(`div`, {
          className: `max-w-[1240px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6`,
          children: [
            (0, x.jsxs)(`div`, {
              className: `flex items-center gap-3`,
              children: [
                (0, x.jsx)(`img`, {
                  src: `/assets/urbanprocures-logo.png`,
                  width: `28`,
                  height: `32`,
                  alt: `Urban Procures`,
                  className: `opacity-90`,
                }),
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `font-extrabold text-white text-sm font-['Manrope']`,
                      children: `Urban Procures`,
                    }),
                    (0, x.jsx)(`span`, {
                      className: `text-[#a1b7b6] ml-2 text-[11px]`,
                      children: `· Dubai, United Arab Emirates`,
                    }),
                  ],
                }),
              ],
            }),
            (0, x.jsxs)(`nav`, {
              className: `flex flex-wrap items-center gap-6 text-[#c8d8d7]`,
              children: [
                (0, x.jsx)(`button`, {
                  onClick: () => e(`/get-a-quote`),
                  className: `hover:text-[#eb6a32] transition-colors`,
                  children: `Get a Quote`,
                }),
                (0, x.jsx)(`button`, {
                  onClick: () => e(`/contractor`),
                  className: `hover:text-[#eb6a32] transition-colors`,
                  children: `Contractor Portal`,
                }),
                (0, x.jsx)(`button`, {
                  onClick: () => e(`/vendor`),
                  className: `hover:text-[#eb6a32] transition-colors`,
                  children: `Vendor Portal`,
                }),
                (0, x.jsx)(`button`, {
                  onClick: () => e(`/admin`),
                  className: `hover:text-[#eb6a32] transition-colors text-[#a1b7b6]`,
                  children: `Admin`,
                }),
              ],
            }),
          ],
        }),
        (0, x.jsxs)(`div`, {
          className: `max-w-[1240px] mx-auto mt-6 pt-6 border-t border-[#1a444c] flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#86a1a0] gap-2`,
          children: [
            (0, x.jsxs)(`p`, {
              children: [
                `© `,
                new Date().getFullYear(),
                ` Urban Procures Advanced. All rights reserved.`,
              ],
            }),
            (0, x.jsx)(`p`, {
              children: `Regulated Service Charge model (2.5% standard / AED 500 minimum threshold).`,
            }),
          ],
        }),
      ],
    }),
  Ne = `/api`;
function Pe() {
  return null;
}
function Fe(e) {
  try {
    localStorage.removeItem(`urbanprocures_token`);
  } catch {}
}
async function I(e, t = {}) {
  let n = new Headers(t.headers || {});
  n.set(`Content-Type`, `application/json`);
  let r = Pe();
  r && n.set(`Authorization`, `Bearer ${r}`);
  let i = await fetch(`${Ne}${e}`, { ...t, headers: n }),
    a = await i.json();
  if (!a || typeof a != `object` || Array.isArray(a))
    throw Error(`Invalid server response`);
  let o = a;
  if (!i.ok || o.success === !1)
    throw (
      o.code &&
        [`TERMS_ACCEPTANCE_REQUIRED`, `REACCEPTANCE_REQUIRED`].includes(
          o.code,
        ) &&
        window.dispatchEvent(new CustomEvent(`urbanprocures:terms-required`)),
      Error(o.error || `Server request failed`)
    );
  return (
    t.method &&
      t.method !== `GET` &&
      window.dispatchEvent(new Event(`urbanprocures:updated`)),
    a
  );
}
var L = {
  discovery: async () => (await I(`/public/discovery`)).data,
  directory: (e) =>
    I(`/account/directory`, {
      method: `PATCH`,
      body: JSON.stringify({ visible: e }),
    }),
  terms: {
    get: (e, t = !1) => I(`/terms?role=${e}${t ? `&viewed=true` : ``}`),
    status: () => I(`/terms/status`),
    accept: (e) =>
      I(`/terms/accept`, {
        method: `POST`,
        body: JSON.stringify({ acceptTerms: !0, termsVersionId: e }),
      }),
    adminEvidence: (e = 0, t = !1) =>
      I(`/admin/terms/acceptances?offset=${e}${t ? `&type=get_a_quote` : ``}`),
  },
  auth: {
    login: async (e, t) => {
      let n = await I(`/auth/login`, {
        method: `POST`,
        body: JSON.stringify({ email: e, password: t }),
      });
      return (n.token && Fe(n.token), n);
    },
    registerContractor: async (e) => {
      let t = await I(`/auth/register-contractor`, {
        method: `POST`,
        body: JSON.stringify(e),
      });
      return (t.token && Fe(t.token), t);
    },
    registerVendor: async (e) => {
      let t = await I(`/auth/register-vendor`, {
        method: `POST`,
        body: JSON.stringify(e),
      });
      return (t.token && Fe(t.token), t);
    },
    logout: async () => {
      try {
        await I(`/auth/logout`, { method: `POST` });
      } finally {
        Fe(null);
      }
    },
    me: async () => I(`/auth/me`),
  },
  quotes: {
    createPublic: async (e) =>
      I(`/quotes/public`, { method: `POST`, body: JSON.stringify(e) }),
  },
  contractor: {
    changeStatus: async (e, t) =>
      I(`/contractor/rfqs/${e}/status`, {
        method: `PATCH`,
        body: JSON.stringify({ status: t }),
      }),
    removeRfq: async (e) => I(`/contractor/rfqs/${e}`, { method: `DELETE` }),
    getRfqs: async () => (await I(`/contractor/rfqs`)).data,
    updateRfq: async (e, t) =>
      (
        await I(`/contractor/rfqs/${e}`, {
          method: `PUT`,
          body: JSON.stringify(t),
        })
      ).data,
    createRfq: async (e) =>
      (await I(`/contractor/rfqs`, { method: `POST`, body: JSON.stringify(e) }))
        .data,
    getQuotations: async (e) =>
      (await I(`/contractor/rfqs/${e}/quotations`)).data,
    confirmAward: async (e, t) =>
      I(`/contractor/rfqs/${e}/award`, {
        method: `POST`,
        body: JSON.stringify({ quotationId: t }),
      }),
  },
  vendor: {
    withdrawQuote: (e, t) =>
      I(`/vendor/quotations/${e}/${t}`, { method: `POST`, body: `{}` }),
    getMatchingRfqs: async (e = `matching`) =>
      (await I(`/vendor/rfqs?scope=` + e)).data,
    submitQuote: async (e, t) =>
      (
        await I(`/vendor/rfqs/${e}/quote`, {
          method: `POST`,
          body: JSON.stringify(t),
        })
      ).data,
    getMyQuotes: async () => (await I(`/vendor/my-quotes`)).data,
    acceptTerms: async () => I(`/vendor/terms/accept`, { method: `POST` }),
  },
  admin: {
    getRevision: async () => (await I(`/admin/revision`)).data.revision,
    getNotifications: async () => (await I(`/admin/notifications`)).data,
    getDocumentHistory: async () => (await I(`/admin/documents/history`)).data,
    getRfqHistory: async () => (await I(`/admin/rfqs/history`)).data,
    getPublicQuotes: async () => (await I(`/admin/public-quotes`)).data,
    updatePublicQuoteStatus: async (e, t) =>
      I(`/admin/public-quotes/${e}`, {
        method: `PATCH`,
        body: JSON.stringify({ status: t }),
      }),
    getRfqs: async () => (await I(`/admin/rfqs`)).data,
    getAwards: async () => (await I(`/admin/awards`)).data,
    getQuotations: async (e = !1) =>
      (await I(e ? `/admin/quotations/history` : `/admin/quotations`)).data,
    verifyContractor: (e) =>
      I(`/admin/contractors/${e}/verification`, {
        method: `PATCH`,
        body: JSON.stringify({ verified: !0 }),
      }),
    releaseDocument: (e) =>
      I(`/admin/documents/${e}/release`, {
        method: `POST`,
        body: JSON.stringify({ identityReviewConfirmed: !0 }),
      }),
    verifyVendor: (e, t) =>
      I(`/admin/vendors/${e}/verification`, {
        method: `PATCH`,
        body: JSON.stringify({ status: t }),
      }),
    scheduleSiteVisit: (e, t, n) =>
      I(`/admin/public-quotes/${e}`, {
        method: `PATCH`,
        body: JSON.stringify({
          status: `site_visit_scheduled`,
          scheduledDate: t,
          inspectorName: n,
        }),
      }),
    publishRfq: async (e) =>
      I(`/admin/rfqs/${e}/publish`, {
        method: `POST`,
        body: JSON.stringify({ identityReviewConfirmed: !0 }),
      }),
    getUsers: async () => (await I(`/admin/users`)).data,
    updateUserStatus: async (e, t) =>
      I(`/admin/users/${e}/status`, {
        method: `PATCH`,
        body: JSON.stringify({ status: t }),
      }),
    getContractors: async () => (await I(`/admin/contractors`)).data,
    getVendors: async () => (await I(`/admin/vendors`)).data,
    getDocuments: async () => (await I(`/admin/documents`)).data,
    getServiceCharges: async () => (await I(`/admin/service-charges`)).data,
    getAuditLogs: async () => (await I(`/admin/audit-logs`)).data,
    getInvitations: async () => (await I(`/admin/invitations`)).data,
    sendInvitation: async (e, t, n) =>
      I(`/admin/invitations`, {
        method: `POST`,
        body: JSON.stringify({
          recipientEmail: e,
          organizationName: t,
          inviteType: n,
        }),
      }),
  },
  documents: {
    correct: (e, t) =>
      I(`/admin/documents/` + e + `/standardize`, {
        method: `PUT`,
        body: JSON.stringify(t),
      }),
    standardize: (e) =>
      I(`/admin/documents/` + e + `/standardize`, {
        method: `POST`,
        body: `{}`,
      }),
    upload: async (e) =>
      (
        await I(`/documents/upload`, {
          method: `POST`,
          body: JSON.stringify(e),
        })
      ).document,
    getViewUrl: (e) => `${Ne}/documents/${e}/view`,
    getDownloadUrl: (e) => `${Ne}/documents/${e}/download`,
  },
};
function Ie(e, t) {
  let n = (0, b.useRef)(e);
  ((n.current = e),
    (0, b.useEffect)(() => {
      if (!t) return;
      let e = !1,
        r = !1,
        i = async () => {
          if (!(e || r || document.visibilityState === `hidden`)) {
            e = !0;
            try {
              await n.current();
            } catch {
            } finally {
              e = !1;
            }
          }
        },
        a = window.setInterval(i, 5e3);
      return (
        window.addEventListener(`focus`, i),
        document.addEventListener(`visibilitychange`, i),
        window.addEventListener(`urbanprocures:updated`, i),
        () => {
          ((r = !0),
            clearInterval(a),
            window.removeEventListener(`focus`, i),
            document.removeEventListener(`visibilitychange`, i),
            window.removeEventListener(`urbanprocures:updated`, i));
        }
      );
    }, [t]));
}
var Le = ({ onNavigate: e }) => {
    let [t, n] = (0, b.useState)(null),
      [r, i] = (0, b.useState)(``),
      a = async () => {
        try {
          (n(await L.discovery()), i(``));
        } catch {
          i(`Listings are temporarily unavailable. Please try again shortly.`);
        }
      };
    return (
      b.useEffect(() => {
        a();
      }, []),
      Ie(a, !0),
      (0, x.jsxs)(`div`, {
        className: `bg-[#f7f6f2] text-[#123540] min-h-screen`,
        children: [
          (0, x.jsx)(`section`, {
            className: `relative bg-cover bg-center text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#e1e7e4]`,
            style: {
              backgroundImage: `linear-gradient(90deg, rgba(8,38,49,0.96) 0%, rgba(8,38,49,0.85) 45%, rgba(8,38,49,0.3) 100%), url(/assets/homepage-hero.png)`,
            },
            children: (0, x.jsxs)(`div`, {
              className: `max-w-[1240px] mx-auto`,
              children: [
                (0, x.jsx)(`p`, {
                  className: `text-xs sm:text-sm font-bold uppercase tracking-wider text-[#f6a47f] mb-3 font-['Manrope']`,
                  children: `Built for UAE construction & property`,
                }),
                (0, x.jsxs)(`h1`, {
                  className: `text-3xl sm:text-5xl lg:text-6xl font-extrabold font-['Manrope'] tracking-tight max-w-xl leading-[1.1] mb-5`,
                  children: [
                    `Your project.`,
                    (0, x.jsx)(`br`, {}),
                    `The right people.`,
                  ],
                }),
                (0, x.jsx)(`p`, {
                  className: `text-base sm:text-lg text-[#e3edeb] max-w-lg leading-relaxed mb-8`,
                  children: `Tell us what you need. We help connect your project with verified construction, fit-out, and specialist trade companies across the UAE.`,
                }),
                (0, x.jsxs)(`div`, {
                  className: `flex flex-wrap items-center gap-3`,
                  children: [
                    (0, x.jsxs)(`button`, {
                      onClick: () => e(`/get-a-quote`),
                      className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm sm:text-base px-6 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-all shadow-sm active:translate-y-0.5`,
                      children: [
                        (0, x.jsx)(`span`, { children: `Get quotes` }),
                        (0, x.jsx)(k, { className: `w-4 h-4` }),
                      ],
                    }),
                    (0, x.jsxs)(`button`, {
                      onClick: () => e(`/contractor`),
                      className: `border border-[#b6c7c9] hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-5 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-colors`,
                      children: [
                        (0, x.jsx)(`span`, { children: `For contractors` }),
                        (0, x.jsx)(k, { className: `w-4 h-4` }),
                      ],
                    }),
                    (0, x.jsxs)(`button`, {
                      onClick: () => e(`/vendor`),
                      className: `border border-[#b6c7c9] hover:bg-white/10 text-white font-semibold text-sm sm:text-base px-5 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-colors`,
                      children: [
                        (0, x.jsx)(`span`, { children: `For vendors` }),
                        (0, x.jsx)(k, { className: `w-4 h-4` }),
                      ],
                    }),
                  ],
                }),
                (0, x.jsx)(`p`, {
                  className: `text-xs text-[#b6c7c9] mt-8 uppercase tracking-widest font-mono`,
                  children: `Villas & Apartments · Fit-out · MEP · Construction · Technical Services`,
                }),
              ],
            }),
          }),
          (0, x.jsxs)(`section`, {
            className: `py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `mb-10 text-left`,
                children: [
                  (0, x.jsx)(`p`, {
                    className: `text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1`,
                    children: `A simpler way to get started`,
                  }),
                  (0, x.jsx)(`h2`, {
                    className: `text-2xl sm:text-4xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight`,
                    children: `What brings you here?`,
                  }),
                  (0, x.jsx)(`p`, {
                    className: `text-sm sm:text-base text-[#63797b] mt-2 max-w-xl`,
                    children: `Choose the option that fits. You can explore without complicated steps.`,
                  }),
                ],
              }),
              (0, x.jsxs)(`div`, {
                className: `grid grid-cols-1 md:grid-cols-3 gap-6`,
                children: [
                  (0, x.jsxs)(`div`, {
                    className: `bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        children: [
                          (0, x.jsxs)(`div`, {
                            className: `flex items-center justify-between gap-2 mb-3`,
                            children: [
                              (0, x.jsx)(`span`, {
                                className: `text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']`,
                                children: `I need work done`,
                              }),
                              (0, x.jsx)(`span`, {
                                className: `text-xs font-bold text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded font-mono`,
                                children: `No account needed`,
                              }),
                            ],
                          }),
                          (0, x.jsx)(`div`, {
                            className: `text-2xl text-[#eb6a32] mb-3`,
                            children: `⌂`,
                          }),
                          (0, x.jsx)(`h3`, {
                            className: `text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight`,
                            children: `Get a Quote`,
                          }),
                          (0, x.jsx)(`p`, {
                            className: `text-sm text-[#63797b] leading-relaxed mb-4`,
                            children: `Get quotes for your villa, apartment or personal property work. No account needed — just provide your details and work requirement to receive quotes from verified vendors.`,
                          }),
                          (0, x.jsxs)(`div`, {
                            className: `p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4] text-xs text-[#123540] mb-6`,
                            children: [
                              (0, x.jsx)(`strong`, {
                                className: `block text-[#123540] font-bold mb-0.5`,
                                children: `Optional AED 100 Site Visit`,
                              }),
                              (0, x.jsx)(`span`, {
                                className: `text-[#63797b]`,
                                children: `Have an Urban Procures representative visit your property to take measurements and assist with your requirement.`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`button`, {
                        onClick: () => e(`/get-a-quote`),
                        className: `w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5`,
                        children: [
                          (0, x.jsx)(`span`, {
                            children: `Get a Quote — no account needed`,
                          }),
                          (0, x.jsx)(k, { className: `w-4 h-4` }),
                        ],
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        children: [
                          (0, x.jsxs)(`div`, {
                            className: `flex items-center justify-between gap-2 mb-3`,
                            children: [
                              (0, x.jsx)(`span`, {
                                className: `text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']`,
                                children: `I run procurement`,
                              }),
                              (0, x.jsx)(`span`, {
                                className: `text-xs font-semibold text-[#63797b] font-mono`,
                                children: `Account required`,
                              }),
                            ],
                          }),
                          (0, x.jsx)(`div`, {
                            className: `text-2xl text-[#123f47] mb-3`,
                            children: `🏢`,
                          }),
                          (0, x.jsx)(`h3`, {
                            className: `text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight`,
                            children: `Contractor`,
                          }),
                          (0, x.jsx)(`p`, {
                            className: `text-sm text-[#63797b] leading-relaxed mb-4`,
                            children: `For main contractors, fit-out companies, interior design studios, and construction businesses. Manage your RFQ packages, Bill of Quantities, and compare quotations.`,
                          }),
                          (0, x.jsxs)(`ul`, {
                            className: `space-y-1.5 text-xs text-[#63797b] mb-6`,
                            children: [
                              (0, x.jsx)(`li`, {
                                children: `• Create and publish RFQs with BoQ line items`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Receive itemized quotations from verified vendors`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Compare vendor rates with pre-award identity masking`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Confirm awards with transparent service charge`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`button`, {
                        onClick: () => e(`/contractor`),
                        className: `w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5`,
                        children: [
                          (0, x.jsx)(`span`, {
                            children: `Contractor Login / Register`,
                          }),
                          (0, x.jsx)(k, { className: `w-4 h-4` }),
                        ],
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] hover:shadow-[0_12px_30px_rgba(25,60,65,0.08)] transition-all flex flex-col justify-between`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        children: [
                          (0, x.jsxs)(`div`, {
                            className: `flex items-center justify-between gap-2 mb-3`,
                            children: [
                              (0, x.jsx)(`span`, {
                                className: `text-[#a8b8b8] font-bold text-xs uppercase tracking-wider font-['Manrope']`,
                                children: `I supply products / services`,
                              }),
                              (0, x.jsx)(`span`, {
                                className: `text-xs font-semibold text-[#63797b] font-mono`,
                                children: `Account required`,
                              }),
                            ],
                          }),
                          (0, x.jsx)(`div`, {
                            className: `text-2xl text-[#123f47] mb-3`,
                            children: `◇`,
                          }),
                          (0, x.jsx)(`h3`, {
                            className: `text-2xl font-extrabold text-[#123540] font-['Manrope'] mb-3 tracking-tight`,
                            children: `Vendor`,
                          }),
                          (0, x.jsx)(`p`, {
                            className: `text-sm text-[#63797b] leading-relaxed mb-4`,
                            children: `For suppliers, vendors, subcontractors, and specialist service providers. Discover all approved project RFQs and submit competitive quotations.`,
                          }),
                          (0, x.jsxs)(`ul`, {
                            className: `space-y-1.5 text-xs text-[#63797b] mb-6`,
                            children: [
                              (0, x.jsx)(`li`, {
                                children: `• Receive RFQs relevant to your trade specialization`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Review drawings and BoQ specifications securely`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Submit itemized unit rates and commercial terms`,
                              }),
                              (0, x.jsx)(`li`, {
                                children: `• Win contracts with post-award contact release`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`button`, {
                        onClick: () => e(`/vendor`),
                        className: `w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3.5 px-4 rounded-[5px] text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:translate-y-0.5`,
                        children: [
                          (0, x.jsx)(`span`, {
                            children: `Vendor Login / Register`,
                          }),
                          (0, x.jsx)(k, { className: `w-4 h-4` }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, x.jsx)(`section`, {
            className: `py-14 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-[#e1e7e4] bg-[#eef3f1]/40`,
            children: (0, x.jsxs)(`div`, {
              className: `max-w-[1240px] mx-auto`,
              children: [
                (0, x.jsxs)(`div`, {
                  className: `mb-10 text-left`,
                  children: [
                    (0, x.jsx)(`p`, {
                      className: `text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1`,
                      children: `How it works`,
                    }),
                    (0, x.jsx)(`h2`, {
                      className: `text-2xl sm:text-3xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight`,
                      children: `How it works, simply.`,
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm`,
                      children: [
                        (0, x.jsx)(`span`, {
                          className: `font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2`,
                          children: `01`,
                        }),
                        (0, x.jsx)(`h4`, {
                          className: `font-extrabold text-base text-[#123540] font-['Manrope'] mb-1`,
                          children: `Tell us what you need`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `text-xs text-[#63797b] leading-relaxed`,
                          children: `Add a short description of the work and upload photos or layout drawings if you have them.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm`,
                      children: [
                        (0, x.jsx)(`span`, {
                          className: `font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2`,
                          children: `02`,
                        }),
                        (0, x.jsx)(`h4`, {
                          className: `font-extrabold text-base text-[#123540] font-['Manrope'] mb-1`,
                          children: `We review your request`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `text-xs text-[#63797b] leading-relaxed`,
                          children: `Our team checks the details and shares the requirement with suitable, verified UAE businesses.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm`,
                      children: [
                        (0, x.jsx)(`span`, {
                          className: `font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2`,
                          children: `03`,
                        }),
                        (0, x.jsx)(`h4`, {
                          className: `font-extrabold text-base text-[#123540] font-['Manrope'] mb-1`,
                          children: `Receive quotations`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `text-xs text-[#63797b] leading-relaxed`,
                          children: `Look through the competitive offers and ask for clarification directly.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm`,
                      children: [
                        (0, x.jsx)(`span`, {
                          className: `font-extrabold text-[#eb6a32] text-xl font-['Manrope'] block mb-2`,
                          children: `04`,
                        }),
                        (0, x.jsx)(`h4`, {
                          className: `font-extrabold text-base text-[#123540] font-['Manrope'] mb-1`,
                          children: `Choose what works`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `text-xs text-[#63797b] leading-relaxed`,
                          children: `Pick the right offer for your needs and budget. Contact details are securely released.`,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
          (0, x.jsx)(`section`, {
            className: `py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#123f47] text-white`,
            children: (0, x.jsxs)(`div`, {
              className: `max-w-[1240px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6`,
              children: [
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight mb-2`,
                      children: `Have a project in mind?`,
                    }),
                    (0, x.jsx)(`p`, {
                      className: `text-sm sm:text-base text-[#c3d9d8]`,
                      children: `It takes just a few minutes to tell us what you need.`,
                    }),
                  ],
                }),
                (0, x.jsxs)(`button`, {
                  onClick: () => e(`/get-a-quote`),
                  className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold text-sm px-6 py-3.5 rounded-[5px] inline-flex items-center gap-2 transition-all shadow-md active:translate-y-0.5 whitespace-nowrap`,
                  children: [
                    (0, x.jsx)(`span`, { children: `Get quotes` }),
                    (0, x.jsx)(k, { className: `w-4 h-4` }),
                  ],
                }),
              ],
            }),
          }),
          (0, x.jsxs)(`section`, {
            className: `max-w-[1240px] mx-auto px-4 sm:px-6 py-12 space-y-8`,
            children: [
              (0, x.jsxs)(`div`, {
                children: [
                  (0, x.jsx)(`h2`, {
                    className: `text-2xl font-extrabold font-['Manrope']`,
                    children: `Published RFQ opportunities`,
                  }),
                  (0, x.jsx)(`p`, {
                    className: `text-sm text-[#63797b]`,
                    children: `Admin-approved opportunities. Sign in as a verified Vendor to review and quote on any approved RFQ.`,
                  }),
                  r && (0, x.jsx)(`p`, { role: `status`, children: r }),
                  (0, x.jsx)(`div`, {
                    className: `grid md:grid-cols-3 gap-4 mt-4`,
                    children: t?.rfqs.map((t) =>
                      (0, x.jsxs)(
                        `article`,
                        {
                          className: `bg-white border rounded p-5`,
                          children: [
                            (0, x.jsxs)(`small`, {
                              children: [
                                t.referenceCode,
                                ` · `,
                                t.category,
                                ` · `,
                                t.emirate,
                              ],
                            }),
                            (0, x.jsx)(`h3`, {
                              className: `font-bold mt-2`,
                              children: t.title,
                            }),
                            (0, x.jsxs)(`p`, {
                              className: `text-sm`,
                              children: [
                                `Deadline: `,
                                new Date(
                                  t.submissionDeadline,
                                ).toLocaleDateString(),
                              ],
                            }),
                            (0, x.jsx)(`button`, {
                              className: `text-[#eb6a32] underline mt-3`,
                              onClick: () => e(`/vendor`),
                              children: `Sign in to view and quote`,
                            }),
                          ],
                        },
                        t.referenceCode,
                      ),
                    ),
                  }),
                  t &&
                    t.rfqs.length === 0 &&
                    (0, x.jsx)(`p`, {
                      className: `mt-4`,
                      children: `No open approved RFQs currently. New opportunities will appear here after Admin review.`,
                    }),
                ],
              }),
              (0, x.jsxs)(`div`, {
                children: [
                  (0, x.jsx)(`h2`, {
                    className: `text-2xl font-extrabold font-['Manrope']`,
                    children: `Verified business community`,
                  }),
                  (0, x.jsx)(`p`, {
                    className: `text-sm text-[#63797b]`,
                    children: `Businesses verified by Admin that have chosen a public listing.`,
                  }),
                  (0, x.jsx)(`div`, {
                    className: `grid md:grid-cols-2 gap-6 mt-4`,
                    children: [`contractors`, `vendors`].map((n) =>
                      (0, x.jsxs)(
                        `div`,
                        {
                          children: [
                            (0, x.jsx)(`h3`, {
                              className: `font-bold text-lg capitalize`,
                              children: n,
                            }),
                            t?.[n].map((e, t) =>
                              (0, x.jsxs)(
                                `article`,
                                {
                                  className: `bg-white border rounded p-4 mt-3`,
                                  children: [
                                    (0, x.jsx)(`strong`, {
                                      children: e.companyName,
                                    }),
                                    (0, x.jsxs)(`p`, {
                                      className: `text-sm`,
                                      children: [
                                        e.emirate ?? e.emirates.join(`, `),
                                        e.categories &&
                                          ` · ` + e.categories.join(`, `),
                                      ],
                                    }),
                                    (0, x.jsx)(`small`, {
                                      children: `Admin verified`,
                                    }),
                                  ],
                                },
                                t,
                              ),
                            ),
                            t &&
                              t[n].length === 0 &&
                              (0, x.jsx)(`p`, {
                                className: `mt-3 text-sm`,
                                children: `Public listings will appear as verified businesses opt in.`,
                              }),
                            (0, x.jsxs)(`button`, {
                              className: `text-[#eb6a32] underline mt-4`,
                              onClick: () =>
                                e(
                                  `/` +
                                    (n === `vendors` ? `vendor` : `contractor`),
                                ),
                              children: [
                                `Join as a `,
                                n === `vendors` ? `Vendor` : `Contractor`,
                              ],
                            }),
                          ],
                        },
                        n,
                      ),
                    ),
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  },
  Re = {
    pdf: `application/pdf`,
    png: `image/png`,
    jpg: `image/jpeg`,
    jpeg: `image/jpeg`,
    xlsx: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
    xls: `application/vnd.ms-excel`,
    dwg: `image/vnd.dwg`,
    dxf: `application/dxf`,
  },
  ze = `.pdf,.png,.jpg,.jpeg,.xlsx,.xls,.dwg,.dxf`;
function Be(e) {
  return Re[e.split(`.`).pop()?.toLowerCase() ?? ``];
}
function Ve({
  files: e,
  onChange: t,
  onBusy: n,
  disabled: r = !1,
  id: i,
  label: a = `Upload BOQ, drawings or supporting documents (optional)`,
}) {
  let [o, s] = (0, b.useState)(``),
    [c, l] = (0, b.useState)(!1),
    u = (0, b.useRef)(!1);
  return (0, x.jsxs)(`div`, {
    className: `space-y-2 text-xs`,
    children: [
      (0, x.jsxs)(`label`, {
        className: `block font-semibold`,
        children: [
          a,
          (0, x.jsx)(`input`, {
            "aria-label": a,
            type: `file`,
            id: i,
            multiple: !0,
            accept: ze,
            disabled: r || c,
            onChange: async (r) => {
              if (u.current) return;
              let i = Array.from(r.target.files ?? []);
              if (
                ((r.target.value = ``),
                s(``),
                e.length + i.length > 5 ||
                  i.some((e) => !Be(e.name) || !e.size || e.size > 1e7) ||
                  e.reduce((e, t) => e + t.fileSizeBytes, 0) +
                    i.reduce((e, t) => e + t.size, 0) >
                    2e7)
              ) {
                s(
                  `Choose supported files: up to 5 files, 10 MB each and 20 MB combined.`,
                );
                return;
              }
              ((u.current = !0), l(!0), n(!0));
              try {
                let n = await Promise.all(
                  i.map(async (e) => ({
                    fileName: e.name,
                    fileType: e.type || Be(e.name),
                    fileSizeBytes: e.size,
                    documentPurpose: `other`,
                    dataUrl: await new Promise((t, n) => {
                      let r = new FileReader();
                      ((r.onload = () => t(String(r.result))),
                        (r.onerror = () =>
                          n(
                            Error(
                              `File could not be read. Please select it again.`,
                            ),
                          )),
                        r.readAsDataURL(e));
                    }),
                  })),
                );
                t([...e, ...n]);
              } catch (e) {
                s(e instanceof Error ? e.message : `File could not be read.`);
              } finally {
                ((u.current = !1), l(!1), n(!1));
              }
            },
            className: `block w-full mt-2 p-3 border border-dashed border-[#bccbca] rounded bg-[#f7f6f2]`,
          }),
        ],
      }),
      (0, x.jsx)(`p`, {
        className: `text-[#63797b]`,
        children: `PDF, Excel (.xls/.xlsx), drawings (.dwg/.dxf), PNG and JPEG. Up to 5 files; 10 MB each, 20 MB combined. PDFs and images can be previewed; Excel and CAD files can be downloaded.`,
      }),
      c && (0, x.jsx)(`p`, { role: `status`, children: `Reading files…` }),
      o &&
        (0, x.jsx)(`p`, {
          role: `alert`,
          className: `text-red-700`,
          children: o,
        }),
      e.map((n, i) =>
        (0, x.jsxs)(
          `div`,
          {
            className: `flex flex-wrap items-center gap-2 p-2 border border-[#e1e7e4] rounded`,
            children: [
              (0, x.jsxs)(`span`, {
                className: `break-all flex-1`,
                children: [
                  n.fileName,
                  ` (`,
                  (n.fileSizeBytes / 1024).toFixed(0),
                  ` KB)`,
                ],
              }),
              (0, x.jsx)(`select`, {
                "aria-label": `Purpose of ` + n.fileName,
                disabled: r || c,
                value: n.documentPurpose,
                onChange: (n) =>
                  t(
                    e.map((e, t) =>
                      t === i ? { ...e, documentPurpose: n.target.value } : e,
                    ),
                  ),
                children: [
                  `boq`,
                  `drawing`,
                  `specification`,
                  `photo`,
                  `other`,
                ].map((e) =>
                  (0, x.jsx)(
                    `option`,
                    { value: e, children: e === `boq` ? `BOQ` : e },
                    e,
                  ),
                ),
              }),
              (0, x.jsx)(`button`, {
                type: `button`,
                disabled: r || c,
                onClick: () => t(e.filter((e, t) => i !== t)),
                className: `underline text-red-700`,
                "aria-label": `Remove ` + n.fileName,
                children: `Remove`,
              }),
            ],
          },
          i,
        ),
      ),
    ],
  });
}
function He({ role: e, checked: t, onChange: n, onDocument: r }) {
  let [i, a] = (0, b.useState)(null),
    [o, s] = (0, b.useState)(!1),
    [c, l] = (0, b.useState)(``);
  (0, b.useEffect)(() => {
    let t = !0;
    return (
      n(!1),
      r(null),
      L.terms
        .get(e)
        .then((e) => {
          t && (a(e.data), r(e.data));
        })
        .catch((e) => {
          t && l(e.message);
        }),
      () => {
        t = !1;
      }
    );
  }, [e]);
  let u =
    e === `vendor`
      ? `I have read and agree to the Urban Procures Vendor Terms & Conditions, including the applicable Urban Procures Service Charge and manpower-related charges where applicable.`
      : e === `contractor`
        ? `I have read and agree to the Urban Procures Contractor / Client Terms & Conditions.`
        : `I confirm that the information provided is accurate and agree to the Urban Procures Get a Quote Terms and Privacy Notice.`;
  return (0, x.jsxs)(`div`, {
    className: `space-y-3 text-xs text-[#123540]`,
    children: [
      (0, x.jsx)(`button`, {
        type: `button`,
        onClick: async () => {
          try {
            let t = await L.terms.get(e, !0);
            (i?.id !== t.data.id && n(!1), a(t.data), r(t.data), s(!0));
          } catch (e) {
            (l(e.message), n(!1), r(null));
          }
        },
        disabled: !i,
        className: `font-bold text-[#123f47] underline disabled:opacity-50`,
        children:
          e === `vendor`
            ? `VIEW VENDOR TERMS & CONDITIONS`
            : e === `contractor`
              ? `VIEW CONTRACTOR / CLIENT TERMS & CONDITIONS`
              : `VIEW GET A QUOTE TERMS AND PRIVACY NOTICE`,
      }),
      i &&
        (0, x.jsxs)(`div`, {
          className: `text-[#63797b]`,
          children: [`Version `, i.terms_version],
        }),
      c &&
        (0, x.jsx)(`p`, {
          role: `alert`,
          className: `text-red-700`,
          children: c,
        }),
      (0, x.jsxs)(`label`, {
        className: `flex items-start gap-3`,
        children: [
          (0, x.jsx)(`input`, {
            type: `checkbox`,
            checked: t,
            disabled: !i,
            onChange: (e) => n(e.target.checked),
            className: `mt-0.5 accent-[#eb6a32]`,
          }),
          (0, x.jsx)(`span`, { children: u }),
        ],
      }),
      e === `contractor` &&
        (0, x.jsx)(`p`, {
          children: `Contractor / Client Service Charge: AED 0.`,
        }),
      o &&
        i &&
        (0, x.jsx)(`div`, {
          className: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80`,
          children: (0, x.jsxs)(`section`, {
            role: `dialog`,
            "aria-modal": `true`,
            "aria-label": i.title,
            className: `bg-white rounded-[6px] border border-[#e1e7e4] max-w-2xl w-full max-h-[85vh] flex flex-col`,
            children: [
              (0, x.jsxs)(`header`, {
                className: `p-5 bg-[#123f47] text-white flex justify-between gap-4`,
                children: [
                  (0, x.jsxs)(`h2`, {
                    children: [i.title, ` — `, i.terms_version],
                  }),
                  (0, x.jsx)(`button`, {
                    type: `button`,
                    "aria-label": `Close Terms`,
                    onClick: () => s(!1),
                    children: `×`,
                  }),
                ],
              }),
              (0, x.jsx)(`div`, {
                className: `overflow-y-auto p-6`,
                children: (0, x.jsx)(`pre`, {
                  className: `whitespace-pre-wrap font-['DM_Sans'] text-xs leading-relaxed`,
                  children: i.content_text,
                }),
              }),
            ],
          }),
        }),
    ],
  });
}
function Ue({ role: e, onAccepted: t }) {
  let [n, r] = (0, b.useState)(!1),
    [i, a] = (0, b.useState)(null),
    [o, s] = (0, b.useState)(!1),
    [c, l] = (0, b.useState)(``);
  return (0, x.jsxs)(`section`, {
    className: `max-w-2xl mx-auto my-8 p-8 bg-white rounded-[6px] border border-[#e1e7e4] space-y-5`,
    children: [
      (0, x.jsx)(`h2`, {
        className: `font-bold text-[#123540]`,
        children: `Current Terms acceptance required`,
      }),
      (0, x.jsx)(He, { role: e, checked: n, onChange: r, onDocument: a }),
      c && (0, x.jsx)(`p`, { role: `alert`, children: c }),
      (0, x.jsx)(`button`, {
        disabled: !n || !i || o,
        className: `bg-[#eb6a32] text-white rounded px-5 py-3 disabled:opacity-50`,
        onClick: async () => {
          if (n && i) {
            s(!0);
            try {
              (await L.terms.accept(i.id), t());
            } catch (e) {
              l(e.message);
            } finally {
              s(!1);
            }
          }
        },
        children: `Accept Current Terms`,
      }),
    ],
  });
}
var We = ({ onNavigate: e }) => {
  let { showToast: t } = Ae(),
    [n, r] = (0, b.useState)(``),
    [i, a] = (0, b.useState)(`+971 `),
    [o, s] = (0, b.useState)(``),
    [c, l] = (0, b.useState)(`villa`),
    [u, d] = (0, b.useState)(`Dubai`),
    [f, p] = (0, b.useState)(``),
    [m, h] = (0, b.useState)(`Interior Fit-Out & Renovation`),
    [g, _] = (0, b.useState)(``),
    [v, y] = (0, b.useState)(`AED 20,000 - 50,000`),
    [S, ee] = (0, b.useState)(!1),
    [C, w] = (0, b.useState)([]),
    [te, T] = (0, b.useState)(!1),
    [E, D] = (0, b.useState)(null),
    [O, ne] = (0, b.useState)(!1),
    [re, ie] = (0, b.useState)(null),
    [A, ae] = (0, b.useState)(null),
    [oe, le] = (0, b.useState)(!1);
  return A
    ? (0, x.jsx)(`div`, {
        className: `bg-[#f7f6f2] min-h-screen py-16 px-4 sm:px-6 lg:px-8`,
        children: (0, x.jsxs)(`div`, {
          className: `max-w-2xl mx-auto bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.06)] p-8 sm:p-10 text-center`,
          children: [
            (0, x.jsx)(`div`, {
              className: `w-14 h-14 rounded-full bg-[#eef6f5] text-[#123f47] flex items-center justify-center mx-auto mb-5`,
              children: (0, x.jsx)(ce, { className: `w-8 h-8 text-[#eb6a32]` }),
            }),
            (0, x.jsx)(`span`, {
              className: `text-xs uppercase font-mono tracking-widest text-[#eb6a32] bg-[#eb6a32]/10 px-3 py-1 rounded font-bold`,
              children: `Request Received`,
            }),
            (0, x.jsxs)(`h2`, {
              className: `text-2xl sm:text-3xl font-extrabold text-[#123540] mt-3 font-['Manrope']`,
              children: [`Thank you, `, A.customerName || A.customer_name, `!`],
            }),
            (0, x.jsxs)(`p`, {
              className: `text-[#63797b] text-sm mt-3 leading-relaxed`,
              children: [
                `Your quotation request has been received.`,
                A.siteVisitRequested || A.site_visit_requested
                  ? (0, x.jsx)(`span`, {
                      className: `block mt-2 font-semibold text-[#123540] bg-[#f7f6f2] p-3 rounded border border-[#e1e7e4]`,
                      children: `★ AED 100 Site Visit Selected: An Urban Procures representative will contact you to arrange an on-site dimension inspection.`,
                    })
                  : (0, x.jsx)(`span`, {
                      className: `block mt-2 text-[#63797b]`,
                      children: `Verified UAE contractors and vendors will review your requirement and prepare competitive quotations.`,
                    }),
              ],
            }),
            (0, x.jsxs)(`div`, {
              className: `my-8 p-6 bg-[#f7f6f2] border border-[#e1e7e4] rounded-[6px] text-left space-y-2.5 text-xs text-[#123540]`,
              children: [
                (0, x.jsxs)(`div`, {
                  className: `flex justify-between items-center pb-2 border-b border-[#e1e7e4]`,
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `text-[#63797b]`,
                      children: `Reference Tracking Code`,
                    }),
                    (0, x.jsx)(`span`, {
                      className: `font-mono font-bold text-sm text-[#123540]`,
                      children: A.referenceCode || A.reference_code,
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `flex justify-between items-center`,
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `text-[#63797b]`,
                      children: `Property Type`,
                    }),
                    (0, x.jsx)(`span`, {
                      className: `font-semibold capitalize`,
                      children: A.propertyType || A.property_type,
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `flex justify-between items-center`,
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `text-[#63797b]`,
                      children: `Location`,
                    }),
                    (0, x.jsxs)(`span`, {
                      className: `font-semibold`,
                      children: [
                        A.locationCommunity || A.location_community,
                        `,`,
                        ` `,
                        A.locationEmirate || A.location_emirate,
                      ],
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `flex justify-between items-center`,
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `text-[#63797b]`,
                      children: `Work Scope`,
                    }),
                    (0, x.jsx)(`span`, {
                      className: `font-semibold`,
                      children: A.workCategory || A.work_category,
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `flex justify-between items-center pt-2 border-t border-[#e1e7e4]`,
                  children: [
                    (0, x.jsx)(`span`, {
                      className: `text-[#63797b]`,
                      children: `Site Visit Option`,
                    }),
                    (0, x.jsx)(`span`, {
                      className: `font-bold text-[#eb6a32]`,
                      children:
                        A.siteVisitRequested || A.site_visit_requested
                          ? `AED 100 Site Visit Included`
                          : `Direct Submission (AED 0)`,
                    }),
                  ],
                }),
              ],
            }),
            (0, x.jsxs)(`div`, {
              className: `flex flex-col sm:flex-row gap-3 justify-center`,
              children: [
                (0, x.jsx)(`button`, {
                  onClick: () => {
                    (ae(null), _(``), w([]));
                  },
                  className: `bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-6 rounded-[5px] text-xs transition-colors`,
                  children: `Submit Another Request`,
                }),
                (0, x.jsx)(`button`, {
                  onClick: () => e(`/`),
                  className: `border border-[#bccbca] hover:bg-[#f7f6f2] text-[#123540] font-bold py-3 px-6 rounded-[5px] text-xs transition-colors`,
                  children: `Back to Home`,
                }),
              ],
            }),
          ],
        }),
      })
    : (0, x.jsx)(`div`, {
        className: `bg-[#f7f6f2] min-h-screen py-12 px-4 sm:px-6 lg:px-8 text-[#123540]`,
        children: (0, x.jsxs)(`div`, {
          className: `max-w-3xl mx-auto`,
          children: [
            (0, x.jsxs)(`div`, {
              className: `mb-8 text-left`,
              children: [
                (0, x.jsx)(`p`, {
                  className: `text-xs font-bold uppercase tracking-wider text-[#63797b] font-['Manrope'] mb-1`,
                  children: `Get a Quote · No Account Needed`,
                }),
                (0, x.jsx)(`h1`, {
                  className: `text-2xl sm:text-4xl font-extrabold text-[#123540] font-['Manrope'] tracking-tight`,
                  children: `Get quotes for your villa, apartment or personal property work`,
                }),
                (0, x.jsx)(`p`, {
                  className: `text-sm text-[#63797b] mt-2 leading-relaxed`,
                  children: `No account or registration required. Provide your details and work requirement to receive quotations from verified UAE vendors.`,
                }),
              ],
            }),
            (0, x.jsxs)(`form`, {
              onSubmit: async (e) => {
                if ((e.preventDefault(), !(oe || te))) {
                  if ((D(null), !O || !re)) {
                    D(
                      `Please affirmatively accept the Get a Quote Terms and Privacy Notice.`,
                    );
                    return;
                  }
                  if (!n.trim() || !i.trim() || !o.trim() || !g.trim()) {
                    D(
                      `Please fill in your name, contact phone, email, and work description.`,
                    );
                    return;
                  }
                  le(!0);
                  try {
                    let e = await L.quotes.createPublic({
                      customerName: n.trim(),
                      customerPhone: i.trim(),
                      customerEmail: o.trim(),
                      propertyType: c,
                      locationEmirate: u,
                      locationCommunity: f.trim() || `${u} Area`,
                      workCategory: m,
                      description: g.trim(),
                      budgetBracket: v,
                      siteVisitRequested: S,
                      attachments: C,
                      acceptTerms: O,
                      termsVersionId: re.id,
                    });
                    (ae(e.data),
                      ne(!1),
                      t(
                        `Quotation request ${e.data.referenceCode || e.data.reference_code} created successfully!`,
                        `success`,
                        `Request Submitted`,
                      ));
                  } catch (e) {
                    (D(
                      e.message ||
                        `Failed to submit quote request. Please try again.`,
                    ),
                      t(
                        e.message || `Failed to submit quote request`,
                        `error`,
                      ));
                  } finally {
                    le(!1);
                  }
                }
              },
              className: `bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.05)] p-6 sm:p-10 space-y-8`,
              children: [
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsxs)(`h3`, {
                      className: `text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']`,
                      children: [
                        (0, x.jsx)(P, { className: `w-4 h-4 text-[#eb6a32]` }),
                        `1. Your Contact Information`,
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-3 gap-4`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsxs)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: [
                                `Full Name `,
                                (0, x.jsx)(`span`, {
                                  className: `text-[#eb6a32]`,
                                  children: `*`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`input`, {
                              type: `text`,
                              required: !0,
                              placeholder: `e.g. Fatima Al-Zahra`,
                              value: n,
                              onChange: (e) => r(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsxs)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: [
                                `Phone Number `,
                                (0, x.jsx)(`span`, {
                                  className: `text-[#eb6a32]`,
                                  children: `*`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`input`, {
                              type: `tel`,
                              required: !0,
                              placeholder: `+971 50 123 4567`,
                              value: i,
                              onChange: (e) => a(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd] font-mono`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsxs)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: [
                                `Email Address `,
                                (0, x.jsx)(`span`, {
                                  className: `text-[#eb6a32]`,
                                  children: `*`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`input`, {
                              type: `email`,
                              required: !0,
                              placeholder: `you@domain.ae`,
                              value: o,
                              onChange: (e) => s(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsxs)(`h3`, {
                      className: `text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']`,
                      children: [
                        (0, x.jsx)(ge, { className: `w-4 h-4 text-[#eb6a32]` }),
                        `2. Property & Location`,
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-3 gap-4`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: `Property Type`,
                            }),
                            (0, x.jsxs)(`select`, {
                              value: c,
                              onChange: (e) => l(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]`,
                              children: [
                                (0, x.jsx)(`option`, {
                                  value: `villa`,
                                  children: `Private Villa`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `apartment`,
                                  children: `Apartment`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `townhouse`,
                                  children: `Townhouse`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `commercial_personal`,
                                  children: `Personal Office / Studio`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: `Emirate`,
                            }),
                            (0, x.jsxs)(`select`, {
                              value: u,
                              onChange: (e) => d(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]`,
                              children: [
                                (0, x.jsx)(`option`, {
                                  value: `Dubai`,
                                  children: `Dubai`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Abu Dhabi`,
                                  children: `Abu Dhabi`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Sharjah`,
                                  children: `Sharjah`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Ajman`,
                                  children: `Ajman`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Ras Al Khaimah`,
                                  children: `Ras Al Khaimah`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Umm Al Quwain`,
                                  children: `Umm Al Quwain`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `Fujairah`,
                                  children: `Fujairah`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: `Community / Area`,
                            }),
                            (0, x.jsx)(`input`, {
                              type: `text`,
                              placeholder: `e.g. Palm Jumeirah, Dubai Hills`,
                              value: f,
                              onChange: (e) => p(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] bg-[#fdfdfd]`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsxs)(`h3`, {
                      className: `text-base font-bold text-[#123540] pb-2 border-b border-[#e1e7e4] mb-4 flex items-center gap-2 font-['Manrope']`,
                      children: [
                        (0, x.jsx)(pe, { className: `w-4 h-4 text-[#eb6a32]` }),
                        `3. Work Requirement`,
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `space-y-4`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`label`, {
                                  className: `block text-xs font-semibold text-[#123540] mb-1`,
                                  children: `Trade / Category`,
                                }),
                                (0, x.jsxs)(`select`, {
                                  value: m,
                                  onChange: (e) => h(e.target.value),
                                  className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]`,
                                  children: [
                                    (0, x.jsx)(`option`, {
                                      value: `Interior Fit-Out & Renovation`,
                                      children: `Interior Fit-Out & Full Renovation`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Joinery & Custom Cabinetry`,
                                      children: `Custom Joinery, Wardrobes & Kitchens`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Pergola, Decking & Exterior Joinery`,
                                      children: `Pergola, Decking & Garden Carpentry`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Painting & Decorative Wall Finishes`,
                                      children: `Painting & Wall Finishes`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Flooring, Marble & Tiling`,
                                      children: `Flooring, Natural Marble & Tiles`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Plumbing, Sanitary & Bathrooms`,
                                      children: `Bathroom Remodeling & Sanitary`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Electrical & Architectural Lighting`,
                                      children: `Electrical & Lighting`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Acoustic Ceilings & Partitions`,
                                      children: `Acoustic Ceilings & Partitions`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `Landscaping & Swimming Pools`,
                                      children: `Landscaping & Pool Work`,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`label`, {
                                  className: `block text-xs font-semibold text-[#123540] mb-1`,
                                  children: `Estimated Budget Bracket`,
                                }),
                                (0, x.jsxs)(`select`, {
                                  value: v,
                                  onChange: (e) => y(e.target.value),
                                  className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white focus:outline-none focus:border-[#eb6a32]`,
                                  children: [
                                    (0, x.jsx)(`option`, {
                                      value: `Under AED 15,000`,
                                      children: `Under AED 15,000`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `AED 15,000 - 30,000`,
                                      children: `AED 15,000 - 30,000`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `AED 30,000 - 60,000`,
                                      children: `AED 30,000 - 60,000`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `AED 60,000 - 120,000`,
                                      children: `AED 60,000 - 120,000`,
                                    }),
                                    (0, x.jsx)(`option`, {
                                      value: `AED 120,000+`,
                                      children: `AED 120,000+`,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsxs)(`label`, {
                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                              children: [
                                `Describe the Work Required `,
                                (0, x.jsx)(`span`, {
                                  className: `text-[#eb6a32]`,
                                  children: `*`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`textarea`, {
                              rows: 4,
                              required: !0,
                              placeholder: `Tell us what you need in simple words (dimensions, what needs fixing or building, timeline, specific materials if known)...`,
                              value: g,
                              onChange: (e) => _(e.target.value),
                              className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32] leading-relaxed bg-[#fdfdfd]`,
                            }),
                          ],
                        }),
                        (0, x.jsx)(`div`, {
                          children: (0, x.jsx)(Ve, {
                            id: `quote-file`,
                            files: C,
                            onChange: w,
                            onBusy: T,
                            disabled: oe || te,
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, x.jsxs)(`div`, {
                  className: `border-t border-[#e1e7e4] pt-6`,
                  children: [
                    (0, x.jsx)(`h3`, {
                      className: `text-base font-bold text-[#123540] mb-2 font-['Manrope']`,
                      children: `4. Choose Your Service Option`,
                    }),
                    (0, x.jsx)(`p`, {
                      className: `text-xs text-[#63797b] mb-4`,
                      children: `Select whether to submit directly or request an in-person site measurement visit.`,
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          onClick: () => ee(!1),
                          className: `p-5 rounded-[6px] border-2 cursor-pointer transition-all ${S ? `border-[#e1e7e4] hover:border-[#bccbca] bg-white` : `border-[#eb6a32] bg-[#eb6a32]/5 ring-1 ring-[#eb6a32]`}`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `flex items-center justify-between mb-2`,
                              children: [
                                (0, x.jsx)(`span`, {
                                  className: `font-bold text-[#123540] text-sm font-['Manrope']`,
                                  children: `Submit requirement directly`,
                                }),
                                (0, x.jsx)(`span`, {
                                  className: `text-xs font-bold text-[#123f47] font-mono`,
                                  children: `FREE (AED 0)`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`p`, {
                              className: `text-xs text-[#63797b] leading-relaxed`,
                              children: `Submit your details directly. Urban Procures will review your requirement and share it with suitable verified vendors.`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          onClick: () => ee(!0),
                          className: `p-5 rounded-[6px] border-2 cursor-pointer transition-all relative ${S ? `border-[#eb6a32] bg-[#eb6a32]/10 ring-1 ring-[#eb6a32]` : `border-[#e1e7e4] hover:border-[#bccbca] bg-white`}`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `flex items-center justify-between mb-2`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  className: `flex items-center gap-1.5`,
                                  children: [
                                    (0, x.jsx)(we, {
                                      className: `w-4 h-4 text-[#eb6a32]`,
                                    }),
                                    (0, x.jsx)(`span`, {
                                      className: `font-bold text-[#123540] text-sm font-['Manrope']`,
                                      children: `Request AED 100 site visit`,
                                    }),
                                  ],
                                }),
                                (0, x.jsx)(`span`, {
                                  className: `text-xs font-extrabold text-[#eb6a32] bg-[#eb6a32]/15 px-2 py-0.5 rounded font-mono`,
                                  children: `AED 100`,
                                }),
                              ],
                            }),
                            (0, x.jsx)(`p`, {
                              className: `text-xs text-[#63797b] leading-relaxed`,
                              children: `An Urban Procures representative will visit your property to inspect site dimensions, assess requirements, and assist in preparing your RFQ.`,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                E &&
                  (0, x.jsxs)(`div`, {
                    className: `p-3.5 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center gap-2`,
                    children: [
                      (0, x.jsx)(se, {
                        className: `w-4 h-4 shrink-0 text-[#dc2626]`,
                      }),
                      (0, x.jsx)(`span`, { children: E }),
                    ],
                  }),
                (0, x.jsx)(He, {
                  role: `get_a_quote`,
                  checked: O,
                  onChange: ne,
                  onDocument: ie,
                }),
                (0, x.jsxs)(`div`, {
                  className: `pt-4 border-t border-[#e1e7e4] flex flex-col sm:flex-row items-center justify-between gap-4`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `flex items-center gap-2 text-xs text-[#63797b]`,
                      children: [
                        (0, x.jsx)(Ce, { className: `w-4 h-4 text-[#123f47]` }),
                        (0, x.jsx)(`span`, {
                          children: `No account needed. Your privacy is safeguarded.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`button`, {
                      type: `submit`,
                      disabled: oe || !O || !re,
                      className: `w-full sm:w-auto bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3.5 px-8 rounded-[5px] text-sm transition-all inline-flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5 disabled:opacity-50`,
                      children: [
                        (0, x.jsx)(`span`, {
                          children: oe
                            ? `Submitting...`
                            : `Submit Quotation Request`,
                        }),
                        (0, x.jsx)(k, { className: `w-4 h-4` }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      });
};
function Ge({ role: e, onDashboard: t }) {
  let [n, r] = (0, b.useState)(null),
    [i, a] = (0, b.useState)(``),
    o = async () => {
      try {
        let e = await L.discovery();
        (r(e.data), a(``));
      } catch {
        a(`Community information is temporarily unavailable.`);
      }
    };
  return (
    (0, b.useEffect)(() => {
      o();
    }, []),
    Ie(o, !0),
    (0, x.jsxs)(`section`, {
      className: `space-y-8`,
      children: [
        (0, x.jsxs)(`div`, {
          className: `bg-[#123f47] text-white rounded-lg p-6`,
          children: [
            (0, x.jsxs)(`h2`, {
              className: `text-2xl font-bold`,
              children: [e === `contractor` ? `Contractor` : `Vendor`, ` Home`],
            }),
            (0, x.jsx)(`p`, {
              className: `mt-2`,
              children: `Verified businesses and procurement activity on Urban Procures.`,
            }),
            (0, x.jsx)(`button`, {
              className: `bg-[#eb6a32] rounded px-4 py-2 mt-4 font-bold`,
              onClick: t,
              children:
                e === `contractor`
                  ? `Manage my RFQs`
                  : `Explore available RFQs`,
            }),
          ],
        }),
        i && (0, x.jsx)(`p`, { role: `status`, children: i }),
        (0, x.jsx)(`div`, {
          className: `grid grid-cols-2 md:grid-cols-5 gap-4`,
          children: [
            [`verifiedContractors`, `Verified Contractors`],
            [`verifiedVendors`, `Verified Vendors`],
            [`projects`, `Submitted Projects`],
            [`openRfqs`, `Open RFQs`],
            [`awardedRfqs`, `Awarded RFQs`],
          ].map(([e, t]) =>
            (0, x.jsxs)(
              `article`,
              {
                className: `bg-white border rounded p-4`,
                children: [
                  (0, x.jsx)(`p`, { children: t }),
                  (0, x.jsx)(`strong`, {
                    className: `text-3xl`,
                    children: n?.statistics?.[e] ?? `—`,
                  }),
                ],
              },
              e,
            ),
          ),
        }),
        (0, x.jsx)(`p`, {
          className: `text-sm`,
          children: `Live platform totals. Awards are counted only when confirmed by the owning Contractor. Company listings require public-listing consent; project participants remain confidential before award.`,
        }),
        (0, x.jsx)(`div`, {
          className: `grid md:grid-cols-2 gap-6`,
          children: [`vendors`, `contractors`].map((e) =>
            (0, x.jsxs)(
              `section`,
              {
                children: [
                  (0, x.jsxs)(`h3`, {
                    className: `text-xl font-bold`,
                    children: [
                      `Verified `,
                      e === `vendors` ? `Vendors` : `Contractors`,
                    ],
                  }),
                  n?.[e].map((e, t) =>
                    (0, x.jsxs)(
                      `article`,
                      {
                        className: `bg-white border rounded p-4 mt-3`,
                        children: [
                          (0, x.jsx)(`strong`, { children: e.companyName }),
                          (0, x.jsxs)(`p`, {
                            children: [
                              e.emirate ?? e.emirates?.join(`, `),
                              e.categories && ` · ` + e.categories.join(`, `),
                            ],
                          }),
                        ],
                      },
                      t,
                    ),
                  ),
                  n &&
                    n[e].length === 0 &&
                    (0, x.jsx)(`p`, {
                      className: `p-4`,
                      children: `Verified business listings will appear as companies opt in.`,
                    }),
                ],
              },
              e,
            ),
          ),
        }),
      ],
    })
  );
}
function Ke({ onChange: e, onBusy: t }) {
  let [n, r] = (0, b.useState)(``);
  return (0, x.jsxs)(`div`, {
    children: [
      (0, x.jsxs)(`label`, {
        className: `block font-semibold`,
        children: [
          `Trade license document (required)`,
          (0, x.jsx)(`input`, {
            "aria-label": `Trade license document`,
            type: `file`,
            required: !0,
            accept: `.pdf,.png,.jpg,.jpeg`,
            className: `block border border-dashed rounded p-3 mt-2 w-full`,
            onChange: async (n) => {
              (e(null), r(``));
              let i = n.target.files?.[0];
              if (i) {
                if (
                  i.size === 0 ||
                  i.size > 1e7 ||
                  !/\.(pdf|png|jpe?g)$/i.test(i.name)
                ) {
                  (r(`Choose a PDF, PNG or JPEG up to 10 MB.`),
                    (n.target.value = ``));
                  return;
                }
                t(!0);
                try {
                  let t = await new Promise((e, t) => {
                    let n = new FileReader();
                    ((n.onload = () => e(String(n.result))),
                      (n.onerror = () =>
                        t(
                          Error(
                            `Could not read the file. Please select it again.`,
                          ),
                        )),
                      n.readAsDataURL(i));
                  });
                  e({
                    fileName: i.name,
                    fileType:
                      i.type ||
                      (/\.pdf$/i.test(i.name)
                        ? `application/pdf`
                        : /\.png$/i.test(i.name)
                          ? `image/png`
                          : `image/jpeg`),
                    dataUrl: t,
                    documentPurpose: `trade_license`,
                  });
                } catch (e) {
                  r(e instanceof Error ? e.message : `File could not be read.`);
                } finally {
                  t(!1);
                }
              }
            },
          }),
        ],
      }),
      (0, x.jsx)(`p`, {
        children: `PDF, PNG or JPEG, up to 10 MB. Stored privately for Admin review. Registration does not mean verification.`,
      }),
      n &&
        (0, x.jsx)(`p`, {
          role: `alert`,
          className: `text-red-700`,
          children: n,
        }),
    ],
  });
}
function qe() {
  let [e, t] = (0, b.useState)(``),
    [n, r] = (0, b.useState)(!1);
  return (
    (0, b.useEffect)(() => {
      L.auth
        .me()
        .then((e) => r((e.vendor ?? e.contractor)?.directoryVisible === !0))
        .catch(() => {});
    }, []),
    (0, x.jsxs)(`section`, {
      className: `max-w-[1240px] mx-auto p-4 text-xs bg-white border border-[#e1e7e4]`,
      children: [
        (0, x.jsxs)(`label`, {
          className: `font-semibold`,
          children: [
            `Upload trade license for Admin review`,
            (0, x.jsx)(`input`, {
              type: `file`,
              accept: `application/pdf,image/png,image/jpeg`,
              className: `block mt-2`,
              onChange: async (e) => {
                let n = e.target.files?.[0];
                if (n) {
                  t(`Uploading…`);
                  try {
                    if (n.size > 1e7) throw Error(`Maximum file size is 10MB.`);
                    let e = await new Promise((e, t) => {
                      let r = new FileReader();
                      ((r.onload = () => e(r.result)),
                        (r.onerror = () => t(Error(`File could not be read`))),
                        r.readAsDataURL(n));
                    });
                    (await L.documents.upload({
                      fileName: n.name,
                      fileType: n.type,
                      data: e,
                      documentPurpose: `trade_license`,
                    }),
                      t(
                        `Trade license uploaded. Admin verification is pending.`,
                      ));
                  } catch (e) {
                    t(e.message);
                  }
                  e.target.value = ``;
                }
              },
            }),
          ],
        }),
        (0, x.jsxs)(`label`, {
          className: `block mt-3`,
          children: [
            (0, x.jsx)(`input`, {
              type: `checkbox`,
              checked: n,
              onChange: async (e) => {
                let n = e.target.checked;
                try {
                  (await L.directory(n),
                    r(n),
                    t(
                      n
                        ? `Public company listing enabled after verification.`
                        : `Public company listing disabled.`,
                    ));
                } catch (e) {
                  t(e.message);
                }
              },
            }),
            ` Show my verified company name and trades/emirate in the homepage directory. Contact details and license files remain private.`,
          ],
        }),
        (0, x.jsx)(`p`, { role: `status`, className: `mt-2`, children: e }),
      ],
    })
  );
}
var Je = ({
    document: e,
    onClose: t,
    viewerRole: n = `admin`,
    approvalActions: r,
  }) => {
    let [i, a] = (0, b.useState)(!1),
      [o, s] = (0, b.useState)(!1),
      [c, l] = (0, b.useState)(``),
      [u, d] = (0, b.useState)(``);
    if (
      ((0, b.useEffect)(() => {
        let t = ``,
          n = !1;
        return (
          l(``),
          d(``),
          e?.id
            ? fetch(
                `/api/documents/${e.id}/${e.standardized ? `standardized/` : ``}view`,
                { headers: { Authorization: `Bearer ` + (Pe() || ``) } },
              )
                .then(async (e) => {
                  if (!e.ok) throw Error(`Document access failed`);
                  ((t = URL.createObjectURL(await e.blob())),
                    n ? URL.revokeObjectURL(t) : l(t));
                })
                .catch((e) => {
                  n || d(e.message);
                })
            : e?.dataUrl && l(e.dataUrl),
          () => {
            ((n = !0), t && URL.revokeObjectURL(t));
          }
        );
      }, [e?.id, e?.standardized]),
      !e)
    )
      return null;
    let f =
        e.fileType?.includes(`pdf`) ||
        e.fileName.toLowerCase().endsWith(`.pdf`),
      p =
        e.fileType?.includes(`acad`) ||
        e.fileName.toLowerCase().endsWith(`.dwg`) ||
        e.fileName.toLowerCase().endsWith(`.dxf`),
      m =
        e.fileType?.includes(`spreadsheet`) ||
        e.fileName.toLowerCase().endsWith(`.xlsx`) ||
        e.fileName.toLowerCase().endsWith(`.xls`) ||
        e.fileName.toLowerCase().endsWith(`.csv`),
      h =
        !p &&
        !m &&
        (e.fileType?.includes(`image`) ||
          e.fileName.match(/\.(jpg|jpeg|png|webp|svg)$/i));
    return (0, x.jsx)(`div`, {
      className: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80 backdrop-blur-sm animate-in fade-in duration-150 font-['DM_Sans']`,
      children: (0, x.jsxs)(`div`, {
        className: `bg-white border border-[#e1e7e4] w-full max-w-4xl rounded-[6px] shadow-[0_20px_50px_rgba(18,53,64,0.25)] overflow-hidden flex flex-col max-h-[90vh]`,
        children: [
          r &&
            (0, x.jsx)(`div`, {
              className: `p-4 bg-white border-b`,
              children: r,
            }),
          (0, x.jsxs)(`div`, {
            className: `px-6 py-4 bg-[#123f47] text-white flex items-center justify-between`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `flex items-center gap-3`,
                children: [
                  (0, x.jsx)(`div`, {
                    className: `w-9 h-9 rounded-[4px] bg-[#eb6a32] flex items-center justify-center text-white`,
                    children: (0, x.jsx)(pe, { className: `w-5 h-5` }),
                  }),
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsxs)(`h3`, {
                        className: `text-base font-extrabold text-white font-['Manrope'] flex items-center gap-2`,
                        children: [
                          (0, x.jsx)(`span`, { children: e.fileName }),
                          (0, x.jsx)(`span`, {
                            className: `text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#082631] text-[#f6a47f] font-bold`,
                            children: e.documentPurpose,
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`p`, {
                        className: `text-xs text-[#c3d9d8] flex items-center gap-2 mt-0.5`,
                        children: [
                          (0, x.jsxs)(`span`, {
                            children: [
                              `Document reference: `,
                              (0, x.jsx)(`code`, {
                                className: `text-[#f6a47f] font-mono`,
                                children: e.id,
                              }),
                            ],
                          }),
                          (0, x.jsx)(`span`, { children: `·` }),
                          (0, x.jsx)(`span`, {
                            children: ((e) =>
                              e
                                ? e < 1024
                                  ? e + ` B`
                                  : e < 1048576
                                    ? (e / 1024).toFixed(1) + ` KB`
                                    : (e / 1048576).toFixed(2) + ` MB`
                                : `0 B`)(e.fileSizeBytes),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, x.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, x.jsxs)(`button`, {
                    onClick: () => {
                      (navigator.clipboard?.writeText(e.id),
                        s(!0),
                        setTimeout(() => s(!1), 2500));
                    },
                    className: `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#e3edeb] transition-colors`,
                    title: `Copy document reference for support`,
                    children: [
                      o
                        ? (0, x.jsx)(A, {
                            className: `w-3.5 h-3.5 text-[#eb6a32]`,
                          })
                        : (0, x.jsx)(ue, { className: `w-3.5 h-3.5` }),
                      (0, x.jsx)(`span`, {
                        children: o ? `Reference copied` : `Copy Reference`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: async () => {
                      try {
                        let t = await fetch(
                          `/api/documents/${e.id}/${e.standardized ? `standardized/` : ``}download`,
                          {
                            headers: {
                              Authorization: `Bearer ` + (Pe() || ``),
                            },
                          },
                        );
                        if (!t.ok) throw Error(`Document download failed`);
                        let n = URL.createObjectURL(await t.blob()),
                          r = window.document.createElement(`a`);
                        ((r.href = n),
                          (r.download = e.fileName),
                          r.click(),
                          setTimeout(() => URL.revokeObjectURL(n), 1e3),
                          a(!0));
                      } catch (e) {
                        d(e.message);
                      }
                    },
                    className: `flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] text-xs font-bold bg-[#eb6a32] hover:bg-[#bd4b1c] text-white transition-colors shadow-sm`,
                    children: [
                      i
                        ? (0, x.jsx)(A, { className: `w-3.5 h-3.5` })
                        : (0, x.jsx)(de, { className: `w-3.5 h-3.5` }),
                      (0, x.jsx)(`span`, {
                        children: i ? `Downloaded!` : `Download`,
                      }),
                    ],
                  }),
                  (0, x.jsx)(`button`, {
                    onClick: t,
                    className: `p-1.5 rounded text-[#c3d9d8] hover:text-white hover:bg-white/10 transition-colors`,
                    children: (0, x.jsx)(Oe, { className: `w-5 h-5` }),
                  }),
                ],
              }),
            ],
          }),
          (0, x.jsxs)(`div`, {
            className: `flex-1 overflow-y-auto p-6 bg-[#f7f6f2] space-y-6`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-[6px] bg-white border border-[#e1e7e4] text-xs shadow-sm`,
                children: [
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `text-[#63797b] block mb-0.5 text-[11px] font-semibold`,
                        children: `File Type`,
                      }),
                      (0, x.jsx)(`span`, {
                        className: `text-[#123540] font-mono font-medium`,
                        children: e.fileType || `binary/octet-stream`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `text-[#63797b] block mb-0.5 text-[11px] font-semibold`,
                        children: `Document Purpose`,
                      }),
                      (0, x.jsx)(`span`, {
                        className: `text-[#eb6a32] uppercase font-bold font-['Manrope']`,
                        children: e.documentPurpose,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `text-[#63797b] block mb-0.5 text-[11px] font-semibold`,
                        children: `Upload Date`,
                      }),
                      (0, x.jsx)(`span`, {
                        className: `text-[#123540]`,
                        children: new Date(e.createdAt).toLocaleDateString(),
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `text-[#63797b] block mb-0.5 text-[11px] font-semibold`,
                        children: `R2 Integrity`,
                      }),
                      (0, x.jsx)(`span`, {
                        className: `text-[#123f47] font-mono text-[11px] font-bold`,
                        children: e.sha256Hash
                          ? e.sha256Hash.slice(0, 16)
                          : `Hash unavailable`,
                      }),
                    ],
                  }),
                ],
              }),
              (0, x.jsx)(`div`, {
                className: `border border-[#e1e7e4] rounded-[6px] bg-white overflow-hidden min-h-[360px] flex flex-col items-center justify-center p-6 text-center relative shadow-sm`,
                children: u
                  ? (0, x.jsx)(`p`, { role: `alert`, children: u })
                  : c
                    ? h
                      ? (0, x.jsx)(`img`, {
                          src: c,
                          alt: e.fileName,
                          className: `max-h-[400px] max-w-full object-contain`,
                        })
                      : f || e.fileType === `text/html`
                        ? (0, x.jsx)(`iframe`, {
                            sandbox: e.fileType === `text/html` ? `` : void 0,
                            title: e.fileName,
                            src: c,
                            className: `w-full h-[480px]`,
                          })
                        : (0, x.jsx)(`p`, {
                            children: `Use Download to open this file.`,
                          })
                    : (0, x.jsx)(`p`, { children: `Loading document…` }),
              }),
            ],
          }),
          (0, x.jsxs)(`div`, {
            className: `px-6 py-3 bg-[#f7f6f2] border-t border-[#e1e7e4] flex items-center justify-between text-xs text-[#63797b]`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `flex items-center gap-2`,
                children: [
                  (0, x.jsx)(Se, { className: `w-4 h-4 text-[#123f47]` }),
                  (0, x.jsx)(`span`, {
                    children: `Encrypted at rest with Cloudflare R2 AES-256`,
                  }),
                ],
              }),
              (0, x.jsx)(`button`, {
                onClick: t,
                className: `px-4 py-2 rounded-[4px] bg-[#123540] hover:bg-[#082631] text-white font-bold transition-colors`,
                children: `Close Viewer`,
              }),
            ],
          }),
        ],
      }),
    });
  },
  Ye = class {
    static calculateAward(e) {
      if (
        !Number.isFinite(e.awardValueAed) ||
        e.awardValueAed <= 0 ||
        e.awardValueAed > 0xe8d4a51000
      )
        throw Error(`INVALID_AWARD_VALUE`);
      if (e.awardType === `manpower`) {
        let t = e.manpowerPersons,
          n = e.manpowerHoursPerPersonPerDay,
          r = e.manpowerDays;
        if (
          !Number.isSafeInteger(t) ||
          t <= 0 ||
          !Number.isFinite(n) ||
          n <= 0 ||
          n > 24 ||
          !Number.isSafeInteger(r) ||
          r <= 0
        )
          throw Error(`INVALID_MANPOWER_PERSON_HOURS`);
        let i = t * n * r;
        if (!Number.isFinite(i) || i > 0xe8d4a51000)
          throw Error(`INVALID_MANPOWER_PERSON_HOURS`);
        let a = Math.round(i * 100) / 100;
        return {
          contractorServiceChargeAed: 0,
          vendorServiceChargeAed: 0,
          manpowerChargeAed: a,
          totalVendorChargeAed: a,
          applicableChargeRule: `MANPOWER_AED_1_PER_PERSON_HOUR`,
          manpowerUnit: `person-hour`,
          manpowerQuantity: i,
          manpowerPersons: t,
          manpowerHoursPerPersonPerDay: n,
          manpowerDays: r,
          manpowerRateAed: 1,
        };
      }
      if (e.awardType !== `standard`) throw Error(`INVALID_AWARD_TYPE`);
      let t = Math.max(Math.round(e.awardValueAed * 0.025 * 100) / 100, 500);
      return {
        contractorServiceChargeAed: 0,
        vendorServiceChargeAed: t,
        manpowerChargeAed: 0,
        totalVendorChargeAed: t,
        applicableChargeRule: `STANDARD_MAX_2_5_PERCENT_AED_500`,
        manpowerUnit: null,
        manpowerQuantity: null,
        manpowerPersons: null,
        manpowerHoursPerPersonPerDay: null,
        manpowerDays: null,
        manpowerRateAed: null,
      };
    }
    static DEFAULT_PERCENTAGE = 0.025;
    static DEFAULT_MINIMUM_AED = 500;
    static DEFAULT_SITE_VISIT_FEE_AED = 100;
    static calculate(e) {
      let t = Math.max(0, e.contractAmountAed),
        n = e.customRuleOverride?.percentage ?? this.DEFAULT_PERCENTAGE,
        r = e.customRuleOverride?.minimumChargeAed ?? this.DEFAULT_MINIMUM_AED,
        i = Math.round(t * n * 100) / 100,
        a = i,
        o = !1;
      t > 0 && i < r && ((a = r), (o = !0));
      let s = e.siteVisitRequested ? this.DEFAULT_SITE_VISIT_FEE_AED : 0,
        c = Math.round((a + s) * 100) / 100,
        l = `Service charge calculated at ${(n * 100).toFixed(1)}% of AED ${t.toLocaleString()}`;
      return (
        o && (l += ` (Minimum threshold of AED ${r} applied)`),
        s > 0 && (l += ` + AED ${s} site visit fee`),
        {
          contractAmountAed: t,
          appliedPercentage: n,
          rawPercentageChargeAed: i,
          minimumChargeEnforced: o,
          minimumChargeAed: r,
          baseServiceChargeAed: a,
          siteVisitFeeAed: s,
          totalServiceChargeAed: c,
          explanation: l,
        }
      );
    }
  },
  Xe = ({ onNavigate: e }) => {
    let { showToast: t } = Ae(),
      [n, r] = (0, b.useState)(`home`),
      [i, a] = (0, b.useState)(`all`),
      [o, s] = (0, b.useState)(``),
      [c, l] = (0, b.useState)(null),
      [u, d] = (0, b.useState)(null),
      [f, p] = (0, b.useState)(!1),
      [m, h] = (0, b.useState)(`login`),
      [g, _] = (0, b.useState)(``),
      [v, y] = (0, b.useState)(``),
      [ee, C] = (0, b.useState)(null),
      [w, te] = (0, b.useState)(null),
      [T, E] = (0, b.useState)(null),
      [D, O] = (0, b.useState)(null),
      [k, ie] = (0, b.useState)(null),
      [A, ae] = (0, b.useState)([]),
      [le, ue] = (0, b.useState)([]),
      [de, me] = (0, b.useState)(null),
      [he, ge] = (0, b.useState)(!1),
      [_e, xe] = (0, b.useState)(!1),
      [Se, we] = (0, b.useState)(null),
      [Te, P] = (0, b.useState)(!1);
    (0, b.useEffect)(() => {
      let e = () => P(!1);
      return (
        window.addEventListener(`urbanprocures:terms-required`, e),
        () => window.removeEventListener(`urbanprocures:terms-required`, e)
      );
    }, []);
    let [De, Oe] = (0, b.useState)(``),
      [F, ke] = (0, b.useState)(null),
      [je, Me] = (0, b.useState)(!1),
      [Ne, Pe] = (0, b.useState)(!1),
      [Fe, I] = (0, b.useState)(``),
      [Le, Re] = (0, b.useState)(`Dubai`),
      [ze, Be] = (0, b.useState)(``),
      [We, Xe] = (0, b.useState)(``),
      [Ze, Qe] = (0, b.useState)(`+971 `),
      [$e, et] = (0, b.useState)(``),
      [tt, nt] = (0, b.useState)(``),
      [rt, it] = (0, b.useState)(null),
      [at, ot] = (0, b.useState)(``),
      [st, ct] = (0, b.useState)(`Joinery & Carpentry`),
      [lt, ut] = (0, b.useState)(``),
      [dt, ft] = (0, b.useState)(`Dubai`),
      [pt, mt] = (0, b.useState)(``),
      [ht, gt] = (0, b.useState)(``),
      [_t, vt] = (0, b.useState)(``),
      [yt, bt] = (0, b.useState)(``),
      [xt, St] = (0, b.useState)([
        { description: ``, quantity: 1, unit: `nos`, specifications: `` },
      ]),
      [Ct, wt] = (0, b.useState)(``),
      [Tt, Et] = (0, b.useState)(``),
      [Dt, Ot] = (0, b.useState)(`1`),
      [kt, At] = (0, b.useState)([]),
      [jt, Mt] = (0, b.useState)(`itemized`),
      [Nt, Pt] = (0, b.useState)(!1),
      [Ft, It] = (0, b.useState)(!1),
      [Lt, Rt] = (0, b.useState)(!1),
      zt = (0, b.useRef)(!1),
      Bt = (0, b.useRef)(crypto.randomUUID()),
      Vt = () => {
        zt.current ||
          ((Bt.current = crypto.randomUUID()),
          it(null),
          ot(``),
          ut(``),
          bt(``),
          mt(``),
          vt(``),
          gt(``),
          Mt(`itemized`),
          St([
            { description: ``, quantity: 1, unit: `nos`, specifications: `` },
          ]),
          At([]),
          E(null),
          r(`create_rfq`));
      },
      Ht = (0, b.useCallback)(async () => {
        try {
          let e = await L.contractor.getRfqs();
          (ae(e || []), e && e.length > 0 && !o && s(e[0].id));
        } catch {}
      }, [o]),
      Ut = (0, b.useCallback)(async (e) => {
        if (e)
          try {
            let t = await L.contractor.getQuotations(e);
            ue(t || []);
            let n = (t || []).find((e) => e.status === `awarded`);
            me(n ? { quotationId: n.id } : null);
          } catch {
            ue([]);
          }
      }, []);
    (Ie(async () => {
      (await Ht(), o && (await Ut(o)));
    }, !!D && Te),
      (0, b.useEffect)(() => {
        async function e() {
          try {
            let e = await L.auth.me();
            e &&
              e.authenticated &&
              e.user &&
              e.user.role === `contractor` &&
              (O(e.user),
              ie(e.contractor),
              P(e.termsAccepted === !0),
              await Ht());
          } catch {}
        }
        e();
      }, [Ht]),
      (0, b.useEffect)(() => {
        D && o && Ut(o);
      }, [D, o, Ut]));
    let Wt = !!D && D.role === `contractor`,
      Gt = A.filter((e) =>
        i === `all`
          ? !0
          : i === `under_evaluation`
            ? e.status === `under_evaluation` ||
              e.status === `receiving_quotations`
            : i === `draft`
              ? e.status === `draft` || e.status === `submitted`
              : i !== `awarded` || e.status === `awarded`,
      ),
      Kt = A.find((e) => e.id === o) || A[0],
      R = async (e) => {
        (e.preventDefault(), C(null), ge(!0));
        try {
          let e = await L.auth.login(g, v);
          if (e.user.role !== `contractor`) {
            (C(`Account is not registered as a contractor.`),
              t(`This account is not a contractor organization.`, `error`));
            return;
          }
          O(e.user);
          let n = await L.auth.me();
          (ie(n.contractor),
            P(n.termsAccepted === !0),
            r(`dashboard`),
            t(`Welcome back, ${e.user.email}`, `success`),
            await Ht());
        } catch (e) {
          (C(e.message || `Login failed.`),
            t(e.message || `Login failed`, `error`));
        } finally {
          ge(!1);
        }
      },
      qt = async (e) => {
        if ((e.preventDefault(), te(null), !F || je)) {
          te(`Upload your trade license document before registering.`);
          return;
        }
        if (!_e || !Se) {
          te(`Explicit acceptance of current Contractor Terms is required.`);
          return;
        }
        if (
          !De.trim() ||
          !Fe.trim() ||
          !$e.trim() ||
          !Ze.trim() ||
          !We.trim()
        ) {
          te(`Please fill in all required company registration details.`);
          return;
        }
        ge(!0);
        try {
          let e = await L.auth.registerContractor({
            tradeLicenseDocument: F,
            listBusinessPublicly: Ne,
            companyName: De.trim(),
            tradeLicenseNumber: Fe.trim(),
            emirate: Le,
            address: ze.trim() || `${Le}, UAE`,
            contactPerson: We.trim(),
            contactPhone: Ze.trim(),
            email: $e.trim(),
            password: tt,
            acceptTerms: _e,
            termsVersionId: Se.id,
          });
          O(e.user);
          let n = await L.auth.me();
          (ie(n.contractor),
            P(n.termsAccepted === !0),
            r(`dashboard`),
            t(
              `Contractor organization "${De}" registered. Trade license verification is pending.`,
              `success`,
              `Account Created`,
            ),
            await Ht());
        } catch (e) {
          (te(e.message || `Registration failed.`),
            t(e.message || `Registration failed`, `error`));
        } finally {
          ge(!1);
        }
      },
      Jt = () => {
        St([
          ...xt,
          { description: ``, quantity: 1, unit: `sqm`, specifications: `` },
        ]);
      },
      Yt = (e) => {
        xt.length <= 1 || St(xt.filter((t, n) => n !== e));
      },
      Xt = async (e, n) => {
        if (
          !Lt &&
          window.confirm(
            n === `recall`
              ? `Recall this submitted RFQ to draft for editing?`
              : n === `remove`
                ? `Remove this RFQ from your dashboard and stop new quotations? Its audit history will be retained.`
                : `Cancel this RFQ and stop new quotations?`,
          )
        ) {
          Rt(!0);
          try {
            (n === `remove`
              ? await L.contractor.removeRfq(e.id)
              : await L.contractor.changeStatus(
                  e.id,
                  n === `recall` ? `draft` : `cancelled`,
                ),
              await Ht(),
              r(`dashboard`),
              t(
                `RFQ ` +
                  (n === `recall`
                    ? `recalled to draft`
                    : n === `remove`
                      ? `removed`
                      : `cancelled`) +
                  `.`,
                `success`,
              ));
          } catch (e) {
            t(e.message || `RFQ could not be changed.`, `error`);
          } finally {
            Rt(!1);
          }
        }
      },
      Zt = async (e, n = !1) => {
        if ((e.preventDefault(), !(zt.current || Nt))) {
          if ((E(null), !at.trim() || !lt.trim() || !yt.trim())) {
            E(`Please fill in title, project name, and scope description.`);
            return;
          }
          if (
            jt === `file` &&
            !kt.some((e) => e.documentPurpose === `boq`) &&
            !A.find((e) => e.id === rt)?.documents?.some(
              (e) => e.documentPurpose === `boq`,
            )
          ) {
            E(`Attach your BOQ and select BOQ as its purpose.`);
            return;
          }
          ((zt.current = !0), It(!0));
          try {
            let e = {
              creationKey: Bt.current,
              boqMode: jt,
              title: at.trim(),
              category: st,
              projectName: lt.trim(),
              locationEmirate: dt,
              submissionDeadline: pt,
              targetCompletionDate: ht,
              estimatedBudgetAed: _t ? Number(_t) : void 0,
              procurementType: /manpower|labou?r/i.test(st)
                ? `manpower`
                : `standard`,
              manpowerPersons: Number(Ct),
              manpowerHoursPerPersonPerDay: Number(Tt),
              manpowerDays: Number(Dt),
              scopeDescription: yt.trim(),
              status: n ? `draft` : `submitted`,
              items: xt.map((e, t) => ({
                itemNumber: t + 1,
                description: e.description,
                quantity: e.quantity,
                unit: e.unit,
                specifications: e.specifications,
              })),
              documents: kt,
            };
            if (rt) {
              for (let e of kt)
                await L.documents.upload({ ...e, data: e.dataUrl, rfqId: rt });
              At([]);
            }
            let i = rt
              ? await L.contractor.updateRfq(rt, { ...e, documents: [] })
              : await L.contractor.createRfq(e);
            (it(null),
              await Ht(),
              s(i.id),
              r(`rfq_detail`),
              t(
                n
                  ? `RFQ draft saved.`
                  : `RFQ "${i.title}" submitted for review.`,
                `success`,
                n ? `Draft Saved` : `RFQ Submitted`,
              ));
          } catch (e) {
            (E(e.message || `Failed to create RFQ`),
              t(e.message || `Failed to create RFQ`, `error`));
          } finally {
            ((zt.current = !1), It(!1));
          }
        }
      };
    return Wt && !Te
      ? (0, x.jsx)(Ue, {
          role: `contractor`,
          onAccepted: () => {
            L.auth.me().then((e) => {
              (P(e.termsAccepted === !0), Ht());
            });
          },
        })
      : (0, x.jsxs)(`div`, {
          className: `min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']`,
          children: [
            D ? (0, x.jsx)(qe, {}) : (0, x.jsx)(S, {}),
            (0, x.jsx)(`div`, {
              className: `bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]`,
              children: (0, x.jsxs)(`div`, {
                className: `max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4`,
                children: [
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsxs)(`div`, {
                        className: `inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']`,
                        children: [
                          (0, x.jsx)(`span`, { children: `Contractor Portal` }),
                          (0, x.jsx)(`span`, {
                            "aria-hidden": `true`,
                            children: `·`,
                          }),
                          (0, x.jsx)(`span`, {
                            children: `Professional Procurement`,
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`h1`, {
                        className: `text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3`,
                        children: [
                          (0, x.jsx)(re, {
                            className: `w-7 h-7 text-[#eb6a32]`,
                          }),
                          `Contractor RFQ Management`,
                        ],
                      }),
                      Wt && k
                        ? (0, x.jsxs)(`p`, {
                            className: `text-xs sm:text-sm text-[#c3d9d8] mt-1`,
                            children: [
                              `Organization: `,
                              (0, x.jsx)(`strong`, {
                                className: `text-white`,
                                children: k.companyName,
                              }),
                              ` (License: `,
                              k.tradeLicenseNumber,
                              ` · `,
                              k.emirate,
                              `)`,
                            ],
                          })
                        : (0, x.jsx)(`p`, {
                            className: `text-xs sm:text-sm text-[#c3d9d8] mt-1`,
                            children: `For main contractors, fit-out companies, interior design studios, and construction firms.`,
                          }),
                    ],
                  }),
                  (0, x.jsx)(`div`, {
                    className: `flex items-center gap-3`,
                    children: Wt
                      ? (0, x.jsxs)(x.Fragment, {
                          children: [
                            (0, x.jsx)(`button`, {
                              className: `px-4 py-2 rounded bg-white/10 text-white text-xs font-bold`,
                              onClick: () => r(`home`),
                              children: `Portal Home`,
                            }),
                            (0, x.jsxs)(`button`, {
                              onClick: Vt,
                              disabled: Ft,
                              className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2.5 rounded-[5px] text-xs flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5`,
                              children: [
                                (0, x.jsx)(be, { className: `w-4 h-4` }),
                                (0, x.jsx)(`span`, {
                                  children: `Create New RFQ`,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`button`, {
                              onClick: () => r(`dashboard`),
                              className: `px-4 py-2.5 rounded-[5px] text-xs font-bold transition-colors ${n === `dashboard` ? `bg-[#082631] text-[#f6a47f] border border-[#194048]` : `text-[#e3edeb] hover:bg-white/10`}`,
                              children: [`Dashboard (`, A.length, `)`],
                            }),
                            (0, x.jsxs)(`button`, {
                              onClick: async () => {
                                (await L.auth.logout(),
                                  O(null),
                                  ie(null),
                                  t(
                                    `You have been signed out successfully.`,
                                    `info`,
                                  ));
                              },
                              className: `text-xs text-[#c3d9d8] hover:text-white flex items-center gap-1 px-2 py-1`,
                              children: [
                                (0, x.jsx)(M, { className: `w-3.5 h-3.5` }),
                                (0, x.jsx)(`span`, { children: `Sign Out` }),
                              ],
                            }),
                          ],
                        })
                      : (0, x.jsx)(`div`, {
                          className: `text-xs text-[#c3d9d8]`,
                          children: `Please sign in or register to access your procurement dashboard.`,
                        }),
                  }),
                ],
              }),
            }),
            (0, x.jsx)(`div`, {
              className: `max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8`,
              children: Wt
                ? (0, x.jsxs)(x.Fragment, {
                    children: [
                      n === `home` &&
                        (0, x.jsx)(Ge, {
                          role: `contractor`,
                          onDashboard: () => r(`dashboard`),
                        }),
                      n === `dashboard` &&
                        (0, x.jsxs)(`div`, {
                          className: `space-y-6`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `flex flex-col sm:flex-row sm:items-center justify-between gap-4`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  children: [
                                    (0, x.jsx)(`h2`, {
                                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                                      children: `Procurement Packages & RFQs`,
                                    }),
                                    (0, x.jsx)(`p`, {
                                      className: `text-xs text-[#63797b] mt-0.5`,
                                      children: `Manage your project requirements, BoQs, and evaluate competitive quotations from verified vendors.`,
                                    }),
                                  ],
                                }),
                                (0, x.jsxs)(`div`, {
                                  className: `flex items-center gap-1 p-1 bg-white border border-[#e1e7e4] rounded-[5px] text-xs`,
                                  children: [
                                    (0, x.jsxs)(`button`, {
                                      onClick: () => a(`all`),
                                      className: `px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${i === `all` ? `bg-[#123540] text-white` : `text-[#63797b] hover:text-[#123540]`}`,
                                      children: [`All (`, A.length, `)`],
                                    }),
                                    (0, x.jsx)(`button`, {
                                      onClick: () => a(`under_evaluation`),
                                      className: `px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${i === `under_evaluation` ? `bg-[#123540] text-white` : `text-[#63797b] hover:text-[#123540]`}`,
                                      children: `Receiving Bids`,
                                    }),
                                    (0, x.jsx)(`button`, {
                                      onClick: () => a(`awarded`),
                                      className: `px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${i === `awarded` ? `bg-[#123540] text-white` : `text-[#63797b] hover:text-[#123540]`}`,
                                      children: `Awarded`,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, x.jsx)(`div`, {
                              className: `grid grid-cols-1 gap-4`,
                              children:
                                Gt.length === 0
                                  ? (0, x.jsxs)(`div`, {
                                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]`,
                                      children: [
                                        `No RFQ packages matching this status. Click `,
                                        (0, x.jsx)(`strong`, {
                                          children: `Create New RFQ`,
                                        }),
                                        ` above to publish your first tender.`,
                                      ],
                                    })
                                  : Gt.map((e) => {
                                      let t = e.quotesCount ?? 0,
                                        n = e.status === `awarded`;
                                      return (0, x.jsxs)(
                                        `div`,
                                        {
                                          className: `bg-white border border-[#e1e7e4] hover:border-[#bccbca] rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.04)] transition-all`,
                                          children: [
                                            (0, x.jsxs)(`div`, {
                                              className: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e7e4]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsxs)(`div`, {
                                                      className: `flex items-center gap-2 mb-1`,
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                                          children:
                                                            e.referenceCode,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-xs font-bold text-[#eb6a32]`,
                                                          children: e.category,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#bccbca]`,
                                                          children: `·`,
                                                        }),
                                                        (0, x.jsxs)(`span`, {
                                                          className: `text-xs text-[#63797b]`,
                                                          children: [
                                                            e.projectName,
                                                            ` (`,
                                                            e.locationEmirate,
                                                            `)`,
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                    (0, x.jsx)(`h3`, {
                                                      className: `text-lg font-extrabold text-[#123540] font-['Manrope']`,
                                                      children: e.title,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `flex items-center gap-3`,
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-xs font-mono font-bold px-3 py-1 rounded-[4px] uppercase ${n ? `bg-[#123f47] text-white` : e.status === `receiving_quotations` || e.status === `under_evaluation` ? `bg-[#eb6a32]/10 text-[#eb6a32] border border-[#eb6a32]/30` : `bg-[#f7f6f2] text-[#63797b] border border-[#e1e7e4]`}`,
                                                      children:
                                                        e.status.replace(
                                                          `_`,
                                                          ` `,
                                                        ),
                                                    }),
                                                    e.status === `submitted` &&
                                                      !(e.quotesCount ?? 0) &&
                                                      (0, x.jsx)(`button`, {
                                                        disabled: Lt,
                                                        type: `button`,
                                                        className: `text-xs underline`,
                                                        onClick: () =>
                                                          Xt(e, `recall`),
                                                        children: `Recall to Draft`,
                                                      }),
                                                    ![
                                                      `awarded`,
                                                      `closed`,
                                                      `cancelled`,
                                                    ].includes(e.status) &&
                                                      (0, x.jsx)(`button`, {
                                                        disabled: Lt,
                                                        type: `button`,
                                                        className: `text-xs underline`,
                                                        onClick: () =>
                                                          Xt(e, `cancel`),
                                                        children: `Cancel RFQ`,
                                                      }),
                                                    ![
                                                      `awarded`,
                                                      `closed`,
                                                    ].includes(e.status) &&
                                                      (0, x.jsx)(`button`, {
                                                        disabled: Lt,
                                                        type: `button`,
                                                        className: `text-xs underline text-red-700`,
                                                        onClick: () =>
                                                          Xt(e, `remove`),
                                                        children: `Remove RFQ`,
                                                      }),
                                                    e.status === `draft` &&
                                                      (0, x.jsx)(`button`, {
                                                        className: `text-xs underline`,
                                                        onClick: () => {
                                                          (Mt(`itemized`),
                                                            wt(
                                                              String(
                                                                e.manpowerPersons ??
                                                                  ``,
                                                              ),
                                                            ),
                                                            Et(
                                                              String(
                                                                e.manpowerHoursPerPersonPerDay ??
                                                                  ``,
                                                              ),
                                                            ),
                                                            Ot(
                                                              String(
                                                                e.manpowerDays ??
                                                                  1,
                                                              ),
                                                            ),
                                                            it(e.id),
                                                            ot(e.title),
                                                            ct(e.category),
                                                            ut(e.projectName),
                                                            ft(
                                                              e.locationEmirate,
                                                            ),
                                                            mt(
                                                              e.submissionDeadline.slice(
                                                                0,
                                                                10,
                                                              ),
                                                            ),
                                                            bt(
                                                              e.scopeDescription,
                                                            ),
                                                            vt(
                                                              String(
                                                                e.estimatedBudgetAed ??
                                                                  ``,
                                                              ),
                                                            ),
                                                            St(
                                                              e.items.map(
                                                                (e) => ({
                                                                  description:
                                                                    e.description,
                                                                  quantity:
                                                                    e.quantity,
                                                                  unit: e.unit,
                                                                  specifications:
                                                                    e.specifications ??
                                                                    ``,
                                                                }),
                                                              ),
                                                            ),
                                                            At([]),
                                                            r(`create_rfq`));
                                                        },
                                                        children: `Edit Draft`,
                                                      }),
                                                    (0, x.jsxs)(`button`, {
                                                      onClick: () => {
                                                        (s(e.id),
                                                          r(`rfq_detail`));
                                                      },
                                                      className: `bg-[#123540] hover:bg-[#082631] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 transition-colors shadow-sm`,
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          children: `Review & Compare Bids`,
                                                        }),
                                                        (0, x.jsx)(oe, {
                                                          className: `w-4 h-4`,
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            (0, x.jsxs)(`div`, {
                                              className: `pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#63797b]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Estimated Budget`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `font-bold text-[#123540] font-mono`,
                                                      children: [
                                                        `AED `,
                                                        e.estimatedBudgetAed?.toLocaleString() ||
                                                          `N/A`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Submission Deadline`,
                                                    }),
                                                    (0, x.jsx)(`span`, {
                                                      className: `font-semibold text-[#123540]`,
                                                      children:
                                                        e.submissionDeadline,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `BoQ Line Items`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `font-semibold text-[#123540]`,
                                                      children: [
                                                        e.items.length,
                                                        ` items`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Quotations Received`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `font-bold text-[#eb6a32] font-mono`,
                                                      children: [
                                                        t,
                                                        ` Verified Quotations`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        e.id,
                                      );
                                    }),
                            }),
                          ],
                        }),
                      n === `rfq_detail` &&
                        Kt &&
                        (0, x.jsxs)(`div`, {
                          className: `space-y-8`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `flex items-center justify-between`,
                              children: [
                                (0, x.jsx)(`button`, {
                                  onClick: () => r(`dashboard`),
                                  className: `text-xs font-bold text-[#123540] hover:text-[#eb6a32] flex items-center gap-1`,
                                  children: `← Back to all RFQs`,
                                }),
                                (0, x.jsxs)(`div`, {
                                  className: `flex items-center gap-2`,
                                  children: [
                                    (0, x.jsx)(`span`, {
                                      className: `text-xs text-[#63797b]`,
                                      children: `Procurement Status:`,
                                    }),
                                    (0, x.jsx)(`span`, {
                                      className: `font-mono text-xs uppercase font-bold text-[#eb6a32] bg-[#eb6a32]/10 border border-[#eb6a32]/30 px-2.5 py-1 rounded`,
                                      children: Kt.status.replace(`_`, ` `),
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)]`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  className: `flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-[#e1e7e4]`,
                                  children: [
                                    (0, x.jsxs)(`div`, {
                                      children: [
                                        (0, x.jsxs)(`div`, {
                                          className: `flex items-center gap-2 text-xs font-mono text-[#63797b] mb-1`,
                                          children: [
                                            (0, x.jsx)(`span`, {
                                              children: Kt.referenceCode,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: `·`,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              className: `text-[#eb6a32] font-bold`,
                                              children: Kt.category,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: `·`,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: Kt.locationEmirate,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsx)(`h2`, {
                                          className: `text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                                          children: Kt.title,
                                        }),
                                        (0, x.jsxs)(`p`, {
                                          className: `text-xs text-[#63797b] mt-1`,
                                          children: [
                                            `Project Site: `,
                                            (0, x.jsx)(`strong`, {
                                              className: `text-[#123540]`,
                                              children: Kt.projectName,
                                            }),
                                            ` · Target Delivery: `,
                                            Kt.targetCompletionDate ||
                                              `Q4 2026`,
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, x.jsxs)(`div`, {
                                      className: `p-4 bg-[#f7f6f2] rounded-[6px] border border-[#e1e7e4] text-right min-w-[200px]`,
                                      children: [
                                        (0, x.jsx)(`span`, {
                                          className: `text-[11px] text-[#63797b] uppercase tracking-wider block`,
                                          children: `Estimated Budget`,
                                        }),
                                        (0, x.jsxs)(`span`, {
                                          className: `text-xl font-bold text-[#123540] font-mono`,
                                          children: [
                                            `AED `,
                                            Kt.estimatedBudgetAed?.toLocaleString(),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, x.jsxs)(`div`, {
                                  className: `py-4 border-b border-[#e1e7e4]`,
                                  children: [
                                    (0, x.jsx)(`h4`, {
                                      className: `text-xs font-bold uppercase tracking-wider text-[#63797b] mb-2 font-['Manrope']`,
                                      children: `Detailed Scope Description`,
                                    }),
                                    (0, x.jsx)(`p`, {
                                      className: `text-sm text-[#123540] leading-relaxed`,
                                      children: Kt.scopeDescription,
                                    }),
                                  ],
                                }),
                                (0, x.jsxs)(`div`, {
                                  className: `py-4 border-b border-[#e1e7e4]`,
                                  children: [
                                    (0, x.jsx)(`h4`, {
                                      className: `text-xs font-bold uppercase tracking-wider text-[#63797b] mb-3 font-['Manrope']`,
                                      children: `Bill of Quantities (BoQ Line Items)`,
                                    }),
                                    (0, x.jsx)(`div`, {
                                      className: `overflow-x-auto border border-[#e1e7e4] rounded-[5px]`,
                                      children: (0, x.jsxs)(`table`, {
                                        className: `w-full text-xs text-left`,
                                        children: [
                                          (0, x.jsx)(`thead`, {
                                            className: `bg-[#f7f6f2] text-[#63797b] border-b border-[#e1e7e4] uppercase font-mono text-[10px]`,
                                            children: (0, x.jsxs)(`tr`, {
                                              children: [
                                                (0, x.jsx)(`th`, {
                                                  className: `py-2.5 px-3`,
                                                  children: `Item #`,
                                                }),
                                                (0, x.jsx)(`th`, {
                                                  className: `py-2.5 px-3`,
                                                  children: `Description`,
                                                }),
                                                (0, x.jsx)(`th`, {
                                                  className: `py-2.5 px-3 text-right`,
                                                  children: `Quantity`,
                                                }),
                                                (0, x.jsx)(`th`, {
                                                  className: `py-2.5 px-3`,
                                                  children: `Unit`,
                                                }),
                                                (0, x.jsx)(`th`, {
                                                  className: `py-2.5 px-3`,
                                                  children: `Specification`,
                                                }),
                                              ],
                                            }),
                                          }),
                                          (0, x.jsx)(`tbody`, {
                                            className: `divide-y divide-[#e1e7e4]`,
                                            children: Kt.items.map((e) =>
                                              (0, x.jsxs)(
                                                `tr`,
                                                {
                                                  className: `hover:bg-[#f7f6f2]/50`,
                                                  children: [
                                                    (0, x.jsx)(`td`, {
                                                      className: `py-2.5 px-3 font-mono font-bold text-[#63797b]`,
                                                      children: e.itemNumber,
                                                    }),
                                                    (0, x.jsx)(`td`, {
                                                      className: `py-2.5 px-3 font-medium text-[#123540]`,
                                                      children: e.description,
                                                    }),
                                                    (0, x.jsx)(`td`, {
                                                      className: `py-2.5 px-3 text-right font-mono font-bold`,
                                                      children: e.quantity,
                                                    }),
                                                    (0, x.jsx)(`td`, {
                                                      className: `py-2.5 px-3 font-mono text-[#63797b]`,
                                                      children: e.unit,
                                                    }),
                                                    (0, x.jsx)(`td`, {
                                                      className: `py-2.5 px-3 text-[#63797b] italic`,
                                                      children:
                                                        e.specifications ||
                                                        `Standard specifications`,
                                                    }),
                                                  ],
                                                },
                                                e.id,
                                              ),
                                            ),
                                          }),
                                        ],
                                      }),
                                    }),
                                  ],
                                }),
                                (0, x.jsx)(`div`, {
                                  className: `pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`,
                                  children: (0, x.jsxs)(`div`, {
                                    className: `flex items-center gap-3`,
                                    children: [
                                      (0, x.jsx)(`span`, {
                                        className: `text-xs font-bold text-[#123540]`,
                                        children: `Specifications & Drawings:`,
                                      }),
                                      (0, x.jsx)(`div`, {
                                        className: `flex flex-wrap gap-2`,
                                        children: Kt.documents.map((e) =>
                                          (0, x.jsxs)(
                                            `button`,
                                            {
                                              onClick: () => l(e),
                                              className: `px-3 py-1.5 rounded-[4px] bg-[#f7f6f2] hover:bg-[#eef3f1] border border-[#e1e7e4] text-xs font-semibold text-[#123540] flex items-center gap-1.5 transition-colors`,
                                              children: [
                                                (0, x.jsx)(pe, {
                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                }),
                                                (0, x.jsx)(`span`, {
                                                  children: e.fileName,
                                                }),
                                                (0, x.jsx)(fe, {
                                                  className: `w-3 h-3 text-[#63797b]`,
                                                }),
                                              ],
                                            },
                                            e.id,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              className: `space-y-4`,
                              children: [
                                (0, x.jsx)(`div`, {
                                  className: `flex flex-col sm:flex-row sm:items-center justify-between gap-2`,
                                  children: (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`h3`, {
                                        className: `text-xl font-extrabold text-[#123540] font-['Manrope'] flex items-center gap-2`,
                                        children: [
                                          (0, x.jsx)(`span`, {
                                            children: `Received Vendor Quotations`,
                                          }),
                                          (0, x.jsxs)(`span`, {
                                            className: `text-xs bg-[#eb6a32]/10 text-[#eb6a32] font-mono px-2 py-0.5 rounded font-bold`,
                                            children: [
                                              le.length,
                                              ` Verified Bids`,
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`p`, {
                                        className: `text-xs text-[#63797b] mt-0.5`,
                                        children: de
                                          ? (0, x.jsxs)(`span`, {
                                              className: `text-[#123f47] font-bold flex items-center gap-1`,
                                              children: [
                                                (0, x.jsx)(ve, {
                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                }),
                                                `Contract Award Confirmed! Winning vendor contact information released.`,
                                              ],
                                            })
                                          : (0, x.jsxs)(`span`, {
                                              className: `text-[#63797b] font-medium flex items-center gap-1`,
                                              children: [
                                                (0, x.jsx)(ye, {
                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                }),
                                                `Pre-Award Identity Masking Active: Vendor company names & contact info are strictly anonymized prior to award.`,
                                              ],
                                            }),
                                      }),
                                    ],
                                  }),
                                }),
                                (0, x.jsx)(`div`, {
                                  className: `grid grid-cols-1 md:grid-cols-2 gap-6`,
                                  children: le.map((e) => {
                                    let t = de && de.quotationId === e.id;
                                    return (0, x.jsxs)(
                                      `div`,
                                      {
                                        className: `bg-white border rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.05)] transition-all relative overflow-hidden ${t ? `border-2 border-[#123f47] bg-[#f7fbfb]` : `border-[#e1e7e4] hover:border-[#bccbca]`}`,
                                        children: [
 (0, x.jsx)(WorkbookPriceTable, { response: e.workbookResponse }),
                                          (0, x.jsxs)(`div`, {
                                            className: `flex items-center justify-between mb-4 pb-3 border-b border-[#e1e7e4]`,
                                            children: [
                                              (0, x.jsxs)(`div`, {
                                                className: `flex items-center gap-2`,
                                                children: [
                                                  (0, x.jsx)(`span`, {
                                                    className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                                    children: e.referenceCode,
                                                  }),
                                                  (0, x.jsx)(`span`, {
                                                    className: `text-sm font-extrabold font-['Manrope'] ${t ? `text-[#123f47]` : `text-[#123540]`}`,
                                                    children:
                                                      e.vendorDisplayName ||
                                                      `Vendor #VND-MASKED`,
                                                  }),
                                                ],
                                              }),
                                              t
                                                ? (0, x.jsxs)(`span`, {
                                                    className: `flex items-center gap-1 text-[11px] font-bold text-white bg-[#123f47] px-2.5 py-1 rounded-[4px] uppercase font-mono`,
                                                    children: [
                                                      (0, x.jsx)(ne, {
                                                        className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                      }),
                                                      `Awarded Winner`,
                                                    ],
                                                  })
                                                : (0, x.jsxs)(`span`, {
                                                    className: `text-xs text-[#a8b8b8] font-mono`,
                                                    children: [
                                                      `Submitted `,
                                                      new Date(
                                                        e.submittedAt,
                                                      ).toLocaleDateString(),
                                                    ],
                                                  }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            className: `grid grid-cols-2 gap-4 mb-4 text-xs`,
                                            children: [
                                              (0, x.jsxs)(`div`, {
                                                className: `p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4]`,
                                                children: [
                                                  (0, x.jsx)(`span`, {
                                                    className: `text-[#a8b8b8] block text-[10px] uppercase font-bold`,
                                                    children: `Total Bid Amount`,
                                                  }),
                                                  (0, x.jsxs)(`span`, {
                                                    className: `text-lg font-bold text-[#123540] font-mono`,
                                                    children: [
                                                      `AED `,
                                                      e.totalAmountAed.toLocaleString(),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                              (0, x.jsxs)(`div`, {
                                                className: `p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4]`,
                                                children: [
                                                  (0, x.jsx)(`span`, {
                                                    className: `text-[#a8b8b8] block text-[10px] uppercase font-bold`,
                                                    children: `Execution Lead Time`,
                                                  }),
                                                  (0, x.jsxs)(`span`, {
                                                    className: `text-lg font-bold text-[#123540] font-mono`,
                                                    children: [
                                                      e.leadTimeDays,
                                                      ` Days`,
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            className: `mb-4 p-3 bg-[#f7f6f2] rounded border border-[#e1e7e4] text-xs`,
                                            children: [
                                              (0, x.jsx)(`span`, {
                                                className: `font-bold text-[#123540] block mb-2 font-['Manrope']`,
                                                children:
                                                  e.pricingMode === `total`
                                                    ? `Total package quotation`
                                                    : e.pricingMode === `file`
                                                      ? `Uploaded quotation — package total`
                                                      : `Itemized Unit Rates:`,
                                              }),
                                              (0, x.jsx)(`div`, {
                                                className: `space-y-1 text-[11px]`,
                                                children: e.items.map((e, t) =>
                                                  (0, x.jsxs)(
                                                    `div`,
                                                    {
                                                      className: `flex justify-between text-[#63797b]`,
                                                      children: [
                                                        (0, x.jsxs)(`span`, {
                                                          children: [
                                                            `Line Item #`,
                                                            t + 1,
                                                          ],
                                                        }),
                                                        (0, x.jsxs)(`span`, {
                                                          className: `font-mono font-semibold text-[#123540]`,
                                                          children: [
                                                            `AED `,
                                                            e.unitRateAed.toLocaleString(),
                                                            ` / unit (Total: AED `,
                                                            e.totalPriceAed.toLocaleString(),
                                                            `)`,
                                                          ],
                                                        }),
                                                      ],
                                                    },
                                                    e.id,
                                                  ),
                                                ),
                                              }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            className: `flex flex-wrap gap-2 mb-4`,
                                            children: [
                                              (e.documents ?? []).map((e) =>
                                                (0, x.jsx)(
                                                  `button`,
                                                  {
                                                    type: `button`,
                                                    onClick: () => l(e),
                                                    className: `text-xs px-3 py-2 rounded border border-[#bccbca] hover:bg-[#f7f6f2]`,
                                                    children: e.fileName,
                                                  },
                                                  e.id,
                                                ),
                                              ),
                                              e.pricingMode === `file` &&
                                                !(e.documents ?? []).length &&
                                                (0, x.jsx)(`p`, {
                                                  className: `text-xs text-[#63797b]`,
                                                  children: `Quotation file is awaiting identity review before release.`,
                                                }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            className: `space-y-2 text-xs text-[#63797b] mb-6`,
                                            children: [
                                              (0, x.jsxs)(`div`, {
                                                children: [
                                                  (0, x.jsx)(`strong`, {
                                                    className: `text-[#123540]`,
                                                    children: `Payment Terms:`,
                                                  }),
                                                  ` `,
                                                  e.paymentTerms,
                                                ],
                                              }),
                                              (0, x.jsxs)(`div`, {
                                                children: [
                                                  (0, x.jsx)(`strong`, {
                                                    className: `text-[#123540]`,
                                                    children: `Vendor Notes:`,
                                                  }),
                                                  ` `,
                                                  e.notes || `No remarks added`,
                                                ],
                                              }),
                                            ],
                                          }),
                                          t &&
                                            e.vendorContact &&
                                            (0, x.jsxs)(`div`, {
                                              className: `mb-6 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  className: `font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']`,
                                                  children: [
                                                    (0, x.jsx)(ce, {
                                                      className: `w-4 h-4 text-[#eb6a32]`,
                                                    }),
                                                    `Official Vendor Contact Details (Unmasked)`,
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `grid grid-cols-2 gap-2 text-[#123540] pt-1`,
                                                  children: [
                                                    (0, x.jsxs)(`div`, {
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#63797b] block text-[10px]`,
                                                          children: `Company Name`,
                                                        }),
                                                        (0, x.jsx)(`strong`, {
                                                          className: `text-[#123540]`,
                                                          children:
                                                            e.vendorContact
                                                              ?.companyName,
                                                        }),
                                                      ],
                                                    }),
                                                    (0, x.jsxs)(`div`, {
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#63797b] block text-[10px]`,
                                                          children: `Trade License`,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `font-mono`,
                                                          children:
                                                            e.vendorContact
                                                              .tradeLicenseNumber,
                                                        }),
                                                      ],
                                                    }),
                                                    (0, x.jsxs)(`div`, {
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#63797b] block text-[10px]`,
                                                          children: `Account Representative`,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          children:
                                                            e.vendorContact
                                                              .contactPerson,
                                                        }),
                                                      ],
                                                    }),
                                                    (0, x.jsxs)(`div`, {
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#63797b] block text-[10px]`,
                                                          children: `Direct Phone`,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `font-mono text-[#123f47] font-bold`,
                                                          children:
                                                            e.vendorContact
                                                              .contactPhone,
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          !de &&
                                            (0, x.jsxs)(`button`, {
                                              onClick: () => d(e),
 disabled: !!e.workbookResponse?.staleRevision || !!e.workbookResponse?.preliminary,
                                              className: `w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-2.5 px-4 rounded-[5px] text-xs transition-colors flex items-center justify-center gap-2 shadow-sm`,
                                              children: [
                                                (0, x.jsx)(ne, {
                                                  className: `w-4 h-4`,
                                                }),
                                                (0, x.jsx)(`span`, {
                                                  children: `Select Vendor & Confirm Award`,
                                                }),
                                              ],
                                            }),
                                        ],
                                      },
                                      e.id,
                                    );
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                      n === `create_rfq` &&
                        (0, x.jsxs)(`div`, {
                          className: `max-w-4xl mx-auto`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `mb-6`,
                              children: [
                                (0, x.jsx)(`button`, {
                                  onClick: () => r(`dashboard`),
                                  className: `text-xs font-bold text-[#123540] hover:text-[#eb6a32] mb-2 block`,
                                  children: `← Back to Dashboard`,
                                }),
                                (0, x.jsx)(`h2`, {
                                  className: `text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                                  children: `Create New RFQ Procurement Package`,
                                }),
                                (0, x.jsx)(`p`, {
                                  className: `text-xs text-[#63797b] mt-1`,
                                  children: `Define project requirements, construct itemized Bill of Quantities (BoQ) items, attach technical drawings, and publish for vendor quotations.`,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`form`, {
                              onSubmit: (e) => Zt(e, !1),
                              className: `bg-white border border-[#e1e7e4] rounded-[6px] p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] space-y-8`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  children: [
                                    (0, x.jsx)(`h3`, {
                                      className: `text-sm font-bold text-[#123540] uppercase tracking-wider pb-2 border-b border-[#e1e7e4] mb-4 font-['Manrope']`,
                                      children: `1. Project & Scope Details`,
                                    }),
                                    /manpower|labou?r/i.test(st) &&
                                      (0, x.jsx)(`div`, {
                                        className: `grid grid-cols-3 gap-4 mb-4`,
                                        children: [
                                          [`Persons`, Ct, wt],
                                          [`Hours per person per day`, Tt, Et],
                                          [`Days / shifts`, Dt, Ot],
                                        ].map(([e, t, n]) =>
                                          (0, x.jsxs)(
                                            `label`,
                                            {
                                              className: `text-xs`,
                                              children: [
                                                e,
                                                (0, x.jsx)(`input`, {
                                                  type: `number`,
                                                  min: `0.01`,
                                                  step: `any`,
                                                  required: !0,
                                                  value: t,
                                                  onChange: (e) =>
                                                    n(e.target.value),
                                                  className: `border rounded p-2 w-full`,
                                                }),
                                              ],
                                            },
                                            e,
                                          ),
                                        ),
                                      }),
                                    (0, x.jsxs)(`div`, {
                                      className: `grid grid-cols-1 sm:grid-cols-2 gap-4`,
                                      children: [
                                        (0, x.jsxs)(`div`, {
                                          className: `sm:col-span-2`,
                                          children: [
                                            (0, x.jsxs)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: [
                                                `RFQ Package Title `,
                                                (0, x.jsx)(`span`, {
                                                  className: `text-[#eb6a32]`,
                                                  children: `*`,
                                                }),
                                              ],
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `text`,
                                              required: !0,
                                              placeholder: `e.g. Luxury Penthouse Custom Joinery & Acoustic Paneling`,
                                              value: at,
                                              onChange: (e) =>
                                                ot(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:border-[#eb6a32]`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Procurement Category`,
                                            }),
                                            (0, x.jsxs)(`select`, {
                                              value: st,
                                              onChange: (e) =>
                                                ct(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white`,
                                              children: [
                                                (0, x.jsx)(`option`, {
                                                  value: `Manpower & Labour`,
                                                  children: `Manpower & Labour`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Joinery & Carpentry`,
                                                  children: `Joinery & Carpentry`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Gypsum & Drywall`,
                                                  children: `Gypsum & Drywall / Acoustic Ceilings`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `MEP & HVAC`,
                                                  children: `MEP, Electrical & HVAC`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Glazing & Facades`,
                                                  children: `Glazing, Aluminum & Facades`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Flooring & Tiling`,
                                                  children: `Flooring, Marble & Stone`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Painting & Wall Finishes`,
                                                  children: `Painting & Wall Coverings`,
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Project Name / Location`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `text`,
                                              required: !0,
                                              placeholder: `e.g. DIFC Gate Village Level 14`,
                                              value: lt,
                                              onChange: (e) =>
                                                ut(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Emirate`,
                                            }),
                                            (0, x.jsxs)(`select`, {
                                              value: dt,
                                              onChange: (e) =>
                                                ft(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm bg-white`,
                                              children: [
                                                (0, x.jsx)(`option`, {
                                                  value: `Dubai`,
                                                  children: `Dubai`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Abu Dhabi`,
                                                  children: `Abu Dhabi`,
                                                }),
                                                (0, x.jsx)(`option`, {
                                                  value: `Sharjah`,
                                                  children: `Sharjah`,
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Estimated Budget (AED)`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `number`,
                                              value: _t,
                                              onChange: (e) =>
                                                vt(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Submission Deadline`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `date`,
                                              value: pt,
                                              onChange: (e) =>
                                                mt(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Target Completion Date`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `date`,
                                              value: ht,
                                              onChange: (e) =>
                                                gt(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm font-mono`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          className: `sm:col-span-2`,
                                          children: [
                                            (0, x.jsxs)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: [
                                                `Detailed Scope Description `,
                                                (0, x.jsx)(`span`, {
                                                  className: `text-[#eb6a32]`,
                                                  children: `*`,
                                                }),
                                              ],
                                            }),
                                            (0, x.jsx)(`textarea`, {
                                              rows: 3,
                                              required: !0,
                                              placeholder: `Describe technical requirements, material specifications, site access hours, acoustic performance standards...`,
                                              value: yt,
                                              onChange: (e) =>
                                                bt(e.target.value),
                                              className: `w-full px-3.5 py-2.5 rounded-[5px] border border-[#bccbca] text-sm leading-relaxed`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, x.jsxs)(`label`, {
                                  className: `block text-sm font-semibold`,
                                  children: [
                                    `BOQ method`,
                                    (0, x.jsxs)(`select`, {
                                      "aria-label": `BOQ method`,
                                      value: jt,
                                      onChange: (e) => Mt(e.target.value),
                                      className: `block border border-[#bccbca] p-2 mt-2 rounded`,
                                      children: [
                                        (0, x.jsx)(`option`, {
                                          value: `itemized`,
                                          children: `Enter line items`,
                                        }),
                                        (0, x.jsx)(`option`, {
                                          value: `file`,
                                          children: `Upload BOQ — price as a complete package`,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                jt === `file` &&
                                  (0, x.jsx)(`p`, {
                                    className: `text-xs`,
                                    children: `Attach the PDF or Excel BOQ below and choose BOQ as its purpose. After review, vendors download the branded Excel RFQ, fill it in and upload the same workbook.`,
                                  }),
                                jt === `itemized` &&
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`div`, {
                                        className: `flex items-center justify-between pb-2 border-b border-[#e1e7e4] mb-4`,
                                        children: [
                                          (0, x.jsx)(`h3`, {
                                            className: `text-sm font-bold text-[#123540] uppercase tracking-wider font-['Manrope']`,
                                            children: `2. Bill of Quantities (BoQ Line Items)`,
                                          }),
                                          (0, x.jsxs)(`button`, {
                                            type: `button`,
                                            onClick: Jt,
                                            className: `text-xs font-bold text-[#eb6a32] hover:text-[#bd4b1c] flex items-center gap-1`,
                                            children: [
                                              (0, x.jsx)(be, {
                                                className: `w-3.5 h-3.5`,
                                              }),
                                              ` Add Line Item`,
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`div`, {
                                        className: `space-y-3`,
                                        children: xt.map((e, t) =>
                                          (0, x.jsxs)(
                                            `div`,
                                            {
                                              className: `p-4 bg-[#f7f6f2] border border-[#e1e7e4] rounded-[5px] grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs items-end`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  className: `sm:col-span-5`,
                                                  children: [
                                                    (0, x.jsxs)(`label`, {
                                                      className: `block text-[10px] uppercase font-bold text-[#63797b] mb-1`,
                                                      children: [
                                                        `Item #`,
                                                        t + 1,
                                                        ` Description`,
                                                      ],
                                                    }),
                                                    (0, x.jsx)(`input`, {
                                                      type: `text`,
                                                      required: !0,
                                                      value: e.description,
                                                      onChange: (e) => {
                                                        let n = [...xt];
                                                        ((n[t].description =
                                                          e.target.value),
                                                          St(n));
                                                      },
                                                      placeholder: `e.g. Supply & install fluted acoustic paneling`,
                                                      className: `w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white text-xs`,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `sm:col-span-2`,
                                                  children: [
                                                    (0, x.jsx)(`label`, {
                                                      className: `block text-[10px] uppercase font-bold text-[#63797b] mb-1`,
                                                      children: `Quantity`,
                                                    }),
                                                    (0, x.jsx)(`input`, {
                                                      type: `number`,
                                                      required: !0,
                                                      value: e.quantity,
                                                      onChange: (e) => {
                                                        let n = [...xt];
                                                        ((n[t].quantity =
                                                          parseFloat(
                                                            e.target.value,
                                                          ) || 1),
                                                          St(n));
                                                      },
                                                      className: `w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white font-mono text-xs`,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `sm:col-span-2`,
                                                  children: [
                                                    (0, x.jsx)(`label`, {
                                                      className: `block text-[10px] uppercase font-bold text-[#63797b] mb-1`,
                                                      children: `Unit`,
                                                    }),
                                                    (0, x.jsxs)(`select`, {
                                                      value: e.unit,
                                                      onChange: (e) => {
                                                        let n = [...xt];
                                                        ((n[t].unit =
                                                          e.target.value),
                                                          St(n));
                                                      },
                                                      className: `w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white font-mono text-xs`,
                                                      children: [
                                                        (0, x.jsx)(`option`, {
                                                          value: `sqm`,
                                                          children: `sqm`,
                                                        }),
                                                        (0, x.jsx)(`option`, {
                                                          value: `lm`,
                                                          children: `lm`,
                                                        }),
                                                        (0, x.jsx)(`option`, {
                                                          value: `nos`,
                                                          children: `nos`,
                                                        }),
                                                        (0, x.jsx)(`option`, {
                                                          value: `lump_sum`,
                                                          children: `lump sum`,
                                                        }),
                                                        (0, x.jsx)(`option`, {
                                                          value: `kg`,
                                                          children: `kg`,
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `sm:col-span-2`,
                                                  children: [
                                                    (0, x.jsx)(`label`, {
                                                      className: `block text-[10px] uppercase font-bold text-[#63797b] mb-1`,
                                                      children: `Specification`,
                                                    }),
                                                    (0, x.jsx)(`input`, {
                                                      type: `text`,
                                                      value: e.specifications,
                                                      onChange: (e) => {
                                                        let n = [...xt];
                                                        ((n[t].specifications =
                                                          e.target.value),
                                                          St(n));
                                                      },
                                                      placeholder: `STC 45, Oak finish`,
                                                      className: `w-full px-2.5 py-1.5 border border-[#bccbca] rounded bg-white text-xs`,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsx)(`div`, {
                                                  className: `sm:col-span-1 text-right`,
                                                  children:
                                                    xt.length > 1 &&
                                                    (0, x.jsx)(`button`, {
                                                      type: `button`,
                                                      onClick: () => Yt(t),
                                                      className: `p-1.5 text-[#63797b] hover:text-rose-600 transition-colors`,
                                                      title: `Remove item`,
                                                      children: (0, x.jsx)(N, {
                                                        className: `w-4 h-4`,
                                                      }),
                                                    }),
                                                }),
                                              ],
                                            },
                                            t,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                (0, x.jsxs)(`div`, {
                                  children: [
                                    (0, x.jsx)(`h3`, {
                                      className: `text-sm font-bold text-[#123540] uppercase tracking-wider pb-2 border-b border-[#e1e7e4] mb-3 font-['Manrope']`,
                                      children: `3. Technical Drawings & Specification Files`,
                                    }),
                                    (0, x.jsx)(Ve, {
                                      id: `rfq-files`,
                                      files: kt,
                                      onChange: At,
                                      onBusy: Pt,
                                      disabled: Ft,
                                    }),
                                    rt &&
                                      (0, x.jsx)(`p`, {
                                        className: `text-xs mt-2`,
                                        children: `Previously uploaded documents remain attached to this draft.`,
                                      }),
                                  ],
                                }),
                                T &&
                                  (0, x.jsxs)(`div`, {
                                    className: `p-3.5 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2`,
                                    children: [
                                      (0, x.jsx)(se, {
                                        className: `w-4 h-4 shrink-0 text-rose-600`,
                                      }),
                                      (0, x.jsx)(`span`, { children: T }),
                                    ],
                                  }),
                                (0, x.jsxs)(`div`, {
                                  className: `pt-4 border-t border-[#e1e7e4] flex justify-end gap-3`,
                                  children: [
                                    (0, x.jsx)(`button`, {
                                      type: `button`,
                                      onClick: () => r(`dashboard`),
                                      className: `px-5 py-2.5 rounded-[5px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]`,
                                      children: `Cancel`,
                                    }),
                                    (0, x.jsx)(`button`, {
                                      type: `button`,
                                      disabled: Ft || Nt,
                                      onClick: (e) => Zt(e, !0),
                                      className: `px-5 py-2.5 rounded-[5px] border border-[#123540] text-xs font-bold text-[#123540] hover:bg-white`,
                                      children: `Save as Draft`,
                                    }),
                                    (0, x.jsx)(`button`, {
                                      type: `submit`,
                                      disabled: Ft || Nt,
                                      className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-6 py-2.5 rounded-[5px] text-xs shadow-sm transition-all`,
                                      children: `Submit RFQ for Review`,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                    ],
                  })
                : (0, x.jsxs)(`div`, {
                    className: `max-w-xl mx-auto bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.05)] p-8`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        className: `flex border-b border-[#e1e7e4] mb-6`,
                        children: [
                          (0, x.jsxs)(`button`, {
                            onClick: () => h(`login`),
                            className: `flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${m === `login` ? `border-[#eb6a32] text-[#123540]` : `border-transparent text-[#63797b] hover:text-[#123540]`}`,
                            children: [
                              (0, x.jsx)(j, { className: `w-4 h-4` }),
                              `Contractor Login`,
                            ],
                          }),
                          (0, x.jsxs)(`button`, {
                            onClick: () => {
                              (xe(!1), we(null), h(`register`));
                            },
                            className: `flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${m === `register` ? `border-[#eb6a32] text-[#123540]` : `border-transparent text-[#63797b] hover:text-[#123540]`}`,
                            children: [
                              (0, x.jsx)(Ee, { className: `w-4 h-4` }),
                              `Register Organization`,
                            ],
                          }),
                        ],
                      }),
                      ee &&
                        (0, x.jsx)(`div`, {
                          className: `mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs`,
                          children: ee,
                        }),
                      m === `login`
                        ? (0, x.jsxs)(`form`, {
                            onSubmit: R,
                            className: `space-y-4 text-xs`,
                            children: [
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsx)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: `Company Email Address`,
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `email`,
                                    required: !0,
                                    value: g,
                                    onChange: (e) => _(e.target.value),
                                    className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsx)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: `Account Password`,
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `password`,
                                    required: !0,
                                    value: v,
                                    onChange: (e) => y(e.target.value),
                                    className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]`,
                                  }),
                                ],
                              }),
                              (0, x.jsx)(`button`, {
                                type: `submit`,
                                className: `w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5`,
                                children: `Sign In to Contractor Dashboard`,
                              }),
                            ],
                          })
                        : (0, x.jsxs)(`form`, {
                            onSubmit: qt,
                            className: `space-y-4 text-xs`,
                            children: [
                              (0, x.jsx)(Ke, { onChange: ke, onBusy: Me }),
                              (0, x.jsxs)(`label`, {
                                className: `block`,
                                children: [
                                  (0, x.jsx)(`input`, {
                                    type: `checkbox`,
                                    checked: Ne,
                                    onChange: (e) => Pe(e.target.checked),
                                  }),
                                  ` List my company name and trade/emirate on the homepage after Admin verification (optional). Contact details and license files stay private.`,
                                ],
                              }),
                              w &&
                                (0, x.jsxs)(`div`, {
                                  className: `p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2`,
                                  children: [
                                    (0, x.jsx)(se, {
                                      className: `w-4 h-4 shrink-0 text-rose-600`,
                                    }),
                                    (0, x.jsx)(`span`, { children: w }),
                                  ],
                                }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Company Name `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `text`,
                                    required: !0,
                                    placeholder: `e.g. Al Naboodah Fit-Out LLC`,
                                    value: De,
                                    onChange: (e) => Oe(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `grid grid-cols-2 gap-3`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Trade License Number `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `text`,
                                        required: !0,
                                        placeholder: `e.g. CN-109281`,
                                        value: Fe,
                                        onChange: (e) => I(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsx)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: `Emirate`,
                                      }),
                                      (0, x.jsxs)(`select`, {
                                        value: Le,
                                        onChange: (e) => Re(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white`,
                                        children: [
                                          (0, x.jsx)(`option`, {
                                            value: `Dubai`,
                                            children: `Dubai`,
                                          }),
                                          (0, x.jsx)(`option`, {
                                            value: `Abu Dhabi`,
                                            children: `Abu Dhabi`,
                                          }),
                                          (0, x.jsx)(`option`, {
                                            value: `Sharjah`,
                                            children: `Sharjah`,
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `grid grid-cols-2 gap-3`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Key Contact Person `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `text`,
                                        required: !0,
                                        placeholder: `e.g. Tariq Mansoor`,
                                        value: We,
                                        onChange: (e) => Xe(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Contact Phone `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `tel`,
                                        required: !0,
                                        placeholder: `+971 50 123 4567`,
                                        value: Ze,
                                        onChange: (e) => Qe(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Official Company Email `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `email`,
                                    required: !0,
                                    placeholder: `procurement@company.ae`,
                                    value: $e,
                                    onChange: (e) => et(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Account Password `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `password`,
                                    required: !0,
                                    placeholder: `Set a secure password`,
                                    value: tt,
                                    onChange: (e) => nt(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsx)(He, {
                                role: `contractor`,
                                checked: _e,
                                onChange: xe,
                                onDocument: we,
                              }),
                              (0, x.jsx)(`button`, {
                                type: `submit`,
                                disabled: !_e || !Se || he || je || !F,
                                className: `w-full disabled:opacity-50 bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5`,
                                children: `ACCEPT TERMS & COMPLETE REGISTRATION`,
                              }),
                            ],
                          }),
                    ],
                  }),
            }),
            u &&
              (0, x.jsx)(`div`, {
                className: `fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#082631]/80 backdrop-blur-sm animate-in fade-in`,
                children: (0, x.jsxs)(`div`, {
                  className: `bg-white border border-[#e1e7e4] w-full max-w-lg rounded-[6px] shadow-[0_20px_50px_rgba(18,53,64,0.25)] overflow-hidden`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `px-6 py-4 bg-[#123f47] text-white flex items-center justify-between`,
                      children: [
                        (0, x.jsxs)(`h3`, {
                          className: `text-base font-extrabold font-['Manrope'] flex items-center gap-2`,
                          children: [
                            (0, x.jsx)(ne, {
                              className: `w-5 h-5 text-[#eb6a32]`,
                            }),
                            `Confirm Contract Award`,
                          ],
                        }),
                        (0, x.jsx)(`button`, {
                          onClick: () => d(null),
                          className: `text-[#c3d9d8] hover:text-white`,
                          children: `×`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `p-6 space-y-4 text-xs`,
                      children: [
                        (0, x.jsxs)(`p`, {
                          className: `text-[#63797b] leading-relaxed`,
                          children: [
                            `You are designating `,
                            (0, x.jsx)(`strong`, {
                              className: `text-[#123540] font-mono`,
                              children: u.vendorDisplayName,
                            }),
                            ` as the winner of this procurement package.`,
                          ],
                        }),
                        (0, x.jsx)(`p`, {
                          className: `font-bold text-[#123540]`,
                          children: `Your Contractor / Client Service Charge: AED 0. Vendor charges are payable by the awarded Vendor.`,
                        }),
                        (() => {
                          if (
                            Kt?.procurementType === `manpower` ||
                            /manpower|labou?r/i.test(Kt?.category || ``)
                          )
                            return (0, x.jsx)(`p`, {
                              children: `Vendor manpower Service Charge is AED 1 per person per hour. Your Contractor / Client Service Charge remains AED 0.`,
                            });
                          let e = Ye.calculate({
                            contractAmountAed: u.totalAmountAed,
                          });
                          return (0, x.jsxs)(`div`, {
                            className: `p-4 bg-[#f7f6f2] rounded-[6px] border border-[#e1e7e4] space-y-2.5 text-[#123540]`,
                            children: [
                              (0, x.jsxs)(`div`, {
                                className: `flex justify-between items-center`,
                                children: [
                                  (0, x.jsx)(`span`, {
                                    className: `text-[#63797b]`,
                                    children: `Contract Award Amount`,
                                  }),
                                  (0, x.jsxs)(`span`, {
                                    className: `font-mono font-bold text-sm`,
                                    children: [
                                      `AED `,
                                      e.contractAmountAed.toLocaleString(),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `flex justify-between items-center text-[#63797b]`,
                                children: [
                                  (0, x.jsxs)(`span`, {
                                    children: [
                                      `Vendor Service Charge (`,
                                      e.appliedPercentage * 100,
                                      `%)`,
                                    ],
                                  }),
                                  (0, x.jsxs)(`span`, {
                                    className: `font-mono font-semibold text-[#123540]`,
                                    children: [
                                      `AED `,
                                      e.totalServiceChargeAed.toLocaleString(),
                                    ],
                                  }),
                                ],
                              }),
                              e.minimumChargeEnforced &&
                                (0, x.jsx)(`div`, {
                                  className: `text-[11px] text-[#123540] bg-white p-2 rounded border border-[#e1e7e4]`,
                                  children: `* Minimum threshold of AED 500.00 applied as per Urban Procures service charge rules.`,
                                }),
                            ],
                          });
                        })(),
                        (0, x.jsxs)(`div`, {
                          className: `p-3 bg-[#eef6f5] border border-[#123f47]/30 rounded text-[#123f47] space-y-1`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `font-bold flex items-center gap-1.5 font-['Manrope']`,
                              children: [
                                (0, x.jsx)(Ce, {
                                  className: `w-4 h-4 text-[#eb6a32]`,
                                }),
                                `Post-Award Identity Release Rule`,
                              ],
                            }),
                            (0, x.jsx)(`p`, {
                              className: `text-[11px] text-[#63797b]`,
                              children: `Upon confirming this award, the system will execute an audited transaction unmasking contractor and vendor contact details to each other.`,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `px-6 py-4 bg-[#f7f6f2] border-t border-[#e1e7e4] flex justify-end gap-3`,
                      children: [
                        (0, x.jsx)(`button`, {
                          onClick: () => d(null),
                          className: `px-4 py-2 rounded-[4px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-white`,
                          children: `Cancel`,
                        }),
                        (0, x.jsx)(`button`, {
                          onClick: async () => {
                            if (u && Kt) {
                              p(!0);
                              try {
                                let e = await L.contractor.confirmAward(
                                  Kt.id,
                                  u.id,
                                );
                                (p(!1),
                                  d(null),
                                  me({ ...e.data, quotationId: u.id }),
                                  t(
                                    `Contract Award Confirmed! Identity and contact details have been mutually released.`,
                                    `success`,
                                    `Award Finalized`,
                                  ),
                                  await Ht(),
                                  await Ut(Kt.id));
                              } catch (e) {
                                (p(!1),
                                  t(
                                    e.message || `Failed to confirm award`,
                                    `error`,
                                  ));
                              }
                            }
                          },
                          disabled: f,
                          className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-5 py-2 rounded-[4px] text-xs transition-colors flex items-center gap-1.5 shadow-sm`,
                          children: f
                            ? `Awarding...`
                            : `Confirm & Release Contact Info`,
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            c &&
              (0, x.jsx)(Je, {
                document: c,
                onClose: () => l(null),
                viewerRole: `contractor`,
              }),
          ],
        });
  };
async function Ze(e, t) {
  let n = await fetch(
    `/api/rfq-workbooks/` + encodeURIComponent(e) + `/download`,
  );
  if (!n.ok) {
    let e = await n.json();
    throw Error(e.error || `Download failed`);
  }
  let r = URL.createObjectURL(await n.blob()),
    i = document.createElement(`a`);
  ((i.href = r),
    (i.download = `Urban-Procures-RFQ-Rev-${t}.xlsx`),
    i.click(),
    setTimeout(() => URL.revokeObjectURL(r), 1e3));
}
var Qe = ({ rfq: e, onSubmitted: t }) => {
    let [n, r] = (0, b.useState)(null),
      [i, a] = (0, b.useState)(!1),
      [o, s] = (0, b.useState)(``),
      c = e.excelWorkbook,
      l = async (e) => {
        if (!i) {
          (a(!0), s(``));
          try {
            await e();
          } catch (e) {
            s(e instanceof Error ? e.message : `Request failed`);
          } finally {
            a(!1);
          }
        }
      };
    return c
      ? (0, x.jsxs)(`form`, {
          className: `bg-white border border-[#e1e7e4] rounded p-6 space-y-4`,
          onSubmit: (r) => {
            (r.preventDefault(),
              l(async () => {
                if (
                  !n ||
                  !n.name.toLowerCase().endsWith(`.xlsx`) ||
                  n.size > 1e7
                )
                  throw Error(
                    `Choose the completed XLSX workbook, up to 10 MB.`,
                  );
                let r = await new Promise((e, t) => {
                    let r = new FileReader();
                    ((r.onload = () => e(String(r.result))),
                      (r.onerror = () => t(Error(`Could not read workbook`))),
                      r.readAsDataURL(n));
                  }),
                  i =
                    c.parentKind === `public`
                      ? `/api/vendor/rfq-workbooks/${encodeURIComponent(c.id)}/quote`
                      : `/api/vendor/rfqs/${encodeURIComponent(e.id)}/quote`,
                  a = await fetch(i, {
                    method: `POST`,
                    headers: { "Content-Type": `application/json` },
                    body: JSON.stringify({
                      excelFile: {
                        fileName: n.name,
                        fileType: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
                        fileSizeBytes: n.size,
                        dataUrl: r,
                        documentPurpose: `boq`,
                      },
                    }),
                  }),
                  o = await a.json();
                if (!a.ok || !o.success)
                  throw Error(o.error || `Upload failed`);
                await t();
              }));
          },
          children: [
            (0, x.jsx)(`h3`, {
              className: `font-bold text-[#123540]`,
              children: `Complete and upload the Excel quotation`,
            }),
            (0, x.jsxs)(`p`, {
              className: `text-sm`,
              children: [
                `Download revision `,
                c.revision,
                `, fill the blank vendor fields, save it and upload the same workbook. Keep the source schedule unchanged.`,
              ],
            }),
            c.preliminary &&
              (0, x.jsx)(`p`, {
                className: `text-sm text-[#a54b22]`,
                children: `Preliminary RFQ: quantities need verification. An award cannot be made from this revision.`,
              }),
            (0, x.jsx)(`button`, {
              type: `button`,
              disabled: i,
              className: `border border-[#123f47] rounded px-4 py-2`,
              onClick: () => l(() => Ze(c.id, c.revision)),
              children: `Download Excel RFQ`,
            }),
            (0, x.jsxs)(`label`, {
              className: `block text-sm font-semibold`,
              children: [
                `Completed Excel workbook`,
                (0, x.jsx)(`input`, {
                  className: `block mt-2`,
                  type: `file`,
                  accept: `.xlsx`,
                  required: !0,
                  disabled: i,
                  onChange: (e) => r(e.target.files?.[0] ?? null),
                }),
              ],
            }),
            o &&
              (0, x.jsx)(`p`, {
                role: `alert`,
                className: `text-red-700`,
                children: o,
              }),
            (0, x.jsx)(`button`, {
              disabled: i,
              className: `bg-[#123f47] text-white rounded px-5 py-2`,
              children: i ? `Please wait…` : `Submit Excel quotation`,
            }),
          ],
        })
      : (0, x.jsxs)(`div`, {
          className: `bg-white border rounded p-6`,
          children: [
            (0, x.jsx)(`h3`, {
              className: `font-bold`,
              children: `Excel RFQ awaiting review`,
            }),
            (0, x.jsx)(`p`, {
              className: `mt-2 text-sm`,
              children: `Download and quotation submission will be available after the reviewed workbook is published.`,
            }),
          ],
        });
  },
  $e = ({ onNavigate: e }) => {
    let { showToast: t } = Ae(),
      [n, r] = (0, b.useState)(`home`),
      [i, a] = (0, b.useState)(`all`),
      [o, s] = (0, b.useState)(null),
      [c, l] = (0, b.useState)(null),
      [u, d] = (0, b.useState)(`login`),
      [f, p] = (0, b.useState)(``),
      [m, h] = (0, b.useState)(``),
      [g, _] = (0, b.useState)(null),
      [v, y] = (0, b.useState)(null),
      [ee, C] = (0, b.useState)(null),
      [w, te] = (0, b.useState)(``),
      [T, E] = (0, b.useState)(null),
      [D, O] = (0, b.useState)(!1),
      [k, re] = (0, b.useState)(!1),
      [ie, A] = (0, b.useState)(``),
      [ae, ue] = (0, b.useState)([`Joinery & Carpentry`]),
      [de, fe] = (0, b.useState)([`Dubai`]),
      [me, ge] = (0, b.useState)(``),
      [_e, be] = (0, b.useState)(`+971 `),
      [xe, Se] = (0, b.useState)(``),
      [Ce, we] = (0, b.useState)(``),
      [N, Te] = (0, b.useState)(!1),
      [P, De] = (0, b.useState)(!1),
      [Oe, F] = (0, b.useState)(null),
      [ke, je] = (0, b.useState)(null),
      [Me, Ne] = (0, b.useState)(null),
      [Pe, Fe] = (0, b.useState)(!1);
    (0, b.useEffect)(() => {
      let e = () => Fe(!1);
      return (
        window.addEventListener(`urbanprocures:terms-required`, e),
        () => window.removeEventListener(`urbanprocures:terms-required`, e)
      );
    }, []);
    let [I, Le] = (0, b.useState)([]),
      [Re, ze] = (0, b.useState)([]),
      [Be, We] = (0, b.useState)(``),
      [Ye, Xe] = (0, b.useState)(`24`),
      [Ze, $e] = (0, b.useState)(`30`),
      [et, tt] = (0, b.useState)(``),
      [nt, rt] = (0, b.useState)(``),
      [it, at] = (0, b.useState)({}),
      [ot, st] = (0, b.useState)([]),
      [ct, lt] = (0, b.useState)(!1),
      [ut, dt] = (0, b.useState)(`itemized`),
      [ft, pt] = (0, b.useState)(``),
      mt = (0, b.useRef)(!1),
      [ht, gt] = (0, b.useState)(!1),
      _t = async () => {
        let e = await L.auth.me();
        if (!e.authenticated || e.user.role !== `vendor`) {
          (je(null), Ne(null));
          return;
        }
        if (
          (je(e.user),
          Ne(e.vendor),
          Fe(e.termsAccepted === !0),
          We(``),
          e.termsAccepted && e.vendor?.verificationStatus !== `verified`)
        ) {
          (Le([]), ze([]));
          return;
        }
        if (e.termsAccepted)
          try {
            let e = await L.vendor.getMatchingRfqs(`all`);
            (Le(e),
              s((t) => (t ? (e.find((e) => e.id === t.id) ?? null) : null)),
              ze(await L.vendor.getMyQuotes()));
          } catch (e) {
            We(e.message);
          }
      };
    (0, b.useEffect)(() => {
      _t().catch((e) => We(e.message));
    }, []);
    let vt = ke?.role === `vendor`;
    Ie(_t, vt && Pe);
    let yt = async (e, n) => {
      if (
        window.confirm(
          n === `recall`
            ? `Recall this quotation? It will be withdrawn from comparison.`
            : `Remove this quotation? Its audit history will be retained.`,
        )
      )
        try {
          (await L.vendor.withdrawQuote(e, n),
            await _t(),
            t(
              `Quotation withdrawn. Admin and Contractor views will update.`,
              `success`,
            ));
        } catch (e) {
          t(e.message, `error`);
        }
    };
    (0, b.useEffect)(() => {
      s(null);
    }, [i]);
    let bt = I;
    return vt && (!Pe || N)
      ? (0, x.jsx)(Ue, {
          role: `vendor`,
          onAccepted: () => {
            (Te(!1), _t());
          },
        })
      : (0, x.jsxs)(`div`, {
          className: `min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']`,
          children: [
            ke ? (0, x.jsx)(qe, {}) : (0, x.jsx)(S, {}),
            vt &&
              Me?.verificationStatus !== `verified` &&
              (0, x.jsxs)(`aside`, {
                className: `p-4 bg-[#fff5eb] border text-sm`,
                children: [
                  (0, x.jsx)(`strong`, {
                    children: `Business verification pending`,
                  }),
                  (0, x.jsx)(`p`, {
                    children: `Upload your trade license above. Admin must review and verify your business before you can open tender documents or submit quotations. Approved RFQ summaries are available on the homepage.`,
                  }),
                  (0, x.jsx)(`button`, {
                    className: `underline`,
                    onClick: () => e(`/`),
                    children: `View published RFQ summaries`,
                  }),
                ],
              }),
            Be &&
              (0, x.jsx)(`p`, {
                role: `alert`,
                className: `p-4 bg-white border border-[#e1e7e4] text-red-700 text-xs`,
                children: Be,
              }),
            (0, x.jsx)(`div`, {
              className: `bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]`,
              children: (0, x.jsxs)(`div`, {
                className: `max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4`,
                children: [
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsxs)(`div`, {
                        className: `inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']`,
                        children: [
                          (0, x.jsx)(`span`, { children: `Vendor Portal` }),
                          (0, x.jsx)(`span`, {
                            "aria-hidden": `true`,
                            children: `·`,
                          }),
                          (0, x.jsx)(`span`, {
                            children: `Subcontractor & Supplier Opportunities`,
                          }),
                        ],
                      }),
                      (0, x.jsxs)(`h1`, {
                        className: `text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3`,
                        children: [
                          (0, x.jsx)(he, {
                            className: `w-7 h-7 text-[#eb6a32]`,
                          }),
                          `Vendor RFQ Discovery`,
                        ],
                      }),
                      vt && Me
                        ? (0, x.jsxs)(`p`, {
                            className: `text-xs sm:text-sm text-[#c3d9d8] mt-1`,
                            children: [
                              `Organization: `,
                              (0, x.jsx)(`strong`, {
                                className: `text-white`,
                                children: Me.companyName,
                              }),
                              ` (License: `,
                              Me.tradeLicenseNumber,
                              ` · Categories: `,
                              Me.tradeCategories.join(`, `),
                              `)`,
                            ],
                          })
                        : (0, x.jsx)(`p`, {
                            className: `text-xs sm:text-sm text-[#c3d9d8] mt-1`,
                            children: `For suppliers, vendors, subcontractors, and specialist service providers.`,
                          }),
                    ],
                  }),
                  (0, x.jsx)(`div`, {
                    className: `flex items-center gap-2`,
                    children:
                      vt && Me
                        ? (0, x.jsxs)(x.Fragment, {
                            children: [
                              Pe
                                ? (0, x.jsxs)(`span`, {
                                    className: `flex items-center gap-1.5 text-xs text-[#e3edeb] bg-[#082631] border border-[#194048] px-3 py-1.5 rounded-[5px] font-medium font-mono`,
                                    children: [
                                      (0, x.jsx)(ce, {
                                        className: `w-4 h-4 text-[#eb6a32]`,
                                      }),
                                      `Current Terms Accepted`,
                                    ],
                                  })
                                : (0, x.jsxs)(`button`, {
                                    onClick: () => Te(!0),
                                    className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 shadow-sm active:translate-y-0.5`,
                                    children: [
                                      (0, x.jsx)(se, { className: `w-4 h-4` }),
                                      (0, x.jsx)(`span`, {
                                        children: `Action: Accept Vendor Terms`,
                                      }),
                                    ],
                                  }),
                              (0, x.jsxs)(`button`, {
                                onClick: () => {
                                  (L.auth.logout().then(() => {
                                    (je(null),
                                      Ne(null),
                                      Le([]),
                                      ze([]),
                                      Fe(!1));
                                  }),
                                    t(
                                      `You have been signed out successfully.`,
                                      `info`,
                                    ));
                                },
                                className: `text-xs text-[#c3d9d8] hover:text-white flex items-center gap-1 px-2 py-1 ml-2`,
                                children: [
                                  (0, x.jsx)(M, { className: `w-3.5 h-3.5` }),
                                  (0, x.jsx)(`span`, { children: `Sign Out` }),
                                ],
                              }),
                            ],
                          })
                        : (0, x.jsx)(`div`, {
                            className: `text-xs text-[#c3d9d8]`,
                            children: `Please sign in or register to browse RFQs and submit bids.`,
                          }),
                  }),
                ],
              }),
            }),
            (0, x.jsx)(`div`, {
              className: `max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8`,
              children: vt
                ? (0, x.jsxs)(x.Fragment, {
                    children: [
                      n === `home` &&
                        (0, x.jsx)(Ge, {
                          role: `vendor`,
                          onDashboard: () => r(`rfqs`),
                        }),
                      (0, x.jsxs)(`div`, {
                        className: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1e7e4] pb-4 mb-6`,
                        children: [
                          (0, x.jsxs)(`div`, {
                            className: `flex items-center gap-2`,
                            children: [
                              (0, x.jsx)(`button`, {
                                className: `px-4 py-2 rounded font-bold text-xs`,
                                onClick: () => {
                                  (s(null), r(`home`));
                                },
                                children: `Portal Home`,
                              }),
                              (0, x.jsxs)(`button`, {
                                onClick: () => {
                                  (s(null), r(`rfqs`));
                                },
                                className: `px-4 py-2 rounded-[5px] text-xs font-bold transition-colors ${n === `rfqs` && !o ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                                children: [
                                  `Discover RFQ Tenders (`,
                                  bt.length,
                                  `)`,
                                ],
                              }),
                              (0, x.jsx)(`button`, {
                                onClick: () => {
                                  (s(null), r(`my_quotes`));
                                },
                                className: `px-4 py-2 rounded-[5px] text-xs font-bold transition-colors ${n === `my_quotes` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                                children: `My Quotations`,
                              }),
                            ],
                          }),
                          (0, x.jsx)(`p`, { className: `text-xs text-[#63797b]`, children: `All approved RFQs are available to every verified vendor.` }),
                        ],
                      }),
                      n === `rfqs` &&
                        !o &&
                        (0, x.jsxs)(`div`, {
                          className: `space-y-4`,
                          children: [
                            (0, x.jsx)(`div`, {
                              className: `flex justify-between items-center mb-1`,
                              children: (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsx)(`h2`, {
                                    className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                                    children: `Active RFQ Opportunities`,
                                  }),
                                  (0, x.jsxs)(`p`, {
                                    className: `text-xs text-[#63797b] mt-0.5`,
                                    children: [
                                      `Pre-Award Confidentiality Active: Client contact details are masked as `,
                                      (0, x.jsx)(`code`, {
                                        children: `Client #RFQ-XXXX`,
                                      }),
                                      `.`,
                                    ],
                                  }),
                                ],
                              }),
                            }),
                            (0, x.jsx)(`div`, {
                              className: `grid grid-cols-1 gap-4`,
                              children:
                                bt.length === 0
                                  ? (0, x.jsx)(`div`, {
                                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]`,
                                      children: `No approved open RFQs are currently available.`,
                                    })
                                  : bt.map((e) => {
                                      let t = e.award,
                                        n = t && t.vendorId === Me?.id;
                                      return (0, x.jsxs)(
                                        `div`,
                                        {
                                          className: `bg-white border rounded-[6px] p-6 shadow-[0_9px_25px_rgba(25,60,65,0.04)] hover:shadow-md transition-all ${n ? `border-2 border-[#123f47] bg-[#f7fbfb]` : `border-[#e1e7e4]`}`,
                                          children: [
                                            (0, x.jsxs)(`div`, {
                                              className: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1e7e4]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsxs)(`div`, {
                                                      className: `flex items-center gap-2 mb-1`,
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                                          children:
                                                            e.referenceCode,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-xs font-bold text-[#eb6a32]`,
                                                          children: e.category,
                                                        }),
                                                        (0, x.jsx)(`span`, {
                                                          className: `text-[#bccbca]`,
                                                          children: `·`,
                                                        }),
                                                        (0, x.jsxs)(`span`, {
                                                          className: `text-xs font-bold text-[#123540] flex items-center gap-1 font-mono`,
                                                          children: [
                                                            n
                                                              ? (0, x.jsx)(ve, {
                                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                                })
                                                              : (0, x.jsx)(ye, {
                                                                  className: `w-3.5 h-3.5 text-[#63797b]`,
                                                                }),
                                                            e.contractorDisplayName,
                                                          ],
                                                        }),
                                                      ],
                                                    }),
                                                    (0, x.jsx)(`h3`, {
                                                      className: `text-lg font-extrabold text-[#123540] font-['Manrope']`,
                                                      children: e.title,
                                                    }),
                                                    (0, x.jsxs)(`p`, {
                                                      className: `text-xs text-[#63797b] mt-0.5`,
                                                      children: [
                                                        `Project: `,
                                                        e.projectName,
                                                        ` · Location: `,
                                                        e.locationEmirate,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `flex items-center gap-3`,
                                                  children: [
                                                    n
                                                      ? (0, x.jsx)(`span`, {
                                                          className: `text-xs font-bold text-white bg-[#123f47] px-3 py-1 rounded-[4px] font-mono uppercase`,
                                                          children: `Awarded to You!`,
                                                        })
                                                      : (0, x.jsx)(`span`, {
                                                          className: `text-xs font-bold text-[#eb6a32] bg-[#eb6a32]/10 border border-[#eb6a32]/30 px-3 py-1 rounded-[4px] font-mono uppercase`,
                                                          children: `Accepting Quotations`,
                                                        }),
                                                    (0, x.jsxs)(`button`, {
                                                      onClick: () => {
                                                        if (!Pe) {
                                                          Te(!0);
                                                          return;
                                                        }
                                                        (s(e),
                                                          dt(`itemized`),
                                                          pt(``),
                                                          st([]),
                                                          at({}),
                                                          C(null));
                                                      },
                                                      className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-4 py-2 rounded-[5px] text-xs flex items-center gap-1.5 transition-colors shadow-sm active:translate-y-0.5`,
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          children: n
                                                            ? `View Award Details`
                                                            : `Review & Submit Quote`,
                                                        }),
                                                        (0, x.jsx)(oe, {
                                                          className: `w-4 h-4`,
                                                        }),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            (0, x.jsxs)(`div`, {
                                              className: `pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#63797b]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Submission Deadline`,
                                                    }),
                                                    (0, x.jsx)(`span`, {
                                                      className: `font-semibold text-[#123540]`,
                                                      children:
                                                        e.submissionDeadline,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `BoQ Item Count`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `font-semibold text-[#123540]`,
                                                      children: [
                                                        e.items.length,
                                                        ` Line Items`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Drawings & Specs`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `font-semibold text-[#123540]`,
                                                      children: [
                                                        e.documents.length,
                                                        ` Reviewed Documents`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#a8b8b8] block mb-0.5 text-[11px]`,
                                                      children: `Identity Protection`,
                                                    }),
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-[#123f47] font-semibold`,
                                                      children: `Pre-Award Masking Active`,
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        e.id,
                                      );
                                    }),
                            }),
                          ],
                        }),
                      o &&
                        (0, x.jsxs)(`div`, {
                          className: `space-y-6 max-w-4xl mx-auto`,
                          children: [
                            (0, x.jsx)(`button`, {
                              onClick: () => s(null),
                              className: `text-xs font-bold text-[#123540] hover:text-[#eb6a32] flex items-center gap-1`,
                              children: `← Back to RFQs`,
                            }),
                            (0, x.jsxs)(`div`, {
                              className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)]`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  className: `flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[#e1e7e4]`,
                                  children: [
                                    (0, x.jsxs)(`div`, {
                                      children: [
                                        (0, x.jsxs)(`div`, {
                                          className: `flex items-center gap-2 text-xs font-mono text-[#63797b] mb-1`,
                                          children: [
                                            (0, x.jsx)(`span`, {
                                              children: o.referenceCode,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: `·`,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              className: `text-[#eb6a32] font-bold`,
                                              children: o.category,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: `·`,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: o.locationEmirate,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsx)(`h2`, {
                                          className: `text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                                          children: o.title,
                                        }),
                                        (0, x.jsxs)(`p`, {
                                          className: `text-xs text-[#63797b] mt-1`,
                                          children: [
                                            `Client Pseudonym: `,
                                            (0, x.jsx)(`strong`, {
                                              className: `font-mono text-[#123540]`,
                                              children: o.contractorDisplayName,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, x.jsxs)(`div`, {
                                      className: `flex flex-wrap items-center gap-2`,
                                      children: [
                                        !!o.pendingDocumentCount &&
                                          (0, x.jsxs)(`p`, {
                                            className: `text-sm text-[#63797b] max-w-md`,
                                            children: [
                                              o.pendingDocumentCount,
                                              ` document(s) are being prepared for confidential sharing. Full BOQ/specifications will appear here after Admin review. Please wait for the complete documents before pricing.`,
                                            ],
                                          }),
                                        o.documents.map((e) =>
                                          (0, x.jsxs)(
                                            `button`,
                                            {
                                              onClick: () => l(e),
                                              className: `px-3 py-1.5 rounded-[4px] bg-[#f7f6f2] hover:bg-[#eef3f1] text-xs font-semibold text-[#123540] flex items-center gap-1.5 transition-colors border border-[#e1e7e4]`,
                                              children: [
                                                (0, x.jsx)(pe, {
                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                }),
                                                (0, x.jsx)(`span`, {
                                                  children: e.fileName,
                                                }),
                                              ],
                                            },
                                            e.id,
                                          ),
                                        ),
                                      ],
                                    }),
                                  ],
                                }),
                                o.contractorContact &&
                                  (0, x.jsxs)(`div`, {
                                    className: `my-4 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2`,
                                    children: [
                                      (0, x.jsxs)(`div`, {
                                        className: `font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']`,
                                        children: [
                                          (0, x.jsx)(ce, {
                                            className: `w-4 h-4 text-[#eb6a32]`,
                                          }),
                                          `Contract Award Confirmed · Client Contact Details Unmasked`,
                                        ],
                                      }),
                                      (0, x.jsxs)(`div`, {
                                        className: `grid grid-cols-2 gap-2 text-[#123540] pt-1`,
                                        children: [
                                          (0, x.jsxs)(`div`, {
                                            children: [
                                              (0, x.jsx)(`span`, {
                                                className: `text-[#63797b] block text-[10px]`,
                                                children: `Main Contractor`,
                                              }),
                                              (0, x.jsx)(`strong`, {
                                                className: `text-[#123540]`,
                                                children: o.contractorCompany,
                                              }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            children: [
                                              (0, x.jsx)(`span`, {
                                                className: `text-[#63797b] block text-[10px]`,
                                                children: `Project Site Address`,
                                              }),
                                              (0, x.jsx)(`span`, {
                                                children:
                                                  o.contractorContact.address,
                                              }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            children: [
                                              (0, x.jsx)(`span`, {
                                                className: `text-[#63797b] block text-[10px]`,
                                                children: `Procurement Manager`,
                                              }),
                                              (0, x.jsx)(`span`, {
                                                children:
                                                  o.contractorContact
                                                    .contactPerson,
                                              }),
                                            ],
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            children: [
                                              (0, x.jsx)(`span`, {
                                                className: `text-[#63797b] block text-[10px]`,
                                                children: `Direct Phone`,
                                              }),
                                              (0, x.jsx)(`span`, {
                                                className: `font-mono text-[#123f47] font-bold`,
                                                children:
                                                  o.contractorContact
                                                    .contactPhone,
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                    ],
                                  }),
                                (0, x.jsxs)(`div`, {
                                  className: `py-4 border-b border-[#e1e7e4]`,
                                  children: [
                                    (0, x.jsx)(`h4`, {
                                      className: `text-xs font-bold uppercase tracking-wider text-[#63797b] mb-2 font-['Manrope']`,
                                      children: `Scope Summary`,
                                    }),
                                    (0, x.jsx)(`p`, {
                                      className: `text-xs text-[#123540] leading-relaxed`,
                                      children: o.scopeDescription,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            o.excelOnly
                              ? (0, x.jsx)(
                                  Qe,
                                  {
                                    rfq: o,
                                    onSubmitted: async () => {
                                      (await _t(),
                                        s(null),
                                        t(`Excel quotation saved.`, `success`));
                                    },
                                  },
                                  o.excelWorkbook?.id ?? o.id,
                                )
                              : (0, x.jsxs)(`form`, {
                                  onSubmit: async (e) => {
                                    if (
                                      (e.preventDefault(),
                                      !(mt.current || ct) && (C(null), o && Me))
                                    ) {
                                      if (!Pe) {
                                        Te(!0);
                                        return;
                                      }
                                      ((mt.current = !0), gt(!0));
                                      try {
                                        let e = ot;
                                        (await L.vendor.submitQuote(o.id, {
                                          attachments: e,
                                          pricingMode: ut,
                                          totalAmountAed: Number(ft),
                                          leadTimeDays: Number(Ye),
                                          validityDays: Number(Ze),
                                          paymentTerms: et,
                                          notes: nt,
                                          items: o.items.map((e) => ({
                                            rfqItemId: e.id,
                                            unitRateAed: it[e.id] || 0,
                                          })),
                                        }),
                                          await _t(),
                                          s(null),
                                          r(`my_quotes`),
                                          t(`Quotation saved.`, `success`));
                                      } catch (e) {
                                        C(e.message);
                                      } finally {
                                        ((mt.current = !1), gt(!1));
                                      }
                                    }
                                  },
                                  className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 sm:p-8 shadow-[0_9px_25px_rgba(25,60,65,0.05)] space-y-6`,
                                  children: [
                                    (0, x.jsxs)(`label`, {
                                      className: `block text-xs font-semibold`,
                                      children: [
                                        `Quotation method`,
                                        (0, x.jsxs)(`select`, {
                                          "aria-label": `Quotation method`,
                                          value: ut,
                                          onChange: (e) => dt(e.target.value),
                                          className: `block border border-[#bccbca] p-2 mt-2 rounded`,
                                          children: [
                                            (0, x.jsx)(`option`, {
                                              value: `itemized`,
                                              children: `Item-by-item pricing`,
                                            }),
                                            (0, x.jsx)(`option`, {
                                              value: `total`,
                                              children: `Total package amount`,
                                            }),
                                            (0, x.jsx)(`option`, {
                                              value: `file`,
                                              children: `Upload quotation file with total`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    ut !== `itemized` &&
                                      (0, x.jsxs)(`label`, {
                                        className: `block text-xs font-semibold`,
                                        children: [
                                          `Total quotation amount (AED)`,
                                          (0, x.jsx)(`input`, {
                                            "aria-label": `Total quotation amount (AED)`,
                                            type: `number`,
                                            required: !0,
                                            min: `0.01`,
                                            step: `0.01`,
                                            value: ft,
                                            onChange: (e) => pt(e.target.value),
                                            className: `block border border-[#bccbca] p-2 mt-2 rounded`,
                                          }),
                                        ],
                                      }),
                                    ut === `itemized` &&
                                      (0, x.jsxs)(`div`, {
                                        children: [
                                          (0, x.jsx)(`h3`, {
                                            className: `text-base font-extrabold text-[#123540] font-['Manrope'] mb-1`,
                                            children: `Itemized Quotation Pricing (Bill of Quantities)`,
                                          }),
                                          (0, x.jsx)(`p`, {
                                            className: `text-xs text-[#63797b] mb-4`,
                                            children: `Enter your unit rate for each line item. Total bid amount calculates automatically.`,
                                          }),
                                          (0, x.jsx)(`div`, {
                                            className: `overflow-x-auto border border-[#e1e7e4] rounded-[5px]`,
                                            children: (0, x.jsxs)(`table`, {
                                              className: `w-full text-xs text-left`,
                                              children: [
                                                (0, x.jsx)(`thead`, {
                                                  className: `bg-[#f7f6f2] text-[#63797b] border-b border-[#e1e7e4] uppercase font-mono text-[10px]`,
                                                  children: (0, x.jsxs)(`tr`, {
                                                    children: [
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3`,
                                                        children: `Item #`,
                                                      }),
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3`,
                                                        children: `Description`,
                                                      }),
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3 text-right`,
                                                        children: `Qty`,
                                                      }),
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3`,
                                                        children: `Unit`,
                                                      }),
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3 text-right`,
                                                        children: `Unit Rate (AED)`,
                                                      }),
                                                      (0, x.jsx)(`th`, {
                                                        className: `py-3 px-3 text-right`,
                                                        children: `Total (AED)`,
                                                      }),
                                                    ],
                                                  }),
                                                }),
                                                (0, x.jsx)(`tbody`, {
                                                  className: `divide-y divide-[#e1e7e4]`,
                                                  children: o.items.map((e) => {
                                                    let t =
                                                      (it[e.id] || 0) *
                                                      e.quantity;
                                                    return (0, x.jsxs)(
                                                      `tr`,
                                                      {
                                                        className: `hover:bg-[#f7f6f2]/50`,
                                                        children: [
                                                          (0, x.jsx)(`td`, {
                                                            className: `py-3 px-3 font-mono font-bold text-[#63797b]`,
                                                            children:
                                                              e.itemNumber,
                                                          }),
                                                          (0, x.jsxs)(`td`, {
                                                            className: `py-3 px-3`,
                                                            children: [
                                                              (0, x.jsx)(
                                                                `div`,
                                                                {
                                                                  className: `font-semibold text-[#123540]`,
                                                                  children:
                                                                    e.description,
                                                                },
                                                              ),
                                                              (0, x.jsx)(
                                                                `div`,
                                                                {
                                                                  className: `text-[10px] text-[#63797b] italic`,
                                                                  children:
                                                                    e.specifications,
                                                                },
                                                              ),
                                                            ],
                                                          }),
                                                          (0, x.jsx)(`td`, {
                                                            className: `py-3 px-3 text-right font-mono font-bold`,
                                                            children:
                                                              e.quantity,
                                                          }),
                                                          (0, x.jsx)(`td`, {
                                                            className: `py-3 px-3 font-mono text-[#63797b]`,
                                                            children: e.unit,
                                                          }),
                                                          (0, x.jsx)(`td`, {
                                                            className: `py-3 px-3 text-right`,
                                                            children: (0,
                                                            x.jsx)(`input`, {
                                                              type: `number`,
                                                              required: !0,
                                                              min: `0`,
                                                              step: `any`,
                                                              placeholder: `0.00`,
                                                              value:
                                                                it[e.id] ===
                                                                void 0
                                                                  ? ``
                                                                  : it[e.id],
                                                              onChange: (t) => {
                                                                at({
                                                                  ...it,
                                                                  [e.id]:
                                                                    parseFloat(
                                                                      t.target
                                                                        .value,
                                                                    ) || 0,
                                                                });
                                                              },
                                                              className: `w-28 px-2 py-1.5 border border-[#bccbca] rounded text-right font-mono focus:border-[#eb6a32] bg-[#fdfdfd]`,
                                                            }),
                                                          }),
                                                          (0, x.jsxs)(`td`, {
                                                            className: `py-3 px-3 text-right font-mono font-bold text-[#123540]`,
                                                            children: [
                                                              `AED `,
                                                              t.toLocaleString(
                                                                void 0,
                                                                {
                                                                  minimumFractionDigits: 2,
                                                                },
                                                              ),
                                                            ],
                                                          }),
                                                        ],
                                                      },
                                                      e.id,
                                                    );
                                                  }),
                                                }),
                                                (0, x.jsx)(`tfoot`, {
                                                  className: `bg-[#f7f6f2] border-t border-[#e1e7e4]`,
                                                  children: (0, x.jsxs)(`tr`, {
                                                    children: [
                                                      (0, x.jsx)(`td`, {
                                                        colSpan: 5,
                                                        className: `py-3 px-3 text-right font-bold text-[#123540] uppercase font-mono text-xs`,
                                                        children: `Total Bid Amount:`,
                                                      }),
                                                      (0, x.jsxs)(`td`, {
                                                        className: `py-3 px-3 text-right font-mono font-extrabold text-base text-[#eb6a32]`,
                                                        children: [
                                                          `AED `,
                                                          ((e) =>
                                                            ut === `itemized`
                                                              ? e.items.reduce(
                                                                  (e, t) =>
                                                                    e +
                                                                    (it[t.id] ||
                                                                      0) *
                                                                      t.quantity,
                                                                  0,
                                                                )
                                                              : Number(ft) ||
                                                                0)(
                                                            o,
                                                          ).toLocaleString(
                                                            void 0,
                                                            {
                                                              minimumFractionDigits: 2,
                                                            },
                                                          ),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                }),
                                              ],
                                            }),
                                          }),
                                        ],
                                      }),
                                    (0, x.jsx)(Ve, {
                                      files: ot,
                                      onChange: st,
                                      onBusy: lt,
                                      disabled: ht || ct,
                                      label:
                                        ut === `file`
                                          ? `Quotation file (required)`
                                          : `Quotation and supporting files (optional)`,
                                    }),
                                    (0, x.jsx)(`p`, {
                                      className: `text-xs text-[#63797b]`,
                                      children: `Quotation attachments are reviewed for identity protection before they are released to the contractor.`,
                                    }),
                                    (0, x.jsxs)(`div`, {
                                      className: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`,
                                      children: [
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsxs)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: [
                                                `Execution Lead Time (Days) `,
                                                (0, x.jsx)(`span`, {
                                                  className: `text-[#eb6a32]`,
                                                  children: `*`,
                                                }),
                                              ],
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `number`,
                                              required: !0,
                                              value: Ye,
                                              onChange: (e) =>
                                                Xe(e.target.value),
                                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Quotation Validity (Days)`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `number`,
                                              value: Ze,
                                              onChange: (e) =>
                                                $e(e.target.value),
                                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          className: `sm:col-span-2`,
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Commercial Payment Terms`,
                                            }),
                                            (0, x.jsx)(`input`, {
                                              type: `text`,
                                              value: et,
                                              onChange: (e) =>
                                                tt(e.target.value),
                                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          className: `sm:col-span-2`,
                                          children: [
                                            (0, x.jsx)(`label`, {
                                              className: `block text-xs font-semibold text-[#123540] mb-1`,
                                              children: `Vendor Notes, Warranties & Scope Clarifications`,
                                            }),
                                            (0, x.jsx)(`textarea`, {
                                              rows: 2,
                                              placeholder: `Material warranty duration, mockup submission schedule...`,
                                              value: nt,
                                              onChange: (e) =>
                                                rt(e.target.value),
                                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] leading-relaxed`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    ee &&
                                      (0, x.jsxs)(`div`, {
                                        className: `p-3.5 rounded-[5px] bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2`,
                                        children: [
                                          (0, x.jsx)(se, {
                                            className: `w-4 h-4 shrink-0 text-rose-600`,
                                          }),
                                          (0, x.jsx)(`span`, { children: ee }),
                                        ],
                                      }),
                                    (0, x.jsxs)(`div`, {
                                      className: `pt-4 border-t border-[#e1e7e4] flex justify-end gap-3`,
                                      children: [
                                        (0, x.jsx)(`button`, {
                                          type: `button`,
                                          onClick: () => s(null),
                                          className: `px-5 py-2.5 rounded-[5px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]`,
                                          children: `Cancel`,
                                        }),
                                        (0, x.jsx)(`button`, {
                                          type: `submit`,
                                          disabled: ht || ct,
                                          className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-6 py-2.5 rounded-[5px] text-xs shadow-sm transition-all active:translate-y-0.5`,
                                          children: ht
                                            ? `Submitting...`
                                            : ut === `itemized`
                                              ? `Submit Itemized Quotation`
                                              : ut === `file`
                                                ? `Submit Quotation File`
                                                : `Submit Total Quotation`,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                          ],
                        }),
                      n === `my_quotes` &&
                        (0, x.jsxs)(`div`, {
                          className: `space-y-4`,
                          children: [
                            (0, x.jsx)(`h2`, {
                              className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                              children: `My Active Quotations & Award Status`,
                            }),
                            (0, x.jsx)(`div`, {
                              className: `grid grid-cols-1 gap-4`,
                              children:
                                Re.length === 0
                                  ? (0, x.jsxs)(`div`, {
                                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-10 text-center text-xs text-[#63797b]`,
                                      children: [
                                        `You have not submitted quotations yet. Open `,
                                        (0, x.jsx)(`strong`, {
                                          children: `Discover RFQ Tenders`,
                                        }),
                                        ` to submit competitive bids.`,
                                      ],
                                    })
                                  : Re.map((e) => {
                                      let t = e.rfq,
                                        n = e.status === `awarded`,
                                        r = n ? e.contractorContact : null;
                                      return (0, x.jsxs)(
                                        `div`,
                                        {
                                          className: `bg-white border rounded-[6px] p-6 shadow-sm transition-all ${n ? `border-2 border-[#123f47] bg-[#f7fbfb]` : `border-[#e1e7e4]`}`,
                                          children: [
 (0, x.jsx)(WorkbookPriceTable, { response: e.workbookResponse }),
                                            (0, x.jsxs)(`div`, {
                                              className: `flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#e1e7e4]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    (0, x.jsxs)(`div`, {
                                                      className: `flex items-center gap-2 mb-1`,
                                                      children: [
                                                        (0, x.jsx)(`span`, {
                                                          className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                                          children:
                                                            e.referenceCode,
                                                        }),
                                                        (0, x.jsxs)(`span`, {
                                                          className: `text-xs text-[#a8b8b8] font-mono`,
                                                          children: [
                                                            `Submitted `,
                                                            new Date(
                                                              e.submittedAt,
                                                            ).toLocaleDateString(),
                                                          ],
                                                        }),
                                                        n &&
                                                          (0, x.jsxs)(`span`, {
                                                            className: `flex items-center gap-1 text-[11px] font-bold text-white bg-[#123f47] px-2.5 py-0.5 rounded uppercase font-mono`,
                                                            children: [
                                                              (0, x.jsx)(ne, {
                                                                className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                              }),
                                                              `Awarded Tender Winner`,
                                                            ],
                                                          }),
                                                      ],
                                                    }),
                                                    (0, x.jsx)(`h3`, {
                                                      className: `text-base font-bold text-[#123540] font-['Manrope']`,
                                                      children:
                                                        t?.title ||
                                                        `Quotation for RFQ #${e.rfqId}`,
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `text-right`,
                                                  children: [
                                                    (0, x.jsx)(`span`, {
                                                      className: `text-xs text-[#63797b] uppercase block font-semibold`,
                                                      children: `Total Amount`,
                                                    }),
                                                    (0, x.jsxs)(`span`, {
                                                      className: `text-lg font-bold text-[#123540] font-mono`,
                                                      children: [
                                                        `AED `,
                                                        e.totalAmountAed.toLocaleString(),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                            !n &&
                                              t &&
                                              ![`awarded`, `closed`].includes(
                                                t.status,
                                              ) &&
                                              (0, x.jsxs)(`div`, {
                                                className: `flex gap-4 pt-3`,
                                                children: [
                                                  (0, x.jsx)(`span`, {
                                                    children:
                                                      e.status === `withdrawn`
                                                        ? `Recalled / withdrawn`
                                                        : e.status,
                                                  }),
                                                  e.status !== `withdrawn` &&
                                                    (0, x.jsx)(`button`, {
                                                      onClick: () =>
                                                        yt(e.id, `recall`),
                                                      className: `underline`,
                                                      children: `Recall quotation`,
                                                    }),
                                                  (0, x.jsx)(`button`, {
                                                    onClick: () =>
                                                      yt(e.id, `remove`),
                                                    className: `underline`,
                                                    children: `Remove quotation`,
                                                  }),
                                                ],
                                              }),
                                            n &&
                                              r &&
                                              (0, x.jsxs)(`div`, {
                                                className: `my-4 p-4 rounded-[6px] bg-[#eef6f5] border border-[#123f47]/30 text-xs space-y-2`,
                                                children: [
                                                  (0, x.jsxs)(`div`, {
                                                    className: `font-extrabold text-[#123f47] flex items-center gap-1.5 text-sm font-['Manrope']`,
                                                    children: [
                                                      (0, x.jsx)(ce, {
                                                        className: `w-4 h-4 text-[#eb6a32]`,
                                                      }),
                                                      `Award Confirmed — Main Contractor Details (Unmasked)`,
                                                    ],
                                                  }),
                                                  (0, x.jsxs)(`div`, {
                                                    className: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[#123540] pt-1`,
                                                    children: [
                                                      (0, x.jsxs)(`div`, {
                                                        children: [
                                                          (0, x.jsx)(`span`, {
                                                            className: `text-[#63797b] block text-[10px]`,
                                                            children: `Contractor Company`,
                                                          }),
                                                          (0, x.jsx)(`strong`, {
                                                            className: `text-[#123540] font-semibold`,
                                                            children:
                                                              r.companyName,
                                                          }),
                                                        ],
                                                      }),
                                                      (0, x.jsxs)(`div`, {
                                                        children: [
                                                          (0, x.jsx)(`span`, {
                                                            className: `text-[#63797b] block text-[10px]`,
                                                            children: `Trade License`,
                                                          }),
                                                          (0, x.jsxs)(`span`, {
                                                            className: `font-mono`,
                                                            children: [
                                                              r.tradeLicenseNumber,
                                                              ` (`,
                                                              r.emirate,
                                                              `)`,
                                                            ],
                                                          }),
                                                        ],
                                                      }),
                                                      (0, x.jsxs)(`div`, {
                                                        children: [
                                                          (0, x.jsx)(`span`, {
                                                            className: `text-[#63797b] block text-[10px]`,
                                                            children: `Procurement Lead`,
                                                          }),
                                                          (0, x.jsx)(`span`, {
                                                            children:
                                                              r.contactPerson,
                                                          }),
                                                        ],
                                                      }),
                                                      (0, x.jsxs)(`div`, {
                                                        children: [
                                                          (0, x.jsx)(`span`, {
                                                            className: `text-[#63797b] block text-[10px]`,
                                                            children: `Direct Phone & Address`,
                                                          }),
                                                          (0, x.jsx)(`span`, {
                                                            className: `font-mono text-[#123f47] font-bold block`,
                                                            children:
                                                              r.contactPhone,
                                                          }),
                                                          (0, x.jsx)(`span`, {
                                                            className: `text-[11px] text-[#63797b] truncate block`,
                                                            children: r.address,
                                                          }),
                                                        ],
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                            (0, x.jsxs)(`div`, {
                                              className: `pt-4 flex items-center justify-between text-xs text-[#63797b]`,
                                              children: [
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    `Lead Time: `,
                                                    (0, x.jsxs)(`strong`, {
                                                      className: `text-[#123540]`,
                                                      children: [
                                                        e.leadTimeDays,
                                                        ` days`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  children: [
                                                    `Validity: `,
                                                    (0, x.jsxs)(`strong`, {
                                                      className: `text-[#123540]`,
                                                      children: [
                                                        e.validityDays,
                                                        ` days`,
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                                (0, x.jsxs)(`div`, {
                                                  className: `flex items-center gap-1 font-mono uppercase font-bold text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded`,
                                                  children: [
                                                    (0, x.jsx)(le, {
                                                      className: `w-3.5 h-3.5`,
                                                    }),
                                                    (0, x.jsx)(`span`, {
                                                      children: e.status,
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        },
                                        e.id,
                                      );
                                    }),
                            }),
                          ],
                        }),
                    ],
                  })
                : (0, x.jsxs)(`div`, {
                    className: `max-w-xl mx-auto bg-white border border-[#e1e7e4] rounded-[6px] shadow-[0_9px_25px_rgba(25,60,65,0.05)] p-8`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        className: `flex border-b border-[#e1e7e4] mb-6`,
                        children: [
                          (0, x.jsxs)(`button`, {
                            onClick: () => d(`login`),
                            className: `flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${u === `login` ? `border-[#eb6a32] text-[#123540]` : `border-transparent text-[#63797b] hover:text-[#123540]`}`,
                            children: [
                              (0, x.jsx)(j, { className: `w-4 h-4` }),
                              `Vendor Login`,
                            ],
                          }),
                          (0, x.jsxs)(`button`, {
                            onClick: () => {
                              (De(!1), F(null), d(`register`));
                            },
                            className: `flex-1 py-3 text-sm font-bold font-['Manrope'] border-b-2 transition-colors flex items-center justify-center gap-2 ${u === `register` ? `border-[#eb6a32] text-[#123540]` : `border-transparent text-[#63797b] hover:text-[#123540]`}`,
                            children: [
                              (0, x.jsx)(Ee, { className: `w-4 h-4` }),
                              `Register as Vendor`,
                            ],
                          }),
                        ],
                      }),
                      g &&
                        (0, x.jsx)(`div`, {
                          className: `mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs`,
                          children: g,
                        }),
                      u === `login`
                        ? (0, x.jsxs)(`form`, {
                            onSubmit: async (e) => {
                              (e.preventDefault(), _(null));
                              try {
                                if (
                                  (await L.auth.login(f, m)).user.role !==
                                  `vendor`
                                )
                                  throw (
                                    await L.auth.logout(),
                                    Error(`Vendor account required.`)
                                  );
                                (await _t(), r(`rfqs`));
                              } catch (e) {
                                _(e.message);
                              }
                            },
                            className: `space-y-4 text-xs`,
                            children: [
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsx)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: `Vendor Email Address`,
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `email`,
                                    required: !0,
                                    value: f,
                                    onChange: (e) => p(e.target.value),
                                    className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsx)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: `Account Password`,
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `password`,
                                    required: !0,
                                    value: m,
                                    onChange: (e) => h(e.target.value),
                                    className: `w-full px-3 py-2.5 rounded-[5px] border border-[#bccbca] text-sm focus:outline-none focus:border-[#eb6a32]`,
                                  }),
                                ],
                              }),
                              (0, x.jsx)(`button`, {
                                type: `submit`,
                                className: `w-full bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5`,
                                children: `Sign In to Vendor Portal`,
                              }),
                            ],
                          })
                        : (0, x.jsxs)(`form`, {
                            onSubmit: async (e) => {
                              if ((e.preventDefault(), y(null), !T || D)) {
                                y(
                                  `Upload your trade license document before registering.`,
                                );
                                return;
                              }
                              if (!P || !Oe) {
                                y(
                                  `Explicit acceptance of current Vendor Terms is required.`,
                                );
                                return;
                              }
                              try {
                                (await L.auth.registerVendor({
                                  tradeLicenseDocument: T,
                                  listBusinessPublicly: k,
                                  companyName: w.trim(),
                                  tradeLicenseNumber: ie.trim(),
                                  tradeCategories: ae,
                                  emiratesServiced: de,
                                  emirate: de[0],
                                  address: `${de[0]}, UAE`,
                                  contactPerson: me.trim(),
                                  contactPhone: _e.trim(),
                                  email: xe.trim(),
                                  password: Ce,
                                  acceptTerms: P,
                                  termsVersionId: Oe.id,
                                }),
                                  await _t(),
                                  r(`rfqs`),
                                  t(
                                    `Vendor registration recorded. Verification is pending.`,
                                    `success`,
                                  ));
                              } catch (e) {
                                y(e.message);
                              }
                            },
                            className: `space-y-4 text-xs`,
                            children: [
                              (0, x.jsx)(Ke, { onChange: E, onBusy: O }),
                              (0, x.jsxs)(`label`, {
                                className: `block`,
                                children: [
                                  (0, x.jsx)(`input`, {
                                    type: `checkbox`,
                                    checked: k,
                                    onChange: (e) => re(e.target.checked),
                                  }),
                                  ` List my company name and trade/emirate on the homepage after Admin verification (optional). Contact details and license files stay private.`,
                                ],
                              }),
                              v &&
                                (0, x.jsxs)(`div`, {
                                  className: `p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2`,
                                  children: [
                                    (0, x.jsx)(se, {
                                      className: `w-4 h-4 shrink-0 text-rose-600`,
                                    }),
                                    (0, x.jsx)(`span`, { children: v }),
                                  ],
                                }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Company / Trade Name `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `text`,
                                    required: !0,
                                    placeholder: `e.g. Al Futtaim Glass & Aluminum`,
                                    value: w,
                                    onChange: (e) => te(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `grid grid-cols-2 gap-3`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Trade License Number `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `text`,
                                        required: !0,
                                        placeholder: `e.g. TL-882910`,
                                        value: ie,
                                        onChange: (e) => A(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsx)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: `Primary Trade Category`,
                                      }),
                                      (0, x.jsx)(`select`, {
                                        value: ae[0] || `Joinery & Carpentry`,
                                        onChange: (e) => ue([e.target.value]),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white`,
                                        children: [
                                          `Joinery & Carpentry`,
                                          `Gypsum & Drywall`,
                                          `MEP & HVAC`,
                                          `Glazing & Facades`,
                                          `Flooring, Marble & Tiling`,
                                          `Painting & Wall Finishes`,
                                          `Technical Services LLC`,
                                          `Maintenance Company`,
                                          `Painting Contracting`,
                                          `Waterproofing & Insulation`,
                                          `Swimming Pool Maintenance`,
                                          `Civil Works`,
                                          `Pumping Works`,
                                          `MEP Works`,
                                        ].map((e) =>
                                          (0, x.jsx)(
                                            `option`,
                                            { value: e, children: e },
                                            e,
                                          ),
                                        ),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `grid grid-cols-2 gap-3`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Contact Person `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `text`,
                                        required: !0,
                                        placeholder: `e.g. Suresh Kumar`,
                                        value: me,
                                        onChange: (e) => ge(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`label`, {
                                        className: `block font-semibold text-[#123540] mb-1`,
                                        children: [
                                          `Mobile Phone `,
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#eb6a32]`,
                                            children: `*`,
                                          }),
                                        ],
                                      }),
                                      (0, x.jsx)(`input`, {
                                        type: `tel`,
                                        required: !0,
                                        placeholder: `+971 55 123 4567`,
                                        value: _e,
                                        onChange: (e) => be(e.target.value),
                                        className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono`,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Business Email `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `email`,
                                    required: !0,
                                    placeholder: `sales@vendorcompany.ae`,
                                    value: xe,
                                    onChange: (e) => Se(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`label`, {
                                    className: `block font-semibold text-[#123540] mb-1`,
                                    children: [
                                      `Set Account Password `,
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#eb6a32]`,
                                        children: `*`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`input`, {
                                    type: `password`,
                                    required: !0,
                                    placeholder: `Create a password`,
                                    value: Ce,
                                    onChange: (e) => we(e.target.value),
                                    className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                                  }),
                                ],
                              }),
                              (0, x.jsx)(He, {
                                role: `vendor`,
                                checked: P,
                                onChange: De,
                                onDocument: F,
                              }),
                              (0, x.jsx)(`button`, {
                                type: `submit`,
                                disabled: !P || !Oe || D || !T,
                                className: `w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-3 px-4 rounded-[5px] text-sm transition-all shadow-sm active:translate-y-0.5`,
                                children: `ACCEPT TERMS & COMPLETE REGISTRATION`,
                              }),
                            ],
                          }),
                    ],
                  }),
            }),
            c &&
              (0, x.jsx)(Je, {
                document: c,
                onClose: () => l(null),
                viewerRole: `vendor`,
              }),
          ],
        });
  },
  et = ({ parentId: e, kind: t, onChanged: n }) => {
    let [r, i] = (0, b.useState)([]),
      [a, o] = (0, b.useState)(``),
      [s, c] = (0, b.useState)(``),
      [l, u] = (0, b.useState)(``),
      [d, f] = (0, b.useState)(!1),
      [p, m] = (0, b.useState)(!1),
      [h, g] = (0, b.useState)(``),
      [_, v] = (0, b.useState)(!1),
      y = async () => {
        let n = await fetch(`/api/admin/rfq-workbooks`),
          r = await n.json();
        if (!n.ok) throw Error(r.error || `Unable to load workbook revisions`);
        i(r.data.filter((n) => n.parent_kind === t && n.parent_id === e));
      };
    (0, b.useEffect)(() => {
      y().catch((e) => g(e.message));
    }, [e, t]);
    let S = async (e) => {
        if (!_) {
          (v(!0), g(``));
          try {
            (await e(), await y(), await n());
          } catch (e) {
            g(e instanceof Error ? e.message : `Request failed`);
          } finally {
            v(!1);
          }
        }
      },
      ee = async (e, t) => {
        let n = await fetch(e, {
            method: `POST`,
            headers: { "Content-Type": `application/json` },
            body: JSON.stringify(t),
          }),
          r = await n.json();
        if (!n.ok || !r.success) throw Error(r.error || `Request failed`);
        return r.data;
      },
      C = r.find((e) => e.status === `review_required`),
      w = r.find((e) => e.status === `published`);
    return (0, x.jsxs)(`div`, {
      className: `border border-[#bccbca] rounded p-4 space-y-3 text-xs w-full`,
      children: [
        (0, x.jsx)(`strong`, { children: `Reviewed Excel RFQ` }),
        (0, x.jsx)(WorkbookResponses, { parentId: e, kind: t }),
        w &&
          (0, x.jsxs)(`p`, { children: [`Published revision `, w.revision] }),
        (0, x.jsxs)(`div`, {
          className: `flex flex-wrap gap-3`,
          children: [
            (0, x.jsxs)(`label`, {
              children: [
                `Completion date, if missing`,
                (0, x.jsx)(`input`, {
                  "aria-label": `RFQ completion date`,
                  type: `date`,
                  className: `block border p-2`,
                  value: a,
                  onChange: (e) => o(e.target.value),
                }),
              ],
            }),
            (0, x.jsxs)(`label`, {
              children: [
                `Quotation deadline, if missing (Dubai time)`,
                (0, x.jsx)(`input`, {
                  "aria-label": `RFQ quotation deadline`,
                  type: `datetime-local`,
                  className: `block border p-2`,
                  value: s,
                  onChange: (e) => c(e.target.value),
                }),
              ],
            }),
            (0, x.jsxs)(`label`, {
              children: [
                `General area`,
                (0, x.jsx)(`input`, {
                  "aria-label": `RFQ general area`,
                  className: `block border p-2`,
                  value: l,
                  onChange: (e) => u(e.target.value),
                }),
              ],
            }),
          ],
        }),
        (0, x.jsxs)(`label`, {
          className: `block`,
          children: [
            (0, x.jsx)(`input`, {
              type: `checkbox`,
              checked: d,
              onChange: (e) => f(e.target.checked),
            }),
            ` Approve a preliminary enquiry where quantities need site measurement; no award is allowed.`,
          ],
        }),
        (0, x.jsx)(`button`, {
          type: `button`,
          disabled: _,
          className: `border rounded px-3 py-2`,
          onClick: () =>
            S(async () => {
              (await ee(
                `/api/admin/${t === `contractor` ? `rfqs` : `public-quotes`}/${encodeURIComponent(e)}/workbook`,
                {
                  requiredBy: a,
                  quoteDeadline: s ? s + `:00+04:00` : void 0,
                  area: l,
                  vendorRfq: { preliminary: d },
                },
              ),
                m(!1));
            }),
          children: `Prepare Excel revision`,
        }),
        C &&
          (0, x.jsxs)(x.Fragment, {
            children: [
              (0, x.jsxs)(`p`, {
                children: [
                  `Revision `,
                  C.revision,
                  ` awaits review. Verify all source documents, quantities, specifications and identity masking.`,
                ],
              }),
              (0, x.jsx)(`button`, {
                type: `button`,
                disabled: _,
                className: `border rounded px-3 py-2`,
                onClick: () => S(() => Ze(C.id, C.revision)),
                children: `Download review workbook`,
              }),
              (0, x.jsxs)(`label`, {
                className: `block`,
                children: [
                  (0, x.jsx)(`input`, {
                    type: `checkbox`,
                    checked: p,
                    onChange: (e) => m(e.target.checked),
                  }),
                  ` I opened the workbook, compared it with the original sources and checked that protected identities are removed.`,
                ],
              }),
              (0, x.jsx)(`button`, {
                type: `button`,
                disabled: _ || !p,
                className: `bg-[#123f47] text-white rounded px-3 py-2`,
                onClick: () =>
                  S(async () => {
                    (await ee(
                      `/api/rfq-workbooks/${encodeURIComponent(C.id)}/publish`,
                      { identityReviewConfirmed: !0, preliminaryApproved: d },
                    ),
                      m(!1));
                  }),
                children: `Publish reviewed Excel to vendors`,
              }),
            ],
          }),
        h &&
          (0, x.jsx)(`p`, {
            role: `alert`,
            className: `text-red-700`,
            children: h,
          }),
      ],
    });
  };
function tt() {
  let [e, t] = (0, b.useState)([]),
    [n, r] = (0, b.useState)(``),
    [i, a] = (0, b.useState)(``),
    [o, s] = (0, b.useState)(``),
    [c, l] = (0, b.useState)(!1),
    [u, d] = (0, b.useState)(null),
    [f, p] = (0, b.useState)(0),
    [m, h] = (0, b.useState)(null),
    [g, _] = (0, b.useState)(!1),
    v = async () => {
      try {
        let e = await L.auth.me();
        if (!e.authenticated || e.user.role !== `admin`) {
          (l(!1), t([]));
          return;
        }
        let n = await L.terms.adminEvidence(f, g);
        (t(n.data), h(n.nextOffset), l(!0), r(``));
      } catch (e) {
        (t([]), r(e.message));
      }
    };
  return (
    (0, b.useEffect)(() => {
      v();
    }, [f, g]),
    (0, x.jsxs)(`section`, {
      className: `bg-white rounded-[6px] border border-[#e1e7e4] p-6 space-y-5 text-xs text-[#123540]`,
      children: [
        (0, x.jsx)(`h2`, {
          className: `text-lg font-bold`,
          children: `Versioned Terms Acceptance Evidence`,
        }),
        n &&
          (0, x.jsx)(`p`, {
            role: `alert`,
            className: `text-red-700`,
            children: n,
          }),
        c
          ? (0, x.jsxs)(x.Fragment, {
              children: [
                (0, x.jsx)(`button`, {
                  onClick: v,
                  className: `underline`,
                  children: `Refresh Evidence`,
                }),
                (0, x.jsxs)(`div`, {
                  className: `overflow-x-auto`,
                  children: [
                    (0, x.jsxs)(`table`, {
                      className: `w-full text-left`,
                      children: [
                        (0, x.jsx)(`thead`, {
                          children: (0, x.jsx)(`tr`, {
                            children: [
                              `Company`,
                              `User`,
                              `Role / Type`,
                              `Version`,
                              `Accepted At`,
                              `Status`,
                              `Content`,
                            ].map((e) =>
                              (0, x.jsx)(
                                `th`,
                                { className: `p-3`, children: e },
                                e,
                              ),
                            ),
                          }),
                        }),
                        (0, x.jsx)(`tbody`, {
                          children: e.map((e) =>
                            (0, x.jsxs)(
                              `tr`,
                              {
                                className: `border-t border-[#e1e7e4]`,
                                children: [
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: e.company,
                                  }),
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: e.email,
                                  }),
                                  (0, x.jsxs)(`td`, {
                                    className: `p-3`,
                                    children: [e.role, ` / `, e.terms_type],
                                  }),
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: e.terms_version,
                                  }),
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: e.accepted_at,
                                  }),
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: e.acceptance_status,
                                  }),
                                  (0, x.jsx)(`td`, {
                                    className: `p-3`,
                                    children: (0, x.jsx)(`button`, {
                                      className: `underline`,
                                      onClick: () => d(e),
                                      children: `Inspect Accepted Version`,
                                    }),
                                  }),
                                ],
                              },
                              e.acceptance_id,
                            ),
                          ),
                        }),
                      ],
                    }),
                    e.length === 0 &&
                      (0, x.jsx)(`p`, {
                        children: `No acceptance evidence has been recorded.`,
                      }),
                  ],
                }),
              ],
            })
          : (0, x.jsxs)(`form`, {
              className: `space-y-4 max-w-md`,
              onSubmit: async (e) => {
                e.preventDefault();
                try {
                  if ((await L.auth.login(i, o)).user.role !== `admin`)
                    throw (
                      await L.auth.logout(),
                      Error(`Active Admin account required.`)
                    );
                  await v();
                } catch (e) {
                  r(e.message);
                }
              },
              children: [
                (0, x.jsx)(`p`, {
                  children: `An authenticated active Admin account is required to inspect acceptance evidence.`,
                }),
                (0, x.jsxs)(`label`, {
                  className: `block`,
                  children: [
                    `Admin email`,
                    (0, x.jsx)(`input`, {
                      type: `email`,
                      required: !0,
                      value: i,
                      onChange: (e) => a(e.target.value),
                      className: `block border rounded p-2 w-full`,
                    }),
                  ],
                }),
                (0, x.jsxs)(`label`, {
                  className: `block`,
                  children: [
                    `Password`,
                    (0, x.jsx)(`input`, {
                      type: `password`,
                      required: !0,
                      value: o,
                      onChange: (e) => s(e.target.value),
                      className: `block border rounded p-2 w-full`,
                    }),
                  ],
                }),
                (0, x.jsx)(`button`, {
                  className: `bg-[#123f47] text-white rounded px-4 py-2`,
                  children: `Sign In`,
                }),
              ],
            }),
        u &&
          (0, x.jsxs)(`section`, {
            className: `border rounded p-4 space-y-3`,
            children: [
              (0, x.jsx)(`button`, {
                onClick: () => d(null),
                className: `underline`,
                children: `Close Version`,
              }),
              (0, x.jsxs)(`h3`, {
                className: `font-bold`,
                children: [u.title, ` — `, u.terms_version],
              }),
              (0, x.jsxs)(`p`, {
                className: `break-all`,
                children: [`SHA-256: `, u.content_sha256],
              }),
              (0, x.jsxs)(`p`, {
                children: [
                  `Acceptance: `,
                  u.acceptance_id,
                  ` · Audit: `,
                  u.audit_reference,
                ],
              }),
              (0, x.jsx)(`pre`, {
                className: `whitespace-pre-wrap font-['DM_Sans'] leading-relaxed`,
                children: u.content_text,
              }),
            ],
          }),
        c &&
          (0, x.jsxs)(`div`, {
            className: `flex flex-wrap gap-4`,
            children: [
              (0, x.jsx)(`button`, {
                className: `underline`,
                onClick: () => {
                  (p(0), d(null), _(!g));
                },
                children: g
                  ? `View Organization Terms`
                  : `View Get a Quote Consent`,
              }),
              (0, x.jsx)(`button`, {
                disabled: f === 0,
                onClick: () => p(Math.max(0, f - 200)),
                children: `Previous`,
              }),
              (0, x.jsx)(`button`, {
                disabled: m === null,
                onClick: () => {
                  m !== null && p(m);
                },
                children: `Next`,
              }),
            ],
          }),
      ],
    })
  );
}
var nt = ({ onNavigate: e }) => {
  let { showToast: t } = Ae(),
    [n, r] = (0, b.useState)(`documents`),
    [i, a] = (0, b.useState)(null),
    [o, s] = (0, b.useState)(`180000`),
    [c, l] = (0, b.useState)(!1),
    [u, d] = (0, b.useState)(``),
    [f, p] = (0, b.useState)(``),
    [m, h] = (0, b.useState)(`vendor`),
    [g, _] = (0, b.useState)([]),
    [v, y] = (0, b.useState)([]),
    [S, ee] = (0, b.useState)([]),
    [C, w] = (0, b.useState)([]),
    [te, T] = (0, b.useState)([]),
    [E, D] = (0, b.useState)([]),
    [O, k] = (0, b.useState)([]),
    [ne, re] = (0, b.useState)([]),
    [A, ae] = (0, b.useState)(!1),
    [oe, se] = (0, b.useState)(``),
    [ue, de] = (0, b.useState)(``),
    [he, ge] = (0, b.useState)(``),
    [_e, ve] = (0, b.useState)([]),
    [ye, j] = (0, b.useState)([]),
    [M, be] = (0, b.useState)([]),
    [Se, we] = (0, b.useState)(!1),
    [N, Ee] = (0, b.useState)([]),
    P = async () => {
      try {
        let e = await L.auth.me();
        if (!e.authenticated || e.user.role !== `admin`) {
          ae(!1);
          return;
        }
        let t = await Promise.all([
          Se ? L.admin.getRfqHistory() : L.admin.getRfqs(),
          L.admin.getPublicQuotes(),
          L.admin.getContractors(),
          L.admin.getVendors(),
          L.admin.getUsers(),
          Se ? L.admin.getDocumentHistory() : L.admin.getDocuments(),
          L.admin.getAuditLogs(),
          L.admin.getInvitations(),
          L.admin.getServiceCharges(),
          L.admin.getAwards(),
          L.admin.getQuotations(Se),
          L.admin.getNotifications(),
        ]);
        (Ee(t[11]),
          _(t[0]),
          y(t[1]),
          ee(t[2]),
          w(t[3]),
          T(t[4]),
          D(t[5]),
          k(t[6]),
          re(t[7]),
          ve(t[8]),
          j(t[9]),
          be(t[10]),
          ae(!0),
          se(``));
      } catch (e) {
        se(e.message);
      }
    };
  (0, b.useEffect)(() => {
    P();
  }, [n, Se]);
  let Oe = (0, b.useRef)(null);
  Ie(async () => {
    let e = await L.admin.getRevision();
    Oe.current !== e && (await P(), (Oe.current = e));
  }, A);
  let F = async (e, n) => {
      try {
        (await e(), await P(), t(n, `success`));
      } catch (e) {
        t(e.message, `error`);
      }
    },
    ke = (e) => {
      window.confirm(
        `Confirm that all RFQ text and BoQ have been reviewed and contain no protected identity or contact information.`,
      ) && F(() => L.admin.publishRfq(e), `RFQ approved and published.`);
    },
    je = (e) => {
      (e.preventDefault(),
        t(
          `Zoho Mail delivery is not configured. No invitation was sent.`,
          `error`,
        ));
    },
    Me = (e, t) =>
      F(
        () =>
          L.admin.updateUserStatus(e, t === `active` ? `suspended` : `active`),
        `Account status updated.`,
      ),
    Ne = (e, t) =>
      F(() => L.admin.updatePublicQuoteStatus(e, t), `Request status updated.`);
  return A
    ? (0, x.jsxs)(`div`, {
        className: `min-h-screen bg-[#f7f6f2] text-[#123540] pb-16 font-['DM_Sans']`,
        children: [
          N.length > 0 &&
            (0, x.jsxs)(`aside`, {
              className: `p-4 border-b bg-[#fff5eb]`,
              "aria-label": `Withdrawal notifications`,
              children: [
                (0, x.jsx)(`strong`, { children: `Recent withdrawal notices` }),
                N.slice(0, 5).map((e) =>
                  (0, x.jsxs)(
                    `p`,
                    {
                      children: [
                        e.message,
                        ` `,
                        (0, x.jsx)(`small`, {
                          children: new Date(e.createdAt).toLocaleString(),
                        }),
                      ],
                    },
                    e.id,
                  ),
                ),
              ],
            }),
          (0, x.jsx)(`div`, {
            className: `bg-[#123f47] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#0e3037]`,
            children: (0, x.jsxs)(`div`, {
              className: `max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4`,
              children: [
                (0, x.jsxs)(`div`, {
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `inline-flex items-center gap-2 text-xs font-bold text-[#f6a47f] uppercase tracking-wider mb-1 font-['Manrope']`,
                      children: [
                        (0, x.jsx)(`span`, {
                          children: `Operational Administration`,
                        }),
                        (0, x.jsx)(`span`, {
                          "aria-hidden": `true`,
                          children: `·`,
                        }),
                        (0, x.jsx)(`span`, {
                          children: `Document Review & Procurement Operations`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`h1`, {
                      className: `text-2xl sm:text-3xl font-extrabold font-['Manrope'] tracking-tight flex items-center gap-3`,
                      children: [
                        (0, x.jsx)(Ce, { className: `w-7 h-7 text-[#eb6a32]` }),
                        `Urban Procures Operations Console`,
                      ],
                    }),
                    (0, x.jsx)(`p`, {
                      className: `text-xs sm:text-sm text-[#c3d9d8] mt-1`,
                      children: `Operational tools: Inspect uploaded drawings & BoQs, approve RFQs, review vendor terms, and audit service charges.`,
                    }),
                  ],
                }),
                (0, x.jsx)(`div`, {
                  className: `flex items-center gap-2`,
                  children: (0, x.jsxs)(`span`, {
                    className: `text-xs text-[#e3edeb] bg-[#082631] border border-[#194048] px-3 py-1.5 rounded-[5px] font-mono font-medium flex items-center gap-1.5`,
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `w-2 h-2 rounded-full bg-[#eb6a32] animate-pulse`,
                      }),
                      `Admin Session Active`,
                    ],
                  }),
                }),
              ],
            }),
          }),
          (0, x.jsxs)(`div`, {
            className: `max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-8`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `flex items-center gap-2 overflow-x-auto border-b border-[#e1e7e4] pb-4 mb-6 text-xs`,
                children: [
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`documents`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `documents` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(me, { className: `w-4 h-4 text-[#eb6a32]` }),
                      `Document Inspector (`,
                      E.length,
                      `)`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`rfqs`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `rfqs` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(pe, { className: `w-4 h-4` }),
                      `RFQ Publishing Queue (`,
                      g.filter((e) => e.status === `submitted`).length,
                      ` Pending)`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`public_quotes`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `public_quotes` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(pe, { className: `w-4 h-4` }),
                      `Get a Quote Requests (`,
                      v.length,
                      `)`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`users`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `users` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(De, { className: `w-4 h-4` }),
                      `User & Account Controls (`,
                      te.length,
                      `)`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`vendors`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `vendors` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(Te, { className: `w-4 h-4` }),
                      `Vendor Terms & Verification (`,
                      C.length,
                      `)`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`charges`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `charges` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(ie, { className: `w-4 h-4` }),
                      `Service Charge Engine`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`invitations`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `invitations` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(xe, { className: `w-4 h-4` }),
                      `Candidate Invitations`,
                    ],
                  }),
                  (0, x.jsxs)(`button`, {
                    onClick: () => r(`audit`),
                    className: `px-3.5 py-2 rounded-[5px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${n === `audit` ? `bg-[#123540] text-white` : `text-[#63797b] hover:bg-white`}`,
                    children: [
                      (0, x.jsx)(le, { className: `w-4 h-4` }),
                      `Audit Trail (`,
                      O.length,
                      `)`,
                    ],
                  }),
                ],
              }),
              (0, x.jsxs)(`div`, {
                className: `flex gap-4 mb-4 text-xs`,
                children: [
                  (0, x.jsx)(`button`, {
                    className: `underline`,
                    onClick: P,
                    children: `Refresh Records`,
                  }),
                  ` `,
                  (0, x.jsxs)(`label`, {
                    className: `ml-4`,
                    children: [
                      (0, x.jsx)(`input`, {
                        type: `checkbox`,
                        checked: Se,
                        onChange: (e) => we(e.target.checked),
                      }),
                      ` Show history (includes recalled/removed records)`,
                    ],
                  }),
                  ` `,
                  (0, x.jsx)(`small`, {
                    className: `ml-4`,
                    children: `Updates automatically every 5 seconds.`,
                  }),
                  (0, x.jsx)(`button`, {
                    className: `underline`,
                    onClick: async () => {
                      (await L.auth.logout(), ae(!1), ge(``));
                    },
                    children: `Sign Out`,
                  }),
                  oe && (0, x.jsx)(`p`, { role: `alert`, children: oe }),
                ],
              }),
              (0, x.jsx)(`button`, {
                onClick: () => r(`terms`),
                className: `mb-5 px-4 py-2 bg-[#123f47] text-white text-xs font-bold rounded-[5px]`,
                children: `Terms Acceptance Evidence`,
              }),
              n === `terms` && (0, x.jsx)(tt, {}),
              n === `documents` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `bg-[#eef6f5] border border-[#123f47]/30 p-4 rounded-[6px] text-xs text-[#123f47] flex items-start gap-3`,
                      children: [
                        (0, x.jsx)(Ce, {
                          className: `w-5 h-5 text-[#eb6a32] shrink-0 mt-0.5`,
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`strong`, {
                              className: `block font-bold font-['Manrope']`,
                              children: `Document Review Capability (Resolved Legacy Defect)`,
                            }),
                            `Administrators can directly OPEN, inspect metadata, review drawings, BoQs, and download files stored in Cloudflare R2.`,
                          ],
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-[0_9px_25px_rgba(25,60,65,0.04)]`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          className: `p-4 bg-[#f7f6f2] border-b border-[#e1e7e4] flex justify-between items-center text-xs font-bold text-[#123540]`,
                          children: [
                            (0, x.jsxs)(`span`, {
                              children: [
                                `Registered Documents & Attachments (`,
                                E.length,
                                ` Files)`,
                              ],
                            }),
                            (0, x.jsx)(`span`, {
                              className: `font-mono text-[#63797b]`,
                              children: `Storage: private Cloudflare R2`,
                            }),
                          ],
                        }),
                        (0, x.jsx)(`div`, {
                          className: `overflow-x-auto`,
                          children: (0, x.jsxs)(`table`, {
                            className: `w-full text-xs text-left`,
                            children: [
                              (0, x.jsx)(`thead`, {
                                className: `bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]`,
                                children: (0, x.jsxs)(`tr`, {
                                  children: [
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4`,
                                      children: `File Name`,
                                    }),
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4`,
                                      children: `R2 Object Key`,
                                    }),
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4`,
                                      children: `Associated Entity`,
                                    }),
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4`,
                                      children: `Document Purpose`,
                                    }),
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4 text-right`,
                                      children: `Size`,
                                    }),
                                    (0, x.jsx)(`th`, {
                                      className: `py-3 px-4 text-right`,
                                      children: `Action`,
                                    }),
                                  ],
                                }),
                              }),
                              (0, x.jsx)(`tbody`, {
                                className: `divide-y divide-[#e1e7e4]`,
                                children: E.map((e) =>
                                  (0, x.jsxs)(
                                    `tr`,
                                    {
                                      className: `hover:bg-[#f7f6f2]/60`,
                                      children: [
                                        (0, x.jsxs)(`td`, {
                                          className: `py-3 px-4 font-semibold text-[#123540] flex items-center gap-2`,
                                          children: [
                                            (0, x.jsx)(pe, {
                                              className: `w-4 h-4 text-[#eb6a32]`,
                                            }),
                                            (0, x.jsx)(`span`, {
                                              children: e.fileName,
                                            }),
                                          ],
                                        }),
                                        (0, x.jsx)(`td`, {
                                          className: `py-3 px-4 font-mono text-[11px] text-[#63797b]`,
                                          children: e.r2ObjectKey,
                                        }),
                                        (0, x.jsx)(`td`, {
                                          className: `py-3 px-4`,
                                          children: e.rfqId
                                            ? (0, x.jsxs)(`span`, {
                                                className: `font-mono text-[#123f47] bg-[#f7f6f2] border border-[#e1e7e4] px-2 py-0.5 rounded font-bold`,
                                                children: [`RFQ #`, e.rfqId],
                                              })
                                            : (0, x.jsx)(`span`, {
                                                className: `font-mono text-[#eb6a32] bg-[#eb6a32]/10 px-2 py-0.5 rounded font-bold`,
                                                children: e.publicQuoteId
                                                  ? `Public Quote`
                                                  : `Account document`,
                                              }),
                                        }),
                                        (0, x.jsx)(`td`, {
                                          className: `py-3 px-4`,
                                          children: (0, x.jsx)(`span`, {
                                            className: `uppercase font-mono text-[10px] bg-[#f7f6f2] border border-[#e1e7e4] px-2 py-0.5 rounded font-bold text-[#123540]`,
                                            children: e.documentPurpose,
                                          }),
                                        }),
                                        (0, x.jsx)(`td`, {
                                          className: `py-3 px-4 text-right font-mono text-[#63797b]`,
                                          children:
                                            e.fileSizeBytes < 1024
                                              ? `${e.fileSizeBytes} B`
                                              : `${(e.fileSizeBytes / 1024).toFixed(1)} KB`,
                                        }),
                                        (0, x.jsxs)(`td`, {
                                          className: `py-3 px-4 text-right`,
                                          children: [
                                            (0, x.jsxs)(`button`, {
                                              onClick: () => a(e),
                                              className: `bg-[#123540] hover:bg-[#082631] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs inline-flex items-center gap-1.5 transition-colors shadow-sm`,
                                              children: [
                                                (0, x.jsx)(fe, {
                                                  className: `w-3.5 h-3.5 text-[#eb6a32]`,
                                                }),
                                                (0, x.jsx)(`span`, {
                                                  children: `Open & Review`,
                                                }),
                                              ],
                                            }),
                                            !Se &&
                                              e.rfqId &&
                                              e.documentPurpose !==
                                                `trade_license` &&
                                              (0, x.jsxs)(x.Fragment, {
                                                children: [
                                                  (0, x.jsx)(`button`, {
                                                    className: `block underline text-xs mt-2`,
                                                    onClick: () => {
                                                      window.confirm(
                                                        `Confirm this document contains no protected identity or contact information.`,
                                                      ) &&
                                                        F(
                                                          () =>
                                                            L.admin.releaseDocument(
                                                              e.id,
                                                            ),
                                                          `Document released to eligible Vendors.`,
                                                        );
                                                    },
                                                    children: `Approve identity-safe release`,
                                                  }),
                                                  (0, x.jsxs)(`div`, {
                                                    className: `mt-2 text-xs text-[#123540]`,
                                                    children: [
                                                      (0, x.jsxs)(`p`, {
                                                        children: [
                                                          `Urban Procures copy: `,
                                                          {
                                                            pending: `Preparing`,
                                                            processing: `Extracting details`,
                                                            review_required: `Ready for review`,
                                                            approved: `Approved`,
                                                            needs_manual_review: `Needs manual review`,
                                                          }[
                                                            e
                                                              .standardizationStatus
                                                          ] ?? `Preparing`,
                                                        ],
                                                      }),
                                                      e.standardizationError &&
                                                        (0, x.jsx)(`p`, {
                                                          children: `This source could not be converted reliably. Retry or provide a clearer source; it remains private.`,
                                                        }),
                                                      (0, x.jsx)(`button`, {
                                                        className: `block underline my-2`,
                                                        onClick: () =>
                                                          F(
                                                            () =>
                                                              L.documents.standardize(
                                                                e.id,
                                                              ),
                                                            `Document extraction attempted; inspect the Urban Procures copy before release.`,
                                                          ),
                                                        children: `Generate / Retry Urban Procures copy`,
                                                      }),
                                                      e.standardizedR2Key &&
                                                        (0, x.jsx)(`button`, {
                                                          className: `block bg-[#eb6a32] text-white rounded px-3 py-2`,
                                                          onClick: () =>
                                                            a({
                                                              ...e,
                                                              standardized: !0,
                                                              fileName:
                                                                `Urban-Procures-` +
                                                                e.id.slice(
                                                                  0,
                                                                  8,
                                                                ) +
                                                                (e.standardizedFileType ===
                                                                `application/pdf`
                                                                  ? `.pdf`
                                                                  : e.standardizedFileType ===
                                                                      `image/png`
                                                                    ? `.png`
                                                                    : e.standardizedFileType ===
                                                                        `image/jpeg`
                                                                      ? `.jpg`
                                                                      : `.html`),
                                                              fileType:
                                                                e.standardizedFileType,
                                                            }),
                                                          children: `Review Urban Procures copy`,
                                                        }),
                                                      (0, x.jsxs)(`label`, {
                                                        className: `block underline my-2`,
                                                        children: [
                                                          `Upload identity-safe drawing / replacement`,
                                                          (0, x.jsx)(`input`, {
                                                            type: `file`,
                                                            accept: `.pdf,.png,.jpg,.jpeg`,
                                                            className: `block`,
                                                            onChange: async (
                                                              t,
                                                            ) => {
                                                              let n =
                                                                t.target
                                                                  .files?.[0];
                                                              if (
                                                                !n ||
                                                                !window.confirm(
                                                                  `Confirm this is a separate Urban Procures copy: all company names, logos, contact details, addresses, signatures and metadata have been removed. Preserve all technical geometry and dimensions. You must preview it again before release.`,
                                                                )
                                                              )
                                                                return;
                                                              let r =
                                                                new FileReader();
                                                              ((r.onload = () =>
                                                                F(
                                                                  () =>
                                                                    L.documents.correct(
                                                                      e.id,
                                                                      {
                                                                        identityReviewConfirmed:
                                                                          !0,
                                                                        file: {
                                                                          fileName:
                                                                            n.name,
                                                                          fileType:
                                                                            n.type,
                                                                          documentPurpose: `other`,
                                                                          dataUrl:
                                                                            r.result,
                                                                        },
                                                                      },
                                                                    ),
                                                                  `Replacement saved privately. Open the replacement and review it before release.`,
                                                                )),
                                                                r.readAsDataURL(
                                                                  n,
                                                                ),
                                                                (t.target.value = ``));
                                                            },
                                                          }),
                                                        ],
                                                      }),
                                                      (0, x.jsx)(`p`, {
                                                        children: `Originals remain private before award. Release only the generated copy after checking all details and identities.`,
                                                      }),
                                                    ],
                                                  }),
                                                ],
                                              }),
                                          ],
                                        }),
                                      ],
                                    },
                                    e.id,
                                  ),
                                ),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              n === `rfqs` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                      children: `RFQ Tender Review & Publishing Operations`,
                    }),
                    (0, x.jsx)(`div`, {
                      className: `grid grid-cols-1 gap-4`,
                      children: g.map((e) =>
                        (0, x.jsxs)(
                          `div`,
                          {
                            className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4`,
                            children: [
                              (0, x.jsxs)(`div`, {
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    className: `flex items-center gap-2 mb-1`,
                                    children: [
                                      (0, x.jsx)(`span`, {
                                        className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                        children: e.referenceCode,
                                      }),
                                      (0, x.jsx)(`span`, {
                                        className: `text-xs font-bold text-[#eb6a32]`,
                                        children: e.category,
                                      }),
                                      (0, x.jsx)(`span`, {
                                        className: `text-[#bccbca]`,
                                        children: `·`,
                                      }),
                                      (0, x.jsx)(`span`, {
                                        className: `text-xs text-[#63797b]`,
                                        children: e.locationEmirate,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsx)(`h3`, {
                                    className: `text-base font-extrabold text-[#123540] font-['Manrope']`,
                                    children: e.title,
                                  }),
                                  (0, x.jsxs)(`p`, {
                                    className: `text-xs text-[#63797b] mt-0.5`,
                                    children: [
                                      `BoQ: `,
                                      e.items.length,
                                      ` items · Drawings: `,
                                      e.documents.length,
                                      ` files · Status: `,
                                      (0, x.jsx)(`span`, {
                                        className: `font-mono uppercase font-bold text-[#eb6a32]`,
                                        children: e.status,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `flex items-center gap-2`,
                                children: [
                                  !e.excelOnly &&
                                    e.status === `submitted` &&
                                    (0, x.jsxs)(`button`, {
                                      onClick: () => ke(e.id),
                                      className: `bg-[#123f47] hover:bg-[#0e3037] text-white font-bold px-4 py-2 rounded-[4px] text-xs flex items-center gap-1.5 shadow-sm transition-colors`,
                                      children: [
                                        (0, x.jsx)(ce, {
                                          className: `w-4 h-4 text-[#eb6a32]`,
                                        }),
                                        (0, x.jsx)(`span`, {
                                          children: `Approve & Publish to Vendors`,
                                        }),
                                      ],
                                    }),
                                  e.excelOnly &&
                                    ![
                                      `awarded`,
                                      `closed`,
                                      `cancelled`,
                                    ].includes(e.status) &&
                                    (0, x.jsx)(et, {
                                      parentId: e.id,
                                      kind: `contractor`,
                                      onChanged: P,
                                    }),
                                  e.documents[0] &&
                                    (0, x.jsx)(`button`, {
                                      onClick: () => a(e.documents[0]),
                                      className: `px-3 py-2 rounded-[4px] border border-[#bccbca] text-xs font-semibold text-[#123540] hover:bg-[#f7f6f2]`,
                                      children: `Inspect Specifications`,
                                    }),
                                ],
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                  ],
                }),
              n === `public_quotes` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                      children: `Public Property Quotation Requests`,
                    }),
                    (0, x.jsx)(`div`, {
                      className: `grid grid-cols-1 gap-4`,
                      children: v.map((e) =>
                        (0, x.jsxs)(
                          `div`,
                          {
                            className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm space-y-4`,
                            children: [
                              (0, x.jsxs)(`div`, {
                                className: `flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e1e7e4]`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsxs)(`div`, {
                                        className: `flex items-center gap-2 mb-1`,
                                        children: [
                                          (0, x.jsx)(`span`, {
                                            className: `font-mono text-xs font-bold text-[#63797b] bg-[#f7f6f2] px-2 py-0.5 rounded border border-[#e1e7e4]`,
                                            children: e.referenceCode,
                                          }),
                                          (0, x.jsx)(`span`, {
                                            className: `font-bold text-[#123540] capitalize text-sm`,
                                            children: e.propertyType,
                                          }),
                                          (0, x.jsx)(`span`, {
                                            className: `text-[#bccbca]`,
                                            children: `·`,
                                          }),
                                          (0, x.jsxs)(`span`, {
                                            className: `text-xs text-[#63797b]`,
                                            children: [
                                              e.locationCommunity,
                                              `, `,
                                              e.locationEmirate,
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, x.jsxs)(`div`, {
                                        className: `text-xs text-[#63797b]`,
                                        children: [
                                          `Customer: `,
                                          (0, x.jsx)(`strong`, {
                                            className: `text-[#123540]`,
                                            children: e.customerName,
                                          }),
                                          ` (`,
                                          e.customerPhone,
                                          ` · `,
                                          e.customerEmail,
                                          `)`,
                                        ],
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    className: `flex items-center gap-2`,
                                    children: [
                                      e.siteVisitRequested
                                        ? (0, x.jsx)(`span`, {
                                            className: `bg-[#eb6a32]/10 text-[#eb6a32] border border-[#eb6a32]/30 font-bold px-3 py-1 rounded text-xs font-mono`,
                                            children: `★ AED 100 Site Visit Requested`,
                                          })
                                        : (0, x.jsx)(`span`, {
                                            className: `bg-[#f7f6f2] text-[#63797b] border border-[#e1e7e4] font-medium px-3 py-1 rounded text-xs`,
                                            children: `Direct Submission (AED 0)`,
                                          }),
                                      (0, x.jsx)(`span`, {
                                        className: `text-xs font-mono font-bold uppercase text-[#123f47] bg-[#eef6f5] px-2 py-1 rounded`,
                                        children: e.status.replace(`_`, ` `),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              e.excelOnly &&
                                ![`completed`, `cancelled`].includes(
                                  e.status,
                                ) &&
                                (0, x.jsx)(et, {
                                  parentId: e.id,
                                  kind: `public`,
                                  onChanged: P,
                                }),
                              (0, x.jsxs)(`p`, {
                                className: `text-xs text-[#123540] leading-relaxed bg-[#f7f6f2] p-3 rounded border border-[#e1e7e4]`,
                                children: [
                                  (0, x.jsx)(`strong`, {
                                    className: `text-[#123540] block mb-0.5 font-['Manrope']`,
                                    children: `Work Description:`,
                                  }),
                                  e.description,
                                ],
                              }),
                              (0, x.jsxs)(`div`, {
                                className: `flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs`,
                                children: [
                                  (0, x.jsxs)(`span`, {
                                    className: `text-[#a8b8b8]`,
                                    children: [
                                      `Received: `,
                                      new Date(e.createdAt).toLocaleString(),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    className: `flex items-center gap-2`,
                                    children: [
                                      e.attachments &&
                                        e.attachments.length > 0 &&
                                        (0, x.jsxs)(`button`, {
                                          onClick: () => a(e.attachments[0]),
                                          className: `text-[#eb6a32] font-bold hover:underline flex items-center gap-1 mr-2`,
                                          children: [
                                            (0, x.jsx)(pe, {
                                              className: `w-3.5 h-3.5`,
                                            }),
                                            `Inspect Attached Drawing`,
                                          ],
                                        }),
                                      e.status === `received` &&
                                        (0, x.jsx)(`button`, {
                                          onClick: () =>
                                            Ne(e.id, `under_review`),
                                          className: `bg-[#123540] hover:bg-[#082631] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs`,
                                          children: `Mark Under Review`,
                                        }),
                                      e.siteVisitRequested &&
                                        e.status !== `site_visit_scheduled` &&
                                        (0, x.jsx)(`button`, {
                                          onClick: () => {
                                            let t = window.prompt(
                                                `Site visit date and time (ISO format)`,
                                              ),
                                              n =
                                                window.prompt(`Inspector name`);
                                            t &&
                                              n &&
                                              F(
                                                () =>
                                                  L.admin.scheduleSiteVisit(
                                                    e.id,
                                                    t,
                                                    n,
                                                  ),
                                                `Site visit scheduled.`,
                                              );
                                          },
                                          className: `bg-[#eb6a32] hover:bg-[#bd4b1c] text-white font-bold px-3 py-1.5 rounded-[4px] text-xs`,
                                          children: `Schedule AED 100 Site Visit`,
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                  ],
                }),
              n === `users` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                      children: `User Accounts & Status Controls`,
                    }),
                    (0, x.jsx)(`div`, {
                      className: `space-y-3`,
                      children: S.map((e) =>
                        (0, x.jsxs)(
                          `div`,
                          {
                            className: `bg-white border rounded p-3 text-xs`,
                            children: [
                              (0, x.jsx)(`strong`, { children: e.companyName }),
                              ` · License `,
                              e.tradeLicenseNumber,
                              ` · `,
                              e.verifiedAt ? `Verified` : `Pending review`,
                              E.filter(
                                (t) =>
                                  t.uploaderUserId === e.userId &&
                                  t.documentPurpose === `trade_license`,
                              ).map((e) =>
                                (0, x.jsxs)(
                                  `button`,
                                  {
                                    className: `underline ml-3`,
                                    onClick: () => a(e),
                                    children: [`Review license: `, e.fileName],
                                  },
                                  e.id,
                                ),
                              ),
                              !E.some(
                                (t) =>
                                  t.uploaderUserId === e.userId &&
                                  t.documentPurpose === `trade_license`,
                              ) &&
                                (0, x.jsx)(`span`, {
                                  className: `ml-3 text-red-700`,
                                  children: `Trade license document not uploaded`,
                                }),
                              (0, x.jsx)(`button`, {
                                disabled:
                                  !E.some(
                                    (t) =>
                                      t.uploaderUserId === e.userId &&
                                      t.documentPurpose === `trade_license`,
                                  ) || !!e.verifiedAt,
                                className: `underline ml-3 disabled:opacity-50`,
                                onClick: () => {
                                  window.confirm(
                                    `Confirm you opened and reviewed this company’s trade license and verified the details.`,
                                  ) &&
                                    F(
                                      () => L.admin.verifyContractor(e.id),
                                      `Contractor verified after document review.`,
                                    );
                                },
                                children: `Verify after document review`,
                              }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    }),
                    (0, x.jsx)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm`,
                      children: (0, x.jsxs)(`table`, {
                        className: `w-full text-xs text-left`,
                        children: [
                          (0, x.jsx)(`thead`, {
                            className: `bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]`,
                            children: (0, x.jsxs)(`tr`, {
                              children: [
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Email`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Role`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Account Status`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Created Date`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4 text-right`,
                                  children: `Administrative Action`,
                                }),
                              ],
                            }),
                          }),
                          (0, x.jsx)(`tbody`, {
                            className: `divide-y divide-[#e1e7e4]`,
                            children: te.map((e) =>
                              (0, x.jsxs)(
                                `tr`,
                                {
                                  className: `hover:bg-[#f7f6f2]/50`,
                                  children: [
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 font-bold text-[#123540]`,
                                      children: e.email,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 uppercase font-mono text-[10px] text-[#eb6a32] font-bold`,
                                      children: e.role,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4`,
                                      children: (0, x.jsx)(`span`, {
                                        className: `font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${e.status === `active` ? `bg-[#123f47] text-white` : `bg-rose-100 text-rose-800`}`,
                                        children: e.status,
                                      }),
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 text-[#63797b]`,
                                      children: new Date(
                                        e.createdAt,
                                      ).toLocaleDateString(),
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 text-right`,
                                      children: (0, x.jsx)(`button`, {
                                        onClick: () => Me(e.id, e.status),
                                        className: `px-3 py-1 rounded-[4px] text-xs font-bold transition-colors ${e.status === `active` ? `bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100` : `bg-[#123f47] text-white hover:bg-[#0e3037]`}`,
                                        children:
                                          e.status === `active`
                                            ? `Suspend Account`
                                            : `Reactivate Account`,
                                      }),
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              n === `vendors` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                      children: `Vendor Onboarding & Click-Wrap Terms Evidence`,
                    }),
                    (0, x.jsx)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm`,
                      children: (0, x.jsxs)(`table`, {
                        className: `w-full text-xs text-left`,
                        children: [
                          (0, x.jsx)(`thead`, {
                            className: `bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]`,
                            children: (0, x.jsxs)(`tr`, {
                              children: [
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Company Name`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Trade License`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Trade Categories`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Verification`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Click-Wrap Terms Audit`,
                                }),
                              ],
                            }),
                          }),
                          (0, x.jsx)(`tbody`, {
                            className: `divide-y divide-[#e1e7e4]`,
                            children: C.map((e) =>
                              (0, x.jsxs)(
                                `tr`,
                                {
                                  children: [
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 font-bold text-[#123540]`,
                                      children: e.companyName,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 font-mono`,
                                      children: e.tradeLicenseNumber,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 text-[#63797b]`,
                                      children: e.tradeCategories.join(`, `),
                                    }),
                                    (0, x.jsxs)(`td`, {
                                      className: `py-3 px-4`,
                                      children: [
                                        (0, x.jsx)(`span`, {
                                          className: `text-white bg-[#123f47] px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px]`,
                                          children: e.verificationStatus,
                                        }),
                                        (0, x.jsxs)(`div`, {
                                          className: `mt-3 text-[#123540] normal-case text-xs`,
                                          children: [
                                            `                          `,
                                            E.filter(
                                              (t) =>
                                                t.uploaderUserId === e.userId &&
                                                t.documentPurpose ===
                                                  `trade_license`,
                                            ).map((e) =>
                                              (0, x.jsxs)(
                                                `button`,
                                                {
                                                  className: `block underline mt-2`,
                                                  onClick: () => a(e),
                                                  children: [
                                                    `Review license: `,
                                                    e.fileName,
                                                  ],
                                                },
                                                e.id,
                                              ),
                                            ),
                                            !E.some(
                                              (t) =>
                                                t.uploaderUserId === e.userId &&
                                                t.documentPurpose ===
                                                  `trade_license`,
                                            ) &&
                                              (0, x.jsx)(`span`, {
                                                className: `block mt-2 text-red-700`,
                                                children: `Trade license document not uploaded`,
                                              }),
                                            (0, x.jsx)(`button`, {
                                              disabled:
                                                !E.some(
                                                  (t) =>
                                                    t.uploaderUserId ===
                                                      e.userId &&
                                                    t.documentPurpose ===
                                                      `trade_license`,
                                                ) ||
                                                e.verificationStatus ===
                                                  `verified`,
                                              className: `block underline mt-2 disabled:opacity-50`,
                                              onClick: () => {
                                                window.confirm(
                                                  `Confirm you opened and reviewed this company’s trade license and verified the details.`,
                                                ) &&
                                                  F(
                                                    () =>
                                                      L.admin.verifyVendor(
                                                        e.id,
                                                        `verified`,
                                                      ),
                                                    `Vendor verified after trade-license review.`,
                                                  );
                                              },
                                              children: `Verify after document review`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4`,
                                      children: (0, x.jsx)(`button`, {
                                        className: `underline`,
                                        onClick: () => r(`terms`),
                                        children: `Inspect authenticated Terms evidence`,
                                      }),
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              n === `charges` &&
                (0, x.jsxs)(`div`, {
                  className: `max-w-3xl space-y-6`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      children: [
                        (0, x.jsx)(`h2`, {
                          className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                          children: `Service Charge Records & Calculator`,
                        }),
                        (0, x.jsxs)(`p`, {
                          className: `text-xs text-[#63797b] mt-1`,
                          children: [
                            `The standard `,
                            (0, x.jsx)(`strong`, {
                              children: `Vendor Service Charge`,
                            }),
                            ` is a Vendor obligation. Contractor / Client Service Charge: AED 0.`,
                          ],
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm space-y-4`,
                      children: [
                        (0, x.jsx)(`h3`, {
                          className: `text-sm font-bold text-[#123540] uppercase font-['Manrope']`,
                          children: `Active Benchmark Configuration`,
                        }),
                        (0, x.jsxs)(`div`, {
                          className: `grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded bg-[#f7f6f2] border border-[#e1e7e4] text-xs`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`span`, {
                                  className: `text-[#63797b] block`,
                                  children: `Default Percentage`,
                                }),
                                (0, x.jsx)(`strong`, {
                                  className: `text-[#123540] font-mono text-sm`,
                                  children: `2.5%`,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`span`, {
                                  className: `text-[#63797b] block`,
                                  children: `Minimum Threshold`,
                                }),
                                (0, x.jsx)(`strong`, {
                                  className: `text-[#123540] font-mono text-sm`,
                                  children: `AED 500.00`,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`span`, {
                                  className: `text-[#63797b] block`,
                                  children: `Site Visit Fee`,
                                }),
                                (0, x.jsx)(`strong`, {
                                  className: `text-[#eb6a32] font-mono text-sm`,
                                  children: `AED 100.00`,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              children: [
                                (0, x.jsx)(`span`, {
                                  className: `text-[#63797b] block`,
                                  children: `Manpower Rule`,
                                }),
                                (0, x.jsx)(`strong`, {
                                  className: `text-[#123540] font-mono text-sm`,
                                  children: `AED 1 per person per hour`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          className: `space-y-2`,
                          children: [
                            ye.map((e) =>
                              (0, x.jsxs)(
                                `p`,
                                {
                                  className: `text-xs border rounded p-2`,
                                  children: [
                                    `Award `,
                                    e.id,
                                    ` · `,
                                    e.awardType,
                                    ` · Vendor Terms `,
                                    e.vendorTermsVersion,
                                    ` · Acceptance `,
                                    e.vendorTermsAcceptanceId,
                                    ` · Contractor AED `,
                                    e.contractorServiceChargeAed,
                                    ` · Manpower `,
                                    e.manpowerQuantity ?? 0,
                                    ` person-hours × AED `,
                                    e.manpowerRateAed ?? 0,
                                    ` = AED `,
                                    e.manpowerChargeAed,
                                  ],
                                },
                                e.id,
                              ),
                            ),
                            M.map((e) =>
                              (0, x.jsxs)(
                                `p`,
                                {
                                  className: `text-xs border rounded p-2`,
                                  children: [
                                    `Quotation `,
                                    e.referenceCode,
                                    ` · RFQ `,
                                    e.rfqId,
                                    ` · AED `,
                                    e.totalAmountAed,
                                    ` · `,
                                    e.status,
                                  ],
                                },
                                e.id,
                              ),
                            ),
                            _e.map((e) =>
                              (0, x.jsxs)(
                                `p`,
                                {
                                  className: `text-xs border rounded p-2`,
                                  children: [
                                    `Award `,
                                    e.awardId,
                                    ` · Vendor charge AED `,
                                    e.totalChargeAed,
                                    ` · `,
                                    e.status,
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          className: `pt-4 border-t border-[#e1e7e4]`,
                          children: [
                            (0, x.jsx)(`h4`, {
                              className: `text-xs font-bold uppercase text-[#123540] mb-3 font-['Manrope']`,
                              children: `Live Calculator & Audit Simulator`,
                            }),
                            (0, x.jsxs)(`div`, {
                              className: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  children: [
                                    (0, x.jsx)(`label`, {
                                      className: `block text-[#63797b] font-semibold mb-1`,
                                      children: `Contract Amount (AED)`,
                                    }),
                                    (0, x.jsx)(`input`, {
                                      type: `number`,
                                      value: o,
                                      onChange: (e) => s(e.target.value),
                                      className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] font-mono text-sm bg-white`,
                                    }),
                                  ],
                                }),
                                (0, x.jsxs)(`div`, {
                                  children: [
                                    (0, x.jsx)(`label`, {
                                      className: `block text-[#63797b] font-semibold mb-1`,
                                      children: `Site Visit Option`,
                                    }),
                                    (0, x.jsxs)(`select`, {
                                      value: c ? `yes` : `no`,
                                      onChange: (e) =>
                                        l(e.target.value === `yes`),
                                      className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] text-sm bg-white`,
                                      children: [
                                        (0, x.jsx)(`option`, {
                                          value: `no`,
                                          children: `Public quote without site visit (AED 0)`,
                                        }),
                                        (0, x.jsx)(`option`, {
                                          value: `yes`,
                                          children: `Separate public site visit fee: AED 100`,
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            (() => {
                              let e = Ye.calculate({
                                contractAmountAed: parseFloat(o) || 0,
                              });
                              return (0, x.jsxs)(`div`, {
                                className: `mt-4 p-5 rounded-[6px] bg-[#123f47] text-white space-y-2 text-xs`,
                                children: [
                                  (0, x.jsxs)(`div`, {
                                    className: `flex justify-between items-center text-[#c3d9d8]`,
                                    children: [
                                      (0, x.jsx)(`span`, {
                                        children: `Calculated Service Charge Breakdown`,
                                      }),
                                      (0, x.jsx)(`span`, {
                                        className: `font-mono text-[#f6a47f] font-bold`,
                                        children: `ENGINE V2.0`,
                                      }),
                                    ],
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    className: `text-xl font-extrabold font-mono text-[#f6a47f]`,
                                    children: [
                                      `Vendor Service Charge: AED `,
                                      e.totalServiceChargeAed.toLocaleString(
                                        void 0,
                                        { minimumFractionDigits: 2 },
                                      ),
                                    ],
                                  }),
                                  (0, x.jsx)(`p`, {
                                    className: `text-[#e3edeb] text-[11px] leading-relaxed`,
                                    children: e.explanation,
                                  }),
                                  (0, x.jsxs)(`p`, {
                                    children: [
                                      `Contractor / Client Service Charge: AED 0. Separate public site visit fee: AED `,
                                      c ? 100 : 0,
                                      `.`,
                                    ],
                                  }),
                                ],
                              });
                            })(),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              n === `invitations` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-6`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      children: [
                        (0, x.jsx)(`h2`, {
                          className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                          children: `Candidate Invitation & Onboarding Queue`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `text-xs text-[#63797b] mt-1`,
                          children: `Zoho Mail delivery must be configured before invitations can be sent.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`form`, {
                      onSubmit: je,
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] p-6 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block font-semibold text-[#123540] mb-1`,
                              children: `Company / Organization`,
                            }),
                            (0, x.jsx)(`input`, {
                              type: `text`,
                              required: !0,
                              placeholder: `e.g. Al Habtoor Glazing LLC`,
                              value: f,
                              onChange: (e) => p(e.target.value),
                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block font-semibold text-[#123540] mb-1`,
                              children: `Candidate Email`,
                            }),
                            (0, x.jsx)(`input`, {
                              type: `email`,
                              required: !0,
                              placeholder: `tenders@org.ae`,
                              value: u,
                              onChange: (e) => d(e.target.value),
                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px]`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`label`, {
                              className: `block font-semibold text-[#123540] mb-1`,
                              children: `Portal Type`,
                            }),
                            (0, x.jsxs)(`select`, {
                              value: m,
                              onChange: (e) => h(e.target.value),
                              className: `w-full px-3 py-2 border border-[#bccbca] rounded-[5px] bg-white`,
                              children: [
                                (0, x.jsx)(`option`, {
                                  value: `vendor`,
                                  children: `Vendor / Supplier`,
                                }),
                                (0, x.jsx)(`option`, {
                                  value: `contractor`,
                                  children: `Main Contractor`,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, x.jsx)(`div`, {
                          className: `flex items-end`,
                          children: (0, x.jsxs)(`button`, {
                            type: `submit`,
                            className: `w-full bg-[#123540] hover:bg-[#082631] text-white font-bold py-2.5 px-4 rounded-[5px] flex items-center justify-center gap-1.5 transition-colors shadow-sm`,
                            children: [
                              (0, x.jsx)(xe, {
                                className: `w-3.5 h-3.5 text-[#eb6a32]`,
                              }),
                              (0, x.jsx)(`span`, {
                                children: `Dispatch Invitation`,
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                    (0, x.jsx)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm`,
                      children: (0, x.jsxs)(`table`, {
                        className: `w-full text-xs text-left`,
                        children: [
                          (0, x.jsx)(`thead`, {
                            className: `bg-[#f7f6f2] text-[#63797b] uppercase font-mono text-[10px] border-b border-[#e1e7e4]`,
                            children: (0, x.jsxs)(`tr`, {
                              children: [
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Organization`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Email`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Type`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Invitation Token`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Queue Status`,
                                }),
                              ],
                            }),
                          }),
                          (0, x.jsx)(`tbody`, {
                            className: `divide-y divide-[#e1e7e4]`,
                            children: ne.map((e) =>
                              (0, x.jsxs)(
                                `tr`,
                                {
                                  children: [
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 font-bold text-[#123540]`,
                                      children: e.organizationName,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 text-[#63797b]`,
                                      children: e.recipientEmail,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 uppercase font-mono text-[10px]`,
                                      children: e.inviteType,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4 font-mono text-[#63797b]`,
                                      children: e.invitationToken,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-3 px-4`,
                                      children: (0, x.jsx)(`span`, {
                                        className: `text-white bg-[#123f47] px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px]`,
                                        children: e.status,
                                      }),
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              n === `audit` &&
                (0, x.jsxs)(`div`, {
                  className: `space-y-4`,
                  children: [
                    (0, x.jsx)(`h2`, {
                      className: `text-xl sm:text-2xl font-extrabold text-[#123540] font-['Manrope']`,
                      children: `Immutable Marketplace Audit Log`,
                    }),
                    (0, x.jsx)(`div`, {
                      className: `bg-white border border-[#e1e7e4] rounded-[6px] overflow-hidden shadow-sm`,
                      children: (0, x.jsxs)(`table`, {
                        className: `w-full text-xs text-left font-mono`,
                        children: [
                          (0, x.jsx)(`thead`, {
                            className: `bg-[#f7f6f2] text-[#63797b] uppercase text-[10px] border-b border-[#e1e7e4]`,
                            children: (0, x.jsxs)(`tr`, {
                              children: [
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Timestamp (UTC)`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Actor`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Action Type`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Resource`,
                                }),
                                (0, x.jsx)(`th`, {
                                  className: `py-3 px-4`,
                                  children: `Evidence Payload`,
                                }),
                              ],
                            }),
                          }),
                          (0, x.jsx)(`tbody`, {
                            className: `divide-y divide-[#e1e7e4]`,
                            children: O.map((e) =>
                              (0, x.jsxs)(
                                `tr`,
                                {
                                  className: `hover:bg-[#f7f6f2]/50`,
                                  children: [
                                    (0, x.jsx)(`td`, {
                                      className: `py-2.5 px-4 text-[#63797b] text-[11px] whitespace-nowrap`,
                                      children: e.timestamp,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-2.5 px-4 font-bold text-[#123540]`,
                                      children: e.actorRole,
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-2.5 px-4 font-bold text-[#eb6a32]`,
                                      children: e.actionType,
                                    }),
                                    (0, x.jsxs)(`td`, {
                                      className: `py-2.5 px-4 text-[#63797b]`,
                                      children: [
                                        e.resourceType,
                                        ` #`,
                                        e.resourceId,
                                      ],
                                    }),
                                    (0, x.jsx)(`td`, {
                                      className: `py-2.5 px-4 text-[#63797b] text-[10px] truncate max-w-xs`,
                                      children: e.payloadJson || `-`,
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
            ],
          }),
          i &&
            (0, x.jsx)(Je, {
              document: i,
              onClose: () => a(null),
              viewerRole: `admin`,
              approvalActions:
                i.documentPurpose === `trade_license`
                  ? (0, x.jsxs)(`div`, {
                      className: `flex flex-wrap gap-3 items-center`,
                      children: [
                        (0, x.jsxs)(`strong`, {
                          children: [
                            `Trade license belongs to: `,
                            C.find((e) => e.userId === i.uploaderUserId)
                              ?.companyName ??
                              S.find((e) => e.userId === i.uploaderUserId)
                                ?.companyName ??
                              `Account owner`,
                          ],
                        }),
                        C.filter((e) => e.userId === i.uploaderUserId).map(
                          (e) =>
                            (0, x.jsx)(
                              `button`,
                              {
                                disabled: e.verificationStatus === `verified`,
                                className: `bg-[#eb6a32] text-white px-4 py-2 rounded disabled:opacity-50`,
                                onClick: () => {
                                  window.confirm(
                                    `Confirm you reviewed this license and approve this Vendor.`,
                                  ) &&
                                    F(
                                      () =>
                                        L.admin.verifyVendor(e.id, `verified`),
                                      `Vendor approved. Vendor dashboard will update automatically.`,
                                    );
                                },
                                children:
                                  e.verificationStatus === `verified`
                                    ? `Vendor approved`
                                    : `Approve Vendor`,
                              },
                              e.id,
                            ),
                        ),
                        S.filter((e) => e.userId === i.uploaderUserId).map(
                          (e) =>
                            (0, x.jsx)(
                              `button`,
                              {
                                disabled: !!e.verifiedAt,
                                className: `bg-[#eb6a32] text-white px-4 py-2 rounded disabled:opacity-50`,
                                onClick: () => {
                                  window.confirm(
                                    `Confirm you reviewed this license and approve this Contractor.`,
                                  ) &&
                                    F(
                                      () => L.admin.verifyContractor(e.id),
                                      `Contractor approved.`,
                                    );
                                },
                                children: e.verifiedAt
                                  ? `Contractor approved`
                                  : `Approve Contractor`,
                              },
                              e.id,
                            ),
                        ),
                        (0, x.jsx)(`p`, {
                          className: `text-xs`,
                          children: `Approval applies to this uploading account. Separate Contractor and Vendor accounts each require their own license upload.`,
                        }),
                      ],
                    })
                  : void 0,
            }),
        ],
      })
    : (0, x.jsx)(`div`, {
        className: `min-h-screen bg-[#f7f6f2] p-8 text-[#123540]`,
        children: (0, x.jsxs)(`form`, {
          className: `bg-white border rounded p-6 max-w-md mx-auto space-y-4`,
          onSubmit: async (e) => {
            e.preventDefault();
            try {
              if ((await L.auth.login(ue, he)).user.role !== `admin`)
                throw (
                  await L.auth.logout(),
                  Error(`Active Admin account required.`)
                );
              await P();
            } catch (e) {
              se(e.message);
            }
          },
          children: [
            (0, x.jsx)(`h1`, {
              className: `font-bold text-xl`,
              children: `Urban Procures Operations Console`,
            }),
            oe && (0, x.jsx)(`p`, { role: `alert`, children: oe }),
            (0, x.jsxs)(`label`, {
              className: `block`,
              children: [
                `Admin email`,
                (0, x.jsx)(`input`, {
                  className: `border p-2 w-full`,
                  type: `email`,
                  required: !0,
                  value: ue,
                  onChange: (e) => de(e.target.value),
                }),
              ],
            }),
            (0, x.jsxs)(`label`, {
              className: `block`,
              children: [
                `Password`,
                (0, x.jsx)(`input`, {
                  className: `border p-2 w-full`,
                  type: `password`,
                  required: !0,
                  value: he,
                  onChange: (e) => ge(e.target.value),
                }),
              ],
            }),
            (0, x.jsx)(`button`, {
              className: `bg-[#123f47] text-white p-2 rounded`,
              children: `Sign In`,
            }),
          ],
        }),
      });
};
function rt() {
  let [e, t] = (0, b.useState)(() => window.location.pathname || `/`),
    [n, r] = (0, b.useState)(`public`);
  (0, b.useEffect)(() => {
    let e = () => {
      t(window.location.pathname || `/`);
    };
    return (
      window.addEventListener(`popstate`, e),
      () => window.removeEventListener(`popstate`, e)
    );
  }, []);
  let i = (n) => {
    n !== e &&
      (window.history.pushState({}, ``, n),
      t(n),
      window.scrollTo({ top: 0, behavior: `smooth` }),
      n.startsWith(`/contractor`)
        ? r(`contractor`)
        : n.startsWith(`/vendor`)
          ? r(`vendor`)
          : n.startsWith(`/admin`)
            ? r(`admin`)
            : n === `/get-a-quote` && r(`public`));
  };
  return (0, x.jsx)(ke, {
    children: (0, x.jsxs)(`div`, {
      className: `flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-slate-950`,
      children: [
        (0, x.jsx)(je, {
          currentPath: e,
          onNavigate: i,
          activeRole: n,
          onRoleChange: (e) => {
            r(e);
          },
        }),
        (0, x.jsx)(`main`, {
          className: `flex-1`,
          children:
            e === `/reset-password`
              ? (0, x.jsx)(S, { reset: !0 })
              : e === `/get-a-quote`
                ? (0, x.jsx)(We, { onNavigate: i })
                : e.startsWith(`/contractor`)
                  ? (0, x.jsx)(Xe, { onNavigate: i })
                  : e.startsWith(`/vendor`)
                    ? (0, x.jsx)($e, { onNavigate: i })
                    : e.startsWith(`/admin`)
                      ? (0, x.jsx)(nt, { onNavigate: i })
                      : (0, x.jsx)(Le, { onNavigate: i }),
        }),
        (0, x.jsx)(Me, { onNavigate: i }),
      ],
    }),
  });
}
(0, y.createRoot)(document.getElementById(`root`)).render((0, x.jsx)(rt, {}));

function WorkbookPriceTable({ response }) {
  if (!response) return null;
  return (0, x.jsxs)("details", { className: "mt-4 border rounded p-3 text-xs", children: [
    (0, x.jsx)("summary", { className: "font-bold cursor-pointer", children: "Excel quotation — revision " + response.revision + " — " + response.status }),
    response.staleRevision && (0, x.jsx)("p", { className: "mt-2 text-red-700", children: "This quotation belongs to a previous RFQ revision. Upload the current workbook before it can be awarded." }),
    (0, x.jsxs)("div", { className: "overflow-x-auto mt-3", children: [(0, x.jsxs)("table", { className: "w-full text-left", children: [
      (0, x.jsx)("thead", { children: (0, x.jsx)("tr", { children: ["Item", "Description", "Unit", "Qty", "Rate (AED)", "Amount (AED)", "Remarks"].map(label => (0, x.jsx)("th", { className: "p-2 border-b", children: label }, label)) }) }),
      (0, x.jsx)("tbody", { children: response.items.map(item => (0, x.jsx)("tr", { children: [item.itemNo, item.description, item.unit, item.quantity, item.unitRateAed ?? "", item.totalPriceAed ?? "", item.remarks].map((value, index) => (0, x.jsx)("td", { className: "p-2 border-b", children: value }, index)) }, item.itemNo)) })
    ] })] }),
    (0, x.jsx)("p", { className: "mt-3", children: "Lead time: " + response.leadTimeDays + " days | Validity: " + response.validityDays + " days" }),
    (0, x.jsx)("p", { className: "mt-1 whitespace-pre-wrap", children: "Payment terms: " + response.paymentTerms })
  ] });
}
function WorkbookResponses({ parentId, kind }) {
  const [rows, setRows] = (0, b.useState)([]), [error, setError] = (0, b.useState)("");
  (0, b.useEffect)(() => {
    const abort = new AbortController();
    fetch("/api/admin/rfq-workbook-responses?parentKind=" + encodeURIComponent(kind) + "&parentId=" + encodeURIComponent(parentId), { signal: abort.signal })
      .then(async response => { const body = await response.json(); if (!response.ok) throw Error(body.error || "Could not load Excel quotations"); setRows(body.data); })
      .catch(error => { if (error.name !== "AbortError") setError(error.message); });
    return () => abort.abort();
  }, [parentId, kind]);
  return (0, x.jsxs)("section", { children: [
    error && (0, x.jsx)("p", { role: "alert", children: error }),
    rows.length > 0 && (0, x.jsx)("strong", { children: "Excel quotations and revision history" }),
    ...rows.map(response => (0, x.jsxs)("div", { children: [
      (0, x.jsx)("p", { className: "mt-3", children: response.vendorDisplayName + " — AED " + response.totalAmountAed.toLocaleString() }),
      (0, x.jsx)(WorkbookPriceTable, { response })
    ] }, response.id))
  ] });
}
