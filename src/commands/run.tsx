import React from 'react';
import { render } from 'ink';
import { DomainSchema } from '@/services/domains/types';
import { TaskStore, PipelineState } from '@/pipeline';
import { RunView } from '@/ui/RunView';
import type { WorkflowOptions } from '@/services/runWorkflow';

export async function runCommand(rawDomain: string, opts: Partial<WorkflowOptions> = {}): Promise<void> {
    const result = DomainSchema.safeParse(rawDomain);

    if (!result.success) {
        const issue = result.error.issues[0];
        process.stderr.write(
            `\n  ● Invalid domain: "${rawDomain}"\n` +
            `    ${issue?.message ?? 'Must be a valid domain (e.g. stripe.com)'}\n\n`,
        );
        process.exit(1);
    }

    const store = new TaskStore();
    const state = new PipelineState();
    const { waitUntilExit } = render(<RunView domain={result.data} store={store} state={state} opts={opts} />);
    await waitUntilExit();
}
