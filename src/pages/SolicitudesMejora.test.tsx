import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImprovementRequestSummary } from "@/lib/api/types";
import { improvementsApi } from "@/lib/api";
import SolicitudesMejora from "./SolicitudesMejora";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/lib/api", () => ({
  improvementsApi: {
    list: vi.fn(),
    process: vi.fn(),
  },
}));

const mockedImprovementsApi = vi.mocked(improvementsApi);

const buildRequest = (
  overrides: Partial<ImprovementRequestSummary> = {},
): ImprovementRequestSummary => ({
  id: "10",
  userId: "5",
  cvId: null,
  uploadedFileId: "20",
  targetRole: "Frontend Engineer",
  jobDescription: null,
  status: "pending",
  errorMessage: null,
  resultCvVersionId: null,
  cv: null,
  uploadedFile: {
    id: "20",
    originalName: "cv-frontend.pdf",
    mimeType: "application/pdf",
    fileExtension: "pdf",
    fileSizeBytes: 204800,
    storagePath: "uploads/cv-frontend.pdf",
    createdAt: "2026-04-26T10:00:00.000Z",
  },
  resultCvVersion: null,
  createdAt: "2026-04-26T10:05:00.000Z",
  updatedAt: "2026-04-26T10:05:00.000Z",
  ...overrides,
});

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <SolicitudesMejora />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("SolicitudesMejora", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters requests by status and search term", async () => {
    mockedImprovementsApi.list.mockResolvedValue([
      buildRequest({
        id: "10",
        targetRole: "Frontend Engineer",
        status: "completed",
        cvId: "100",
        cv: {
          id: "100",
          title: "CV Frontend",
          targetRole: "Frontend Engineer",
          currentVersionId: "1000",
          isArchived: false,
        },
        resultCvVersionId: "1000",
        resultCvVersion: {
          id: "1000",
          versionNumber: 2,
          versionType: "improved",
          targetRole: "Frontend Engineer",
          isCurrent: true,
          createdAt: "2026-04-26T10:15:00.000Z",
        },
      }),
      buildRequest({
        id: "11",
        targetRole: "Data Analyst",
        status: "failed",
        errorMessage: "OpenAI unavailable",
        uploadedFile: {
          id: "21",
          originalName: "cv-data.docx",
          mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          fileExtension: "docx",
          fileSizeBytes: 102400,
          storagePath: "uploads/cv-data.docx",
          createdAt: "2026-04-26T09:00:00.000Z",
        },
      }),
    ]);
    mockedImprovementsApi.process.mockResolvedValue({ id: "100" } as never);

    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Frontend Engineer" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Data Analyst" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fallidas" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Frontend Engineer" }),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByRole("heading", { name: "Data Analyst" }),
    ).toBeInTheDocument();

    fireEvent.change(
      screen.getByPlaceholderText("Buscar por cargo o nombre del archivo..."),
      {
        target: { value: "cv-data" },
      },
    );

    expect(
      screen.getByRole("heading", { name: "Data Analyst" }),
    ).toBeInTheDocument();
    expect(screen.getByText("OpenAI unavailable")).toBeInTheDocument();
  });

  it("reprocesses a failed request and navigates to the generated CV", async () => {
    mockedImprovementsApi.list.mockResolvedValue([
      buildRequest({
        id: "22",
        targetRole: "QA Engineer",
        status: "failed",
        errorMessage: "Temporary error",
      }),
    ]);
    mockedImprovementsApi.process.mockResolvedValue({ id: "300" } as never);

    renderPage();

    fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(mockedImprovementsApi.process).toHaveBeenCalledWith("22");
      expect(navigateMock).toHaveBeenCalledWith("/historial/300");
    });
  });
});