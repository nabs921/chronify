import {
  Container,
  Title,
  Text,
  Center,
  Stack,
  ThemeIcon,
  TextInput,
  SimpleGrid,
  Loader,
  ActionIcon,
} from "@mantine/core";
import { Compass, Search } from "lucide-react";
import { useState, useEffect } from "react";
import {
  searchPublicTimelines,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getPublicTimelines,
} from "../api/api";
import { getAuthData } from "../utils/storage";
import TimelineCard from "../components/TimelineCard";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";
import type { Timeline } from "../types/types";

const Explore = () => {
  const [query, setQuery] = useState("");
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [bookmarks, setBookmarks] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const { token } = getAuthData();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const [bookmarksData, publicTimelines] = await Promise.all([
          getBookmarks(token),
          getPublicTimelines(token),
        ]);
        setBookmarks(bookmarksData);
        setTimelines(publicTimelines);
      } catch (error) {
        console.error("Failed to fetch initial data");
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, []);

  // Live search effect
  useEffect(() => {
    if (!token) return;

    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else if (searched) {
        // If query cleared, reset
        setLoading(true);
        getPublicTimelines(token).then((data) => {
          setTimelines(data);
          setLoading(false);
          setSearched(false);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token) return;

    setLoading(true);
    setSearched(true);
    try {
      // If query is empty, fetch all public timelines again
      if (!query.trim()) {
        const data = await getPublicTimelines(token);
        setTimelines(data);
        setSearched(false);
        return;
      }

      const data = await searchPublicTimelines(token, query);
      setTimelines(data);
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to search timelines",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (timeline: Timeline) => {
    if (!token) return;
    const isBookmarked = bookmarks.some((b) => b.id === timeline.id);

    try {
      // Optimistic update
      if (isBookmarked) {
        setBookmarks((prev) => prev.filter((b) => b.id !== timeline.id));
        await removeBookmark(token, timeline.id);
      } else {
        setBookmarks((prev) => [...prev, timeline]);
        await addBookmark(token, timeline.id);
      }
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: "Failed to update bookmark",
        color: "red",
      });
      // Re-fetch bookmarks to sync state
      const data = await getBookmarks(token);
      setBookmarks(data);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>Explore Timelines</Title>
          <Text c="dimmed">Discover public timelines from the community</Text>
        </div>

        <form onSubmit={handleSearch}>
          <TextInput
            size="md"
            radius="md"
            placeholder="Search timelines..."
            leftSection={<Search size={18} />}
            value={query}
            onChange={(event) => {
              const val = event.currentTarget.value;
              setQuery(val);
              setSearched(true);
            }}
            rightSectionWidth={80}
            rightSection={
              <ActionIcon
                variant="transparent"
                color="blue"
                onClick={() => handleSearch()}
                style={{ cursor: "pointer" }}
              >
                <Search size={18} />
              </ActionIcon>
            }
          />
        </form>

        {initialLoading || loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (timelines || []).length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {timelines.map((timeline) => (
              <TimelineCard
                key={timeline.id}
                timeline={timeline}
                onClick={() => navigate(`/timelines/${timeline.id}`)}
                onEdit={() => {}} // No-op
                onDelete={() => {}} // No-op
                showActions={false}
                isBookmarked={bookmarks.some((b) => b.id === timeline.id)}
                onBookmark={() => handleBookmark(timeline)}
              />
            ))}
          </SimpleGrid>
        ) : searched ? (
          <Center mih={200} c="dimmed">
            <Stack align="center">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <Search size={30} />
              </ThemeIcon>
              <Text>No timelines found matching "{query}"</Text>
            </Stack>
          </Center>
        ) : (
          <Center mih={300}>
            <Stack align="center" gap="md">
              <ThemeIcon size={80} radius="xl" variant="light" color="blue">
                <Compass size={40} />
              </ThemeIcon>
              <Text c="dimmed" ta="center">
                No public timelines available yet.
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
    </Container>
  );
};

export default Explore;
