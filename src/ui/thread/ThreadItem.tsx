import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { ThreadContext, useThread } from "./context";
import { icons } from "../icons";
import type { Status, ThreadItemProps } from "./types";

const LABEL_COLOR: Record<Status, string> = {
    idle:    "white",
    loading: "white",
    done:    "green",
    error:   "red",
};

const DOT_COLOR: Record<Status, string> = {
    idle:    "gray",
    loading: "yellow",
    done:    "green",
    error:   "red",
};

function StatusDot({ status }: { status: Status }) {
    if (status === "loading") return <Spinner />;
    return <Text color={DOT_COLOR[status]}>{icons.dot}</Text>;
}

function buildPrefix(parentLines: boolean[], isLast: boolean): string {
    const trunk = parentLines.map(active => (active ? `${icons.pipe}  ` : icons.indent)).join("");
    return trunk + (isLast ? `${icons.last} ` : `${icons.branch} `);
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

    return (
        <>
            <Box>
                <Text dimColor>{prefix}</Text>

                <Box marginRight={1}>
                    <StatusDot status={status} />
                </Box>

                {icon !== undefined && <Box marginRight={1}>{icon}</Box>}

                <Text bold={depth === 0} color={LABEL_COLOR[status]}>
                    {label}
                </Text>

                {meta !== undefined && (
                    <Text dimColor>
                        {" "}{icons.sep}{" "}{meta}
                    </Text>
                )}

                {right !== undefined && <Box marginLeft={2}>{right}</Box>}
            </Box>

            {children !== undefined && (
                <ThreadContext.Provider value={childCtx}>
                    {children}
                </ThreadContext.Provider>
            )}
        </>
    );
}
