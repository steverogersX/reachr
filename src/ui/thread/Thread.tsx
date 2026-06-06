import React from "react";
import { Box } from "ink";
import { ThreadContext } from "./context";
import { ThreadItem } from "./ThreadItem";
import { ThreadStage } from "./ThreadStage";

interface ThreadProps {
  children: React.ReactNode;
}

function ThreadRoot({ children }: ThreadProps) {
  return (
    <ThreadContext.Provider value={{ depth: 0, parentLines: [] }}>
      <Box flexDirection="column">{children}</Box>
    </ThreadContext.Provider>
  );
}

export const Thread = Object.assign(ThreadRoot, {
  Item: ThreadItem,
  Stage: ThreadStage,
});
