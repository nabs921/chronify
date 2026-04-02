import React from "react";
import {
  AppShell,
  Container,
  Group,
  Stack,
  Title,
  Text,
  Button,
} from "@mantine/core";
import { Home, Sparkles } from "lucide-react";

interface EventUpsertHeaderProps {
  isEditMode: boolean;
  eventCount: number;
  onHome: () => void;
  onAiOpen: () => void;
}

const EventUpsertHeader: React.FC<EventUpsertHeaderProps> = ({
  isEditMode,
  eventCount,
  onHome,
  onAiOpen,
}) => {
  return (
    <AppShell.Header>
      <Container size="lg" h="100%">
        <Group justify="space-between" h="100%" align="center">
          <Stack gap={0}>
            <Title order={4}>
              {isEditMode ? "Edit Timeline" : "Create Timeline"}
            </Title>
            <Text c="dimmed" size="xs">
              {eventCount} Events
            </Text>
          </Stack>

          <Group>
            <Button
              leftSection={<Home size={16} />}
              variant="light"
              color="gray"
              onClick={onHome}
              size="sm"
            >
              <Text span visibleFrom="xs">
                Home
              </Text>
            </Button>

            <Button
              leftSection={<Sparkles size={16} />}
              variant="light"
              onClick={onAiOpen}
              size="sm"
            >
              <Text span visibleFrom="xs">
                {isEditMode ? "Edit with AI" : "Create with AI"}
              </Text>
            </Button>
          </Group>
        </Group>
      </Container>
    </AppShell.Header>
  );
};

export default EventUpsertHeader;
