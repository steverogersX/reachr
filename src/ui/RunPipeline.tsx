import React, { useState, useEffect } from "react";
import { Box, Text, useApp } from "ink";
import { Header } from "@/ui/components/Header";
import { StageBox } from "@/ui/components/StageBox";
import type { StageItem } from "@/ui/components/StageBox";
import type {
  StageStatus,
  DiscoveredDomain,
  LinkedInProfile,
  Contact,
} from "@/services/types";
import { services } from "@/services/index";

interface Props {
  domain: string;
}

interface PipelineState {
  domainsStatus: StageStatus;
  profilesStatus: StageStatus;
  emailsStatus: StageStatus;
  domains: DiscoveredDomain[];
  profiles: LinkedInProfile[];
  contacts: Contact[];
  domainsTiming?: number;
  profilesTiming?: number;
  emailsTiming?: number;
  error?: string;
}

const INITIAL_STATE: PipelineState = {
  domainsStatus: "running",
  profilesStatus: "idle",
  emailsStatus: "idle",
  domains: [],
  profiles: [],
  contacts: [],
};

export function RunPipeline({ domain }: Props) {
  const { exit } = useApp();
  const [state, setState] = useState<PipelineState>(INITIAL_STATE);

  useEffect(() => {
    runPipeline().catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setState((s) => ({ ...s, domainsStatus: "error", error: message }));
      setTimeout(exit, 1500);
    });
  }, []);

  async function runPipeline() {
    // ── Stage 1: Domain Discovery ──────────────────────────────────────────────
    const domainsStart = Date.now();
    const domains: DiscoveredDomain[] = [];

    for await (const d of services.getDomains(domain)) {
      domains.push(d);
      setState((s) => ({ ...s, domains: [...domains] }));
    }

    setState((s) => ({
      ...s,
      domainsStatus: "done",
      domainsTiming: Date.now() - domainsStart,
      profilesStatus: "running",
    }));

    // ── Stage 2: LinkedIn Profiles ─────────────────────────────────────────────
    const profilesStart = Date.now();
    const profiles: LinkedInProfile[] = [];

    for await (const profile of services.getProfiles(domain, domains)) {
      profiles.push(profile);
      setState((s) => ({ ...s, profiles: [...profiles] }));
    }

    setState((s) => ({
      ...s,
      profilesStatus: "done",
      profilesTiming: Date.now() - profilesStart,
      emailsStatus: "running",
    }));

    // ── Stage 3: Emails ────────────────────────────────────────────────────────
    const emailsStart = Date.now();
    const contacts: Contact[] = [];

    for await (const contact of services.getEmails(domain, profiles)) {
      contacts.push(contact);
      setState((s) => ({ ...s, contacts: [...contacts] }));
    }

    setState((s) => ({
      ...s,
      emailsStatus: "done",
      emailsTiming: Date.now() - emailsStart,
      contacts: [...contacts],
    }));
  }

  const {
    domainsStatus,
    profilesStatus,
    emailsStatus,
    domains,
    profiles,
    contacts,
    domainsTiming,
    profilesTiming,
    emailsTiming,
    error,
  } = state;

  const domainsItems: StageItem[] = domains.map((d) => ({
    primary: d.name,
    icon: "🌐",
  }));
  const profilesItems: StageItem[] = profiles.map((p) => ({
    primary: p.name,
    secondary: p.title,
  }));
  const emailsItems: StageItem[] = contacts.map((c) => ({
    primary: c.email,
    secondary: c.name,
  }));

  const allDone = emailsStatus === "done";
  const hasError =
    domainsStatus === "error" ||
    profilesStatus === "error" ||
    emailsStatus === "error";

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      <Header domain={domain} />

      <StageBox
        index={1}
        title="Discovering Domains"
        status={domainsStatus}
        items={domainsItems}
        timing={domainsTiming}
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
            <Text color="white" bold>
              Pipeline complete
            </Text>
            <Text color="gray" dimColor>
              · {contacts.length} contacts ready
            </Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Text color="gray" dimColor>
              next <Text color="white">reachr report</Text> to review before
              sending
            </Text>
            <Text color="gray" dimColor>
              next <Text color="white">reachr send</Text> to choose a template
              and send
            </Text>
          </Box>
        </Box>
      )}

      {hasError && !allDone && (
        <Box marginTop={1} gap={1}>
          <Text color="redBright">✗</Text>
          <Text color="redBright">Pipeline failed.</Text>
          <Text color="gray" dimColor>
            Check the error above.
          </Text>
        </Box>
      )}

      <Box marginTop={1} />
    </Box>
  );
}
