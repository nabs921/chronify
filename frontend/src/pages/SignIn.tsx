import { useState } from "react";
import { useForm } from "@mantine/form";
import { login } from "../api/api";
import AuthForm from "../components/AuthForm";
import type { LoginPayload } from "../types/types";
import { setAuthData } from "../utils/storage";
import { useNavigate } from "react-router";

type LoginProps = {
  onLogin: (token: string, user: any) => void;
};

const SignIn = ({ onLogin }: LoginProps) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const form = useForm<LoginPayload>({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) =>
        /^[a-zA-Z][a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-zA-Z]+(?:\.[a-zA-Z]+)*$/.test(
          value,
        )
          ? null
          : "Please enter a valid email",
      password: (v) => (!v ? "Please enter your password" : null),
    },
  });

  const handleSubmit = async (values: LoginPayload) => {
    try {
      setLoading(true);
      setServerError("");
      const resp = await login(values);
      setAuthData(resp.token, {
        id: resp.user.id,
        username: resp.user.username,
        email: resp.user.email,
      });
      onLogin(resp.token, resp.user);
      navigate("/home");
    } catch (error: any) {
      setServerError(error.error || error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm<LoginPayload>
      title="Welcome Back"
      subtitle="Sign In to your account"
      form={form}
      onSubmit={handleSubmit}
      serverError={serverError}
      loading={loading}
      submitLabel="Sign In"
    />
  );
};

export default SignIn;
