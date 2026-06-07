import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { ThreadContext, useThread } from "./context";
import { glyph, color } from "../theme";
import type { Status, ThreadItemProps } from "./types";

function StatusDot({ status }: { status: Status }) {
    if (status === "loading" || status === "retrying") return <Spinner />;
    const tint = status === "done"  ? color.success
               : status === "error" ? color.error
               :                      color.muted;
    return <Text color={tint}>{glyph.dot}</Text>;
}

function buildPrefix(parentLines: boolean[], isLast: boolean): string {
    const trunk = parentLines
        .map(active => (active ? `${glyph.pipe}  ` : glyph.indent))
        .join("");
    return trunk + (isLast ? `${glyph.last} ` : `${glyph.branch} `);
}

export function ThreadItem({
    label,
    meta,
    icon,
    right,
    status = "idle",
    isLast = false,
    children,
}: ThreadItemProps) {
    const { depth, parentLines } = useThread();
    const prefix = buildPrefix(parentLines, isLast);
    const childCtx = { depth: depth + 1, parentLines: [...parentLines, !isLast] };

    const labelColor = status === "done"    ? color.success
                     : status === "error"   ? color.error
                     : status === "skipped" ? color.muted
                     : color.text;

    return (
        <>
            <Box>
                {/* faint tree connectors so the data reads first */}
                <Text color={color.muted} dimColor>{prefix}</Text>

                <Box width={2}>
                    <StatusDot status={status} />
                </Box>

                {icon !== undefined && <Box marginRight={1}>{icon}</Box>}

                <Text color={labelColor} wrap="truncate-end">{label}</Text>

                {meta !== undefined && (
                    <Text color={color.muted} wrap="truncate-end">{"  "}{meta}</Text>
                )}

                {right !== undefined && (
                    <Box marginLeft={2}>
                        <Text color={color.muted} wrap="truncate-end">{right}</Text>
                    </Box>
                )}
            </Box>

            {children !== undefined && (
                <ThreadContext.Provider value={childCtx}>
                    {children}
                </ThreadContext.Provider>
            )}
        </>
    );
}
