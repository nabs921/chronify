import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily: "Space Grotesk, sans-serif",
  headings: {
    fontFamily: "Space Grotesk, sans-serif",
  },
  shadows: {
    xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  components: {
    Button: {
      defaultProps: {
        size: "sm",
      },
      vars: (theme: any, props: any) => {
        if (props.variant === "filled" || props.variant === undefined) {
          return {
            root: {
              "--button-hover": theme.colors.blue[7],
              boxShadow: theme.shadows.sm,
            },
          };
        }
        return { root: {} };
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: "all 0.2s ease",
          "&:active": {
            transform: "translateY(1px)",
          },
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: "sm",
        withBorder: true,
        padding: "lg",
        radius: "md",
      },
      styles: (theme: any) => ({
        root: {
          backgroundColor: theme.white,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows.lg,
          },
        },
      }),
    },
    Paper: {
      defaultProps: {
        shadow: "sm",
        withBorder: true,
      },
    },
  },
});
