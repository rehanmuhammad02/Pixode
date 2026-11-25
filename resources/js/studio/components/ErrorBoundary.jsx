import { Component } from "react";
import Brand from "./Brand";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="not-found">
        <Brand />
        <span className="eyebrow">LET’S GET YOU BACK ON TRACK</span>
        <h1>
          Something got
          <br />
          interrupted.
        </h1>
        <p>Please reload the page to reconnect to your workspace.</p>
        <button
          className="button button-primary"
          onClick={() => location.reload()}
        >
          Reload page
        </button>
        <a href="/">Back to Pixode</a>
      </div>
    ) : (
      this.props.children
    );
  }
}
