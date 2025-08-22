import { render, waitFor } from "@testing-library/react";
import App from "../App.jsx";
import * as offlineDB from "../lib/offlineDB.js";
import { complaintService } from "../services/complaintService.js";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";

// Mock DB + service modules
vi.mock("../lib/offlineDB");
vi.mock("../services/complaintService");

// Helper: render with all required providers
function renderWithProviders(ui) {
  return render(
    <AuthProvider>
      <ToastProvider>{ui}</ToastProvider>
    </AuthProvider>
  );
}

describe("Offline/Online sync", () => {
  let originalOnLine;

  beforeAll(() => {
    // Save original navigator.onLine descriptor
    originalOnLine = Object.getOwnPropertyDescriptor(navigator, "onLine");
  });

  afterAll(() => {
    // Restore navigator.onLine
    if (originalOnLine) {
      Object.defineProperty(navigator, "onLine", originalOnLine);
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs offline complaints when online on mount", async () => {
    const offlineComplaints = [{ id: 1, title: "Test complaint" }];
    offlineDB.getOfflineComplaints.mockResolvedValue(offlineComplaints);
    offlineDB.clearOfflineComplaints.mockResolvedValue();
    complaintService.createComplaint.mockResolvedValue({});

    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(complaintService.createComplaint).toHaveBeenCalledWith(
        offlineComplaints[0]
      );
      expect(offlineDB.clearOfflineComplaints).toHaveBeenCalled();
    });
  });

  it("does not sync if offline on mount", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    offlineDB.getOfflineComplaints.mockResolvedValue([]);

    renderWithProviders(<App />);

    await waitFor(() => {
      expect(complaintService.createComplaint).not.toHaveBeenCalled();
    });
  });

  it("syncs offline complaints when coming online after being offline", async () => {
    const offlineComplaints = [{ id: 2, title: "Another complaint" }];
    offlineDB.getOfflineComplaints.mockResolvedValue(offlineComplaints);
    offlineDB.clearOfflineComplaints.mockResolvedValue();
    complaintService.createComplaint.mockResolvedValue({});

    // Start offline
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    renderWithProviders(<App />);

    // Go online
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });
    window.dispatchEvent(new Event("online"));

    await waitFor(() => {
      expect(complaintService.createComplaint).toHaveBeenCalledWith(
        offlineComplaints[0]
      );
      expect(offlineDB.clearOfflineComplaints).toHaveBeenCalled();
    });
  });

  it("cleans up event listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderWithProviders(<App />);

    expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
  });
});
