import { readRunReport } from '@/utils/runReport';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
}

function statusMark(status: 'error' | 'skipped'): string {
    return status === 'error' ? '✗' : '○';
}

export async function reportCommand(domain: string): Promise<void> {
    const report = await readRunReport(domain);

    if (!report) {
        process.stderr.write(
            `\n  ● No run report found for ${domain}.\n` +
            `    Run reachr run ${domain} first.\n\n`,
        );
        process.exit(1);
    }

    const lines: string[] = [];
    lines.push(`Latest run for ${report.domain} — ${formatDate(report.ranAt)}`, '');

    for (const stage of report.stages) {
        const parts = [`${stage.done} done`];
        if (stage.error)   parts.push(`${stage.error} error`);
        if (stage.skipped) parts.push(`${stage.skipped} skipped`);

        lines.push(`  ${stage.label.padEnd(24)} ${parts.join(' · ')}`);
        for (const failure of stage.failures) {
            const reason = failure.reason ? ` — ${failure.reason}` : '';
            lines.push(`    ${statusMark(failure.status)} ${failure.label}${reason}`);
        }
    }

    process.stdout.write(`\n${lines.join('\n')}\n\n`);
}
