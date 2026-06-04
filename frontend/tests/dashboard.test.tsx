import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";

jest.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />
}));

test("renders dashboard metrics", () => {
  render(<Dashboard />);
  expect(screen.getByText("Am i a good match?")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
  expect(screen.getByText("Job Match Lab")).toBeInTheDocument();
  expect(screen.getByLabelText("Job description")).toBeInTheDocument();
  expect(screen.getByText("ATS Score")).toBeInTheDocument();
  expect(screen.getByText("Skill Gaps")).toBeInTheDocument();
});
