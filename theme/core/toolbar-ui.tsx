"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type ToolbarOverlayProps = {
	defaultOpen?: boolean;
	allowedOrigins?: string[];
};

type ThemeState = {
	siteSlug?: string;
	pageType?: string;
	contextSlug?: string;
	isPreviewMode?: boolean;
	sidebarOpen?: boolean;
};

export function ToolbarOverlay({ defaultOpen = false, allowedOrigins }: ToolbarOverlayProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [isPublishing, setIsPublishing] = useState(false);
	const [publishStatus, setPublishStatus] = useState<string | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(defaultOpen);
	const [themeState, setThemeState] = useState<ThemeState>({});

	const originOk = useMemo(() => {
		if (!allowedOrigins || allowedOrigins.length === 0) return () => true;
		const set = new Set(allowedOrigins);
		return (origin: string) => set.has(origin);
	}, [allowedOrigins]);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			if (!originOk(event.origin)) return;
			const { type, data } = event.data || {};
			switch (type) {
				case "THEME_READY":
				case "THEME_UPDATED":
					setThemeState({
						siteSlug: data?.siteSlug,
						pageType: data?.pageType,
						contextSlug: data?.contextSlug,
						isPreviewMode: data?.isPreviewMode,
						sidebarOpen: data?.sidebarOpen,
					});
					break;
				case "EDIT_STATUS_CHANGED":
					setIsEditing(!!data?.isEditingActive);
					break;
				case "PUBLISH_START":
					setIsPublishing(true);
					setPublishStatus("Publishing...");
					break;
				case "PUBLISH_SUCCESS":
					setIsPublishing(false);
					setPublishStatus("Published ✅");
					setTimeout(() => setPublishStatus(null), 2000);
					break;
				case "PUBLISH_ERROR":
					setIsPublishing(false);
					setPublishStatus(`Error: ${data?.error || "Unknown"}`);
					break;
			}
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, [originOk]);

	const post = (type: string, data?: any) => {
		window.postMessage({ type, data }, "*");
	};

	const handleToggleEditing = () => {
		const next = !isEditing;
		setIsEditing(next);
		post(next ? "ACTIVATE_EDITING" : "DEACTIVATE_EDITING", {});
	};

	const handleToggleSidebar = () => {
		const next = !sidebarOpen;
		setSidebarOpen(next);
		post("TOGGLE_SIDEBAR", { open: next });
	};

	const handlePublish = () => {
		if (isPublishing) return;
		post("PUBLISH_CHANGES", {});
	};

	return (
		<div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2147483000 }}>
			{/* Top bar */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					height: 40,
					background: "#111827",
					color: "#fff",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 12px",
					borderBottom: "1px solid #1f2937",
					pointerEvents: "auto",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span style={{ fontSize: 11, opacity: 0.8 }}>PREVIEW</span>
					<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
						<input type="checkbox" checked={isEditing} onChange={handleToggleEditing} />
						<span>{isEditing ? "Editing ON" : "Editing OFF"}</span>
					</label>
					{publishStatus && <span style={{ fontSize: 12, color: "#93c5fd" }}>{publishStatus}</span>}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<button
						onClick={handlePublish}
						disabled={isPublishing}
						style={{ padding: "3px 8px", background: "#16a34a", color: "#fff", borderRadius: 4, opacity: isPublishing ? 0.7 : 1 }}
					>
						{isPublishing ? "Publishing..." : "Publish"}
					</button>
					<button onClick={handleToggleSidebar} style={{ padding: 6, background: "transparent", color: "#fff", borderRadius: 4 }}>☰</button>
				</div>
			</div>

			{/* Sidebar */}
			{sidebarOpen && (
				<div
					style={{
						position: "fixed",
						top: 40,
						bottom: 0,
						left: 0,
						width: 260,
						background: "#fff",
						borderRight: "1px solid #e5e7eb",
						pointerEvents: "auto",
						padding: 12,
					}}
				>
					<div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Site</div>
					<div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{themeState.siteSlug || "(unknown)"}</div>
					<div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Page</div>
					<div style={{ fontSize: 13, marginBottom: 8 }}>{themeState.pageType || "home"}</div>
					<div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>Context</div>
					<div style={{ fontSize: 13 }}>{themeState.contextSlug || "-"}</div>
				</div>
			)}
		</div>
	);
}

export default ToolbarOverlay;


