import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { glyph, color } from "../theme";
import type { ThreadStageProps } from "./types";

export function ThreadStage({ label, icon, status = "idle", count }: ThreadStageProps) {
    // the stage marker stays neutral — status is conveyed by the spinner while
    // running and by the child items / count once settled, never by coloring the
    // header itself (green is reserved for actual success markers)
    const errored = status === "error";

    return (
        <Box>
            <Box width={2}>
                {status === "loading"
                    ? <Spinner />
                    : <Text color={errored ? color.error : color.muted}>{glyph.stage}</Text>}
            </Box>

            {icon !== undefined && <Box marginRight={1}>{icon}</Box>}

            <Text bold color={errored ? color.error : color.text}>{label}</Text>

            {count !== undefined && <Box marginLeft={2}>{count}</Box>}
        </Box>
    );
}
