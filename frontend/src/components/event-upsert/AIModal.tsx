import React, { useState } from "react";
import { Modal, Group, Text, Stack, Textarea, Button } from "@mantine/core";
import { Sparkles, Wand2 } from "lucide-react";

interface AIModalProps {
  opened: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  onUpdate: (prompt: string) => void;
  loading: boolean;
  initialMode?: "generate" | "update";
}

const AIModal: React.FC<AIModalProps> = ({
  opened,
  onClose,
  onGenerate,
  onUpdate,
  loading,
  initialMode = "generate",
}) => {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialMode === "generate") {
      onGenerate(prompt);
    } else {
      onUpdate(prompt);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Sparkles size={20} className="mantine-rotate-180" color="#228be6" />
          <Text fw={600} size="lg">
            {initialMode === "generate" ? "Generate with AI" : "Edit with AI"}
          </Text>
        </Group>
      }
      centered
      size="lg"
      radius="md"
      padding="xl"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {initialMode === "generate"
              ? "Describe the historical period or specific events you want to generate. The AI will create a structured timeline for you."
              : "Describe how you want to modify the existing events. The AI will rewrite them based on your instructions."}
          </Text>
          <Textarea
            required
            placeholder={
              initialMode === "generate"
                ? "e.g. Create a timeline of the Space Race from 1957 to 1969, focusing on key milestones..."
                : "e.g. Make the descriptions more concise and focus on political impacts..."
            }
            minRows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            data-autofocus
            radius="md"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} size="md">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftSection={<Wand2 size={18} />}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              size="md"
            >
              {initialMode === "generate" ? "Generate Events" : "Update Events"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AIModal;
