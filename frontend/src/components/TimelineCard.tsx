import { Card, Group, Text, Menu, ActionIcon, Stack } from "@mantine/core";
import { MoreHorizontal, Pen, Trash, Bookmark } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import type { Timeline } from "../types/types";

interface TimelineCardProps {
  timeline: Timeline;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isBookmarked: boolean;
  onBookmark: () => void;
  showActions?: boolean;
}

const TimelineCard = ({
  timeline,
  onClick,
  onEdit,
  onDelete,
  isBookmarked,
  onBookmark,
  showActions = true,
}: TimelineCardProps) => {
  return (
    <Card onClick={onClick} style={{ cursor: "pointer", position: "relative" }}>
      <Card.Section inheritPadding py="md">
        <Group justify="space-between" align="start" wrap="nowrap">
          <Stack gap={4} w="85%">
            <Text fw={700} size="lg" truncate lineClamp={1}>
              {timeline.title}
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {formatDate(timeline.created_at)}
            </Text>
          </Stack>

          {/* Actions Overlay / Absolute positioning for corner actions could be alternative, 
                        but Flex Group relative is safer for layout flow */}
          <Menu shadow="md" position="bottom-end" width={160}>
            {showActions && (
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  onClick={(e) => e.stopPropagation()}
                  size="sm"
                >
                  <MoreHorizontal size={18} />
                </ActionIcon>
              </Menu.Target>
            )}
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<Pen size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={<Trash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Card.Section>

      <Text size="sm" c="dimmed" lineClamp={3} h={60} mt="sm">
        {timeline.description || "No description provided."}
      </Text>

      <Group mt="lg" justify="space-between" align="center">
        <ActionIcon
          variant={isBookmarked ? "filled" : "light"}
          color={isBookmarked ? "blue" : "gray"}
          onClick={(e) => {
            e.stopPropagation();
            onBookmark();
          }}
          radius="md"
          size="md"
          aria-label="Bookmark"
        >
          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
        </ActionIcon>
      </Group>
    </Card>
  );
};

export default TimelineCard;
