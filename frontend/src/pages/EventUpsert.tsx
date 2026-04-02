import React, { useState, useEffect, useCallback } from "react";
import { Button, Container, Stack, AppShell, Text, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import { Plus, RotateCcw, Save, Sparkles } from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { getAuthData } from "../utils/storage";
import { validateMediaUrl, getMediaType } from "../utils/mediaValidator";
import {
  upsertEvents,
  getEventsByTimelineId,
  deleteEvent,
  generateAIEvents,
  updateAIEvents,
} from "../api/api";
import type { TimelineEvent, EventResponse } from "../types/types";
import Loading from "../components/Loading";
import AIModal from "../components/event-upsert/AIModal";
import EventFormItem from "../components/event-upsert/EventFormItem";
import EventUpsertHeader from "../components/event-upsert/EventUpsertHeader";

const emptyEvent: TimelineEvent = {
  title: "",
  card_title: "",
  card_subtitle: "",
  card_detailed_text: "",
  media: {
    name: "",
    source: { url: "" },
    type: "IMAGE",
  },
};

const EventUpsert: React.FC = () => {
  const { timelineId } = useParams<{ timelineId: string }>();
  const navigate = useNavigate();
  const { token } = getAuthData();

  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialEvents, setInitialEvents] = useState<TimelineEvent[]>([]);

  const [opened, { open, close }] = useDisclosure(false);

  interface FormValues {
    events: TimelineEvent[];
  }

  const form = useForm<FormValues>({
    // Start with one empty event if timelineId is not present
    initialValues: {
      events: [emptyEvent],
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      values.events.forEach((event, index) => {
        if (!event.title.trim()) {
          errors[`events.${index}.title`] = "Title is required";
        }
        if (!event.card_title.trim()) {
          errors[`events.${index}.card_title`] = "Card title is required";
        }

        const mediaName = event.media?.name?.trim();
        const mediaUrl = event.media?.source?.url?.trim();

        if (mediaUrl) {
          if (!mediaName) {
            errors[`events.${index}.media.name`] =
              "Image name is required when URL is provided";
          }

          // Use the new validation utility
          const validation = validateMediaUrl(mediaUrl);
          if (!validation.isValid) {
            errors[`events.${index}.media.source.url`] =
              validation.error || "Invalid image URL";
          }
        }

        if (mediaName && !mediaUrl) {
          errors[`events.${index}.media.source.url`] =
            "Image URL is required when Name is provided";
        }
      });
      return errors;
    },
  });

  const loadEvents = useCallback(async () => {
    if (!token || !timelineId) {
      setDataFetching(false);
      form.setValues({ events: [emptyEvent] });
      return;
    }

    setDataFetching(true);
    try {
      const response = await getEventsByTimelineId(token, timelineId);
      if (response.events && response.events.length > 0) {
        setIsEditMode(true);

        const mappedEvents = response.events.map((event: EventResponse) => ({
          id: event.id,
          title: event.title,
          card_title: event.card_title,
          card_subtitle: event.card_subtitle || "",
          card_detailed_text: event.card_detailed_text || "",
          media: event.media || {
            name: "",
            source: { url: "" },
            type: "IMAGE",
          },
        }));

        setInitialEvents(mappedEvents);
        form.setValues({ events: mappedEvents });
      } else {
        form.setValues({ events: [emptyEvent] });
      }
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to load events",
        color: "red",
      });
      // On error, still show the form with the one empty event
      form.setValues({ events: [emptyEvent] });
    } finally {
      setDataFetching(false);
    }
  }, [timelineId, token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // --- Handlers ---

  const handleSubmit = async (values: FormValues) => {
    if (!token || !timelineId) {
      notifications.show({
        title: "Error",
        message: "Authentication error or missing timeline ID",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      // Filter out empty events before submission
      const eventsToSubmit = values.events
        .filter((event) => event.title.trim() && event.card_title.trim())
        .map((event: any) => {
          const submittedEvent: any = {
            title: event.title,
            card_title: event.card_title,
            card_subtitle: event.card_subtitle?.trim() || undefined,
            card_detailed_text: event.card_detailed_text?.trim() || undefined,
          };

          if (event.media?.source?.url?.trim()) {
            const url = event.media.source.url.trim();
            // Use the utility to determine media type
            const mediaType = getMediaType(url);

            submittedEvent.media = {
              name: event.media.name.trim(),
              source: { url },
              type: mediaType === "UNKNOWN" ? "IMAGE" : mediaType,
            };
          }
          if (event.id) submittedEvent.id = event.id;
          return submittedEvent;
        });

      if (eventsToSubmit.length === 0) {
        notifications.show({
          title: "Warning",
          message:
            "No valid events to save. Please fill out at least one event.",
          color: "yellow",
        });
        setLoading(false);
        return;
      }

      const response = await upsertEvents(token, timelineId, eventsToSubmit);

      notifications.show({
        title: "Success",
        message: `Saved ${response.events.length} event(s)`,
        color: "green",
      });

      navigate(`/timelines/${timelineId}`);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to save",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIEvents = async (prompt: string) => {
    if (!token || !timelineId) return;

    setAiLoading(true);
    try {
      await generateAIEvents(token, timelineId, prompt);

      notifications.show({
        title: "AI Generation Complete",
        message: "Events have been generated and added to your timeline.",
        color: "teal",
        icon: <Sparkles size={18} />,
      });

      close();
      await loadEvents();
      navigate(`/timelines/${timelineId}`);
    } catch (error) {
      notifications.show({
        title: "Generation Failed",
        message:
          error instanceof Error ? error.message : "Could not generate events",
        color: "red",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpdateAIEvents = async (prompt: string) => {
    if (!token || !timelineId) return;

    setAiLoading(true);
    try {
      await updateAIEvents(token, timelineId, prompt);

      notifications.show({
        title: "AI Update Complete",
        message: "Events have been updated based on your instructions.",
        color: "teal",
        icon: <Sparkles size={18} />,
      });

      close();
      await loadEvents();
      navigate(`/timelines/${timelineId}`);
    } catch (error) {
      notifications.show({
        title: "Update Failed",
        message:
          error instanceof Error ? error.message : "Could not update events",
        color: "red",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteEvent = (index: number) => {
    if (!token) return;
    const event = form.values.events[index];

    const removeAction = (isRemoteDeletionSuccessful = true) => {
      form.removeListItem("events", index);

      const remainingLength = form.values.events.length - 1;

      if (remainingLength === 0) {
        form.insertListItem("events", emptyEvent, 0);

        if (isRemoteDeletionSuccessful) {
          setInitialEvents([]);
        }
      }
    };

    if (!event.id) {
      removeAction(false);
      notifications.show({
        title: "Removed",
        message: "Unsaved event removed",
        color: "green",
      });
      return;
    }

    const eventId = event.id;

    openConfirmModal({
      title: "Delete this event?",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{event.title}</b>?
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteEvent(token, timelineId!, eventId);
          notifications.show({
            title: "Deleted",
            message: "Event removed",
            color: "green",
          });
          removeAction(true); // Call removeAction after successful API delete
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error.message,
            color: "red",
          });
        }
      },
    });
  };

  const handleReset = () => {
    if (isEditMode) {
      form.setValues({ events: initialEvents });
      // Ensure there's at least one empty form if initialEvents was empty
      if (initialEvents.length === 0) {
        form.setValues({ events: [emptyEvent] });
      }

      notifications.show({
        title: "Restored",
        message: "Form reset to last saved state",
        color: "blue",
      });
    } else {
      // For a new timeline, reset to one empty event
      form.setValues({ events: [emptyEvent] });
      notifications.show({
        title: "Reset",
        message: "Form cleared",
        color: "blue",
      });
    }
  };

  return (
    <>
      <AIModal
        opened={opened}
        onClose={close}
        onGenerate={handleGenerateAIEvents}
        onUpdate={handleUpdateAIEvents}
        loading={aiLoading}
        initialMode={isEditMode ? "update" : "generate"}
      />

      <AppShell header={{ height: 60 }} footer={{ height: 80 }} padding="md">
        <EventUpsertHeader
          isEditMode={isEditMode}
          eventCount={form.values.events.length}
          onHome={() => navigate("/")}
          onAiOpen={open}
        />

        <AppShell.Main bg="gray.0">
          <Container size="md" py="xl">
            {dataFetching ? (
              <Loading />
            ) : (
              <form
                id="events-form-id"
                onSubmit={form.onSubmit(handleSubmit, (errors) => {
                  notifications.show({
                    title: "Validation Error",
                    message: "Please check the form for errors",
                    color: "red",
                  });
                })}
              >
                <Stack gap="lg">
                  {form.values.events.map((_, index) => (
                    <EventFormItem
                      key={index}
                      index={index}
                      form={form}
                      onDelete={handleDeleteEvent}
                    />
                  ))}

                  <Button
                    fullWidth
                    variant="outline"
                    color="gray"
                    leftSection={<Plus size={18} />}
                    onClick={() => form.insertListItem("events", emptyEvent)}
                    h={56}
                    style={{
                      borderStyle: "dashed",
                      borderWidth: 2,
                      borderColor: "var(--mantine-color-gray-4)",
                    }}
                  >
                    Add Event Manually
                  </Button>
                </Stack>
              </form>
            )}
          </Container>
        </AppShell.Main>

        <AppShell.Footer
          p="md"
          bg="white"
          withBorder
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}
        >
          <Container size="md" h="100%">
            <Group justify="flex-end" h="100%">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleReset}
                leftSection={<RotateCcw size={16} />}
                disabled={loading || dataFetching}
              >
                Reset
              </Button>
              <Button
                type="submit"
                form="events-form-id"
                loading={loading}
                disabled={dataFetching}
                leftSection={<Save size={16} />}
                px="xl"
              >
                Save Changes
              </Button>
            </Group>
          </Container>
        </AppShell.Footer>
      </AppShell>
    </>
  );
};

export default EventUpsert;
