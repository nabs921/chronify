import React from "react";
import {
  Card,
  Group,
  Text,
  Tooltip,
  ActionIcon,
  Stack,
  TextInput,
  SimpleGrid,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { Trash2 } from "lucide-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TimelineEvent } from "../../types/types";

interface EventFormItemProps {
  index: number;
  form: UseFormReturnType<{ events: TimelineEvent[] }>;
  onDelete: (index: number) => void;
}

const EventFormItem: React.FC<EventFormItemProps> = ({
  index,
  form,
  onDelete,
}) => {
  const item = form.values.events[index];

  return (
    <Card withBorder shadow="sm" radius="md" padding="lg">
      <Group justify="space-between" mb="md" align="flex-start">
        <Group gap="md">
          <ThemeIcon variant="light" size={36} radius="xl" color="blue">
            <Text fw={700} size="sm">
              {index + 1}
            </Text>
          </ThemeIcon>

          <Text fw={600} size="md" c="dark.8">
            {item.title || "Untitled Event"}
          </Text>
        </Group>
        <Tooltip label="Delete Event" withArrow position="left">
          <ActionIcon
            color="red"
            variant="subtle"
            onClick={() => onDelete(index)}
            size="lg"
            radius="md"
          >
            <Trash2 size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Stack gap="md">
        <TextInput
          label="Date / Timeframe"
          description="This appears on the timeline axis (e.g. 2024, Jan 1st)"
          placeholder="e.g. 2024"
          required
          {...form.getInputProps(`events.${index}.title`)}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Headline"
            placeholder="Main title of the event"
            required
            {...form.getInputProps(`events.${index}.card_title`)}
          />
          <TextInput
            label="Sub-headline"
            placeholder="Optional context"
            {...form.getInputProps(`events.${index}.card_subtitle`)}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Image Name"
            placeholder="Name or caption for the image"
            {...form.getInputProps(`events.${index}.media.name`)}
          />
          <TextInput
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            {...form.getInputProps(`events.${index}.media.source.url`)}
          />
        </SimpleGrid>

        <Textarea
          label="Detailed Description"
          placeholder="Enter the full story..."
          minRows={4}
          autosize
          {...form.getInputProps(`events.${index}.card_detailed_text`)}
        />
      </Stack>
    </Card>
  );
};

export default EventFormItem;
