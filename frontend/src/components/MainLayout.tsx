import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  ActionIcon,
  Avatar,
  Menu,
  Text,
  rem,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Home, Compass, Bookmark, LogOut, FileClock } from "lucide-react";
import { useLocation, useNavigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { label: "Home", icon: Home, link: "/home" },
    { label: "Explore", icon: Compass, link: "/explore" },
    { label: "Bookmarks", icon: Bookmark, link: "/bookmarks" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group gap="xs">
              <ThemeIcon
                size="lg"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
              >
                <FileClock size={20} />
              </ThemeIcon>
              <Title order={3}>Chronify</Title>
            </Group>
          </Group>

          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="transparent" size="lg">
                <Avatar
                  src={null}
                  alt={user?.username}
                  color="blue"
                  radius="xl"
                >
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Signed in as</Menu.Label>
              <Menu.Item disabled>
                <Text size="sm" fw={500} c="black">
                  {user?.username}
                </Text>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Label>Application</Menu.Label>
              <Menu.Item
                leftSection={
                  <LogOut style={{ width: rem(14), height: rem(14) }} />
                }
                color="red"
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {links.map((item) => (
          <NavLink
            key={item.label}
            active={location.pathname === item.link}
            label={item.label}
            leftSection={<item.icon size="1rem" strokeWidth={1.5} />}
            onClick={() => {
              navigate(item.link);
              toggle(); // close mobile menu on click
            }}
            variant="filled"
            color="blue"
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
            my={4}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

export default MainLayout;
