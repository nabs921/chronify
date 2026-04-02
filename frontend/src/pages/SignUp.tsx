import { TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import AuthForm from "../components/AuthForm";
import type { RegisterPayload } from "../types/types";
import { register } from "../api/api";
import { UserIcon } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { useNavigate } from "react-router";
const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const form = useForm<RegisterPayload>({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validate: {
      username: (value) =>
        value.length < 3 ? "Username must be at least 3 characters" : null,
      email: (value) =>
        /^[a-zA-Z][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-zA-Z]+(?:\.[a-zA-Z]+)*$/.test(
          value,
        )
          ? null
          : "Please enter a valid email",
      password: (v) => (!v ? "Please enter your password" : null),
    },
  });

  const handleSubmit = async (values: RegisterPayload) => {
    try {
      setLoading(true);
      setServerError("");
      await register(values);
      notifications.show({
        title: "Account created succesfully!",
        message: "Sign in to continue.",
      });
      navigate("/login");
    } catch (err: any) {
      setServerError(err.error || err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm<RegisterPayload>
      title="Create an Account"
      subtitle="Register to get started"
      submitLabel="Sign Up"
      form={form}
      onSubmit={handleSubmit}
      serverError={serverError}
      loading={loading}
    >
      <TextInput
        leftSection=<UserIcon size={16} />
        label="Username"
        required
        placeholder="Username"
        {...form.getInputProps("username")}
      />
    </AuthForm>
  );
};

export default SignUp;
