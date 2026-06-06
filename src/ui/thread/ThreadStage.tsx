import React from "react";
import { Box, Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { icons } from "../icons";
import type { Status, ThreadStageProps } from "./types";

const LABEL_COLOR: Record<Status, string> = {
    idle:    "gray",
    loading: "cyan",
    done:    "green",
    error:   "red",
};

const DOT_COLOR: Record<Status, string> = {
    idle:    "gray",
    loading: "cyan",
    done:    "green",
    error:   "red",
};

export function ThreadStage({ label, icon, status = "idle" }: ThreadStageProps) {
    return (
        <Box marginBottom={1}>
            <Box marginRight={1}>
                {status === "loading"
                    ? <Spinner />
                    : <Text color={DOT_COLOR[status]}>{icons.stage}</Text>
                }
            </Box>

            {icon !== undefined && <Box marginRight={1}>{icon}</Box>}

            <Text bold color={LABEL_COLOR[status]}>
                {label}
            </Text>
        </Box>
    );
}
