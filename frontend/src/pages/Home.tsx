import {
  Button,
  Container,
  Group,
  SimpleGrid,
  Title,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import type { Timeline } from "../types/types";
import { useEffect, useState } from "react";
import { getAuthData } from "../utils/storage";
import {
  createTimeline,
  deleteTimeline,
  getTimelines,
  updateTimeline,
  searchTimelines,
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../api/api";
import { PlusCircle } from "lucide-react";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import TimelineCard from "../components/TimelineCard";
import TimelineModal from "../components/TimelineModal";
import EmptyState from "../components/EmptyState";

import { TextInput } from "@mantine/core"; // Add this import
import { Search } from "lucide-react"; // Add this import

const Home = () => {
  const [timelines, setTimelines] = useState<Timeline[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  // user and logout are no longer needed here as they were for HomeHeader
  // const { user, logout } = useAuth();
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const { token } = getAuthData();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      is_public: false,
    },
  });

  useEffect(() => {
    fetchTimelines();
  }, []);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      searchFilteredTimelines();
    } else {
      fetchTimelines();
    }
  }, [debouncedSearchQuery]);

  const fetchTimelines = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [timelinesData, bookmarksData] = await Promise.all([
        getTimelines(token),
        getBookmarks(token),
      ]);
      setTimelines(timelinesData);
      setBookmarkedIds(new Set(bookmarksData.map((t) => t.id)));
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to fetch timelines",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const searchFilteredTimelines = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const results = await searchTimelines(token, debouncedSearchQuery);
      setTimelines(results);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTimeline = async (values: any) => {
    if (!token) return;
    try {
      const timeline = await createTimeline(token, values);
      await fetchTimelines();
      close();
      form.reset();
      setEditingTimeline(null);
      notifications.show({
        title: "Success",
        message: "Timeline created successfully",
        color: "green",
      });
      navigate(`/timelines/${timeline.data.id}/events`);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    }
  };

  const handleUpdateTimeline = async (values: any) => {
    if (!editingTimeline || !token) return;
    try {
      await updateTimeline(token, editingTimeline.id, values);
      await fetchTimelines();
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

  const handleSubmit = async (values: any) => {
    if (editingTimeline) {
      await handleUpdateTimeline(values);
    } else {
      await handleCreateTimeline(values);
    }
  };

  const openCreateModal = () => {
    setEditingTimeline(null);
    form.setValues({ title: "", description: "", is_public: false });
    open();
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

  const handleDeleteTimeline = async (id: string) => {
    if (!token) return;
    try {
      await deleteTimeline(token, id);
      await fetchTimelines();
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

  const handleBookmark = async (timeline: Timeline) => {
    if (!token) return;
    const isBookmarked = bookmarkedIds.has(timeline.id);

    // Optimistic update
    const newBookmarkedIds = new Set(bookmarkedIds);
    if (isBookmarked) {
      newBookmarkedIds.delete(timeline.id);
    } else {
      newBookmarkedIds.add(timeline.id);
    }
    setBookmarkedIds(newBookmarkedIds);

    try {
      if (isBookmarked) {
        await removeBookmark(token, timeline.id);
      } else {
        await addBookmark(token, timeline.id);
      }
    } catch (error: any) {
      // Revert on error
      setBookmarkedIds(bookmarkedIds);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update bookmark",
        color: "red",
      });
    }
  };

  return (
    <Container size="xl" py="md">
      <TimelineModal
        opened={opened}
        onClose={close}
        form={form}
        handleSubmit={handleSubmit}
        isEditing={!!editingTimeline}
      />

      <Group justify="space-between" mb="xl">
        <Title order={3}>Your Timelines</Title>

        <Group>
          <TextInput
            placeholder="Search timelines..."
            leftSection={<Search size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />
          <Button
            leftSection={<PlusCircle size={18} />}
            onClick={openCreateModal}
          >
            Create New
          </Button>
        </Group>
      </Group>

      {isLoading ? (
        <Loading />
      ) : !timelines || timelines.length === 0 ? (
        <EmptyState searchQuery={searchQuery} onCreate={openCreateModal} />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {timelines.map((timeline) => (
            <TimelineCard
              key={timeline.id}
              timeline={timeline}
              onClick={() => navigate(`/timelines/${timeline.id}`)}
              onEdit={() => openEditModal(timeline)}
              onDelete={() => openDeleteModal(timeline.id)}
              isBookmarked={bookmarkedIds.has(timeline.id)}
              onBookmark={() => handleBookmark(timeline)}
            />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default Home;
