"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { ToolbarOverlay } from "./toolbar-ui";

declare global {
	interface Window {
		ThemeToolbar?: {
			init: (opts?: { defaultOpen?: boolean; allowedOrigins?: string[] }) => void;
		};
	}
}

function mountToolbar(opts?: { defaultOpen?: boolean; allowedOrigins?: string[] }) {
	const containerId = "__theme_toolbar_overlay__";
	let host = document.getElementById(containerId);
	if (!host) {
		host = document.createElement("div");
		host.id = containerId;
		document.body.appendChild(host);
	}
	const root = createRoot(host);
	root.render(<ToolbarOverlay defaultOpen={opts?.defaultOpen} allowedOrigins={opts?.allowedOrigins} />);
}

if (typeof window !== "undefined") {
	window.ThemeToolbar = {
		init: (opts) => mountToolbar(opts),
	};
}


