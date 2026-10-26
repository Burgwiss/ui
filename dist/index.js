import { clsx as e } from "clsx";
import { twMerge as t } from "tailwind-merge";
import { AlertDialog as n, Avatar as r, Checkbox as i, Collapsible as a, ContextMenu as o, Dialog as s, Direction as c, DropdownMenu as l, Label as u, Popover as d, RadioGroup as f, Select as p, Separator as m, Slot as h, Switch as g, Tabs as _, Tooltip as v } from "radix-ui";
import { Fragment as y, jsx as b, jsxs as x } from "react/jsx-runtime";
import * as S from "react";
import { Children as C, Fragment as w, createContext as T, forwardRef as E, isValidElement as ee, useCallback as te, useContext as D, useEffect as O, useId as k, useLayoutEffect as A, useMemo as ne, useRef as j, useState as M } from "react";
import { cva as N } from "class-variance-authority";
import { AlertTriangle as re, ArrowDown as P, ArrowDownUp as F, ArrowLeft as I, ArrowUp as ie, Bookmark as ae, BookmarkPlus as L, Camera as oe, CameraOff as se, Captions as R, Check as z, ChevronDown as B, ChevronLeft as V, ChevronRight as H, ChevronUp as ce, ChevronsUpDown as U, Circle as le, CircleDashed as W, CircleSlash as ue, Columns3 as de, Copy as fe, CornerUpLeft as G, DoorOpen as pe, EllipsisVertical as K, Eye as me, EyeOff as he, Filter as ge, Folder as _e, FolderInput as ve, FolderOpen as ye, FolderPlus as be, Hand as xe, Inbox as Se, IndentDecrease as Ce, IndentIncrease as we, Loader2 as Te, Maximize as Ee, MessagesSquare as De, Mic as Oe, MicOff as ke, Minimize as Ae, Minus as q, Monitor as je, MoreHorizontal as Me, Paperclip as Ne, Pause as Pe, Pencil as Fe, PictureInPicture2 as Ie, Pin as Le, Play as Re, Plus as ze, RefreshCw as Be, RotateCcw as Ve, RotateCw as He, Search as Ue, SendHorizontal as We, Settings as Ge, SkipForward as Ke, Smartphone as qe, Timer as Je, Trash2 as Ye, Volume1 as Xe, Volume2 as Ze, VolumeX as Qe, X as $e } from "lucide-react";
import { Combobox as et, ComboboxButton as tt, ComboboxInput as nt, ComboboxOption as rt, ComboboxOptions as it } from "@headlessui/react";
import { Command as at } from "cmdk";
import { useVirtualizer as ot } from "@tanstack/react-virtual";
//#region src/lib/cn.ts
function J(...n) {
	return t(e(n));
}
//#endregion
//#region src/lib/direction.tsx
function st({ dir: e, children: t }) {
	return /* @__PURE__ */ b(c.DirectionProvider, {
		dir: e,
		children: t
	});
}
function ct(e) {
	return c.useDirection(e);
}
function lt(e) {
	return e?.closest("[dir]")?.getAttribute("dir") === "rtl";
}
function ut(e) {
	return lt(e) ? {
		forward: "ArrowLeft",
		back: "ArrowRight"
	} : {
		forward: "ArrowRight",
		back: "ArrowLeft"
	};
}
//#endregion
//#region src/lib/download.ts
function dt(e, t, n = "text/csv;charset=utf-8") {
	if (typeof document > "u") return;
	let r = URL.createObjectURL(new Blob([e], { type: n })), i = document.createElement("a");
	i.href = r, i.download = t, i.rel = "noopener", document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
//#endregion
//#region src/lib/tree.ts
var ft = (e) => (e.children?.length ?? 0) > 0;
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
function pt(e, t) {
	for (let n of e) {
		if (n.id === t) return [n];
		let e = n.children ? pt(n.children, t) : [];
		if (e.length) return [n, ...e];
	}
	return [];
}
function mt(e, t) {
	let n = Y(e, t);
	if (!n) return [];
	let r = [], i = (e) => {
		r.push(e.id), e.children?.forEach(i);
	};
	return i(n), r;
}
function ht(e, t, n = 1, r = null) {
	return e.flatMap((i, a) => {
		let o = ft(i) && t.has(i.id), s = {
			node: i,
			level: n,
			parentId: r,
			posInSet: a + 1,
			setSize: e.length,
			hasChildren: ft(i),
			expanded: o
		};
		return o ? [s, ...ht(i.children, t, n + 1, i.id)] : [s];
	});
}
function gt(e, t, n) {
	return t === null ? n(e) : e.map((e) => e.id === t ? {
		...e,
		children: n(e.children ?? [])
	} : e.children ? {
		...e,
		children: gt(e.children, t, n)
	} : e);
}
var _t = (e, t) => Math.min(Math.max(e, 0), t);
function vt(e, t, n, r) {
	return t !== null && !Y(e, t) ? e : gt(e, t, (e) => {
		let t = _t(r ?? e.length, e.length);
		return [
			...e.slice(0, t),
			n,
			...e.slice(t)
		];
	});
}
function yt(e, t) {
	let n = X(e, t);
	return n ? gt(e, n.parentId, (e) => e.filter((e) => e.id !== t)) : e;
}
function bt(e, t, n) {
	return e.map((e) => e.id === t ? {
		...e,
		label: n
	} : e.children ? {
		...e,
		children: bt(e.children, t, n)
	} : e);
}
function xt(e) {
	return 1 + Math.max(0, ...(e.children ?? []).map(xt));
}
function St(e, t) {
	return pt(e, t).length;
}
function Ct(e, t, n, r) {
	let i = Y(e, t);
	return !i || n !== null && (!Y(e, n) || mt(e, t).includes(n)) ? !1 : r === void 0 || (n === null ? 0 : St(e, n)) + xt(i) <= r;
}
function wt(e, t, n, r, i) {
	if (!Ct(e, t, n, i)) return e;
	let a = X(e, t), o = a.siblings[a.index], s = a.parentId === n && a.index < r ? r - 1 : r;
	return a.parentId === n && s === a.index ? e : vt(yt(e, t), n, o, s);
}
function Tt(e, t, n) {
	let r = X(e, t);
	if (!r) return e;
	let i = r.index + n;
	return i < 0 || i >= r.siblings.length ? e : wt(e, t, r.parentId, n === 1 ? r.index + 2 : i);
}
function Et(e, t, n) {
	let r = X(e, t);
	if (!r || r.index === 0) return e;
	let i = r.siblings[r.index - 1];
	return wt(e, t, i.id, i.children?.length ?? 0, n);
}
function Dt(e, t) {
	let n = X(e, t);
	if (!n || n.parentId === null) return e;
	let r = X(e, n.parentId);
	return wt(e, t, r.parentId, r.index + 1);
}
function Ot(e) {
	return e.flatMap((e) => [e.id, ...e.children ? Ot(e.children) : []]);
}
function kt(e) {
	return new Set(Ot(e));
}
function At(e, t, n) {
	if (e === t) return null;
	let r = kt(e), i = kt(t), a = [...r].filter((e) => !i.has(e)).find((t) => {
		let n = X(e, t).parentId;
		return n === null || i.has(n);
	});
	if (a !== void 0) return {
		type: "remove",
		id: a
	};
	for (let e of i) {
		if (r.has(e)) continue;
		let n = X(t, e);
		return {
			type: "add",
			id: e,
			label: n.siblings[n.index].label,
			parentId: n.parentId,
			index: n.index
		};
	}
	for (let n of i) {
		let r = Y(e, n), i = Y(t, n);
		if (r.label !== i.label) return {
			type: "rename",
			id: n,
			label: i.label
		};
	}
	let o = n !== void 0 && i.has(n) ? [n, ...i] : i;
	for (let n of o) {
		let r = X(e, n), i = X(t, n);
		if (r.parentId === i.parentId && r.index === i.index) continue;
		let a = r.parentId === i.parentId && r.index < i.index ? i.index + 1 : i.index;
		if (JSON.stringify(wt(e, n, i.parentId, a)) === JSON.stringify(t)) return {
			type: "move",
			id: n,
			parentId: i.parentId,
			index: a
		};
	}
	return null;
}
function jt(e, t) {
	let n = /* @__PURE__ */ new Map();
	for (let e of t) e !== null && n.set(e, (n.get(e) ?? 0) + 1);
	let r = {}, i = (e) => {
		let t = (n.get(e.id) ?? 0) + (e.children ?? []).reduce((e, t) => e + i(t), 0);
		return r[e.id] = t, t;
	};
	return e.forEach(i), r;
}
function Mt(e, t, n) {
	return t.kind === "all" ? !0 : t.kind === "none" ? n === null || Y(e, n) === null : n !== null && mt(e, t.id).includes(n);
}
//#endregion
//#region src/lib/tileGrid.ts
var Nt = (e) => Number.isFinite(e) ? Math.max(0, e) : 0;
function Pt(e, t, n, { minTileWidth: r = 20, aspect: i = 16 / 9, gap: a = .5, maxPerPage: o = 16 } = {}) {
	e = Nt(e), t = Nt(t), n = Math.floor(Nt(n));
	let s = Math.min(r, e), c = {
		columns: 1,
		rows: 1,
		pageSize: 1,
		tileWidth: Math.min(e, Math.max(s, t * i)),
		tileHeight: Math.min(t, e / i)
	}, l = Infinity, u = Math.min(n, o, Math.max(1, Math.floor((e + a) / (r + a)))), d = Math.floor((t + a) / (s / i + a));
	for (let r = 1; r <= u; r += 1) {
		let s = Math.min(n, o, r * d);
		if (s < 1) continue;
		let u = Math.ceil(s / r), f = Math.min((e - (r - 1) * a) / r, (t - (u - 1) * a) / u * i);
		if (f <= 0) continue;
		let p = r * u - s;
		(s > c.pageSize || s === c.pageSize && (f > c.tileWidth || f === c.tileWidth && p < l) || n === 2 && s === 2 && r === 2) && (c = {
			columns: r,
			rows: u,
			pageSize: s,
			tileWidth: f,
			tileHeight: f / i
		}, l = p);
	}
	return {
		...c,
		pages: Math.max(1, Math.ceil(n / c.pageSize))
	};
}
//#endregion
//#region src/lib/messageAttachments.ts
var Ft = [
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
], It = 25, Lt = 5;
function Rt(e, t) {
	let n = {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	};
	return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toLocaleString(t, n)} KB` : `${(e / 1024 / 1024).toLocaleString(t, n)} MB`;
}
function zt(e, t) {
	return t.length === 0 || t.some((t) => t.endsWith("/*") ? e.startsWith(t.slice(0, -1)) : t === e);
}
function Bt(e, t) {
	return e.size > t.maxSizeMb * 1024 * 1024 ? "too_large" : zt(e.type, t.mimes) ? null : "wrong_type";
}
function Vt(e, t, n) {
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
function Ht(e) {
	return e <= 0 ? "none" : e === 1 ? "one" : "many";
}
function Ut(e, t) {
	return typeof e.disabled == "function" ? e.disabled(t) : e.disabled === !0;
}
function Wt(e, t) {
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
function Gt() {
	return typeof navigator > "u" ? !1 : /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}
function Kt(e) {
	let t = e.split("+").map((e) => e.trim()), n = t.pop() ?? "", r = (e) => t.some((t) => t.toLowerCase() === e);
	return {
		mod: r("mod"),
		shift: r("shift"),
		alt: r("alt"),
		key: n
	};
}
function qt(e, t, n = Gt()) {
	let r = Kt(t), i = n ? e.metaKey : e.ctrlKey, a = n ? e.ctrlKey : e.metaKey;
	if (i !== r.mod || a || e.shiftKey !== r.shift || e.altKey !== r.alt) return !1;
	let o = r.key.toLowerCase(), s = e.key.toLowerCase();
	return o === "delete" ? s === "delete" || s === "backspace" : s === o;
}
var Jt = {
	Mod: "⌘",
	Shift: "⇧",
	Alt: "⌥",
	Delete: "⌫",
	Enter: "↩",
	Escape: "esc"
}, Yt = {
	Mod: "Ctrl",
	Shift: "Shift",
	Alt: "Alt",
	Delete: "Del",
	Enter: "Enter",
	Escape: "Esc"
};
function Xt(e, t = {}, n = Gt()) {
	let r = {
		...n ? Jt : Yt,
		...t
	}, { mod: i, shift: a, alt: o, key: s } = Kt(e), c = (e) => r[e] ?? (e.length === 1 ? e.toUpperCase() : e);
	return [
		...n ? [] : i ? [r.Mod] : [],
		...o ? [r.Alt] : [],
		...a ? [r.Shift] : [],
		...n && i ? [r.Mod] : [],
		c(s)
	].join(n ? "" : "+");
}
function Zt(e, t) {
	return e.value ? e.value(t) : t[e.id];
}
var Qt = (e) => e == null || e === "", $t = new Intl.Collator("de", {
	numeric: !0,
	sensitivity: "base"
});
function en(e, t) {
	return typeof e == "number" && typeof t == "number" ? e - t : e instanceof Date && t instanceof Date ? e.getTime() - t.getTime() : typeof e == "boolean" && typeof t == "boolean" ? Number(e) - Number(t) : $t.compare(String(e), String(t));
}
function tn(e, t, n) {
	let r = t.map((e) => ({
		s: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : [...e].sort((e, t) => {
		for (let { s: n, col: i } of r) {
			let r = Zt(i, e), a = Zt(i, t);
			if (Qt(r) || Qt(a)) {
				if (Qt(r) && Qt(a)) continue;
				return Qt(r) ? 1 : -1;
			}
			let o = (i.compare ?? en)(r, a);
			if (o !== 0) return n.desc ? -o : o;
		}
		return 0;
	});
}
var nn = (e) => e.toLocaleLowerCase("de").normalize("NFC");
function rn(e) {
	if (e instanceof Date) return e.getTime();
	if (typeof e != "string" || e === "") return null;
	let t = Date.parse(e.length === 10 ? `${e}T00:00:00Z` : e);
	return Number.isNaN(t) ? null : t;
}
function an(e, t) {
	switch (e.type) {
		case "text": {
			let n = nn(e.value.trim());
			if (n === "") return !0;
			let r = Qt(t) ? "" : nn(String(t));
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
			let n = rn(t);
			if (n === null) return !1;
			let r = e.from ? rn(e.from) : null, i = e.to ? rn(e.to) + 86399999 : null;
			return (r === null || n >= r) && (i === null || n <= i);
		}
	}
}
function on(e, t, n) {
	let r = t.map((e) => ({
		f: e,
		col: n.find((t) => t.id === e.id)
	})).filter((e) => e.col !== void 0);
	return r.length === 0 ? e : e.filter((e) => r.every(({ f: t, col: n }) => an(t, Zt(n, e))));
}
function sn(e, t) {
	let n = {};
	for (let r of t) {
		if (!r.aggregate) continue;
		if (r.aggregate === "count") {
			n[r.id] = e.length;
			continue;
		}
		let t = e.map((e) => Zt(r, e)).filter((e) => typeof e == "number"), i = t.reduce((e, t) => e + t, 0);
		n[r.id] = r.aggregate === "sum" ? i : t.length === 0 ? 0 : r.aggregate === "avg" ? i / t.length : r.aggregate === "min" ? Math.min(...t) : Math.max(...t);
	}
	return n;
}
function cn(e, t, n, r = 0, i = "") {
	let [a, ...o] = t, s = n.find((e) => e.id === a);
	if (!s) return [];
	let c = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = Zt(s, t), n = Qt(e) ? "" : String(e), r = c.get(n) ?? {
			value: Qt(e) ? null : e,
			rows: []
		};
		r.rows.push(t), c.set(n, r);
	}
	return [...c.entries()].sort(([e], [t]) => e === "" || t === "" ? e === t ? 0 : e === "" ? 1 : -1 : $t.compare(e, t)).map(([e, t]) => {
		let a = `${i}${i ? ">" : ""}${s.id}:${e}`;
		return {
			key: a,
			columnId: s.id,
			value: t.value,
			depth: r,
			rows: t.rows,
			children: o.length ? cn(t.rows, o, n, r + 1, a) : [],
			aggregates: sn(t.rows, n)
		};
	});
}
function ln(e, t, n, r) {
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
function un(e, t) {
	if (e.exportValue) return {
		text: e.exportValue(t),
		wasString: !0
	};
	let n = Zt(e, t);
	return Qt(n) ? {
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
var dn = /^[=+\-@\t\r]/;
function fn(e, t, n) {
	let r = t && dn.test(e) ? `'${e}` : e;
	return r.includes(n) || /["\r\n]/.test(r) ? `"${r.replace(/"/g, "\"\"")}"` : r;
}
function pn(e, t, { separator: n = ",", bom: r = !1 } = {}) {
	let i = [t.map((e) => fn(e.header, !0, n)).join(n), ...e.map((e) => t.map((t) => {
		let { text: r, wasString: i } = un(t, e);
		return fn(r, i, n);
	}).join(n))];
	return (r ? "﻿" : "") + i.join("\r\n");
}
function mn(e, t) {
	let n = (e) => e.replace(/[\t\r\n]+/g, " ");
	return [t.map((e) => n(e.header)).join("	"), ...e.map((e) => t.map((t) => n(un(t, e).text)).join("	"))].join("\n");
}
function hn(e, t) {
	let n = new Set(t), r = e.filter((e) => n.has(e));
	return [...r, ...t.filter((e) => !r.includes(e))];
}
function gn(e, t, n) {
	if (e.indexOf(t) < 0) return e;
	let r = e.filter((e) => e !== t);
	return r.splice(Math.max(0, Math.min(r.length, n)), 0, t), r;
}
function _n(e, t) {
	let n = hn(t.order, e.map((e) => e.id)), r = new Map(e.map((e) => [e.id, e])), i = n.map((e) => r.get(e)).filter((e) => e.hideable === !1 || !t.hidden.includes(e.id)).map((e) => {
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
var vn = {
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
}, yn = 1;
function bn(e) {
	return `burgwiss-ui:grid:${e}`;
}
function xn() {
	try {
		return typeof window > "u" ? null : window.localStorage;
	} catch {
		return null;
	}
}
function Sn(e) {
	let t = (e) => Array.isArray(e) ? e.map(t) : e && typeof e == "object" ? Object.fromEntries(Object.keys(e).sort().map((n) => [n, t(e[n])])) : e;
	return JSON.stringify(t({
		...e,
		hiddenColumns: [...e.hiddenColumns].sort()
	}));
}
function Cn(e, t) {
	return Sn(e) === Sn(t);
}
var wn = (e) => typeof e == "object" && !!e && !Array.isArray(e), Tn = (e) => Array.isArray(e) ? e.filter((e) => typeof e == "string") : null;
function En(e, t) {
	let n = e;
	return {
		hiddenColumns: Tn(n.hiddenColumns) ?? t.hiddenColumns,
		density: n.density === "compact" || n.density === "comfortable" ? n.density : t.density,
		selection: typeof n.selection == "boolean" ? n.selection : t.selection,
		columnOrder: Tn(n.columnOrder) ?? t.columnOrder,
		columnWidths: wn(n.columnWidths) ? Object.fromEntries(Object.entries(n.columnWidths).filter((e) => typeof e[1] == "number" && Number.isFinite(e[1]) && e[1] > 0)) : t.columnWidths,
		pinned: wn(n.pinned) ? Object.fromEntries(Object.entries(n.pinned).filter(([, e]) => e === "left" || e === "right" || e === null)) : t.pinned,
		sorting: Array.isArray(n.sorting) ? n.sorting.filter((e) => wn(e) && typeof e.id == "string" && typeof e.desc == "boolean") : t.sorting,
		groupBy: Tn(n.groupBy) ?? t.groupBy,
		views: Array.isArray(n.views) ? n.views.filter((e) => wn(e) && typeof e.id == "string" && typeof e.name == "string" && wn(e.state)) : t.views,
		activeView: typeof n.activeView == "string" ? n.activeView : t.activeView
	};
}
function Dn(e, t, n) {
	try {
		let r = e?.getItem(t);
		if (!r) return n;
		let i = JSON.parse(r);
		return !wn(i) || i.v !== yn ? n : En(i, n);
	} catch {
		return n;
	}
}
function On(e, t, n, r) {
	try {
		Cn(n, r) ? e?.removeItem(t) : e?.setItem(t, JSON.stringify({
			v: yn,
			...n
		}));
	} catch {}
}
function kn(e, t = {}) {
	let n = bn(e), r = t.storage === void 0 ? xn() : t.storage, i = JSON.stringify({
		...vn,
		...t.defaults
	}), a = ne(() => JSON.parse(i), [i]), [o, s] = M(() => ({
		key: n,
		prefs: Dn(r, n, a)
	})), c = o.prefs;
	o.key !== n && (c = Dn(r, n, a), s({
		key: n,
		prefs: c
	})), O(() => {
		if (typeof window > "u") return;
		let e = (e) => {
			e.key === n && s({
				key: n,
				prefs: Dn(r, n, a)
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
			let i = e(t.key === n ? t.prefs : Dn(r, n, a));
			return On(r, n, i, a), {
				key: n,
				prefs: i
			};
		});
	};
	return {
		values: c,
		isDefault: Cn(c, a),
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
var An = 40, jn = "a,button,input,select,textarea,label,[role=button],[role=checkbox],[role=menuitem],[data-grid-ignore]";
function Mn(e) {
	return !!e?.closest("input:not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable=\"\"],[contenteditable=true]");
}
function Nn(e) {
	return e instanceof Element ? e.closest("[data-grid-row-id]") : null;
}
function Pn(e) {
	return e.metaKey || e.ctrlKey;
}
function Fn(e) {
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
var In = (e, t) => `${String(e)}::${t}`;
function Ln({ id: e, rows: t, getRowId: n, columns: r, mode: i = "client", onQueryChange: a, selection: o = "multiple", actions: s = [], defaultSelectedIds: c = [], isExpandable: l, defaults: u, storage: d, initialFilters: f }) {
	let p = kn(e, {
		defaults: u,
		storage: d
	}), m = p.values, [h, g] = M(c), [_, v] = M(null), [y, b] = M(null), x = j(/* @__PURE__ */ new Map()), [S, C] = M(() => f ?? m.views.find((e) => e.id === m.activeView)?.state.filters ?? []), [w, T] = M(/* @__PURE__ */ new Set()), [E, ee] = M(/* @__PURE__ */ new Set()), [te, D] = M(/* @__PURE__ */ new Map()), [k, A] = M(null), [ne, N] = M(null), [re, P] = M(!1), F = (e) => r.find((t) => t.id === e), I = i === "client", ie = m.sorting.filter((e) => F(e.id)?.sortable !== !1 && F(e.id)), ae = I ? m.groupBy.filter((e) => F(e)?.groupable) : [], L = I ? tn(on(t, S, r), ie, r) : t, oe = ae.length ? cn(L, ae, r) : [], se = ln(L, oe, w, n), R = L.map(n), z = {
		sorting: ie,
		filters: S
	}, B = JSON.stringify(z), V = j(B);
	O(() => {
		i === "server" && V.current !== B && (V.current = B, a?.(JSON.parse(B)));
	}, [
		i,
		B,
		a
	]);
	let H = o !== "none" && m.selection ? o : "none", ce = new Set(R), U = H === "none" ? [] : h.filter((e) => ce.has(e)), le = Ht(U.length), W = (e) => U.includes(e), ue = y !== null && ce.has(y) ? y : R[0] ?? null, de = l !== void 0, fe = _n(r, {
		order: m.columnOrder,
		hidden: m.hiddenColumns,
		widths: m.columnWidths,
		pinned: m.pinned,
		leading: (H === "multiple" ? 40 : 0) + (de ? 40 : 0)
	}), G = (e) => {
		H !== "none" && g(H === "single" ? e.slice(-1) : [...new Set(e)]);
	}, pe = (e) => {
		H !== "none" && (g(H === "single" ? W(e) ? [] : [e] : W(e) ? U.filter((t) => t !== e) : [...U, e]), v(e));
	}, K = () => {
		H === "multiple" && g([...R]);
	}, me = () => g([]), he = (e, t) => {
		let n = R.indexOf(e), r = R.indexOf(t);
		return n < 0 || r < 0 ? [t] : R.slice(Math.min(n, r), Math.max(n, r) + 1);
	}, ge = (e) => {
		b(e), x.current.get(e)?.focus();
	}, _e = (e, t) => !e || Ut(e, t) || !(e.when ?? ["none"]).includes(Ht(t.length)) ? !1 : (e.onSelect(t), !0), ve = s.find((e) => e.isDefault), ye = (e) => {
		let t = W(e) ? U : [e];
		W(e) || G([e]), _e(ve, t);
	}, be = (e) => t.find((t) => n(t) === e), xe = (e) => l?.(e) ?? !1, Se = (e) => {
		let t = be(e);
		t && xe(t) && ee((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		});
	}, Ce = () => fe.map((e) => F(e.id)).filter(Boolean), we = () => L.filter((e) => W(n(e))), Te = async () => {
		let e = y === null ? void 0 : be(y), t = U.length ? we() : e ? [e] : [];
		if (t.length === 0) return "";
		let n = mn(t, Ce());
		try {
			await navigator.clipboard?.writeText(n);
		} catch {}
		return n;
	}, Ee = (e, t) => {
		if (!(e.target instanceof Element && e.target.closest(jn)) && (b(t), H !== "none")) {
			if (H === "multiple" && e.shiftKey && _ !== null) {
				let n = he(_, t);
				G(Pn(e) ? [...U, ...n] : n);
				return;
			}
			if (H === "multiple" && Pn(e)) {
				pe(t);
				return;
			}
			G([t]), v(t);
		}
	}, De = (e) => {
		let t = e.target;
		if (Mn(t)) return;
		let n = Nn(t), r = n ? Rn(n, R) : null;
		for (let t of Wt(s, le).flat()) if (t.shortcut && qt(e, t.shortcut)) {
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
			e.preventDefault(), K();
			return;
		}
		if (i && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "c") {
			if (window.getSelection?.()?.toString() || U.length === 0 && r === null) return;
			e.preventDefault(), Te();
			return;
		}
		if (r === null || t !== n && t.closest(jn)) return;
		let a = R.indexOf(r), o = (t) => {
			let n = R[Math.max(0, Math.min(R.length - 1, t))];
			if (n !== void 0) {
				if (e.preventDefault(), ge(n), e.shiftKey && H === "multiple") {
					let e = _ ?? r;
					v(e), G(he(e, n));
				} else !i && H !== "none" && (G([n]), v(n));
			}
		}, c = be(r);
		switch (e.key) {
			case "ArrowDown": return o(a + 1);
			case "ArrowUp": return o(a - 1);
			case "Home": return o(0);
			case "End": return o(R.length - 1);
			case "ArrowRight":
			case "ArrowLeft": {
				if (!c || !xe(c)) return;
				let n = lt(t);
				e.key === "ArrowRight" !== n !== E.has(r) && (e.preventDefault(), Se(r));
				return;
			}
			case " ":
				e.preventDefault(), H === "multiple" ? pe(r) : H === "single" && G([r]);
				return;
			case "Enter":
				e.preventDefault(), ye(r);
				return;
		}
	}, Oe = (e) => {
		let t = Nn(e.target);
		if (!t) {
			me();
			return;
		}
		let n = Rn(t, R);
		n !== null && (b(n), W(n) || (G([n]), v(n)));
	}, ke = () => ({
		hiddenColumns: m.hiddenColumns,
		columnOrder: m.columnOrder,
		columnWidths: m.columnWidths,
		pinned: m.pinned,
		sorting: m.sorting,
		filters: S,
		groupBy: m.groupBy,
		density: m.density
	}), Ae = m.views.find((e) => e.id === m.activeView) ?? null, q = (e, t) => {
		let r = te.get(In(n(e), t));
		if (r && r.row === e) return r.value;
		let i = F(t);
		return i ? Zt(i, e) : void 0;
	}, je = (e, t) => D((n) => {
		let r = new Map(n);
		return t === null ? r.delete(e) : r.set(e, t), r;
	});
	return {
		id: e,
		preferences: p,
		actions: s,
		columns: r,
		columnById: F,
		layout: fe,
		visibleRows: L,
		lines: se,
		getRowId: n,
		mode: H,
		dataMode: i,
		query: z,
		sorting: ie,
		toggleSort: (e, t = !1) => {
			let n = F(e);
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
		canGroup: I && r.some((e) => e.groupable),
		groupBy: ae,
		setGroupBy: (e) => {
			I && p.set({ groupBy: e.filter((e) => F(e)?.groupable) });
		},
		toggleGroup: (e) => T((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.add(e), n;
		}),
		isGroupExpanded: (e) => w.has(e),
		expandAllGroups: () => {
			let e = /* @__PURE__ */ new Set(), t = (n) => n.forEach((n) => (e.add(n.key), t(n.children)));
			t(oe), T(e);
		},
		collapseAllGroups: () => T(/* @__PURE__ */ new Set()),
		hasExpandableRows: de,
		canExpand: xe,
		isRowExpanded: (e) => E.has(e),
		toggleRowExpanded: Se,
		setColumnWidth: (e, t) => p.set((n) => ({ columnWidths: {
			...n.columnWidths,
			[e]: Math.round(t)
		} })),
		moveColumn: (e, t) => p.set((n) => ({ columnOrder: gn(hn(n.columnOrder, r.map((e) => e.id)), e, t) })),
		pinColumn: (e, t) => p.set((n) => ({ pinned: {
			...n.pinned,
			[e]: t
		} })),
		views: m.views,
		activeViewId: Ae?.id ?? null,
		isViewModified: Ae !== null && Fn(Ae.state) !== Fn(ke()),
		saveView: (e) => {
			let t = e.trim();
			if (!t) return null;
			let n = {
				id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
				name: t,
				state: ke()
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
			let t = ke();
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
		exportCsv: ({ scope: e = "all", separator: t, bom: n } = {}) => pn(e === "selection" ? we() : L, Ce(), {
			separator: t,
			bom: n
		}),
		copySelection: Te,
		editing: k,
		editError: ne,
		editPending: re,
		startEdit: (e, t) => {
			F(t)?.editable && be(e) && (N(null), A({
				rowId: e,
				columnId: t
			}));
		},
		cancelEdit: () => {
			A(null), N(null);
		},
		commitEdit: async (e) => {
			if (!k) return !1;
			let t = F(k.columnId), n = be(k.rowId);
			if (!t?.editable || !n) return !1;
			let r = t.editable.validate?.(e, n) ?? null;
			if (r) return N(r), !1;
			let i = In(k.rowId, t.id), a = q(n, t.id);
			je(i, {
				row: n,
				value: e
			}), P(!0);
			try {
				return await t.editable.onCommit(n, e, a), A(null), N(null), !0;
			} catch (e) {
				return je(i, null), N(e instanceof Error ? e.message : String(e)), !1;
			} finally {
				P(!1);
			}
		},
		cellValue: q,
		allowedMode: o,
		selectedIds: U,
		selectionState: le,
		visibleActions: Wt(s, le),
		isSelected: W,
		select: G,
		toggle: pe,
		selectAll: K,
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
			tabIndex: e === ue ? 0 : -1,
			ref: (t) => {
				t ? x.current.set(e, t) : x.current.delete(e);
			},
			onClick: (t) => Ee(t, e),
			onDoubleClick: (t) => {
				t.target instanceof Element && t.target.closest(jn) || ye(e);
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
			checked: W(e),
			tabIndex: -1,
			onChange: () => pe(e)
		}),
		getSelectAllProps: (e) => {
			let t = R.length > 0 && R.every((e) => W(e)), n = !t && U.length > 0;
			return {
				type: "checkbox",
				"aria-label": e,
				checked: t,
				ref: (e) => {
					e && (e.indeterminate = n);
				},
				onChange: () => t ? me() : K()
			};
		},
		onKeyDown: De,
		onContextMenu: Oe
	};
}
function Rn(e, t) {
	let n = e.dataset.gridRowId;
	return t.find((e) => String(e) === n) ?? null;
}
//#endregion
//#region src/hooks/useResizableWidth.ts
var zn = 1;
function Bn(e) {
	return `burgwiss-ui:width:${e}`;
}
function Vn(e, t, n) {
	return Math.round(Math.min(n, Math.max(t, e)));
}
function Hn(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, a = Vn(n, r, i);
	if (!t || typeof window > "u") return a;
	try {
		let e = JSON.parse(window.localStorage.getItem(Bn(t)) ?? "null"), n = e?.width;
		return e?.v !== zn || typeof n != "number" ? a : Number.isFinite(n) ? Vn(n, r, i) : a;
	} catch {
		return a;
	}
}
function Un(e) {
	let { storageKey: t, defaultWidth: n, minWidth: r, maxWidth: i } = e, [a, o] = M(() => Hn(e));
	O(() => {
		if (!t || typeof window > "u") return;
		let e = (e) => {
			e.key === Bn(t) && o(Hn({
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
			let n = Bn(t);
			e === null ? window.localStorage.removeItem(n) : window.localStorage.setItem(n, JSON.stringify({
				v: zn,
				width: e
			}));
		} catch {}
	};
	return {
		width: a,
		minWidth: r,
		maxWidth: i,
		setWidth: (e) => {
			let t = Vn(e, r, i);
			o(t), s(t);
		},
		reset: () => {
			o(Vn(n, r, i)), s(null);
		}
	};
}
//#endregion
//#region src/hooks/useFitScale.ts
var Wn = {
	mobile: 390,
	tablet: 834,
	desktop: 1280
};
function Gn(e) {
	let t = j(null), [n, r] = M(null);
	return O(() => {
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
var Kn = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function qn(e) {
	let [t, n] = M(e), [r, i] = M(e), [a, o] = M([]), s = (e, t, n) => {
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
		changes: Object.keys(e[c[0]]).flatMap((e) => c.filter((n) => !Kn(r[n][e], t[n][e])).map((t) => ({
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
var Jn = S.forwardRef(function({ className: e, size: t = "default", ...n }, i) {
	return /* @__PURE__ */ b(r.Root, {
		ref: i,
		"data-slot": "avatar",
		"data-size": t,
		className: J("group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6", e),
		...n
	});
});
Jn.displayName = "Avatar";
var Yn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(r.Image, {
		ref: n,
		"data-slot": "avatar-image",
		className: J("aspect-square size-full", e),
		...t
	});
});
Yn.displayName = "AvatarImage";
var Xn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(r.Fallback, {
		ref: n,
		"data-slot": "avatar-fallback",
		className: J("flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs", e),
		...t
	});
});
Xn.displayName = "AvatarFallback";
var Zn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("span", {
		ref: n,
		"data-slot": "avatar-badge",
		className: J("absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none", "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden", "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2", "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2", e),
		...t
	});
});
Zn.displayName = "AvatarBadge";
var Qn = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "avatar-group",
		className: J("group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", e),
		...t
	});
});
Qn.displayName = "AvatarGroup";
var $n = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "avatar-group-count",
		className: J("relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3", e),
		...t
	});
});
$n.displayName = "AvatarGroupCount";
//#endregion
//#region src/atoms/AudioLevelMeter/AudioLevelMeter.tsx
function er({ level: e, label: t, segments: n = 12, className: r }) {
	let i = Math.round(Math.min(1, Math.max(0, Number.isFinite(e) ? e : 0)) * 100), a = Math.round(i / 100 * n);
	return /* @__PURE__ */ b("div", {
		role: "meter",
		"aria-label": t,
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-valuenow": i,
		className: J("flex h-2 w-full items-stretch gap-0.5", r),
		children: Array.from({ length: n }, (e, t) => /* @__PURE__ */ b("span", {
			"aria-hidden": "true",
			className: J("flex-1 rounded-full transition-colors duration-75", t < a ? "bg-success" : "bg-muted")
		}, t))
	});
}
//#endregion
//#region src/atoms/Badge/Badge.tsx
var tr = "inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:pointer-events-none", nr = N(tr, {
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
}), rr = {
	success: "border-success/30 bg-success/10 text-success-tint-foreground",
	warning: "border-warning/40 bg-warning/10 text-warning-tint-foreground",
	destructive: "border-destructive/30 bg-destructive/10 text-destructive-tint-foreground",
	neutral: "border-border bg-card text-foreground",
	muted: "border-border bg-muted text-muted-foreground",
	faint: "border-border/60 bg-muted/50 text-muted-foreground"
}, ir = {
	success: "bg-success",
	warning: "bg-warning",
	destructive: "bg-destructive",
	neutral: "bg-muted-foreground",
	muted: "bg-muted-foreground/60",
	faint: "bg-muted-foreground/40"
}, ar = S.forwardRef(function({ className: e, variant: t, tone: n, dot: r = !1, asChild: i = !1, children: a, ...o }, s) {
	let c = i ? h.Root : "span", l = J(n ? J(tr, rr[n]) : nr({ variant: t }), e);
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
			className: J("size-1.5 shrink-0 rounded-full", ir[n]),
			"aria-hidden": "true"
		}) : null, a]
	});
});
ar.displayName = "Badge";
//#endregion
//#region src/atoms/Tooltip/Tooltip.tsx
function or({ delayDuration: e = 200, ...t }) {
	return /* @__PURE__ */ b(v.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
function sr({ ...e }) {
	return /* @__PURE__ */ b(v.Root, {
		"data-slot": "tooltip",
		...e
	});
}
var cr = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(v.Trigger, {
		ref: t,
		"data-slot": "tooltip-trigger",
		...e
	});
});
cr.displayName = "TooltipTrigger";
var lr = S.forwardRef(function({ className: e, sideOffset: t = 6, children: n, ...r }, i) {
	return /* @__PURE__ */ b(v.Portal, { children: /* @__PURE__ */ b(v.Content, {
		ref: i,
		"data-slot": "tooltip-content",
		sideOffset: t,
		className: J("z-50 overflow-hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0", e),
		...r,
		children: n
	}) });
});
lr.displayName = "TooltipContent";
//#endregion
//#region src/atoms/Button/Button.tsx
var ur = N("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:not-aria-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
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
}), dr = /* @__PURE__ */ new Set([
	"icon",
	"icon-xs",
	"icon-sm",
	"icon-lg"
]);
function fr(e) {
	e.preventDefault();
}
function pr(e) {
	let t = {};
	for (let [n, r] of Object.entries(e)) n === "disabled" || /^on[A-Z]/.test(n) || (t[n] = r);
	return {
		...t,
		"aria-disabled": !0,
		onClick: fr
	};
}
var Z = S.forwardRef(function({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, tooltip: i, tooltipSide: a = "top", "aria-label": o, ...s }, c) {
	let l = r ? h.Root : "button", u = dr.has(n ?? "default"), d = i ?? (u ? o : void 0), f = o ?? (u && typeof i == "string" ? i : void 0), p = d != null && d !== "", m = p && s.disabled === !0 ? pr(s) : s, g = /* @__PURE__ */ b(l, {
		ref: c,
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		"aria-label": f,
		className: J(ur({
			variant: t,
			size: n,
			className: e
		})),
		...m
	});
	return p ? /* @__PURE__ */ b(or, { children: /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
		asChild: !0,
		children: g
	}), /* @__PURE__ */ b(lr, {
		side: a,
		children: d
	})] }) }) : g;
});
Z.displayName = "Button";
//#endregion
//#region src/atoms/Checkbox/Checkbox.tsx
var mr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(i.Root, {
		ref: n,
		"data-slot": "checkbox",
		className: J("peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background text-primary shadow-sm transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20", e),
		...t,
		children: /* @__PURE__ */ b(i.Indicator, {
			"data-slot": "checkbox-indicator",
			className: J("flex items-center justify-center text-current"),
			children: /* @__PURE__ */ b(z, {
				className: "h-3 w-3",
				"aria-hidden": "true"
			})
		})
	});
});
mr.displayName = "Checkbox";
//#endregion
//#region src/atoms/Chip/Chip.tsx
var hr = (e) => J("inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 text-sm transition-colors", e ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground");
function gr(e) {
	if (e.multi) {
		let { id: t, checked: n, onChange: r, ariaLabel: i, children: a, className: o } = e;
		return /* @__PURE__ */ x("label", {
			htmlFor: t,
			"data-state": n ? "on" : "off",
			className: J(hr(n), "cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1", o),
			children: [
				/* @__PURE__ */ b("input", {
					id: t,
					type: "checkbox",
					className: "sr-only",
					checked: n,
					onChange: (e) => r(e.target.checked),
					"aria-label": i
				}),
				n && /* @__PURE__ */ b(z, {
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
		className: J(hr(t), "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none", r),
		...i,
		children: [t && /* @__PURE__ */ b(z, {
			className: "size-3.5 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ b("span", { children: n })]
	});
}
function _r({ children: e, ariaLabel: t, className: n, ...r }) {
	let i = S.useRef(null), [a, o] = S.useState(0), s = S.useCallback(() => Array.from(i.current?.querySelectorAll("[data-chip]") ?? []), []);
	S.useEffect(() => {
		s().forEach((e, t) => {
			e.tabIndex = t === a ? 0 : -1;
		});
	});
	function c(e) {
		let t = s();
		if (t.length === 0) return;
		let n = a, { forward: r } = ut(e.currentTarget);
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
		className: J("flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden", n),
		...r,
		children: e
	});
}
//#endregion
//#region src/atoms/CopyLinkButton/CopyLinkButton.tsx
function vr({ url: e, label: t, copiedLabel: n, size: r = "icon", hint: i }) {
	let [a, o] = S.useState(!1), s = S.useRef(null);
	S.useEffect(() => () => {
		s.current !== null && window.clearTimeout(s.current);
	}, []);
	let c = S.useCallback(() => {
		navigator.clipboard?.writeText && navigator.clipboard.writeText(e).then(() => {
			o(!0), s.current !== null && window.clearTimeout(s.current), s.current = window.setTimeout(() => o(!1), 2e3);
		}, () => {});
	}, [e]);
	return /* @__PURE__ */ x(or, { children: [
		/* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
			asChild: !0,
			children: /* @__PURE__ */ x(Z, {
				type: "button",
				variant: "ghost",
				size: r,
				onClick: c,
				"aria-label": a ? n : t,
				children: [a ? /* @__PURE__ */ b(z, {
					className: "size-4 text-success",
					"aria-hidden": "true"
				}) : /* @__PURE__ */ b(fe, {
					className: "size-4",
					"aria-hidden": "true"
				}), r === "sm" ? /* @__PURE__ */ b("span", { children: a ? n : t }) : null]
			})
		}), /* @__PURE__ */ b(lr, { children: a ? n : t })] }),
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
var yr = E(function({ label: e, icon: t, destructive: n = !1, className: r, type: i = "button", ...a }, o) {
	return /* @__PURE__ */ b(or, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
			asChild: !0,
			children: /* @__PURE__ */ b("button", {
				ref: o,
				type: i,
				"aria-label": e,
				className: J("inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:bg-muted hover:text-foreground", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", n && "hover:bg-destructive hover:text-destructive-foreground", r),
				...a,
				children: t
			})
		}), /* @__PURE__ */ b(lr, { children: e })] })
	});
}), br = E(function({ label: e, icon: t, value: n, as: r, className: i, ...a }, o) {
	return /* @__PURE__ */ b(or, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
			asChild: !0,
			children: /* @__PURE__ */ b(r, {
				ref: o,
				value: n,
				"aria-label": e,
				className: J("inline-flex min-h-9 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors", "pointer-coarse:min-h-11 pointer-coarse:min-w-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "aria-checked:bg-primary aria-checked:text-primary-foreground aria-checked:shadow-sm", "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm", i),
				...a,
				children: t
			})
		}), /* @__PURE__ */ b(lr, { children: e })] })
	});
});
//#endregion
//#region src/lib/initials.ts
function xr(e) {
	let t = e.trim().split(/\s+/).filter(Boolean), n = t[0];
	if (n === void 0) return "?";
	if (t.length === 1) return n.charAt(0).toUpperCase();
	let r = t[t.length - 1] ?? n;
	return (n.charAt(0) + r.charAt(0)).toUpperCase();
}
//#endregion
//#region src/atoms/InitialsAvatar/InitialsAvatar.tsx
var Sr = {
	sm: "size-9 text-xs",
	md: "size-10 text-sm",
	lg: "size-12 text-base"
};
function Cr(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = (t * 31 + e.charCodeAt(n)) % 360;
	return t;
}
function wr(e) {
	return {
		backgroundColor: `hsl(${e} 60% 90%)`,
		color: `hsl(${e} 55% 26%)`
	};
}
function Tr({ name: e, size: t = "md", colored: n = !1, className: r }) {
	let i = n ? wr(Cr(e)) : void 0;
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		"data-testid": "initials-avatar",
		style: i,
		className: J("inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none", !n && "bg-muted text-foreground", Sr[t], r),
		children: xr(e)
	});
}
//#endregion
//#region src/atoms/Input/Input.tsx
var Er = S.forwardRef(({ className: e, type: t, ...n }, r) => /* @__PURE__ */ b("input", {
	type: t,
	ref: r,
	"data-slot": "input",
	className: J("h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-coarse:min-h-11", e),
	...n
}));
Er.displayName = "Input";
//#endregion
//#region src/atoms/IntegerInput/IntegerInput.tsx
var Dr = S.forwardRef(function({ value: e, onValueChange: t, emptyValue: n = 0, onBlur: r, ...i }, a) {
	let [o, s] = S.useState(() => Number.isFinite(e) ? String(e) : "");
	return (o.trim() === "" ? n : Number(o)) !== e && s(Number.isFinite(e) ? String(e) : ""), /* @__PURE__ */ b(Er, {
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
}), Or = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(u.Root, {
		ref: n,
		"data-slot": "label",
		className: J("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...t
	});
});
Or.displayName = "Label";
//#endregion
//#region src/atoms/PasswordInput/PasswordInput.tsx
var kr = E(function({ className: e, labels: t, ...n }, r) {
	let [i, a] = M(!1);
	return /* @__PURE__ */ x("div", {
		className: "relative",
		children: [/* @__PURE__ */ b(Er, {
			ref: r,
			type: i ? "text" : "password",
			className: J("pe-10", e),
			...n
		}), /* @__PURE__ */ b(yr, {
			label: i ? t.hide : t.show,
			"aria-pressed": i,
			onClick: () => a((e) => !e),
			icon: b(i ? he : me, {
				className: "size-4",
				"aria-hidden": "true"
			}),
			className: "absolute inset-y-0 end-0 my-auto me-1 h-7 w-7"
		})]
	});
}), Ar = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Root, {
		ref: n,
		"data-slot": "radio-group",
		className: J("grid gap-2", e),
		...t
	});
});
Ar.displayName = "RadioGroup";
var jr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Item, {
		ref: n,
		"data-slot": "radio-group-item",
		className: J("aspect-square size-4 rounded-full border border-input text-primary shadow-sm", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", e),
		...t,
		children: /* @__PURE__ */ b(f.Indicator, {
			className: "flex items-center justify-center",
			children: /* @__PURE__ */ b("span", { className: "size-2 rounded-full bg-primary" })
		})
	});
});
jr.displayName = "RadioGroupItem";
//#endregion
//#region src/atoms/Separator/Separator.tsx
var Mr = S.forwardRef(function({ className: e, orientation: t = "horizontal", decorative: n = !0, ...r }, i) {
	return /* @__PURE__ */ b(m.Root, {
		ref: i,
		"data-slot": "separator",
		decorative: n,
		orientation: t,
		className: J("shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px", e),
		...r
	});
});
Mr.displayName = "Separator";
//#endregion
//#region src/atoms/Switch/Switch.tsx
var Nr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(g.Root, {
		ref: n,
		"data-slot": "switch",
		className: J("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none", "disabled:cursor-not-allowed disabled:opacity-50", "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted", e),
		...t,
		children: /* @__PURE__ */ b(g.Thumb, { className: J("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-transform", "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0", "rtl:data-[state=checked]:-translate-x-4") })
	});
});
Nr.displayName = "Switch";
//#endregion
//#region src/atoms/Textarea/Textarea.tsx
var Pr = S.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ b("textarea", {
	ref: n,
	"data-slot": "textarea",
	className: J("flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40", e),
	...t
}));
Pr.displayName = "Textarea";
//#endregion
//#region src/molecules/Alert/Alert.tsx
var Fr = N("group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-start text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pe-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current"
	} },
	defaultVariants: { variant: "default" }
});
function Ir({ className: e, variant: t, ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert",
		role: "alert",
		className: J(Fr({ variant: t }), e),
		...n
	});
}
function Lr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-title",
		className: J("font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", e),
		...t
	});
}
function Rr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-description",
		className: J("text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4", e),
		...t
	});
}
function zr({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "alert-action",
		className: J("absolute end-2 top-2", e),
		...t
	});
}
//#endregion
//#region src/molecules/AdmissionRequests/AdmissionRequests.tsx
function Br({ requests: e, onAdmit: t, onDeny: n, labels: r, max: i = 3, onShowAll: a, className: o }) {
	let s = j(null), c = k();
	if (e.length === 0) return null;
	let l = e.slice(0, i), u = e.length - l.length, d = (e, t, n) => {
		e(t), requestAnimationFrame(() => {
			let e = s.current?.querySelectorAll("[data-admit]");
			(e?.[Math.min(n, (e?.length ?? 1) - 1)])?.focus();
		});
	};
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": c,
		className: J("w-full max-w-sm rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg", o),
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ b(pe, {
					"aria-hidden": "true",
					className: "mt-0.5 size-4 shrink-0 text-muted-foreground"
				}), /* @__PURE__ */ x("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ b("h2", {
						id: c,
						className: "text-sm font-semibold",
						children: r.title
					}), r.hint && /* @__PURE__ */ b("p", {
						className: "text-xs text-muted-foreground",
						children: r.hint
					})]
				})]
			}),
			/* @__PURE__ */ b("ul", {
				ref: s,
				"aria-live": "polite",
				className: "mt-2 space-y-1",
				children: l.map((e, i) => /* @__PURE__ */ x("li", {
					className: "flex items-center gap-2 rounded-lg px-1 py-1",
					children: [
						/* @__PURE__ */ b(Tr, {
							name: e.name,
							colored: !0,
							size: "sm"
						}),
						/* @__PURE__ */ x("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ b("p", {
								className: "truncate text-sm font-medium",
								children: e.name
							}), e.detail && /* @__PURE__ */ b("p", {
								className: "truncate text-xs text-muted-foreground",
								children: e.detail
							})]
						}),
						/* @__PURE__ */ b(Z, {
							type: "button",
							size: "icon",
							variant: "outline",
							"aria-label": r.deny(e.name),
							disabled: e.busy,
							onClick: () => d(n, e.id, i),
							className: "rounded-full",
							children: /* @__PURE__ */ b($e, { "aria-hidden": "true" })
						}),
						/* @__PURE__ */ b(Z, {
							type: "button",
							size: "icon",
							"aria-label": r.admit(e.name),
							disabled: e.busy,
							"data-admit": "",
							onClick: () => d(t, e.id, i),
							className: "rounded-full",
							children: /* @__PURE__ */ b(z, { "aria-hidden": "true" })
						})
					]
				}, e.id))
			}),
			(u > 0 || a) && /* @__PURE__ */ x("div", {
				className: "mt-1 flex items-center justify-between gap-2 ps-1",
				children: [u > 0 && r.more && /* @__PURE__ */ b("p", {
					className: "text-xs text-muted-foreground",
					children: r.more(u)
				}), a && r.showAll && /* @__PURE__ */ b(Z, {
					type: "button",
					variant: "link",
					size: "sm",
					className: "ms-auto",
					onClick: a,
					children: r.showAll
				})]
			})
		]
	});
}
//#endregion
//#region src/molecules/AlertDialog/AlertDialog.tsx
function Vr({ ...e }) {
	return /* @__PURE__ */ b(n.Root, {
		"data-slot": "alert-dialog",
		...e
	});
}
var Hr = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(n.Trigger, {
		ref: t,
		"data-slot": "alert-dialog-trigger",
		...e
	});
});
Hr.displayName = "AlertDialogTrigger";
function Ur({ ...e }) {
	return /* @__PURE__ */ b(n.Portal, {
		"data-slot": "alert-dialog-portal",
		...e
	});
}
var Wr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Overlay, {
		ref: r,
		"data-slot": "alert-dialog-overlay",
		className: J("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
Wr.displayName = "AlertDialogOverlay";
var Gr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ x(Ur, { children: [/* @__PURE__ */ b(Wr, {}), /* @__PURE__ */ b(n.Content, {
		ref: r,
		"data-slot": "alert-dialog-content",
		className: J("fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	})] });
});
Gr.displayName = "AlertDialogContent";
var Kr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "alert-dialog-header",
		className: J("flex flex-col gap-2 text-start", e),
		...t
	});
});
Kr.displayName = "AlertDialogHeader";
var qr = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b("div", {
		ref: n,
		"data-slot": "alert-dialog-footer",
		className: J("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
});
qr.displayName = "AlertDialogFooter";
var Jr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Title, {
		ref: r,
		"data-slot": "alert-dialog-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
});
Jr.displayName = "AlertDialogTitle";
var Yr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Description, {
		ref: r,
		"data-slot": "alert-dialog-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
});
Yr.displayName = "AlertDialogDescription";
var Xr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Action, {
		ref: r,
		"data-slot": "alert-dialog-action",
		className: J("inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
Xr.displayName = "AlertDialogAction";
var Zr = S.forwardRef(function({ className: e, ...t }, r) {
	return /* @__PURE__ */ b(n.Cancel, {
		ref: r,
		"data-slot": "alert-dialog-cancel",
		className: J("inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none", e),
		...t
	});
});
Zr.displayName = "AlertDialogCancel";
//#endregion
//#region src/molecules/Dialog/Dialog.tsx
function Qr({ ...e }) {
	return /* @__PURE__ */ b(s.Root, {
		"data-slot": "dialog",
		...e
	});
}
function $r({ ...e }) {
	return /* @__PURE__ */ b(s.Trigger, {
		"data-slot": "dialog-trigger",
		...e
	});
}
function ei({ ...e }) {
	return /* @__PURE__ */ b(s.Portal, {
		"data-slot": "dialog-portal",
		...e
	});
}
var ti = S.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ b(s.Overlay, {
	ref: n,
	"data-slot": "dialog-overlay",
	className: J("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
	...t
}));
ti.displayName = s.Overlay.displayName;
var ni = S.forwardRef(({ className: e, children: t, closeLabel: n, ...r }, i) => /* @__PURE__ */ x(ei, { children: [/* @__PURE__ */ b(ti, {}), /* @__PURE__ */ x(s.Content, {
	ref: i,
	"data-slot": "dialog-content",
	className: J("fixed top-4 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 translate-y-0 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-[var(--motion-duration,200ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:top-1/2 sm:-translate-y-1/2", e),
	...r,
	children: [t, /* @__PURE__ */ b(s.Close, {
		"aria-label": n,
		className: "absolute end-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
		children: /* @__PURE__ */ b($e, {
			className: "h-4 w-4",
			"aria-hidden": "true"
		})
	})]
})] }));
ni.displayName = s.Content.displayName;
function ri({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "dialog-header",
		className: J("flex flex-col gap-2 text-start", e),
		...t
	});
}
function ii({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "dialog-footer",
		className: J("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...t
	});
}
function ai({ className: e, ...t }) {
	return /* @__PURE__ */ b(s.Title, {
		"data-slot": "dialog-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
}
function oi({ className: e, ...t }) {
	return /* @__PURE__ */ b(s.Description, {
		"data-slot": "dialog-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
}
function si({ ...e }) {
	return /* @__PURE__ */ b(s.Close, {
		"data-slot": "dialog-close",
		...e
	});
}
//#endregion
//#region src/molecules/ImageAdjustDialog/ImageAdjustDialog.tsx
var ci = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]), li = 64;
function ui({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	return /* @__PURE__ */ b(Qr, {
		open: e !== null,
		onOpenChange: (e) => {
			e || r();
		},
		children: /* @__PURE__ */ x(ni, {
			className: "max-w-2xl",
			closeLabel: i.close,
			children: [/* @__PURE__ */ x(ri, { children: [/* @__PURE__ */ b(ai, { children: i.title }), /* @__PURE__ */ b(oi, { children: i.description(t) })] }), e !== null && /* @__PURE__ */ b(di, {
				file: e,
				maxDimension: t,
				onApply: n,
				onCancel: r,
				labels: i
			}, `${e.name}:${e.size}:${e.lastModified}`)]
		})
	});
}
function di({ file: e, maxDimension: t, onApply: n, onCancel: r, labels: i }) {
	let [a, o] = M(null), [s, c] = M(null), [l, u] = M(String(t)), [d, f] = M(.9), [p, m] = M(!1), [h, g] = M(null), _ = j(null), v = ci.has(e.type), S = Number.parseInt(l, 10), C = Number.isFinite(S) && S > 0 ? Math.min(t, Math.max(li, S)) : t;
	O(() => {
		if (typeof URL.createObjectURL != "function") return;
		let t = URL.createObjectURL(e);
		return o(t), () => URL.revokeObjectURL(t);
	}, [e]);
	let w = ne(() => {
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
				children: [/* @__PURE__ */ b(Or, {
					htmlFor: "image-adjust-max",
					children: i.maxDimensionLabel
				}), /* @__PURE__ */ b(Er, {
					id: "image-adjust-max",
					type: "number",
					min: li,
					max: t,
					step: 64,
					value: l,
					onChange: (e) => u(e.target.value),
					onBlur: () => u(String(C))
				})]
			}), e.type !== "image/png" && /* @__PURE__ */ x("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ b(Or, {
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
	}), /* @__PURE__ */ x(ii, { children: [/* @__PURE__ */ b(Z, {
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
var fi = /* @__PURE__ */ new Set([
	"image/png",
	"image/jpeg",
	"image/webp"
]);
function pi(e) {
	return !fi.has(e.type) || typeof URL.createObjectURL != "function" ? Promise.resolve(null) : new Promise((t) => {
		let n = URL.createObjectURL(e), r = new Image(), i = !1, a = (e) => {
			i || (i = !0, clearTimeout(o), URL.revokeObjectURL(n), t(e));
		}, o = setTimeout(() => a(null), 800);
		r.onload = () => a({
			w: r.naturalWidth,
			h: r.naturalHeight
		}), r.onerror = () => a(null), r.src = n;
	});
}
function mi(e) {
	let { labels: t, mimes: n, maxSizeMb: r, ariaLabel: i, inputId: a, ariaDescribedBy: o, required: s, disabled: c, externalError: l, imageAdjust: u } = e, d = j(null), [f, p] = M(null), [m, h] = M(null), [g, _] = M(null), [v, y] = M(null), S = (e) => {
		switch (Bt(e, {
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
			let t = await pi(e);
			if (t !== null && Math.max(t.w, t.h) > u.maxDimension) {
				y(e);
				return;
			}
		}
		await C(e);
	}, T = e.onSelect ? e.selectedFileName === void 0 ? g : e.selectedFileName : null;
	return /* @__PURE__ */ x("div", { children: [
		/* @__PURE__ */ x("label", {
			className: J("flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring", c ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-primary"),
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
		u && /* @__PURE__ */ b(ui, {
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
var hi = {
	pending: "muted",
	clean: "success",
	infected: "destructive",
	error: "destructive"
};
function gi({ items: e, labels: t, onDelete: n, formatSize: r = Rt, className: i }) {
	return e.length === 0 ? /* @__PURE__ */ b("p", {
		className: J("rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground", i),
		children: t.empty
	}) : /* @__PURE__ */ b("ul", {
		className: J("divide-y divide-border rounded-md border border-border bg-card text-card-foreground", i),
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
						i !== void 0 && t.scan ? /* @__PURE__ */ b(ar, {
							tone: hi[i],
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
						e.canDelete && n ? /* @__PURE__ */ b(yr, {
							label: t.remove(e.name),
							icon: /* @__PURE__ */ b($e, {
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
function _i({ ...e }) {
	return /* @__PURE__ */ b("nav", {
		"data-slot": "breadcrumb",
		...e
	});
}
function vi({ className: e, ...t }) {
	return /* @__PURE__ */ b("ol", {
		"data-slot": "breadcrumb-list",
		className: J("flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5", e),
		...t
	});
}
function yi({ className: e, ...t }) {
	return /* @__PURE__ */ b("li", {
		"data-slot": "breadcrumb-item",
		className: J("inline-flex items-center gap-1.5", e),
		...t
	});
}
function bi({ className: e, asChild: t, children: n, ...r }) {
	if (t) {
		let t = S.Children.only(n);
		return S.cloneElement(t, { className: J("rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", t.props.className, e) });
	}
	return /* @__PURE__ */ b("a", {
		"data-slot": "breadcrumb-link",
		className: J("rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center", e),
		...r,
		children: n
	});
}
function xi({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "breadcrumb-page",
		"aria-current": "page",
		className: J("font-medium text-foreground", e),
		...t
	});
}
function Si({ children: e, className: t, ...n }) {
	return /* @__PURE__ */ b("li", {
		"data-slot": "breadcrumb-separator",
		role: "presentation",
		"aria-hidden": "true",
		className: J("[&>svg]:size-3.5", t),
		...n,
		children: e ?? /* @__PURE__ */ b(H, { className: "rtl:-scale-x-100" })
	});
}
function Ci({ className: e, srLabel: t, ...n }) {
	return /* @__PURE__ */ x("span", {
		"data-slot": "breadcrumb-ellipsis",
		role: "presentation",
		className: J("flex h-9 w-9 items-center justify-center", e),
		...n,
		children: [/* @__PURE__ */ b(Me, {
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
function wi({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card",
		"data-size": t,
		className: J("group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl", e),
		...n
	});
}
function Ti({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-header",
		className: J("group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3", e),
		...t
	});
}
function Ei({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-title",
		className: J("font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm", e),
		...t
	});
}
function Di({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
}
function Oi({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-action",
		className: J("col-start-2 row-span-2 row-start-1 self-start justify-self-end", e),
		...t
	});
}
function ki({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-content",
		className: J("px-4 group-data-[size=sm]/card:px-3", e),
		...t
	});
}
function Ai({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "card-footer",
		className: J("flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3", e),
		...t
	});
}
//#endregion
//#region src/molecules/Collapsible/Collapsible.tsx
var ji = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.Root, {
		ref: t,
		"data-slot": "collapsible",
		...e
	});
});
ji.displayName = "Collapsible";
var Mi = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.CollapsibleTrigger, {
		ref: t,
		"data-slot": "collapsible-trigger",
		...e
	});
});
Mi.displayName = "CollapsibleTrigger";
var Ni = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(a.CollapsibleContent, {
		ref: t,
		"data-slot": "collapsible-content",
		...e
	});
});
Ni.displayName = "CollapsibleContent";
//#endregion
//#region src/lib/color.ts
function Pi(e) {
	return e <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4;
}
function Fi(e) {
	return e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055;
}
function Ii(e) {
	return Math.max(0, Math.min(1, e));
}
function Li(e) {
	let t = e.trim().match(/^#?([0-9a-f]{6})$/i);
	if (!t || !t[1]) return null;
	let n = parseInt(t[1], 16);
	return {
		r: (n >> 16 & 255) / 255,
		g: (n >> 8 & 255) / 255,
		b: (n & 255) / 255
	};
}
function Ri(e, t, n) {
	let r = (e) => Math.round(Ii(e) * 255).toString(16).padStart(2, "0");
	return `#${r(e)}${r(t)}${r(n)}`;
}
function zi(e) {
	let t = e.trim().match(/^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?)\s*(?:\/\s*[0-9.]+%?\s*)?\)$/i);
	if (!t || !t[1] || !t[2] || !t[3]) return null;
	let n = t[1], r = t[2], i = t[3], a = n.endsWith("%") ? Number(n.slice(0, -1)) / 100 : Number(n), o = r.endsWith("%") ? Number(r.slice(0, -1)) / 100 * .4 : Number(r), s = Number(i.replace(/deg$/i, ""));
	return !Number.isFinite(a) || !Number.isFinite(o) || !Number.isFinite(s) ? null : {
		L: a,
		C: o,
		H: s
	};
}
function Bi(e, t, n) {
	let r = e + .3963377774 * t + .2158037573 * n, i = e - .1055613458 * t - .0638541728 * n, a = e - .0894841775 * t - 1.291485548 * n, o = r ** 3, s = i ** 3, c = a ** 3;
	return {
		r: 4.0767416621 * o - 3.3077115913 * s + .2309699292 * c,
		g: -1.2684380046 * o + 2.6097574011 * s - .3413193965 * c,
		bl: -.0041960863 * o - .7034186147 * s + 1.707614701 * c
	};
}
function Vi(e, t, n) {
	let r = .4122214708 * e + .5363325363 * t + .0514459929 * n, i = .2119034982 * e + .6806995451 * t + .1073969566 * n, a = .0883024619 * e + .2817188376 * t + .6299787005 * n, o = Math.cbrt(r), s = Math.cbrt(i), c = Math.cbrt(a);
	return {
		L: .2104542553 * o + .793617785 * s - .0040720468 * c,
		a: 1.9779984951 * o - 2.428592205 * s + .4505937099 * c,
		b: .0259040371 * o + .7827717662 * s - .808675766 * c
	};
}
function Hi(e) {
	let t = zi(e);
	if (!t) return null;
	let n = t.H * Math.PI / 180, r = t.C * Math.cos(n), i = t.C * Math.sin(n), a = Bi(t.L, r, i);
	return Ri(Fi(Ii(a.r)), Fi(Ii(a.g)), Fi(Ii(a.bl)));
}
function Ui(e) {
	let t = Li(e);
	if (!t) return "oklch(0 0 0)";
	let n = Vi(Pi(t.r), Pi(t.g), Pi(t.b)), r = Math.hypot(n.a, n.b), i = Math.atan2(n.b, n.a) * 180 / Math.PI;
	i < 0 && (i += 360);
	let a = (e, t = 3) => Number(e.toFixed(t));
	return `oklch(${a(n.L)} ${a(r)} ${a(i, 2)})`;
}
//#endregion
//#region src/molecules/ColorPicker/ColorPicker.tsx
function Wi({ id: e, value: t, onChange: n, swatchAriaLabel: r, ariaInvalid: i, className: a }) {
	let o = Hi(t) ?? "#000000";
	return /* @__PURE__ */ x("div", {
		className: J("flex items-stretch gap-2", a),
		children: [/* @__PURE__ */ b("input", {
			type: "color",
			value: o,
			onChange: (e) => {
				n(Ui(e.target.value));
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
function Gi({ items: e, onItemClick: t, labels: n, className: r }) {
	let i = k(), a = e.filter((e) => e.done).length, o = e.every((e) => e.done || e.optional);
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": i,
		className: J("flex flex-col gap-2", r),
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
						e.done ? /* @__PURE__ */ b(z, {
							className: "size-4 shrink-0 text-success",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ b(W, {
							className: "size-4 shrink-0 text-muted-foreground",
							"aria-hidden": "true"
						}),
						/* @__PURE__ */ b("span", {
							className: J("truncate", !e.done && "text-muted-foreground"),
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
var Ki = {
	real: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
	cmdk: "data-[selected=true]:ring-2 data-[selected=true]:ring-ring data-[selected=true]:ring-inset",
	headless: "data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-inset"
};
//#endregion
//#region src/molecules/Combobox/Combobox.tsx
function qi({ id: e, value: t, options: n, onChange: r, placeholder: i, searchPlaceholder: a, emptyLabel: o, ariaInvalid: s, ariaDescribedby: c }) {
	let [l, u] = M(""), d = ne(() => {
		let e = l.trim().toLowerCase();
		return e === "" ? n : n.filter((t) => t.toLowerCase().includes(e));
	}, [l, n]);
	return /* @__PURE__ */ b(et, {
		value: t,
		onChange: (e) => {
			e !== null && r(e);
		},
		immediate: !0,
		children: /* @__PURE__ */ x("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ b(nt, {
					id: e,
					"aria-invalid": s ? !0 : void 0,
					"aria-describedby": c,
					displayValue: (e) => e,
					onChange: (e) => u(e.target.value),
					placeholder: i ?? a,
					className: J("block w-full rounded-md border border-input bg-background px-3 py-2 pe-10 text-sm text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none", "aria-[invalid=true]:border-destructive")
				}),
				/* @__PURE__ */ b(tt, {
					className: "absolute inset-y-0 end-0 flex items-center px-2 text-muted-foreground focus:outline-none focus-visible:text-foreground",
					"aria-label": a ?? i ?? o,
					children: /* @__PURE__ */ b(U, {
						className: "h-4 w-4",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ b(it, {
					className: "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-sm shadow-md focus:outline-none",
					transition: !0,
					children: d.length === 0 ? /* @__PURE__ */ b("div", {
						className: "px-3 py-2 text-muted-foreground",
						children: o
					}) : d.map((e) => /* @__PURE__ */ x(rt, {
						value: e,
						className: J("group flex cursor-pointer items-center gap-2 px-3 py-2 text-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground", Ki.headless),
						children: [/* @__PURE__ */ b(z, {
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
function Ji({ className: e, ...t }) {
	return /* @__PURE__ */ b(at, {
		"data-slot": "command",
		className: J("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", e),
		...t
	});
}
function Yi({ title: e, description: t, closeLabel: n, children: r, className: i, shouldFilter: a, ...o }) {
	return /* @__PURE__ */ b(Qr, {
		...o,
		children: /* @__PURE__ */ x(ni, {
			closeLabel: n,
			className: J("overflow-hidden p-0", i),
			children: [/* @__PURE__ */ x(ri, {
				className: "sr-only",
				children: [/* @__PURE__ */ b(ai, { children: e }), /* @__PURE__ */ b(oi, { children: t })]
			}), /* @__PURE__ */ b(Ji, {
				shouldFilter: a,
				className: "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
				children: r
			})]
		})
	});
}
function Xi({ className: e, ...t }) {
	return /* @__PURE__ */ x("div", {
		"data-slot": "command-input-wrapper",
		className: "flex items-center gap-2 border-b border-border px-3",
		children: [/* @__PURE__ */ b(Ue, {
			className: "size-4 shrink-0 opacity-50",
			"aria-hidden": "true"
		}), /* @__PURE__ */ b(at.Input, {
			"data-slot": "command-input",
			className: J("flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", e),
			...t
		})]
	});
}
function Zi({ className: e, ...t }) {
	return /* @__PURE__ */ b(at.List, {
		"data-slot": "command-list",
		className: J("max-h-[300px] overflow-x-hidden overflow-y-auto", e),
		...t
	});
}
function Qi({ ...e }) {
	return /* @__PURE__ */ b(at.Empty, {
		"data-slot": "command-empty",
		className: "py-6 text-center text-sm",
		...e
	});
}
function $i({ className: e, ...t }) {
	return /* @__PURE__ */ b(at.Group, {
		"data-slot": "command-group",
		className: J("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", e),
		...t
	});
}
function ea({ className: e, ...t }) {
	return /* @__PURE__ */ b(at.Separator, {
		"data-slot": "command-separator",
		className: J("-mx-1 h-px bg-border", e),
		...t
	});
}
function ta({ className: e, ...t }) {
	return /* @__PURE__ */ b(at.Item, {
		"data-slot": "command-item",
		className: J("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground", Ki.cmdk, e),
		...t
	});
}
//#endregion
//#region src/molecules/ComposerAttachments/ComposerAttachments.tsx
function na({ files: e, onChange: t, labels: n, error: r, disabled: i, mimes: a = Ft, maxSizeMb: o = 25, maxFiles: s = 5, formatSize: c = Rt, className: l }) {
	let u = k(), d = e.length >= s;
	return /* @__PURE__ */ x("div", {
		className: J("space-y-2", l),
		children: [d ? /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("p", {
			className: "text-xs text-muted-foreground",
			children: n.maxReached(s)
		}), r ? /* @__PURE__ */ b("p", {
			role: "alert",
			className: "text-sm text-destructive",
			children: r
		}) : null] }) : /* @__PURE__ */ b(mi, {
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
function ra({ open: e, onOpenChange: t, title: n, description: r, confirmLabel: i, cancelLabel: a, onConfirm: o, variant: s = "destructive", children: c, closeOnConfirm: l = !0 }) {
	return /* @__PURE__ */ b(Vr, {
		open: e,
		onOpenChange: t,
		children: /* @__PURE__ */ x(Gr, { children: [
			/* @__PURE__ */ x(Kr, { children: [/* @__PURE__ */ b(Jr, { children: n }), /* @__PURE__ */ b(Yr, { children: r })] }),
			c,
			/* @__PURE__ */ x(qr, { children: [/* @__PURE__ */ b(Zr, { children: a }), /* @__PURE__ */ b(Xr, {
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
function ia({ ...e }) {
	return /* @__PURE__ */ b(o.Root, {
		"data-slot": "context-menu",
		...e
	});
}
var aa = S.forwardRef(function(e, t) {
	return /* @__PURE__ */ b(o.Trigger, {
		ref: t,
		"data-slot": "context-menu-trigger",
		...e
	});
});
aa.displayName = "ContextMenuTrigger";
var oa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Portal, { children: /* @__PURE__ */ b(o.Content, {
		ref: n,
		"data-slot": "context-menu-content",
		className: J("z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
oa.displayName = "ContextMenuContent";
var sa = S.forwardRef(function({ className: e, tone: t = "default", ...n }, r) {
	return /* @__PURE__ */ b(o.Item, {
		ref: r,
		"data-slot": "context-menu-item",
		"data-tone": t,
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground", "data-[highlighted]:bg-muted", Ki.real, "data-[tone=destructive]:data-[highlighted]:bg-destructive data-[tone=destructive]:data-[highlighted]:text-destructive-foreground data-[tone=destructive]:data-[highlighted]:[&_svg]:text-destructive-foreground", "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50", e),
		...n
	});
});
sa.displayName = "ContextMenuItem";
var ca = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Separator, {
		ref: n,
		"data-slot": "context-menu-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
ca.displayName = "ContextMenuSeparator";
var la = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(o.Label, {
		ref: n,
		"data-slot": "context-menu-label",
		className: J("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
la.displayName = "ContextMenuLabel";
function ua({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "context-menu-shortcut",
		"aria-hidden": "true",
		className: J("ms-auto ps-4 text-xs text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/molecules/DropdownMenu/DropdownMenu.tsx
function da({ ...e }) {
	return /* @__PURE__ */ b(l.Root, {
		"data-slot": "dropdown-menu",
		...e
	});
}
var fa = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(l.Trigger, {
		ref: t,
		"data-slot": "dropdown-menu-trigger",
		...e
	});
});
fa.displayName = "DropdownMenuTrigger";
function pa({ ...e }) {
	return /* @__PURE__ */ b(l.Portal, {
		"data-slot": "dropdown-menu-portal",
		...e
	});
}
var ma = S.forwardRef(function({ className: e, sideOffset: t = 6, container: n, ...r }, i) {
	return /* @__PURE__ */ b(pa, {
		container: n,
		children: /* @__PURE__ */ b(l.Content, {
			ref: i,
			"data-slot": "dropdown-menu-content",
			sideOffset: t,
			className: J("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
			...r
		})
	});
});
ma.displayName = "DropdownMenuContent";
var Q = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Item, {
		ref: n,
		"data-slot": "dropdown-menu-item",
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", Ki.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...t
	});
});
Q.displayName = "DropdownMenuItem";
var ha = S.forwardRef(function({ className: e, children: t, checked: n, ...r }, i) {
	return /* @__PURE__ */ x(l.CheckboxItem, {
		ref: i,
		"data-slot": "dropdown-menu-checkbox-item",
		checked: n,
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", Ki.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
		...r,
		children: [/* @__PURE__ */ b("span", {
			className: "absolute start-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ b(l.ItemIndicator, { children: /* @__PURE__ */ b(z, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), t]
	});
});
ha.displayName = "DropdownMenuCheckboxItem";
function ga({ ...e }) {
	return /* @__PURE__ */ b(l.RadioGroup, {
		"data-slot": "dropdown-menu-radio-group",
		...e
	});
}
var _a = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(l.RadioItem, {
		ref: r,
		"data-slot": "dropdown-menu-radio-item",
		className: J("relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 ps-8 pe-2 text-sm text-foreground transition-colors outline-none select-none", "focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground", Ki.real, "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", e),
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
_a.displayName = "DropdownMenuRadioItem";
function va({ ...e }) {
	return /* @__PURE__ */ b(l.Sub, {
		"data-slot": "dropdown-menu-sub",
		...e
	});
}
var ya = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(l.SubTrigger, {
		ref: r,
		"data-slot": "dropdown-menu-sub-trigger",
		className: J("flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none", "focus:bg-muted data-[highlighted]:bg-muted data-[state=open]:bg-muted", Ki.real, e),
		...n,
		children: [t, /* @__PURE__ */ b(H, {
			className: "ms-auto size-4 text-muted-foreground rtl:-scale-x-100",
			"aria-hidden": "true"
		})]
	});
});
ya.displayName = "DropdownMenuSubTrigger";
var ba = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(pa, { children: /* @__PURE__ */ b(l.SubContent, {
		ref: n,
		"data-slot": "dropdown-menu-sub-content",
		className: J("z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md", "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	}) });
});
ba.displayName = "DropdownMenuSubContent";
function xa({ className: e, ...t }) {
	return /* @__PURE__ */ b("span", {
		"data-slot": "dropdown-menu-shortcut",
		"aria-hidden": "true",
		className: J("ms-auto ps-4 text-xs text-muted-foreground", e),
		...t
	});
}
var Sa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Label, {
		ref: n,
		"data-slot": "dropdown-menu-label",
		className: J("px-2 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase", e),
		...t
	});
});
Sa.displayName = "DropdownMenuLabel";
var $ = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(l.Separator, {
		ref: n,
		"data-slot": "dropdown-menu-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
$.displayName = "DropdownMenuSeparator";
//#endregion
//#region src/molecules/EmptyState/EmptyState.tsx
function Ca({ icon: e, title: t, description: n, action: r, className: i }) {
	return /* @__PURE__ */ x("div", {
		className: J("flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center text-card-foreground", i),
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
function wa({ ...e }) {
	return /* @__PURE__ */ b(d.Root, {
		"data-slot": "popover",
		...e
	});
}
var Ta = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(d.Trigger, {
		ref: t,
		"data-slot": "popover-trigger",
		...e
	});
});
Ta.displayName = "PopoverTrigger";
var Ea = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(d.Anchor, {
		ref: t,
		"data-slot": "popover-anchor",
		...e
	});
});
Ea.displayName = "PopoverAnchor";
var Da = S.forwardRef(function({ className: e, align: t = "center", sideOffset: n = 4, ...r }, i) {
	return /* @__PURE__ */ b(d.Portal, { children: /* @__PURE__ */ b(d.Content, {
		ref: i,
		"data-slot": "popover-content",
		align: t,
		sideOffset: n,
		className: J("z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in", e),
		...r
	}) });
});
Da.displayName = "PopoverContent";
//#endregion
//#region src/molecules/EntitySearchPicker/EntitySearchPicker.tsx
var Oa = 250;
function ka({ onSearch: e, onSelect: t, getKey: n, renderRow: r, triggerLabel: i, placeholder: a, labels: o, disabled: s = !1, id: c, triggerClassName: l, debounceMs: u = Oa }) {
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
	let E = (e) => {
		t(e), f(!1), m("");
	};
	return /* @__PURE__ */ x(wa, {
		open: d,
		onOpenChange: (e) => {
			f(e), e || m("");
		},
		children: [/* @__PURE__ */ b(Ta, {
			asChild: !0,
			children: /* @__PURE__ */ x(Z, {
				id: c,
				type: "button",
				variant: "outline",
				disabled: s,
				"aria-expanded": d,
				"aria-haspopup": "listbox",
				className: l,
				children: [i, /* @__PURE__ */ b(U, {
					className: "size-4 opacity-50",
					"aria-hidden": "true"
				})]
			})
		}), /* @__PURE__ */ b(Da, {
			className: "w-80 p-0",
			align: "start",
			children: /* @__PURE__ */ x(Ji, {
				shouldFilter: !1,
				label: a,
				children: [/* @__PURE__ */ b(Xi, {
					value: p,
					onValueChange: m,
					placeholder: a,
					"aria-label": a
				}), /* @__PURE__ */ b(Zi, { children: C ? /* @__PURE__ */ x("div", {
					role: "status",
					className: "flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ b(Te, {
						className: "size-4 animate-spin",
						"aria-hidden": "true"
					}), o.searching]
				}) : h.length === 0 ? /* @__PURE__ */ b("div", {
					role: "status",
					className: "py-6 text-center text-sm text-muted-foreground",
					children: o.empty
				}) : /* @__PURE__ */ x(y, { children: [h.map((e) => /* @__PURE__ */ b(ta, {
					value: String(n(e)),
					onSelect: () => E(e),
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
var Aa = (e) => e, ja = (e) => String(e);
function Ma(e, t, n, r, i) {
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
function Na({ filters: e, columns: t, onRemove: n, onClearAll: r, onEdit: i, labels: a, formatDate: o = Aa, formatNumber: s = ja }) {
	let c = e.flatMap((e) => {
		let n = Ma(e, t.find((t) => t.id === e.id), a, o, s);
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
			children: c.map((e) => /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x(ar, {
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
					children: /* @__PURE__ */ b($e, { "aria-hidden": "true" })
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
var Pa = "block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30";
function Fa({ ...e }) {
	return /* @__PURE__ */ b(p.Root, {
		"data-slot": "select",
		...e
	});
}
var Ia = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(p.Group, {
		ref: t,
		"data-slot": "select-group",
		...e
	});
});
Ia.displayName = "SelectGroup";
var La = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(p.Value, {
		ref: t,
		"data-slot": "select-value",
		...e
	});
});
La.displayName = "SelectValue";
var Ra = S.forwardRef(function({ className: e, children: t, size: n = "default", ...r }, i) {
	return /* @__PURE__ */ x(p.Trigger, {
		ref: i,
		"data-slot": "select-trigger",
		"data-size": n,
		className: J("flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1", e),
		...r,
		children: [t, /* @__PURE__ */ b(p.Icon, {
			asChild: !0,
			children: /* @__PURE__ */ b(B, {
				className: "size-4 opacity-50",
				"aria-hidden": "true"
			})
		})]
	});
});
Ra.displayName = "SelectTrigger";
var za = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.ScrollUpButton, {
		ref: n,
		"data-slot": "select-scroll-up-button",
		className: J("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(ce, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
za.displayName = "SelectScrollUpButton";
var Ba = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.ScrollDownButton, {
		ref: n,
		"data-slot": "select-scroll-down-button",
		className: J("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ b(B, {
			className: "size-4",
			"aria-hidden": "true"
		})
	});
});
Ba.displayName = "SelectScrollDownButton";
var Va = S.forwardRef(function({ className: e, children: t, position: n = "popper", ...r }, i) {
	return /* @__PURE__ */ b(p.Portal, { children: /* @__PURE__ */ x(p.Content, {
		ref: i,
		"data-slot": "select-content",
		position: n,
		className: J("relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1", e),
		...r,
		children: [
			/* @__PURE__ */ b(za, {}),
			/* @__PURE__ */ b(p.Viewport, {
				className: J("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
				children: t
			}),
			/* @__PURE__ */ b(Ba, {})
		]
	}) });
});
Va.displayName = "SelectContent";
var Ha = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.Label, {
		ref: n,
		"data-slot": "select-label",
		className: J("px-2 py-1.5 text-xs font-medium text-muted-foreground", e),
		...t
	});
});
Ha.displayName = "SelectLabel";
var Ua = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ x(p.Item, {
		ref: r,
		"data-slot": "select-item",
		className: J("relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", Ki.real, e),
		...n,
		children: [/* @__PURE__ */ b("span", {
			className: "absolute end-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ b(p.ItemIndicator, { children: /* @__PURE__ */ b(z, {
				className: "size-4",
				"aria-hidden": "true"
			}) })
		}), /* @__PURE__ */ b(p.ItemText, { children: t })]
	});
});
Ua.displayName = "SelectItem";
var Wa = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(p.Separator, {
		ref: n,
		"data-slot": "select-separator",
		className: J("-mx-1 my-1 h-px bg-border", e),
		...t
	});
});
Wa.displayName = "SelectSeparator";
//#endregion
//#region src/molecules/GridFilterEditor/GridFilterEditor.tsx
function Ga(e) {
	return (t) => {
		t.key === "Enter" && !t.nativeEvent.isComposing && (t.preventDefault(), e());
	};
}
function Ka(e) {
	if (e.trim() === "") return;
	let t = Number(e);
	return Number.isFinite(t) ? t : void 0;
}
function qa({ labels: e, onApply: t, onClear: n, invalid: r }) {
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
function Ja({ columnId: e, labels: t, onApply: n, value: r }) {
	let i = k(), [a, o] = M(r?.op ?? "contains"), [s, c] = M(r?.value ?? ""), l = () => {
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
			children: [/* @__PURE__ */ b(Or, {
				htmlFor: `${i}-op`,
				children: t.operator
			}), /* @__PURE__ */ x(Fa, {
				value: a,
				onValueChange: (e) => o(e),
				children: [/* @__PURE__ */ b(Ra, {
					id: `${i}-op`,
					children: /* @__PURE__ */ b(La, {})
				}), /* @__PURE__ */ x(Va, { children: [
					/* @__PURE__ */ b(Ua, {
						value: "contains",
						children: t.contains
					}),
					/* @__PURE__ */ b(Ua, {
						value: "equals",
						children: t.equals
					}),
					/* @__PURE__ */ b(Ua, {
						value: "startsWith",
						children: t.startsWith
					})
				] })]
			})]
		}),
		/* @__PURE__ */ x("div", {
			className: "flex flex-col gap-1.5",
			children: [/* @__PURE__ */ b(Or, {
				htmlFor: `${i}-value`,
				children: t.value
			}), /* @__PURE__ */ b(Er, {
				id: `${i}-value`,
				type: "text",
				value: s,
				onChange: (e) => c(e.target.value),
				onKeyDown: Ga(l)
			})]
		}),
		/* @__PURE__ */ b(qa, {
			labels: t,
			onApply: l,
			onClear: () => {
				o("contains"), c(""), n(null);
			},
			invalid: !1
		})
	] });
}
function Ya({ columnId: e, labels: t, onApply: n, options: r, value: i }) {
	let a = k(), [o, s] = M(() => new Set(i?.values ?? [])), c = (e, t) => s((n) => {
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
				children: [/* @__PURE__ */ b(mr, {
					id: `${a}-${t}`,
					checked: o.has(e.value),
					onCheckedChange: (t) => c(e.value, t === !0)
				}), /* @__PURE__ */ b(Or, {
					htmlFor: `${a}-${t}`,
					className: "font-normal",
					children: e.label
				})]
			}, e.value))
		}),
		/* @__PURE__ */ b(qa, {
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
function Xa({ columnId: e, labels: t, onApply: n, kind: r, initial: i }) {
	let a = k(), [o, s] = M(i.low ?? ""), [c, l] = M(i.high ?? ""), u = r === "number" ? Ka(o) : o === "" ? void 0 : o, d = r === "number" ? Ka(c) : c === "" ? void 0 : c, f = u !== void 0 && d !== void 0 && u > d, p = `${a}-error`, m = () => {
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
		onKeyDown: Ga(m)
	};
	return /* @__PURE__ */ x(y, { children: [
		/* @__PURE__ */ x("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ x("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ b(Or, {
					htmlFor: `${a}-low`,
					children: g
				}), /* @__PURE__ */ b(Er, {
					...v,
					id: `${a}-low`,
					value: o,
					onChange: (e) => s(e.target.value)
				})]
			}), /* @__PURE__ */ x("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ b(Or, {
					htmlFor: `${a}-high`,
					children: _
				}), /* @__PURE__ */ b(Er, {
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
		/* @__PURE__ */ b(qa, {
			labels: t,
			onApply: m,
			onClear: h,
			invalid: f
		})
	] });
}
function Za({ columnId: e, header: t, def: n, value: r, onApply: i, labels: a }) {
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
			n.type === "text" && /* @__PURE__ */ b(Ja, {
				...o,
				value: r?.type === "text" ? r : void 0
			}),
			n.type === "choice" && /* @__PURE__ */ b(Ya, {
				...o,
				options: n.options,
				value: r?.type === "choice" ? r : void 0
			}),
			n.type === "number" && /* @__PURE__ */ b(Xa, {
				...o,
				kind: "number",
				initial: r?.type === "number" ? {
					low: Qa(r.min),
					high: Qa(r.max)
				} : {}
			}),
			n.type === "date" && /* @__PURE__ */ b(Xa, {
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
function Qa(e) {
	return e === void 0 ? void 0 : String(e);
}
//#endregion
//#region src/molecules/GridFooter/GridFooter.tsx
function $a({ summary: e, onPrev: t, onNext: n, labels: r }) {
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("p", {
		className: "text-sm text-muted-foreground tabular-nums",
		children: e
	}), /* @__PURE__ */ x("nav", {
		"aria-label": r.pager,
		className: "ms-auto flex items-center gap-1",
		children: [/* @__PURE__ */ b(yr, {
			label: r.previous,
			disabled: !t,
			onClick: t ?? void 0,
			icon: /* @__PURE__ */ b(V, {
				className: "size-4 rtl:-scale-x-100",
				"aria-hidden": "true"
			})
		}), /* @__PURE__ */ b(yr, {
			label: r.next,
			disabled: !n,
			onClick: n ?? void 0,
			icon: /* @__PURE__ */ b(H, {
				className: "size-4 rtl:-scale-x-100",
				"aria-hidden": "true"
			})
		})]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridViews.tsx
function eo({ title: e, initial: t, labels: n, onSubmit: r, onClose: i, onCloseAutoFocus: a }) {
	let [o, s] = M(t), [c, l] = M(!1), u = j(null), d = k(), f = () => {
		let e = o.trim();
		if (e === "") {
			l(!0), u.current?.focus();
			return;
		}
		r(e), i();
	};
	return /* @__PURE__ */ b(Qr, {
		open: !0,
		onOpenChange: (e) => !e && i(),
		children: /* @__PURE__ */ x(ni, {
			closeLabel: n.closeLabel,
			"aria-describedby": void 0,
			className: "max-w-sm",
			onCloseAutoFocus: a,
			children: [
				/* @__PURE__ */ b(ri, { children: /* @__PURE__ */ b(ai, { children: e }) }),
				/* @__PURE__ */ x("div", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ b(Or, {
							htmlFor: d,
							children: n.name
						}),
						/* @__PURE__ */ b(Er, {
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
				/* @__PURE__ */ x(ii, { children: [/* @__PURE__ */ b(Z, {
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
function to(e, t) {
	let [n, r] = M(null), i = j(null), a = (e) => {
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
			n?.kind === "save" && /* @__PURE__ */ b(eo, {
				title: e.labels.saveTitle,
				initial: "",
				labels: e.labels,
				onSubmit: e.onSave,
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "rename" && /* @__PURE__ */ b(eo, {
				title: e.labels.renameTitle,
				initial: n.name,
				labels: e.labels,
				onSubmit: (t) => {
					t !== n.name && e.onRename(n.id, t);
				},
				onClose: () => r(null),
				onCloseAutoFocus: a
			}),
			n?.kind === "delete" && /* @__PURE__ */ b(Vr, {
				open: !0,
				onOpenChange: (e) => !e && r(null),
				children: /* @__PURE__ */ x(Gr, {
					onCloseAutoFocus: a,
					children: [/* @__PURE__ */ x(Kr, { children: [/* @__PURE__ */ b(Jr, { children: e.labels.delete }), /* @__PURE__ */ b(Yr, { children: e.labels.confirmDelete(n.name) })] }), /* @__PURE__ */ x(qr, { children: [/* @__PURE__ */ b(Zr, { children: e.labels.cancel }), /* @__PURE__ */ b(Xr, {
						onClick: () => e.onDelete(n.id),
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						children: e.labels.deleteConfirm
					})] })]
				})
			})
		] })
	};
}
function no({ views: { views: e, activeViewId: t, isModified: n, onApply: r, onUpdate: i, labels: a }, request: o }) {
	let s = e.find((e) => e.id === t);
	return /* @__PURE__ */ x(va, { children: [/* @__PURE__ */ x(ya, { children: [
		/* @__PURE__ */ b(ae, {
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
	] }), /* @__PURE__ */ x(ba, {
		className: "w-64",
		children: [
			e.length === 0 ? /* @__PURE__ */ b(Sa, {
				className: "font-normal text-muted-foreground",
				children: a.empty
			}) : /* @__PURE__ */ b(ga, {
				value: s?.id ?? "",
				onValueChange: r,
				children: e.map((e) => /* @__PURE__ */ b(_a, {
					value: e.id,
					children: e.name
				}, e.id))
			}),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ x(Q, {
				onSelect: () => o({ kind: "save" }),
				children: [/* @__PURE__ */ b(L, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.save]
			}),
			s && n && i && /* @__PURE__ */ x(Q, {
				onSelect: () => i(s.id),
				children: [/* @__PURE__ */ b(Be, {
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
				children: [/* @__PURE__ */ b(Fe, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.rename]
			}), /* @__PURE__ */ x(Q, {
				onSelect: () => o({
					kind: "delete",
					id: s.id,
					name: s.name
				}),
				children: [/* @__PURE__ */ b(Ye, {
					className: "size-4 text-muted-foreground",
					"aria-hidden": "true"
				}), a.delete]
			})] })
		]
	})] });
}
//#endregion
//#region src/molecules/GridOptions/GridOptions.tsx
function ro({ preferences: e, columns: t, canSelect: n = !1, views: r, labels: i }) {
	let a = j(null), { request: o, onCloseAutoFocus: s, dialogs: c } = to(r, a);
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(da, { children: [/* @__PURE__ */ b(fa, {
		asChild: !0,
		children: /* @__PURE__ */ x(Z, {
			ref: a,
			variant: "ghost",
			size: "icon",
			"aria-label": i.trigger,
			className: "relative text-muted-foreground",
			children: [/* @__PURE__ */ b(K, { "aria-hidden": "true" }), r?.isModified && /* @__PURE__ */ b("span", {
				"data-modified-dot": "",
				"aria-hidden": "true",
				className: "absolute end-1 top-1 size-2 rounded-full bg-primary"
			})]
		})
	}), /* @__PURE__ */ x(ma, {
		align: "end",
		className: "w-56",
		onCloseAutoFocus: s,
		children: [
			r && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(no, {
				views: r,
				request: o
			}), /* @__PURE__ */ b($, {})] }),
			/* @__PURE__ */ x(va, { children: [/* @__PURE__ */ x(ya, { children: [/* @__PURE__ */ b(de, {
				className: "size-4 text-muted-foreground",
				"aria-hidden": "true"
			}), i.columns] }), /* @__PURE__ */ b(ba, {
				className: "w-52",
				children: t.map((t) => /* @__PURE__ */ b(ha, {
					checked: e.isColumnVisible(t.id),
					disabled: t.hideable === !1,
					onCheckedChange: (n) => e.setColumnVisible(t.id, n === !0),
					onSelect: (e) => e.preventDefault(),
					children: t.label
				}, t.id))
			})] }),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ b(Sa, { children: i.density }),
			/* @__PURE__ */ x(ga, {
				value: e.values.density,
				onValueChange: (t) => e.setDensity(t),
				children: [/* @__PURE__ */ b(_a, {
					value: "comfortable",
					children: i.comfortable
				}), /* @__PURE__ */ b(_a, {
					value: "compact",
					children: i.compact
				})]
			}),
			n && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b($, {}), /* @__PURE__ */ b(ha, {
				checked: e.values.selection,
				onCheckedChange: (t) => e.setSelectionEnabled(t === !0),
				children: i.selection
			})] }),
			/* @__PURE__ */ b($, {}),
			/* @__PURE__ */ x(Q, {
				disabled: e.isDefault,
				onSelect: () => e.reset(),
				children: [/* @__PURE__ */ b(Ve, {
					className: "size-4",
					"aria-hidden": "true"
				}), i.reset]
			})
		]
	})] }), c] });
}
//#endregion
//#region src/molecules/InlineText/InlineText.tsx
function io({ value: e, onChange: t, label: n, placeholder: r, multiline: i = !1, inverse: a = !1, as: o = "p", className: s }) {
	let [c, l] = M(!1), u = j(null), d = j(null), f = j(!1);
	O(() => {
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
			className: J("block w-full resize-none rounded-md px-2 py-0.5 text-inherit outline-none ring-2", a ? "bg-black/20 ring-primary-foreground" : "bg-background ring-ring", "-mx-2 w-[calc(100%+1rem)]", s)
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
			className: J("group/inline relative -mx-2 block w-[calc(100%+1rem)] cursor-text rounded-md px-2 py-0.5 text-start whitespace-pre-line", "outline-offset-2 hover:outline-2 hover:outline-dashed focus-visible:outline-2 focus-visible:outline-solid", a ? "hover:outline-primary-foreground/60 focus-visible:outline-primary-foreground" : "hover:outline-ring/60 focus-visible:outline-ring"),
			children: [e, /* @__PURE__ */ b(Fe, {
				"aria-hidden": "true",
				className: "absolute -end-5 top-1 hidden size-3.5 opacity-70 group-hover/inline:block"
			})]
		})
	}) : /* @__PURE__ */ x("button", {
		ref: d,
		type: "button",
		onClick: () => l(!0),
		className: J("flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-start text-sm transition-colors", a ? "border-primary-foreground/50 text-primary-foreground hover:border-primary-foreground" : "border-border text-muted-foreground hover:border-ring hover:text-foreground"),
		children: [/* @__PURE__ */ b(ze, {
			className: "size-4 shrink-0",
			"aria-hidden": "true"
		}), /* @__PURE__ */ x("span", { children: [
			/* @__PURE__ */ b("span", {
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
var ao = (e) => e.done >= e.total, oo = (e) => e.total > 0 ? Math.min(100, Math.max(0, e.done / e.total * 100)) : 100;
function so({ language: e }) {
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
function co({ language: e }) {
	let t = ao(e);
	return /* @__PURE__ */ x("span", {
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
function lo({ languages: e, value: t, onValueChange: n, labels: r, className: i }) {
	let a = e.find((e) => e.code === t);
	return /* @__PURE__ */ x(Fa, {
		value: t,
		onValueChange: n,
		children: [/* @__PURE__ */ b(Ra, {
			"data-slot": "language-select",
			"aria-label": a ? `${r.label}: ${a.label}, ${r.progress(a.done, a.total)}` : r.label,
			className: J("w-auto min-w-40 gap-2 px-2", i),
			children: /* @__PURE__ */ b(La, { children: a ? /* @__PURE__ */ x("span", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ b(so, { language: a }),
					/* @__PURE__ */ b("span", {
						className: "truncate",
						children: a.label
					}),
					/* @__PURE__ */ b(co, { language: a })
				]
			}) : null })
		}), /* @__PURE__ */ b(Va, {
			className: "min-w-56",
			children: e.map((e) => {
				let t = ao(e);
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
								/* @__PURE__ */ b(so, { language: e }),
								/* @__PURE__ */ b("span", {
									className: "flex-1 truncate",
									children: e.label
								}),
								" ",
								/* @__PURE__ */ b("span", {
									className: "sr-only",
									children: r.progress(e.done, e.total)
								}),
								/* @__PURE__ */ b(co, { language: e })
							]
						}), /* @__PURE__ */ b("span", {
							"aria-hidden": "true",
							"data-slot": "language-select-bar",
							className: "block h-1 w-full overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ b("span", {
								className: J("block h-full rounded-full", t ? "bg-success" : "bg-warning"),
								style: { width: `${oo(e)}%` }
							})
						})]
					}) }), /* @__PURE__ */ b("span", {
						className: "absolute end-2 top-2 flex size-4 items-center justify-center",
						children: /* @__PURE__ */ b(p.ItemIndicator, { children: /* @__PURE__ */ b(z, {
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
//#region src/molecules/MeetingControl/MeetingControl.tsx
var uo = {
	default: "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
	off: "bg-destructive/10 text-destructive-tint-foreground hover:bg-destructive/15",
	active: "bg-primary text-primary-foreground hover:bg-primary/90",
	attention: "bg-warning text-warning-foreground hover:bg-warning/90",
	danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
}, fo = E(function({ label: e, icon: t, tone: n = "default", pressed: r, badge: i, showLabel: a = !1, disabledReason: o, options: s, disabled: c, className: l, ...u }, d) {
	let f = c || !!o, p = !!s, m = /* @__PURE__ */ x(Z, {
		ref: d,
		type: "button",
		variant: "ghost",
		size: a ? "default" : "icon-lg",
		"aria-label": e,
		"aria-pressed": r,
		tooltip: o ?? e,
		disabled: f,
		"data-tone": n,
		className: J("relative h-11 rounded-full transition-colors", a ? "gap-2 px-4" : "w-11", p && "w-auto rounded-e-none ps-3 pe-2.5", uo[n], !p && l),
		...u,
		children: [
			t,
			a && /* @__PURE__ */ b("span", {
				className: "hidden sm:inline",
				children: e
			}),
			i !== void 0 && i > 0 && /* @__PURE__ */ b("span", {
				"aria-hidden": "true",
				className: "absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-none font-semibold text-primary-foreground tabular-nums ring-2 ring-background",
				children: i > 99 ? "99+" : i
			})
		]
	});
	return s ? /* @__PURE__ */ x("div", {
		className: J("inline-flex items-stretch rounded-full", l),
		"data-slot": "meeting-control-split",
		children: [m, /* @__PURE__ */ x(wa, {
			open: s.open,
			onOpenChange: s.onOpenChange,
			children: [/* @__PURE__ */ b(Ta, {
				asChild: !0,
				children: /* @__PURE__ */ b(Z, {
					type: "button",
					variant: "ghost",
					size: "icon-lg",
					"aria-label": s.label,
					tooltip: s.label,
					disabled: s.disabled,
					className: J("h-11 w-7 rounded-s-none rounded-e-full border-s border-background/40 ps-0.5 pe-1.5", uo[n]),
					children: /* @__PURE__ */ b(ce, {
						"aria-hidden": "true",
						className: "size-3.5"
					})
				})
			}), /* @__PURE__ */ b(Da, {
				"aria-label": s.label,
				side: "top",
				align: "start",
				sideOffset: 10,
				className: J("max-h-[70dvh] overflow-y-auto", s.className),
				children: s.content
			})]
		})]
	}) : m;
});
//#endregion
//#region src/molecules/ReactionPicker/ReactionPicker.tsx
function po({ reactions: e, onPick: t, label: n, disabled: r, className: i }) {
	return /* @__PURE__ */ b(or, {
		delayDuration: 200,
		children: /* @__PURE__ */ b("div", {
			role: "group",
			"aria-label": n,
			className: J("flex flex-wrap gap-1", i),
			children: e.map((e) => /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
				asChild: !0,
				children: /* @__PURE__ */ b("button", {
					type: "button",
					"aria-label": e.label,
					disabled: r,
					onClick: () => t(e.id),
					className: J("flex size-11 items-center justify-center rounded-full text-2xl transition-transform", "hover:scale-110 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:scale-100"),
					children: /* @__PURE__ */ b("span", {
						"aria-hidden": "true",
						children: e.emoji
					})
				})
			}), /* @__PURE__ */ b(lr, { children: e.label })] }, e.id))
		})
	});
}
//#endregion
//#region src/molecules/RecordingIndicator/RecordingIndicator.tsx
var mo = {
	recording: "border-destructive/30 bg-destructive/10 text-destructive-tint-foreground",
	failed: "border-destructive/30 bg-destructive/10 text-destructive-tint-foreground",
	scheduled: "border-border bg-card text-foreground",
	processing: "border-border bg-card text-foreground",
	available: "border-success/30 bg-success/10 text-success-tint-foreground",
	none: "border-border bg-muted text-muted-foreground",
	deleting: "border-border bg-muted text-muted-foreground",
	deleted: "border-border bg-muted text-muted-foreground",
	unknown: "border-border bg-muted text-muted-foreground"
};
function ho({ state: e, labels: t, className: n }) {
	let r = t[e];
	return /* @__PURE__ */ b("span", {
		role: "status",
		className: "inline-flex",
		children: r && /* @__PURE__ */ x("span", {
			"data-state": e,
			className: J("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", mo[e], n),
			children: [(e === "recording" || e === "scheduled") && /* @__PURE__ */ x("span", {
				"aria-hidden": "true",
				className: "relative flex size-2",
				children: [e === "recording" && /* @__PURE__ */ b("span", { className: "absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60 motion-reduce:animate-none" }), /* @__PURE__ */ b("span", { className: J("relative inline-flex size-2 rounded-full", e === "recording" ? "bg-destructive" : "bg-muted-foreground") })]
			}), r]
		})
	});
}
//#endregion
//#region src/molecules/SearchField/SearchField.tsx
function go({ value: e, onValueChange: t, placeholder: n, collapsible: r = !1, className: i, onFocus: a, onBlur: o, ...s }) {
	let [c, l] = M(!1), [u, d] = M(!1), f = !r || c || e !== "", p = /* @__PURE__ */ x("div", {
		"data-expanded": f ? "" : void 0,
		className: J("relative", r && ["w-8 shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none", "data-expanded:w-[var(--search-width,18rem)]"], i),
		children: [/* @__PURE__ */ b(Ue, {
			className: J("pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground", !f && "start-2 text-foreground"),
			"aria-hidden": "true"
		}), /* @__PURE__ */ b(Er, {
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
			className: J("h-8 w-full ps-8", !f && "cursor-pointer border-transparent pe-0 placeholder:text-transparent hover:bg-muted")
		})]
	});
	return r ? /* @__PURE__ */ b(or, {
		delayDuration: 200,
		children: /* @__PURE__ */ x(sr, {
			open: u && !f,
			onOpenChange: d,
			children: [/* @__PURE__ */ b(cr, {
				asChild: !0,
				children: p
			}), /* @__PURE__ */ b(lr, { children: n })]
		})
	}) : p;
}
//#endregion
//#region src/molecules/SegmentedChoice/SegmentedChoice.tsx
var _o = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(f.Root, {
		ref: n,
		"data-slot": "segmented-choice",
		className: J("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
_o.displayName = "SegmentedChoice";
var vo = S.forwardRef(function({ className: e, children: t, ...n }, r) {
	return /* @__PURE__ */ b(f.Item, {
		ref: r,
		"data-slot": "segmented-choice-item",
		className: J("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...n,
		children: t
	});
});
vo.displayName = "SegmentedChoiceItem";
//#endregion
//#region src/molecules/SegmentedTabs/SegmentedTabs.tsx
var yo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Root, {
		ref: n,
		"data-slot": "segmented-tabs",
		className: J("flex flex-col gap-4", e),
		...t
	});
});
yo.displayName = "SegmentedTabs";
var bo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.List, {
		ref: n,
		"data-slot": "segmented-tabs-list",
		className: J("flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm", e),
		...t
	});
});
bo.displayName = "SegmentedTabsList";
var xo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Trigger, {
		ref: n,
		"data-slot": "segmented-tab",
		className: J("inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
xo.displayName = "SegmentedTab";
var So = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Content, {
		ref: n,
		"data-slot": "segmented-tabs-content",
		className: J("focus-visible:outline-none", e),
		...t
	});
});
So.displayName = "SegmentedTabsContent";
//#endregion
//#region src/molecules/StatCard/StatCard.tsx
function Co({ label: e, value: t, hint: n, icon: r, className: i }) {
	return /* @__PURE__ */ x(wi, {
		className: J("gap-2", i),
		children: [/* @__PURE__ */ x(Ti, {
			className: "flex flex-row items-center justify-between gap-2",
			children: [/* @__PURE__ */ b(Ei, {
				className: "text-sm font-medium text-muted-foreground",
				children: e
			}), r ? /* @__PURE__ */ b("span", {
				className: "shrink-0 text-muted-foreground",
				"aria-hidden": "true",
				children: r
			}) : null]
		}), /* @__PURE__ */ x(ki, { children: [/* @__PURE__ */ b("p", {
			className: "text-3xl font-semibold text-foreground tabular-nums",
			children: t
		}), n ? /* @__PURE__ */ b("p", {
			className: "mt-1 text-xs text-muted-foreground",
			children: n
		}) : null] })]
	});
}
//#endregion
//#region src/molecules/SupportReference/SupportReference.tsx
function wo({ id: e, labels: t, className: n }) {
	return /* @__PURE__ */ x("p", {
		className: J("flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs", n),
		children: [
			/* @__PURE__ */ x("span", { children: [t.prefix, ":"] }),
			/* @__PURE__ */ b("code", {
				className: "font-mono break-all select-all",
				children: e
			}),
			/* @__PURE__ */ b(vr, {
				url: e,
				label: t.copy,
				copiedLabel: t.copied
			})
		]
	});
}
//#endregion
//#region src/molecules/Tabs/Tabs.tsx
var To = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Root, {
		ref: n,
		"data-slot": "tabs",
		className: J("flex flex-col gap-4", e),
		...t
	});
});
To.displayName = "Tabs";
var Eo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.List, {
		ref: n,
		"data-slot": "tabs-list",
		className: J("inline-flex w-full flex-wrap items-center gap-1 rounded-md border-b border-border bg-transparent p-0", e),
		...t
	});
});
Eo.displayName = "TabsList";
var Do = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Trigger, {
		ref: n,
		"data-slot": "tabs-trigger",
		className: J("inline-flex items-center justify-center rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors", "pointer-coarse:min-h-11", "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", "data-[state=active]:border-primary data-[state=active]:text-foreground", "disabled:pointer-events-none disabled:opacity-50", e),
		...t
	});
});
Do.displayName = "TabsTrigger";
var Oo = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(_.Content, {
		ref: n,
		"data-slot": "tabs-content",
		className: J("focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", e),
		...t
	});
});
Oo.displayName = "TabsContent";
//#endregion
//#region src/organisms/AppRail/AppRail.tsx
function ko({ label: e, logo: t, children: n, className: r }) {
	return /* @__PURE__ */ b(or, {
		delayDuration: 200,
		children: /* @__PURE__ */ x("nav", {
			"aria-label": e,
			className: J("flex h-full w-[68px] shrink-0 flex-col items-center gap-1 bg-rail px-1.5 py-3 text-rail-foreground", r),
			children: [t && /* @__PURE__ */ b("div", {
				className: "mb-2 flex justify-center",
				children: t
			}), n]
		})
	});
}
function Ao() {
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: "flex-1"
	});
}
var jo = E(function({ icon: e, label: t, active: n, href: r, as: i, onClick: a, className: o, ...s }, c) {
	let l = J("flex w-full flex-col items-center gap-1 rounded-lg py-2 text-[10.5px] leading-none font-medium transition-colors outline-none", "focus-visible:ring-2 focus-visible:ring-rail-foreground", o, n ? "bg-rail-accent text-rail-foreground" : "text-rail-muted-foreground hover:bg-rail-accent hover:text-rail-foreground"), u = /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b(e, {
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
	return /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
		asChild: !0,
		children: d
	}), /* @__PURE__ */ b(lr, {
		side: "right",
		children: t
	})] });
}), Mo = 16, No = 6, Po = 600, Fo = 700, Io = "\0draft";
function Lo(e) {
	if (!e || typeof localStorage > "u") return null;
	try {
		let t = JSON.parse(localStorage.getItem(`burgwiss-ui:tree:${e}`) ?? "null");
		return Array.isArray(t) && t.every((e) => typeof e == "string") ? t : null;
	} catch {
		return null;
	}
}
function Ro({ initial: e, label: t, onDone: n }) {
	let r = j(null), i = j(!1);
	O(() => {
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
function zo() {
	if (typeof crypto < "u" && typeof crypto.randomUUID == "function") return crypto.randomUUID();
	let e = /* @__PURE__ */ new Uint8Array(16);
	return crypto.getRandomValues(e), Array.from(e, (e) => e.toString(16).padStart(2, "0")).join("");
}
function Bo({ nodes: e, onNodesChange: t, selectedId: n, onSelect: r, onEdit: i, counts: a, createId: o = zo, defaultExpandedIds: s = [], storageKey: c, shortcutLabels: l, labels: u, maxDepth: d, className: f }) {
	let p = t !== void 0, m = p || i !== void 0, h = k(), [g, _] = M(() => {
		let t = new Set(Lo(c) ?? s);
		return n && pt(e, n).slice(0, -1).forEach((e) => t.add(e.id)), t;
	}), [v, S] = M(null), [C, w] = M(null), [T, E] = M(null), [ee, te] = M(null), [D, A] = M(""), [N, re] = M(null), [, F] = M(0), I = j(/* @__PURE__ */ new Map()), ae = j(null), L = j(null), oe = j(null), se = j(null), R = j(!1), z = j({
		text: "",
		at: 0
	}), B = (e) => _((t) => {
		let n = new Set(t);
		return e(n), c && typeof localStorage < "u" && localStorage.setItem(`burgwiss-ui:tree:${c}`, JSON.stringify([...n])), n;
	}), V = ne(() => {
		let t = ht(e, g);
		if (C?.kind !== "new") return t;
		let n = (e, t) => ({
			node: {
				id: Io,
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
	]), ce = j({
		nodes: e,
		lines: V
	});
	O(() => {
		ce.current = {
			nodes: e,
			lines: V
		};
	}), O(() => {
		let e = L.current, t = e ? I.current.get(e) : void 0;
		t && (t.focus(), L.current = null);
	});
	let U = (e) => {
		L.current = e, F((e) => e + 1);
	}, le = v && V.some((e) => e.node.id === v) && v || n && V.some((e) => e.node.id === n) && n || V[0]?.node.id, W = (n, r) => t?.(n, At(e, n, r)), ue = (t, n) => {
		if (n === e) return;
		let r = Y(n, t), i = X(e, t), a = X(n, t);
		a.parentId !== null && B((e) => pt(n, a.parentId).forEach((t) => e.add(t.id))), W(n, t), a.parentId !== i.parentId && A(u.moved(r.label, a.parentId === null ? null : Y(n, a.parentId).label)), U(t);
	}, de = (e, t) => B((n) => {
		t ?? !n.has(e) ? n.add(e) : n.delete(e);
	}), fe = (e) => {
		e && de(e, !0), w({
			kind: "new",
			parentId: e
		});
	}, G = (t) => {
		let i = Y(e, t);
		if (!i) return;
		let a = V.findIndex((e) => e.node.id === t), o = V[a], s = (o && V.slice(a + 1).find((e) => e.level <= o.level && !e.draft)) ?? (a > 0 ? V[a - 1] : void 0);
		return n && mt(e, t).includes(n) && r(null), W(yt(e, t)), A(u.deleted(i.label)), U(s?.node.id ?? null), s?.node.id ?? null;
	}, pe = (t) => {
		mt(e, t).length - 1 > 0 || (a?.[t] ?? 0) > 0 ? te(t) : G(t);
	}, me = (t, n) => {
		let r = C;
		if (w(null), !r) return;
		let i = t?.trim() ?? "";
		if (r.kind === "rename") {
			let t = Y(e, r.id);
			t && i && i !== t.label && W(bt(e, r.id, i)), n && U(r.id);
			return;
		}
		if (!i) {
			n && U(r.parentId ?? le ?? null);
			return;
		}
		let a = o();
		W(vt(e, r.parentId, {
			id: a,
			label: i
		})), n && U(a);
	}, he = (e) => {
		let t = V[Math.max(0, Math.min(e, V.length - 1))];
		t && I.current.get(t.node.id)?.focus();
	}, ge = (t) => {
		let n = t.target.closest("[role=treeitem]")?.dataset.id, i = V.findIndex((e) => e.node.id === n), a = V[i];
		if (!n || !a || a.draft) return;
		let { forward: o, back: s } = ut(t.currentTarget), c = () => {
			t.preventDefault(), t.stopPropagation();
		};
		if (t.altKey && !t.ctrlKey && !t.metaKey) {
			let r = {
				ArrowUp: () => Tt(e, n, -1),
				ArrowDown: () => Tt(e, n, 1),
				[o]: () => Et(e, n, d),
				[s]: () => Dt(e, n)
			};
			p && r[t.key] && (c(), ue(n, r[t.key]()));
			return;
		}
		if (t.key === "ContextMenu" || t.shiftKey && t.key === "F10") {
			m && (c(), E(n));
			return;
		}
		switch (t.key) {
			case "ArrowDown": return c(), he(i + 1);
			case "ArrowUp": return c(), he(i - 1);
			case "Home": return c(), he(0);
			case "End": return c(), he(V.length - 1);
			case o: return c(), a.hasChildren && !a.expanded ? de(n, !0) : a.expanded ? he(i + 1) : void 0;
			case s:
				if (c(), a.expanded) return de(n, !1);
				a.parentId && I.current.get(a.parentId)?.focus();
				return;
			case "Enter":
			case " ": return c(), r(n);
			case "F2": return p ? (c(), w({
				kind: "rename",
				id: n
			})) : void 0;
			case "Delete":
			case "Backspace": return p ? (c(), pe(n)) : void 0;
		}
		if (t.key.length === 1 && !t.ctrlKey && !t.metaKey) {
			let e = t.timeStamp, n = z.current;
			n.text = e - n.at > Fo ? t.key : n.text + t.key, n.at = e;
			let r = n.text.toLocaleLowerCase(), a = [...r].every((e) => e === r[0]), o = a ? r[0] : r, s = [...V.slice(i + +!!a), ...V.slice(0, i + 1)].find((e) => !e.draft && e.node.label.toLocaleLowerCase().startsWith(o));
			s && (c(), I.current.get(s.node.id)?.focus());
		}
	}, xe = (e, t, n) => {
		let { nodes: r, lines: i } = ce.current, a = document.elementFromPoint(e, t), o = (e) => Ct(r, n, e.parentId, d) && wt(r, n, e.parentId, e.index, d) !== r ? e : null;
		if (a?.closest("[data-tree-end]") && ae.current?.parentElement?.contains(a)) return o({
			lineId: null,
			zone: "end",
			parentId: null,
			index: r.length
		});
		let s = a?.closest("[data-tree-line]");
		if (!s || !ae.current?.contains(s)) return null;
		let c = i.find((e) => e.node.id === s.dataset.id);
		if (!c || c.draft || c.node.id === n) return null;
		let l = s.getBoundingClientRect(), u = (t - l.top) / l.height, f = u < .25 ? "before" : u > .75 ? "after" : "inside", p = c.node.id;
		return f === "inside" && !Ct(ce.current.nodes, n, p, d) && (f = u < .5 ? "before" : "after"), f === "before" ? o({
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
	}, Se = (e, t) => {
		if (!p || e.button !== 0 || e.pointerType === "touch" || e.target.closest("input,[data-tree-menu],[data-tree-toggle],[data-tree-edit]")) return;
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
				if (Math.hypot(e.clientX - n.x, e.clientY - n.y) < No) return;
				r = !0;
			}
			let a = xe(e.clientX, e.clientY, t);
			re({
				id: t,
				target: a
			});
			let o = a?.zone === "inside" ? a.lineId : null;
			o !== i.id && (window.clearTimeout(i.timer), i = {
				id: o,
				timer: o ? window.setTimeout(() => de(o, !0), Po) : 0
			});
		}, s = (e) => {
			let n = r ? xe(e.clientX, e.clientY, t) : null;
			if (a(), !r) return;
			R.current = !0, window.setTimeout(() => R.current = !1, 0);
			let i = ce.current.nodes;
			n && ue(t, wt(i, t, n.parentId, n.index, d));
		}, c = () => a(), l = (e) => {
			e.key === "Escape" && r && (e.preventDefault(), e.stopPropagation(), r = !1, a());
		};
		window.addEventListener("pointermove", o), window.addEventListener("pointerup", s), window.addEventListener("pointercancel", c), window.addEventListener("keydown", l, !0);
	}, Te = ne(() => T ? ht(e, new Set(e.flatMap((t) => mt(e, t.id)))) : [], [T, e]), Ee = (e) => Xt(e, l), De = ee ? Y(e, ee) : null, Oe = (t) => {
		let n = t.node.id, r = X(e, n), a = r.index === 0, o = r.index === r.siblings.length - 1, s = d !== void 0 && d <= 1, c = d === void 0 || t.level < d, l = d === void 0 ? null : Te.filter((t) => t.node.id !== r.parentId && Ct(e, n, t.node.id, d)), f = l === null || r.parentId !== null || l.length > 0, m = (e) => {
			oe.current = () => I.current.get(n)?.focus(), ue(n, e());
		}, h = (e) => {
			oe.current = e;
		};
		return /* @__PURE__ */ x(ma, {
			align: "start",
			className: "w-64",
			onCloseAutoFocus: (e) => {
				e.preventDefault();
				let t = oe.current;
				oe.current = null, t ? t() : I.current.get(n)?.focus();
			},
			children: [
				i && /* @__PURE__ */ x(Q, {
					onSelect: () => h(() => i(n)),
					children: [/* @__PURE__ */ b(Fe, { "aria-hidden": "true" }), u.edit]
				}),
				p && i && /* @__PURE__ */ b($, {}),
				p && /* @__PURE__ */ x(y, { children: [
					c && /* @__PURE__ */ x(Q, {
						onSelect: () => h(() => fe(n)),
						children: [/* @__PURE__ */ b(be, { "aria-hidden": "true" }), u.addChild]
					}),
					/* @__PURE__ */ x(Q, {
						onSelect: () => h(() => w({
							kind: "rename",
							id: n
						})),
						children: [
							/* @__PURE__ */ b(Fe, { "aria-hidden": "true" }),
							u.rename,
							/* @__PURE__ */ b(xa, { children: Ee("F2") })
						]
					}),
					/* @__PURE__ */ b($, {}),
					f && /* @__PURE__ */ x(va, { children: [/* @__PURE__ */ x(ya, { children: [/* @__PURE__ */ b(ve, { "aria-hidden": "true" }), u.moveTo] }), /* @__PURE__ */ x(ba, {
						className: "max-h-80 w-64 overflow-y-auto",
						children: [/* @__PURE__ */ b(Q, {
							disabled: r.parentId === null,
							onSelect: () => m(() => wt(e, n, null, e.length)),
							children: u.topLevel
						}), Te.map((t) => /* @__PURE__ */ b(Q, {
							disabled: t.node.id === r.parentId || !Ct(e, n, t.node.id, d),
							style: { paddingInlineStart: `${8 + t.level * 12}px` },
							onSelect: () => m(() => wt(e, n, t.node.id, t.node.children?.length ?? 0, d)),
							children: t.node.label
						}, t.node.id))]
					})] }),
					/* @__PURE__ */ x(Q, {
						disabled: a,
						onSelect: () => m(() => Tt(e, n, -1)),
						children: [
							/* @__PURE__ */ b(ie, { "aria-hidden": "true" }),
							u.moveUp,
							/* @__PURE__ */ b(xa, { children: Ee("Alt+↑") })
						]
					}),
					/* @__PURE__ */ x(Q, {
						disabled: o,
						onSelect: () => m(() => Tt(e, n, 1)),
						children: [
							/* @__PURE__ */ b(P, { "aria-hidden": "true" }),
							u.moveDown,
							/* @__PURE__ */ b(xa, { children: Ee("Alt+↓") })
						]
					}),
					!s && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x(Q, {
						disabled: r.parentId === null,
						onSelect: () => m(() => Dt(e, n)),
						children: [
							/* @__PURE__ */ b(Ce, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							u.outdent,
							/* @__PURE__ */ b(xa, { children: Ee("Alt+←") })
						]
					}), /* @__PURE__ */ x(Q, {
						disabled: a || Et(e, n, d) === e,
						onSelect: () => m(() => Et(e, n, d)),
						children: [
							/* @__PURE__ */ b(we, {
								"aria-hidden": "true",
								className: "rtl:-scale-x-100"
							}),
							u.indent,
							/* @__PURE__ */ b(xa, { children: Ee("Alt+→") })
						]
					})] }),
					/* @__PURE__ */ b($, {}),
					/* @__PURE__ */ x(Q, {
						onSelect: () => h(() => pe(n)),
						children: [
							/* @__PURE__ */ b(Ye, { "aria-hidden": "true" }),
							u.delete,
							/* @__PURE__ */ b(xa, { children: Ee("Delete") })
						]
					})
				] })
			]
		});
	}, ke = (e) => {
		let t = e.node.id, o = e.draft ? void 0 : a?.[t], s = C?.kind === "rename" && C.id === t, c = N?.target?.lineId === t ? N.target.zone : null, l = e.expanded ? ye : _e, d = 4 + (e.level - 1) * Mo;
		return /* @__PURE__ */ x("div", {
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
			"aria-label": o === void 0 ? void 0 : `${e.node.label}, ${u.count(o)}`,
			tabIndex: !e.draft && le === t ? 0 : -1,
			onFocus: (n) => {
				n.target === n.currentTarget && !e.draft && S(t);
			},
			onClick: () => {
				e.draft || R.current || r(t);
			},
			onContextMenu: (n) => {
				m && !e.draft && (n.preventDefault(), E(t));
			},
			onPointerDown: (n) => !e.draft && Se(n, t),
			style: {
				paddingInlineStart: d,
				"--indent": `${d}px`
			},
			className: J("group/line relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md pe-1 text-sm outline-none select-none", "animate-in duration-150 fade-in-0 slide-in-from-top-1 motion-reduce:animate-none", "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", "aria-selected:bg-muted aria-selected:font-medium", N?.id === t && "opacity-50", c === "inside" && "ring-2 ring-primary ring-inset", (c === "before" || c === "after") && "before:pointer-events-none before:absolute before:start-(--indent) before:end-1 before:h-0.5 before:rounded-full before:bg-primary", c === "before" && "before:-top-px", c === "after" && "before:-bottom-px"),
			children: [
				/* @__PURE__ */ b("span", {
					"data-tree-toggle": "",
					"aria-hidden": "true",
					onClick: (n) => {
						n.stopPropagation(), e.hasChildren && de(t);
					},
					className: "flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground",
					children: e.hasChildren && /* @__PURE__ */ b(H, { className: J("size-4 transition-transform duration-150 motion-reduce:transition-none", e.expanded ? "rotate-90" : "rtl:rotate-180") })
				}),
				/* @__PURE__ */ b(l, {
					className: "size-4 shrink-0 text-muted-foreground",
					"aria-hidden": "true"
				}),
				e.draft || s ? /* @__PURE__ */ b(Ro, {
					initial: e.node.label,
					label: u.nameInput,
					onDone: me
				}) : /* @__PURE__ */ b("span", {
					className: "min-w-0 flex-1 truncate",
					children: e.node.label
				}),
				o !== void 0 && !s && /* @__PURE__ */ b("span", {
					"aria-hidden": "true",
					className: J("shrink-0 px-1 text-xs text-muted-foreground tabular-nums", m && "group-hover/line:hidden group-focus-visible/line:hidden", T === t && "hidden"),
					children: o
				}),
				i && !e.draft && !s && /* @__PURE__ */ b(or, {
					delayDuration: 300,
					children: /* @__PURE__ */ x(sr, { children: [/* @__PURE__ */ b(cr, {
						asChild: !0,
						children: /* @__PURE__ */ b("span", {
							"data-tree-edit": "",
							"aria-hidden": "true",
							onClick: (e) => {
								e.stopPropagation(), i(t);
							},
							className: J("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex", T === t && "flex"),
							children: /* @__PURE__ */ b(Fe, { className: "size-3.5" })
						})
					}), /* @__PURE__ */ b(lr, { children: u.edit })] })
				}),
				m && !e.draft && !s && /* @__PURE__ */ x(da, {
					open: T === t,
					onOpenChange: (e) => E(e ? t : null),
					children: [/* @__PURE__ */ b(fa, {
						asChild: !0,
						children: /* @__PURE__ */ b("span", {
							"data-tree-menu": "",
							"aria-hidden": "true",
							tabIndex: -1,
							onClick: (e) => e.stopPropagation(),
							className: J("hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground", "group-hover/line:flex group-focus-visible/line:flex data-[state=open]:flex"),
							children: /* @__PURE__ */ b(K, { className: "size-4" })
						})
					}), T === t && Oe(e)]
				})
			]
		}, t);
	};
	return /* @__PURE__ */ x("div", {
		className: J("flex flex-col gap-1", f),
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex h-8 items-center justify-between gap-2 ps-2",
				children: [/* @__PURE__ */ b("h2", {
					id: h,
					className: "text-xs font-medium text-muted-foreground",
					children: u.heading
				}), p && /* @__PURE__ */ b(yr, {
					label: u.add,
					icon: /* @__PURE__ */ b(ze, {
						className: "size-4",
						"aria-hidden": "true"
					}),
					onClick: () => fe(null),
					className: "size-7"
				})]
			}),
			V.length === 0 ? /* @__PURE__ */ b("p", {
				className: "px-2 py-1 text-sm text-muted-foreground",
				children: u.empty
			}) : /* @__PURE__ */ b("div", {
				ref: ae,
				role: "tree",
				"aria-labelledby": h,
				onKeyDown: ge,
				className: "flex flex-col",
				children: V.map((e) => ke(e))
			}),
			N && /* @__PURE__ */ b("div", {
				"data-tree-end": "",
				"aria-hidden": "true",
				className: J("mt-1 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground", N.target?.zone === "end" && "border-primary text-foreground"),
				children: u.topLevel
			}),
			/* @__PURE__ */ b("div", {
				"aria-live": "polite",
				className: "sr-only",
				children: D
			}),
			p && De && /* @__PURE__ */ b(Vr, {
				open: !0,
				onOpenChange: (e) => !e && te(null),
				children: /* @__PURE__ */ x(Gr, {
					onCloseAutoFocus: (e) => {
						e.preventDefault();
						let t = se.current ?? De.id;
						se.current = null, I.current.get(t)?.focus();
					},
					children: [/* @__PURE__ */ x(Kr, { children: [/* @__PURE__ */ b(Jr, { children: u.confirmDeleteTitle(De.label) }), /* @__PURE__ */ b(Yr, { children: u.confirmDelete(De.label, mt(e, De.id).length - 1, a?.[De.id] ?? 0) })] }), /* @__PURE__ */ x(qr, { children: [/* @__PURE__ */ b(Zr, { children: u.cancel }), /* @__PURE__ */ b(Xr, {
						onClick: () => {
							se.current = G(De.id) ?? null;
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
var Vo = 160;
function Ho({ onSend: e, labels: t, error: n, attachmentsError: r, replyTo: i = null, onClearReply: a, onSent: o, allowAttachments: s = !0, disabled: c = !1, acceptedMimes: l = Ft, maxAttachmentMb: u = 25, maxAttachments: d = 5, className: f }) {
	let p = k(), m = k(), h = j(null), g = j(null), _ = j(!0), [v, S] = M(""), [C, w] = M([]), [T, E] = M(!1), [ee, te] = M(null);
	O(() => (_.current = !0, () => {
		_.current = !1;
	}), []);
	let D = i?.id ?? null;
	O(() => {
		D !== null && h.current?.focus();
	}, [D]);
	let A = () => {
		let e = h.current;
		e && (e.style.height = "auto", e.style.height = `${Math.min(e.scrollHeight, Vo)}px`);
	}, ne = !c && (v.trim() !== "" || C.length > 0), N = C.length >= d, re = (e) => {
		let n = Array.from(e.target.files ?? []);
		if (e.target.value = "", n.length === 0) return;
		let r = Vt(C, n, {
			maxFiles: d,
			maxSizeMb: u
		});
		w(r.files);
		let i = r.rejected[0];
		i ? i.reason === "too_large" ? te(t.fileTooLarge(i.file.name, u)) : te(t.tooManyFiles(d)) : te(null);
	}, P = async (t) => {
		if (t?.preventDefault(), !T && ne) {
			E(!0);
			try {
				await e(v.trim(), C, { replyTo: i });
			} catch {
				return;
			} finally {
				_.current && E(!1);
			}
			_.current && (S(""), w([]), te(null), h.current && (h.current.style.height = "auto"), a?.(), o?.(), h.current?.focus());
		}
	}, F = (e) => {
		e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing || (e.preventDefault(), P());
	}, I = [
		n,
		r,
		ee
	].filter((e) => typeof e == "string" && e !== "");
	return /* @__PURE__ */ x("form", {
		onSubmit: (e) => void P(e),
		"aria-busy": T,
		className: J("border-t border-border bg-card px-3 py-3 sm:px-4", f),
		children: [
			i && /* @__PURE__ */ x("div", {
				className: "mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ b("span", {
					className: "truncate",
					children: t.replyingTo(i.name)
				}), /* @__PURE__ */ b(yr, {
					label: t.cancelReply,
					icon: /* @__PURE__ */ b($e, {
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
					}), /* @__PURE__ */ b(yr, {
						label: t.removeFile(e.name),
						icon: /* @__PURE__ */ b($e, {
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
						onChange: re
					}), /* @__PURE__ */ b(yr, {
						label: t.attach,
						icon: /* @__PURE__ */ b(Ne, {
							className: "size-5",
							"aria-hidden": "true"
						}),
						disabled: c || T || N,
						onClick: () => g.current?.click(),
						className: "shrink-0 rounded-full"
					})] }),
					/* @__PURE__ */ b("label", {
						htmlFor: p,
						className: "sr-only",
						children: t.message
					}),
					/* @__PURE__ */ b(Pr, {
						id: p,
						ref: h,
						rows: 1,
						value: v,
						readOnly: T,
						disabled: c,
						onChange: (e) => {
							S(e.target.value), A();
						},
						onKeyDown: F,
						placeholder: t.placeholder,
						"aria-invalid": I.length > 0 || void 0,
						"aria-describedby": I.length > 0 ? m : void 0,
						className: "max-h-40 min-h-10 flex-1 resize-none rounded-2xl px-4 py-2"
					}),
					/* @__PURE__ */ b(Z, {
						type: "submit",
						size: "icon",
						disabled: !ne || T,
						"aria-label": t.send,
						tooltip: t.send,
						className: "shrink-0 rounded-full",
						children: /* @__PURE__ */ b(We, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})
				]
			}),
			I.length > 0 && /* @__PURE__ */ b("div", {
				id: m,
				role: "alert",
				className: "space-y-1 pt-2 text-sm text-destructive",
				children: I.map((e) => /* @__PURE__ */ b("p", { children: e }, e))
			})
		]
	});
}
//#endregion
//#region src/organisms/MessageList/MessageList.tsx
var Uo = 3e5, Wo = 200;
function Go(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleTimeString(void 0, {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function Ko(e) {
	return e.own ? "__own" : e.authorId === void 0 ? `${e.authorName}|${e.authorBadge ?? ""}` : `id:${e.authorId}`;
}
function qo(e) {
	return typeof e.body == "string" && e.body.trim() !== "";
}
function Jo({ messages: e, labels: t, onReply: n, onDelete: r, canDelete: i = !1, onLoadOlder: a, hasOlder: o = !1, formatTime: s = Go, className: c }) {
	let l = j(null), u = j(!0), d = j(null), [f, p] = M(!1);
	A(() => {
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
			children: [n && /* @__PURE__ */ b(yr, {
				label: t.reply,
				icon: /* @__PURE__ */ b(G, {
					className: "size-4",
					"aria-hidden": "true"
				}),
				onClick: () => n(e)
			}), i && /* @__PURE__ */ b(yr, {
				label: t.delete,
				icon: /* @__PURE__ */ b(Ye, {
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
			u.current = t.scrollHeight - t.scrollTop - t.clientHeight < Wo;
		},
		className: J("min-h-0 flex-1 overflow-y-auto bg-background px-3 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-4", c),
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
				let i = e[r - 1], a = !i || Ko(i) !== Ko(n) || new Date(n.sentAt).getTime() - new Date(i.sentAt).getTime() > Uo, o = n.own === !0, c = n.attachments ?? [], l = s(n.sentAt), u = /* @__PURE__ */ b("time", {
					dateTime: n.sentAt,
					className: J("ms-2 inline-block translate-y-px align-baseline text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
					children: l
				});
				return /* @__PURE__ */ x("li", {
					"data-own": o || void 0,
					className: J("group flex gap-1.5 sm:gap-2", a && "mt-4 first:mt-0", o ? "flex-row-reverse" : "flex-row"),
					children: [!o && /* @__PURE__ */ b("div", {
						className: "w-7 shrink-0 sm:w-8",
						children: a && /* @__PURE__ */ b(Tr, {
							name: n.authorName,
							className: "size-7 text-xs sm:size-8"
						})
					}), /* @__PURE__ */ x("div", {
						className: J("flex max-w-[88%] min-w-0 flex-col sm:max-w-[78%]", o ? "items-end" : "items-start"),
						children: [a && !o && /* @__PURE__ */ x("div", {
							className: "mb-0.5 flex items-center gap-2 px-1",
							children: [
								/* @__PURE__ */ b("span", {
									className: "text-xs font-semibold text-foreground",
									children: n.authorName
								}),
								n.authorBadge && /* @__PURE__ */ b(ar, {
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
							className: "flex max-w-full min-w-0 items-center gap-1",
							children: [
								o && !n.deleted && g(n),
								/* @__PURE__ */ x("div", {
									className: J("max-w-full min-w-0 rounded-2xl px-3.5 py-2 text-sm", o ? "rounded-ee-md bg-primary text-primary-foreground" : "rounded-es-md bg-muted text-foreground", n.deleted && "bg-muted text-muted-foreground italic"),
									children: [
										n.replyTo && /* @__PURE__ */ b("div", {
											className: J("mb-1 rounded-md border-s-2 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words", o ? "border-primary-foreground/60 bg-primary-foreground/20" : "border-foreground/30 bg-foreground/5"),
											children: n.replyTo.deleted ? /* @__PURE__ */ b("em", { children: t.replyPreviewDeleted }) : /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("span", {
												className: "font-semibold",
												children: n.replyTo.authorName
											}), n.replyTo.preview ? `: ${n.replyTo.preview}` : ""] })
										}),
										n.deleted ? /* @__PURE__ */ x("p", {
											className: "text-sm",
											children: [t.deleted, u]
										}) : qo(n) ? /* @__PURE__ */ x("p", {
											className: "text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap sm:text-base",
											children: [n.body, u]
										}) : null,
										!n.deleted && c.length > 0 && t.attachments && /* @__PURE__ */ b("div", {
											className: "mt-2 max-w-full min-w-0",
											children: /* @__PURE__ */ b(gi, {
												items: c,
												labels: t.attachments
											})
										}),
										!n.deleted && !qo(n) && /* @__PURE__ */ b("time", {
											dateTime: n.sentAt,
											className: J("mt-1 block text-end text-[11px] leading-none", o ? "text-primary-foreground" : "text-muted-foreground"),
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
function Yo({ title: e, subtitle: t, actions: n, onBack: r, notice: i, messages: a, labels: o, onSend: s, sendError: c, attachmentsError: l, readOnly: u = !1, lockedNotice: d, allowAttachments: f, replies: p = !1, onDelete: m, canDelete: h, onLoadOlder: g, hasOlder: _, formatTime: v, className: y }) {
	let S = k(), [C, w] = M(null);
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": S,
		className: J("flex h-full min-h-0 flex-col bg-card text-card-foreground", y),
		children: [
			/* @__PURE__ */ x("header", {
				className: "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4",
				children: [
					r && o.back && /* @__PURE__ */ b(yr, {
						label: o.back,
						icon: /* @__PURE__ */ b(I, {
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
			/* @__PURE__ */ b(Jo, {
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
			}) : u ? null : /* @__PURE__ */ b(Ho, {
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
var Xo = 16, Zo = 64, Qo = 200;
function $o(e, t = !1) {
	if (e.pinned) return {
		position: "sticky",
		[e.pinned === "left" ? "insetInlineStart" : "insetInlineEnd"]: e.offset,
		zIndex: t ? 30 : 10
	};
}
function es({ grid: e, labels: t, rowLabel: n, renderDetail: r, renderFilter: i, loading: a = !1, error: o = null, onRetry: s, emptyState: c, virtualize: l, className: u }) {
	let d = k(), f = j(null), [p, m] = M(null), [h, g] = M(null), _ = e.layout, v = (e.showCheckboxes ? 40 : 0) + (e.hasExpandableRows ? 40 : 0) + _.reduce((e, t) => e + t.width, 0), y = +!!e.showCheckboxes + +!!e.hasExpandableRows + _.length, S = e.columns.find((e) => e.id === _[0]?.id) ?? e.columns[0], C = (e) => n?.(e) ?? (S ? String(Zt(S, e) ?? "") : ""), w = hn(e.preferences.values.columnOrder, e.columns.map((e) => e.id)), T = e.lines, E = l ?? T.length >= Qo, ee = e.preferences.values.density === "compact" ? 37 : 49, te = ot({
		count: E ? T.length : 0,
		getScrollElement: () => f.current?.closest("[data-grid-scroll]") ?? f.current?.parentElement ?? null,
		estimateSize: () => ee,
		overscan: 12
	}), D = E ? te.getVirtualItems() : null, O = D ? D.map((e) => ({
		index: e.index,
		line: T[e.index]
	})) : T.map((e, t) => ({
		index: t,
		line: e
	})), A = D && D.length ? D[0].start : 0, ne = D && D.length ? te.getTotalSize() - D[D.length - 1].end : 0, N = (t) => {
		let n = f.current?.querySelectorAll(`[data-col="${CSS.escape(t)}"] [data-cell-content]`), r = 0;
		n?.forEach((e) => r = Math.max(r, e.getBoundingClientRect().width, e.scrollWidth)), e.setColumnWidth(t, r + 72);
	}, re = (t, n) => {
		let r = _.findIndex((e) => e.id === t), i = _[r + n];
		i && e.moveColumn(t, w.indexOf(i.id));
	}, P = j(null), F = j(!1), I = (e, t) => (document.elementFromPoint?.(e, t)?.closest("th[data-col]"))?.dataset.col ?? null, ie = (t, n) => {
		if (t.button !== 0 || t.target.closest("[role=separator],[aria-haspopup]")) return;
		P.current = {
			id: n,
			x: t.clientX,
			y: t.clientY,
			moved: !1
		};
		let r = (e) => {
			let t = P.current;
			t && (!t.moved && Math.hypot(e.clientX - t.x, e.clientY - t.y) < 6 || (t.moved = !0, m(I(e.clientX, e.clientY))));
		}, i = (t) => {
			window.removeEventListener("pointermove", r), window.removeEventListener("pointerup", i);
			let n = P.current;
			if (P.current = null, m(null), !n?.moved) return;
			F.current = !0, window.setTimeout(() => F.current = !1, 0);
			let a = I(t.clientX, t.clientY);
			a && a !== n.id && e.moveColumn(n.id, w.indexOf(a));
		};
		window.addEventListener("pointermove", r), window.addEventListener("pointerup", i);
	}, ae = a && !o, L = ae && e.visibleRows.length === 0, oe = !a && !o && T.length === 0;
	return /* @__PURE__ */ x("div", {
		className: J("relative", u),
		children: [/* @__PURE__ */ b("div", {
			role: "status",
			className: "sr-only",
			children: ae ? t.loading : ""
		}), /* @__PURE__ */ x("table", {
			ref: f,
			"aria-label": t.table,
			"aria-busy": ae || void 0,
			...e.getTableProps(),
			style: {
				width: v,
				tableLayout: "fixed"
			},
			className: J("caption-bottom border-separate border-spacing-0 text-sm", ae && !L && "opacity-60"),
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
							return /* @__PURE__ */ b(ts, {
								grid: e,
								column: a,
								layout: n,
								labels: t,
								isFirst: r === 0,
								isLast: r === _.length - 1,
								dragOver: p === n.id,
								onHeaderPointerDown: ie,
								shouldIgnoreClick: () => F.current,
								onAutosize: () => N(n.id),
								onMove: (e) => re(n.id, e),
								filterOpen: h === n.id,
								onFilterOpenChange: (e) => g(e ? n.id : null),
								renderFilter: i
							}, n.id);
						})
					]
				}) }),
				A > 0 && /* @__PURE__ */ b("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ b("tr", { style: { height: A } })
				}),
				L && Array.from({ length: 5 }, (e, t) => /* @__PURE__ */ b("tbody", {
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
				oe && /* @__PURE__ */ b("tbody", { children: /* @__PURE__ */ b("tr", { children: /* @__PURE__ */ b("td", {
					colSpan: y,
					className: "px-4 py-12 text-center text-muted-foreground",
					children: c ?? t.empty
				}) }) }),
				!o && O.map(({ index: n, line: i }) => /* @__PURE__ */ b("tbody", {
					"data-index": n,
					ref: E ? te.measureElement : void 0,
					children: i.kind === "group" ? /* @__PURE__ */ b(rs, {
						grid: e,
						group: i.group,
						labels: t
					}) : /* @__PURE__ */ b(is, {
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
				ne > 0 && /* @__PURE__ */ b("tbody", {
					"aria-hidden": "true",
					children: /* @__PURE__ */ b("tr", { style: { height: ne } })
				})
			]
		})]
	});
}
function ts({ grid: e, column: t, layout: n, labels: r, isFirst: i, isLast: a, dragOver: o, onHeaderPointerDown: s, shouldIgnoreClick: c, onAutosize: l, onMove: u, filterOpen: d, onFilterOpenChange: f, renderFilter: p }) {
	let m = t.sortable !== !1, h = e.sorting.findIndex((e) => e.id === t.id), g = h >= 0 ? e.sorting[h] : void 0, _ = e.filters.some((e) => e.id === t.id), v = g ? g.desc ? P : ie : F, S = e.groupBy.includes(t.id), C = j(!1);
	return /* @__PURE__ */ x("th", {
		"data-col": t.id,
		"aria-sort": m ? g ? g.desc ? "descending" : "ascending" : "none" : void 0,
		style: {
			width: n.width,
			...$o(n, !0)
		},
		onPointerDown: (e) => s(e, t.id),
		className: J("group/th relative border-b border-border bg-muted px-2 text-start align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase select-none", e.preferences.values.density === "compact" ? "h-8" : "h-10", !a && "border-e", o && "bg-accent", n.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", t.align === "right" && "text-end"),
		children: [/* @__PURE__ */ x(wa, {
			open: d,
			onOpenChange: f,
			children: [/* @__PURE__ */ b(Ea, {
				asChild: !0,
				children: /* @__PURE__ */ x("div", {
					className: J("flex min-w-0 items-center gap-0.5", t.align === "right" && "flex-row-reverse"),
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
									className: J("size-3.5 shrink-0", !g && "opacity-0 group-hover/th:opacity-60")
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
						_ && /* @__PURE__ */ b(ge, {
							"aria-hidden": "true",
							className: "size-3 shrink-0 text-foreground"
						}),
						/* @__PURE__ */ x(da, { children: [/* @__PURE__ */ b(fa, {
							asChild: !0,
							children: /* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon-xs",
								"aria-label": r.columnMenu(t.header),
								className: "ms-auto shrink-0 text-muted-foreground opacity-60 group-hover/th:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100",
								children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
							})
						}), /* @__PURE__ */ x(ma, {
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
			}), p && t.filter && /* @__PURE__ */ b(Da, {
				align: "start",
				className: "w-72 tracking-normal normal-case",
				children: p(t, () => f(!1))
			})]
		}), /* @__PURE__ */ b(ns, {
			grid: e,
			column: t,
			layout: n,
			labels: r,
			onAutosize: l
		})]
	});
}
function ns({ grid: e, column: t, layout: n, labels: r, onAutosize: i }) {
	let a = j(null), o = t.minWidth ?? 64, s = t.maxWidth ?? 640;
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
			let t = lt(e.currentTarget);
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
			let a = r.shiftKey ? Zo : Xo, { forward: c, back: l } = ut(r.currentTarget), u = {
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
function rs({ grid: e, group: t, labels: n }) {
	let r = e.isGroupExpanded(t.key), i = e.columns.find((e) => e.id === t.columnId), a = t.value === null ? n.emptyGroupValue : String(t.value), o = r ? B : H, s = +!!e.showCheckboxes + +!!e.hasExpandableRows;
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
				style: $o(s),
				className: J("border-b border-border px-3 py-2 text-sm font-medium", s.pinned && "bg-muted", l.align === "right" && "text-end tabular-nums"),
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
function is({ grid: e, row: t, id: n, depth: r, name: i, labels: a, detailId: o, renderDetail: s, colSpan: c }) {
	let l = e.getRowProps(n), u = e.canExpand(t), d = e.isRowExpanded(n), f = "border-b border-border px-3 bg-card in-data-[state=selected]:bg-muted";
	return /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ x("tr", {
		...l,
		className: J("transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", "[&>td:not(:last-child)]:border-e", l.className),
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
				className: J(f, "px-1"),
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
					children: /* @__PURE__ */ b(H, {
						"aria-hidden": "true",
						className: J("transition-transform rtl:rotate-180", d && "rotate-90 rtl:rotate-90")
					})
				})
			}),
			e.layout.map((i, o) => {
				let s = e.columns.find((e) => e.id === i.id);
				return /* @__PURE__ */ b(as, {
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
function as({ grid: e, row: t, rowId: n, column: r, layout: i, labels: a, indent: o }) {
	let s = e.cellValue(t, r.id), c = s !== Zt(r, t) && !r.value ? {
		...t,
		[r.id]: s
	} : t, l = r.cell ? r.cell(c) : s == null ? "" : String(s), u = typeof l == "string" ? l : s == null ? "" : String(s), d = e.editing?.rowId === n && e.editing.columnId === r.id;
	return /* @__PURE__ */ b("td", {
		role: "gridcell",
		"data-col": r.id,
		style: {
			...$o(i),
			paddingInlineStart: o ? o + 12 : void 0
		},
		className: J("truncate border-b border-border px-3 align-middle", e.preferences.values.density === "compact" ? "py-1.5" : "py-3", i.pinned && "bg-card in-data-[state=selected]:bg-muted", i.pinned === "left" && "shadow-[inset_-1px_0_0_var(--border)]", r.align === "right" && "text-end tabular-nums"),
		children: d ? /* @__PURE__ */ b(os, {
			grid: e,
			column: r,
			value: s,
			labels: a
		}) : r.editable ? /* @__PURE__ */ b("button", {
			type: "button",
			"aria-label": a.edit(r.header, u),
			onClick: () => e.startEdit(n, r.id),
			className: J("-mx-1 block w-full truncate rounded px-1 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", r.align === "right" && "text-end"),
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
function os({ grid: e, column: t, value: n, labels: r }) {
	let i = t.editable, a = k(), [o, s] = M(n == null ? "" : String(n)), c = j(null);
	O(() => {
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
//#region src/organisms/DevicePreview/DevicePreview.tsx
function ss({ video: e, mirror: t = !0, name: n, cameraOn: r, microphoneOn: i, onToggleCamera: a, onToggleMicrophone: o, busy: s = !1, cameraBlocked: c, microphoneBlocked: l, cameraOptions: u, microphoneOptions: d, level: f, levelStatus: p, status: m, children: h, labels: g, className: _ }) {
	return /* @__PURE__ */ x("section", {
		className: J("space-y-3", _),
		"aria-label": g.title,
		children: [
			g.title && /* @__PURE__ */ b("h2", {
				className: "text-sm font-semibold",
				children: g.title
			}),
			/* @__PURE__ */ x("div", {
				className: "relative aspect-video overflow-hidden rounded-2xl bg-video-surface shadow-sm",
				children: [r && e ? /* @__PURE__ */ b("div", {
					className: J("absolute inset-0 [&>*]:size-full [&>*]:object-cover", t && "[&>*]:-scale-x-100"),
					children: e
				}) : /* @__PURE__ */ x("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-b from-muted to-secondary",
					children: [n && /* @__PURE__ */ b(Tr, {
						name: n,
						colored: !0,
						size: "lg",
						className: "size-20 text-2xl"
					}), /* @__PURE__ */ b("p", {
						className: "text-sm font-medium text-muted-foreground",
						children: g.cameraOff
					})]
				}), /* @__PURE__ */ x("div", {
					className: "absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-linear-to-t from-video-scrim/60 to-transparent p-3 pt-8",
					children: [/* @__PURE__ */ b(fo, {
						label: g.microphone,
						icon: b(i ? Oe : ke, { "aria-hidden": "true" }),
						tone: i ? "default" : "off",
						pressed: i,
						disabled: s,
						disabledReason: l,
						onClick: o,
						options: d,
						className: "shadow-md"
					}), /* @__PURE__ */ b(fo, {
						label: g.camera,
						icon: b(r ? oe : se, { "aria-hidden": "true" }),
						tone: r ? "default" : "off",
						pressed: r,
						disabled: s,
						disabledReason: c,
						onClick: a,
						options: u,
						className: "shadow-md"
					})]
				})]
			}),
			i && f !== void 0 && /* @__PURE__ */ x("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ b(Oe, {
						"aria-hidden": "true",
						className: "size-4 shrink-0 text-muted-foreground"
					}),
					/* @__PURE__ */ b(er, {
						level: f,
						label: g.level,
						className: "flex-1"
					}),
					p && /* @__PURE__ */ b("span", {
						className: "shrink-0 text-sm text-muted-foreground",
						role: "status",
						children: p
					})
				]
			}),
			m && /* @__PURE__ */ b("div", {
				className: "space-y-1 text-sm text-muted-foreground",
				children: m
			}),
			h && /* @__PURE__ */ b("div", {
				className: "space-y-3",
				children: h
			})
		]
	});
}
//#endregion
//#region src/organisms/Sidebar/Sidebar.tsx
var cs = 16, ls = 64;
function us({ label: e, side: t = "left", resize: n, defaultWidth: r = 280, className: i, children: a }) {
	let o = Un({
		storageKey: n?.storageKey,
		defaultWidth: r,
		minWidth: n?.minWidth ?? 200,
		maxWidth: n?.maxWidth ?? 560
	}), s = n ? o.width : r;
	return /* @__PURE__ */ x("aside", {
		"aria-label": e,
		"data-side": t,
		style: { width: s },
		className: J("relative flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground", t === "left" ? "border-e border-sidebar-border" : "border-s border-sidebar-border", i),
		children: [a, n && /* @__PURE__ */ b(ds, {
			side: t,
			label: n.label,
			size: o
		})]
	});
}
function ds({ side: e, label: t, size: n }) {
	let r = j(null), i = (t) => e === "left" === lt(t) ? -1 : 1, a = (e) => {
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
			let t = e.shiftKey ? ls : cs, r = i(e.currentTarget), a = {
				ArrowRight: () => n.setWidth(n.width + t * r),
				ArrowLeft: () => n.setWidth(n.width - t * r),
				Home: () => n.setWidth(n.minWidth),
				End: () => n.setWidth(n.maxWidth),
				Enter: () => n.reset()
			}[e.key];
			a && (e.preventDefault(), a());
		},
		className: J("group absolute inset-y-0 z-20 w-2 cursor-col-resize outline-none", e === "left" ? "-end-1" : "-start-1"),
		children: /* @__PURE__ */ b("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors group-hover:bg-ring group-focus-visible:bg-ring group-active:bg-ring"
		})
	});
}
function fs({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: J("flex shrink-0 flex-col gap-2 p-3", e),
		...t
	});
}
function ps({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: J("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2", e),
		...t
	});
}
function ms({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		className: J("flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3", e),
		...t
	});
}
function hs({ label: e, children: t, className: n }) {
	return /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": e,
		className: J("flex flex-col gap-0.5", n),
		children: [e && /* @__PURE__ */ b("div", {
			"aria-hidden": "true",
			className: "px-2 pb-1 text-xs font-medium text-muted-foreground",
			children: e
		}), t]
	});
}
function gs({ className: e, ...t }) {
	return /* @__PURE__ */ b("ul", {
		className: J("flex flex-col gap-0.5", e),
		...t
	});
}
function _s(e) {
	return /* @__PURE__ */ b("li", { ...e });
}
function vs({ asChild: e = !1, active: t = !1, className: n, ...r }) {
	let i = e ? h.Root : "button";
	return /* @__PURE__ */ b(i, {
		"data-active": t,
		"aria-current": t ? "page" : void 0,
		className: J("flex h-8 w-full items-center gap-2 rounded-md px-2 text-start text-sm transition-colors outline-none", "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "focus-visible:ring-2 focus-visible:ring-sidebar-ring", "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground", "[&_svg]:size-4 [&_svg]:shrink-0", n),
		...e ? {} : { type: "button" },
		...r
	});
}
//#endregion
//#region src/organisms/FolderSidebar/FolderSidebar.tsx
function ys({ title: e, resize: t, all: n, none: r, scope: i, onScopeChange: a, tree: o, treeKey: s, formatCount: c = String, children: l }) {
	let u = (e, { label: t, count: n, icon: r }, o) => /* @__PURE__ */ b(_s, { children: /* @__PURE__ */ x(vs, {
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
	return /* @__PURE__ */ x(us, {
		label: e,
		resize: t,
		children: [/* @__PURE__ */ b(fs, { children: /* @__PURE__ */ b("div", {
			className: "px-2 text-lg font-semibold tracking-tight",
			children: e
		}) }), /* @__PURE__ */ x(ps, { children: [
			/* @__PURE__ */ b(hs, { children: /* @__PURE__ */ x(gs, { children: [u("all", n, /* @__PURE__ */ b(Se, { "aria-hidden": "true" })), r && u("none", r, /* @__PURE__ */ b(ue, { "aria-hidden": "true" }))] }) }),
			/* @__PURE__ */ b(Bo, {
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
function bs(e) {
	if (e) return e.replace(/\bMod\b/g, Gt() ? "Meta" : "Control");
}
var xs = 4;
function Ss({ label: e, items: t = [], selectedIds: n = [], shortcutLabels: r, moreLabel: i, children: a }) {
	let o = Wt(t, Ht(n.length)), s = o.flat(), c = j(null), l = j(null), [u, d] = M(null);
	A(() => {
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
		let e = u.bar - (u.lead ? u.lead + xs : 0), t = u.button + xs;
		s.length * t - xs > e && (f = Math.max(0, Math.floor((e + xs) / t) - 1));
	}
	let [p, m] = M(null);
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
			s.filter((e) => h.has(e.id)).map((e) => /* @__PURE__ */ b(Cs, {
				item: e,
				ids: n,
				shortcutLabels: r
			}, e.id)),
			i && g.length > 0 && /* @__PURE__ */ x(da, {
				onOpenChange: (e) => m(e ? f : null),
				children: [/* @__PURE__ */ b(fa, {
					asChild: !0,
					children: /* @__PURE__ */ b(Z, {
						variant: "ghost",
						size: "icon",
						"aria-label": i,
						tooltip: i,
						className: "shrink-0 text-muted-foreground",
						children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
					})
				}), /* @__PURE__ */ b(ma, {
					align: "start",
					className: "w-60",
					children: g.map((e, t) => /* @__PURE__ */ x(w, { children: [t > 0 && /* @__PURE__ */ b($, {}), e.map((e) => /* @__PURE__ */ x(Q, {
						disabled: Ut(e, n),
						"aria-keyshortcuts": bs(e.shortcut),
						onSelect: () => e.onSelect(n),
						className: J(e.tone === "destructive" && "data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground data-[highlighted]:[&_svg]:text-destructive-foreground"),
						children: [
							/* @__PURE__ */ b("span", {
								className: "text-muted-foreground [&_svg]:size-4",
								children: e.icon
							}),
							e.label,
							e.shortcut && /* @__PURE__ */ b(xa, { children: Xt(e.shortcut, r) })
						]
					}, e.id))] }, e[0].id))
				})]
			})
		]
	});
}
function Cs({ item: e, ids: t, shortcutLabels: n }) {
	let r = Ut(e, t), i = r ? e.disabledReason : void 0, a = /* @__PURE__ */ x("span", {
		className: "flex flex-col gap-0.5",
		children: [/* @__PURE__ */ x("span", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ b("span", {
				className: "font-medium",
				children: e.label
			}), e.shortcut && /* @__PURE__ */ b("kbd", {
				className: "ms-auto font-sans text-muted-foreground",
				children: Xt(e.shortcut, n)
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
		"aria-keyshortcuts": bs(e.shortcut),
		tooltip: a,
		disabled: r,
		onClick: () => e.onSelect(t),
		className: J(e.tone !== "primary" && "text-muted-foreground", e.tone === "destructive" && "hover:bg-destructive hover:text-destructive-foreground"),
		children: e.icon
	});
}
function ws({ items: e, ids: t, shortcutLabels: n }) {
	return /* @__PURE__ */ b(y, { children: e.map((e, r) => /* @__PURE__ */ x(w, { children: [r > 0 && /* @__PURE__ */ b(ca, {}), e.map((e) => {
		let r = Ut(e, t);
		return /* @__PURE__ */ x(sa, {
			tone: e.tone === "destructive" ? "destructive" : "default",
			disabled: r,
			"aria-keyshortcuts": bs(e.shortcut),
			onSelect: () => e.onSelect(t),
			children: [
				e.icon,
				/* @__PURE__ */ x("span", {
					className: "flex flex-col",
					children: [/* @__PURE__ */ b("span", {
						className: J(e.isDefault && "font-semibold"),
						children: e.label
					}), r && e.disabledReason && /* @__PURE__ */ b("span", {
						className: "text-xs text-muted-foreground",
						children: e.disabledReason
					})]
				}),
				e.shortcut && /* @__PURE__ */ b(ua, { children: Xt(e.shortcut, n) })
			]
		}, e.id);
	})] }, e[0]?.id)) });
}
//#endregion
//#region src/organisms/LiveCanvas/LiveCanvas.tsx
var Ts = T(null), Es = (e, t) => `${e}-${t.replace(/[^A-Za-z0-9_-]/g, "_")}`;
function Ds({ label: e, selected: t, onSelect: n, caption: r, artboardStyle: i, artboardClassName: a, dark: o = !1, pending: s = !1, children: c }) {
	let l = k(), [u, d] = M(null), f = j(null), p = () => Array.from(f.current?.querySelectorAll("[role=option]") ?? []), m = u ?? t;
	return /* @__PURE__ */ b(Ts.Provider, {
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
				className: J("theme-scope mx-auto w-full max-w-4xl rounded-xl border border-border bg-background p-8 text-foreground shadow-sm transition-opacity", o && "dark", s && "opacity-60", a),
				children: /* @__PURE__ */ b("div", {
					ref: f,
					role: "listbox",
					"aria-label": e,
					tabIndex: 0,
					"aria-activedescendant": m ? Es(l, m) : void 0,
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
						}, { forward: o } = ut(e.currentTarget);
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
function Os({ id: e, label: t, wide: n = !1, children: r }) {
	let i = D(Ts);
	if (!i) throw Error("LiveCanvasTarget must be inside a LiveCanvas");
	let a = i.selected === e, o = i.active === e;
	return /* @__PURE__ */ x("div", {
		id: Es(i.baseId, e),
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
function ks({ caption: e, children: t }) {
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
//#region src/organisms/MeetingHeader/MeetingHeader.tsx
function As({ title: e, subtitle: t, status: n, end: r, className: i }) {
	return /* @__PURE__ */ x("header", {
		className: J("flex min-h-11 items-center gap-3 px-3 py-1.5", i),
		children: [/* @__PURE__ */ x("div", {
			className: "flex min-w-0 flex-1 items-center gap-x-3 gap-y-1",
			children: [
				/* @__PURE__ */ b("h1", {
					className: "truncate text-base font-semibold",
					children: e
				}),
				t && /* @__PURE__ */ b("span", {
					className: "hidden shrink-0 text-sm text-muted-foreground sm:inline",
					children: t
				}),
				n && /* @__PURE__ */ b("div", {
					className: "flex shrink-0 items-center gap-2",
					children: n
				})
			]
		}), r && /* @__PURE__ */ b("div", {
			className: "flex shrink-0 items-center gap-3 text-sm text-muted-foreground tabular-nums",
			children: r
		})]
	});
}
//#endregion
//#region src/organisms/MeetingToolbar/MeetingToolbar.tsx
function js({ label: e, children: t, start: n, end: r, className: i }) {
	return /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": e,
		className: J("flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-2 py-2", "md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4", i),
		children: [
			/* @__PURE__ */ b("div", {
				className: "hidden min-w-0 items-center gap-3 truncate text-sm text-muted-foreground md:flex",
				children: n
			}),
			/* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center justify-center gap-2",
				children: t
			}),
			r && /* @__PURE__ */ b("div", {
				className: "flex flex-wrap items-center justify-center gap-2 md:justify-end",
				children: r
			})
		]
	});
}
//#endregion
//#region src/organisms/PageViewer/PageViewer.tsx
function Ms({ src: e, srcDoc: t, title: n, deviceWidth: r, interactive: i = !1, timeoutMs: a = 1e4, labels: o, overlay: s, onStatusChange: c, className: l }) {
	let { ref: u, available: d, scale: f } = Gn(r), [p, m] = M(!1), [h, g] = M("idle"), [_, v] = M(0), y = j(null);
	O(() => {
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
	return O(() => {
		c?.(S);
	}, [S, c]), O(() => {
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
		className: J("relative min-h-0 overflow-hidden rounded-lg border border-border bg-background", l),
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
//#region src/organisms/ParticipantList/ParticipantList.tsx
function Ns({ title: e, level: t, children: n }) {
	let r = k();
	return /* @__PURE__ */ x("section", {
		"aria-labelledby": r,
		className: "space-y-1",
		children: [/* @__PURE__ */ b(t === 2 ? "h2" : "h3", {
			id: r,
			className: "px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase",
			children: e
		}), /* @__PURE__ */ b("ul", {
			className: "space-y-0.5",
			children: n
		})]
	});
}
function Ps({ people: e, waiting: t = [], onAdmit: n, onDeny: r, query: i, onQueryChange: a, actions: o, headingLevel: s = 3, labels: c, className: l }) {
	let u = e.filter((e) => e.handPosition !== void 0).sort((e, t) => (e.handPosition ?? 0) - (t.handPosition ?? 0)), d = e.filter((e) => e.handPosition === void 0), f = (e) => /* @__PURE__ */ x("li", {
		className: "group/row flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-accent/60",
		children: [
			/* @__PURE__ */ b(Tr, {
				name: e.name,
				colored: !0,
				size: "sm"
			}),
			/* @__PURE__ */ x("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ x("p", {
					className: "truncate text-sm font-medium",
					children: [e.name, e.self && /* @__PURE__ */ x("span", {
						className: "font-normal text-muted-foreground",
						children: [" ", c.you]
					})]
				}), e.role && /* @__PURE__ */ b("p", {
					className: J("truncate text-xs", e.leader ? "font-medium text-foreground" : "text-muted-foreground"),
					children: e.role
				})]
			}),
			e.handPosition !== void 0 && /* @__PURE__ */ x("span", {
				className: "inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground tabular-nums",
				children: [
					/* @__PURE__ */ b(xe, {
						"aria-hidden": "true",
						className: "size-3"
					}),
					/* @__PURE__ */ b("span", {
						"aria-hidden": "true",
						children: e.handPosition
					}),
					/* @__PURE__ */ b("span", {
						className: "sr-only",
						children: c.hand(e.handPosition)
					})
				]
			}),
			e.muted && /* @__PURE__ */ x("span", {
				className: "text-muted-foreground",
				children: [/* @__PURE__ */ b(ke, {
					"aria-hidden": "true",
					className: "size-4"
				}), /* @__PURE__ */ b("span", {
					className: "sr-only",
					children: c.muted
				})]
			}),
			e.actions && /* @__PURE__ */ x(da, { children: [/* @__PURE__ */ b(fa, {
				asChild: !0,
				children: /* @__PURE__ */ b(Z, {
					type: "button",
					variant: "ghost",
					size: "icon-sm",
					"aria-label": c.actions(e.name),
					children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
				})
			}), /* @__PURE__ */ b(ma, {
				align: "end",
				children: e.actions
			})] })
		]
	}, e.id);
	return /* @__PURE__ */ x("div", {
		className: J("flex flex-col gap-4", l),
		children: [
			a && c.search && /* @__PURE__ */ b(go, {
				value: i ?? "",
				onValueChange: a,
				placeholder: c.search
			}),
			o && /* @__PURE__ */ b("div", {
				className: "flex flex-wrap gap-2",
				children: o
			}),
			t.length > 0 && /* @__PURE__ */ b(Ns, {
				level: s,
				title: c.waiting(t.length),
				children: t.map((e) => /* @__PURE__ */ x("li", {
					className: "flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1",
					children: [
						/* @__PURE__ */ b(Tr, {
							name: e.name,
							colored: !0,
							size: "sm"
						}),
						/* @__PURE__ */ x("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ b("p", {
								className: "truncate text-sm font-medium",
								children: e.name
							}), e.detail && /* @__PURE__ */ b("p", {
								className: "truncate text-xs text-muted-foreground",
								children: e.detail
							})]
						}),
						/* @__PURE__ */ b(Z, {
							type: "button",
							variant: "outline",
							size: "icon-sm",
							className: "rounded-full",
							"aria-label": c.deny(e.name),
							disabled: e.busy,
							onClick: () => r?.(e.id),
							children: /* @__PURE__ */ b($e, { "aria-hidden": "true" })
						}),
						/* @__PURE__ */ b(Z, {
							type: "button",
							size: "icon-sm",
							className: "rounded-full",
							"aria-label": c.admit(e.name),
							disabled: e.busy,
							onClick: () => n?.(e.id),
							children: /* @__PURE__ */ b(z, { "aria-hidden": "true" })
						})
					]
				}, e.id))
			}),
			u.length > 0 && /* @__PURE__ */ b(Ns, {
				level: s,
				title: c.raised(u.length),
				children: u.map(f)
			}),
			(e.length > 0 || !!i) && /* @__PURE__ */ x(Ns, {
				level: s,
				title: c.inMeeting(e.length),
				children: [d.map(f), e.length === 0 && c.noMatch && /* @__PURE__ */ b("li", {
					className: "px-2 py-3 text-sm text-muted-foreground",
					children: c.noMatch
				})]
			})
		]
	});
}
//#endregion
//#region src/organisms/ParticipantTile/ParticipantTile.tsx
function Fs({ lit: e }) {
	return /* @__PURE__ */ b("svg", {
		"aria-hidden": "true",
		viewBox: "0 0 12 12",
		className: "size-3.5",
		children: [
			0,
			1,
			2
		].map((t) => /* @__PURE__ */ b("rect", {
			x: 1 + t * 4,
			y: 8 - t * 3,
			width: "2.5",
			height: 3 + t * 3,
			rx: "0.75",
			fill: "currentColor",
			opacity: t < e ? 1 : .3
		}, t))
	});
}
function Is({ name: e, suffix: t, video: n, mirror: r = !1, fit: i = "cover", muted: a, speaking: o = !1, handRaised: s = !1, handPosition: c, reaction: l, connection: u, badge: d, pinned: f = !1, actions: p, labels: m, style: h, className: g }) {
	let _ = !!n, v = u === "fair" || u === "poor";
	return /* @__PURE__ */ x("figure", {
		style: h,
		"data-speaking": o || void 0,
		"data-hand": s || void 0,
		className: J("group/tile @container relative isolate m-0 overflow-hidden rounded-xl bg-muted", "ring-2 ring-transparent ring-offset-2 ring-offset-background transition-shadow duration-150", o && "ring-success", s && "ring-warning", g),
		children: [
			_ ? /* @__PURE__ */ b("div", {
				className: J("absolute inset-0 bg-video-surface", "[&>*]:size-full", i === "cover" ? "[&>*]:object-cover" : "[&>*]:object-contain", r && "[&>*]:-scale-x-100"),
				children: n
			}) : /* @__PURE__ */ b("div", {
				className: "absolute inset-0 flex items-center justify-center bg-linear-to-b from-muted to-secondary",
				children: /* @__PURE__ */ b(Tr, {
					name: e,
					colored: !0,
					size: "lg",
					className: J("@[14rem]:size-16 @[14rem]:text-xl @[24rem]:size-24 @[24rem]:text-3xl", o && "ring-4 ring-success/40")
				})
			}),
			/* @__PURE__ */ x("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2",
				children: [/* @__PURE__ */ x("div", {
					className: "flex min-w-0 items-center gap-1",
					children: [s && /* @__PURE__ */ x("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-warning px-2 py-1 text-xs font-semibold text-warning-foreground shadow-sm",
						children: [
							/* @__PURE__ */ b(xe, {
								"aria-hidden": "true",
								className: "size-3.5"
							}),
							c !== void 0 && /* @__PURE__ */ b("span", {
								"aria-hidden": "true",
								className: "tabular-nums",
								children: c
							}),
							/* @__PURE__ */ b("span", {
								className: "sr-only",
								children: m.handRaised(c)
							})
						]
					}), f && m.pinned && /* @__PURE__ */ x("span", {
						className: "inline-flex items-center rounded-full bg-video-scrim p-1.5 text-video-foreground",
						children: [/* @__PURE__ */ b(Le, {
							"aria-hidden": "true",
							className: "size-3.5"
						}), /* @__PURE__ */ b("span", {
							className: "sr-only",
							children: m.pinned
						})]
					})]
				}), /* @__PURE__ */ x("div", {
					className: "flex items-start gap-1",
					children: [l && /* @__PURE__ */ b("span", {
						role: "img",
						"aria-label": l.label,
						className: "flex size-11 animate-in items-center justify-center rounded-full bg-background/90 text-2xl shadow-md duration-300 zoom-in-50 fade-in motion-reduce:animate-none",
						children: l.emoji
					}, l.key), p && /* @__PURE__ */ x(da, { children: [/* @__PURE__ */ b(fa, {
						asChild: !0,
						children: /* @__PURE__ */ b(Z, {
							type: "button",
							variant: "secondary",
							size: "icon",
							"aria-label": m.actions(e),
							className: J("pointer-events-auto rounded-full bg-background/90 shadow-sm", "opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100", "focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"),
							children: /* @__PURE__ */ b(K, { "aria-hidden": "true" })
						})
					}), /* @__PURE__ */ b(ma, {
						align: "end",
						children: p
					})] })]
				})]
			}),
			/* @__PURE__ */ b("figcaption", {
				className: "absolute inset-x-0 bottom-0 flex items-end p-2",
				children: /* @__PURE__ */ x("span", {
					className: J("inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium", _ ? "bg-video-scrim text-video-foreground" : "bg-background/85 text-foreground shadow-xs"),
					children: [
						a && /* @__PURE__ */ b("span", {
							className: "inline-flex shrink-0 items-center justify-center rounded-full bg-destructive p-0.5 text-destructive-foreground",
							children: /* @__PURE__ */ b(ke, {
								"aria-hidden": "true",
								className: "size-3"
							})
						}),
						/* @__PURE__ */ x("span", {
							className: "truncate",
							children: [e, t && /* @__PURE__ */ x("span", {
								className: "font-normal opacity-80",
								children: [" ", t]
							})]
						}),
						a && /* @__PURE__ */ x("span", {
							className: "sr-only",
							children: [", ", m.muted]
						}),
						d && /* @__PURE__ */ b("span", {
							className: J("shrink-0 rounded px-1 text-[0.6875rem] font-semibold tracking-wide uppercase", _ ? "bg-video-foreground/15" : "bg-muted text-muted-foreground"),
							children: d
						}),
						v && m.connection && /* @__PURE__ */ x("span", {
							className: J("shrink-0", u === "poor" && !_ && "text-destructive-tint-foreground"),
							children: [/* @__PURE__ */ b(Fs, { lit: u === "poor" ? 1 : 2 }), /* @__PURE__ */ x("span", {
								className: "sr-only",
								children: [", ", m.connection[u]]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/organisms/Poll/Poll.tsx
function Ls({ draft: e, onDraftChange: t, onStart: n, labels: r, busy: i = !1, minAnswers: a = 2, maxAnswers: o = 5, maxQuestionLength: s = 200, maxAnswerLength: c = 100, className: l }) {
	let [u, d] = M(() => ({
		question: "",
		answers: Array.from({ length: Math.max(2, a) }, () => "")
	})), f = e ?? u, p = (e) => {
		d(e), t?.(e);
	}, m = k(), h = f.answers.map((e) => e.trim()), g = h.map((e) => e.toLocaleLowerCase()), _ = g.some((e, t) => e && g.indexOf(e) !== t), v = f.question.trim() !== "" && h.every(Boolean) && !_;
	return /* @__PURE__ */ x("form", {
		onSubmit: (e) => {
			e.preventDefault(), v && !i && n({
				question: f.question.trim(),
				answers: h
			});
		},
		className: J("space-y-4", l),
		children: [
			/* @__PURE__ */ x("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ b(Or, {
					htmlFor: `${m}-q`,
					children: r.question
				}), /* @__PURE__ */ b(Er, {
					id: `${m}-q`,
					value: f.question,
					maxLength: s,
					onChange: (e) => p({
						...f,
						question: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ x("div", {
				className: "space-y-2",
				children: [
					f.answers.map((e, t) => /* @__PURE__ */ x("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ b(Or, {
							htmlFor: `${m}-a${t}`,
							children: r.answer(t + 1)
						}), /* @__PURE__ */ b(Er, {
							id: `${m}-a${t}`,
							value: e,
							maxLength: c,
							"aria-invalid": _ && g.indexOf(g[t]) !== t ? !0 : void 0,
							onChange: (e) => p({
								...f,
								answers: f.answers.map((n, r) => r === t ? e.target.value : n)
							})
						})]
					}, t)),
					_ && r.duplicate && /* @__PURE__ */ b("p", {
						role: "alert",
						className: "text-sm text-destructive-tint-foreground",
						children: r.duplicate
					}),
					/* @__PURE__ */ x("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ x(Z, {
							type: "button",
							variant: "outline",
							size: "sm",
							disabled: f.answers.length >= o,
							onClick: () => p({
								...f,
								answers: [...f.answers, ""]
							}),
							children: [/* @__PURE__ */ b(ze, { "aria-hidden": "true" }), r.addAnswer]
						}), /* @__PURE__ */ x(Z, {
							type: "button",
							variant: "ghost",
							size: "sm",
							disabled: f.answers.length <= a,
							onClick: () => p({
								...f,
								answers: f.answers.slice(0, -1)
							}),
							children: [/* @__PURE__ */ b(q, { "aria-hidden": "true" }), r.removeAnswer]
						})]
					})
				]
			}),
			/* @__PURE__ */ b(Z, {
				type: "submit",
				className: "w-full",
				disabled: !v || i,
				children: i && r.starting ? r.starting : r.start
			})
		]
	});
}
function Rs({ question: e, options: t, totalVotes: n, remainingSeconds: r, votedFor: i, onVote: a, onClose: o, busy: s = !1, labels: c, className: l }) {
	let [u, d] = M(""), f = k(), p = t.find((e) => e.id === i);
	return /* @__PURE__ */ x("div", {
		className: J("space-y-4", l),
		children: [
			/* @__PURE__ */ x("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ b("h3", {
					id: `${f}-q`,
					className: "text-base font-semibold text-balance",
					children: e
				}), /* @__PURE__ */ x("p", {
					className: "flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground tabular-nums",
					children: [/* @__PURE__ */ b("span", { children: c.votes(n) }), r !== void 0 && c.remaining && /* @__PURE__ */ x("span", {
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ b(Je, {
							"aria-hidden": "true",
							className: "size-3.5"
						}), c.remaining(r)]
					})]
				})]
			}),
			p ? /* @__PURE__ */ b("p", {
				className: "rounded-lg bg-muted px-3 py-2 text-sm",
				children: c.yourVote(p.label)
			}) : a && /* @__PURE__ */ x("form", {
				className: "space-y-3",
				onSubmit: (e) => {
					e.preventDefault(), u && !s && a(u);
				},
				children: [
					/* @__PURE__ */ b(Ar, {
						"aria-labelledby": `${f}-q`,
						value: u,
						onValueChange: d,
						children: t.map((e) => /* @__PURE__ */ x(Or, {
							htmlFor: `${f}-${e.id}`,
							className: "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent",
							children: [/* @__PURE__ */ b(jr, {
								id: `${f}-${e.id}`,
								value: e.id
							}), e.label]
						}, e.id))
					}),
					c.final && /* @__PURE__ */ b("p", {
						className: "text-xs text-muted-foreground",
						children: c.final
					}),
					/* @__PURE__ */ b(Z, {
						type: "submit",
						className: "w-full",
						disabled: !u || s,
						children: c.vote
					})
				]
			}),
			o && c.close && /* @__PURE__ */ b(Z, {
				type: "button",
				variant: "outline",
				className: "w-full",
				onClick: o,
				disabled: s,
				children: c.close
			})
		]
	});
}
function zs({ question: e, results: t, votedFor: n, onNewPoll: r, labels: i, formatShare: a = (e) => `${Math.round(e * 100)} %`, className: o }) {
	let s = t.reduce((e, t) => e + t.votes, 0), c = Math.max(0, ...t.map((e) => e.votes));
	return /* @__PURE__ */ x("div", {
		className: J("space-y-4", o),
		children: [
			/* @__PURE__ */ x("div", {
				className: "space-y-1",
				children: [
					i.heading && /* @__PURE__ */ b("p", {
						className: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
						children: i.heading
					}),
					/* @__PURE__ */ b("h3", {
						className: "text-base font-semibold text-balance",
						children: e
					}),
					/* @__PURE__ */ b("p", {
						className: "text-sm text-muted-foreground tabular-nums",
						children: i.votes(s)
					})
				]
			}),
			/* @__PURE__ */ b("ul", {
				className: "space-y-3",
				children: t.map((e) => {
					let t = s ? e.votes / s : 0, r = s > 0 && e.votes === c;
					return /* @__PURE__ */ x("li", {
						className: "space-y-1",
						children: [/* @__PURE__ */ x("div", {
							className: "flex items-baseline justify-between gap-2 text-sm",
							children: [/* @__PURE__ */ x("span", {
								className: J("min-w-0", r && "font-semibold"),
								children: [e.label, e.id === n && /* @__PURE__ */ b("span", {
									"aria-hidden": "true",
									children: " ✓"
								})]
							}), /* @__PURE__ */ x("span", {
								className: "shrink-0 text-muted-foreground tabular-nums",
								children: [
									i.votes(e.votes),
									" · ",
									a(t)
								]
							})]
						}), /* @__PURE__ */ b("div", {
							"aria-hidden": "true",
							className: "h-2 overflow-hidden rounded-full bg-muted",
							children: /* @__PURE__ */ b("div", {
								className: J("h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none", r ? "bg-primary" : "bg-muted-foreground/50"),
								style: { width: `${t * 100}%` }
							})
						})]
					}, e.id);
				})
			}),
			r && i.newPoll && /* @__PURE__ */ b(Z, {
				type: "button",
				variant: "outline",
				className: "w-full",
				onClick: r,
				children: i.newPoll
			})
		]
	});
}
//#endregion
//#region src/organisms/Sheet/Sheet.tsx
function Bs({ ...e }) {
	return /* @__PURE__ */ b(s.Root, {
		"data-slot": "sheet",
		...e
	});
}
var Vs = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(s.Trigger, {
		ref: t,
		"data-slot": "sheet-trigger",
		...e
	});
});
Vs.displayName = "SheetTrigger";
var Hs = S.forwardRef(function({ ...e }, t) {
	return /* @__PURE__ */ b(s.Close, {
		ref: t,
		"data-slot": "sheet-close",
		...e
	});
});
Hs.displayName = "SheetClose";
function Us({ ...e }) {
	return /* @__PURE__ */ b(s.Portal, {
		"data-slot": "sheet-portal",
		...e
	});
}
var Ws = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Overlay, {
		ref: n,
		"data-slot": "sheet-overlay",
		className: J("fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
});
Ws.displayName = "SheetOverlay";
var Gs = {
	left: "inset-y-0 start-0 h-full w-72 max-w-[85vw] border-e data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start",
	right: "inset-y-0 end-0 h-full w-72 max-w-[85vw] border-s data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end",
	bottom: "inset-x-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl border-t pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
	top: "inset-x-0 top-0 w-full max-h-[90vh] rounded-b-2xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
};
function Ks({ className: e }) {
	return /* @__PURE__ */ b("div", {
		"aria-hidden": "true",
		className: J("mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30", e)
	});
}
var qs = S.forwardRef(function({ className: e, children: t, side: n = "left", showClose: r = !0, closeLabel: i, showHandle: a = !1, ...o }, c) {
	return /* @__PURE__ */ x(Us, { children: [/* @__PURE__ */ b(Ws, {}), /* @__PURE__ */ x(s.Content, {
		ref: c,
		"data-slot": "sheet-content",
		className: J("fixed z-50 flex flex-col gap-4 overflow-y-auto border-border bg-card text-card-foreground shadow-lg transition ease-[var(--motion-ease,cubic-bezier(0.4,0,0.2,1))] data-[state=closed]:animate-out data-[state=closed]:duration-[var(--motion-duration,200ms)] data-[state=open]:animate-in data-[state=open]:duration-[var(--motion-duration,300ms)]", Gs[n], e),
		...o,
		children: [
			a && /* @__PURE__ */ b(Ks, {}),
			t,
			r && /* @__PURE__ */ b(s.Close, {
				"aria-label": i,
				className: "absolute end-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none",
				children: /* @__PURE__ */ b($e, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				})
			})
		]
	})] });
});
qs.displayName = "SheetContent";
var Js = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Title, {
		ref: n,
		"data-slot": "sheet-title",
		className: J("text-lg font-semibold text-foreground", e),
		...t
	});
});
Js.displayName = "SheetTitle";
var Ys = S.forwardRef(function({ className: e, ...t }, n) {
	return /* @__PURE__ */ b(s.Description, {
		ref: n,
		"data-slot": "sheet-description",
		className: J("text-sm text-muted-foreground", e),
		...t
	});
});
Ys.displayName = "SheetDescription";
//#endregion
//#region src/organisms/Table/Table.tsx
function Xs({ className: e, ...t }) {
	return /* @__PURE__ */ b("div", {
		"data-slot": "table-container",
		className: "relative w-full overflow-x-auto",
		children: /* @__PURE__ */ b("table", {
			"data-slot": "table",
			className: J("w-full caption-bottom text-sm", e),
			...t
		})
	});
}
function Zs({ className: e, ...t }) {
	return /* @__PURE__ */ b("thead", {
		"data-slot": "table-header",
		className: J("[&_tr]:border-b [&_tr]:border-border", e),
		...t
	});
}
function Qs({ className: e, ...t }) {
	return /* @__PURE__ */ b("tbody", {
		"data-slot": "table-body",
		className: J("[&_tr:last-child]:border-0", e),
		...t
	});
}
function $s({ className: e, ...t }) {
	return /* @__PURE__ */ b("tfoot", {
		"data-slot": "table-footer",
		className: J("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", e),
		...t
	});
}
function ec({ className: e, ...t }) {
	return /* @__PURE__ */ b("tr", {
		"data-slot": "table-row",
		className: J("border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", e),
		...t
	});
}
function tc({ className: e, ...t }) {
	return /* @__PURE__ */ b("th", {
		"data-slot": "table-head",
		className: J("h-10 px-3 text-start align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase [&:has([role=checkbox])]:pe-0", e),
		...t
	});
}
function nc({ className: e, ...t }) {
	return /* @__PURE__ */ b("td", {
		"data-slot": "table-cell",
		className: J("p-3 align-middle [&:has([role=checkbox])]:pe-0", e),
		...t
	});
}
function rc({ className: e, ...t }) {
	return /* @__PURE__ */ b("caption", {
		"data-slot": "table-caption",
		className: J("mt-4 text-sm text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/organisms/ThreadList/ThreadList.tsx
function ic(e) {
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleString(void 0, {
		dateStyle: "medium",
		timeStyle: "short"
	});
}
var ac = "flex w-full flex-col gap-0.5 rounded-lg px-3 py-3 text-start transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted";
function oc({ threads: e, labels: t, activeId: n = null, onOpen: r, as: i, formatTime: a = ic, className: o }) {
	return e.length === 0 ? /* @__PURE__ */ b("p", {
		className: J("px-6 py-10 text-center text-sm text-muted-foreground", o),
		children: t.empty
	}) : /* @__PURE__ */ b("ul", {
		"aria-label": t.list,
		className: J("flex flex-col gap-0.5", o),
		children: e.map((e) => {
			let o = n !== null && e.id === n, s = {
				"data-active": o,
				"aria-current": o ? "true" : void 0,
				className: ac,
				onClick: () => r?.(e.id)
			}, c = e.href === void 0 ? "button" : i ?? "a", l = e.href === void 0 ? { type: "button" } : { href: e.href };
			return /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x(c, {
				...s,
				...l,
				children: [
					/* @__PURE__ */ x("span", {
						className: "flex w-full items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ x("span", {
							className: J("flex min-w-0 items-center gap-2 text-sm text-foreground", e.unread ? "font-semibold" : "font-medium"),
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
function sc(e, t = 0) {
	let n = Number.isFinite(e) && e > 0 ? Math.floor(e) : 0, r = Math.floor(n / 3600), i = Math.floor(n % 3600 / 60), a = String(n % 60).padStart(2, "0");
	return r > 0 || t >= 3600 ? `${r}:${String(i).padStart(2, "0")}:${a}` : `${i}:${a}`;
}
function cc(e, [t, n]) {
	if (!(n > t)) return e;
	let r = [...e, [t, n]].sort((e, t) => e[0] - t[0]), i = [];
	for (let [e, t] of r) {
		let n = i[i.length - 1];
		n && e <= n[1] ? n[1] = Math.max(n[1], t) : i.push([e, t]);
	}
	return i;
}
function lc(e, t) {
	if (!(t > 0)) return 0;
	let n = e.reduce((e, [n, r]) => e + Math.max(0, Math.min(r, t) - Math.max(n, 0)), 0);
	return Math.min(1, n / t);
}
function uc(e, t) {
	let n = null;
	for (let r of [...e].sort((e, t) => e.start - t.start)) if (r.start <= t) n = r;
	else break;
	return n;
}
function dc(e) {
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
var fc = [
	.5,
	.75,
	1,
	1.25,
	1.5,
	1.75,
	2
], pc = 2500, mc = 5e3, hc = "burgwiss-ui:video-prefs";
function gc(e) {
	return `burgwiss-ui:video:${e}`;
}
function _c() {
	try {
		let e = JSON.parse(localStorage.getItem(hc) ?? "null");
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
function vc(e) {
	try {
		localStorage.setItem(hc, JSON.stringify({
			..._c(),
			...e
		}));
	} catch {}
}
function yc(e) {
	return /* @__PURE__ */ b(bc, { ...e }, e.src);
}
function bc({ src: e, title: t, poster: n, resumeKey: r, chapters: i = [], showChapterList: a, captions: o = [], speeds: s = fc, refreshSrc: c, completeAt: l = .9, onProgress: u, onComplete: d, next: f, labels: p, className: m }) {
	let h = k(), g = j(null), [_, v] = M(null), S = j(null), [C, w] = M(e), [T, E] = M(!1), [ee, D] = M(!1), [A, ne] = M(!1), [N, P] = M(!1), [F, I] = M(!1), [ie, ae] = M(0), [L, oe] = M(0), [se, z] = M(0), [B, V] = M(() => _c()), [H, ce] = M(!1), [U, le] = M(!0), [W, ue] = M(!1), [de, fe] = M(""), [G, pe] = M(null), [K, me] = M(null), [he, ge] = M(null), [_e, ve] = M(""), ye = j([]), be = j(0), xe = j(!1), Se = j(!1), Ce = j(null), we = j(0), De = j(0), Oe = j(null), ke = j(null), q = () => S.current, je = (e) => fe(e), Me = B.captions && o.some((e) => e.srcLang === B.captions) ? B.captions : null, Ne = te((e = !1) => {
		let t = q();
		if (!t) return;
		let n = Number.isFinite(t.duration) ? t.duration : 0, r = lc(ye.current, n);
		!xe.current && n > 0 && r >= l && (xe.current = !0, d?.());
		let i = Date.now();
		!e && i - we.current < mc || (we.current = i, u?.({
			currentTime: t.currentTime,
			duration: n,
			watched: ye.current,
			fraction: r
		}));
	}, [
		u,
		d,
		l
	]), Fe = te(() => {
		le(!0), Oe.current && window.clearTimeout(Oe.current), Oe.current = window.setTimeout(() => le(!1), pc);
	}, []);
	O(() => () => void (Oe.current && window.clearTimeout(Oe.current)), []);
	let Le = !T || U || W, ze = () => void q()?.play()?.catch(() => {}), Be = () => {
		let e = q();
		e && (e.paused || e.ended ? ze() : e.pause());
	}, Ue = (e, t = !0) => {
		let n = q();
		if (!n) return;
		let r = Number.isFinite(n.duration) ? n.duration : e;
		n.currentTime = Math.max(0, Math.min(r, e)), ae(n.currentTime), ne(!1), t && je(p.announce.seeked(sc(n.currentTime, r)));
	}, We = (e) => {
		let t = q();
		t && (t.playbackRate = e), V((t) => ({
			...t,
			rate: e
		})), vc({ rate: e }), je(p.announce.speed(p.speedValue(e)));
	}, qe = (e) => {
		let t = q(), n = Math.round(Math.max(0, Math.min(1, e)) * 100) / 100;
		t && (t.volume = n, t.muted = n === 0), V((e) => ({
			...e,
			volume: n,
			muted: n === 0
		})), vc({
			volume: n,
			muted: n === 0
		}), je(p.announce.volume(Math.round(n * 100)));
	}, Je = () => {
		let e = q(), t = !(e?.muted ?? B.muted);
		e && (e.muted = t), V((e) => ({
			...e,
			muted: t
		})), vc({ muted: t }), je(t ? p.announce.muted : p.announce.unmuted);
	}, Ye = (e) => {
		for (let t of Array.from(q()?.textTracks ?? [])) t.mode = t.language === e ? "hidden" : "disabled";
		V((t) => ({
			...t,
			captions: e
		})), vc({ captions: e });
		let t = o.find((t) => t.srcLang === e)?.label;
		je(t ? p.announce.captionsOn(t) : p.announce.captionsOff);
	}, $e = async () => {
		let e = g.current, t = q();
		try {
			document.fullscreenElement ? await document.exitFullscreen() : e?.requestFullscreen ? await e.requestFullscreen() : t?.webkitEnterFullscreen?.();
		} catch {}
	}, et = async () => {
		let e = q();
		try {
			document.pictureInPictureElement ? await document.exitPictureInPicture() : await e?.requestPictureInPicture?.();
		} catch {}
	}, tt = (e) => {
		let t = q(), n = t && Number.isFinite(t.duration) ? t.duration : L;
		switch (e.type) {
			case "toggle": return Be();
			case "seekBy": return Ue((t?.currentTime ?? ie) + e.seconds);
			case "seekTo": return Ue(e.fraction * n);
			case "volumeBy": return qe((B.muted ? 0 : B.volume) + e.delta);
			case "mute": return Je();
			case "fullscreen":
				$e();
				return;
			case "captions": return o.length === 0 ? void 0 : Ye(Me ? null : (o.find((e) => e.default) ?? o[0]).srcLang);
			case "speedBy": {
				let t = s.indexOf(B.rate), n = s[Math.max(0, Math.min(s.length - 1, (t < 0 ? s.indexOf(1) : t) + e.step))];
				n !== void 0 && We(n);
				return;
			}
		}
	}, nt = (e) => {
		let t = e.target;
		if (t.closest("input,textarea,select,[role=menu],[role=menuitem],[role=menuitemradio],[role=slider]") || (e.key === " " || e.key === "Enter") && t.closest("button")) return;
		let n = dc(e);
		n && (e.preventDefault(), Fe(), tt(n));
	}, rt = () => {
		let e = q();
		if (!e) return;
		oe(Number.isFinite(e.duration) ? e.duration : 0), e.playbackRate = B.rate, e.volume = B.volume, e.muted = B.muted;
		for (let t of Array.from(e.textTracks)) t.mode = t.language === Me ? "hidden" : "disabled";
		let t = Ce.current;
		if (Ce.current = null, t === null && r) try {
			let n = Number(localStorage.getItem(gc(r)) ?? 0) || 0;
			n > 3 && Number.isFinite(e.duration) && n < e.duration - 5 && (t = n);
		} catch {}
		t !== null && (e.currentTime = t, ae(t), be.current = t);
	}, it = () => {
		let e = q();
		if (!e) return;
		let t = e.currentTime;
		if (!e.paused && t > be.current && t - be.current < 1.5 * Math.max(1, e.playbackRate) && (ye.current = cc(ye.current, [be.current, t])), be.current = t, ae(t), e.buffered.length && z(e.buffered.end(e.buffered.length - 1)), r && Date.now() - De.current >= mc) {
			De.current = Date.now();
			try {
				localStorage.setItem(gc(r), String(Math.floor(t)));
			} catch {}
		}
		Ne();
	}, at = () => {
		if (E(!1), ne(!0), Ne(!0), r) try {
			localStorage.removeItem(gc(r));
		} catch {}
		f?.autoAdvanceSeconds && me(f.autoAdvanceSeconds);
	}, ot = async () => {
		let e = q()?.currentTime ?? 0;
		if (c && !Se.current) {
			Se.current = !0;
			try {
				let t = await c();
				Ce.current = e > 0 ? e : null, w(t);
				return;
			} catch {}
		}
		I(!0), P(!1);
	}, st = async () => {
		let t = ie;
		if (I(!1), Se.current = !1, Ce.current = t > 0 ? t : null, c) try {
			w(await c());
			return;
		} catch {
			I(!0);
			return;
		}
		w(`${e}${e.includes("?") ? "&" : "?"}retry=${Date.now()}`);
	};
	O(() => {
		let e = Array.from(S.current?.textTracks ?? []).find((e) => e.language === Me);
		if (!e) {
			ve("");
			return;
		}
		let t = () => ve(Array.from(e.activeCues ?? []).map((e) => e.text ?? "").join("\n"));
		return t(), e.addEventListener?.("cuechange", t), () => e.removeEventListener?.("cuechange", t);
	}, [Me, L]), O(() => {
		let e = () => ce(document.fullscreenElement === g.current);
		return document.addEventListener("fullscreenchange", e), () => document.removeEventListener("fullscreenchange", e);
	}, []), O(() => {
		if (K === null || !f) return;
		let e = window.setTimeout(() => {
			K <= 1 ? (me(null), f.onPlay()) : me(K - 1);
		}, 1e3);
		return () => window.clearTimeout(e);
	}, [K, f]);
	let ct = (e) => {
		if (g.current?.focus({ preventScroll: !0 }), e.pointerType === "mouse") {
			Be();
			return;
		}
		let t = Date.now(), n = e.currentTarget.getBoundingClientRect(), r = e.clientX - n.left, i = ke.current;
		if (ke.current = {
			t,
			x: r
		}, i && t - i.t < 300 && Math.abs(i.x - r) < 60) {
			let e = lt(g.current), i = r < n.width / 3, a = r > n.width * 2 / 3;
			if (i || a) {
				let n = a !== e;
				tt({
					type: "seekBy",
					seconds: n ? 10 : -10
				}), pe({
					side: n ? "forward" : "back",
					key: t
				}), ke.current = null;
				return;
			}
		}
		U && T ? le(!1) : Fe();
	}, ut = uc(i, ie), dt = (a ?? i.length > 0) && i.length > 0, ft = (e) => L > 0 ? `${Math.min(100, e / L * 100)}%` : "0%", Y = B.muted || B.volume === 0 ? Qe : B.volume < .5 ? Xe : Ze, X = "text-video-foreground hover:bg-video-foreground/15 hover:text-video-foreground focus-visible:ring-video-foreground aria-expanded:bg-video-foreground/15";
	return /* @__PURE__ */ x("div", {
		className: J("space-y-3", m),
		children: [/* @__PURE__ */ x("div", {
			ref: (e) => {
				g.current = e, v(e);
			},
			role: "region",
			"aria-label": t,
			tabIndex: 0,
			onKeyDown: nt,
			onPointerMove: Fe,
			onFocus: Fe,
			className: J("group/player @container relative isolate aspect-video w-full overflow-hidden rounded-xl bg-video-surface text-video-foreground shadow-lg", H && "rounded-none", !Le && "cursor-none"),
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
					onDurationChange: () => oe(q()?.duration && Number.isFinite(q().duration) ? q().duration : 0),
					onTimeUpdate: it,
					onProgress: () => {
						let e = q();
						e?.buffered.length && z(e.buffered.end(e.buffered.length - 1));
					},
					onPlay: () => {
						E(!0), D(!0), ne(!1), me(null), je(p.announce.playing), Fe();
					},
					onPause: () => {
						E(!1), le(!0), Ne(!0), q()?.ended || je(p.announce.paused);
					},
					onWaiting: () => P(!0),
					onPlaying: () => P(!1),
					onCanPlay: () => P(!1),
					onEnded: at,
					onError: () => void ot(),
					children: o.map((e) => /* @__PURE__ */ b("track", {
						kind: "captions",
						src: e.src,
						srcLang: e.srcLang,
						label: e.label
					}, e.src))
				}, C),
				!F && !A && /* @__PURE__ */ b("div", {
					"aria-hidden": "true",
					className: "absolute inset-0",
					onPointerUp: ct
				}),
				N && !F && /* @__PURE__ */ x("div", {
					role: "status",
					className: "pointer-events-none absolute inset-0 flex items-center justify-center",
					children: [/* @__PURE__ */ b(Te, {
						"aria-hidden": "true",
						className: "size-12 animate-spin text-video-foreground/90"
					}), /* @__PURE__ */ b("span", {
						className: "sr-only",
						children: p.loading
					})]
				}),
				G && /* @__PURE__ */ b("div", {
					"aria-hidden": "true",
					onAnimationEnd: () => pe(null),
					className: J("pointer-events-none absolute inset-y-0 flex w-1/3 animate-out items-center justify-center bg-video-foreground/10 text-sm font-semibold duration-500 fade-out", G.side === "back" ? "start-0 rounded-e-full" : "end-0 rounded-s-full"),
					children: p.skipped(G.side === "back" ? -10 : 10)
				}, G.key),
				!T && !F && !A && !N && /* @__PURE__ */ b("button", {
					type: "button",
					onClick: () => {
						ze(), g.current?.focus({ preventScroll: !0 });
					},
					"aria-label": p.play,
					className: "absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-video-foreground",
					children: /* @__PURE__ */ b(Re, {
						"aria-hidden": "true",
						className: "size-8 translate-x-0.5 fill-current"
					})
				}),
				A && !F && /* @__PURE__ */ b("div", {
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
						K !== null && /* @__PURE__ */ b("p", {
							role: "timer",
							className: "text-sm text-video-foreground/80",
							children: p.startsIn(K)
						}),
						/* @__PURE__ */ x("div", {
							className: "flex flex-wrap items-center justify-center gap-2",
							children: [
								/* @__PURE__ */ x(Z, {
									type: "button",
									onClick: () => (me(null), f.onPlay()),
									children: [/* @__PURE__ */ b(Ke, { "aria-hidden": "true" }), p.playNext]
								}),
								/* @__PURE__ */ x(Z, {
									type: "button",
									variant: "ghost",
									className: X,
									onClick: () => (me(null), Ue(0, !1), ze()),
									children: [/* @__PURE__ */ b(Ve, { "aria-hidden": "true" }), p.replay]
								}),
								K !== null && /* @__PURE__ */ b(Z, {
									type: "button",
									variant: "ghost",
									className: X,
									onClick: () => me(null),
									children: p.cancel
								})
							]
						})
					] }) : /* @__PURE__ */ x(Z, {
						type: "button",
						onClick: () => (Ue(0, !1), ze()),
						children: [/* @__PURE__ */ b(Ve, { "aria-hidden": "true" }), p.replay]
					})
				}),
				F && /* @__PURE__ */ x("div", {
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
							children: [/* @__PURE__ */ b(He, { "aria-hidden": "true" }), p.retry]
						})
					]
				}),
				ee && !F && /* @__PURE__ */ x("div", {
					"data-visible": Le,
					className: J("absolute inset-x-0 bottom-0 bg-linear-to-t from-video-scrim via-video-scrim/60 to-transparent px-3 pt-10 pb-2 transition-opacity duration-200", "opacity-100 group-focus-within/player:opacity-100 data-[visible=false]:opacity-0"),
					children: [/* @__PURE__ */ b(xc, {
						time: ie,
						duration: L,
						buffered: se,
						chapters: i,
						labels: p,
						hover: he,
						onHover: ge,
						onSeek: (e) => Ue(e, !1),
						onSeekEnd: (e) => je(p.announce.seeked(sc(e, L))),
						pct: ft
					}), /* @__PURE__ */ x("div", {
						className: "mt-1 flex items-center gap-0.5",
						children: [
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: X,
								"aria-label": T ? p.pause : p.play,
								"aria-keyshortcuts": "k",
								onClick: Be,
								children: b(T ? Pe : Re, {
									"aria-hidden": "true",
									className: "fill-current"
								})
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: J(X, "@max-xs:hidden"),
								"data-control": "back10",
								"aria-label": p.back10,
								"aria-keyshortcuts": "j",
								onClick: () => tt({
									type: "seekBy",
									seconds: -10
								}),
								children: /* @__PURE__ */ b(Ve, {
									"aria-hidden": "true",
									className: "rtl:-scale-x-100"
								})
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: J(X, "@max-xs:hidden"),
								"data-control": "forward10",
								"aria-label": p.forward10,
								"aria-keyshortcuts": "l",
								onClick: () => tt({
									type: "seekBy",
									seconds: 10
								}),
								children: /* @__PURE__ */ b(He, {
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
									"aria-label": B.muted ? p.unmute : p.mute,
									"aria-keyshortcuts": "m",
									onClick: Je,
									children: /* @__PURE__ */ b(Y, { "aria-hidden": "true" })
								}), /* @__PURE__ */ b("input", {
									type: "range",
									min: 0,
									max: 1,
									step: .05,
									value: B.muted ? 0 : B.volume,
									"aria-label": p.volume,
									"aria-valuetext": `${Math.round((B.muted ? 0 : B.volume) * 100)} %`,
									onChange: (e) => qe(Number(e.target.value)),
									className: "h-1 w-0 cursor-pointer accent-video-foreground opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 pointer-coarse:hidden"
								})]
							}),
							/* @__PURE__ */ x("span", {
								className: "ms-2 text-sm text-video-foreground/90 tabular-nums",
								dir: "ltr",
								children: [sc(ie, L), /* @__PURE__ */ x("span", {
									className: "@max-md:hidden",
									children: [" / ", sc(L, L)]
								})]
							}),
							ut && /* @__PURE__ */ x("span", {
								className: "ms-3 hidden min-w-0 truncate text-sm text-video-foreground/80 sm:inline",
								children: ["· ", ut.title]
							}),
							/* @__PURE__ */ b("span", { className: "flex-1" }),
							o.length > 0 && /* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: J(X, Me && "bg-video-foreground/15"),
								"aria-label": p.captions,
								"aria-pressed": Me !== null,
								"aria-keyshortcuts": "c",
								onClick: () => tt({ type: "captions" }),
								children: /* @__PURE__ */ b(R, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ x(da, {
								open: W,
								onOpenChange: ue,
								children: [/* @__PURE__ */ b(fa, {
									asChild: !0,
									children: /* @__PURE__ */ b(Z, {
										variant: "ghost",
										size: "icon",
										className: X,
										"aria-label": p.settings,
										children: /* @__PURE__ */ b(Ge, { "aria-hidden": "true" })
									})
								}), /* @__PURE__ */ x(ma, {
									side: "top",
									align: "end",
									container: _,
									className: "w-48",
									children: [
										/* @__PURE__ */ b(Sa, { children: p.speed }),
										/* @__PURE__ */ b(ga, {
											value: String(B.rate),
											onValueChange: (e) => We(Number(e)),
											children: s.map((e) => /* @__PURE__ */ b(_a, {
												value: String(e),
												children: p.speedValue(e)
											}, e))
										}),
										o.length > 0 && /* @__PURE__ */ x(y, { children: [
											/* @__PURE__ */ b($, {}),
											/* @__PURE__ */ b(Sa, { children: p.captions }),
											/* @__PURE__ */ x(ga, {
												value: Me ?? "",
												onValueChange: (e) => Ye(e || null),
												children: [/* @__PURE__ */ b(_a, {
													value: "",
													children: p.captionsOff
												}), o.map((e) => /* @__PURE__ */ b(_a, {
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
								className: J(X, "@max-md:hidden"),
								"data-control": "pip",
								"aria-label": p.pictureInPicture,
								onClick: () => void et(),
								children: /* @__PURE__ */ b(Ie, { "aria-hidden": "true" })
							}),
							/* @__PURE__ */ b(Z, {
								variant: "ghost",
								size: "icon",
								className: X,
								"aria-label": H ? p.exitFullscreen : p.fullscreen,
								"aria-keyshortcuts": "f",
								onClick: () => void $e(),
								children: b(H ? Ae : Ee, { "aria-hidden": "true" })
							})
						]
					})]
				}),
				Me && _e && /* @__PURE__ */ b("div", {
					"data-caption": "",
					className: J("pointer-events-none absolute inset-x-0 flex justify-center px-6 transition-[bottom] duration-200", Le && ee ? "bottom-24" : "bottom-6"),
					children: /* @__PURE__ */ b("p", {
						lang: Me,
						className: "max-w-[90%] rounded-md bg-video-scrim px-3 py-1 text-center text-base leading-snug whitespace-pre-line sm:text-lg md:text-xl",
						children: _e
					})
				}),
				/* @__PURE__ */ b("div", {
					role: "status",
					"aria-live": "polite",
					className: "sr-only",
					children: de
				})
			]
		}), dt && /* @__PURE__ */ x("nav", {
			"aria-labelledby": `${h}-chapters`,
			children: [/* @__PURE__ */ b("h2", {
				id: `${h}-chapters`,
				className: "mb-1 text-sm font-semibold",
				children: p.chapters
			}), /* @__PURE__ */ b("ol", {
				className: "divide-y divide-border rounded-lg border border-border",
				children: [...i].sort((e, t) => e.start - t.start).map((e) => {
					let t = ut?.start === e.start;
					return /* @__PURE__ */ b("li", { children: /* @__PURE__ */ x("button", {
						type: "button",
						"aria-current": t ? "true" : void 0,
						onClick: () => {
							Ue(e.start), ze();
						},
						className: "flex w-full items-center gap-3 px-3 py-2 text-start text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=true]:bg-muted aria-[current=true]:font-medium",
						children: [/* @__PURE__ */ b("span", {
							className: "w-14 shrink-0 text-muted-foreground tabular-nums",
							dir: "ltr",
							children: sc(e.start, L)
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
function xc({ time: e, duration: t, buffered: n, chapters: r, labels: i, hover: a, onHover: o, onSeek: s, onSeekEnd: c, pct: l }) {
	let u = j(null), d = j(!1), f = (e) => {
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
	}, m = [...r].sort((e, t) => e.start - t.start).filter((e) => e.start > 0 && e.start < t), h = a ? uc(r, a.time) : null;
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
				children: sc(a.time, t)
			})]
		}), /* @__PURE__ */ x("div", {
			ref: u,
			role: "slider",
			tabIndex: 0,
			"aria-label": i.seek,
			"aria-valuemin": 0,
			"aria-valuemax": Math.round(t),
			"aria-valuenow": Math.round(e),
			"aria-valuetext": i.timeOf(sc(e, t), sc(t, t)),
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
//#region src/organisms/VideoStage/VideoStage.tsx
var Sc = {
	minTileWidth: 9,
	maxPerPage: 6
};
function Cc() {
	let e = j(null), [t, n] = M({
		width: 0,
		height: 0
	});
	return A(() => {
		let t = e.current;
		if (!t) return;
		let r = (e, t) => {
			let r = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
			n({
				width: e / r,
				height: t / r
			});
		}, i = t.getBoundingClientRect();
		r(i.width, i.height);
		let a = new ResizeObserver(([e]) => {
			e && r(e.contentRect.width, e.contentRect.height);
		});
		return a.observe(t), () => a.disconnect();
	}, []), [e, t];
}
function wc({ children: e, featured: t, labels: n, page: r, onPageChange: i, grid: a, className: o }) {
	let s = C.toArray(e).filter(ee), [c, l] = Cc(), [u, d] = M(0), f = t ? {
		...Sc,
		...a
	} : a, p = l.width > 0 && l.height > 0, m = f?.maxPerPage ?? 16, h = p ? Pt(l.width, l.height, s.length, f) : {
		pageSize: m,
		pages: Math.max(1, Math.ceil(s.length / m)),
		tileWidth: 0,
		tileHeight: 0
	}, g = Math.min(r ?? u, h.pages - 1), _ = (e) => {
		d(e), i?.(e);
	}, v = s.slice(g * h.pageSize, (g + 1) * h.pageSize), y = h.pages > 1 && /* @__PURE__ */ x("div", {
		role: "group",
		"aria-label": n.pages,
		className: "flex shrink-0 items-center justify-center gap-1",
		children: [
			/* @__PURE__ */ b(Z, {
				type: "button",
				variant: "ghost",
				size: "icon-sm",
				"aria-label": n.previous,
				disabled: g === 0,
				onClick: () => _(g - 1),
				children: /* @__PURE__ */ b(V, {
					"aria-hidden": "true",
					className: "rtl:-scale-x-100"
				})
			}),
			/* @__PURE__ */ b("p", {
				role: "status",
				className: "min-w-24 text-center text-sm text-muted-foreground tabular-nums",
				children: n.page(g + 1, h.pages)
			}),
			/* @__PURE__ */ b(Z, {
				type: "button",
				variant: "ghost",
				size: "icon-sm",
				"aria-label": n.next,
				disabled: g >= h.pages - 1,
				onClick: () => _(g + 1),
				children: /* @__PURE__ */ b(H, {
					"aria-hidden": "true",
					className: "rtl:-scale-x-100"
				})
			})
		]
	}), S = /* @__PURE__ */ b("div", {
		ref: c,
		className: J("relative flex min-h-0 min-w-0 flex-1 flex-wrap content-center justify-center gap-2", t && "content-start"),
		children: s.length === 0 ? /* @__PURE__ */ b("p", {
			className: "self-center text-sm text-muted-foreground",
			children: n.empty
		}) : v.map((e) => /* @__PURE__ */ b("div", {
			className: "flex [&>*]:size-full",
			style: p ? {
				width: `${h.tileWidth}rem`,
				height: `${h.tileHeight}rem`
			} : {
				width: "20rem",
				aspectRatio: "16 / 9"
			},
			children: e
		}, e.key))
	});
	return /* @__PURE__ */ x("section", {
		"aria-label": n.stage,
		className: J("@container flex h-full min-h-0 w-full flex-col gap-2", o),
		children: [y, t ? /* @__PURE__ */ x("div", {
			className: "grid min-h-0 flex-1 grid-rows-[2fr_minmax(6rem,1fr)] gap-2 @5xl:grid-cols-[minmax(0,1fr)_20rem] @5xl:grid-rows-1",
			children: [/* @__PURE__ */ b("div", {
				className: "relative min-h-0 min-w-0 overflow-hidden rounded-xl bg-video-surface",
				children: t
			}), /* @__PURE__ */ b("div", {
				className: "flex min-h-0 min-w-0",
				children: S
			})]
		}) : S]
	});
}
//#endregion
//#region src/templates/SidebarLayout/SidebarLayout.tsx
function Tc({ sidebar: e, side: t = "left", children: n, className: r }) {
	let i = /* @__PURE__ */ b("main", {
		className: "relative min-h-0 min-w-0 flex-1 overflow-auto",
		children: n
	});
	return /* @__PURE__ */ x("div", {
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
function Ec({ rail: e, sidebar: t, children: n, className: r }) {
	return /* @__PURE__ */ x("div", {
		className: J("flex h-svh min-h-0 w-full bg-background text-foreground", r),
		children: [e, /* @__PURE__ */ b("div", {
			className: "min-w-0 flex-1",
			children: t ? /* @__PURE__ */ b(Tc, {
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
function Dc({ threadList: e, threadListHeader: t, threadListFooter: n, conversation: r, emptyAction: i, labels: a, resizeStorageKey: o, defaultThreadListWidth: s = 320, className: c }) {
	let l = r != null && r !== !1;
	return /* @__PURE__ */ b(Tc, {
		className: c,
		sidebar: /* @__PURE__ */ x(us, {
			label: a.threadList,
			defaultWidth: s,
			resize: {
				label: a.resize,
				storageKey: o,
				minWidth: 240
			},
			className: l ? "max-md:hidden" : "max-md:w-full!",
			children: [
				t && /* @__PURE__ */ b(fs, { children: t }),
				/* @__PURE__ */ b(ps, { children: e }),
				n && /* @__PURE__ */ b(ms, { children: n })
			]
		}),
		children: l ? /* @__PURE__ */ b("div", {
			className: "h-full min-h-0",
			children: r
		}) : /* @__PURE__ */ b("div", {
			className: "flex h-full items-center justify-center p-6 max-md:hidden",
			children: /* @__PURE__ */ b(Ca, {
				icon: De,
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
function Oc({ title: e, grid: t, actionsLabel: n, search: r, moreActionsLabel: i, selectionLabels: a, shortcutLabels: o, options: s, chips: c, notice: l, footer: u, offsetTop: d = "4rem", children: f }) {
	let p = j(null), m = t?.selectedIds.length ?? 0, h = t?.visibleActions ?? [], g = (e) => {
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
		className: J("min-h-0 flex-1 overflow-auto", "[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted", "[&_td:first-child]:ps-4 [&_td:last-child]:pe-4 [&_th:first-child]:ps-4 [&_th:last-child]:pe-4", "[&_td]:border-border [&_td:not(:last-child)]:border-e [&_th]:border-border [&_th:not(:last-child)]:border-e", "data-[density=comfortable]:[&_td]:py-3 data-[density=compact]:[&_td]:py-1.5 data-[density=compact]:[&_th]:h-8", "[&_[data-slot=table-container]]:overflow-visible"),
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
				children: [/* @__PURE__ */ b(Ss, {
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
						children: /* @__PURE__ */ b($e, { "aria-hidden": "true" })
					}), /* @__PURE__ */ b("span", {
						"aria-live": "polite",
						className: "px-1 text-sm font-medium whitespace-nowrap tabular-nums",
						children: a.count(m)
					})] })
				}), /* @__PURE__ */ x("div", {
					className: "ms-auto flex shrink-0 items-center gap-1",
					children: [r && /* @__PURE__ */ b(go, {
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
			t && t.actions.length > 0 ? /* @__PURE__ */ x(ia, { children: [/* @__PURE__ */ b(aa, {
				asChild: !0,
				children: _
			}), /* @__PURE__ */ b(oa, { children: /* @__PURE__ */ b(ws, {
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
//#region src/templates/MeetingLobby/MeetingLobby.tsx
function kc({ header: e, notice: t, title: n, description: r, meta: i, access: a, preview: o, aside: s, footer: c, className: l }) {
	return /* @__PURE__ */ x("div", {
		className: J("flex min-h-full w-full flex-col bg-background text-foreground", l),
		children: [
			e && /* @__PURE__ */ b("header", {
				className: "shrink-0 border-b border-border px-4 py-3 sm:px-6",
				children: e
			}),
			/* @__PURE__ */ b("main", {
				className: "flex flex-1 justify-center px-4 py-6 sm:px-6 sm:py-10",
				children: /* @__PURE__ */ x("div", {
					className: J("flex w-full max-w-6xl flex-col gap-6", s && "xl:flex-row xl:items-start"),
					children: [/* @__PURE__ */ x("div", {
						className: "min-w-0 flex-1 space-y-6",
						children: [t, /* @__PURE__ */ x("div", {
							className: J("grid items-center gap-6 sm:gap-10", o && "md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]"),
							children: [o && /* @__PURE__ */ b("div", {
								className: "order-2 min-w-0 md:order-1",
								children: o
							}), /* @__PURE__ */ x("div", {
								className: J("order-1 min-w-0 space-y-5 md:order-2", !o && "mx-auto w-full max-w-md text-center"),
								children: [
									/* @__PURE__ */ x("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ b("h1", {
											className: "text-2xl font-semibold tracking-tight text-balance sm:text-3xl",
											children: n
										}), r && /* @__PURE__ */ b("div", {
											className: "text-base text-pretty text-muted-foreground",
											children: r
										})]
									}),
									i && /* @__PURE__ */ b("div", {
										className: J("flex flex-wrap items-center gap-2 text-sm", !o && "justify-center"),
										children: i
									}),
									/* @__PURE__ */ b("div", {
										className: "space-y-3",
										children: a
									})
								]
							})]
						})]
					}), s && /* @__PURE__ */ b("aside", {
						className: "w-full shrink-0 rounded-2xl border border-border bg-card p-4 xl:w-80",
						children: s
					})]
				})
			}),
			c && /* @__PURE__ */ b("footer", {
				className: "shrink-0 px-4 py-4 text-sm text-muted-foreground sm:px-6",
				children: c
			})
		]
	});
}
//#endregion
//#region src/templates/MeetingRoom/MeetingRoom.tsx
function Ac({ header: e, notices: t, stage: n, overlay: r, prompt: i, toolbar: a, panel: o, className: s }) {
	return /* @__PURE__ */ x("div", {
		className: J("flex h-full min-h-0 w-full flex-col bg-background text-foreground", s),
		children: [
			e,
			/* @__PURE__ */ x("div", {
				className: "relative flex min-h-0 flex-1",
				children: [/* @__PURE__ */ x("main", {
					className: "relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 px-2 pt-1 sm:px-3",
					children: [
						t && /* @__PURE__ */ b("div", {
							className: "max-h-[30%] shrink-0 space-y-2 overflow-y-auto",
							children: t
						}),
						/* @__PURE__ */ x("div", {
							className: "relative min-h-0 flex-1",
							children: [n, r && /* @__PURE__ */ b("div", {
								className: "pointer-events-none absolute end-2 top-2 z-10 flex max-h-[calc(100%-1rem)] w-[min(24rem,calc(100%-1rem))] flex-col items-end gap-2 overflow-y-auto [&>*]:pointer-events-auto",
								children: r
							})]
						}),
						i && /* @__PURE__ */ b("div", {
							className: "flex shrink-0 justify-center",
							children: i
						})
					]
				}), o && /* @__PURE__ */ b("div", {
					className: J("absolute inset-x-0 bottom-0 z-20 flex h-[min(75%,40rem)] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl", "animate-in duration-200 fade-in slide-in-from-bottom-8 motion-reduce:animate-none", "lg:static lg:me-3 lg:mt-1 lg:h-auto lg:w-[22rem] lg:rounded-2xl lg:border lg:shadow-sm"),
					children: o
				})]
			}),
			/* @__PURE__ */ b("div", {
				className: "shrink-0",
				children: a
			})
		]
	});
}
function jc({ title: e, closeLabel: t, onClose: n, actions: r, children: i, footer: a, flush: o = !1 }) {
	let s = k(), c = j(null), l = j(n);
	return O(() => {
		l.current = n;
	}), O(() => {
		let e = c.current;
		if (!e) return;
		e.focus();
		let t = (e) => {
			e.key === "Escape" && !e.defaultPrevented && (e.stopPropagation(), l.current());
		};
		return e.addEventListener("keydown", t), () => e.removeEventListener("keydown", t);
	}, []), /* @__PURE__ */ x("section", {
		ref: c,
		tabIndex: -1,
		"aria-labelledby": s,
		className: "flex min-h-0 flex-1 flex-col outline-none",
		children: [
			/* @__PURE__ */ x("div", {
				className: "flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5",
				children: [
					/* @__PURE__ */ b("h2", {
						id: s,
						className: "min-w-0 flex-1 truncate text-base font-semibold",
						children: e
					}),
					r,
					/* @__PURE__ */ b(Z, {
						type: "button",
						variant: "ghost",
						size: "icon",
						"aria-label": t,
						onClick: n,
						children: /* @__PURE__ */ b($e, { "aria-hidden": "true" })
					})
				]
			}),
			/* @__PURE__ */ b("div", {
				className: J("min-h-0 flex-1 overflow-y-auto", !o && "px-4 py-3"),
				children: i
			}),
			a && /* @__PURE__ */ b("div", {
				className: "shrink-0 border-t border-border p-3",
				children: a
			})
		]
	});
}
//#endregion
//#region src/templates/PageEditor/PageEditor.tsx
function Mc({ toolbar: e, aside: t, device: n, onDeviceChange: r, previewTools: i, storageKey: a, labels: o, children: s }) {
	let c = [{
		id: "desktop",
		label: o.desktop,
		icon: /* @__PURE__ */ b(je, { "aria-hidden": "true" })
	}, {
		id: "phone",
		label: o.phone,
		icon: /* @__PURE__ */ b(qe, { "aria-hidden": "true" })
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
						className: J("mx-auto min-h-full overflow-hidden bg-card pb-24", "transition-[max-width] duration-300 ease-out motion-reduce:transition-none", n === "desktop" ? "max-w-full" : "max-w-[390px] border-x border-border shadow-sm"),
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
						className: J("text-muted-foreground", n === e.id && "bg-muted text-foreground"),
						children: e.icon
					}, e.id)), i && /* @__PURE__ */ x(y, { children: [/* @__PURE__ */ b("span", {
						"aria-hidden": "true",
						className: "mx-1 h-5 w-px bg-border"
					}), i] })]
				})]
			}), t && /* @__PURE__ */ b(us, {
				label: o.aside,
				side: "right",
				defaultWidth: 264,
				resize: {
					label: o.resizeAside,
					storageKey: a,
					minWidth: 220
				},
				children: /* @__PURE__ */ b(ps, {
					className: "gap-6 px-4 py-4",
					children: t
				})
			})]
		})]
	});
}
//#endregion
export { Ec as AdminLayout, Br as AdmissionRequests, Ir as Alert, zr as AlertAction, Rr as AlertDescription, Vr as AlertDialog, Xr as AlertDialogAction, Zr as AlertDialogCancel, Gr as AlertDialogContent, Yr as AlertDialogDescription, qr as AlertDialogFooter, Kr as AlertDialogHeader, Wr as AlertDialogOverlay, Ur as AlertDialogPortal, Jr as AlertDialogTitle, Hr as AlertDialogTrigger, Lr as AlertTitle, ko as AppRail, jo as AppRailItem, Ao as AppRailSpacer, mi as AttachmentDropzone, gi as AttachmentList, er as AudioLevelMeter, Jn as Avatar, Zn as AvatarBadge, Xn as AvatarFallback, Qn as AvatarGroup, $n as AvatarGroupCount, Yn as AvatarImage, ar as Badge, _i as Breadcrumb, Ci as BreadcrumbEllipsis, yi as BreadcrumbItem, bi as BreadcrumbLink, vi as BreadcrumbList, xi as BreadcrumbPage, Si as BreadcrumbSeparator, Z as Button, wi as Card, Oi as CardAction, ki as CardContent, Di as CardDescription, Ai as CardFooter, Ti as CardHeader, Ei as CardTitle, Bo as CategoryTree, Ho as ChatComposer, Dc as ChatPage, mr as Checkbox, gr as Chip, _r as ChipRow, ji as Collapsible, Ni as CollapsibleContent, Mi as CollapsibleTrigger, Wi as ColorPicker, qi as Combobox, Ji as Command, Yi as CommandDialog, Qi as CommandEmpty, $i as CommandGroup, Xi as CommandInput, ta as CommandItem, Zi as CommandList, ea as CommandSeparator, Gi as CompletionChecklist, na as ComposerAttachments, ra as ConfirmActionDialog, ia as ContextMenu, oa as ContextMenuContent, sa as ContextMenuItem, la as ContextMenuLabel, ca as ContextMenuSeparator, ua as ContextMenuShortcut, aa as ContextMenuTrigger, Yo as Conversation, vr as CopyLinkButton, Wn as DEVICE_WIDTHS, es as DataGrid, ss as DevicePreview, Qr as Dialog, si as DialogClose, ni as DialogContent, oi as DialogDescription, ii as DialogFooter, ri as DialogHeader, ti as DialogOverlay, ei as DialogPortal, ai as DialogTitle, $r as DialogTrigger, st as DirectionProvider, da as DropdownMenu, ha as DropdownMenuCheckboxItem, ma as DropdownMenuContent, Q as DropdownMenuItem, Sa as DropdownMenuLabel, pa as DropdownMenuPortal, ga as DropdownMenuRadioGroup, _a as DropdownMenuRadioItem, $ as DropdownMenuSeparator, xa as DropdownMenuShortcut, va as DropdownMenuSub, ba as DropdownMenuSubContent, ya as DropdownMenuSubTrigger, fa as DropdownMenuTrigger, Ca as EmptyState, ka as EntitySearchPicker, ys as FolderSidebar, An as GRID_CONTROL_COLUMN_WIDTH, ws as GridActionMenuItems, Ss as GridActions, Na as GridFilterChips, Za as GridFilterEditor, $a as GridFooter, ro as GridOptions, Oc as GridPage, yr as IconButton, br as IconToggle, ui as ImageAdjustDialog, Tr as InitialsAvatar, io as InlineText, Er as Input, Dr as IntegerInput, Or as Label, lo as LanguageSelect, Ds as LiveCanvas, ks as LiveCanvasGroup, Os as LiveCanvasTarget, It as MESSAGE_ATTACHMENT_MAX_MB, Ft as MESSAGE_ATTACHMENT_MIMES, Lt as MESSAGE_MAX_ATTACHMENTS, fo as MeetingControl, As as MeetingHeader, kc as MeetingLobby, Ac as MeetingRoom, jc as MeetingRoomPanel, js as MeetingToolbar, Jo as MessageList, Mc as PageEditor, Ms as PageViewer, Ps as ParticipantList, Is as ParticipantTile, kr as PasswordInput, Rs as PollBallot, Ls as PollComposer, zs as PollResults, wa as Popover, Ea as PopoverAnchor, Da as PopoverContent, Ta as PopoverTrigger, Ar as RadioGroup, jr as RadioGroupItem, po as ReactionPicker, ho as RecordingIndicator, go as SearchField, _o as SegmentedChoice, vo as SegmentedChoiceItem, xo as SegmentedTab, yo as SegmentedTabs, So as SegmentedTabsContent, bo as SegmentedTabsList, Fa as Select, Va as SelectContent, Ia as SelectGroup, Ua as SelectItem, Ha as SelectLabel, Ba as SelectScrollDownButton, za as SelectScrollUpButton, Wa as SelectSeparator, Ra as SelectTrigger, La as SelectValue, Mr as Separator, Bs as Sheet, Hs as SheetClose, qs as SheetContent, Ys as SheetDescription, Ks as SheetHandle, Ws as SheetOverlay, Us as SheetPortal, Js as SheetTitle, Vs as SheetTrigger, us as Sidebar, ps as SidebarContent, ms as SidebarFooter, hs as SidebarGroup, fs as SidebarHeader, Tc as SidebarLayout, gs as SidebarMenu, vs as SidebarMenuButton, _s as SidebarMenuItem, Co as StatCard, wo as SupportReference, Nr as Switch, Xs as Table, Qs as TableBody, rc as TableCaption, nc as TableCell, $s as TableFooter, tc as TableHead, Zs as TableHeader, ec as TableRow, To as Tabs, Oo as TabsContent, Eo as TabsList, Do as TabsTrigger, Pr as Textarea, oc as ThreadList, sr as Tooltip, lr as TooltipContent, or as TooltipProvider, cr as TooltipTrigger, yc as VideoPlayer, wc as VideoStage, kt as allIds, wr as avatarTint, nr as badgeVariants, ur as buttonVariants, Ct as canMove, J as cn, St as depthOf, mt as descendantIds, At as diffTree, dt as downloadText, Y as findNode, Pt as fitTileGrid, ht as flattenVisible, Rt as formatFileSize, Xt as formatShortcut, bn as gridPreferencesKey, Ht as gridSelectionState, Mt as inFolderScope, Et as indentNode, ut as inlineArrows, vt as insertNode, Ut as isGridActionDisabled, Gt as isMacPlatform, lt as isRtl, X as locate, qt as matchShortcut, wt as moveNode, Tt as moveSibling, Pa as nativeSelectClass, zo as newId, Dt as outdentNode, pt as pathTo, yt as removeNode, bt as renameNode, Bn as resizableWidthKey, jt as subtreeCounts, xt as subtreeHeight, ct as useDirection, Gn as useFitScale, Ln as useGrid, kn as useGridPreferences, qn as usePageDraft, Un as useResizableWidth, gc as videoResumeKey, Wt as visibleGridActions };

//# sourceMappingURL=index.js.map