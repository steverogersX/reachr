import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { Header } from '@/ui/components/Header.tsx';
import { StageBox } from '@/ui/components/StageBox.tsx';
import type { StageItem } from '@/ui/components/StageBox.tsx';
import type { StageStatus, Field, LinkedInProfile, Contact } from '@/services/types.ts';
import { services } from '@/services/index.ts';

interface Props {
  domain: string;
}

interface PipelineState {
  fieldsStatus:   StageStatus;
  profilesStatus: StageStatus;
  emailsStatus:   StageStatus;
  fields:         Field[];
  profiles:       LinkedInProfile[];
  contacts:       Contact[];
  fieldsTiming?:  number;
  profilesTiming?: number;
  emailsTiming?:  number;
  error?:         string;
}

const INITIAL_STATE: PipelineState = {
  fieldsStatus:   'running',
  profilesStatus: 'idle',
  emailsStatus:   'idle',
  fields:         [],
  profiles:       [],
  contacts:       [],
};

export function RunPipeline({ domain }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);

  useEffect(() => {
    runPipeline().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setState((s) => ({ ...s, fieldsStatus: 'error', error: message }));
      setTimeout(exit, 1500);
    });
  }, []);

  async function runPipeline() {
    // ── Stage 1: Fields ────────────────────────────────────────────────────
    const fieldsStart = Date.now();
    const fields: Field[] = [];

    for await (const field of services.getFields(domain)) {
      fields.push(field);
      setState((s) => ({ ...s, fields: [...fields] }));
    }

    setState((s) => ({
      ...s,
      fieldsStatus:   'done',
      fieldsTiming:   Date.now() - fieldsStart,
      profilesStatus: 'running',
    }));

    // ── Stage 2: LinkedIn Profiles ─────────────────────────────────────────
    const profilesStart = Date.now();
    const profiles: LinkedInProfile[] = [];

    for await (const profile of services.getProfiles(domain, fields)) {
      profiles.push(profile);
      setState((s) => ({ ...s, profiles: [...profiles] }));
    }

    setState((s) => ({
      ...s,
      profilesStatus: 'done',
      profilesTiming: Date.now() - profilesStart,
      emailsStatus:   'running',
    }));

    // ── Stage 3: Emails ────────────────────────────────────────────────────
    const emailsStart = Date.now();
    const contacts: Contact[] = [];

    for await (const contact of services.getEmails(domain, profiles)) {
      contacts.push(contact);
      setState((s) => ({ ...s, contacts: [...contacts] }));
    }

    setState((s) => ({
      ...s,
      emailsStatus:  'done',
      emailsTiming:  Date.now() - emailsStart,
      contacts:      [...contacts],
    }));
  }

  const {
    fieldsStatus, profilesStatus, emailsStatus,
    fields, profiles, contacts,
    fieldsTiming, profilesTiming, emailsTiming,
    error,
  } = state;

  const fieldsItems:   StageItem[] = fields.map((f) => ({ primary: f.name }));
  const profilesItems: StageItem[] = profiles.map((p) => ({ primary: p.name, secondary: p.title }));
  const emailsItems:   StageItem[] = contacts.map((c) => ({ primary: c.email, secondary: c.name }));

  const allDone = emailsStatus === 'done';
  const hasError = fieldsStatus === 'error' || profilesStatus === 'error' || emailsStatus === 'error';

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      <Header domain={domain} />

      <StageBox
        index={1}
        title="Discovering Fields"
        status={fieldsStatus}
        items={fieldsItems}
        timing={fieldsTiming}
        error={error}
      />

      <StageBox
        index={2}
        title="LinkedIn Profiles"
        status={profilesStatus}
        items={profilesItems}
        timing={profilesTiming}
      />

      <StageBox
        index={3}
        title="Extracting Emails"
        status={emailsStatus}
        items={emailsItems}
        timing={emailsTiming}
      />

      {allDone && (
        <Box flexDirection="column" marginTop={1} gap={1}>
          <Box gap={1}>
            <Text color="greenBright">✓</Text>
            <Text color="white" bold>Pipeline complete</Text>
            <Text color="gray" dimColor>· {contacts.length} contacts ready</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Text color="gray" dimColor>next  <Text color="white">reachr report</Text>  to review before sending</Text>
            <Text color="gray" dimColor>next  <Text color="white">reachr send</Text>    to choose a template and send</Text>
          </Box>
        </Box>
      )}

      {hasError && !allDone && (
        <Box marginTop={1} gap={1}>
          <Text color="redBright">✗</Text>
          <Text color="redBright">Pipeline failed.</Text>
          <Text color="gray" dimColor>Check the error above.</Text>
        </Box>
      )}

      <Box marginTop={1} />
    </Box>
  );
}
