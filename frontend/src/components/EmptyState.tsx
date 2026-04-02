import { Center, Stack, Text, Button } from "@mantine/core";
import { Calendar } from "lucide-react";

interface EmptyStateProps {
  searchQuery: string;
  onCreate: () => void;
}

const EmptyState = ({ searchQuery, onCreate }: EmptyStateProps) => {
  return (
    <Center h={400}>
      <Stack align="center" gap="md">
        <Calendar size={64} color="gray" strokeWidth={1} />
        <Stack gap={0} align="center">
          <Text size="xl" fw={500}>
            {searchQuery ? "No matches found" : "No timelines yet"}
          </Text>
          <Text c="dimmed">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first timeline to get started!"}
          </Text>
        </Stack>
        {!searchQuery && (
          <Button onClick={onCreate} variant="light">
            Create Timeline
          </Button>
        )}
      </Stack>
    </Center>
  );
};

export default EmptyState;
