import { clsx as e } from "clsx";
import { twMerge as t } from "tailwind-merge";
import * as n from "react";
import { Fragment as r, createContext as i, forwardRef as a, useCallback as o, useContext as s, useEffect as c, useId as l, useLayoutEffect as u, useMemo as d, useRef as f, useState as p } from "react";
import { AlertDialog as m, Avatar as h, Checkbox as g, Collapsible as _, ContextMenu as v, Dialog as y, DropdownMenu as b, Label as x, Popover as S, RadioGroup as C, Select as w, Separator as T, Slot as E, Switch as D, Tabs as O, Tooltip as k } from "radix-ui";
import { Fragment as A, jsx as j, jsxs as M } from "react/jsx-runtime";
import { cva as ee } from "class-variance-authority";
import { AlertTriangle as te, ArrowDown as N, ArrowDownUp as ne, ArrowLeft as re, ArrowUp as P, Bookmark as F, BookmarkPlus as I, Captions as ie, Check as L, ChevronDown as R, ChevronLeft as z, ChevronRight as B, ChevronUp as ae, ChevronsUpDown as oe, Circle as V, CircleDashed as H, Columns3 as se, Copy as U, CornerUpLeft as ce, Ellipsis as W, EllipsisVertical as le, Eye as ue, EyeOff as de, Filter as G, Folder as fe, FolderInput as pe, FolderOpen as me, FolderPlus as he, IndentDecrease as ge, IndentIncrease as _e, Loader2 as ve, Maximize as ye, MessagesSquare as be, Minimize as xe, Monitor as Se, MoreHorizontal as Ce, Paperclip as we, Pause as Te, Pencil as Ee, PictureInPicture2 as De, Play as Oe, Plus as ke, RefreshCw as Ae, RotateCcw as je, RotateCw as Me, Search as Ne, SendHorizontal as Pe, Settings as Fe, SkipForward as Ie, Smartphone as Le, Trash2 as Re, Volume1 as ze, Volume2 as Be, VolumeX as Ve, X as K } from "lucide-react";
import { Combobox as He, ComboboxButton as Ue, ComboboxInput as We, ComboboxOption as Ge, ComboboxOptions as Ke } from "@headlessui/react";
import { Command as q } from "cmdk";
import { useVirtualizer as qe } from "@tanstack/react-virtual";
//#region src/lib/cn.ts
function J(...n) {
	return t(e(n));
}
//#endregion
//#region src/lib/download.ts
function Je(e, t, n = "text/csv;charset=utf-8") {
	if (typeof document > "u") return;
	let r = URL.createObjectURL(new Blob([e], { type: n })), i = document.createElement("a");
	i.href = r, i.download = t, i.rel = "noopener", document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
//#endregion
//#region src/lib/tree.ts
var Ye = (e) => (e.children?.length ?? 0) > 0;
function Y(e, t) {
	for (let n of e) {
		if (n.id === t) return n;
		let e = n.children ? Y(n.children, t) : null;
		if (e) return e;
	}
	return null;
}
function X(e, t, n = null) {
	let r = e.findIndex((e) => e.id === t);
	if (r >= 0) return {
		parentId: n,
		index: r,
		siblings: e
	};
	for (let n of e) {
		let e = n.children ? X(n.children, t, n.id) : null;
		if (e) return e;
	}
	return null;
}
function Xe(e, t) {
	for (let n of e) {
		if (n.id === t) return [n];
		let e = n.children ? Xe(n.children, t) : [];
		if (e.length) return [n, ...e];
	}
	return [];
}
function Ze(e, t) {
	let n = Y(e, t);
	if (!n) return [];
	let r = [], i = (e) => {
		r.push(e.id), e.children?.forEach(i);
	};
	return i(n), r;
}
function Qe(e, t, n = 1, r = null) {
	return e.flatMap((i, a) => {
		let o = Ye(i) && t.has(i.id), s = {
			node: i,
			level: n,
			parentId: r,
			posInSet: a + 1,
			setSize: e.length,
			hasChildren: Ye(i),
			expanded: o
		};
		return o ? [s, ...Qe(i.children, t, n + 1, i.id)] : [s];
	});
}
function $e(e, t, n) {
	return t === null ? n(e) : e.map((e) => e.id === t ? {
		...e,
		children: n(e.children ?? [])
	} : e.children ? {
		...e,
		children: $e(e.children, t, n)
	} : e);
}
var et = (e, t) => Math.min(Math.max(e, 0), t);
function tt(e, t, n, r) {
	return t !== null && !Y(e, t) ? e : $e(e, t, (e) => {
		let t = et(r ?? e.length, e.length);
		return [
			...e.slice(0, t),
			n,
			...e.slice(t)
		];
	});
}
function nt(e, t) {
	let n = X(e, t);
	return n ? $e(e, n.parentId, (e) => e.filter((e) => e.id !== t)) : e;
}
function rt(e, t, n) {
	return e.map((e) => e.id === t ? {
		...e,
		label: n
	} : e.children ? {
		...e,
		children: rt(e.children, t, n)
	} : e);
}
function it(e, t, n) {
	return Y(e, t) ? n === null ? !0 : Y(e, n) ? !Ze(e, t).includes(n) : !1 : !1;
}
function at(e, t, n, r) {
	if (!it(e, t, n)) return e;
	let i = X(e, t), a = i.siblings[i.index], o = i.parentId === n && i.index < r ? r - 1 : r;
	return i.parentId === n && o === i.index ? e : tt(nt(e, t), n, a, o);
}
function ot(e, t, n) {
	let r = X(e, t);
	if (!r) return e;
	let i = r.index + n;
	return i < 0 || i >= r.siblings.length ? e : at(e, t, r.parentId, n === 1 ? r.index + 2 : i);
}
function st(e, t) {
	let n = X(e, t);
	if (!n || n.index === 0) return e;
	let r = n.siblings[n.index - 1];
	return at(e, t, r.id, r.children?.length ?? 0);
}
function ct(e, t) {
	let n = X(e, t);
	if (!n || n.parentId === null) return e;
	let r = X(e, n.parentId);
	return at(e, t, r.parentId, r.index + 1);
}
//#endregion
//#region src/lib/messageAttachments.ts
var lt = [
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
	"text/plain",
	"text/csv",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation"
], ut = 25, dt = 5;
function ft(e, t) {
	let n = {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	};
	return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toLocaleString(t, n)} KB` : `${(e / 1024 / 1024).toLocaleString(t, n)} MB`;
}
function pt(e, t) {
	return t.length === 0 || t.some((t) => t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e);
}
function mt(e, t) {
	return e.size > t.maxSizeMb * 1024 * 1024 ? "too_large" : pt(e.type, t.mimes) ? null : "wrong_type";
}
function ht(e, t, n) {
	let r = [...e], i = [];
	for (let e of t) e.size > n.maxSizeMb * 1024 * 1024 ? i.push({
		file: e,
		reason: "too_large"
	}) : r.length >= n.maxFiles ? i.push({
		file: e,
		reason: "too_many"
	}) : r.push(e);
	return {
		files: r,
		rejected: i
	};
}
//#endregion
//#region src/hooks/gridActions.ts
function gt(e) {
	return e <= 0 ? "none" : e === 1 ? "one" : "many";
}
function _t(e, t) {
	return typeof e.disabled == "function" ? e.disabled(t) : e.disabled === !0;
}
function vt(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let r of e) {
		if (!(r.when ?? ["none"]).includes(t)) continue;
		let e = r.group ?? "";
		n.set(e, [...n.get(e) ?? [], r]);
	}
	return [...n.values()];
}
//#endregion
//#region src/hooks/shortcuts.ts
function yt() {
	return typeof navigator > "u" ? !1 : /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
function bt(e) {
	let t = e.split("+").map((e) => e.trim()), n = t.pop() ?? "", r = (e) => t.some((t) => t.toLowerCase() === e);
	return {
		mod: r("mod"),
		shift: r("shift"),
		alt: r("alt"),
		key: n
	};
}
function xt(e, t, n = yt()) {
	let r = bt(t), i = n ? e.metaKey : e.ctrlKey, a = n ? e.ctrlKey : e.metaKey;
	if (i !== r.mod || a || e.shiftKey !== r.shift || e.altKey !== r.alt) return !1;
	let o = r.key.toLowerCase(), s = e.key.toLowerCase();
	return o === "delete" ? s === "delete" || s === "backspace" : s === o;
}
var St = {
	Mod: "⌘",
	Shift: "⇧",
	Alt: "⌥",
	Delete: "⌫",
	Enter: "↩",
	Escape: "esc"
}, Ct = {
	Mod: "Ctrl",
	Shift: "Shift",
	Alt: "Alt",
	Delete: "Del",
	Enter: "Enter",
	Escape: "Esc"
};
function wt(e, t = {}, n = yt()) {
	let r = {
		...n ? St : Ct,
		...t
	}, { mod: i, shift: a, alt: o, key: s } = bt(e), c = (e) => r[e] ?? (e.length === 1 ? e.toUpperCase() : e);
	return [
		...n ? [] : i ? [r.Mod] : [],
		...o ? [r.Alt] : [],
		...a ? [r.Shift] : [],
		...n && i ? [r.Mod] : [],
		c(s)
	].join(n ? "" : "+");
}
function Tt(e, t) {
	return e.value ? e.value(t) : t[e.id];
}
var Et = (e) => e == null || e === "", Dt = new Intl.Collator("de", {
	numeric: !0,
	sensitivity: "base"
});
function Ot(e, t) {
	return typeof e == "number" && typeof t == "number" ? e - t : e instanceof Date && t instanceof Date ? e.getTime() - t.getTime() : typeof e == "boolean" && typeof t == "boolean" ? Number(e) - Number(t) : Dt.compare(String(e), String(t));
}
function kt(e, t, n) {
	let r = t.map((e) => ({
		s: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : [...e].sort((e, t) => {
		for (let { s: n, col: i } of r) {
			let r = Tt(i, e), a = Tt(i, t);
			if (Et(r) || Et(a)) {
				if (Et(r) && Et(a)) continue;
				return Et(r) ? 1 : -1;
			}
			let o = (i.compare ?? Ot)(r, a);
			if (o !== 0) return n.desc ? -o : o;
		}
		return 0;
	});
}
var At = (e) => e.toLocaleLowerCase("de").normalize("NFC");
function jt(e) {
	if (e instanceof Date) return e.getTime();
	if (typeof e != "string" || e === "") return null;
	let t = Date.parse(e.length === 10 ? `${e}T00:00:00Z` : e);
	return Number.isNaN(t) ? null : t;
}
function Mt(e, t) {
	switch (e.type) {
		case "text": {
			let n = At(e.value.trim());
			if (n === "") return !0;
			let r = Et(t) ? "" : At(String(t));
			return e.op === "equals" ? r === n : e.op === "startsWith" ? r.startsWith(n) : r.includes(n);
		}
		case "choice": return e.values.length === 0 || e.values.includes(String(t ?? ""));
		case "number": {
			if (e.min === void 0 && e.max === void 0) return !0;
			let n = typeof t == "number" ? t : NaN;
			return !Number.isNaN(n) && (e.min === void 0 || n >= e.min) && (e.max === void 0 || n <= e.max);
		}
		case "date": {
			if (!e.from && !e.to) return !0;
			let n = jt(t);
			if (n === null) return !1;
			let r = e.from ? jt(e.from) : null, i = e.to ? jt(e.to) + 86399999 : null;
			return (r === null || n >= r) && (i === null || n <= i);
		}
	}
}
function Nt(e, t, n) {
	let r = t.map((e) => ({
		f: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : e.filter((e) => r.every(({ f: t, col: n }) => Mt(t, Tt(n, e))));
}
function Pt(e, t) {
	let n = {};
	for (let r of t) {
		if (!r.aggregate) continue;
		if (r.aggregate === "count") {
			n[r.id] = e.length;
			continue;
		}
		let t = e.map((e) => Tt(r, e)).filter((e) => typeof e == "number"), i = t.reduce((e, t) => e + t, 0);
		n[r.id] = r.aggregate === "sum" ? i : t.length === 0 ? 0 : r.aggregate === "avg" ? i / t.length : r.aggregate === "min" ? Math.min(...t) : Math.max(...t);
	}
	return n;
}
function Ft(e, t, n, r = 0, i = "") {
	let [a, ...o] = t, s = n.find((e) => e.id === a);
	if (!s) return [];
	let c = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Tt(s, t), n = Et(e) ? "" : String(e), r = c.get(n) ?? {
			value: Et(e) ? null : e,
			rows: []
		};
		r.rows.push(t), c.set(n, r);
	}
	return [...c.entries()].sort(([e], [t]) => e === "" || t === "" ? e === t ? 0 : e === "" ? 1 : -1 : Dt.compare(e, t)).map(([e, t]) => {
		let a = `${i}${i ? ">" : ""}${s.id}:${e}`;
		return {
			key: a,
			columnId: s.id,
			value: t.value,
			depth: r,
			rows: t.rows,
			children: o.length ? Ft(t.rows, o, n, r + 1, a) : [],
			aggregates: Pt(t.rows, n)
		};
	});
}
function It(e, t, n, r) {
	if (t.length === 0) return e.map((e) => ({
		kind: "row",
		row: e,
		id: r(e),
		depth: 0
	}));
	let i = [], a = (e) => {
		for (let t of e) if (i.push({
			kind: "group",
			group: t
		}), n.has(t.key)) {
			if (t.children.length) a(t.children);
			else for (let e of t.rows) i.push({
				kind: "row",
				row: e,
				id: r(e),
				depth: t.depth + 1
			});
		}
	};
	return a(t), i;
}
function Lt(e, t) {
	if (e.exportValue) return {
		text: e.exportValue(t),
		wasString: !0
	};
	let n = Tt(e, t);
	return Et(n) ? {
		text: "",
		wasString: !1
	} : n instanceof Date ? {
		text: n.toISOString(),
		wasString: !1
	} : {
		text: String(n),
		wasString: typeof n == "string"
	};
}
var Rt = /^[=+\-@\t\r]/;
function zt(e, t, n) {
	let r = t && Rt.test(e) ? `'${e}` : e;
	return r.includes(n) || /["\r\n]/.test(r) ? `"${r.replace(/"/g, "\"\"")}"` : r;
}
function Bt(e, t, { separator: n = ",", bom: r = !1 } = {}) {
	let i = [t.map((e) => zt(e.header, !0, n)).join(n), ...e.map((e) => t.map((t) => {
		let { text: r, wasString: i } = Lt(t, e);
		return zt(r, i, n);
	}).join(n))];
	return (r ? "﻿" : "") + i.join("\r\n");
}
function Vt(e, t) {
	let n = (e) => e.replace(/[\t\r\n]+/g, " ");
	return [t.map((e) => n(e.header)).join("	"), ...e.map((e) => t.map((t) => n(Lt(t, e).text)).join("	"))].join("\n");
}
function Ht(e, t) {
	let n = new Set(t), r = e.filter((e) => n.has(e));
	return [...r, ...t.filter((e) => !r.includes(e))];
}
function Ut(e, t, n) {
	if (e.indexOf(t) < 0) return e;
	let r = e.filter((e) => e !== t);
	return r.splice(Math.max(0, Math.min(r.length, n)), 0, t), r;
}
function Wt(e, t) {
	let n = Ht(t.order, e.map((e) => e.id)), r = new Map(e.map((e) => [e.id, e])), i = n.map((e) => r.get(e)).filter((e) => e.hideable === !1 || !t.hidden.includes(e.id)).map((e) => {
		let n = Math.round(Math.min(e.maxWidth ?? 640, Math.max(e.minWidth ?? 64, t.widths[e.id] ?? e.width ?? 160))), r = e.id in t.pinned ? t.pinned[e.id] : e.pinned ?? null;
		return {
			id: e.id,
			width: n,
			pinned: r,
			offset: 0
		};
	}), a = i.filter((e) => e.pinned === "left"), o = i.filter((e) => e.pinned === null), s = i.filter((e) => e.pinned === "right"), c = t.leading ?? 0;
	for (let e of a) e.offset = c, c += e.width;
	c = 0;
	for (let e of [...s].reverse()) e.offset = c, c += e.width;
	return [
		...a,
		...o,
		...s
	];
}
//#endregion
//#region src/hooks/useGridPreferences.ts
var Gt = {
	hiddenColumns: [],
	density: "comfortable",
	selection: !0,
	columnOrder: [],
	columnWidths: {},
	pinned: {},
	sorting: [],
	groupBy: [],
	views: [],
	activeView: null
}, Kt = 1;
function qt(e) {
	return `burgwiss-ui:grid:${e}`;
}
function Jt() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Yt(e) {
	let t = (e) => Array.isArray(e) ? e.map(t) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((n) => [n, t(e[n])])) : e;
	return JSON.stringify(t({
		...e,
		hiddenColumns: [...e.hiddenColumns].sort()
	}));
}
function Xt(e, t) {
	return Yt(e) === Yt(t);
}
var Zt = (e) => typeof e == "object" && !!e && !Array.isArray(e), Qt = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string") : null;
function $t(e, t) {
	let n = e;
	return {
		hiddenColumns: Qt(n.hiddenColumns) ?? t.hiddenColumns,
		density: n.density === "compact" || n.density === "comfortable" ? n.density : t.density,
		selection: typeof n.selection == "boolean" ? n.selection : t.selection,
		columnOrder: Qt(n.columnOrder) ?? t.columnOrder,
		columnWidths: Zt(n.columnWidths) ? Object.fromEntries(Object.entries(n.columnWidths).filter((e) => typeof e[1] == "number" && Number.isFinite(e[1]) && e[1] > 0)) : t.columnWidths,
		pinned: Zt(n.pinned) ? Object.fromEntries(Object.entries(n.pinned).filter(([, e]) => e === "left" || e === "right" || e === null)) : t.pinned,
		sorting: Array.isArray(n.sorting) ? n.sorting.filter((e) => Zt(e) && typeof e.id == "string" && typeof e.desc == "boolean") : t.sorting,
		groupBy: Qt(n.groupBy) ?? t.groupBy,
		views: Array.isArray(n.views) ? n.views.filter((e) => Zt(e) && typeof e.id == "string" && typeof e.name == "string" && Zt(e.state)) : t.views,
		activeView: typeof n.activeView == "string" ? n.activeView : t.activeView
	};
}
function en(e, t, n) {
	try {
		let r = e?.getItem(t);
		if (!r) return n;
		let i = JSON.parse(r);
		return !Zt(i) || i.v !== Kt ? n : $t(i, n);
	} catch {
		return n;
	}
}
function tn(e, t, n, r) {
	try {
		Xt(n, r) ? e?.removeItem(t) : e?.setItem(t, JSON.stringify({
			v: Kt,
			...n
		}));
	} catch {}
}
function nn(e, t = {}) {
	let n = qt(e), r = t.storage === void 0 ? Jt() : t.storage, i = JSON.stringify({
		...Gt,
		...t.defaults
	}), a = d(() => JSON.parse(i), [i]), [o, s] = p(() => ({
		key: n,
		prefs: en(r, n, a)
	})), l = o.prefs;
	o.key !== n && (l = en(r, n, a), s({
		key: n,
		prefs: l
	})), c(() => {
		if (typeof window > "u") return;
		let e = (e) => {
			e.key === n && s({
				key: n,
				prefs: en(r, n, a)
			});
		};
		return window.addEventListener("storage", e), () => window.removeEventListener("storage", e);
	}, [
		n,
		r,
		a
	]);
	let u = (e) => {
		s((t) => {
			let i = e(t.key === n ? t.prefs : en(r, n, a));
			return tn(r, n, i, a), {
				key: n,
				prefs: i
			};
		});
	};
	return {
		values: l,
		isDefault: Xt(l, a),
		isColumnVisible: (e) => !l.hiddenColumns.includes(e),
		setColumnVisible: (e, t) => u((n) => ({
			...n,
			hiddenColumns: t ? n.hiddenColumns.filter((t) => t !== e) : [...n.hiddenColumns.filter((t) => t !== e), e]
		})),
		setDensity: (e) => u((t) => ({
			...t,
			density: e
		})),
		setSelectionEnabled: (e) => u((t) => ({
			...t,
			selection: e
		})),
		set: (e) => u((t) => ({
			...t,
			...typeof e == "function" ? e(t) : e
		})),
		reset: () => u(() => a)
	};
}
//#endregion
//#region src/hooks/useGrid.ts
var rn = 40, an = "a,button,input,select,textarea,label,[role=button],[role=checkbox],[role=menuitem],[data-grid-ignore]";
function on(e) {
	return !!e?.closest("input:not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable=\"\"],[contenteditable=true]");
}
function sn(e) {
	return e instanceof Element ? e.closest("[data-grid-row-id]") : null;
}
function cn(e) {
	return e.metaKey || e.ctrlKey;
}
function ln(e) {
	return JSON.stringify({
		hiddenColumns: [...e.hiddenColumns ?? []].sort(),
		columnOrder: e.columnOrder ?? [],
		columnWidths: Object.entries(e.columnWidths ?? {}).sort(),
		pinned: Object.entries(e.pinned ?? {}).sort(),
		sorting: e.sorting ?? [],
		filters: [...e.filters ?? []].sort((e, t) => e.id.localeCompare(t.id)),
		groupBy: e.groupBy ?? [],
		density: e.density ?? "comfortable"
	});
}
var un = (e, t) => `${String(e)}::${t}`;
function dn({ id: e, rows: t, getRowId: n, columns: r, mode: i = "client", onQueryChange: a, selection: o = "multiple", actions: s = [], defaultSelectedIds: l = [], isExpandable: u, defaults: d, storage: m }) {
	let h = nn(e, {
		defaults: d,
		storage: m
	}), g = h.values, [_, v] = p(l), [y, b] = p(null), [x, S] = p(null), C = f(/* @__PURE__ */ new Map()), [w, T] = p(() => g.views.find((e) => e.id === g.activeView)?.state.filters ?? []), [E, D] = p(/* @__PURE__ */ new Set()), [O, k] = p(/* @__PURE__ */ new Set()), [A, j] = p(/* @__PURE__ */ new Map()), [M, ee] = p(null), [te, N] = p(null), [ne, re] = p(!1), P = (e) => r.find((t) => t.id === e), F = i === "client", I = g.sorting.filter((e) => P(e.id)?.sortable !== !1 && P(e.id)), ie = F ? g.groupBy.filter((e) => P(e)?.groupable) : [], L = F ? kt(Nt(t, w, r), I, r) : t, R = ie.length ? Ft(L, ie, r) : [], z = It(L, R, E, n), B = L.map(n), ae = {
		sorting: I,
		filters: w
	}, oe = JSON.stringify(ae), V = f(oe);
	c(() => {
		i === "server" && V.current !== oe && (V.current = oe, a?.(JSON.parse(oe)));
	}, [
		i,
		oe,
		a
	]);
	let H = o !== "none" && g.selection ? o : "none", se = new Set(B), U = H === "none" ? [] : _.filter((e) => se.has(e)), ce = gt(U.length), W = (e) => U.includes(e), le = x !== null && se.has(x) ? x : B[0] ?? null, ue = u !== void 0, de = Wt(r, {
		order: g.columnOrder,
		hidden: g.hiddenColumns,
		widths: g.columnWidths,
		pinned: g.pinned,
		leading: (H === "multiple" ? 40 : 0) + (ue ? 40 : 0)
	}), G = (e) => {
		H !== "none" && v(H === "single" ? e.slice(-1) : [...new Set(e)]);
	}, fe = (e) => {
		H !== "none" && (v(H === "single" ? W(e) ? [] : [e] : W(e) ? U.filter((t) => t !== e) : [...U, e]), b(e));
	}, pe = () => {
		H === "multiple" && v([...B]);
	}, me = () => v([]), he = (e, t) => {
		let n = B.indexOf(e), r = B.indexOf(t);
		return n < 0 || r < 0 ? [t] : B.slice(Math.min(n, r), Math.max(n, r) + 1);
	}, ge = (e) => {
		S(e), C.current.get(e)?.focus();
	}, _e = (e, t) => !e || _t(e, t) || !(e.when ?? ["none"]).includes(gt(t.length)) ? !1 : (e.onSelect(t), !0), ve = s.find((e) => e.isDefault), ye = (e) => {
		let t = W(e) ? U : [e];
		W(e) || G([e]), _e(ve, t);
	}, be = (e) => t.find((t) => n(t) === e), xe = (e) => u?.(e) ?? !1, Se = (e) => {
		let t = be(e);
		t && xe(t) && k((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, Ce = () => de.map((e) => P(e.id)).filter(Boolean), we = () => L.filter((e) => W(n(e))), Te = async () => {
		let e = x === null ? void 0 : be(x), t = U.length ? we() : e ? [e] : [];
		if (t.length === 0) return "";
		let n = Vt(t, Ce());
		try {
			await navigator.clipboard?.writeText(n);
		} catch {}
		return n;
	}, Ee = (e, t) => {
		if (!(e.target instanceof Element && e.target.closest(an)) && (S(t), H !== "none")) {
			if (H === "multiple" && e.shiftKey && y !== null) {
				let n = he(y, t);
				G(cn(e) ? [...U, ...n] : n);
				return;
			}
			if (H === "multiple" && cn(e)) {
				fe(t);
				return;
			}
			G([t]), b(t);
		}
	}, De = (e) => {
		let t = e.target;
		if (on(t)) return;
		let n = sn(t), r = n ? fn(n, B) : null;
		for (let t of vt(s, ce).flat()) if (t.shortcut && xt(e, t.shortcut)) {
			e.preventDefault(), _e(t, U);
			return;
		}
		let i = e.metaKey || e.ctrlKey;
		if (e.key === "Escape" && U.length > 0) {
			e.preventDefault(), me();
			return;
		}
		if (i && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "a") {
			if (H !== "multiple") return;
			e.preventDefault(), pe();
			return;
		}
		if (i && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "c") {
			if (window.getSelection?.()?.toString() || U.length === 0 && r === null) return;
			e.preventDefault(), Te();
			return;
		}
		if (r === null || t !== n && t.closest(an)) return;
		let a = B.indexOf(r), o = (t) => {
			let n = B[Math.max(0, Math.min(B.length - 1, t))];
			if (n !== void 0) {
				if (e.preventDefault(), ge(n), e.shiftKey && H === "multiple") {
					let e = y ?? r;
					b(e), G(he(e, n));
				} else !i && H !== "none" && (G([n]), b(n));
			}
		}, c = be(r);
		switch (e.key) {
			case "ArrowDown": return o(a + 1);
			case "ArrowUp": return o(a - 1);
			case "Home": return o(0);
			case "End": return o(B.length - 1);
			case "ArrowRight":
			case "ArrowLeft": {
				if (!c || !xe(c)) return;
				let n = t.closest("[dir=rtl]") !== null;
				e.key === "ArrowRight" !== n !== O.has(r) && (e.preventDefault(), Se(r));
				return;
			}
			case " ":
				e.preventDefault(), H === "multiple" ? fe(r) : H === "single" && G([r]);
				return;
			case "Enter":
				e.preventDefault(), ye(r);
				return;
		}
	}, Oe = (e) => {
		let t = sn(e.target);
		if (!t) {
			me();
			return;
		}
		let n = fn(t, B);
		n !== null && (S(n), W(n) || (G([n]), b(n)));
	}, ke = () => ({
		hiddenColumns: g.hiddenColumns,
		columnOrder: g.columnOrder,
		columnWidths: g.columnWidths,
		pinned: g.pinned,
		sorting: g.sorting,
		filters: w,
		groupBy: g.groupBy,
		density: g.density
	}), Ae = g.views.find((e) => e.id === g.activeView) ?? null, je = (e, t) => {
		let r = A.get(un(n(e), t));
		if (r && r.row === e) return r.value;
		let i = P(t);
		return i ? Tt(i, e) : void 0;
	}, Me = (e, t) => j((n) => {
		let r = new Map(n);
		return t === null ? r.delete(e) : r.set(e, t), r;
	});
	return {
		id: e,
		preferences: h,
		actions: s,
		columns: r,
		columnById: P,
		layout: de,
		visibleRows: L,
		lines: z,
		getRowId: n,
		mode: H,
		dataMode: i,
		query: ae,
		sorting: I,
		toggleSort: (e, t = !1) => {
			let n = P(e);
			n && n.sortable !== !1 && h.set((n) => {
				let r = n.sorting.find((t) => t.id === e), i = r ? r.desc ? null : {
					id: e,
					desc: !0
				} : {
					id: e,
					desc: !1
				};
				if (t && r) return { sorting: n.sorting.flatMap((t) => t.id === e ? i ? [i] : [] : [t]) };
				let a = t ? n.sorting.filter((t) => t.id !== e) : [];
				return { sorting: i ? [...a, i] : a };
			});
		},
		setSorting: (e) => h.set({ sorting: e }),
		filters: w,
		setFilter: (e) => T((t) => [...t.filter((t) => t.id !== e.id), e]),
		removeFilter: (e) => T((t) => t.filter((t) => t.id !== e)),
		clearFilters: () => T([]),
		canGroup: F && r.some((e) => e.groupable),
		groupBy: ie,
		setGroupBy: (e) => {
			F && h.set({ groupBy: e.filter((e) => P(e)?.groupable) });
		},
		toggleGroup: (e) => D((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		}),
		isGroupExpanded: (e) => E.has(e),
		expandAllGroups: () => {
			let e = /* @__PURE__ */ new Set(), t = (n) => n.forEach((n) => (e.add(n.key), t(n.children)));
			t(R), D(e);
		},
		collapseAllGroups: () => D(/* @__PURE__ */ new Set()),
		hasExpandableRows: ue,
		canExpand: xe,
		isRowExpanded: (e) => O.has(e),
		toggleRowExpanded: Se,
		setColumnWidth: (e, t) => h.set((n) => ({ columnWidths: {
			...n.columnWidths,
			[e]: Math.round(t)
		} })),
		moveColumn: (e, t) => h.set((n) => ({ columnOrder: Ut(Ht(n.columnOrder, r.map((e) => e.id)), e, t) })),
		pinColumn: (e, t) => h.set((n) => ({ pinned: {
			...n.pinned,
			[e]: t
		} })),
		views: g.views,
		activeViewId: Ae?.id ?? null,
		isViewModified: Ae !== null && ln(Ae.state) !== ln(ke()),
		saveView: (e) => {
			let t = e.trim();
			if (!t) return null;
			let n = {
				id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
				name: t,
				state: ke()
			};
			return h.set((e) => ({
				views: [...e.views, n],
				activeView: n.id
			})), n;
		},
		applyView: (e) => {
			let t = g.views.find((t) => t.id === e);
			if (!t) return;
			let n = t.state;
			h.set({
				hiddenColumns: n.hiddenColumns ?? [],
				columnOrder: n.columnOrder ?? [],
				columnWidths: n.columnWidths ?? {},
				pinned: n.pinned ?? {},
				sorting: n.sorting ?? [],
				groupBy: n.groupBy ?? [],
				density: n.density ?? g.density,
				activeView: t.id
			}), T(n.filters ?? []);
		},
		updateView: (e) => {
			let t = ke();
			h.set((n) => ({
				views: n.views.map((n) => n.id === e ? {
					...n,
					state: t
				} : n),
				activeView: e
			}));
		},
		renameView: (e, t) => {
			let n = t.trim();
			n && h.set((t) => ({ views: t.views.map((t) => t.id === e ? {
				...t,
				name: n
			} : t) }));
		},
		deleteView: (e) => h.set((t) => ({
			views: t.views.filter((t) => t.id !== e),
			activeView: t.activeView === e ? null : t.activeView
		})),
		exportCsv: ({ scope: e = "all", separator: t, bom: n } = {}) => Bt(e === "selection" ? we() : L, Ce(), {
			separator: t,
			bom: n
		}),
		copySelection: Te,
		editing: M,
		editError: te,
		editPending: ne,
		startEdit: (e, t) => {
			P(t)?.editable && be(e) && (N(null), ee({
				rowId: e,
				columnId: t
			}));
		},
		cancelEdit: () => {
			ee(null), N(null);
		},
		commitEdit: async (e) => {
			if (!M) return !1;
			let t = P(M.columnId), n = be(M.rowId);
			if (!t?.editable || !n) return !1;
			let r = t.editable.validate?.(e, n) ?? null;
			if (r) return N(r), !1;
			let i = un(M.rowId, t.id), a = je(n, t.id);
			Me(i, {
				row: n,
				value: e
			}), re(!0);
			try {
				return await t.editable.onCommit(n, e, a), ee(null), N(null), !0;
			} catch (e) {
				return Me(i, null), N(e instanceof Error ? e.message : String(e)), !1;
			} finally {
				re(!1);
			}
		},
		cellValue: je,
		allowedMode: o,
		selectedIds: U,
		selectionState: ce,
		visibleActions: vt(s, ce),
		isSelected: W,
		select: G,
		toggle: fe,
		selectAll: pe,
		clear: me,
		showCheckboxes: H === "multiple",
		getTableProps: () => ({
			role: "grid",
			...H === "multiple" ? { "aria-multiselectable": !0 } : {}
		}),
		getRowProps: (e) => ({
			"data-grid-row-id": String(e),
			"data-state": W(e) ? "selected" : void 0,
			...H === "none" ? {} : { "aria-selected": W(e) },
			tabIndex: e === le ? 0 : -1,
			ref: (t) => {
				t ? C.current.set(e, t) : C.current.delete(e);
			},
			onClick: (t) => Ee(t, e),
			onDoubleClick: (t) => {
				t.target instanceof Element && t.target.closest(an) || ye(e);
			},
			onMouseDown: (e) => {
				e.shiftKey && (e.preventDefault(), e.currentTarget.focus());
			},
			onFocus: () => S(e),
			className: "cursor-default outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
		}),
		getRowCheckboxProps: (e, t) => ({
			type: "checkbox",
			"aria-label": t,
			checked: W(e),
			tabIndex: -1,
			onChange: () => fe(e)
		}),
		getSelectAllProps: (e) => {
			let t = B.length > 0 && B.every((e) => W(e)), n = !t && U.length > 0;
			return {
				type: "checkbox",
				"aria-label": e,
				checked: t,
				ref: (e) => {
					e && (e.indeterminate = n);
				},
				onChange: () => t ? me() : pe()
			};
		},
		onKeyDown: De,
		onContextMenu: Oe
	};
}
function fn(e, t) {
	let n = e.dataset.gridRowId;
	return t.find((e) => String(e) === n) ?? null;
}
//#endregion
//#region src/hooks/useResizableWidth.ts
var pn = 1;
function mn(e) {
	return `burgwiss-ui:width:${e}`;
}
function hn(e, t, n) {
	return Math.round(Math.min(n, Math.max(t, e)));
}
function gn(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, a = hn(n, r, i);
	if (!t || typeof window > "u") return a;
	try {
		let e = JSON.parse(window.localStorage.getItem(mn(t)) ?? "null"), n = e?.width;
		return e?.v !== pn || typeof n != "number" ? a : Number.isFinite(n) ? hn(n, r, i) : a;
	} catch {
		return a;
	}
}
function _n(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, [a, o] = p(() => gn(e));
	c(() => {
		if (!t || typeof window > "u") return;
		let e = (e) => {
			e.key === mn(t) && o(gn({
				storageKey: t,
				defaultWidth: n,
				minWidth: r,
				maxWidth: i
			}));
		};
		return window.addEventListener("storage", e), () => window.removeEventListener("storage", e);
	}, [
		t,
		n,
		r,
		i
	]);
	let s = (e) => {
		if (t) try {
			let n = mn(t);
			e === null ? window.localStorage.removeItem(n) : window.localStorage.setItem(n, JSON.stringify({
				v: pn,
				width: e
			}));
		} catch {}
	};
	return {
		width: a,
		minWidth: r,
		maxWidth: i,
		setWidth: (e) => {
			let t = hn(e, r, i);
			o(t), s(t);
		},
		reset: () => {
			o(hn(n, r, i)), s(null);
		}
	};
}
//#endregion
//#region src/hooks/useFitScale.ts
var vn = {
	mobile: 390,
	tablet: 834,
	desktop: 1280
};
function yn(e) {
	let t = f(null), [n, r] = p(null);
	return c(() => {
		let e = t.current;
		if (e === null) return;
		let n = () => {
			let t = window.getComputedStyle(e), n = e.clientWidth - parseFloat(t.paddingLeft) - parseFloat(t.paddingRight), i = e.clientHeight - parseFloat(t.paddingTop) - parseFloat(t.paddingBottom);
			n > 0 && i > 0 && r((e) => e?.width === n && e.height === i ? e : {
				width: n,
				height: i
			});
		}, i = typeof ResizeObserver > "u" ? null : new ResizeObserver(n);
		return i?.observe(e), window.addEventListener("resize", n), n(), () => {
			i?.disconnect(), window.removeEventListener("resize", n);
		};
	}, []), {
		ref: t,
		available: n,
		scale: n === null ? 1 : Math.min(1, n.width / e)
	};
}
//#endregion
//#region src/hooks/usePageDraft.ts
var bn = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function xn(e) {
	let [t, n] = p(e), [r, i] = p(e), [a, o] = p([]), s = (e, t, n) => {
		o((n) => [...n, {
			lang: e,
			key: t,
			value: r[e][t]
		}]), i((r) => ({
			...r,
			[e]: {
				...r[e],
				[t]: n
			}
		}));
	}, c = Object.keys(e);
	return {
		draft: r,
		published: t,
		set: s,
		changes: Object.keys(e[c[0]]).flatMap((e) => c.filter((n) => !bn(r[n][e], t[n][e])).map((t) => ({
			lang: t,
			key: e
		}))),
		canUndo: a.length > 0,
		undo: () => {
			let e = a.at(-1);
			return e ? (o((e) => e.slice(0, -1)), i((t) => ({
				...t,
				[e.lang]: {
					...t[e.lang],
					[e.key]: e.value
				}
			})), {
				lang: e.lang,
				key: e.key
			}) : null;
		},
		publish: () => {
			n(r), o([]);
		},
		discard: () => {
			i(t), o([]);
		}
	};
}
//#endregion
//#region src/atoms/Avatar/Avatar.tsx
var Sn = n.forwardRef(function({ className: e, size: t = "default", ...n }, r) {
	return /* @__PURE__ */ j(h.Root, {
		ref: r,
		"data-slot": "avatar",
		"data-size": t,
		className: J("group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6", e),
		...n
	});
});
Sn.displayName = "Avatar";
var Cn = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(h.Image, {
		ref: n,
		"data-slot": "avatar-image",
		className: J("aspect-square size-full", e),
		...t
	});
});
Cn.displayName = "AvatarImage";
var wn = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(h.Fallback, {
		ref: n,
		"data-slot": "avatar-fallback",
		className: J("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", e),
		...t
	});
});
wn.displayName = "AvatarFallback";
var Tn = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j("span", {
		ref: n,
		"data-slot": "avatar-badge",
		className: J("absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none", "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden", "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2", "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2", e),
		...t
	});
});
Tn.displayName = "AvatarBadge";
var En = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j("div", {
		ref: n,
		"data-slot": "avatar-group",
		className: J("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", e),
		...t
	});
});
En.displayName = "AvatarGroup";
var Dn = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j("div", {
		ref: n,
		"data-slot": "avatar-group-count",
		className: J("relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3", e),
		...t
	});
});
Dn.displayName = "AvatarGroupCount";
//#endregion
//#region src/atoms/Badge/Badge.tsx
var On = "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:pointer-events-none", kn = ee(On, {
	variants: { variant: {
		default: "border-transparent bg-primary text-primary-foreground",
		secondary: "border-transparent bg-secondary text-secondary-foreground",
		destructive: "border-transparent bg-destructive text-destructive-foreground",
		outline: "border-border text-foreground",
		muted: "border-transparent bg-muted text-muted-foreground",
		accent: "border-transparent bg-accent text-accent-foreground",
		warning: "border-transparent bg-warning text-warning-foreground"
	} },
	defaultVariants: { variant: "default" }
}), An = {
	success: "border-success/30 bg-success/10 text-success-tint-foreground",
	warning: "border-warning/40 bg-warning/10 text-warning-tint-foreground",
	destructive: "border-destructive/30 bg-destructive/10 text-destructive-tint-foreground",
	neutral: "border-border bg-card text-foreground",
	muted: "border-border bg-muted text-muted-foreground",
	faint: "border-border/60 bg-muted/50 text-muted-foreground"
}, jn = {
	success: "bg-success",
	warning: "bg-warning",
	destructive: "bg-destructive",
	neutral: "bg-muted-foreground",
	muted: "bg-muted-foreground/60",
	faint: "bg-muted-foreground/40"
}, Mn = n.forwardRef(function({ className: e, variant: t, tone: n, dot: r = !1, asChild: i = !1, children: a, ...o }, s) {
	let c = i ? E.Root : "span", l = J(n ? J(On, An[n]) : kn({ variant: t }), e);
	return i ? /* @__PURE__ */ j(c, {
		ref: s,
		"data-slot": "badge",
		className: l,
		...o,
		children: a
	}) : /* @__PURE__ */ M(c, {
		ref: s,
		"data-slot": "badge",
		className: l,
		...o,
		children: [n && r ? /* @__PURE__ */ j("span", {
			className: J("size-1.5 shrink-0 rounded-full", jn[n]),
			"aria-hidden": "true"
		}) : null, a]
	});
});
Mn.displayName = "Badge";
//#endregion
//#region src/atoms/Tooltip/Tooltip.tsx
function Nn({ delayDuration: e = 200, ...t }) {
	return /* @__PURE__ */ j(k.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
function Pn({ ...e }) {
	return /* @__PURE__ */ j(k.Root, {
		"data-slot": "tooltip",
		...e
	});
}
var Fn = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(k.Trigger, {
		ref: t,
		"data-slot": "tooltip-trigger",
		...e
	});
});
Fn.displayName = "TooltipTrigger";
var In = n.forwardRef(function({ className: e, sideOffset: t = 6, children: n, ...r }, i) {
	return /* @__PURE__ */ j(k.Portal, { children: /* @__PURE__ */ j(k.Content, {
		ref: i,
		"data-slot": "tooltip-content",
		sideOffset: t,
		className: J("z-50 overflow-hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0", e),
		...r,
		children: n
	}) });
});
In.displayName = "TooltipContent";
//#endregion
//#region src/atoms/Button/Button.tsx
var Ln = ee("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:not-aria-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
			outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
			ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-8 gap-1.5 px-2.5 pointer-coarse:min-h-11 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			icon: "size-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11",
			"icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] pointer-coarse:min-h-11 pointer-coarse:min-w-11 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] pointer-coarse:min-h-11 pointer-coarse:min-w-11 in-data-[slot=button-group]:rounded-lg",
			"icon-lg": "size-9 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
}), Rn = /* @__PURE__ */ new Set([
	"icon",
	"icon-xs",
	"icon-sm",
	"icon-lg"
]);
function zn(e) {
	e.preventDefault();
}
function Bn(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) n === "disabled" || /^on[A-Z]/.test(n) || (t[n] = r);
	return {
		...t,
		"aria-disabled": !0,
		onClick: zn
	};
}
var Z = n.forwardRef(function({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, tooltip: i, tooltipSide: a = "top", "aria-label": o, ...s }, c) {
	let l = r ? E.Root : "button", u = Rn.has(n ?? "default"), d = i ?? (u ? o : void 0), f = o ?? (u && typeof i == "string" ? i : void 0), p = d != null && d !== "", m = p && s.disabled === !0 ? Bn(s) : s, h = /* @__PURE__ */ j(l, {
		ref: c,
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		"aria-label": f,
		className: J(Ln({
			variant: t,
			size: n,
			className: e
		})),
		...m
	});
	return p ? /* @__PURE__ */ j(Nn, { children: /* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
		asChild: !0,
		children: h
	}), /* @__PURE__ */ j(In, {
		side: a,
		children: d
	})] }) }) : h;
});
Z.displayName = "Button";
//#endregion
//#region src/atoms/Checkbox/Checkbox.tsx
var Vn = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(g.Root, {
		ref: n,
		"data-slot": "checkbox",
		className: J("peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background text-primary shadow-sm transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", e),
		...t,
		children: /* @__PURE__ */ j(g.Indicator, {
			"data-slot": "checkbox-indicator",
			className: J("flex items-center justify-center text-current"),
			children: /* @__PURE__ */ j(L, {
				className: "h-3 w-3",
				"aria-hidden": "true"
			})
		})
	});
});
Vn.displayName = "Checkbox";
//#endregion
//#region src/atoms/Chip/Chip.tsx
var Hn = (e) => J("inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 text-sm transition-colors", e ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground");
function Un(e) {
	if (e.multi) {
		let { id: t, checked: n, onChange: r, ariaLabel: i, children: a, className: o } = e;
		return /* @__PURE__ */ M("label", {
			htmlFor: t,
			"data-state": n ? "on" : "off",
			className: J(Hn(n), "cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1", o),
			children: [
				/* @__PURE__ */ j("input", {
					id: t,
					type: "checkbox",
					className: "sr-only",
					checked: n,
					onChange: (e) => r(e.target.checked),
					"aria-label": i
				}),
				n && /* @__PURE__ */ j(L, {
					className: "size-3.5 shrink-0",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ j("span", { children: a })
			]
		});
	}
	let { selected: t = !1, children: n, className: r, ...i } = e;
	return /* @__PURE__ */ M("button", {
		type: "button",
		"data-chip": "",
		"data-state": t ? "on" : "off",
		"aria-pressed": t,
		className: J(Hn(t), "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none", r),
		...i,
		children: [t && /* @__PURE__ */ j(L, {
			className: "size-3.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ j("span", { children: n })]
	});
}
function Wn({ children: e, ariaLabel: t, className: r, ...i }) {
	let a = n.useRef(null), [o, s] = n.useState(0), c = n.useCallback(() => Array.from(a.current?.querySelectorAll("[data-chip]") ?? []), []);
	n.useEffect(() => {
		c().forEach((e, t) => {
			e.tabIndex = t === o ? 0 : -1;
		});
	});
	function l(e) {
		let t = c();
		if (t.length === 0) return;
		let n = o;
		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				n = Math.min(t.length - 1, o + 1);
				break;
			case "ArrowLeft":
			case "ArrowUp":
				n = Math.max(0, o - 1);
				break;
			case "Home":
				n = 0;
				break;
			case "End":
				n = t.length - 1;
				break;
			default: return;
		}
		e.preventDefault(), s(n), t[n]?.focus();
	}
	function u(e) {
		let t = e.target, n = c().findIndex((e) => e === t);
		n >= 0 && s(n);
	}
	return /* @__PURE__ */ j("div", {
		ref: a,
		role: "group",
		"aria-label": t,
		onKeyDown: l,
		onFocus: u,
		className: J("flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", r),
		...i,
		children: e
	});
}
//#endregion
//#region src/atoms/CopyLinkButton/CopyLinkButton.tsx
function Gn({ url: e, label: t, copiedLabel: r, size: i = "icon", hint: a }) {
	let [o, s] = n.useState(!1), c = n.useRef(null);
	n.useEffect(() => () => {
		c.current !== null && window.clearTimeout(c.current);
	}, []);
	let l = n.useCallback(() => {
		navigator.clipboard?.writeText && navigator.clipboard.writeText(e).then(() => {
			s(!0), c.current !== null && window.clearTimeout(c.current), c.current = window.setTimeout(() => s(!1), 2e3);
		}, () => {});
	}, [e]);
	return /* @__PURE__ */ M(Nn, { children: [
		/* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
			asChild: !0,
			children: /* @__PURE__ */ M(Z, {
				type: "button",
				variant: "ghost",
				size: i,
				onClick: l,
				"aria-label": o ? r : t,
				children: [o ? /* @__PURE__ */ j(L, {
					className: "size-4 text-success",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ j(U, {
					className: "size-4",
					"aria-hidden": "true"
				}), i === "sm" ? /* @__PURE__ */ j("span", { children: o ? r : t }) : null]
			})
		}), /* @__PURE__ */ j(In, { children: o ? r : t })] }),
		/* @__PURE__ */ j("span", {
			role: "status",
			className: "sr-only",
			children: o ? r : ""
		}),
		a ? /* @__PURE__ */ j("span", {
			className: "sr-only",
			children: a
		}) : null
	] });
}
//#endregion
//#region src/atoms/IconButton/IconButton.tsx
var Kn = a(function({ label: e, icon: t, destructive: n = !1, className: r, type: i = "button", ...a }, o) {
	return /* @__PURE__ */ j(Nn, {
		delayDuration: 200,
		children: /* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
			asChild: !0,
			children: /* @__PURE__ */ j("button", {
				ref: o,
				type: i,
				"aria-label": e,
				className: J("inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:bg-muted hover:text-foreground", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", n && "hover:bg-destructive hover:text-destructive-foreground", r),
				...a,
				children: t
			})
		}), /* @__PURE__ */ j(In, { children: e })] })
	});
}), qn = a(function({ label: e, icon: t, value: n, as: r, className: i, ...a }, o) {
	return /* @__PURE__ */ j(Nn, {
		delayDuration: 200,
		children: /* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
			asChild: !0,
			children: /* @__PURE__ */ j(r, {
				ref: o,
				value: n,
				"aria-label": e,
				className: J("inline-flex min-h-9 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "aria-checked:bg-primary aria-checked:text-primary-foreground aria-checked:shadow-sm", "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm", i),
				...a,
				children: t
			})
		}), /* @__PURE__ */ j(In, { children: e })] })
	});
});
//#endregion
//#region src/lib/initials.ts
function Jn(e) {
	let t = e.trim().split(/\s+/).filter(Boolean), n = t[0];
	if (n === void 0) return "?";
	if (t.length === 1) return n.charAt(0).toUpperCase();
	let r = t[t.length - 1] ?? n;
	return (n.charAt(0) + r.charAt(0)).toUpperCase();
}
//#endregion
//#region src/atoms/InitialsAvatar/InitialsAvatar.tsx
var Yn = {
	sm: "size-9 text-xs",
	md: "size-10 text-sm",
	lg: "size-12 text-base"
};
function Xn(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = (t * 31 + e.charCodeAt(n)) % 360;
	return t;
}
function Zn({ name: e, size: t = "md", colored: n = !1, className: r }) {
	let i = n ? (() => {
		let t = Xn(e);
		return {
			backgroundColor: `hsl(${t} 60% 90%)`,
			color: `hsl(${t} 55% 30%)`
		};
	})() : void 0;
	return /* @__PURE__ */ j("div", {
		"aria-hidden": "true",
		"data-testid": "initials-avatar",
		style: i,
		className: J("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", !n && "bg-muted text-foreground", Yn[t], r),
		children: Jn(e)
	});
}
//#endregion
//#region src/atoms/Input/Input.tsx
var Qn = n.forwardRef(({ className: e, type: t, ...n }, r) => /* @__PURE__ */ j("input", {
	type: t,
	ref: r,
	"data-slot": "input",
	className: J("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-coarse:min-h-11", e),
	...n
}));
Qn.displayName = "Input";
//#endregion
//#region src/atoms/IntegerInput/IntegerInput.tsx
var $n = n.forwardRef(function({ value: e, onValueChange: t, emptyValue: r = 0, onBlur: i, ...a }, o) {
	let [s, c] = n.useState(() => Number.isFinite(e) ? String(e) : "");
	return (s.trim() === "" ? r : Number(s)) !== e && c(Number.isFinite(e) ? String(e) : ""), /* @__PURE__ */ j(Qn, {
		ref: o,
		type: "text",
		inputMode: "numeric",
		value: s,
		onChange: (e) => {
			let n = e.target.value, i = n.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
			i !== n && (e.currentTarget.value = i), c(i), t(i.trim() === "" ? r : Number(i));
		},
		onBlur: (e) => {
			let n = Number(e.currentTarget.value);
			if (e.currentTarget.value.trim() !== "" && Number.isFinite(n)) {
				let e = typeof a.min == "number" ? a.min : -Infinity, r = typeof a.max == "number" ? a.max : Infinity, i = Math.min(r, Math.max(e, n));
				i !== n && (c(String(i)), t(i));
			}
			i?.(e);
		},
		...a
	});
}), er = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(x.Root, {
		ref: n,
		"data-slot": "label",
		className: J("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
});
er.displayName = "Label";
//#endregion
//#region src/atoms/PasswordInput/PasswordInput.tsx
var tr = a(function({ className: e, labels: t, ...n }, r) {
	let [i, a] = p(!1);
	return /* @__PURE__ */ M("div", {
		className: "relative",
		children: [/* @__PURE__ */ j(Qn, {
			ref: r,
			type: i ? "text" : "password",
			className: J("pr-10", e),
			...n
		}), /* @__PURE__ */ j(Kn, {
			label: i ? t.hide : t.show,
			"aria-pressed": i,
			onClick: () => a((e) => !e),
			icon: j(i ? de : ue, {
				className: "size-4",
				"aria-hidden": "true"
			}),
			className: "absolute inset-y-0 right-0 my-auto mr-1 h-7 w-7"
		})]
	});
}), nr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(C.Root, {
		ref: n,
		"data-slot": "radio-group",
		className: J("grid gap-2", e),
		...t
	});
});
nr.displayName = "RadioGroup";
var rr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(C.Item, {
		ref: n,
		"data-slot": "radio-group-item",
		className: J("aspect-square size-4 rounded-full border border-input text-primary shadow-sm", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", e),
		...t,
		children: /* @__PURE__ */ j(C.Indicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ j("span", { className: "size-2 rounded-full bg-primary" })
		})
	});
});
rr.displayName = "RadioGroupItem";
//#endregion
//#region src/atoms/Separator/Separator.tsx
var ir = n.forwardRef(function({ className: e, orientation: t = "horizontal", decorative: n = !0, ...r }, i) {
	return /* @__PURE__ */ j(T.Root, {
		ref: i,
		"data-slot": "separator",
		decorative: n,
		orientation: t,
		className: J("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", e),
		...r
	});
});
ir.displayName = "Separator";
//#endregion
//#region src/atoms/Switch/Switch.tsx
var ar = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(D.Root, {
		ref: n,
		"data-slot": "switch",
		className: J("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted", e),
		...t,
		children: /* @__PURE__ */ j(D.Thumb, { className: J("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-transform", "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
	});
});
ar.displayName = "Switch";
//#endregion
//#region src/atoms/Textarea/Textarea.tsx
var or = n.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ j("textarea", {
	ref: n,
	"data-slot": "textarea",
	className: J("flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", e),
	...t
}));
or.displayName = "Textarea";
//#endregion
//#region src/molecules/Alert/Alert.tsx
var sr = ee("group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current"
	} },
	defaultVariants: { variant: "default" }
});
function cr({ className: e, variant: t, ...n }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "alert",
		role: "alert",
		className: J(sr({ variant: t }), e),
		...n
	});
}
function lr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "alert-title",
		className: J("font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", e),
		...t
	});
}
function ur({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "alert-description",
		className: J("text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", e),
		...t
	});
}
function dr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "alert-action",
		className: J("absolute top-2 right-2", e),
		...t
	});
}
//#endregion
//#region src/molecules/AlertDialog/AlertDialog.tsx
function fr({ ...e }) {
	return /* @__PURE__ */ j(m.Root, {
		"data-slot": "alert-dialog",
		...e
	});
}
var pr = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(m.Trigger, {
		ref: t,
		"data-slot": "alert-dialog-trigger",
		...e
	});
});
pr.displayName = "AlertDialogTrigger";
function mr({ ...e }) {
	return /* @__PURE__ */ j(m.Portal, {
		"data-slot": "alert-dialog-portal",
		...e
	});
}
var hr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(m.Overlay, {
		ref: n,
		"data-slot": "alert-dialog-overlay",
		className: J("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
hr.displayName = "AlertDialogOverlay";
var gr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ M(mr, { children: [/* @__PURE__ */ j(hr, {}), /* @__PURE__ */ j(m.Content, {
		ref: n,
		"data-slot": "alert-dialog-content",
		className: J("fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	})] });
});
gr.displayName = "AlertDialogContent";
var _r = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j("div", {
		ref: n,
		"data-slot": "alert-dialog-header",
		className: J("flex flex-col gap-2 text-left", e),
		...t
	});
});
_r.displayName = "AlertDialogHeader";
var vr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j("div", {
		ref: n,
		"data-slot": "alert-dialog-footer",
		className: J("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
});
vr.displayName = "AlertDialogFooter";
var yr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(m.Title, {
		ref: n,
		"data-slot": "alert-dialog-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
});
yr.displayName = "AlertDialogTitle";
var br = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(m.Description, {
		ref: n,
		"data-slot": "alert-dialog-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
});
br.displayName = "AlertDialogDescription";
var xr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(m.Action, {
		ref: n,
		"data-slot": "alert-dialog-action",
		className: J("inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
xr.displayName = "AlertDialogAction";
var Sr = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(m.Cancel, {
		ref: n,
		"data-slot": "alert-dialog-cancel",
		className: J("inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
Sr.displayName = "AlertDialogCancel";
//#endregion
//#region src/molecules/Dialog/Dialog.tsx
function Cr({ ...e }) {
	return /* @__PURE__ */ j(y.Root, {
		"data-slot": "dialog",
		...e
	});
}
function wr({ ...e }) {
	return /* @__PURE__ */ j(y.Trigger, {
		"data-slot": "dialog-trigger",
		...e
	});
}
function Tr({ ...e }) {
	return /* @__PURE__ */ j(y.Portal, {
		"data-slot": "dialog-portal",
		...e
	});
}
var Er = n.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ j(y.Overlay, {
	ref: n,
	"data-slot": "dialog-overlay",
	className: J("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
	...t
}));
Er.displayName = y.Overlay.displayName;
var Dr = n.forwardRef(({ className: e, children: t, closeLabel: n, ...r }, i) => /* @__PURE__ */ M(Tr, { children: [/* @__PURE__ */ j(Er, {}), /* @__PURE__ */ M(y.Content, {
	ref: i,
	"data-slot": "dialog-content",
	className: J("fixed top-4 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 translate-y-0 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-[var(--motion-duration,200ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:top-1/2 sm:-translate-y-1/2", e),
	...r,
	children: [t, /* @__PURE__ */ j(y.Close, {
		"aria-label": n,
		className: "absolute top-3 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
		children: /* @__PURE__ */ j(K, {
			className: "h-4 w-4",
			"aria-hidden": "true"
		})
	})]
})] }));
Dr.displayName = y.Content.displayName;
function Or({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "dialog-header",
		className: J("flex flex-col gap-2 text-left", e),
		...t
	});
}
function kr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "dialog-footer",
		className: J("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
}
function Ar({ className: e, ...t }) {
	return /* @__PURE__ */ j(y.Title, {
		"data-slot": "dialog-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
}
function jr({ className: e, ...t }) {
	return /* @__PURE__ */ j(y.Description, {
		"data-slot": "dialog-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
}
function Mr({ ...e }) {
	return /* @__PURE__ */ j(y.Close, {
		"data-slot": "dialog-close",
		...e
	});
}
//#endregion
//#region src/molecules/ImageAdjustDialog/ImageAdjustDialog.tsx
var Nr = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]), Pr = 64;
function Fr({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	return /* @__PURE__ */ j(Cr, {
		open: e !== null,
		onOpenChange: (e) => {
			e || r();
		},
		children: /* @__PURE__ */ M(Dr, {
			className: "max-w-2xl",
			closeLabel: i.close,
			children: [/* @__PURE__ */ M(Or, { children: [/* @__PURE__ */ j(Ar, { children: i.title }), /* @__PURE__ */ j(jr, { children: i.description(t) })] }), e !== null && /* @__PURE__ */ j(Ir, {
				file: e,
				maxDimension: t,
				onApply: n,
				onCancel: r,
				labels: i
			}, `${e.name}:${e.size}:${e.lastModified}`)]
		})
	});
}
function Ir({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	let [a, o] = p(null), [s, l] = p(null), [u, m] = p(String(t)), [h, g] = p(.9), [_, v] = p(!1), [y, b] = p(null), x = f(null), S = Nr.has(e.type), C = Number.parseInt(u, 10), w = Number.isFinite(C) && C > 0 ? Math.min(t, Math.max(Pr, C)) : t;
	c(() => {
		if (typeof URL.createObjectURL != "function") return;
		let t = URL.createObjectURL(e);
		return o(t), () => URL.revokeObjectURL(t);
	}, [e]);
	let T = d(() => {
		if (s === null) return null;
		let e = Math.max(s.w, s.h);
		if (e <= w) return {
			w: s.w,
			h: s.h
		};
		let t = w / e;
		return {
			w: Math.round(s.w * t),
			h: Math.round(s.h * t)
		};
	}, [s, w]), E = async () => {
		if (x.current !== null && T !== null) {
			v(!0), b(null);
			try {
				let t = document.createElement("canvas");
				t.width = T.w, t.height = T.h;
				let r = t.getContext("2d");
				if (r === null) throw Error("canvas-2d-unsupported");
				r.drawImage(x.current, 0, 0, T.w, T.h);
				let i = await new Promise((n) => t.toBlob(n, e.type, e.type === "image/png" ? void 0 : h));
				if (i === null) throw Error("canvas-to-blob-empty");
				n(new File([i], e.name, {
					type: e.type,
					lastModified: Date.now()
				}));
			} catch (e) {
				b(i.error(e instanceof Error ? e.message : "unknown"));
			} finally {
				v(!1);
			}
		}
	};
	return /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ M("div", {
		className: "space-y-4",
		children: [
			a !== null && /* @__PURE__ */ j("div", {
				className: "flex justify-center rounded-md border border-border bg-muted/30 p-2",
				children: /* @__PURE__ */ j("img", {
					ref: x,
					src: a,
					alt: i.previewAlt,
					onLoad: (e) => l({
						w: e.currentTarget.naturalWidth,
						h: e.currentTarget.naturalHeight
					}),
					className: "max-h-64 w-auto object-contain"
				})
			}),
			s !== null && /* @__PURE__ */ M("p", {
				className: "text-xs text-muted-foreground",
				"data-testid": "image-adjust-dims",
				children: [i.currentDimensions(s.w, s.h), T !== null && /* @__PURE__ */ M(A, { children: [" → ", /* @__PURE__ */ j("span", {
					className: "font-medium text-foreground",
					children: i.targetDimensions(T.w, T.h)
				})] })]
			}),
			S ? /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ M("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ j(er, {
					htmlFor: "image-adjust-max",
					children: i.maxDimensionLabel
				}), /* @__PURE__ */ j(Qn, {
					id: "image-adjust-max",
					type: "number",
					min: Pr,
					max: t,
					step: 64,
					value: u,
					onChange: (e) => m(e.target.value),
					onBlur: () => m(String(w))
				})]
			}), e.type !== "image/png" && /* @__PURE__ */ M("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ j(er, {
					htmlFor: "image-adjust-quality",
					children: i.qualityLabel(Math.round(h * 100))
				}), /* @__PURE__ */ j("input", {
					id: "image-adjust-quality",
					type: "range",
					min: .5,
					max: 1,
					step: .05,
					value: h,
					onChange: (e) => g(Number.parseFloat(e.target.value)),
					className: "w-full accent-primary"
				})]
			})] }) : /* @__PURE__ */ j("p", {
				className: "text-xs text-muted-foreground",
				children: i.notScalable(e.type)
			}),
			y !== null && /* @__PURE__ */ j("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: y
			})
		]
	}), /* @__PURE__ */ M(kr, { children: [/* @__PURE__ */ j(Z, {
		type: "button",
		variant: "outline",
		onClick: r,
		children: i.cancel
	}), /* @__PURE__ */ j(Z, {
		type: "button",
		onClick: () => {
			E();
		},
		disabled: _ || !S || T === null,
		tooltip: S ? void 0 : i.notScalable(e.type),
		children: i.apply
	})] })] });
}
//#endregion
//#region src/molecules/AttachmentDropzone/AttachmentDropzone.tsx
var Lr = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]);
function Rr(e) {
	return !Lr.has(e.type) || typeof URL.createObjectURL != "function" ? Promise.resolve(null) : new Promise((t) => {
		let n = URL.createObjectURL(e), r = new Image(), i = !1, a = (e) => {
			i || (i = !0, clearTimeout(o), URL.revokeObjectURL(n), t(e));
		}, o = setTimeout(() => a(null), 800);
		r.onload = () => a({
			w: r.naturalWidth,
			h: r.naturalHeight
		}), r.onerror = () => a(null), r.src = n;
	});
}
function zr(e) {
	let { labels: t, mimes: n, maxSizeMb: r, ariaLabel: i, inputId: a, ariaDescribedBy: o, required: s, disabled: c, externalError: l, imageAdjust: u } = e, d = f(null), [m, h] = p(null), [g, _] = p(null), [v, y] = p(null), [b, x] = p(null), S = (e) => {
		switch (mt(e, {
			mimes: n,
			maxSizeMb: r
		})) {
			case "too_large": return t.errorTooLarge(e.name, r);
			case "wrong_type": return t.errorType(e.name, e.type || t.typeUnknown);
			default: return null;
		}
	}, C = async (n) => {
		if (e.onSelect) {
			y(n.name), e.onSelect(n);
			return;
		}
		if (e.onUpload) {
			_(n.name);
			try {
				await e.onUpload(n);
			} catch {
				h(t.uploadFailed(n.name));
			} finally {
				_(null);
			}
		}
	}, w = async (e) => {
		let t = S(e);
		if (t !== null) {
			h(t);
			return;
		}
		if (h(null), u) {
			let t = await Rr(e);
			if (t !== null && Math.max(t.w, t.h) > u.maxDimension) {
				x(e);
				return;
			}
		}
		await C(e);
	}, T = e.onSelect ? e.selectedFileName === void 0 ? v : e.selectedFileName : null;
	return /* @__PURE__ */ M("div", { children: [
		/* @__PURE__ */ M("label", {
			className: J("flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring", c ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				if (e.preventDefault(), c) return;
				let t = e.dataTransfer.files[0];
				t && w(t);
			},
			children: [
				/* @__PURE__ */ j("span", {
					className: "font-medium text-foreground",
					children: t.label
				}),
				/* @__PURE__ */ j("span", {
					className: "text-xs",
					children: t.hint(r, n)
				}),
				/* @__PURE__ */ j("input", {
					ref: d,
					id: a,
					type: "file",
					className: "sr-only",
					"aria-label": i ?? t.label,
					"aria-describedby": o,
					"aria-invalid": l ? !0 : void 0,
					required: s,
					disabled: c,
					onChange: (e) => {
						let t = e.target.files?.[0];
						e.target.value = "", t && w(t);
					}
				})
			]
		}),
		g !== null && /* @__PURE__ */ j("p", {
			className: "mt-2 text-sm text-muted-foreground",
			"data-testid": "attachment-uploading",
			children: t.uploading(g)
		}),
		T && g === null && /* @__PURE__ */ j("p", {
			className: "mt-2 text-sm text-foreground",
			"data-testid": "attachment-selected",
			children: t.selected(T)
		}),
		m !== null && /* @__PURE__ */ j("p", {
			role: "alert",
			className: "mt-2 text-sm text-destructive",
			"data-testid": "attachment-error",
			children: m
		}),
		l && m === null && /* @__PURE__ */ j("p", {
			id: o,
			role: "alert",
			className: "mt-2 text-sm text-destructive",
			"data-testid": "attachment-external-error",
			children: l
		}),
		u && /* @__PURE__ */ j(Fr, {
			file: b,
			maxDimension: u.maxDimension,
			labels: u.labels,
			onApply: (e) => {
				x(null), C(e);
			},
			onCancel: () => x(null)
		})
	] });
}
//#endregion
//#region src/molecules/AttachmentList/AttachmentList.tsx
var Br = {
	pending: "muted",
	clean: "success",
	infected: "destructive",
	error: "destructive"
};
function Vr({ items: e, labels: t, onDelete: n, formatSize: r = ft, className: i }) {
	return e.length === 0 ? /* @__PURE__ */ j("p", {
		className: J("rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground", i),
		children: t.empty
	}) : /* @__PURE__ */ j("ul", {
		className: J("divide-y divide-border rounded-md border border-border bg-card text-card-foreground", i),
		children: e.map((e) => {
			let i = e.scanStatus, a = i === void 0 || i === "clean";
			return /* @__PURE__ */ M("li", {
				className: "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4",
				children: [/* @__PURE__ */ M("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ j("p", {
						className: "truncate text-sm font-medium text-foreground",
						children: e.name
					}), /* @__PURE__ */ M("p", {
						className: "truncate text-xs text-muted-foreground",
						children: [
							r(e.sizeBytes),
							" · ",
							e.mime
						]
					})]
				}), /* @__PURE__ */ M("div", {
					className: "flex shrink-0 flex-wrap items-center gap-2 sm:gap-3",
					children: [
						i !== void 0 && t.scan ? /* @__PURE__ */ j(Mn, {
							tone: Br[i],
							className: "shrink-0",
							"data-testid": `attachment-status-${i}`,
							children: t.scan[i]
						}) : null,
						a ? /* @__PURE__ */ j("a", {
							href: e.downloadUrl,
							"aria-label": t.download(e.name),
							className: "shrink-0 rounded-md px-2 py-1 text-sm font-medium text-foreground underline underline-offset-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
							children: t.downloadShort
						}) : null,
						e.canDelete && n ? /* @__PURE__ */ j(Kn, {
							label: t.remove(e.name),
							icon: /* @__PURE__ */ j(K, {
								className: "size-4",
								"aria-hidden": "true"
							}),
							destructive: !0,
							className: "shrink-0",
							onClick: () => n(e.id)
						}) : null
					]
				})]
			}, e.id);
		})
	});
}
//#endregion
//#region src/molecules/Breadcrumb/Breadcrumb.tsx
function Hr({ ...e }) {
	return /* @__PURE__ */ j("nav", {
		"data-slot": "breadcrumb",
		...e
	});
}
function Ur({ className: e, ...t }) {
	return /* @__PURE__ */ j("ol", {
		"data-slot": "breadcrumb-list",
		className: J("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5", e),
		...t
	});
}
function Wr({ className: e, ...t }) {
	return /* @__PURE__ */ j("li", {
		"data-slot": "breadcrumb-item",
		className: J("inline-flex items-center gap-1.5", e),
		...t
	});
}
function Gr({ className: e, asChild: t, children: r, ...i }) {
	if (t) {
		let t = n.Children.only(r);
		return n.cloneElement(t, { className: J("rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", t.props.className, e) });
	}
	return /* @__PURE__ */ j("a", {
		"data-slot": "breadcrumb-link",
		className: J("rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", e),
		...i,
		children: r
	});
}
function Kr({ className: e, ...t }) {
	return /* @__PURE__ */ j("span", {
		"data-slot": "breadcrumb-page",
		"aria-current": "page",
		className: J("font-medium text-foreground", e),
		...t
	});
}
function qr({ children: e, className: t, ...n }) {
	return /* @__PURE__ */ j("li", {
		"data-slot": "breadcrumb-separator",
		role: "presentation",
		"aria-hidden": "true",
		className: J("[&>svg]:size-3.5", t),
		...n,
		children: e ?? /* @__PURE__ */ j(B, {})
	});
}
function Jr({ className: e, srLabel: t, ...n }) {
	return /* @__PURE__ */ M("span", {
		"data-slot": "breadcrumb-ellipsis",
		role: "presentation",
		className: J("flex h-9 w-9 items-center justify-center", e),
		...n,
		children: [/* @__PURE__ */ j(Ce, {
			"aria-hidden": "true",
			className: "size-4"
		}), /* @__PURE__ */ j("span", {
			className: "sr-only",
			children: t
		})]
	});
}
//#endregion
//#region src/molecules/Card/Card.tsx
function Yr({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card",
		"data-size": t,
		className: J("group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", e),
		...n
	});
}
function Xr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-header",
		className: J("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3", e),
		...t
	});
}
function Zr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-title",
		className: J("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", e),
		...t
	});
}
function Qr({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
}
function $r({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-action",
		className: J("col-start-2 row-span-2 row-start-1 self-start justify-self-end", e),
		...t
	});
}
function ei({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-content",
		className: J("px-4 group-data-[size=sm]/card:px-3", e),
		...t
	});
}
function ti({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "card-footer",
		className: J("flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3", e),
		...t
	});
}
//#endregion
//#region src/molecules/Collapsible/Collapsible.tsx
var ni = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(_.Root, {
		ref: t,
		"data-slot": "collapsible",
		...e
	});
});
ni.displayName = "Collapsible";
var ri = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(_.CollapsibleTrigger, {
		ref: t,
		"data-slot": "collapsible-trigger",
		...e
	});
});
ri.displayName = "CollapsibleTrigger";
var ii = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(_.CollapsibleContent, {
		ref: t,
		"data-slot": "collapsible-content",
		...e
	});
});
ii.displayName = "CollapsibleContent";
//#endregion
//#region src/lib/color.ts
function ai(e) {
	return e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4;
}
function oi(e) {
	return e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
}
function si(e) {
	return Math.max(0, Math.min(1, e));
}
function ci(e) {
	let t = e.trim().match(/^#?([0-9a-f]{6})$/i);
	if (!t || !t[1]) return null;
	let n = parseInt(t[1], 16);
	return {
		r: (n >> 16 & 255) / 255,
		g: (n >> 8 & 255) / 255,
		b: (n & 255) / 255
	};
}
function li(e, t, n) {
	let r = (e) => Math.round(si(e) * 255).toString(16).padStart(2, "0");
	return `#${r(e)}${r(t)}${r(n)}`;
}
function ui(e) {
	let t = e.trim().match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?)\s*(?:\/\s*[0-9.]+%?\s*)?\)$/i);
	if (!t || !t[1] || !t[2] || !t[3]) return null;
	let n = t[1], r = t[2], i = t[3], a = n.endsWith("%") ? Number(n.slice(0, -1)) / 100 : Number(n), o = r.endsWith("%") ? Number(r.slice(0, -1)) / 100 * .4 : Number(r), s = Number(i.replace(/deg$/i, ""));
	return !Number.isFinite(a) || !Number.isFinite(o) || !Number.isFinite(s) ? null : {
		L: a,
		C: o,
		H: s
	};
}
function di(e, t, n) {
	let r = e + .3963377774 * t + .2158037573 * n, i = e - .1055613458 * t - .0638541728 * n, a = e - .0894841775 * t - 1.291485548 * n, o = r ** 3, s = i ** 3, c = a ** 3;
	return {
		r: 4.0767416621 * o - 3.3077115913 * s + .2309699292 * c,
		g: -1.2684380046 * o + 2.6097574011 * s - .3413193965 * c,
		bl: -.0041960863 * o - .7034186147 * s + 1.707614701 * c
	};
}
function fi(e, t, n) {
	let r = .4122214708 * e + .5363325363 * t + .0514459929 * n, i = .2119034982 * e + .6806995451 * t + .1073969566 * n, a = .0883024619 * e + .2817188376 * t + .6299787005 * n, o = Math.cbrt(r), s = Math.cbrt(i), c = Math.cbrt(a);
	return {
		L: .2104542553 * o + .793617785 * s - .0040720468 * c,
		a: 1.9779984951 * o - 2.428592205 * s + .4505937099 * c,
		b: .0259040371 * o + .7827717662 * s - .808675766 * c
	};
}
function pi(e) {
	let t = ui(e);
	if (!t) return null;
	let n = t.H * Math.PI / 180, r = t.C * Math.cos(n), i = t.C * Math.sin(n), a = di(t.L, r, i);
	return li(oi(si(a.r)), oi(si(a.g)), oi(si(a.bl)));
}
function mi(e) {
	let t = ci(e);
	if (!t) return "oklch(0 0 0)";
	let n = fi(ai(t.r), ai(t.g), ai(t.b)), r = Math.hypot(n.a, n.b), i = Math.atan2(n.b, n.a) * 180 / Math.PI;
	i < 0 && (i += 360);
	let a = (e, t = 3) => Number(e.toFixed(t));
	return `oklch(${a(n.L)} ${a(r)} ${a(i, 2)})`;
}
//#endregion
//#region src/molecules/ColorPicker/ColorPicker.tsx
function hi({ id: e, value: t, onChange: n, swatchAriaLabel: r, ariaInvalid: i, className: a }) {
	let o = pi(t) ?? "#000000";
	return /* @__PURE__ */ M("div", {
		className: J("flex items-stretch gap-2", a),
		children: [/* @__PURE__ */ j("input", {
			type: "color",
			value: o,
			onChange: (e) => {
				n(mi(e.target.value));
			},
			"aria-label": r,
			className: "h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		}), /* @__PURE__ */ j("input", {
			id: e,
			type: "text",
			value: t,
			onChange: (e) => n(e.target.value),
			spellCheck: !1,
			"aria-invalid": i || void 0,
			className: "block w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none"
		})]
	});
}
//#endregion
//#region src/molecules/CompletionChecklist/CompletionChecklist.tsx
function gi({ items: e, onItemClick: t, labels: n, className: r }) {
	let i = l(), a = e.filter((e) => e.done).length, o = e.every((e) => e.done || e.optional);
	return /* @__PURE__ */ M("section", {
		"aria-labelledby": i,
		className: J("flex flex-col gap-2", r),
		children: [
			/* @__PURE__ */ j("h2", {
				id: i,
				className: "text-xs font-medium text-muted-foreground",
				children: n.heading
			}),
			/* @__PURE__ */ M("div", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ M("span", {
					className: "text-2xl font-semibold tabular-nums",
					children: [
						a,
						" / ",
						e.length
					]
				}), /* @__PURE__ */ j("span", {
					className: "text-xs text-muted-foreground",
					children: o ? n.complete : n.incomplete
				})]
			}),
			/* @__PURE__ */ j("div", {
				role: "progressbar",
				"aria-labelledby": i,
				"aria-valuemin": 0,
				"aria-valuemax": e.length,
				"aria-valuenow": a,
				className: "h-1.5 overflow-hidden rounded-full bg-muted",
				children: /* @__PURE__ */ j("div", {
					className: "h-full rounded-full bg-success transition-[width] duration-300 motion-reduce:transition-none",
					style: { width: `${e.length ? a / e.length * 100 : 0}%` }
				})
			}),
			/* @__PURE__ */ j("ul", {
				className: "mt-1 flex flex-col gap-0.5 text-sm",
				children: e.map((e) => {
					let r = /* @__PURE__ */ M(A, { children: [
						e.done ? /* @__PURE__ */ j(L, {
							className: "size-4 shrink-0 text-success",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ j(H, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ j("span", {
							className: J("truncate", !e.done && "text-muted-foreground"),
							children: e.label
						}),
						/* @__PURE__ */ j("span", {
							className: "sr-only",
							children: e.done ? n.done : n.missing
						}),
						e.optional && /* @__PURE__ */ j("span", {
							className: "ms-auto text-xs text-muted-foreground",
							children: n.optional
						})
					] });
					return /* @__PURE__ */ j("li", { children: t ? /* @__PURE__ */ j("button", {
						type: "button",
						onClick: () => t(e.id),
						className: "flex w-full items-center gap-2 rounded-md px-1 py-1 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
						children: r
					}) : /* @__PURE__ */ j("div", {
						className: "flex items-center gap-2 px-1 py-1",
						children: r
					}) }, e.id);
				})
			})
		]
	});
}
//#endregion
//#region src/molecules/Combobox/Combobox.tsx
function _i({ id: e, value: t, options: n, onChange: r, placeholder: i, searchPlaceholder: a, emptyLabel: o, ariaInvalid: s, ariaDescribedby: c }) {
	let [l, u] = p(""), f = d(() => {
		let e = l.trim().toLowerCase();
		return e === "" ? n : n.filter((t) => t.toLowerCase().includes(e));
	}, [l, n]);
	return /* @__PURE__ */ j(He, {
		value: t,
		onChange: (e) => {
			e !== null && r(e);
		},
		immediate: !0,
		children: /* @__PURE__ */ M("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ j(We, {
					id: e,
					"aria-invalid": s ? !0 : void 0,
					"aria-describedby": c,
					displayValue: (e) => e,
					onChange: (e) => u(e.target.value),
					placeholder: i ?? a,
					className: J("block w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none", "aria-[invalid=true]:border-destructive")
				}),
				/* @__PURE__ */ j(Ue, {
					className: "absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground focus:outline-none focus-visible:text-foreground",
					"aria-label": a ?? i ?? o,
					children: /* @__PURE__ */ j(oe, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ j(Ke, {
					className: "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-sm shadow-md focus:outline-none",
					transition: !0,
					children: f.length === 0 ? /* @__PURE__ */ j("div", {
						className: "px-3 py-2 text-muted-foreground",
						children: o
					}) : f.map((e) => /* @__PURE__ */ M(Ge, {
						value: e,
						className: "group flex cursor-pointer items-center gap-2 px-3 py-2 text-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground",
						children: [/* @__PURE__ */ j(L, {
							className: "h-4 w-4 opacity-0 group-data-[selected]:opacity-100",
							"aria-hidden": "true"
						}), /* @__PURE__ */ j("span", { children: e })]
					}, e))
				})
			]
		})
	});
}
//#endregion
//#region src/molecules/Command/Command.tsx
function vi({ className: e, ...t }) {
	return /* @__PURE__ */ j(q, {
		"data-slot": "command",
		className: J("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", e),
		...t
	});
}
function yi({ title: e, description: t, closeLabel: n, children: r, className: i, shouldFilter: a, ...o }) {
	return /* @__PURE__ */ j(Cr, {
		...o,
		children: /* @__PURE__ */ M(Dr, {
			closeLabel: n,
			className: J("overflow-hidden p-0", i),
			children: [/* @__PURE__ */ M(Or, {
				className: "sr-only",
				children: [/* @__PURE__ */ j(Ar, { children: e }), /* @__PURE__ */ j(jr, { children: t })]
			}), /* @__PURE__ */ j(vi, {
				shouldFilter: a,
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children: r
			})]
		})
	});
}
function bi({ className: e, ...t }) {
	return /* @__PURE__ */ M("div", {
		"data-slot": "command-input-wrapper",
		className: "flex items-center gap-2 border-b border-border px-3",
		children: [/* @__PURE__ */ j(Ne, {
			className: "size-4 shrink-0 opacity-50",
			"aria-hidden": "true"
		}), /* @__PURE__ */ j(q.Input, {
			"data-slot": "command-input",
			className: J("flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", e),
			...t
		})]
	});
}
function xi({ className: e, ...t }) {
	return /* @__PURE__ */ j(q.List, {
		"data-slot": "command-list",
		className: J("max-h-[300px] overflow-x-hidden overflow-y-auto", e),
		...t
	});
}
function Si({ ...e }) {
	return /* @__PURE__ */ j(q.Empty, {
		"data-slot": "command-empty",
		className: "py-6 text-center text-sm",
		...e
	});
}
function Ci({ className: e, ...t }) {
	return /* @__PURE__ */ j(q.Group, {
		"data-slot": "command-group",
		className: J("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", e),
		...t
	});
}
function wi({ className: e, ...t }) {
	return /* @__PURE__ */ j(q.Separator, {
		"data-slot": "command-separator",
		className: J("-mx-1 h-px bg-border", e),
		...t
	});
}
function Ti({ className: e, ...t }) {
	return /* @__PURE__ */ j(q.Item, {
		"data-slot": "command-item",
		className: J("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", e),
		...t
	});
}
//#endregion
//#region src/molecules/ComposerAttachments/ComposerAttachments.tsx
function Ei({ files: e, onChange: t, labels: n, error: r, disabled: i, mimes: a = lt, maxSizeMb: o = 25, maxFiles: s = 5, formatSize: c = ft, className: u }) {
	let d = l(), f = e.length >= s;
	return /* @__PURE__ */ M("div", {
		className: J("space-y-2", u),
		children: [f ? /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("p", {
			className: "text-xs text-muted-foreground",
			children: n.maxReached(s)
		}), r ? /* @__PURE__ */ j("p", {
			role: "alert",
			className: "text-sm text-destructive",
			children: r
		}) : null] }) : /* @__PURE__ */ j(zr, {
			inputId: d,
			labels: n.dropzone,
			mimes: a,
			maxSizeMb: o,
			ariaLabel: n.add,
			disabled: i,
			externalError: r ?? null,
			onSelect: (n) => t([...e, n])
		}), e.length > 0 && /* @__PURE__ */ j("ul", {
			"aria-label": n.stagedHeading,
			className: "space-y-1",
			children: e.map((r, a) => /* @__PURE__ */ M("li", {
				className: "flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm",
				children: [/* @__PURE__ */ M("span", {
					className: "min-w-0 truncate text-foreground",
					children: [
						r.name,
						" ",
						/* @__PURE__ */ M("span", {
							className: "text-muted-foreground",
							children: [
								"(",
								c(r.size),
								")"
							]
						})
					]
				}), /* @__PURE__ */ j(Z, {
					type: "button",
					variant: "ghost",
					size: "sm",
					disabled: i,
					onClick: () => t(e.filter((e, t) => t !== a)),
					"aria-label": n.remove(r.name),
					children: n.removeShort
				})]
			}, `${r.name}-${a}`))
		})]
	});
}
//#endregion
//#region src/molecules/ConfirmActionDialog/ConfirmActionDialog.tsx
function Di({ open: e, onOpenChange: t, title: n, description: r, confirmLabel: i, cancelLabel: a, onConfirm: o, variant: s = "destructive", children: c, closeOnConfirm: l = !0 }) {
	return /* @__PURE__ */ j(fr, {
		open: e,
		onOpenChange: t,
		children: /* @__PURE__ */ M(gr, { children: [
			/* @__PURE__ */ M(_r, { children: [/* @__PURE__ */ j(yr, { children: n }), /* @__PURE__ */ j(br, { children: r })] }),
			c,
			/* @__PURE__ */ M(vr, { children: [/* @__PURE__ */ j(Sr, { children: a }), /* @__PURE__ */ j(xr, {
				onClick: (e) => {
					l || e.preventDefault(), o();
				},
				className: s === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : void 0,
				children: i
			})] })
		] })
	});
}
//#endregion
//#region src/molecules/ContextMenu/ContextMenu.tsx
function Oi({ ...e }) {
	return /* @__PURE__ */ j(v.Root, {
		"data-slot": "context-menu",
		...e
	});
}
var ki = n.forwardRef(function(e, t) {
	return /* @__PURE__ */ j(v.Trigger, {
		ref: t,
		"data-slot": "context-menu-trigger",
		...e
	});
});
ki.displayName = "ContextMenuTrigger";
var Ai = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(v.Portal, { children: /* @__PURE__ */ j(v.Content, {
		ref: n,
		"data-slot": "context-menu-content",
		className: J("z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
Ai.displayName = "ContextMenuContent";
var ji = n.forwardRef(function({ className: e, tone: t = "default", ...n }, r) {
	return /* @__PURE__ */ j(v.Item, {
		ref: r,
		"data-slot": "context-menu-item",
		"data-tone": t,
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground", "data-[highlighted]:bg-muted", "data-[tone=destructive]:data-[highlighted]:bg-destructive data-[tone=destructive]:data-[highlighted]:text-destructive-foreground data-[tone=destructive]:data-[highlighted]:[&_svg]:text-destructive-foreground", "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50", e),
		...n
	});
});
ji.displayName = "ContextMenuItem";
var Mi = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(v.Separator, {
		ref: n,
		"data-slot": "context-menu-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
Mi.displayName = "ContextMenuSeparator";
var Ni = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(v.Label, {
		ref: n,
		"data-slot": "context-menu-label",
		className: J("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
Ni.displayName = "ContextMenuLabel";
function Pi({ className: e, ...t }) {
	return /* @__PURE__ */ j("span", {
		"data-slot": "context-menu-shortcut",
		"aria-hidden": "true",
		className: J("ml-auto pl-4 text-xs text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/molecules/DropdownMenu/DropdownMenu.tsx
function Fi({ ...e }) {
	return /* @__PURE__ */ j(b.Root, {
		"data-slot": "dropdown-menu",
		...e
	});
}
var Ii = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(b.Trigger, {
		ref: t,
		"data-slot": "dropdown-menu-trigger",
		...e
	});
});
Ii.displayName = "DropdownMenuTrigger";
function Li({ ...e }) {
	return /* @__PURE__ */ j(b.Portal, {
		"data-slot": "dropdown-menu-portal",
		...e
	});
}
var Ri = n.forwardRef(function({ className: e, sideOffset: t = 6, container: n, ...r }, i) {
	return /* @__PURE__ */ j(Li, {
		container: n,
		children: /* @__PURE__ */ j(b.Content, {
			ref: i,
			"data-slot": "dropdown-menu-content",
			sideOffset: t,
			className: J("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
			...r
		})
	});
});
Ri.displayName = "DropdownMenuContent";
var Q = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(b.Item, {
		ref: n,
		"data-slot": "dropdown-menu-item",
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...t
	});
});
Q.displayName = "DropdownMenuItem";
var zi = n.forwardRef(function({ className: e, children: t, checked: n, ...r }, i) {
	return /* @__PURE__ */ M(b.CheckboxItem, {
		ref: i,
		"data-slot": "dropdown-menu-checkbox-item",
		checked: n,
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...r,
		children: [/* @__PURE__ */ j("span", {
			className: "absolute left-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ j(b.ItemIndicator, { children: /* @__PURE__ */ j(L, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), t]
	});
});
zi.displayName = "DropdownMenuCheckboxItem";
function Bi({ ...e }) {
	return /* @__PURE__ */ j(b.RadioGroup, {
		"data-slot": "dropdown-menu-radio-group",
		...e
	});
}
var Vi = n.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ M(b.RadioItem, {
		ref: r,
		"data-slot": "dropdown-menu-radio-item",
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...n,
		children: [/* @__PURE__ */ j("span", {
			className: "absolute left-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ j(b.ItemIndicator, { children: /* @__PURE__ */ j(V, {
				className: "size-2 fill-current",
				"aria-hidden": "true"
			}) })
		}), t]
	});
});
Vi.displayName = "DropdownMenuRadioItem";
function Hi({ ...e }) {
	return /* @__PURE__ */ j(b.Sub, {
		"data-slot": "dropdown-menu-sub",
		...e
	});
}
var Ui = n.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ M(b.SubTrigger, {
		ref: r,
		"data-slot": "dropdown-menu-sub-trigger",
		className: J("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none", "focus:bg-muted data-[highlighted]:bg-muted data-[state=open]:bg-muted", e),
		...n,
		children: [t, /* @__PURE__ */ j(B, {
			className: "ml-auto size-4 text-muted-foreground",
			"aria-hidden": "true"
		})]
	});
});
Ui.displayName = "DropdownMenuSubTrigger";
var Wi = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(Li, { children: /* @__PURE__ */ j(b.SubContent, {
		ref: n,
		"data-slot": "dropdown-menu-sub-content",
		className: J("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
Wi.displayName = "DropdownMenuSubContent";
function Gi({ className: e, ...t }) {
	return /* @__PURE__ */ j("span", {
		"data-slot": "dropdown-menu-shortcut",
		"aria-hidden": "true",
		className: J("ml-auto pl-4 text-xs text-muted-foreground", e),
		...t
	});
}
var Ki = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(b.Label, {
		ref: n,
		"data-slot": "dropdown-menu-label",
		className: J("px-2 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase", e),
		...t
	});
});
Ki.displayName = "DropdownMenuLabel";
var $ = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(b.Separator, {
		ref: n,
		"data-slot": "dropdown-menu-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
$.displayName = "DropdownMenuSeparator";
//#endregion
//#region src/molecules/EmptyState/EmptyState.tsx
function qi({ icon: e, title: t, description: n, action: r, className: i }) {
	return /* @__PURE__ */ M("div", {
		className: J("flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center text-card-foreground", i),
		children: [
			/* @__PURE__ */ j("span", {
				"aria-hidden": "true",
				className: "mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
				children: /* @__PURE__ */ j(e, { className: "size-6" })
			}),
			/* @__PURE__ */ j("p", {
				className: "text-base font-medium text-foreground",
				children: t
			}),
			n && /* @__PURE__ */ j("p", {
				className: "mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground",
				children: n
			}),
			r && /* @__PURE__ */ j("div", {
				className: "mt-4",
				children: r
			})
		]
	});
}
//#endregion
//#region src/molecules/Popover/Popover.tsx
function Ji({ ...e }) {
	return /* @__PURE__ */ j(S.Root, {
		"data-slot": "popover",
		...e
	});
}
var Yi = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(S.Trigger, {
		ref: t,
		"data-slot": "popover-trigger",
		...e
	});
});
Yi.displayName = "PopoverTrigger";
var Xi = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(S.Anchor, {
		ref: t,
		"data-slot": "popover-anchor",
		...e
	});
});
Xi.displayName = "PopoverAnchor";
var Zi = n.forwardRef(function({ className: e, align: t = "center", sideOffset: n = 4, ...r }, i) {
	return /* @__PURE__ */ j(S.Portal, { children: /* @__PURE__ */ j(S.Content, {
		ref: i,
		"data-slot": "popover-content",
		align: t,
		sideOffset: n,
		className: J("z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in", e),
		...r
	}) });
});
Zi.displayName = "PopoverContent";
//#endregion
//#region src/molecules/EntitySearchPicker/EntitySearchPicker.tsx
var Qi = 250;
function $i({ onSearch: e, onSelect: t, getKey: r, renderRow: i, triggerLabel: a, placeholder: o, labels: s, disabled: c = !1, id: l, triggerClassName: u, debounceMs: d = Qi }) {
	let [f, p] = n.useState(!1), [m, h] = n.useState(""), [g, _] = n.useState([]), [v, y] = n.useState(!1), [b, x] = n.useState(!1), S = n.useRef(e);
	n.useEffect(() => {
		S.current = e;
	}), n.useEffect(() => {
		if (!f) return;
		let e = new AbortController(), t = window.setTimeout(() => {
			x(!0), S.current(m, e.signal).then((t) => {
				if (e.signal.aborted) return;
				let n = Array.isArray(t) ? {
					items: t,
					hasMore: !1
				} : t;
				_(n.items), y(n.hasMore ?? !1);
			}).catch(() => {
				e.signal.aborted || (_([]), y(!1));
			}).finally(() => {
				e.signal.aborted || x(!1);
			});
		}, d);
		return () => {
			e.abort(), window.clearTimeout(t);
		};
	}, [
		f,
		m,
		d
	]);
	let C = (e) => {
		t(e), p(!1), h("");
	};
	return /* @__PURE__ */ M(Ji, {
		open: f,
		onOpenChange: (e) => {
			p(e), e || h("");
		},
		children: [/* @__PURE__ */ j(Yi, {
			asChild: !0,
			children: /* @__PURE__ */ M(Z, {
				id: l,
				type: "button",
				variant: "outline",
				disabled: c,
				"aria-expanded": f,
				"aria-haspopup": "listbox",
				className: u,
				children: [a, /* @__PURE__ */ j(oe, {
					className: "size-4 opacity-50",
					"aria-hidden": "true"
				})]
			})
		}), /* @__PURE__ */ j(Zi, {
			className: "w-80 p-0",
			align: "start",
			children: /* @__PURE__ */ M(vi, {
				shouldFilter: !1,
				label: o,
				children: [/* @__PURE__ */ j(bi, {
					value: m,
					onValueChange: h,
					placeholder: o,
					"aria-label": o
				}), /* @__PURE__ */ j(xi, { children: b ? /* @__PURE__ */ M("div", {
					role: "status",
					className: "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ j(ve, {
						className: "size-4 animate-spin",
						"aria-hidden": "true"
					}), s.searching]
				}) : g.length === 0 ? /* @__PURE__ */ j("div", {
					role: "status",
					className: "py-6 text-center text-sm text-muted-foreground",
					children: s.empty
				}) : /* @__PURE__ */ M(A, { children: [g.map((e) => /* @__PURE__ */ j(Ti, {
					value: String(r(e)),
					onSelect: () => C(e),
					className: "flex flex-col items-start gap-0.5",
					children: i(e)
				}, r(e))), v ? /* @__PURE__ */ j("p", {
					role: "status",
					className: "px-3 py-2 text-xs text-muted-foreground",
					children: s.refine
				}) : null] }) })]
			})
		})]
	});
}
//#endregion
//#region src/molecules/GridFilterChips/GridFilterChips.tsx
var ea = (e) => e, ta = (e) => String(e);
function na(e, t, n, r, i) {
	let a = t?.header ?? e.id;
	switch (e.type) {
		case "text": return e.value === "" ? null : n[e.op](a, e.value);
		case "choice": {
			if (e.values.length === 0) return null;
			let r = t?.filter?.type === "choice" ? t.filter.options : [], i = e.values.map((e) => r.find((t) => t.value === e)?.label ?? e);
			return n.choice(a, i);
		}
		case "number": {
			let { min: t, max: r } = e;
			return t !== void 0 && r !== void 0 ? n.between(a, i(t), i(r)) : t === void 0 ? r === void 0 ? null : n.max(a, i(r)) : n.min(a, i(t));
		}
		case "date": {
			let { from: t, to: i } = e;
			return t !== void 0 && i !== void 0 ? n.between(a, r(t), r(i)) : t === void 0 ? i === void 0 ? null : n.to(a, r(i)) : n.from(a, r(t));
		}
	}
}
function ra({ filters: e, columns: t, onRemove: n, onClearAll: r, onEdit: i, labels: a, formatDate: o = ea, formatNumber: s = ta }) {
	let c = e.flatMap((e) => {
		let n = na(e, t.find((t) => t.id === e.id), a, o, s);
		return n === null ? [] : [{
			id: e.id,
			text: n
		}];
	});
	return c.length === 0 ? null : /* @__PURE__ */ M("div", {
		role: "region",
		"aria-label": a.region,
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ j("ul", {
			className: "flex flex-wrap items-center gap-2",
			children: c.map((e) => /* @__PURE__ */ j("li", { children: /* @__PURE__ */ M(Mn, {
				variant: "outline",
				className: "h-7 gap-1 pr-1 pl-2.5 text-sm font-normal",
				children: [i ? /* @__PURE__ */ j("button", {
					type: "button",
					onClick: () => i(e.id),
					className: "rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
					children: e.text
				}) : /* @__PURE__ */ j("span", { children: e.text }), /* @__PURE__ */ j(Z, {
					type: "button",
					variant: "ghost",
					size: "icon-xs",
					className: "text-muted-foreground",
					"aria-label": a.remove(e.text),
					onClick: () => n(e.id),
					children: /* @__PURE__ */ j(K, { "aria-hidden": "true" })
				})]
			}) }, e.id))
		}), c.length > 1 && /* @__PURE__ */ j(Z, {
			type: "button",
			variant: "ghost",
			size: "sm",
			onClick: r,
			children: a.clearAll
		})]
	});
}
//#endregion
//#region src/molecules/Select/Select.tsx
var ia = "block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30";
function aa({ ...e }) {
	return /* @__PURE__ */ j(w.Root, {
		"data-slot": "select",
		...e
	});
}
var oa = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(w.Group, {
		ref: t,
		"data-slot": "select-group",
		...e
	});
});
oa.displayName = "SelectGroup";
var sa = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(w.Value, {
		ref: t,
		"data-slot": "select-value",
		...e
	});
});
sa.displayName = "SelectValue";
var ca = n.forwardRef(function({ className: e, children: t, size: n = "default", ...r }, i) {
	return /* @__PURE__ */ M(w.Trigger, {
		ref: i,
		"data-slot": "select-trigger",
		"data-size": n,
		className: J("flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1", e),
		...r,
		children: [t, /* @__PURE__ */ j(w.Icon, {
			asChild: !0,
			children: /* @__PURE__ */ j(R, {
				className: "size-4 opacity-50",
				"aria-hidden": "true"
			})
		})]
	});
});
ca.displayName = "SelectTrigger";
var la = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(w.ScrollUpButton, {
		ref: n,
		"data-slot": "select-scroll-up-button",
		className: J("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ j(ae, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
la.displayName = "SelectScrollUpButton";
var ua = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(w.ScrollDownButton, {
		ref: n,
		"data-slot": "select-scroll-down-button",
		className: J("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ j(R, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
ua.displayName = "SelectScrollDownButton";
var da = n.forwardRef(function({ className: e, children: t, position: n = "popper", ...r }, i) {
	return /* @__PURE__ */ j(w.Portal, { children: /* @__PURE__ */ M(w.Content, {
		ref: i,
		"data-slot": "select-content",
		position: n,
		className: J("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1", e),
		...r,
		children: [
			/* @__PURE__ */ j(la, {}),
			/* @__PURE__ */ j(w.Viewport, {
				className: J("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
				children: t
			}),
			/* @__PURE__ */ j(ua, {})
		]
	}) });
});
da.displayName = "SelectContent";
var fa = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(w.Label, {
		ref: n,
		"data-slot": "select-label",
		className: J("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
fa.displayName = "SelectLabel";
var pa = n.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ M(w.Item, {
		ref: r,
		"data-slot": "select-item",
		className: J("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...n,
		children: [/* @__PURE__ */ j("span", {
			className: "absolute right-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ j(w.ItemIndicator, { children: /* @__PURE__ */ j(L, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), /* @__PURE__ */ j(w.ItemText, { children: t })]
	});
});
pa.displayName = "SelectItem";
var ma = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(w.Separator, {
		ref: n,
		"data-slot": "select-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
ma.displayName = "SelectSeparator";
//#endregion
//#region src/molecules/GridFilterEditor/GridFilterEditor.tsx
function ha(e) {
	return (t) => {
		t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), e());
	};
}
function ga(e) {
	if (e.trim() === "") return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
function _a({ labels: e, onApply: t, onClear: n, invalid: r }) {
	return /* @__PURE__ */ M("div", {
		className: "flex justify-end gap-2",
		children: [/* @__PURE__ */ j(Z, {
			type: "button",
			variant: "ghost",
			size: "sm",
			onClick: n,
			children: e.clear
		}), /* @__PURE__ */ j(Z, {
			type: "button",
			size: "sm",
			onClick: t,
			disabled: r,
			tooltip: r ? e.invalidRange : void 0,
			children: e.apply
		})]
	});
}
function va({ columnId: e, labels: t, onApply: n, value: r }) {
	let i = l(), [a, o] = p(r?.op ?? "contains"), [s, c] = p(r?.value ?? ""), u = () => {
		let t = s.trim();
		n(t === "" ? null : {
			id: e,
			type: "text",
			op: a,
			value: t
		});
	};
	return /* @__PURE__ */ M(A, { children: [
		/* @__PURE__ */ M("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ j(er, {
				htmlFor: `${i}-op`,
				children: t.operator
			}), /* @__PURE__ */ M(aa, {
				value: a,
				onValueChange: (e) => o(e),
				children: [/* @__PURE__ */ j(ca, {
					id: `${i}-op`,
					children: /* @__PURE__ */ j(sa, {})
				}), /* @__PURE__ */ M(da, { children: [
					/* @__PURE__ */ j(pa, {
						value: "contains",
						children: t.contains
					}),
					/* @__PURE__ */ j(pa, {
						value: "equals",
						children: t.equals
					}),
					/* @__PURE__ */ j(pa, {
						value: "startsWith",
						children: t.startsWith
					})
				] })]
			})]
		}),
		/* @__PURE__ */ M("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ j(er, {
				htmlFor: `${i}-value`,
				children: t.value
			}), /* @__PURE__ */ j(Qn, {
				id: `${i}-value`,
				type: "text",
				value: s,
				onChange: (e) => c(e.target.value),
				onKeyDown: ha(u)
			})]
		}),
		/* @__PURE__ */ j(_a, {
			labels: t,
			onApply: u,
			onClear: () => {
				o("contains"), c(""), n(null);
			},
			invalid: !1
		})
	] });
}
function ya({ columnId: e, labels: t, onApply: n, options: r, value: i }) {
	let a = l(), [o, s] = p(() => new Set(i?.values ?? [])), c = (e, t) => s((n) => {
		let r = new Set(n);
		return t ? r.add(e) : r.delete(e), r;
	});
	return /* @__PURE__ */ M(A, { children: [
		/* @__PURE__ */ M("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ j(Z, {
				type: "button",
				variant: "ghost",
				size: "xs",
				onClick: () => s(new Set(r.map((e) => e.value))),
				children: t.selectAll
			}), /* @__PURE__ */ j(Z, {
				type: "button",
				variant: "ghost",
				size: "xs",
				onClick: () => s(/* @__PURE__ */ new Set()),
				children: t.selectNone
			})]
		}),
		/* @__PURE__ */ j("ul", {
			className: "flex max-h-60 flex-col gap-2 overflow-y-auto",
			children: r.map((e, t) => /* @__PURE__ */ M("li", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ j(Vn, {
					id: `${a}-${t}`,
					checked: o.has(e.value),
					onCheckedChange: (t) => c(e.value, t === !0)
				}), /* @__PURE__ */ j(er, {
					htmlFor: `${a}-${t}`,
					className: "font-normal",
					children: e.label
				})]
			}, e.value))
		}),
		/* @__PURE__ */ j(_a, {
			labels: t,
			onApply: () => {
				let t = r.filter((e) => o.has(e.value)).map((e) => e.value);
				n(t.length === 0 ? null : {
					id: e,
					type: "choice",
					values: t
				});
			},
			onClear: () => {
				s(/* @__PURE__ */ new Set()), n(null);
			},
			invalid: !1
		})
	] });
}
function ba({ columnId: e, labels: t, onApply: n, kind: r, initial: i }) {
	let a = l(), [o, s] = p(i.low ?? ""), [c, u] = p(i.high ?? ""), d = r === "number" ? ga(o) : o === "" ? void 0 : o, f = r === "number" ? ga(c) : c === "" ? void 0 : c, m = d !== void 0 && f !== void 0 && d > f, h = `${a}-error`, g = () => {
		m || n(d === void 0 && f === void 0 ? null : r === "number" ? {
			id: e,
			type: "number",
			...d !== void 0 && { min: d },
			...f !== void 0 && { max: f }
		} : {
			id: e,
			type: "date",
			...d !== void 0 && { from: d },
			...f !== void 0 && { to: f }
		});
	}, _ = () => {
		s(""), u(""), n(null);
	}, v = r === "number" ? t.min : t.from, y = r === "number" ? t.max : t.to, b = {
		type: r,
		"aria-invalid": m || void 0,
		"aria-describedby": m ? h : void 0,
		onKeyDown: ha(g)
	};
	return /* @__PURE__ */ M(A, { children: [
		/* @__PURE__ */ M("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ M("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ j(er, {
					htmlFor: `${a}-low`,
					children: v
				}), /* @__PURE__ */ j(Qn, {
					...b,
					id: `${a}-low`,
					value: o,
					onChange: (e) => s(e.target.value)
				})]
			}), /* @__PURE__ */ M("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ j(er, {
					htmlFor: `${a}-high`,
					children: y
				}), /* @__PURE__ */ j(Qn, {
					...b,
					id: `${a}-high`,
					value: c,
					onChange: (e) => u(e.target.value)
				})]
			})]
		}),
		m && /* @__PURE__ */ j("p", {
			id: h,
			role: "alert",
			className: "text-sm text-destructive",
			children: t.invalidRange
		}),
		/* @__PURE__ */ j(_a, {
			labels: t,
			onApply: g,
			onClear: _,
			invalid: m
		})
	] });
}
function xa({ columnId: e, header: t, def: n, value: r, onApply: i, labels: a }) {
	let o = {
		columnId: e,
		labels: a,
		onApply: i
	};
	return /* @__PURE__ */ M("div", {
		role: "group",
		"aria-label": t,
		className: "flex w-64 flex-col gap-3",
		children: [
			n.type === "text" && /* @__PURE__ */ j(va, {
				...o,
				value: r?.type === "text" ? r : void 0
			}),
			n.type === "choice" && /* @__PURE__ */ j(ya, {
				...o,
				options: n.options,
				value: r?.type === "choice" ? r : void 0
			}),
			n.type === "number" && /* @__PURE__ */ j(ba, {
				...o,
				kind: "number",
				initial: r?.type === "number" ? {
					low: Sa(r.min),
					high: Sa(r.max)
				} : {}
			}),
			n.type === "date" && /* @__PURE__ */ j(ba, {
				...o,
				kind: "date",
				initial: r?.type === "date" ? {
					low: r.from,
					high: r.to
				} : {}
			})
		]
	});
}
function Sa(e) {
	return e === void 0 ? void 0 : String(e);
}
//#endregion
//#region src/molecules/GridFooter/GridFooter.tsx
function Ca({ summary: e, onPrev: t, onNext: n, labels: r }) {
	return /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("p", {
		className: "text-sm text-muted-foreground tabular-nums",
		children: e
	}), /* @__PURE__ */ M("nav", {
		"aria-label": r.pager,
		className: "ml-auto flex items-center gap-1",
		children: [/* @__PURE__ */ j(Kn, {
			label: r.previous,
			disabled: !t,
			onClick: t ?? void 0,
			icon: /* @__PURE__ */ j(z, {
				className: "size-4",
				"aria-hidden": "true"
			})
		}), /* @__PURE__ */ j(Kn, {
			label: r.next,
			disabled: !n,
			onClick: n ?? void 0,
			icon: /* @__PURE__ */ j(B, {
				className: "size-4",
				"aria-hidden": "true"
			})
		})]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridViews.tsx
function wa({ title: e, initial: t, labels: n, onSubmit: r, onClose: i, onCloseAutoFocus: a }) {
	let [o, s] = p(t), [c, u] = p(!1), d = f(null), m = l(), h = () => {
		let e = o.trim();
		if (e === "") {
			u(!0), d.current?.focus();
			return;
		}
		r(e), i();
	};
	return /* @__PURE__ */ j(Cr, {
		open: !0,
		onOpenChange: (e) => !e && i(),
		children: /* @__PURE__ */ M(Dr, {
			closeLabel: n.closeLabel,
			"aria-describedby": void 0,
			className: "max-w-sm",
			onCloseAutoFocus: a,
			children: [
				/* @__PURE__ */ j(Or, { children: /* @__PURE__ */ j(Ar, { children: e }) }),
				/* @__PURE__ */ M("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ j(er, {
							htmlFor: m,
							children: n.name
						}),
						/* @__PURE__ */ j(Qn, {
							id: m,
							ref: d,
							value: o,
							onChange: (e) => {
								s(e.target.value), u(!1);
							},
							onKeyDown: (e) => {
								e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), h());
							},
							"aria-invalid": c || void 0,
							"aria-describedby": c ? `${m}-error` : void 0
						}),
						c && /* @__PURE__ */ j("p", {
							id: `${m}-error`,
							role: "alert",
							className: "text-sm text-destructive",
							children: n.nameRequired
						})
					]
				}),
				/* @__PURE__ */ M(kr, { children: [/* @__PURE__ */ j(Z, {
					type: "button",
					variant: "outline",
					onClick: i,
					children: n.cancel
				}), /* @__PURE__ */ j(Z, {
					type: "button",
					onClick: h,
					children: n.confirm
				})] })
			]
		})
	});
}
function Ta(e, t) {
	let [n, r] = p(null), i = f(null), a = (e) => {
		e.preventDefault(), t.current?.focus();
	};
	return {
		request: (e) => {
			i.current = e;
		},
		onCloseAutoFocus: (e) => {
			a(e), i.current &&= (r(i.current), null);
		},
		dialogs: e && /* @__PURE__ */ M(A, { children: [
			n?.kind === "save" && /* @__PURE__ */ j(wa, {
				title: e.labels.saveTitle,
				initial: "",
				labels: e.labels,
				onSubmit: e.onSave,
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "rename" && /* @__PURE__ */ j(wa, {
				title: e.labels.renameTitle,
				initial: n.name,
				labels: e.labels,
				onSubmit: (t) => {
					t !== n.name && e.onRename(n.id, t);
				},
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "delete" && /* @__PURE__ */ j(fr, {
				open: !0,
				onOpenChange: (e) => !e && r(null),
				children: /* @__PURE__ */ M(gr, {
					onCloseAutoFocus: a,
					children: [/* @__PURE__ */ M(_r, { children: [/* @__PURE__ */ j(yr, { children: e.labels.delete }), /* @__PURE__ */ j(br, { children: e.labels.confirmDelete(n.name) })] }), /* @__PURE__ */ M(vr, { children: [/* @__PURE__ */ j(Sr, { children: e.labels.cancel }), /* @__PURE__ */ j(xr, {
						onClick: () => e.onDelete(n.id),
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						children: e.labels.deleteConfirm
					})] })]
				})
			})
		] })
	};
}
function Ea({ views: { views: e, activeViewId: t, isModified: n, onApply: r, onUpdate: i, labels: a }, request: o }) {
	let s = e.find((e) => e.id === t);
	return /* @__PURE__ */ M(Hi, { children: [/* @__PURE__ */ M(Ui, { children: [
		/* @__PURE__ */ j(F, {
			className: "size-4 text-muted-foreground",
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ j("span", {
			className: "min-w-0 flex-1 truncate",
			children: a.trigger
		}),
		" ",
		s && /* @__PURE__ */ j("span", {
			className: "max-w-28 truncate text-xs text-muted-foreground",
			children: s.name
		}),
		" ",
		n && /* @__PURE__ */ M(A, { children: [
			/* @__PURE__ */ j("span", {
				"data-modified-dot": "",
				"aria-hidden": "true",
				className: "size-2 shrink-0 rounded-full bg-primary"
			}),
			" ",
			/* @__PURE__ */ j("span", {
				className: "sr-only",
				children: a.modified
			})
		] })
	] }), /* @__PURE__ */ M(Wi, {
		className: "w-64",
		children: [
			e.length === 0 ? /* @__PURE__ */ j(Ki, {
				className: "font-normal text-muted-foreground",
				children: a.empty
			}) : /* @__PURE__ */ j(Bi, {
				value: s?.id ?? "",
				onValueChange: r,
				children: e.map((e) => /* @__PURE__ */ j(Vi, {
					value: e.id,
					children: e.name
				}, e.id))
			}),
			/* @__PURE__ */ j($, {}),
			/* @__PURE__ */ M(Q, {
				onSelect: () => o({ kind: "save" }),
				children: [/* @__PURE__ */ j(I, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.save]
			}),
			s && n && i && /* @__PURE__ */ M(Q, {
				onSelect: () => i(s.id),
				children: [/* @__PURE__ */ j(Ae, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.update]
			}),
			s && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ M(Q, {
				onSelect: () => o({
					kind: "rename",
					id: s.id,
					name: s.name
				}),
				children: [/* @__PURE__ */ j(Ee, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.rename]
			}), /* @__PURE__ */ M(Q, {
				onSelect: () => o({
					kind: "delete",
					id: s.id,
					name: s.name
				}),
				children: [/* @__PURE__ */ j(Re, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.delete]
			})] })
		]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridOptions.tsx
function Da({ preferences: e, columns: t, canSelect: n = !1, views: r, labels: i }) {
	let a = f(null), { request: o, onCloseAutoFocus: s, dialogs: c } = Ta(r, a);
	return /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ M(Fi, { children: [/* @__PURE__ */ j(Ii, {
		asChild: !0,
		children: /* @__PURE__ */ M(Z, {
			ref: a,
			variant: "ghost",
			size: "icon",
			"aria-label": i.trigger,
			className: "relative text-muted-foreground",
			children: [/* @__PURE__ */ j(le, { "aria-hidden": "true" }), r?.isModified && /* @__PURE__ */ j("span", {
				"data-modified-dot": "",
				"aria-hidden": "true",
				className: "absolute top-1 right-1 size-2 rounded-full bg-primary"
			})]
		})
	}), /* @__PURE__ */ M(Ri, {
		align: "end",
		className: "w-56",
		onCloseAutoFocus: s,
		children: [
			r && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(Ea, {
				views: r,
				request: o
			}), /* @__PURE__ */ j($, {})] }),
			/* @__PURE__ */ M(Hi, { children: [/* @__PURE__ */ M(Ui, { children: [/* @__PURE__ */ j(se, {
				className: "size-4 text-muted-foreground",
				"aria-hidden": "true"
			}), i.columns] }), /* @__PURE__ */ j(Wi, {
				className: "w-52",
				children: t.map((t) => /* @__PURE__ */ j(zi, {
					checked: e.isColumnVisible(t.id),
					disabled: t.hideable === !1,
					onCheckedChange: (n) => e.setColumnVisible(t.id, n === !0),
					onSelect: (e) => e.preventDefault(),
					children: t.label
				}, t.id))
			})] }),
			/* @__PURE__ */ j($, {}),
			/* @__PURE__ */ j(Ki, { children: i.density }),
			/* @__PURE__ */ M(Bi, {
				value: e.values.density,
				onValueChange: (t) => e.setDensity(t),
				children: [/* @__PURE__ */ j(Vi, {
					value: "comfortable",
					children: i.comfortable
				}), /* @__PURE__ */ j(Vi, {
					value: "compact",
					children: i.compact
				})]
			}),
			n && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j($, {}), /* @__PURE__ */ j(zi, {
				checked: e.values.selection,
				onCheckedChange: (t) => e.setSelectionEnabled(t === !0),
				children: i.selection
			})] }),
			/* @__PURE__ */ j($, {}),
			/* @__PURE__ */ M(Q, {
				disabled: e.isDefault,
				onSelect: () => e.reset(),
				children: [/* @__PURE__ */ j(je, {
					className: "size-4",
					"aria-hidden": "true"
				}), i.reset]
			})
		]
	})] }), c] });
}
//#endregion
//#region src/molecules/InlineText/InlineText.tsx
function Oa({ value: e, onChange: t, label: n, placeholder: r, multiline: i = !1, inverse: a = !1, as: o = "p", className: s }) {
	let [l, u] = p(!1), d = f(null), m = f(null), h = f(!1);
	c(() => {
		l ? (d.current?.focus(), d.current?.select()) : h.current && (h.current = !1, m.current?.focus());
	}, [l]);
	let g = (n, r) => {
		let i = d.current?.value.trim() ?? "";
		h.current = r, u(!1), n && i !== e && t(i);
	};
	if (l) {
		let t = {
			ref: d,
			defaultValue: e,
			"aria-label": n,
			placeholder: r,
			onKeyDown: (e) => {
				e.key === "Escape" ? (e.preventDefault(), g(!1, !0)) : e.key === "Enter" && !e.nativeEvent.isComposing && (!i || e.metaKey || e.ctrlKey) && (e.preventDefault(), g(!0, !0));
			},
			onBlur: () => g(!0, !1),
			className: J("block w-full resize-none rounded-md px-2 py-0.5 text-inherit outline-none ring-2", a ? "bg-black/20 ring-primary-foreground" : "bg-background ring-ring", "-mx-2 w-[calc(100%+1rem)]", s)
		};
		return i ? /* @__PURE__ */ j("textarea", {
			rows: Math.max(3, e.split("\n").length + 1),
			...t
		}) : /* @__PURE__ */ j("input", { ...t });
	}
	return e ? /* @__PURE__ */ j(o, {
		className: s,
		children: /* @__PURE__ */ M("button", {
			ref: m,
			type: "button",
			"aria-label": `${n}: ${e}`,
			onClick: () => u(!0),
			className: J("group/inline relative -mx-2 block w-[calc(100%+1rem)] cursor-text rounded-md px-2 py-0.5 text-start whitespace-pre-line", "outline-offset-2 hover:outline-2 hover:outline-dashed focus-visible:outline-2 focus-visible:outline-solid", a ? "hover:outline-primary-foreground/60 focus-visible:outline-primary-foreground" : "hover:outline-ring/60 focus-visible:outline-ring"),
			children: [e, /* @__PURE__ */ j(Ee, {
				"aria-hidden": "true",
				className: "absolute -end-5 top-1 hidden size-3.5 opacity-70 group-hover/inline:block"
			})]
		})
	}) : /* @__PURE__ */ M("button", {
		ref: m,
		type: "button",
		onClick: () => u(!0),
		className: J("flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-start text-sm transition-colors", a ? "border-primary-foreground/50 text-primary-foreground hover:border-primary-foreground" : "border-border text-muted-foreground hover:border-ring hover:text-foreground"),
		children: [/* @__PURE__ */ j(ke, {
			className: "size-4 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ M("span", { children: [
			/* @__PURE__ */ j("span", {
				className: J("font-medium", !a && "text-foreground"),
				children: n
			}),
			" ",
			"— ",
			r
		] })]
	});
}
//#endregion
//#region src/molecules/LanguageSelect/LanguageSelect.tsx
var ka = (e) => e.done >= e.total, Aa = (e) => e.total > 0 ? Math.min(100, Math.max(0, e.done / e.total * 100)) : 100;
function ja({ language: e }) {
	return /* @__PURE__ */ j("span", {
		"aria-hidden": "true",
		"data-slot": "language-select-flag",
		className: "inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] [&>img]:size-full [&>img]:object-cover [&>svg]:size-full",
		children: e.flag ?? /* @__PURE__ */ j("span", {
			"data-slot": "language-select-code",
			className: "flex size-full items-center justify-center bg-muted text-[10px] leading-none font-semibold text-muted-foreground uppercase",
			children: e.code.toUpperCase()
		})
	});
}
function Ma({ language: e }) {
	let t = ka(e);
	return /* @__PURE__ */ M("span", {
		"aria-hidden": "true",
		"data-slot": "language-select-progress",
		"data-complete": t,
		className: J("shrink-0 rounded-full px-1.5 py-px text-xs font-medium tabular-nums", t ? "bg-success/10 text-success-tint-foreground" : "bg-warning/10 text-warning-tint-foreground"),
		children: [
			e.done,
			"/",
			e.total
		]
	});
}
function Na({ languages: e, value: t, onValueChange: n, labels: r, className: i }) {
	let a = e.find((e) => e.code === t);
	return /* @__PURE__ */ M(aa, {
		value: t,
		onValueChange: n,
		children: [/* @__PURE__ */ j(ca, {
			"data-slot": "language-select",
			"aria-label": a ? `${r.label}: ${a.label}, ${r.progress(a.done, a.total)}` : r.label,
			className: J("w-auto min-w-40 gap-2 px-2", i),
			children: /* @__PURE__ */ j(sa, { children: a ? /* @__PURE__ */ M("span", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ j(ja, { language: a }),
					/* @__PURE__ */ j("span", {
						className: "truncate",
						children: a.label
					}),
					/* @__PURE__ */ j(Ma, { language: a })
				]
			}) : null })
		}), /* @__PURE__ */ j(da, {
			className: "min-w-56",
			children: e.map((e) => {
				let t = ka(e);
				return /* @__PURE__ */ M(w.Item, {
					value: e.code,
					"data-slot": "select-item",
					"data-complete": t,
					className: "relative flex w-full cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
					children: [/* @__PURE__ */ j(w.ItemText, { children: /* @__PURE__ */ M("span", {
						className: "flex w-full flex-col gap-1",
						children: [/* @__PURE__ */ M("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ j(ja, { language: e }),
								/* @__PURE__ */ j("span", {
									className: "flex-1 truncate",
									children: e.label
								}),
								" ",
								/* @__PURE__ */ j("span", {
									className: "sr-only",
									children: r.progress(e.done, e.total)
								}),
								/* @__PURE__ */ j(Ma, { language: e })
							]
						}), /* @__PURE__ */ j("span", {
							"aria-hidden": "true",
							"data-slot": "language-select-bar",
							className: "block h-1 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ j("span", {
								className: J("block h-full rounded-full", t ? "bg-success" : "bg-warning"),
								style: { width: `${Aa(e)}%` }
							})
						})]
					}) }), /* @__PURE__ */ j("span", {
						className: "absolute end-2 top-2 flex size-4 items-center justify-center",
						children: /* @__PURE__ */ j(w.ItemIndicator, { children: /* @__PURE__ */ j(L, {
							className: "size-4",
							"aria-hidden": "true"
						}) })
					})]
				}, e.code);
			})
		})]
	});
}
//#endregion
//#region src/molecules/SearchField/SearchField.tsx
function Pa({ value: e, onValueChange: t, placeholder: n, collapsible: r = !1, className: i, onFocus: a, onBlur: o, ...s }) {
	let [c, l] = p(!1), [u, d] = p(!1), f = !r || c || e !== "", m = /* @__PURE__ */ M("div", {
		"data-expanded": f ? "" : void 0,
		className: J("relative", r && ["w-8 shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none", "data-expanded:w-[var(--search-width,18rem)]"], i),
		children: [/* @__PURE__ */ j(Ne, {
			className: J("pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground", !f && "left-2 text-foreground"),
			"aria-hidden": "true"
		}), /* @__PURE__ */ j(Qn, {
			...s,
			type: "search",
			value: e,
			onChange: (e) => t(e.target.value),
			onFocus: (e) => {
				l(!0), d(!1), a?.(e);
			},
			onBlur: (e) => {
				l(!1), o?.(e);
			},
			placeholder: n,
			"aria-label": n,
			className: J("h-8 w-full pl-8", !f && "cursor-pointer border-transparent pr-0 placeholder:text-transparent hover:bg-muted")
		})]
	});
	return r ? /* @__PURE__ */ j(Nn, {
		delayDuration: 200,
		children: /* @__PURE__ */ M(Pn, {
			open: u && !f,
			onOpenChange: d,
			children: [/* @__PURE__ */ j(Fn, {
				asChild: !0,
				children: m
			}), /* @__PURE__ */ j(In, { children: n })]
		})
	}) : m;
}
//#endregion
//#region src/molecules/SegmentedChoice/SegmentedChoice.tsx
var Fa = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(C.Root, {
		ref: n,
		"data-slot": "segmented-choice",
		className: J("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
Fa.displayName = "SegmentedChoice";
var Ia = n.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ j(C.Item, {
		ref: r,
		"data-slot": "segmented-choice-item",
		className: J("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...n,
		children: t
	});
});
Ia.displayName = "SegmentedChoiceItem";
//#endregion
//#region src/molecules/SegmentedTabs/SegmentedTabs.tsx
var La = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Root, {
		ref: n,
		"data-slot": "segmented-tabs",
		className: J("flex flex-col gap-4", e),
		...t
	});
});
La.displayName = "SegmentedTabs";
var Ra = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.List, {
		ref: n,
		"data-slot": "segmented-tabs-list",
		className: J("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
Ra.displayName = "SegmentedTabsList";
var za = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Trigger, {
		ref: n,
		"data-slot": "segmented-tab",
		className: J("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
za.displayName = "SegmentedTab";
var Ba = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Content, {
		ref: n,
		"data-slot": "segmented-tabs-content",
		className: J("focus-visible:outline-none", e),
		...t
	});
});
Ba.displayName = "SegmentedTabsContent";
//#endregion
//#region src/molecules/StatCard/StatCard.tsx
function Va({ label: e, value: t, hint: n, icon: r, className: i }) {
	return /* @__PURE__ */ M(Yr, {
		className: J("gap-2", i),
		children: [/* @__PURE__ */ M(Xr, {
			className: "flex flex-row items-center justify-between gap-2",
			children: [/* @__PURE__ */ j(Zr, {
				className: "text-sm font-medium text-muted-foreground",
				children: e
			}), r ? /* @__PURE__ */ j("span", {
				className: "shrink-0 text-muted-foreground",
				"aria-hidden": "true",
				children: r
			}) : null]
		}), /* @__PURE__ */ M(ei, { children: [/* @__PURE__ */ j("p", {
			className: "text-3xl font-semibold text-foreground tabular-nums",
			children: t
		}), n ? /* @__PURE__ */ j("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: n
		}) : null] })]
	});
}
//#endregion
//#region src/molecules/Tabs/Tabs.tsx
var Ha = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Root, {
		ref: n,
		"data-slot": "tabs",
		className: J("flex flex-col gap-4", e),
		...t
	});
});
Ha.displayName = "Tabs";
var Ua = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.List, {
		ref: n,
		"data-slot": "tabs-list",
		className: J("inline-flex w-full flex-wrap items-center gap-1 rounded-md border-b border-border bg-transparent p-0", e),
		...t
	});
});
Ua.displayName = "TabsList";
var Wa = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Trigger, {
		ref: n,
		"data-slot": "tabs-trigger",
		className: J("inline-flex items-center justify-center rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors", "pointer-coarse:min-h-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:border-primary data-[state=active]:text-foreground", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
Wa.displayName = "TabsTrigger";
var Ga = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(O.Content, {
		ref: n,
		"data-slot": "tabs-content",
		className: J("focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", e),
		...t
	});
});
Ga.displayName = "TabsContent";
//#endregion
//#region src/organisms/AppRail/AppRail.tsx
function Ka({ label: e, logo: t, children: n, className: r }) {
	return /* @__PURE__ */ j(Nn, {
		delayDuration: 200,
		children: /* @__PURE__ */ M("nav", {
			"aria-label": e,
			className: J("flex h-full w-[68px] shrink-0 flex-col items-center gap-1 bg-rail px-1.5 py-3 text-rail-foreground", r),
			children: [t && /* @__PURE__ */ j("div", {
				className: "mb-2 flex justify-center",
				children: t
			}), n]
		})
	});
}
function qa() {
	return /* @__PURE__ */ j("div", {
		"aria-hidden": "true",
		className: "flex-1"
	});
}
function Ja({ icon: e, label: t, active: n = !1, href: r, as: i, onClick: a }) {
	let o = J("flex w-full flex-col items-center gap-1 rounded-lg py-2 text-[10.5px] leading-none font-medium transition-colors outline-none", "focus-visible:ring-2 focus-visible:ring-rail-foreground", n ? "bg-rail-accent text-rail-foreground" : "text-rail-muted-foreground hover:bg-rail-accent hover:text-rail-foreground"), s = /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(e, {
		className: "size-5",
		"aria-hidden": "true"
	}), /* @__PURE__ */ j("span", {
		className: "max-w-full truncate px-0.5",
		children: t
	})] });
	return /* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
		asChild: !0,
		children: r === void 0 ? /* @__PURE__ */ j("button", {
			type: "button",
			onClick: a,
			"aria-pressed": n,
			className: o,
			children: s
		}) : /* @__PURE__ */ j(i ?? "a", {
			href: r,
			onClick: a,
			"aria-current": n ? "page" : void 0,
			className: o,
			children: s
		})
	}), /* @__PURE__ */ j(In, {
		side: "right",
		children: t
	})] });
}
//#endregion
//#region src/organisms/CategoryTree/CategoryTree.tsx
var Ya = 16, Xa = 6, Za = 600, Qa = 700, $a = "\0draft";
function eo(e) {
	if (!e || typeof localStorage > "u") return null;
	try {
		let t = JSON.parse(localStorage.getItem(`burgwiss-ui:tree:${e}`) ?? "null");
		return Array.isArray(t) && t.every((e) => typeof e == "string") ? t : null;
	} catch {
		return null;
	}
}
function to({ initial: e, label: t, onDone: n }) {
	let r = f(null), i = f(!1);
	c(() => {
		r.current?.focus(), r.current?.select();
	}, []);
	let a = (e, t) => {
		i.current || (i.current = !0, n(e, t));
	};
	return /* @__PURE__ */ j("input", {
		ref: r,
		"aria-label": t,
		defaultValue: e,
		onKeyDown: (e) => {
			e.stopPropagation(), e.key === "Enter" && !e.nativeEvent.isComposing ? (e.preventDefault(), a(e.currentTarget.value, !0)) : e.key === "Escape" && (e.preventDefault(), a(null, !0));
		},
		onBlur: (e) => a(e.currentTarget.value, !1),
		onClick: (e) => e.stopPropagation(),
		className: "h-6 min-w-0 flex-1 rounded-sm border border-ring bg-background px-1.5 text-sm outline-none"
	});
}
function no({ nodes: e, onNodesChange: t, selectedId: n, onSelect: r, onEdit: i, counts: a, createId: o = () => crypto.randomUUID(), defaultExpandedIds: s = [], storageKey: u, shortcutLabels: m, labels: h, className: g }) {
	let _ = t !== void 0, v = _ || i !== void 0, y = l(), [b, x] = p(() => {
		let t = new Set(eo(u) ?? s);
		return n && Xe(e, n).slice(0, -1).forEach((e) => t.add(e.id)), t;
	}), [S, C] = p(null), [w, T] = p(null), [E, D] = p(null), [O, k] = p(null), [ee, te] = p(""), [ne, re] = p(null), [, F] = p(0), I = f(/* @__PURE__ */ new Map()), ie = f(null), L = f(null), R = f(null), z = f(null), ae = f(!1), oe = f({
		text: "",
		at: 0
	}), V = (e) => x((t) => {
		let n = new Set(t);
		return e(n), u && typeof localStorage < "u" && localStorage.setItem(`burgwiss-ui:tree:${u}`, JSON.stringify([...n])), n;
	}), H = d(() => {
		let t = Qe(e, b);
		if (w?.kind !== "new") return t;
		let n = (e, t) => ({
			node: {
				id: $a,
				label: h.newName
			},
			level: e,
			parentId: t,
			posInSet: 0,
			setSize: 0,
			hasChildren: !1,
			expanded: !1,
			draft: !0
		}), r = t.findIndex((e) => e.node.id === w.parentId);
		if (r < 0) return [...t, n(1, null)];
		let i = t[r], a = r + 1;
		for (; a < t.length && t[a].level > i.level;) a++;
		return [
			...t.slice(0, a),
			n(i.level + 1, i.node.id),
			...t.slice(a)
		];
	}, [
		e,
		b,
		w,
		h.newName
	]), se = f({
		nodes: e,
		lines: H
	});
	c(() => {
		se.current = {
			nodes: e,
			lines: H
		};
	}), c(() => {
		let e = L.current, t = e ? I.current.get(e) : void 0;
		t && (t.focus(), L.current = null);
	});
	let U = (e) => {
		L.current = e, F((e) => e + 1);
	}, ce = S && H.some((e) => e.node.id === S) && S || n && H.some((e) => e.node.id === n) && n || H[0]?.node.id, W = (e) => t?.(e), ue = (t, n) => {
		if (n === e) return;
		let r = Y(n, t), i = X(e, t), a = X(n, t);
		a.parentId !== null && V((e) => Xe(n, a.parentId).forEach((t) => e.add(t.id))), W(n), a.parentId !== i.parentId && te(h.moved(r.label, a.parentId === null ? null : Y(n, a.parentId).label)), U(t);
	}, de = (e, t) => V((n) => {
		t ?? !n.has(e) ? n.add(e) : n.delete(e);
	}), G = (e) => {
		e && de(e, !0), T({
			kind: "new",
			parentId: e
		});
	}, ve = (t) => {
		let i = Y(e, t);
		if (!i) return;
		let a = H.findIndex((e) => e.node.id === t), o = H[a], s = (o && H.slice(a + 1).find((e) => e.level <= o.level && !e.draft)) ?? (a > 0 ? H[a - 1] : void 0);
		return n && Ze(e, t).includes(n) && r(null), W(nt(e, t)), te(h.deleted(i.label)), U(s?.node.id ?? null), s?.node.id ?? null;
	}, ye = (t) => {
		Ze(e, t).length - 1 > 0 || (a?.[t] ?? 0) > 0 ? k(t) : ve(t);
	}, be = (t, n) => {
		let r = w;
		if (T(null), !r) return;
		let i = t?.trim() ?? "";
		if (r.kind === "rename") {
			let t = Y(e, r.id);
			t && i && i !== t.label && W(rt(e, r.id, i)), n && U(r.id);
			return;
		}
		if (!i) {
			n && U(r.parentId ?? ce ?? null);
			return;
		}
		let a = o();
		W(tt(e, r.parentId, {
			id: a,
			label: i
		})), n && U(a);
	}, xe = (e) => {
		let t = H[Math.max(0, Math.min(e, H.length - 1))];
		t && I.current.get(t.node.id)?.focus();
	}, Se = (t) => {
		let n = t.target.closest("[role=treeitem]")?.dataset.id, i = H.findIndex((e) => e.node.id === n), a = H[i];
		if (!n || !a || a.draft) return;
		let o = t.currentTarget.closest("[dir=rtl]") !== null, s = o ? "ArrowLeft" : "ArrowRight", c = o ? "ArrowRight" : "ArrowLeft", l = () => {
			t.preventDefault(), t.stopPropagation();
		};
		if (t.altKey && !t.ctrlKey && !t.metaKey) {
			let r = {
				ArrowUp: () => ot(e, n, -1),
				ArrowDown: () => ot(e, n, 1),
				[s]: () => st(e, n),
				[c]: () => ct(e, n)
			};
			_ && r[t.key] && (l(), ue(n, r[t.key]()));
			return;
		}
		if (t.key === "ContextMenu" || t.shiftKey && t.key === "F10") {
			v && (l(), D(n));
			return;
		}
		switch (t.key) {
			case "ArrowDown": return l(), xe(i + 1);
			case "ArrowUp": return l(), xe(i - 1);
			case "Home": return l(), xe(0);
			case "End": return l(), xe(H.length - 1);
			case s: return l(), a.hasChildren && !a.expanded ? de(n, !0) : a.expanded ? xe(i + 1) : void 0;
			case c:
				if (l(), a.expanded) return de(n, !1);
				a.parentId && I.current.get(a.parentId)?.focus();
				return;
			case "Enter":
			case " ": return l(), r(n);
			case "F2": return _ ? (l(), T({
				kind: "rename",
				id: n
			})) : void 0;
			case "Delete":
			case "Backspace": return _ ? (l(), ye(n)) : void 0;
		}
		if (t.key.length === 1 && !t.ctrlKey && !t.metaKey) {
			let e = t.timeStamp, n = oe.current;
			n.text = e - n.at > Qa ? t.key : n.text + t.key, n.at = e;
			let r = n.text.toLocaleLowerCase(), a = [...r].every((e) => e === r[0]), o = a ? r[0] : r, s = [...H.slice(i + +!!a), ...H.slice(0, i + 1)].find((e) => !e.draft && e.node.label.toLocaleLowerCase().startsWith(o));
			s && (l(), I.current.get(s.node.id)?.focus());
		}
	}, Ce = (e, t, n) => {
		let { nodes: r, lines: i } = se.current, a = document.elementFromPoint(e, t), o = (e) => it(r, n, e.parentId) && at(r, n, e.parentId, e.index) !== r ? e : null;
		if (a?.closest("[data-tree-end]") && ie.current?.parentElement?.contains(a)) return o({
			lineId: null,
			zone: "end",
			parentId: null,
			index: r.length
		});
		let s = a?.closest("[data-tree-line]");
		if (!s || !ie.current?.contains(s)) return null;
		let c = i.find((e) => e.node.id === s.dataset.id);
		if (!c || c.draft || c.node.id === n) return null;
		let l = s.getBoundingClientRect(), u = (t - l.top) / l.height, d = u < .25 ? "before" : u > .75 ? "after" : "inside", f = c.node.id;
		return d === "before" ? o({
			lineId: f,
			zone: d,
			parentId: c.parentId,
			index: c.posInSet - 1
		}) : d === "after" ? c.expanded ? o({
			lineId: f,
			zone: d,
			parentId: f,
			index: 0
		}) : o({
			lineId: f,
			zone: d,
			parentId: c.parentId,
			index: c.posInSet
		}) : o({
			lineId: f,
			zone: d,
			parentId: f,
			index: c.node.children?.length ?? 0
		});
	}, we = (e, t) => {
		if (!_ || e.button !== 0 || e.pointerType === "touch" || e.target.closest("input,[data-tree-menu],[data-tree-toggle],[data-tree-edit]")) return;
		let n = {
			x: e.clientX,
			y: e.clientY
		}, r = !1, i = {
			id: null,
			timer: 0
		}, a = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", c), window.removeEventListener("keydown", l, !0), window.clearTimeout(i.timer), re(null);
		}, o = (e) => {
			if (!r) {
				if (Math.hypot(e.clientX - n.x, e.clientY - n.y) < Xa) return;
				r = !0;
			}
			let a = Ce(e.clientX, e.clientY, t);
			re({
				id: t,
				target: a
			});
			let o = a?.zone === "inside" ? a.lineId : null;
			o !== i.id && (window.clearTimeout(i.timer), i = {
				id: o,
				timer: o ? window.setTimeout(() => de(o, !0), Za) : 0
			});
		}, s = (e) => {
			let n = r ? Ce(e.clientX, e.clientY, t) : null;
			if (a(), !r) return;
			ae.current = !0, window.setTimeout(() => ae.current = !1, 0);
			let i = se.current.nodes;
			n && ue(t, at(i, t, n.parentId, n.index));
		}, c = () => a(), l = (e) => {
			e.key === "Escape" && r && (e.preventDefault(), e.stopPropagation(), r = !1, a());
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", c), window.addEventListener("keydown", l, !0);
	}, Te = d(() => E ? Qe(e, new Set(e.flatMap((t) => Ze(e, t.id)))) : [], [E, e]), De = (e) => wt(e, m), Oe = O ? Y(e, O) : null, Ae = (t) => {
		let n = t.node.id, r = X(e, n), a = r.index === 0, o = r.index === r.siblings.length - 1, s = (e) => {
			R.current = () => I.current.get(n)?.focus(), ue(n, e());
		}, c = (e) => {
			R.current = e;
		};
		return /* @__PURE__ */ M(Ri, {
			align: "start",
			className: "w-64",
			onCloseAutoFocus: (e) => {
				e.preventDefault();
				let t = R.current;
				R.current = null, t ? t() : I.current.get(n)?.focus();
			},
			children: [
				i && /* @__PURE__ */ M(Q, {
					onSelect: () => c(() => i(n)),
					children: [/* @__PURE__ */ j(Ee, { "aria-hidden": "true" }), h.edit]
				}),
				_ && i && /* @__PURE__ */ j($, {}),
				_ && /* @__PURE__ */ M(A, { children: [
					/* @__PURE__ */ M(Q, {
						onSelect: () => c(() => G(n)),
						children: [/* @__PURE__ */ j(he, { "aria-hidden": "true" }), h.addChild]
					}),
					/* @__PURE__ */ M(Q, {
						onSelect: () => c(() => T({
							kind: "rename",
							id: n
						})),
						children: [
							/* @__PURE__ */ j(Ee, { "aria-hidden": "true" }),
							h.rename,
							/* @__PURE__ */ j(Gi, { children: De("F2") })
						]
					}),
					/* @__PURE__ */ j($, {}),
					/* @__PURE__ */ M(Hi, { children: [/* @__PURE__ */ M(Ui, { children: [/* @__PURE__ */ j(pe, { "aria-hidden": "true" }), h.moveTo] }), /* @__PURE__ */ M(Wi, {
						className: "max-h-80 w-64 overflow-y-auto",
						children: [/* @__PURE__ */ j(Q, {
							disabled: r.parentId === null,
							onSelect: () => s(() => at(e, n, null, e.length)),
							children: h.topLevel
						}), Te.map((t) => /* @__PURE__ */ j(Q, {
							disabled: t.node.id === r.parentId || !it(e, n, t.node.id),
							style: { paddingInlineStart: `${8 + t.level * 12}px` },
							onSelect: () => s(() => at(e, n, t.node.id, t.node.children?.length ?? 0)),
							children: t.node.label
						}, t.node.id))]
					})] }),
					/* @__PURE__ */ M(Q, {
						disabled: a,
						onSelect: () => s(() => ot(e, n, -1)),
						children: [
							/* @__PURE__ */ j(P, { "aria-hidden": "true" }),
							h.moveUp,
							/* @__PURE__ */ j(Gi, { children: De("Alt+↑") })
						]
					}),
					/* @__PURE__ */ M(Q, {
						disabled: o,
						onSelect: () => s(() => ot(e, n, 1)),
						children: [
							/* @__PURE__ */ j(N, { "aria-hidden": "true" }),
							h.moveDown,
							/* @__PURE__ */ j(Gi, { children: De("Alt+↓") })
						]
					}),
					/* @__PURE__ */ M(Q, {
						disabled: r.parentId === null,
						onSelect: () => s(() => ct(e, n)),
						children: [
							/* @__PURE__ */ j(ge, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							h.outdent,
							/* @__PURE__ */ j(Gi, { children: De("Alt+←") })
						]
					}),
					/* @__PURE__ */ M(Q, {
						disabled: a,
						onSelect: () => s(() => st(e, n)),
						children: [
							/* @__PURE__ */ j(_e, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							h.indent,
							/* @__PURE__ */ j(Gi, { children: De("Alt+→") })
						]
					}),
					/* @__PURE__ */ j($, {}),
					/* @__PURE__ */ M(Q, {
						onSelect: () => c(() => ye(n)),
						children: [
							/* @__PURE__ */ j(Re, { "aria-hidden": "true" }),
							h.delete,
							/* @__PURE__ */ j(Gi, { children: De("Delete") })
						]
					})
				] })
			]
		});
	}, je = (e) => {
		let t = e.node.id, o = e.draft ? void 0 : a?.[t], s = w?.kind === "rename" && w.id === t, c = ne?.target?.lineId === t ? ne.target.zone : null, l = e.expanded ? me : fe, u = 4 + (e.level - 1) * Ya;
		return /* @__PURE__ */ M("div", {
			ref: (e) => {
				e ? I.current.set(t, e) : I.current.delete(t);
			},
			role: "treeitem",
			"data-id": e.draft ? void 0 : t,
			"data-tree-line": "",
			"data-drop": c ?? void 0,
			"aria-level": e.level,
			"aria-setsize": e.draft ? void 0 : e.setSize,
			"aria-posinset": e.draft ? void 0 : e.posInSet,
			"aria-expanded": e.hasChildren ? e.expanded : void 0,
			"aria-selected": e.draft ? void 0 : n === t,
			"aria-label": o === void 0 ? void 0 : `${e.node.label}, ${h.count(o)}`,
			tabIndex: !e.draft && ce === t ? 0 : -1,
			onFocus: (n) => {
				n.target === n.currentTarget && !e.draft && C(t);
			},
			onClick: () => {
				e.draft || ae.current || r(t);
			},
			onContextMenu: (n) => {
				v && !e.draft && (n.preventDefault(), D(t));
			},
			onPointerDown: (n) => !e.draft && we(n, t),
			style: {
				paddingInlineStart: u,
				"--indent": `${u}px`
			},
			className: J("group/line relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md pe-1 text-sm outline-none select-none", "animate-in duration-150 fade-in-0 slide-in-from-top-1 motion-reduce:animate-none", "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", "aria-selected:bg-muted aria-selected:font-medium", ne?.id === t && "opacity-50", c === "inside" && "ring-2 ring-primary ring-inset", (c === "before" || c === "after") && "before:pointer-events-none before:absolute before:start-(--indent) before:end-1 before:h-0.5 before:rounded-full before:bg-primary", c === "before" && "before:-top-px", c === "after" && "before:-bottom-px"),
			children: [
				/* @__PURE__ */ j("span", {
					"data-tree-toggle": "",
					"aria-hidden": "true",
					onClick: (n) => {
						n.stopPropagation(), e.hasChildren && de(t);
					},
					className: "flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
					children: e.hasChildren && /* @__PURE__ */ j(B, { className: J("size-4 transition-transform duration-150 motion-reduce:transition-none", e.expanded ? "rotate-90" : "rtl:rotate-180") })
				}),
				/* @__PURE__ */ j(l, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": "true"
				}),
				e.draft || s ? /* @__PURE__ */ j(to, {
					initial: e.node.label,
					label: h.nameInput,
					onDone: be
				}) : /* @__PURE__ */ j("span", {
					className: "min-w-0 flex-1 truncate",
					children: e.node.label
				}),
				o !== void 0 && !s && /* @__PURE__ */ j("span", {
					"aria-hidden": "true",
					className: J("shrink-0 px-1 text-xs text-muted-foreground tabular-nums", v && "group-hover/line:hidden group-focus-visible/line:hidden", E === t && "hidden"),
					children: o
				}),
				i && !e.draft && !s && /* @__PURE__ */ j(Nn, {
					delayDuration: 300,
					children: /* @__PURE__ */ M(Pn, { children: [/* @__PURE__ */ j(Fn, {
						asChild: !0,
						children: /* @__PURE__ */ j("span", {
							"data-tree-edit": "",
							"aria-hidden": "true",
							onClick: (e) => {
								e.stopPropagation(), i(t);
							},
							className: J("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex", E === t && "flex"),
							children: /* @__PURE__ */ j(Ee, { className: "size-3.5" })
						})
					}), /* @__PURE__ */ j(In, { children: h.edit })] })
				}),
				v && !e.draft && !s && /* @__PURE__ */ M(Fi, {
					open: E === t,
					onOpenChange: (e) => D(e ? t : null),
					children: [/* @__PURE__ */ j(Ii, {
						asChild: !0,
						children: /* @__PURE__ */ j("span", {
							"data-tree-menu": "",
							"aria-hidden": "true",
							tabIndex: -1,
							onClick: (e) => e.stopPropagation(),
							className: J("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex data-[state=open]:flex"),
							children: /* @__PURE__ */ j(le, { className: "size-4" })
						})
					}), E === t && Ae(e)]
				})
			]
		}, t);
	};
	return /* @__PURE__ */ M("div", {
		className: J("flex flex-col gap-1", g),
		children: [
			/* @__PURE__ */ M("div", {
				className: "flex h-8 items-center justify-between gap-2 ps-2",
				children: [/* @__PURE__ */ j("h2", {
					id: y,
					className: "text-xs font-medium text-muted-foreground",
					children: h.heading
				}), _ && /* @__PURE__ */ j(Kn, {
					label: h.add,
					icon: /* @__PURE__ */ j(ke, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					onClick: () => G(null),
					className: "size-7"
				})]
			}),
			H.length === 0 ? /* @__PURE__ */ j("p", {
				className: "px-2 py-1 text-sm text-muted-foreground",
				children: h.empty
			}) : /* @__PURE__ */ j("div", {
				ref: ie,
				role: "tree",
				"aria-labelledby": y,
				onKeyDown: Se,
				className: "flex flex-col",
				children: H.map((e) => je(e))
			}),
			ne && /* @__PURE__ */ j("div", {
				"data-tree-end": "",
				"aria-hidden": "true",
				className: J("mt-1 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground", ne.target?.zone === "end" && "border-primary text-foreground"),
				children: h.topLevel
			}),
			/* @__PURE__ */ j("div", {
				"aria-live": "polite",
				className: "sr-only",
				children: ee
			}),
			_ && Oe && /* @__PURE__ */ j(fr, {
				open: !0,
				onOpenChange: (e) => !e && k(null),
				children: /* @__PURE__ */ M(gr, {
					onCloseAutoFocus: (e) => {
						e.preventDefault();
						let t = z.current ?? Oe.id;
						z.current = null, I.current.get(t)?.focus();
					},
					children: [/* @__PURE__ */ M(_r, { children: [/* @__PURE__ */ j(yr, { children: h.confirmDeleteTitle(Oe.label) }), /* @__PURE__ */ j(br, { children: h.confirmDelete(Oe.label, Ze(e, Oe.id).length - 1, a?.[Oe.id] ?? 0) })] }), /* @__PURE__ */ M(vr, { children: [/* @__PURE__ */ j(Sr, { children: h.cancel }), /* @__PURE__ */ j(xr, {
						onClick: () => {
							z.current = ve(Oe.id) ?? null;
						},
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						children: h.deleteConfirm
					})] })]
				})
			})
		]
	});
}
//#endregion
//#region src/organisms/ChatComposer/ChatComposer.tsx
var ro = 160;
function io({ onSend: e, labels: t, error: n, attachmentsError: r, replyTo: i = null, onClearReply: a, onSent: o, allowAttachments: s = !0, disabled: u = !1, acceptedMimes: d = lt, maxAttachmentMb: m = 25, maxAttachments: h = 5, className: g }) {
	let _ = l(), v = l(), y = f(null), b = f(null), x = f(!0), [S, C] = p(""), [w, T] = p([]), [E, D] = p(!1), [O, k] = p(null);
	c(() => (x.current = !0, () => {
		x.current = !1;
	}), []);
	let ee = i?.id ?? null;
	c(() => {
		ee !== null && y.current?.focus();
	}, [ee]);
	let te = () => {
		let e = y.current;
		e && (e.style.height = "auto", e.style.height = `${Math.min(e.scrollHeight, ro)}px`);
	}, N = !u && (S.trim() !== "" || w.length > 0), ne = w.length >= h, re = (e) => {
		let n = Array.from(e.target.files ?? []);
		if (e.target.value = "", n.length === 0) return;
		let r = ht(w, n, {
			maxFiles: h,
			maxSizeMb: m
		});
		T(r.files);
		let i = r.rejected[0];
		i ? i.reason === "too_large" ? k(t.fileTooLarge(i.file.name, m)) : k(t.tooManyFiles(h)) : k(null);
	}, P = async (t) => {
		if (t?.preventDefault(), !E && N) {
			D(!0);
			try {
				await e(S.trim(), w, { replyTo: i });
			} catch {
				return;
			} finally {
				x.current && D(!1);
			}
			x.current && (C(""), T([]), k(null), y.current && (y.current.style.height = "auto"), a?.(), o?.(), y.current?.focus());
		}
	}, F = (e) => {
		e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing || (e.preventDefault(), P());
	}, I = [
		n,
		r,
		O
	].filter((e) => typeof e == "string" && e !== "");
	return /* @__PURE__ */ M("form", {
		onSubmit: (e) => void P(e),
		"aria-busy": E,
		className: J("border-t border-border bg-card px-3 py-3 sm:px-4", g),
		children: [
			i && /* @__PURE__ */ M("div", {
				className: "mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ j("span", {
					className: "truncate",
					children: t.replyingTo(i.name)
				}), /* @__PURE__ */ j(Kn, {
					label: t.cancelReply,
					icon: /* @__PURE__ */ j(K, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					className: "size-6 shrink-0",
					onClick: a
				})]
			}),
			w.length > 0 && /* @__PURE__ */ j("ul", {
				className: "mb-2 flex flex-wrap gap-2",
				children: w.map((e, n) => /* @__PURE__ */ M("li", {
					className: "flex items-center gap-1 rounded-md border border-border bg-card py-1 pr-1 pl-2 text-xs",
					children: [/* @__PURE__ */ j("span", {
						className: "max-w-[12rem] truncate text-foreground",
						children: e.name
					}), /* @__PURE__ */ j(Kn, {
						label: t.removeFile(e.name),
						icon: /* @__PURE__ */ j(K, {
							className: "size-3",
							"aria-hidden": "true"
						}),
						destructive: !0,
						disabled: E,
						className: "size-6",
						onClick: () => T(w.filter((e, t) => t !== n))
					})]
				}, `${e.name}-${n}`))
			}),
			/* @__PURE__ */ M("div", {
				className: "flex items-end gap-2",
				children: [
					s && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("input", {
						ref: b,
						type: "file",
						multiple: !0,
						hidden: !0,
						tabIndex: -1,
						accept: d.join(","),
						onChange: re
					}), /* @__PURE__ */ j(Kn, {
						label: t.attach,
						icon: /* @__PURE__ */ j(we, {
							className: "size-5",
							"aria-hidden": "true"
						}),
						disabled: u || E || ne,
						onClick: () => b.current?.click(),
						className: "shrink-0 rounded-full"
					})] }),
					/* @__PURE__ */ j("label", {
						htmlFor: _,
						className: "sr-only",
						children: t.message
					}),
					/* @__PURE__ */ j(or, {
						id: _,
						ref: y,
						rows: 1,
						value: S,
						readOnly: E,
						disabled: u,
						onChange: (e) => {
							C(e.target.value), te();
						},
						onKeyDown: F,
						placeholder: t.placeholder,
						"aria-invalid": I.length > 0 || void 0,
						"aria-describedby": I.length > 0 ? v : void 0,
						className: "max-h-40 min-h-10 flex-1 resize-none rounded-2xl px-4 py-2"
					}),
					/* @__PURE__ */ j(Z, {
						type: "submit",
						size: "icon",
						disabled: !N || E,
						"aria-label": t.send,
						tooltip: t.send,
						className: "shrink-0 rounded-full",
						children: /* @__PURE__ */ j(Pe, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})
				]
			}),
			I.length > 0 && /* @__PURE__ */ j("div", {
				id: v,
				role: "alert",
				className: "space-y-1 pt-2 text-sm text-destructive",
				children: I.map((e) => /* @__PURE__ */ j("p", { children: e }, e))
			})
		]
	});
}
//#endregion
//#region src/organisms/MessageList/MessageList.tsx
var ao = 3e5, oo = 200;
function so(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function co(e) {
	return e.own ? "__own" : e.authorId === void 0 ? `${e.authorName}|${e.authorBadge ?? ""}` : `id:${e.authorId}`;
}
function lo(e) {
	return typeof e.body == "string" && e.body.trim() !== "";
}
function uo({ messages: e, labels: t, onReply: n, onDelete: r, canDelete: i = !1, onLoadOlder: a, hasOlder: o = !1, formatTime: s = so, className: c }) {
	let l = f(null), d = f(!0), m = f(null), [h, g] = p(!1);
	u(() => {
		let t = l.current;
		if (!t) return;
		let n = e[0]?.id, r = e[e.length - 1], i = r?.id, a = m.current;
		a === null ? t.scrollTop = t.scrollHeight : i === a.last ? n !== a.first && (t.scrollTop += t.scrollHeight - a.height) : (d.current || r?.own) && (t.scrollTop = t.scrollHeight), m.current = {
			first: n,
			last: i,
			height: t.scrollHeight
		};
	}, [e]);
	let _ = (e) => typeof i == "function" ? i(e) : i, v = async () => {
		if (a && !h) {
			g(!0);
			try {
				await a();
			} catch {} finally {
				g(!1);
			}
		}
	}, y = (e) => {
		let i = r !== void 0 && _(e);
		return !n && !i ? null : /* @__PURE__ */ M("div", {
			className: "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100",
			children: [n && /* @__PURE__ */ j(Kn, {
				label: t.reply,
				icon: /* @__PURE__ */ j(ce, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				onClick: () => n(e)
			}), i && /* @__PURE__ */ j(Kn, {
				label: t.delete,
				icon: /* @__PURE__ */ j(Re, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				destructive: !0,
				onClick: () => r(e)
			})]
		});
	};
	return /* @__PURE__ */ M("div", {
		ref: l,
		role: "log",
		"aria-live": "polite",
		"aria-relevant": "additions text",
		"aria-label": t.log,
		"aria-busy": h,
		tabIndex: 0,
		onScroll: (e) => {
			let t = e.currentTarget;
			d.current = t.scrollHeight - t.scrollTop - t.clientHeight < oo;
		},
		className: J("min-h-0 flex-1 overflow-y-auto bg-background px-3 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-4", c),
		children: [o && a && t.loadOlder && /* @__PURE__ */ j("div", {
			className: "mb-4 flex justify-center",
			children: /* @__PURE__ */ j(Z, {
				type: "button",
				variant: "outline",
				size: "sm",
				disabled: h,
				onClick: () => void v(),
				children: t.loadOlder
			})
		}), e.length === 0 ? /* @__PURE__ */ j("p", {
			className: "flex h-full min-h-24 items-center justify-center text-center text-sm text-muted-foreground",
			children: t.empty
		}) : /* @__PURE__ */ j("ol", {
			className: "flex flex-col gap-0.5",
			children: e.map((n, r) => {
				let i = e[r - 1], a = !i || co(i) !== co(n) || new Date(n.sentAt).getTime() - new Date(i.sentAt).getTime() > ao, o = n.own === !0, c = n.attachments ?? [], l = s(n.sentAt), u = /* @__PURE__ */ j("time", {
					dateTime: n.sentAt,
					className: J("ml-2 inline-block translate-y-px align-baseline text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
					children: l
				});
				return /* @__PURE__ */ M("li", {
					"data-own": o || void 0,
					className: J("group flex gap-1.5 sm:gap-2", a && "mt-4 first:mt-0", o ? "flex-row-reverse" : "flex-row"),
					children: [!o && /* @__PURE__ */ j("div", {
						className: "w-7 shrink-0 sm:w-8",
						children: a && /* @__PURE__ */ j(Zn, {
							name: n.authorName,
							className: "size-7 text-xs sm:size-8"
						})
					}), /* @__PURE__ */ M("div", {
						className: J("flex max-w-[88%] min-w-0 flex-col sm:max-w-[78%]", o ? "items-end" : "items-start"),
						children: [a && !o && /* @__PURE__ */ M("div", {
							className: "mb-0.5 flex items-center gap-2 px-1",
							children: [
								/* @__PURE__ */ j("span", {
									className: "text-xs font-semibold text-foreground",
									children: n.authorName
								}),
								n.authorBadge && /* @__PURE__ */ j(Mn, {
									variant: "secondary",
									className: "px-1.5 py-0 text-[10px]",
									children: n.authorBadge
								}),
								n.authorNote && n.authorNote !== n.authorName && /* @__PURE__ */ M("span", {
									className: "text-[10px] font-normal text-muted-foreground",
									children: [
										"(",
										n.authorNote,
										")"
									]
								})
							]
						}), /* @__PURE__ */ M("div", {
							className: "flex items-center gap-1",
							children: [
								o && !n.deleted && y(n),
								/* @__PURE__ */ M("div", {
									className: J("max-w-full min-w-0 rounded-2xl px-3.5 py-2 text-sm", o ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted text-foreground", n.deleted && "bg-muted text-muted-foreground italic"),
									children: [
										n.replyTo && /* @__PURE__ */ j("div", {
											className: J("mb-1 rounded-md border-l-2 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words", o ? "border-primary-foreground/60 bg-primary-foreground/20" : "border-foreground/30 bg-foreground/5"),
											children: n.replyTo.deleted ? /* @__PURE__ */ j("em", { children: t.replyPreviewDeleted }) : /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("span", {
												className: "font-semibold",
												children: n.replyTo.authorName
											}), n.replyTo.preview ? `: ${n.replyTo.preview}` : ""] })
										}),
										n.deleted ? /* @__PURE__ */ M("p", {
											className: "text-sm",
											children: [t.deleted, u]
										}) : lo(n) ? /* @__PURE__ */ M("p", {
											className: "text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap sm:text-base",
											children: [n.body, u]
										}) : null,
										!n.deleted && c.length > 0 && t.attachments && /* @__PURE__ */ j("div", {
											className: "mt-2 max-w-full min-w-0",
											children: /* @__PURE__ */ j(Vr, {
												items: c,
												labels: t.attachments
											})
										}),
										!n.deleted && !lo(n) && /* @__PURE__ */ j("time", {
											dateTime: n.sentAt,
											className: J("mt-1 block text-right text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
											children: l
										})
									]
								}),
								!o && !n.deleted && y(n)
							]
						})]
					})]
				}, n.id);
			})
		})]
	});
}
//#endregion
//#region src/organisms/Conversation/Conversation.tsx
function fo({ title: e, subtitle: t, actions: n, onBack: r, notice: i, messages: a, labels: o, onSend: s, sendError: c, attachmentsError: u, readOnly: d = !1, lockedNotice: f, allowAttachments: m, replies: h = !1, onDelete: g, canDelete: _, onLoadOlder: v, hasOlder: y, formatTime: b, className: x }) {
	let S = l(), [C, w] = p(null);
	return /* @__PURE__ */ M("section", {
		"aria-labelledby": S,
		className: J("flex h-full min-h-0 flex-col bg-card text-card-foreground", x),
		children: [
			/* @__PURE__ */ M("header", {
				className: "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4",
				children: [
					r && o.back && /* @__PURE__ */ j(Kn, {
						label: o.back,
						icon: /* @__PURE__ */ j(re, {
							className: "size-4",
							"aria-hidden": "true"
						}),
						onClick: r,
						className: "md:hidden"
					}),
					/* @__PURE__ */ M("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ j("h2", {
							id: S,
							className: "truncate text-sm font-semibold text-foreground",
							children: e
						}), t && /* @__PURE__ */ j("p", {
							className: "truncate text-xs text-muted-foreground",
							children: t
						})]
					}),
					n && /* @__PURE__ */ j("div", {
						className: "flex shrink-0 items-center gap-1",
						children: n
					})
				]
			}),
			i && /* @__PURE__ */ j("p", {
				role: "status",
				className: "shrink-0 border-b border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground",
				children: i
			}),
			/* @__PURE__ */ j(uo, {
				messages: a,
				labels: o.messages,
				onReply: h && !d && !f ? (e) => w({
					id: e.id,
					name: e.authorName
				}) : void 0,
				onDelete: g,
				canDelete: _,
				onLoadOlder: v,
				hasOlder: y,
				formatTime: b
			}),
			f ? /* @__PURE__ */ j("p", {
				role: "alert",
				className: "shrink-0 border-t border-border bg-card p-3 text-center text-sm text-muted-foreground",
				children: f
			}) : d ? null : /* @__PURE__ */ j(io, {
				labels: o.composer,
				onSend: s,
				error: c,
				attachmentsError: u,
				allowAttachments: m,
				replyTo: C,
				onClearReply: () => w(null),
				className: "shrink-0"
			})
		]
	});
}
//#endregion
//#region src/organisms/DataGrid/DataGrid.tsx
var po = 16, mo = 64, ho = 200;
function go(e, t = !1) {
	if (e.pinned) return {
		position: "sticky",
		[e.pinned]: e.offset,
		zIndex: t ? 30 : 10
	};
}
function _o({ grid: e, labels: t, rowLabel: n, renderDetail: r, renderFilter: i, loading: a = !1, error: o = null, onRetry: s, emptyState: c, virtualize: u, className: d }) {
	let m = l(), h = f(null), [g, _] = p(null), [v, y] = p(null), b = e.layout, x = (e.showCheckboxes ? 40 : 0) + (e.hasExpandableRows ? 40 : 0) + b.reduce((e, t) => e + t.width, 0), S = +!!e.showCheckboxes + +!!e.hasExpandableRows + b.length, C = e.columns.find((e) => e.id === b[0]?.id) ?? e.columns[0], w = (e) => n?.(e) ?? (C ? String(Tt(C, e) ?? "") : ""), T = Ht(e.preferences.values.columnOrder, e.columns.map((e) => e.id)), E = e.lines, D = u ?? E.length >= ho, O = e.preferences.values.density === "compact" ? 37 : 49, k = qe({
		count: D ? E.length : 0,
		getScrollElement: () => h.current?.closest("[data-grid-scroll]") ?? h.current?.parentElement ?? null,
		estimateSize: () => O,
		overscan: 12
	}), A = D ? k.getVirtualItems() : null, ee = A ? A.map((e) => ({
		index: e.index,
		line: E[e.index]
	})) : E.map((e, t) => ({
		index: t,
		line: e
	})), te = A && A.length ? A[0].start : 0, N = A && A.length ? k.getTotalSize() - A[A.length - 1].end : 0, ne = (t) => {
		let n = h.current?.querySelectorAll(`[data-col="${CSS.escape(t)}"] [data-cell-content]`), r = 0;
		n?.forEach((e) => r = Math.max(r, e.getBoundingClientRect().width, e.scrollWidth)), e.setColumnWidth(t, r + 72);
	}, re = (t, n) => {
		let r = b.findIndex((e) => e.id === t), i = b[r + n];
		i && e.moveColumn(t, T.indexOf(i.id));
	}, P = f(null), F = f(!1), I = (e, t) => (document.elementFromPoint?.(e, t)?.closest("th[data-col]"))?.dataset.col ?? null, ie = (t, n) => {
		if (t.button !== 0 || t.target.closest("[role=separator],[aria-haspopup]")) return;
		P.current = {
			id: n,
			x: t.clientX,
			y: t.clientY,
			moved: !1
		};
		let r = (e) => {
			let t = P.current;
			t && (!t.moved && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 6 || (t.moved = !0, _(I(e.clientX, e.clientY))));
		}, i = (t) => {
			window.removeEventListener("pointermove", r), window.removeEventListener("pointerup", i);
			let n = P.current;
			if (P.current = null, _(null), !n?.moved) return;
			F.current = !0, window.setTimeout(() => F.current = !1, 0);
			let a = I(t.clientX, t.clientY);
			a && a !== n.id && e.moveColumn(n.id, T.indexOf(a));
		};
		window.addEventListener("pointermove", r), window.addEventListener("pointerup", i);
	}, L = a && !o, R = L && e.visibleRows.length === 0, z = !a && !o && E.length === 0;
	return /* @__PURE__ */ M("div", {
		className: J("relative", d),
		children: [/* @__PURE__ */ j("div", {
			role: "status",
			className: "sr-only",
			children: L ? t.loading : ""
		}), /* @__PURE__ */ M("table", {
			ref: h,
			"aria-label": t.table,
			"aria-busy": L || void 0,
			...e.getTableProps(),
			style: {
				width: x,
				tableLayout: "fixed"
			},
			className: J("caption-bottom border-separate border-spacing-0 text-sm", L && !R && "opacity-60"),
			children: [
				/* @__PURE__ */ M("colgroup", { children: [
					e.showCheckboxes && /* @__PURE__ */ j("col", { style: { width: 40 } }),
					e.hasExpandableRows && /* @__PURE__ */ j("col", { style: { width: 40 } }),
					b.map((e) => /* @__PURE__ */ j("col", { style: { width: e.width } }, e.id))
				] }),
				/* @__PURE__ */ j("thead", { children: /* @__PURE__ */ M("tr", {
					className: "border-b border-border",
					children: [
						e.showCheckboxes && /* @__PURE__ */ j("th", {
							className: "h-10 border-b border-border bg-muted px-3 text-left",
							style: {
								position: "sticky",
								left: 0,
								zIndex: 30
							},
							children: /* @__PURE__ */ j("input", { ...e.getSelectAllProps(t.selectAll) })
						}),
						e.hasExpandableRows && /* @__PURE__ */ j("th", {
							className: "h-10 border-b border-border bg-muted",
							style: {
								position: "sticky",
								left: e.showCheckboxes ? 40 : 0,
								zIndex: 30
							},
							children: t.detailsColumn && /* @__PURE__ */ j("span", {
								className: "sr-only",
								children: t.detailsColumn
							})
						}),
						b.map((n, r) => {
							let a = e.columns.find((e) => e.id === n.id);
							return /* @__PURE__ */ j(vo, {
								grid: e,
								column: a,
								layout: n,
								labels: t,
								isFirst: r === 0,
								isLast: r === b.length - 1,
								dragOver: g === n.id,
								onHeaderPointerDown: ie,
								shouldIgnoreClick: () => F.current,
								onAutosize: () => ne(n.id),
								onMove: (e) => re(n.id, e),
								filterOpen: v === n.id,
								onFilterOpenChange: (e) => y(e ? n.id : null),
								renderFilter: i
							}, n.id);
						})
					]
				}) }),
				te > 0 && /* @__PURE__ */ j("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ j("tr", { style: { height: te } })
				}),
				R && Array.from({ length: 5 }, (e, t) => /* @__PURE__ */ j("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ j("tr", {
						"data-skeleton": "",
						children: Array.from({ length: S }, (e, t) => /* @__PURE__ */ j("td", {
							className: "border-b border-border px-3 py-3",
							children: /* @__PURE__ */ j("span", { className: "block h-3 w-3/4 animate-pulse rounded bg-muted" })
						}, t))
					})
				}, `s${t}`)),
				o && /* @__PURE__ */ j("tbody", { children: /* @__PURE__ */ j("tr", { children: /* @__PURE__ */ j("td", {
					colSpan: S,
					className: "px-4 py-10",
					children: /* @__PURE__ */ M("div", {
						role: "alert",
						className: "flex flex-col items-center gap-2 text-center",
						children: [
							/* @__PURE__ */ j("p", {
								className: "font-medium",
								children: t.errorTitle
							}),
							/* @__PURE__ */ j("p", {
								className: "text-sm text-muted-foreground",
								children: o
							}),
							s && /* @__PURE__ */ j(Z, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: s,
								children: t.retry
							})
						]
					})
				}) }) }),
				z && /* @__PURE__ */ j("tbody", { children: /* @__PURE__ */ j("tr", { children: /* @__PURE__ */ j("td", {
					colSpan: S,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: c ?? t.empty
				}) }) }),
				!o && ee.map(({ index: n, line: i }) => /* @__PURE__ */ j("tbody", {
					"data-index": n,
					ref: D ? k.measureElement : void 0,
					children: i.kind === "group" ? /* @__PURE__ */ j(bo, {
						grid: e,
						group: i.group,
						labels: t
					}) : /* @__PURE__ */ j(xo, {
						grid: e,
						row: i.row,
						id: i.id,
						depth: i.depth,
						name: w(i.row),
						labels: t,
						detailId: `${m}-detail-${String(i.id)}`,
						renderDetail: r,
						colSpan: S
					})
				}, i.kind === "group" ? `g:${i.group.key}` : `r:${String(i.id)}`)),
				N > 0 && /* @__PURE__ */ j("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ j("tr", { style: { height: N } })
				})
			]
		})]
	});
}
function vo({ grid: e, column: t, layout: n, labels: r, isFirst: i, isLast: a, dragOver: o, onHeaderPointerDown: s, shouldIgnoreClick: c, onAutosize: l, onMove: u, filterOpen: d, onFilterOpenChange: p, renderFilter: m }) {
	let h = t.sortable !== !1, g = e.sorting.findIndex((e) => e.id === t.id), _ = g >= 0 ? e.sorting[g] : void 0, v = e.filters.some((e) => e.id === t.id), y = _ ? _.desc ? N : P : ne, b = e.groupBy.includes(t.id), x = f(!1);
	return /* @__PURE__ */ M("th", {
		"data-col": t.id,
		"aria-sort": h ? _ ? _.desc ? "descending" : "ascending" : "none" : void 0,
		style: {
			width: n.width,
			...go(n, !0)
		},
		onPointerDown: (e) => s(e, t.id),
		className: J("group/th relative border-b border-border bg-muted px-2 text-left align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase select-none", e.preferences.values.density === "compact" ? "h-8" : "h-10", !a && "border-r", o && "bg-accent", n.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", t.align === "right" && "text-right"),
		children: [/* @__PURE__ */ M(Ji, {
			open: d,
			onOpenChange: p,
			children: [/* @__PURE__ */ j(Xi, {
				asChild: !0,
				children: /* @__PURE__ */ M("div", {
					className: J("flex min-w-0 items-center gap-0.5", t.align === "right" && "flex-row-reverse"),
					children: [
						h ? /* @__PURE__ */ M("button", {
							type: "button",
							onClick: (n) => {
								c() || e.toggleSort(t.id, n.shiftKey);
							},
							className: "flex min-w-0 items-center gap-1 rounded px-1 py-1 uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
							children: [
								/* @__PURE__ */ j("span", {
									"data-cell-content": !0,
									className: "truncate",
									children: t.header
								}),
								/* @__PURE__ */ j(y, {
									"aria-hidden": "true",
									className: J("size-3.5 shrink-0", !_ && "opacity-0 group-hover/th:opacity-60")
								}),
								_ && e.sorting.length > 1 && /* @__PURE__ */ j("span", {
									"aria-hidden": "true",
									className: "text-[10px] tabular-nums",
									children: g + 1
								})
							]
						}) : /* @__PURE__ */ j("span", {
							"data-cell-content": !0,
							className: "truncate px-1",
							children: t.header
						}),
						v && /* @__PURE__ */ j(G, {
							"aria-hidden": "true",
							className: "size-3 shrink-0 text-foreground"
						}),
						/* @__PURE__ */ M(Fi, { children: [/* @__PURE__ */ j(Ii, {
							asChild: !0,
							children: /* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon-xs",
								"aria-label": r.columnMenu(t.header),
								className: "ml-auto shrink-0 text-muted-foreground opacity-60 group-hover/th:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
								children: /* @__PURE__ */ j(le, { "aria-hidden": "true" })
							})
						}), /* @__PURE__ */ M(Ri, {
							align: "start",
							className: "normal-case",
							onCloseAutoFocus: (e) => {
								x.current && (x.current = !1, e.preventDefault(), p(!0));
							},
							children: [
								h && /* @__PURE__ */ M(A, { children: [
									/* @__PURE__ */ j(Q, {
										onSelect: () => e.setSorting([{
											id: t.id,
											desc: !1
										}]),
										children: r.sortAscending
									}),
									/* @__PURE__ */ j(Q, {
										onSelect: () => e.setSorting([{
											id: t.id,
											desc: !0
										}]),
										children: r.sortDescending
									}),
									_ && /* @__PURE__ */ j(Q, {
										onSelect: () => e.setSorting(e.sorting.filter((e) => e.id !== t.id)),
										children: r.clearSort
									}),
									/* @__PURE__ */ j($, {})
								] }),
								t.filter && m && /* @__PURE__ */ j(Q, {
									onSelect: () => x.current = !0,
									children: r.filter
								}),
								t.groupable && e.canGroup && /* @__PURE__ */ j(Q, {
									onSelect: () => e.setGroupBy(b ? e.groupBy.filter((e) => e !== t.id) : [...e.groupBy, t.id]),
									children: b ? r.ungroup : r.groupBy
								}),
								n.pinned !== "left" && /* @__PURE__ */ j(Q, {
									onSelect: () => e.pinColumn(t.id, "left"),
									children: r.pinLeft
								}),
								n.pinned !== "right" && /* @__PURE__ */ j(Q, {
									onSelect: () => e.pinColumn(t.id, "right"),
									children: r.pinRight
								}),
								n.pinned && /* @__PURE__ */ j(Q, {
									onSelect: () => e.pinColumn(t.id, null),
									children: r.unpin
								}),
								/* @__PURE__ */ j($, {}),
								!i && /* @__PURE__ */ j(Q, {
									onSelect: () => u(-1),
									children: r.moveLeft
								}),
								!a && /* @__PURE__ */ j(Q, {
									onSelect: () => u(1),
									children: r.moveRight
								}),
								/* @__PURE__ */ j(Q, {
									onSelect: l,
									children: r.autosize
								}),
								t.hideable !== !1 && /* @__PURE__ */ j(Q, {
									onSelect: () => e.preferences.setColumnVisible(t.id, !1),
									children: r.hide
								})
							]
						})] })
					]
				})
			}), m && t.filter && /* @__PURE__ */ j(Zi, {
				align: "start",
				className: "w-72 tracking-normal normal-case",
				children: m(t, () => p(!1))
			})]
		}), /* @__PURE__ */ j(yo, {
			grid: e,
			column: t,
			layout: n,
			labels: r,
			onAutosize: l
		})]
	});
}
function yo({ grid: e, column: t, layout: n, labels: r, onAutosize: i }) {
	let a = f(null), o = t.minWidth ?? 64, s = t.maxWidth ?? 640;
	return /* @__PURE__ */ j("div", {
		role: "separator",
		"aria-orientation": "vertical",
		"aria-label": r.resize(t.header),
		"aria-valuenow": n.width,
		"aria-valuemin": o,
		"aria-valuemax": s,
		tabIndex: 0,
		onPointerDown: (e) => {
			if (e.button !== 0) return;
			e.preventDefault(), e.stopPropagation(), e.currentTarget.setPointerCapture?.(e.pointerId);
			let t = e.currentTarget.closest("[dir=rtl]") !== null;
			a.current = {
				x: e.clientX,
				width: n.width,
				dir: t ? -1 : 1
			};
		},
		onPointerMove: (n) => {
			if (!a.current) return;
			let r = a.current.width + (n.clientX - a.current.x) * a.current.dir;
			e.setColumnWidth(t.id, Math.min(s, Math.max(o, r)));
		},
		onPointerUp: () => a.current = null,
		onPointerCancel: () => a.current = null,
		onDoubleClick: i,
		onKeyDown: (r) => {
			let a = r.shiftKey ? mo : po, c = r.currentTarget.closest("[dir=rtl]") !== null, l = c ? "ArrowLeft" : "ArrowRight", u = c ? "ArrowRight" : "ArrowLeft", d = {
				[l]: () => n.width + a,
				[u]: () => n.width - a,
				Home: () => o,
				End: () => s
			};
			if (r.key === "Enter") {
				r.preventDefault(), i();
				return;
			}
			let f = d[r.key];
			f && (r.preventDefault(), r.stopPropagation(), e.setColumnWidth(t.id, Math.min(s, Math.max(o, f()))));
		},
		onClick: (e) => e.stopPropagation(),
		className: "group/rs absolute inset-y-0 -end-1 z-10 w-2 cursor-col-resize outline-none",
		children: /* @__PURE__ */ j("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-1 start-1/2 w-0.5 -translate-x-1/2 rounded bg-transparent transition-colors group-hover/rs:bg-ring group-focus-visible/rs:bg-ring"
		})
	});
}
function bo({ grid: e, group: t, labels: n }) {
	let r = e.isGroupExpanded(t.key), i = e.columns.find((e) => e.id === t.columnId), a = t.value === null ? n.emptyGroupValue : String(t.value), o = r ? R : B, s = +!!e.showCheckboxes + +!!e.hasExpandableRows;
	return /* @__PURE__ */ M("tr", {
		"data-grid-group": t.key,
		className: "bg-muted/40",
		children: [s > 0 && /* @__PURE__ */ j("td", {
			role: "gridcell",
			colSpan: s,
			className: "border-b border-border"
		}), e.layout.map((s, c) => {
			let l = e.columns.find((e) => e.id === s.id), u = t.aggregates[s.id];
			return /* @__PURE__ */ j("td", {
				role: "gridcell",
				"data-col": s.id,
				style: go(s),
				className: J("border-b border-border px-3 py-2 text-sm font-medium", s.pinned && "bg-muted", l.align === "right" && "text-right tabular-nums"),
				children: c === 0 ? /* @__PURE__ */ M("button", {
					type: "button",
					"aria-expanded": r,
					onClick: () => e.toggleGroup(t.key),
					style: { paddingInlineStart: t.depth * 16 },
					className: "flex max-w-full items-center gap-1 rounded text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
					children: [/* @__PURE__ */ j(o, {
						"aria-hidden": "true",
						className: "size-4 shrink-0 rtl:rotate-180"
					}), /* @__PURE__ */ j("span", {
						className: "truncate",
						children: n.group(i?.header ?? t.columnId, a, t.rows.length)
					})]
				}) : u === void 0 ? null : l.formatAggregate?.(u) ?? u.toLocaleString()
			}, s.id);
		})]
	});
}
function xo({ grid: e, row: t, id: n, depth: r, name: i, labels: a, detailId: o, renderDetail: s, colSpan: c }) {
	let l = e.getRowProps(n), u = e.canExpand(t), d = e.isRowExpanded(n), f = "border-b border-border px-3 bg-card in-data-[state=selected]:bg-muted";
	return /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ M("tr", {
		...l,
		className: J("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", "[&>td:not(:last-child)]:border-r", l.className),
		children: [
			e.showCheckboxes && /* @__PURE__ */ j("td", {
				role: "gridcell",
				className: f,
				style: {
					position: "sticky",
					left: 0,
					zIndex: 10
				},
				children: /* @__PURE__ */ j("input", { ...e.getRowCheckboxProps(n, a.selectRow(i)) })
			}),
			e.hasExpandableRows && /* @__PURE__ */ j("td", {
				role: "gridcell",
				className: J(f, "px-1"),
				style: {
					position: "sticky",
					left: e.showCheckboxes ? 40 : 0,
					zIndex: 10
				},
				children: u && /* @__PURE__ */ j(Z, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": d ? a.collapse(i) : a.expand(i),
					"aria-expanded": d,
					"aria-controls": o,
					onClick: () => e.toggleRowExpanded(n),
					className: "text-muted-foreground",
					children: /* @__PURE__ */ j(B, {
						"aria-hidden": "true",
						className: J("transition-transform rtl:rotate-180", d && "rotate-90 rtl:rotate-90")
					})
				})
			}),
			e.layout.map((i, o) => {
				let s = e.columns.find((e) => e.id === i.id);
				return /* @__PURE__ */ j(So, {
					grid: e,
					row: t,
					rowId: n,
					column: s,
					layout: i,
					labels: a,
					indent: o === 0 ? r * 16 : 0
				}, i.id);
			})
		]
	}), u && d && /* @__PURE__ */ j("tr", {
		id: o,
		"data-grid-detail": "",
		children: /* @__PURE__ */ j("td", {
			colSpan: c,
			className: "border-b border-border bg-muted/30 p-0",
			children: s?.(t)
		})
	})] });
}
function So({ grid: e, row: t, rowId: n, column: r, layout: i, labels: a, indent: o }) {
	let s = e.cellValue(t, r.id), c = s !== Tt(r, t) && !r.value ? {
		...t,
		[r.id]: s
	} : t, l = r.cell ? r.cell(c) : s == null ? "" : String(s), u = typeof l == "string" ? l : s == null ? "" : String(s), d = e.editing?.rowId === n && e.editing.columnId === r.id;
	return /* @__PURE__ */ j("td", {
		role: "gridcell",
		"data-col": r.id,
		style: {
			...go(i),
			paddingInlineStart: o ? o + 12 : void 0
		},
		className: J("truncate border-b border-border px-3 align-middle", e.preferences.values.density === "compact" ? "py-1.5" : "py-3", i.pinned && "bg-card in-data-[state=selected]:bg-muted", i.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", r.align === "right" && "text-right tabular-nums"),
		children: d ? /* @__PURE__ */ j(Co, {
			grid: e,
			column: r,
			value: s,
			labels: a
		}) : r.editable ? /* @__PURE__ */ j("button", {
			type: "button",
			"aria-label": a.edit(r.header, u),
			onClick: () => e.startEdit(n, r.id),
			className: J("-mx-1 block w-full truncate rounded px-1 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", r.align === "right" && "text-right"),
			children: /* @__PURE__ */ j("span", {
				"data-cell-content": !0,
				children: l
			})
		}) : /* @__PURE__ */ j("span", {
			"data-cell-content": !0,
			children: l
		})
	});
}
function Co({ grid: e, column: t, value: n, labels: r }) {
	let i = t.editable, a = l(), [o, s] = p(n == null ? "" : String(n)), u = f(null);
	c(() => {
		u.current?.focus(), u.current instanceof HTMLInputElement && u.current.select();
	}, []);
	let d = (e) => i.type === "number" ? Number(e) : e, m = () => {
		if (o === String(n ?? "")) {
			e.cancelEdit();
			return;
		}
		e.commitEdit(d(o));
	}, h = {
		"aria-label": t.header,
		"aria-invalid": e.editError ? !0 : void 0,
		"aria-describedby": e.editError ? a : void 0,
		disabled: e.editPending,
		onKeyDown: (t) => {
			t.key === "Enter" ? (t.preventDefault(), m()) : t.key === "Escape" && (t.preventDefault(), t.stopPropagation(), e.cancelEdit());
		},
		className: "h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
	};
	return /* @__PURE__ */ M("div", {
		className: "relative",
		children: [
			i.type === "choice" ? /* @__PURE__ */ j("select", {
				ref: u,
				value: o,
				onChange: (e) => s(e.target.value),
				onBlur: m,
				...h,
				children: (i.options ?? []).map((e) => /* @__PURE__ */ j("option", {
					value: e.value,
					children: e.label
				}, e.value))
			}) : /* @__PURE__ */ j("input", {
				ref: u,
				type: i.type === "number" ? "number" : "text",
				value: o,
				onChange: (e) => s(e.target.value),
				onBlur: m,
				...h
			}),
			e.editPending && /* @__PURE__ */ j("span", {
				className: "sr-only",
				children: r.saving
			}),
			e.editError && /* @__PURE__ */ j("p", {
				id: a,
				className: "absolute top-full z-20 mt-1 rounded-md bg-destructive px-2 py-1 text-xs whitespace-normal text-destructive-foreground shadow-md",
				children: e.editError
			})
		]
	});
}
//#endregion
//#region src/organisms/GridActions/GridActions.tsx
function wo(e) {
	if (e) return e.replace(/\bMod\b/g, yt() ? "Meta" : "Control");
}
var To = 4;
function Eo({ label: e, items: t = [], selectedIds: n = [], shortcutLabels: i, moreLabel: a, children: o }) {
	let s = vt(t, gt(n.length)), c = s.flat(), l = f(null), d = f(null), [m, h] = p(null);
	u(() => {
		let e = l.current;
		if (!e || !a) return;
		let t = new ResizeObserver(() => {
			let t = e.getBoundingClientRect().width, n = e.querySelector("button")?.getBoundingClientRect().width;
			if (!t) return h(null);
			h((e) => ({
				bar: t,
				lead: d.current?.getBoundingClientRect().width ?? 0,
				button: n || e?.button || 32
			}));
		});
		return t.observe(e), d.current && t.observe(d.current), () => t.disconnect();
	}, [a]);
	let g = c.length;
	if (m && a) {
		let e = m.bar - (m.lead ? m.lead + To : 0), t = m.button + To;
		c.length * t - To > e && (g = Math.max(0, Math.floor((e + To) / t) - 1));
	}
	let [_, v] = p(null);
	_ !== null && (g = _);
	let y = new Set(c.slice(0, g).map((e) => e.id)), b = s.map((e) => e.filter((e) => !y.has(e.id))).filter((e) => e.length > 0);
	return /* @__PURE__ */ M("div", {
		ref: l,
		role: "toolbar",
		"aria-label": e,
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [
			/* @__PURE__ */ j("div", {
				ref: d,
				className: "flex shrink-0 items-center gap-1 empty:hidden",
				children: o
			}),
			c.filter((e) => y.has(e.id)).map((e) => /* @__PURE__ */ j(Do, {
				item: e,
				ids: n,
				shortcutLabels: i
			}, e.id)),
			a && b.length > 0 && /* @__PURE__ */ M(Fi, {
				onOpenChange: (e) => v(e ? g : null),
				children: [/* @__PURE__ */ j(Ii, {
					asChild: !0,
					children: /* @__PURE__ */ j(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": a,
						tooltip: a,
						className: "shrink-0 text-muted-foreground",
						children: /* @__PURE__ */ j(W, { "aria-hidden": "true" })
					})
				}), /* @__PURE__ */ j(Ri, {
					align: "start",
					className: "w-60",
					children: b.map((e, t) => /* @__PURE__ */ M(r, { children: [t > 0 && /* @__PURE__ */ j($, {}), e.map((e) => /* @__PURE__ */ M(Q, {
						disabled: _t(e, n),
						"aria-keyshortcuts": wo(e.shortcut),
						onSelect: () => e.onSelect(n),
						className: J(e.tone === "destructive" && "data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground data-[highlighted]:[&_svg]:text-destructive-foreground"),
						children: [
							/* @__PURE__ */ j("span", {
								className: "text-muted-foreground [&_svg]:size-4",
								children: e.icon
							}),
							e.label,
							e.shortcut && /* @__PURE__ */ j(Gi, { children: wt(e.shortcut, i) })
						]
					}, e.id))] }, e[0].id))
				})]
			})
		]
	});
}
function Do({ item: e, ids: t, shortcutLabels: n }) {
	let r = _t(e, t), i = r ? e.disabledReason : void 0, a = /* @__PURE__ */ M("span", {
		className: "flex flex-col gap-0.5",
		children: [/* @__PURE__ */ M("span", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ j("span", {
				className: "font-medium",
				children: e.label
			}), e.shortcut && /* @__PURE__ */ j("kbd", {
				className: "ml-auto font-sans text-muted-foreground",
				children: wt(e.shortcut, n)
			})]
		}), i && /* @__PURE__ */ j("span", {
			className: "text-muted-foreground",
			children: i
		})]
	});
	return /* @__PURE__ */ j(Z, {
		variant: e.tone === "primary" ? "default" : "ghost",
		size: "icon",
		"aria-label": e.label,
		"aria-keyshortcuts": wo(e.shortcut),
		tooltip: a,
		disabled: r,
		onClick: () => e.onSelect(t),
		className: J(e.tone !== "primary" && "text-muted-foreground", e.tone === "destructive" && "hover:bg-destructive hover:text-destructive-foreground"),
		children: e.icon
	});
}
function Oo({ items: e, ids: t, shortcutLabels: n }) {
	return /* @__PURE__ */ j(A, { children: e.map((e, i) => /* @__PURE__ */ M(r, { children: [i > 0 && /* @__PURE__ */ j(Mi, {}), e.map((e) => {
		let r = _t(e, t);
		return /* @__PURE__ */ M(ji, {
			tone: e.tone === "destructive" ? "destructive" : "default",
			disabled: r,
			"aria-keyshortcuts": wo(e.shortcut),
			onSelect: () => e.onSelect(t),
			children: [
				e.icon,
				/* @__PURE__ */ M("span", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ j("span", {
						className: J(e.isDefault && "font-semibold"),
						children: e.label
					}), r && e.disabledReason && /* @__PURE__ */ j("span", {
						className: "text-xs text-muted-foreground",
						children: e.disabledReason
					})]
				}),
				e.shortcut && /* @__PURE__ */ j(Pi, { children: wt(e.shortcut, n) })
			]
		}, e.id);
	})] }, e[0]?.id)) });
}
//#endregion
//#region src/organisms/LiveCanvas/LiveCanvas.tsx
var ko = i(null), Ao = (e, t) => `${e}-${t.replace(/[^A-Za-z0-9_-]/g, "_")}`;
function jo({ label: e, selected: t, onSelect: n, caption: r, artboardStyle: i, artboardClassName: a, dark: o = !1, pending: s = !1, children: c }) {
	let u = l(), [d, m] = p(null), h = f(null), g = () => Array.from(h.current?.querySelectorAll("[role=option]") ?? []), _ = d ?? t;
	return /* @__PURE__ */ j(ko.Provider, {
		value: {
			baseId: u,
			selected: t,
			active: _,
			select: n,
			setActive: m
		},
		children: /* @__PURE__ */ M("div", {
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted p-8",
			children: [r && /* @__PURE__ */ j("p", {
				className: "mx-auto mb-2 w-full max-w-4xl text-xs font-medium text-muted-foreground",
				children: r
			}), /* @__PURE__ */ j("div", {
				role: "presentation",
				onClick: () => n(null),
				style: i,
				className: J("theme-scope mx-auto w-full max-w-4xl rounded-xl border border-border bg-background p-8 text-foreground shadow-sm transition-opacity", o && "dark", s && "opacity-60", a),
				children: /* @__PURE__ */ j("div", {
					ref: h,
					role: "listbox",
					"aria-label": e,
					tabIndex: 0,
					"aria-activedescendant": _ ? Ao(u, _) : void 0,
					onKeyDown: (e) => {
						let r = g();
						if (r.length === 0) return;
						let i = r.findIndex((e) => e.dataset.target === _), a = (t) => {
							e.preventDefault();
							let n = r[(t + r.length) % r.length];
							n?.dataset.target && (m(n.dataset.target), n.scrollIntoView?.({
								block: "nearest",
								inline: "nearest"
							}));
						};
						switch (e.key) {
							case "ArrowDown":
							case "ArrowRight": return a(i < 0 ? 0 : i + 1);
							case "ArrowUp":
							case "ArrowLeft": return a(i < 0 ? r.length - 1 : i - 1);
							case "Home": return a(0);
							case "End": return a(r.length - 1);
							case "Enter":
							case " ":
								e.preventDefault(), _ !== null && n(_ === t ? null : _);
								return;
							case "Escape":
								t !== null && (e.preventDefault(), n(null));
								return;
						}
					},
					className: "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background",
					children: c
				})
			})]
		})
	});
}
function Mo({ id: e, label: t, wide: n = !1, children: r }) {
	let i = s(ko);
	if (!i) throw Error("LiveCanvasTarget must be inside a LiveCanvas");
	let a = i.selected === e, o = i.active === e;
	return /* @__PURE__ */ M("div", {
		id: Ao(i.baseId, e),
		tabIndex: -1,
		role: "option",
		"aria-selected": a,
		"aria-label": t,
		"data-target": e,
		"data-active": o || void 0,
		onClick: (t) => {
			t.stopPropagation(), i.setActive(e), i.select(a ? null : e);
		},
		className: J("relative cursor-pointer rounded-md outline-offset-4 transition-[outline-color]", n ? "w-full" : "w-fit", a ? "outline-2 outline-ring outline-solid" : "outline-1 outline-ring/25 outline-dashed hover:outline-ring/70", !a && o && "outline-2 outline-ring/70"),
		children: [a && /* @__PURE__ */ j("span", {
			"aria-hidden": "true",
			className: "absolute start-0 -top-6 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary-foreground",
			children: t
		}), /* @__PURE__ */ j("div", {
			inert: !0,
			children: r
		})]
	});
}
function No({ caption: e, children: t }) {
	return /* @__PURE__ */ M("div", {
		role: "group",
		"aria-label": e,
		className: "space-y-3",
		children: [/* @__PURE__ */ j("p", {
			"aria-hidden": "true",
			className: "text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase",
			children: e
		}), t]
	});
}
//#endregion
//#region src/organisms/PageViewer/PageViewer.tsx
function Po({ src: e, srcDoc: t, title: n, deviceWidth: r, interactive: i = !1, timeoutMs: a = 1e4, labels: o, overlay: s, onStatusChange: l, className: u }) {
	let { ref: d, available: m, scale: h } = yn(r), [g, _] = p(!1), [v, y] = p("idle"), [b, x] = p(0), S = f(null);
	c(() => {
		let e = S.current;
		if (!e || typeof IntersectionObserver > "u") {
			_(!0);
			return;
		}
		let t = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && (_(!0), t.disconnect());
		}, { rootMargin: "200px" });
		return t.observe(e), () => t.disconnect();
	}, []);
	let C = g ? v === "idle" ? "loading" : v : "waiting";
	return c(() => {
		l?.(C);
	}, [C, l]), c(() => {
		if (C !== "loading") return;
		let e = window.setTimeout(() => y("failed"), a);
		return () => window.clearTimeout(e);
	}, [
		C,
		a,
		b
	]), /* @__PURE__ */ M("div", {
		ref: (e) => {
			S.current = e, d.current = e;
		},
		"data-status": C,
		className: J("relative min-h-0 overflow-hidden rounded-lg border border-border bg-background", u),
		children: [C === "failed" ? /* @__PURE__ */ M("div", {
			role: "alert",
			className: "flex h-full flex-col items-center justify-center gap-3 p-4 text-center",
			children: [
				/* @__PURE__ */ j("p", {
					className: "text-sm font-semibold",
					children: o.failedTitle
				}),
				/* @__PURE__ */ j("p", {
					className: "text-xs text-muted-foreground",
					children: o.failedBody
				}),
				/* @__PURE__ */ j(Z, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => {
						y("idle"), x((e) => e + 1);
					},
					children: o.retry
				})
			]
		}) : g && /* @__PURE__ */ M("div", {
			className: "relative origin-top-left",
			style: {
				width: r,
				height: m === null ? "100%" : m.height / h,
				transform: `scale(${h})`
			},
			children: [/* @__PURE__ */ j("iframe", {
				src: e,
				srcDoc: t,
				title: n,
				loading: "lazy",
				inert: !i || void 0,
				onLoad: () => y((e) => e === "idle" ? "loaded" : e),
				className: "h-full w-full border-0 bg-background"
			}, b), s !== void 0 && /* @__PURE__ */ j("div", {
				className: "pointer-events-none absolute inset-0",
				children: s
			})]
		}), C === "loading" && /* @__PURE__ */ j("div", {
			role: "status",
			className: "pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-xs text-muted-foreground",
			children: o.loading
		})]
	});
}
//#endregion
//#region src/organisms/Sheet/Sheet.tsx
function Fo({ ...e }) {
	return /* @__PURE__ */ j(y.Root, {
		"data-slot": "sheet",
		...e
	});
}
var Io = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(y.Trigger, {
		ref: t,
		"data-slot": "sheet-trigger",
		...e
	});
});
Io.displayName = "SheetTrigger";
var Lo = n.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ j(y.Close, {
		ref: t,
		"data-slot": "sheet-close",
		...e
	});
});
Lo.displayName = "SheetClose";
function Ro({ ...e }) {
	return /* @__PURE__ */ j(y.Portal, {
		"data-slot": "sheet-portal",
		...e
	});
}
var zo = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(y.Overlay, {
		ref: n,
		"data-slot": "sheet-overlay",
		className: J("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
zo.displayName = "SheetOverlay";
var Bo = {
	left: "inset-y-0 left-0 h-full w-72 max-w-[85vw] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
	right: "inset-y-0 right-0 h-full w-72 max-w-[85vw] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
	bottom: "inset-x-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl border-t pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
	top: "inset-x-0 top-0 w-full max-h-[90vh] rounded-b-2xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
};
function Vo({ className: e }) {
	return /* @__PURE__ */ j("div", {
		"aria-hidden": "true",
		className: J("mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30", e)
	});
}
var Ho = n.forwardRef(function({ className: e, children: t, side: n = "left", showClose: r = !0, closeLabel: i, showHandle: a = !1, ...o }, s) {
	return /* @__PURE__ */ M(Ro, { children: [/* @__PURE__ */ j(zo, {}), /* @__PURE__ */ M(y.Content, {
		ref: s,
		"data-slot": "sheet-content",
		className: J("fixed z-50 flex flex-col gap-4 overflow-y-auto border-border bg-card text-card-foreground shadow-lg transition ease-[var(--motion-ease,cubic-bezier(0.4,0,0.2,1))] data-[state=closed]:animate-out data-[state=closed]:duration-[var(--motion-duration,200ms)] data-[state=open]:animate-in data-[state=open]:duration-[var(--motion-duration,300ms)]", Bo[n], e),
		...o,
		children: [
			a && /* @__PURE__ */ j(Vo, {}),
			t,
			r && /* @__PURE__ */ j(y.Close, {
				"aria-label": i,
				className: "absolute top-3 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
				children: /* @__PURE__ */ j(K, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				})
			})
		]
	})] });
});
Ho.displayName = "SheetContent";
var Uo = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(y.Title, {
		ref: n,
		"data-slot": "sheet-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
});
Uo.displayName = "SheetTitle";
var Wo = n.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ j(y.Description, {
		ref: n,
		"data-slot": "sheet-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
});
Wo.displayName = "SheetDescription";
//#endregion
//#region src/organisms/Sidebar/Sidebar.tsx
var Go = 16, Ko = 64;
function qo({ label: e, side: t = "left", resize: n, defaultWidth: r = 280, className: i, children: a }) {
	let o = _n({
		storageKey: n?.storageKey,
		defaultWidth: r,
		minWidth: n?.minWidth ?? 200,
		maxWidth: n?.maxWidth ?? 560
	}), s = n ? o.width : r;
	return /* @__PURE__ */ M("aside", {
		"aria-label": e,
		"data-side": t,
		style: { width: s },
		className: J("relative flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground", t === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border", i),
		children: [a, n && /* @__PURE__ */ j(Jo, {
			side: t,
			label: n.label,
			size: o
		})]
	});
}
function Jo({ side: e, label: t, size: n }) {
	let r = f(null), i = e === "left" ? 1 : -1, a = (e) => {
		e.button === 0 && (e.preventDefault(), e.currentTarget.setPointerCapture?.(e.pointerId), r.current = {
			x: e.clientX,
			width: n.width
		}, document.body.style.setProperty("cursor", "col-resize"), document.body.style.setProperty("user-select", "none"));
	}, o = (e) => {
		r.current && n.setWidth(r.current.width + (e.clientX - r.current.x) * i);
	}, s = () => {
		r.current = null, document.body.style.removeProperty("cursor"), document.body.style.removeProperty("user-select");
	};
	return /* @__PURE__ */ j("div", {
		role: "separator",
		"aria-label": t,
		"aria-orientation": "vertical",
		"aria-valuenow": n.width,
		"aria-valuemin": n.minWidth,
		"aria-valuemax": n.maxWidth,
		tabIndex: 0,
		"data-slot": "sidebar-resize-handle",
		onPointerDown: a,
		onPointerMove: o,
		onPointerUp: s,
		onPointerCancel: s,
		onDoubleClick: n.reset,
		onKeyDown: (e) => {
			let t = e.shiftKey ? Ko : Go, r = {
				ArrowRight: () => n.setWidth(n.width + t * i),
				ArrowLeft: () => n.setWidth(n.width - t * i),
				Home: () => n.setWidth(n.minWidth),
				End: () => n.setWidth(n.maxWidth),
				Enter: () => n.reset()
			}[e.key];
			r && (e.preventDefault(), r());
		},
		className: J("group absolute inset-y-0 z-20 w-2 cursor-col-resize outline-none", e === "left" ? "-right-1" : "-left-1"),
		children: /* @__PURE__ */ j("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors group-hover:bg-ring group-focus-visible:bg-ring group-active:bg-ring"
		})
	});
}
function Yo({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		className: J("flex shrink-0 flex-col gap-2 p-3", e),
		...t
	});
}
function Xo({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		className: J("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2", e),
		...t
	});
}
function Zo({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		className: J("flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3", e),
		...t
	});
}
function Qo({ label: e, children: t, className: n }) {
	return /* @__PURE__ */ M("div", {
		role: "group",
		"aria-label": e,
		className: J("flex flex-col gap-0.5", n),
		children: [e && /* @__PURE__ */ j("div", {
			"aria-hidden": "true",
			className: "px-2 pb-1 text-xs font-medium text-muted-foreground",
			children: e
		}), t]
	});
}
function $o({ className: e, ...t }) {
	return /* @__PURE__ */ j("ul", {
		className: J("flex flex-col gap-0.5", e),
		...t
	});
}
function es(e) {
	return /* @__PURE__ */ j("li", { ...e });
}
function ts({ asChild: e = !1, active: t = !1, className: n, ...r }) {
	let i = e ? E.Root : "button";
	return /* @__PURE__ */ j(i, {
		"data-active": t,
		"aria-current": t ? "page" : void 0,
		className: J("flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors outline-none", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "focus-visible:ring-2 focus-visible:ring-sidebar-ring", "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground", "[&_svg]:size-4 [&_svg]:shrink-0", n),
		...e ? {} : { type: "button" },
		...r
	});
}
//#endregion
//#region src/organisms/Table/Table.tsx
function ns({ className: e, ...t }) {
	return /* @__PURE__ */ j("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ j("table", {
			"data-slot": "table",
			className: J("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function rs({ className: e, ...t }) {
	return /* @__PURE__ */ j("thead", {
		"data-slot": "table-header",
		className: J("[&_tr]:border-b [&_tr]:border-border", e),
		...t
	});
}
function is({ className: e, ...t }) {
	return /* @__PURE__ */ j("tbody", {
		"data-slot": "table-body",
		className: J("[&_tr:last-child]:border-0", e),
		...t
	});
}
function as({ className: e, ...t }) {
	return /* @__PURE__ */ j("tfoot", {
		"data-slot": "table-footer",
		className: J("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", e),
		...t
	});
}
function os({ className: e, ...t }) {
	return /* @__PURE__ */ j("tr", {
		"data-slot": "table-row",
		className: J("border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function ss({ className: e, ...t }) {
	return /* @__PURE__ */ j("th", {
		"data-slot": "table-head",
		className: J("h-10 px-3 text-left align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0", e),
		...t
	});
}
function cs({ className: e, ...t }) {
	return /* @__PURE__ */ j("td", {
		"data-slot": "table-cell",
		className: J("p-3 align-middle [&:has([role=checkbox])]:pr-0", e),
		...t
	});
}
function ls({ className: e, ...t }) {
	return /* @__PURE__ */ j("caption", {
		"data-slot": "table-caption",
		className: J("mt-4 text-sm text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/organisms/ThreadList/ThreadList.tsx
function us(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleString(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	});
}
var ds = "flex w-full flex-col gap-0.5 rounded-lg px-3 py-3 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted";
function fs({ threads: e, labels: t, activeId: n = null, onOpen: r, as: i, formatTime: a = us, className: o }) {
	return e.length === 0 ? /* @__PURE__ */ j("p", {
		className: J("px-6 py-10 text-center text-sm text-muted-foreground", o),
		children: t.empty
	}) : /* @__PURE__ */ j("ul", {
		"aria-label": t.list,
		className: J("flex flex-col gap-0.5", o),
		children: e.map((e) => {
			let o = n !== null && e.id === n, s = {
				"data-active": o,
				"aria-current": o ? "true" : void 0,
				className: ds,
				onClick: () => r?.(e.id)
			}, c = e.href === void 0 ? "button" : i ?? "a", l = e.href === void 0 ? { type: "button" } : { href: e.href };
			return /* @__PURE__ */ j("li", { children: /* @__PURE__ */ M(c, {
				...s,
				...l,
				children: [
					/* @__PURE__ */ M("span", {
						className: "flex w-full items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ M("span", {
							className: J("flex min-w-0 items-center gap-2 text-sm text-foreground", e.unread ? "font-semibold" : "font-medium"),
							children: [e.unread && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("span", {
								"aria-hidden": "true",
								className: "inline-block size-2 shrink-0 rounded-full bg-primary"
							}), /* @__PURE__ */ j("span", {
								className: "sr-only",
								children: t.unread
							})] }), /* @__PURE__ */ j("span", {
								className: "truncate",
								children: e.title
							})]
						}), e.lastActivityAt && /* @__PURE__ */ j("time", {
							dateTime: e.lastActivityAt,
							className: "shrink-0 text-xs text-muted-foreground",
							children: a(e.lastActivityAt)
						})]
					}),
					e.subtitle && /* @__PURE__ */ j("span", {
						className: "truncate text-xs text-muted-foreground",
						children: e.subtitle
					}),
					e.preview && /* @__PURE__ */ j("span", {
						className: "truncate text-xs text-muted-foreground",
						children: e.preview
					})
				]
			}) }, e.id);
		})
	});
}
//#endregion
//#region src/organisms/VideoPlayer/videoMath.ts
function ps(e, t = 0) {
	let n = Number.isFinite(e) && e > 0 ? Math.floor(e) : 0, r = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = String(n % 60).padStart(2, "0");
	return r > 0 || t >= 3600 ? `${r}:${String(i).padStart(2, "0")}:${a}` : `${i}:${a}`;
}
function ms(e, [t, n]) {
	if (!(n > t)) return e;
	let r = [...e, [t, n]].sort((e, t) => e[0] - t[0]), i = [];
	for (let [e, t] of r) {
		let n = i[i.length - 1];
		n && e <= n[1] ? n[1] = Math.max(n[1], t) : i.push([e, t]);
	}
	return i;
}
function hs(e, t) {
	if (!(t > 0)) return 0;
	let n = e.reduce((e, [n, r]) => e + Math.max(0, Math.min(r, t) - Math.max(n, 0)), 0);
	return Math.min(1, n / t);
}
function gs(e, t) {
	let n = null;
	for (let r of [...e].sort((e, t) => e.start - t.start)) if (r.start <= t) n = r;
	else break;
	return n;
}
function _s(e) {
	if (e.ctrlKey || e.metaKey || e.altKey) return null;
	let t = e.key.length === 1 ? e.key.toLowerCase() : e.key;
	switch (t) {
		case " ":
		case "k": return { type: "toggle" };
		case "j": return {
			type: "seekBy",
			seconds: -10
		};
		case "l": return {
			type: "seekBy",
			seconds: 10
		};
		case "ArrowLeft": return {
			type: "seekBy",
			seconds: -5
		};
		case "ArrowRight": return {
			type: "seekBy",
			seconds: 5
		};
		case "ArrowUp": return {
			type: "volumeBy",
			delta: .1
		};
		case "ArrowDown": return {
			type: "volumeBy",
			delta: -.1
		};
		case "m": return { type: "mute" };
		case "f": return { type: "fullscreen" };
		case "c": return { type: "captions" };
		case "Home": return {
			type: "seekTo",
			fraction: 0
		};
		case "End": return {
			type: "seekTo",
			fraction: 1
		};
		case ">": return {
			type: "speedBy",
			step: 1
		};
		case "<": return {
			type: "speedBy",
			step: -1
		};
	}
	return /^[0-9]$/.test(t) ? {
		type: "seekTo",
		fraction: Number(t) / 10
	} : null;
}
//#endregion
//#region src/organisms/VideoPlayer/VideoPlayer.tsx
var vs = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	1.75,
	2
], ys = 2500, bs = 5e3, xs = "burgwiss-ui:video-prefs";
function Ss(e) {
	return `burgwiss-ui:video:${e}`;
}
function Cs() {
	try {
		let e = JSON.parse(localStorage.getItem(xs) ?? "null");
		return {
			rate: typeof e?.rate == "number" && e.rate > 0 && e.rate <= 4 ? e.rate : 1,
			volume: typeof e?.volume == "number" && e.volume >= 0 && e.volume <= 1 ? e.volume : 1,
			muted: e?.muted === !0,
			captions: typeof e?.captions == "string" ? e.captions : null
		};
	} catch {
		return {
			rate: 1,
			volume: 1,
			muted: !1,
			captions: null
		};
	}
}
function ws(e) {
	try {
		localStorage.setItem(xs, JSON.stringify({
			...Cs(),
			...e
		}));
	} catch {}
}
function Ts(e) {
	return /* @__PURE__ */ j(Es, { ...e }, e.src);
}
function Es({ src: e, title: t, poster: n, resumeKey: r, chapters: i = [], showChapterList: a, captions: s = [], speeds: u = vs, refreshSrc: d, completeAt: m = .9, onProgress: h, onComplete: g, next: _, labels: v, className: y }) {
	let b = l(), x = f(null), [S, C] = p(null), w = f(null), [T, E] = p(e), [D, O] = p(!1), [k, ee] = p(!1), [N, ne] = p(!1), [re, P] = p(!1), [F, I] = p(!1), [L, R] = p(0), [z, B] = p(0), [ae, oe] = p(0), [V, H] = p(() => Cs()), [se, U] = p(!1), [ce, W] = p(!0), [le, ue] = p(!1), [de, G] = p(""), [fe, pe] = p(null), [me, he] = p(null), [ge, _e] = p(null), [be, Se] = p(""), Ce = f([]), we = f(0), Ee = f(!1), ke = f(!1), Ae = f(null), Ne = f(0), Pe = f(0), Le = f(null), Re = f(null), K = () => w.current, He = (e) => G(e), Ue = V.captions && s.some((e) => e.srcLang === V.captions) ? V.captions : null, We = o((e = !1) => {
		let t = K();
		if (!t) return;
		let n = Number.isFinite(t.duration) ? t.duration : 0, r = hs(Ce.current, n);
		!Ee.current && n > 0 && r >= m && (Ee.current = !0, g?.());
		let i = Date.now();
		!e && i - Ne.current < bs || (Ne.current = i, h?.({
			currentTime: t.currentTime,
			duration: n,
			watched: Ce.current,
			fraction: r
		}));
	}, [
		h,
		g,
		m
	]), Ge = o(() => {
		W(!0), Le.current && window.clearTimeout(Le.current), Le.current = window.setTimeout(() => W(!1), ys);
	}, []);
	c(() => () => void (Le.current && window.clearTimeout(Le.current)), []);
	let Ke = !D || ce || le, q = () => void K()?.play()?.catch(() => {}), qe = () => {
		let e = K();
		e && (e.paused || e.ended ? q() : e.pause());
	}, Je = (e, t = !0) => {
		let n = K();
		if (!n) return;
		let r = Number.isFinite(n.duration) ? n.duration : e;
		n.currentTime = Math.max(0, Math.min(r, e)), R(n.currentTime), ne(!1), t && He(v.announce.seeked(ps(n.currentTime, r)));
	}, Ye = (e) => {
		let t = K();
		t && (t.playbackRate = e), H((t) => ({
			...t,
			rate: e
		})), ws({ rate: e }), He(v.announce.speed(v.speedValue(e)));
	}, Y = (e) => {
		let t = K(), n = Math.round(Math.max(0, Math.min(1, e)) * 100) / 100;
		t && (t.volume = n, t.muted = n === 0), H((e) => ({
			...e,
			volume: n,
			muted: n === 0
		})), ws({
			volume: n,
			muted: n === 0
		}), He(v.announce.volume(Math.round(n * 100)));
	}, X = () => {
		let e = K(), t = !(e?.muted ?? V.muted);
		e && (e.muted = t), H((e) => ({
			...e,
			muted: t
		})), ws({ muted: t }), He(t ? v.announce.muted : v.announce.unmuted);
	}, Xe = (e) => {
		for (let t of Array.from(K()?.textTracks ?? [])) t.mode = t.language === e ? "hidden" : "disabled";
		H((t) => ({
			...t,
			captions: e
		})), ws({ captions: e });
		let t = s.find((t) => t.srcLang === e)?.label;
		He(t ? v.announce.captionsOn(t) : v.announce.captionsOff);
	}, Ze = async () => {
		let e = x.current, t = K();
		try {
			document.fullscreenElement ? await document.exitFullscreen() : e?.requestFullscreen ? await e.requestFullscreen() : t?.webkitEnterFullscreen?.();
		} catch {}
	}, Qe = async () => {
		let e = K();
		try {
			document.pictureInPictureElement ? await document.exitPictureInPicture() : await e?.requestPictureInPicture?.();
		} catch {}
	}, $e = (e) => {
		let t = K(), n = t && Number.isFinite(t.duration) ? t.duration : z;
		switch (e.type) {
			case "toggle": return qe();
			case "seekBy": return Je((t?.currentTime ?? L) + e.seconds);
			case "seekTo": return Je(e.fraction * n);
			case "volumeBy": return Y((V.muted ? 0 : V.volume) + e.delta);
			case "mute": return X();
			case "fullscreen":
				Ze();
				return;
			case "captions": return s.length === 0 ? void 0 : Xe(Ue ? null : (s.find((e) => e.default) ?? s[0]).srcLang);
			case "speedBy": {
				let t = u.indexOf(V.rate), n = u[Math.max(0, Math.min(u.length - 1, (t < 0 ? u.indexOf(1) : t) + e.step))];
				n !== void 0 && Ye(n);
				return;
			}
		}
	}, et = (e) => {
		let t = e.target;
		if (t.closest("input,textarea,select,[role=menu],[role=menuitem],[role=menuitemradio],[role=slider]") || (e.key === " " || e.key === "Enter") && t.closest("button")) return;
		let n = _s(e);
		n && (e.preventDefault(), Ge(), $e(n));
	}, tt = () => {
		let e = K();
		if (!e) return;
		B(Number.isFinite(e.duration) ? e.duration : 0), e.playbackRate = V.rate, e.volume = V.volume, e.muted = V.muted;
		for (let t of Array.from(e.textTracks)) t.mode = t.language === Ue ? "hidden" : "disabled";
		let t = Ae.current;
		if (Ae.current = null, t === null && r) try {
			let n = Number(localStorage.getItem(Ss(r)) ?? 0) || 0;
			n > 3 && Number.isFinite(e.duration) && n < e.duration - 5 && (t = n);
		} catch {}
		t !== null && (e.currentTime = t, R(t), we.current = t);
	}, nt = () => {
		let e = K();
		if (!e) return;
		let t = e.currentTime;
		if (!e.paused && t > we.current && t - we.current < 1.5 * Math.max(1, e.playbackRate) && (Ce.current = ms(Ce.current, [we.current, t])), we.current = t, R(t), e.buffered.length && oe(e.buffered.end(e.buffered.length - 1)), r && Date.now() - Pe.current >= bs) {
			Pe.current = Date.now();
			try {
				localStorage.setItem(Ss(r), String(Math.floor(t)));
			} catch {}
		}
		We();
	}, rt = () => {
		if (O(!1), ne(!0), We(!0), r) try {
			localStorage.removeItem(Ss(r));
		} catch {}
		_?.autoAdvanceSeconds && he(_.autoAdvanceSeconds);
	}, it = async () => {
		let e = K()?.currentTime ?? 0;
		if (d && !ke.current) {
			ke.current = !0;
			try {
				let t = await d();
				Ae.current = e > 0 ? e : null, E(t);
				return;
			} catch {}
		}
		I(!0), P(!1);
	}, at = async () => {
		let t = L;
		if (I(!1), ke.current = !1, Ae.current = t > 0 ? t : null, d) try {
			E(await d());
			return;
		} catch {
			I(!0);
			return;
		}
		E(`${e}${e.includes("?") ? "&" : "?"}retry=${Date.now()}`);
	};
	c(() => {
		let e = Array.from(w.current?.textTracks ?? []).find((e) => e.language === Ue);
		if (!e) {
			Se("");
			return;
		}
		let t = () => Se(Array.from(e.activeCues ?? []).map((e) => e.text ?? "").join("\n"));
		return t(), e.addEventListener?.("cuechange", t), () => e.removeEventListener?.("cuechange", t);
	}, [Ue, z]), c(() => {
		let e = () => U(document.fullscreenElement === x.current);
		return document.addEventListener("fullscreenchange", e), () => document.removeEventListener("fullscreenchange", e);
	}, []), c(() => {
		if (me === null || !_) return;
		let e = window.setTimeout(() => {
			me <= 1 ? (he(null), _.onPlay()) : he(me - 1);
		}, 1e3);
		return () => window.clearTimeout(e);
	}, [me, _]);
	let ot = (e) => {
		if (x.current?.focus({ preventScroll: !0 }), e.pointerType === "mouse") {
			qe();
			return;
		}
		let t = Date.now(), n = e.currentTarget.getBoundingClientRect(), r = e.clientX - n.left, i = Re.current;
		if (Re.current = {
			t,
			x: r
		}, i && t - i.t < 300 && Math.abs(i.x - r) < 60) {
			let e = x.current?.closest("[dir=rtl]") !== null, i = r < n.width / 3, a = r > n.width * 2 / 3;
			if (i || a) {
				let n = a !== e;
				$e({
					type: "seekBy",
					seconds: n ? 10 : -10
				}), pe({
					side: n ? "forward" : "back",
					key: t
				}), Re.current = null;
				return;
			}
		}
		ce && D ? W(!1) : Ge();
	}, st = gs(i, L), ct = (a ?? i.length > 0) && i.length > 0, lt = (e) => z > 0 ? `${Math.min(100, e / z * 100)}%` : "0%", ut = V.muted || V.volume === 0 ? Ve : V.volume < .5 ? ze : Be, dt = "text-video-foreground hover:bg-video-foreground/15 hover:text-video-foreground focus-visible:ring-video-foreground aria-expanded:bg-video-foreground/15";
	return /* @__PURE__ */ M("div", {
		className: J("space-y-3", y),
		children: [/* @__PURE__ */ M("div", {
			ref: (e) => {
				x.current = e, C(e);
			},
			role: "region",
			"aria-label": t,
			tabIndex: 0,
			onKeyDown: et,
			onPointerMove: Ge,
			onFocus: Ge,
			className: J("group/player relative isolate aspect-video w-full overflow-hidden rounded-xl bg-video-surface text-video-foreground shadow-lg", se && "rounded-none", !Ke && "cursor-none"),
			children: [
				/* @__PURE__ */ j("video", {
					ref: w,
					src: T,
					poster: n,
					"aria-label": t,
					playsInline: !0,
					preload: "metadata",
					className: "h-full w-full",
					onLoadedMetadata: tt,
					onDurationChange: () => B(K()?.duration && Number.isFinite(K().duration) ? K().duration : 0),
					onTimeUpdate: nt,
					onProgress: () => {
						let e = K();
						e?.buffered.length && oe(e.buffered.end(e.buffered.length - 1));
					},
					onPlay: () => {
						O(!0), ee(!0), ne(!1), he(null), He(v.announce.playing), Ge();
					},
					onPause: () => {
						O(!1), W(!0), We(!0), K()?.ended || He(v.announce.paused);
					},
					onWaiting: () => P(!0),
					onPlaying: () => P(!1),
					onCanPlay: () => P(!1),
					onEnded: rt,
					onError: () => void it(),
					children: s.map((e) => /* @__PURE__ */ j("track", {
						kind: "captions",
						src: e.src,
						srcLang: e.srcLang,
						label: e.label
					}, e.src))
				}, T),
				!F && !N && /* @__PURE__ */ j("div", {
					"aria-hidden": "true",
					className: "absolute inset-0",
					onPointerUp: ot
				}),
				re && !F && /* @__PURE__ */ M("div", {
					role: "status",
					className: "pointer-events-none absolute inset-0 flex items-center justify-center",
					children: [/* @__PURE__ */ j(ve, {
						"aria-hidden": "true",
						className: "size-12 animate-spin text-video-foreground/90"
					}), /* @__PURE__ */ j("span", {
						className: "sr-only",
						children: v.loading
					})]
				}),
				fe && /* @__PURE__ */ j("div", {
					"aria-hidden": "true",
					onAnimationEnd: () => pe(null),
					className: J("pointer-events-none absolute inset-y-0 flex w-1/3 animate-out items-center justify-center bg-video-foreground/10 text-sm font-semibold duration-500 fade-out", fe.side === "back" ? "start-0 rounded-e-full" : "end-0 rounded-s-full"),
					children: v.skipped(fe.side === "back" ? -10 : 10)
				}, fe.key),
				!D && !F && !N && !re && /* @__PURE__ */ j("button", {
					type: "button",
					onClick: () => {
						q(), x.current?.focus({ preventScroll: !0 });
					},
					"aria-label": v.play,
					className: "absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-video-foreground",
					children: /* @__PURE__ */ j(Oe, {
						"aria-hidden": "true",
						className: "size-8 translate-x-0.5 fill-current"
					})
				}),
				N && !F && /* @__PURE__ */ j("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center gap-4 bg-video-scrim p-6 text-center",
					children: _ ? /* @__PURE__ */ M(A, { children: [
						/* @__PURE__ */ j("p", {
							className: "text-sm text-video-foreground/80",
							children: v.upNext
						}),
						/* @__PURE__ */ j("p", {
							className: "text-xl font-semibold",
							children: _.title
						}),
						me !== null && /* @__PURE__ */ j("p", {
							role: "timer",
							className: "text-sm text-video-foreground/80",
							children: v.startsIn(me)
						}),
						/* @__PURE__ */ M("div", {
							className: "flex flex-wrap items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ M(Z, {
									type: "button",
									onClick: () => (he(null), _.onPlay()),
									children: [/* @__PURE__ */ j(Ie, { "aria-hidden": "true" }), v.playNext]
								}),
								/* @__PURE__ */ M(Z, {
									type: "button",
									variant: "ghost",
									className: dt,
									onClick: () => (he(null), Je(0, !1), q()),
									children: [/* @__PURE__ */ j(je, { "aria-hidden": "true" }), v.replay]
								}),
								me !== null && /* @__PURE__ */ j(Z, {
									type: "button",
									variant: "ghost",
									className: dt,
									onClick: () => he(null),
									children: v.cancel
								})
							]
						})
					] }) : /* @__PURE__ */ M(Z, {
						type: "button",
						onClick: () => (Je(0, !1), q()),
						children: [/* @__PURE__ */ j(je, { "aria-hidden": "true" }), v.replay]
					})
				}),
				F && /* @__PURE__ */ M("div", {
					role: "alert",
					className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-video-scrim p-6 text-center",
					children: [
						/* @__PURE__ */ j(te, {
							"aria-hidden": "true",
							className: "size-8"
						}),
						/* @__PURE__ */ j("p", {
							className: "font-semibold",
							children: v.errorTitle
						}),
						/* @__PURE__ */ j("p", {
							className: "max-w-sm text-sm text-video-foreground/80",
							children: v.errorBody
						}),
						/* @__PURE__ */ M(Z, {
							type: "button",
							onClick: () => void at(),
							children: [/* @__PURE__ */ j(Me, { "aria-hidden": "true" }), v.retry]
						})
					]
				}),
				k && !F && /* @__PURE__ */ M("div", {
					"data-visible": Ke,
					className: J("absolute inset-x-0 bottom-0 bg-linear-to-t from-video-scrim via-video-scrim/60 to-transparent px-3 pt-10 pb-2 transition-opacity duration-200", "opacity-100 group-focus-within/player:opacity-100 data-[visible=false]:opacity-0"),
					children: [/* @__PURE__ */ j(Ds, {
						time: L,
						duration: z,
						buffered: ae,
						chapters: i,
						labels: v,
						hover: ge,
						onHover: _e,
						onSeek: (e) => Je(e, !1),
						onSeekEnd: (e) => He(v.announce.seeked(ps(e, z))),
						pct: lt
					}), /* @__PURE__ */ M("div", {
						className: "mt-1 flex items-center gap-0.5",
						children: [
							/* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: dt,
								"aria-label": D ? v.pause : v.play,
								"aria-keyshortcuts": "k",
								onClick: qe,
								children: j(D ? Te : Oe, {
									"aria-hidden": "true",
									className: "fill-current"
								})
							}),
							/* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: dt,
								"aria-label": v.back10,
								"aria-keyshortcuts": "j",
								onClick: () => $e({
									type: "seekBy",
									seconds: -10
								}),
								children: /* @__PURE__ */ j(je, {
									"aria-hidden": "true",
									className: "rtl:-scale-x-100"
								})
							}),
							/* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: dt,
								"aria-label": v.forward10,
								"aria-keyshortcuts": "l",
								onClick: () => $e({
									type: "seekBy",
									seconds: 10
								}),
								children: /* @__PURE__ */ j(Me, {
									"aria-hidden": "true",
									className: "rtl:-scale-x-100"
								})
							}),
							/* @__PURE__ */ M("div", {
								className: "group/vol flex items-center",
								children: [/* @__PURE__ */ j(Z, {
									variant: "ghost",
									size: "icon",
									className: dt,
									"aria-label": V.muted ? v.unmute : v.mute,
									"aria-keyshortcuts": "m",
									onClick: X,
									children: /* @__PURE__ */ j(ut, { "aria-hidden": "true" })
								}), /* @__PURE__ */ j("input", {
									type: "range",
									min: 0,
									max: 1,
									step: .05,
									value: V.muted ? 0 : V.volume,
									"aria-label": v.volume,
									"aria-valuetext": `${Math.round((V.muted ? 0 : V.volume) * 100)} %`,
									onChange: (e) => Y(Number(e.target.value)),
									className: "h-1 w-0 cursor-pointer accent-video-foreground opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 pointer-coarse:hidden"
								})]
							}),
							/* @__PURE__ */ M("span", {
								className: "ms-2 text-sm text-video-foreground/90 tabular-nums",
								dir: "ltr",
								children: [
									ps(L, z),
									" / ",
									ps(z, z)
								]
							}),
							st && /* @__PURE__ */ M("span", {
								className: "ms-3 hidden min-w-0 truncate text-sm text-video-foreground/80 sm:inline",
								children: ["· ", st.title]
							}),
							/* @__PURE__ */ j("span", { className: "flex-1" }),
							s.length > 0 && /* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: J(dt, Ue && "bg-video-foreground/15"),
								"aria-label": v.captions,
								"aria-pressed": Ue !== null,
								"aria-keyshortcuts": "c",
								onClick: () => $e({ type: "captions" }),
								children: /* @__PURE__ */ j(ie, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ M(Fi, {
								open: le,
								onOpenChange: ue,
								children: [/* @__PURE__ */ j(Ii, {
									asChild: !0,
									children: /* @__PURE__ */ j(Z, {
										variant: "ghost",
										size: "icon",
										className: dt,
										"aria-label": v.settings,
										children: /* @__PURE__ */ j(Fe, { "aria-hidden": "true" })
									})
								}), /* @__PURE__ */ M(Ri, {
									side: "top",
									align: "end",
									container: S,
									className: "w-48",
									children: [
										/* @__PURE__ */ j(Ki, { children: v.speed }),
										/* @__PURE__ */ j(Bi, {
											value: String(V.rate),
											onValueChange: (e) => Ye(Number(e)),
											children: u.map((e) => /* @__PURE__ */ j(Vi, {
												value: String(e),
												children: v.speedValue(e)
											}, e))
										}),
										s.length > 0 && /* @__PURE__ */ M(A, { children: [
											/* @__PURE__ */ j($, {}),
											/* @__PURE__ */ j(Ki, { children: v.captions }),
											/* @__PURE__ */ M(Bi, {
												value: Ue ?? "",
												onValueChange: (e) => Xe(e || null),
												children: [/* @__PURE__ */ j(Vi, {
													value: "",
													children: v.captionsOff
												}), s.map((e) => /* @__PURE__ */ j(Vi, {
													value: e.srcLang,
													children: e.label
												}, e.srcLang))]
											})
										] })
									]
								})]
							}),
							typeof document < "u" && "pictureInPictureEnabled" in document && document.pictureInPictureEnabled && /* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: dt,
								"aria-label": v.pictureInPicture,
								onClick: () => void Qe(),
								children: /* @__PURE__ */ j(De, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ j(Z, {
								variant: "ghost",
								size: "icon",
								className: dt,
								"aria-label": se ? v.exitFullscreen : v.fullscreen,
								"aria-keyshortcuts": "f",
								onClick: () => void Ze(),
								children: j(se ? xe : ye, { "aria-hidden": "true" })
							})
						]
					})]
				}),
				Ue && be && /* @__PURE__ */ j("div", {
					"data-caption": "",
					className: J("pointer-events-none absolute inset-x-0 flex justify-center px-6 transition-[bottom] duration-200", Ke && k ? "bottom-24" : "bottom-6"),
					children: /* @__PURE__ */ j("p", {
						lang: Ue,
						className: "max-w-[90%] rounded-md bg-video-scrim px-3 py-1 text-center text-base leading-snug whitespace-pre-line sm:text-lg md:text-xl",
						children: be
					})
				}),
				/* @__PURE__ */ j("div", {
					role: "status",
					"aria-live": "polite",
					className: "sr-only",
					children: de
				})
			]
		}), ct && /* @__PURE__ */ M("nav", {
			"aria-labelledby": `${b}-chapters`,
			children: [/* @__PURE__ */ j("h2", {
				id: `${b}-chapters`,
				className: "mb-1 text-sm font-semibold",
				children: v.chapters
			}), /* @__PURE__ */ j("ol", {
				className: "divide-y divide-border rounded-lg border border-border",
				children: [...i].sort((e, t) => e.start - t.start).map((e) => {
					let t = st?.start === e.start;
					return /* @__PURE__ */ j("li", { children: /* @__PURE__ */ M("button", {
						type: "button",
						"aria-current": t ? "true" : void 0,
						onClick: () => {
							Je(e.start), q();
						},
						className: "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=true]:bg-muted aria-[current=true]:font-medium",
						children: [/* @__PURE__ */ j("span", {
							className: "w-14 shrink-0 text-muted-foreground tabular-nums",
							dir: "ltr",
							children: ps(e.start, z)
						}), /* @__PURE__ */ j("span", {
							className: "min-w-0 truncate",
							children: e.title
						})]
					}) }, e.start);
				})
			})]
		})]
	});
}
function Ds({ time: e, duration: t, buffered: n, chapters: r, labels: i, hover: a, onHover: o, onSeek: s, onSeekEnd: c, pct: l }) {
	let u = f(null), d = f(!1), p = (e) => {
		let n = u.current.getBoundingClientRect(), r = Math.max(0, Math.min(n.width, e - n.left));
		return {
			x: r,
			time: n.width > 0 ? r / n.width * t : 0
		};
	}, m = (n) => {
		let r = {
			ArrowLeft: -5,
			ArrowRight: 5,
			PageDown: -30,
			PageUp: 30
		}, i = null;
		if (n.key in r && (i = e + r[n.key]), n.key === "Home" && (i = 0), n.key === "End" && (i = t), i === null) return;
		n.preventDefault(), n.stopPropagation();
		let a = Math.max(0, Math.min(t, i));
		s(a), c(a);
	}, h = [...r].sort((e, t) => e.start - t.start).filter((e) => e.start > 0 && e.start < t), g = a ? gs(r, a.time) : null;
	return /* @__PURE__ */ M("div", {
		dir: "ltr",
		className: "relative",
		children: [a && t > 0 && /* @__PURE__ */ M("div", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute bottom-5 -translate-x-1/2 rounded-md bg-video-scrim px-2 py-1 text-center text-xs whitespace-nowrap shadow",
			style: { left: a.x },
			children: [g && /* @__PURE__ */ j("div", {
				className: "max-w-48 truncate font-medium",
				children: g.title
			}), /* @__PURE__ */ j("div", {
				className: "tabular-nums",
				children: ps(a.time, t)
			})]
		}), /* @__PURE__ */ M("div", {
			ref: u,
			role: "slider",
			tabIndex: 0,
			"aria-label": i.seek,
			"aria-valuemin": 0,
			"aria-valuemax": Math.round(t),
			"aria-valuenow": Math.round(e),
			"aria-valuetext": i.timeOf(ps(e, t), ps(t, t)),
			onKeyDown: m,
			onPointerDown: (e) => {
				e.button !== 0 || t <= 0 || (d.current = !0, e.currentTarget.setPointerCapture?.(e.pointerId), s(p(e.clientX).time));
			},
			onPointerMove: (e) => {
				let t = p(e.clientX);
				o(t), d.current && s(t.time);
			},
			onPointerUp: (e) => {
				d.current && (d.current = !1, c(p(e.clientX).time));
			},
			onPointerLeave: () => o(null),
			className: "group/tl relative flex h-4 cursor-pointer items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-video-foreground",
			children: [/* @__PURE__ */ M("div", {
				className: "relative h-1 w-full overflow-hidden rounded-full bg-video-foreground/20 transition-[height] group-hover/tl:h-1.5",
				children: [
					/* @__PURE__ */ j("div", {
						className: "absolute inset-y-0 left-0 bg-video-foreground/40",
						style: { width: l(n) }
					}),
					/* @__PURE__ */ j("div", {
						className: "absolute inset-y-0 left-0 bg-video-foreground",
						style: { width: l(e) }
					}),
					h.map((e) => /* @__PURE__ */ j("div", {
						className: "absolute inset-y-0 w-0.5 bg-video-scrim",
						style: { left: l(e.start) }
					}, e.start))
				]
			}), /* @__PURE__ */ j("div", {
				"aria-hidden": "true",
				className: "absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-video-foreground shadow transition-transform group-hover/tl:scale-100 group-focus-visible/tl:scale-100",
				style: { left: l(e) }
			})]
		})]
	});
}
//#endregion
//#region src/templates/SidebarLayout/SidebarLayout.tsx
function Os({ sidebar: e, side: t = "left", children: n, className: r }) {
	let i = /* @__PURE__ */ j("main", {
		className: "min-h-0 min-w-0 flex-1 overflow-auto",
		children: n
	});
	return /* @__PURE__ */ M("div", {
		className: J("flex h-full min-h-0 w-full", r),
		children: [
			t === "left" && e,
			i,
			t === "right" && e
		]
	});
}
//#endregion
//#region src/templates/AdminLayout/AdminLayout.tsx
function ks({ rail: e, sidebar: t, children: n, className: r }) {
	return /* @__PURE__ */ M("div", {
		className: J("flex h-svh min-h-0 w-full bg-background text-foreground", r),
		children: [e, /* @__PURE__ */ j("div", {
			className: "min-w-0 flex-1",
			children: t ? /* @__PURE__ */ j(Os, {
				sidebar: t,
				children: n
			}) : /* @__PURE__ */ j("main", {
				className: "h-full min-h-0 overflow-auto",
				children: n
			})
		})]
	});
}
//#endregion
//#region src/templates/ChatPage/ChatPage.tsx
function As({ threadList: e, threadListHeader: t, threadListFooter: n, conversation: r, emptyAction: i, labels: a, resizeStorageKey: o, defaultThreadListWidth: s = 320, className: c }) {
	let l = r != null && r !== !1;
	return /* @__PURE__ */ j(Os, {
		className: c,
		sidebar: /* @__PURE__ */ M(qo, {
			label: a.threadList,
			defaultWidth: s,
			resize: {
				label: a.resize,
				storageKey: o,
				minWidth: 240
			},
			className: l ? "max-md:hidden" : "max-md:w-full!",
			children: [
				t && /* @__PURE__ */ j(Yo, { children: t }),
				/* @__PURE__ */ j(Xo, { children: e }),
				n && /* @__PURE__ */ j(Zo, { children: n })
			]
		}),
		children: l ? /* @__PURE__ */ j("div", {
			className: "h-full min-h-0",
			children: r
		}) : /* @__PURE__ */ j("div", {
			className: "flex h-full items-center justify-center p-6 max-md:hidden",
			children: /* @__PURE__ */ j(qi, {
				icon: be,
				title: a.noConversationTitle,
				description: a.noConversationDescription,
				action: i,
				className: "border-0 bg-transparent"
			})
		})
	});
}
//#endregion
//#region src/templates/GridPage/GridPage.tsx
function js({ title: e, grid: t, actionsLabel: n, search: r, moreActionsLabel: i, selectionLabels: a, shortcutLabels: o, options: s, chips: c, notice: l, footer: u, offsetTop: d = "4rem", children: p }) {
	let m = f(null), h = t?.selectedIds.length ?? 0, g = t?.visibleActions ?? [], _ = (e) => {
		let n = !!e.target.closest("input:not([type=checkbox]),textarea,select");
		if (e.key === "/" && !n && r) {
			e.preventDefault(), m.current?.querySelector("input[type=search]")?.focus();
			return;
		}
		t?.onKeyDown(e);
	}, v = /* @__PURE__ */ j("div", {
		"data-grid-scroll": "",
		"data-density": t?.preferences.values.density ?? "comfortable",
		onContextMenu: t?.onContextMenu,
		className: J("min-h-0 flex-1 overflow-auto", "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted", "[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4", "[&_td]:border-border [&_td:not(:last-child)]:border-r [&_th]:border-border [&_th:not(:last-child)]:border-r", "data-[density=comfortable]:[&_td]:py-3 data-[density=compact]:[&_td]:py-1.5 data-[density=compact]:[&_th]:h-8", "[&_[data-slot=table-container]]:overflow-visible"),
		children: p
	});
	return /* @__PURE__ */ M("div", {
		ref: m,
		onKeyDown: _,
		className: "flex min-h-0 flex-col bg-card",
		style: { height: `calc(100svh - ${d})` },
		children: [
			/* @__PURE__ */ j("h1", {
				className: "sr-only",
				children: e
			}),
			/* @__PURE__ */ M("div", {
				className: "flex h-12 shrink-0 items-center gap-2 border-b border-border px-3",
				children: [/* @__PURE__ */ j(Eo, {
					label: n ?? e,
					items: t?.actions,
					selectedIds: t?.selectedIds,
					shortcutLabels: o,
					moreLabel: i,
					children: t && a && h > 0 && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": a.clear,
						"aria-keyshortcuts": "Escape",
						onClick: t.clear,
						className: "text-muted-foreground",
						children: /* @__PURE__ */ j(K, { "aria-hidden": "true" })
					}), /* @__PURE__ */ j("span", {
						"aria-live": "polite",
						className: "px-1 text-sm font-medium whitespace-nowrap tabular-nums",
						children: a.count(h)
					})] })
				}), /* @__PURE__ */ M("div", {
					className: "ml-auto flex shrink-0 items-center gap-1",
					children: [r && /* @__PURE__ */ j(Pa, {
						collapsible: !0,
						value: r.value,
						onValueChange: r.onChange,
						placeholder: r.placeholder,
						"aria-keyshortcuts": "/"
					}), s]
				})]
			}),
			c && /* @__PURE__ */ j("div", {
				className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2",
				children: c
			}),
			l && /* @__PURE__ */ j("div", {
				className: "shrink-0 border-b border-border px-4 py-2 text-sm",
				children: l
			}),
			t && t.actions.length > 0 ? /* @__PURE__ */ M(Oi, { children: [/* @__PURE__ */ j(ki, {
				asChild: !0,
				children: v
			}), /* @__PURE__ */ j(Ai, { children: /* @__PURE__ */ j(Oo, {
				items: g,
				ids: t.selectedIds,
				shortcutLabels: o
			}) })] }) : v,
			u && /* @__PURE__ */ j("div", {
				className: "flex h-12 shrink-0 items-center gap-3 border-t border-border px-4",
				children: u
			})
		]
	});
}
//#endregion
//#region src/templates/PageEditor/PageEditor.tsx
function Ms({ toolbar: e, aside: t, device: n, onDeviceChange: r, previewTools: i, storageKey: a, labels: o, children: s }) {
	let c = [{
		id: "desktop",
		label: o.desktop,
		icon: /* @__PURE__ */ j(Se, { "aria-hidden": "true" })
	}, {
		id: "phone",
		label: o.phone,
		icon: /* @__PURE__ */ j(Le, { "aria-hidden": "true" })
	}];
	return /* @__PURE__ */ M("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ j("div", {
			className: "flex h-12 shrink-0 items-center gap-3 border-b border-border px-4",
			children: e
		}), /* @__PURE__ */ M("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ M("div", {
				className: "relative min-w-0 flex-1",
				children: [/* @__PURE__ */ j("div", {
					className: "h-full overflow-auto bg-muted/50 px-6 pt-8 pb-24",
					children: /* @__PURE__ */ j("section", {
						"aria-label": o.preview,
						"data-device": n,
						className: J("mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm", "transition-[max-width] duration-300 ease-out motion-reduce:transition-none", n === "desktop" ? "max-w-3xl" : "max-w-[390px]"),
						children: s
					})
				}), /* @__PURE__ */ M("div", {
					role: "toolbar",
					"aria-label": o.tools,
					className: "absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur",
					children: [c.map((e) => /* @__PURE__ */ j(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": e.label,
						"aria-pressed": n === e.id,
						onClick: () => r(e.id),
						className: J("text-muted-foreground", n === e.id && "bg-muted text-foreground"),
						children: e.icon
					}, e.id)), i && /* @__PURE__ */ M(A, { children: [/* @__PURE__ */ j("span", {
						"aria-hidden": "true",
						className: "mx-1 h-5 w-px bg-border"
					}), i] })]
				})]
			}), t && /* @__PURE__ */ j(qo, {
				label: o.aside,
				side: "right",
				defaultWidth: 264,
				resize: {
					label: o.resizeAside,
					storageKey: a,
					minWidth: 220
				},
				children: /* @__PURE__ */ j(Xo, {
					className: "gap-6 px-4 py-4",
					children: t
				})
			})]
		})]
	});
}
//#endregion
export { ks as AdminLayout, cr as Alert, dr as AlertAction, ur as AlertDescription, fr as AlertDialog, xr as AlertDialogAction, Sr as AlertDialogCancel, gr as AlertDialogContent, br as AlertDialogDescription, vr as AlertDialogFooter, _r as AlertDialogHeader, hr as AlertDialogOverlay, mr as AlertDialogPortal, yr as AlertDialogTitle, pr as AlertDialogTrigger, lr as AlertTitle, Ka as AppRail, Ja as AppRailItem, qa as AppRailSpacer, zr as AttachmentDropzone, Vr as AttachmentList, Sn as Avatar, Tn as AvatarBadge, wn as AvatarFallback, En as AvatarGroup, Dn as AvatarGroupCount, Cn as AvatarImage, Mn as Badge, Hr as Breadcrumb, Jr as BreadcrumbEllipsis, Wr as BreadcrumbItem, Gr as BreadcrumbLink, Ur as BreadcrumbList, Kr as BreadcrumbPage, qr as BreadcrumbSeparator, Z as Button, Yr as Card, $r as CardAction, ei as CardContent, Qr as CardDescription, ti as CardFooter, Xr as CardHeader, Zr as CardTitle, no as CategoryTree, io as ChatComposer, As as ChatPage, Vn as Checkbox, Un as Chip, Wn as ChipRow, ni as Collapsible, ii as CollapsibleContent, ri as CollapsibleTrigger, hi as ColorPicker, _i as Combobox, vi as Command, yi as CommandDialog, Si as CommandEmpty, Ci as CommandGroup, bi as CommandInput, Ti as CommandItem, xi as CommandList, wi as CommandSeparator, gi as CompletionChecklist, Ei as ComposerAttachments, Di as ConfirmActionDialog, Oi as ContextMenu, Ai as ContextMenuContent, ji as ContextMenuItem, Ni as ContextMenuLabel, Mi as ContextMenuSeparator, Pi as ContextMenuShortcut, ki as ContextMenuTrigger, fo as Conversation, Gn as CopyLinkButton, vn as DEVICE_WIDTHS, _o as DataGrid, Cr as Dialog, Mr as DialogClose, Dr as DialogContent, jr as DialogDescription, kr as DialogFooter, Or as DialogHeader, Er as DialogOverlay, Tr as DialogPortal, Ar as DialogTitle, wr as DialogTrigger, Fi as DropdownMenu, zi as DropdownMenuCheckboxItem, Ri as DropdownMenuContent, Q as DropdownMenuItem, Ki as DropdownMenuLabel, Li as DropdownMenuPortal, Bi as DropdownMenuRadioGroup, Vi as DropdownMenuRadioItem, $ as DropdownMenuSeparator, Gi as DropdownMenuShortcut, Hi as DropdownMenuSub, Wi as DropdownMenuSubContent, Ui as DropdownMenuSubTrigger, Ii as DropdownMenuTrigger, qi as EmptyState, $i as EntitySearchPicker, rn as GRID_CONTROL_COLUMN_WIDTH, Oo as GridActionMenuItems, Eo as GridActions, ra as GridFilterChips, xa as GridFilterEditor, Ca as GridFooter, Da as GridOptions, js as GridPage, Kn as IconButton, qn as IconToggle, Fr as ImageAdjustDialog, Zn as InitialsAvatar, Oa as InlineText, Qn as Input, $n as IntegerInput, er as Label, Na as LanguageSelect, jo as LiveCanvas, No as LiveCanvasGroup, Mo as LiveCanvasTarget, ut as MESSAGE_ATTACHMENT_MAX_MB, lt as MESSAGE_ATTACHMENT_MIMES, dt as MESSAGE_MAX_ATTACHMENTS, uo as MessageList, Ms as PageEditor, Po as PageViewer, tr as PasswordInput, Ji as Popover, Xi as PopoverAnchor, Zi as PopoverContent, Yi as PopoverTrigger, nr as RadioGroup, rr as RadioGroupItem, Pa as SearchField, Fa as SegmentedChoice, Ia as SegmentedChoiceItem, za as SegmentedTab, La as SegmentedTabs, Ba as SegmentedTabsContent, Ra as SegmentedTabsList, aa as Select, da as SelectContent, oa as SelectGroup, pa as SelectItem, fa as SelectLabel, ua as SelectScrollDownButton, la as SelectScrollUpButton, ma as SelectSeparator, ca as SelectTrigger, sa as SelectValue, ir as Separator, Fo as Sheet, Lo as SheetClose, Ho as SheetContent, Wo as SheetDescription, Vo as SheetHandle, zo as SheetOverlay, Ro as SheetPortal, Uo as SheetTitle, Io as SheetTrigger, qo as Sidebar, Xo as SidebarContent, Zo as SidebarFooter, Qo as SidebarGroup, Yo as SidebarHeader, Os as SidebarLayout, $o as SidebarMenu, ts as SidebarMenuButton, es as SidebarMenuItem, Va as StatCard, ar as Switch, ns as Table, is as TableBody, ls as TableCaption, cs as TableCell, as as TableFooter, ss as TableHead, rs as TableHeader, os as TableRow, Ha as Tabs, Ga as TabsContent, Ua as TabsList, Wa as TabsTrigger, or as Textarea, fs as ThreadList, Pn as Tooltip, In as TooltipContent, Nn as TooltipProvider, Fn as TooltipTrigger, Ts as VideoPlayer, kn as badgeVariants, Ln as buttonVariants, it as canMove, J as cn, Ze as descendantIds, Je as downloadText, Y as findNode, Qe as flattenVisible, ft as formatFileSize, wt as formatShortcut, qt as gridPreferencesKey, gt as gridSelectionState, st as indentNode, tt as insertNode, _t as isGridActionDisabled, yt as isMacPlatform, X as locate, xt as matchShortcut, at as moveNode, ot as moveSibling, ia as nativeSelectClass, ct as outdentNode, Xe as pathTo, nt as removeNode, rt as renameNode, mn as resizableWidthKey, yn as useFitScale, dn as useGrid, nn as useGridPreferences, xn as usePageDraft, _n as useResizableWidth, Ss as videoResumeKey, vt as visibleGridActions };

//# sourceMappingURL=index.js.map