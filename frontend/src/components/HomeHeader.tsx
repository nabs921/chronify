import {
  AppShell,
  Container,
  Group,
  Avatar,
  TextInput,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { Palmtree, Search, X, User, Mail, LogOut } from "lucide-react";

interface HomeHeaderProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  logout: () => void;
}

const HomeHeader = ({
  user,
  searchQuery,
  setSearchQuery,
  logout,
}: HomeHeaderProps) => {
  return (
    <AppShell.Header>
      <Container size="xl" h="100%" px="md">
        <Group h="100%" justify="space-between">
          <Avatar radius="xl">
            <Palmtree size={20} />
          </Avatar>

          <TextInput
            leftSection={<Search size={16} />}
            rightSection={
              searchQuery && (
                <ActionIcon
                  variant="transparent"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </ActionIcon>
              )
            }
            placeholder="Search timelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            w={{ base: 160, xs: 300, sm: 400 }}
          />

          {/* User Menu */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Avatar>
                <User size={18} />
              </Avatar>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>User</Menu.Label>
              <Menu.Item leftSection={<User size={16} />}>
                {user?.username}
              </Menu.Item>
              <Menu.Item leftSection={<Mail size={16} />} c="dimmed">
                {user?.email}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                c="red"
                onClick={logout}
                leftSection={<LogOut size={16} />}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Container>
    </AppShell.Header>
  );
};

export default HomeHeader;
