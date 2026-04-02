import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Group,
  Button,
  Switch,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

interface TimelineModalProps {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<any>;
  handleSubmit: (values: any) => void;
  isEditing: boolean;
}

const TimelineModal = ({
  opened,
  onClose,
  form,
  handleSubmit,
  isEditing,
}: TimelineModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Timeline" : "Create Timeline"}
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            required
            label="Title"
            placeholder="Enter a title"
            {...form.getInputProps("title")}
          />
          <Textarea
            label="Description"
            rows={4}
            placeholder="Enter a description"
            {...form.getInputProps("description")}
          />
          <Switch
            label={form.values.is_public ? "Public" : "Private"}
            checked={form.values.is_public}
            {...form.getInputProps("is_public", { type: "checkbox" })}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Create"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default TimelineModal;
