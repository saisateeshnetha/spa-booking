import { Component } from "react";
import { logger } from "../../utils/logger.js";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message ?? "Unknown error" };
  }

  componentDidCatch(error, info) {
    logger.error("ui.exception", {
      error: String(error),
      info: info?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="text-[16px] font-semibold text-[#111827]">
            Something went wrong
          </div>
          <div className="max-w-md text-[13px] text-[#6B7280]">
            {this.state.message}
          </div>
          <button
            type="button"
            className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-[13px] font-semibold text-[#111827] hover:bg-[#F9FAFB]"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
