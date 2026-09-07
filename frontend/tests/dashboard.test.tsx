import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";

test("renders dashboard metrics", () => {
  render(<Dashboard />);
  expect(screen.getByText("Am I a Good Match?")).toBeInTheDocument();
  expect(screen.getByText("Build your role report")).toBeInTheDocument();
  expect(screen.getByText("Explore with demo account")).toBeInTheDocument();
  expect(screen.getByText("Your target role")).toBeInTheDocument();
  expect(screen.getByLabelText("Job description")).toBeInTheDocument();
  expect(screen.getByText("Overall signal")).toBeInTheDocument();
  expect(screen.getByText("Your role report will appear here")).toBeInTheDocument();
});
