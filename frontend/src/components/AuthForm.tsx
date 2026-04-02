import {
  Alert,
  Button,
  Paper,
  Stack,
  Text,
  Title,
  TextInput,
  Flex,
  Anchor,
  PasswordInput,
  Center,
} from "@mantine/core";
import { AlertCircle, LockIcon, LucideMail } from "lucide-react";
import type { UseFormReturnType } from "@mantine/form";
import { Link } from "react-router";

type AuthFormProps<T> = {
  title: string;
  subtitle: string;
  form: UseFormReturnType<T>;
  onSubmit: (values: T) => void;
  serverError?: string;
  loading?: boolean;
  submitLabel: string;
  children?: React.ReactNode;
};

const AuthForm = <T,>({
  title,
  subtitle,
  form,
  onSubmit,
  serverError,
  loading,
  submitLabel,
  children,
}: AuthFormProps<T>) => {
  const isLogin = submitLabel === "Sign In";
  return (
    <Center h="100vh">
      <Paper shadow="sm" p="lg" withBorder w={400}>
        <Stack>
          <Title order={2} ta="center">
            {title}
          </Title>
          <Text size="xl" ta="center">
            {subtitle}
          </Text>

          {serverError && (
            <Alert color="red" icon={<AlertCircle size={20} />}>
              {serverError}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md">
              {/* Extra fields for Register */}
              {children}

              {/* Email */}
              <TextInput
                leftSection={<LucideMail size={16} />}
                required
                label="Email"
                placeholder="Email"
                {...form.getInputProps("email")}
              />

              {/* Password */}
              <PasswordInput
                leftSection={<LockIcon size={16} />}
                required
                label="Password"
                placeholder="Password"
                {...form.getInputProps("password")}
              />

              <Button type="submit" loading={loading}>
                {submitLabel}
              </Button>
            </Stack>
          </form>
          <Flex justify="center" mt="md" gap="xs">
            <Text ta="center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>{" "}
            <Anchor component={Link} to={isLogin ? "/register" : "/login"}>
              {isLogin ? "Sign Up" : "Sign In"}
            </Anchor>
          </Flex>
        </Stack>
      </Paper>
    </Center>
  );
};

export default AuthForm;
