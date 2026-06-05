import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";

test("renders dashboard metrics", () => {
  render(<Dashboard />);
  expect(screen.getByText("Am i a good match?")).toBeInTheDocument();
  expect(screen.getByText("Account")).toBeInTheDocument();
  expect(screen.getByText("Use demo account")).toBeInTheDocument();
  expect(screen.getByText("Job Match Lab")).toBeInTheDocument();
  expect(screen.getByLabelText("Job description")).toBeInTheDocument();
  expect(screen.getByText("ATS Score")).toBeInTheDocument();
  expect(screen.getAllByText("--")).toHaveLength(4);
  expect(screen.getByText("Your match report will appear after analysis")).toBeInTheDocument();
});
