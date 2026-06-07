import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import type { Task } from '@/pipeline';

const REPORT_DIR = path.join(os.homedir(), '.cache', 'reachr');
const VERSION    = 1;

const RunReportSchema = z.object({
    version: z.literal(1),
    domain:  z.string(),
    ranAt:   z.string(),
    stages:  z.array(z.object({
        id:      z.string(),
        label:   z.string(),
        done:    z.number(),
        error:   z.number(),
        skipped: z.number(),
        failures: z.array(z.object({
            label:  z.string(),
            status: z.enum(['error', 'skipped']),
            reason: z.string().optional(),
        })),
    })),
});

export type RunReport = z.infer<typeof RunReportSchema>;

function reportFile(domain: string): string {
    return path.join(REPORT_DIR, `${domain}.report.json`);
}

// mirrors RunView's `tally` — groups (e.g. profiles-by-domain) are flattened
// to their leaf tasks so counts reflect actual records, not group wrappers
function leavesOf(task: Task): Task[] {
    return task.subtasks.flatMap(t => (t.subtasks.length > 0 ? t.subtasks : [t]));
}

export function buildRunReport(domain: string, tasks: Task[]): RunReport {
    const stages = tasks.map(stage => {
        const leaves = leavesOf(stage);
        const failures = leaves
            .filter(t => t.status === 'error' || t.status === 'skipped')
            .map(t => ({
                label:  t.label,
                status: t.status as 'error' | 'skipped',
                reason: t.error?.message ?? t.meta,
            }));

        return {
            id:      stage.id,
            label:   stage.label,
            done:    leaves.filter(t => t.status === 'done').length,
            error:   leaves.filter(t => t.status === 'error').length,
            skipped: leaves.filter(t => t.status === 'skipped').length,
            failures,
        };
    });

    return { version: VERSION, domain, ranAt: new Date().toISOString(), stages };
}

export async function writeRunReport(domain: string, report: RunReport): Promise<void> {
    await fs.mkdir(REPORT_DIR, { recursive: true });
    await fs.writeFile(reportFile(domain), JSON.stringify(report, null, 2), 'utf8');
}

export async function readRunReport(domain: string): Promise<RunReport | null> {
    try {
        const raw    = await fs.readFile(reportFile(domain), 'utf8');
        const parsed = RunReportSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : null;
    } catch {
        return null;
    }
}
