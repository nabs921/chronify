import React, { useEffect, useState } from "react";
import {
  AppShell,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Paper,
  ThemeIcon,
  Container,
  rem,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Edit, Plus, Home, CalendarOff } from "lucide-react";
import { Chrono } from "react-chrono";
import { useParams, useNavigate } from "react-router";
import { getEventsByTimelineId, getTimelineById } from "../api/api";
import { getAuthData } from "../utils/storage";
import type { EventResponse, Timeline } from "../types/types";
import "react-chrono/dist/style.css";
import Loading from "../components/Loading";

const TimelineViewPage: React.FC = () => {
  const { timelineId } = useParams<{ timelineId: string }>();
  const navigate = useNavigate();
  const { token, user } = getAuthData();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventResponse[] | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);

  useEffect(() => {
    fetchTimeline();
    fetchEvents();
  }, []);

  const fetchTimeline = async () => {
    if (!token || !timelineId) return;

    try {
      const response = await getTimelineById(token, timelineId);
      setTimeline(response);
    } catch (error) {
      console.error("Error fetching timeline:", error);
      notifications.show({
        title: "Error",
        message: "Could not fetch timeline details",
        color: "red",
      });
    }
  };

  const fetchEvents = async () => {
    if (!token || !timelineId) return;

    setLoading(true);
    try {
      const response = await getEventsByTimelineId(token, timelineId);
      console.log(response);
      setEvents(response.events);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load timeline events",
        color: "red",
      });
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/timelines/${timelineId}/events`);
  };

  const handleHome = () => {
    navigate("/");
  };

  const isOwner = user?.id === timeline?.user_id;
  const chronoItems =
    events?.map((event) => {
      // Only include media if it has valid data
      const hasValidMedia =
        event.media &&
        event.media.source?.url &&
        event.media.source.url.trim() !== "" &&
        event.media.type &&
        event.media.type.trim() !== "";

      return {
        title: event.title,
        cardTitle: event.card_title,
        cardSubtitle: event.card_subtitle,
        cardDetailedText: event.card_detailed_text,
        // Only include media if it's valid
        ...(hasValidMedia && { media: event.media }),
      };
    }) || [];

  console.log(chronoItems);

  const EmptyState = () => (
    <Paper p="xl" radius="md" withBorder bg="gray.0">
      <Stack align="center" gap="md" py="xl">
        <ThemeIcon size={60} radius="xl" variant="light" color="blue">
          <CalendarOff
            style={{ width: rem(32), height: rem(32) }}
            strokeWidth={1.5}
          />
        </ThemeIcon>

        <Stack gap="xs" align="center">
          <Title order={4} c="dimmed">
            No Events Added Yet
          </Title>
          <Text c="dimmed" ta="center" maw={400}>
            {isOwner
              ? "Your timeline is empty. Start by adding your first event to bring your story to life."
              : "This timeline has no events yet."}
          </Text>
        </Stack>

        {isOwner && (
          <Button
            size="md"
            leftSection={<Plus size={20} />}
            onClick={() => navigate(`/timelines/${timelineId}/events`)}
          >
            Create Events
          </Button>
        )}
      </Stack>
    </Paper>
  );

  return (
    <AppShell header={{ height: 80 }} padding="md">
      <AppShell.Header
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" align="center">
            <Stack gap={0}>
              <Title order={3} c="blue.9">
                {timeline?.title || "Timeline"}
              </Title>
              {timeline?.description && (
                <Text size="sm" c="dimmed">
                  {timeline.description}
                </Text>
              )}
            </Stack>

            <Group>
              <Button
                variant="subtle"
                leftSection={<Home size={18} />}
                onClick={handleHome}
                size="md"
              >
                Home
              </Button>
              {isOwner && (
                <Button
                  leftSection={<Edit size={18} />}
                  onClick={handleEdit}
                  size="md"
                >
                  Edit
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main bg="gray.0">
        <Container size="xl">
          {loading ? (
            <Loading />
          ) : !events || events.length === 0 ? (
            <EmptyState />
          ) : (
            <Box>
              <Chrono
                items={chronoItems}
                media={{
                  fit: "contain",
                }}
                animation={{
                  slideshow: {
                    enabled: true,
                    duration: 5000,
                  },
                }}
                style={{
                  googleFonts: {
                    fontFamily: "Space Grotesk",
                  },
                }}
                mode="alternating"
                scrollable={false}
                theme={{
                  primary: "#228be6",
                  secondary: "#e7f5ff",
                  cardBgColor: "white",
                  titleColor: "#1f2937",
                  titleColorActive: "#228be6",
                }}
                interaction={{ keyboardNavigation: true }}
              />
            </Box>
          )}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default TimelineViewPage;
