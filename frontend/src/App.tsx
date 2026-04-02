import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ModalsProvider } from "@mantine/modals";
import EventUpsert from "./pages/EventUpsert";
import TimelineView from "./pages/TimelineView";
import Loading from "./components/Loading";

import MainLayout from "./components/MainLayout";
import Explore from "./pages/Explore";
import Bookmarks from "./pages/Bookmarks";

function AppRoutes() {
  const { isAuthenticated, loading, login } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <SignIn onLogin={login} />
          )
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <SignIn onLogin={login} />
          )
        }
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/home" replace /> : <SignUp />}
      />

      {/* Main Layout Routes */}
      <Route
        element={
          isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
      </Route>

      {/* Standalone Routes */}
      <Route
        path="/timelines/:timelineId"
        element={
          isAuthenticated ? <TimelineView /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="timelines/:timelineId/events"
        element={
          isAuthenticated ? <EventUpsert /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
}

import { theme } from "./theme";

export default function App() {
  return (
    <AuthProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications />
          <AppRoutes />
        </ModalsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}
