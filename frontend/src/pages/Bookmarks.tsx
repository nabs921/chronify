import {
  Container,
  SimpleGrid,
  Title,
  Text,
  Center,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getBookmarks,
  removeBookmark,
  updateTimeline,
  deleteTimeline,
} from "../api/api";
import { getAuthData } from "../utils/storage";
import type { Timeline } from "../types/types";
import TimelineCard from "../components/TimelineCard";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import TimelineModal from "../components/TimelineModal";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = getAuthData();
  const navigate = useNavigate();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      is_public: false,
    },
  });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getBookmarks(token);
      setBookmarks(data);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch bookmarks",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      await removeBookmark(token, id);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to remove bookmark",
        color: "red",
      });
      fetchBookmarks();
    }
  };

  const handleUpdateTimeline = async (values: any) => {
    if (!editingTimeline || !token) return;
    try {
      await updateTimeline(token, editingTimeline.id, values);
      await fetchBookmarks();
      close();
      form.reset();
      setEditingTimeline(null);
      notifications.show({
        title: "Success",
        message: "Timeline updated successfully",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const handleDeleteTimeline = async (id: string) => {
    if (!token) return;
    try {
      await deleteTimeline(token, id);
      // Remove from local state immediately
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      notifications.show({
        title: "Timeline deleted",
        message: "Timeline deleted successfully",
        color: "blue",
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const openEditModal = (timeline: Timeline) => {
    setEditingTimeline(timeline);
    form.setValues({
      title: timeline.title,
      description: timeline.description || "",
      is_public: timeline.is_public || false,
    });
    open();
  };

  const openDeleteModal = (id: string) => {
    modals.openConfirmModal({
      title: "Delete Timeline",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this timeline? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => handleDeleteTimeline(id),
    });
  };

  if (isLoading) return <Loading />;

  return (
    <Container size="xl" py="xl">
      <TimelineModal
        opened={opened}
        onClose={close}
        form={form}
        handleSubmit={handleUpdateTimeline}
        isEditing={!!editingTimeline}
      />
      <Title order={2} mb="xl">
        Bookmarks
      </Title>

      {(bookmarks || []).length === 0 ? (
        <Center mih={400}>
          <Stack align="center" gap="md">
            <ThemeIcon size={80} radius="xl" variant="light" color="yellow">
              <Bookmark size={40} />
            </ThemeIcon>
            <Title order={3}>No bookmarks yet</Title>
            <Text c="dimmed" ta="center">
              Save timelines for quick access. Your bookmarks will appear here.
            </Text>
          </Stack>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {bookmarks.map((timeline) => (
            <TimelineCard
              key={timeline.id}
              timeline={timeline}
              onClick={() => navigate(`/timelines/${timeline.id}`)}
              onEdit={() => openEditModal(timeline)}
              onDelete={() => openDeleteModal(timeline.id)}
              isBookmarked={true}
              onBookmark={() => handleRemoveBookmark(timeline.id)}
              showActions={timeline.user_id === user?.id}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default Bookmarks;
