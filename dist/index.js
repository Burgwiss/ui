import { clsx as e } from "clsx";
import { twMerge as t } from "tailwind-merge";
import { AlertDialog as n, Avatar as r, Checkbox as i, Collapsible as a, ContextMenu as o, Dialog as s, Direction as c, DropdownMenu as l, Label as u, Popover as d, RadioGroup as f, Select as p, Separator as m, Slot as h, Switch as g, Tabs as _, Tooltip as v } from "radix-ui";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import * as S from "react";
import { Fragment as C, createContext as w, forwardRef as T, useCallback as ee, useContext as te, useEffect as E, useId as D, useLayoutEffect as O, useMemo as k, useRef as A, useState as j } from "react";
import { cva as ne } from "class-variance-authority";
import { AlertTriangle as re, ArrowDown as ie, ArrowDownUp as ae, ArrowLeft as M, ArrowUp as N, Bookmark as P, BookmarkPlus as F, Captions as oe, Check as I, ChevronDown as L, ChevronLeft as se, ChevronRight as R, ChevronUp as ce, ChevronsUpDown as z, Circle as le, CircleDashed as B, CircleSlash as ue, Columns3 as V, Copy as de, CornerUpLeft as H, EllipsisVertical as fe, Eye as pe, EyeOff as me, Filter as U, Folder as he, FolderInput as ge, FolderOpen as _e, FolderPlus as ve, Inbox as ye, IndentDecrease as be, IndentIncrease as xe, Loader2 as Se, Maximize as Ce, MessagesSquare as W, Minimize as we, Monitor as Te, MoreHorizontal as Ee, Paperclip as De, Pause as Oe, Pencil as ke, PictureInPicture2 as Ae, Play as je, Plus as Me, RefreshCw as Ne, RotateCcw as Pe, RotateCw as Fe, Search as Ie, SendHorizontal as Le, Settings as Re, SkipForward as ze, Smartphone as G, Trash2 as Be, Volume1 as Ve, Volume2 as He, VolumeX as Ue, X as K } from "lucide-react";
import { Combobox as We, ComboboxButton as Ge, ComboboxInput as Ke, ComboboxOption as qe, ComboboxOptions as Je } from "@headlessui/react";
import { Command as Ye } from "cmdk";
import { useVirtualizer as Xe } from "@tanstack/react-virtual";
//#region src/lib/cn.ts
function q(...n) {
	return t(e(n));
}
//#endregion
//#region src/lib/direction.tsx
function Ze({ dir: e, children: t }) {
	return /* @__PURE__ */ b(c.DirectionProvider, {
		dir: e,
		children: t
	});
}
function Qe(e) {
	return c.useDirection(e);
}
function $e(e) {
	return e?.closest("[dir]")?.getAttribute("dir") === "rtl";
}
function et(e) {
	return $e(e) ? {
		forward: "ArrowLeft",
		back: "ArrowRight"
	} : {
		forward: "ArrowRight",
		back: "ArrowLeft"
	};
}
//#endregion
//#region src/lib/download.ts
function tt(e, t, n = "text/csv;charset=utf-8") {
	if (typeof document > "u") return;
	let r = URL.createObjectURL(new Blob([e], { type: n })), i = document.createElement("a");
	i.href = r, i.download = t, i.rel = "noopener", document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
//#endregion
//#region src/lib/tree.ts
var nt = (e) => (e.children?.length ?? 0) > 0;
function J(e, t) {
	for (let n of e) {
		if (n.id === t) return n;
		let e = n.children ? J(n.children, t) : null;
		if (e) return e;
	}
	return null;
}
function Y(e, t, n = null) {
	let r = e.findIndex((e) => e.id === t);
	if (r >= 0) return {
		parentId: n,
		index: r,
		siblings: e
	};
	for (let n of e) {
		let e = n.children ? Y(n.children, t, n.id) : null;
		if (e) return e;
	}
	return null;
}
function rt(e, t) {
	for (let n of e) {
		if (n.id === t) return [n];
		let e = n.children ? rt(n.children, t) : [];
		if (e.length) return [n, ...e];
	}
	return [];
}
function it(e, t) {
	let n = J(e, t);
	if (!n) return [];
	let r = [], i = (e) => {
		r.push(e.id), e.children?.forEach(i);
	};
	return i(n), r;
}
function at(e, t, n = 1, r = null) {
	return e.flatMap((i, a) => {
		let o = nt(i) && t.has(i.id), s = {
			node: i,
			level: n,
			parentId: r,
			posInSet: a + 1,
			setSize: e.length,
			hasChildren: nt(i),
			expanded: o
		};
		return o ? [s, ...at(i.children, t, n + 1, i.id)] : [s];
	});
}
function ot(e, t, n) {
	return t === null ? n(e) : e.map((e) => e.id === t ? {
		...e,
		children: n(e.children ?? [])
	} : e.children ? {
		...e,
		children: ot(e.children, t, n)
	} : e);
}
var st = (e, t) => Math.min(Math.max(e, 0), t);
function ct(e, t, n, r) {
	return t !== null && !J(e, t) ? e : ot(e, t, (e) => {
		let t = st(r ?? e.length, e.length);
		return [
			...e.slice(0, t),
			n,
			...e.slice(t)
		];
	});
}
function lt(e, t) {
	let n = Y(e, t);
	return n ? ot(e, n.parentId, (e) => e.filter((e) => e.id !== t)) : e;
}
function ut(e, t, n) {
	return e.map((e) => e.id === t ? {
		...e,
		label: n
	} : e.children ? {
		...e,
		children: ut(e.children, t, n)
	} : e);
}
function dt(e) {
	return 1 + Math.max(0, ...(e.children ?? []).map(dt));
}
function ft(e, t) {
	return rt(e, t).length;
}
function X(e, t, n, r) {
	let i = J(e, t);
	return !i || n !== null && (!J(e, n) || it(e, t).includes(n)) ? !1 : r === void 0 || (n === null ? 0 : ft(e, n)) + dt(i) <= r;
}
function pt(e, t, n, r, i) {
	if (!X(e, t, n, i)) return e;
	let a = Y(e, t), o = a.siblings[a.index], s = a.parentId === n && a.index < r ? r - 1 : r;
	return a.parentId === n && s === a.index ? e : ct(lt(e, t), n, o, s);
}
function mt(e, t, n) {
	let r = Y(e, t);
	if (!r) return e;
	let i = r.index + n;
	return i < 0 || i >= r.siblings.length ? e : pt(e, t, r.parentId, n === 1 ? r.index + 2 : i);
}
function ht(e, t, n) {
	let r = Y(e, t);
	if (!r || r.index === 0) return e;
	let i = r.siblings[r.index - 1];
	return pt(e, t, i.id, i.children?.length ?? 0, n);
}
function gt(e, t) {
	let n = Y(e, t);
	if (!n || n.parentId === null) return e;
	let r = Y(e, n.parentId);
	return pt(e, t, r.parentId, r.index + 1);
}
function _t(e) {
	return e.flatMap((e) => [e.id, ...e.children ? _t(e.children) : []]);
}
function vt(e) {
	return new Set(_t(e));
}
function yt(e, t, n) {
	if (e === t) return null;
	let r = vt(e), i = vt(t), a = [...r].filter((e) => !i.has(e)).find((t) => {
		let n = Y(e, t).parentId;
		return n === null || i.has(n);
	});
	if (a !== void 0) return {
		type: "remove",
		id: a
	};
	for (let e of i) {
		if (r.has(e)) continue;
		let n = Y(t, e);
		return {
			type: "add",
			id: e,
			label: n.siblings[n.index].label,
			parentId: n.parentId,
			index: n.index
		};
	}
	for (let n of i) {
		let r = J(e, n), i = J(t, n);
		if (r.label !== i.label) return {
			type: "rename",
			id: n,
			label: i.label
		};
	}
	let o = n !== void 0 && i.has(n) ? [n, ...i] : i;
	for (let n of o) {
		let r = Y(e, n), i = Y(t, n);
		if (r.parentId === i.parentId && r.index === i.index) continue;
		let a = r.parentId === i.parentId && r.index < i.index ? i.index + 1 : i.index;
		if (JSON.stringify(pt(e, n, i.parentId, a)) === JSON.stringify(t)) return {
			type: "move",
			id: n,
			parentId: i.parentId,
			index: a
		};
	}
	return null;
}
function bt(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let e of t) e !== null && n.set(e, (n.get(e) ?? 0) + 1);
	let r = {}, i = (e) => {
		let t = (n.get(e.id) ?? 0) + (e.children ?? []).reduce((e, t) => e + i(t), 0);
		return r[e.id] = t, t;
	};
	return e.forEach(i), r;
}
function xt(e, t, n) {
	return t.kind === "all" ? !0 : t.kind === "none" ? n === null || J(e, n) === null : n !== null && it(e, t.id).includes(n);
}
//#endregion
//#region src/lib/messageAttachments.ts
var St = [
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
], Ct = 25, wt = 5;
function Tt(e, t) {
	let n = {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	};
	return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toLocaleString(t, n)} KB` : `${(e / 1024 / 1024).toLocaleString(t, n)} MB`;
}
function Et(e, t) {
	return t.length === 0 || t.some((t) => t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e);
}
function Dt(e, t) {
	return e.size > t.maxSizeMb * 1024 * 1024 ? "too_large" : Et(e.type, t.mimes) ? null : "wrong_type";
}
function Ot(e, t, n) {
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
function kt(e) {
	return e <= 0 ? "none" : e === 1 ? "one" : "many";
}
function At(e, t) {
	return typeof e.disabled == "function" ? e.disabled(t) : e.disabled === !0;
}
function jt(e, t) {
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
function Mt() {
	return typeof navigator > "u" ? !1 : /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
function Nt(e) {
	let t = e.split("+").map((e) => e.trim()), n = t.pop() ?? "", r = (e) => t.some((t) => t.toLowerCase() === e);
	return {
		mod: r("mod"),
		shift: r("shift"),
		alt: r("alt"),
		key: n
	};
}
function Pt(e, t, n = Mt()) {
	let r = Nt(t), i = n ? e.metaKey : e.ctrlKey, a = n ? e.ctrlKey : e.metaKey;
	if (i !== r.mod || a || e.shiftKey !== r.shift || e.altKey !== r.alt) return !1;
	let o = r.key.toLowerCase(), s = e.key.toLowerCase();
	return o === "delete" ? s === "delete" || s === "backspace" : s === o;
}
var Ft = {
	Mod: "⌘",
	Shift: "⇧",
	Alt: "⌥",
	Delete: "⌫",
	Enter: "↩",
	Escape: "esc"
}, It = {
	Mod: "Ctrl",
	Shift: "Shift",
	Alt: "Alt",
	Delete: "Del",
	Enter: "Enter",
	Escape: "Esc"
};
function Lt(e, t = {}, n = Mt()) {
	let r = {
		...n ? Ft : It,
		...t
	}, { mod: i, shift: a, alt: o, key: s } = Nt(e), c = (e) => r[e] ?? (e.length === 1 ? e.toUpperCase() : e);
	return [
		...n ? [] : i ? [r.Mod] : [],
		...o ? [r.Alt] : [],
		...a ? [r.Shift] : [],
		...n && i ? [r.Mod] : [],
		c(s)
	].join(n ? "" : "+");
}
function Rt(e, t) {
	return e.value ? e.value(t) : t[e.id];
}
var zt = (e) => e == null || e === "", Bt = new Intl.Collator("de", {
	numeric: !0,
	sensitivity: "base"
});
function Vt(e, t) {
	return typeof e == "number" && typeof t == "number" ? e - t : e instanceof Date && t instanceof Date ? e.getTime() - t.getTime() : typeof e == "boolean" && typeof t == "boolean" ? Number(e) - Number(t) : Bt.compare(String(e), String(t));
}
function Ht(e, t, n) {
	let r = t.map((e) => ({
		s: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : [...e].sort((e, t) => {
		for (let { s: n, col: i } of r) {
			let r = Rt(i, e), a = Rt(i, t);
			if (zt(r) || zt(a)) {
				if (zt(r) && zt(a)) continue;
				return zt(r) ? 1 : -1;
			}
			let o = (i.compare ?? Vt)(r, a);
			if (o !== 0) return n.desc ? -o : o;
		}
		return 0;
	});
}
var Ut = (e) => e.toLocaleLowerCase("de").normalize("NFC");
function Wt(e) {
	if (e instanceof Date) return e.getTime();
	if (typeof e != "string" || e === "") return null;
	let t = Date.parse(e.length === 10 ? `${e}T00:00:00Z` : e);
	return Number.isNaN(t) ? null : t;
}
function Gt(e, t) {
	switch (e.type) {
		case "text": {
			let n = Ut(e.value.trim());
			if (n === "") return !0;
			let r = zt(t) ? "" : Ut(String(t));
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
			let n = Wt(t);
			if (n === null) return !1;
			let r = e.from ? Wt(e.from) : null, i = e.to ? Wt(e.to) + 86399999 : null;
			return (r === null || n >= r) && (i === null || n <= i);
		}
	}
}
function Kt(e, t, n) {
	let r = t.map((e) => ({
		f: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : e.filter((e) => r.every(({ f: t, col: n }) => Gt(t, Rt(n, e))));
}
function qt(e, t) {
	let n = {};
	for (let r of t) {
		if (!r.aggregate) continue;
		if (r.aggregate === "count") {
			n[r.id] = e.length;
			continue;
		}
		let t = e.map((e) => Rt(r, e)).filter((e) => typeof e == "number"), i = t.reduce((e, t) => e + t, 0);
		n[r.id] = r.aggregate === "sum" ? i : t.length === 0 ? 0 : r.aggregate === "avg" ? i / t.length : r.aggregate === "min" ? Math.min(...t) : Math.max(...t);
	}
	return n;
}
function Jt(e, t, n, r = 0, i = "") {
	let [a, ...o] = t, s = n.find((e) => e.id === a);
	if (!s) return [];
	let c = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Rt(s, t), n = zt(e) ? "" : String(e), r = c.get(n) ?? {
			value: zt(e) ? null : e,
			rows: []
		};
		r.rows.push(t), c.set(n, r);
	}
	return [...c.entries()].sort(([e], [t]) => e === "" || t === "" ? e === t ? 0 : e === "" ? 1 : -1 : Bt.compare(e, t)).map(([e, t]) => {
		let a = `${i}${i ? ">" : ""}${s.id}:${e}`;
		return {
			key: a,
			columnId: s.id,
			value: t.value,
			depth: r,
			rows: t.rows,
			children: o.length ? Jt(t.rows, o, n, r + 1, a) : [],
			aggregates: qt(t.rows, n)
		};
	});
}
function Yt(e, t, n, r) {
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
function Xt(e, t) {
	if (e.exportValue) return {
		text: e.exportValue(t),
		wasString: !0
	};
	let n = Rt(e, t);
	return zt(n) ? {
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
var Zt = /^[=+\-@\t\r]/;
function Qt(e, t, n) {
	let r = t && Zt.test(e) ? `'${e}` : e;
	return r.includes(n) || /["\r\n]/.test(r) ? `"${r.replace(/"/g, "\"\"")}"` : r;
}
function $t(e, t, { separator: n = ",", bom: r = !1 } = {}) {
	let i = [t.map((e) => Qt(e.header, !0, n)).join(n), ...e.map((e) => t.map((t) => {
		let { text: r, wasString: i } = Xt(t, e);
		return Qt(r, i, n);
	}).join(n))];
	return (r ? "﻿" : "") + i.join("\r\n");
}
function en(e, t) {
	let n = (e) => e.replace(/[\t\r\n]+/g, " ");
	return [t.map((e) => n(e.header)).join("	"), ...e.map((e) => t.map((t) => n(Xt(t, e).text)).join("	"))].join("\n");
}
function tn(e, t) {
	let n = new Set(t), r = e.filter((e) => n.has(e));
	return [...r, ...t.filter((e) => !r.includes(e))];
}
function nn(e, t, n) {
	if (e.indexOf(t) < 0) return e;
	let r = e.filter((e) => e !== t);
	return r.splice(Math.max(0, Math.min(r.length, n)), 0, t), r;
}
function rn(e, t) {
	let n = tn(t.order, e.map((e) => e.id)), r = new Map(e.map((e) => [e.id, e])), i = n.map((e) => r.get(e)).filter((e) => e.hideable === !1 || !t.hidden.includes(e.id)).map((e) => {
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
var an = {
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
}, on = 1;
function sn(e) {
	return `burgwiss-ui:grid:${e}`;
}
function cn() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function ln(e) {
	let t = (e) => Array.isArray(e) ? e.map(t) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((n) => [n, t(e[n])])) : e;
	return JSON.stringify(t({
		...e,
		hiddenColumns: [...e.hiddenColumns].sort()
	}));
}
function un(e, t) {
	return ln(e) === ln(t);
}
var dn = (e) => typeof e == "object" && !!e && !Array.isArray(e), fn = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string") : null;
function pn(e, t) {
	let n = e;
	return {
		hiddenColumns: fn(n.hiddenColumns) ?? t.hiddenColumns,
		density: n.density === "compact" || n.density === "comfortable" ? n.density : t.density,
		selection: typeof n.selection == "boolean" ? n.selection : t.selection,
		columnOrder: fn(n.columnOrder) ?? t.columnOrder,
		columnWidths: dn(n.columnWidths) ? Object.fromEntries(Object.entries(n.columnWidths).filter((e) => typeof e[1] == "number" && Number.isFinite(e[1]) && e[1] > 0)) : t.columnWidths,
		pinned: dn(n.pinned) ? Object.fromEntries(Object.entries(n.pinned).filter(([, e]) => e === "left" || e === "right" || e === null)) : t.pinned,
		sorting: Array.isArray(n.sorting) ? n.sorting.filter((e) => dn(e) && typeof e.id == "string" && typeof e.desc == "boolean") : t.sorting,
		groupBy: fn(n.groupBy) ?? t.groupBy,
		views: Array.isArray(n.views) ? n.views.filter((e) => dn(e) && typeof e.id == "string" && typeof e.name == "string" && dn(e.state)) : t.views,
		activeView: typeof n.activeView == "string" ? n.activeView : t.activeView
	};
}
function mn(e, t, n) {
	try {
		let r = e?.getItem(t);
		if (!r) return n;
		let i = JSON.parse(r);
		return !dn(i) || i.v !== on ? n : pn(i, n);
	} catch {
		return n;
	}
}
function hn(e, t, n, r) {
	try {
		un(n, r) ? e?.removeItem(t) : e?.setItem(t, JSON.stringify({
			v: on,
			...n
		}));
	} catch {}
}
function gn(e, t = {}) {
	let n = sn(e), r = t.storage === void 0 ? cn() : t.storage, i = JSON.stringify({
		...an,
		...t.defaults
	}), a = k(() => JSON.parse(i), [i]), [o, s] = j(() => ({
		key: n,
		prefs: mn(r, n, a)
	})), c = o.prefs;
	o.key !== n && (c = mn(r, n, a), s({
		key: n,
		prefs: c
	})), E(() => {
		if (typeof window > "u") return;
		let e = (e) => {
			e.key === n && s({
				key: n,
				prefs: mn(r, n, a)
			});
		};
		return window.addEventListener("storage", e), () => window.removeEventListener("storage", e);
	}, [
		n,
		r,
		a
	]);
	let l = (e) => {
		s((t) => {
			let i = e(t.key === n ? t.prefs : mn(r, n, a));
			return hn(r, n, i, a), {
				key: n,
				prefs: i
			};
		});
	};
	return {
		values: c,
		isDefault: un(c, a),
		isColumnVisible: (e) => !c.hiddenColumns.includes(e),
		setColumnVisible: (e, t) => l((n) => ({
			...n,
			hiddenColumns: t ? n.hiddenColumns.filter((t) => t !== e) : [...n.hiddenColumns.filter((t) => t !== e), e]
		})),
		setDensity: (e) => l((t) => ({
			...t,
			density: e
		})),
		setSelectionEnabled: (e) => l((t) => ({
			...t,
			selection: e
		})),
		set: (e) => l((t) => ({
			...t,
			...typeof e == "function" ? e(t) : e
		})),
		reset: () => l(() => a)
	};
}
//#endregion
//#region src/hooks/useGrid.ts
var _n = 40, vn = "a,button,input,select,textarea,label,[role=button],[role=checkbox],[role=menuitem],[data-grid-ignore]";
function yn(e) {
	return !!e?.closest("input:not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable=\"\"],[contenteditable=true]");
}
function bn(e) {
	return e instanceof Element ? e.closest("[data-grid-row-id]") : null;
}
function xn(e) {
	return e.metaKey || e.ctrlKey;
}
function Sn(e) {
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
var Cn = (e, t) => `${String(e)}::${t}`;
function wn({ id: e, rows: t, getRowId: n, columns: r, mode: i = "client", onQueryChange: a, selection: o = "multiple", actions: s = [], defaultSelectedIds: c = [], isExpandable: l, defaults: u, storage: d, initialFilters: f }) {
	let p = gn(e, {
		defaults: u,
		storage: d
	}), m = p.values, [h, g] = j(c), [_, v] = j(null), [y, b] = j(null), x = A(/* @__PURE__ */ new Map()), [S, C] = j(() => f ?? m.views.find((e) => e.id === m.activeView)?.state.filters ?? []), [w, T] = j(/* @__PURE__ */ new Set()), [ee, te] = j(/* @__PURE__ */ new Set()), [D, O] = j(/* @__PURE__ */ new Map()), [k, ne] = j(null), [re, ie] = j(null), [ae, M] = j(!1), N = (e) => r.find((t) => t.id === e), P = i === "client", F = m.sorting.filter((e) => N(e.id)?.sortable !== !1 && N(e.id)), oe = P ? m.groupBy.filter((e) => N(e)?.groupable) : [], I = P ? Ht(Kt(t, S, r), F, r) : t, L = oe.length ? Jt(I, oe, r) : [], se = Yt(I, L, w, n), R = I.map(n), ce = {
		sorting: F,
		filters: S
	}, z = JSON.stringify(ce), le = A(z);
	E(() => {
		i === "server" && le.current !== z && (le.current = z, a?.(JSON.parse(z)));
	}, [
		i,
		z,
		a
	]);
	let B = o !== "none" && m.selection ? o : "none", ue = new Set(R), V = B === "none" ? [] : h.filter((e) => ue.has(e)), de = kt(V.length), H = (e) => V.includes(e), fe = y !== null && ue.has(y) ? y : R[0] ?? null, pe = l !== void 0, me = rn(r, {
		order: m.columnOrder,
		hidden: m.hiddenColumns,
		widths: m.columnWidths,
		pinned: m.pinned,
		leading: (B === "multiple" ? 40 : 0) + (pe ? 40 : 0)
	}), U = (e) => {
		B !== "none" && g(B === "single" ? e.slice(-1) : [...new Set(e)]);
	}, he = (e) => {
		B !== "none" && (g(B === "single" ? H(e) ? [] : [e] : H(e) ? V.filter((t) => t !== e) : [...V, e]), v(e));
	}, ge = () => {
		B === "multiple" && g([...R]);
	}, _e = () => g([]), ve = (e, t) => {
		let n = R.indexOf(e), r = R.indexOf(t);
		return n < 0 || r < 0 ? [t] : R.slice(Math.min(n, r), Math.max(n, r) + 1);
	}, ye = (e) => {
		b(e), x.current.get(e)?.focus();
	}, be = (e, t) => !e || At(e, t) || !(e.when ?? ["none"]).includes(kt(t.length)) ? !1 : (e.onSelect(t), !0), xe = s.find((e) => e.isDefault), Se = (e) => {
		let t = H(e) ? V : [e];
		H(e) || U([e]), be(xe, t);
	}, Ce = (e) => t.find((t) => n(t) === e), W = (e) => l?.(e) ?? !1, we = (e) => {
		let t = Ce(e);
		t && W(t) && te((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, Te = () => me.map((e) => N(e.id)).filter(Boolean), Ee = () => I.filter((e) => H(n(e))), De = async () => {
		let e = y === null ? void 0 : Ce(y), t = V.length ? Ee() : e ? [e] : [];
		if (t.length === 0) return "";
		let n = en(t, Te());
		try {
			await navigator.clipboard?.writeText(n);
		} catch {}
		return n;
	}, Oe = (e, t) => {
		if (!(e.target instanceof Element && e.target.closest(vn)) && (b(t), B !== "none")) {
			if (B === "multiple" && e.shiftKey && _ !== null) {
				let n = ve(_, t);
				U(xn(e) ? [...V, ...n] : n);
				return;
			}
			if (B === "multiple" && xn(e)) {
				he(t);
				return;
			}
			U([t]), v(t);
		}
	}, ke = (e) => {
		let t = e.target;
		if (yn(t)) return;
		let n = bn(t), r = n ? Tn(n, R) : null;
		for (let t of jt(s, de).flat()) if (t.shortcut && Pt(e, t.shortcut)) {
			e.preventDefault(), be(t, V);
			return;
		}
		let i = e.metaKey || e.ctrlKey;
		if (e.key === "Escape" && V.length > 0) {
			e.preventDefault(), _e();
			return;
		}
		if (i && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "a") {
			if (B !== "multiple") return;
			e.preventDefault(), ge();
			return;
		}
		if (i && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "c") {
			if (window.getSelection?.()?.toString() || V.length === 0 && r === null) return;
			e.preventDefault(), De();
			return;
		}
		if (r === null || t !== n && t.closest(vn)) return;
		let a = R.indexOf(r), o = (t) => {
			let n = R[Math.max(0, Math.min(R.length - 1, t))];
			if (n !== void 0) {
				if (e.preventDefault(), ye(n), e.shiftKey && B === "multiple") {
					let e = _ ?? r;
					v(e), U(ve(e, n));
				} else !i && B !== "none" && (U([n]), v(n));
			}
		}, c = Ce(r);
		switch (e.key) {
			case "ArrowDown": return o(a + 1);
			case "ArrowUp": return o(a - 1);
			case "Home": return o(0);
			case "End": return o(R.length - 1);
			case "ArrowRight":
			case "ArrowLeft": {
				if (!c || !W(c)) return;
				let n = $e(t);
				e.key === "ArrowRight" !== n !== ee.has(r) && (e.preventDefault(), we(r));
				return;
			}
			case " ":
				e.preventDefault(), B === "multiple" ? he(r) : B === "single" && U([r]);
				return;
			case "Enter":
				e.preventDefault(), Se(r);
				return;
		}
	}, Ae = (e) => {
		let t = bn(e.target);
		if (!t) {
			_e();
			return;
		}
		let n = Tn(t, R);
		n !== null && (b(n), H(n) || (U([n]), v(n)));
	}, je = () => ({
		hiddenColumns: m.hiddenColumns,
		columnOrder: m.columnOrder,
		columnWidths: m.columnWidths,
		pinned: m.pinned,
		sorting: m.sorting,
		filters: S,
		groupBy: m.groupBy,
		density: m.density
	}), Me = m.views.find((e) => e.id === m.activeView) ?? null, Ne = (e, t) => {
		let r = D.get(Cn(n(e), t));
		if (r && r.row === e) return r.value;
		let i = N(t);
		return i ? Rt(i, e) : void 0;
	}, Pe = (e, t) => O((n) => {
		let r = new Map(n);
		return t === null ? r.delete(e) : r.set(e, t), r;
	});
	return {
		id: e,
		preferences: p,
		actions: s,
		columns: r,
		columnById: N,
		layout: me,
		visibleRows: I,
		lines: se,
		getRowId: n,
		mode: B,
		dataMode: i,
		query: ce,
		sorting: F,
		toggleSort: (e, t = !1) => {
			let n = N(e);
			n && n.sortable !== !1 && p.set((n) => {
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
		setSorting: (e) => p.set({ sorting: e }),
		filters: S,
		setFilter: (e) => C((t) => [...t.filter((t) => t.id !== e.id), e]),
		removeFilter: (e) => C((t) => t.filter((t) => t.id !== e)),
		clearFilters: () => C([]),
		canGroup: P && r.some((e) => e.groupable),
		groupBy: oe,
		setGroupBy: (e) => {
			P && p.set({ groupBy: e.filter((e) => N(e)?.groupable) });
		},
		toggleGroup: (e) => T((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		}),
		isGroupExpanded: (e) => w.has(e),
		expandAllGroups: () => {
			let e = /* @__PURE__ */ new Set(), t = (n) => n.forEach((n) => (e.add(n.key), t(n.children)));
			t(L), T(e);
		},
		collapseAllGroups: () => T(/* @__PURE__ */ new Set()),
		hasExpandableRows: pe,
		canExpand: W,
		isRowExpanded: (e) => ee.has(e),
		toggleRowExpanded: we,
		setColumnWidth: (e, t) => p.set((n) => ({ columnWidths: {
			...n.columnWidths,
			[e]: Math.round(t)
		} })),
		moveColumn: (e, t) => p.set((n) => ({ columnOrder: nn(tn(n.columnOrder, r.map((e) => e.id)), e, t) })),
		pinColumn: (e, t) => p.set((n) => ({ pinned: {
			...n.pinned,
			[e]: t
		} })),
		views: m.views,
		activeViewId: Me?.id ?? null,
		isViewModified: Me !== null && Sn(Me.state) !== Sn(je()),
		saveView: (e) => {
			let t = e.trim();
			if (!t) return null;
			let n = {
				id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
				name: t,
				state: je()
			};
			return p.set((e) => ({
				views: [...e.views, n],
				activeView: n.id
			})), n;
		},
		applyView: (e) => {
			let t = m.views.find((t) => t.id === e);
			if (!t) return;
			let n = t.state;
			p.set({
				hiddenColumns: n.hiddenColumns ?? [],
				columnOrder: n.columnOrder ?? [],
				columnWidths: n.columnWidths ?? {},
				pinned: n.pinned ?? {},
				sorting: n.sorting ?? [],
				groupBy: n.groupBy ?? [],
				density: n.density ?? m.density,
				activeView: t.id
			}), C(n.filters ?? []);
		},
		updateView: (e) => {
			let t = je();
			p.set((n) => ({
				views: n.views.map((n) => n.id === e ? {
					...n,
					state: t
				} : n),
				activeView: e
			}));
		},
		renameView: (e, t) => {
			let n = t.trim();
			n && p.set((t) => ({ views: t.views.map((t) => t.id === e ? {
				...t,
				name: n
			} : t) }));
		},
		deleteView: (e) => p.set((t) => ({
			views: t.views.filter((t) => t.id !== e),
			activeView: t.activeView === e ? null : t.activeView
		})),
		exportCsv: ({ scope: e = "all", separator: t, bom: n } = {}) => $t(e === "selection" ? Ee() : I, Te(), {
			separator: t,
			bom: n
		}),
		copySelection: De,
		editing: k,
		editError: re,
		editPending: ae,
		startEdit: (e, t) => {
			N(t)?.editable && Ce(e) && (ie(null), ne({
				rowId: e,
				columnId: t
			}));
		},
		cancelEdit: () => {
			ne(null), ie(null);
		},
		commitEdit: async (e) => {
			if (!k) return !1;
			let t = N(k.columnId), n = Ce(k.rowId);
			if (!t?.editable || !n) return !1;
			let r = t.editable.validate?.(e, n) ?? null;
			if (r) return ie(r), !1;
			let i = Cn(k.rowId, t.id), a = Ne(n, t.id);
			Pe(i, {
				row: n,
				value: e
			}), M(!0);
			try {
				return await t.editable.onCommit(n, e, a), ne(null), ie(null), !0;
			} catch (e) {
				return Pe(i, null), ie(e instanceof Error ? e.message : String(e)), !1;
			} finally {
				M(!1);
			}
		},
		cellValue: Ne,
		allowedMode: o,
		selectedIds: V,
		selectionState: de,
		visibleActions: jt(s, de),
		isSelected: H,
		select: U,
		toggle: he,
		selectAll: ge,
		clear: _e,
		showCheckboxes: B === "multiple",
		getTableProps: () => ({
			role: "grid",
			...B === "multiple" ? { "aria-multiselectable": !0 } : {}
		}),
		getRowProps: (e) => ({
			"data-grid-row-id": String(e),
			"data-state": H(e) ? "selected" : void 0,
			...B === "none" ? {} : { "aria-selected": H(e) },
			tabIndex: e === fe ? 0 : -1,
			ref: (t) => {
				t ? x.current.set(e, t) : x.current.delete(e);
			},
			onClick: (t) => Oe(t, e),
			onDoubleClick: (t) => {
				t.target instanceof Element && t.target.closest(vn) || Se(e);
			},
			onMouseDown: (e) => {
				e.shiftKey && (e.preventDefault(), e.currentTarget.focus());
			},
			onFocus: () => b(e),
			className: "cursor-default outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
		}),
		getRowCheckboxProps: (e, t) => ({
			type: "checkbox",
			"aria-label": t,
			checked: H(e),
			tabIndex: -1,
			onChange: () => he(e)
		}),
		getSelectAllProps: (e) => {
			let t = R.length > 0 && R.every((e) => H(e)), n = !t && V.length > 0;
			return {
				type: "checkbox",
				"aria-label": e,
				checked: t,
				ref: (e) => {
					e && (e.indeterminate = n);
				},
				onChange: () => t ? _e() : ge()
			};
		},
		onKeyDown: ke,
		onContextMenu: Ae
	};
}
function Tn(e, t) {
	let n = e.dataset.gridRowId;
	return t.find((e) => String(e) === n) ?? null;
}
//#endregion
//#region src/hooks/useResizableWidth.ts
var En = 1;
function Dn(e) {
	return `burgwiss-ui:width:${e}`;
}
function On(e, t, n) {
	return Math.round(Math.min(n, Math.max(t, e)));
}
function kn(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, a = On(n, r, i);
	if (!t || typeof window > "u") return a;
	try {
		let e = JSON.parse(window.localStorage.getItem(Dn(t)) ?? "null"), n = e?.width;
		return e?.v !== En || typeof n != "number" ? a : Number.isFinite(n) ? On(n, r, i) : a;
	} catch {
		return a;
	}
}
function An(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, [a, o] = j(() => kn(e));
	E(() => {
		if (!t || typeof window > "u") return;
		let e = (e) => {
			e.key === Dn(t) && o(kn({
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
			let n = Dn(t);
			e === null ? window.localStorage.removeItem(n) : window.localStorage.setItem(n, JSON.stringify({
				v: En,
				width: e
			}));
		} catch {}
	};
	return {
		width: a,
		minWidth: r,
		maxWidth: i,
		setWidth: (e) => {
			let t = On(e, r, i);
			o(t), s(t);
		},
		reset: () => {
			o(On(n, r, i)), s(null);
		}
	};
}
//#endregion
//#region src/hooks/useFitScale.ts
var jn = {
	mobile: 390,
	tablet: 834,
	desktop: 1280
};
function Mn(e) {
	let t = A(null), [n, r] = j(null);
	return E(() => {
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
var Nn = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function Pn(e) {
	let [t, n] = j(e), [r, i] = j(e), [a, o] = j([]), s = (e, t, n) => {
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
		changes: Object.keys(e[c[0]]).flatMap((e) => c.filter((n) => !Nn(r[n][e], t[n][e])).map((t) => ({
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
var Fn = S.forwardRef(function({ className: e, size: t = "default", ...n }, i) {
	return /* @__PURE__ */ b(r.Root, {
		ref: i,
		"data-slot": "avatar",
		"data-size": t,
		className: q("group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6", e),
		...n
	});
});
Fn.displayName = "Avatar";
var In = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(r.Image, {
		ref: n,
		"data-slot": "avatar-image",
		className: q("aspect-square size-full", e),
		...t
	});
});
In.displayName = "AvatarImage";
var Ln = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(r.Fallback, {
		ref: n,
		"data-slot": "avatar-fallback",
		className: q("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", e),
		...t
	});
});
Ln.displayName = "AvatarFallback";
var Rn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("span", {
		ref: n,
		"data-slot": "avatar-badge",
		className: q("absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none", "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden", "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2", "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2", e),
		...t
	});
});
Rn.displayName = "AvatarBadge";
var zn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "avatar-group",
		className: q("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", e),
		...t
	});
});
zn.displayName = "AvatarGroup";
var Bn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "avatar-group-count",
		className: q("relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3", e),
		...t
	});
});
Bn.displayName = "AvatarGroupCount";
//#endregion
//#region src/atoms/Badge/Badge.tsx
var Vn = "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:pointer-events-none", Hn = ne(Vn, {
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
}), Un = {
	success: "border-success/30 bg-success/10 text-success-tint-foreground",
	warning: "border-warning/40 bg-warning/10 text-warning-tint-foreground",
	destructive: "border-destructive/30 bg-destructive/10 text-destructive-tint-foreground",
	neutral: "border-border bg-card text-foreground",
	muted: "border-border bg-muted text-muted-foreground",
	faint: "border-border/60 bg-muted/50 text-muted-foreground"
}, Wn = {
	success: "bg-success",
	warning: "bg-warning",
	destructive: "bg-destructive",
	neutral: "bg-muted-foreground",
	muted: "bg-muted-foreground/60",
	faint: "bg-muted-foreground/40"
}, Gn = S.forwardRef(function({ className: e, variant: t, tone: n, dot: r = !1, asChild: i = !1, children: a, ...o }, s) {
	let c = i ? h.Root : "span", l = q(n ? q(Vn, Un[n]) : Hn({ variant: t }), e);
	return i ? /* @__PURE__ */ b(c, {
		ref: s,
		"data-slot": "badge",
		className: l,
		...o,
		children: a
	}) : /* @__PURE__ */ x(c, {
		ref: s,
		"data-slot": "badge",
		className: l,
		...o,
		children: [n && r ? /* @__PURE__ */ b("span", {
			className: q("size-1.5 shrink-0 rounded-full", Wn[n]),
			"aria-hidden": "true"
		}) : null, a]
	});
});
Gn.displayName = "Badge";
//#endregion
//#region src/atoms/Tooltip/Tooltip.tsx
function Kn({ delayDuration: e = 200, ...t }) {
	return /* @__PURE__ */ b(v.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
function qn({ ...e }) {
	return /* @__PURE__ */ b(v.Root, {
		"data-slot": "tooltip",
		...e
	});
}
var Jn = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(v.Trigger, {
		ref: t,
		"data-slot": "tooltip-trigger",
		...e
	});
});
Jn.displayName = "TooltipTrigger";
var Yn = S.forwardRef(function({ className: e, sideOffset: t = 6, children: n, ...r }, i) {
	return /* @__PURE__ */ b(v.Portal, { children: /* @__PURE__ */ b(v.Content, {
		ref: i,
		"data-slot": "tooltip-content",
		sideOffset: t,
		className: q("z-50 overflow-hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0", e),
		...r,
		children: n
	}) });
});
Yn.displayName = "TooltipContent";
//#endregion
//#region src/atoms/Button/Button.tsx
var Xn = ne("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:not-aria-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
			outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
			ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
			link: "text-foreground underline decoration-primary underline-offset-4 hover:decoration-2"
		},
		size: {
			default: "h-8 gap-1.5 px-2.5 pointer-coarse:min-h-11 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
			xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
			lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
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
}), Zn = /* @__PURE__ */ new Set([
	"icon",
	"icon-xs",
	"icon-sm",
	"icon-lg"
]);
function Qn(e) {
	e.preventDefault();
}
function $n(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) n === "disabled" || /^on[A-Z]/.test(n) || (t[n] = r);
	return {
		...t,
		"aria-disabled": !0,
		onClick: Qn
	};
}
var Z = S.forwardRef(function({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, tooltip: i, tooltipSide: a = "top", "aria-label": o, ...s }, c) {
	let l = r ? h.Root : "button", u = Zn.has(n ?? "default"), d = i ?? (u ? o : void 0), f = o ?? (u && typeof i == "string" ? i : void 0), p = d != null && d !== "", m = p && s.disabled === !0 ? $n(s) : s, g = /* @__PURE__ */ b(l, {
		ref: c,
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		"aria-label": f,
		className: q(Xn({
			variant: t,
			size: n,
			className: e
		})),
		...m
	});
	return p ? /* @__PURE__ */ b(Kn, { children: /* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
		asChild: !0,
		children: g
	}), /* @__PURE__ */ b(Yn, {
		side: a,
		children: d
	})] }) }) : g;
});
Z.displayName = "Button";
//#endregion
//#region src/atoms/Checkbox/Checkbox.tsx
var er = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(i.Root, {
		ref: n,
		"data-slot": "checkbox",
		className: q("peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background text-primary shadow-sm transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", e),
		...t,
		children: /* @__PURE__ */ b(i.Indicator, {
			"data-slot": "checkbox-indicator",
			className: q("flex items-center justify-center text-current"),
			children: /* @__PURE__ */ b(I, {
				className: "h-3 w-3",
				"aria-hidden": "true"
			})
		})
	});
});
er.displayName = "Checkbox";
//#endregion
//#region src/atoms/Chip/Chip.tsx
var tr = (e) => q("inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 text-sm transition-colors", e ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground");
function nr(e) {
	if (e.multi) {
		let { id: t, checked: n, onChange: r, ariaLabel: i, children: a, className: o } = e;
		return /* @__PURE__ */ x("label", {
			htmlFor: t,
			"data-state": n ? "on" : "off",
			className: q(tr(n), "cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1", o),
			children: [
				/* @__PURE__ */ b("input", {
					id: t,
					type: "checkbox",
					className: "sr-only",
					checked: n,
					onChange: (e) => r(e.target.checked),
					"aria-label": i
				}),
				n && /* @__PURE__ */ b(I, {
					className: "size-3.5 shrink-0",
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ b("span", { children: a })
			]
		});
	}
	let { selected: t = !1, children: n, className: r, ...i } = e;
	return /* @__PURE__ */ x("button", {
		type: "button",
		"data-chip": "",
		"data-state": t ? "on" : "off",
		"aria-pressed": t,
		className: q(tr(t), "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none", r),
		...i,
		children: [t && /* @__PURE__ */ b(I, {
			className: "size-3.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ b("span", { children: n })]
	});
}
function rr({ children: e, ariaLabel: t, className: n, ...r }) {
	let i = S.useRef(null), [a, o] = S.useState(0), s = S.useCallback(() => Array.from(i.current?.querySelectorAll("[data-chip]") ?? []), []);
	S.useEffect(() => {
		s().forEach((e, t) => {
			e.tabIndex = t === a ? 0 : -1;
		});
	});
	function c(e) {
		let t = s();
		if (t.length === 0) return;
		let n = a, { forward: r } = et(e.currentTarget);
		switch (e.key === "ArrowLeft" || e.key === "ArrowRight" ? e.key === r ? "next" : "prev" : e.key) {
			case "next":
			case "ArrowDown":
				n = Math.min(t.length - 1, a + 1);
				break;
			case "prev":
			case "ArrowUp":
				n = Math.max(0, a - 1);
				break;
			case "Home":
				n = 0;
				break;
			case "End":
				n = t.length - 1;
				break;
			default: return;
		}
		e.preventDefault(), o(n), t[n]?.focus();
	}
	function l(e) {
		let t = e.target, n = s().findIndex((e) => e === t);
		n >= 0 && o(n);
	}
	return /* @__PURE__ */ b("div", {
		ref: i,
		role: "group",
		"aria-label": t,
		onKeyDown: c,
		onFocus: l,
		className: q("flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", n),
		...r,
		children: e
	});
}
//#endregion
//#region src/atoms/CopyLinkButton/CopyLinkButton.tsx
function ir({ url: e, label: t, copiedLabel: n, size: r = "icon", hint: i }) {
	let [a, o] = S.useState(!1), s = S.useRef(null);
	S.useEffect(() => () => {
		s.current !== null && window.clearTimeout(s.current);
	}, []);
	let c = S.useCallback(() => {
		navigator.clipboard?.writeText && navigator.clipboard.writeText(e).then(() => {
			o(!0), s.current !== null && window.clearTimeout(s.current), s.current = window.setTimeout(() => o(!1), 2e3);
		}, () => {});
	}, [e]);
	return /* @__PURE__ */ x(Kn, { children: [
		/* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
			asChild: !0,
			children: /* @__PURE__ */ x(Z, {
				type: "button",
				variant: "ghost",
				size: r,
				onClick: c,
				"aria-label": a ? n : t,
				children: [a ? /* @__PURE__ */ b(I, {
					className: "size-4 text-success",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ b(de, {
					className: "size-4",
					"aria-hidden": "true"
				}), r === "sm" ? /* @__PURE__ */ b("span", { children: a ? n : t }) : null]
			})
		}), /* @__PURE__ */ b(Yn, { children: a ? n : t })] }),
		/* @__PURE__ */ b("span", {
			role: "status",
			className: "sr-only",
			children: a ? n : ""
		}),
		i ? /* @__PURE__ */ b("span", {
			className: "sr-only",
			children: i
		}) : null
	] });
}
//#endregion
//#region src/atoms/IconButton/IconButton.tsx
var ar = T(function({ label: e, icon: t, destructive: n = !1, className: r, type: i = "button", ...a }, o) {
	return /* @__PURE__ */ b(Kn, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
			asChild: !0,
			children: /* @__PURE__ */ b("button", {
				ref: o,
				type: i,
				"aria-label": e,
				className: q("inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:bg-muted hover:text-foreground", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", n && "hover:bg-destructive hover:text-destructive-foreground", r),
				...a,
				children: t
			})
		}), /* @__PURE__ */ b(Yn, { children: e })] })
	});
}), or = T(function({ label: e, icon: t, value: n, as: r, className: i, ...a }, o) {
	return /* @__PURE__ */ b(Kn, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
			asChild: !0,
			children: /* @__PURE__ */ b(r, {
				ref: o,
				value: n,
				"aria-label": e,
				className: q("inline-flex min-h-9 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "aria-checked:bg-primary aria-checked:text-primary-foreground aria-checked:shadow-sm", "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm", i),
				...a,
				children: t
			})
		}), /* @__PURE__ */ b(Yn, { children: e })] })
	});
});
//#endregion
//#region src/lib/initials.ts
function sr(e) {
	let t = e.trim().split(/\s+/).filter(Boolean), n = t[0];
	if (n === void 0) return "?";
	if (t.length === 1) return n.charAt(0).toUpperCase();
	let r = t[t.length - 1] ?? n;
	return (n.charAt(0) + r.charAt(0)).toUpperCase();
}
//#endregion
//#region src/atoms/InitialsAvatar/InitialsAvatar.tsx
var cr = {
	sm: "size-9 text-xs",
	md: "size-10 text-sm",
	lg: "size-12 text-base"
};
function lr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = (t * 31 + e.charCodeAt(n)) % 360;
	return t;
}
function ur(e) {
	return {
		backgroundColor: `hsl(${e} 60% 90%)`,
		color: `hsl(${e} 55% 26%)`
	};
}
function dr({ name: e, size: t = "md", colored: n = !1, className: r }) {
	let i = n ? ur(lr(e)) : void 0;
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		"data-testid": "initials-avatar",
		style: i,
		className: q("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", !n && "bg-muted text-foreground", cr[t], r),
		children: sr(e)
	});
}
//#endregion
//#region src/atoms/Input/Input.tsx
var fr = S.forwardRef(({ className: e, type: t, ...n }, r) => /* @__PURE__ */ b("input", {
	type: t,
	ref: r,
	"data-slot": "input",
	className: q("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-coarse:min-h-11", e),
	...n
}));
fr.displayName = "Input";
//#endregion
//#region src/atoms/IntegerInput/IntegerInput.tsx
var pr = S.forwardRef(function({ value: e, onValueChange: t, emptyValue: n = 0, onBlur: r, ...i }, a) {
	let [o, s] = S.useState(() => Number.isFinite(e) ? String(e) : "");
	return (o.trim() === "" ? n : Number(o)) !== e && s(Number.isFinite(e) ? String(e) : ""), /* @__PURE__ */ b(fr, {
		ref: a,
		type: "text",
		inputMode: "numeric",
		value: o,
		onChange: (e) => {
			let r = e.target.value, i = r.replace(/[^0-9]/g, "").replace(/^0+(?=\d)/, "");
			i !== r && (e.currentTarget.value = i), s(i), t(i.trim() === "" ? n : Number(i));
		},
		onBlur: (e) => {
			let n = Number(e.currentTarget.value);
			if (e.currentTarget.value.trim() !== "" && Number.isFinite(n)) {
				let e = typeof i.min == "number" ? i.min : -Infinity, r = typeof i.max == "number" ? i.max : Infinity, a = Math.min(r, Math.max(e, n));
				a !== n && (s(String(a)), t(a));
			}
			r?.(e);
		},
		...i
	});
}), mr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(u.Root, {
		ref: n,
		"data-slot": "label",
		className: q("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
});
mr.displayName = "Label";
//#endregion
//#region src/atoms/PasswordInput/PasswordInput.tsx
var hr = T(function({ className: e, labels: t, ...n }, r) {
	let [i, a] = j(!1);
	return /* @__PURE__ */ x("div", {
		className: "relative",
		children: [/* @__PURE__ */ b(fr, {
			ref: r,
			type: i ? "text" : "password",
			className: q("pe-10", e),
			...n
		}), /* @__PURE__ */ b(ar, {
			label: i ? t.hide : t.show,
			"aria-pressed": i,
			onClick: () => a((e) => !e),
			icon: b(i ? me : pe, {
				className: "size-4",
				"aria-hidden": "true"
			}),
			className: "absolute inset-y-0 end-0 my-auto me-1 h-7 w-7"
		})]
	});
}), gr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Root, {
		ref: n,
		"data-slot": "radio-group",
		className: q("grid gap-2", e),
		...t
	});
});
gr.displayName = "RadioGroup";
var _r = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Item, {
		ref: n,
		"data-slot": "radio-group-item",
		className: q("aspect-square size-4 rounded-full border border-input text-primary shadow-sm", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", e),
		...t,
		children: /* @__PURE__ */ b(f.Indicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ b("span", { className: "size-2 rounded-full bg-primary" })
		})
	});
});
_r.displayName = "RadioGroupItem";
//#endregion
//#region src/atoms/Separator/Separator.tsx
var vr = S.forwardRef(function({ className: e, orientation: t = "horizontal", decorative: n = !0, ...r }, i) {
	return /* @__PURE__ */ b(m.Root, {
		ref: i,
		"data-slot": "separator",
		decorative: n,
		orientation: t,
		className: q("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", e),
		...r
	});
});
vr.displayName = "Separator";
//#endregion
//#region src/atoms/Switch/Switch.tsx
var yr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(g.Root, {
		ref: n,
		"data-slot": "switch",
		className: q("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted", e),
		...t,
		children: /* @__PURE__ */ b(g.Thumb, { className: q("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-transform", "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0", "rtl:data-[state=checked]:-translate-x-4") })
	});
});
yr.displayName = "Switch";
//#endregion
//#region src/atoms/Textarea/Textarea.tsx
var br = S.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ b("textarea", {
	ref: n,
	"data-slot": "textarea",
	className: q("flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", e),
	...t
}));
br.displayName = "Textarea";
//#endregion
//#region src/molecules/Alert/Alert.tsx
var xr = ne("group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current"
	} },
	defaultVariants: { variant: "default" }
});
function Sr({ className: e, variant: t, ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert",
		role: "alert",
		className: q(xr({ variant: t }), e),
		...n
	});
}
function Cr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-title",
		className: q("font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", e),
		...t
	});
}
function wr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-description",
		className: q("text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", e),
		...t
	});
}
function Tr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-action",
		className: q("absolute end-2 top-2", e),
		...t
	});
}
//#endregion
//#region src/molecules/AlertDialog/AlertDialog.tsx
function Er({ ...e }) {
	return /* @__PURE__ */ b(n.Root, {
		"data-slot": "alert-dialog",
		...e
	});
}
var Dr = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(n.Trigger, {
		ref: t,
		"data-slot": "alert-dialog-trigger",
		...e
	});
});
Dr.displayName = "AlertDialogTrigger";
function Or({ ...e }) {
	return /* @__PURE__ */ b(n.Portal, {
		"data-slot": "alert-dialog-portal",
		...e
	});
}
var kr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Overlay, {
		ref: r,
		"data-slot": "alert-dialog-overlay",
		className: q("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
kr.displayName = "AlertDialogOverlay";
var Ar = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ x(Or, { children: [/* @__PURE__ */ b(kr, {}), /* @__PURE__ */ b(n.Content, {
		ref: r,
		"data-slot": "alert-dialog-content",
		className: q("fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	})] });
});
Ar.displayName = "AlertDialogContent";
var jr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "alert-dialog-header",
		className: q("flex flex-col gap-2 text-start", e),
		...t
	});
});
jr.displayName = "AlertDialogHeader";
var Mr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "alert-dialog-footer",
		className: q("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
});
Mr.displayName = "AlertDialogFooter";
var Nr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Title, {
		ref: r,
		"data-slot": "alert-dialog-title",
		className: q("text-lg font-semibold text-foreground", e),
		...t
	});
});
Nr.displayName = "AlertDialogTitle";
var Pr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Description, {
		ref: r,
		"data-slot": "alert-dialog-description",
		className: q("text-sm text-muted-foreground", e),
		...t
	});
});
Pr.displayName = "AlertDialogDescription";
var Fr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Action, {
		ref: r,
		"data-slot": "alert-dialog-action",
		className: q("inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
Fr.displayName = "AlertDialogAction";
var Ir = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Cancel, {
		ref: r,
		"data-slot": "alert-dialog-cancel",
		className: q("inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
Ir.displayName = "AlertDialogCancel";
//#endregion
//#region src/molecules/Dialog/Dialog.tsx
function Lr({ ...e }) {
	return /* @__PURE__ */ b(s.Root, {
		"data-slot": "dialog",
		...e
	});
}
function Rr({ ...e }) {
	return /* @__PURE__ */ b(s.Trigger, {
		"data-slot": "dialog-trigger",
		...e
	});
}
function zr({ ...e }) {
	return /* @__PURE__ */ b(s.Portal, {
		"data-slot": "dialog-portal",
		...e
	});
}
var Br = S.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ b(s.Overlay, {
	ref: n,
	"data-slot": "dialog-overlay",
	className: q("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
	...t
}));
Br.displayName = s.Overlay.displayName;
var Vr = S.forwardRef(({ className: e, children: t, closeLabel: n, ...r }, i) => /* @__PURE__ */ x(zr, { children: [/* @__PURE__ */ b(Br, {}), /* @__PURE__ */ x(s.Content, {
	ref: i,
	"data-slot": "dialog-content",
	className: q("fixed top-4 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 translate-y-0 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-[var(--motion-duration,200ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:top-1/2 sm:-translate-y-1/2", e),
	...r,
	children: [t, /* @__PURE__ */ b(s.Close, {
		"aria-label": n,
		className: "absolute end-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
		children: /* @__PURE__ */ b(K, {
			className: "h-4 w-4",
			"aria-hidden": "true"
		})
	})]
})] }));
Vr.displayName = s.Content.displayName;
function Hr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "dialog-header",
		className: q("flex flex-col gap-2 text-start", e),
		...t
	});
}
function Ur({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "dialog-footer",
		className: q("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
}
function Wr({ className: e, ...t }) {
	return /* @__PURE__ */ b(s.Title, {
		"data-slot": "dialog-title",
		className: q("text-lg font-semibold text-foreground", e),
		...t
	});
}
function Gr({ className: e, ...t }) {
	return /* @__PURE__ */ b(s.Description, {
		"data-slot": "dialog-description",
		className: q("text-sm text-muted-foreground", e),
		...t
	});
}
function Kr({ ...e }) {
	return /* @__PURE__ */ b(s.Close, {
		"data-slot": "dialog-close",
		...e
	});
}
//#endregion
//#region src/molecules/ImageAdjustDialog/ImageAdjustDialog.tsx
var qr = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]), Jr = 64;
function Yr({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	return /* @__PURE__ */ b(Lr, {
		open: e !== null,
		onOpenChange: (e) => {
			e || r();
		},
		children: /* @__PURE__ */ x(Vr, {
			className: "max-w-2xl",
			closeLabel: i.close,
			children: [/* @__PURE__ */ x(Hr, { children: [/* @__PURE__ */ b(Wr, { children: i.title }), /* @__PURE__ */ b(Gr, { children: i.description(t) })] }), e !== null && /* @__PURE__ */ b(Xr, {
				file: e,
				maxDimension: t,
				onApply: n,
				onCancel: r,
				labels: i
			}, `${e.name}:${e.size}:${e.lastModified}`)]
		})
	});
}
function Xr({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	let [a, o] = j(null), [s, c] = j(null), [l, u] = j(String(t)), [d, f] = j(.9), [p, m] = j(!1), [h, g] = j(null), _ = A(null), v = qr.has(e.type), S = Number.parseInt(l, 10), C = Number.isFinite(S) && S > 0 ? Math.min(t, Math.max(Jr, S)) : t;
	E(() => {
		if (typeof URL.createObjectURL != "function") return;
		let t = URL.createObjectURL(e);
		return o(t), () => URL.revokeObjectURL(t);
	}, [e]);
	let w = k(() => {
		if (s === null) return null;
		let e = Math.max(s.w, s.h);
		if (e <= C) return {
			w: s.w,
			h: s.h
		};
		let t = C / e;
		return {
			w: Math.round(s.w * t),
			h: Math.round(s.h * t)
		};
	}, [s, C]), T = async () => {
		if (_.current !== null && w !== null) {
			m(!0), g(null);
			try {
				let t = document.createElement("canvas");
				t.width = w.w, t.height = w.h;
				let r = t.getContext("2d");
				if (r === null) throw Error("canvas-2d-unsupported");
				r.drawImage(_.current, 0, 0, w.w, w.h);
				let i = await new Promise((n) => t.toBlob(n, e.type, e.type === "image/png" ? void 0 : d));
				if (i === null) throw Error("canvas-to-blob-empty");
				n(new File([i], e.name, {
					type: e.type,
					lastModified: Date.now()
				}));
			} catch (e) {
				g(i.error(e instanceof Error ? e.message : "unknown"));
			} finally {
				m(!1);
			}
		}
	};
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("div", {
		className: "space-y-4",
		children: [
			a !== null && /* @__PURE__ */ b("div", {
				className: "flex justify-center rounded-md border border-border bg-muted/30 p-2",
				children: /* @__PURE__ */ b("img", {
					ref: _,
					src: a,
					alt: i.previewAlt,
					onLoad: (e) => c({
						w: e.currentTarget.naturalWidth,
						h: e.currentTarget.naturalHeight
					}),
					className: "max-h-64 w-auto object-contain"
				})
			}),
			s !== null && /* @__PURE__ */ x("p", {
				className: "text-xs text-muted-foreground",
				"data-testid": "image-adjust-dims",
				children: [i.currentDimensions(s.w, s.h), w !== null && /* @__PURE__ */ x(y, { children: [" → ", /* @__PURE__ */ b("span", {
					className: "font-medium text-foreground",
					children: i.targetDimensions(w.w, w.h)
				})] })]
			}),
			v ? /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ b(mr, {
					htmlFor: "image-adjust-max",
					children: i.maxDimensionLabel
				}), /* @__PURE__ */ b(fr, {
					id: "image-adjust-max",
					type: "number",
					min: Jr,
					max: t,
					step: 64,
					value: l,
					onChange: (e) => u(e.target.value),
					onBlur: () => u(String(C))
				})]
			}), e.type !== "image/png" && /* @__PURE__ */ x("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ b(mr, {
					htmlFor: "image-adjust-quality",
					children: i.qualityLabel(Math.round(d * 100))
				}), /* @__PURE__ */ b("input", {
					id: "image-adjust-quality",
					type: "range",
					min: .5,
					max: 1,
					step: .05,
					value: d,
					onChange: (e) => f(Number.parseFloat(e.target.value)),
					className: "w-full accent-primary"
				})]
			})] }) : /* @__PURE__ */ b("p", {
				className: "text-xs text-muted-foreground",
				children: i.notScalable(e.type)
			}),
			h !== null && /* @__PURE__ */ b("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: h
			})
		]
	}), /* @__PURE__ */ x(Ur, { children: [/* @__PURE__ */ b(Z, {
		type: "button",
		variant: "outline",
		onClick: r,
		children: i.cancel
	}), /* @__PURE__ */ b(Z, {
		type: "button",
		onClick: () => {
			T();
		},
		disabled: p || !v || w === null,
		tooltip: v ? void 0 : i.notScalable(e.type),
		children: i.apply
	})] })] });
}
//#endregion
//#region src/molecules/AttachmentDropzone/AttachmentDropzone.tsx
var Zr = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]);
function Qr(e) {
	return !Zr.has(e.type) || typeof URL.createObjectURL != "function" ? Promise.resolve(null) : new Promise((t) => {
		let n = URL.createObjectURL(e), r = new Image(), i = !1, a = (e) => {
			i || (i = !0, clearTimeout(o), URL.revokeObjectURL(n), t(e));
		}, o = setTimeout(() => a(null), 800);
		r.onload = () => a({
			w: r.naturalWidth,
			h: r.naturalHeight
		}), r.onerror = () => a(null), r.src = n;
	});
}
function $r(e) {
	let { labels: t, mimes: n, maxSizeMb: r, ariaLabel: i, inputId: a, ariaDescribedBy: o, required: s, disabled: c, externalError: l, imageAdjust: u } = e, d = A(null), [f, p] = j(null), [m, h] = j(null), [g, _] = j(null), [v, y] = j(null), S = (e) => {
		switch (Dt(e, {
			mimes: n,
			maxSizeMb: r
		})) {
			case "too_large": return t.errorTooLarge(e.name, r);
			case "wrong_type": return t.errorType(e.name, e.type || t.typeUnknown);
			default: return null;
		}
	}, C = async (n) => {
		if (e.onSelect) {
			_(n.name), e.onSelect(n);
			return;
		}
		if (e.onUpload) {
			h(n.name);
			try {
				await e.onUpload(n);
			} catch {
				p(t.uploadFailed(n.name));
			} finally {
				h(null);
			}
		}
	}, w = async (e) => {
		let t = S(e);
		if (t !== null) {
			p(t);
			return;
		}
		if (p(null), u) {
			let t = await Qr(e);
			if (t !== null && Math.max(t.w, t.h) > u.maxDimension) {
				y(e);
				return;
			}
		}
		await C(e);
	}, T = e.onSelect ? e.selectedFileName === void 0 ? g : e.selectedFileName : null;
	return /* @__PURE__ */ x("div", { children: [
		/* @__PURE__ */ x("label", {
			className: q("flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring", c ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"),
			onDragOver: (e) => e.preventDefault(),
			onDrop: (e) => {
				if (e.preventDefault(), c) return;
				let t = e.dataTransfer.files[0];
				t && w(t);
			},
			children: [
				/* @__PURE__ */ b("span", {
					className: "font-medium text-foreground",
					children: t.label
				}),
				/* @__PURE__ */ b("span", {
					className: "text-xs",
					children: t.hint(r, n)
				}),
				/* @__PURE__ */ b("input", {
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
		m !== null && /* @__PURE__ */ b("p", {
			className: "mt-2 text-sm text-muted-foreground",
			"data-testid": "attachment-uploading",
			children: t.uploading(m)
		}),
		T && m === null && /* @__PURE__ */ b("p", {
			className: "mt-2 text-sm text-foreground",
			"data-testid": "attachment-selected",
			children: t.selected(T)
		}),
		f !== null && /* @__PURE__ */ b("p", {
			role: "alert",
			className: "mt-2 text-sm text-destructive",
			"data-testid": "attachment-error",
			children: f
		}),
		l && f === null && /* @__PURE__ */ b("p", {
			id: o,
			role: "alert",
			className: "mt-2 text-sm text-destructive",
			"data-testid": "attachment-external-error",
			children: l
		}),
		u && /* @__PURE__ */ b(Yr, {
			file: v,
			maxDimension: u.maxDimension,
			labels: u.labels,
			onApply: (e) => {
				y(null), C(e);
			},
			onCancel: () => y(null)
		})
	] });
}
//#endregion
//#region src/molecules/AttachmentList/AttachmentList.tsx
var ei = {
	pending: "muted",
	clean: "success",
	infected: "destructive",
	error: "destructive"
};
function ti({ items: e, labels: t, onDelete: n, formatSize: r = Tt, className: i }) {
	return e.length === 0 ? /* @__PURE__ */ b("p", {
		className: q("rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground", i),
		children: t.empty
	}) : /* @__PURE__ */ b("ul", {
		className: q("divide-y divide-border rounded-md border border-border bg-card text-card-foreground", i),
		children: e.map((e) => {
			let i = e.scanStatus, a = i === void 0 || i === "clean";
			return /* @__PURE__ */ x("li", {
				className: "flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4",
				children: [/* @__PURE__ */ x("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ b("p", {
						className: "truncate text-sm font-medium text-foreground",
						children: e.name
					}), /* @__PURE__ */ x("p", {
						className: "truncate text-xs text-muted-foreground",
						children: [
							r(e.sizeBytes),
							" · ",
							e.mime
						]
					})]
				}), /* @__PURE__ */ x("div", {
					className: "flex shrink-0 flex-wrap items-center gap-2 sm:gap-3",
					children: [
						i !== void 0 && t.scan ? /* @__PURE__ */ b(Gn, {
							tone: ei[i],
							className: "shrink-0",
							"data-testid": `attachment-status-${i}`,
							children: t.scan[i]
						}) : null,
						a ? /* @__PURE__ */ b("a", {
							href: e.downloadUrl,
							"aria-label": t.download(e.name),
							className: "shrink-0 rounded-md px-2 py-1 text-sm font-medium text-foreground underline underline-offset-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
							children: t.downloadShort
						}) : null,
						e.canDelete && n ? /* @__PURE__ */ b(ar, {
							label: t.remove(e.name),
							icon: /* @__PURE__ */ b(K, {
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
function ni({ ...e }) {
	return /* @__PURE__ */ b("nav", {
		"data-slot": "breadcrumb",
		...e
	});
}
function ri({ className: e, ...t }) {
	return /* @__PURE__ */ b("ol", {
		"data-slot": "breadcrumb-list",
		className: q("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5", e),
		...t
	});
}
function ii({ className: e, ...t }) {
	return /* @__PURE__ */ b("li", {
		"data-slot": "breadcrumb-item",
		className: q("inline-flex items-center gap-1.5", e),
		...t
	});
}
function ai({ className: e, asChild: t, children: n, ...r }) {
	if (t) {
		let t = S.Children.only(n);
		return S.cloneElement(t, { className: q("rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", t.props.className, e) });
	}
	return /* @__PURE__ */ b("a", {
		"data-slot": "breadcrumb-link",
		className: q("rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", e),
		...r,
		children: n
	});
}
function oi({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "breadcrumb-page",
		"aria-current": "page",
		className: q("font-medium text-foreground", e),
		...t
	});
}
function si({ children: e, className: t, ...n }) {
	return /* @__PURE__ */ b("li", {
		"data-slot": "breadcrumb-separator",
		role: "presentation",
		"aria-hidden": "true",
		className: q("[&>svg]:size-3.5", t),
		...n,
		children: e ?? /* @__PURE__ */ b(R, { className: "rtl:-scale-x-100" })
	});
}
function ci({ className: e, srLabel: t, ...n }) {
	return /* @__PURE__ */ x("span", {
		"data-slot": "breadcrumb-ellipsis",
		role: "presentation",
		className: q("flex h-9 w-9 items-center justify-center", e),
		...n,
		children: [/* @__PURE__ */ b(Ee, {
			"aria-hidden": "true",
			className: "size-4"
		}), /* @__PURE__ */ b("span", {
			className: "sr-only",
			children: t
		})]
	});
}
//#endregion
//#region src/molecules/Card/Card.tsx
function li({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card",
		"data-size": t,
		className: q("group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", e),
		...n
	});
}
function ui({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-header",
		className: q("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3", e),
		...t
	});
}
function di({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-title",
		className: q("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", e),
		...t
	});
}
function fi({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-description",
		className: q("text-sm text-muted-foreground", e),
		...t
	});
}
function pi({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-action",
		className: q("col-start-2 row-span-2 row-start-1 self-start justify-self-end", e),
		...t
	});
}
function mi({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-content",
		className: q("px-4 group-data-[size=sm]/card:px-3", e),
		...t
	});
}
function hi({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-footer",
		className: q("flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3", e),
		...t
	});
}
//#endregion
//#region src/molecules/Collapsible/Collapsible.tsx
var gi = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.Root, {
		ref: t,
		"data-slot": "collapsible",
		...e
	});
});
gi.displayName = "Collapsible";
var _i = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.CollapsibleTrigger, {
		ref: t,
		"data-slot": "collapsible-trigger",
		...e
	});
});
_i.displayName = "CollapsibleTrigger";
var vi = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.CollapsibleContent, {
		ref: t,
		"data-slot": "collapsible-content",
		...e
	});
});
vi.displayName = "CollapsibleContent";
//#endregion
//#region src/lib/color.ts
function yi(e) {
	return e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4;
}
function bi(e) {
	return e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
}
function xi(e) {
	return Math.max(0, Math.min(1, e));
}
function Si(e) {
	let t = e.trim().match(/^#?([0-9a-f]{6})$/i);
	if (!t || !t[1]) return null;
	let n = parseInt(t[1], 16);
	return {
		r: (n >> 16 & 255) / 255,
		g: (n >> 8 & 255) / 255,
		b: (n & 255) / 255
	};
}
function Ci(e, t, n) {
	let r = (e) => Math.round(xi(e) * 255).toString(16).padStart(2, "0");
	return `#${r(e)}${r(t)}${r(n)}`;
}
function wi(e) {
	let t = e.trim().match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?)\s*(?:\/\s*[0-9.]+%?\s*)?\)$/i);
	if (!t || !t[1] || !t[2] || !t[3]) return null;
	let n = t[1], r = t[2], i = t[3], a = n.endsWith("%") ? Number(n.slice(0, -1)) / 100 : Number(n), o = r.endsWith("%") ? Number(r.slice(0, -1)) / 100 * .4 : Number(r), s = Number(i.replace(/deg$/i, ""));
	return !Number.isFinite(a) || !Number.isFinite(o) || !Number.isFinite(s) ? null : {
		L: a,
		C: o,
		H: s
	};
}
function Ti(e, t, n) {
	let r = e + .3963377774 * t + .2158037573 * n, i = e - .1055613458 * t - .0638541728 * n, a = e - .0894841775 * t - 1.291485548 * n, o = r ** 3, s = i ** 3, c = a ** 3;
	return {
		r: 4.0767416621 * o - 3.3077115913 * s + .2309699292 * c,
		g: -1.2684380046 * o + 2.6097574011 * s - .3413193965 * c,
		bl: -.0041960863 * o - .7034186147 * s + 1.707614701 * c
	};
}
function Ei(e, t, n) {
	let r = .4122214708 * e + .5363325363 * t + .0514459929 * n, i = .2119034982 * e + .6806995451 * t + .1073969566 * n, a = .0883024619 * e + .2817188376 * t + .6299787005 * n, o = Math.cbrt(r), s = Math.cbrt(i), c = Math.cbrt(a);
	return {
		L: .2104542553 * o + .793617785 * s - .0040720468 * c,
		a: 1.9779984951 * o - 2.428592205 * s + .4505937099 * c,
		b: .0259040371 * o + .7827717662 * s - .808675766 * c
	};
}
function Di(e) {
	let t = wi(e);
	if (!t) return null;
	let n = t.H * Math.PI / 180, r = t.C * Math.cos(n), i = t.C * Math.sin(n), a = Ti(t.L, r, i);
	return Ci(bi(xi(a.r)), bi(xi(a.g)), bi(xi(a.bl)));
}
function Oi(e) {
	let t = Si(e);
	if (!t) return "oklch(0 0 0)";
	let n = Ei(yi(t.r), yi(t.g), yi(t.b)), r = Math.hypot(n.a, n.b), i = Math.atan2(n.b, n.a) * 180 / Math.PI;
	i < 0 && (i += 360);
	let a = (e, t = 3) => Number(e.toFixed(t));
	return `oklch(${a(n.L)} ${a(r)} ${a(i, 2)})`;
}
//#endregion
//#region src/molecules/ColorPicker/ColorPicker.tsx
function ki({ id: e, value: t, onChange: n, swatchAriaLabel: r, ariaInvalid: i, className: a }) {
	let o = Di(t) ?? "#000000";
	return /* @__PURE__ */ x("div", {
		className: q("flex items-stretch gap-2", a),
		children: [/* @__PURE__ */ b("input", {
			type: "color",
			value: o,
			onChange: (e) => {
				n(Oi(e.target.value));
			},
			"aria-label": r,
			className: "h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		}), /* @__PURE__ */ b("input", {
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
function Ai({ items: e, onItemClick: t, labels: n, className: r }) {
	let i = D(), a = e.filter((e) => e.done).length, o = e.every((e) => e.done || e.optional);
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": i,
		className: q("flex flex-col gap-2", r),
		children: [
			/* @__PURE__ */ b("h2", {
				id: i,
				className: "text-xs font-medium text-muted-foreground",
				children: n.heading
			}),
			/* @__PURE__ */ x("div", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ x("span", {
					className: "text-2xl font-semibold tabular-nums",
					children: [
						a,
						" / ",
						e.length
					]
				}), /* @__PURE__ */ b("span", {
					className: "text-xs text-muted-foreground",
					children: o ? n.complete : n.incomplete
				})]
			}),
			/* @__PURE__ */ b("div", {
				role: "progressbar",
				"aria-labelledby": i,
				"aria-valuemin": 0,
				"aria-valuemax": e.length,
				"aria-valuenow": a,
				className: "h-1.5 overflow-hidden rounded-full bg-muted",
				children: /* @__PURE__ */ b("div", {
					className: "h-full rounded-full bg-success transition-[width] duration-300 motion-reduce:transition-none",
					style: { width: `${e.length ? a / e.length * 100 : 0}%` }
				})
			}),
			/* @__PURE__ */ b("ul", {
				className: "mt-1 flex flex-col gap-0.5 text-sm",
				children: e.map((e) => {
					let r = /* @__PURE__ */ x(y, { children: [
						e.done ? /* @__PURE__ */ b(I, {
							className: "size-4 shrink-0 text-success",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ b(B, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ b("span", {
							className: q("truncate", !e.done && "text-muted-foreground"),
							children: e.label
						}),
						/* @__PURE__ */ b("span", {
							className: "sr-only",
							children: e.done ? n.done : n.missing
						}),
						e.optional && /* @__PURE__ */ b("span", {
							className: "ms-auto text-xs text-muted-foreground",
							children: n.optional
						})
					] });
					return /* @__PURE__ */ b("li", { children: t ? /* @__PURE__ */ b("button", {
						type: "button",
						onClick: () => t(e.id),
						className: "flex w-full items-center gap-2 rounded-md px-1 py-1 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
						children: r
					}) : /* @__PURE__ */ b("div", {
						className: "flex items-center gap-2 px-1 py-1",
						children: r
					}) }, e.id);
				})
			})
		]
	});
}
//#endregion
//#region src/lib/itemFocus.ts
var ji = {
	real: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
	cmdk: "data-[selected=true]:ring-2 data-[selected=true]:ring-ring data-[selected=true]:ring-inset",
	headless: "data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-inset"
};
//#endregion
//#region src/molecules/Combobox/Combobox.tsx
function Mi({ id: e, value: t, options: n, onChange: r, placeholder: i, searchPlaceholder: a, emptyLabel: o, ariaInvalid: s, ariaDescribedby: c }) {
	let [l, u] = j(""), d = k(() => {
		let e = l.trim().toLowerCase();
		return e === "" ? n : n.filter((t) => t.toLowerCase().includes(e));
	}, [l, n]);
	return /* @__PURE__ */ b(We, {
		value: t,
		onChange: (e) => {
			e !== null && r(e);
		},
		immediate: !0,
		children: /* @__PURE__ */ x("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ b(Ke, {
					id: e,
					"aria-invalid": s ? !0 : void 0,
					"aria-describedby": c,
					displayValue: (e) => e,
					onChange: (e) => u(e.target.value),
					placeholder: i ?? a,
					className: q("block w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none", "aria-[invalid=true]:border-destructive")
				}),
				/* @__PURE__ */ b(Ge, {
					className: "absolute inset-y-0 end-0 flex items-center px-2 text-muted-foreground focus:outline-none focus-visible:text-foreground",
					"aria-label": a ?? i ?? o,
					children: /* @__PURE__ */ b(z, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ b(Je, {
					className: "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-sm shadow-md focus:outline-none",
					transition: !0,
					children: d.length === 0 ? /* @__PURE__ */ b("div", {
						className: "px-3 py-2 text-muted-foreground",
						children: o
					}) : d.map((e) => /* @__PURE__ */ x(qe, {
						value: e,
						className: q("group flex cursor-pointer items-center gap-2 px-3 py-2 text-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground", ji.headless),
						children: [/* @__PURE__ */ b(I, {
							className: "h-4 w-4 opacity-0 group-data-[selected]:opacity-100",
							"aria-hidden": "true"
						}), /* @__PURE__ */ b("span", { children: e })]
					}, e))
				})
			]
		})
	});
}
//#endregion
//#region src/molecules/Command/Command.tsx
function Ni({ className: e, ...t }) {
	return /* @__PURE__ */ b(Ye, {
		"data-slot": "command",
		className: q("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", e),
		...t
	});
}
function Pi({ title: e, description: t, closeLabel: n, children: r, className: i, shouldFilter: a, ...o }) {
	return /* @__PURE__ */ b(Lr, {
		...o,
		children: /* @__PURE__ */ x(Vr, {
			closeLabel: n,
			className: q("overflow-hidden p-0", i),
			children: [/* @__PURE__ */ x(Hr, {
				className: "sr-only",
				children: [/* @__PURE__ */ b(Wr, { children: e }), /* @__PURE__ */ b(Gr, { children: t })]
			}), /* @__PURE__ */ b(Ni, {
				shouldFilter: a,
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children: r
			})]
		})
	});
}
function Fi({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "command-input-wrapper",
		className: "flex items-center gap-2 border-b border-border px-3",
		children: [/* @__PURE__ */ b(Ie, {
			className: "size-4 shrink-0 opacity-50",
			"aria-hidden": "true"
		}), /* @__PURE__ */ b(Ye.Input, {
			"data-slot": "command-input",
			className: q("flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", e),
			...t
		})]
	});
}
function Ii({ className: e, ...t }) {
	return /* @__PURE__ */ b(Ye.List, {
		"data-slot": "command-list",
		className: q("max-h-[300px] overflow-x-hidden overflow-y-auto", e),
		...t
	});
}
function Li({ ...e }) {
	return /* @__PURE__ */ b(Ye.Empty, {
		"data-slot": "command-empty",
		className: "py-6 text-center text-sm",
		...e
	});
}
function Ri({ className: e, ...t }) {
	return /* @__PURE__ */ b(Ye.Group, {
		"data-slot": "command-group",
		className: q("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", e),
		...t
	});
}
function zi({ className: e, ...t }) {
	return /* @__PURE__ */ b(Ye.Separator, {
		"data-slot": "command-separator",
		className: q("-mx-1 h-px bg-border", e),
		...t
	});
}
function Bi({ className: e, ...t }) {
	return /* @__PURE__ */ b(Ye.Item, {
		"data-slot": "command-item",
		className: q("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", ji.cmdk, e),
		...t
	});
}
//#endregion
//#region src/molecules/ComposerAttachments/ComposerAttachments.tsx
function Vi({ files: e, onChange: t, labels: n, error: r, disabled: i, mimes: a = St, maxSizeMb: o = 25, maxFiles: s = 5, formatSize: c = Tt, className: l }) {
	let u = D(), d = e.length >= s;
	return /* @__PURE__ */ x("div", {
		className: q("space-y-2", l),
		children: [d ? /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("p", {
			className: "text-xs text-muted-foreground",
			children: n.maxReached(s)
		}), r ? /* @__PURE__ */ b("p", {
			role: "alert",
			className: "text-sm text-destructive",
			children: r
		}) : null] }) : /* @__PURE__ */ b($r, {
			inputId: u,
			labels: n.dropzone,
			mimes: a,
			maxSizeMb: o,
			ariaLabel: n.add,
			disabled: i,
			externalError: r ?? null,
			onSelect: (n) => t([...e, n])
		}), e.length > 0 && /* @__PURE__ */ b("ul", {
			"aria-label": n.stagedHeading,
			className: "space-y-1",
			children: e.map((r, a) => /* @__PURE__ */ x("li", {
				className: "flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm",
				children: [/* @__PURE__ */ x("span", {
					className: "min-w-0 truncate text-foreground",
					children: [
						r.name,
						" ",
						/* @__PURE__ */ x("span", {
							className: "text-muted-foreground",
							children: [
								"(",
								c(r.size),
								")"
							]
						})
					]
				}), /* @__PURE__ */ b(Z, {
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
function Hi({ open: e, onOpenChange: t, title: n, description: r, confirmLabel: i, cancelLabel: a, onConfirm: o, variant: s = "destructive", children: c, closeOnConfirm: l = !0 }) {
	return /* @__PURE__ */ b(Er, {
		open: e,
		onOpenChange: t,
		children: /* @__PURE__ */ x(Ar, { children: [
			/* @__PURE__ */ x(jr, { children: [/* @__PURE__ */ b(Nr, { children: n }), /* @__PURE__ */ b(Pr, { children: r })] }),
			c,
			/* @__PURE__ */ x(Mr, { children: [/* @__PURE__ */ b(Ir, { children: a }), /* @__PURE__ */ b(Fr, {
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
function Ui({ ...e }) {
	return /* @__PURE__ */ b(o.Root, {
		"data-slot": "context-menu",
		...e
	});
}
var Wi = S.forwardRef(function(e, t) {
	return /* @__PURE__ */ b(o.Trigger, {
		ref: t,
		"data-slot": "context-menu-trigger",
		...e
	});
});
Wi.displayName = "ContextMenuTrigger";
var Gi = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Portal, { children: /* @__PURE__ */ b(o.Content, {
		ref: n,
		"data-slot": "context-menu-content",
		className: q("z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
Gi.displayName = "ContextMenuContent";
var Ki = S.forwardRef(function({ className: e, tone: t = "default", ...n }, r) {
	return /* @__PURE__ */ b(o.Item, {
		ref: r,
		"data-slot": "context-menu-item",
		"data-tone": t,
		className: q("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground", "data-[highlighted]:bg-muted", ji.real, "data-[tone=destructive]:data-[highlighted]:bg-destructive data-[tone=destructive]:data-[highlighted]:text-destructive-foreground data-[tone=destructive]:data-[highlighted]:[&_svg]:text-destructive-foreground", "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50", e),
		...n
	});
});
Ki.displayName = "ContextMenuItem";
var qi = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Separator, {
		ref: n,
		"data-slot": "context-menu-separator",
		className: q("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
qi.displayName = "ContextMenuSeparator";
var Ji = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Label, {
		ref: n,
		"data-slot": "context-menu-label",
		className: q("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
Ji.displayName = "ContextMenuLabel";
function Yi({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "context-menu-shortcut",
		"aria-hidden": "true",
		className: q("ms-auto ps-4 text-xs text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/molecules/DropdownMenu/DropdownMenu.tsx
function Xi({ ...e }) {
	return /* @__PURE__ */ b(l.Root, {
		"data-slot": "dropdown-menu",
		...e
	});
}
var Zi = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(l.Trigger, {
		ref: t,
		"data-slot": "dropdown-menu-trigger",
		...e
	});
});
Zi.displayName = "DropdownMenuTrigger";
function Qi({ ...e }) {
	return /* @__PURE__ */ b(l.Portal, {
		"data-slot": "dropdown-menu-portal",
		...e
	});
}
var $i = S.forwardRef(function({ className: e, sideOffset: t = 6, container: n, ...r }, i) {
	return /* @__PURE__ */ b(Qi, {
		container: n,
		children: /* @__PURE__ */ b(l.Content, {
			ref: i,
			"data-slot": "dropdown-menu-content",
			sideOffset: t,
			className: q("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
			...r
		})
	});
});
$i.displayName = "DropdownMenuContent";
var Q = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Item, {
		ref: n,
		"data-slot": "dropdown-menu-item",
		className: q("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", ji.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...t
	});
});
Q.displayName = "DropdownMenuItem";
var ea = S.forwardRef(function({ className: e, children: t, checked: n, ...r }, i) {
	return /* @__PURE__ */ x(l.CheckboxItem, {
		ref: i,
		"data-slot": "dropdown-menu-checkbox-item",
		checked: n,
		className: q("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", ji.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...r,
		children: [/* @__PURE__ */ b("span", {
			className: "absolute start-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ b(l.ItemIndicator, { children: /* @__PURE__ */ b(I, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), t]
	});
});
ea.displayName = "DropdownMenuCheckboxItem";
function ta({ ...e }) {
	return /* @__PURE__ */ b(l.RadioGroup, {
		"data-slot": "dropdown-menu-radio-group",
		...e
	});
}
var na = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(l.RadioItem, {
		ref: r,
		"data-slot": "dropdown-menu-radio-item",
		className: q("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", ji.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...n,
		children: [/* @__PURE__ */ b("span", {
			className: "absolute start-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ b(l.ItemIndicator, { children: /* @__PURE__ */ b(le, {
				className: "size-2 fill-current",
				"aria-hidden": "true"
			}) })
		}), t]
	});
});
na.displayName = "DropdownMenuRadioItem";
function ra({ ...e }) {
	return /* @__PURE__ */ b(l.Sub, {
		"data-slot": "dropdown-menu-sub",
		...e
	});
}
var ia = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(l.SubTrigger, {
		ref: r,
		"data-slot": "dropdown-menu-sub-trigger",
		className: q("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none", "focus:bg-muted data-[highlighted]:bg-muted data-[state=open]:bg-muted", ji.real, e),
		...n,
		children: [t, /* @__PURE__ */ b(R, {
			className: "ms-auto size-4 text-muted-foreground rtl:-scale-x-100",
			"aria-hidden": "true"
		})]
	});
});
ia.displayName = "DropdownMenuSubTrigger";
var aa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(Qi, { children: /* @__PURE__ */ b(l.SubContent, {
		ref: n,
		"data-slot": "dropdown-menu-sub-content",
		className: q("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
aa.displayName = "DropdownMenuSubContent";
function oa({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "dropdown-menu-shortcut",
		"aria-hidden": "true",
		className: q("ms-auto ps-4 text-xs text-muted-foreground", e),
		...t
	});
}
var sa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Label, {
		ref: n,
		"data-slot": "dropdown-menu-label",
		className: q("px-2 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase", e),
		...t
	});
});
sa.displayName = "DropdownMenuLabel";
var $ = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Separator, {
		ref: n,
		"data-slot": "dropdown-menu-separator",
		className: q("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
$.displayName = "DropdownMenuSeparator";
//#endregion
//#region src/molecules/EmptyState/EmptyState.tsx
function ca({ icon: e, title: t, description: n, action: r, className: i }) {
	return /* @__PURE__ */ x("div", {
		className: q("flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center text-card-foreground", i),
		children: [
			/* @__PURE__ */ b("span", {
				"aria-hidden": "true",
				className: "mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground",
				children: /* @__PURE__ */ b(e, { className: "size-6" })
			}),
			/* @__PURE__ */ b("p", {
				className: "text-base font-medium text-foreground",
				children: t
			}),
			n && /* @__PURE__ */ b("p", {
				className: "mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground",
				children: n
			}),
			r && /* @__PURE__ */ b("div", {
				className: "mt-4",
				children: r
			})
		]
	});
}
//#endregion
//#region src/molecules/Popover/Popover.tsx
function la({ ...e }) {
	return /* @__PURE__ */ b(d.Root, {
		"data-slot": "popover",
		...e
	});
}
var ua = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(d.Trigger, {
		ref: t,
		"data-slot": "popover-trigger",
		...e
	});
});
ua.displayName = "PopoverTrigger";
var da = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(d.Anchor, {
		ref: t,
		"data-slot": "popover-anchor",
		...e
	});
});
da.displayName = "PopoverAnchor";
var fa = S.forwardRef(function({ className: e, align: t = "center", sideOffset: n = 4, ...r }, i) {
	return /* @__PURE__ */ b(d.Portal, { children: /* @__PURE__ */ b(d.Content, {
		ref: i,
		"data-slot": "popover-content",
		align: t,
		sideOffset: n,
		className: q("z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in", e),
		...r
	}) });
});
fa.displayName = "PopoverContent";
//#endregion
//#region src/molecules/EntitySearchPicker/EntitySearchPicker.tsx
var pa = 250;
function ma({ onSearch: e, onSelect: t, getKey: n, renderRow: r, triggerLabel: i, placeholder: a, labels: o, disabled: s = !1, id: c, triggerClassName: l, debounceMs: u = pa }) {
	let [d, f] = S.useState(!1), [p, m] = S.useState(""), [h, g] = S.useState([]), [_, v] = S.useState(!1), [C, w] = S.useState(!1), T = S.useRef(e);
	S.useEffect(() => {
		T.current = e;
	}), S.useEffect(() => {
		if (!d) return;
		let e = new AbortController(), t = window.setTimeout(() => {
			w(!0), T.current(p, e.signal).then((t) => {
				if (e.signal.aborted) return;
				let n = Array.isArray(t) ? {
					items: t,
					hasMore: !1
				} : t;
				g(n.items), v(n.hasMore ?? !1);
			}).catch(() => {
				e.signal.aborted || (g([]), v(!1));
			}).finally(() => {
				e.signal.aborted || w(!1);
			});
		}, u);
		return () => {
			e.abort(), window.clearTimeout(t);
		};
	}, [
		d,
		p,
		u
	]);
	let ee = (e) => {
		t(e), f(!1), m("");
	};
	return /* @__PURE__ */ x(la, {
		open: d,
		onOpenChange: (e) => {
			f(e), e || m("");
		},
		children: [/* @__PURE__ */ b(ua, {
			asChild: !0,
			children: /* @__PURE__ */ x(Z, {
				id: c,
				type: "button",
				variant: "outline",
				disabled: s,
				"aria-expanded": d,
				"aria-haspopup": "listbox",
				className: l,
				children: [i, /* @__PURE__ */ b(z, {
					className: "size-4 opacity-50",
					"aria-hidden": "true"
				})]
			})
		}), /* @__PURE__ */ b(fa, {
			className: "w-80 p-0",
			align: "start",
			children: /* @__PURE__ */ x(Ni, {
				shouldFilter: !1,
				label: a,
				children: [/* @__PURE__ */ b(Fi, {
					value: p,
					onValueChange: m,
					placeholder: a,
					"aria-label": a
				}), /* @__PURE__ */ b(Ii, { children: C ? /* @__PURE__ */ x("div", {
					role: "status",
					className: "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ b(Se, {
						className: "size-4 animate-spin",
						"aria-hidden": "true"
					}), o.searching]
				}) : h.length === 0 ? /* @__PURE__ */ b("div", {
					role: "status",
					className: "py-6 text-center text-sm text-muted-foreground",
					children: o.empty
				}) : /* @__PURE__ */ x(y, { children: [h.map((e) => /* @__PURE__ */ b(Bi, {
					value: String(n(e)),
					onSelect: () => ee(e),
					className: "flex flex-col items-start gap-0.5",
					children: r(e)
				}, n(e))), _ ? /* @__PURE__ */ b("p", {
					role: "status",
					className: "px-3 py-2 text-xs text-muted-foreground",
					children: o.refine
				}) : null] }) })]
			})
		})]
	});
}
//#endregion
//#region src/molecules/GridFilterChips/GridFilterChips.tsx
var ha = (e) => e, ga = (e) => String(e);
function _a(e, t, n, r, i) {
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
function va({ filters: e, columns: t, onRemove: n, onClearAll: r, onEdit: i, labels: a, formatDate: o = ha, formatNumber: s = ga }) {
	let c = e.flatMap((e) => {
		let n = _a(e, t.find((t) => t.id === e.id), a, o, s);
		return n === null ? [] : [{
			id: e.id,
			text: n
		}];
	});
	return c.length === 0 ? null : /* @__PURE__ */ x("div", {
		role: "region",
		"aria-label": a.region,
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ b("ul", {
			className: "flex flex-wrap items-center gap-2",
			children: c.map((e) => /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x(Gn, {
				variant: "outline",
				className: "h-7 gap-1 ps-2.5 pe-1 text-sm font-normal",
				children: [i ? /* @__PURE__ */ b("button", {
					type: "button",
					onClick: () => i(e.id),
					className: "rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
					children: e.text
				}) : /* @__PURE__ */ b("span", { children: e.text }), /* @__PURE__ */ b(Z, {
					type: "button",
					variant: "ghost",
					size: "icon-xs",
					className: "text-muted-foreground",
					"aria-label": a.remove(e.text),
					onClick: () => n(e.id),
					children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
				})]
			}) }, e.id))
		}), c.length > 1 && /* @__PURE__ */ b(Z, {
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
var ya = "block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30";
function ba({ ...e }) {
	return /* @__PURE__ */ b(p.Root, {
		"data-slot": "select",
		...e
	});
}
var xa = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(p.Group, {
		ref: t,
		"data-slot": "select-group",
		...e
	});
});
xa.displayName = "SelectGroup";
var Sa = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(p.Value, {
		ref: t,
		"data-slot": "select-value",
		...e
	});
});
Sa.displayName = "SelectValue";
var Ca = S.forwardRef(function({ className: e, children: t, size: n = "default", ...r }, i) {
	return /* @__PURE__ */ x(p.Trigger, {
		ref: i,
		"data-slot": "select-trigger",
		"data-size": n,
		className: q("flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1", e),
		...r,
		children: [t, /* @__PURE__ */ b(p.Icon, {
			asChild: !0,
			children: /* @__PURE__ */ b(L, {
				className: "size-4 opacity-50",
				"aria-hidden": "true"
			})
		})]
	});
});
Ca.displayName = "SelectTrigger";
var wa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.ScrollUpButton, {
		ref: n,
		"data-slot": "select-scroll-up-button",
		className: q("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(ce, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
wa.displayName = "SelectScrollUpButton";
var Ta = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.ScrollDownButton, {
		ref: n,
		"data-slot": "select-scroll-down-button",
		className: q("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(L, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
Ta.displayName = "SelectScrollDownButton";
var Ea = S.forwardRef(function({ className: e, children: t, position: n = "popper", ...r }, i) {
	return /* @__PURE__ */ b(p.Portal, { children: /* @__PURE__ */ x(p.Content, {
		ref: i,
		"data-slot": "select-content",
		position: n,
		className: q("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1", e),
		...r,
		children: [
			/* @__PURE__ */ b(wa, {}),
			/* @__PURE__ */ b(p.Viewport, {
				className: q("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
				children: t
			}),
			/* @__PURE__ */ b(Ta, {})
		]
	}) });
});
Ea.displayName = "SelectContent";
var Da = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.Label, {
		ref: n,
		"data-slot": "select-label",
		className: q("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
Da.displayName = "SelectLabel";
var Oa = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(p.Item, {
		ref: r,
		"data-slot": "select-item",
		className: q("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", ji.real, e),
		...n,
		children: [/* @__PURE__ */ b("span", {
			className: "absolute end-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ b(p.ItemIndicator, { children: /* @__PURE__ */ b(I, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), /* @__PURE__ */ b(p.ItemText, { children: t })]
	});
});
Oa.displayName = "SelectItem";
var ka = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.Separator, {
		ref: n,
		"data-slot": "select-separator",
		className: q("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
ka.displayName = "SelectSeparator";
//#endregion
//#region src/molecules/GridFilterEditor/GridFilterEditor.tsx
function Aa(e) {
	return (t) => {
		t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), e());
	};
}
function ja(e) {
	if (e.trim() === "") return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
function Ma({ labels: e, onApply: t, onClear: n, invalid: r }) {
	return /* @__PURE__ */ x("div", {
		className: "flex justify-end gap-2",
		children: [/* @__PURE__ */ b(Z, {
			type: "button",
			variant: "ghost",
			size: "sm",
			onClick: n,
			children: e.clear
		}), /* @__PURE__ */ b(Z, {
			type: "button",
			size: "sm",
			onClick: t,
			disabled: r,
			tooltip: r ? e.invalidRange : void 0,
			children: e.apply
		})]
	});
}
function Na({ columnId: e, labels: t, onApply: n, value: r }) {
	let i = D(), [a, o] = j(r?.op ?? "contains"), [s, c] = j(r?.value ?? ""), l = () => {
		let t = s.trim();
		n(t === "" ? null : {
			id: e,
			type: "text",
			op: a,
			value: t
		});
	};
	return /* @__PURE__ */ x(y, { children: [
		/* @__PURE__ */ x("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ b(mr, {
				htmlFor: `${i}-op`,
				children: t.operator
			}), /* @__PURE__ */ x(ba, {
				value: a,
				onValueChange: (e) => o(e),
				children: [/* @__PURE__ */ b(Ca, {
					id: `${i}-op`,
					children: /* @__PURE__ */ b(Sa, {})
				}), /* @__PURE__ */ x(Ea, { children: [
					/* @__PURE__ */ b(Oa, {
						value: "contains",
						children: t.contains
					}),
					/* @__PURE__ */ b(Oa, {
						value: "equals",
						children: t.equals
					}),
					/* @__PURE__ */ b(Oa, {
						value: "startsWith",
						children: t.startsWith
					})
				] })]
			})]
		}),
		/* @__PURE__ */ x("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ b(mr, {
				htmlFor: `${i}-value`,
				children: t.value
			}), /* @__PURE__ */ b(fr, {
				id: `${i}-value`,
				type: "text",
				value: s,
				onChange: (e) => c(e.target.value),
				onKeyDown: Aa(l)
			})]
		}),
		/* @__PURE__ */ b(Ma, {
			labels: t,
			onApply: l,
			onClear: () => {
				o("contains"), c(""), n(null);
			},
			invalid: !1
		})
	] });
}
function Pa({ columnId: e, labels: t, onApply: n, options: r, value: i }) {
	let a = D(), [o, s] = j(() => new Set(i?.values ?? [])), c = (e, t) => s((n) => {
		let r = new Set(n);
		return t ? r.add(e) : r.delete(e), r;
	});
	return /* @__PURE__ */ x(y, { children: [
		/* @__PURE__ */ x("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ b(Z, {
				type: "button",
				variant: "ghost",
				size: "xs",
				onClick: () => s(new Set(r.map((e) => e.value))),
				children: t.selectAll
			}), /* @__PURE__ */ b(Z, {
				type: "button",
				variant: "ghost",
				size: "xs",
				onClick: () => s(/* @__PURE__ */ new Set()),
				children: t.selectNone
			})]
		}),
		/* @__PURE__ */ b("ul", {
			className: "flex max-h-60 flex-col gap-2 overflow-y-auto",
			children: r.map((e, t) => /* @__PURE__ */ x("li", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ b(er, {
					id: `${a}-${t}`,
					checked: o.has(e.value),
					onCheckedChange: (t) => c(e.value, t === !0)
				}), /* @__PURE__ */ b(mr, {
					htmlFor: `${a}-${t}`,
					className: "font-normal",
					children: e.label
				})]
			}, e.value))
		}),
		/* @__PURE__ */ b(Ma, {
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
function Fa({ columnId: e, labels: t, onApply: n, kind: r, initial: i }) {
	let a = D(), [o, s] = j(i.low ?? ""), [c, l] = j(i.high ?? ""), u = r === "number" ? ja(o) : o === "" ? void 0 : o, d = r === "number" ? ja(c) : c === "" ? void 0 : c, f = u !== void 0 && d !== void 0 && u > d, p = `${a}-error`, m = () => {
		f || n(u === void 0 && d === void 0 ? null : r === "number" ? {
			id: e,
			type: "number",
			...u !== void 0 && { min: u },
			...d !== void 0 && { max: d }
		} : {
			id: e,
			type: "date",
			...u !== void 0 && { from: u },
			...d !== void 0 && { to: d }
		});
	}, h = () => {
		s(""), l(""), n(null);
	}, g = r === "number" ? t.min : t.from, _ = r === "number" ? t.max : t.to, v = {
		type: r,
		"aria-invalid": f || void 0,
		"aria-describedby": f ? p : void 0,
		onKeyDown: Aa(m)
	};
	return /* @__PURE__ */ x(y, { children: [
		/* @__PURE__ */ x("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ x("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ b(mr, {
					htmlFor: `${a}-low`,
					children: g
				}), /* @__PURE__ */ b(fr, {
					...v,
					id: `${a}-low`,
					value: o,
					onChange: (e) => s(e.target.value)
				})]
			}), /* @__PURE__ */ x("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ b(mr, {
					htmlFor: `${a}-high`,
					children: _
				}), /* @__PURE__ */ b(fr, {
					...v,
					id: `${a}-high`,
					value: c,
					onChange: (e) => l(e.target.value)
				})]
			})]
		}),
		f && /* @__PURE__ */ b("p", {
			id: p,
			role: "alert",
			className: "text-sm text-destructive",
			children: t.invalidRange
		}),
		/* @__PURE__ */ b(Ma, {
			labels: t,
			onApply: m,
			onClear: h,
			invalid: f
		})
	] });
}
function Ia({ columnId: e, header: t, def: n, value: r, onApply: i, labels: a }) {
	let o = {
		columnId: e,
		labels: a,
		onApply: i
	};
	return /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": t,
		className: "flex w-64 flex-col gap-3",
		children: [
			n.type === "text" && /* @__PURE__ */ b(Na, {
				...o,
				value: r?.type === "text" ? r : void 0
			}),
			n.type === "choice" && /* @__PURE__ */ b(Pa, {
				...o,
				options: n.options,
				value: r?.type === "choice" ? r : void 0
			}),
			n.type === "number" && /* @__PURE__ */ b(Fa, {
				...o,
				kind: "number",
				initial: r?.type === "number" ? {
					low: La(r.min),
					high: La(r.max)
				} : {}
			}),
			n.type === "date" && /* @__PURE__ */ b(Fa, {
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
function La(e) {
	return e === void 0 ? void 0 : String(e);
}
//#endregion
//#region src/molecules/GridFooter/GridFooter.tsx
function Ra({ summary: e, onPrev: t, onNext: n, labels: r }) {
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("p", {
		className: "text-sm text-muted-foreground tabular-nums",
		children: e
	}), /* @__PURE__ */ x("nav", {
		"aria-label": r.pager,
		className: "ms-auto flex items-center gap-1",
		children: [/* @__PURE__ */ b(ar, {
			label: r.previous,
			disabled: !t,
			onClick: t ?? void 0,
			icon: /* @__PURE__ */ b(se, {
				className: "size-4 rtl:-scale-x-100",
				"aria-hidden": "true"
			})
		}), /* @__PURE__ */ b(ar, {
			label: r.next,
			disabled: !n,
			onClick: n ?? void 0,
			icon: /* @__PURE__ */ b(R, {
				className: "size-4 rtl:-scale-x-100",
				"aria-hidden": "true"
			})
		})]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridViews.tsx
function za({ title: e, initial: t, labels: n, onSubmit: r, onClose: i, onCloseAutoFocus: a }) {
	let [o, s] = j(t), [c, l] = j(!1), u = A(null), d = D(), f = () => {
		let e = o.trim();
		if (e === "") {
			l(!0), u.current?.focus();
			return;
		}
		r(e), i();
	};
	return /* @__PURE__ */ b(Lr, {
		open: !0,
		onOpenChange: (e) => !e && i(),
		children: /* @__PURE__ */ x(Vr, {
			closeLabel: n.closeLabel,
			"aria-describedby": void 0,
			className: "max-w-sm",
			onCloseAutoFocus: a,
			children: [
				/* @__PURE__ */ b(Hr, { children: /* @__PURE__ */ b(Wr, { children: e }) }),
				/* @__PURE__ */ x("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ b(mr, {
							htmlFor: d,
							children: n.name
						}),
						/* @__PURE__ */ b(fr, {
							id: d,
							ref: u,
							value: o,
							onChange: (e) => {
								s(e.target.value), l(!1);
							},
							onKeyDown: (e) => {
								e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), f());
							},
							"aria-invalid": c || void 0,
							"aria-describedby": c ? `${d}-error` : void 0
						}),
						c && /* @__PURE__ */ b("p", {
							id: `${d}-error`,
							role: "alert",
							className: "text-sm text-destructive",
							children: n.nameRequired
						})
					]
				}),
				/* @__PURE__ */ x(Ur, { children: [/* @__PURE__ */ b(Z, {
					type: "button",
					variant: "outline",
					onClick: i,
					children: n.cancel
				}), /* @__PURE__ */ b(Z, {
					type: "button",
					onClick: f,
					children: n.confirm
				})] })
			]
		})
	});
}
function Ba(e, t) {
	let [n, r] = j(null), i = A(null), a = (e) => {
		e.preventDefault(), t.current?.focus();
	};
	return {
		request: (e) => {
			i.current = e;
		},
		onCloseAutoFocus: (e) => {
			a(e), i.current &&= (r(i.current), null);
		},
		dialogs: e && /* @__PURE__ */ x(y, { children: [
			n?.kind === "save" && /* @__PURE__ */ b(za, {
				title: e.labels.saveTitle,
				initial: "",
				labels: e.labels,
				onSubmit: e.onSave,
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "rename" && /* @__PURE__ */ b(za, {
				title: e.labels.renameTitle,
				initial: n.name,
				labels: e.labels,
				onSubmit: (t) => {
					t !== n.name && e.onRename(n.id, t);
				},
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "delete" && /* @__PURE__ */ b(Er, {
				open: !0,
				onOpenChange: (e) => !e && r(null),
				children: /* @__PURE__ */ x(Ar, {
					onCloseAutoFocus: a,
					children: [/* @__PURE__ */ x(jr, { children: [/* @__PURE__ */ b(Nr, { children: e.labels.delete }), /* @__PURE__ */ b(Pr, { children: e.labels.confirmDelete(n.name) })] }), /* @__PURE__ */ x(Mr, { children: [/* @__PURE__ */ b(Ir, { children: e.labels.cancel }), /* @__PURE__ */ b(Fr, {
						onClick: () => e.onDelete(n.id),
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						children: e.labels.deleteConfirm
					})] })]
				})
			})
		] })
	};
}
function Va({ views: { views: e, activeViewId: t, isModified: n, onApply: r, onUpdate: i, labels: a }, request: o }) {
	let s = e.find((e) => e.id === t);
	return /* @__PURE__ */ x(ra, { children: [/* @__PURE__ */ x(ia, { children: [
		/* @__PURE__ */ b(P, {
			className: "size-4 text-muted-foreground",
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ b("span", {
			className: "min-w-0 flex-1 truncate",
			children: a.trigger
		}),
		" ",
		s && /* @__PURE__ */ b("span", {
			className: "max-w-28 truncate text-xs text-muted-foreground",
			children: s.name
		}),
		" ",
		n && /* @__PURE__ */ x(y, { children: [
			/* @__PURE__ */ b("span", {
				"data-modified-dot": "",
				"aria-hidden": "true",
				className: "size-2 shrink-0 rounded-full bg-primary"
			}),
			" ",
			/* @__PURE__ */ b("span", {
				className: "sr-only",
				children: a.modified
			})
		] })
	] }), /* @__PURE__ */ x(aa, {
		className: "w-64",
		children: [
			e.length === 0 ? /* @__PURE__ */ b(sa, {
				className: "font-normal text-muted-foreground",
				children: a.empty
			}) : /* @__PURE__ */ b(ta, {
				value: s?.id ?? "",
				onValueChange: r,
				children: e.map((e) => /* @__PURE__ */ b(na, {
					value: e.id,
					children: e.name
				}, e.id))
			}),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ x(Q, {
				onSelect: () => o({ kind: "save" }),
				children: [/* @__PURE__ */ b(F, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.save]
			}),
			s && n && i && /* @__PURE__ */ x(Q, {
				onSelect: () => i(s.id),
				children: [/* @__PURE__ */ b(Ne, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.update]
			}),
			s && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(Q, {
				onSelect: () => o({
					kind: "rename",
					id: s.id,
					name: s.name
				}),
				children: [/* @__PURE__ */ b(ke, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.rename]
			}), /* @__PURE__ */ x(Q, {
				onSelect: () => o({
					kind: "delete",
					id: s.id,
					name: s.name
				}),
				children: [/* @__PURE__ */ b(Be, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.delete]
			})] })
		]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridOptions.tsx
function Ha({ preferences: e, columns: t, canSelect: n = !1, views: r, labels: i }) {
	let a = A(null), { request: o, onCloseAutoFocus: s, dialogs: c } = Ba(r, a);
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(Xi, { children: [/* @__PURE__ */ b(Zi, {
		asChild: !0,
		children: /* @__PURE__ */ x(Z, {
			ref: a,
			variant: "ghost",
			size: "icon",
			"aria-label": i.trigger,
			className: "relative text-muted-foreground",
			children: [/* @__PURE__ */ b(fe, { "aria-hidden": "true" }), r?.isModified && /* @__PURE__ */ b("span", {
				"data-modified-dot": "",
				"aria-hidden": "true",
				className: "absolute end-1 top-1 size-2 rounded-full bg-primary"
			})]
		})
	}), /* @__PURE__ */ x($i, {
		align: "end",
		className: "w-56",
		onCloseAutoFocus: s,
		children: [
			r && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(Va, {
				views: r,
				request: o
			}), /* @__PURE__ */ b($, {})] }),
			/* @__PURE__ */ x(ra, { children: [/* @__PURE__ */ x(ia, { children: [/* @__PURE__ */ b(V, {
				className: "size-4 text-muted-foreground",
				"aria-hidden": "true"
			}), i.columns] }), /* @__PURE__ */ b(aa, {
				className: "w-52",
				children: t.map((t) => /* @__PURE__ */ b(ea, {
					checked: e.isColumnVisible(t.id),
					disabled: t.hideable === !1,
					onCheckedChange: (n) => e.setColumnVisible(t.id, n === !0),
					onSelect: (e) => e.preventDefault(),
					children: t.label
				}, t.id))
			})] }),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ b(sa, { children: i.density }),
			/* @__PURE__ */ x(ta, {
				value: e.values.density,
				onValueChange: (t) => e.setDensity(t),
				children: [/* @__PURE__ */ b(na, {
					value: "comfortable",
					children: i.comfortable
				}), /* @__PURE__ */ b(na, {
					value: "compact",
					children: i.compact
				})]
			}),
			n && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b($, {}), /* @__PURE__ */ b(ea, {
				checked: e.values.selection,
				onCheckedChange: (t) => e.setSelectionEnabled(t === !0),
				children: i.selection
			})] }),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ x(Q, {
				disabled: e.isDefault,
				onSelect: () => e.reset(),
				children: [/* @__PURE__ */ b(Pe, {
					className: "size-4",
					"aria-hidden": "true"
				}), i.reset]
			})
		]
	})] }), c] });
}
//#endregion
//#region src/molecules/InlineText/InlineText.tsx
function Ua({ value: e, onChange: t, label: n, placeholder: r, multiline: i = !1, inverse: a = !1, as: o = "p", className: s }) {
	let [c, l] = j(!1), u = A(null), d = A(null), f = A(!1);
	E(() => {
		c ? (u.current?.focus(), u.current?.select()) : f.current && (f.current = !1, d.current?.focus());
	}, [c]);
	let p = (n, r) => {
		let i = u.current?.value.trim() ?? "";
		f.current = r, l(!1), n && i !== e && t(i);
	};
	if (c) {
		let t = {
			ref: u,
			defaultValue: e,
			"aria-label": n,
			placeholder: r,
			onKeyDown: (e) => {
				e.key === "Escape" ? (e.preventDefault(), p(!1, !0)) : e.key === "Enter" && !e.nativeEvent.isComposing && (!i || e.metaKey || e.ctrlKey) && (e.preventDefault(), p(!0, !0));
			},
			onBlur: () => p(!0, !1),
			className: q("block w-full resize-none rounded-md px-2 py-0.5 text-inherit outline-none ring-2", a ? "bg-black/20 ring-primary-foreground" : "bg-background ring-ring", "-mx-2 w-[calc(100%+1rem)]", s)
		};
		return i ? /* @__PURE__ */ b("textarea", {
			rows: Math.max(3, e.split("\n").length + 1),
			...t
		}) : /* @__PURE__ */ b("input", { ...t });
	}
	return e ? /* @__PURE__ */ b(o, {
		className: s,
		children: /* @__PURE__ */ x("button", {
			ref: d,
			type: "button",
			"aria-label": `${n}: ${e}`,
			onClick: () => l(!0),
			className: q("group/inline relative -mx-2 block w-[calc(100%+1rem)] cursor-text rounded-md px-2 py-0.5 text-start whitespace-pre-line", "outline-offset-2 hover:outline-2 hover:outline-dashed focus-visible:outline-2 focus-visible:outline-solid", a ? "hover:outline-primary-foreground/60 focus-visible:outline-primary-foreground" : "hover:outline-ring/60 focus-visible:outline-ring"),
			children: [e, /* @__PURE__ */ b(ke, {
				"aria-hidden": "true",
				className: "absolute -end-5 top-1 hidden size-3.5 opacity-70 group-hover/inline:block"
			})]
		})
	}) : /* @__PURE__ */ x("button", {
		ref: d,
		type: "button",
		onClick: () => l(!0),
		className: q("flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-start text-sm transition-colors", a ? "border-primary-foreground/50 text-primary-foreground hover:border-primary-foreground" : "border-border text-muted-foreground hover:border-ring hover:text-foreground"),
		children: [/* @__PURE__ */ b(Me, {
			className: "size-4 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ x("span", { children: [
			/* @__PURE__ */ b("span", {
				className: q("font-medium", !a && "text-foreground"),
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
var Wa = (e) => e.done >= e.total, Ga = (e) => e.total > 0 ? Math.min(100, Math.max(0, e.done / e.total * 100)) : 100;
function Ka({ language: e }) {
	return /* @__PURE__ */ b("span", {
		"aria-hidden": "true",
		"data-slot": "language-select-flag",
		className: "inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] [&>img]:size-full [&>img]:object-cover [&>svg]:size-full",
		children: e.flag ?? /* @__PURE__ */ b("span", {
			"data-slot": "language-select-code",
			className: "flex size-full items-center justify-center bg-muted text-[10px] leading-none font-semibold text-muted-foreground uppercase",
			children: e.code.toUpperCase()
		})
	});
}
function qa({ language: e }) {
	let t = Wa(e);
	return /* @__PURE__ */ x("span", {
		"aria-hidden": "true",
		"data-slot": "language-select-progress",
		"data-complete": t,
		className: q("shrink-0 rounded-full px-1.5 py-px text-xs font-medium tabular-nums", t ? "bg-success/10 text-success-tint-foreground" : "bg-warning/10 text-warning-tint-foreground"),
		children: [
			e.done,
			"/",
			e.total
		]
	});
}
function Ja({ languages: e, value: t, onValueChange: n, labels: r, className: i }) {
	let a = e.find((e) => e.code === t);
	return /* @__PURE__ */ x(ba, {
		value: t,
		onValueChange: n,
		children: [/* @__PURE__ */ b(Ca, {
			"data-slot": "language-select",
			"aria-label": a ? `${r.label}: ${a.label}, ${r.progress(a.done, a.total)}` : r.label,
			className: q("w-auto min-w-40 gap-2 px-2", i),
			children: /* @__PURE__ */ b(Sa, { children: a ? /* @__PURE__ */ x("span", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ b(Ka, { language: a }),
					/* @__PURE__ */ b("span", {
						className: "truncate",
						children: a.label
					}),
					/* @__PURE__ */ b(qa, { language: a })
				]
			}) : null })
		}), /* @__PURE__ */ b(Ea, {
			className: "min-w-56",
			children: e.map((e) => {
				let t = Wa(e);
				return /* @__PURE__ */ x(p.Item, {
					value: e.code,
					"data-slot": "select-item",
					"data-complete": t,
					className: "relative flex w-full cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
					children: [/* @__PURE__ */ b(p.ItemText, { children: /* @__PURE__ */ x("span", {
						className: "flex w-full flex-col gap-1",
						children: [/* @__PURE__ */ x("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ b(Ka, { language: e }),
								/* @__PURE__ */ b("span", {
									className: "flex-1 truncate",
									children: e.label
								}),
								" ",
								/* @__PURE__ */ b("span", {
									className: "sr-only",
									children: r.progress(e.done, e.total)
								}),
								/* @__PURE__ */ b(qa, { language: e })
							]
						}), /* @__PURE__ */ b("span", {
							"aria-hidden": "true",
							"data-slot": "language-select-bar",
							className: "block h-1 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ b("span", {
								className: q("block h-full rounded-full", t ? "bg-success" : "bg-warning"),
								style: { width: `${Ga(e)}%` }
							})
						})]
					}) }), /* @__PURE__ */ b("span", {
						className: "absolute end-2 top-2 flex size-4 items-center justify-center",
						children: /* @__PURE__ */ b(p.ItemIndicator, { children: /* @__PURE__ */ b(I, {
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
function Ya({ value: e, onValueChange: t, placeholder: n, collapsible: r = !1, className: i, onFocus: a, onBlur: o, ...s }) {
	let [c, l] = j(!1), [u, d] = j(!1), f = !r || c || e !== "", p = /* @__PURE__ */ x("div", {
		"data-expanded": f ? "" : void 0,
		className: q("relative", r && ["w-8 shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none", "data-expanded:w-[var(--search-width,18rem)]"], i),
		children: [/* @__PURE__ */ b(Ie, {
			className: q("pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground", !f && "start-2 text-foreground"),
			"aria-hidden": "true"
		}), /* @__PURE__ */ b(fr, {
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
			className: q("h-8 w-full ps-8", !f && "cursor-pointer border-transparent pe-0 placeholder:text-transparent hover:bg-muted")
		})]
	});
	return r ? /* @__PURE__ */ b(Kn, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(qn, {
			open: u && !f,
			onOpenChange: d,
			children: [/* @__PURE__ */ b(Jn, {
				asChild: !0,
				children: p
			}), /* @__PURE__ */ b(Yn, { children: n })]
		})
	}) : p;
}
//#endregion
//#region src/molecules/SegmentedChoice/SegmentedChoice.tsx
var Xa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Root, {
		ref: n,
		"data-slot": "segmented-choice",
		className: q("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
Xa.displayName = "SegmentedChoice";
var Za = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ b(f.Item, {
		ref: r,
		"data-slot": "segmented-choice-item",
		className: q("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...n,
		children: t
	});
});
Za.displayName = "SegmentedChoiceItem";
//#endregion
//#region src/molecules/SegmentedTabs/SegmentedTabs.tsx
var Qa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Root, {
		ref: n,
		"data-slot": "segmented-tabs",
		className: q("flex flex-col gap-4", e),
		...t
	});
});
Qa.displayName = "SegmentedTabs";
var $a = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.List, {
		ref: n,
		"data-slot": "segmented-tabs-list",
		className: q("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
$a.displayName = "SegmentedTabsList";
var eo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Trigger, {
		ref: n,
		"data-slot": "segmented-tab",
		className: q("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
eo.displayName = "SegmentedTab";
var to = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Content, {
		ref: n,
		"data-slot": "segmented-tabs-content",
		className: q("focus-visible:outline-none", e),
		...t
	});
});
to.displayName = "SegmentedTabsContent";
//#endregion
//#region src/molecules/StatCard/StatCard.tsx
function no({ label: e, value: t, hint: n, icon: r, className: i }) {
	return /* @__PURE__ */ x(li, {
		className: q("gap-2", i),
		children: [/* @__PURE__ */ x(ui, {
			className: "flex flex-row items-center justify-between gap-2",
			children: [/* @__PURE__ */ b(di, {
				className: "text-sm font-medium text-muted-foreground",
				children: e
			}), r ? /* @__PURE__ */ b("span", {
				className: "shrink-0 text-muted-foreground",
				"aria-hidden": "true",
				children: r
			}) : null]
		}), /* @__PURE__ */ x(mi, { children: [/* @__PURE__ */ b("p", {
			className: "text-3xl font-semibold text-foreground tabular-nums",
			children: t
		}), n ? /* @__PURE__ */ b("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: n
		}) : null] })]
	});
}
//#endregion
//#region src/molecules/Tabs/Tabs.tsx
var ro = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Root, {
		ref: n,
		"data-slot": "tabs",
		className: q("flex flex-col gap-4", e),
		...t
	});
});
ro.displayName = "Tabs";
var io = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.List, {
		ref: n,
		"data-slot": "tabs-list",
		className: q("inline-flex w-full flex-wrap items-center gap-1 rounded-md border-b border-border bg-transparent p-0", e),
		...t
	});
});
io.displayName = "TabsList";
var ao = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Trigger, {
		ref: n,
		"data-slot": "tabs-trigger",
		className: q("inline-flex items-center justify-center rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors", "pointer-coarse:min-h-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:border-primary data-[state=active]:text-foreground", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
ao.displayName = "TabsTrigger";
var oo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Content, {
		ref: n,
		"data-slot": "tabs-content",
		className: q("focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", e),
		...t
	});
});
oo.displayName = "TabsContent";
//#endregion
//#region src/organisms/AppRail/AppRail.tsx
function so({ label: e, logo: t, children: n, className: r }) {
	return /* @__PURE__ */ b(Kn, {
		delayDuration: 200,
		children: /* @__PURE__ */ x("nav", {
			"aria-label": e,
			className: q("flex h-full w-[68px] shrink-0 flex-col items-center gap-1 bg-rail px-1.5 py-3 text-rail-foreground", r),
			children: [t && /* @__PURE__ */ b("div", {
				className: "mb-2 flex justify-center",
				children: t
			}), n]
		})
	});
}
function co() {
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: "flex-1"
	});
}
var lo = T(function({ icon: e, label: t, active: n, href: r, as: i, onClick: a, className: o, ...s }, c) {
	let l = q("flex w-full flex-col items-center gap-1 rounded-lg py-2 text-[10.5px] leading-none font-medium transition-colors outline-none", "focus-visible:ring-2 focus-visible:ring-rail-foreground", o, n ? "bg-rail-accent text-rail-foreground" : "text-rail-muted-foreground hover:bg-rail-accent hover:text-rail-foreground"), u = /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(e, {
		className: "size-5",
		"aria-hidden": "true"
	}), /* @__PURE__ */ b("span", {
		className: "line-clamp-2 max-w-full px-0.5 text-center leading-tight break-words hyphens-auto",
		children: t
	})] }), d = r === void 0 ? /* @__PURE__ */ b("button", {
		...s,
		ref: c,
		type: "button",
		onClick: a,
		"aria-pressed": n,
		className: l,
		children: u
	}) : /* @__PURE__ */ b(i ?? "a", {
		...s,
		ref: c,
		href: r,
		onClick: a,
		"aria-current": n ? "page" : void 0,
		className: l,
		children: u
	});
	return /* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
		asChild: !0,
		children: d
	}), /* @__PURE__ */ b(Yn, {
		side: "right",
		children: t
	})] });
}), uo = 16, fo = 6, po = 600, mo = 700, ho = "\0draft";
function go(e) {
	if (!e || typeof localStorage > "u") return null;
	try {
		let t = JSON.parse(localStorage.getItem(`burgwiss-ui:tree:${e}`) ?? "null");
		return Array.isArray(t) && t.every((e) => typeof e == "string") ? t : null;
	} catch {
		return null;
	}
}
function _o({ initial: e, label: t, onDone: n }) {
	let r = A(null), i = A(!1);
	E(() => {
		r.current?.focus(), r.current?.select();
	}, []);
	let a = (e, t) => {
		i.current || (i.current = !0, n(e, t));
	};
	return /* @__PURE__ */ b("input", {
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
function vo() {
	if (typeof crypto < "u" && typeof crypto.randomUUID == "function") return crypto.randomUUID();
	let e = /* @__PURE__ */ new Uint8Array(16);
	return crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(2, "0")).join("");
}
function yo({ nodes: e, onNodesChange: t, selectedId: n, onSelect: r, onEdit: i, counts: a, createId: o = vo, defaultExpandedIds: s = [], storageKey: c, shortcutLabels: l, labels: u, maxDepth: d, className: f }) {
	let p = t !== void 0, m = p || i !== void 0, h = D(), [g, _] = j(() => {
		let t = new Set(go(c) ?? s);
		return n && rt(e, n).slice(0, -1).forEach((e) => t.add(e.id)), t;
	}), [v, S] = j(null), [C, w] = j(null), [T, ee] = j(null), [te, O] = j(null), [ne, re] = j(""), [ae, M] = j(null), [, P] = j(0), F = A(/* @__PURE__ */ new Map()), oe = A(null), I = A(null), L = A(null), se = A(null), ce = A(!1), z = A({
		text: "",
		at: 0
	}), le = (e) => _((t) => {
		let n = new Set(t);
		return e(n), c && typeof localStorage < "u" && localStorage.setItem(`burgwiss-ui:tree:${c}`, JSON.stringify([...n])), n;
	}), B = k(() => {
		let t = at(e, g);
		if (C?.kind !== "new") return t;
		let n = (e, t) => ({
			node: {
				id: ho,
				label: u.newName
			},
			level: e,
			parentId: t,
			posInSet: 0,
			setSize: 0,
			hasChildren: !1,
			expanded: !1,
			draft: !0
		}), r = t.findIndex((e) => e.node.id === C.parentId);
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
		g,
		C,
		u.newName
	]), ue = A({
		nodes: e,
		lines: B
	});
	E(() => {
		ue.current = {
			nodes: e,
			lines: B
		};
	}), E(() => {
		let e = I.current, t = e ? F.current.get(e) : void 0;
		t && (t.focus(), I.current = null);
	});
	let V = (e) => {
		I.current = e, P((e) => e + 1);
	}, de = v && B.some((e) => e.node.id === v) && v || n && B.some((e) => e.node.id === n) && n || B[0]?.node.id, H = (n, r) => t?.(n, yt(e, n, r)), pe = (t, n) => {
		if (n === e) return;
		let r = J(n, t), i = Y(e, t), a = Y(n, t);
		a.parentId !== null && le((e) => rt(n, a.parentId).forEach((t) => e.add(t.id))), H(n, t), a.parentId !== i.parentId && re(u.moved(r.label, a.parentId === null ? null : J(n, a.parentId).label)), V(t);
	}, me = (e, t) => le((n) => {
		t ?? !n.has(e) ? n.add(e) : n.delete(e);
	}), U = (e) => {
		e && me(e, !0), w({
			kind: "new",
			parentId: e
		});
	}, ye = (t) => {
		let i = J(e, t);
		if (!i) return;
		let a = B.findIndex((e) => e.node.id === t), o = B[a], s = (o && B.slice(a + 1).find((e) => e.level <= o.level && !e.draft)) ?? (a > 0 ? B[a - 1] : void 0);
		return n && it(e, t).includes(n) && r(null), H(lt(e, t)), re(u.deleted(i.label)), V(s?.node.id ?? null), s?.node.id ?? null;
	}, Se = (t) => {
		it(e, t).length - 1 > 0 || (a?.[t] ?? 0) > 0 ? O(t) : ye(t);
	}, Ce = (t, n) => {
		let r = C;
		if (w(null), !r) return;
		let i = t?.trim() ?? "";
		if (r.kind === "rename") {
			let t = J(e, r.id);
			t && i && i !== t.label && H(ut(e, r.id, i)), n && V(r.id);
			return;
		}
		if (!i) {
			n && V(r.parentId ?? de ?? null);
			return;
		}
		let a = o();
		H(ct(e, r.parentId, {
			id: a,
			label: i
		})), n && V(a);
	}, W = (e) => {
		let t = B[Math.max(0, Math.min(e, B.length - 1))];
		t && F.current.get(t.node.id)?.focus();
	}, we = (t) => {
		let n = t.target.closest("[role=treeitem]")?.dataset.id, i = B.findIndex((e) => e.node.id === n), a = B[i];
		if (!n || !a || a.draft) return;
		let { forward: o, back: s } = et(t.currentTarget), c = () => {
			t.preventDefault(), t.stopPropagation();
		};
		if (t.altKey && !t.ctrlKey && !t.metaKey) {
			let r = {
				ArrowUp: () => mt(e, n, -1),
				ArrowDown: () => mt(e, n, 1),
				[o]: () => ht(e, n, d),
				[s]: () => gt(e, n)
			};
			p && r[t.key] && (c(), pe(n, r[t.key]()));
			return;
		}
		if (t.key === "ContextMenu" || t.shiftKey && t.key === "F10") {
			m && (c(), ee(n));
			return;
		}
		switch (t.key) {
			case "ArrowDown": return c(), W(i + 1);
			case "ArrowUp": return c(), W(i - 1);
			case "Home": return c(), W(0);
			case "End": return c(), W(B.length - 1);
			case o: return c(), a.hasChildren && !a.expanded ? me(n, !0) : a.expanded ? W(i + 1) : void 0;
			case s:
				if (c(), a.expanded) return me(n, !1);
				a.parentId && F.current.get(a.parentId)?.focus();
				return;
			case "Enter":
			case " ": return c(), r(n);
			case "F2": return p ? (c(), w({
				kind: "rename",
				id: n
			})) : void 0;
			case "Delete":
			case "Backspace": return p ? (c(), Se(n)) : void 0;
		}
		if (t.key.length === 1 && !t.ctrlKey && !t.metaKey) {
			let e = t.timeStamp, n = z.current;
			n.text = e - n.at > mo ? t.key : n.text + t.key, n.at = e;
			let r = n.text.toLocaleLowerCase(), a = [...r].every((e) => e === r[0]), o = a ? r[0] : r, s = [...B.slice(i + +!!a), ...B.slice(0, i + 1)].find((e) => !e.draft && e.node.label.toLocaleLowerCase().startsWith(o));
			s && (c(), F.current.get(s.node.id)?.focus());
		}
	}, Te = (e, t, n) => {
		let { nodes: r, lines: i } = ue.current, a = document.elementFromPoint(e, t), o = (e) => X(r, n, e.parentId, d) && pt(r, n, e.parentId, e.index, d) !== r ? e : null;
		if (a?.closest("[data-tree-end]") && oe.current?.parentElement?.contains(a)) return o({
			lineId: null,
			zone: "end",
			parentId: null,
			index: r.length
		});
		let s = a?.closest("[data-tree-line]");
		if (!s || !oe.current?.contains(s)) return null;
		let c = i.find((e) => e.node.id === s.dataset.id);
		if (!c || c.draft || c.node.id === n) return null;
		let l = s.getBoundingClientRect(), u = (t - l.top) / l.height, f = u < .25 ? "before" : u > .75 ? "after" : "inside", p = c.node.id;
		return f === "inside" && !X(ue.current.nodes, n, p, d) && (f = u < .5 ? "before" : "after"), f === "before" ? o({
			lineId: p,
			zone: f,
			parentId: c.parentId,
			index: c.posInSet - 1
		}) : f === "after" ? c.expanded ? o({
			lineId: p,
			zone: f,
			parentId: p,
			index: 0
		}) : o({
			lineId: p,
			zone: f,
			parentId: c.parentId,
			index: c.posInSet
		}) : o({
			lineId: p,
			zone: f,
			parentId: p,
			index: c.node.children?.length ?? 0
		});
	}, Ee = (e, t) => {
		if (!p || e.button !== 0 || e.pointerType === "touch" || e.target.closest("input,[data-tree-menu],[data-tree-toggle],[data-tree-edit]")) return;
		let n = {
			x: e.clientX,
			y: e.clientY
		}, r = !1, i = {
			id: null,
			timer: 0
		}, a = () => {
			window.removeEventListener("pointermove", o), window.removeEventListener("pointerup", s), window.removeEventListener("pointercancel", c), window.removeEventListener("keydown", l, !0), window.clearTimeout(i.timer), M(null);
		}, o = (e) => {
			if (!r) {
				if (Math.hypot(e.clientX - n.x, e.clientY - n.y) < fo) return;
				r = !0;
			}
			let a = Te(e.clientX, e.clientY, t);
			M({
				id: t,
				target: a
			});
			let o = a?.zone === "inside" ? a.lineId : null;
			o !== i.id && (window.clearTimeout(i.timer), i = {
				id: o,
				timer: o ? window.setTimeout(() => me(o, !0), po) : 0
			});
		}, s = (e) => {
			let n = r ? Te(e.clientX, e.clientY, t) : null;
			if (a(), !r) return;
			ce.current = !0, window.setTimeout(() => ce.current = !1, 0);
			let i = ue.current.nodes;
			n && pe(t, pt(i, t, n.parentId, n.index, d));
		}, c = () => a(), l = (e) => {
			e.key === "Escape" && r && (e.preventDefault(), e.stopPropagation(), r = !1, a());
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", c), window.addEventListener("keydown", l, !0);
	}, De = k(() => T ? at(e, new Set(e.flatMap((t) => it(e, t.id)))) : [], [T, e]), Oe = (e) => Lt(e, l), Ae = te ? J(e, te) : null, je = (t) => {
		let n = t.node.id, r = Y(e, n), a = r.index === 0, o = r.index === r.siblings.length - 1, s = d !== void 0 && d <= 1, c = d === void 0 || t.level < d, l = d === void 0 ? null : De.filter((t) => t.node.id !== r.parentId && X(e, n, t.node.id, d)), f = l === null || r.parentId !== null || l.length > 0, m = (e) => {
			L.current = () => F.current.get(n)?.focus(), pe(n, e());
		}, h = (e) => {
			L.current = e;
		};
		return /* @__PURE__ */ x($i, {
			align: "start",
			className: "w-64",
			onCloseAutoFocus: (e) => {
				e.preventDefault();
				let t = L.current;
				L.current = null, t ? t() : F.current.get(n)?.focus();
			},
			children: [
				i && /* @__PURE__ */ x(Q, {
					onSelect: () => h(() => i(n)),
					children: [/* @__PURE__ */ b(ke, { "aria-hidden": "true" }), u.edit]
				}),
				p && i && /* @__PURE__ */ b($, {}),
				p && /* @__PURE__ */ x(y, { children: [
					c && /* @__PURE__ */ x(Q, {
						onSelect: () => h(() => U(n)),
						children: [/* @__PURE__ */ b(ve, { "aria-hidden": "true" }), u.addChild]
					}),
					/* @__PURE__ */ x(Q, {
						onSelect: () => h(() => w({
							kind: "rename",
							id: n
						})),
						children: [
							/* @__PURE__ */ b(ke, { "aria-hidden": "true" }),
							u.rename,
							/* @__PURE__ */ b(oa, { children: Oe("F2") })
						]
					}),
					/* @__PURE__ */ b($, {}),
					f && /* @__PURE__ */ x(ra, { children: [/* @__PURE__ */ x(ia, { children: [/* @__PURE__ */ b(ge, { "aria-hidden": "true" }), u.moveTo] }), /* @__PURE__ */ x(aa, {
						className: "max-h-80 w-64 overflow-y-auto",
						children: [/* @__PURE__ */ b(Q, {
							disabled: r.parentId === null,
							onSelect: () => m(() => pt(e, n, null, e.length)),
							children: u.topLevel
						}), De.map((t) => /* @__PURE__ */ b(Q, {
							disabled: t.node.id === r.parentId || !X(e, n, t.node.id, d),
							style: { paddingInlineStart: `${8 + t.level * 12}px` },
							onSelect: () => m(() => pt(e, n, t.node.id, t.node.children?.length ?? 0, d)),
							children: t.node.label
						}, t.node.id))]
					})] }),
					/* @__PURE__ */ x(Q, {
						disabled: a,
						onSelect: () => m(() => mt(e, n, -1)),
						children: [
							/* @__PURE__ */ b(N, { "aria-hidden": "true" }),
							u.moveUp,
							/* @__PURE__ */ b(oa, { children: Oe("Alt+↑") })
						]
					}),
					/* @__PURE__ */ x(Q, {
						disabled: o,
						onSelect: () => m(() => mt(e, n, 1)),
						children: [
							/* @__PURE__ */ b(ie, { "aria-hidden": "true" }),
							u.moveDown,
							/* @__PURE__ */ b(oa, { children: Oe("Alt+↓") })
						]
					}),
					!s && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(Q, {
						disabled: r.parentId === null,
						onSelect: () => m(() => gt(e, n)),
						children: [
							/* @__PURE__ */ b(be, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							u.outdent,
							/* @__PURE__ */ b(oa, { children: Oe("Alt+←") })
						]
					}), /* @__PURE__ */ x(Q, {
						disabled: a || ht(e, n, d) === e,
						onSelect: () => m(() => ht(e, n, d)),
						children: [
							/* @__PURE__ */ b(xe, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							u.indent,
							/* @__PURE__ */ b(oa, { children: Oe("Alt+→") })
						]
					})] }),
					/* @__PURE__ */ b($, {}),
					/* @__PURE__ */ x(Q, {
						onSelect: () => h(() => Se(n)),
						children: [
							/* @__PURE__ */ b(Be, { "aria-hidden": "true" }),
							u.delete,
							/* @__PURE__ */ b(oa, { children: Oe("Delete") })
						]
					})
				] })
			]
		});
	}, Ne = (e) => {
		let t = e.node.id, o = e.draft ? void 0 : a?.[t], s = C?.kind === "rename" && C.id === t, c = ae?.target?.lineId === t ? ae.target.zone : null, l = e.expanded ? _e : he, d = 4 + (e.level - 1) * uo;
		return /* @__PURE__ */ x("div", {
			ref: (e) => {
				e ? F.current.set(t, e) : F.current.delete(t);
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
			"aria-label": o === void 0 ? void 0 : `${e.node.label}, ${u.count(o)}`,
			tabIndex: !e.draft && de === t ? 0 : -1,
			onFocus: (n) => {
				n.target === n.currentTarget && !e.draft && S(t);
			},
			onClick: () => {
				e.draft || ce.current || r(t);
			},
			onContextMenu: (n) => {
				m && !e.draft && (n.preventDefault(), ee(t));
			},
			onPointerDown: (n) => !e.draft && Ee(n, t),
			style: {
				paddingInlineStart: d,
				"--indent": `${d}px`
			},
			className: q("group/line relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md pe-1 text-sm outline-none select-none", "animate-in duration-150 fade-in-0 slide-in-from-top-1 motion-reduce:animate-none", "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", "aria-selected:bg-muted aria-selected:font-medium", ae?.id === t && "opacity-50", c === "inside" && "ring-2 ring-primary ring-inset", (c === "before" || c === "after") && "before:pointer-events-none before:absolute before:start-(--indent) before:end-1 before:h-0.5 before:rounded-full before:bg-primary", c === "before" && "before:-top-px", c === "after" && "before:-bottom-px"),
			children: [
				/* @__PURE__ */ b("span", {
					"data-tree-toggle": "",
					"aria-hidden": "true",
					onClick: (n) => {
						n.stopPropagation(), e.hasChildren && me(t);
					},
					className: "flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
					children: e.hasChildren && /* @__PURE__ */ b(R, { className: q("size-4 transition-transform duration-150 motion-reduce:transition-none", e.expanded ? "rotate-90" : "rtl:rotate-180") })
				}),
				/* @__PURE__ */ b(l, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": "true"
				}),
				e.draft || s ? /* @__PURE__ */ b(_o, {
					initial: e.node.label,
					label: u.nameInput,
					onDone: Ce
				}) : /* @__PURE__ */ b("span", {
					className: "min-w-0 flex-1 truncate",
					children: e.node.label
				}),
				o !== void 0 && !s && /* @__PURE__ */ b("span", {
					"aria-hidden": "true",
					className: q("shrink-0 px-1 text-xs text-muted-foreground tabular-nums", m && "group-hover/line:hidden group-focus-visible/line:hidden", T === t && "hidden"),
					children: o
				}),
				i && !e.draft && !s && /* @__PURE__ */ b(Kn, {
					delayDuration: 300,
					children: /* @__PURE__ */ x(qn, { children: [/* @__PURE__ */ b(Jn, {
						asChild: !0,
						children: /* @__PURE__ */ b("span", {
							"data-tree-edit": "",
							"aria-hidden": "true",
							onClick: (e) => {
								e.stopPropagation(), i(t);
							},
							className: q("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex", T === t && "flex"),
							children: /* @__PURE__ */ b(ke, { className: "size-3.5" })
						})
					}), /* @__PURE__ */ b(Yn, { children: u.edit })] })
				}),
				m && !e.draft && !s && /* @__PURE__ */ x(Xi, {
					open: T === t,
					onOpenChange: (e) => ee(e ? t : null),
					children: [/* @__PURE__ */ b(Zi, {
						asChild: !0,
						children: /* @__PURE__ */ b("span", {
							"data-tree-menu": "",
							"aria-hidden": "true",
							tabIndex: -1,
							onClick: (e) => e.stopPropagation(),
							className: q("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex data-[state=open]:flex"),
							children: /* @__PURE__ */ b(fe, { className: "size-4" })
						})
					}), T === t && je(e)]
				})
			]
		}, t);
	};
	return /* @__PURE__ */ x("div", {
		className: q("flex flex-col gap-1", f),
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex h-8 items-center justify-between gap-2 ps-2",
				children: [/* @__PURE__ */ b("h2", {
					id: h,
					className: "text-xs font-medium text-muted-foreground",
					children: u.heading
				}), p && /* @__PURE__ */ b(ar, {
					label: u.add,
					icon: /* @__PURE__ */ b(Me, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					onClick: () => U(null),
					className: "size-7"
				})]
			}),
			B.length === 0 ? /* @__PURE__ */ b("p", {
				className: "px-2 py-1 text-sm text-muted-foreground",
				children: u.empty
			}) : /* @__PURE__ */ b("div", {
				ref: oe,
				role: "tree",
				"aria-labelledby": h,
				onKeyDown: we,
				className: "flex flex-col",
				children: B.map((e) => Ne(e))
			}),
			ae && /* @__PURE__ */ b("div", {
				"data-tree-end": "",
				"aria-hidden": "true",
				className: q("mt-1 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground", ae.target?.zone === "end" && "border-primary text-foreground"),
				children: u.topLevel
			}),
			/* @__PURE__ */ b("div", {
				"aria-live": "polite",
				className: "sr-only",
				children: ne
			}),
			p && Ae && /* @__PURE__ */ b(Er, {
				open: !0,
				onOpenChange: (e) => !e && O(null),
				children: /* @__PURE__ */ x(Ar, {
					onCloseAutoFocus: (e) => {
						e.preventDefault();
						let t = se.current ?? Ae.id;
						se.current = null, F.current.get(t)?.focus();
					},
					children: [/* @__PURE__ */ x(jr, { children: [/* @__PURE__ */ b(Nr, { children: u.confirmDeleteTitle(Ae.label) }), /* @__PURE__ */ b(Pr, { children: u.confirmDelete(Ae.label, it(e, Ae.id).length - 1, a?.[Ae.id] ?? 0) })] }), /* @__PURE__ */ x(Mr, { children: [/* @__PURE__ */ b(Ir, { children: u.cancel }), /* @__PURE__ */ b(Fr, {
						onClick: () => {
							se.current = ye(Ae.id) ?? null;
						},
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						children: u.deleteConfirm
					})] })]
				})
			})
		]
	});
}
//#endregion
//#region src/organisms/ChatComposer/ChatComposer.tsx
var bo = 160;
function xo({ onSend: e, labels: t, error: n, attachmentsError: r, replyTo: i = null, onClearReply: a, onSent: o, allowAttachments: s = !0, disabled: c = !1, acceptedMimes: l = St, maxAttachmentMb: u = 25, maxAttachments: d = 5, className: f }) {
	let p = D(), m = D(), h = A(null), g = A(null), _ = A(!0), [v, S] = j(""), [C, w] = j([]), [T, ee] = j(!1), [te, O] = j(null);
	E(() => (_.current = !0, () => {
		_.current = !1;
	}), []);
	let k = i?.id ?? null;
	E(() => {
		k !== null && h.current?.focus();
	}, [k]);
	let ne = () => {
		let e = h.current;
		e && (e.style.height = "auto", e.style.height = `${Math.min(e.scrollHeight, bo)}px`);
	}, re = !c && (v.trim() !== "" || C.length > 0), ie = C.length >= d, ae = (e) => {
		let n = Array.from(e.target.files ?? []);
		if (e.target.value = "", n.length === 0) return;
		let r = Ot(C, n, {
			maxFiles: d,
			maxSizeMb: u
		});
		w(r.files);
		let i = r.rejected[0];
		i ? i.reason === "too_large" ? O(t.fileTooLarge(i.file.name, u)) : O(t.tooManyFiles(d)) : O(null);
	}, M = async (t) => {
		if (t?.preventDefault(), !T && re) {
			ee(!0);
			try {
				await e(v.trim(), C, { replyTo: i });
			} catch {
				return;
			} finally {
				_.current && ee(!1);
			}
			_.current && (S(""), w([]), O(null), h.current && (h.current.style.height = "auto"), a?.(), o?.(), h.current?.focus());
		}
	}, N = (e) => {
		e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing || (e.preventDefault(), M());
	}, P = [
		n,
		r,
		te
	].filter((e) => typeof e == "string" && e !== "");
	return /* @__PURE__ */ x("form", {
		onSubmit: (e) => void M(e),
		"aria-busy": T,
		className: q("border-t border-border bg-card px-3 py-3 sm:px-4", f),
		children: [
			i && /* @__PURE__ */ x("div", {
				className: "mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ b("span", {
					className: "truncate",
					children: t.replyingTo(i.name)
				}), /* @__PURE__ */ b(ar, {
					label: t.cancelReply,
					icon: /* @__PURE__ */ b(K, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					className: "size-6 shrink-0",
					onClick: a
				})]
			}),
			C.length > 0 && /* @__PURE__ */ b("ul", {
				className: "mb-2 flex flex-wrap gap-2",
				children: C.map((e, n) => /* @__PURE__ */ x("li", {
					className: "flex items-center gap-1 rounded-md border border-border bg-card py-1 ps-2 pe-1 text-xs",
					children: [/* @__PURE__ */ b("span", {
						className: "max-w-[12rem] truncate text-foreground",
						children: e.name
					}), /* @__PURE__ */ b(ar, {
						label: t.removeFile(e.name),
						icon: /* @__PURE__ */ b(K, {
							className: "size-3",
							"aria-hidden": "true"
						}),
						destructive: !0,
						disabled: T,
						className: "size-6",
						onClick: () => w(C.filter((e, t) => t !== n))
					})]
				}, `${e.name}-${n}`))
			}),
			/* @__PURE__ */ x("div", {
				className: "flex items-end gap-2",
				children: [
					s && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("input", {
						ref: g,
						type: "file",
						multiple: !0,
						hidden: !0,
						tabIndex: -1,
						accept: l.join(","),
						onChange: ae
					}), /* @__PURE__ */ b(ar, {
						label: t.attach,
						icon: /* @__PURE__ */ b(De, {
							className: "size-5",
							"aria-hidden": "true"
						}),
						disabled: c || T || ie,
						onClick: () => g.current?.click(),
						className: "shrink-0 rounded-full"
					})] }),
					/* @__PURE__ */ b("label", {
						htmlFor: p,
						className: "sr-only",
						children: t.message
					}),
					/* @__PURE__ */ b(br, {
						id: p,
						ref: h,
						rows: 1,
						value: v,
						readOnly: T,
						disabled: c,
						onChange: (e) => {
							S(e.target.value), ne();
						},
						onKeyDown: N,
						placeholder: t.placeholder,
						"aria-invalid": P.length > 0 || void 0,
						"aria-describedby": P.length > 0 ? m : void 0,
						className: "max-h-40 min-h-10 flex-1 resize-none rounded-2xl px-4 py-2"
					}),
					/* @__PURE__ */ b(Z, {
						type: "submit",
						size: "icon",
						disabled: !re || T,
						"aria-label": t.send,
						tooltip: t.send,
						className: "shrink-0 rounded-full",
						children: /* @__PURE__ */ b(Le, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})
				]
			}),
			P.length > 0 && /* @__PURE__ */ b("div", {
				id: m,
				role: "alert",
				className: "space-y-1 pt-2 text-sm text-destructive",
				children: P.map((e) => /* @__PURE__ */ b("p", { children: e }, e))
			})
		]
	});
}
//#endregion
//#region src/organisms/MessageList/MessageList.tsx
var So = 3e5, Co = 200;
function wo(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function To(e) {
	return e.own ? "__own" : e.authorId === void 0 ? `${e.authorName}|${e.authorBadge ?? ""}` : `id:${e.authorId}`;
}
function Eo(e) {
	return typeof e.body == "string" && e.body.trim() !== "";
}
function Do({ messages: e, labels: t, onReply: n, onDelete: r, canDelete: i = !1, onLoadOlder: a, hasOlder: o = !1, formatTime: s = wo, className: c }) {
	let l = A(null), u = A(!0), d = A(null), [f, p] = j(!1);
	O(() => {
		let t = l.current;
		if (!t) return;
		let n = e[0]?.id, r = e[e.length - 1], i = r?.id, a = d.current;
		a === null ? t.scrollTop = t.scrollHeight : i === a.last ? n !== a.first && (t.scrollTop += t.scrollHeight - a.height) : (u.current || r?.own) && (t.scrollTop = t.scrollHeight), d.current = {
			first: n,
			last: i,
			height: t.scrollHeight
		};
	}, [e]);
	let m = (e) => typeof i == "function" ? i(e) : i, h = async () => {
		if (a && !f) {
			p(!0);
			try {
				await a();
			} catch {} finally {
				p(!1);
			}
		}
	}, g = (e) => {
		let i = r !== void 0 && m(e);
		return !n && !i ? null : /* @__PURE__ */ x("div", {
			className: "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100",
			children: [n && /* @__PURE__ */ b(ar, {
				label: t.reply,
				icon: /* @__PURE__ */ b(H, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				onClick: () => n(e)
			}), i && /* @__PURE__ */ b(ar, {
				label: t.delete,
				icon: /* @__PURE__ */ b(Be, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				destructive: !0,
				onClick: () => r(e)
			})]
		});
	};
	return /* @__PURE__ */ x("div", {
		ref: l,
		role: "log",
		"aria-live": "polite",
		"aria-relevant": "additions text",
		"aria-label": t.log,
		"aria-busy": f,
		tabIndex: 0,
		onScroll: (e) => {
			let t = e.currentTarget;
			u.current = t.scrollHeight - t.scrollTop - t.clientHeight < Co;
		},
		className: q("min-h-0 flex-1 overflow-y-auto bg-background px-3 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-4", c),
		children: [o && a && t.loadOlder && /* @__PURE__ */ b("div", {
			className: "mb-4 flex justify-center",
			children: /* @__PURE__ */ b(Z, {
				type: "button",
				variant: "outline",
				size: "sm",
				disabled: f,
				onClick: () => void h(),
				children: t.loadOlder
			})
		}), e.length === 0 ? /* @__PURE__ */ b("p", {
			className: "flex h-full min-h-24 items-center justify-center text-center text-sm text-muted-foreground",
			children: t.empty
		}) : /* @__PURE__ */ b("ol", {
			className: "flex flex-col gap-0.5",
			children: e.map((n, r) => {
				let i = e[r - 1], a = !i || To(i) !== To(n) || new Date(n.sentAt).getTime() - new Date(i.sentAt).getTime() > So, o = n.own === !0, c = n.attachments ?? [], l = s(n.sentAt), u = /* @__PURE__ */ b("time", {
					dateTime: n.sentAt,
					className: q("ms-2 inline-block translate-y-px align-baseline text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
					children: l
				});
				return /* @__PURE__ */ x("li", {
					"data-own": o || void 0,
					className: q("group flex gap-1.5 sm:gap-2", a && "mt-4 first:mt-0", o ? "flex-row-reverse" : "flex-row"),
					children: [!o && /* @__PURE__ */ b("div", {
						className: "w-7 shrink-0 sm:w-8",
						children: a && /* @__PURE__ */ b(dr, {
							name: n.authorName,
							className: "size-7 text-xs sm:size-8"
						})
					}), /* @__PURE__ */ x("div", {
						className: q("flex max-w-[88%] min-w-0 flex-col sm:max-w-[78%]", o ? "items-end" : "items-start"),
						children: [a && !o && /* @__PURE__ */ x("div", {
							className: "mb-0.5 flex items-center gap-2 px-1",
							children: [
								/* @__PURE__ */ b("span", {
									className: "text-xs font-semibold text-foreground",
									children: n.authorName
								}),
								n.authorBadge && /* @__PURE__ */ b(Gn, {
									variant: "secondary",
									className: "px-1.5 py-0 text-[10px]",
									children: n.authorBadge
								}),
								n.authorNote && n.authorNote !== n.authorName && /* @__PURE__ */ x("span", {
									className: "text-[10px] font-normal text-muted-foreground",
									children: [
										"(",
										n.authorNote,
										")"
									]
								})
							]
						}), /* @__PURE__ */ x("div", {
							className: "flex items-center gap-1",
							children: [
								o && !n.deleted && g(n),
								/* @__PURE__ */ x("div", {
									className: q("max-w-full min-w-0 rounded-2xl px-3.5 py-2 text-sm", o ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md bg-muted text-foreground", n.deleted && "bg-muted text-muted-foreground italic"),
									children: [
										n.replyTo && /* @__PURE__ */ b("div", {
											className: q("mb-1 rounded-md border-s-2 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words", o ? "border-primary-foreground/60 bg-primary-foreground/20" : "border-foreground/30 bg-foreground/5"),
											children: n.replyTo.deleted ? /* @__PURE__ */ b("em", { children: t.replyPreviewDeleted }) : /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("span", {
												className: "font-semibold",
												children: n.replyTo.authorName
											}), n.replyTo.preview ? `: ${n.replyTo.preview}` : ""] })
										}),
										n.deleted ? /* @__PURE__ */ x("p", {
											className: "text-sm",
											children: [t.deleted, u]
										}) : Eo(n) ? /* @__PURE__ */ x("p", {
											className: "text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap sm:text-base",
											children: [n.body, u]
										}) : null,
										!n.deleted && c.length > 0 && t.attachments && /* @__PURE__ */ b("div", {
											className: "mt-2 max-w-full min-w-0",
											children: /* @__PURE__ */ b(ti, {
												items: c,
												labels: t.attachments
											})
										}),
										!n.deleted && !Eo(n) && /* @__PURE__ */ b("time", {
											dateTime: n.sentAt,
											className: q("mt-1 block text-end text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
											children: l
										})
									]
								}),
								!o && !n.deleted && g(n)
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
function Oo({ title: e, subtitle: t, actions: n, onBack: r, notice: i, messages: a, labels: o, onSend: s, sendError: c, attachmentsError: l, readOnly: u = !1, lockedNotice: d, allowAttachments: f, replies: p = !1, onDelete: m, canDelete: h, onLoadOlder: g, hasOlder: _, formatTime: v, className: y }) {
	let S = D(), [C, w] = j(null);
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": S,
		className: q("flex h-full min-h-0 flex-col bg-card text-card-foreground", y),
		children: [
			/* @__PURE__ */ x("header", {
				className: "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4",
				children: [
					r && o.back && /* @__PURE__ */ b(ar, {
						label: o.back,
						icon: /* @__PURE__ */ b(M, {
							className: "size-4 rtl:-scale-x-100",
							"aria-hidden": "true"
						}),
						onClick: r,
						className: "md:hidden"
					}),
					/* @__PURE__ */ x("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ b("h2", {
							id: S,
							className: "truncate text-sm font-semibold text-foreground",
							children: e
						}), t && /* @__PURE__ */ b("p", {
							className: "truncate text-xs text-muted-foreground",
							children: t
						})]
					}),
					n && /* @__PURE__ */ b("div", {
						className: "flex shrink-0 items-center gap-1",
						children: n
					})
				]
			}),
			i && /* @__PURE__ */ b("p", {
				role: "status",
				className: "shrink-0 border-b border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground",
				children: i
			}),
			/* @__PURE__ */ b(Do, {
				messages: a,
				labels: o.messages,
				onReply: p && !u && !d ? (e) => w({
					id: e.id,
					name: e.authorName
				}) : void 0,
				onDelete: m,
				canDelete: h,
				onLoadOlder: g,
				hasOlder: _,
				formatTime: v
			}),
			d ? /* @__PURE__ */ b("p", {
				role: "alert",
				className: "shrink-0 border-t border-border bg-card p-3 text-center text-sm text-muted-foreground",
				children: d
			}) : u ? null : /* @__PURE__ */ b(xo, {
				labels: o.composer,
				onSend: s,
				error: c,
				attachmentsError: l,
				allowAttachments: f,
				replyTo: C,
				onClearReply: () => w(null),
				className: "shrink-0"
			})
		]
	});
}
//#endregion
//#region src/organisms/DataGrid/DataGrid.tsx
var ko = 16, Ao = 64, jo = 200;
function Mo(e, t = !1) {
	if (e.pinned) return {
		position: "sticky",
		[e.pinned === "left" ? "insetInlineStart" : "insetInlineEnd"]: e.offset,
		zIndex: t ? 30 : 10
	};
}
function No({ grid: e, labels: t, rowLabel: n, renderDetail: r, renderFilter: i, loading: a = !1, error: o = null, onRetry: s, emptyState: c, virtualize: l, className: u }) {
	let d = D(), f = A(null), [p, m] = j(null), [h, g] = j(null), _ = e.layout, v = (e.showCheckboxes ? 40 : 0) + (e.hasExpandableRows ? 40 : 0) + _.reduce((e, t) => e + t.width, 0), y = +!!e.showCheckboxes + +!!e.hasExpandableRows + _.length, S = e.columns.find((e) => e.id === _[0]?.id) ?? e.columns[0], C = (e) => n?.(e) ?? (S ? String(Rt(S, e) ?? "") : ""), w = tn(e.preferences.values.columnOrder, e.columns.map((e) => e.id)), T = e.lines, ee = l ?? T.length >= jo, te = e.preferences.values.density === "compact" ? 37 : 49, E = Xe({
		count: ee ? T.length : 0,
		getScrollElement: () => f.current?.closest("[data-grid-scroll]") ?? f.current?.parentElement ?? null,
		estimateSize: () => te,
		overscan: 12
	}), O = ee ? E.getVirtualItems() : null, k = O ? O.map((e) => ({
		index: e.index,
		line: T[e.index]
	})) : T.map((e, t) => ({
		index: t,
		line: e
	})), ne = O && O.length ? O[0].start : 0, re = O && O.length ? E.getTotalSize() - O[O.length - 1].end : 0, ie = (t) => {
		let n = f.current?.querySelectorAll(`[data-col="${CSS.escape(t)}"] [data-cell-content]`), r = 0;
		n?.forEach((e) => r = Math.max(r, e.getBoundingClientRect().width, e.scrollWidth)), e.setColumnWidth(t, r + 72);
	}, ae = (t, n) => {
		let r = _.findIndex((e) => e.id === t), i = _[r + n];
		i && e.moveColumn(t, w.indexOf(i.id));
	}, M = A(null), N = A(!1), P = (e, t) => (document.elementFromPoint?.(e, t)?.closest("th[data-col]"))?.dataset.col ?? null, F = (t, n) => {
		if (t.button !== 0 || t.target.closest("[role=separator],[aria-haspopup]")) return;
		M.current = {
			id: n,
			x: t.clientX,
			y: t.clientY,
			moved: !1
		};
		let r = (e) => {
			let t = M.current;
			t && (!t.moved && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 6 || (t.moved = !0, m(P(e.clientX, e.clientY))));
		}, i = (t) => {
			window.removeEventListener("pointermove", r), window.removeEventListener("pointerup", i);
			let n = M.current;
			if (M.current = null, m(null), !n?.moved) return;
			N.current = !0, window.setTimeout(() => N.current = !1, 0);
			let a = P(t.clientX, t.clientY);
			a && a !== n.id && e.moveColumn(n.id, w.indexOf(a));
		};
		window.addEventListener("pointermove", r), window.addEventListener("pointerup", i);
	}, oe = a && !o, I = oe && e.visibleRows.length === 0, L = !a && !o && T.length === 0;
	return /* @__PURE__ */ x("div", {
		className: q("relative", u),
		children: [/* @__PURE__ */ b("div", {
			role: "status",
			className: "sr-only",
			children: oe ? t.loading : ""
		}), /* @__PURE__ */ x("table", {
			ref: f,
			"aria-label": t.table,
			"aria-busy": oe || void 0,
			...e.getTableProps(),
			style: {
				width: v,
				tableLayout: "fixed"
			},
			className: q("caption-bottom border-separate border-spacing-0 text-sm", oe && !I && "opacity-60"),
			children: [
				/* @__PURE__ */ x("colgroup", { children: [
					e.showCheckboxes && /* @__PURE__ */ b("col", { style: { width: 40 } }),
					e.hasExpandableRows && /* @__PURE__ */ b("col", { style: { width: 40 } }),
					_.map((e) => /* @__PURE__ */ b("col", { style: { width: e.width } }, e.id))
				] }),
				/* @__PURE__ */ b("thead", { children: /* @__PURE__ */ x("tr", {
					className: "border-b border-border",
					children: [
						e.showCheckboxes && /* @__PURE__ */ b("th", {
							className: "h-10 border-b border-border bg-muted px-3 text-start",
							style: {
								position: "sticky",
								insetInlineStart: 0,
								zIndex: 30
							},
							children: /* @__PURE__ */ b("input", { ...e.getSelectAllProps(t.selectAll) })
						}),
						e.hasExpandableRows && /* @__PURE__ */ b("th", {
							className: "h-10 border-b border-border bg-muted",
							style: {
								position: "sticky",
								insetInlineStart: e.showCheckboxes ? 40 : 0,
								zIndex: 30
							},
							children: t.detailsColumn && /* @__PURE__ */ b("span", {
								className: "sr-only",
								children: t.detailsColumn
							})
						}),
						_.map((n, r) => {
							let a = e.columns.find((e) => e.id === n.id);
							return /* @__PURE__ */ b(Po, {
								grid: e,
								column: a,
								layout: n,
								labels: t,
								isFirst: r === 0,
								isLast: r === _.length - 1,
								dragOver: p === n.id,
								onHeaderPointerDown: F,
								shouldIgnoreClick: () => N.current,
								onAutosize: () => ie(n.id),
								onMove: (e) => ae(n.id, e),
								filterOpen: h === n.id,
								onFilterOpenChange: (e) => g(e ? n.id : null),
								renderFilter: i
							}, n.id);
						})
					]
				}) }),
				ne > 0 && /* @__PURE__ */ b("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ b("tr", { style: { height: ne } })
				}),
				I && Array.from({ length: 5 }, (e, t) => /* @__PURE__ */ b("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ b("tr", {
						"data-skeleton": "",
						children: Array.from({ length: y }, (e, t) => /* @__PURE__ */ b("td", {
							className: "border-b border-border px-3 py-3",
							children: /* @__PURE__ */ b("span", { className: "block h-3 w-3/4 animate-pulse rounded bg-muted" })
						}, t))
					})
				}, `s${t}`)),
				o && /* @__PURE__ */ b("tbody", { children: /* @__PURE__ */ b("tr", { children: /* @__PURE__ */ b("td", {
					colSpan: y,
					className: "px-4 py-10",
					children: /* @__PURE__ */ x("div", {
						role: "alert",
						className: "flex flex-col items-center gap-2 text-center",
						children: [
							/* @__PURE__ */ b("p", {
								className: "font-medium",
								children: t.errorTitle
							}),
							/* @__PURE__ */ b("p", {
								className: "text-sm text-muted-foreground",
								children: o
							}),
							s && /* @__PURE__ */ b(Z, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: s,
								children: t.retry
							})
						]
					})
				}) }) }),
				L && /* @__PURE__ */ b("tbody", { children: /* @__PURE__ */ b("tr", { children: /* @__PURE__ */ b("td", {
					colSpan: y,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: c ?? t.empty
				}) }) }),
				!o && k.map(({ index: n, line: i }) => /* @__PURE__ */ b("tbody", {
					"data-index": n,
					ref: ee ? E.measureElement : void 0,
					children: i.kind === "group" ? /* @__PURE__ */ b(Io, {
						grid: e,
						group: i.group,
						labels: t
					}) : /* @__PURE__ */ b(Lo, {
						grid: e,
						row: i.row,
						id: i.id,
						depth: i.depth,
						name: C(i.row),
						labels: t,
						detailId: `${d}-detail-${String(i.id)}`,
						renderDetail: r,
						colSpan: y
					})
				}, i.kind === "group" ? `g:${i.group.key}` : `r:${String(i.id)}`)),
				re > 0 && /* @__PURE__ */ b("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ b("tr", { style: { height: re } })
				})
			]
		})]
	});
}
function Po({ grid: e, column: t, layout: n, labels: r, isFirst: i, isLast: a, dragOver: o, onHeaderPointerDown: s, shouldIgnoreClick: c, onAutosize: l, onMove: u, filterOpen: d, onFilterOpenChange: f, renderFilter: p }) {
	let m = t.sortable !== !1, h = e.sorting.findIndex((e) => e.id === t.id), g = h >= 0 ? e.sorting[h] : void 0, _ = e.filters.some((e) => e.id === t.id), v = g ? g.desc ? ie : N : ae, S = e.groupBy.includes(t.id), C = A(!1);
	return /* @__PURE__ */ x("th", {
		"data-col": t.id,
		"aria-sort": m ? g ? g.desc ? "descending" : "ascending" : "none" : void 0,
		style: {
			width: n.width,
			...Mo(n, !0)
		},
		onPointerDown: (e) => s(e, t.id),
		className: q("group/th relative border-b border-border bg-muted px-2 text-start align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase select-none", e.preferences.values.density === "compact" ? "h-8" : "h-10", !a && "border-e", o && "bg-accent", n.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", t.align === "right" && "text-end"),
		children: [/* @__PURE__ */ x(la, {
			open: d,
			onOpenChange: f,
			children: [/* @__PURE__ */ b(da, {
				asChild: !0,
				children: /* @__PURE__ */ x("div", {
					className: q("flex min-w-0 items-center gap-0.5", t.align === "right" && "flex-row-reverse"),
					children: [
						m ? /* @__PURE__ */ x("button", {
							type: "button",
							onClick: (n) => {
								c() || e.toggleSort(t.id, n.shiftKey);
							},
							className: "flex min-w-0 items-center gap-1 rounded px-1 py-1 uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
							children: [
								/* @__PURE__ */ b("span", {
									"data-cell-content": !0,
									className: "truncate",
									children: t.header
								}),
								/* @__PURE__ */ b(v, {
									"aria-hidden": "true",
									className: q("size-3.5 shrink-0", !g && "opacity-0 group-hover/th:opacity-60")
								}),
								g && e.sorting.length > 1 && /* @__PURE__ */ b("span", {
									"aria-hidden": "true",
									className: "text-[10px] tabular-nums",
									children: h + 1
								})
							]
						}) : /* @__PURE__ */ b("span", {
							"data-cell-content": !0,
							className: "truncate px-1",
							children: t.header
						}),
						_ && /* @__PURE__ */ b(U, {
							"aria-hidden": "true",
							className: "size-3 shrink-0 text-foreground"
						}),
						/* @__PURE__ */ x(Xi, { children: [/* @__PURE__ */ b(Zi, {
							asChild: !0,
							children: /* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon-xs",
								"aria-label": r.columnMenu(t.header),
								className: "ms-auto shrink-0 text-muted-foreground opacity-60 group-hover/th:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
								children: /* @__PURE__ */ b(fe, { "aria-hidden": "true" })
							})
						}), /* @__PURE__ */ x($i, {
							align: "start",
							className: "normal-case",
							onCloseAutoFocus: (e) => {
								C.current && (C.current = !1, e.preventDefault(), f(!0));
							},
							children: [
								m && /* @__PURE__ */ x(y, { children: [
									/* @__PURE__ */ b(Q, {
										onSelect: () => e.setSorting([{
											id: t.id,
											desc: !1
										}]),
										children: r.sortAscending
									}),
									/* @__PURE__ */ b(Q, {
										onSelect: () => e.setSorting([{
											id: t.id,
											desc: !0
										}]),
										children: r.sortDescending
									}),
									g && /* @__PURE__ */ b(Q, {
										onSelect: () => e.setSorting(e.sorting.filter((e) => e.id !== t.id)),
										children: r.clearSort
									}),
									/* @__PURE__ */ b($, {})
								] }),
								t.filter && p && /* @__PURE__ */ b(Q, {
									onSelect: () => C.current = !0,
									children: r.filter
								}),
								t.groupable && e.canGroup && /* @__PURE__ */ b(Q, {
									onSelect: () => e.setGroupBy(S ? e.groupBy.filter((e) => e !== t.id) : [...e.groupBy, t.id]),
									children: S ? r.ungroup : r.groupBy
								}),
								n.pinned !== "left" && /* @__PURE__ */ b(Q, {
									onSelect: () => e.pinColumn(t.id, "left"),
									children: r.pinLeft
								}),
								n.pinned !== "right" && /* @__PURE__ */ b(Q, {
									onSelect: () => e.pinColumn(t.id, "right"),
									children: r.pinRight
								}),
								n.pinned && /* @__PURE__ */ b(Q, {
									onSelect: () => e.pinColumn(t.id, null),
									children: r.unpin
								}),
								/* @__PURE__ */ b($, {}),
								!i && /* @__PURE__ */ b(Q, {
									onSelect: () => u(-1),
									children: r.moveLeft
								}),
								!a && /* @__PURE__ */ b(Q, {
									onSelect: () => u(1),
									children: r.moveRight
								}),
								/* @__PURE__ */ b(Q, {
									onSelect: l,
									children: r.autosize
								}),
								t.hideable !== !1 && /* @__PURE__ */ b(Q, {
									onSelect: () => e.preferences.setColumnVisible(t.id, !1),
									children: r.hide
								})
							]
						})] })
					]
				})
			}), p && t.filter && /* @__PURE__ */ b(fa, {
				align: "start",
				className: "w-72 tracking-normal normal-case",
				children: p(t, () => f(!1))
			})]
		}), /* @__PURE__ */ b(Fo, {
			grid: e,
			column: t,
			layout: n,
			labels: r,
			onAutosize: l
		})]
	});
}
function Fo({ grid: e, column: t, layout: n, labels: r, onAutosize: i }) {
	let a = A(null), o = t.minWidth ?? 64, s = t.maxWidth ?? 640;
	return /* @__PURE__ */ b("div", {
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
			let t = $e(e.currentTarget);
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
			let a = r.shiftKey ? Ao : ko, { forward: c, back: l } = et(r.currentTarget), u = {
				[c]: () => n.width + a,
				[l]: () => n.width - a,
				Home: () => o,
				End: () => s
			};
			if (r.key === "Enter") {
				r.preventDefault(), i();
				return;
			}
			let d = u[r.key];
			d && (r.preventDefault(), r.stopPropagation(), e.setColumnWidth(t.id, Math.min(s, Math.max(o, d()))));
		},
		onClick: (e) => e.stopPropagation(),
		className: "group/rs absolute inset-y-0 -end-1 z-10 w-2 cursor-col-resize outline-none",
		children: /* @__PURE__ */ b("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-1 left-1/2 w-0.5 -translate-x-1/2 rounded bg-transparent transition-colors group-hover/rs:bg-ring group-focus-visible/rs:bg-ring"
		})
	});
}
function Io({ grid: e, group: t, labels: n }) {
	let r = e.isGroupExpanded(t.key), i = e.columns.find((e) => e.id === t.columnId), a = t.value === null ? n.emptyGroupValue : String(t.value), o = r ? L : R, s = +!!e.showCheckboxes + +!!e.hasExpandableRows;
	return /* @__PURE__ */ x("tr", {
		"data-grid-group": t.key,
		className: "bg-muted/40",
		children: [s > 0 && /* @__PURE__ */ b("td", {
			role: "gridcell",
			colSpan: s,
			className: "border-b border-border"
		}), e.layout.map((s, c) => {
			let l = e.columns.find((e) => e.id === s.id), u = t.aggregates[s.id];
			return /* @__PURE__ */ b("td", {
				role: "gridcell",
				"data-col": s.id,
				style: Mo(s),
				className: q("border-b border-border px-3 py-2 text-sm font-medium", s.pinned && "bg-muted", l.align === "right" && "text-end tabular-nums"),
				children: c === 0 ? /* @__PURE__ */ x("button", {
					type: "button",
					"aria-expanded": r,
					onClick: () => e.toggleGroup(t.key),
					style: { paddingInlineStart: t.depth * 16 },
					className: "flex max-w-full items-center gap-1 rounded text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
					children: [/* @__PURE__ */ b(o, {
						"aria-hidden": "true",
						className: "size-4 shrink-0 rtl:rotate-180"
					}), /* @__PURE__ */ b("span", {
						className: "truncate",
						children: n.group(i?.header ?? t.columnId, a, t.rows.length)
					})]
				}) : u === void 0 ? null : l.formatAggregate?.(u) ?? u.toLocaleString()
			}, s.id);
		})]
	});
}
function Lo({ grid: e, row: t, id: n, depth: r, name: i, labels: a, detailId: o, renderDetail: s, colSpan: c }) {
	let l = e.getRowProps(n), u = e.canExpand(t), d = e.isRowExpanded(n), f = "border-b border-border px-3 bg-card in-data-[state=selected]:bg-muted";
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("tr", {
		...l,
		className: q("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", "[&>td:not(:last-child)]:border-e", l.className),
		children: [
			e.showCheckboxes && /* @__PURE__ */ b("td", {
				role: "gridcell",
				className: f,
				style: {
					position: "sticky",
					insetInlineStart: 0,
					zIndex: 10
				},
				children: /* @__PURE__ */ b("input", { ...e.getRowCheckboxProps(n, a.selectRow(i)) })
			}),
			e.hasExpandableRows && /* @__PURE__ */ b("td", {
				role: "gridcell",
				className: q(f, "px-1"),
				style: {
					position: "sticky",
					insetInlineStart: e.showCheckboxes ? 40 : 0,
					zIndex: 10
				},
				children: u && /* @__PURE__ */ b(Z, {
					variant: "ghost",
					size: "icon-sm",
					"aria-label": d ? a.collapse(i) : a.expand(i),
					"aria-expanded": d,
					"aria-controls": o,
					onClick: () => e.toggleRowExpanded(n),
					className: "text-muted-foreground",
					children: /* @__PURE__ */ b(R, {
						"aria-hidden": "true",
						className: q("transition-transform rtl:rotate-180", d && "rotate-90 rtl:rotate-90")
					})
				})
			}),
			e.layout.map((i, o) => {
				let s = e.columns.find((e) => e.id === i.id);
				return /* @__PURE__ */ b(Ro, {
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
	}), u && d && /* @__PURE__ */ b("tr", {
		id: o,
		"data-grid-detail": "",
		children: /* @__PURE__ */ b("td", {
			colSpan: c,
			className: "border-b border-border bg-muted/30 p-0",
			children: s?.(t)
		})
	})] });
}
function Ro({ grid: e, row: t, rowId: n, column: r, layout: i, labels: a, indent: o }) {
	let s = e.cellValue(t, r.id), c = s !== Rt(r, t) && !r.value ? {
		...t,
		[r.id]: s
	} : t, l = r.cell ? r.cell(c) : s == null ? "" : String(s), u = typeof l == "string" ? l : s == null ? "" : String(s), d = e.editing?.rowId === n && e.editing.columnId === r.id;
	return /* @__PURE__ */ b("td", {
		role: "gridcell",
		"data-col": r.id,
		style: {
			...Mo(i),
			paddingInlineStart: o ? o + 12 : void 0
		},
		className: q("truncate border-b border-border px-3 align-middle", e.preferences.values.density === "compact" ? "py-1.5" : "py-3", i.pinned && "bg-card in-data-[state=selected]:bg-muted", i.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", r.align === "right" && "text-end tabular-nums"),
		children: d ? /* @__PURE__ */ b(zo, {
			grid: e,
			column: r,
			value: s,
			labels: a
		}) : r.editable ? /* @__PURE__ */ b("button", {
			type: "button",
			"aria-label": a.edit(r.header, u),
			onClick: () => e.startEdit(n, r.id),
			className: q("-mx-1 block w-full truncate rounded px-1 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", r.align === "right" && "text-end"),
			children: /* @__PURE__ */ b("span", {
				"data-cell-content": !0,
				children: l
			})
		}) : /* @__PURE__ */ b("span", {
			"data-cell-content": !0,
			children: l
		})
	});
}
function zo({ grid: e, column: t, value: n, labels: r }) {
	let i = t.editable, a = D(), [o, s] = j(n == null ? "" : String(n)), c = A(null);
	E(() => {
		c.current?.focus(), c.current instanceof HTMLInputElement && c.current.select();
	}, []);
	let l = (e) => i.type === "number" ? Number(e) : e, u = () => {
		if (o === String(n ?? "")) {
			e.cancelEdit();
			return;
		}
		e.commitEdit(l(o));
	}, d = {
		"aria-label": t.header,
		"aria-invalid": e.editError ? !0 : void 0,
		"aria-describedby": e.editError ? a : void 0,
		disabled: e.editPending,
		onKeyDown: (t) => {
			t.key === "Enter" ? (t.preventDefault(), u()) : t.key === "Escape" && (t.preventDefault(), t.stopPropagation(), e.cancelEdit());
		},
		className: "h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
	};
	return /* @__PURE__ */ x("div", {
		className: "relative",
		children: [
			i.type === "choice" ? /* @__PURE__ */ b("select", {
				ref: c,
				value: o,
				onChange: (e) => s(e.target.value),
				onBlur: u,
				...d,
				children: (i.options ?? []).map((e) => /* @__PURE__ */ b("option", {
					value: e.value,
					children: e.label
				}, e.value))
			}) : /* @__PURE__ */ b("input", {
				ref: c,
				type: i.type === "number" ? "number" : "text",
				value: o,
				onChange: (e) => s(e.target.value),
				onBlur: u,
				...d
			}),
			e.editPending && /* @__PURE__ */ b("span", {
				className: "sr-only",
				children: r.saving
			}),
			e.editError && /* @__PURE__ */ b("p", {
				id: a,
				className: "absolute top-full z-20 mt-1 rounded-md bg-destructive px-2 py-1 text-xs whitespace-normal text-destructive-foreground shadow-md",
				children: e.editError
			})
		]
	});
}
//#endregion
//#region src/organisms/Sidebar/Sidebar.tsx
var Bo = 16, Vo = 64;
function Ho({ label: e, side: t = "left", resize: n, defaultWidth: r = 280, className: i, children: a }) {
	let o = An({
		storageKey: n?.storageKey,
		defaultWidth: r,
		minWidth: n?.minWidth ?? 200,
		maxWidth: n?.maxWidth ?? 560
	}), s = n ? o.width : r;
	return /* @__PURE__ */ x("aside", {
		"aria-label": e,
		"data-side": t,
		style: { width: s },
		className: q("relative flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground", t === "left" ? "border-e border-sidebar-border" : "border-s border-sidebar-border", i),
		children: [a, n && /* @__PURE__ */ b(Uo, {
			side: t,
			label: n.label,
			size: o
		})]
	});
}
function Uo({ side: e, label: t, size: n }) {
	let r = A(null), i = (t) => e === "left" === $e(t) ? -1 : 1, a = (e) => {
		e.button === 0 && (e.preventDefault(), e.currentTarget.setPointerCapture?.(e.pointerId), r.current = {
			x: e.clientX,
			width: n.width,
			grow: i(e.currentTarget)
		}, document.body.style.setProperty("cursor", "col-resize"), document.body.style.setProperty("user-select", "none"));
	}, o = (e) => {
		r.current && n.setWidth(r.current.width + (e.clientX - r.current.x) * r.current.grow);
	}, s = () => {
		r.current = null, document.body.style.removeProperty("cursor"), document.body.style.removeProperty("user-select");
	};
	return /* @__PURE__ */ b("div", {
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
			let t = e.shiftKey ? Vo : Bo, r = i(e.currentTarget), a = {
				ArrowRight: () => n.setWidth(n.width + t * r),
				ArrowLeft: () => n.setWidth(n.width - t * r),
				Home: () => n.setWidth(n.minWidth),
				End: () => n.setWidth(n.maxWidth),
				Enter: () => n.reset()
			}[e.key];
			a && (e.preventDefault(), a());
		},
		className: q("group absolute inset-y-0 z-20 w-2 cursor-col-resize outline-none", e === "left" ? "-end-1" : "-start-1"),
		children: /* @__PURE__ */ b("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors group-hover:bg-ring group-focus-visible:bg-ring group-active:bg-ring"
		})
	});
}
function Wo({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: q("flex shrink-0 flex-col gap-2 p-3", e),
		...t
	});
}
function Go({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: q("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2", e),
		...t
	});
}
function Ko({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: q("flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3", e),
		...t
	});
}
function qo({ label: e, children: t, className: n }) {
	return /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": e,
		className: q("flex flex-col gap-0.5", n),
		children: [e && /* @__PURE__ */ b("div", {
			"aria-hidden": "true",
			className: "px-2 pb-1 text-xs font-medium text-muted-foreground",
			children: e
		}), t]
	});
}
function Jo({ className: e, ...t }) {
	return /* @__PURE__ */ b("ul", {
		className: q("flex flex-col gap-0.5", e),
		...t
	});
}
function Yo(e) {
	return /* @__PURE__ */ b("li", { ...e });
}
function Xo({ asChild: e = !1, active: t = !1, className: n, ...r }) {
	let i = e ? h.Root : "button";
	return /* @__PURE__ */ b(i, {
		"data-active": t,
		"aria-current": t ? "page" : void 0,
		className: q("flex h-8 w-full items-center gap-2 rounded-md px-2 text-start text-sm transition-colors outline-none", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "focus-visible:ring-2 focus-visible:ring-sidebar-ring", "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground", "[&_svg]:size-4 [&_svg]:shrink-0", n),
		...e ? {} : { type: "button" },
		...r
	});
}
//#endregion
//#region src/organisms/FolderSidebar/FolderSidebar.tsx
function Zo({ title: e, resize: t, all: n, none: r, scope: i, onScopeChange: a, tree: o, treeKey: s, formatCount: c = String, children: l }) {
	let u = (e, { label: t, count: n, icon: r }, o) => /* @__PURE__ */ b(Yo, { children: /* @__PURE__ */ x(Xo, {
		active: i?.kind === e,
		onClick: () => a({ kind: e }),
		children: [
			r ?? o,
			/* @__PURE__ */ b("span", {
				className: "flex-1",
				children: t
			}),
			n !== void 0 && /* @__PURE__ */ b("span", {
				className: "text-xs text-muted-foreground tabular-nums",
				children: c(n)
			})
		]
	}) });
	return /* @__PURE__ */ x(Ho, {
		label: e,
		resize: t,
		children: [/* @__PURE__ */ b(Wo, { children: /* @__PURE__ */ b("div", {
			className: "px-2 text-lg font-semibold tracking-tight",
			children: e
		}) }), /* @__PURE__ */ x(Go, { children: [
			/* @__PURE__ */ b(qo, { children: /* @__PURE__ */ x(Jo, { children: [u("all", n, /* @__PURE__ */ b(ye, { "aria-hidden": "true" })), r && u("none", r, /* @__PURE__ */ b(ue, { "aria-hidden": "true" }))] }) }),
			/* @__PURE__ */ b(yo, {
				...o,
				selectedId: i?.kind === "folder" ? i.id : null,
				onSelect: (e) => a(e === null ? { kind: "all" } : {
					kind: "folder",
					id: e
				})
			}, s),
			l
		] })]
	});
}
//#endregion
//#region src/organisms/GridActions/GridActions.tsx
function Qo(e) {
	if (e) return e.replace(/\bMod\b/g, Mt() ? "Meta" : "Control");
}
var $o = 4;
function es({ label: e, items: t = [], selectedIds: n = [], shortcutLabels: r, moreLabel: i, children: a }) {
	let o = jt(t, kt(n.length)), s = o.flat(), c = A(null), l = A(null), [u, d] = j(null);
	O(() => {
		let e = c.current;
		if (!e || !i) return;
		let t = new ResizeObserver(() => {
			let t = e.getBoundingClientRect().width, n = e.querySelector("button")?.getBoundingClientRect().width;
			if (!t) return d(null);
			d((e) => ({
				bar: t,
				lead: l.current?.getBoundingClientRect().width ?? 0,
				button: n || e?.button || 32
			}));
		});
		return t.observe(e), l.current && t.observe(l.current), () => t.disconnect();
	}, [i]);
	let f = s.length;
	if (u && i) {
		let e = u.bar - (u.lead ? u.lead + $o : 0), t = u.button + $o;
		s.length * t - $o > e && (f = Math.max(0, Math.floor((e + $o) / t) - 1));
	}
	let [p, m] = j(null);
	p !== null && (f = p);
	let h = new Set(s.slice(0, f).map((e) => e.id)), g = o.map((e) => e.filter((e) => !h.has(e.id))).filter((e) => e.length > 0);
	return /* @__PURE__ */ x("div", {
		ref: c,
		role: "toolbar",
		"aria-label": e,
		className: "flex min-w-0 flex-1 items-center gap-1",
		children: [
			/* @__PURE__ */ b("div", {
				ref: l,
				className: "flex shrink-0 items-center gap-1 empty:hidden",
				children: a
			}),
			s.filter((e) => h.has(e.id)).map((e) => /* @__PURE__ */ b(ts, {
				item: e,
				ids: n,
				shortcutLabels: r
			}, e.id)),
			i && g.length > 0 && /* @__PURE__ */ x(Xi, {
				onOpenChange: (e) => m(e ? f : null),
				children: [/* @__PURE__ */ b(Zi, {
					asChild: !0,
					children: /* @__PURE__ */ b(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": i,
						tooltip: i,
						className: "shrink-0 text-muted-foreground",
						children: /* @__PURE__ */ b(fe, { "aria-hidden": "true" })
					})
				}), /* @__PURE__ */ b($i, {
					align: "start",
					className: "w-60",
					children: g.map((e, t) => /* @__PURE__ */ x(C, { children: [t > 0 && /* @__PURE__ */ b($, {}), e.map((e) => /* @__PURE__ */ x(Q, {
						disabled: At(e, n),
						"aria-keyshortcuts": Qo(e.shortcut),
						onSelect: () => e.onSelect(n),
						className: q(e.tone === "destructive" && "data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground data-[highlighted]:[&_svg]:text-destructive-foreground"),
						children: [
							/* @__PURE__ */ b("span", {
								className: "text-muted-foreground [&_svg]:size-4",
								children: e.icon
							}),
							e.label,
							e.shortcut && /* @__PURE__ */ b(oa, { children: Lt(e.shortcut, r) })
						]
					}, e.id))] }, e[0].id))
				})]
			})
		]
	});
}
function ts({ item: e, ids: t, shortcutLabels: n }) {
	let r = At(e, t), i = r ? e.disabledReason : void 0, a = /* @__PURE__ */ x("span", {
		className: "flex flex-col gap-0.5",
		children: [/* @__PURE__ */ x("span", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ b("span", {
				className: "font-medium",
				children: e.label
			}), e.shortcut && /* @__PURE__ */ b("kbd", {
				className: "ms-auto font-sans text-muted-foreground",
				children: Lt(e.shortcut, n)
			})]
		}), i && /* @__PURE__ */ b("span", {
			className: "text-muted-foreground",
			children: i
		})]
	});
	return /* @__PURE__ */ b(Z, {
		variant: e.tone === "primary" ? "default" : "ghost",
		size: "icon",
		"aria-label": e.label,
		"aria-keyshortcuts": Qo(e.shortcut),
		tooltip: a,
		disabled: r,
		onClick: () => e.onSelect(t),
		className: q(e.tone !== "primary" && "text-muted-foreground", e.tone === "destructive" && "hover:bg-destructive hover:text-destructive-foreground"),
		children: e.icon
	});
}
function ns({ items: e, ids: t, shortcutLabels: n }) {
	return /* @__PURE__ */ b(y, { children: e.map((e, r) => /* @__PURE__ */ x(C, { children: [r > 0 && /* @__PURE__ */ b(qi, {}), e.map((e) => {
		let r = At(e, t);
		return /* @__PURE__ */ x(Ki, {
			tone: e.tone === "destructive" ? "destructive" : "default",
			disabled: r,
			"aria-keyshortcuts": Qo(e.shortcut),
			onSelect: () => e.onSelect(t),
			children: [
				e.icon,
				/* @__PURE__ */ x("span", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ b("span", {
						className: q(e.isDefault && "font-semibold"),
						children: e.label
					}), r && e.disabledReason && /* @__PURE__ */ b("span", {
						className: "text-xs text-muted-foreground",
						children: e.disabledReason
					})]
				}),
				e.shortcut && /* @__PURE__ */ b(Yi, { children: Lt(e.shortcut, n) })
			]
		}, e.id);
	})] }, e[0]?.id)) });
}
//#endregion
//#region src/organisms/LiveCanvas/LiveCanvas.tsx
var rs = w(null), is = (e, t) => `${e}-${t.replace(/[^A-Za-z0-9_-]/g, "_")}`;
function as({ label: e, selected: t, onSelect: n, caption: r, artboardStyle: i, artboardClassName: a, dark: o = !1, pending: s = !1, children: c }) {
	let l = D(), [u, d] = j(null), f = A(null), p = () => Array.from(f.current?.querySelectorAll("[role=option]") ?? []), m = u ?? t;
	return /* @__PURE__ */ b(rs.Provider, {
		value: {
			baseId: l,
			selected: t,
			active: m,
			select: n,
			setActive: d
		},
		children: /* @__PURE__ */ x("div", {
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted p-8",
			children: [r && /* @__PURE__ */ b("p", {
				className: "mx-auto mb-2 w-full max-w-4xl text-xs font-medium text-muted-foreground",
				children: r
			}), /* @__PURE__ */ b("div", {
				role: "presentation",
				onClick: () => n(null),
				style: i,
				className: q("theme-scope mx-auto w-full max-w-4xl rounded-xl border border-border bg-background p-8 text-foreground shadow-sm transition-opacity", o && "dark", s && "opacity-60", a),
				children: /* @__PURE__ */ b("div", {
					ref: f,
					role: "listbox",
					"aria-label": e,
					tabIndex: 0,
					"aria-activedescendant": m ? is(l, m) : void 0,
					onKeyDown: (e) => {
						let r = p();
						if (r.length === 0) return;
						let i = r.findIndex((e) => e.dataset.target === m), a = (t) => {
							e.preventDefault();
							let n = r[(t + r.length) % r.length];
							n?.dataset.target && (d(n.dataset.target), n.scrollIntoView?.({
								block: "nearest",
								inline: "nearest"
							}));
						}, { forward: o } = et(e.currentTarget);
						switch (e.key === "ArrowLeft" || e.key === "ArrowRight" ? e.key === o ? "next" : "prev" : e.key) {
							case "ArrowDown":
							case "next": return a(i < 0 ? 0 : i + 1);
							case "ArrowUp":
							case "prev": return a(i < 0 ? r.length - 1 : i - 1);
							case "Home": return a(0);
							case "End": return a(r.length - 1);
							case "Enter":
							case " ":
								e.preventDefault(), m !== null && n(m === t ? null : m);
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
function os({ id: e, label: t, wide: n = !1, children: r }) {
	let i = te(rs);
	if (!i) throw Error("LiveCanvasTarget must be inside a LiveCanvas");
	let a = i.selected === e, o = i.active === e;
	return /* @__PURE__ */ x("div", {
		id: is(i.baseId, e),
		tabIndex: -1,
		role: "option",
		"aria-selected": a,
		"aria-label": t,
		"data-target": e,
		"data-active": o || void 0,
		onClick: (t) => {
			t.stopPropagation(), i.setActive(e), i.select(a ? null : e);
		},
		className: q("relative cursor-pointer rounded-md outline-offset-4 transition-[outline-color]", n ? "w-full" : "w-fit", a ? "outline-2 outline-ring outline-solid" : "outline-1 outline-ring/25 outline-dashed hover:outline-ring/70", !a && o && "outline-2 outline-ring/70"),
		children: [a && /* @__PURE__ */ b("span", {
			"aria-hidden": "true",
			className: "absolute start-0 -top-6 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary-foreground",
			children: t
		}), /* @__PURE__ */ b("div", {
			inert: !0,
			children: r
		})]
	});
}
function ss({ caption: e, children: t }) {
	return /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": e,
		className: "space-y-3",
		children: [/* @__PURE__ */ b("p", {
			"aria-hidden": "true",
			className: "text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase",
			children: e
		}), t]
	});
}
//#endregion
//#region src/organisms/PageViewer/PageViewer.tsx
function cs({ src: e, srcDoc: t, title: n, deviceWidth: r, interactive: i = !1, timeoutMs: a = 1e4, labels: o, overlay: s, onStatusChange: c, className: l }) {
	let { ref: u, available: d, scale: f } = Mn(r), [p, m] = j(!1), [h, g] = j("idle"), [_, v] = j(0), y = A(null);
	E(() => {
		let e = y.current;
		if (!e || typeof IntersectionObserver > "u") {
			m(!0);
			return;
		}
		let t = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && (m(!0), t.disconnect());
		}, { rootMargin: "200px" });
		return t.observe(e), () => t.disconnect();
	}, []);
	let S = p ? h === "idle" ? "loading" : h : "waiting";
	return E(() => {
		c?.(S);
	}, [S, c]), E(() => {
		if (S !== "loading") return;
		let e = window.setTimeout(() => g("failed"), a);
		return () => window.clearTimeout(e);
	}, [
		S,
		a,
		_
	]), /* @__PURE__ */ x("div", {
		ref: (e) => {
			y.current = e, u.current = e;
		},
		"data-status": S,
		className: q("relative min-h-0 overflow-hidden rounded-lg border border-border bg-background", l),
		children: [S === "failed" ? /* @__PURE__ */ x("div", {
			role: "alert",
			className: "flex h-full flex-col items-center justify-center gap-3 p-4 text-center",
			children: [
				/* @__PURE__ */ b("p", {
					className: "text-sm font-semibold",
					children: o.failedTitle
				}),
				/* @__PURE__ */ b("p", {
					className: "text-xs text-muted-foreground",
					children: o.failedBody
				}),
				/* @__PURE__ */ b(Z, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => {
						g("idle"), v((e) => e + 1);
					},
					children: o.retry
				})
			]
		}) : p && /* @__PURE__ */ x("div", {
			className: "relative origin-top-left",
			style: {
				width: r,
				height: d === null ? "100%" : d.height / f,
				transform: `scale(${f})`
			},
			children: [/* @__PURE__ */ b("iframe", {
				src: e,
				srcDoc: t,
				title: n,
				loading: "lazy",
				inert: !i || void 0,
				onLoad: () => g((e) => e === "idle" ? "loaded" : e),
				className: "h-full w-full border-0 bg-background"
			}, _), s !== void 0 && /* @__PURE__ */ b("div", {
				className: "pointer-events-none absolute inset-0",
				children: s
			})]
		}), S === "loading" && /* @__PURE__ */ b("div", {
			role: "status",
			className: "pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-xs text-muted-foreground",
			children: o.loading
		})]
	});
}
//#endregion
//#region src/organisms/Sheet/Sheet.tsx
function ls({ ...e }) {
	return /* @__PURE__ */ b(s.Root, {
		"data-slot": "sheet",
		...e
	});
}
var us = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(s.Trigger, {
		ref: t,
		"data-slot": "sheet-trigger",
		...e
	});
});
us.displayName = "SheetTrigger";
var ds = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(s.Close, {
		ref: t,
		"data-slot": "sheet-close",
		...e
	});
});
ds.displayName = "SheetClose";
function fs({ ...e }) {
	return /* @__PURE__ */ b(s.Portal, {
		"data-slot": "sheet-portal",
		...e
	});
}
var ps = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Overlay, {
		ref: n,
		"data-slot": "sheet-overlay",
		className: q("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
ps.displayName = "SheetOverlay";
var ms = {
	left: "inset-y-0 start-0 h-full w-72 max-w-[85vw] border-e data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start",
	right: "inset-y-0 end-0 h-full w-72 max-w-[85vw] border-s data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end",
	bottom: "inset-x-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl border-t pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
	top: "inset-x-0 top-0 w-full max-h-[90vh] rounded-b-2xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
};
function hs({ className: e }) {
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: q("mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30", e)
	});
}
var gs = S.forwardRef(function({ className: e, children: t, side: n = "left", showClose: r = !0, closeLabel: i, showHandle: a = !1, ...o }, c) {
	return /* @__PURE__ */ x(fs, { children: [/* @__PURE__ */ b(ps, {}), /* @__PURE__ */ x(s.Content, {
		ref: c,
		"data-slot": "sheet-content",
		className: q("fixed z-50 flex flex-col gap-4 overflow-y-auto border-border bg-card text-card-foreground shadow-lg transition ease-[var(--motion-ease,cubic-bezier(0.4,0,0.2,1))] data-[state=closed]:animate-out data-[state=closed]:duration-[var(--motion-duration,200ms)] data-[state=open]:animate-in data-[state=open]:duration-[var(--motion-duration,300ms)]", ms[n], e),
		...o,
		children: [
			a && /* @__PURE__ */ b(hs, {}),
			t,
			r && /* @__PURE__ */ b(s.Close, {
				"aria-label": i,
				className: "absolute end-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
				children: /* @__PURE__ */ b(K, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				})
			})
		]
	})] });
});
gs.displayName = "SheetContent";
var _s = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Title, {
		ref: n,
		"data-slot": "sheet-title",
		className: q("text-lg font-semibold text-foreground", e),
		...t
	});
});
_s.displayName = "SheetTitle";
var vs = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Description, {
		ref: n,
		"data-slot": "sheet-description",
		className: q("text-sm text-muted-foreground", e),
		...t
	});
});
vs.displayName = "SheetDescription";
//#endregion
//#region src/organisms/Table/Table.tsx
function ys({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ b("table", {
			"data-slot": "table",
			className: q("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function bs({ className: e, ...t }) {
	return /* @__PURE__ */ b("thead", {
		"data-slot": "table-header",
		className: q("[&_tr]:border-b [&_tr]:border-border", e),
		...t
	});
}
function xs({ className: e, ...t }) {
	return /* @__PURE__ */ b("tbody", {
		"data-slot": "table-body",
		className: q("[&_tr:last-child]:border-0", e),
		...t
	});
}
function Ss({ className: e, ...t }) {
	return /* @__PURE__ */ b("tfoot", {
		"data-slot": "table-footer",
		className: q("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", e),
		...t
	});
}
function Cs({ className: e, ...t }) {
	return /* @__PURE__ */ b("tr", {
		"data-slot": "table-row",
		className: q("border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function ws({ className: e, ...t }) {
	return /* @__PURE__ */ b("th", {
		"data-slot": "table-head",
		className: q("h-10 px-3 text-start align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase [&:has([role=checkbox])]:pe-0", e),
		...t
	});
}
function Ts({ className: e, ...t }) {
	return /* @__PURE__ */ b("td", {
		"data-slot": "table-cell",
		className: q("p-3 align-middle [&:has([role=checkbox])]:pe-0", e),
		...t
	});
}
function Es({ className: e, ...t }) {
	return /* @__PURE__ */ b("caption", {
		"data-slot": "table-caption",
		className: q("mt-4 text-sm text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/organisms/ThreadList/ThreadList.tsx
function Ds(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleString(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	});
}
var Os = "flex w-full flex-col gap-0.5 rounded-lg px-3 py-3 text-start transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted";
function ks({ threads: e, labels: t, activeId: n = null, onOpen: r, as: i, formatTime: a = Ds, className: o }) {
	return e.length === 0 ? /* @__PURE__ */ b("p", {
		className: q("px-6 py-10 text-center text-sm text-muted-foreground", o),
		children: t.empty
	}) : /* @__PURE__ */ b("ul", {
		"aria-label": t.list,
		className: q("flex flex-col gap-0.5", o),
		children: e.map((e) => {
			let o = n !== null && e.id === n, s = {
				"data-active": o,
				"aria-current": o ? "true" : void 0,
				className: Os,
				onClick: () => r?.(e.id)
			}, c = e.href === void 0 ? "button" : i ?? "a", l = e.href === void 0 ? { type: "button" } : { href: e.href };
			return /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x(c, {
				...s,
				...l,
				children: [
					/* @__PURE__ */ x("span", {
						className: "flex w-full items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ x("span", {
							className: q("flex min-w-0 items-center gap-2 text-sm text-foreground", e.unread ? "font-semibold" : "font-medium"),
							children: [e.unread && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("span", {
								"aria-hidden": "true",
								className: "inline-block size-2 shrink-0 rounded-full bg-primary"
							}), /* @__PURE__ */ b("span", {
								className: "sr-only",
								children: t.unread
							})] }), /* @__PURE__ */ b("span", {
								className: "truncate",
								children: e.title
							})]
						}), e.lastActivityAt && /* @__PURE__ */ b("time", {
							dateTime: e.lastActivityAt,
							className: "shrink-0 text-xs text-muted-foreground",
							children: a(e.lastActivityAt)
						})]
					}),
					e.subtitle && /* @__PURE__ */ b("span", {
						className: "truncate text-xs text-muted-foreground",
						children: e.subtitle
					}),
					e.preview && /* @__PURE__ */ b("span", {
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
function As(e, t = 0) {
	let n = Number.isFinite(e) && e > 0 ? Math.floor(e) : 0, r = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = String(n % 60).padStart(2, "0");
	return r > 0 || t >= 3600 ? `${r}:${String(i).padStart(2, "0")}:${a}` : `${i}:${a}`;
}
function js(e, [t, n]) {
	if (!(n > t)) return e;
	let r = [...e, [t, n]].sort((e, t) => e[0] - t[0]), i = [];
	for (let [e, t] of r) {
		let n = i[i.length - 1];
		n && e <= n[1] ? n[1] = Math.max(n[1], t) : i.push([e, t]);
	}
	return i;
}
function Ms(e, t) {
	if (!(t > 0)) return 0;
	let n = e.reduce((e, [n, r]) => e + Math.max(0, Math.min(r, t) - Math.max(n, 0)), 0);
	return Math.min(1, n / t);
}
function Ns(e, t) {
	let n = null;
	for (let r of [...e].sort((e, t) => e.start - t.start)) if (r.start <= t) n = r;
	else break;
	return n;
}
function Ps(e) {
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
var Fs = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	1.75,
	2
], Is = 2500, Ls = 5e3, Rs = "burgwiss-ui:video-prefs";
function zs(e) {
	return `burgwiss-ui:video:${e}`;
}
function Bs() {
	try {
		let e = JSON.parse(localStorage.getItem(Rs) ?? "null");
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
function Vs(e) {
	try {
		localStorage.setItem(Rs, JSON.stringify({
			...Bs(),
			...e
		}));
	} catch {}
}
function Hs(e) {
	return /* @__PURE__ */ b(Us, { ...e }, e.src);
}
function Us({ src: e, title: t, poster: n, resumeKey: r, chapters: i = [], showChapterList: a, captions: o = [], speeds: s = Fs, refreshSrc: c, completeAt: l = .9, onProgress: u, onComplete: d, next: f, labels: p, className: m }) {
	let h = D(), g = A(null), [_, v] = j(null), S = A(null), [C, w] = j(e), [T, te] = j(!1), [O, k] = j(!1), [ne, ie] = j(!1), [ae, M] = j(!1), [N, P] = j(!1), [F, I] = j(0), [L, se] = j(0), [R, ce] = j(0), [z, le] = j(() => Bs()), [B, ue] = j(!1), [V, de] = j(!0), [H, fe] = j(!1), [pe, me] = j(""), [U, he] = j(null), [ge, _e] = j(null), [ve, ye] = j(null), [be, xe] = j(""), W = A([]), Te = A(0), Ee = A(!1), De = A(!1), ke = A(null), Me = A(0), Ne = A(0), Ie = A(null), Le = A(null), G = () => S.current, Be = (e) => me(e), K = z.captions && o.some((e) => e.srcLang === z.captions) ? z.captions : null, We = ee((e = !1) => {
		let t = G();
		if (!t) return;
		let n = Number.isFinite(t.duration) ? t.duration : 0, r = Ms(W.current, n);
		!Ee.current && n > 0 && r >= l && (Ee.current = !0, d?.());
		let i = Date.now();
		!e && i - Me.current < Ls || (Me.current = i, u?.({
			currentTime: t.currentTime,
			duration: n,
			watched: W.current,
			fraction: r
		}));
	}, [
		u,
		d,
		l
	]), Ge = ee(() => {
		de(!0), Ie.current && window.clearTimeout(Ie.current), Ie.current = window.setTimeout(() => de(!1), Is);
	}, []);
	E(() => () => void (Ie.current && window.clearTimeout(Ie.current)), []);
	let Ke = !T || V || H, qe = () => void G()?.play()?.catch(() => {}), Je = () => {
		let e = G();
		e && (e.paused || e.ended ? qe() : e.pause());
	}, Ye = (e, t = !0) => {
		let n = G();
		if (!n) return;
		let r = Number.isFinite(n.duration) ? n.duration : e;
		n.currentTime = Math.max(0, Math.min(r, e)), I(n.currentTime), ie(!1), t && Be(p.announce.seeked(As(n.currentTime, r)));
	}, Xe = (e) => {
		let t = G();
		t && (t.playbackRate = e), le((t) => ({
			...t,
			rate: e
		})), Vs({ rate: e }), Be(p.announce.speed(p.speedValue(e)));
	}, Ze = (e) => {
		let t = G(), n = Math.round(Math.max(0, Math.min(1, e)) * 100) / 100;
		t && (t.volume = n, t.muted = n === 0), le((e) => ({
			...e,
			volume: n,
			muted: n === 0
		})), Vs({
			volume: n,
			muted: n === 0
		}), Be(p.announce.volume(Math.round(n * 100)));
	}, Qe = () => {
		let e = G(), t = !(e?.muted ?? z.muted);
		e && (e.muted = t), le((e) => ({
			...e,
			muted: t
		})), Vs({ muted: t }), Be(t ? p.announce.muted : p.announce.unmuted);
	}, et = (e) => {
		for (let t of Array.from(G()?.textTracks ?? [])) t.mode = t.language === e ? "hidden" : "disabled";
		le((t) => ({
			...t,
			captions: e
		})), Vs({ captions: e });
		let t = o.find((t) => t.srcLang === e)?.label;
		Be(t ? p.announce.captionsOn(t) : p.announce.captionsOff);
	}, tt = async () => {
		let e = g.current, t = G();
		try {
			document.fullscreenElement ? await document.exitFullscreen() : e?.requestFullscreen ? await e.requestFullscreen() : t?.webkitEnterFullscreen?.();
		} catch {}
	}, nt = async () => {
		let e = G();
		try {
			document.pictureInPictureElement ? await document.exitPictureInPicture() : await e?.requestPictureInPicture?.();
		} catch {}
	}, J = (e) => {
		let t = G(), n = t && Number.isFinite(t.duration) ? t.duration : L;
		switch (e.type) {
			case "toggle": return Je();
			case "seekBy": return Ye((t?.currentTime ?? F) + e.seconds);
			case "seekTo": return Ye(e.fraction * n);
			case "volumeBy": return Ze((z.muted ? 0 : z.volume) + e.delta);
			case "mute": return Qe();
			case "fullscreen":
				tt();
				return;
			case "captions": return o.length === 0 ? void 0 : et(K ? null : (o.find((e) => e.default) ?? o[0]).srcLang);
			case "speedBy": {
				let t = s.indexOf(z.rate), n = s[Math.max(0, Math.min(s.length - 1, (t < 0 ? s.indexOf(1) : t) + e.step))];
				n !== void 0 && Xe(n);
				return;
			}
		}
	}, Y = (e) => {
		let t = e.target;
		if (t.closest("input,textarea,select,[role=menu],[role=menuitem],[role=menuitemradio],[role=slider]") || (e.key === " " || e.key === "Enter") && t.closest("button")) return;
		let n = Ps(e);
		n && (e.preventDefault(), Ge(), J(n));
	}, rt = () => {
		let e = G();
		if (!e) return;
		se(Number.isFinite(e.duration) ? e.duration : 0), e.playbackRate = z.rate, e.volume = z.volume, e.muted = z.muted;
		for (let t of Array.from(e.textTracks)) t.mode = t.language === K ? "hidden" : "disabled";
		let t = ke.current;
		if (ke.current = null, t === null && r) try {
			let n = Number(localStorage.getItem(zs(r)) ?? 0) || 0;
			n > 3 && Number.isFinite(e.duration) && n < e.duration - 5 && (t = n);
		} catch {}
		t !== null && (e.currentTime = t, I(t), Te.current = t);
	}, it = () => {
		let e = G();
		if (!e) return;
		let t = e.currentTime;
		if (!e.paused && t > Te.current && t - Te.current < 1.5 * Math.max(1, e.playbackRate) && (W.current = js(W.current, [Te.current, t])), Te.current = t, I(t), e.buffered.length && ce(e.buffered.end(e.buffered.length - 1)), r && Date.now() - Ne.current >= Ls) {
			Ne.current = Date.now();
			try {
				localStorage.setItem(zs(r), String(Math.floor(t)));
			} catch {}
		}
		We();
	}, at = () => {
		if (te(!1), ie(!0), We(!0), r) try {
			localStorage.removeItem(zs(r));
		} catch {}
		f?.autoAdvanceSeconds && _e(f.autoAdvanceSeconds);
	}, ot = async () => {
		let e = G()?.currentTime ?? 0;
		if (c && !De.current) {
			De.current = !0;
			try {
				let t = await c();
				ke.current = e > 0 ? e : null, w(t);
				return;
			} catch {}
		}
		P(!0), M(!1);
	}, st = async () => {
		let t = F;
		if (P(!1), De.current = !1, ke.current = t > 0 ? t : null, c) try {
			w(await c());
			return;
		} catch {
			P(!0);
			return;
		}
		w(`${e}${e.includes("?") ? "&" : "?"}retry=${Date.now()}`);
	};
	E(() => {
		let e = Array.from(S.current?.textTracks ?? []).find((e) => e.language === K);
		if (!e) {
			xe("");
			return;
		}
		let t = () => xe(Array.from(e.activeCues ?? []).map((e) => e.text ?? "").join("\n"));
		return t(), e.addEventListener?.("cuechange", t), () => e.removeEventListener?.("cuechange", t);
	}, [K, L]), E(() => {
		let e = () => ue(document.fullscreenElement === g.current);
		return document.addEventListener("fullscreenchange", e), () => document.removeEventListener("fullscreenchange", e);
	}, []), E(() => {
		if (ge === null || !f) return;
		let e = window.setTimeout(() => {
			ge <= 1 ? (_e(null), f.onPlay()) : _e(ge - 1);
		}, 1e3);
		return () => window.clearTimeout(e);
	}, [ge, f]);
	let ct = (e) => {
		if (g.current?.focus({ preventScroll: !0 }), e.pointerType === "mouse") {
			Je();
			return;
		}
		let t = Date.now(), n = e.currentTarget.getBoundingClientRect(), r = e.clientX - n.left, i = Le.current;
		if (Le.current = {
			t,
			x: r
		}, i && t - i.t < 300 && Math.abs(i.x - r) < 60) {
			let e = $e(g.current), i = r < n.width / 3, a = r > n.width * 2 / 3;
			if (i || a) {
				let n = a !== e;
				J({
					type: "seekBy",
					seconds: n ? 10 : -10
				}), he({
					side: n ? "forward" : "back",
					key: t
				}), Le.current = null;
				return;
			}
		}
		V && T ? de(!1) : Ge();
	}, lt = Ns(i, F), ut = (a ?? i.length > 0) && i.length > 0, dt = (e) => L > 0 ? `${Math.min(100, e / L * 100)}%` : "0%", ft = z.muted || z.volume === 0 ? Ue : z.volume < .5 ? Ve : He, X = "text-video-foreground hover:bg-video-foreground/15 hover:text-video-foreground focus-visible:ring-video-foreground aria-expanded:bg-video-foreground/15";
	return /* @__PURE__ */ x("div", {
		className: q("space-y-3", m),
		children: [/* @__PURE__ */ x("div", {
			ref: (e) => {
				g.current = e, v(e);
			},
			role: "region",
			"aria-label": t,
			tabIndex: 0,
			onKeyDown: Y,
			onPointerMove: Ge,
			onFocus: Ge,
			className: q("group/player @container relative isolate aspect-video w-full overflow-hidden rounded-xl bg-video-surface text-video-foreground shadow-lg", B && "rounded-none", !Ke && "cursor-none"),
			children: [
				/* @__PURE__ */ b("video", {
					ref: S,
					src: C,
					poster: n,
					"aria-label": t,
					playsInline: !0,
					preload: "metadata",
					className: "h-full w-full",
					onLoadedMetadata: rt,
					onDurationChange: () => se(G()?.duration && Number.isFinite(G().duration) ? G().duration : 0),
					onTimeUpdate: it,
					onProgress: () => {
						let e = G();
						e?.buffered.length && ce(e.buffered.end(e.buffered.length - 1));
					},
					onPlay: () => {
						te(!0), k(!0), ie(!1), _e(null), Be(p.announce.playing), Ge();
					},
					onPause: () => {
						te(!1), de(!0), We(!0), G()?.ended || Be(p.announce.paused);
					},
					onWaiting: () => M(!0),
					onPlaying: () => M(!1),
					onCanPlay: () => M(!1),
					onEnded: at,
					onError: () => void ot(),
					children: o.map((e) => /* @__PURE__ */ b("track", {
						kind: "captions",
						src: e.src,
						srcLang: e.srcLang,
						label: e.label
					}, e.src))
				}, C),
				!N && !ne && /* @__PURE__ */ b("div", {
					"aria-hidden": "true",
					className: "absolute inset-0",
					onPointerUp: ct
				}),
				ae && !N && /* @__PURE__ */ x("div", {
					role: "status",
					className: "pointer-events-none absolute inset-0 flex items-center justify-center",
					children: [/* @__PURE__ */ b(Se, {
						"aria-hidden": "true",
						className: "size-12 animate-spin text-video-foreground/90"
					}), /* @__PURE__ */ b("span", {
						className: "sr-only",
						children: p.loading
					})]
				}),
				U && /* @__PURE__ */ b("div", {
					"aria-hidden": "true",
					onAnimationEnd: () => he(null),
					className: q("pointer-events-none absolute inset-y-0 flex w-1/3 animate-out items-center justify-center bg-video-foreground/10 text-sm font-semibold duration-500 fade-out", U.side === "back" ? "start-0 rounded-e-full" : "end-0 rounded-s-full"),
					children: p.skipped(U.side === "back" ? -10 : 10)
				}, U.key),
				!T && !N && !ne && !ae && /* @__PURE__ */ b("button", {
					type: "button",
					onClick: () => {
						qe(), g.current?.focus({ preventScroll: !0 });
					},
					"aria-label": p.play,
					className: "absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-video-foreground",
					children: /* @__PURE__ */ b(je, {
						"aria-hidden": "true",
						className: "size-8 translate-x-0.5 fill-current"
					})
				}),
				ne && !N && /* @__PURE__ */ b("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center gap-4 bg-video-scrim p-6 text-center",
					children: f ? /* @__PURE__ */ x(y, { children: [
						/* @__PURE__ */ b("p", {
							className: "text-sm text-video-foreground/80",
							children: p.upNext
						}),
						/* @__PURE__ */ b("p", {
							className: "text-xl font-semibold",
							children: f.title
						}),
						ge !== null && /* @__PURE__ */ b("p", {
							role: "timer",
							className: "text-sm text-video-foreground/80",
							children: p.startsIn(ge)
						}),
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ x(Z, {
									type: "button",
									onClick: () => (_e(null), f.onPlay()),
									children: [/* @__PURE__ */ b(ze, { "aria-hidden": "true" }), p.playNext]
								}),
								/* @__PURE__ */ x(Z, {
									type: "button",
									variant: "ghost",
									className: X,
									onClick: () => (_e(null), Ye(0, !1), qe()),
									children: [/* @__PURE__ */ b(Pe, { "aria-hidden": "true" }), p.replay]
								}),
								ge !== null && /* @__PURE__ */ b(Z, {
									type: "button",
									variant: "ghost",
									className: X,
									onClick: () => _e(null),
									children: p.cancel
								})
							]
						})
					] }) : /* @__PURE__ */ x(Z, {
						type: "button",
						onClick: () => (Ye(0, !1), qe()),
						children: [/* @__PURE__ */ b(Pe, { "aria-hidden": "true" }), p.replay]
					})
				}),
				N && /* @__PURE__ */ x("div", {
					role: "alert",
					className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-video-scrim p-6 text-center",
					children: [
						/* @__PURE__ */ b(re, {
							"aria-hidden": "true",
							className: "size-8"
						}),
						/* @__PURE__ */ b("p", {
							className: "font-semibold",
							children: p.errorTitle
						}),
						/* @__PURE__ */ b("p", {
							className: "max-w-sm text-sm text-video-foreground/80",
							children: p.errorBody
						}),
						/* @__PURE__ */ x(Z, {
							type: "button",
							onClick: () => void st(),
							children: [/* @__PURE__ */ b(Fe, { "aria-hidden": "true" }), p.retry]
						})
					]
				}),
				O && !N && /* @__PURE__ */ x("div", {
					"data-visible": Ke,
					className: q("absolute inset-x-0 bottom-0 bg-linear-to-t from-video-scrim via-video-scrim/60 to-transparent px-3 pt-10 pb-2 transition-opacity duration-200", "opacity-100 group-focus-within/player:opacity-100 data-[visible=false]:opacity-0"),
					children: [/* @__PURE__ */ b(Ws, {
						time: F,
						duration: L,
						buffered: R,
						chapters: i,
						labels: p,
						hover: ve,
						onHover: ye,
						onSeek: (e) => Ye(e, !1),
						onSeekEnd: (e) => Be(p.announce.seeked(As(e, L))),
						pct: dt
					}), /* @__PURE__ */ x("div", {
						className: "mt-1 flex items-center gap-0.5",
						children: [
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: X,
								"aria-label": T ? p.pause : p.play,
								"aria-keyshortcuts": "k",
								onClick: Je,
								children: b(T ? Oe : je, {
									"aria-hidden": "true",
									className: "fill-current"
								})
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: q(X, "@max-xs:hidden"),
								"data-control": "back10",
								"aria-label": p.back10,
								"aria-keyshortcuts": "j",
								onClick: () => J({
									type: "seekBy",
									seconds: -10
								}),
								children: /* @__PURE__ */ b(Pe, {
									"aria-hidden": "true",
									className: "rtl:-scale-x-100"
								})
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: q(X, "@max-xs:hidden"),
								"data-control": "forward10",
								"aria-label": p.forward10,
								"aria-keyshortcuts": "l",
								onClick: () => J({
									type: "seekBy",
									seconds: 10
								}),
								children: /* @__PURE__ */ b(Fe, {
									"aria-hidden": "true",
									className: "rtl:-scale-x-100"
								})
							}),
							/* @__PURE__ */ x("div", {
								className: "group/vol flex items-center",
								children: [/* @__PURE__ */ b(Z, {
									variant: "ghost",
									size: "icon",
									className: X,
									"aria-label": z.muted ? p.unmute : p.mute,
									"aria-keyshortcuts": "m",
									onClick: Qe,
									children: /* @__PURE__ */ b(ft, { "aria-hidden": "true" })
								}), /* @__PURE__ */ b("input", {
									type: "range",
									min: 0,
									max: 1,
									step: .05,
									value: z.muted ? 0 : z.volume,
									"aria-label": p.volume,
									"aria-valuetext": `${Math.round((z.muted ? 0 : z.volume) * 100)} %`,
									onChange: (e) => Ze(Number(e.target.value)),
									className: "h-1 w-0 cursor-pointer accent-video-foreground opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 pointer-coarse:hidden"
								})]
							}),
							/* @__PURE__ */ x("span", {
								className: "ms-2 text-sm text-video-foreground/90 tabular-nums",
								dir: "ltr",
								children: [As(F, L), /* @__PURE__ */ x("span", {
									className: "@max-md:hidden",
									children: [" / ", As(L, L)]
								})]
							}),
							lt && /* @__PURE__ */ x("span", {
								className: "ms-3 hidden min-w-0 truncate text-sm text-video-foreground/80 sm:inline",
								children: ["· ", lt.title]
							}),
							/* @__PURE__ */ b("span", { className: "flex-1" }),
							o.length > 0 && /* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: q(X, K && "bg-video-foreground/15"),
								"aria-label": p.captions,
								"aria-pressed": K !== null,
								"aria-keyshortcuts": "c",
								onClick: () => J({ type: "captions" }),
								children: /* @__PURE__ */ b(oe, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ x(Xi, {
								open: H,
								onOpenChange: fe,
								children: [/* @__PURE__ */ b(Zi, {
									asChild: !0,
									children: /* @__PURE__ */ b(Z, {
										variant: "ghost",
										size: "icon",
										className: X,
										"aria-label": p.settings,
										children: /* @__PURE__ */ b(Re, { "aria-hidden": "true" })
									})
								}), /* @__PURE__ */ x($i, {
									side: "top",
									align: "end",
									container: _,
									className: "w-48",
									children: [
										/* @__PURE__ */ b(sa, { children: p.speed }),
										/* @__PURE__ */ b(ta, {
											value: String(z.rate),
											onValueChange: (e) => Xe(Number(e)),
											children: s.map((e) => /* @__PURE__ */ b(na, {
												value: String(e),
												children: p.speedValue(e)
											}, e))
										}),
										o.length > 0 && /* @__PURE__ */ x(y, { children: [
											/* @__PURE__ */ b($, {}),
											/* @__PURE__ */ b(sa, { children: p.captions }),
											/* @__PURE__ */ x(ta, {
												value: K ?? "",
												onValueChange: (e) => et(e || null),
												children: [/* @__PURE__ */ b(na, {
													value: "",
													children: p.captionsOff
												}), o.map((e) => /* @__PURE__ */ b(na, {
													value: e.srcLang,
													children: e.label
												}, e.srcLang))]
											})
										] })
									]
								})]
							}),
							typeof document < "u" && "pictureInPictureEnabled" in document && document.pictureInPictureEnabled && /* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: q(X, "@max-md:hidden"),
								"data-control": "pip",
								"aria-label": p.pictureInPicture,
								onClick: () => void nt(),
								children: /* @__PURE__ */ b(Ae, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: X,
								"aria-label": B ? p.exitFullscreen : p.fullscreen,
								"aria-keyshortcuts": "f",
								onClick: () => void tt(),
								children: b(B ? we : Ce, { "aria-hidden": "true" })
							})
						]
					})]
				}),
				K && be && /* @__PURE__ */ b("div", {
					"data-caption": "",
					className: q("pointer-events-none absolute inset-x-0 flex justify-center px-6 transition-[bottom] duration-200", Ke && O ? "bottom-24" : "bottom-6"),
					children: /* @__PURE__ */ b("p", {
						lang: K,
						className: "max-w-[90%] rounded-md bg-video-scrim px-3 py-1 text-center text-base leading-snug whitespace-pre-line sm:text-lg md:text-xl",
						children: be
					})
				}),
				/* @__PURE__ */ b("div", {
					role: "status",
					"aria-live": "polite",
					className: "sr-only",
					children: pe
				})
			]
		}), ut && /* @__PURE__ */ x("nav", {
			"aria-labelledby": `${h}-chapters`,
			children: [/* @__PURE__ */ b("h2", {
				id: `${h}-chapters`,
				className: "mb-1 text-sm font-semibold",
				children: p.chapters
			}), /* @__PURE__ */ b("ol", {
				className: "divide-y divide-border rounded-lg border border-border",
				children: [...i].sort((e, t) => e.start - t.start).map((e) => {
					let t = lt?.start === e.start;
					return /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x("button", {
						type: "button",
						"aria-current": t ? "true" : void 0,
						onClick: () => {
							Ye(e.start), qe();
						},
						className: "flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=true]:bg-muted aria-[current=true]:font-medium",
						children: [/* @__PURE__ */ b("span", {
							className: "w-14 shrink-0 text-muted-foreground tabular-nums",
							dir: "ltr",
							children: As(e.start, L)
						}), /* @__PURE__ */ b("span", {
							className: "min-w-0 truncate",
							children: e.title
						})]
					}) }, e.start);
				})
			})]
		})]
	});
}
function Ws({ time: e, duration: t, buffered: n, chapters: r, labels: i, hover: a, onHover: o, onSeek: s, onSeekEnd: c, pct: l }) {
	let u = A(null), d = A(!1), f = (e) => {
		let n = u.current.getBoundingClientRect(), r = Math.max(0, Math.min(n.width, e - n.left));
		return {
			x: r,
			time: n.width > 0 ? r / n.width * t : 0
		};
	}, p = (n) => {
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
	}, m = [...r].sort((e, t) => e.start - t.start).filter((e) => e.start > 0 && e.start < t), h = a ? Ns(r, a.time) : null;
	return /* @__PURE__ */ x("div", {
		dir: "ltr",
		className: "relative",
		children: [a && t > 0 && /* @__PURE__ */ x("div", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute bottom-5 -translate-x-1/2 rounded-md bg-video-scrim px-2 py-1 text-center text-xs whitespace-nowrap shadow",
			style: { left: a.x },
			children: [h && /* @__PURE__ */ b("div", {
				className: "max-w-48 truncate font-medium",
				children: h.title
			}), /* @__PURE__ */ b("div", {
				className: "tabular-nums",
				children: As(a.time, t)
			})]
		}), /* @__PURE__ */ x("div", {
			ref: u,
			role: "slider",
			tabIndex: 0,
			"aria-label": i.seek,
			"aria-valuemin": 0,
			"aria-valuemax": Math.round(t),
			"aria-valuenow": Math.round(e),
			"aria-valuetext": i.timeOf(As(e, t), As(t, t)),
			onKeyDown: p,
			onPointerDown: (e) => {
				e.button !== 0 || t <= 0 || (d.current = !0, e.currentTarget.setPointerCapture?.(e.pointerId), s(f(e.clientX).time));
			},
			onPointerMove: (e) => {
				let t = f(e.clientX);
				o(t), d.current && s(t.time);
			},
			onPointerUp: (e) => {
				d.current && (d.current = !1, c(f(e.clientX).time));
			},
			onPointerLeave: () => o(null),
			className: "group/tl relative flex h-4 cursor-pointer items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-video-foreground",
			children: [/* @__PURE__ */ x("div", {
				className: "relative h-1 w-full overflow-hidden rounded-full bg-video-foreground/20 transition-[height] group-hover/tl:h-1.5",
				children: [
					/* @__PURE__ */ b("div", {
						className: "absolute inset-y-0 start-0 bg-video-foreground/40",
						style: { width: l(n) }
					}),
					/* @__PURE__ */ b("div", {
						className: "absolute inset-y-0 start-0 bg-video-foreground",
						style: { width: l(e) }
					}),
					m.map((e) => /* @__PURE__ */ b("div", {
						className: "absolute inset-y-0 w-0.5 bg-video-scrim",
						style: { left: l(e.start) }
					}, e.start))
				]
			}), /* @__PURE__ */ b("div", {
				"aria-hidden": "true",
				className: "absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-video-foreground shadow transition-transform group-hover/tl:scale-100 group-focus-visible/tl:scale-100",
				style: { left: l(e) }
			})]
		})]
	});
}
//#endregion
//#region src/templates/SidebarLayout/SidebarLayout.tsx
function Gs({ sidebar: e, side: t = "left", children: n, className: r }) {
	let i = /* @__PURE__ */ b("main", {
		className: "relative min-h-0 min-w-0 flex-1 overflow-auto",
		children: n
	});
	return /* @__PURE__ */ x("div", {
		className: q("flex h-full min-h-0 w-full", r),
		children: [
			t === "left" && e,
			i,
			t === "right" && e
		]
	});
}
//#endregion
//#region src/templates/AdminLayout/AdminLayout.tsx
function Ks({ rail: e, sidebar: t, children: n, className: r }) {
	return /* @__PURE__ */ x("div", {
		className: q("flex h-svh min-h-0 w-full bg-background text-foreground", r),
		children: [e, /* @__PURE__ */ b("div", {
			className: "min-w-0 flex-1",
			children: t ? /* @__PURE__ */ b(Gs, {
				sidebar: t,
				children: n
			}) : /* @__PURE__ */ b("main", {
				className: "relative h-full min-h-0 overflow-auto",
				children: n
			})
		})]
	});
}
//#endregion
//#region src/templates/ChatPage/ChatPage.tsx
function qs({ threadList: e, threadListHeader: t, threadListFooter: n, conversation: r, emptyAction: i, labels: a, resizeStorageKey: o, defaultThreadListWidth: s = 320, className: c }) {
	let l = r != null && r !== !1;
	return /* @__PURE__ */ b(Gs, {
		className: c,
		sidebar: /* @__PURE__ */ x(Ho, {
			label: a.threadList,
			defaultWidth: s,
			resize: {
				label: a.resize,
				storageKey: o,
				minWidth: 240
			},
			className: l ? "max-md:hidden" : "max-md:w-full!",
			children: [
				t && /* @__PURE__ */ b(Wo, { children: t }),
				/* @__PURE__ */ b(Go, { children: e }),
				n && /* @__PURE__ */ b(Ko, { children: n })
			]
		}),
		children: l ? /* @__PURE__ */ b("div", {
			className: "h-full min-h-0",
			children: r
		}) : /* @__PURE__ */ b("div", {
			className: "flex h-full items-center justify-center p-6 max-md:hidden",
			children: /* @__PURE__ */ b(ca, {
				icon: W,
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
function Js({ title: e, grid: t, actionsLabel: n, search: r, moreActionsLabel: i, selectionLabels: a, shortcutLabels: o, options: s, chips: c, notice: l, footer: u, offsetTop: d = "4rem", children: f }) {
	let p = A(null), m = t?.selectedIds.length ?? 0, h = t?.visibleActions ?? [], g = (e) => {
		let n = !!e.target.closest("input:not([type=checkbox]),textarea,select");
		if (e.key === "/" && !n && r) {
			e.preventDefault(), p.current?.querySelector("input[type=search]")?.focus();
			return;
		}
		t?.onKeyDown(e);
	}, _ = /* @__PURE__ */ b("div", {
		"data-grid-scroll": "",
		"data-density": t?.preferences.values.density ?? "comfortable",
		onContextMenu: t?.onContextMenu,
		className: q("min-h-0 flex-1 overflow-auto", "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted", "[&_td:first-child]:ps-4 [&_td:last-child]:pe-4 [&_th:first-child]:ps-4 [&_th:last-child]:pe-4", "[&_td]:border-border [&_td:not(:last-child)]:border-e [&_th]:border-border [&_th:not(:last-child)]:border-e", "data-[density=comfortable]:[&_td]:py-3 data-[density=compact]:[&_td]:py-1.5 data-[density=compact]:[&_th]:h-8", "[&_[data-slot=table-container]]:overflow-visible"),
		children: f
	});
	return /* @__PURE__ */ x("div", {
		ref: p,
		onKeyDown: g,
		className: "flex min-h-0 flex-col bg-card",
		style: { height: `calc(100svh - ${d})` },
		children: [
			/* @__PURE__ */ b("h1", {
				className: "sr-only",
				children: e
			}),
			/* @__PURE__ */ x("div", {
				className: "flex h-12 shrink-0 items-center gap-2 border-b border-border px-3",
				children: [/* @__PURE__ */ b(es, {
					label: n ?? e,
					items: t?.actions,
					selectedIds: t?.selectedIds,
					shortcutLabels: o,
					moreLabel: i,
					children: t && a && m > 0 && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": a.clear,
						"aria-keyshortcuts": "Escape",
						onClick: t.clear,
						className: "text-muted-foreground",
						children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
					}), /* @__PURE__ */ b("span", {
						"aria-live": "polite",
						className: "px-1 text-sm font-medium whitespace-nowrap tabular-nums",
						children: a.count(m)
					})] })
				}), /* @__PURE__ */ x("div", {
					className: "ms-auto flex shrink-0 items-center gap-1",
					children: [r && /* @__PURE__ */ b(Ya, {
						collapsible: !0,
						value: r.value,
						onValueChange: r.onChange,
						placeholder: r.placeholder,
						"aria-keyshortcuts": "/"
					}), s]
				})]
			}),
			c && /* @__PURE__ */ b("div", {
				className: "flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2",
				children: c
			}),
			l && /* @__PURE__ */ b("div", {
				className: "shrink-0 border-b border-border px-4 py-2 text-sm",
				children: l
			}),
			t && t.actions.length > 0 ? /* @__PURE__ */ x(Ui, { children: [/* @__PURE__ */ b(Wi, {
				asChild: !0,
				children: _
			}), /* @__PURE__ */ b(Gi, { children: /* @__PURE__ */ b(ns, {
				items: h,
				ids: t.selectedIds,
				shortcutLabels: o
			}) })] }) : _,
			u && /* @__PURE__ */ b("div", {
				className: "flex h-12 shrink-0 items-center gap-3 border-t border-border px-4",
				children: u
			})
		]
	});
}
//#endregion
//#region src/templates/PageEditor/PageEditor.tsx
function Ys({ toolbar: e, aside: t, device: n, onDeviceChange: r, previewTools: i, storageKey: a, labels: o, children: s }) {
	let c = [{
		id: "desktop",
		label: o.desktop,
		icon: /* @__PURE__ */ b(Te, { "aria-hidden": "true" })
	}, {
		id: "phone",
		label: o.phone,
		icon: /* @__PURE__ */ b(G, { "aria-hidden": "true" })
	}];
	return /* @__PURE__ */ x("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ b("div", {
			className: "flex h-12 shrink-0 items-center gap-3 border-b border-border px-4",
			children: e
		}), /* @__PURE__ */ x("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ x("div", {
				className: "relative min-w-0 flex-1",
				children: [/* @__PURE__ */ b("div", {
					className: "h-full overflow-auto bg-muted/50",
					children: /* @__PURE__ */ b("section", {
						"aria-label": o.preview,
						"data-device": n,
						className: q("mx-auto min-h-full overflow-hidden bg-card pb-24", "transition-[max-width] duration-300 ease-out motion-reduce:transition-none", n === "desktop" ? "max-w-full" : "max-w-[390px] border-x border-border shadow-sm"),
						children: s
					})
				}), /* @__PURE__ */ x("div", {
					role: "toolbar",
					"aria-label": o.tools,
					className: "absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur",
					children: [c.map((e) => /* @__PURE__ */ b(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": e.label,
						"aria-pressed": n === e.id,
						onClick: () => r(e.id),
						className: q("text-muted-foreground", n === e.id && "bg-muted text-foreground"),
						children: e.icon
					}, e.id)), i && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("span", {
						"aria-hidden": "true",
						className: "mx-1 h-5 w-px bg-border"
					}), i] })]
				})]
			}), t && /* @__PURE__ */ b(Ho, {
				label: o.aside,
				side: "right",
				defaultWidth: 264,
				resize: {
					label: o.resizeAside,
					storageKey: a,
					minWidth: 220
				},
				children: /* @__PURE__ */ b(Go, {
					className: "gap-6 px-4 py-4",
					children: t
				})
			})]
		})]
	});
}
//#endregion
export { Ks as AdminLayout, Sr as Alert, Tr as AlertAction, wr as AlertDescription, Er as AlertDialog, Fr as AlertDialogAction, Ir as AlertDialogCancel, Ar as AlertDialogContent, Pr as AlertDialogDescription, Mr as AlertDialogFooter, jr as AlertDialogHeader, kr as AlertDialogOverlay, Or as AlertDialogPortal, Nr as AlertDialogTitle, Dr as AlertDialogTrigger, Cr as AlertTitle, so as AppRail, lo as AppRailItem, co as AppRailSpacer, $r as AttachmentDropzone, ti as AttachmentList, Fn as Avatar, Rn as AvatarBadge, Ln as AvatarFallback, zn as AvatarGroup, Bn as AvatarGroupCount, In as AvatarImage, Gn as Badge, ni as Breadcrumb, ci as BreadcrumbEllipsis, ii as BreadcrumbItem, ai as BreadcrumbLink, ri as BreadcrumbList, oi as BreadcrumbPage, si as BreadcrumbSeparator, Z as Button, li as Card, pi as CardAction, mi as CardContent, fi as CardDescription, hi as CardFooter, ui as CardHeader, di as CardTitle, yo as CategoryTree, xo as ChatComposer, qs as ChatPage, er as Checkbox, nr as Chip, rr as ChipRow, gi as Collapsible, vi as CollapsibleContent, _i as CollapsibleTrigger, ki as ColorPicker, Mi as Combobox, Ni as Command, Pi as CommandDialog, Li as CommandEmpty, Ri as CommandGroup, Fi as CommandInput, Bi as CommandItem, Ii as CommandList, zi as CommandSeparator, Ai as CompletionChecklist, Vi as ComposerAttachments, Hi as ConfirmActionDialog, Ui as ContextMenu, Gi as ContextMenuContent, Ki as ContextMenuItem, Ji as ContextMenuLabel, qi as ContextMenuSeparator, Yi as ContextMenuShortcut, Wi as ContextMenuTrigger, Oo as Conversation, ir as CopyLinkButton, jn as DEVICE_WIDTHS, No as DataGrid, Lr as Dialog, Kr as DialogClose, Vr as DialogContent, Gr as DialogDescription, Ur as DialogFooter, Hr as DialogHeader, Br as DialogOverlay, zr as DialogPortal, Wr as DialogTitle, Rr as DialogTrigger, Ze as DirectionProvider, Xi as DropdownMenu, ea as DropdownMenuCheckboxItem, $i as DropdownMenuContent, Q as DropdownMenuItem, sa as DropdownMenuLabel, Qi as DropdownMenuPortal, ta as DropdownMenuRadioGroup, na as DropdownMenuRadioItem, $ as DropdownMenuSeparator, oa as DropdownMenuShortcut, ra as DropdownMenuSub, aa as DropdownMenuSubContent, ia as DropdownMenuSubTrigger, Zi as DropdownMenuTrigger, ca as EmptyState, ma as EntitySearchPicker, Zo as FolderSidebar, _n as GRID_CONTROL_COLUMN_WIDTH, ns as GridActionMenuItems, es as GridActions, va as GridFilterChips, Ia as GridFilterEditor, Ra as GridFooter, Ha as GridOptions, Js as GridPage, ar as IconButton, or as IconToggle, Yr as ImageAdjustDialog, dr as InitialsAvatar, Ua as InlineText, fr as Input, pr as IntegerInput, mr as Label, Ja as LanguageSelect, as as LiveCanvas, ss as LiveCanvasGroup, os as LiveCanvasTarget, Ct as MESSAGE_ATTACHMENT_MAX_MB, St as MESSAGE_ATTACHMENT_MIMES, wt as MESSAGE_MAX_ATTACHMENTS, Do as MessageList, Ys as PageEditor, cs as PageViewer, hr as PasswordInput, la as Popover, da as PopoverAnchor, fa as PopoverContent, ua as PopoverTrigger, gr as RadioGroup, _r as RadioGroupItem, Ya as SearchField, Xa as SegmentedChoice, Za as SegmentedChoiceItem, eo as SegmentedTab, Qa as SegmentedTabs, to as SegmentedTabsContent, $a as SegmentedTabsList, ba as Select, Ea as SelectContent, xa as SelectGroup, Oa as SelectItem, Da as SelectLabel, Ta as SelectScrollDownButton, wa as SelectScrollUpButton, ka as SelectSeparator, Ca as SelectTrigger, Sa as SelectValue, vr as Separator, ls as Sheet, ds as SheetClose, gs as SheetContent, vs as SheetDescription, hs as SheetHandle, ps as SheetOverlay, fs as SheetPortal, _s as SheetTitle, us as SheetTrigger, Ho as Sidebar, Go as SidebarContent, Ko as SidebarFooter, qo as SidebarGroup, Wo as SidebarHeader, Gs as SidebarLayout, Jo as SidebarMenu, Xo as SidebarMenuButton, Yo as SidebarMenuItem, no as StatCard, yr as Switch, ys as Table, xs as TableBody, Es as TableCaption, Ts as TableCell, Ss as TableFooter, ws as TableHead, bs as TableHeader, Cs as TableRow, ro as Tabs, oo as TabsContent, io as TabsList, ao as TabsTrigger, br as Textarea, ks as ThreadList, qn as Tooltip, Yn as TooltipContent, Kn as TooltipProvider, Jn as TooltipTrigger, Hs as VideoPlayer, vt as allIds, ur as avatarTint, Hn as badgeVariants, Xn as buttonVariants, X as canMove, q as cn, ft as depthOf, it as descendantIds, yt as diffTree, tt as downloadText, J as findNode, at as flattenVisible, Tt as formatFileSize, Lt as formatShortcut, sn as gridPreferencesKey, kt as gridSelectionState, xt as inFolderScope, ht as indentNode, et as inlineArrows, ct as insertNode, At as isGridActionDisabled, Mt as isMacPlatform, $e as isRtl, Y as locate, Pt as matchShortcut, pt as moveNode, mt as moveSibling, ya as nativeSelectClass, vo as newId, gt as outdentNode, rt as pathTo, lt as removeNode, ut as renameNode, Dn as resizableWidthKey, bt as subtreeCounts, dt as subtreeHeight, Qe as useDirection, Mn as useFitScale, wn as useGrid, gn as useGridPreferences, Pn as usePageDraft, An as useResizableWidth, zs as videoResumeKey, jt as visibleGridActions };

//# sourceMappingURL=index.js.map