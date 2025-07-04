import {
  r as s,
  j as e,
  T as W,
  D as F,
  M as D,
  a as M,
  W as B,
  L as z,
  b as C,
  c as A,
  d as O
} from "./assets/defaultSettingsView-DkkRvn5X.js";
const I = ({
    className: n,
    style: d,
    open: o,
    width: c,
    verticalOffset: f,
    requestClose: h,
    anchor: g,
    dataTestId: E,
    children: y
  }) => {
    const w = s.useRef(null),
      [T, x] = s.useState(0);
    let S = d;
    if (g != null && g.current) {
      const u = g.current.getBoundingClientRect();
      S = { position: "fixed", margin: 0, top: u.bottom + (f ?? 0), left: V(u, c), width: c, zIndex: 1, ...d };
    }
    return (
      s.useEffect(() => {
        const u = (j) => {
            !w.current || !(j.target instanceof Node) || w.current.contains(j.target) || h == null || h();
          },
          p = (j) => {
            j.key === "Escape" && (h == null || h());
          };
        return o
          ? (document.addEventListener("mousedown", u),
            document.addEventListener("keydown", p),
            () => {
              document.removeEventListener("mousedown", u), document.removeEventListener("keydown", p);
            })
          : () => {};
      }, [o, h]),
      s.useEffect(() => {
        const u = () => x((p) => p + 1);
        return (
          window.addEventListener("resize", u),
          () => {
            window.removeEventListener("resize", u);
          }
        );
      }, []),
      o && e.jsx("dialog", { "ref": w, "style": S, "className": n, "data-testid": E, "open": !0, "children": y })
    );
  },
  V = (n, d) => {
    const o = R(n, d, "left");
    if (o.inBounds) return o.value;
    const c = R(n, d, "right");
    return c.inBounds ? c.value : o.value;
  },
  R = (n, d, o) => {
    const c = document.documentElement.clientWidth;
    if (o === "left") {
      const f = n.left;
      return { value: f, inBounds: f + d <= c };
    } else return { value: n.right - d, inBounds: n.right - d >= 0 };
  },
  $ = () => {
    const n = s.useRef(null),
      [d, o] = s.useState(!1);
    return e.jsxs(e.Fragment, {
      children: [
        e.jsx(W, { ref: n, icon: "settings-gear", title: "Settings", onClick: () => o((c) => !c) }),
        e.jsx(I, {
          style: { backgroundColor: "var(--vscode-sideBar-background)", padding: "4px 8px" },
          open: d,
          width: 200,
          verticalOffset: 8,
          requestClose: () => o(!1),
          anchor: n,
          dataTestId: "settings-toolbar-dialog",
          children: e.jsx(F, {})
        })
      ]
    });
  },
  G = () => {
    const [n, d] = s.useState(!1),
      [o, c] = s.useState([]),
      [f, h] = s.useState([]),
      [g, E] = s.useState(N),
      [y, w] = s.useState({ done: 0, total: 0 }),
      [T, x] = s.useState(!1),
      [S, u] = s.useState(null),
      [p, j] = s.useState(null),
      L = s.useCallback((t) => {
        const a = [],
          i = [],
          r = new URL(window.location.href);
        for (let l = 0; l < t.length; l++) {
          const m = t.item(l);
          if (!m) continue;
          const k = URL.createObjectURL(m);
          a.push(k), i.push(m.name), r.searchParams.append("trace", k), r.searchParams.append("traceFileName", m.name);
        }
        const v = r.toString();
        window.history.pushState({}, "", v), c(a), h(i), x(!1), u(null);
      }, []);
    s.useEffect(() => {
      const t = async (a) => {
        var i;
        if ((i = a.clipboardData) != null && i.files.length) {
          for (const r of a.clipboardData.files) if (r.type !== "application/zip") return;
          a.preventDefault(), L(a.clipboardData.files);
        }
      };
      return document.addEventListener("paste", t), () => document.removeEventListener("paste", t);
    }),
      s.useEffect(() => {
        const t = (a) => {
          const { method: i, params: r } = a.data;
          if (i !== "load" || !((r == null ? void 0 : r.trace) instanceof Blob)) return;
          const v = new File([r.trace], "trace.zip", { type: "application/zip" }),
            l = new DataTransfer();
          l.items.add(v), L(l.files);
        };
        return window.addEventListener("message", t), () => window.removeEventListener("message", t);
      });
    const U = s.useCallback(
        (t) => {
          t.preventDefault(), L(t.dataTransfer.files);
        },
        [L]
      ),
      P = s.useCallback(
        (t) => {
          t.preventDefault(), t.target.files && L(t.target.files);
        },
        [L]
      );
    s.useEffect(() => {
      const t = new URL(window.location.href).searchParams,
        a = t.getAll("trace");
      d(t.has("isServer"));
      for (const i of a)
        if (i.startsWith("file:")) {
          j(i || null);
          return;
        }
      if (t.has("isServer")) {
        const i = new URLSearchParams(window.location.search).get("ws"),
          r = new URL(`../${i}`, window.location.toString());
        r.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const v = new M(new B(r));
        v.onLoadTraceRequested(async (l) => {
          c(l.traceUrl ? [l.traceUrl] : []), x(!1), u(null);
        }),
          v.initialize({}).catch(() => {});
      } else a.some((i) => i.startsWith("blob:")) || c(a);
    }, []),
      s.useEffect(() => {
        (async () => {
          if (o.length) {
            const t = (r) => {
              r.data.method === "progress" && w(r.data.params);
            };
            navigator.serviceWorker.addEventListener("message", t), w({ done: 0, total: 1 });
            const a = [];
            for (let r = 0; r < o.length; r++) {
              const v = o[r],
                l = new URLSearchParams();
              l.set("trace", v), f.length && l.set("traceFileName", f[r]), l.set("limit", String(o.length));
              const m = await fetch(`contexts?${l.toString()}`);
              if (!m.ok) {
                n || c([]), u((await m.json()).error);
                return;
              }
              a.push(...(await m.json()));
            }
            navigator.serviceWorker.removeEventListener("message", t);
            const i = new D(a);
            w({ done: 0, total: 0 }), E(i);
          } else E(N);
        })();
      }, [n, o, f]);
    const b = !!(!n && !T && !p && (!o.length || S));
    return e.jsxs("div", {
      className: "vbox workbench-loader",
      onDragOver: (t) => {
        t.preventDefault(), x(!0);
      },
      children: [
        e.jsxs("div", {
          className: "hbox header",
          ...(b ? { inert: "true" } : {}),
          children: [
            e.jsx("div", {
              className: "logo",
              children: e.jsx("img", { src: "playwright-logo.svg", alt: "Playwright logo" })
            }),
            e.jsx("div", { className: "product", children: "Playwright" }),
            g.title && e.jsx("div", { className: "title", children: g.title }),
            e.jsx("div", { className: "spacer" }),
            e.jsx($, {})
          ]
        }),
        e.jsx("div", {
          className: "progress",
          children: e.jsx("div", {
            className: "inner-progress",
            style: { width: y.total ? (100 * y.done) / y.total + "%" : 0 }
          })
        }),
        e.jsx(z, { children: e.jsx(C, { model: g, inert: b }) }),
        p &&
          e.jsxs("div", {
            className: "drop-target",
            children: [
              e.jsx("div", { children: "Trace Viewer uses Service Workers to show traces. To view trace:" }),
              e.jsxs("div", {
                style: { paddingTop: 20 },
                children: [
                  e.jsxs("div", {
                    children: [
                      "1. Click ",
                      e.jsx("a", { href: p, children: "here" }),
                      " to put your trace into the download shelf"
                    ]
                  }),
                  e.jsxs("div", {
                    children: [
                      "2. Go to ",
                      e.jsx("a", { href: "https://trace.playwright.dev", children: "trace.playwright.dev" })
                    ]
                  }),
                  e.jsx("div", { children: "3. Drop the trace from the download shelf into the page" })
                ]
              })
            ]
          }),
        b &&
          e.jsxs("div", {
            className: "drop-target",
            children: [
              e.jsx("div", { className: "processing-error", role: "alert", children: S }),
              e.jsx("div", {
                "className": "title",
                "role": "heading",
                "aria-level": 1,
                "children": "Drop Playwright Trace to load"
              }),
              e.jsx("div", { children: "or" }),
              e.jsx("button", {
                onClick: () => {
                  const t = document.createElement("input");
                  (t.type = "file"), (t.multiple = !0), t.click(), t.addEventListener("change", (a) => P(a));
                },
                type: "button",
                children: "Select file(s)"
              }),
              e.jsx("div", {
                style: { maxWidth: 400 },
                children:
                  "Playwright Trace Viewer is a Progressive Web App, it does not send your trace anywhere, it opens it locally."
              })
            ]
          }),
        n &&
          !o.length &&
          e.jsx("div", {
            className: "drop-target",
            children: e.jsx("div", { className: "title", children: "Select test to see the trace" })
          }),
        T &&
          e.jsx("div", {
            className: "drop-target",
            onDragLeave: () => {
              x(!1);
            },
            onDrop: (t) => U(t),
            children: e.jsx("div", { className: "title", children: "Release to analyse the Playwright Trace" })
          })
      ]
    });
  },
  N = new D([]);
(async () => {
  if ((A(), window.location.protocol !== "file:")) {
    if (
      (window.location.href.includes("isUnderTest=true") && (await new Promise((n) => setTimeout(n, 1e3))),
      !navigator.serviceWorker)
    )
      throw new Error(`Service workers are not supported.
Make sure to serve the Trace Viewer (${window.location}) via HTTPS or localhost.`);
    navigator.serviceWorker.register("sw.bundle.js"),
      navigator.serviceWorker.controller ||
        (await new Promise((n) => {
          navigator.serviceWorker.oncontrollerchange = () => n();
        })),
      setInterval(function () {
        fetch("ping");
      }, 1e4);
  }
  O.createRoot(document.querySelector("#root")).render(e.jsx(G, {}));
})();
